// 縦型手すり CAD 制作図 ビルダー
// rene-svg.ts と同形式 (外枠・タイトルブロック・寸法線・側面詳細図)
// ただし:
// - 角度なし (縦型は壁に対して垂直に取り付け)
// - 支柱なし (座金プレート → バー が直付け)
// - 側面図は 壁 → 座金プレート(4.5) → バー断面
// 対象: claude / catherine / alexandre / antoine

import type { DrawingProductConfig } from "./products"

export interface VerticalDrawingParams {
  L_mm: number
  positions: number[]
  product: DrawingProductConfig
  /** 互換保持用。縦型では無視される */
  angleDeg?: number
  angleDir?: "left" | "right"
}

const ADO_LOGO_URL = "/images/ado_logo_W.png"

export function buildVerticalRailDrawingSvg(
  svg: SVGSVGElement,
  params: VerticalDrawingParams
): void {
  const svgNS = "http://www.w3.org/2000/svg"
  const { L_mm, product } = params
  const positions = [...params.positions].sort((a, b) => a - b)

  while (svg.firstChild) svg.removeChild(svg.firstChild)

  const W = 840
  const H = 400
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`)
  const C = "#333"
  const CD = "#666"

  // 外枠
  const border = document.createElementNS(svgNS, "rect")
  border.setAttribute("x", "20")
  border.setAttribute("y", "15")
  border.setAttribute("width", String(W - 40))
  border.setAttribute("height", String(H - 30))
  border.setAttribute("fill", "none")
  border.setAttribute("stroke", C)
  border.setAttribute("stroke-width", "1")
  svg.appendChild(border)

  const barLeft = 150
  const barRight = W - 60
  const barLen = barRight - barLeft
  const barBaseY = 155

  const addLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke?: string,
    sw?: number
  ) => {
    const l = document.createElementNS(svgNS, "line")
    l.setAttribute("x1", String(x1))
    l.setAttribute("y1", String(y1))
    l.setAttribute("x2", String(x2))
    l.setAttribute("y2", String(y2))
    l.setAttribute("stroke", stroke || C)
    l.setAttribute("stroke-width", String(sw ?? 0.5))
    svg.appendChild(l)
  }

  const addDimArrow = (
    x: number,
    y: number,
    dx: number,
    dy: number,
    stroke?: string
  ) => {
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len === 0) return
    const ux = dx / len
    const uy = dy / len
    const px = -uy
    const py = ux
    const aLen = 3
    const aW = 1.2
    const p = document.createElementNS(svgNS, "polygon")
    p.setAttribute(
      "points",
      `${x},${y} ${x - ux * aLen + px * aW},${y - uy * aLen + py * aW} ${
        x - ux * aLen - px * aW
      },${y - uy * aLen - py * aW}`
    )
    p.setAttribute("fill", stroke || C)
    p.setAttribute("stroke", "none")
    svg.appendChild(p)
  }

  const addText = (
    x: number,
    y: number,
    text: string | number,
    size?: string,
    fill?: string,
    anchor?: string,
    weight?: string
  ) => {
    const t = document.createElementNS(svgNS, "text")
    t.setAttribute("x", String(x))
    t.setAttribute("y", String(y))
    t.setAttribute("font-size", size || "10")
    t.setAttribute("fill", fill || C)
    t.setAttribute("text-anchor", anchor || "middle")
    t.setAttribute("font-family", "var(--font), sans-serif")
    if (weight) t.setAttribute("font-weight", weight)
    t.textContent = String(text)
    svg.appendChild(t)
  }

  // 縮尺 (1mm あたりの SVG 単位)
  const scale = barLen / L_mm

  // バー直径 (縦型は全て round 前提)
  const diameter =
    product.shape?.type === "round" ? product.shape.diameter : 25.4
  const barThick = Math.max(diameter * scale, 2)

  // メインバー (平面図: パイプを長手方向に見た様子)
  const rect = document.createElementNS(svgNS, "rect")
  rect.setAttribute("x", String(barLeft))
  rect.setAttribute("y", String(barBaseY - barThick / 2))
  rect.setAttribute("width", String(barLen))
  rect.setAttribute("height", String(barThick))
  rect.setAttribute("fill", "none")
  rect.setAttribute("stroke", C)
  rect.setAttribute("stroke-width", "1")
  svg.appendChild(rect)

  // 座金 φ45 (バー上に直接配置、支柱なし)
  const bR = Math.max((45 / 2) * scale, 3)
  positions.forEach((pos) => {
    const x = barLeft + (pos / L_mm) * barLen

    // 座金の外形
    const circle = document.createElementNS(svgNS, "circle")
    circle.setAttribute("cx", String(x))
    circle.setAttribute("cy", String(barBaseY))
    circle.setAttribute("r", String(bR))
    circle.setAttribute("fill", "none")
    circle.setAttribute("stroke", C)
    circle.setAttribute("stroke-width", "0.8")
    svg.appendChild(circle)

    // 段付き穴×3 (縦並び配置: 縦型ではプレート向きが縦方向)
    const holeR = Math.max(3.5 * scale, 1)
    const holeDist = bR * 0.6
    ;[0, 120, 240].forEach((deg) => {
      const rad = (deg * Math.PI) / 180
      const hc = document.createElementNS(svgNS, "circle")
      hc.setAttribute("cx", String(x + holeDist * Math.cos(rad)))
      hc.setAttribute("cy", String(barBaseY + holeDist * Math.sin(rad)))
      hc.setAttribute("r", String(holeR))
      hc.setAttribute("fill", "none")
      hc.setAttribute("stroke", C)
      hc.setAttribute("stroke-width", "0.4")
      svg.appendChild(hc)
    })

    // バーを前面に上書き (座金の内側を貫通するように見せる)
    const barSegBg = document.createElementNS(svgNS, "rect")
    barSegBg.setAttribute("x", String(x - barThick / 2))
    barSegBg.setAttribute("y", String(barBaseY - barThick / 2))
    barSegBg.setAttribute("width", String(barThick))
    barSegBg.setAttribute("height", String(barThick))
    barSegBg.setAttribute("fill", "#fff")
    barSegBg.setAttribute("stroke", "none")
    svg.appendChild(barSegBg)
    addLine(
      x - barThick / 2,
      barBaseY - barThick / 2,
      x - barThick / 2,
      barBaseY + barThick / 2,
      C,
      1
    )
    addLine(
      x + barThick / 2,
      barBaseY - barThick / 2,
      x + barThick / 2,
      barBaseY + barThick / 2,
      C,
      1
    )
  })

  // 全長寸法 (上側)
  const dimDist = 28
  const dimLx = barLeft
  const dimRx = barRight
  const dimLy = barBaseY - dimDist
  const dimRy = barBaseY - dimDist
  const dimMx = (dimLx + dimRx) / 2
  const dimMy = dimLy

  addLine(barLeft, barBaseY - barThick / 2, dimLx, dimLy, CD, 0.3)
  addLine(barRight, barBaseY - barThick / 2, dimRx, dimRy, CD, 0.3)
  addLine(dimLx, dimLy, dimRx, dimRy, C, 0.5)
  addDimArrow(dimLx, dimLy, dimLx - dimRx, 0, C)
  addDimArrow(dimRx, dimRy, dimRx - dimLx, 0, C)
  addText(dimMx, dimMy - 5, L_mm, "11", C, "middle", "600")

  // セグメント寸法 (下側、座金の下に)
  const segOffsetDist = bR + 18
  const allPoints = [0, ...positions, L_mm]
  const sy = barBaseY + barThick / 2 + segOffsetDist
  for (let i = 1; i < allPoints.length; i++) {
    const x1 = barLeft + (allPoints[i - 1] / L_mm) * barLen
    const x2 = barLeft + (allPoints[i] / L_mm) * barLen
    const segLen = allPoints[i] - allPoints[i - 1]
    if (segLen <= 0) continue
    const sMidX = (x1 + x2) / 2

    addLine(x1, barBaseY + bR + 2, x1, sy, CD, 0.3)
    addLine(x2, barBaseY + bR + 2, x2, sy, CD, 0.3)
    addLine(x1, sy, x2, sy, CD, 0.5)
    const segPx = x2 - x1
    if (segPx > 12) {
      addDimArrow(x1, sy, x1 - x2, 0, CD)
      addDimArrow(x2, sy, x2 - x1, 0, CD)
    } else {
      addDimArrow(x1, sy, x2 - x1, 0, CD)
      addDimArrow(x2, sy, x1 - x2, 0, CD)
    }
    addText(sMidX, sy - 4, segLen, "9", CD)
  }

  // ── 座金側面詳細図 (壁 → プレート → バー断面) ──
  const washerR_s = (45 / 2) * scale
  const bpThick_s = Math.max(4.5 * scale, 1)
  const diameter_s = diameter * scale

  const sBarCX = barLeft - 30
  const sideY = barBaseY
  const pipeR_s = diameter_s / 2
  // 壁 X: バーから ← 方向へ、プレート厚 + バー半径 分
  const sWallX = sBarCX - pipeR_s - bpThick_s
  const sInnerX = sBarCX - pipeR_s
  const sOuterX = sBarCX + pipeR_s
  const dimTotalLabel = String(product.shape?.totalProjection ?? 29.9)
  const dimInnerLabel = String(diameter)

  // 壁面ハッチング
  const wH = Math.max(washerR_s * 2 + 10, 24)
  addLine(sWallX, sideY - wH / 2, sWallX, sideY + wH / 2, C, 1)
  for (let wi = sideY - wH / 2; wi < sideY + wH / 2; wi += 4) {
    addLine(sWallX, wi, sWallX - 5, wi + 3, C, 0.25)
  }

  // バー断面 (円)
  const spC = document.createElementNS(svgNS, "circle")
  spC.setAttribute("cx", String(sBarCX))
  spC.setAttribute("cy", String(sideY))
  spC.setAttribute("r", String(Math.max(pipeR_s, 2)))
  spC.setAttribute("fill", "none")
  spC.setAttribute("stroke", C)
  spC.setAttribute("stroke-width", "0.8")
  svg.appendChild(spC)

  // 座金プレート (壁とバーの間、厚 4.5mm)
  const sbpRect = document.createElementNS(svgNS, "rect")
  sbpRect.setAttribute("x", String(sWallX))
  sbpRect.setAttribute("y", String(sideY - washerR_s))
  sbpRect.setAttribute("width", String(bpThick_s))
  sbpRect.setAttribute("height", String(washerR_s * 2))
  sbpRect.setAttribute("fill", "none")
  sbpRect.setAttribute("stroke", C)
  sbpRect.setAttribute("stroke-width", "0.8")
  svg.appendChild(sbpRect)

  // 段付き穴×3 (プレート面上、縦並び)
  const sHoleSp = washerR_s * 0.55
  ;[-sHoleSp, 0, sHoleSp].forEach((dy) => {
    const shc = document.createElementNS(svgNS, "circle")
    shc.setAttribute("cx", String(sWallX + bpThick_s / 2))
    shc.setAttribute("cy", String(sideY + dy))
    shc.setAttribute("r", String(Math.max(3.5 * scale, 1)))
    shc.setAttribute("fill", "none")
    shc.setAttribute("stroke", C)
    shc.setAttribute("stroke-width", "0.4")
    svg.appendChild(shc)
  })

  // 寸法 (上: 壁〜バー外径 = totalProjection)
  const sDY1 = sideY - pipeR_s - 28
  addLine(sWallX, sideY - wH / 2, sWallX, sDY1 - 4, CD, 0.3)
  addLine(sOuterX, sideY - pipeR_s - 2, sOuterX, sDY1 - 4, CD, 0.3)
  addLine(sWallX, sDY1, sOuterX, sDY1, CD, 0.5)
  addDimArrow(sWallX, sDY1, sWallX - sOuterX, 0, CD)
  addDimArrow(sOuterX, sDY1, sOuterX - sWallX, 0, CD)
  addText((sWallX + sOuterX) / 2, sDY1 - 3, dimTotalLabel, "7", CD)

  // 寸法 (中: プレート厚 4.5)
  const sDY2 = sDY1 + 12
  addLine(sInnerX, sideY - pipeR_s - 2, sInnerX, sDY2 + 2, CD, 0.3)
  addLine(sWallX, sDY2, sInnerX, sDY2, CD, 0.4)
  addDimArrow(sWallX, sDY2, sWallX - sInnerX, 0, CD)
  addDimArrow(sInnerX, sDY2, sInnerX - sWallX, 0, CD)
  addText((sWallX + sInnerX) / 2, sDY2 - 3, "4.5", "7", CD)

  // 寸法 (中: バー直径)
  addLine(sInnerX, sDY2, sOuterX, sDY2, CD, 0.4)
  addDimArrow(sOuterX, sDY2, sOuterX - sInnerX, 0, CD)
  addDimArrow(sInnerX, sDY2, sInnerX - sOuterX, 0, CD)
  addText((sInnerX + sOuterX) / 2, sDY2 - 3, dimInnerLabel, "7", CD)

  // ── タイトルブロック ──
  const tbW = 260
  const tbRowH = 18
  const tbRows = 7
  const tbH = tbRowH * tbRows
  const tbX = W - 30 - tbW
  const tbY = H - 25 - tbH
  const labelW = 60

  const tbRect = document.createElementNS(svgNS, "rect")
  tbRect.setAttribute("x", String(tbX))
  tbRect.setAttribute("y", String(tbY))
  tbRect.setAttribute("width", String(tbW))
  tbRect.setAttribute("height", String(tbH))
  tbRect.setAttribute("fill", "none")
  tbRect.setAttribute("stroke", C)
  tbRect.setAttribute("stroke-width", "0.8")
  svg.appendChild(tbRect)

  const today = new Date()
  const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n))
  const dateStr = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(
    today.getDate()
  )}`

  const rows: [string, string, boolean][] = [
    ["図面名", `${product.nameJa} ${L_mm}mm`, true],
    ["図番", `${product.drawingCode}-${L_mm}`, false],
    ["材質", product.material, false],
    ["仕上げ", product.finish, false],
    ["尺度", "1:20", false],
    ["設計", "蠣崎 良治", false],
    ["座金", `${positions.length}点`, false],
  ]

  rows.forEach((row, i) => {
    const ry = tbY + i * tbRowH
    if (i > 0) addLine(tbX, ry, tbX + tbW, ry, C, 0.4)
    addLine(tbX + labelW, ry, tbX + labelW, ry + tbRowH, C, 0.4)
    addText(tbX + labelW / 2, ry + 13, row[0], "8", CD, "middle", "600")
    addText(
      tbX + labelW + 8,
      ry + 13,
      row[1],
      row[2] ? "10" : "9",
      C,
      "start",
      row[2] ? "700" : "400"
    )
  })

  addText(
    tbX + tbW - 6,
    tbY + 5 * tbRowH + 13,
    `日付  ${dateStr}`,
    "7",
    CD,
    "end"
  )

  // ロゴ
  const logoImg = document.createElementNS(svgNS, "image")
  logoImg.setAttribute("x", String(tbX - 80))
  logoImg.setAttribute("y", String(tbY + (tbH - 52) / 2))
  logoImg.setAttribute("width", "45")
  logoImg.setAttribute("height", "52")
  logoImg.setAttribute("href", ADO_LOGO_URL)
  svg.appendChild(logoImg)
}
