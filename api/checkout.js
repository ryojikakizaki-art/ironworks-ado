const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ── 商品マスター（stdLengthMm: 基本料金に含まれる長さ, maxMm: 最大長さ）──
const PRODUCTS = {
  rene:       { name: 'René ルネ',               type: '横型', basePrice: 36500, stdLengthMm: 1500, maxMm: 5000, finish: 'マットブラック', includedZakin: 2 },
  claire:     { name: 'Claire クレール',          type: '横型', basePrice: 42000, stdLengthMm: 1500, maxMm: 5000, finish: 'マットホワイト', includedZakin: 2 },
  emile:      { name: 'Emile エミール',           type: '横型', basePrice: 45800, stdLengthMm: 1500, maxMm: 5000, finish: '鎚目仕上げ 銀古美', includedZakin: 2 },
  marcel:     { name: 'Marcel マルセル',          type: '横型', basePrice: 36000, stdLengthMm: 1500, maxMm: 5000, finish: 'マットブラック', includedZakin: 2 },
  alexandre:  { name: 'Alexandre アレクサンドル', type: '縦型', basePrice: 32000, stdLengthMm: 1000, maxMm: 3000, finish: 'マットブラック', includedZakin: 2 },
  catherine:  { name: 'Catherine カトリーヌ',     type: '縦型', basePrice: 34500, stdLengthMm: 1000, maxMm: 3000, finish: 'マットホワイト', includedZakin: 2 },
  claude:     { name: 'Claude クロード',          type: '縦型', basePrice: 30000, stdLengthMm: 1000, maxMm: 3000, finish: 'マットブラック', includedZakin: 2 },
};

// ── 共通価格パラメータ（mm単位）──
const PRICE_PER_MM    = 25;
const ZAKIN_PRICE     = 3500;
const END_DIST_MM     = 100;
const MAX_SPAN_MM     = 850;
const SURGE_START_MM  = 2000;
const SURGE_BASE      = 1.2;
const SURGE_INTERVAL_MM = 500;
const TAX_RATE        = 0.10;

function calcZakin(L_mm) {
  if (L_mm <= 1050) return 2;
  const inner = L_mm - 2 * END_DIST_MM;
  return 1 + Math.ceil(inner / MAX_SPAN_MM);
}

function calcPrice(L_mm, prod) {
  const addon    = Math.max(0, L_mm - prod.stdLengthMm) * PRICE_PER_MM;
  const longM    = L_mm > SURGE_START_MM
                 ? Math.pow(SURGE_BASE, (L_mm - SURGE_START_MM) / SURGE_INTERVAL_MM)
                 : 1;
  const surcharge = L_mm > SURGE_START_MM ? addon * (longM - 1) : 0;
  const zakin     = calcZakin(L_mm);
  const addZakin  = Math.max(0, zakin - prod.includedZakin) * ZAKIN_PRICE;
  const subtotal  = prod.basePrice + addon + addZakin + surcharge;
  const tax       = subtotal * TAX_RATE;
  return { addon, surcharge, addZakin, zakin, subtotal, tax, total: subtotal + tax };
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const productKey = (req.body?.product || 'rene').toLowerCase();
    const prod = PRODUCTS[productKey];
    if (!prod) return res.status(400).json({ error: `不明な商品: ${productKey}` });

    const raw = req.body?.lengthMm || req.body?.lengthCm && req.body.lengthCm * 10;
    const L   = Math.max(500, Math.min(prod.maxMm, Math.round(Number(raw) || prod.stdLengthMm)));
    const p   = calcPrice(L, prod);
    const totalYen = Math.round(p.total);

    const host    = req.headers.host || 'ironworks-ado.vercel.app';
    const baseUrl = `https://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'jpy',
          product_data: {
            name: `${prod.name} 壁付け手すり ${L}mm`,
            description: `${prod.finish} / 座金${p.zakin}個 / 受注生産 約3〜4週間`,
          },
          unit_amount: totalYen,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}&product=${productKey}&length=${L}`,
      cancel_url:  `${baseUrl}/item/${productKey}.html`,
      metadata: {
        product:      productKey,
        product_name: prod.name,
        type:         prod.type,
        length_mm:    String(L),
        zakin_count:  String(p.zakin),
        subtotal_yen: String(Math.round(p.subtotal)),
        tax_yen:      String(Math.round(p.tax)),
      },
      locale: 'ja',
      payment_intent_data: {
        description: `IRONWORKS ado — ${prod.name} ${L}mm`,
      },
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    return res.status(500).json({ error: 'セッションの作成に失敗しました', detail: err.message });
  }
};
