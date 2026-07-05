// Laurent（階段手摺）の設計図 SVG ビルダー。
// お客様が入力した段数・寸法から、実寸を反映した側面図（設計図）を組み立てる。
// 商品ページの「設計図（PDF）を見る」モーダルで使い、そのまま印刷/PDF 保存できる。
//
// 座標系: mm 単位で階段プロファイルを組み、描画エリアに収まるよう等比スケール。
// SVG は y 下向きなので Y = floorY - y*scale で上下反転する。
//
// 手すりの取り付けルール（2026-07-05 蠣﨑さん指示）:
// - 1 本目の柱は 1 段目の踏み板中央に立つ（床からではない）
// - 手すりの下端は前に飛び出さず、1 段目で折り曲げて固定する（＝1 本目の柱を兼ねる）
// - 追加柱は 5 段ごと（段板中央に立つ）、上端は壁付け
// - 横桟は手すりと踏み板の間に、本数で等分した高さに平行に走る
//   （1 本＝中央 / 2 本・3 本＝等間隔）

import { LAURENT, type CrossbarMaterial, type StairColor } from "@/lib/products/stair-pricing"

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

const INK = "#1f2937"
const SUB = "#6b7280"
const DIM = "#b8860b"
const DIMTX = "#92650a"
const FILL = "#f3f4f6"

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** 寸法線（矢羽根つき）を引く。水平/垂直/斜めいずれも p1→p2 の直線＋両端矢羽根。 */
function dimLine(x1: number, y1: number, x2: number, y2: number): string {
  const ang = Math.atan2(y2 - y1, x2 - x1)
  const a = 5
  const arrow = (x: number, y: number, dir: number) => {
    const ax1 = x + a * Math.cos(dir + 2.6)
    const ay1 = y + a * Math.sin(dir + 2.6)
    const ax2 = x + a * Math.cos(dir - 2.6)
    const ay2 = y + a * Math.sin(dir - 2.6)
    return `<path d="M ${x} ${y} L ${ax1.toFixed(1)} ${ay1.toFixed(1)} M ${x} ${y} L ${ax2.toFixed(1)} ${ay2.toFixed(1)}" stroke="${DIM}" stroke-width="1" fill="none" />`
  }
  return (
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${DIM}" stroke-width="1" />` +
    arrow(x1, y1, ang) +
    arrow(x2, y2, ang + Math.PI)
  )
}

