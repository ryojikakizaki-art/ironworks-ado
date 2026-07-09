// Clémence（トイレ手すり・緩やか曲線タイプ）の設計図 SVG ビルダー（JIS 製図風・cad-sheet.ts ベース）
//
// お客様が入力した寸法（横W×縦H）とブラケット位置・延長オプションから、A4 横の図面シートを組み立てる。
// A4 横・倍率 100% で印刷すると表題欄の尺度どおりの実寸図になる。
//
// 形状（2026-07-09 蠣﨑さん指示・添付参考図準拠）:
// - 上端の座金B（楕円）からほぼ垂直に近い角度で下り始め、S字を描いて滑らかに水平部へ合流する。
//   水平部の先端（③側）は延長分だけ伸ばせ、末端は下向きに軽く曲げ下げる
// - 座金A（②③・丸型）は手すりの下面に φ9 の支柱で接続（横型手すり René と同一部材）
// - 座金B（①・楕円）は手すり上端に直接付く壁フランジ
//
// 座金の実物仕様（2026-07-09 蠣﨑さん回答・既存 specs 欄「座金A×3本／座金B×2本」の内訳確定）:
// - 座金A（②③・丸型）: φ45・段付き穴×3（PCD27・4.5φ-7φ）・支柱φ9で手すり下面に接続。
//   横型手すり René 等と共通部材（lib/drawing-modal/rene-svg.ts の座金描画と同一寸法）
// - 座金B（①・楕円）: 47(縦・長径)×25(横・短径)・段付き穴×2（ピッチ34・4.5φ-7φ）・手すり上端に直付け
// - 固定は 4.5φ-7φ段付き穴 共通 → タッピングねじ M4×40（座金A 3本／座金B 2本＝1台あたり計8本）
//
// サイズ・延長オプション（2026-07-09 蠣﨑さん回答）:
// - 標準は横 W 950〜1,000mm（950mm未満は形状の都合上お問い合わせ）
// - ③側は最大 +200mm まで延長可（+¥3,000）。延長分は③から先の水平区間が伸びるだけで、
//   ①②③のブラケット位置（W基準）は変わらない

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
  circle,
  ellipse,
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
  wMm: number // 横部の基準長さ（①〜③の配置基準。延長は含まない）
  hMm: number // 縦の高さ（水平部の下面〜①上端）
  x2Mm: number // 座金A②: ①（上端）から右への水平距離
  x3Mm: number // 座金A③: ①（上端）から右への水平距離
  extensionMm: number // ③側の延長（0〜200mm）
}

export const BASE_PRICE = 88000
export const EXTENSION_MAX_MM = 200
export const EXTENSION_PRICE = 3000
export const W_STANDARD_MIN = 950 // これ未満は要問合せ（形状の都合上）

const BAR_D = 22 // 丸棒 22φ
const C = BAR_D / 2 // 中心線オフセット
const HOLE_INNER = 4.5
const HOLE_OUTER = 7
const HOLE_LABEL = `${HOLE_INNER}φ-${HOLE_OUTER}φ段付き穴`
const SCREW_LABEL = "タッピングねじ M4×40"

// 座金A（②③・丸型・René 等横型手すりと共通部材）
const PLATE_A = { d: 45, pcd: 27, screws: 3, postD: 9 }
// 座金B（①・楕円・手すり上端の壁フランジ）
const PLATE_B = { w: 25, h: 47, holePitch: 34, screws: 2 }

const WALL_TO_FACE = 62 // 壁面〜手すり外面 D（注記に参考表記のみ・専用図は省略）

const fmt = (n: number) => Math.round(n).toLocaleString()

// ── 手すり中心線の形状 ──────────────────────────────────
//
// 参考図（トイレ手すり）準拠: P0=(0, y0) の①座金Bから水平に出て、
// 均等な S 字で下り、x=xm で水平（y=C）へ滑らかに合流する（両端とも接線は水平）。
// その後水平直線が続き、x=curlStart から先で下向きに軽く曲げ下げて終端する
// （③側・延長分はここが伸びる）。参考図では H=500 に対し下り区間の水平スパン≈400。

export interface ClemenceShape {
  xm: number // 曲線が水平に合流する x（W 基準・延長の影響を受けない）
  curlStart: number // 末端の下げ曲げ開始 x（延長を含む全長基準）
  totalW: number // 全長（W + 延長）
  y0: number // ①中心の y (= H - C)
}

export function clemenceShape(wMm: number, hMm: number, extensionMm = 0): ClemenceShape {
  const y0 = hMm - C
  // S字下り区間の水平スパン。参考図の比率＝高低差×約0.8（H500 → 約400）。
  // W が小さいときは 0.55W まで圧縮してでも収める。
  const xm = Math.min(Math.max((y0 - C) * 0.8, 110), wMm * 0.55)
  const totalW = wMm + Math.max(0, extensionMm)
  const curlStart = totalW - 50
  return { xm, curlStart, totalW, y0 }
}

