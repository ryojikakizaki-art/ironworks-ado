// 縦型手すり CAD 精密制作図 SVG ビルダー (DXF 抽出データで構築)
//
// 構成:
//   (1) FULL_DRAWING_SVG  — DXF modelspace 抽出。壁ハッチング + 正面図バー + 上下座金平面 +
//                           タイトルブロック + adoロゴ
//   (2) WASHER_A_DETAIL_SVG — DXF paperspace 抽出。座金A詳細図
//   (3) TS で動的再描画 — 側面図 (バー・プレート・連結線) と 5 寸法線 を L_mm/positions に合わせて生成
//
// 呼び出し条件: product.washerSpec が定義されている縦型商品のみ (Claude 先行)。
//
// L と positions が変わってもリアルタイムに寸法・側面図が反映される。

import type { DrawingProductConfig, WasherTypeId } from "./products"
import { WASHER_SPEC_A, WASHER_SPEC_B } from "./products"
import { FULL_DRAWING_SVG } from "./full-drawing-fragment"
import { WASHER_A_DETAIL_SVG } from "./washer-detail-fragment"

export interface VerticalCadDrawingParams {
  L_mm: number
  positions: number[]
  product: DrawingProductConfig
  /** 座金タイプ (A=55×35 / B=60×25)。未指定なら A */
  washerType?: WasherTypeId
}

// 座金A 中心座標 (paperspace, DXF mm)
const WASHER_A_CX = 87.225
const WASHER_A_CY = 21.0

// 座金B への変換スケール (A=55×35 → B=60×25)
const B_SCALE_X = WASHER_SPEC_B.plateWidth / WASHER_SPEC_A.plateWidth // 60/55
const B_SCALE_Y = WASHER_SPEC_B.plateHeight / WASHER_SPEC_A.plateHeight // 25/35

const SVG_NS = "http://www.w3.org/2000/svg"

// Modelspace 固定座標 (DXF 由来, Y=上)
const BAR_CENTER_Y = 250
const BAR_X1 = -491.5
const BAR_X2 = -466.1
// 側面図バー x (DXF)
const SIDE_BAR_X1 = -922.2
const SIDE_BAR_X2 = -896.8
// 座金プレート側面 x (DXF)
const SIDE_PLATE_X1 = -962.2
const SIDE_PLATE_X2 = -957.7
// 座金プレート側面 高さ (35mm) の半分 = 17.5mm (washer center から上下)
const PLATE_HALF_H = 17.5
// 座金プレート厚 t=4.5mm の半分 = 2.25mm
const PLATE_HALF_T = 2.25

const COLOR_LINE = "#222"
const COLOR_DIM = "#333"
const STROKE_W = 2.5
const DIM_STROKE_W = 2.0
const FILL_BAR = "#ffffff"

// 各寸法の dim_line_x (DXF x 座標). 正面バー左端 -491.5、右端 -466.1。
// 左側セグメント寸法 (top-seg/middle-seg/bottom-seg) は dim_line_x = -373.8
// 総長寸法 (total) は dim_line_x = -251.2 (右側)
const DIM_X_SEGMENT = -373.8
const DIM_X_TOTAL = -251.2
// 壁ギャップ寸法 40 は固定なので DXF のまま

