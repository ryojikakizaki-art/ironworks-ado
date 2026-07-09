// Clémence（トイレ手すり・緩やか曲線タイプ）の設計図 SVG ビルダー（JIS 製図風・cad-sheet.ts ベース）
//
// お客様が入力した寸法（横W×縦H）とブラケット位置から、A4 横の図面シートを組み立てる。
// A4 横・倍率 100% で印刷すると表題欄の尺度どおりの実寸図になる。
//
// 形状（2026-07-09 蠣﨑さん指示・商品サムネイル準拠）:
// - 直角の L 型ではなく、上端の座金から緩やかに 45° 方向へ曲がって下り、
//   水平部へつながる曲線。水平部の先端は軽く上へ反って終わる
// - ブラケット3点: ①バー上端（座金にバー端が付く）／②③は壁下地に合わせ
//   ①から右へ水平距離で指定（基本 455 / 910 ＝ 下地の尺モジュールピッチ）
//
// ブラケットの実物仕様（2026-07-09 蠣﨑さん回答）:
// - 座金 φ45mm・ビス穴×3・タッピングビス M4×40 ×3本／箇所
// - 座金間は基本 455（横方向・壁下地ピッチ）。位置はお客様指定可（補強板不要）

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
  wMm: number // 横部の長さ（上端の座金〜開放端の水平距離）
  hMm: number // 縦の高さ（水平部の下面〜バー上端）
  x2Mm: number // ブラケット②: ①（上端座金）から右への水平距離
  x3Mm: number // ブラケット③: ①（上端座金）から右への水平距離
}

const BAR_D = 22 // 丸棒 22φ
const BRACKET_D = 45 // 座金 φ45
const BRACKET_SCREWS = 3
const SCREW_LABEL = "タッピングねじ M4×40"
const WALL_TO_FACE = 62 // 壁面〜手すり外面 D
const C = BAR_D / 2 // 中心線オフセット

const fmt = (n: number) => Math.round(n).toLocaleString()

// ── 手すり中心線の形状（実寸 mm・y 上向き・原点＝①座金の x / 水平部バー下面の y） ──
//
// 上端 P0=(0, H-11) から右へ出て、S 字（3次ベジェ）で 45° 方向に緩やかに下り、
// x=xm で水平（y=11）に合流 → 水平直線 → 先端は軽く上へ反る。

export interface ClemenceShape {
  xm: number // 曲線が水平に合流する x
  curlStart: number // 先端の反り上がり開始 x
  y0: number // 上端中心線の y (= H - 11)
}

export function clemenceShape(wMm: number, hMm: number): ClemenceShape {
  const y0 = hMm - C
  // 下りカーブの水平スパン: 高低差の約1.2倍で「45°の緩やかな曲がり」に見せる。
  // 横幅が小さいときは 6 割まで圧縮してでも収める。
  const xm = Math.min(Math.max((y0 - C) * 1.2, 120), wMm * 0.62)
  const curlStart = wMm - 60
  return { xm, curlStart, y0 }
}

