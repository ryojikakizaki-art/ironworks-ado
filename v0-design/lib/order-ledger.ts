/**
 * 受注台帳（Google スプレッドシート）への共通書き込み処理。
 *
 * 受注台帳は 3 チャネルから書き込まれる:
 *   - Stripe 決済（ado サイト）  … app/api/webhook/route.ts（独自実装・このファイルは未使用）
 *   - STORES ネットショップ       … app/api/stores-order/route.ts
 *   - 現地施工・現金など手動受注  … app/api/manual-order/route.ts
 *
 * STORES と手動受注のエンドポイントはこの writeOrderRow を共有する。
 * webhook は本番稼働中のため触らず独自実装のまま残している。
 *
 * 列順 A〜L: 受注日 / 区分 / 顧客名 / 都道府県 / 住所 / メール / 電話 / 商品 / 仕様 / 金額 / 注文番号 / メモ
 */

/**
 * 受注台帳スプレッドシートの ID。
 * 通常は env `ORDER_LEDGER_SHEET_ID` で渡すが、Vercel 環境変数の手入力ミスで
 * 度々壊れたため、確定値をコード内の既定値として持つ。Sheet ID は資格情報ではなく
 *（アクセス可否はサービスアカウント鍵で制御）固定値で問題ない。
 * env が正しく設定されていればそちらを優先する。
 */
export const LEDGER_SHEET_ID =
  process.env.ORDER_LEDGER_SHEET_ID || '1-8yr9fW-JDtS_FpCicoZ5-xDD2Y9Bwro4hhovPvRFJc';

/**
 * 受注台帳「シート1」のヘッダー直下（2 行目）に 1 行挿入する。
 * 新しい注文ほど上に来るよう、末尾追記ではなく 2 行目への挿入にしている。
 * K 列（注文番号）に同じ orderKey が既にあれば 'duplicate' を返し、二重計上を防ぐ。
 *
 * @param orderKey K 列に入れる一意の注文番号（重複判定キー）
 * @param row      A〜L の 12 要素の文字列配列
 */
export async function writeOrderRow(
  orderKey: string,
  row: string[],
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

  // K 列（注文番号）を読み、既出ならスキップ。
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'K:K',
  });
  const known = (existing.data.values || []).some((r) => String(r[0] || '') === orderKey);
  if (known) return 'duplicate';

  // ヘッダー直下に空行を 1 行挿入 = 新しい注文を常に一番上に。
  // sheetId 0 = 先頭シート（受注台帳本体「シート1」）。集計タブは別 sheetId なので影響しない。
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [{
        insertDimension: {
          range: { sheetId: 0, dimension: 'ROWS', startIndex: 1, endIndex: 2 },
          inheritFromBefore: false,
        },
      }],
    },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: 'A2:L2',
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
  return 'created';
}
