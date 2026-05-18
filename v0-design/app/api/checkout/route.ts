import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getScheduleDates, formatDateISO } from '@/lib/business-days';
import { calcShipping, type ProductType } from '@/lib/shipping/sagawa';
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

// ── 商品マスター（stdLengthMm: 基本料金に含まれる長さ, maxMm: 最大長さ）──
// 座金計算ルール (縦型は product 固有、横型は未指定=旧式)
interface ZakinRule {
  defaultCount?: number;
  endMinMm: number;
  maxSpanMm: number;
  minLengthMm?: number;
  addWasherAboveMm?: number;
}
interface Product {
  name: string;
  type: string;
  basePrice: number;
  stdLengthMm: number;
  maxMm: number;
  finish: string;
  includedZakin: number;
  zakinRule?: ZakinRule;
  pricePerMm?: number; // 商品別オーバーライド (未指定なら全商品共通 25)
}

const VERTICAL_STANDARD_RULE: ZakinRule = {
  defaultCount: 2, endMinMm: 50, maxSpanMm: 900, minLengthMm: 500,
};
const ANTOINE_RULE: ZakinRule = {
  defaultCount: 2, endMinMm: 250, maxSpanMm: 1450, minLengthMm: 1500,
  // L>2400 で座金 3 個に切替 (中央追加)
  addWasherAboveMm: 2400,
};
// Alexandre (31.8φ 太径) — 500〜3000mm フルレンジ、L>=2500 で 3 個に切替
const ALEXANDRE_RULE: ZakinRule = {
  defaultCount: 2, endMinMm: 50, maxSpanMm: 1500, minLengthMm: 500,
  addWasherAboveMm: 2499,
};

const PRODUCTS: Record<string, Product> = {
  rene:       { name: 'René ルネ',               type: '横型', basePrice: 36500, stdLengthMm: 1500, maxMm: 5000, finish: 'マットブラック', includedZakin: 3 },
  claire:     { name: 'Claire クレール',          type: '横型', basePrice: 42000, stdLengthMm: 1500, maxMm: 5000, finish: 'マットホワイト', includedZakin: 3 },
  emile:      { name: 'Émile エミール',           type: '横型', basePrice: 45800, stdLengthMm: 1500, maxMm: 5000, finish: '鎚目仕上げ 銀古美', includedZakin: 3 },
  marcel:     { name: 'Marcel マルセル',          type: '横型', basePrice: 36000, stdLengthMm: 1500, maxMm: 5000, finish: 'マットブラック', includedZakin: 3 },
  alexandre:  { name: 'Alexandre アレクサンドル', type: '縦型', basePrice: 32000, stdLengthMm: 1000, maxMm: 3000, finish: 'マットブラック', includedZakin: 3, zakinRule: ALEXANDRE_RULE, pricePerMm: 30 },
  catherine:  { name: 'Catherine カトリーヌ',     type: '縦型', basePrice: 34500, stdLengthMm: 1000, maxMm: 1500, finish: 'マットホワイト', includedZakin: 3, zakinRule: VERTICAL_STANDARD_RULE },
  claude:     { name: 'Claude クロード',          type: '縦型', basePrice: 30000, stdLengthMm: 1000, maxMm: 1500, finish: 'マットブラック', includedZakin: 3, zakinRule: VERTICAL_STANDARD_RULE },
  antoine:    { name: 'Antoine アントワーヌ',      type: '縦型ロング', basePrice: 45000, stdLengthMm: 1500, maxMm: 3000, finish: 'マットブラック', includedZakin: 4, zakinRule: ANTOINE_RULE, pricePerMm: 30 },
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

function calcZakin(L_mm: number, rule?: ZakinRule): number {
  if (rule?.defaultCount !== undefined) {
    let count = rule.defaultCount;
    if (rule.addWasherAboveMm !== undefined && L_mm > rule.addWasherAboveMm) {
      count += 1;
    }
    return count;
  }
  if (L_mm <= 1050) return 2;
  const end = rule?.endMinMm ?? END_DIST_MM;
  const span = rule?.maxSpanMm ?? MAX_SPAN_MM;
  const inner = L_mm - 2 * end;
  return 1 + Math.ceil(inner / span);
}

function calcPrice(L_mm: number, prod: Product) {
  const pricePerMm = prod.pricePerMm ?? PRICE_PER_MM;
  const addon    = Math.max(0, L_mm - prod.stdLengthMm) * pricePerMm;
  const longM    = L_mm > SURGE_START_MM
                 ? Math.pow(SURGE_BASE, (L_mm - SURGE_START_MM) / SURGE_INTERVAL_MM)
                 : 1;
  const surcharge = L_mm > SURGE_START_MM ? addon * (longM - 1) : 0;
  const zakin     = calcZakin(L_mm, prod.zakinRule);
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

    // Scroll 16/19/22 のみ「右向き / 左向き」選択 (価格変更なし、表記のみ)
    // トップ画像サムネイルが左向きのため、既定値も「左向き」
    const hasOrientation = productKey.startsWith('scroll');
    const rawOrientation = String(body?.orientation || 'left').toLowerCase();
    const orientation: 'right' | 'left' = rawOrientation === 'right' ? 'right' : 'left';
    const orientationLabel = hasOrientation
      ? (orientation === 'left' ? '左向き' : '右向き')
      : '';

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
    // 旧コード互換: 単一 L (= 第一本目) と単一価格計算
    const L = lengths[0];
    const p = calcPrice(L, prod);
    // 多本注文判定
    const isMultiOrder = lengths.length > 1;
    // per-item 計算 (line items 構築・metadata 用)
    const perItem = lengths.map(itemL => ({ L: itemL, ...calcPrice(itemL, prod) }));
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
          description: `座金${gp.zakin}個 / ${deliveryDesc}`,
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
