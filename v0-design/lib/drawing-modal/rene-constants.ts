// René 横型手すり 制作図モーダル 定数
// 既存 item/rene.html と同値
export const INCLUDED_ZAKIN = 3
export const END_DIST_MM = 100
export const MAX_SPAN_MM = 850

export function calcZakin(L_mm: number): number {
  if (L_mm <= 1050) return 2
  const inner = L_mm - 2 * END_DIST_MM
  return 1 + Math.ceil(inner / MAX_SPAN_MM)
}

export function getZakinPositions(L_mm: number, zakinCount: number): number[] {
  const positions: number[] = [END_DIST_MM]
  if (zakinCount > 2) {
    const inner = L_mm - 2 * END_DIST_MM
    const gaps = zakinCount - 1
    for (let i = 1; i < zakinCount - 1; i++) {
      positions.push(Math.round(END_DIST_MM + (inner * i) / gaps))
    }
  }
  positions.push(L_mm - END_DIST_MM)
  return positions
}
