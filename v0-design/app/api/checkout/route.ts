import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getScheduleDates, formatDateISO } from '@/lib/business-days';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return _stripe;
}

// ── 商品マスター（stdLengthMm: 基本料金に含まれる長さ, maxMm: 最大長さ）──
interface Product {
  name: string;
  type: string;
  basePrice: number;
  stdLengthMm: number;
  maxMm: number;
  finish: string;
  includedZakin: number;
}

const PRODUCTS: Record<string, Product> = {
  rene:       { name: 'René ルネ',               type: '横型', basePrice: 36500, stdLengthMm: 1500, maxMm: 5000, finish: 'マットブラック', includedZakin: 3 },
  claire:     { name: 'Claire クレール',          type: '横型', basePrice: 42000, stdLengthMm: 1500, maxMm: 5000, finish: 'マットホワイト', includedZakin: 3 },
  emile:      { name: 'Émile エミール',           type: '横型', basePrice: 45800, stdLengthMm: 1500, maxMm: 5000, finish: '鎚目仕上げ 銀古美', includedZakin: 3 },
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

function calcZakin(L_mm: number): number {
  if (L_mm <= 1050) return 2;
  const inner = L_mm - 2 * END_DIST_MM;
  return 1 + Math.ceil(inner / MAX_SPAN_MM);
}

function calcPrice(L_mm: number, prod: Product) {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const productKey = (body?.product || 'rene').toLowerCase();
    const prod = PRODUCTS[productKey];
    if (!prod) {
      return NextResponse.json({ error: `不明な商品: ${productKey}` }, { status: 400 });
    }

    const raw = body?.lengthMm || (body?.lengthCm && body.lengthCm * 10);
    const L   = Math.max(500, Math.min(prod.maxMm, Math.round(Number(raw) || prod.stdLengthMm)));
    const p   = calcPrice(L, prod);

    // 特急配送
    const rushDelivery = !!body?.rushDelivery;
    const rushSurcharge = rushDelivery ? Math.round(p.total * RUSH_RATE) : 0;
    const totalYen = Math.round(p.total + rushSurcharge);

    // 配送希望
    const preferredArrivalDate = body?.preferredArrivalDate || '';
    const preferredTimeSlot = body?.preferredTimeSlot || '';

    // スケジュール計算
    const now = new Date();
    const schedule = getScheduleDates(now, rushDelivery);
    const deliveryDays = rushDelivery ? 5 : 10;

    const deliveryDesc = rushDelivery
      ? `${prod.finish} / 座金${p.zakin}個 / 特急配送 ${deliveryDays}営業日`
      : `${prod.finish} / 座金${p.zakin}個 / 通常配送 ${deliveryDays}営業日`;

    const host    = request.headers.get('host') || 'ironworks-ado.vercel.app';
    const baseUrl = `https://${host}`;

    const session = await getStripe().checkout.sessions.create({
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
      success_url: `${baseUrl}/thanks?session_id={CHECKOUT_SESSION_ID}&product=${productKey}&length=${L}&rush=${rushDelivery ? '1' : '0'}`,
      cancel_url:  `${baseUrl}/item/${productKey}`,
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
        production_start:       formatDateISO(schedule.productionStart),
        production_complete:    formatDateISO(schedule.productionComplete),
        shipping_date:          formatDateISO(schedule.shippingDate),
        arrival_estimate:       formatDateISO(schedule.arrivalDate),
      },
      locale: 'ja',
      payment_intent_data: {
        description: `IRONWORKS ado — ${prod.name} ${L}mm${rushDelivery ? '（特急）' : ''}`,
      },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `IRONWORKS ado — ${prod.name} 壁付け手すり ${L}mm${rushDelivery ? '（特急配送）' : ''}`,
          footer: [
            '発行者: 鍛鉄工房ZEST（蠣崎 良治） / IRONWORKS ado',
            '適格請求書発行事業者登録番号: T7810771171765',
            '〒265-0052 千葉県千葉市若葉区和泉町239-2',
            'TEL: 080-5424-2221 / Email: ado@tantetuzest.com',
          ].join('\n'),
          metadata: {
            product: productKey,
            length_mm: String(L),
            rush_delivery: rushDelivery ? 'true' : 'false',
          },
        },
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[checkout] Stripe error:', message);
    return NextResponse.json(
      { error: 'セッションの作成に失敗しました', detail: message },
      { status: 500 }
    );
  }
}
