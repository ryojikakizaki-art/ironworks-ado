import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getScheduleDates, formatDateISO } from '@/lib/business-days';
import { getOrCreateConsumptionTaxRate } from '@/lib/stripe/tax-rate';
import { sanitizeCart, calcCartPricing } from '@/lib/cart/pricing';
import { encodeCartMetadata } from '@/lib/cart/metadata';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return _stripe;
}

/**
 * カート（複数商品まとめ買い）の Stripe Checkout セッション作成。
 *
 * 単品注文の /api/checkout とは別エンドポイントにして、本番稼働中の単品フローに
 * 一切手を入れずに済むようにしている。価格・送料はクライアントの申告値を使わず、
 * lib/cart/pricing.ts の sanitizeCart → calcCartPricing でサーバ側再計算する
 * （単品注文と同じ calcPrice / calcShipping を共有）。
 *
 * 税処理は単品注文と同一: 本体は税込（inclusive）、送料は佐川レート表が税抜のため
 * 税抜（exclusive・+10%）で別建て。
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const items = sanitizeCart(body?.items);
    if (items.length === 0) {
      return NextResponse.json({ error: 'カートに商品がありません' }, { status: 400 });
    }

    const prefecture = String(body?.prefecture || '').trim();
    if (!prefecture) {
      return NextResponse.json({ error: '配送先都道府県を選択してください' }, { status: 400 });
    }

    const rushDelivery = body?.rushDelivery === true;
    const pricing = calcCartPricing(items, prefecture, rushDelivery);

    if (pricing.shippingInquiry) {
      return NextResponse.json({
        error: pricing.shippingInquiryReason || '配送条件により別途お見積もりが必要です',
        inquiry: true,
      }, { status: 400 });
    }

    const preferredArrivalDate = String(body?.preferredArrivalDate || '');
    const preferredTimeSlot = String(body?.preferredTimeSlot || '');

    const schedule = getScheduleDates(new Date(), rushDelivery);
    const deliveryLabel = rushDelivery ? '特急配送 5営業日' : '通常配送 10営業日';

    const host = request.headers.get('host') || 'ironworks-ado.vercel.app';
    const baseUrl = `https://${host}`;

    const stripeClient = getStripe();
    const taxInclusiveId = await getOrCreateConsumptionTaxRate(stripeClient, true);
    const taxExclusiveId = await getOrCreateConsumptionTaxRate(stripeClient, false);
    const inclusiveTaxRates = taxInclusiveId ? { tax_rates: [taxInclusiveId] } : {};
    const exclusiveTaxRates = taxExclusiveId ? { tax_rates: [taxExclusiveId] } : {};

    // 特急割増は行ごとの unit_amount に均さず、独立した 1 行として計上する。
    // 商品が混在するカートでは按分の端数で合計がズレるため。
    const itemLineItems = pricing.lines.map((line) => ({
      price_data: {
        currency: 'jpy' as const,
        product_data: {
          name: line.label,
          description: `座金${line.zakinCount}個${line.item.washerType ? `（${line.item.washerType}タイプ）` : ''}${
            line.item.angleDeg ? ` / 角度加工 ${line.item.angleDir === 'left' ? '左' : '右'}${line.item.angleDeg}°` : ''
          } / ${line.product.finish}`,
        },
        unit_amount: line.unitPrice,
        tax_behavior: 'inclusive' as const,
      },
      quantity: line.item.quantity,
      ...inclusiveTaxRates,
    }));

    const rushLineItem = pricing.rushSurcharge > 0 ? [{
      price_data: {
        currency: 'jpy' as const,
        product_data: {
          name: '特急配送 割増（+20%）',
          description: '制作を優先し 5 営業日で発送いたします',
        },
        unit_amount: pricing.rushSurcharge,
        tax_behavior: 'inclusive' as const,
      },
      quantity: 1,
      ...inclusiveTaxRates,
    }] : [];

    const summaryLabel = pricing.lines.length === 1
      ? pricing.lines[0].label
      : `${pricing.lines[0].label} ほか${pricing.lines.length - 1}点`;

    const session = await stripeClient.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        ...itemLineItems,
        ...rushLineItem,
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `送料（佐川急便・${prefecture}）`,
              description: pricing.shippingNote,
            },
            unit_amount: pricing.shipping,
            tax_behavior: 'exclusive',
          },
          quantity: 1,
          ...exclusiveTaxRates,
        },
      ],
      mode: 'payment',
      shipping_address_collection: { allowed_countries: ['JP'] },
      phone_number_collection: { enabled: true },
      return_url: `${baseUrl}/thanks?session_id={CHECKOUT_SESSION_ID}&cart=1`,
      metadata: {
        // webhook はこのキーで単品・簡易商品と分岐する
        product_type:           'cart',
        ...encodeCartMetadata(pricing),
        rush_delivery:          rushDelivery ? 'true' : 'false',
        rush_surcharge_yen:     String(pricing.rushSurcharge),
        delivery_label:         deliveryLabel,
        prefecture:             prefecture,
        shipping_yen:           String(pricing.shipping),
        shipping_tax_yen:       String(pricing.shippingTax),
        shipping_note:          pricing.shippingNote,
        shipping_bundles:       String(pricing.shippingBundles),
        base_total_yen:         String(pricing.itemsSubtotal),
        total_yen:              String(pricing.total),
        preferred_arrival_date: preferredArrivalDate,
        preferred_time_slot:    preferredTimeSlot,
        production_start:       formatDateISO(schedule.productionStart),
        production_complete:    formatDateISO(schedule.productionComplete),
        shipping_date:          formatDateISO(schedule.shippingDate),
        arrival_estimate:       formatDateISO(schedule.arrivalDate),
      },
      locale: 'ja',
      payment_intent_data: {
        description: `IRONWORKS ado — ${summaryLabel}${rushDelivery ? '（特急）' : ''}`,
      },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `IRONWORKS ado — ${summaryLabel}${rushDelivery ? '（特急配送）' : ''}`,
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
            product_type: 'cart',
            item_count: String(pricing.totalQuantity),
            rush_delivery: rushDelivery ? 'true' : 'false',
          },
        },
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[checkout/cart] Stripe error:', message);
    return NextResponse.json(
      { error: 'セッションの作成に失敗しました', detail: message },
      { status: 500 }
    );
  }
}