function txt(x: number, y: number, s: string, size = 13, fill = DIMTX, anchor = "start"): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-family="'Helvetica Neue',Arial,sans-serif">${esc(s)}</text>`
}

export function buildStairDrawingSvg(svg: SVGSVGElement, opts: StairDrawingOpts): void {
  const {
    steps, risersMm, treadMm, kekomiMm, lastTreadMm, railHeightMm,
    crossbarCount, crossbarMaterial, color, postCount,
    totalRiseMm, runMm, diagonalMm,
  } = opts

  const VB_W = 1000
  const VB_H = 720
  svg.setAttribute("viewBox", `0 0 ${VB_W} ${VB_H}`)

  // ── 描画エリア ──
  const areaX = 150
  const areaW = 700
  const areaTop = 90
  const areaH = 400
  const floorY = areaTop + areaH // 床の SVG Y

  // ── mm プロファイルの構築 ──
  const going = Math.max(1, treadMm - kekomiMm) // 段鼻〜段鼻の水平ピッチ
  // 段鼻の累積座標（mm・y 上向き）
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

  const scale = Math.min(areaW / contentW, areaH / contentH)
  // 水平方向のセンタリング
  const originX = areaX + (areaW - contentW * scale) / 2
  const X = (mmX: number) => originX + mmX * scale
  const Y = (mmY: number) => floorY - mmY * scale

  // 手すり（段鼻ラインを railHeight 上へ平行移動）
  const railAt = (mmX: number) => {
    // 段鼻0→壁 のコード（chord）を railHeight 上へ
    const t = (mmX - noseX[0]) / (wallX - noseX[0])
    const noseLineY = noseY[0] + (wallY - noseY[0]) * t
    return noseLineY + railHeightMm
  }

  const parts: string[] = []
  parts.push(`<rect x="0" y="0" width="${VB_W}" height="${VB_H}" fill="#ffffff" />`)

  // ── 階段プロファイル（塗り）──
  const poly: string[] = []
  poly.push(`${X(0).toFixed(1)},${floorY.toFixed(1)}`) // 床・1段目前
  for (let i = 0; i < steps; i++) {
    const nx = noseX[i]
    const ny = noseY[i]
    poly.push(`${X(nx).toFixed(1)},${Y(ny).toFixed(1)}`) // 蹴上げ上端（段鼻）
    const nextX = i < steps - 1 ? noseX[i + 1] : wallX
    poly.push(`${X(nextX).toFixed(1)},${Y(ny).toFixed(1)}`) // 踏み面
  }
  poly.push(`${X(wallX).toFixed(1)},${floorY.toFixed(1)}`) // 壁下・床
  parts.push(`<polygon points="${poly.join(" ")}" fill="${FILL}" stroke="${INK}" stroke-width="2" stroke-linejoin="round" />`)

  // 床・壁
  parts.push(`<line x1="${(areaX - 40).toFixed(1)}" y1="${floorY}" x2="${X(wallX) + 20}" y2="${floorY}" stroke="${SUB}" stroke-width="2" />`)
  parts.push(`<line x1="${X(wallX).toFixed(1)}" y1="${Y(contentH).toFixed(1)}" x2="${X(wallX).toFixed(1)}" y2="${floorY}" stroke="${SUB}" stroke-width="2" />`)
  parts.push(txt(X(wallX) + 8, Y(wallY) - 10, "壁", 13, SUB))

  // ── 手すり（笠木）＋ 1本目の柱（折り曲げ端）──
  const firstPostX = noseX[0] + going / 2 // 1段目踏み板の中央
  const railTopWallY = railAt(wallX)
  // 笠木: 1本目の柱上端 → 壁上端
  parts.push(
    `<line x1="${X(firstPostX).toFixed(1)}" y1="${Y(railAt(firstPostX)).toFixed(1)}" x2="${X(wallX).toFixed(1)}" y2="${Y(railTopWallY).toFixed(1)}" stroke="${INK}" stroke-width="6" stroke-linecap="round" />`,
  )
  // 1本目の柱（＝折り曲げた下端）: 1段目踏み板中央に立つ
  parts.push(
    `<line x1="${X(firstPostX).toFixed(1)}" y1="${Y(railAt(firstPostX)).toFixed(1)}" x2="${X(firstPostX).toFixed(1)}" y2="${Y(noseY[0]).toFixed(1)}" stroke="${INK}" stroke-width="5" />`,
  )
  // 柱脚のベースプレート（段板固定）
  parts.push(`<rect x="${(X(firstPostX) - 9).toFixed(1)}" y="${(Y(noseY[0]) - 3).toFixed(1)}" width="18" height="5" fill="${INK}" />`)

  // ── 追加柱（5段ごと・段板中央）──
  const postStepIdx: number[] = []
  for (let p = 1; p < postCount; p++) {
    const idx = Math.min(steps - 1, p * LAURENT.stepsPerPost)
    postStepIdx.push(idx)
  }
  postStepIdx.forEach((idx) => {
    const px = idx < steps - 1 ? noseX[idx] + going / 2 : noseX[idx] + lastTreadMm / 2
    parts.push(
      `<line x1="${X(px).toFixed(1)}" y1="${Y(railAt(px)).toFixed(1)}" x2="${X(px).toFixed(1)}" y2="${Y(noseY[idx]).toFixed(1)}" stroke="${INK}" stroke-width="5" />`,
    )
  })
  // 端部は壁付け
  parts.push(txt(X(wallX) - 4, Y(railTopWallY) - 8, "端部は壁付け", 12, INK, "end"))

  // ── 横桟（手すり〜踏み板の間を本数で等分）──
  if (crossbarCount > 0) {
    const cbW = crossbarMaterial === "flat" ? 3 : 2.2
    for (let k = 1; k <= crossbarCount; k++) {
      const f = k / (crossbarCount + 1) // 手すりからの下げ割合
      const yA = railAt(firstPostX) - f * railHeightMm
      const yB = railTopWallY - f * railHeightMm
      parts.push(
        `<line x1="${X(firstPostX).toFixed(1)}" y1="${Y(yA).toFixed(1)}" x2="${X(wallX).toFixed(1)}" y2="${Y(yB).toFixed(1)}" stroke="${INK}" stroke-width="${cbW}" stroke-linecap="round" opacity="0.85" />`,
      )
    }
  }

  // ── 寸法線 ──
  // A 総幅（下）
  const aY = floorY + 34
  parts.push(dimLine(X(0), aY, X(wallX), aY))
  parts.push(`<line x1="${X(0).toFixed(1)}" y1="${floorY}" x2="${X(0).toFixed(1)}" y2="${aY + 6}" stroke="${DIM}" stroke-width="0.75" />`)
  parts.push(`<line x1="${X(wallX).toFixed(1)}" y1="${floorY}" x2="${X(wallX).toFixed(1)}" y2="${aY + 6}" stroke="${DIM}" stroke-width="0.75" />`)
  parts.push(txt(X(wallX / 2), aY + 20, `A 設置範囲の総幅 ${Math.round(runMm).toLocaleString()} mm`, 13, DIMTX, "middle"))

  // 総高さ（左）
  const hX = areaX - 40
  parts.push(dimLine(hX, floorY, hX, Y(wallY)))
  parts.push(`<line x1="${hX}" y1="${floorY}" x2="${X(0) + 4}" y2="${floorY}" stroke="${DIM}" stroke-width="0.75" />`)
  parts.push(`<line x1="${hX}" y1="${Y(wallY).toFixed(1)}" x2="${X(wallX).toFixed(1)}" y2="${Y(wallY).toFixed(1)}" stroke="${DIM}" stroke-width="0.5" stroke-dasharray="4 3" />`)
  parts.push(`<text x="${hX - 8}" y="${((floorY + Y(wallY)) / 2).toFixed(1)}" font-size="13" fill="${DIMTX}" text-anchor="middle" font-family="'Helvetica Neue',Arial,sans-serif" transform="rotate(-90 ${hX - 8} ${((floorY + Y(wallY)) / 2).toFixed(1)})">床〜最上段 ${Math.round(totalRiseMm).toLocaleString()} mm</text>`)

  // 手すり高さ（1本目の柱に沿って）
  const rhX = X(firstPostX) - 14
  parts.push(dimLine(rhX, Y(noseY[0]), rhX, Y(railAt(firstPostX))))
  parts.push(`<text x="${rhX - 6}" y="${((Y(noseY[0]) + Y(railAt(firstPostX))) / 2).toFixed(1)}" font-size="12" fill="${DIMTX}" text-anchor="middle" font-family="'Helvetica Neue',Arial,sans-serif" transform="rotate(-90 ${rhX - 6} ${((Y(noseY[0]) + Y(railAt(firstPostX))) / 2).toFixed(1)})">手すり高さ ${railHeightMm} mm</text>`)

  // 全長（笠木に沿って・破線）
  const lx1 = X(firstPostX)
  const ly1 = Y(railAt(firstPostX)) - 16
  const lx2 = X(wallX)
  const ly2 = Y(railTopWallY) - 16
  parts.push(`<line x1="${lx1.toFixed(1)}" y1="${ly1.toFixed(1)}" x2="${lx2.toFixed(1)}" y2="${ly2.toFixed(1)}" stroke="${DIM}" stroke-width="1" stroke-dasharray="6 4" />`)
  const lmx = (lx1 + lx2) / 2
  const lmy = (ly1 + ly2) / 2
  const lang = (Math.atan2(ly2 - ly1, lx2 - lx1) * 180) / Math.PI
  parts.push(`<text x="${lmx.toFixed(1)}" y="${(lmy - 6).toFixed(1)}" font-size="13" fill="${DIMTX}" text-anchor="middle" font-family="'Helvetica Neue',Arial,sans-serif" transform="rotate(${lang.toFixed(1)} ${lmx.toFixed(1)} ${(lmy - 6).toFixed(1)})">手摺全長 約${Math.round(diagonalMm).toLocaleString()} mm</text>`)

  // 蹴上げ・踏み面の代表寸法（2段目付近に1つずつ）
  if (steps >= 2) {
    const i = Math.min(1, steps - 1)
    const rx = X(noseX[i]) + 6
    parts.push(dimLine(rx, Y(noseY[i - 1]), rx, Y(noseY[i])))
    parts.push(txt(rx + 6, (Y(noseY[i - 1]) + Y(noseY[i])) / 2 + 4, `蹴上げ`, 11, DIMTX))
    const ty = Y(noseY[i - 1]) + 14
    parts.push(dimLine(X(noseX[i - 1]), ty, X(noseX[i]), ty))
    parts.push(txt((X(noseX[i - 1]) + X(noseX[i])) / 2, ty + 14, `踏み面`, 11, DIMTX, "middle"))
  }

  // ── タイトルブロック ──
  const tbY = VB_H - 150
  parts.push(`<rect x="${areaX - 40}" y="${tbY}" width="${areaW + 80}" height="130" fill="#ffffff" stroke="${INK}" stroke-width="1" />`)
  parts.push(`<line x1="${areaX - 40}" y1="${tbY + 34}" x2="${areaX + areaW + 40}" y2="${tbY + 34}" stroke="${INK}" stroke-width="0.75" />`)
  parts.push(txt(areaX - 24, tbY + 23, "IRONWORKS ado ── Laurent ローラン 階段手摺 設計図", 16, INK))
  const crossbarText =
    crossbarCount > 0 ? `横桟 ${crossbarCount}本（${LAURENT.crossbar[crossbarMaterial].label}）` : "横桟なし"
  const colorText = color === "white" ? "マットホワイト" : "マットブラック"
  const specLines = [
    `材質: フラットバー 9×38 ／ 仕上げ: 2液型ウレタン ${colorText}`,
    `段数: ${steps}段 ／ 柱: ${postCount}本（1本目=1段目踏板中央・端部壁付け） ／ ${crossbarText}`,
    `蹴上げ: ${risersMm.every((r) => r === risersMm[0]) ? `${risersMm[0]}mm（全段一律）` : risersMm.join("/") + "mm"} ／ 踏み面: ${treadMm}mm ／ 蹴込み: ${kekomiMm}mm ／ 最終段の踏み面(D): ${lastTreadMm}mm`,
    `手すり高さ: ${railHeightMm}mm（段鼻から） ／ 総幅A: ${Math.round(runMm).toLocaleString()}mm ／ 全長: 約${Math.round(diagonalMm).toLocaleString()}mm`,
  ]
  specLines.forEach((line, i) => {
    parts.push(txt(areaX - 24, tbY + 56 + i * 22, line, 13, "#333"))
  })

  svg.innerHTML = parts.join("")
}
