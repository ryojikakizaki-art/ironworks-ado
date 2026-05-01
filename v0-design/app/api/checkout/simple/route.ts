import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SIMPLE_PRODUCTS } from '@/lib/products/simple';
import { getOrCreateConsumptionTaxRate } from '@/lib/stripe/tax-rate';

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
 * シンプル商品（送料込・固定価格）向け Stripe Checkout セッション作成
 *
 * 対象は SimpleProduct 配下のうち basePrice > 0 かつ shippingIncluded = true の商品。
 * 送料計算・寸法・座金などの個別ロジックを伴わず、basePrice * quantity を税込内税で請求する。
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productKey = String(body?.product || '').toLowerCase();
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