/** 中心線の y(x)（実寸）。S字部はベジェを二分法で解く */
export function clemencePathY(wMm: number, hMm: number, x: number, extensionMm = 0): number {
  const { xm, y0 } = clemenceShape(wMm, hMm, extensionMm)
  if (x <= 0) return y0
  if (x >= xm) return C
  // P0=(0,y0) P1=(0.45xm,y0) P2=(0.55xm,C) P3=(xm,C) — 両端の接線が水平な均等S字
  const bez = (t: number, a: number, b: number, c2: number, d: number) =>
    (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c2 + t ** 3 * d
  const bezX = (t: number) => bez(t, 0, 0.45 * xm, 0.55 * xm, xm)
  let lo = 0
  let hi = 1
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (bezX(mid) < x) lo = mid
    else hi = mid
  }
  const t = (lo + hi) / 2
  return bez(t, y0, y0, C, C)
}

/**
 * 中心線のパス d 文字列。X/Y は実寸→描画座標への変換関数。
 * 図面ビルダーと商品ページのミニ図解の両方で使う（形状の二重管理を防ぐ）。
 */
export function clemencePathD(
  wMm: number,
  hMm: number,
  X: (v: number) => number,
  Y: (v: number) => number,
  extensionMm = 0,
): string {
  const { xm, curlStart, totalW, y0 } = clemenceShape(wMm, hMm, extensionMm)
  const f = (v: number) => v.toFixed(1)
  return (
    `M ${f(X(0))} ${f(Y(y0))} ` +
    `C ${f(X(0.45 * xm))} ${f(Y(y0))} ${f(X(0.55 * xm))} ${f(Y(C))} ${f(X(xm))} ${f(Y(C))} ` +
    `L ${f(X(Math.max(xm, curlStart)))} ${f(Y(C))} ` +
    `Q ${f(X(totalW - 5))} ${f(Y(C))} ${f(X(totalW - 1))} ${f(Y(C + 30))}`
  )
}

// ── 詳細 A: 座金A（丸型・φ45・PCD27・支柱φ9でバー下面に接続。S=1:1） ──────
function detailA(x: number, y: number): string {
  const p: string[] = []
  const r = PLATE_A.d / 2 // 22.5（S=1:1）
  const cx = x + r
  const cy = y + r
  p.push(viewTitle(x, y - 5, "詳細 A ── 座金A（丸型）", "S=1:1"))
  p.push(circle(cx, cy, r, THICK_W, "#ffffff"))
  // 段付き穴 ×3（PCD27・90/210/330°。René と同一配置）
  const holeR = PLATE_A.pcd / 2
  ;[90, 210, 330].forEach((deg) => {
    const rad = (deg * Math.PI) / 180
    const hx = cx + holeR * Math.cos(rad)
    const hy = cy + holeR * Math.sin(rad)
    p.push(circle(hx, hy, HOLE_OUTER / 2, THIN_W))
    p.push(circle(hx, hy, HOLE_INNER / 2, THIN_W))
  })
  // φ45 寸法（右下へ斜め引出し）
  p.push(line(cx + r * 0.71, cy + r * 0.71, cx + r + 6, cy + r + 3, THIN_W))
  p.push(text(cx + r + 6.5, cy + r + 4, `φ${PLATE_A.d}`, { size: 3.15 }))
  // 注記（1 行にまとめて縦スペースを節約。支柱φ9でバー下面に接続する模式は側面図省略・注記のみ）
  p.push(text(x, y + PLATE_A.d + 7, `PCD${PLATE_A.pcd}・${HOLE_LABEL}×${PLATE_A.screws}・M4×40×${PLATE_A.screws}・支柱${PLATE_A.postD}φ`, { size: 2.6, fill: "#374151" }))
  return p.join("")
}

