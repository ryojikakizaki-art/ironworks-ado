// CAD 図面シート共通モジュール（JIS 製図風）
//
// 全商品の「設計図 PDF」を同じ約束事で描くための土台。
//   - 用紙: A4 横。viewBox は「紙の mm × PX_PER_MM」で組む（1 単位 = 0.25mm）
//   - 印刷: globals.css の @media print + モーダル側 @page (A4 landscape, margin 8.5mm)
//           で SVG を実寸 280mm 幅に出力する → 表題欄の尺度が紙の上で実際に合う
//   - 図枠(JIS Z 8311 風)・表題欄(Z 8312 風)・寸法線(Z 8316 風)・注記をここで共通化
//   - 線の太さ: 太線(外形) 0.5mm / 細線(寸法・引出) 0.18mm 相当
//   - 文字: 寸法 3.15mm / 注記 3.15mm / 表題 4〜5mm（JIS 推奨サイズ系列）
//
// 座標系はすべて「紙の mm」。ヘルパー mm() で viewBox 単位へ変換する。

export const SHEET_W_MM = 280
export const SHEET_H_MM = 193
export const PX_PER_MM = 4
export const SHEET_VB_W = SHEET_W_MM * PX_PER_MM // 1120
export const SHEET_VB_H = SHEET_H_MM * PX_PER_MM // 772

// 図枠の内側余白（枠線は用紙端から 3mm）
export const FRAME_MM = 3

export const INK = "#111827" // 外形・文字
export const THIN_W = 0.75 // 細線 (viewBox 単位 ≒ 0.19mm)
export const THICK_W = 2 // 太線 (≒ 0.5mm)
export const MID_W = 1.3 // 中線 (≒ 0.33mm)

export const FONT = "'Helvetica Neue',Arial,'Hiragino Kaku Gothic ProN',sans-serif"

/** 紙 mm → viewBox 単位 */
export const mm = (v: number): number => v * PX_PER_MM

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export interface TextOpts {
  size?: number // 文字高さ mm（既定 3.15）
  anchor?: "start" | "middle" | "end"
  fill?: string
  rotate?: number // 度。指定座標を中心に回転
  bold?: boolean
}

/** テキスト（座標は紙 mm） */
export function text(xMm: number, yMm: number, s: string, opts: TextOpts = {}): string {
  const { size = 3.15, anchor = "start", fill = INK, rotate, bold } = opts
  const x = mm(xMm)
  const y = mm(yMm)
  const tf = rotate != null ? ` transform="rotate(${rotate} ${x.toFixed(1)} ${y.toFixed(1)})"` : ""
  const fw = bold ? ` font-weight="600"` : ""
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${mm(size).toFixed(1)}" fill="${fill}" text-anchor="${anchor}" font-family="${FONT}"${fw}${tf}>${esc(s)}</text>`
}

/** 直線（座標は紙 mm） */
export function line(x1: number, y1: number, x2: number, y2: number, w = THIN_W, dash?: string): string {
  const d = dash ? ` stroke-dasharray="${dash}"` : ""
  return `<line x1="${mm(x1).toFixed(1)}" y1="${mm(y1).toFixed(1)}" x2="${mm(x2).toFixed(1)}" y2="${mm(y2).toFixed(1)}" stroke="${INK}" stroke-width="${w}"${d} />`
}

/** 長方形（座標は紙 mm・rx は角丸半径 mm） */
export function rect(x: number, y: number, w: number, h: number, strokeW = THICK_W, fill = "none", rx?: number): string {
  const r = rx ? ` rx="${mm(rx).toFixed(1)}"` : ""
  return `<rect x="${mm(x).toFixed(1)}" y="${mm(y).toFixed(1)}" width="${mm(w).toFixed(1)}" height="${mm(h).toFixed(1)}"${r} fill="${fill}" stroke="${INK}" stroke-width="${strokeW}" />`
}

/** 円（座標は紙 mm） */
export function circle(cx: number, cy: number, r: number, strokeW = MID_W, fill = "none", dash?: string): string {
  const d = dash ? ` stroke-dasharray="${dash}"` : ""
  return `<circle cx="${mm(cx).toFixed(1)}" cy="${mm(cy).toFixed(1)}" r="${mm(r).toFixed(1)}" fill="${fill}" stroke="${INK}" stroke-width="${strokeW}"${d} />`
}

