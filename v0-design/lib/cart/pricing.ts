/**
 * カート（複数商品まとめ買い）の価格・送料計算の正本。
 *
 * カートページ（表示）・カード決済 `/api/checkout/cart`・銀行振込 `/api/bank-order`
 * の 3 経路がこの 1 関数を共有する。単品注文で価格が 3 箇所に分散して
 * ズレた事故（PR #347）を繰り返さないため、複製しないこと。
 *
 * 本体価格は単品注文と同じ `calcPrice`、送料は同じ `calcShipping` を呼ぶだけで、
 * カート専用の価格ルールは一切持たない（＝単品で買っても合わせ買いしても
 * 本体価格は変わらず、まとめ買いで安くなるのは同梱による送料のみ）。
 */

import { PRODUCTS, calcPrice, calcZakin, RUSH_RATE, type Product } from '@/lib/products/order-pricing'
import { calcShipping } from '@/lib/shipping/sagawa'
import { CART_MAX_QUANTITY, isCartEligible, minLengthFor, type CartItem } from './types'

export interface CartLine {
  item: CartItem
  product: Product
  /** 決済画面・メールに出す表示名（例: René ルネ 壁付け手すり 600mm） */
  label: string
  /** 1 本あたりの税込価格 */
  unitPrice: number
  /** unitPrice × quantity */
  lineTotal: number
  zakinCount: number
}

export interface CartPricing {
  lines: CartLine[]
  /** カート内の合計本数 */
  totalQuantity: number
  /** 本体合計（税込） */
  itemsSubtotal: number
  /** 特急割増（本体合計の 20%） */
  rushSurcharge: number
  /** 送料（税抜・佐川レート表） */
  shipping: number
  /** 送料消費税（10%） */
  shippingTax: number
  /** 請求総額 */
  total: number
  /** 梱包内訳の注記（例: 梱包1 (3本・最長 2400mm) ¥8,300 + 梱包2 …） */
  shippingNote: string
  shippingBundles: number
  /** 沖縄・3501mm 超などで送料を自動計算できない場合 true */
  shippingInquiry: boolean
  shippingInquiryReason?: string
}

/**
 * クライアントから届いた 1 行を、商品マスターの範囲内に丸めて正規化する。
 * サーバ側は必ずこれを通してから価格を計算し、クライアントの申告値を信用しない。
 * 対象外商品・不正な値は null を返す（呼び出し側で除外する）。
 */
export function sanitizeCartItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  const slug = String(r.product || '').toLowerCase()
  if (!isCartEligible(slug)) return null
  const prod = PRODUCTS[slug]

  const minL = minLengthFor(slug)
  const lengthMm = Math.max(minL, Math.min(prod.maxMm, Math.round(Number(r.lengthMm)) || prod.stdLengthMm))
  const quantity = Math.max(1, Math.min(CART_MAX_QUANTITY, Math.round(Number(r.quantity)) || 1))

  // 座金タイプ A/B は縦型 CAD 商品（zakinRule あり）のみ意味を持つ
  const washerType: 'A' | 'B' = String(r.washerType || 'A').toUpperCase() === 'B' ? 'B' : 'A'

  // 白仕上げは colorOptions を持つ商品のみ（+15%）
  const color: 'black' | 'white' =
    prod.colorOptions && String(r.color || 'black').toLowerCase() === 'white' ? 'white' : 'black'

  // 向き選択は Scroll のみ（価格には影響せず表記のみ）
  const hasOrientation = slug.startsWith('scroll')
  const orientation: 'left' | 'right' = String(r.orientation || 'left') === 'right' ? 'right' : 'left'

  // 座金位置・角度は 1 本注文でのみ商品ページから指定できる。
  // 2 本以上は本ごとに自動配置のため受け取らない（単品 checkout と同じ扱い）。
  const isSingle = quantity === 1
  const positions: number[] = isSingle && Array.isArray(r.positions)
    ? (r.positions as unknown[])
        .map((v) => Math.round(Number(v)))
        .filter((n) => Number.isFinite(n) && n >= 0 && n <= lengthMm)
    : []
  const zakinCustom = isSingle && r.zakinCustom === true && positions.length > 0
  const angleDeg = isSingle ? Math.max(0, Math.min(60, Math.round(Number(r.angleDeg)) || 0)) : 0
  const angleDir: 'left' | 'right' = String(r.angleDir || 'left') === 'right' ? 'right' : 'left'

  return {
    id: typeof r.id === 'string' && r.id ? r.id : `${slug}-${lengthMm}-${Date.now()}`,
    product: slug,
    lengthMm,
    quantity,
    washerType,
    ...(prod.colorOptions ? { color } : {}),
    ...(hasOrientation ? { orientation } : {}),
    ...(zakinCustom ? { positions, zakinCustom: true } : {}),
    ...(angleDeg > 0 ? { angleDeg, angleDir } : {}),
  }
}

