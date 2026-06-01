import { NextResponse } from 'next/server';
import { LEDGER_SHEET_ID } from '@/lib/order-ledger';

export const runtime = 'nodejs';

/**
 * 受注台帳から「未発送（O列「対応状況」が空 / FALSE）」の一覧を返す。
 * /admin/orders 一覧ページが使う。
 *
 * 認証は middleware.ts の Basic 認証で済むためここでは追加チェックしない。
 * 認証ヘッダーは middleware を通った時点で確定している。
 *
 * 返却: 受注台帳の row index（シート上の行番号・2 始まり）と
 *      納品書発行に必要な情報の組。納品書ページは row index で同行を再取得する。
 */

export type AdminOrderRow = {
  row: number;            // シート行番号（2 始まり）
  date: string;           // A 受注日
  channel: string;        // B 区分
  customer: string;       // C 顧客名
  prefecture: string;     // D 都道府県
  product: string;        // H 商品
  spec: string;           // I 仕様
  totalYen: number;       // J 税込合計
  orderRef: string;       // K 注文番号
  status: string;         // O 対応状況（空 = 未対応）
};

function parseYen(v: unknown): number {
  const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export async function GET() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    return NextResponse.json({ ok: false, error: 'ledger not configured' }, { status: 503 });
  }

  try {
    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(keyJson),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: LEDGER_SHEET_ID,
      range: 'A2:O',
    });
    const rows = res.data.values || [];

    const isDone = (s: string): boolean => {
      const t = s.trim();
      return t !== '' && t.toUpperCase() !== 'FALSE';
    };

    const list: AdminOrderRow[] = rows
      .map((r, i): AdminOrderRow => ({
        row: i + 2,                                // 2 行目から始まる
        date: String(r[0] ?? ''),
        channel: String(r[1] ?? ''),
        customer: String(r[2] ?? ''),
        prefecture: String(r[3] ?? ''),
        product: String(r[7] ?? ''),
        spec: String(r[8] ?? ''),
        totalYen: parseYen(r[9]),
        orderRef: String(r[10] ?? ''),
        status: String(r[14] ?? ''),
      }))
      // 未対応のみ
      .filter((o) => !isDone(o.status))
      // 商品名と顧客名のどちらも空の行は捨てる（空行）
      .filter((o) => o.customer || o.product);

    return NextResponse.json(
      { ok: true, count: list.length, orders: list },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/orders] error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
