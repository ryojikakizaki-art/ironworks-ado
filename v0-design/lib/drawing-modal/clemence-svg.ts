// Clémence（トイレ手すり・緩やか曲線タイプ）の設計図 SVG ビルダー（JIS 製図風・cad-sheet.ts ベース）
//
// お客様が入力した寸法（横W×縦H）とブラケット位置・延長オプションから、A4 横の図面シートを組み立てる。
// A4 横・倍率 100% で印刷すると表題欄の尺度どおりの実寸図になる。
//
// 形状（2026-07-09 蠣﨑さん指示・添付参考図準拠）:
// - 上端の座金B（楕円）から水平に出て、均等な S 字で下り水平部へ滑らかに合流する曲線。
//   末端（③側）は下向きに軽く曲げ下げる。③側は延長分だけ水平区間が伸びる
//
// 座金の実物仕様（2026-07-09 蠣﨑さん・CAD 図面で確定）:
// - 座金A（②③・丸型）: 丸プレート φ45・t4.5・穴 4.5φ×3（2 上・1 下）・支柱 13mm でバー下面に接続。
//   側面は L 型グースネック（出寸法 51mm・全幅 62=22+40mm・プレート 45mm 高）
// - 座金B（①・楕円）: 楕円プレート 25×60mm・t4.5・穴 4.5φ×3・バーが中心を貫通（玉継手）。
//   側面は玉継手＋ストレートアーム（全幅 62=22+40mm・プレート 60mm 高）
// - 穴は 4.5φ 通し穴。ビスはタッピング M4×40、各座金 3 本／箇所（3 点で計 9 本・付属）
//
// サイズ・延長（2026-07-09 蠣﨑さん回答）:
// - 標準は横 W 950〜1,000mm（950mm 未満はお問い合わせ）
// - ③側は最大 +200mm まで延長可。追加金額は従量（+200mm で上限 +¥3,000）

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
export const EXTENSION_PRICE_MAX = 3000 // +200mm 時の上限追加額
export const W_STANDARD_MIN = 950 // これ未満は要問合せ（形状の都合上）

/** ③側延長の追加額（従量・¥100 単位に切り上げ・上限 EXTENSION_PRICE_MAX）。
 *  +200mm で +¥3,000 になる比率（¥15/mm）。0mm なら 0 円。 */
export function calcExtensionPrice(extMm: number): number {
  const e = Math.max(0, Math.min(EXTENSION_MAX_MM, Math.round(extMm)))
  if (e === 0) return 0
  const raw = (e / EXTENSION_MAX_MM) * EXTENSION_PRICE_MAX
  return Math.min(EXTENSION_PRICE_MAX, Math.ceil(raw / 100) * 100)
}

export const BAR_D = 22 // 丸棒 22φ
const C = BAR_D / 2 // 中心線オフセット
const HOLE_D = 4.5 // 通し穴 4.5φ
const SCREW_LABEL = "タッピングねじ M4×40"

// 座金A（②③・丸型・René 等横型手すりと共通部材）
const PLATE_A = {
  d: 45, // プレート外径 φ45
  t: 4.5, // プレート厚
  postD: 13, // 支柱幅 13
  screws: 3, // 穴 4.5φ×3
  holePcd: 32, // 穴 PCD（作画上の想定）
  projection: 51, // 壁面〜バー中心の出寸法
  sideW: 62, // 側面全幅（バー中心22 + バー中心〜壁40）
}
// 座金B（①・楕円・手すり上端の壁フランジ・バー貫通/玉継手）
const PLATE_B = {
  w: 25, // 楕円 短径（横）
  h: 60, // 楕円 長径（縦）
  t: 4.5, // プレート厚
  screws: 3, // 穴 4.5φ×3
  ballD: 13, // 玉継手径
  sideW: 62, // 側面全幅
}

// バー下面〜座金A円までの見え掛かり支柱の長さ（実寸mm）。支柱が図で見えるだけの長さを確保。
export const ROUND_POST_GAP_MM = 12

/** バー中心線から座金A（丸型）の円中心までの実寸オフセット（下方向・mm）。図面・ミニ図解共通。 */
export const ROUND_DISC_OFFSET_MM = BAR_D / 2 + ROUND_POST_GAP_MM + PLATE_A.d / 2
export const PLATE_A_D = PLATE_A.d
export const PLATE_A_POST_D = PLATE_A.postD
export const PLATE_B_W = PLATE_B.w
export const PLATE_B_H = PLATE_B.h