/** 楕円（座標は紙 mm。rotateDeg 指定で cx,cy を中心に回転） */
export function ellipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  strokeW = MID_W,
  fill = "none",
  rotateDeg?: number,
): string {
  const tf = rotateDeg ? ` transform="rotate(${rotateDeg} ${mm(cx).toFixed(1)} ${mm(cy).toFixed(1)})"` : ""
  return `<ellipse cx="${mm(cx).toFixed(1)}" cy="${mm(cy).toFixed(1)}" rx="${mm(rx).toFixed(1)}" ry="${mm(ry).toFixed(1)}" fill="${fill}" stroke="${INK}" stroke-width="${strokeW}"${tf} />`
}

/** 用紙背景＋図枠 */
export function sheetFrame(): string {
  return (
    `<rect x="0" y="0" width="${SHEET_VB_W}" height="${SHEET_VB_H}" fill="#ffffff" />` +
    rect(FRAME_MM, FRAME_MM, SHEET_W_MM - FRAME_MM * 2, SHEET_H_MM - FRAME_MM * 2, THICK_W)
  )
}

// ── 尺度 ──────────────────────────────────────────────

/** JIS Z 8314 の標準縮尺分母（1:n） */
const STD_SCALES = [1, 2, 2.5, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100]

/**
 * 実寸 (realW×realH mm) が紙上の枠 (availW×availH mm) に収まる最小の標準縮尺分母を返す。
 */
export function pickScale(realW: number, realH: number, availW: number, availH: number): number {
  for (const s of STD_SCALES) {
    if (realW / s <= availW && realH / s <= availH) return s
  }
  return STD_SCALES[STD_SCALES.length - 1]
}

export function scaleLabel(s: number): string {
  return s === 1 ? "1:1" : `1:${s % 1 === 0 ? s : s.toFixed(1)}`
}

// ── 寸法線（JIS Z 8316 風: 細線・両端矢・寸法値は線の上側） ──

const ARROW_MM = 2.2

function arrowHead(xMm: number, yMm: number, angRad: number): string {
  const a = mm(ARROW_MM)
  const spread = 0.28
  const x = mm(xMm)
  const y = mm(yMm)
  const p1x = x + a * Math.cos(angRad + spread)
  const p1y = y + a * Math.sin(angRad + spread)
  const p2x = x + a * Math.cos(angRad - spread)
  const p2y = y + a * Math.sin(angRad - spread)
  return `<path d="M ${x.toFixed(1)} ${y.toFixed(1)} L ${p1x.toFixed(1)} ${p1y.toFixed(1)} L ${p2x.toFixed(1)} ${p2y.toFixed(1)} Z" fill="${INK}" />`
}

/** 寸法線本体: p1→p2 の直線＋両端矢（塗り矢・JIS 風） */
export function dimLine(x1: number, y1: number, x2: number, y2: number): string {
  const ang = Math.atan2(y2 - y1, x2 - x1)
  return line(x1, y1, x2, y2, THIN_W) + arrowHead(x1, y1, ang) + arrowHead(x2, y2, ang + Math.PI)
}

/** 寸法補助線（対象から寸法線まで少しはみ出す細線） */
export function extLine(x1: number, y1: number, x2: number, y2: number): string {
  return line(x1, y1, x2, y2, THIN_W)
}

export interface DimOpts {
  size?: number
  /** 寸法値を線からどれだけ離すか mm（既定 1.2） */
  gap?: number
}

/** 水平寸法: y の高さに x1→x2 の寸法線＋上側中央に寸法値 */
export function dimH(x1: number, x2: number, y: number, label: string, opts: DimOpts = {}): string {
  const { size = 3.15, gap = 1.2 } = opts
  return dimLine(x1, y, x2, y) + text((x1 + x2) / 2, y - gap, label, { size, anchor: "middle" })
}

/** 垂直寸法: x の位置に y1→y2 の寸法線＋左側中央に寸法値（縦書き回転） */
export function dimV(x: number, y1: number, y2: number, label: string, opts: DimOpts = {}): string {
  const { size = 3.15, gap = 1.2 } = opts
  const cy = (y1 + y2) / 2
  return dimLine(x, y1, x, y2) + text(x - gap, cy, label, { size, anchor: "middle", rotate: -90 })
}

/** 斜め寸法: p1→p2 に沿った寸法線＋線上側に寸法値（線と同角度） */
export function dimAligned(x1: number, y1: number, x2: number, y2: number, label: string, opts: DimOpts = {}): string {
  const { size = 3.15, gap = 1.6 } = opts
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  const rad = ((ang - 90) * Math.PI) / 180
  const tx = cx + gap * Math.cos(rad)
  const ty = cy + gap * Math.sin(rad)
  return dimLine(x1, y1, x2, y2) + text(tx, ty, label, { size, anchor: "middle", rotate: ang })
}

