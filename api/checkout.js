const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ── 価格設定（index.html と完全一致させること）────────────────
const BASE_PRICE     = 36500;  // 150cmまで一律（税抜）
const STD_LENGTH     = 150;    // cm
const PRICE_PER_CM   = 250;    // 超過1cmあたり
const ZAKIN_PRICE    = 3500;   // 座金1個
const INCLUDED_ZAKIN = 2;      // 基本料金に含まれる座金数
const MIN_ZAKIN      = 4;      // 最小座金数
const END_DIST_MM    = 100;    // 端からの座金距離(mm)
const MAX_SPAN_MM    = 800;    // 座金間最大スパン(mm)
const SURGE_START    = 200;    // 長尺割増開始(cm)
const SURGE_BASE     = 1.2;    // 指数の底
const SURGE_INTERVAL = 50;     // 計算間隔(cm)
const TAX_RATE       = 0.10;

function calcZakin(lengthCm) {
  const L_mm = lengthCm * 10;
  const span = L_mm - 2 * END_DIST_MM;
  const spans = Math.ceil(span / MAX_SPAN_MM);
  return Math.max(MIN_ZAKIN, 1 + spans);
}

function calcPrice(lengthCm) {
  const addon    = Math.max(0, lengthCm - STD_LENGTH) * PRICE_PER_CM;
  const longM    = lengthCm > SURGE_START
                 ? Math.pow(SURGE_BASE, (lengthCm - SURGE_START) / SURGE_INTERVAL)
                 : 1;
  const surcharge = lengthCm > SURGE_START ? addon * (longM - 1) : 0;
  const zakin     = calcZakin(lengthCm);
  const addZakin  = Math.max(0, zakin - INCLUDED_ZAKIN) * ZAKIN_PRICE;
  const subtotal  = BASE_PRICE + addon + addZakin + surcharge;
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
    const raw = req.body?.lengthCm;
    const L   = Math.max(50, Math.min(300, Math.round(Number(raw) || 150)));
    const p   = calcPrice(L);
    const totalYen = Math.round(p.total); // JPYは整数

    const host    = req.headers.host || 'ironworks-ado.vercel.app';
    const baseUrl = `https://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'jpy',
          product_data: {
            name: `René ルネ 壁付け手すり ${L}cm`,
            description: `マットブラック / 座金${p.zakin}個 / 受注生産 約3〜4週間`,
          },
          unit_amount: totalYen,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}&length=${L}`,
      cancel_url:  `${baseUrl}/`,
      metadata: {
        product:      'rene-yokogata',
        length_cm:    String(L),
        zakin_count:  String(p.zakin),
        subtotal_yen: String(Math.round(p.subtotal)),
        tax_yen:      String(Math.round(p.tax)),
      },
      locale: 'ja',
      payment_intent_data: {
        description: `IRONWORKS ado — René ルネ ${L}cm`,
      },
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    return res.status(500).json({ error: 'セッションの作成に失敗しました', detail: err.message });
  }
};
