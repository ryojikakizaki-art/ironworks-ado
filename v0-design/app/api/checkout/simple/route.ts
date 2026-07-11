import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SIMPLE_PRODUCTS } from '@/lib/products/simple';
import { getOrCreateConsumptionTaxRate } from '@/lib/stripe/tax-rate';
import { calcClemenceShipping } from '@/lib/shipping/sagawa';
import { getScheduleDates, formatDateISO } from '@/lib/business-days';
import {
  BASE_PRICE as CLEMENCE_BASE_PRICE,
  EXTENSION_MAX_MM as CLEMENCE_EXTENSION_MAX_MM,
  W_STANDARD_MIN as CLEMENCE_W_MIN,
  W_MAX as CLEMENCE_W_MAX,
  H_MIN as CLEMENCE_H_MIN,
  H_MAX as CLEMENCE_H_MAX,
  calcExtensionPrice,
} from '@/lib/drawing-modal/clemence-svg';

// 特急配送の割増率（合計の +20%）。見積計算機つき商品（order-pricing.ts の RUSH_RATE）と同一。
const CLEMENCE_RUSH_RATE = 0.2;

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return _stripe;
}

const clamp = (v: unknown, lo: number, hi: number) =>
  Math.min(Math.max(Math.round(Number(v)) || lo, lo), hi);

/**
 * Clémence（トイレ手すり）専用の Stripe Checkout セッション作成。
 *
 * 固定価格 SimpleProduct だが、③側延長オプション（従量・上限+¥3,000）・特急配送
 * （+20%）・配送先都道府県別の送料（160/170 サイズ・沖縄のみ要問合せ）で金額が
 * 変わるため、見積計算機つき商品（René 等）と同じ購入フロー・税処理に揃える。
 * 本体は税込（inclusive）、送料は佐川レート表が税抜のため税抜（exclusive・+10%）で別建て。
 * 寸法・ブラケット位置のクランプは components/clemence-spec-panel.tsx と同じ範囲
 * （lib/drawing-modal/clemence-svg.ts の定数）をサーバ側でも適用し、クライアントの
 * 入力を信用しない。
 */