export function buildVerticalCadDrawingSvg(
  svg: SVGSVGElement,
  params: VerticalCadDrawingParams
): void {
  const { L_mm, product, washerType = "A" } = params
  const positions = [...params.positions].sort((a, b) => a - b)
  if (!product.washerSpec || !product.titleBlock) return

  while (svg.firstChild) svg.removeChild(svg.firstChild)

  // バー座標 (DXF mm, Y上向き)
  const barTopY = BAR_CENTER_Y + L_mm / 2
  const barBotY = BAR_CENTER_Y - L_mm / 2
  const barTopSvgY = -barTopY
  const barBotSvgY = -barBotY

  // ======================================================
  // レイアウト定数 (SVG 座標, Y下向き)
  // 左列: 壁 + 側面図 + 正面バー + 寸法 (x=-1200 〜 200)
  // 右列: 座金詳細図 + タイトルブロック + ado ロゴ (x=280 〜 820)
  // ======================================================
  const LEFT_COL_MIN_X = -1200
  const LEFT_COL_MAX_X = 200
  const RIGHT_COL_X = 280
  const RIGHT_COL_W = 540
  const RIGHT_COL_MAX_X = RIGHT_COL_X + RIGHT_COL_W // 820

  // 右列アイテムサイズ (mm 単位)
  const DETAIL_H = 900
  const TITLE_BLOCK_H = 240 // 3 行 × 80mm
  const LOGO_H = 140
  const GAP = 40
  const RIGHT_COL_TOTAL_H = DETAIL_H + GAP + TITLE_BLOCK_H + GAP + LOGO_H // 1400

  // コンテンツ Y 範囲
  // 上端: バー頂部 寸法矢印 + 余白
  const contentTopY = Math.min(-960, barTopSvgY - 120)
  // 下端: バー底部 + 余白  OR 右列の底端  のどちらか長い方
  const barBottomEdge = barBotSvgY + 120
  const rightColBottom = contentTopY + 50 + RIGHT_COL_TOTAL_H
  const contentBottomY = Math.max(barBottomEdge, rightColBottom)

  // A4 アスペクト比
  const A4_LANDSCAPE = 297 / 210  // ≈ 1.414 (横向き)
  const A4_PORTRAIT  = 210 / 297  // ≈ 0.707 (縦向き)

  let VB_X = LEFT_COL_MIN_X
  let VB_Y = contentTopY
  let VB_W = RIGHT_COL_MAX_X - LEFT_COL_MIN_X // 2020
  let VB_H = contentBottomY - contentTopY

  const currentAspect = VB_W / VB_H

  if (currentAspect >= 1.0) {
    // コンテンツが横長 → A4 横向き (297×210) に合わせる
    if (currentAspect >= A4_LANDSCAPE) {
      // A4 横より更に横長 → 下に余白追加
      VB_H = VB_W / A4_LANDSCAPE
    } else {
      // 1.0 <= aspect < 1.414 → 左右に余白追加して横向き A4 に合わせる
      const newW = VB_H * A4_LANDSCAPE
      VB_X -= (newW - VB_W) / 2
      VB_W = newW
    }
  } else {
    // コンテンツが縦長 → A4 縦向き (210×297)、図形は中央寄せ
    if (currentAspect < A4_PORTRAIT) {
      // A4 縦より更に縦長 → 左右に余白追加して中央寄せ
      const newW = VB_H * A4_PORTRAIT
      VB_X -= (newW - VB_W) / 2
      VB_W = newW
    } else {
      // 0.707 <= aspect < 1.0 → 下に余白追加して縦向き A4 に合わせる
      VB_H = VB_W / A4_PORTRAIT
    }
  }

  svg.setAttribute("viewBox", `${VB_X.toFixed(1)} ${VB_Y.toFixed(1)} ${VB_W.toFixed(1)} ${VB_H.toFixed(1)}`)

  // 右列アイテムの Y 位置 (viewBox 上端から一定距離)
  const detailTopY = contentTopY + 50
  const titleBlockTopY = detailTopY + DETAIL_H + GAP
  const logoTopY = titleBlockTopY + TITLE_BLOCK_H + GAP

  // (1) modelspace 注入 + 動的要素削除
  const fullDoc = new DOMParser().parseFromString(FULL_DRAWING_SVG, "image/svg+xml")
  Array.from(fullDoc.documentElement.children).forEach((child) => {
    svg.appendChild(child.cloneNode(true))
  })
  removeDynamicFromDxf(svg)

  // (2) 座金詳細図を右列上に配置
  const detailSvg = document.createElementNS(SVG_NS, "svg")
  detailSvg.setAttribute("x", String(RIGHT_COL_X))
  detailSvg.setAttribute("y", String(detailTopY))
  detailSvg.setAttribute("width", String(RIGHT_COL_W))
  detailSvg.setAttribute("height", String(DETAIL_H))
  detailSvg.setAttribute("viewBox", "20 -115 125 155")
  detailSvg.setAttribute("preserveAspectRatio", "xMidYMid meet")
  detailSvg.setAttribute("overflow", "visible")
  const detailDoc = new DOMParser().parseFromString(WASHER_A_DETAIL_SVG, "image/svg+xml")
  Array.from(detailDoc.documentElement.children).forEach((child) => {
    detailSvg.appendChild(child.cloneNode(true))
  })
  if (washerType === "B") {
    transformDetailToTypeB(detailSvg)
  }
  svg.appendChild(detailSvg)

  // (3) 動的要素: バー / 座金 / 側面図 / 寸法線 / 壁ハッチ
  updateDynamicElements(svg, L_mm, positions, product, {
    titleBlockTopY,
    logoTopY,
    rightColX: RIGHT_COL_X,
    rightColW: RIGHT_COL_W,
  })
}

