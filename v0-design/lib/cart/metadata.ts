/**
 * カート注文を Stripe の metadata に載せる／読み戻すためのエンコード。
 *
 * このサイトには DB が無く、注文の中身は Stripe metadata だけを頼りに
 * 受注メール・カレンダー・受注台帳へ引き継がれる。metadata は
 * 「1 セッションあたり 50 キー・1 値あたり 500 文字」の制限があるため、
 * 商品ごとの仕様を 1 つの巨大な JSON にせず `cart_item_1`〜`cart_item_6` に
 * 分けて格納する（1 行あたり実測 100 文字前後・上限まで十分な余裕がある）。
 *
 * キー名は短縮する（p=product, l=length, q=quantity …）。商品の表示名は
 * PRODUCTS から引けるので metadata には入れない。
 */

import { PRODUCTS } from '@/lib/products/order-pricing'
import type { CartPricing } from './pricing'

/** metadata に載せる 1 行分の短縮表現 */
interface EncodedLine {
  p: string
  l: number
  q: number
  z: number
  w: 'A' | 'B'
  c?: 'black' | 'white'
  o?: 'left' | 'right'
  a?: number
  ad?: 'left' | 'right'
  pos?: string
  y: number
}

export function encodeCartMetadata(pricing: CartPricing): Record<string, string> {
  const meta: Record<string, string> = {
    cart_lines: String(pricing.lines.length),
    cart_quantity: String(pricing.totalQuantity),
  }
  pricing.lines.forEach((line, i) => {
    const { item } = line
    const encoded: EncodedLine = {
      p: item.product,
      l: item.lengthMm,
      q: item.quantity,
      z: line.zakinCount,
      w: item.washerType,
      ...(item.color ? { c: item.color } : {}),
      ...(item.orientation ? { o: item.orientation } : {}),
      ...(item.angleDeg ? { a: item.angleDeg, ad: item.angleDir } : {}),
      ...(item.positions?.length ? { pos: item.positions.join(',') } : {}),
      y: line.unitPrice,
    }
    meta[`cart_item_${i + 1}`] = JSON.stringify(encoded)
  })
  return meta
}

/** webhook が受け取る 1 行分（表示に必要な値まで展開済み） */
export interface DecodedCartLine {
  product: string
  productName: string
  productType: string
  finish: string
  lengthMm: number
  quantity: number
  zakinCount: number
  washerType: 'A' | 'B'
  color?: 'black' | 'white'
  orientation?: 'left' | 'right'
  angleDeg?: number
  angleDir?: 'left' | 'right'
  positions?: number[]
  unitPrice: number
  lineTotal: number
  /** 座金 A/B タイプの選択がある商品か（縦型 CAD 商品のみ） */
  hasWasherType: boolean
  /** メール・カレンダー・台帳で共通に使う表示名 */
  label: string
}

/**
 * webhook 側で metadata からカート内容を読み戻す。
 * 壊れた行は黙って捨てず null を混ぜない（読めた行だけ返す）。
 * カート注文でない場合は空配列。
 */
export function decodeCartMetadata(meta: Record<string, string>): DecodedCartLine[] {
  const count = Math.max(0, Math.min(6, Number(meta.cart_lines || 0)))
  const lines: DecodedCartLine[] = []
  for (let i = 1; i <= count; i++) {
    const raw = meta[`cart_item_${i}`]
    if (!raw) continue
    let e: EncodedLine
    try {
      e = JSON.parse(raw) as EncodedLine
    } catch {
      continue
    }
    const prod = PRODUCTS[e.p]
    if (!prod) continue
    const quantity = Number(e.q) || 1
    const unitPrice = Number(e.y) || 0
    const orientationLabel = e.o ? `（${e.o === 'left' ? '左向き' : '右向き'}）` : ''
    lines.push({
      product: e.p,
      productName: prod.name,
      productType: prod.type,
      finish: e.c === 'white' ? 'マットホワイト' : prod.finish,
      lengthMm: Number(e.l) || 0,
      quantity,
      zakinCount: Number(e.z) || 0,
      washerType: e.w === 'B' ? 'B' : 'A',
      ...(e.c ? { color: e.c } : {}),
      ...(e.o ? { orientation: e.o } : {}),
      ...(e.a ? { angleDeg: Number(e.a), angleDir: e.ad === 'right' ? 'right' as const : 'left' as const } : {}),
      ...(e.pos ? { positions: e.pos.split(',').map(Number).filter(Number.isFinite) } : {}),
      unitPrice,
      lineTotal: unitPrice * quantity,
      hasWasherType: !!prod.zakinRule,
      label: `${prod.name} 壁付け手すり ${e.l}mm${orientationLabel}${quantity > 1 ? ` × ${quantity}本` : ''}`,
    })
  }
  return lines
}

/** メール件名・カレンダー・決済説明で使う短い要約（例: René ルネ … ほか2点） */
export function cartSummaryLabel(lines: DecodedCartLine[]): string {
  if (lines.length === 0) return 'ご注文商品'
  if (lines.length === 1) return lines[0].label
  return `${lines[0].label} ほか${lines.length - 1}点`
}