/** 中心線の y(x)（実寸）。ベジェ部は t を二分法で解く */
export function clemencePathY(wMm: number, hMm: number, x: number): number {
  const { xm, y0 } = clemenceShape(wMm, hMm)
  if (x <= 0) return y0
  if (x >= xm) return C
  // C(P0,(0.45xm,y0),(0.55xm,C),(xm,C)) の x(t) は単調増加
  const bez = (t: number, a: number, b: number, c2: number, d: number) =>
    (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c2 + t ** 3 * d
  let lo = 0
  let hi = 1
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (bez(mid, 0, 0.45 * xm, 0.55 * xm, xm) < x) lo = mid
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
): string {
  const { xm, curlStart, y0 } = clemenceShape(wMm, hMm)
  const f = (v: number) => v.toFixed(1)
  return (
    `M ${f(X(0))} ${f(Y(y0))} ` +
    `C ${f(X(0.45 * xm))} ${f(Y(y0))} ${f(X(0.55 * xm))} ${f(Y(C))} ${f(X(xm))} ${f(Y(C))} ` +
    `L ${f(X(Math.max(xm, curlStart)))} ${f(Y(C))} ` +
    `Q ${f(X(wMm - 6))} ${f(Y(C))} ${f(X(wMm - 2))} ${f(Y(C + 34))}`
  )
}

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
  const x2 = Math.min(Math.max(opts.x2Mm, 120), wMm - 170)
  const x3 = Math.min(Math.max(opts.x3Mm, x2 + 100), wMm - 70)

  svg.setAttribute("viewBox", `0 0 ${SHEET_VB_W} ${SHEET_VB_H}`)
  svg.classList.add("cad-sheet")

  // ── シートレイアウト（紙 mm） ──
  const mainLeft = 24
  const mainRight = 172
  const mainTop = 30
  const mainBottom = 122
  const availW = mainRight - mainLeft
  const availH = mainBottom - mainTop

  const S = pickScale(wMm, hMm, availW, availH)
  const originX = mainLeft + (availW - wMm / S) / 2
  const originY = mainTop + (availH - hMm / S) / 2 + hMm / S // 図の下端（水平部バー下面）
  // 実寸 mm → 紙 mm。x: ①座金=0 → 右へ / y: 水平部バー下面=0 → 上へ
  const X = (v: number) => originX + v / S
  const Y = (v: number) => originY - v / S

  const parts: string[] = []
  parts.push(sheetFrame())
  parts.push(viewTitle(10, 12, "正面図", `S=${scaleLabel(S)}`))

  // ── ブラケット座金 φ45（バーの下に描く → バー本体で中央が隠れる描き順） ──
  const brackets: Array<[number, number]> = [
    [0, clemencePathY(wMm, hMm, 0)], // ① バー上端
    [x2, clemencePathY(wMm, hMm, x2)],
    [x3, clemencePathY(wMm, hMm, x3)],
  ]
  brackets.forEach(([bx, by]) => {
    parts.push(circle(X(bx), Y(by), BRACKET_D / 2 / S, MID_W, "#e5e7eb"))
  })

  // ── 手すり本体（丸棒 22φ・緩やか曲線） ──
  const barW = Math.max(1.6, mm(BAR_D / S))
  const dPath = clemencePathD(wMm, hMm, (v) => mm(X(v)), (v) => mm(Y(v)))
  parts.push(`<path d="${dPath}" fill="none" stroke="${INK}" stroke-width="${barW}" stroke-linecap="round" />`)

  // ── 寸法線 ──
  // ブラケット位置チェーン（下段・①基準の水平距離）
  const cy1 = Y(0) + 8
  parts.push(extLine(X(0), Y(clemencePathY(wMm, hMm, 0)) + BRACKET_D / 2 / S, X(0), cy1 + 1.5))
  parts.push(extLine(X(x2), Y(clemencePathY(wMm, hMm, x2)) + BRACKET_D / 2 / S, X(x2), cy1 + 1.5))
  parts.push(extLine(X(x3), Y(C), X(x3), cy1 + 1.5))
  parts.push(extLine(X(wMm), Y(C + 20), X(wMm), cy1 + 1.5))
  parts.push(dimH(X(0), X(x2), cy1, fmt(x2), { size: 2.8 }))
  parts.push(dimH(X(x2), X(x3), cy1, fmt(x3 - x2), { size: 2.8 }))
  parts.push(dimH(X(x3), X(wMm), cy1, fmt(wMm - x3), { size: 2.8 }))
  // W 総幅（さらに下段）
  const wy = cy1 + 9
  parts.push(extLine(X(0), cy1 + 1.5, X(0), wy + 1.5), extLine(X(wMm), cy1 + 1.5, X(wMm), wy + 1.5))
  parts.push(dimH(X(0), X(wMm), wy, `横 W=${fmt(wMm)}`))
  // H（左）: 水平部下面 → バー上端
  const hx = X(0) - 11
  parts.push(extLine(X(0) - BRACKET_D / 2 / S, Y(0), hx - 1.5, Y(0)))
  parts.push(extLine(X(0), Y(hMm), hx - 1.5, Y(hMm)))
  parts.push(dimV(hx, Y(hMm), Y(0), `縦 H=${fmt(hMm)}`))

  // 22φ 引出し（水平部の中ほどから右下へ）
  {
    const lx = X((x2 + x3) / 2 + (x3 - x2) * 0.2)
    parts.push(line(lx, Y(C), lx + 6, Y(C) - 8, THIN_W))
    parts.push(text(lx + 6.6, Y(C) - 8.8, `丸棒 ${BAR_D}φ`, { size: 2.8 }))
  }
  // ブラケット番号ラベル（座金の近く。①は詳細A風船・手すり線と重ならない右横に離して置く）
  parts.push(text(X(0) + BRACKET_D / 2 / S + 8, Y(clemencePathY(wMm, hMm, 0)) - 6, "①", { size: 3.15 }))
  parts.push(text(X(x2) - BRACKET_D / 2 / S - 2, Y(clemencePathY(wMm, hMm, x2)) - 3, "②", { size: 3.15, anchor: "end" }))
  parts.push(text(X(x3), Y(C) - BRACKET_D / 2 / S - 2.5, "③", { size: 3.15, anchor: "middle" }))
  // 詳細 A 参照（①の座金）
  parts.push(detailBalloon(X(0), Y(clemencePathY(wMm, hMm, 0)), X(0) - 13, Y(clemencePathY(wMm, hMm, 0)) - 11, "A"))

  // ── 注記 ──
  parts.push(
    noteBlock(10, 146, [
      `サイズ 横 W=${fmt(wMm)} × 縦 H=${fmt(hMm)}mm（500×1,000mm まで一律料金）。曲線形状は参考（鍛造の手仕事による）。`,
      `ブラケット 3 点・座金 φ${BRACKET_D}。①＝バー上端。②③は①からの水平距離で、壁下地（柱・間柱 455/910 ピッチ）に合わせて指定できます（補強板不要）。`,
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
      productName: "Clémence クレマンス トイレ手すり",
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
