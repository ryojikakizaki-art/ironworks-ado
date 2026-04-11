const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const BusinessDays = require('../js/business-days.js');

// ── 商品マスター（stdLengthMm: 基本料金に含まれる長さ, maxMm: 最大長さ）──
const PRODUCTS = {
  rene:       { name: 'René ルネ',               type: '横型', basePrice: 36500, stdLengthMm: 1500, maxMm: 5000, finish: 'マットブラック', includedZakin: 3 },
  claire:     { name: 'Claire クレール',          type: '横型', basePrice: 42000, stdLengthMm: 1500, maxMm: 5000, finish: 'マットホワイト', includedZakin: 3 },
  emile:      { name: 'Emile エミール',           type: '横型', basePrice: 45800, stdLengthMm: 1500, maxMm: 5000, finish: '鎚目仕上げ 銀古美', includedZakin: 3 },
  marcel:     { name: 'Marcel マルセル',          type: '横型', basePrice: 36000, stdLengthMm: 1500, maxMm: 5000, finish: 'マットブラック', includedZakin: 3 },
  alexandre:  { name: 'Alexandre アレクサンドル', type: '縦型', basePrice: 32000, stdLengthMm: 1000, maxMm: 3000, finish: 'マットブラック', includedZakin: 3 },
  catherine:  { name: 'Catherine カトリーヌ',     type: '縦型', basePrice: 34500, stdLengthMm: 1000, maxMm: 3000, finish: 'マットホワイト', includedZakin: 3 },
  claude:     { name: 'Claude クロード',          type: '縦型', basePrice: 30000, stdLengthMm: 1000, maxMm: 3000, finish: 'マットブラック', includedZakin: 3 },
  antoine:    { name: 'Antoine アントワーヌ',      type: '縦型ロング', basePrice: 56000, stdLengthMm: 2500, maxMm: 2500, finish: 'マットブラック', includedZakin: 4 },
  scroll16:   { name: 'Scroll スクロール 16φ',    type: '縦型', basePrice: 18000, stdLengthMm: 700,  maxMm: 700,  finish: 'ミツロウ仕上げ', includedZakin: 2 },
  scroll19:   { name: 'Scroll スクロール 19φ',    type: '縦型', basePrice: 32000, stdLengthMm: 700,  maxMm: 700,  finish: 'ミツロウ仕上げ', includedZakin: 2 },
  scroll22:   { name: 'Scroll スクロール 22φ',    type: '縦型', basePrice: 60000, stdLengthMm: 800,  maxMm: 800,  finish: 'ミツロウ仕上げ', includedZakin: 2 },
  fabrice:    { name: 'Fabrice ファブリス',        type: '縦型', basePrice: 100000, stdLengthMm: 800, maxMm: 800,  finish: '無垢鉄 火造り鍛造', includedZakin: 2 },
  tsuchime:   { name: '鎚目 TSUCHIME',            type: '縦型', basePrice: 70000, stdLengthMm: 800,  maxMm: 800,  finish: '手打ち鎚目仕上げ', includedZakin: 2 },
};

// ── 共通価格パラメータ（mm単位）──
const PRICE_PER_MM    = 25;
const ZAKIN_PRICE     = 3500;
const END_DIST_MM     = 100;
const MAX_SPAN_MM     = 850;
const SURGE_START_MM  = 2000;
const SURGE_BASE      = 1.2;
const SURGE_INTERVAL_MM = 500;
const RUSH_RATE       = 0.2;

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
  const total     = prod.basePrice + addon + addZakin + surcharge;
  return { addon, surcharge, addZakin, zakin, total };
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

    // 特急配送
    const rushDelivery = !!req.body?.rushDelivery;
    const rushSurcharge = rushDelivery ? Math.round(p.total * RUSH_RATE) : 0;
    const totalYen = Math.round(p.total + rushSurcharge);

    // 配送希望
    const preferredArrivalDate = req.body?.preferredArrivalDate || '';
    const preferredTimeSlot = req.body?.preferredTimeSlot || '';

    // スケジュール計算
    const now = new Date();
    const schedule = BusinessDays.getScheduleDates(now, rushDelivery);
    const deliveryDays = rushDelivery ? 5 : 10;

    const deliveryDesc = rushDelivery
      ? `${prod.finish} / 座金${p.zakin}個 / 特急配送 ${deliveryDays}営業日`
      : `${prod.finish} / 座金${p.zakin}個 / 通常配送 ${deliveryDays}営業日`;

    const host    = req.headers.host || 'ironworks-ado.vercel.app';
    const baseUrl = `https://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'jpy',
          product_data: {
            name: `${prod.name} 壁付け手すり ${L}mm`,
            description: deliveryDesc,
          },
          unit_amount: totalYen,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}&product=${productKey}&length=${L}&rush=${rushDelivery ? '1' : '0'}`,
      cancel_url:  `${baseUrl}/item/${productKey}.html`,
      metadata: {
        product:                productKey,
        product_name:           prod.name,
        type:                   prod.type,
        length_mm:              String(L),
        zakin_count:            String(p.zakin),
        base_total_yen:         String(Math.round(p.total)),
        rush_delivery:          rushDelivery ? 'true' : 'false',
        rush_surcharge_yen:     String(rushSurcharge),
        total_yen:              String(totalYen),
        preferred_arrival_date: preferredArrivalDate,
        preferred_time_slot:    preferredTimeSlot,
        production_start:       BusinessDays.formatDateISO(schedule.productionStart),
        production_complete:    BusinessDays.formatDateISO(schedule.productionComplete),
        shipping_date:          BusinessDays.formatDateISO(schedule.shippingDate),
        arrival_estimate:       BusinessDays.formatDateISO(schedule.arrivalDate),
      },
      locale: 'ja',
      payment_intent_data: {
        description: `IRONWORKS ado — ${prod.name} ${L}mm${rushDelivery ? '（特急）' : ''}`,
      },
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    return res.status(500).json({ error: 'セッションの作成に失敗しました', detail: err.message });
  }
};
