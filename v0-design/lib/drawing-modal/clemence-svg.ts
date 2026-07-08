// Clémence（L型トイレ手すり）の設計図 SVG ビルダー（JIS 製図風・cad-sheet.ts ベース）
//
// お客様が入力した寸法（横W×縦H）とブラケット3点の位置から、A4 横の図面シートを組み立てる。
// A4 横・倍率 100% で印刷すると表題欄の尺度どおりの実寸図になる。
//
// 構成:
//   左     — 正面図（標準縮尺を自動選択）＋寸法線＋注記
//   右上   — 詳細 A: ブラケット座金 φ45・ビス穴×3・タッピング M4×40 ×3（S=1:1）
//   右中   — 側面図（参考）: 壁〜手すり外面 D=62mm・丸棒 22φ（S=1:2）
//   右下   — 表題欄
//
// ブラケットの実物仕様（2026-07-09 蠣﨑さん回答）:
// - 座金 φ45mm・ビス穴×3・タッピングビス M4×40 ×3本／箇所
// - 標準位置: 横部2点が 910 間隔（壁下地の尺モジュール）＋縦部上部に1点
// - 位置は壁下地（柱・間柱 455/910 ピッチ）に合わせてお客様指定可（補強板不要）

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
  extLine,
  detailBalloon,
  viewTitle,
  titleBlock,
  noteBlock,
  todayText,
} from "./cad-sheet"

export interface ClemenceDrawingOpts {
  wMm: number // 横部の長さ（縦部外面〜開放端）
  hMm: number // 縦部の高さ（横部下面〜上端）
  b1Mm: number // ブラケット1: 横部・開放端からの距離
  b2Mm: number // ブラケット2: 横部・開放端からの距離（b1 より奥）
  b3Mm: number // ブラケット3: 縦部・上端からの距離
}

const BAR_D = 22 // 丸棒 22φ
const BRACKET_D = 45 // 座金 φ45
const BRACKET_SCREWS = 3
const SCREW_LABEL = "タッピングねじ M4×40"
const WALL_TO_FACE = 62 // 壁面〜手すり外面 D
const CORNER_R = 60 // コーナー曲げ半径（中心線・作画用）

const fmt = (n: number) => Math.round(n).toLocaleString()

// ── 詳細 A: ブラケット座金 φ45（S=1:1） ──────────────────
function detailA(x: number, y: number): string {
  const p: string[] = []
  const r = BRACKET_D / 2 // 22.5（S=1:1 なので紙 mm ＝実寸）
  const cx = x + r
  const cy = y + r
  p.push(viewTitle(x, y - 5, "詳細 A ── ブラケット座金", "S=1:1"))
  p.push(circle(cx, cy, r, THICK_W, "#ffffff"))
  // 丸棒 22φ の通過位置（中央・塗り）
  p.push(circle(cx, cy, BAR_D / 2, MID_W, "#d1d5db"))
  // ビス穴 ×3（120° 等配・作画上 PCD30 想定）
  for (let i = 0; i < BRACKET_SCREWS; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / BRACKET_SCREWS
    const hx = cx + 15 * Math.cos(a)
    const hy = cy + 15 * Math.sin(a)
    p.push(circle(hx, hy, 2.2, THIN_W))
    p.push(line(hx - 3.2, hy, hx + 3.2, hy, THIN_W, "2.5 1.8"))
    p.push(line(hx, hy - 3.2, hx, hy + 3.2, THIN_W, "2.5 1.8"))
  }
  // φ45 寸法（右下へ斜め引出し・見出しと重ならない位置）
  p.push(line(cx + r * 0.71, cy + r * 0.71, cx + r + 6, cy + r + 3, THIN_W))
  p.push(text(cx + r + 6.5, cy + r + 4, `φ${BRACKET_D}`, { size: 3.15 }))
  // 注記
  p.push(text(x, y + BRACKET_D + 6.5, `ビス穴 ×${BRACKET_SCREWS}（${SCREW_LABEL} 用）`, { size: 2.8, fill: "#374151" }))
  p.push(text(x, y + BRACKET_D + 10.7, `${SCREW_LABEL} ×${BRACKET_SCREWS}本／箇所`, { size: 2.8, fill: "#374151" }))
  return p.join("")
}