function removeDynamicFromDxf(svg: SVGSVGElement): void {
  const rolesToRemove = [
    "side-view",
    "dim-top-seg",
    "dim-middle-seg",
    "dim-bottom-seg",
    "dim-total",
    "dim-wall-gap",
    "wall-hatch",
    "title-block",
  ]
  rolesToRemove.forEach((role) => {
    svg.querySelectorAll(`[data-role="${role}"]`).forEach((el) => el.remove())
  })
  // DXF 側の 壁面線 (LINE at x=-962.2 から成る) と ado ロゴも削除 (TS で再描画)
  svg.querySelectorAll("image").forEach((img) => {
    if ((img.getAttribute("href") || "").includes("ado_logo")) img.remove()
  })
  // 壁面右端線 (x=-962.2) は DXF では独立した LINE として出ている。削除して TS で描き直す
  svg.querySelectorAll("line").forEach((line) => {
    const x1 = parseFloat(line.getAttribute("x1") || "0")
    const x2 = parseFloat(line.getAttribute("x2") || "0")
    if (Math.abs(x1 - (-962.2)) < 0.5 && Math.abs(x2 - (-962.2)) < 0.5) line.remove()
  })
}

interface RightColLayout {
  titleBlockTopY: number
  logoTopY: number
  rightColX: number
  rightColW: number
}

function updateDynamicElements(
  svg: SVGSVGElement,
  L_mm: number,
  positions: number[],
  product: DrawingProductConfig,
  rightCol: RightColLayout
): void {
  const barTopY = BAR_CENTER_Y + L_mm / 2
  const barBotY = BAR_CENTER_Y - L_mm / 2
  // 座金位置配列 (bar top からの距離 mm) → DXF 座標に変換
  const washerYs = positions.map((p) => barTopY - p) // 上から下の順
  const topWasherY = washerYs[0]
  const botWasherY = washerYs[washerYs.length - 1]

  // 正面バー polygon を L に合わせて更新
  const bar = svg.querySelector('[data-role="bar"]') as SVGPolygonElement | null
  if (bar) {
    const pts = [
      [BAR_X1, barTopY],
      [BAR_X2, barTopY],
      [BAR_X2, barBotY],
      [BAR_X1, barBotY],
    ]
    bar.setAttribute(
      "points",
      pts.map(([x, y]) => `${x.toFixed(2)},${(-y).toFixed(2)}`).join(" ")
    )
  }

  // 上下座金平面を新しい y 位置へ平行移動
  moveGroup(svg, "washer-top", 0, -(topWasherY - 650))
  moveGroup(svg, "washer-bottom", 0, -(botWasherY - -150))

  // 既存の中間座金平面を削除
  svg.querySelectorAll('[data-role^="washer-middle-"]').forEach((el) => el.remove())
  // 中間座金: washer-top を複製して中間位置に配置
  if (washerYs.length > 2) {
    const topGroup = svg.querySelector('[data-role="washer-top"]')
    if (topGroup) {
      const middleYs = washerYs.slice(1, -1)
      // washer-top は既に translate されているので、元の DXF 位置(y=650) からの相対差分を計算
      middleYs.forEach((midY, i) => {
        const cloned = topGroup.cloneNode(true) as SVGGElement
        cloned.setAttribute("data-role", `washer-middle-${i}`)
        cloned.setAttribute("transform", `translate(0, ${-(midY - 650)})`)
        topGroup.parentNode?.insertBefore(cloned, topGroup.nextSibling)
      })
    }
  }

  // 壁ハッチングを L に追従して再描画
  const wallHatch = buildWallHatch(barTopY, barBotY)
  svg.insertBefore(wallHatch, svg.firstChild)

  // 側面図 (バー・プレート・連結線) — 全座金位置を渡す
  const sideView = buildSideView(barTopY, barBotY, washerYs)
  svg.appendChild(sideView)

  // 40mm 壁ギャップ寸法
  svg.appendChild(buildWallGapDim(barTopY))

  // 縦寸法線: 座金セグメントごとに描画
  // 端点列: [barBotY, washer[n-1], ..., washer[0], barTopY] (下から上)
  // 寸法線は バー頂部 → 各座金 → バー底部 の順に描く
  svg.appendChild(
    buildVerticalDim("dim-top-seg", topWasherY, barTopY, DIM_X_SEGMENT,
      String(Math.round(positions[0])), BAR_X1)
  )
  // 座金間セグメント (2 個なら 1 本、3 個なら 2 本)
  for (let i = 0; i < washerYs.length - 1; i++) {
    const yUpper = washerYs[i]
    const yLower = washerYs[i + 1]
    const segLen = positions[i + 1] - positions[i]
    svg.appendChild(
      buildVerticalDim(
        `dim-mid-seg-${i}`,
        yLower,
        yUpper,
        DIM_X_SEGMENT,
        String(Math.round(segLen)),
        BAR_X1
      )
    )
  }
  svg.appendChild(
    buildVerticalDim("dim-bottom-seg", barBotY, botWasherY, DIM_X_SEGMENT,
      String(Math.round(L_mm - positions[positions.length - 1])), BAR_X1)
  )
  svg.appendChild(
    buildVerticalDim("dim-total", barBotY, barTopY, DIM_X_TOTAL,
      String(Math.round(L_mm)), BAR_X2, /*rightSide*/ true)
  )

  // タイトルブロック (右列, 座金詳細図 の下)
  if (product.titleBlock) {
    svg.appendChild(
      buildTitleBlock(
        rightCol.titleBlockTopY,
        product.titleBlock,
        rightCol.rightColX,
        rightCol.rightColW
      )
    )
  }

  // ado ロゴ (右列, タイトルブロック下)
  svg.appendChild(buildAdoLogo(rightCol.logoTopY, rightCol.rightColX, rightCol.rightColW))
}

