import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getScheduleDates, formatDateISO } from '@/lib/business-days';
import { calcShipping, type ProductType } from '@/lib/shipping/sagawa';
import { getOrCreateConsumptionTaxRate } from '@/lib/stripe/tax-rate';
// 価格・座金計算の正本は lib/products/order-pricing.ts（カード決済・銀行振込で共有）。
import { PRODUCTS, calcPrice, RUSH_RATE } from '@/lib/products/order-pricing';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return _stripe;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const productKey = (body?.product || 'rene').toLowerCase();
    const prod = PRODUCTS[productKey];
    if (!prod) {
      return NextResponse.json({ error: `不明な商品: ${productKey}` }, { status: 400 });
    }

    // Scroll 16/19/22 のみ「右向き / 左向き」選択 (価格変更なし、表記のみ)
    // トップ画像サムネイルが左向きのため、既定値も「左向き」
    const hasOrientation = productKey.startsWith('scroll');
    const rawOrientation = String(body?.orientation || 'left').toLowerCase();
    const orientation: 'right' | 'left' = rawOrientation === 'right' ? 'right' : 'left';
    const orientationLabel = hasOrientation
      ? (orientation === 'left' ? '左向き' : '右向き')
      : '';

    // 座金タイプ A/B — 縦型CAD商品 (zakinRule を持つ Antoine/Claude/Catherine/Alexandre)
    // のみ商品ページにセレクタが出る。製作時に必須の仕様なので必ず注文に記録する。
    const supportsWasher = !!prod.zakinRule;
    const washerType: 'A' | 'B' =
      String(body?.washerType || 'A').toUpperCase() === 'B' ? 'B' : 'A';

    const minL = prod.zakinRule?.minLengthMm ?? 500;

    // 多本長さ違い対応 (PR #2): lengths[] が来たらそれを正、無ければ lengthMm + quantity から導出。
    // 各 length は商品ごとの min..max にクランプ。
    const rawLengths: number[] = Array.isArray(body?.lengths) && body.lengths.length > 0
      ? body.lengths.map((v: unknown) => Math.max(minL, Math.min(prod.maxMm, Math.round(Number(v) || prod.stdLengthMm))))
      : (() => {
          const raw = body?.lengthMm || (body?.lengthCm && body.lengthCm * 10);
          const L0 = Math.max(minL, Math.min(prod.maxMm, Math.round(Number(raw) || prod.stdLengthMm)));
          const qty0 = Math.max(1, Math.min(6, parseInt(String(body?.quantity || 1), 10) || 1));
          return Array(qty0).fill(L0);
        })();

    // 7 本以上は請求書振込フローへ (Stripe 決済不可、UI 側で /contact?type=invoice に誘導)
    if (rawLengths.length > 6) {
      return NextResponse.json({
        error: '7本以上のご注文は請求書振込でお受けしております。お問い合わせフォームからご注文情報をお送りください。',
        inquiry: true,
        invoiceFlow: true,
      }, { status: 400 });
    }
    const qty = Math.max(1, rawLengths.length);
    const lengths = rawLengths;
    // 旧コード互換: 単一 L (= 第一本目)
    const L = lengths[0];
    // 多本注文判定
    const isMultiOrder = lengths.length > 1;

    // お客様が指定した座金位置・座金カスタム有無・角度 (単品注文のみ。多本は本ごとに自動配置)。
    // - positions / angle は制作図再現用に metadata へ記録する。
    // - zakinCustom が true なら座金本数・角度料金を商品ページ calculatePrice と同じ式で課金する。
    const customPositions: number[] = (!isMultiOrder && Array.isArray(body?.positions))
      ? body.positions
          .map((v: unknown) => Math.round(Number(v)))
          .filter((n: number) => Number.isFinite(n) && n >= 0 && n <= L)
      : [];
    const zakinCustom = !isMultiOrder && body?.zakinCustom === true;
    const drawAngleDeg = isMultiOrder
      ? 0
      : Math.max(0, Math.min(60, Math.round(Number(body?.angleDeg) || 0)));
    const drawAngleDir: 'left' | 'right' =
      String(body?.angleDir || 'left') === 'right' ? 'right' : 'left';

    // 価格計算オプション: 座金カスタム時の本数と角度。多本注文では空 (= 自動・角度なし)。
    const priceOpts = {
      zakinCount: zakinCustom && customPositions.length > 0 ? customPositions.length : undefined,
      angleDeg: drawAngleDeg,
    };
    const p = calcPrice(L, prod, priceOpts);
    // per-item 計算 (line items 構築・metadata 用)
    const perItem = lengths.map(itemL => ({ L: itemL, ...calcPrice(itemL, prod, priceOpts) }));
    const itemsSubtotalRaw = perItem.reduce((s, it) => s + Math.round(it.total), 0);

    // 特急配送 — per-item 合計に対して 20%
    const rushDelivery = !!body?.rushDelivery;
    const rushSurcharge = rushDelivery ? Math.round(itemsSubtotalRaw * RUSH_RATE) : 0;

    // 佐川急便 送料 (prefecture 必須, inquiry 時はエラー返却)
    // 多本注文時は梱包ごとに最長サイズで rate 計算 → 合算 (3 本/梱包)
    const prefecture = String(body?.prefecture || '').trim();
    const productCategory: ProductType =
      prod.type.includes('横型') ? 'yokogata'
      : prod.type.includes('縦型') ? 'tategata'
      : 'fixed';
    const shippingResult = calcShipping(lengths, prefecture, productCategory);
    if (shippingResult.inquiry) {
      return NextResponse.json({
        error: shippingResult.inquiryReason || '配送条件により別途お見積もりが必要です',
        inquiry: true,
      }, { status: 400 });
    }
    if (!prefecture) {
      return NextResponse.json({ error: '配送先都道府県を選択してください' }, { status: 400 });
    }
    // 送料は外税 (佐川急便レートは税抜). 請求時に消費税 10% を上乗せ
    const shippingYen = shippingResult.shipping;
    const shippingTaxYen = Math.round(shippingYen * 0.1);

    const subtotalYen = itemsSubtotalRaw + rushSurcharge;
    const totalYen = subtotalYen + shippingYen + shippingTaxYen;

    // 配送希望
    const preferredArrivalDate = body?.preferredArrivalDate || '';
    const preferredTimeSlot = body?.preferredTimeSlot || '';

    // スケジュール計算
    const now = new Date();
    const schedule = getScheduleDates(now, rushDelivery);
    const deliveryDays = rushDelivery ? 5 : 10;

    const deliveryDesc = rushDelivery
      ? `${prod.finish} / 特急配送 ${deliveryDays}営業日`
      : `${prod.finish} / 通常配送 ${deliveryDays}営業日`;

    const host    = request.headers.get('host') || 'ironworks-ado.vercel.app';
    const baseUrl = `https://${host}`;

    // 特急割増を per-item に均等配分 (Stripe 上 unit_amount に均すため)
    const rushPerItem = qty > 0 ? rushSurcharge / qty : 0;

    // 消費税 10% の Tax Rate を取得または自動作成
    // - 本体: 税込 (inclusive) → 決済画面に「内消費税」内訳表示
    // - 送料: 税抜 (exclusive) → 決済画面に「消費税 (送料)」として上乗せ表示
    const stripeClient = getStripe();
    const taxInclusiveId = await getOrCreateConsumptionTaxRate(stripeClient, true);
    const taxExclusiveId = await getOrCreateConsumptionTaxRate(stripeClient, false);
    const inclusiveTaxRates = taxInclusiveId ? { tax_rates: [taxInclusiveId] } : {};
    const exclusiveTaxRates = taxExclusiveId ? { tax_rates: [taxExclusiveId] } : {};

    // 本体の line_items を構築:
    // - 全本同じ長さなら 1 行 × qty (既存挙動)
    // - 違う長さがあれば 長さごとに集約して複数行
    type LengthGroup = { L: number; count: number; perItem: typeof perItem[0] };
    const groups = new Map<number, LengthGroup>();
    for (const it of perItem) {
      const g = groups.get(it.L);
      if (g) g.count += 1;
      else groups.set(it.L, { L: it.L, count: 1, perItem: it });
    }
    const itemLineItems = Array.from(groups.values()).map(({ L: gL, count, perItem: gp }) => ({
      price_data: {
        currency: 'jpy' as const,
        product_data: {
          name: `${prod.name} 壁付け手すり ${gL}mm${orientationLabel ? ` ${orientationLabel}` : ''}`,
          description: `座金${gp.zakin}個${supportsWasher ? `（${washerType}タイプ）` : ''}${drawAngleDeg > 0 ? ` / 角度加工 ${drawAngleDir === 'left' ? '左' : '右'}${drawAngleDeg}°` : ''} / ${deliveryDesc}`,
        },
        unit_amount: Math.round(gp.total + rushPerItem),
        tax_behavior: 'inclusive' as const,
      },
      quantity: count,
      ...inclusiveTaxRates,
    }));

    const session = await stripeClient.checkout.sessions.create({
      // ui_mode: 'embedded' で client_secret を返し、自社サイト内に決済 UI を埋め込む。
      // 旧 hosted モードへ戻したい場合は ui_mode を消し、success_url/cancel_url を復活させる。
      ui_mode: 'embedded',
      line_items: [
        ...itemLineItems,
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
      // 配送先住所・電話番号を必ず収集する。手すりは全国配送のため発送に必須。
      // （簡易商品 checkout/simple には既に有り。手すり側で抜けていたのを補完）
      shipping_address_collection: { allowed_countries: ['JP'] },
      phone_number_collection: { enabled: true },
      // embedded モードは return_url のみ。決済成功/失敗どちらもここに戻る (status を thanks 側で判定)
      return_url: `${baseUrl}/thanks?session_id={CHECKOUT_SESSION_ID}&product=${productKey}&length=${L}&rush=${rushDelivery ? '1' : '0'}`,
      metadata: {
        product:                productKey,
        product_name:           prod.name,
        type:                   prod.type,
        // 多本長さ違い対応 (PR #2): lengths_mm に CSV で全本の長さを格納。
        // length_mm は後方互換で第一本の値を保持。
        length_mm:              String(L),
        lengths_mm:             lengths.join(','),
        is_multi_order:         isMultiOrder ? 'true' : 'false',
        quantity:               String(qty),
        zakin_count:            String(p.zakin),
        ...(supportsWasher ? { washer_type: washerType } : {}),
        // 制作図再現用 (価格に影響しない). 単品注文時のみ。
        ...(customPositions.length ? { positions_mm: customPositions.join(',') } : {}),
        ...(drawAngleDeg > 0 ? { angle_deg: String(drawAngleDeg), angle_dir: drawAngleDir } : {}),
        base_total_yen:         String(Math.round(p.total)),
        rush_delivery:          rushDelivery ? 'true' : 'false',
        rush_surcharge_yen:     String(rushSurcharge),
        prefecture:             prefecture,
        shipping_yen:           String(shippingYen),
        shipping_tax_yen:       String(shippingTaxYen),
        shipping_note:          shippingResult.note,
        shipping_bundles:       String(shippingResult.bundles),
        total_yen:              String(totalYen),
        preferred_arrival_date: preferredArrivalDate,
        preferred_time_slot:    preferredTimeSlot,
        production_start:       formatDateISO(schedule.productionStart),
        production_complete:    formatDateISO(schedule.productionComplete),
        shipping_date:          formatDateISO(schedule.shippingDate),
        arrival_estimate:       formatDateISO(schedule.arrivalDate),
        ...(hasOrientation ? { orientation } : {}),
      },
      locale: 'ja',
      payment_intent_data: {
        description: `IRONWORKS ado — ${prod.name} ${L}mm${orientationLabel ? ` ${orientationLabel}` : ''}${rushDelivery ? '（特急）' : ''}`,
      },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `IRONWORKS ado — ${prod.name} 壁付け手すり ${L}mm${orientationLabel ? ` ${orientationLabel}` : ''}${rushDelivery ? '（特急配送）' : ''}`,
          footer: [
            '発行者: 鍛鉄工房ZEST（蠣﨑 良治） / IRONWORKS ado',
            '適格請求書発行事業者登録番号: T7810771171765',
            '〒265-0052 千葉県千葉市若葉区和泉町239-2',
            'TEL: 070-3817-0659 / Email: ado@tantetuzest.com',
          ].join('\n'),
          // 領収書PDFに「内消費税 ¥X,XXX」を明示表示 (適格請求書要件)
          rendering_options: {
            amount_tax_display: 'include_inclusive_tax',
          },
          metadata: {
            product: productKey,
            length_mm: String(L),
            rush_delivery: rushDelivery ? 'true' : 'false',
            ...(hasOrientation ? { orientation } : {}),
          },
        },
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[checkout] Stripe error:', message);
    return NextResponse.json(
      { error: 'セッションの作成に失敗しました', detail: message },
      { status: 500 }
    );
  }
}
