import { NextRequest, NextResponse } from 'next/server';
import { LEDGER_SHEET_ID } from '@/lib/order-ledger';

// googleapis を使うため Node ランタイム固定。
export const runtime = 'nodejs';

/**
 * 受注台帳から「受注状況」サマリを返す読み取り専用エンドポイント。
 *
 * デスクトップ常駐ウィジェット（Übersicht の ado-orders.jsx）が定期的に
 * 取得して、今月の受注額・件数・直近の受注一覧をデスクトップに表示する。
 *
 * 認証: ヘッダー `x-order-entry-secret` が env `ORDER_ENTRY_SECRET` と一致すること。
 *       顧客名・金額を含むため必ず認証する。
 * 台帳: webhook と同じ Sheet（env `ORDER_LEDGER_SHEET_ID`）の A2:L を読む。
 */

function parseYen(v: unknown): number {
  const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

// 受注台帳 A 列の日付（"2026/05/21" など）から年・月を取り出す。
function parseYM(dateStr: unknown): { y: number; m: number } | null {
  const m = String(dateStr ?? '').match(/(\d{4})\D(\d{1,2})/);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]) };
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

export async function GET(request: NextRequest) {
  const secret = process.env.ORDER_ENTRY_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'endpoint not configured' }, { status: 503 });
  }
  if (request.headers.get('x-order-entry-secret') !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const sheetId = LEDGER_SHEET_ID;
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
      spreadsheetId: sheetId,
      range: 'A2:L',
    });
    const rows = res.data.values || [];

    // JST の現在年月。
    const [jY, jM] = new Date()
      .toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' })
      .split('-')
      .map(Number);

    let monthCount = 0;
    let monthYen = 0;
    let yearCount = 0;
    let yearYen = 0;
    for (const r of rows) {
      const ym = parseYM(r[0]);
      if (!ym) continue;
      const yen = parseYen(r[9]);
      if (ym.y === jY) {
        yearCount += 1;
        yearYen += yen;
        if (ym.m === jM) {
          monthCount += 1;
          monthYen += yen;
        }
      }
    }

    // 受注台帳は新しい注文を 2 行目に挿入するため、先頭 8 行 = 直近の受注。
    const recent = rows.slice(0, 8).map((r) => ({
      date: String(r[0] ?? ''),
      channel: String(r[1] ?? ''),
      customer: String(r[2] ?? ''),
      product: truncate(String(r[7] ?? ''), 44),
      yen: parseYen(r[9]),
    }));

    return NextResponse.json(
      {
        ok: true,
        updated_at: new Date().toISOString(),
        this_month: { count: monthCount, total_yen: monthYen },
        this_year: { count: yearCount, total_yen: yearYen },
        recent,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[order-summary] error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
