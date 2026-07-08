// Laurent（階段手摺）の設計図 SVG ビルダー（JIS 製図風・cad-sheet.ts ベース）
//
// お客様が入力した段数・寸法から、A4 横の図面シートを組み立てる。
// 商品ページの「設計図（PDF）を見る」モーダルで使い、そのまま印刷/PDF 保存できる。
// A4 横・倍率 100% で印刷すると表題欄の尺度どおりの実寸図になる。
//
// 構成:
//   左     — 側面図（標準縮尺を自動選択）＋寸法線＋注記
//   右上   — 詳細 A: 柱脚座金 60×60 t6・φ5.5-φ9 段付き穴×4・タッピング M5×40 ×4（S=1:2）
//   右中   — 詳細 B: 壁付け座金 80×25 t6・端から 8mm に段付き穴×2・タッピング M5×40 ×2（S=1:2）
//   右下   — 表題欄（品名・図番・尺度・材質・仕上げ・付属ビス・投影法）
//
// 手すりの取り付けルール（2026-07-05 蠣﨑さん指示）:
// - 1 本目の柱は 1 段目の踏み板中央に立つ（床からではない）
// - 手すりの下端は前に飛び出さず、1 段目で折り曲げて固定する（＝1 本目の柱を兼ねる）
// - 追加柱は 5 段ごと（段板中央に立つ）、上端は壁付け
// - 横桟は手すりと踏み板の間に、本数で等分した高さに平行に走る
//
// 座金の実物仕様（2026-07-09 蠣﨑さん回答）:
// - 柱脚: 60×60 t6・φ5.5-φ9 段付き穴×4・タッピングビス M5×40 ×4
// - 壁付け: 80×25 t6・端から 8mm の位置に段付き穴×2・タッピングビス M5×40 ×2

import { LAURENT, type CrossbarMaterial, type StairColor } from "@/lib/products/stair-pricing"
import {
  SHEET_VB_W,
  SHEET_VB_H,
  SHEET_W_MM,
  SHEET_H_MM,
  FRAME_MM,
  INK,
  THIN_W,
  THICK_W,
  MID_W,
  mm,
  text,
  line,
  rect,
  circle,
  sheetFrame,
  pickScale,
  scaleLabel,
  dimH,
  dimV,
  dimAligned,
  extLine,
  detailBalloon,
  viewTitle,
  titleBlock,
  noteBlock,
  todayText,
} from "./cad-sheet"

export interface StairDrawingOpts {
  steps: number
  risersMm: number[]
  treadMm: number
  kekomiMm: number
  lastTreadMm: number
  railHeightMm: number
  crossbarCount: number
  crossbarMaterial: CrossbarMaterial
  color: StairColor
  postCount: number
  totalRiseMm: number
  runMm: number
  diagonalMm: number
}

// 座金の実物仕様（mm）
const BASE_PLATE = { w: 60, h: 60, t: 6, holePitch: 40, screws: 4 } // 柱脚
const WALL_PLATE = { w: 80, h: 25, t: 6, holeEdge: 8, screws: 2 } // 壁付け
const HOLE_OUTER = 9 // 段付き穴 上径 φ9
const HOLE_INNER = 5.5 // 下穴 φ5.5
const SCREW_LABEL = "タッピングねじ M5×40"

const LIGHT_FILL = "#f3f4f6"

const fmt = (n: number) => Math.round(n).toLocaleString()

/** 段付き穴（φ9/φ5.5 同心円）を紙 mm 座標に描く。s = 詳細図の縮尺分母 */
function steppedHole(cx: number, cy: number, s: number): string {
  return (
    circle(cx, cy, HOLE_OUTER / 2 / s, THIN_W) +
    circle(cx, cy, HOLE_INNER / 2 / s, THIN_W) +
    // 中心線（十字）
    line(cx - HOLE_OUTER / s * 0.75, cy, cx + HOLE_OUTER / s * 0.75, cy, THIN_W, "3 2") +
    line(cx, cy - HOLE_OUTER / s * 0.75, cx, cy + HOLE_OUTER / s * 0.75, THIN_W, "3 2")
  )
}

/** 壁・床の切断ハッチング（線分 p1→p2 の外側に斜線を並べる） */
function hatch(x1: number, y1: number, x2: number, y2: number, side: 1 | -1, pitch = 3, len = 3): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const L = Math.hypot(dx, dy)
  const ux = dx / L
  const uy = dy / L
  // 法線（side で外側を選ぶ）
  const nx = -uy * side
  const ny = ux * side
  const parts: string[] = []
  for (let d = pitch; d < L; d += pitch) {
    const px = x1 + ux * d
    const py = y1 + uy * d
    // 斜め 45°: 進行方向へ半分戻しつつ法線方向へ
    parts.push(line(px, py, px + (nx - ux) * len * 0.7, py + (ny - uy) * len * 0.7, THIN_W))
  }
  return parts.join("")
}

