// 縦型手すり シンプル制作図 ビルダー
// 既存 item/claude.html などの buildDrawingSvg() を純粋関数化
// 4商品 (claude / catherine / alexandre / antoine) で完全共通の簡易 schematic
// ユーザー要望: 縦型図面はシンプルに (feedback_marie_simulator)
//
// スタイルは SVG 属性で直接指定（Tailwind v4 のレイヤー順で CSS クラスが
// 上書きされることを避けるため）

import type { DrawingProductConfig } from "./products"

export interface VerticalDrawingParams {
  L_mm: number
  positions: number[]
  product: DrawingProductConfig
}

const COLOR_BAR = "#333"
const COLOR_DIM = "#888"
const COLOR_TEXT = "#555"
const COLOR_TOTAL_TEXT = "#222"
const COLOR_BRACKET = "#c8a96e"

export function buildVerticalRailDrawingSvg(
  svg: SVGSVGElement,
  params: VerticalDrawingParams
): void {
  const svgNS = "http://www.w3.org/2000/svg"
  const { L_mm } = params
  const positions = [...params.positions].sort((a, b) => a - b)

  while (svg.firstChild) svg.removeChild(svg.firstChild)
  svg.setAttribute("viewBox", "0 0 500 130")

  const W = 500
  const pad = 40
  const barY = 55
  const barLeft = pad
  const barRight = W - pad
  const barLen = barRight - barLeft

  const addLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke: string,
    strokeWidth: number,
    linecap?: string
  ) => {
    const l = document.createElementNS(svgNS, "line")
    l.setAttribute("x1", String(x1))
    l.setAttribute("y1", String(y1))
    l.setAttribute("x2", String(x2))
    l.setAttribute("y2", String(y2))
    l.setAttribute("stroke", stroke)
    l.setAttribute("stroke-width", String(strokeWidth))
    if (linecap) l.setAttribute("stroke-linecap", linecap)
    svg.appendChild(l)
  }

  const addText = (
    x: number,
    y: number,
    text: string | number,
    size: number,
    fill: string,
    weight?: string
  ) => {
    const t = document.createElementNS(svgNS, "text")
    t.setAttribute("x", String(x))
    t.setAttribute("y", String(y))
    t.setAttribute("font-size", String(size))
    t.setAttribute("fill", fill)
    t.setAttribute("text-anchor", "middle")
    t.setAttribute("font-family", "sans-serif")
    if (weight) t.setAttribute("font-weight", weight)
    t.textContent = String(text)
    svg.appendChild(t)
  }

  // 全長表示
  const dimY = 18
  addText((barLeft + barRight) / 2, dimY - 3, L_mm, 12, COLOR_TOTAL_TEXT, "600")
  addLine(barLeft, dimY, barRight, dimY, COLOR_BAR, 0.8)
  addLine(barLeft, dimY - 4, barLeft, dimY + 4, COLOR_BAR, 0.8)
  addLine(barRight, dimY - 4, barRight, dimY + 4, COLOR_BAR, 0.8)
  addLine(barLeft, dimY + 4, barLeft, barY - 8, COLOR_DIM, 0.7)
  addLine(barRight, dimY + 4, barRight, barY - 8, COLOR_DIM, 0.7)

  // メインバー
  addLine(barLeft, barY, barRight, barY, COLOR_BAR, 3, "round")
  addLine(barLeft, barY - 6, barLeft, barY + 6, COLOR_BAR, 1.5)
  addLine(barRight, barY - 6, barRight, barY + 6, COLOR_BAR, 1.5)

  // 座金 (円 + 下方向アイコン)
  positions.forEach((pos) => {
    const x = barLeft + (pos / L_mm) * barLen
    const circle = document.createElementNS(svgNS, "circle")
    circle.setAttribute("cx", String(x))
    circle.setAttribute("cy", String(barY))
    circle.setAttribute("r", "5")
    circle.setAttribute("fill", COLOR_BRACKET)
    svg.appendChild(circle)
    addLine(x, barY + 5, x, barY + 15, COLOR_DIM, 0.7)
    addLine(x - 5, barY + 15, x + 5, barY + 15, COLOR_BRACKET, 1)
  })

  // セグメント寸法
  const dimBelowY = barY + 28
  const allPoints = [0, ...positions, L_mm]
  for (let i = 1; i < allPoints.length; i++) {
    const x1 = barLeft + (allPoints[i - 1] / L_mm) * barLen
    const x2 = barLeft + (allPoints[i] / L_mm) * barLen
    const segLen = allPoints[i] - allPoints[i - 1]
    if (segLen <= 0) continue
    const midX = (x1 + x2) / 2
    addLine(x1, dimBelowY, x2, dimBelowY, COLOR_DIM, 0.7)
    addLine(x1, dimBelowY - 3, x1, dimBelowY + 3, COLOR_DIM, 0.7)
    addLine(x2, dimBelowY - 3, x2, dimBelowY + 3, COLOR_DIM, 0.7)
    addText(midX, dimBelowY + 14, segLen, 11, COLOR_TEXT)
  }

  // "座金 N点" ノート
  addText(
    (barLeft + barRight) / 2,
    dimBelowY + 32,
    `《 座金 ${positions.length}点 》`,
    10,
    COLOR_DIM
  )
}