function moveGroup(svg: SVGSVGElement, role: string, dxSvg: number, dySvg: number): void {
  const g = svg.querySelector(`[data-role="${role}"]`) as SVGGElement | null
  if (!g) return
  g.setAttribute("transform", `translate(${dxSvg.toFixed(2)}, ${dySvg.toFixed(2)})`)
}

// ==========================================================
// 側面図 (wall-hatch の右側にバー+プレート+連結線)
// ==========================================================
function buildSideView(
  barTopY: number,
  barBotY: number,
  washerYs: number[]
): SVGGElement {
  const g = document.createElementNS(SVG_NS, "g")
  g.setAttribute("data-role", "side-view")

  // 側面バー (正面バーと同じ高さ範囲)
  const barPolyPts = [
    [SIDE_BAR_X1, barTopY],
    [SIDE_BAR_X2, barTopY],
    [SIDE_BAR_X2, barBotY],
    [SIDE_BAR_X1, barBotY],
  ]
  g.appendChild(mkPolygon(barPolyPts, COLOR_LINE, STROKE_W, FILL_BAR))

  // 全座金位置のプレート側面 (35mm × 4.5mm) + 連結線
  for (const washerY of washerYs) {
    const platePts = [
      [SIDE_PLATE_X1, washerY + PLATE_HALF_H],
      [SIDE_PLATE_X2, washerY + PLATE_HALF_H],
      [SIDE_PLATE_X2, washerY - PLATE_HALF_H],
      [SIDE_PLATE_X1, washerY - PLATE_HALF_H],
    ]
    g.appendChild(mkPolygon(platePts, COLOR_LINE, STROKE_W, FILL_BAR))
    for (const offsetSign of [1, -1]) {
      const y = washerY + offsetSign * (PLATE_HALF_T * 2)
      g.appendChild(mkLine(SIDE_PLATE_X2, y, SIDE_BAR_X1, y, COLOR_LINE, STROKE_W))
    }
  }
  return g
}

