/**
 * 「ado を知ったきっかけ」（お問い合わせ・業者様フォーム・カートで任意回答）。
 *
 * 広告の効果をお客様自身の回答で確かめるために置いている（2026-11 蠣﨑さん判断）。
 * GA4 / Google 広告では、スマホで広告を見て PC で買う・Safari で日数が空く、といった
 * 購入が追えないため。ショッピング広告と検索広告は見た目が違うので分けて聞く。
 */
export const REFERRAL_SOURCES = [
  { value: 'ad_shopping', label: 'Google 検索に出た、写真と価格つきの広告' },
  { value: 'ad_search', label: 'Google 検索の「スポンサー」と書かれた広告' },
  { value: 'search', label: 'Google・Yahoo! などの検索結果' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'ai', label: 'ChatGPT などの AI' },
  { value: 'referral', label: '知人・工務店などからの紹介' },
  { value: 'repeat', label: '以前に利用したことがある' },
  { value: 'other', label: 'その他' },
] as const

export type ReferralSource = (typeof REFERRAL_SOURCES)[number]['value']

/** 一覧にない値は捨てる（空 = 未回答） */
export function sanitizeReferralSource(v: unknown): ReferralSource | '' {
  const s = String(v ?? '')
  return REFERRAL_SOURCES.some((r) => r.value === s) ? (s as ReferralSource) : ''
}

/** メール・台帳に載せる表記。未回答は空文字 */
export function referralSourceLabel(v: unknown): string {
  const s = sanitizeReferralSource(v)
  return REFERRAL_SOURCES.find((r) => r.value === s)?.label ?? ''
}
