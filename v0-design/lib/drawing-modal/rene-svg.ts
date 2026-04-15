// René 横型手すり 制作図SVG ビルダー
// 既存 item/rene.html の buildDrawingSvg() (lines 2006-2537) を純粋関数化
// 元コードの createElementNS ベースのimperative描画ロジックを忠実に保持

export type AngleDir = "left" | "right"

export interface ReneDrawingParams {
  L_mm: number
  positions: number[]
  angleDeg: number
  angleDir: AngleDir
}

// 既存rene.htmlではdata:URLで埋め込まれていたが、v0-designでは public/images/ado_logo_W.png を参照
const ADO_LOGO_URL = "/images/ado_logo_W.png"

export function buildReneDrawingSvg(
  svg: SVGSVGElement,
  params: ReneDrawingParams
): void {
  const svgNS = "http://www.w3.org/2000/svg"
  const { L_mm, angleDeg, angleDir } = params
  const positions = [...params.positions].sort((a, b) => a - b)

  // Clear
  while (svg.firstChild) svg.removeChild(svg.firstChild)

  // A4横比率キャンバス
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

  // レイアウト定数
  const barLeft = 150
  const barRight = W - 60
  const barLen = barRight - barLeft
  const barCX = (barLeft + barRight) / 2

  // 角度計算
  const hasAngle = angleDeg > 0
  const angleRad = (angleDeg * Math.PI) / 180
  const barBaseY = 155
  const barY1 = barBaseY
  const barY2 = barBaseY
  const barYAtX = (_x: number) => barBaseY
  const actualAngle = 0
  const textAngle = 0
  const zakinTiltSign = angleDir === "left" ? -1 : 1

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
    return l
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
    return t
  }

  // 縮尺
  const scale = barLen / L_mm

  // メインバー φ25.4
  const barThick = Math.max(25.4 * scale, 2)
  const rect = document.createElementNS(svgNS, "rect")
  rect.setAttribute("x", String(barLeft))
  rect.setAttribute("y", String(barBaseY - barThick / 2))
  rect.setAttribute("width", String(barLen))
  rect.setAttribute("height", String(barThick))
  rect.setAttribute("fill", "none")
  rect.setAttribute("stroke", C)
  rect.setAttribute("stroke-width", "1")
  svg.appendChild(rect)

  // 座金描画 φ45
  const bR = Math.max((45 / 2) * scale, 3)
  positions.forEach((pos) => {
    const x = barLeft + (pos / L_mm) * barLen
    const yOnBar = barYAtX(x) + barThick / 2
    const circleX = x
    const circleY = yOnBar + bR
    const pillarTopX =
      x + (hasAngle ? bR * Math.sin(angleRad) * zakinTiltSign : 0)

    // 丸座金
    const circle = document.createElementNS(svgNS, "circle")
    circle.setAttribute("cx", String(circleX))
    circle.setAttribute("cy", String(circleY))
    circle.setAttribute("r", String(bR))
    circle.setAttribute("fill", "none")
    circle.setAttribute("stroke", C)
    circle.setAttribute("stroke-width", "0.8")
    svg.appendChild(circle)

    // 段付き穴×3
    const holeR = Math.max(3.5 * scale, 1)
    const holeDist = bR * 0.6
    const holeAngleOffset = hasAngle ? angleDeg * zakinTiltSign : 0
    ;[90, 210, 330].forEach((deg) => {
      const rad = ((deg + holeAngleOffset) * Math.PI) / 180
      const hc = document.createElementNS(svgNS, "circle")
      hc.setAttribute("cx", String(circleX + holeDist * Math.cos(rad)))
      hc.setAttribute("cy", String(circleY + holeDist * Math.sin(rad)))
      hc.setAttribute("r", String(holeR))
      hc.setAttribute("fill", "none")
      hc.setAttribute("stroke", C)
      hc.setAttribute("stroke-width", "0.4")
      svg.appendChild(hc)
    })

    // 支柱 φ9（白背景で遮蔽 → 二本線 → 下端半丸）
    const postW = Math.max(9 * scale, 1.5)
    const postBg = document.createElementNS(svgNS, "polygon")
    postBg.setAttribute(
      "points",
      `${pillarTopX - postW / 2},${yOnBar} ${pillarTopX + postW / 2},${yOnBar} ${
        circleX + postW / 2
      },${circleY} ${circleX - postW / 2},${circleY}`
    )
    postBg.setAttribute("fill", "#fff")
    postBg.setAttribute("stroke", "none")
    svg.appendChild(postBg)
    addLine(circleX - postW / 2, circleY, pillarTopX - postW / 2, yOnBar, C, 0.5)
    addLine(circleX + postW / 2, circleY, pillarTopX + postW / 2, yOnBar, C, 0.5)
    const pArc = document.createElementNS(svgNS, "path")
    pArc.setAttribute(
      "d",
      `M ${circleX - postW / 2} ${circleY} A ${postW / 2} ${postW / 2} 0 0 0 ${
        circleX + postW / 2
      } ${circleY}`
    )
    pArc.setAttribute("fill", "none")
    pArc.setAttribute("stroke", C)
    pArc.setAttribute("stroke-width", "0.5")
    svg.appendChild(pArc)
  })

  // 全長寸法
  const dimDist = 28
  const dimLx = barLeft + dimDist * Math.sin(actualAngle)
  const dimRx = barRight + dimDist * Math.sin(actualAngle)
  const dimLy = barY1 - dimDist * Math.cos(actualAngle)
  const dimRy = barY2 - dimDist * Math.cos(actualAngle)
  const dimMx = (dimLx + dimRx) / 2
  const dimMy = (dimLy + dimRy) / 2

  addLine(barLeft, barY1 - barThick / 2, dimLx, dimLy, CD, 0.3)
  addLine(barRight, barY2 - barThick / 2, dimRx, dimRy, CD, 0.3)
  addLine(dimLx, dimLy, dimRx, dimRy, C, 0.5)
  addDimArrow(dimLx, dimLy, dimLx - dimRx, dimLy - dimRy, C)
  addDimArrow(dimRx, dimRy, dimRx - dimLx, dimRy - dimLy, C)
  const tt = addText(dimMx, dimMy - 5, L_mm, "11", C, "middle", "600")
  if (hasAngle)
    tt.setAttribute(
      "transform",
      `rotate(${textAngle} ${dimMx} ${dimMy - 5})`
    )

  // セグメント寸法
  const segOffsetDist = bR * 2 + 18
  const segNx = -Math.sin(actualAngle)
  const segNy = Math.cos(actualAngle)
  const allPoints = [0, ...positions, L_mm]
  for (let i = 1; i < allPoints.length; i++) {
    const x1 = barLeft + (allPoints[i - 1] / L_mm) * barLen
    const x2 = barLeft + (allPoints[i] / L_mm) * barLen
    const segLen = allPoints[i] - allPoints[i - 1]
    if (segLen <= 0) continue
    const sy1 = barYAtX(x1) + barThick / 2 + segOffsetDist * segNy
    const sy2 = barYAtX(x2) + barThick / 2 + segOffsetDist * segNy
    const sx1 = x1 + segOffsetDist * segNx
    const sx2 = x2 + segOffsetDist * segNx
    const sMidX = (sx1 + sx2) / 2
    const sMidY = (sy1 + sy2) / 2

    addLine(x1, barYAtX(x1) + barThick / 2 + bR * 2 + 2, sx1, sy1, CD, 0.3)
    addLine(x2, barYAtX(x2) + barThick / 2 + bR * 2 + 2, sx2, sy2, CD, 0.3)
    addLine(sx1, sy1, sx2, sy2, CD, 0.5)
    const segPx = Math.sqrt((sx2 - sx1) ** 2 + (sy2 - sy1) ** 2)
    if (segPx > 12) {
      addDimArrow(sx1, sy1, sx1 - sx2, sy1 - sy2, CD)
      addDimArrow(sx2, sy2, sx2 - sx1, sy2 - sy1, CD)
    } else {
      addDimArrow(sx1, sy1, sx2 - sx1, sy2 - sy1, CD)
      addDimArrow(sx2, sy2, sx1 - sx2, sy1 - sy2, CD)
    }
    const st = addText(sMidX, sMidY - 4, segLen, "9", CD)
    if (hasAngle)
      st.setAttribute(
        "transform",
        `rotate(${textAngle} ${sMidX} ${sMidY - 4})`
      )
  }

  // 座金側面詳細図
  const pipeR_s = (25.4 / 2) * scale
  const washerR_s = (45 / 2) * scale
  const bracket40_s = 40 * scale
  const bpThick_s = Math.max(4.5 * scale, 1)
  const postD_s = Math.max(9 * scale, 1.5)
  const bendR = Math.max(9 * scale, 2)
  const hp = postD_s / 2

  const sPipeCX = barLeft - 30
  const sWallX = sPipeCX - bracket40_s - pipeR_s
  const sideY = barBaseY
  const sArmY = sideY + pipeR_s + Math.max(20 * scale, 8)

  // 壁面ハッチング
  const wH = Math.max(washerR_s * 2 + 10, 24)
  addLine(sWallX, sArmY - wH / 2, sWallX, sArmY + wH / 2, C, 1)
  for (let wi = sArmY - wH / 2; wi < sArmY + wH / 2; wi += 4) {
    addLine(sWallX, wi, sWallX - 5, wi + 3, C, 0.25)
  }

  // パイプ断面
  const spC = document.createElementNS(svgNS, "circle")
  spC.setAttribute("cx", String(sPipeCX))
  spC.setAttribute("cy", String(sideY))
  spC.setAttribute("r", String(Math.max(pipeR_s, 2)))
  spC.setAttribute("fill", "none")
  spC.setAttribute("stroke", C)
  spC.setAttribute("stroke-width", "0.8")
  svg.appendChild(spC)

  // 座金プレート（白塗り → 外形線）
  const sbpRect = document.createElementNS(svgNS, "rect")
  sbpRect.setAttribute("x", String(sWallX - 6))
  sbpRect.setAttribute("y", String(sArmY - washerR_s))
  sbpRect.setAttribute("width", String(bpThick_s + 6))
  sbpRect.setAttribute("height", String(washerR_s * 2))
  sbpRect.setAttribute("fill", "#fff")
  sbpRect.setAttribute("stroke", "none")
  svg.appendChild(sbpRect)

  const sbpLine = document.createElementNS(svgNS, "rect")
  sbpLine.setAttribute("x", String(sWallX))
  sbpLine.setAttribute("y", String(sArmY - washerR_s))
  sbpLine.setAttribute("width", String(bpThick_s))
  sbpLine.setAttribute("height", String(washerR_s * 2))
  sbpLine.setAttribute("fill", "none")
  sbpLine.setAttribute("stroke", C)
  sbpLine.setAttribute("stroke-width", "0.8")
  svg.appendChild(sbpLine)

  // 段付き穴×3
  const sHoleSp = washerR_s * 0.55
  ;[-sHoleSp, 0, sHoleSp].forEach((dy) => {
    const shc = document.createElementNS(svgNS, "circle")
    shc.setAttribute("cx", String(sWallX + bpThick_s / 2))
    shc.setAttribute("cy", String(sArmY + dy))
    shc.setAttribute("r", String(Math.max(3.5 * scale, 1)))
    shc.setAttribute("fill", "none")
    shc.setAttribute("stroke", C)
    shc.setAttribute("stroke-width", "0.4")
    svg.appendChild(shc)
  })

  // 支柱 φ9 二本線（直線→曲げ→直線）
  const sArmStartX = sWallX + bpThick_s
  const pipeBot = sideY + Math.max(pipeR_s, 2)
  addLine(sArmStartX, sArmY - hp, sPipeCX - bendR, sArmY - hp, C, 0.5)
  addLine(sArmStartX, sArmY + hp, sPipeCX - bendR, sArmY + hp, C, 0.5)
  addLine(sPipeCX - hp, sArmY - bendR, sPipeCX - hp, pipeBot, C, 0.5)
  addLine(sPipeCX + hp, sArmY - bendR, sPipeCX + hp, pipeBot, C, 0.5)
  const arcI = document.createElementNS(svgNS, "path")
  const rI = bendR - hp
  arcI.setAttribute(
    "d",
    `M ${sPipeCX - bendR} ${sArmY - hp} A ${rI} ${rI} 0 0 0 ${
      sPipeCX - hp
    } ${sArmY - bendR}`
  )
  arcI.setAttribute("fill", "none")
  arcI.setAttribute("stroke", C)
  arcI.setAttribute("stroke-width", "0.5")
  svg.appendChild(arcI)
  const arcO = document.createElementNS(svgNS, "path")
  const rO = bendR + hp
  arcO.setAttribute(
    "d",
    `M ${sPipeCX - bendR} ${sArmY + hp} A ${rO} ${rO} 0 0 0 ${
      sPipeCX + hp
    } ${sArmY - bendR}`
  )
  arcO.setAttribute("fill", "none")
  arcO.setAttribute("stroke", C)
  arcO.setAttribute("stroke-width", "0.5")
  svg.appendChild(arcO)
  addLine(sArmStartX, sArmY - hp, sArmStartX, sArmY + hp, C, 0.5)

  // 寸法 65.4 = 40 + 25.4
  const sPiX = sPipeCX - Math.max(pipeR_s, 2)
  const sPoX = sPipeCX + Math.max(pipeR_s, 2)
  const sDY1 = sideY - Math.max(pipeR_s, 3) - 28
  addLine(sWallX, sArmY - wH / 2, sWallX, sDY1 - 4, CD, 0.3)
  addLine(sPoX, sideY - Math.max(pipeR_s, 2) - 2, sPoX, sDY1 - 4, CD, 0.3)
  addLine(sWallX, sDY1, sPoX, sDY1, CD, 0.5)
  addDimArrow(sWallX, sDY1, sWallX - sPoX, 0, CD)
  addDimArrow(sPoX, sDY1, sPoX - sWallX, 0, CD)
  addText((sWallX + sPoX) / 2, sDY1 - 3, "65.4", "7", CD)
  const sDY2 = sDY1 + 12
  addLine(sPiX, sideY - Math.max(pipeR_s, 2) - 2, sPiX, sDY2 + 2, CD, 0.3)
  addLine(sWallX, sDY2, sPiX, sDY2, CD, 0.4)
  addDimArrow(sWallX, sDY2, sWallX - sPiX, 0, CD)
  addDimArrow(sPiX, sDY2, sPiX - sWallX, 0, CD)
  addText((sWallX + sPiX) / 2, sDY2 - 3, "40", "7", CD)
  addLine(sPiX, sDY2, sPoX, sDY2, CD, 0.4)
  addDimArrow(sPoX, sDY2, sPoX - sPiX, 0, CD)
  addDimArrow(sPiX, sDY2, sPiX - sPoX, 0, CD)
  addText((sPiX + sPoX) / 2, sDY2 - 3, "25.4", "7", CD)
  const sDY3 = sArmY + washerR_s + 6
  addLine(sWallX, sArmY + washerR_s + 2, sWallX, sDY3 + 2, CD, 0.3)
  addLine(
    sWallX + bpThick_s,
    sArmY + washerR_s + 2,
    sWallX + bpThick_s,
    sDY3 + 2,
    CD,
    0.3
  )
  addLine(sWallX, sDY3, sWallX + bpThick_s, sDY3, CD, 0.4)
  addDimArrow(sWallX, sDY3, bpThick_s, 0, CD)
  addDimArrow(sWallX + bpThick_s, sDY3, -bpThick_s, 0, CD)
  addText(sWallX + bpThick_s / 2, sDY3 + 8, "4.5", "6", CD)
  addText((sArmStartX + sPipeCX) / 2, sArmY + 10, "支柱9φ", "7", CD, "middle")

  // タイトルブロック
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
  let zakinInfo = `${positions.length}点`
  if (hasAngle)
    zakinInfo += ` / ${angleDir === "left" ? "左" : "右"}${angleDeg}°`

  const rows: [string, string, boolean][] = [
    ["図面名", `René 横型手すり ${L_mm}mm`, true],
    ["図番", `IW-REN-${L_mm}`, false],
    ["材質", "STKM φ25.4", false],
    ["仕上げ", "マットブラック", false],
    ["尺度", "1:20", false],
    ["設計", "蠣崎 良治", false],
    ["座金", zakinInfo, false],
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

  // 日付
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
