import { NextRequest, NextResponse } from 'next/server';
import { writeOrderRow } from '@/lib/order-ledger';

// googleapis を使うため Node ランタイム固定（webhook と同じ）
export const runtime = 'nodejs';

/**
 * STORES（ironworks-ado.stores.jp）の受注を受注台帳・Google カレンダーに連携するエンドポイント。
 *
 * STORES は別プラットフォームのため Stripe webhook を通らない。定期タスク
 * `ado-stores-order-sync` が STORES 受注メール（hello@stores.jp）をパースし、
 * このエンドポイントへ POST する。台帳書き込みに使うサービスアカウント鍵は
 * Vercel env にのみ存在し、ローカルからは触れない設計。
 *
 * 認証: ヘッダー `x-order-entry-secret` が env `ORDER_ENTRY_SECRET` と一致すること
 *（受注記帳系エンドポイント共通。/api/manual-order も同じ env を使う）。
 * 受注台帳: webhook と同じ Sheet（env `ORDER_LEDGER_SHEET_ID`）の 2 行目に挿入。
 * カレンダー: env `GOOGLE_CALENDAR_ID`（未設定ならスキップ）。
 *
 * 注意: STORES の受注メールには顧客の氏名・住所・電話・メールが含まれない
 *（STORES ダッシュボードのみ）。台帳の C〜G 列は空欄で記録し、L 列メモに
 * 「ダッシュボードで要確認」と明記する。
 */

type StoresItem = { name?: string; qty?: number; unit_yen?: number };

type StoresOrderPayload = {
  order_number?: string;
  order_datetime?: string; // ISO 8601。メール受信日時。
  items?: StoresItem[];
  subtotal_yen?: number;
  shipping_yen?: number;
  total_yen?: number;
  tax_yen?: number;
  note?: string; // 備考
  shop?: string;
};

// 受注日（台帳 A 列）: JST の YYYY/MM/DD。webhook と同じ書式。
function jstLedgerDate(iso: string | undefined): string {
  const d = iso ? new Date(iso) : new Date();
  const valid = !isNaN(d.getTime()) ? d : new Date();
  return valid.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// 終日カレンダーイベント用: JST の YYYY-MM-DD。
function jstCalendarDate(iso: string | undefined): string {
  const d = iso ? new Date(iso) : new Date();
  const valid = !isNaN(d.getTime()) ? d : new Date();
  return valid.toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' });
}

async function createCalendarEvent(summary: string, description: string, dateIso: string): Promise<void> {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!keyJson || !calendarId) {
    console.log('[stores-order] Google Calendar not configured, skipping');
    return;
  }

  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(keyJson),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.insert({
    calendarId,
    requestBody: {
      summary,
      description,
      start: { date: dateIso },
      end: { date: dateIso },
    },
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.ORDER_ENTRY_SECRET;
  if (!secret) {
    console.error('[stores-order] ORDER_ENTRY_SECRET not configured');
    return NextResponse.json({ ok: false, error: 'endpoint not configured' }, { status: 503 });
  }
  if (request.headers.get('x-order-entry-secret') !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let payload: StoresOrderPayload;
  try {
    payload = (await request.json()) as StoresOrderPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 });
  }

  const orderNumber = String(payload.order_number || '').trim();
  const items = Array.isArray(payload.items) ? payload.items : [];
  const totalYen = Number(payload.total_yen || 0);
  if (!orderNumber || items.length === 0 || !(totalYen > 0)) {
    return NextResponse.json(
      { ok: false, error: 'order_number, items, total_yen are required' },
      { status: 400 }
    );
  }

  const orderKey = `STORES-${orderNumber}`;
  const orderDate = jstLedgerDate(payload.order_datetime);
  const note = String(payload.note || '').replace(/\s*\n\s*/g, ' / ').trim();
  const shop = String(payload.shop || 'ironworks-ado.stores.jp').trim();

  const productCol = items
    .map((it) => {
      const name = String(it.name || '').trim();
      const qty = Number(it.qty) || 1;
      return qty > 1 ? `${name} ×${qty}` : name;
    })
    .join(' / ');

  const spec = [
    items.length > 1 ? `${items.length}点` : '',
    note ? `備考: ${note}` : '',
  ].filter(Boolean).join(' / ');

  const row = [
    orderDate,                                                   // A 受注日
    'STORES',                                                    // B 区分
    '',                                                          // C 顧客名（メール非掲載）
    '',                                                          // D 都道府県（同上）
    '',                                                          // E 住所（同上）
    '',                                                          // F メール（同上）
    '',                                                          // G 電話（同上）
    productCol,                                                  // H 商品
    spec,                                                        // I 仕様
    String(totalYen),                                            // J 金額
    orderKey,                                                    // K 注文番号
    `STORES（${shop}）／氏名・住所はダッシュボードで要確認`,        // L メモ
  ];

  let ledgerStatus: 'created' | 'duplicate';
  try {
    ledgerStatus = await writeOrderRow(orderKey, row, undefined, 'STORES');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stores-order] Ledger error:', message);
    return NextResponse.json({ ok: false, error: `ledger: ${message}` }, { status: 500 });
  }

  if (ledgerStatus === 'duplicate') {
    console.log('[stores-order] Skipped duplicate order', orderKey);
    return NextResponse.json({ ok: true, status: 'duplicate', order: orderKey });
  }

  // カレンダー登録は補助機能。失敗しても台帳追記済みなら成功として返す。
  try {
    const firstName = String(items[0]?.name || 'STORES受注').slice(0, 36);
    const summary = `【STORES受注】${firstName} ¥${totalYen.toLocaleString()}`;
    const description = [
      `STORES オーダー番号: ${orderNumber}`,
      ...items.map((it) => {
        const name = String(it.name || '').trim();
        const qty = Number(it.qty) || 1;
        const unit = Number(it.unit_yen || 0);
        return `・${name} × ${qty}（¥${unit.toLocaleString()}）`;
      }),
      `送料: ¥${Number(payload.shipping_yen || 0).toLocaleString()}`,
      `合計（税込）: ¥${totalYen.toLocaleString()}`,
      note ? `備考: ${note}` : '',
      '',
      '※発送先の氏名・住所は STORES ダッシュボード（dashboard.stores.jp）でご確認ください。',
    ].filter(Boolean).join('\n');
    await createCalendarEvent(summary, description, jstCalendarDate(payload.order_datetime));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stores-order] Calendar error:', message);
    return NextResponse.json({ ok: true, status: 'created', order: orderKey, calendar: `failed: ${message}` });
  }

  console.log('[stores-order] Ledger row + calendar event created for', orderKey);
  return NextResponse.json({ ok: true, status: 'created', order: orderKey });
}
