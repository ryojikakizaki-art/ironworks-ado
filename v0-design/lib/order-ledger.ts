/**
 * 受注台帳（Google スプレッドシート）への共通書き込み処理。
 *
 * 受注台帳は 4 チャネルから書き込まれる。いずれもこの writeOrderRow を共有する:
 *   - Stripe 決済（ado サイト）  … app/api/webhook/route.ts
 *   - 銀行振込（ado サイト）      … app/api/bank-order/route.ts
 *   - STORES ネットショップ       … app/api/stores-order/route.ts
 *   - 現地施工・現金など手動受注  … app/api/manual-order/route.ts
 *
 * webhook はかつて独自実装を持っていたが、リトライ・重複判定・失敗通知を
 * 共通化するため 2026-08 にこちらへ統合した（K 列の重複判定が入ったことで、
 * Stripe が同じイベントを再送しても台帳が二重計上されない）。
 *
 * 列順 A〜L: 受注日 / 区分 / 顧客名 / 都道府県 / 住所 / メール / 電話 / 商品 / 仕様 / 金額 / 注文番号 / メモ
 * M/N 列は商品カテゴリ自動分類（数式・触らない）、O 列は対応状況。
 * P/Q 列（任意）: 送料（税抜） / 送料消費税。納品書で商品代と送料を分けて表示するために
 * 2026-08 追加。送料が別建てでない受注（現地施工・現金など）は空欄のままでよい。
 */

import { notifyLedgerFailure, type LedgerStage } from './order-ledger-alert';

/**
 * 受注台帳スプレッドシートの ID。
 * Vercel 環境変数 `ORDER_LEDGER_SHEET_ID` の手入力ミス（誤った値の混入）で
 * 受注記帳系が度々連鎖停止したため、env を一切参照せずコードに直書きする。
 * Sheet ID は資格情報ではなく（アクセス可否はサービスアカウント鍵で制御）、
 * 固定値で問題ない。シートを移設する場合のみこの定数を変更すること。
 */
export const LEDGER_SHEET_ID = '1-8yr9fW-JDtS_FpCicoZ5-xDD2Y9Bwro4hhovPvRFJc';

/**
 * Google Sheets API の一過性エラーに対する再試行。
 *
 * 2026-08-18、Sheets API が `The service is currently unavailable`（503）を返し、
 * 加藤様の注文が台帳から丸ごと欠落した。メール・カレンダーは成功していたため
 * 誰も気づけなかった。同じ取りこぼしを防ぐため、一過性エラーだけを指数バック
 * オフで再試行する（恒久的なエラー = 権限不足・不正な範囲指定などは即座に諦める）。
 *
 * webhook は Vercel の関数実行時間の中で動くため、待ち時間は合計 3.2 秒までに抑える。
 */
const SHEETS_MAX_ATTEMPTS = 3;
const SHEETS_RETRY_DELAYS_MS = [800, 2400];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 再試行する価値のある一過性エラーか（503/429 等・ネットワーク断）。 */
function isTransientSheetsError(err: unknown): boolean {
  const e = err as { code?: number | string; status?: number; message?: string } | null;
  const code = Number(e?.code ?? e?.status);
  if ([429, 500, 502, 503, 504].includes(code)) return true;
  const msg = String(e?.message || '').toLowerCase();
  return /currently unavailable|backend error|internal error|rate limit|quota exceeded|timeout|timed out|econnreset|etimedout|eai_again|socket hang up/.test(msg);
}

/**
 * Sheets API 呼び出し 1 回分を再試行つきで実行する。
 *
 * 必ず「API 呼び出し 1 回ごと」に包むこと。行挿入と本文書き込みをまとめて
 * 再試行すると、挿入だけ成功していた場合に空行が二重に入る。
 */
