const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ── 商品マスター ─────────────────────────────────
const PRODUCTS = {
  rene:       { name: 'René ルネ',               type: '横型', basePrice: 36500, stdLength: 150, finish: 'マットブラック', includedZakin: 2 },
  claire:     { name: 'Claire クレール',          type: '横型', basePrice: 42000, stdLength: 150, finish: 'マットホワイト', includedZakin: 2 },
  emile:      { name: 'Emile エミール',           type: '横型', basePrice: 45800, stdLength: 150, finish: '鎚目仕上げ 銀古美', includedZakin: 2 },
  marcel:     { name: 'Marcel マルセル',          type: '横型', basePrice: 36000, stdLength: 150, finish: 'マットブラック', includedZakin: 2 },
  alexandre:  { name: 'Alexandre アレクサンドル', type: '縦型', basePrice: 32000, stdLength: 100, finish: 'マットブラック', includedZakin: 2 },
  catherine:  { name: 'Catherine カトリーヌ',     type: '縦型', basePrice: 34500, stdLength: 100, finish: 'マットホワイト', includedZakin: 2 },
  claude:     { name: 'Claude クロード',          type: '縦型', basePrice: 30000, stdLength: 100, finish: 'マットブラック', includedZakin: 2 },
};

// ── 共通価格パラメータ ──────────────────────────────
const PRICE_PER_CM   = 250;
const ZAKIN_PRICE    = 3500;
const MIN_ZAKIN      = 4;
const END_DIST_MM    = 100;
const MAX_SPAN_MM    = 800;
const SURGE_START    = 200;
const SURGE_BASE     = 1.2;
const SURGE_INTERVAL = 50;
const TAX_RATE       = 0.10;

function calcZakin(lengthCm) {
  const L_mm = lengthCm * 10;
  const span = L_mm - 2 * END_DIST_MM;
  const spans = Math.ceil(span / MAX_SPAN_MM);
  return Math.max(MIN_ZAKIN, 1 + spans);
}

function calcPrice(lengthCm, prod) {
  const addon    = Math.max(0, lengthCm - prod.stdLength) * PRICE_PER_CM;
  const longM    = lengthCm > SURGE_START
                 ? Math.pow(SURGE_BASE, (lengthCm - SURGE_START) / SURGE_INTERVAL)
                 : 1;
  const surcharge = lengthCm > SURGE_START ? addon * (longM - 1) : 0;
  const zakin     = calcZakin(lengthCm);
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

    const raw = req.body?.lengthCm;
    const L   = Math.max(50, Math.min(300, Math.round(Number(raw) || prod.stdLength)));
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
            name: `${prod.name} 壁付け手すり ${L}cm`,
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
        length_cm:    String(L),
        zakin_count:  String(p.zakin),
        subtotal_yen: String(Math.round(p.subtotal)),
        tax_yen:      String(Math.round(p.tax)),
      },
      locale: 'ja',
      payment_intent_data: {
        description: `IRONWORKS ado — ${prod.name} ${L}cm`,
      },
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    return res.status(500).json({ error: 'セッションの作成に失敗しました', detail: err.message });
  }
};