// ── 詳細 A: 柱脚座金（平面図＋側面図） ──────────────────
function detailA(x: number, y: number, s: number): string {
  const p: string[] = []
  const pw = BASE_PLATE.w / s // 30
  const ph = BASE_PLATE.h / s // 30
  p.push(viewTitle(x, y - 7, "詳細 A ── 柱脚座金", `S=${scaleLabel(s)}`))

  // 平面図
  p.push(rect(x, y, pw, ph, THICK_W, "#ffffff"))
  // 柱断面 FB9×38（中央・塗り）
  const fbW = 38 / s
  const fbT = 9 / s
  p.push(rect(x + pw / 2 - fbW / 2, y + ph / 2 - fbT / 2, fbW, fbT, MID_W, "#d1d5db"))
  // 段付き穴 ×4（ピッチ 40×40 想定・四隅均等）
  const off = (BASE_PLATE.w - BASE_PLATE.holePitch) / 2 / s // 10/s
  const hx1 = x + off
  const hx2 = x + pw - off
  const hy1 = y + off
  const hy2 = y + ph - off
  p.push(steppedHole(hx1, hy1, s), steppedHole(hx2, hy1, s), steppedHole(hx1, hy2, s), steppedHole(hx2, hy2, s))
  // 寸法: 60 / 60 / ピッチ 40
  p.push(extLine(x, y + ph, x, y + ph + 5.5), extLine(x + pw, y + ph, x + pw, y + ph + 5.5))
  p.push(dimH(x, x + pw, y + ph + 4.5, "60"))
  p.push(extLine(x + pw, y, x + pw + 5.5, y), extLine(x + pw, y + ph, x + pw + 5.5, y + ph))
  p.push(dimV(x + pw + 4.5, y, y + ph, "60"))
  p.push(extLine(hx1, y, hx1, y - 3.4), extLine(hx2, y, hx2, y - 3.4))
  p.push(dimH(hx1, hx2, y - 2.2, `${BASE_PLATE.holePitch}`, { size: 2.8 }))

  // 側面図（右）: プレート t6＋柱＋ビス頭
  const sx = x + pw + 12
  const st = BASE_PLATE.t / s // 3
  const sy = y + ph - st
  p.push(rect(sx, sy, pw, st, THICK_W, "#ffffff"))
  // 柱（上へ）
  p.push(rect(sx + pw / 2 - fbT / 2, y + 6, fbT, sy - y - 6, MID_W, "#ffffff"))
  // 板厚注記（3mm 幅に矢印が入らないため文字で示す）
  p.push(text(sx + pw + 1.5, sy + st - 0.5, "t6", { size: 2.8, fill: "#374151" }))

  // 穴・ビス注記
  p.push(
    text(x, y + ph + 10.5, `4-φ${HOLE_INNER}（座ぐり φ${HOLE_OUTER}・段付き穴）`, { size: 2.8, fill: "#374151" }),
    text(x, y + ph + 14.7, `${SCREW_LABEL} ×${BASE_PLATE.screws}本／箇所`, { size: 2.8, fill: "#374151" }),
  )
  return p.join("")
}

