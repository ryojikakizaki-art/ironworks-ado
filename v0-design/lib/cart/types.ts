/**
 * カート（複数商品まとめ買い）の型と共通ルール。
 *
 * 対象は 2 系統ある。
 *  1. 壁付け手すり（横型・縦型）＝ lib/products/order-pricing.ts の PRODUCTS 15 商品
 *  2. Clémence クレマンス（L型トイレ手すり）＝ lib/products/simple.ts の固定価格商品
 *
 * Clémence は「L型に固定梱包される」ため他の手すりと同梱できず、送料は専用の
 * calcClemenceShipping で 1 台分を別梱包として加算する（lib/cart/pricing.ts）。
 * 2 台以上を 1 箱にまとめられるかの実梱包データが無いため、カート内は 1 台までに
 * 制限している（2 台以上のご希望は請求書振込のお問い合わせへ）。
 *
 * 階段手摺 Laurent（lib/products/stair-pricing.ts）と Clémence 以外の簡易商品
 * （lib/products/simple.ts）は梱包・送料の前提が違うため対象外。
 */

import { PRODUCTS } from '@/lib/products/order-pricing'

/** Clémence の商品キー（PRODUCTS には存在しない） */
export const CLEMENCE_SLUG = 'clemence'

/**
 * Clémence の表示用ラベル。
 *
 * 商品マスターの正本は lib/products/simple.ts の SIMPLE_PRODUCTS['clemence']、
 * 価格の正本は lib/drawing-modal/clemence-svg.ts の BASE_PRICE。
 * ここに表示文字列だけを切り出しているのは、カートページ（/cart）のバンドルに
 * 1,400 行超の商品データ（simple.ts）を丸ごと引き込まないため。
 * 金額は一切持たない（持つと二重管理になる）。
 */
export const CLEMENCE_DISPLAY = {
  name: 'Clémence クレマンス',
  variant: 'L型トイレ手すり',
  finish: '無垢鉄 22φ・艶消し黒 古美仕上げ',
} as const

/** Clémence の寸法・ブラケット位置。単品フローの仕様パネルと同じ項目。 */
export interface ClemenceCartSpec {
  /** 全幅 mm */
  w: number
  /** 高さ mm */
  h: number
  /** ②ブラケット位置 mm */
  x2: number
  /** ③ブラケット位置 mm */
  x3: number
  /** ③側の延長 mm（0〜200・従量課金） */
  ext: number
}

/** カート 1 行。商品ページの注文ペイロードと同じ仕様項目を持つ。 */
export interface CartItem {
  /** 行の一意キー（削除・React key 用。価格には影響しない） */
  id: string
  /** PRODUCTS のキー（= 商品ページの slug）または 'clemence' */
  product: string
  lengthMm: number
  quantity: number
  washerType: 'A' | 'B'
  color?: 'black' | 'white'
  orientation?: 'left' | 'right'
  /** 座金位置（mm）。単品注文時のみ商品ページで指定できる */
  positions?: number[]
  /** 座金本数をお客様がカスタムしたか（課金対象） */
  zakinCustom?: boolean
  angleDeg?: number
  angleDir?: 'left' | 'right'
  /** Clémence のみ。上記 lengthMm / washerType は使わない */
  clemence?: ClemenceCartSpec
}

/**
 * カート全体の最大本数。
 * 7 本以上は既存の単品フローと同じく請求書振込へ誘導する
 * （lib/shipping/sagawa.ts の calcShipping も 7 本以上を要問合せとして扱う）。
 * Clémence も 1 本として数えるため、壁付け手すりは最大 5 本 + Clémence 1 台となる。
 */
export const CART_MAX_QUANTITY = 6

/** Clémence の行か（送料・表示の分岐に使う） */
export function isClemenceSlug(slug: string): boolean {
  return slug === CLEMENCE_SLUG
}

/** カートに入れられる商品か（階段手摺・Clémence 以外の簡易商品を弾く） */
export function isCartEligible(slug: string): boolean {
  if (isClemenceSlug(slug)) return true
  return Object.prototype.hasOwnProperty.call(PRODUCTS, slug)
}

/** 商品ごとの最小長さ。checkout/route.ts と同じ導出。 */
export function minLengthFor(slug: string): number {
  return PRODUCTS[slug]?.zakinRule?.minLengthMm ?? 500
}
