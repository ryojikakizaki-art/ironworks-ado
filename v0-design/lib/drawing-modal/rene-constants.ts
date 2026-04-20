// 制作図モーダル 座金計算ルール
// - 横型 (René/Claire/Marcel/Émile) は rule 未指定で LEGACY 挙動
// - 縦型 (Claude/Catherine/Antoine) は各商品 zakinRule を渡す

export interface ZakinRule {
  // 基本座金数 (縦型は 2 固定)。未指定なら旧式 (L から自動算出)。
  defaultCount?: number
  // 端からの最小距離 (mm)
  endMinMm: number
  // 座金間の最大ピッチ (mm)
  maxSpanMm: number
  // 長さ入力の下限 (mm)
  minLengthMm?: number
  // 長さ入力の上限 (mm, 未指定なら product.maxMm)
  maxLengthMm?: number
}

// 既存 item/rene.html 互換の既定値
export const INCLUDED_ZAKIN = 3
export const END_DIST_MM = 100
export const MAX_SPAN_MM = 850

function endMin(rule?: ZakinRule): number {
  return rule?.endMinMm ?? END_DIST_MM
}

function maxSpan(rule?: ZakinRule): number {
  return rule?.maxSpanMm ?? MAX_SPAN_MM
}

export function calcZakin(L_mm: number, rule?: ZakinRule): number {
  if (rule?.defaultCount !== undefined) return rule.defaultCount
  // 旧式 (横型): L<=1050 は 2 個、以降は端距離 100mm・最大ピッチ 850mm で算出
  if (L_mm <= 1050) return 2
  const inner = L_mm - 2 * endMin(rule)
  return 1 + Math.ceil(inner / maxSpan(rule))
}

// 端からの距離。縦型(defaultCount 指定)は最大ピッチを保つため動的に拡大。
export function calcEndDist(L_mm: number, rule?: ZakinRule): number {
  if (rule?.defaultCount !== undefined) {
    return Math.max(endMin(rule), (L_mm - maxSpan(rule)) / 2)
  }
  return endMin(rule)
}

export function getZakinPositions(L_mm: number, zakinCount: number, rule?: ZakinRule): number[] {
  const end = calcEndDist(L_mm, rule)
  const positions: number[] = [Math.round(end)]
  if (zakinCount > 2) {
    const inner = L_mm - 2 * end
    const gaps = zakinCount - 1
    for (let i = 1; i < zakinCount - 1; i++) {
      positions.push(Math.round(end + (inner * i) / gaps))
    }
  }
  positions.push(Math.round(L_mm - end))
  return positions
}