/** バー中心線 Y(by) から座金A（丸型）の円中心までの画面オフセット（下方向・正の値。S=mm/画面単位） */
export function roundDiscCenterOffset(S: number): number {
  return ROUND_DISC_OFFSET_MM / S
}

const WALL_TO_FACE = 62 // 壁面〜手すり外面 D（注記に参考表記のみ）

const fmt = (n: number) => Math.round(n).toLocaleString()

// ── 手すり中心線の形状 ──────────────────────────────────
//
// 参考図（トイレ手すり）準拠: P0=(0, y0) の①座金Bから水平に出て、
// 均等な S 字で下り、x=xm で水平（y=C）へ滑らかに合流する（両端とも接線は水平）。
// その後水平直線が続き、x=curlStart から先で下向きに軽く曲げ下げて終端する。
// 参考図では H=500 に対し下り区間の水平スパン≈600（②座金は下りの途中に付く）。

export interface ClemenceShape {
  xm: number // 曲線が水平に合流する x（W 基準・延長の影響を受けない）
  curlStart: number // 末端の下げ曲げ開始 x（延長を含む全長基準）
  totalW: number // 全長（W + 延長）
  y0: number // ①中心の y (= H - C)
}

export function clemenceShape(wMm: number, hMm: number, extensionMm = 0): ClemenceShape {
  const y0 = hMm - C
  // S字下り区間の水平スパン。参考図の比率＝高低差×約1.2（H500 → 約590）。
  const xm = Math.min(Math.max((y0 - C) * 1.2, 120), wMm * 0.62)
  const totalW = wMm + Math.max(0, extensionMm)
  const curlStart = totalW - 60
  return { xm, curlStart, totalW, y0 }
}

/** 中心線の y(x)（実寸）。S字部はベジェを二分法で解く */
export function clemencePathY(wMm: number, hMm: number, x: number, extensionMm = 0): number {
  const { xm, y0 } = clemenceShape(wMm, hMm, extensionMm)
  if (x <= 0) return y0
  if (x >= xm) return C
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

/** 中心線のパス d 文字列。図面ビルダーとミニ図解の両方で使う（形状の二重管理を防ぐ）。 */
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
    // 末端は下向きに曲げ下げる（y は上向き正なので C-25 ＝ 水平線から 25mm 下）
    `Q ${f(X(totalW - 8))} ${f(Y(C))} ${f(X(totalW))} ${f(Y(C - 25))}`
  )
}

// ── 4.5φ 穴（座付きリング＋中心の塗り＝CAD 図のビス頭表現） ──
function screwHole(cx: number, cy: number, s: number): string {
  return (
    circle(cx, cy, 4.5 / s, THIN_W, "#ffffff") +
    circle(cx, cy, HOLE_D / 2 / s, THIN_W, "#111827")
  )
}

// ── バーの破断線（端部の小さな波線） ──
function breakMark(cx: number, cy: number, hHalf: number): string {
  return (
    `<path d="M ${mm(cx).toFixed(1)} ${mm(cy - hHalf - 1).toFixed(1)} ` +
    `q ${mm(-2).toFixed(1)} ${mm(hHalf * 0.7).toFixed(1)} 0 ${mm(hHalf + 1).toFixed(1)} ` +
    `q ${mm(2).toFixed(1)} ${mm(hHalf * 0.7).toFixed(1)} 0 ${mm(hHalf + 1).toFixed(1)}" ` +
    `fill="none" stroke="${INK}" stroke-width="${THIN_W}" />`
  )
}

