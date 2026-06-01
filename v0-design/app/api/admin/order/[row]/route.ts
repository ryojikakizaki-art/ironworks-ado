import { NextRequest, NextResponse } from 'next/server';
import { LEDGER_SHEET_ID } from '@/lib/order-ledger';

export const runtime = 'nodejs';

/**
 * 受注台帳の指定行の詳細を返す（納品書発行ページ用）。
 *
 * 認証は middleware.ts の Basic 認証で済むためここでは追加チェックしない。
 *
 * 入力: row（シート上の行番号・2 始まり）を URL パラメータで受ける。
 * 返却: A〜O 列の全データ + 税抜・税額の計算結果。
 *
 * 税の取り扱い:
 *   受注台帳 J 列は税込金額のみ保持。納品書では税抜・税10%を分けて表示するため、
 *   税込から逆算する（税込 ÷ 1.1 = 税抜・税抜 × 0.1 = 税）。
 *   Stripe 決済と整合させるため、税抜は四捨五入ではなく round (Math.round)。
 */

type OrderDetail = {
  row: number;
  orderDate: string;       // A 表示用文字列
  channel: string;         // B
  customer: string;        // C
  prefecture: string;      // D
  address: string;         // E
  email: string;           // F
  phone: string;           // G
  product: string;         // H
  spec: string;            // I
  totalYen: number;        // J（税込）
  subtotalYen: number;     // 計算: 税抜
  taxYen: number;          // 計算: 税10%
  orderRef: string;        // K
  note: string;            // L
  status: string;          // O
};

function parseYen(v: unknown): number {
  const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ row: string }> },
) {
  const { row: rowParam } = await context.params;
  const row = Number(rowParam);
  if (!Number.isInteger(row) || row < 2) {
    return NextResponse.json({ ok: false, error: 'row must be an integer >= 2' }, { status: 400 });
  }

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
      range: `A${row}:O${row}`,
    });
    const r = res.data.values?.[0];
    if (!r) {
      return NextResponse.json({ ok: false, error: `row ${row} is empty` }, { status: 404 });
    }

    const totalYen = parseYen(r[9]);
    // 税込 → 税抜・税10% 逆算。Math.round で円単位に丸め、合計が税込と必ず一致するよう税を差で求める
    const subtotalYen = Math.round(totalYen / 1.1);
    const taxYen = totalYen - subtotalYen;

    const detail: OrderDetail = {
      row,
      orderDate: String(r[0] ?? ''),
      channel: String(r[1] ?? ''),
      customer: String(r[2] ?? ''),
      prefecture: String(r[3] ?? ''),
      address: String(r[4] ?? ''),
      email: String(r[5] ?? ''),
      phone: String(r[6] ?? ''),
      product: String(r[7] ?? ''),
      spec: String(r[8] ?? ''),
      totalYen,
      subtotalYen,
      taxYen,
      orderRef: String(r[10] ?? ''),
      note: String(r[11] ?? ''),
      status: String(r[14] ?? ''),
    };

    return NextResponse.json(
      { ok: true, order: detail },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/order/:row] error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