// ── 側面図（参考）: 壁〜手すり D=62（S=1:2） ──────────────
function sideView(x: number, y: number): string {
  const s = 2
  const p: string[] = []
  p.push(viewTitle(x, y - 5, "側面図（参考）", `S=${scaleLabel(s)}`))
  const wallX = x // 壁面
  const H = 40 // 表示高さ（紙 mm）
  p.push(line(wallX, y, wallX, y + H, MID_W))
  // 壁ハッチ（壁の左側＝躯体側へ）
  for (let yy = y + 3; yy < y + H; yy += 3) {
    p.push(line(wallX, yy, wallX - 2.6, yy + 2.6, THIN_W))
  }
  const cy = y + H / 2
  // 座金（壁面に付く円板 t5 相当）＋アーム＋丸棒
  const plateT = 5 / s
  const plateH = BRACKET_D / s
  p.push(rect(wallX, cy - plateH / 2, plateT, plateH, MID_W, "#ffffff", 1))
  const barR = BAR_D / 2 / s
  const barCx = wallX + (WALL_TO_FACE - BAR_D / 2) / s // 外面が壁から 62
  p.push(rect(wallX + plateT, cy - 6 / s, barCx - wallX - plateT - barR + 2 / s, 12 / s, MID_W, "#ffffff"))
  p.push(circle(barCx, cy, barR, THICK_W, "#ffffff"))
  p.push(text(barCx + barR + 2, cy + 1, `${BAR_D}φ`, { size: 2.8, fill: "#374151" }))
  // D=62 寸法（壁面〜手すり外面）
  const dy = cy + plateH / 2 + 6
  p.push(extLine(wallX, cy, wallX, dy + 1.5))
  p.push(extLine(barCx + barR, cy, barCx + barR, dy + 1.5))
  p.push(dimH(wallX, barCx + barR, dy, `D=${WALL_TO_FACE}`, { size: 2.8 }))
  return p.join("")
}

