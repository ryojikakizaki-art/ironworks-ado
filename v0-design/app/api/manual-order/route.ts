import { NextRequest, NextResponse } from 'next/server';
import { writeOrderRow } from '@/lib/order-ledger';

// googleapis を使うため Node ランタイム固定。
export const runtime = 'nodejs';

/**
 * 現地施工・現金・銀行振込など、Stripe 決済でも STORES でもない受注を
 * 受注台帳へ記帳するエンドポイント。
 *
 * 入力は Claude（PM）が担う。蠣﨑さんが見積書 PDF を渡すか口頭で受注を伝えると、
 * Claude が内容を読み取り名前付きフィールドに整理して、このエンドポイントへ POST する。
 * これにより使い捨ての node スクリプト実行が不要になる。
 *
 * 認証: ヘッダー `x-order-entry-secret` が env `ORDER_ENTRY_SECRET` と一致すること。
 *       同じ env を /api/stores-order も使う（受注記帳系で 1 本に統一）。
 * 台帳: webhook と同じ Sheet（env `ORDER_LEDGER_SHEET_ID`）の 2 行目に挿入。
 *
 * カレンダー登録はこのエンドポイントでは行わない。現地施工は記帳時点で
 * 完了済みのことが多いため。将来の制作予定が必要なら Claude が
 * カレンダー側で別途登録する。
 */

type ManualOrderPayload = {
  order_date?: string;     // A 受注日（YYYY-MM-DD / YYYY/MM/DD / ISO のいずれか）
  kubun?: string;          // B 区分（例: 現地施工 / 現金 / 銀行振込 / 個人 / 業者）
  customer_name?: string;  // C 顧客名
  prefecture?: string;     // D 都道府県
  address?: string;        // E 住所
  email?: string;          // F メール
  phone?: string;          // G 電話
  product?: string;        // H 商品
  spec?: string;           // I 仕様
  total_yen?: number;      // J 金額（税込）
  order_ref?: string;      // K 注文番号（一意。見積書番号など。重複判定キー）
  note?: string;           // L メモ
  shipping_yen?: number;   // P 送料（税抜・任意）。見積書に送料が別建てで明記されている場合のみ指定。
};

// 受注日を台帳の表記 YYYY/MM/DD に正規化する。
function toLedgerDate(input: string | undefined): string {
  const s = String(input || '').trim();
  const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) {
    return `${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')}`;
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
  // パースできなければ今日（JST）で記録する。
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.ORDER_ENTRY_SECRET;
  if (!secret) {
    console.error('[manual-order] ORDER_ENTRY_SECRET not configured');
    return NextResponse.json({ ok: false, error: 'endpoint not configured' }, { status: 503 });
  }
  if (request.headers.get('x-order-entry-secret') !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let payload: ManualOrderPayload;
  try {
    payload = (await request.json()) as ManualOrderPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 });
  }

  const customerName = String(payload.customer_name || '').trim();
  const product = String(payload.product || '').trim();
  const orderRef = String(payload.order_ref || '').trim();
  const totalYen = Number(payload.total_yen || 0);
  if (!customerName || !product || !orderRef || !(totalYen > 0)) {
    return NextResponse.json(
      { ok: false, error: 'customer_name, product, order_ref, total_yen are required' },
      { status: 400 }
    );
  }

  const row = [
    toLedgerDate(payload.order_date),          // A 受注日
    String(payload.kubun || '個人').trim(),     // B 区分
    customerName,                              // C 顧客名
    String(payload.prefecture || '').trim(),   // D 都道府県
    String(payload.address || '').trim(),      // E 住所
    String(payload.email || '').trim(),        // F メール
    String(payload.phone || '').trim(),        // G 電話
    product,                                   // H 商品
    String(payload.spec || '').trim(),         // I 仕様
    String(Math.round(totalYen)),              // J 金額
    orderRef,                                  // K 注文番号
    String(payload.note || '').trim(),         // L メモ
  ];

  const shippingYen = Number(payload.shipping_yen || 0);
  const shipping = shippingYen > 0 ? { yen: shippingYen, taxYen: Math.round(shippingYen * 0.1) } : undefined;

  let status: 'created' | 'duplicate';
  try {
    status = await writeOrderRow(orderRef, row, shipping);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[manual-order] Ledger error:', message);
    return NextResponse.json({ ok: false, error: `ledger: ${message}` }, { status: 500 });
  }

  console.log(`[manual-order] ${status} — ${orderRef} (${customerName})`);
  return NextResponse.json({ ok: true, status, order: orderRef });
}