// ── 詳細 A: 座金A（丸型・②③）。CAD 図準拠＝側面図（左）＋正面図（右）。 ──
//
// 側面図: 玉22φ → 21 下がって 13 厚の L 型アームが壁へ → プレート 45×t4.5（全幅62=22+40・出51）
// 正面図: バーが上を横断・支柱13がプレート円内へ入り U 字で終わる・穴は上2＋下1
function detailA(x: number, y: number, s: number): string {
  const p: string[] = []
  p.push(viewTitle(x, y - 4, "詳細 A ── 座金A（②③）", `S=${scaleLabel(s)}`))

  // ══ 側面図（左） ══
  const ballR = 11 / s
  const armT = 13 / s
  const ballCx = x + 4 + ballR
  const ballCy = y + 6 + ballR
  const ballLeft = ballCx - ballR
  const wallX = ballLeft + PLATE_A.sideW / s // 62 = 22 + 40
  const plateT = PLATE_A.t / s
  const armTop = ballCy + ballR + 21 / s
  const armBot = armTop + armT
  const armCy = (armTop + armBot) / 2
  const plateH = PLATE_A.d / s
  const plateTop = armCy - plateH / 2
  const neckHalf = armT / 2
  // L 型ネック（玉の下→内側 R で曲がって→壁まで水平）白塗り一体形状
  const rIn = 8 / s
  p.push(
    `<path d="M ${mm(ballCx - neckHalf).toFixed(1)} ${mm(ballCy).toFixed(1)} ` +
      `L ${mm(ballCx - neckHalf).toFixed(1)} ${mm(armBot).toFixed(1)} ` +
      `L ${mm(wallX).toFixed(1)} ${mm(armBot).toFixed(1)} ` +
      `L ${mm(wallX).toFixed(1)} ${mm(armTop).toFixed(1)} ` +
      `L ${mm(ballCx + neckHalf + rIn).toFixed(1)} ${mm(armTop).toFixed(1)} ` +
      `Q ${mm(ballCx + neckHalf).toFixed(1)} ${mm(armTop).toFixed(1)} ${mm(ballCx + neckHalf).toFixed(1)} ${mm(armTop - rIn).toFixed(1)} ` +
      `L ${mm(ballCx + neckHalf).toFixed(1)} ${mm(ballCy).toFixed(1)} Z" ` +
      `fill="#ffffff" stroke="${INK}" stroke-width="${MID_W}" />`,
  )
  // 玉（バー受け 22φ）
  p.push(circle(ballCx, ballCy, ballR, THICK_W, "#ffffff"))
  // 壁プレート 45×t4.5 ＋ 壁ハッチ
  p.push(rect(wallX, plateTop, plateT, plateH, THICK_W, "#ffffff"))
  for (let yy = plateTop - 2; yy < plateTop + plateH + 2; yy += 3) {
    p.push(line(wallX + plateT, yy, wallX + plateT + 2.2, yy - 2.2, THIN_W))
  }
  p.push(line(wallX + plateT, plateTop - 3, wallX + plateT, plateTop + plateH + 3, MID_W))
  // 寸法: 62（上）・45（右）・51（下）・t4.5・22φ
  const dTop = ballCy - ballR - 3
  p.push(extLine(ballLeft, ballCy - ballR, ballLeft, dTop - 1.5))
  p.push(extLine(wallX, plateTop, wallX, dTop - 1.5))
  p.push(dimH(ballLeft, wallX, dTop, `${PLATE_A.sideW}`, { size: 2.6 }))
  p.push(extLine(wallX + plateT, plateTop, wallX + plateT + 4.5, plateTop))
  p.push(extLine(wallX + plateT, plateTop + plateH, wallX + plateT + 4.5, plateTop + plateH))
  p.push(dimV(wallX + plateT + 3.5, plateTop, plateTop + plateH, `${PLATE_A.d}`, { size: 2.6 }))
  const dBot = armBot + 5
  p.push(extLine(ballCx, armBot, ballCx, dBot + 1.5))
  p.push(extLine(wallX, armBot, wallX, dBot + 1.5))
  p.push(dimH(ballCx, wallX, dBot, "51", { size: 2.6 }))
  p.push(text(wallX + plateT + 1, plateTop + plateH + 5, `t${PLATE_A.t}`, { size: 2.4 }))
  p.push(text(ballCx - ballR - 1, ballCy - ballR - 0.5, `${BAR_D}φ`, { size: 2.4, anchor: "end" }))

  // ══ 正面図（右） ══
  const r = PLATE_A.d / 2 / s
  const fCx = wallX + plateT + 12 + r
  const fBarCy = ballCy // バー中心＝側面図の玉中心と同じ高さ
  const barHalf = BAR_D / 2 / s
  // プレート中心＝側面図のアーム中心と同じ高さ関係（バー中心から 21+13/2+11 ≒ 38.5mm 下）
  const plateCy = fBarCy + 38.5 / s
  const barL = fCx - r - 6 / s
  const barR2 = fCx + r + 6 / s
  // プレート円（先に描く）
  p.push(circle(fCx, plateCy, r, THICK_W, "#ffffff"))
  // 穴 4.5φ×3（上2＝±50°・下1＝真下。PCD は作画上 φ30）
  const pcd = 15 / s
  ;[230, 310, 90].forEach((deg) => {
    const rad = (deg * Math.PI) / 180
    p.push(screwHole(fCx + pcd * Math.cos(rad), plateCy + pcd * Math.sin(rad), s))
  })
  // 支柱 13（バー下面からプレート内へ・下端は U 字＝半円）
  const postHalf = PLATE_A.postD / 2 / s
  const postBot = plateCy + 2 / s
  p.push(
    `<path d="M ${mm(fCx - postHalf).toFixed(1)} ${mm(fBarCy + barHalf).toFixed(1)} ` +
      `L ${mm(fCx - postHalf).toFixed(1)} ${mm(postBot - postHalf).toFixed(1)} ` +
      `A ${mm(postHalf).toFixed(1)} ${mm(postHalf).toFixed(1)} 0 0 0 ${mm(fCx + postHalf).toFixed(1)} ${mm(postBot - postHalf).toFixed(1)} ` +
      `L ${mm(fCx + postHalf).toFixed(1)} ${mm(fBarCy + barHalf).toFixed(1)}" ` +
      `fill="#ffffff" stroke="${INK}" stroke-width="${MID_W}" />`,
  )
  // バー（横断・破断線つき）
  p.push(rect(barL, fBarCy - barHalf, barR2 - barL, barHalf * 2, MID_W, "#ffffff"))
  p.push(breakMark(barL, fBarCy, barHalf), breakMark(barR2, fBarCy, barHalf))
  // 寸法: 13（上・支柱幅）・45（下）・4.5φ×3
  const dTop2 = fBarCy - barHalf - 3
  p.push(extLine(fCx - postHalf, fBarCy - barHalf, fCx - postHalf, dTop2 - 1.5))
  p.push(extLine(fCx + postHalf, fBarCy - barHalf, fCx + postHalf, dTop2 - 1.5))
  p.push(dimH(fCx - postHalf, fCx + postHalf, dTop2, `${PLATE_A.postD}`, { size: 2.6 }))
  p.push(extLine(fCx - r, plateCy + r, fCx - r, plateCy + r + 4.5))
  p.push(extLine(fCx + r, plateCy + r, fCx + r, plateCy + r + 4.5))
  p.push(dimH(fCx - r, fCx + r, plateCy + r + 3.5, `${PLATE_A.d}`, { size: 2.6 }))
  // 4.5φ×3 は下の穴から下へ引き出してプレート下・45寸法のさらに下に置く（右隣の詳細Bと重ねない）
  const hBotY = plateCy + pcd
  p.push(line(fCx, hBotY + HOLE_D / 2 / s, fCx + 3, plateCy + r + 6.5, THIN_W))
  p.push(text(fCx + 3.5, plateCy + r + 7.3, `4.5φ×${PLATE_A.screws}`, { size: 2.4 }))
  return p.join("")
}

