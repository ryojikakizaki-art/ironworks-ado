/**
 * 振込先口座情報の正本。
 *
 * ⚠️ 蠣﨑さんが目視で正誤を確認すること（誤記は入金喪失に直結）。
 *
 * /bank-transfer ページ（components: bank-transfer-details.tsx）と
 * 銀行振込注文 API（app/api/bank-order/route.ts のメール本文）の双方が
 * この 1 箇所を参照する。口座を移設する場合はここだけ変更すれば全箇所に反映される。
 */

export interface BankAccountField {
  label: string;
  value: string;
  /** 口座番号など、画面で強調表示するフィールド */
  emphasize?: boolean;
}

export const BANK_ACCOUNT: BankAccountField[] = [
  { label: '銀行名', value: '楽天銀行' },
  { label: '支店名', value: 'ラテン支店' },
  { label: '口座種別', value: '普通預金' },
  { label: '口座番号', value: '5015300', emphasize: true },
  { label: '口座名義', value: 'タンテツコウボウゼスト　カキザキリョウジ' },
];

/** メール等のプレーンテキスト用に整形した口座情報 */
export const BANK_ACCOUNT_TEXT = BANK_ACCOUNT.map(
  (f) => `${f.label}: ${f.value}`,
).join('\n');