// ── 詳細図参照（風船記号） ──────────────────────────────

/** 詳細箇所の参照円＋引出線＋文字（"A" など） */
export function detailBalloon(
  targetX: number,
  targetY: number,
  balloonX: number,
  balloonY: number,
  letter: string,
  targetRadius = 2.4,
): string {
  return (
    circle(targetX, targetY, targetRadius, THIN_W) +
    line(targetX, targetY, balloonX, balloonY, THIN_W) +
    circle(balloonX, balloonY, 3.4, MID_W, "#ffffff") +
    text(balloonX, balloonY + 1.15, letter, { size: 3.5, anchor: "middle", bold: true })
  )
}

/** 詳細図の見出し（例: "詳細 A（柱脚座金） S=1:2"） */
export function viewTitle(x: number, y: number, title: string, scaleTxt?: string): string {
  const label = scaleTxt ? `${title}　${scaleTxt}` : title
  return text(x, y, label, { size: 3.5, bold: true })
}

// ── 表題欄（JIS Z 8312 風・右下） ──────────────────────

export interface TitleBlockData {
  productName: string // 品名（例: Laurent ローラン 階段手摺）
  drawingNo: string // 図番（例: IW-LAU-20260709）
  scaleText: string // 尺度（例: 1:20（詳細図 1:2））
  material: string // 材質
  finish: string // 仕上げ
  accessories: string // 付属品（ビス等）
  dateText: string // 作成日
}

export const TITLE_BLOCK_W = 94
export const TITLE_BLOCK_ROW_H = 6.4

/**
 * 表題欄を右下に描く。返り値は [svg, 高さmm]。
 * 構成: 社名バンド＋品名バンド＋明細 6 行（図番/尺度/材質/仕上げ/付属品/投影・単位・日付）
 */
export function titleBlock(rightMm: number, bottomMm: number, d: TitleBlockData): string {
  const rows: Array<[string, string]> = [
    ["図番", d.drawingNo],
    ["尺度", d.scaleText],
    ["材質", d.material],
    ["仕上げ", d.finish],
    ["付属品", d.accessories],
    ["投影法・単位", `第三角法 ／ mm ／ ${d.dateText}`],
  ]
  const bandH = 8
  const h = bandH * 2 + rows.length * TITLE_BLOCK_ROW_H
  const x = rightMm - TITLE_BLOCK_W
  const y = bottomMm - h
  const labelW = 22

  const parts: string[] = []
  parts.push(rect(x, y, TITLE_BLOCK_W, h, MID_W, "#ffffff"))
  // 社名バンド
  parts.push(line(x, y + bandH, x + TITLE_BLOCK_W, y + bandH, MID_W))
  parts.push(text(x + 2.5, y + bandH - 2.3, "IRONWORKS ado ── 鍛鉄工房 ZEST", { size: 3.5, bold: true }))
  // 品名バンド
  parts.push(line(x, y + bandH * 2, x + TITLE_BLOCK_W, y + bandH * 2, MID_W))
  parts.push(text(x + 2.5, y + bandH * 2 - 2.3, d.productName, { size: 4, bold: true }))
  // 明細行
  rows.forEach(([label, value], i) => {
    const ry = y + bandH * 2 + (i + 1) * TITLE_BLOCK_ROW_H
    if (i < rows.length - 1) parts.push(line(x, ry, x + TITLE_BLOCK_W, ry, THIN_W))
    parts.push(text(x + 2.5, ry - 1.9, label, { size: 2.8, fill: "#4b5563" }))
    parts.push(text(x + labelW, ry - 1.9, value, { size: 3.15 }))
  })
  // ラベル列の縦罫
  parts.push(line(x + labelW - 2, y + bandH * 2, x + labelW - 2, y + h, THIN_W))
  return parts.join("")
}

// ── 注記 ──────────────────────────────────────────────

/** 注記ブロック（番号付き）。lines は「1.」抜きの本文 */
export function noteBlock(x: number, y: number, lines: string[], heading = "注記"): string {
  const parts: string[] = [text(x, y, heading, { size: 3.15, bold: true })]
  lines.forEach((s, i) => {
    parts.push(text(x, y + 5 + i * 4.6, `${i + 1}. ${s}`, { size: 3.15, fill: "#374151" }))
  })
  return parts.join("")
}

/** 図面作成日（今日）を YYYY-MM-DD で返す */
export function todayText(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
