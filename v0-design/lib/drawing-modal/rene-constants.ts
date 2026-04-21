// 制作図モーダル 座金計算ルール
// - 横型 (René/Claire/Marcel/Émile) は rule 未指定で LEGACY 挙動
// - 縦型 (Claude/Catherine/Antoine) は各商品 zakinRule を渡す

export interface ZakinRule {
  // 基本座金数 (縦型は 2 固定)。未指定なら旧式 (L から自動算出)。
  defaultCount?: number
  // 端からの最小距離 (mm)
  endMinMm: number
  // 端距離の上限 (mm)。未指定なら上限なし
  endMaxMm?: number
  // 端距離の L 比例係数 (例: 0.1 なら L×0.1 も下限に含める)。Claude/Catherine は 0.1
  endProportion?: number
  // 座金間の最大ピッチ (mm)
  maxSpanMm: number
  // 長さ入力の下限 (mm)
  minLengthMm?: number
  // 長さ入力の上限 (mm, 未指定なら product.maxMm)
  maxLengthMm?: number
  // 端距離 anchors (線形補間用): [(L_mm, endDist), ...]。L の昇順。
  // Antoine 専用: 非線形な端距離カーブ
  endAnchors?: Array<[number, number]>
  // この長さを超えたら座金を 1 点追加 (2→3, 3→4 等)
  // Antoine: 2400 超えで 3 点配置 (中央追加)
  addWasherAboveMm?: number
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
  if (rule?.defaultCount !== undefined) {
    let count = rule.defaultCount
    // addWasherAboveMm: L がしきい値を超えたら座金を1個追加 (Antoine 2400mm 超)
    if (rule.addWasherAboveMm !== undefined && L_mm > rule.addWasherAboveMm) {
      count += 1
    }
    return count
  }
  // 旧式 (横型): L<=1050 は 2 個、以降は端距離 100mm・最大ピッチ 850mm で算出
  if (L_mm <= 1050) return 2
  const inner = L_mm - 2 * endMin(rule)
  return 1 + Math.ceil(inner / maxSpan(rule))
}

// anchors の線形補間
function interpolateAnchors(L_mm: number, anchors: Array<[number, number]>): number {
  if (anchors.length === 0) return 0
  // 昇順ソート (念のため)
  const sorted = [...anchors].sort((a, b) => a[0] - b[0])
  if (L_mm <= sorted[0][0]) return sorted[0][1]
  if (L_mm >= sorted[sorted.length - 1][0]) return sorted[sorted.length - 1][1]
  for (let i = 0; i < sorted.length - 1; i++) {
    const [L0, v0] = sorted[i]
    const [L1, v1] = sorted[i + 1]
    if (L_mm >= L0 && L_mm <= L1) {
      const t = (L_mm - L0) / (L1 - L0)
      return v0 + (v1 - v0) * t
    }
  }
  return sorted[sorted.length - 1][1]
}

// 端からの距離。縦型(defaultCount 指定)は最大ピッチを保つため動的に拡大。
// endProportion 指定時は L×係数 も下限に含める (Claude/Catherine: L×0.1)。
// endAnchors 指定時は線形補間値を使用 (Antoine: 非線形カーブ)。
export function calcEndDist(L_mm: number, rule?: ZakinRule): number {
  if (rule?.defaultCount !== undefined) {
    // anchors 指定がある場合、それを使用 (Antoine)
    if (rule.endAnchors && rule.endAnchors.length > 0) {
      const v = interpolateAnchors(L_mm, rule.endAnchors)
      const capped = rule.endMaxMm !== undefined ? Math.min(v, rule.endMaxMm) : v
      return Math.max(capped, endMin(rule))
    }
    const base = endMin(rule)
    const proportional = rule.endProportion ? L_mm * rule.endProportion : 0
    const byMaxSpan = (L_mm - maxSpan(rule)) / 2
    let end = Math.max(base, proportional, byMaxSpan)
    if (rule.endMaxMm !== undefined) end = Math.min(end, rule.endMaxMm)
    return end
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