async function createClemenceCheckoutSession(request: NextRequest, body: Record<string, unknown>) {
  const prod = SIMPLE_PRODUCTS['clemence'];
  const prefecture = String(body?.prefecture || '').trim();
  if (!prefecture) {
    return NextResponse.json({ error: '配送先都道府県を選択してください' }, { status: 400 });
  }

  const w = clamp(body?.w, CLEMENCE_W_MIN, CLEMENCE_W_MAX);
  const h = clamp(body?.h, CLEMENCE_H_MIN, CLEMENCE_H_MAX);
  const x2 = clamp(body?.x2, 120, w - 170);
  const x3 = clamp(body?.x3, x2 + 100, w - 70);
  const ext = clamp(body?.ext, 0, CLEMENCE_EXTENSION_MAX_MM);
  const rushDelivery = body?.rushDelivery === true;

  const shippingResult = calcClemenceShipping(prefecture, ext);
  if (shippingResult.inquiry) {
    return NextResponse.json(
      { error: shippingResult.inquiryReason || '配送条件により別途お見積もりが必要です', inquiry: true },
      { status: 400 },
    );
  }

  const extensionPrice = calcExtensionPrice(ext);
  const subtotalYen = CLEMENCE_BASE_PRICE + extensionPrice; // 本体（税込）
  const rushSurcharge = rushDelivery ? Math.round(subtotalYen * CLEMENCE_RUSH_RATE) : 0;
  const bodyYen = subtotalYen + rushSurcharge;
  const shippingYen = shippingResult.shipping;          // 税抜（佐川レート表）
  const shippingTaxYen = Math.round(shippingYen * 0.1);
  const totalYen = bodyYen + shippingYen + shippingTaxYen;

  const specLabel = `W${w}×H${h}mm・②${x2}mm/③${x3}mm${ext > 0 ? `・③延長+${ext}mm` : ''}`;
  const deliveryLabel = rushDelivery ? '特急配送 5営業日' : '通常配送 10営業日';
  const productName = `${prod.nameJa}（${prod.nameEn}）／${specLabel}`;

  // スケジュール（見積計算機つき商品と同じ営業日ベース。通常8/特急3営業日で制作）
  const schedule = getScheduleDates(new Date(), rushDelivery);

  const host = request.headers.get('host') || 'ironworks-ado.vercel.app';
  const baseUrl = `https://${host}`;

  try {
    const stripeClient = getStripe();
    const taxInclusiveId = await getOrCreateConsumptionTaxRate(stripeClient, true);
    const taxExclusiveId = await getOrCreateConsumptionTaxRate(stripeClient, false);
    const inclusiveTaxRates = taxInclusiveId ? { tax_rates: [taxInclusiveId] } : {};
    const exclusiveTaxRates = taxExclusiveId ? { tax_rates: [taxExclusiveId] } : {};

    const session = await stripeClient.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: productName,
              description: `${prod.subtitle} / ${deliveryLabel}`,
            },
            unit_amount: bodyYen,
            tax_behavior: 'inclusive',
          },
          quantity: 1,
          ...inclusiveTaxRates,
        },
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `送料（佐川急便・${prefecture}）`,
              description: shippingResult.note,
            },
            unit_amount: shippingYen,
            tax_behavior: 'exclusive',
          },
          quantity: 1,
          ...exclusiveTaxRates,
        },
      ],
      mode: 'payment',
      return_url: `${baseUrl}/thanks?session_id={CHECKOUT_SESSION_ID}&product=clemence&rush=${rushDelivery ? '1' : '0'}`,
      shipping_address_collection: { allowed_countries: ['JP'] },
      phone_number_collection: { enabled: true },
      metadata: {
        product_type: 'simple',
        product: 'clemence',
        product_name: productName,
        quantity: '1',
        unit_yen: String(bodyYen),
        total_yen: String(totalYen),
        shipping_method: `佐川急便（${prefecture}）`,
        prefecture,
        w_mm: String(w),
        h_mm: String(h),
        x2_mm: String(x2),
        x3_mm: String(x3),
        extension_mm: String(ext),
        extension_price_yen: String(extensionPrice),
        base_price_yen: String(CLEMENCE_BASE_PRICE),
        rush_delivery: rushDelivery ? 'true' : 'false',
        rush_surcharge_yen: String(rushSurcharge),
        shipping_yen: String(shippingYen),
        shipping_tax_yen: String(shippingTaxYen),
        shipping_note: shippingResult.note,
        // 受注台帳の仕様欄（I列）に出す文字列。webhook 側は spec_text があればこれを正とする。
        spec_text: `${specLabel} / ${deliveryLabel} / 送料¥${(shippingYen + shippingTaxYen).toLocaleString()}（税込）`,
        production_start: formatDateISO(schedule.productionStart),
        production_complete: formatDateISO(schedule.productionComplete),
        shipping_date: formatDateISO(schedule.shippingDate),
        arrival_estimate: formatDateISO(schedule.arrivalDate),
      },
      locale: 'ja',
      payment_intent_data: {
        description: `IRONWORKS ado — ${prod.nameJa} ${specLabel}${rushDelivery ? '（特急）' : ''}`,
      },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `IRONWORKS ado — ${productName}`,
          footer: [
            '発行者: 鍛鉄工房ZEST（蠣﨑 良治） / IRONWORKS ado',
            '適格請求書発行事業者登録番号: T7810771171765',
            '〒265-0052 千葉県千葉市若葉区和泉町239-2',
            'TEL: 070-3817-0659 / Email: ado@tantetuzest.com',
          ].join('\n'),
          rendering_options: {
            amount_tax_display: 'include_inclusive_tax',
          },
          metadata: {
            product: 'clemence',
            spec: specLabel,
            prefecture,
          },
        },
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[checkout/simple] Stripe error (clemence):', message);
    return NextResponse.json(
      { error: 'セッションの作成に失敗しました', detail: message },
      { status: 500 },
    );
  }
}