// ==========================================================
// 壁ハッチング (バー長さに追従、L の両端 +40mm までカバー)
// ==========================================================
const WALL_X_INNER = -962.2 // 壁表面 (バーに近い側)
const WALL_X_OUTER = -1072.2 // 壁外側端

function buildWallHatch(barTopY: number, barBotY: number): SVGGElement {
  const g = document.createElementNS(SVG_NS, "g")
  g.setAttribute("data-role", "wall-hatch")
  const x1 = WALL_X_OUTER
  const x2 = WALL_X_INNER
  const y1 = barBotY - 40
  const y2 = barTopY + 40
  const rangeH = y2 - y1
  const rangeW = x2 - x1
  // 45°斜線 (lower-left → upper-right)、spacing 22mm
  const spacing = 22
  for (let offset = -rangeH; offset <= rangeW + rangeH; offset += spacing) {
    // ライン: (x1 + offset, y1) → (x1 + offset + rangeH, y2)
    // クリップして [x1, x2] × [y1, y2] 内に収める
    let tx1 = x1 + offset
    let ty1 = y1
    let tx2 = x1 + offset + rangeH
    let ty2 = y2
    // left clip
    if (tx1 < x1) {
      const diff = x1 - tx1
      tx1 = x1
      ty1 = y1 + diff
    }
    // right clip
    if (tx2 > x2) {
      const diff = tx2 - x2
      tx2 = x2
      ty2 = y2 - diff
    }
    if (tx2 > tx1 && ty2 > ty1) {
      g.appendChild(mkLine(tx1, ty1, tx2, ty2, COLOR_LINE, 1.2))
    }
  }
  // 壁表面線 (右端、太め)
  g.appendChild(mkLine(x2, y1, x2, y2, COLOR_LINE, STROKE_W * 1.2))
  return g
}

// ==========================================================
// 40mm 壁ギャップ寸法 (バー上端付近、水平)
// ==========================================================
function buildWallGapDim(barTopY: number): SVGGElement {
  const g = document.createElementNS(SVG_NS, "g")
  g.setAttribute("data-role", "dim-wall-gap")
  const y = barTopY + 20 // バー上端より少し上
  const x1 = WALL_X_INNER // -962.2
  const x2 = SIDE_BAR_X1 // -922.2
  // 寸法線
  g.appendChild(mkLine(x1, y, x2, y, COLOR_DIM, DIM_STROKE_W))
  // 延長線 (上方向)
  g.appendChild(mkLine(x1, y, x1, y - 15, COLOR_DIM, DIM_STROKE_W * 0.7))
  g.appendChild(mkLine(x2, y, x2, y - 15, COLOR_DIM, DIM_STROKE_W * 0.7))
  // 矢印 (水平・内向き): tip=端点、body は端点の外側 → ▶ at x1, ◀ at x2
  const ah = 18
  const ahH = 7
  // 左矢印: tip=x1, body は x1-ah (外側・左) → 右向き ▶ = 内向き
  g.appendChild(
    mkPolygon(
      [[x1, y], [x1 - ah, y + ahH], [x1 - ah, y - ahH]],
      COLOR_DIM, 0, COLOR_DIM
    )
  )
  // 右矢印: tip=x2, body は x2+ah (外側・右) → 左向き ◀ = 内向き
  g.appendChild(
    mkPolygon(
      [[x2, y], [x2 + ah, y + ahH], [x2 + ah, y - ahH]],
      COLOR_DIM, 0, COLOR_DIM
    )
  )
  // ラベル "40" (寸法線の中点上)
  g.appendChild(mkText((x1 + x2) / 2, y + 18, "40", 40, "middle", "middle"))
  return g
}

