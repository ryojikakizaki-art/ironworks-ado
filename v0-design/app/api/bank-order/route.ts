import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS, calcPrice, RUSH_RATE } from '@/lib/products/order-pricing';
// 階段手摺 Laurent の価格・寸法計算の正本（商品ページ・カード決済と共有）。
import { LAURENT, parseStairOrderBody } from '@/lib/products/stair-pricing';
import { calcShipping, type ProductType } from '@/lib/shipping/sagawa';
import { writeOrderRow } from '@/lib/order-ledger';
import { BANK_ACCOUNT } from '@/lib/bank-account';

// googleapis（受注台帳）を使うため Node ランタイム固定。
export const runtime = 'nodejs';

/**
 * 銀行振込での注文受付エンドポイント（お客様が直接呼ぶ公開 API）。
 *
 * カード決済 /api/checkout と異なり Stripe を介さないため、価格は必ず
 * サーバ側で再計算する（クライアントが送ってきた金額は信用しない）。
 * 価格・座金の計算式は lib/products/order-pricing.ts を共有（カード決済と同一）。
 *
 * 処理: ①価格をサーバ再計算 → ②受注台帳に「銀行振込・入金待ち」で記帳
 *       → ③お客様へ振込先案内メール / 蠣﨑さんへ通知メール（Resend・ベストエフォート）
 *
 * 入金確認後の制作スケジュール登録は Phase 2（/admin/orders の「入金確認」ボタン）で行う。
 * このエンドポイントではカレンダー登録は行わない。
 */

