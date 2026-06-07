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
 * Vercel 環境変数 `ORDER_LEDGER_SHEET_ID` の手入力ミス（誤った値の混入）で
 * 受注記帳系が度々連鎖停止したため、env を一切参照せずコードに直書きする。
 * Sheet ID は資格情報ではなく（アクセス可否はサービスアカウント鍵で制御）、
 * 固定値で問題ない。シートを移設する場合のみこの定数を変更すること。
 */
export const LEDGER_SHEET_ID = '1-8yr9fW-JDtS_FpCicoZ5-xDD2Y9Bwro4hhovPvRFJc';

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