// ── 詳細 B: 壁付け座金（正面図＋側面図） ──────────────────
function detailB(x: number, y: number, s: number): string {
  const p: string[] = []
  const pw = WALL_PLATE.w / s // 40
  const ph = WALL_PLATE.h / s // 12.5
  p.push(viewTitle(x, y - 7, "詳細 B ── 壁付け座金", `S=${scaleLabel(s)}`))

  // 正面図
  p.push(rect(x, y, pw, ph, THICK_W, "#ffffff"))
  // 手すり端部断面 FB9×38 → 正面には 9 幅で現れる（中央・塗り）
  const fbT = 9 / s
  p.push(rect(x + pw / 2 - fbT / 2, y, fbT, ph, MID_W, "#d1d5db"))
  // 段付き穴 ×2（端から 8mm・高さ中央）
  const edge = WALL_PLATE.holeEdge / s // 4
  const cy = y + ph / 2
  p.push(steppedHole(x + edge, cy, s), steppedHole(x + pw - edge, cy, s))
  // 寸法: 80 / 25 / 端から 8
  p.push(extLine(x, y + ph, x, y + ph + 5.5), extLine(x + pw, y + ph, x + pw, y + ph + 5.5))
  p.push(dimH(x, x + pw, y + ph + 4.5, "80"))
  p.push(extLine(x + pw, y, x + pw + 5.5, y), extLine(x + pw, y + ph, x + pw + 5.5, y + ph))
  p.push(dimV(x + pw + 4.5, y, y + ph, "25", { size: 2.8 }))
  p.push(extLine(x + edge, y, x + edge, y - 3.4), extLine(x + pw - edge, y, x + pw - edge, y - 3.4))
  p.push(dimH(x, x + edge, y - 2.2, "8", { size: 2.8 }))
  p.push(dimH(x + pw - edge, x + pw, y - 2.2, "8", { size: 2.8 }))

  // 側面図（右）: プレート t6 が壁面に付く
  const sx = x + pw + 12
  const st = WALL_PLATE.t / s // 3
  p.push(rect(sx, y, st, ph, THICK_W, "#ffffff"))
  p.push(line(sx + st + 0.8, y - 1.5, sx + st + 0.8, y + ph + 1.5, MID_W)) // 壁面
  p.push(hatch(sx + st + 0.8, y - 1.5, sx + st + 0.8, y + ph + 1.5, 1, 2.4, 2.4))
  // 板厚注記（3mm 幅に矢印が入らないため文字で示す）
  p.push(text(sx + st / 2, y + ph + 4.6, "t6", { size: 2.8, anchor: "middle", fill: "#374151" }))

  // 穴・ビス注記
  p.push(
    text(x, y + ph + 10.5, `2-φ${HOLE_INNER}（座ぐり φ${HOLE_OUTER}・段付き穴）`, { size: 2.8, fill: "#374151" }),
    text(x, y + ph + 14.7, `${SCREW_LABEL} ×${WALL_PLATE.screws}本`, { size: 2.8, fill: "#374151" }),
  )
  return p.join("")
}