// ── 詳細 B: 座金B（楕円・47×25・穴ピッチ34。S=1:1） ──────────────────
function detailB(x: number, y: number): string {
  const p: string[] = []
  const rx = PLATE_B.w / 2 // 12.5
  const ry = PLATE_B.h / 2 // 23.5
  const cx = x + rx
  const cy = y + ry
  p.push(viewTitle(x, y - 5, "詳細 B ── 座金B（楕円）", "S=1:1"))
  p.push(ellipse(cx, cy, rx, ry, THICK_W, "#ffffff"))
  // 段付き穴 ×2（縦ピッチ34・中心対称）
  const hy1 = cy - PLATE_B.holePitch / 2
  const hy2 = cy + PLATE_B.holePitch / 2
  p.push(circle(cx, hy1, HOLE_OUTER / 2, THIN_W), circle(cx, hy1, HOLE_INNER / 2, THIN_W))
  p.push(circle(cx, hy2, HOLE_OUTER / 2, THIN_W), circle(cx, hy2, HOLE_INNER / 2, THIN_W))
  p.push(extLine(cx, hy1, cx + rx + 6, hy1), extLine(cx, hy2, cx + rx + 6, hy2))
  p.push(dimV(cx + rx + 5, hy1, hy2, `${PLATE_B.holePitch}`, { size: 2.8 }))
  // 注記（1 行にまとめて縦スペースを節約。47×25 は寸法線でなく注記で表記）
  p.push(text(x, cy + ry + 7, `外形${PLATE_B.w}×${PLATE_B.h}・${HOLE_LABEL}×${PLATE_B.screws}・M4×40×${PLATE_B.screws}`, { size: 2.6, fill: "#374151" }))
  return p.join("")
}