type Body = {
  // 商品仕様（/api/checkout と同じ）
  product?: string;
  lengths?: unknown[];
  lengthMm?: number;
  quantity?: number;
  rushDelivery?: boolean;
  prefecture?: string;
  washerType?: string;
  color?: string;
  orientation?: string;
  positions?: unknown[];
  zakinCustom?: boolean;
  angleDeg?: number;
  angleDir?: string;
  // お客様情報
  customerName?: string;
  customerKana?: string;
  postalCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  preferredArrivalDate?: string;
  preferredTimeSlot?: string;
};

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function todayJST(): string {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

// 注文番号: BT-YYMMDD-XXXX（XXXX は英数字 4 桁）
function makeOrderRef(): string {
  const d = new Date();
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const ymd = jst.toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BT-${ymd}-${rand}`;
}

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 });
  }

  // ── お客様情報のバリデーション ──
  const customerName = String(body.customerName || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const address = String(body.address || '').trim();
  const prefecture = String(body.prefecture || '').trim();
  if (!customerName) return NextResponse.json({ ok: false, error: 'お名前をご入力ください' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ ok: false, error: 'メールアドレスの形式が正しくありません' }, { status: 400 });
  if (!phone) return NextResponse.json({ ok: false, error: 'お電話番号をご入力ください' }, { status: 400 });
  if (!prefecture) return NextResponse.json({ ok: false, error: '配送先都道府県を選択してください' }, { status: 400 });
  if (!address) return NextResponse.json({ ok: false, error: 'ご住所をご入力ください' }, { status: 400 });

  // ── 商品・価格のサーバ再計算（/api/checkout と同一ロジック）──
  const productKey = String(body.product || 'rene').toLowerCase();

  // 商品ラベル・仕様・合計は商品タイプごとの分岐で組み立てる（台帳・メールで共用）
  let productLabel: string;
  let specParts: string[];
  let totalYen: number;

  if (productKey === LAURENT.slug) {
    // Laurent（階段手摺・段数ベース価格）: 正本 lib/products/stair-pricing.ts で再計算。
    // 全長 3,500mm 超は parseStairOrderBody 側で inquiry エラーになる。
    const parsed = parseStairOrderBody(body as Record<string, unknown>);
    if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    const stairOrder = parsed.order;
    // 送料は実寸によらず常に最大サイズで計算（2026-07-05 蠣﨑さん指示・柱/横桟込みで大型のため）
    const stairShipping = calcShipping([LAURENT.shippingLengthMm], prefecture, 'yokogata');
    if (stairShipping.inquiry) {
      return NextResponse.json({
        ok: false,
        error: stairShipping.inquiryReason || '配送条件により別途お見積もりが必要です',
      }, { status: 400 });
    }
    const stairShippingTax = Math.round(stairShipping.shipping * 0.1);
    totalYen = stairOrder.price.total + stairShipping.shipping + stairShippingTax;
    productLabel = stairOrder.productLabel;
    specParts = [...stairOrder.specParts, `通常配送（${LAURENT.deliveryBusinessDays}営業日）`];
  } else {
  // ↓ 既存の壁付け手すりフロー（diff を最小にするためインデントは変えていない）
  const prod = PRODUCTS[productKey];
  if (!prod) return NextResponse.json({ ok: false, error: `不明な商品: ${productKey}` }, { status: 400 });

  const supportsWasher = !!prod.zakinRule;
  const washerType: 'A' | 'B' = String(body.washerType || 'A').toUpperCase() === 'B' ? 'B' : 'A';
  // 白仕上げ選択 — colorOptions を持つ商品のみ（2026-07-05 Alexandre 追加。合計 +15%）
  const supportsColor = !!prod.colorOptions;
  const color: 'black' | 'white' =
    supportsColor && String(body.color || 'black').toLowerCase() === 'white' ? 'white' : 'black';
  const finishLabel = supportsColor ? (color === 'white' ? 'マットホワイト' : 'マットブラック') : prod.finish;
  const hasOrientation = productKey.startsWith('scroll');
  const orientation: 'right' | 'left' = String(body.orientation || 'left').toLowerCase() === 'right' ? 'right' : 'left';
  const orientationLabel = hasOrientation ? (orientation === 'left' ? '左向き' : '右向き') : '';
  const minL = prod.zakinRule?.minLengthMm ?? 500;

  const rawLengths: number[] = Array.isArray(body.lengths) && body.lengths.length > 0
    ? body.lengths.map((v) => Math.max(minL, Math.min(prod.maxMm, Math.round(Number(v) || prod.stdLengthMm))))
    : (() => {
        const raw = body.lengthMm || prod.stdLengthMm;
        const L0 = Math.max(minL, Math.min(prod.maxMm, Math.round(Number(raw) || prod.stdLengthMm)));
        const qty0 = Math.max(1, Math.min(6, parseInt(String(body.quantity || 1), 10) || 1));
        return Array(qty0).fill(L0);
      })();

  if (rawLengths.length > 6) {
    return NextResponse.json({
      ok: false,
      error: '7本以上のご注文は請求書振込でお受けしております。お問い合わせフォームからご注文情報をお送りください。',
    }, { status: 400 });
  }

  const lengths = rawLengths;
  const L = lengths[0];
  const isMultiOrder = lengths.length > 1;

  // 座金カスタム・角度加工の追加料金（/api/checkout と同一）。単品注文時のみ適用。
  const customPositions: number[] = (!isMultiOrder && Array.isArray(body.positions))
    ? body.positions
        .map((v) => Math.round(Number(v)))
        .filter((n) => Number.isFinite(n) && n >= 0 && n <= L)
    : [];
  const zakinCustom = !isMultiOrder && body.zakinCustom === true;
  const drawAngleDeg = isMultiOrder ? 0 : Math.max(0, Math.min(60, Math.round(Number(body.angleDeg) || 0)));
  const priceOpts = {
    zakinCount: zakinCustom && customPositions.length > 0 ? customPositions.length : undefined,
    angleDeg: drawAngleDeg,
    color,
  };

  const perItem = lengths.map((itemL) => ({ L: itemL, ...calcPrice(itemL, prod, priceOpts) }));
  const itemsSubtotal = perItem.reduce((s, it) => s + Math.round(it.total), 0);

  const rushDelivery = !!body.rushDelivery;
  const rushSurcharge = rushDelivery ? Math.round(itemsSubtotal * RUSH_RATE) : 0;

  const productCategory: ProductType =
    prod.type.includes('横型') ? 'yokogata' : prod.type.includes('縦型') ? 'tategata' : 'fixed';
  const shippingResult = calcShipping(lengths, prefecture, productCategory);
  if (shippingResult.inquiry) {
    return NextResponse.json({
      ok: false,
      error: shippingResult.inquiryReason || '配送条件により別途お見積もりが必要です',
    }, { status: 400 });
  }
  const shippingYen = shippingResult.shipping;
  const shippingTaxYen = Math.round(shippingYen * 0.1);
  totalYen = itemsSubtotal + rushSurcharge + shippingYen + shippingTaxYen;

  // ── 表示用ラベル ──
  const lengthsLabel = lengths.length > 1
    ? `${lengths.length}本（${lengths.join('/')}mm）`
    : `${L}mm`;
  const zakinTotal = perItem.reduce((s, it) => s + it.zakin, 0);
  productLabel = `${prod.name} 壁付け手すり ${lengthsLabel}${orientationLabel ? `（${orientationLabel}）` : ''}`;
  specParts = [
    `座金${zakinTotal}個${supportsWasher ? `（${washerType}タイプ）` : ''}`,
    rushDelivery ? '特急配送' : '通常配送',
    finishLabel,
  ];
  } // ← 既存の壁付け手すりフローここまで
  const arrivalNote = body.preferredArrivalDate
    ? `到着希望 ${body.preferredArrivalDate} ${body.preferredTimeSlot || ''}`.trim()
    : '';

  const orderRef = makeOrderRef();
  const postalCode = String(body.postalCode || '').trim();
  const fullAddress = [postalCode ? `〒${postalCode}` : '', address].filter(Boolean).join(' ');

  // ── 受注台帳に記帳（最優先・失敗したら注文失敗として返す）──
  const row = [
    todayJST(),                                              // A 受注日
    '銀行振込',                                              // B 区分
    customerName,                                            // C 顧客名
    prefecture,                                              // D 都道府県
    fullAddress,                                             // E 住所
    email,                                                   // F メール
    phone,                                                   // G 電話
    productLabel,                                            // H 商品
    specParts.join(' / '),                                   // I 仕様
    String(totalYen),                                        // J 金額（税込）
    orderRef,                                                // K 注文番号
    ['入金待ち', arrivalNote, body.customerKana ? `フリガナ ${body.customerKana}` : '']
      .filter(Boolean).join(' / '),                          // L メモ
  ];

  try {
    const status = await writeOrderRow(orderRef, row);
    if (status === 'duplicate') {
      // 注文番号衝突（ほぼ起きない）。番号を採り直して 1 回だけ再試行。
      const retryRef = makeOrderRef();
      row[10] = retryRef;
      await writeOrderRow(retryRef, row);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[bank-order] Ledger error:', message);
    return NextResponse.json(
      { ok: false, error: 'ご注文の記録に失敗しました。お手数ですがお問い合わせください。' },
      { status: 500 },
    );
  }

  // ── メール送信（ベストエフォート: 失敗しても注文は成立扱い）──
  let emailSent = false;
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.CONTACT_FROM || 'IRONWORKS ado <onboarding@resend.dev>';
    const notifyTo = process.env.CONTACT_TO_EMAIL || 'ado@tantetuzest.com';
    if (!apiKey) throw new Error('RESEND_API_KEY not set');

    const accountRowsHtml = BANK_ACCOUNT.map(
      (f) => `<div class="row"><span class="label">${esc(f.label)}</span><span class="value"${f.emphasize ? ' style="font-size:18px;font-weight:700;"' : ''}>${esc(f.value)}</span></div>`,
    ).join('');

    const summaryHtml = `
<div class="row"><span class="label">ご注文番号</span><span class="value">${esc(orderRef)}</span></div>
<div class="row"><span class="label">商品</span><span class="value">${esc(productLabel)}</span></div>
<div class="row"><span class="label">仕様</span><span class="value">${esc(specParts.join(' / '))}</span></div>
<div class="row"><span class="label">お支払い金額</span><span class="value" style="font-size:18px;font-weight:700;">¥${totalYen.toLocaleString()}（税込・送料込）</span></div>`;

    const customerHtml = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>
body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f3f4f6;color:#333;margin:0;padding:0;}
.wrap{max-width:600px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;}
.header{background:#1a1612;color:#f5f5f5;padding:24px 32px;}
.header h1{font-size:13px;letter-spacing:0.3em;text-transform:uppercase;margin:0;font-weight:400;}
.header span{color:#b8860b;}.body{padding:32px;font-size:14px;line-height:1.9;color:#444;}
.body p{margin:0 0 16px;}.card{border:1px solid #e5e7eb;border-radius:6px;padding:8px 20px;margin:16px 0;}
.card.bank{border-left:3px solid #b8860b;}
.row{border-bottom:1px solid #f0ebe4;padding:10px 0;display:flex;gap:16px;}
.row:last-child{border-bottom:none;}.label{color:#888;font-size:12px;min-width:110px;}
.value{font-size:14px;color:#222;flex:1;}
.note{background:#f3f4f6;border-left:3px solid #b8860b;padding:14px 18px;font-size:13px;line-height:1.8;margin-top:8px;}
.footer{background:#1a1612;padding:18px 32px;text-align:center;}.footer p{font-size:11px;color:#888;margin:0;}</style>
</head><body><div class="wrap">
<div class="header"><h1>IRONWORKS <span>ado</span> — ご注文ありがとうございます</h1></div>
<div class="body">
<p>${esc(customerName)} 様</p>
<p>この度はご注文いただき誠にありがとうございます。下記の内容で「銀行振込でのご注文」を承りました。</p>
<div class="card">${summaryHtml}</div>
<p>恐れ入りますが、下記口座へ上記金額をお振込みください。</p>
<div class="card bank">${accountRowsHtml}</div>
<div class="note">・振込手数料はお客様のご負担となります。<br>・ご入金の確認が取れ次第、メールにてご連絡し、制作・発送の手配を開始いたします。<br>・本メールにお心当たりがない場合はお手数ですがご連絡ください。</div>
</div>
<div class="footer"><p>© IRONWORKS ado / 鍛鉄工房ZEST — ado@tantetuzest.com</p></div>
</div></body></html>`;

    const notifyHtml = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>
body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f3f4f6;color:#333;}
.wrap{max-width:600px;margin:24px auto;background:#fff;border:1px solid #e5e7eb;}
.header{background:#b8860b;color:#fff;padding:18px 28px;}.header h1{font-size:14px;margin:0;}
.body{padding:24px 28px;}.row{border-bottom:1px solid #eee;padding:9px 0;display:flex;gap:14px;}
.label{color:#888;font-size:12px;min-width:110px;}.value{font-size:14px;color:#222;flex:1;}</style>
</head><body><div class="wrap">
<div class="header"><h1>【銀行振込・入金待ち】新規注文 — ${esc(orderRef)}</h1></div>
<div class="body">
<div class="row"><span class="label">注文番号</span><span class="value">${esc(orderRef)}</span></div>
<div class="row"><span class="label">お客様</span><span class="value">${esc(customerName)}${body.customerKana ? `（${esc(body.customerKana)}）` : ''}</span></div>
<div class="row"><span class="label">商品</span><span class="value">${esc(productLabel)}</span></div>
<div class="row"><span class="label">仕様</span><span class="value">${esc(specParts.join(' / '))}</span></div>
<div class="row"><span class="label">金額</span><span class="value">¥${totalYen.toLocaleString()}（税込・送料込）</span></div>
<div class="row"><span class="label">送付先</span><span class="value">${esc(fullAddress)}</span></div>
<div class="row"><span class="label">電話</span><span class="value">${esc(phone)}</span></div>
<div class="row"><span class="label">メール</span><span class="value">${esc(email)}</span></div>
${arrivalNote ? `<div class="row"><span class="label">到着希望</span><span class="value">${esc(arrivalNote)}</span></div>` : ''}
<div class="row"><span class="label">状態</span><span class="value">入金待ち（受注台帳に記帳済み）</span></div>
</div></body></html>`;

    const send = (to: string, subject: string, html: string) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromAddress, to: [to], subject, html }),
      });

    const [rCustomer] = await Promise.all([
      send(email, `【IRONWORKS ado】ご注文を承りました（お振込みのご案内）${orderRef}`, customerHtml),
      send(notifyTo, `[銀行振込・入金待ち] ${customerName} 様 — ${orderRef}`, notifyHtml),
    ]);
    emailSent = rCustomer.ok;
  } catch (err) {
    console.error('[bank-order] Email error (注文は記帳済み):', err instanceof Error ? err.message : err);
  }

  console.log(`[bank-order] created ${orderRef} (${customerName}) ¥${totalYen} email=${emailSent}`);
  return NextResponse.json({
    ok: true,
    orderRef,
    totalYen,
    emailSent,
    summary: { productLabel, spec: specParts.join(' / ') },
  });
}
