/**
 * カート（複数商品まとめ買い）の型と共通ルール。
 *
 * 対象は「壁付け手すり」＝ lib/products/order-pricing.ts の PRODUCTS 15 商品のみ。
 * 階段手摺 Laurent（lib/products/stair-pricing.ts）と送料込みの簡易商品
 * （lib/products/simple.ts）は梱包・送料の前提が違うため対象外。
 */

import { PRODUCTS } from '@/lib/products/order-pricing'

/** カート 1 行。商品ページの注文ペイロードと同じ仕様項目を持つ。 */
export interface CartItem {
  /** 行の一意キー（削除・React key 用。価格には影響しない） */
  id: string
  /** PRODUCTS のキー（= 商品ページの slug） */
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
}

/**
 * カート全体の最大本数。
 * 7 本以上は既存の単品フローと同じく請求書振込へ誘導する
 * （lib/shipping/sagawa.ts の calcShipping も 7 本以上を要問合せとして扱う）。
 */
export const CART_MAX_QUANTITY = 6

/** カートに入れられる商品か（階段手摺・簡易商品を弾く） */
export function isCartEligible(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(PRODUCTS, slug)
}

/** 商品ごとの最小長さ。checkout/route.ts と同じ導出。 */
export function minLengthFor(slug: string): number {
  return PRODUCTS[slug]?.zakinRule?.minLengthMm ?? 500
}
