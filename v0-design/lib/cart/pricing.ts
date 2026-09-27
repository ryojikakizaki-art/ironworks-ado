/**
 * カート（複数商品まとめ買い）の価格・送料計算の正本。
 *
 * カートページ（表示）・カード決済 `/api/checkout/cart`・銀行振込 `/api/bank-order`
 * の 3 経路がこの 1 関数を共有する。単品注文で価格が 3 箇所に分散して
 * ズレた事故（PR #347）を繰り返さないため、複製しないこと。
 *
 * 本体価格は単品と同じ計算式を呼ぶだけで、カート専用の価格ルールは一切持たない
 * （＝単品で買っても合わせ買いしても本体価格は変わらず、まとめ買いで安くなるのは
 * 同梱による送料のみ）。
 *  - 壁付け手すり（PRODUCTS）: `calcPrice` / 送料 `calcShipping`
 *  - Clémence: `BASE_PRICE + calcExtensionPrice` / 送料 `calcClemenceShipping`
 */

import { PRODUCTS, calcPrice, calcZakin, RUSH_RATE, GASTON_CRATE_FEE_PER_UNIT, type Product } from '@/lib/products/order-pricing'
import { calcShipping, calcClemenceShipping } from '@/lib/shipping/sagawa'
import {
  BASE_PRICE as CLEMENCE_BASE_PRICE,
  EXTENSION_MAX_MM as CLEMENCE_EXTENSION_MAX_MM,
  W_STANDARD_MIN as CLEMENCE_W_MIN,
  W_MAX as CLEMENCE_W_MAX,
  H_MIN as CLEMENCE_H_MIN,
  H_MAX as CLEMENCE_H_MAX,
  calcExtensionPrice as calcClemenceExtensionPrice,
} from '@/lib/drawing-modal/clemence-svg'
import {
  CART_MAX_QUANTITY,
  CLEMENCE_DISPLAY,
  isCartEligible,
  isClemenceSlug,
  minLengthFor,
  type CartItem,
} from './types'