export function buildClemenceDrawingSvg(svg: SVGSVGElement, opts: ClemenceDrawingOpts): void {
  const { wMm, hMm } = opts
  // ブラケット位置（安全のため作画側でもクランプ）
  const b1 = Math.min(Math.max(opts.b1Mm, 30), wMm - 30)
  const b2 = Math.min(Math.max(opts.b2Mm, b1 + 60), wMm - 30)
  const b3 = Math.min(Math.max(opts.b3Mm, 30), hMm - 60)

  svg.setAttribute("viewBox", `0 0 ${SHEET_VB_W} ${SHEET_VB_H}`)
  svg.classList.add("cad-sheet")

  // ── シートレイアウト（紙 mm） ──
  const mainLeft = 24
  const mainRight = 172
  const mainTop = 30
  const mainBottom = 128
  const availW = mainRight - mainLeft
  const availH = mainBottom - mainTop

  const S = pickScale(wMm, hMm, availW, availH)
  const originX = mainLeft + (availW - wMm / S) / 2
  const originY = mainTop + (availH - hMm / S) / 2 + hMm / S // 図の下端（横部下面）
  // 実寸 mm → 紙 mm。x: 縦部外面=0 → 右へ / y: 横部下面=0 → 上へ
  const X = (v: number) => originX + v / S
  const Y = (v: number) => originY - v / S

  const parts: string[] = []
  parts.push(sheetFrame())
  parts.push(viewTitle(10, 12, "正面図", `S=${scaleLabel(S)}`))

  // ── 手すり本体（丸棒 22φ・L 型・コーナー R） ──
  const c = BAR_D / 2 // 中心線オフセット
  const barW = Math.max(1.6, mm(BAR_D / S))
  const rC = CORNER_R
  const path =
    `M ${mm(X(c)).toFixed(1)} ${mm(Y(hMm)).toFixed(1)} ` +
    `L ${mm(X(c)).toFixed(1)} ${mm(Y(c + rC)).toFixed(1)} ` +
    `A ${mm(rC / S).toFixed(1)} ${mm(rC / S).toFixed(1)} 0 0 0 ${mm(X(c + rC)).toFixed(1)} ${mm(Y(c)).toFixed(1)} ` +
    `L ${mm(X(wMm)).toFixed(1)} ${mm(Y(c)).toFixed(1)}`
  // 座金 φ45（バーの下に描く → バー本体で中央が隠れる描き順）
  const brackets: Array<[number, number]> = [
    [wMm - b1, c], // 横部・開放端から b1
    [wMm - b2, c], // 横部・開放端から b2
    [c, hMm - b3], // 縦部・上端から b3
  ]
  brackets.forEach(([bx, by]) => {
    parts.push(circle(X(bx), Y(by), BRACKET_D / 2 / S, MID_W, "#e5e7eb"))
  })
  parts.push(`<path d="${path}" fill="none" stroke="${INK}" stroke-width="${barW}" stroke-linecap="butt" />`)
  // 中心線（細・一点鎖線風）
  parts.push(line(X(c), Y(hMm) + 1.5, X(c), Y(c) - 1.5, THIN_W, "6 2 1.5 2"))
  parts.push(line(X(c) - 1.5, Y(c), X(wMm) + 1.5, Y(c), THIN_W, "6 2 1.5 2"))

  // ── 寸法線 ──
  // W（下）: 縦部外面 → 開放端
  const wy = Y(0) + 10
  parts.push(extLine(X(0), Y(0), X(0), wy + 1.5), extLine(X(wMm), Y(c) + BAR_D / 2 / S, X(wMm), wy + 1.5))
  parts.push(dimH(X(0), X(wMm), wy, `横 W=${fmt(wMm)}`))
  // H（左）: 横部下面 → 縦部上端
  const hx = X(0) - 9
  parts.push(extLine(X(0), Y(0), hx - 1.5, Y(0)), extLine(X(c) - BAR_D / 2 / S, Y(hMm), hx - 1.5, Y(hMm)))
  parts.push(dimV(hx, Y(hMm), Y(0), `縦 H=${fmt(hMm)}`))
  // ブラケット位置（横部・開放端から）: b1 / b2 を上側にチェーン寸法
  const by = Y(c) - BAR_D / 2 / S - 7
  parts.push(extLine(X(wMm), Y(c) - BAR_D / 2 / S, X(wMm), by - 1.5))
  parts.push(extLine(X(wMm - b1), Y(c) - BRACKET_D / 2 / S, X(wMm - b1), by - 1.5))
  parts.push(extLine(X(wMm - b2), Y(c) - BRACKET_D / 2 / S, X(wMm - b2), by - 1.5))
  parts.push(dimH(X(wMm - b1), X(wMm), by, fmt(b1), { size: 2.8 }))
  parts.push(dimH(X(wMm - b2), X(wMm - b1), by, fmt(b2 - b1), { size: 2.8 }))
  // ブラケット位置（縦部・上端から）
  const bx2 = X(c) + BRACKET_D / 2 / S + 7
  parts.push(extLine(X(c), Y(hMm), bx2 + 1.5, Y(hMm)))
  parts.push(extLine(X(c) + BRACKET_D / 2 / S, Y(hMm - b3), bx2 + 1.5, Y(hMm - b3)))
  parts.push(dimV(bx2, Y(hMm), Y(hMm - b3), fmt(b3), { size: 2.8 }))
  parts.push(text(bx2 + 2, Y(hMm - b3) + 5, "（上端から）", { size: 2.5, fill: "#6b7280" }))

  // 22φ 引出し（縦部から L の内側へ・下の W 寸法と重ならない位置）
  {
    const ly = Y(hMm * 0.55)
    parts.push(line(X(c) + BAR_D / 2 / S, ly, X(c) + 12, ly - 6, THIN_W))
    parts.push(text(X(c) + 12.6, ly - 6.8, `丸棒 ${BAR_D}φ`, { size: 2.8 }))
  }
  // 詳細 A 参照（縦部のブラケット）
  parts.push(detailBalloon(X(c), Y(hMm - b3), X(c) - 12, Y(hMm - b3) - 9, "A"))

  // ── 注記 ──
  parts.push(
    noteBlock(10, 146, [
      `サイズ 横 W=${fmt(wMm)} × 縦 H=${fmt(hMm)}mm（500×1,000mm まで一律料金）。`,
      `ブラケット 3 点・座金 φ${BRACKET_D}。位置は壁下地（柱・間柱 455/910 ピッチ）に合わせて指定できます（補強板不要）。`,
      `固定は ${SCREW_LABEL} ×${BRACKET_SCREWS}本／箇所（計 ${BRACKET_SCREWS * 3}本・付属）。`,
      `本図は入力寸法から自動生成した参考図です。ハンドメイドのため製作時に多少の誤差があります。`,
      `A4 横・倍率100%（拡大縮小なし）で印刷すると尺度どおりに出力されます。`,
    ]),
  )

  // ── 詳細図・側面図・表題欄（右列） ──
  parts.push(detailA(196, 18))
  parts.push(sideView(196, 92))

  parts.push(
    titleBlock(SHEET_W_MM - FRAME_MM - 2, SHEET_H_MM - FRAME_MM - 2, {
      productName: "Clémence クレマンス L型手すり",
      drawingNo: `IW-CLE-${todayText().replace(/-/g, "")}`,
      scaleText: `${scaleLabel(S)}（詳細図 1:1・側面図 1:2）`,
      material: `丸棒 ${BAR_D}φ（無垢鉄・鍛造）`,
      finish: "2液型ウレタン艶消し黒 古美仕上げ",
      accessories: `${SCREW_LABEL} ×${BRACKET_SCREWS * 3}本`,
      dateText: todayText(),
    }),
  )

  svg.innerHTML = parts.join("")
}