// ── 詳細 B: 座金B（楕円・①）。CAD 図準拠＝側面図（左）＋正面図（右）。 ──
//
// 側面図: バーが左から来て玉継手 → 13 のストレートアーム → プレート 60×t4.5（全幅62=22+40）
// 正面図: 楕円 25×60・バーが中央を貫通（玉は破線円）・穴は上1＋下1（ピッチ34）
function detailB(x: number, y: number, s: number): string {
  const p: string[] = []
  p.push(viewTitle(x, y - 4, "詳細 B ── 座金B（①）", `S=${scaleLabel(s)}`))

  // ══ 側面図（左） ══
  const ballR = 11 / s
  const barHalf = BAR_D / 2 / s
  const cy = y + 6 + 30 / s // プレート 60 の半分ぶん下げて中心線を決める
  const barLen = 14 / s
  const barLeft = x + 4
  const ballCx = barLeft + barLen + ballR
  const wallX = ballCx - ballR + PLATE_B.sideW / s // 62 = 22 + 40
  const plateT = PLATE_B.t / s
  const plateH = PLATE_B.h / s
  const armT = 13 / s
  // ストレートアーム（玉→壁）
  p.push(rect(ballCx, cy - armT / 2, wallX - ballCx, armT, MID_W, "#ffffff"))
  // バー（左から）＋破断線
  p.push(rect(barLeft, cy - barHalf, barLen + ballR, barHalf * 2, MID_W, "#ffffff"))
  p.push(breakMark(barLeft, cy, barHalf))
  // 玉継手 22φ
  p.push(circle(ballCx, cy, ballR, THICK_W, "#ffffff"))
  // 壁プレート 60×t4.5 ＋ 壁ハッチ
  p.push(rect(wallX, cy - plateH / 2, plateT, plateH, THICK_W, "#ffffff"))
  for (let yy = cy - plateH / 2 - 2; yy < cy + plateH / 2 + 2; yy += 3) {
    p.push(line(wallX + plateT, yy, wallX + plateT + 2.2, yy - 2.2, THIN_W))
  }
  p.push(line(wallX + plateT, cy - plateH / 2 - 3, wallX + plateT, cy + plateH / 2 + 3, MID_W))
  // 寸法: 62（上）・60（右）・22（左）・t4.5
  const dTop = cy - plateH / 2 - 3
  p.push(extLine(ballCx - ballR, cy - ballR, ballCx - ballR, dTop - 1.5))
  p.push(extLine(wallX, cy - plateH / 2, wallX, dTop - 1.5))
  p.push(dimH(ballCx - ballR, wallX, dTop, `${PLATE_B.sideW}`, { size: 2.6 }))
  p.push(extLine(wallX + plateT, cy - plateH / 2, wallX + plateT + 4.5, cy - plateH / 2))
  p.push(extLine(wallX + plateT, cy + plateH / 2, wallX + plateT + 4.5, cy + plateH / 2))
  p.push(dimV(wallX + plateT + 3.5, cy - plateH / 2, cy + plateH / 2, `${PLATE_B.h}`, { size: 2.6 }))
  p.push(extLine(barLeft, cy - barHalf, barLeft - 4.5, cy - barHalf))
  p.push(extLine(barLeft, cy + barHalf, barLeft - 4.5, cy + barHalf))
  p.push(dimV(barLeft - 3.5, cy - barHalf, cy + barHalf, `${BAR_D}`, { size: 2.6 }))
  p.push(text(wallX + plateT + 1, cy + plateH / 2 + 5, `t${PLATE_B.t}`, { size: 2.4 }))

  // ══ 正面図（右） ══
  const rx = PLATE_B.w / 2 / s
  const ry = PLATE_B.h / 2 / s
  const fCx = wallX + plateT + 14 + rx
  const fCy = cy
  // 楕円プレート
  p.push(ellipse(fCx, fCy, rx, ry, THICK_W, "#ffffff"))
  // 穴 4.5φ×2（上・下＝縦並び・ピッチ34）
  const pitchHalf = 34 / 2 / s
  p.push(screwHole(fCx, fCy - pitchHalf, s))
  p.push(screwHole(fCx, fCy + pitchHalf, s))
  // バー貫通（横・中央・破断線つき）
  const fBarL = fCx - rx - 6 / s
  const fBarR = fCx + rx + 6 / s
  p.push(rect(fBarL, fCy - barHalf, fBarR - fBarL, barHalf * 2, MID_W, "#ffffff"))
  p.push(breakMark(fBarL, fCy, barHalf), breakMark(fBarR, fCy, barHalf))
  // 玉（プレート裏・破線円）
  p.push(circle(fCx, fCy, ballR, THIN_W, "none", "2.5 1.8"))
  // 寸法: 25（下）・34（右・穴ピッチ）・4.5φ×3
  p.push(extLine(fCx - rx, fCy + ry, fCx - rx, fCy + ry + 4.5))
  p.push(extLine(fCx + rx, fCy + ry, fCx + rx, fCy + ry + 4.5))
  p.push(dimH(fCx - rx, fCx + rx, fCy + ry + 3.5, `${PLATE_B.w}`, { size: 2.6 }))
  p.push(extLine(fCx, fCy - pitchHalf, fCx + rx + 4.5, fCy - pitchHalf))
  p.push(extLine(fCx, fCy + pitchHalf, fCx + rx + 4.5, fCy + pitchHalf))
  p.push(dimV(fCx + rx + 3.5, fCy - pitchHalf, fCy + pitchHalf, "34", { size: 2.6 }))
  // 4.5φ×3 は下の穴から下へ引き出して 25 寸法のさらに下に置く（左隣の側面図と重ねない）
  p.push(line(fCx, fCy + pitchHalf + HOLE_D / 2 / s, fCx + 3, fCy + ry + 6.5, THIN_W))
  p.push(text(fCx + 3.5, fCy + ry + 7.3, `4.5φ×${PLATE_B.screws}`, { size: 2.4 }))
  return p.join("")
}