export function buildStairDrawingSvg(svg: SVGSVGElement, opts: StairDrawingOpts): void {
  const {
    steps, risersMm, treadMm, kekomiMm, lastTreadMm, railHeightMm,
    crossbarCount, crossbarMaterial, color, postCount,
    totalRiseMm, runMm, diagonalMm,
  } = opts

  svg.setAttribute("viewBox", `0 0 ${SHEET_VB_W} ${SHEET_VB_H}`)
  svg.classList.add("cad-sheet")

  // ── mm プロファイルの構築（実寸） ──
  const going = Math.max(1, treadMm - kekomiMm) // 段鼻〜段鼻の水平ピッチ
  const noseX: number[] = []
  const noseY: number[] = []
  let cx = 0
  let cy = 0
  for (let i = 0; i < steps; i++) {
    cy += risersMm[i] ?? risersMm[risersMm.length - 1] ?? LAURENT.defaults.riserMm
    if (i > 0) cx += going
    noseX.push(cx)
    noseY.push(cy)
  }
  const wallX = noseX[steps - 1] + lastTreadMm
  const wallY = noseY[steps - 1] // = totalRise
  const contentW = wallX // = A
  const contentH = wallY + railHeightMm // 床〜壁側の手すり上端

  // ── シートレイアウト（紙 mm） ──
  // 左: 側面図。右: 詳細 A / 詳細 B / 表題欄
  const mainLeft = 22 // 左に総高さ寸法の余白
  const mainRight = 172
  const mainTop = 22 // 上に全長寸法の余白
  const floorMm = 138 // 床ラインの紙上 Y
  const availW = mainRight - mainLeft
  const availH = floorMm - mainTop

  const S = pickScale(contentW, contentH, availW, availH)
  const drawnW = contentW / S
  const originX = mainLeft + (availW - drawnW) / 2
  const X = (mmX: number) => originX + mmX / S
  const Y = (mmY: number) => floorMm - mmY / S

  const parts: string[] = []
  parts.push(sheetFrame())
  parts.push(viewTitle(10, 12, "側面図", `S=${scaleLabel(S)}`))

  // ── 床・壁（切断ハッチングつき） ──
  const floorX1 = X(0) - 10
  const floorX2 = X(wallX) + 4
  parts.push(line(floorX1, floorMm, floorX2, floorMm, MID_W))
  parts.push(hatch(floorX1, floorMm, floorX2, floorMm, 1, 4, 3))
  const wallTopY = Y(contentH) - 6
  parts.push(line(X(wallX), wallTopY, X(wallX), floorMm, MID_W))
  parts.push(hatch(X(wallX), wallTopY, X(wallX), floorMm, -1, 4, 3))
  parts.push(text(X(wallX) + 4, (wallTopY + Y(wallY)) / 2, "壁", { size: 3.15, fill: "#4b5563" }))

  // ── 階段プロファイル ──
  const poly: string[] = []
  const pt = (xMm: number, yMm: number) => `${mm(X(xMm)).toFixed(1)},${mm(Y(yMm)).toFixed(1)}`
  poly.push(pt(0, 0))
  for (let i = 0; i < steps; i++) {
    poly.push(pt(noseX[i], noseY[i]))
    const nextX = i < steps - 1 ? noseX[i + 1] : wallX
    poly.push(pt(nextX, noseY[i]))
  }
  poly.push(pt(wallX, 0))
  parts.push(
    `<polygon points="${poly.join(" ")}" fill="${LIGHT_FILL}" stroke="${INK}" stroke-width="${MID_W}" stroke-linejoin="round" />`,
  )

  // ── 手すり（笠木）＋柱＋座金 ──
  const firstPostX = noseX[0] + going / 2 // 1段目踏み板の中央
  const railAt = (mmX: number) => {
    const t = (mmX - noseX[0]) / (wallX - noseX[0])
    return noseY[0] + (wallY - noseY[0]) * t + railHeightMm
  }
  const railTopWallY = railAt(wallX)
  const railW = Math.max(1.6, mm(38 / S)) // FB38（側面幅）を紙上の実寸線幅へ
  // 笠木
  parts.push(
    `<line x1="${mm(X(firstPostX)).toFixed(1)}" y1="${mm(Y(railAt(firstPostX))).toFixed(1)}" x2="${mm(X(wallX)).toFixed(1)}" y2="${mm(Y(railTopWallY)).toFixed(1)}" stroke="${INK}" stroke-width="${railW}" stroke-linecap="round" />`,
  )
  // 柱の位置一覧（1本目＋5段ごと）
  const postXs: number[] = [firstPostX]
  const postYs: number[] = [noseY[0]]
  for (let p = 1; p < postCount; p++) {
    const idx = Math.min(steps - 1, p * LAURENT.stepsPerPost)
    const px = idx < steps - 1 ? noseX[idx] + going / 2 : noseX[idx] + lastTreadMm / 2
    postXs.push(px)
    postYs.push(noseY[idx])
  }
  postXs.forEach((px, i) => {
    parts.push(
      `<line x1="${mm(X(px)).toFixed(1)}" y1="${mm(Y(railAt(px))).toFixed(1)}" x2="${mm(X(px)).toFixed(1)}" y2="${mm(Y(postYs[i])).toFixed(1)}" stroke="${INK}" stroke-width="${railW * 0.85}" />`,
    )
    // 柱脚座金（60 幅 × t6 実寸）
    const pw = BASE_PLATE.w / S
    const pt6 = Math.max(0.8, BASE_PLATE.t / S)
    parts.push(rect(X(px) - pw / 2, Y(postYs[i]) - pt6, pw, pt6, THIN_W, INK))
  })
  // 壁付け座金（80 縦 × t6 実寸・手すり端部）
  {
    const ph = WALL_PLATE.w / S
    const pt6 = Math.max(0.8, WALL_PLATE.t / S)
    parts.push(rect(X(wallX) - pt6, Y(railTopWallY) - ph / 2, pt6, ph, THIN_W, INK))
  }

  // ── 横桟 ──
  if (crossbarCount > 0) {
    const cbW = crossbarMaterial === "flat" ? railW * 0.7 : railW * 0.55
    for (let k = 1; k <= crossbarCount; k++) {
      const f = k / (crossbarCount + 1)
      const yA = railAt(firstPostX) - f * railHeightMm
      const yB = railTopWallY - f * railHeightMm
      parts.push(
        `<line x1="${mm(X(firstPostX)).toFixed(1)}" y1="${mm(Y(yA)).toFixed(1)}" x2="${mm(X(wallX)).toFixed(1)}" y2="${mm(Y(yB)).toFixed(1)}" stroke="${INK}" stroke-width="${cbW}" stroke-linecap="round" opacity="0.85" />`,
      )
    }
  }

  // ── 詳細参照（風船 A / B） ──
  parts.push(detailBalloon(X(firstPostX), Y(noseY[0]), X(firstPostX) - 12, Y(noseY[0]) + 8, "A"))
  parts.push(detailBalloon(X(wallX) - 1, Y(railTopWallY), X(wallX) - 12, Y(railTopWallY) - 9, "B"))

  // ── 寸法線 ──
  // A 総幅（床下）
  const aY = floorMm + 9
  parts.push(extLine(X(0), floorMm + 1, X(0), aY + 1.5), extLine(X(wallX), floorMm + 1, X(wallX), aY + 1.5))
  parts.push(dimH(X(0), X(wallX), aY, `設置範囲 A＝${fmt(runMm)}`))
  // 総高さ（左）
  const hX = X(0) - 9
  parts.push(extLine(X(0) - 1, floorMm, hX - 1.5, floorMm))
  parts.push(line(hX - 1.5, Y(wallY), X(wallX), Y(wallY), THIN_W, "4 3"))
  parts.push(dimV(hX, Y(wallY), floorMm, `床〜最上段 ${fmt(totalRiseMm)}`))
  // 手すり高さ（1本目の柱に沿って）
  const rhX = X(firstPostX) - 5
  parts.push(dimV(rhX, Y(railAt(firstPostX)), Y(noseY[0]), `手すり高さ ${railHeightMm}`, { size: 2.8 }))
  // 全長（笠木の上に平行）
  {
    const offset = 8
    const ang = Math.atan2(Y(railTopWallY) - Y(railAt(firstPostX)), X(wallX) - X(firstPostX))
    const ox = offset * Math.sin(ang)
    const oy = -offset * Math.cos(ang)
    parts.push(
      dimAligned(
        X(firstPostX) + ox, Y(railAt(firstPostX)) + oy,
        X(wallX) + ox, Y(railTopWallY) + oy,
        `手摺全長 約${fmt(diagonalMm)}`,
      ),
    )
  }
  // 蹴上げ・踏み面の代表寸法（風船 A と離すため 3 段目付近・段数が少なければ 2 段目）
  if (steps >= 2) {
    const i = Math.min(2, steps - 1)
    const rx = X(noseX[i]) + 3
    parts.push(dimV(rx + 2.6, Y(noseY[i]), Y(noseY[i - 1]), "", { size: 2.8 }))
    parts.push(text(rx + 4, (Y(noseY[i]) + Y(noseY[i - 1])) / 2 + 1, `蹴上げ ${risersMm[i] ?? risersMm[0]}`, { size: 2.8 }))
    const ty = Y(noseY[i - 1]) + 3.4
    parts.push(dimH(X(noseX[i - 1]), X(noseX[i]), ty, "", { size: 2.8 }))
    parts.push(text((X(noseX[i - 1]) + X(noseX[i])) / 2, ty + 3.4, `踏み面 ${treadMm}`, { size: 2.8, anchor: "middle" }))
  }

  // ── 注記 ──
  const crossbarText =
    crossbarCount > 0 ? `横桟 ${crossbarCount}本（${LAURENT.crossbar[crossbarMaterial].label}）` : "横桟なし"
  const riserText = risersMm.every((r) => r === risersMm[0])
    ? `${risersMm[0]}mm（全段一律）`
    : `${risersMm.join("/")}mm（段別）`
  parts.push(
    noteBlock(10, 152, [
      `段数 ${steps}段・柱 ${postCount}本（1本目＝1段目踏板中央・以降${LAURENT.stepsPerPost}段ごと・上端は壁付け）`,
      `蹴上げ ${riserText}／踏み面 ${treadMm}mm／蹴込み ${kekomiMm}mm／最終段の踏み面 D＝${lastTreadMm}mm`,
      `手すり高さは段鼻から笠木上端まで ${railHeightMm}mm。${crossbarText}。`,
      `本図は入力寸法から自動生成した参考図です。製作時に現場状況へ合わせて微調整します。`,
      `A4 横・倍率100%（拡大縮小なし）で印刷すると尺度どおりに出力されます。`,
    ]),
  )

  // ── 詳細図・表題欄（右列） ──
  const DETAIL_SCALE = 2
  parts.push(detailA(190, 18, DETAIL_SCALE))
  parts.push(detailB(190, 78, DETAIL_SCALE))

  const colorText = color === "white" ? "マットホワイト" : "マットブラック"
  const totalScrews = postCount * BASE_PLATE.screws + WALL_PLATE.screws
  parts.push(
    titleBlock(SHEET_W_MM - FRAME_MM - 2, SHEET_H_MM - FRAME_MM - 2, {
      productName: "Laurent ローラン 階段手摺",
      drawingNo: `IW-LAU-${todayText().replace(/-/g, "")}`,
      scaleText: `${scaleLabel(S)}（詳細図 ${scaleLabel(DETAIL_SCALE)}）`,
      material: "フラットバー 9×38（無垢鉄）",
      finish: `2液型ウレタン塗装 ${colorText}`,
      accessories: `${SCREW_LABEL} ×${totalScrews}本`,
      dateText: todayText(),
    }),
  )

  svg.innerHTML = parts.join("")
}