export function buildClemenceDrawingSvg(svg: SVGSVGElement, opts: ClemenceDrawingOpts): void {
  const { wMm, hMm, extensionMm } = opts
  const x2 = Math.min(Math.max(opts.x2Mm, 120), wMm - 170)
  const x3 = Math.min(Math.max(opts.x3Mm, x2 + 100), wMm - 70)
  const { totalW } = clemenceShape(wMm, hMm, extensionMm)

  svg.setAttribute("viewBox", `0 0 ${SHEET_VB_W} ${SHEET_VB_H}`)
  svg.classList.add("cad-sheet")

  // ── シートレイアウト（紙 mm） ──
  const mainLeft = 24
  const mainRight = 172
  const mainTop = 30
  const mainBottom = 122
  const availW = mainRight - mainLeft
  const availH = mainBottom - mainTop

  const S = pickScale(totalW, hMm, availW, availH)
  const originX = mainLeft + (availW - totalW / S) / 2
  const originY = mainTop + (availH - hMm / S) / 2 + hMm / S
  const X = (v: number) => originX + v / S
  const Y = (v: number) => originY - v / S

  const parts: string[] = []
  parts.push(sheetFrame())
  parts.push(viewTitle(10, 12, "正面図", `S=${scaleLabel(S)}`))

  // ── 座金A（②③・丸型・バー下面に接続）: バーの下に描く ──
  ;[x2, x3].forEach((bx) => {
    const by = clemencePathY(wMm, hMm, bx, extensionMm)
    parts.push(circle(X(bx), Y(by) + PLATE_A.d / 2 / S, PLATE_A.d / 2 / S, MID_W, "#e5e7eb"))
    parts.push(line(X(bx), Y(by), X(bx), Y(by) + PLATE_A.d / S, THIN_W))
  })

  // ── 手すり本体（丸棒 22φ・S字＋延長） ──
  const barW = Math.max(1.6, mm(BAR_D / S))
  const dPath = clemencePathD(wMm, hMm, (v) => mm(X(v)), (v) => mm(Y(v)), extensionMm)
  parts.push(`<path d="${dPath}" fill="none" stroke="${INK}" stroke-width="${barW}" stroke-linecap="round" />`)

  // ── 座金B（①・楕円・上端に直付け） ──
  {
    const y0 = clemencePathY(wMm, hMm, 0, extensionMm)
    const rxMm = PLATE_B.w / 2 / S
    const ryMm = PLATE_B.h / 2 / S
    parts.push(ellipse(X(0), Y(y0) - ryMm + C / S, rxMm, ryMm, THIN_W, "#e5e7eb"))
  }

  // ── 寸法線 ──
  // ブラケット位置チェーン（下段・①基準の水平距離）
  const cy1 = Y(0) + 8
  parts.push(extLine(X(0), Y(clemencePathY(wMm, hMm, 0, extensionMm)), X(0), cy1 + 1.5))
  parts.push(extLine(X(x2), Y(clemencePathY(wMm, hMm, x2, extensionMm)) + PLATE_A.d / S, X(x2), cy1 + 1.5))
  parts.push(extLine(X(x3), Y(C) + PLATE_A.d / S, X(x3), cy1 + 1.5))
  parts.push(extLine(X(wMm), Y(C), X(wMm), cy1 + 1.5))
  parts.push(dimH(X(0), X(x2), cy1, fmt(x2), { size: 2.8 }))
  parts.push(dimH(X(x2), X(x3), cy1, fmt(x3 - x2), { size: 2.8 }))
  parts.push(dimH(X(x3), X(wMm), cy1, fmt(wMm - x3), { size: 2.8 }))
  // W 総幅（基準・延長は含まない）
  const wy = cy1 + 9
  parts.push(extLine(X(0), cy1 + 1.5, X(0), wy + 1.5), extLine(X(wMm), cy1 + 1.5, X(wMm), wy + 1.5))
  parts.push(dimH(X(0), X(wMm), wy, `横 W=${fmt(wMm)}`))
  // 延長寸法（wMm 〜 totalW）
  if (extensionMm > 0) {
    parts.push(extLine(X(wMm), cy1 + 1.5, X(wMm), wy + 1.5), extLine(X(totalW), Y(C) + 2, X(totalW), wy + 1.5))
    parts.push(dimH(X(wMm), X(totalW), wy, `延長 +${fmt(extensionMm)}`, { size: 2.8 }))
  }
  // H（左）: 水平部下面 → ①上端
  const hx = X(0) - 11
  parts.push(extLine(X(0) - PLATE_B.w / 2 / S, Y(0), hx - 1.5, Y(0)))
  parts.push(extLine(X(0), Y(hMm), hx - 1.5, Y(hMm)))
  parts.push(dimV(hx, Y(hMm), Y(0), `縦 H=${fmt(hMm)}`))

  // 22φ 引出し（水平部の中ほどから右下へ）
  {
    const lx = X((x2 + x3) / 2 + (x3 - x2) * 0.2)
    parts.push(line(lx, Y(C), lx + 6, Y(C) - 8, THIN_W))
    parts.push(text(lx + 6.6, Y(C) - 8.8, `丸棒 ${BAR_D}φ`, { size: 2.8 }))
  }
  // ブラケット番号ラベル
  parts.push(text(X(0) + PLATE_B.w / 2 / S + 8, Y(clemencePathY(wMm, hMm, 0, extensionMm)) - 6, "①", { size: 3.15 }))
  parts.push(text(X(x2) - PLATE_A.d / 2 / S - 2, Y(clemencePathY(wMm, hMm, x2, extensionMm)) + PLATE_A.d / S, "②", { size: 3.15, anchor: "end" }))
  parts.push(text(X(x3), Y(C) + PLATE_A.d / S + 6, "③", { size: 3.15, anchor: "middle" }))
  // 詳細 A/B 参照
  parts.push(detailBalloon(X(x2), Y(clemencePathY(wMm, hMm, x2, extensionMm)) + PLATE_A.d / S, X(x2) + 14, Y(clemencePathY(wMm, hMm, x2, extensionMm)) + PLATE_A.d / S + 10, "A"))
  parts.push(detailBalloon(X(0), Y(clemencePathY(wMm, hMm, 0, extensionMm)), X(0) - 13, Y(clemencePathY(wMm, hMm, 0, extensionMm)) - 11, "B"))

  // ── 注記 ──
  const extText = extensionMm > 0 ? `③側を+${fmt(extensionMm)}mm延長（最大200mm・+¥3,000）。` : "延長オプションなし。"
  parts.push(
    noteBlock(10, 146, [
      `サイズ 横 W=${fmt(wMm)} × 縦 H=${fmt(hMm)}mm（標準950〜1,000mm・一律料金）。${extText}`,
      `座金A（②③・丸型φ45・PCD27・段付き穴×3・支柱φ9でバー下面に接続）／座金B（①・楕円47×25・段付き穴×2・ピッチ34・バー上端に直付け）。`,
      `②③は①からの水平距離で、壁下地（柱・間柱 455/910 ピッチ）に合わせて指定できます（補強板不要）。`,
      `固定は ${SCREW_LABEL}。座金A 3本／箇所・座金B 2本（計 ${PLATE_A.screws * 2 + PLATE_B.screws}本・付属）。壁面〜手すり外面の目安 D≈${WALL_TO_FACE}mm。`,
      `本図は入力寸法から自動生成した参考図です。ハンドメイドのため製作時に多少の誤差があります。W950mm未満はお問い合わせください。`,
      `A4 横・倍率100%（拡大縮小なし）で印刷すると尺度どおりに出力されます。`,
    ]),
  )

  // ── 詳細図・表題欄（右列） ──
  parts.push(detailA(196, 10))
  parts.push(detailB(196, 74))

  parts.push(
    titleBlock(SHEET_W_MM - FRAME_MM - 2, SHEET_H_MM - FRAME_MM - 2, {
      productName: "Clémence クレマンス トイレ手すり",
      drawingNo: `IW-CLE-${todayText().replace(/-/g, "")}`,
      scaleText: `${scaleLabel(S)}（詳細図 A・B 1:1）`,
      material: `丸棒 ${BAR_D}φ（無垢鉄・鍛造）`,
      finish: "2液型ウレタン艶消し黒 古美仕上げ",
      accessories: `M4×40 ×${PLATE_A.screws * 2 + PLATE_B.screws}本（座金A3・座金B2）`,
      dateText: todayText(),
    }),
  )

  svg.innerHTML = parts.join("")
}