/** カート配列をまるごと正規化し、合計本数が上限を超える分は切り捨てる。 */
export function sanitizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  const items: CartItem[] = []
  let qty = 0
  for (const entry of raw) {
    const item = sanitizeCartItem(entry)
    if (!item) continue
    const remaining = CART_MAX_QUANTITY - qty
    if (remaining <= 0) break
    if (item.quantity > remaining) item.quantity = remaining
    qty += item.quantity
    items.push(item)
  }
  return items
}

/** 1 本あたりの表示名。決済画面・メール・受注台帳で共有する。 */
export function cartLineLabel(item: CartItem, prod: Product): string {
  const orientation = item.orientation ? `（${item.orientation === 'left' ? '左向き' : '右向き'}）` : ''
  return `${prod.name} 壁付け手すり ${item.lengthMm}mm${orientation}`
}

/**
 * カートの合計金額を計算する。
 *
 * 送料は全商品の長さを 1 つの配列にまとめて `calcShipping` に渡す。
 * calcShipping は長い順に 3 本ずつ梱包し、梱包内の最長サイズでレートを決めるため、
 * 「2.4m 以内なら 3 本まで 1 梱包・最大サイズで送料が決まる」という運用と一致する。
 *
 * 横型・縦型は calcShipping 上で同一のレート決定式（長さ + 200mm）を使うので、
 * 混在した梱包でも商品タイプによる曖昧さは生じない。カートは PRODUCTS 15 商品
 * （すべて横型・縦型）に限定しているため 'yokogata' を代表として渡している。
 */
export function calcCartPricing(
  items: CartItem[],
  prefecture: string,
  rushDelivery: boolean,
): CartPricing {
  const lines: CartLine[] = items.map((item) => {
    const prod = PRODUCTS[item.product]
    const zakinCount = item.zakinCustom && item.positions?.length
      ? item.positions.length
      : calcZakin(item.lengthMm, prod.zakinRule)
    const p = calcPrice(item.lengthMm, prod, {
      zakinCount: item.zakinCustom && item.positions?.length ? item.positions.length : undefined,
      angleDeg: item.angleDeg,
      color: item.color,
    })
    const unitPrice = Math.round(p.total)
    return {
      item,
      product: prod,
      label: cartLineLabel(item, prod),
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      zakinCount,
    }
  })

  const totalQuantity = lines.reduce((s, l) => s + l.item.quantity, 0)
  const itemsSubtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const rushSurcharge = rushDelivery ? Math.round(itemsSubtotal * RUSH_RATE) : 0

  // 送料計算用に、数量分だけ長さを展開した配列を作る（3 本ごとの梱包判定に使う）
  const lengths: number[] = []
  for (const l of lines) {
    for (let i = 0; i < l.item.quantity; i++) lengths.push(l.item.lengthMm)
  }

  const shippingResult = calcShipping(lengths, prefecture, 'yokogata')
  const shipping = shippingResult.inquiry ? 0 : shippingResult.shipping
  const shippingTax = Math.round(shipping * 0.1)

  return {
    lines,
    totalQuantity,
    itemsSubtotal,
    rushSurcharge,
    shipping,
    shippingTax,
    total: itemsSubtotal + rushSurcharge + shipping + shippingTax,
    shippingNote: shippingResult.note,
    shippingBundles: shippingResult.bundles,
    shippingInquiry: shippingResult.inquiry,
    shippingInquiryReason: shippingResult.inquiryReason,
  }
}
