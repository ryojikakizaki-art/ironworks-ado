/**
 * 「広告から来た注文・問い合わせか」を自動で記録する。
 *
 * なぜ必要か（2026-11 蠣﨑さん判断）:
 *   「知ったきっかけ」欄を付けたところ、ショッピング広告から買ったお客様も
 *   「検索結果」「その他」と答えていた（広告が検索結果の一部に見えるため）。
 *   本人申告では広告の効果が測れないので、広告クリックの印から自動で判定する。
 *
 * 仕組み:
 *   - 広告クリックで着地した URL には gclid / gbraid / wbraid が付く → その日付をブラウザに保存
 *     （Googleショッピングの無料枠は srsltid が付く → 有料広告とは分けて保存）
 *   - 保存が無い場合は Google タグの _gcl_aw / _gcl_gb クッキーの時刻を使う
 *   - 注文・問い合わせ時に「google_ads:YYYY-MM-DD」の形で送り、工房メール・受注台帳に残す
 *   - クリック ID そのものは送らない（日付と種類だけ）
 */

export type AdClickType = 'google_ads' | 'google_free'

const STORAGE_KEY: Record<AdClickType, string> = {
  google_ads: 'ado-ad-click',
  google_free: 'ado-free-listing-click',
}

/** Google 広告のクリック計測期間に合わせる */
const WINDOW_DAYS = 90
const DAY_MS = 24 * 60 * 60 * 1000

function ymd(ms: number): string {
  // 日本時間の日付
  return new Date(ms + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function save(type: AdClickType, ms: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY[type], String(ms))
  } catch {}
}

function load(type: AdClickType): number | null {
  try {
    const ms = Number(window.localStorage.getItem(STORAGE_KEY[type]))
    return ms > 0 && Date.now() - ms < WINDOW_DAYS * DAY_MS ? ms : null
  } catch {
    return null
  }
}

/** Google タグのクッキー（値は "GCL.<秒>.<ID>"）からクリック時刻を読む */
function loadFromGclCookie(): number | null {
  if (typeof document === 'undefined') return null
  let latest: number | null = null
  for (const part of document.cookie.split(';')) {
    const [name, value] = part.trim().split('=')
    if (name !== '_gcl_aw' && name !== '_gcl_gb') continue
    const sec = Number((value || '').split('.')[1])
    if (sec > 0 && Date.now() - sec * 1000 < WINDOW_DAYS * DAY_MS) {
      latest = Math.max(latest ?? 0, sec * 1000)
    }
  }
  return latest
}

/** 着地時に呼ぶ。URL に広告クリックの印があれば日時を保存する */
export function captureAdClickFromUrl(search: string) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(search)
  if (params.has('gclid') || params.has('gbraid') || params.has('wbraid')) {
    save('google_ads', Date.now())
  } else if (params.has('srsltid')) {
    save('google_free', Date.now())
  }
}

/**
 * 注文・問い合わせに添える値。「google_ads:2026-11-18」など。該当なしは空文字。
 * 有料広告のクリックがあれば無料枠より優先する（広告の効果を測るのが目的のため）。
 */
export function getAdClickSummary(): string {
  if (typeof window === 'undefined') return ''
  const ads = load('google_ads') ?? loadFromGclCookie()
  if (ads) return `google_ads:${ymd(ads)}`
  const free = load('google_free')
  if (free) return `google_free:${ymd(free)}`
  return ''
}

/** サーバ側の検証。形が違う値は捨てる */
export function sanitizeAdClick(v: unknown): string {
  const s = String(v ?? '')
  return /^(google_ads|google_free):\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}

/** メール・台帳の表記。「Google 広告（11/18 クリック）」。該当なしは空文字 */
export function adClickLabel(v: unknown): string {
  const s = sanitizeAdClick(v)
  if (!s) return ''
  const [type, date] = s.split(':')
  const [, m, d] = date.split('-')
  const when = `${Number(m)}/${Number(d)}`
  return type === 'google_ads'
    ? `Google 広告（${when} クリック）`
    : `Google ショッピング無料枠（${when}）`
}