export function buildClemenceDrawingSvg(svg: SVGSVGElement, opts: ClemenceDrawingOpts): void {
  const { wMm, hMm, extensionMm } = opts
  const x2 = Math.min(Math.max(opts.x2Mm, 120), wMm - 170)
  const x3 = Math.min(Math.max(opts.x3Mm, x2 + 100), wMm - 70)
  const { totalW } = clemenceShape(wMm, hMm, extensionMm)

  svg.setAttribute("viewBox", `0 0 ${SHEET_VB_W} ${SHEET_VB_H}`)
  svg.classList.add("cad-sheet")

  // ── シートレイアウト（紙 mm）: 上＝正面図（全幅）／下＝注記・詳細A・詳細B・表題欄 ──
  const mainLeft = 22
  const mainRight = 262
  const mainTop = 24
  const mainBottom = 96
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

  // ── 座金A（②③・丸型）: バー下面から支柱を出し、その先に丸プレートを描く（支柱が見える） ──
  const discOffset = roundDiscCenterOffset(S)
  const roundRad = PLATE_A.d / 2 / S
  ;[x2, x3].forEach((bx) => {
    const by = clemencePathY(wMm, hMm, bx, extensionMm)
    const barBottomY = Y(by) + BAR_D / 2 / S
    const discCy = Y(by) + discOffset
    const discTop = discCy - roundRad
    const postW = Math.max(1.6, PLATE_A.postD / S)
    // 支柱（バー下面→プレート上端まで・白塗りで下地を隠す＝見え掛かり支柱）
    parts.push(rect(X(bx) - postW / 2, barBottomY, postW, discTop - barBottomY, THIN_W, "#ffffff"))
    // 丸プレート
    parts.push(circle(X(bx), discCy, roundRad, MID_W, "#e5e7eb"))
  })

  // ── 手すり本体（丸棒 22φ・S字＋延長） ──
  const barW = Math.max(1.6, mm(BAR_D / S))
  const dPath = clemencePathD(wMm, hMm, (v) => mm(X(v)), (v) => mm(Y(v)), extensionMm)
  parts.push(`<path d="${dPath}" fill="none" stroke="${INK}" stroke-width="${barW}" stroke-linecap="round" />`)

  // ── 座金B（①・楕円・上端に直付け）: 楕円の中心＝手すり中心線に揃える ──
  {
    const y0 = clemencePathY(wMm, hMm, 0, extensionMm)
    const rxMm = PLATE_B.w / 2 / S
    const ryMm = PLATE_B.h / 2 / S
    parts.push(ellipse(X(0), Y(y0), rxMm, ryMm, THIN_W, "#e5e7eb"))
  }

  // ── 寸法線 ──
  const cy1 = Y(0) + 8
  parts.push(extLine(X(0), Y(clemencePathY(wMm, hMm, 0, extensionMm)), X(0), cy1 + 1.5))
  parts.push(extLine(X(x2), Y(clemencePathY(wMm, hMm, x2, extensionMm)) + discOffset + roundRad, X(x2), cy1 + 1.5))
  parts.push(extLine(X(x3), Y(C) + discOffset + roundRad, X(x3), cy1 + 1.5))
  parts.push(extLine(X(wMm), Y(C), X(wMm), cy1 + 1.5))
  parts.push(dimH(X(0), X(x2), cy1, fmt(x2), { size: 2.8 }))
  parts.push(dimH(X(x2), X(x3), cy1, fmt(x3 - x2), { size: 2.8 }))
  parts.push(dimH(X(x3), X(wMm), cy1, fmt(wMm - x3), { size: 2.8 }))
  const wy = cy1 + 9
  parts.push(extLine(X(0), cy1 + 1.5, X(0), wy + 1.5), extLine(X(wMm), cy1 + 1.5, X(wMm), wy + 1.5))
  parts.push(dimH(X(0), X(wMm), wy, `横 W=${fmt(wMm)}`))
  if (extensionMm > 0) {
    parts.push(extLine(X(wMm), cy1 + 1.5, X(wMm), wy + 1.5), extLine(X(totalW), Y(C) + 2, X(totalW), wy + 1.5))
    parts.push(dimH(X(wMm), X(totalW), wy, `延長 +${fmt(extensionMm)}`, { size: 2.8 }))
  }
  const hx = X(0) - 11
  parts.push(extLine(X(0) - PLATE_B.w / 2 / S, Y(0), hx - 1.5, Y(0)))
  parts.push(extLine(X(0), Y(hMm), hx - 1.5, Y(hMm)))
  parts.push(dimV(hx, Y(hMm), Y(0), `縦 H=${fmt(hMm)}`))

  // 22φ 引出し
  {
    const lx = X((x2 + x3) / 2 + (x3 - x2) * 0.2)
    parts.push(line(lx, Y(C), lx + 6, Y(C) - 8, THIN_W))
    parts.push(text(lx + 6.6, Y(C) - 8.8, `丸棒 ${BAR_D}φ`, { size: 2.8 }))
  }
  // ブラケット番号ラベル
  const discCy2 = Y(clemencePathY(wMm, hMm, x2, extensionMm)) + discOffset
  const discCy3 = Y(C) + discOffset
  parts.push(text(X(0) + PLATE_B.w / 2 / S + 8, Y(clemencePathY(wMm, hMm, 0, extensionMm)) - 6, "①", { size: 3.15 }))
  parts.push(text(X(x2) - roundRad - 2, discCy2 + roundRad + 5, "②", { size: 3.15, anchor: "end" }))
  parts.push(text(X(x3), discCy3 + roundRad + 5, "③", { size: 3.15, anchor: "middle" }))
  // 詳細 A/B 参照（座金の縁から引き出す）
  parts.push(detailBalloon(X(x2) + roundRad * 0.7, discCy2 - roundRad * 0.7, X(x2) + 14, discCy2 + roundRad + 8, "A"))
  {
    const y0Screen = Y(clemencePathY(wMm, hMm, 0, extensionMm))
    const rxMm = PLATE_B.w / 2 / S
    const ryMm = PLATE_B.h / 2 / S
    parts.push(detailBalloon(X(0) - rxMm * 0.7, y0Screen - ryMm * 0.7, X(0) - 13, y0Screen - 11, "B"))
  }

  // ── 注記（正面図の下・全幅の帯） ──
  const extText =
    extensionMm > 0
      ? `③側を+${fmt(extensionMm)}mm延長（最大200mm・追加+¥${calcExtensionPrice(extensionMm).toLocaleString()}）。`
      : "延長オプションなし（③側は最大+200mmまで延長可・従量+¥3,000上限）。"
  parts.push(
    noteBlock(10, 108, [
      `サイズ 横 W=${fmt(wMm)} × 縦 H=${fmt(hMm)}mm（標準950〜1,000mm・一律料金）。${extText}`,
      `座金A（②③・丸型φ45・t4.5・穴4.5φ×3・支柱${PLATE_A.postD}でバー下面に接続）／座金B（①・楕円${PLATE_B.w}×${PLATE_B.h}・t4.5・穴4.5φ×3・バー貫通）。`,
      `②③は①からの水平距離で、壁下地（柱・間柱 455/910 ピッチ）に合わせて指定できます（補強板不要）。固定は ${SCREW_LABEL}・各座金3本／計${PLATE_A.screws * 2 + PLATE_B.screws}本（付属）。`,
      `本図は入力寸法から自動生成した参考図です。ハンドメイドのため多少の誤差があります。W950mm未満はお問い合わせください。A4横・倍率100%で尺度どおり出力。`,
    ]),
  )

  // ── 詳細図（下段・全幅）・表題欄（右下） ──
  const DETAIL_S = 2
  parts.push(detailA(14, 138, DETAIL_S))
  parts.push(detailB(102, 138, DETAIL_S))

  parts.push(
    titleBlock(SHEET_W_MM - FRAME_MM - 2, SHEET_H_MM - FRAME_MM - 2, {
      productName: "Clémence クレマンス トイレ手すり",
      drawingNo: `IW-CLE-${todayText().replace(/-/g, "")}`,
      scaleText: `${scaleLabel(S)}（詳細図 A・B ${scaleLabel(DETAIL_S)}）`,
      material: `丸棒 ${BAR_D}φ（無垢鉄・鍛造）`,
      finish: "2液型ウレタン艶消し黒 古美仕上げ",
      accessories: `M4×40 ×${PLATE_A.screws * 2 + PLATE_B.screws}本（各座金3本）`,
      dateText: todayText(),
    }),
  )

  svg.innerHTML = parts.join("")
}