async function withSheetsRetry<T>(label: string, op: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= SHEETS_MAX_ATTEMPTS; attempt++) {
    try {
      return await op();
    } catch (err) {
      lastErr = err;
      if (attempt === SHEETS_MAX_ATTEMPTS || !isTransientSheetsError(err)) break;
      const wait = SHEETS_RETRY_DELAYS_MS[attempt - 1];
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[order-ledger] ${label} 失敗 (${attempt}/${SHEETS_MAX_ATTEMPTS}): ${msg} — ${wait}ms 後に再試行`);
      await sleep(wait);
    }
  }
  throw lastErr;
}

/**
 * 受注台帳「シート1」のヘッダー直下（2 行目）に 1 行挿入する。
 * 新しい注文ほど上に来るよう、末尾追記ではなく 2 行目への挿入にしている。
 * K 列（注文番号）に同じ orderKey が既にあれば 'duplicate' を返し、二重計上を防ぐ。
 *
 * @param orderKey K 列に入れる一意の注文番号（重複判定キー）
 * @param row      A〜L の 12 要素の文字列配列
 * @param shipping 送料（税抜）・送料消費税（任意）。指定時は P/Q 列に書き込む。
 */
export async function writeOrderRow(
  orderKey: string,
  row: string[],
  shipping?: { yen: number; taxYen: number },
  channel = '受注',
): Promise<'created' | 'duplicate'> {
  const sheetId = LEDGER_SHEET_ID;
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    throw new Error('Order ledger not configured (GOOGLE_SERVICE_ACCOUNT_KEY)');
  }

  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(keyJson),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // どの段階で落ちたかを通知メールに載せる（空行が残るのは行挿入より後で落ちた場合だけ）。
  let stage: LedgerStage = '重複チェック';
  try {
    // K 列（注文番号）を読み、既出ならスキップ。
    const existing = await withSheetsRetry('K列の重複チェック', () =>
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'K:K',
      }));
    const known = (existing.data.values || []).some((r) => String(r[0] || '') === orderKey);
    if (known) return 'duplicate';

    // ヘッダー直下に空行を 1 行挿入 = 新しい注文を常に一番上に。
    // sheetId 0 = 先頭シート（受注台帳本体「シート1」）。集計タブは別 sheetId なので影響しない。
    stage = '行挿入';
    await withSheetsRetry('2行目への行挿入', () =>
      sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{
            insertDimension: {
              range: { sheetId: 0, dimension: 'ROWS', startIndex: 1, endIndex: 2 },
              inheritFromBefore: false,
            },
          }],
        },
      }));

    stage = '本文書き込み';
    await withSheetsRetry('A2:L2 の書き込み', () =>
      sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'A2:L2',
        valueInputOption: 'RAW',
        requestBody: { values: [row] },
      }));

    // P/Q 列（送料税抜・送料消費税）は M〜O 列（数式・対応状況）を挟むため別リクエストで書く。
    if (shipping && (shipping.yen > 0 || shipping.taxYen > 0)) {
      stage = '送料書き込み';
      await withSheetsRetry('P2:Q2 の書き込み', () =>
        sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: 'P2:Q2',
          valueInputOption: 'RAW',
          requestBody: { values: [[String(Math.round(shipping.yen)), String(Math.round(shipping.taxYen))]] },
        }));
    }
  } catch (err) {
    // リトライを尽くしても書けなかった = 注文が台帳から消える。必ず工房へ通知する。
    await notifyLedgerFailure({ channel, orderKey, row, shipping, stage, error: err });
    throw err;
  }
  return 'created';
}

/**
 * 受注台帳の指定行の O 列（対応状況）に値を書き込む。
 * 発送・取付が済んだ注文を「対応済み」にするための更新処理。
 *
 * O 列に空でない文字列が入ると、/api/admin/orders（未発送一覧）と
 * /api/order-summary（対応中の受注 = Übersicht ウィジェット）の双方が
 * その行を「対応中」から除外する（判定: 空 / FALSE 以外なら対応済み）。
 *
 * @param row    シート上の行番号（2 始まり・受注台帳本体「シート1」の行）
 * @param status O 列に書き込む文字列（例: '発送 2026/05/31'）
 */
export async function updateOrderStatus(row: number, status: string): Promise<void> {
  if (!Number.isInteger(row) || row < 2) {
    throw new Error('row must be an integer >= 2');
  }
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    throw new Error('Order ledger not configured (GOOGLE_SERVICE_ACCOUNT_KEY)');
  }

  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(keyJson),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // O 列の該当 1 セルだけを更新する（他列・他行には触れない）。
  await sheets.spreadsheets.values.update({
    spreadsheetId: LEDGER_SHEET_ID,
    range: `O${row}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[status]] },
  });
}

/**
 * 受注台帳の指定行の L 列（メモ）を書き換える。
 * 銀行振込の「入金待ち」→「入金確認 YYYY/MM/DD」更新（Phase 2 の入金確認ボタン）で使う。
 * L 列の該当 1 セルだけを更新し、他列・他行・数式列（M/N）には触れない。
 *
 * @param row  シート上の行番号（2 始まり）
 * @param note L 列に書き込む文字列
 */
export async function updateOrderNote(row: number, note: string): Promise<void> {
  if (!Number.isInteger(row) || row < 2) {
    throw new Error('row must be an integer >= 2');
  }
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    throw new Error('Order ledger not configured (GOOGLE_SERVICE_ACCOUNT_KEY)');
  }

  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(keyJson),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.update({
    spreadsheetId: LEDGER_SHEET_ID,
    range: `L${row}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[note]] },
  });
}