// ==========================================================
// タイトルブロック (コンパクト, TS 生成)
// 位置: 右列指定, 3 行 (商品名 / color / 材質), font 30mm
// ==========================================================
function buildTitleBlock(
  svgY: number,
  tb: NonNullable<DrawingProductConfig["titleBlock"]>,
  tbX: number,
  tbW: number
): SVGGElement {
  const g = document.createElementNS(SVG_NS, "g")
  g.setAttribute("data-role", "title-block")
  const rows: Array<[string, string]> = [
    ["商品名", tb.productName],
    ["color", tb.color],
    ["材質", tb.material],
  ]
  const rowH = 80
  const colLabelW = Math.min(140, tbW * 0.3)
  const frameH = rowH * rows.length
  const dxfYTop = -svgY
  const dxfYBot = -(svgY + frameH)
  // Frame
  g.appendChild(mkPolygon([
    [tbX, dxfYTop],
    [tbX + tbW, dxfYTop],
    [tbX + tbW, dxfYBot],
    [tbX, dxfYBot],
  ], COLOR_LINE, STROKE_W, "none"))
  // 縦仕切り線
  g.appendChild(mkLine(tbX + colLabelW, dxfYTop, tbX + colLabelW, dxfYBot, COLOR_LINE, STROKE_W))
  // 行
  rows.forEach(([label, value], i) => {
    const rowSvgY = svgY + i * rowH
    const rowDxfYTop = -rowSvgY
    if (i > 0) {
      g.appendChild(mkLine(tbX, rowDxfYTop, tbX + tbW, rowDxfYTop, COLOR_LINE, STROKE_W))
    }
    const midSvgY = rowSvgY + rowH / 2
    const midDxfY = -midSvgY
    g.appendChild(mkText(tbX + colLabelW / 2, midDxfY, label, 30, "middle", "middle"))
    g.appendChild(mkText(tbX + colLabelW + (tbW - colLabelW) / 2, midDxfY, value, 30, "middle", "middle"))
  })
  return g
}

// ==========================================================
// ado ロゴ (ビットマップ画像, 右列)
// ==========================================================
function buildAdoLogo(svgY: number, colX: number, colW: number): SVGImageElement {
  const img = document.createElementNS(SVG_NS, "image") as SVGImageElement
  img.setAttribute("href", "/images/ado_logo_W.png")
  const logoW = Math.min(360, colW * 0.75)
  img.setAttribute("x", String(colX + (colW - logoW) / 2))
  img.setAttribute("y", String(svgY))
  img.setAttribute("width", String(logoW))
  img.setAttribute("height", "140")
  img.setAttribute("preserveAspectRatio", "xMidYMid meet")
  img.setAttribute("opacity", "0.9")
  return img
}

// ==========================================================
// 垂直寸法線 (JIS風)
// ==========================================================
function buildVerticalDim(
  role: string,
  y1: number,
  y2: number,
  dimLineX: number,
  label: string,
  extensionFromX: number,
  rightSide: boolean = false
): SVGGElement {
  const g = document.createElementNS(SVG_NS, "g")
  g.setAttribute("data-role", role)
  g.setAttribute("data-dim-value", label)

  const [yLow, yHigh] = y1 < y2 ? [y1, y2] : [y2, y1]

  // 寸法線 (縦)
  g.appendChild(mkLine(dimLineX, yLow, dimLineX, yHigh, COLOR_DIM, DIM_STROKE_W))

  // 延長線 (水平, バー端からDimラインへ)
  const extEndX = dimLineX
  const extLen = Math.abs(dimLineX - extensionFromX)
  const extSignedEnd = rightSide ? dimLineX + 4 : dimLineX - 4
  g.appendChild(mkLine(extensionFromX, yHigh, extSignedEnd, yHigh, COLOR_DIM, DIM_STROKE_W * 0.8))
  g.appendChild(mkLine(extensionFromX, yLow, extSignedEnd, yLow, COLOR_DIM, DIM_STROKE_W * 0.8))

  // 矢印 (上下それぞれ・内向き)
  // tip=端点、body は端点の外側 → 矢印が内側を向く (▽上端/△下端)
  const arrowLen = 45
  const arrowHalfW = 18
  // 上端矢印: tip=yHigh, body は yHigh+arrowLen (外側・上) → 下向き ▽ = 内向き
  g.appendChild(
    mkPolygon(
      [
        [dimLineX, yHigh],
        [dimLineX - arrowHalfW, yHigh + arrowLen],
        [dimLineX + arrowHalfW, yHigh + arrowLen],
      ],
      COLOR_DIM,
      0,
      COLOR_DIM
    )
  )
  // 下端矢印: tip=yLow, body は yLow-arrowLen (外側・下) → 上向き △ = 内向き
  g.appendChild(
    mkPolygon(
      [
        [dimLineX, yLow],
        [dimLineX - arrowHalfW, yLow - arrowLen],
        [dimLineX + arrowHalfW, yLow - arrowLen],
      ],
      COLOR_DIM,
      0,
      COLOR_DIM
    )
  )

  // ラベル (寸法線中点、寸法線と平行 = 90°回転)
  const midY = (yLow + yHigh) / 2
  // ラベル位置: 寸法線から少しオフセット (rightSide なら右に、それ以外は左に)
  const labelX = rightSide ? dimLineX - 15 : dimLineX - 15
  const text = mkText(labelX, midY, label, 44, "middle", "middle", /*rot=*/ 90)
  g.appendChild(text)

  return g
}

