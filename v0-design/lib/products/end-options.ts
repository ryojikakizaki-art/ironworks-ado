/**
 * フラットバー手すりのエンド（先端）オプションの正本。
 *
 * 2026-11-05 蠣﨑さん指定。Marcel・Émile の左右の端に、それぞれ
 * 「なし（標準のまっすぐ）／フック／渦巻き／ループ」を選べる。
 *  - 価格は片側 1 か所あたり。税抜 ¥4,000 / ¥8,000 / ¥10,000 → サイトは税込表示で
 *    ¥4,400 / ¥8,800 / ¥11,000（他の価格と同じく税込で持つ）。
 *  - お客様が指定する長さは「エンドを含む全体の長さ」。価格表もその長さで引く。
 *  - 仕上げは本体と同じ（写真は形の見本）。
 *
 * 商品ページ（表示）・カート価格計算（lib/cart/pricing.ts → calcPrice）・
 * Stripe metadata・webhook・制作図がすべてこのファイルを参照する。
 * 価格を他の場所に複製しないこと（PR #347 の価格ズレ事故の再発防止）。
 */

export type EndOptionId = 'hook' | 'scroll' | 'loop'
/** 'none' = 標準のまっすぐな端（追加料金なし） */
export type EndChoice = EndOptionId | 'none'

export interface EndOption {
  id: EndOptionId
  /** 画面・メール・台帳に出す名前 */
  label: string
  /** 片側 1 か所あたりの税込価格 */
  price: number
  /** 形の見本写真（public/ 配下） */
  img: string
  /** metadata・共有 URL 用の 1 文字コード */
  code: 'h' | 's' | 'l'
}

export const END_OPTIONS: EndOption[] = [
  { id: 'hook', label: 'フック', price: 4400, img: '/images/products/flatbar-ends/hook.jpg', code: 'h' },
  { id: 'scroll', label: '渦巻き', price: 8800, img: '/images/products/flatbar-ends/scroll.jpg', code: 's' },
  { id: 'loop', label: 'ループ', price: 11000, img: '/images/products/flatbar-ends/loop.jpg', code: 'l' },
]

/** エンドを選べる商品（PRODUCTS / 商品ページの slug） */
export const END_OPTION_PRODUCTS = new Set(['marcel', 'emile'])

export function supportsEndOptions(slug: string): boolean {
  return END_OPTION_PRODUCTS.has(String(slug || '').toLowerCase())
}

export function getEndOption(id: unknown): EndOption | undefined {
  return END_OPTIONS.find((o) => o.id === id)
}

/** 申告値を正規化する。未知の値・対象外商品は 'none'。 */
export function sanitizeEndChoice(slug: string, raw: unknown): EndChoice {
  if (!supportsEndOptions(slug)) return 'none'
  return getEndOption(raw)?.id ?? 'none'
}

/** 片側の価格（なし = 0） */
export function endPrice(choice: EndChoice | undefined): number {
  return getEndOption(choice)?.price ?? 0
}

/** 左右合計の価格 */
export function endsTotal(left: EndChoice | undefined, right: EndChoice | undefined): number {
  return endPrice(left) + endPrice(right)
}

export function endLabel(choice: EndChoice | undefined): string {
  return getEndOption(choice)?.label ?? 'なし'
}

/** どちらかにエンドが付いているか */
export function hasEnds(left: EndChoice | undefined, right: EndChoice | undefined): boolean {
  return endPrice(left) > 0 || endPrice(right) > 0
}

/** 仕様要約・図面用の表記（例: 「エンド 左:渦巻き 右:なし」）。どちらも無ければ空文字。 */
export function endsSummary(left: EndChoice | undefined, right: EndChoice | undefined): string {
  if (!hasEnds(left, right)) return ''
  return `エンド 左:${endLabel(left)} 右:${endLabel(right)}`
}

export function encodeEndCode(choice: EndChoice | undefined): string | undefined {
  return getEndOption(choice)?.code
}

export function decodeEndCode(code: unknown): EndChoice {
  return END_OPTIONS.find((o) => o.code === code)?.id ?? 'none'
}
