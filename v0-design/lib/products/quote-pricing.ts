// 参考見積もり用 価格計算 (商品ページ / checkout API と完全一致するロジック)
//
// /trade の参考見積もり計算機で使う。
// app/api/checkout/route.ts の calcPrice と同じ式で計算するため、
// 商品ページ・本番決済・参考見積もりの 3 ヶ所で価格が常に一致する。
//
// 対応商品: DRAWING_PRODUCTS に登録された 13 商品 (横型4 + 縦型4 + 固定長5)。
// Élisabeth / Clémence は DRAWING_PRODUCTS に未登録のため getQuotePrice は null を返す
// → 呼び出し側で「個別お見積もり」表示にすること。

import { DRAWING_PRODUCTS, lookupPriceFromTable } from "@/lib/drawing-modal/products"
import type { ZakinRule } from "@/lib/drawing-modal/rene-constants"

const PRICE_PER_MM = 25
const ZAKIN_PRICE = 3500
const END_DIST_MM = 100
const MAX_SPAN_MM = 850
const SURGE_START_MM = 2000
const SURGE_BASE = 1.2
const SURGE_INTERVAL_MM = 500

function calcZakin(L_mm: number, rule?: ZakinRule): number {
  if (rule?.defaultCount !== undefined) {
    let count = rule.defaultCount
    if (rule.addWasherAboveMm !== undefined && L_mm > rule.addWasherAboveMm) {
      count += 1
    }
    return count
  }
  if (L_mm <= 1050) return 2
  const end = rule?.endMinMm ?? END_DIST_MM
  const span = rule?.maxSpanMm ?? MAX_SPAN_MM
  const inner = L_mm - 2 * end
  return 1 + Math.ceil(inner / span)
}

export interface QuotePriceResult {
  /** 1 本あたりの本体価格 (税込・標準仕様・標準座金本数込み) */
  unitPrice: number
  /** 計算に使った実効長さ (mm) — min/max でクランプ後 */
  effectiveLengthMm: number
  /** 固定長商品なら true (長さ入力不要) */
  isFixedLength: boolean
}

/**
 * 参考見積もり用の単価を返す。
 * - DRAWING_PRODUCTS 未登録の商品 (Élisabeth/Clémence) は null。
 * - 固定長商品 (Scroll/Fabrice/鎚目) は length 無視で basePrice を返す。
 * - 価格テーブル指定商品 (René/Claire/Marcel/Émile) はテーブル参照で線形補間。
 *   1.5m 以下はすべて basePrice (一律)。
 * - 縦型シリーズ (Claude/Catherine/Alexandre/Antoine) は stdLengthMm まで一律 basePrice、
 *   超過分のみ pricePerMm 加算 + 2m 超で長尺サーチャージ。
 */
export function getQuoteUnitPrice(slug: string, lengthM: number): QuotePriceResult | null {
  const prod = DRAWING_PRODUCTS[slug]
  if (!prod) return null

  const isFixedLength = prod.stdLengthMm === prod.maxMm
  const minL = prod.zakinRule?.minLengthMm ?? 500
  const L_mm_raw = Math.round(lengthM * 1000)
  const L_mm = Math.max(minL, Math.min(prod.maxMm, L_mm_raw))

  let addon: number
  let surcharge: number
  if (prod.priceTable) {
    const tablePrice = lookupPriceFromTable(L_mm, prod.priceTable)
    addon = tablePrice - prod.basePrice
    surcharge = 0
  } else {
    const pricePerMm = prod.pricePerMm ?? PRICE_PER_MM
    addon = Math.max(0, L_mm - prod.stdLengthMm) * pricePerMm
    const longM = L_mm > SURGE_START_MM
      ? Math.pow(SURGE_BASE, (L_mm - SURGE_START_MM) / SURGE_INTERVAL_MM)
      : 1
    surcharge = L_mm > SURGE_START_MM ? addon * (longM - 1) : 0
  }

  // 参考見積もりでは標準座金本数のみ (カスタム追加は折り返し見積書で対応)。
  // → addZakin = 0, angleCost = 0 で計算。
  const unitPrice = Math.round(prod.basePrice + addon + surcharge)

  return {
    unitPrice,
    effectiveLengthMm: L_mm,
    isFixedLength,
  }
}

/** 商品が固定長 (長さ入力 UI 不要) かどうか */
export function isFixedLengthProduct(slug: string): boolean {
  const prod = DRAWING_PRODUCTS[slug]
  if (!prod) return false
  return prod.stdLengthMm === prod.maxMm
}

/** 商品が参考見積もり計算機で扱えるかどうか (DRAWING_PRODUCTS 登録の有無) */
export function isQuotableProduct(slug: string): boolean {
  return slug in DRAWING_PRODUCTS
}

/** 商品の標準長さ (m) — 計算機の length 初期値に使う */
export function getStandardLengthM(slug: string): number {
  const prod = DRAWING_PRODUCTS[slug]
  if (!prod) return 1.5
  return prod.stdLengthMm / 1000
}

/** 商品の最大長さ (m) */
export function getMaxLengthM(slug: string): number {
  const prod = DRAWING_PRODUCTS[slug]
  if (!prod) return 5.0
  return prod.maxMm / 1000
}