/**
 * シンプル商品（送料込・固定価格）向け Stripe Checkout セッション作成
 *
 * 対象は SimpleProduct 配下のうち basePrice > 0 かつ shippingIncluded = true の商品。
 * 送料計算・寸法・座金などの個別ロジックを伴わず、basePrice * quantity を税込内税で請求する。
 * Clémence（延長オプション＋配送先別送料）のみ createClemenceCheckoutSession に分岐する。
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productKey = String(body?.product || '').toLowerCase();

    if (productKey === 'clemence') {
      return createClemenceCheckoutSession(request, body);
    }

    const prod = SIMPLE_PRODUCTS[productKey];

    if (!prod) {
      return NextResponse.json({ error: `不明な商品: ${productKey}` }, { status: 400 });
    }
    if (prod.basePrice <= 0) {
      return NextResponse.json({ error: `この商品はオンライン決済対象ではありません: ${productKey}` }, { status: 400 });
    }
    if (!prod.shippingIncluded) {
      return NextResponse.json({ error: `送料計算が必要な商品はこのエンドポイントでは決済できません: ${productKey}` }, { status: 400 });
    }

    const qty = Math.max(1, Math.min(10, parseInt(String(body?.quantity || 1), 10) || 1));
    const unitYen = prod.basePrice;
    const totalYen = unitYen * qty;

    const host = request.headers.get('host') || 'ironworks-ado.vercel.app';
    const baseUrl = `https://${host}`;

    // 消費税 10%（税込・内税）— SimpleProduct は basePrice 税込前提
    const stripeClient = getStripe();
    const taxInclusiveId = await getOrCreateConsumptionTaxRate(stripeClient, true);
    const inclusiveTaxRates = taxInclusiveId ? { tax_rates: [taxInclusiveId] } : {};

    const session = await stripeClient.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `${prod.nameJa}（${prod.nameEn}）`,
              description: `${prod.subtitle} / 送料込み`,
            },
            unit_amount: unitYen,
            tax_behavior: 'inclusive',
          },
          quantity: qty,
          ...inclusiveTaxRates,
        },
      ],
      mode: 'payment',
      return_url: `${baseUrl}/thanks?session_id={CHECKOUT_SESSION_ID}&product=${productKey}`,
      metadata: {
        product_type:     'simple',
        product:          productKey,
        product_name:     `${prod.nameJa} (${prod.nameEn})`,
        quantity:         String(qty),
        unit_yen:         String(unitYen),
        total_yen:        String(totalYen),
        shipping_method:  'クリックポスト（送料込）',
      },
      locale: 'ja',
      payment_intent_data: {
        description: `IRONWORKS ado — ${prod.nameJa} × ${qty}`,
      },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `IRONWORKS ado — ${prod.nameJa}（送料込み）× ${qty}`,
          footer: [
            '発行者: 鍛鉄工房ZEST（蠣﨑 良治） / IRONWORKS ado',
            '適格請求書発行事業者登録番号: T7810771171765',
            '〒265-0052 千葉県千葉市若葉区和泉町239-2',
            'TEL: 070-3817-0659 / Email: ado@tantetuzest.com',
          ].join('\n'),
          rendering_options: {
            amount_tax_display: 'include_inclusive_tax',
          },
          metadata: {
            product:  productKey,
            quantity: String(qty),
          },
        },
      },
      shipping_address_collection: {
        allowed_countries: ['JP'],
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[checkout/simple] Stripe error:', message);
    return NextResponse.json(
      { error: 'セッションの作成に失敗しました', detail: message },
      { status: 500 }
    );
  }
}