// ==========================================================
// SVG helpers (Y-flipped coordinate)
// ==========================================================
function mkLine(x1: number, y1: number, x2: number, y2: number, stroke: string, sw: number): SVGLineElement {
  const l = document.createElementNS(SVG_NS, "line")
  l.setAttribute("x1", x1.toFixed(2))
  l.setAttribute("y1", (-y1).toFixed(2))
  l.setAttribute("x2", x2.toFixed(2))
  l.setAttribute("y2", (-y2).toFixed(2))
  l.setAttribute("stroke", stroke)
  l.setAttribute("stroke-width", String(sw))
  l.setAttribute("fill", "none")
  return l
}

function mkPolygon(
  pts: number[][],
  stroke: string,
  sw: number,
  fill: string
): SVGPolygonElement {
  const p = document.createElementNS(SVG_NS, "polygon")
  p.setAttribute(
    "points",
    pts.map(([x, y]) => `${x.toFixed(2)},${(-y).toFixed(2)}`).join(" ")
  )
  p.setAttribute("stroke", stroke)
  p.setAttribute("stroke-width", String(sw))
  p.setAttribute("fill", fill)
  return p
}

// ==========================================================
// 座金B 変換: DXF抽出 A 版 (55×35) を B 仕様 (60×25) に変換
// ==========================================================
function transformDetailToTypeB(detailSvg: SVGSVGElement): void {
  // paperspace 座金中心: (87.225, 21) DXF → Y反転 SVG = (87.225, -21)
  const cx = WASHER_A_CX
  const cyFlipped = -WASHER_A_CY
  // スプラインパス (楕円外周・内縁) の座標を非等方スケール
  // d 属性の数値ペアを正規表現で抽出して変換
  detailSvg.querySelectorAll("path").forEach((path) => {
    const d = path.getAttribute("d") || ""
    // 弧 (arc) は座金Aの支柱用 (x ~ 87, y ~ -95) なので対象外
    if (d.includes("A ")) return
    // 楕円スプラインは cx ~ 87 付近で通過する点列のみ。他のパス (プレート底部 rect polyline) も通るが、
    // 底部は y ~ -50 付近で cx 周辺は直線部なのでスケールしても大きな破綻は出ない。
    // plate bottom polyline は (60.17, -53.71)-(115.17, -50.21) で x=[60,115]。B で x方向 +5/-5 程度拡張。
    const transformed = d.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (_, xStr, yStr) => {
      const x = parseFloat(xStr)
      const y = parseFloat(yStr)
      // 楕円周辺のみスケール。その他は現状維持
      const inOvalRegion = x > 55 && x < 120 && y > -45 && y < 0
      if (!inOvalRegion) return `${x} ${y}`
      const nx = cx + (x - cx) * B_SCALE_X
      const ny = cyFlipped + (y - cyFlipped) * B_SCALE_Y
      return `${nx.toFixed(3)} ${ny.toFixed(3)}`
    })
    path.setAttribute("d", transformed)
  })
  // テキスト置換
  detailSvg.querySelectorAll("text").forEach((t) => {
    const txt = t.textContent || ""
    if (txt === "55") t.textContent = String(WASHER_SPEC_B.plateWidth)
    else if (txt === "35") t.textContent = String(WASHER_SPEC_B.plateHeight)
    else if (txt === "座金A詳細図") t.textContent = "座金B詳細図"
  })
  // 55 寸法線 (楕円長径) と 35 寸法線 (楕円短径) の端点を新しい楕円に合わせる
  // 55 寸法: 水平方向、両端矢印 x=59.725,114.725 → B: 57.225, 117.225 (center±30)
  // 35 寸法: 垂直方向、両端矢印 y=3.5,38.5 (Y反転前) → Y反転後 y=-3.5,-38.5
  //   B: y=8.5,33.5 (Y反転前) → -8.5, -33.5
  const bHalfW = WASHER_SPEC_B.plateWidth / 2  // 30
  const bHalfH = WASHER_SPEC_B.plateHeight / 2 // 12.5
  const aHalfW = WASHER_SPEC_A.plateWidth / 2  // 27.5
  const aHalfH = WASHER_SPEC_A.plateHeight / 2 // 17.5
  detailSvg.querySelectorAll("line").forEach((line) => {
    const x1 = parseFloat(line.getAttribute("x1") || "0")
    const x2 = parseFloat(line.getAttribute("x2") || "0")
    const y1 = parseFloat(line.getAttribute("y1") || "0")
    const y2 = parseFloat(line.getAttribute("y2") || "0")
    // 55 寸法の延長線・寸法線・矢印は y ≈ -3.5 で水平、x=59.725,114.725 付近
    if (Math.abs(x1 - (cx - aHalfW)) < 0.5 || Math.abs(x1 - (cx + aHalfW)) < 0.5) {
      if (x1 < cx) line.setAttribute("x1", String(cx - bHalfW))
      else line.setAttribute("x1", String(cx + bHalfW))
    }
    if (Math.abs(x2 - (cx - aHalfW)) < 0.5 || Math.abs(x2 - (cx + aHalfW)) < 0.5) {
      if (x2 < cx) line.setAttribute("x2", String(cx - bHalfW))
      else line.setAttribute("x2", String(cx + bHalfW))
    }
    // 35 寸法の延長線・寸法線・矢印は y=-3.5 もしくは y=-38.5 付近
    if (Math.abs(y1 - (cyFlipped + aHalfH)) < 0.5 || Math.abs(y1 - (cyFlipped - aHalfH)) < 0.5) {
      if (y1 > cyFlipped) line.setAttribute("y1", String(cyFlipped + bHalfH))
      else line.setAttribute("y1", String(cyFlipped - bHalfH))
    }
    if (Math.abs(y2 - (cyFlipped + aHalfH)) < 0.5 || Math.abs(y2 - (cyFlipped - aHalfH)) < 0.5) {
      if (y2 > cyFlipped) line.setAttribute("y2", String(cyFlipped + bHalfH))
      else line.setAttribute("y2", String(cyFlipped - bHalfH))
    }
  })
  // 矢印ポリゴンも同様に
  detailSvg.querySelectorAll("polygon").forEach((poly) => {
    const pts = poly.getAttribute("points") || ""
    const newPts = pts.replace(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/g, (_, xStr, yStr) => {
      let x = parseFloat(xStr)
      let y = parseFloat(yStr)
      if (Math.abs(x - (cx - aHalfW)) < 0.5) x = cx - bHalfW
      else if (Math.abs(x - (cx + aHalfW)) < 0.5) x = cx + bHalfW
      if (Math.abs(y - (cyFlipped + aHalfH)) < 0.5) y = cyFlipped + bHalfH
      else if (Math.abs(y - (cyFlipped - aHalfH)) < 0.5) y = cyFlipped - bHalfH
      return `${x},${y}`
    })
    poly.setAttribute("points", newPts)
  })
}

function mkText(
  x: number,
  y: number,
  text: string,
  size: number,
  anchor: "start" | "middle" | "end",
  baseline: string,
  rot: number = 0
): SVGTextElement {
  const t = document.createElementNS(SVG_NS, "text")
  t.setAttribute("x", x.toFixed(2))
  t.setAttribute("y", (-y).toFixed(2))
  t.setAttribute("font-size", String(size))
  t.setAttribute("fill", COLOR_LINE)
  t.setAttribute("text-anchor", anchor)
  t.setAttribute("dominant-baseline", baseline)
  t.setAttribute("font-family", "sans-serif")
  if (rot) t.setAttribute("transform", `rotate(${-rot} ${x.toFixed(2)} ${(-y).toFixed(2)})`)
  t.textContent = text
  return t
}