export interface CartLine {
  item: CartItem
  /** 壁付け手すり（PRODUCTS）のマスター。Clémence は PRODUCTS に無いため undefined */
  product?: Product
  /** 決済画面・メールに出す表示名（例: René ルネ 壁付け手すり 600mm） */
  label: string
  /** 商品名のみ（例: René ルネ / Clémence クレマンス） */
  titleLabel: string
  /** 寸法など品目の内訳（例: 壁付け手すり 600mm / L型トイレ手すり W950×H250mm） */
  variantLabel: string
  /** 座金・仕上げ等の仕様要約。決済画面の description・カート明細・受注台帳で共有する */
  specLabel: string
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

const clampInt = (v: unknown, lo: number, hi: number) =>
  Math.min(Math.max(Math.round(Number(v)) || lo, lo), hi)

/**
 * Clémence の 1 行を正規化する。
 * 寸法・ブラケット位置のクランプ範囲は単品フロー（/api/checkout/simple の
 * createClemenceCheckoutSession・components/clemence-spec-panel.tsx）と同一の
 * lib/drawing-modal/clemence-svg.ts の定数を使い、クライアントの申告値を信用しない。
 * 数量は固定 1（L型固定梱包のため 2 台を 1 箱にまとめられるか未確定・types.ts 参照）。
 */
function sanitizeClemenceItem(r: Record<string, unknown>): CartItem {
  const raw = (r.clemence && typeof r.clemence === 'object' ? r.clemence : r) as Record<string, unknown>
  const w = clampInt(raw.w, CLEMENCE_W_MIN, CLEMENCE_W_MAX)
  const h = clampInt(raw.h, CLEMENCE_H_MIN, CLEMENCE_H_MAX)
  const x2 = clampInt(raw.x2, 120, w - 170)
  const x3 = clampInt(raw.x3, x2 + 100, w - 70)
  const ext = clampInt(raw.ext, 0, CLEMENCE_EXTENSION_MAX_MM)
  return {
    id: typeof r.id === 'string' && r.id ? r.id : `clemence-${w}x${h}-${Date.now()}`,
    product: 'clemence',
    // 以下 2 つは壁付け手すり用の項目。Clémence では使わないため既定値を入れる
    lengthMm: 0,
    washerType: 'A',
    quantity: 1,
    clemence: { w, h, x2, x3, ext },
  }
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
  if (isClemenceSlug(slug)) return sanitizeClemenceItem(r)
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
  // zakinCustomizable === false の商品（Gaston）は申告値を無視し常に自動配置にする
  // （商品ページの編集 UI 自体を非表示にしているが、直接 API を叩かれた場合の防御も兼ねる）。
  const isSingle = quantity === 1 && prod.zakinCustomizable !== false
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

/**
 * カート配列をまるごと正規化し、合計本数が上限を超える分は切り捨てる。
 * Clémence は L型固定梱包のため 1 台までに絞る（2 台目以降は落とす）。
 */
export function sanitizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  const items: CartItem[] = []
  let qty = 0
  let hasClemence = false
  for (const entry of raw) {
    const item = sanitizeCartItem(entry)
    if (!item) continue
    if (isClemenceSlug(item.product)) {
      if (hasClemence) continue
      hasClemence = true
    }
    const remaining = CART_MAX_QUANTITY - qty
    if (remaining <= 0) break
    if (item.quantity > remaining) item.quantity = remaining
    qty += item.quantity
    items.push(item)
  }
  return items
}

/**
 * 壁付け手すりの仕様要約。決済画面の description・カート明細・受注台帳・受注メールで
 * この 1 つの文字列を共有する（以前は 4 箇所で別々に組み立てていて表記がズレていた）。
 */
export function railSpecLabel(opts: {
  zakinCount: number
  /** 座金 A/B タイプの選択がある商品か（縦型 CAD 商品のみ） */
  hasWasherType: boolean
  washerType: 'A' | 'B'
  angleDeg?: number
  angleDir?: 'left' | 'right'
  finish: string
}): string {
  const washer = opts.hasWasherType ? `（${opts.washerType}タイプ）` : ''
  const angle = opts.angleDeg
    ? ` / 角度加工 ${opts.angleDir === 'right' ? '右' : '左'}${opts.angleDeg}°`
    : ''
  return `座金${opts.zakinCount}個${washer}${angle} / ${opts.finish}`
}

/** Clémence の仕様要約（ブラケット位置・延長・仕上げ）。 */
export function clemenceSpecLabel(spec: { x2: number; x3: number; ext: number }): string {
  const ext = spec.ext > 0 ? ` / ③側延長 +${spec.ext}mm` : ''
  return `②${spec.x2}mm / ③${spec.x3}mm${ext} / ${CLEMENCE_DISPLAY.finish}`
}

/** 1 本あたりの表示名。決済画面・メール・受注台帳で共有する。 */
export function cartLineLabel(item: CartItem, prod: Product): string {
  const orientation = item.orientation ? `（${item.orientation === 'left' ? '左向き' : '右向き'}）` : ''
  return `${prod.name} 壁付け手すり ${item.lengthMm}mm${orientation}`
}

/** Clémence の 1 台あたり表示名。 */
export function clemenceLineLabel(spec: { w: number; h: number }): string {
  return `${CLEMENCE_DISPLAY.name} ${CLEMENCE_DISPLAY.variant} W${spec.w}×H${spec.h}mm`
}

/** Clémence 1 台の本体価格（税込・延長オプション込み）。 */
export function clemenceUnitPrice(spec: { ext: number }): number {
  return CLEMENCE_BASE_PRICE + calcClemenceExtensionPrice(spec.ext)
}

/** Clémence の行を CartLine に変換する。 */
function buildClemenceLine(item: CartItem): CartLine {
  const spec = item.clemence ?? { w: CLEMENCE_W_MAX, h: CLEMENCE_H_MIN, x2: 120, x3: 220, ext: 0 }
  const unitPrice = clemenceUnitPrice(spec)
  return {
    item,
    label: clemenceLineLabel(spec),
    titleLabel: CLEMENCE_DISPLAY.name,
    variantLabel: `${CLEMENCE_DISPLAY.variant} W${spec.w}×H${spec.h}mm`,
    specLabel: clemenceSpecLabel(spec),
    unitPrice,
    lineTotal: unitPrice * item.quantity,
    zakinCount: 0,
  }
}

/**
 * カートの合計金額を計算する。
 *
 * 壁付け手すりの送料は全商品の長さを 1 つの配列にまとめて `calcShipping` に渡す。
 * calcShipping は長い順に 3 本ずつ梱包し、梱包内の最長サイズでレートを決めるため、
 * 「2.4m 以内なら 3 本まで 1 梱包・最大サイズで送料が決まる」という運用と一致する。
 *
 * 横型・縦型は calcShipping 上で同一のレート決定式（長さ + 200mm）を使うので、
 * 混在した梱包でも商品タイプによる曖昧さは生じない。壁付け手すりはすべて横型・縦型
 * なので 'yokogata' を代表として渡している。
 *
 * Clémence は L 型に固定梱包される商品で手すりと同梱できないため、
 * `calcClemenceShipping`（160/170 サイズ固定）の 1 梱包分を別に加算する。
 * そのため Clémence を合わせ買いしても送料は安くならず、まとめ買いの利点は
 * 「1 回の決済で済む」点のみになる。
 */
export function calcCartPricing(
  items: CartItem[],
  prefecture: string,
  rushDelivery: boolean,
): CartPricing {
  const lines: CartLine[] = items.map((item) => {
    if (isClemenceSlug(item.product)) return buildClemenceLine(item)
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
    const orientation = item.orientation ? `（${item.orientation === 'left' ? '左向き' : '右向き'}）` : ''
    return {
      item,
      product: prod,
      label: cartLineLabel(item, prod),
      titleLabel: prod.name,
      variantLabel: `壁付け手すり ${item.lengthMm}mm${orientation}`,
      specLabel: railSpecLabel({
        zakinCount,
        hasWasherType: !!prod.zakinRule,
        washerType: item.washerType,
        angleDeg: item.angleDeg,
        angleDir: item.angleDir,
        finish: item.color === 'white' ? 'マットホワイト' : prod.finish,
      }),
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      zakinCount,
    }
  })

  const totalQuantity = lines.reduce((s, l) => s + l.item.quantity, 0)
  const itemsSubtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const rushSurcharge = rushDelivery ? Math.round(itemsSubtotal * RUSH_RATE) : 0

  const railLines = lines.filter((l) => !isClemenceSlug(l.item.product))
  const clemenceLine = lines.find((l) => isClemenceSlug(l.item.product))

  // 送料計算用に、数量分だけ長さを展開した配列を作る（3 本ごとの梱包判定に使う）
  const lengths: number[] = []
  for (const l of railLines) {
    for (let i = 0; i < l.item.quantity; i++) lengths.push(l.item.lengthMm)
  }

  const railResult = lengths.length > 0 ? calcShipping(lengths, prefecture, 'yokogata') : null
  const clemenceResult = clemenceLine
    ? calcClemenceShipping(prefecture, clemenceLine.item.clemence?.ext ?? 0)
    : null

  // Gaston（極太32φ）は木枠梱包が必要なため、本数分の定額を送料に加算する
  // （2026-08-02 蠣﨑さん指定）。配送先未選択・要問い合わせ時は送料自体が確定しないため
  // 加算しない（手動見積もりに含める）。
  const inquiry = !!railResult?.inquiry || !!clemenceResult?.inquiry
  const gastonCrateFee = inquiry || !prefecture
    ? 0
    : railLines.reduce((s, l) => s + (l.item.product === 'gaston' ? l.item.quantity * GASTON_CRATE_FEE_PER_UNIT : 0), 0)
  const shipping = inquiry
    ? 0
    : (railResult?.shipping ?? 0) + (clemenceResult?.shipping ?? 0) + gastonCrateFee
  const shippingTax = Math.round(shipping * 0.1)

  // 注記は「手すりの梱包内訳」＋「Clémence の固定梱包」を並べる。
  // 都道府県未選択時は両方が同じ案内文を返すため重複させない。
  // 要問合せ時は calcShipping と同じく空にする（画面は inquiryReason を出す）。
  const noteParts = [
    railResult?.note,
    clemenceResult?.note ? `${CLEMENCE_DISPLAY.name}: ${clemenceResult.note}` : '',
  ].filter((n): n is string => !!n)
  const shippingNote = inquiry
    ? ''
    : !prefecture
      ? '配送先都道府県を選択してください'
      : noteParts.join(' ／ ')

  return {
    lines,
    totalQuantity,
    itemsSubtotal,
    rushSurcharge,
    shipping,
    shippingTax,
    total: itemsSubtotal + rushSurcharge + shipping + shippingTax,
    shippingNote,
    shippingBundles: (railResult?.bundles ?? 0) + (clemenceResult?.bundles ?? 0),
    shippingInquiry: inquiry,
    shippingInquiryReason: railResult?.inquiryReason ?? clemenceResult?.inquiryReason,
  }
}
