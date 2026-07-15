"use client"

// 横型オーダーメイド階段手すり（Élisabeth 等）の参考価格シミュレーター。
// simple.ts の product.simulator 指定がある商品ページの価格表示直下に表示する。
//
// - 階段の段数（直階段・6〜15段）と「階段の幅」「床から最上段までの高さ」を
//   入力すると、手すりを階段に実配置した側面図と参考価格がリアルタイムに出る。
//   幅・高さの入力マスは図中の寸法線上に配置（2026-07-14 蠣﨑さん指示:
//   一般のお客様に測る場所が伝わるように）
// - 手すりの長さ＝1段目と最上段の段鼻の直線距離＋両端の水平部（段鼻から各200mm）
// - エンド（唐草形状 Type A / B）は下側（登り始め）・上側（登り終わり）で
//   それぞれ実物写真サムネイルから選択でき、図中の手すり端の形も連動して変わる
// - 座金数は横型座金ルール（端100mm・最大ピッチ850mm ＝ calcZakin）で
//   自動算出し、「価格について」の公開価格表と同じ算出基準になる
// - 選択内容・参考価格は onQueryChange 経由で「見積もり依頼」リンクに引き継がれ、
//   お問い合わせフォームの本文にプリフィルされる（app/contact/page.tsx）

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Minus, Plus } from "lucide-react"
import { calcZakin, getZakinPositions } from "@/lib/drawing-modal/rene-constants"
import { galleryUrl } from "@/lib/products/display"
import { END_ART } from "@/lib/products/elisabeth-end-art"
import type { RailSimulatorConfig } from "@/lib/products/simple"

// ── 階段の標準寸法 (mm)。幅・高さの自動セットに使う ──
const STD_RISER = 200 // 蹴上
const STD_GOING = 220 // 1段あたりの水平進み（踏面240 − 蹴込み20）
const RAIL_H = 800 // 段鼻から手すり中心までの高さ
const END_RUN = 200 // 登り始め・登り終わりの水平部（段鼻から各200mm）

// 入力範囲 (mm)
const W_MIN = 800
const W_MAX = 6000
const H_MIN = 800
const H_MAX = 3600

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(Math.round(v) || lo, lo), hi)

/** 段数 → 標準の階段の幅（1段目〜最上段の段鼻の水平距離） */
const stdWidth = (steps: number) => (steps - 1) * STD_GOING
/** 段数 → 標準の床から最上段までの高さ */
const stdHeight = (steps: number) => steps * STD_RISER

// ミニ図解の viewBox / 配色（inline-rail-simulator.tsx と揃える）。
// 注記テキストは縮小時に小さくなりすぎるため SVG 内には置かず、HTML 側に出す
const VB_W = 500
const VB_H = 340
const COLOR_BAR = "#333"
const COLOR_BRACKET = "#c8a96e" // 座金（金色）
const COLOR_DIM = "#9ca3af" // 寸法線
// 壁＝薄グレー・階段＝白抜き。壁を敷くことで座金支柱が「壁付け」に見え、
// 手すりが宙に浮いた印象になるのを防ぐ（配色は承認済みグレー #f3f4f6 系）
const COLOR_WALL = "#f3f4f6"
const COLOR_STAIR_FILL = "#ffffff"
const COLOR_STAIR_LINE = "#c2c6cd"

// レール本体の描画太さ (viewBox 単位)。エンドのトレース画はバー太さ（barPx）が
// この値に一致するよう縮尺して接続する
const RAIL_STROKE = 5

// エンド形状（唐草）のフォールバック簡易パス。END_ART に実物写真トレースが
// ある id はそちらを優先し、未トレースの id のみこの簡易カールで描く。
// ローカル座標（0,0 が手すり端・外向き = +x）。下側エンドは scale(-1,1) で反転
const END_PATHS: Record<string, string> = {
  A: "M 0 0 C 9 -1 18 -6 21 -12 C 23 -17 19 -21 14 -19 C 9 -17 8 -11 12 -8 C 15 -5.5 20 -5 24 -7",
  B: "M 0 0 C 7 1 12 5 13 11 C 14 18 9 22 4 20 C 0 18 0.5 13 4.5 12.5 C 7 12.2 8.5 14 8 16",
}

/**
 * 手すり端の唐草エンド 1 個ぶんの SVG 要素。
 * - END_ART にトレース画がある場合: ネック切り口（アート右端・attachY）を
 *   レール端 (x, y) に接続し、切り口の太さがレール太さと一致する縮尺で描く。
 *   手すりの「掴む面」が常に上になるよう、上下は反転しない：
 *   下側（outward=-1）は写真の向きのまま、上側（outward=+1）は左右のみ反転。
 *   180° 回転だと上側が上下逆になり NG（2026-07-15 蠣﨑さん指摘。
 *   アートは上面エッジ基準で水平化済みのため反転でも巻きは自然に見える）
 * - 無い場合: 簡易カールのパスにフォールバック
 */
function EndDecoration({ id, x, y, outward }: { id: string; x: number; y: number; outward: 1 | -1 }) {
  const art = END_ART[id]
  if (art) {
    const s = RAIL_STROKE / art.barPx
    // アート座標系はループ=左・切り口=右端。x 方向だけ -outward・s を掛けると
    // 下側で scale(s, s)（そのまま）、上側で scale(-s, s) = 左右反転になる
    return (
      <g transform={`translate(${x} ${y}) scale(${-outward * s} ${s}) translate(${-art.viewW} ${-art.attachY})`}>
        <g transform={art.innerTransform}>
          <path d={art.d} fill={COLOR_BAR} />
        </g>
      </g>
    )
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${outward} 1)`}>
      <path
        d={END_PATHS[id] ?? END_PATHS.A}
        fill="none"
        stroke={COLOR_BAR}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </g>
  )
}

interface RailPriceSimulatorProps {
  config: RailSimulatorConfig
  /** 見積もり依頼リンクに付ける type= の値（商品 slug） */
  queryType: string
  onQueryChange?: (qs: string) => void
}

export function RailPriceSimulator({ config, queryType, onQueryChange }: RailPriceSimulatorProps) {
  const [steps, setSteps] = useState(config.steps.default)
  const [wMm, setWMm] = useState(stdWidth(config.steps.default))
  const [hMm, setHMm] = useState(stdHeight(config.steps.default))
  // 幅・高さをお客様が手入力したら、以降は段数を変えても上書きしない
  const [wTouched, setWTouched] = useState(false)
  const [hTouched, setHTouched] = useState(false)
  const [zakinId, setZakinId] = useState(config.zakinTypes[0]?.id ?? "")
  const endOptions = config.endShapes ?? []
  const [endBottom, setEndBottom] = useState(endOptions[0]?.id ?? "A")
  const [endTop, setEndTop] = useState(endOptions[0]?.id ?? "A")

  const N = Math.min(Math.max(steps, config.steps.min), config.steps.max)
  const changeSteps = (next: number) => {
    const n = Math.min(Math.max(next, config.steps.min), config.steps.max)
    setSteps(n)
    if (!wTouched) setWMm(stdWidth(n))
    if (!hTouched) setHMm(stdHeight(n))
  }

  // クランプ後の実効値（図・価格・注文引き継ぎはこの値を使う）
  const W = clamp(wMm, W_MIN, W_MAX)
  const H = clamp(hMm, H_MIN, H_MAX)
  const riser = H / N // 蹴上（床から最上段の高さ ÷ 段数）
  const going = W / (N - 1) // 1段あたりの水平進み

  // 手すりの長さ: 1段目と最上段の段鼻の直線距離 ＋ 両端の水平部（各200mm）
  const noseDiag = Math.round(Math.hypot(W, H - riser))
  const L = Math.round((noseDiag + END_RUN * 2) / 10) * 10

  const zakinType = config.zakinTypes.find((z) => z.id === zakinId) ?? config.zakinTypes[0]
  const zakinCount = calcZakin(L)

  const railPrice = Math.round((L / 1000) * config.unitPricePerM)
  const endTotal = config.endPrice * config.endCount
  const zakinTotal = zakinCount * zakinType.price
  const total = railPrice + endTotal + zakinTotal

  useEffect(() => {
    onQueryChange?.(
      `&type=${queryType}&steps=${N}&w=${W}&h=${H}&len=${L}&endb=${encodeURIComponent(endBottom)}&endt=${encodeURIComponent(endTop)}&zakin=${zakinType.id}&zcount=${zakinCount}&total=${total}`,
    )
  }, [N, W, H, L, endBottom, endTop, zakinType.id, zakinCount, total, queryType, onQueryChange])

  // ── ミニ図解（側面図・階段に実配置。入力に連動） ──
  const svg = useMemo(() => {
    // mm 座標系（y は上向き・床 = 0）。手すりは段鼻ラインの RAIL_H 上を通り、
    // 両端は水平に近く曲がる（登り始め = 床上、登り終わり = 上階床上）。
    const x1 = 0 // 1段目の段鼻 x
    const x2 = W // 最上段の段鼻 x
    const yb = riser + RAIL_H // 下側水平部の高さ
    const yt = H + RAIL_H // 上側水平部の高さ
    const x0 = x1 - END_RUN
    const x3 = x2 + END_RUN
    const margin = 130 // 唐草・床の張り出しぶん

    // 右 76px = 高さ寸法線＋入力マス、下 64px = 幅寸法線＋入力マスの余白
    const padL = 16
    const padR = 76
    const padTop = 20
    const padBottom = 64
    const wAll = x3 - x0 + margin * 2
    const hAll = yt
    const scale = Math.min((VB_W - padL - padR) / wAll, (VB_H - padTop - padBottom) / hAll)
    const ox = padL + ((VB_W - padL - padR) - wAll * scale) / 2 - (x0 - margin) * scale
    const oy = padTop + ((VB_H - padTop - padBottom) - hAll * scale) / 2 + hAll * scale
    const X = (mm: number) => ox + mm * scale
    const Y = (mm: number) => oy - mm * scale

    // 階段（直階段）: 床 → 各段 → 上階床
    let stair = `M ${X(x0 - margin)} ${Y(0)} L ${X(0)} ${Y(0)}`
    for (let k = 1; k <= N; k++) {
      const treadEndX = k === N ? x3 + margin : k * going
      stair += ` L ${X((k - 1) * going)} ${Y(k * riser)} L ${X(treadEndX)} ${Y(k * riser)}`
    }
    stair += ` L ${X(x3 + margin)} ${Y(0)} Z`

    // 手すり: 水平 → 緩やかに曲がって斜め → 緩やかに曲がって水平
    const slope = (H - riser) / W
    const T = Math.min(200, W * 0.15) // 曲がりの遷移幅 (mm)。大きいほど緩やかな曲線
    const rail =
      `M ${X(x0)} ${Y(yb)}` +
      ` L ${X(x1 - 80)} ${Y(yb)}` +
      ` Q ${X(x1)} ${Y(yb)} ${X(x1 + T)} ${Y(yb + T * slope)}` +
      ` L ${X(x2 - T)} ${Y(yt - T * slope)}` +
      ` Q ${X(x2)} ${Y(yt)} ${X(x2 + 80)} ${Y(yt)}` +
      ` L ${X(x3)} ${Y(yt)}`

    // エンド（唐草）の取り付け位置（レール端の座標）
    const endBottomAt = { x: X(x0), y: Y(yb) }
    const endTopAt = { x: X(x3), y: Y(yt) }

    // 座金: 手すりに沿った距離 → 折れ線（水平/斜め/水平）上の位置と法線方向
    const diagLen = Math.hypot(W, H - riser)
    const segs = [
      { len: END_RUN, from: { x: x0, y: yb }, dir: { x: 1, y: 0 } },
      { len: diagLen, from: { x: x1, y: yb }, dir: { x: W / diagLen, y: (H - riser) / diagLen } },
      { len: END_RUN, from: { x: x2, y: yt }, dir: { x: 1, y: 0 } },
    ]
    const totalLen = segs.reduce((s, seg) => s + seg.len, 0)
    const pointAt = (dist: number) => {
      let d = Math.min(Math.max(dist, 0), totalLen)
      for (const seg of segs) {
        if (d <= seg.len) {
          return {
            x: seg.from.x + seg.dir.x * d,
            y: seg.from.y + seg.dir.y * d,
            // 法線（手すりの下側・進行方向の右手）
            nx: seg.dir.y,
            ny: -seg.dir.x,
          }
        }
        d -= seg.len
      }
      const last = segs[segs.length - 1]
      return { x: last.from.x + last.dir.x * last.len, y: last.from.y, nx: 0, ny: -1 }
    }
    const zakin = getZakinPositions(L, zakinCount).map((pos) => {
      const p = pointAt(pos)
      const postMm = 110
      return {
        x1: X(p.x),
        y1: Y(p.y),
        x2: X(p.x + p.nx * postMm),
        y2: Y(p.y + p.ny * postMm),
        cx: X(p.x + p.nx * (postMm + 55)),
        cy: Y(p.y + p.ny * (postMm + 55)),
      }
    })

    // ── 寸法線（幅・高さ）と入力マスの位置 ──
    // 幅: 1段目の段鼻 x=0 〜 最上段の段鼻 x=W。床下の寸法線に補助線でつなぐ
    const dimWy = Y(0) + 20
    const dimW = {
      line: { x1: X(0), x2: X(W), y: dimWy },
      ext1: { x: X(0), y1: Y(riser), y2: dimWy + 5 },
      ext2: { x: X(W), y1: Y(H), y2: dimWy + 5 },
      inputXPct: ((X(0) + X(W)) / 2 / VB_W) * 100,
      inputYPct: ((dimWy + 24) / VB_H) * 100,
    }
    // 高さ: 床 0 〜 最上段 H。階段右側の寸法線に補助線でつなぐ
    const dimHx = X(x3 + margin) + 16
    const dimH = {
      line: { y1: Y(0), y2: Y(H), x: dimHx },
      ext1: { y: Y(0), x1: X(x3 + margin), x2: dimHx + 5 },
      ext2: { y: Y(H), x1: X(x2), x2: dimHx + 5 },
      inputXPct: ((dimHx + 6) / VB_W) * 100,
      inputYPct: ((Y(0) + Y(H)) / 2 / VB_H) * 100,
    }

    return { stair, rail, endBottomAt, endTopAt, zakin, dimW, dimH }
  }, [N, W, H, riser, going, L, zakinCount])

  const dimInputCls =
    "w-[76px] border border-border rounded-md px-1 py-0.5 text-[13px] text-center bg-white shadow-sm focus:outline-none focus:border-gold"

  return (
    <div className="mb-8 border-2 border-gold/20 bg-card rounded-md p-5">
      <p className="text-[11px] tracking-[0.2em] text-gold font-semibold uppercase mb-1">
        Price simulator
      </p>
      <p className="font-serif text-[15px] font-medium text-foreground mb-1">
        参考価格シミュレーター
      </p>
      <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
        階段の段数を選び、図の中の幅・高さを入れると、実際の取り付けイメージと参考価格が
        すぐに確認できます。手すりは緩やかな曲線で、登り始めと登り終わりは水平に近く曲がる形状です。
      </p>

      {/* ミニ図解（側面図・入力に連動）。幅・高さの入力マスは寸法線上に重ねる */}
      <div className="relative mb-2">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto bg-white rounded-md border border-border">
          <rect x="0" y="0" width={VB_W} height={VB_H} rx="6" fill={COLOR_WALL} />
          <path d={svg.stair} fill={COLOR_STAIR_FILL} stroke={COLOR_STAIR_LINE} strokeWidth="1.5" strokeLinejoin="round" />
          {/* 寸法線: 幅（1段目〜最上段の段鼻の水平距離） */}
          <g stroke={COLOR_DIM} strokeWidth="1">
            <line x1={svg.dimW.ext1.x} y1={svg.dimW.ext1.y1} x2={svg.dimW.ext1.x} y2={svg.dimW.ext1.y2} strokeDasharray="3 3" />
            <line x1={svg.dimW.ext2.x} y1={svg.dimW.ext2.y1} x2={svg.dimW.ext2.x} y2={svg.dimW.ext2.y2} strokeDasharray="3 3" />
            <line x1={svg.dimW.line.x1} y1={svg.dimW.line.y} x2={svg.dimW.line.x2} y2={svg.dimW.line.y} />
            <line x1={svg.dimW.line.x1} y1={svg.dimW.line.y - 4} x2={svg.dimW.line.x1} y2={svg.dimW.line.y + 4} />
            <line x1={svg.dimW.line.x2} y1={svg.dimW.line.y - 4} x2={svg.dimW.line.x2} y2={svg.dimW.line.y + 4} />
          </g>
          {/* 寸法線: 高さ（床〜最上段） */}
          <g stroke={COLOR_DIM} strokeWidth="1">
            <line x1={svg.dimH.ext1.x1} y1={svg.dimH.ext1.y} x2={svg.dimH.ext1.x2} y2={svg.dimH.ext1.y} strokeDasharray="3 3" />
            <line x1={svg.dimH.ext2.x1} y1={svg.dimH.ext2.y} x2={svg.dimH.ext2.x2} y2={svg.dimH.ext2.y} strokeDasharray="3 3" />
            <line x1={svg.dimH.line.x} y1={svg.dimH.line.y1} x2={svg.dimH.line.x} y2={svg.dimH.line.y2} />
            <line x1={svg.dimH.line.x - 4} y1={svg.dimH.line.y1} x2={svg.dimH.line.x + 4} y2={svg.dimH.line.y1} />
            <line x1={svg.dimH.line.x - 4} y1={svg.dimH.line.y2} x2={svg.dimH.line.x + 4} y2={svg.dimH.line.y2} />
          </g>
          {svg.zakin.map((z, i) => (
            <g key={i}>
              <line x1={z.x1} y1={z.y1} x2={z.x2} y2={z.y2} stroke={COLOR_BAR} strokeWidth="2.5" />
              <circle cx={z.cx} cy={z.cy} r={5} fill={COLOR_BRACKET} stroke="#a8894e" strokeWidth="1" />
            </g>
          ))}
          <path d={svg.rail} fill="none" stroke={COLOR_BAR} strokeWidth={RAIL_STROKE} strokeLinecap="round" />
          {/* エンド（唐草 Type A/B・選択に連動。実物写真トレースのシルエット） */}
          <EndDecoration id={endBottom} x={svg.endBottomAt.x} y={svg.endBottomAt.y} outward={-1} />
          <EndDecoration id={endTop} x={svg.endTopAt.x} y={svg.endTopAt.y} outward={1} />
        </svg>
        {/* 幅の入力マス（寸法線の下・中央） */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${svg.dimW.inputXPct}%`, top: `${svg.dimW.inputYPct}%`, transform: "translate(-50%, -50%)" }}
        >
          <input
            type="number"
            inputMode="numeric"
            min={W_MIN}
            max={W_MAX}
            step={10}
            value={wMm}
            onChange={(e) => {
              setWMm(Number(e.target.value))
              setWTouched(true)
            }}
            onBlur={() => setWMm(W)}
            aria-label="階段の幅（mm）"
            className={dimInputCls}
          />
          <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 bg-white/80 px-1 rounded">
            幅（mm）
          </span>
        </div>
        {/* 高さの入力マス（右側の寸法線・中央） */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${svg.dimH.inputXPct}%`, top: `${svg.dimH.inputYPct}%`, transform: "translate(-50%, -50%)" }}
        >
          <input
            type="number"
            inputMode="numeric"
            min={H_MIN}
            max={H_MAX}
            step={10}
            value={hMm}
            onChange={(e) => {
              setHMm(Number(e.target.value))
              setHTouched(true)
            }}
            onBlur={() => setHMm(H)}
            aria-label="床から最上段までの高さ（mm）"
            className={dimInputCls}
          />
          <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 bg-white/80 px-1 rounded">
            高さ（mm）
          </span>
        </div>
      </div>
      <p className="text-[12px] md:text-[13px] text-muted-foreground text-center mb-2 leading-relaxed">
        直階段 {N}段・手すり全長 約{L.toLocaleString()}mm・座金 {zakinCount} 箇所
        <span className="block text-[11px] md:text-[12px]">
          （段鼻間 約{noseDiag.toLocaleString()}mm ＋ 両端の水平部 各{END_RUN}mm／座金は自動算出・位置は目安）
        </span>
      </p>
      <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
        幅＝1段目から最上段までの段鼻の水平距離、高さ＝床から最上段までの高さです。
        分からない場合はそのままで構いません（段数に合わせた一般的な寸法を自動セットしています）。
      </p>

      {/* 段数 */}
      <div className="flex items-center justify-between border border-border rounded-md bg-white px-4 py-3 mb-4">
        <span className="text-[14px] text-foreground">
          階段の段数
          <span className="block text-[11px] text-muted-foreground mt-0.5">
            直階段 {config.steps.min}〜{config.steps.max}段
          </span>
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => changeSteps(N - 1)}
            disabled={N <= config.steps.min}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gold/20 bg-white shadow-sm hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="段数を減らす"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-serif text-[18px] font-bold min-w-[3.5ch] text-center text-foreground">
            {N}段
          </span>
          <button
            type="button"
            onClick={() => changeSteps(N + 1)}
            disabled={N >= config.steps.max}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gold/20 bg-white shadow-sm hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="段数を増やす"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 座金タイプ */}
      <p className="text-[13px] text-muted-foreground mb-2">座金タイプ</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {config.zakinTypes.map((z) => (
          <label
            key={z.id}
            className={`cursor-pointer rounded-md border-2 bg-white px-4 py-3 transition-colors ${
              zakinType.id === z.id ? "border-gold" : "border-border hover:border-gold/50"
            }`}
          >
            <input
              type="radio"
              name="rail-sim-zakin"
              checked={zakinType.id === z.id}
              onChange={() => setZakinId(z.id)}
              className="sr-only"
            />
            <span className="block text-[14px] font-medium text-foreground">
              {z.label}
              <span className="font-serif ml-2">+¥{z.price.toLocaleString()}</span>
              <span className="text-[11px] text-muted-foreground">/箇所</span>
            </span>
            {z.note && (
              <span className="block text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{z.note}</span>
            )}
          </label>
        ))}
      </div>

      {/* エンド形状（唐草 Type A/B・下側と上側で個別に選択。価格は同一） */}
      {endOptions.length > 0 && (
        <div className="mb-4">
          <p className="text-[13px] text-muted-foreground mb-2">
            エンド形状 唐草（両端 {config.endCount} 個・A / B どちらも同価格）
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { key: "bottom", label: "下側（登り始め）", value: endBottom, set: setEndBottom },
                { key: "top", label: "上側（登り終わり）", value: endTop, set: setEndTop },
              ] as const
            ).map((side) => (
              <div key={side.key}>
                <p className="text-[12px] text-foreground font-medium mb-1.5">{side.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {endOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => side.set(opt.id)}
                      aria-pressed={side.value === opt.id}
                      className={`rounded-md border-2 overflow-hidden bg-white transition-colors ${
                        side.value === opt.id ? "border-gold" : "border-border hover:border-gold/50"
                      }`}
                    >
                      <span className="relative block aspect-square">
                        <Image
                          src={galleryUrl(opt.img)}
                          alt={`唐草エンド Type ${opt.id}`}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      </span>
                      <span
                        className={`block text-[12px] py-1 font-medium ${
                          side.value === opt.id ? "text-foreground bg-gold/10" : "text-muted-foreground"
                        }`}
                      >
                        {opt.id} パターン
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 内訳 */}
      <dl className="divide-y divide-border border-y border-border text-[13px] md:text-[14px] mb-3">
        <div className="flex justify-between py-2">
          <dt className="text-muted-foreground">
            本体（約{(L / 1000).toLocaleString()}m × ¥{config.unitPricePerM.toLocaleString()}）
          </dt>
          <dd className="font-serif text-foreground">¥{railPrice.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between py-2">
          <dt className="text-muted-foreground">
            唐草エンド（下 {endBottom}・上 {endTop}）
          </dt>
          <dd className="font-serif text-foreground">¥{endTotal.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between py-2">
          <dt className="text-muted-foreground">
            {zakinType.label} × {zakinCount} 箇所
          </dt>
          <dd className="font-serif text-foreground">¥{zakinTotal.toLocaleString()}</dd>
        </div>
      </dl>

      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[14px] text-muted-foreground">参考価格（税込・送料別）</span>
        <span className="font-serif text-[22px] font-medium text-foreground">
          ¥{total.toLocaleString()}
        </span>
      </div>

      <p className="text-[11px] md:text-[12px] text-muted-foreground leading-relaxed">
        ※ 手すり全長＝1段目と最上段の段鼻の直線距離＋両端の水平部（段鼻から各{END_RUN}mm）。
        座金の数は端 100mm・最大 850mm 間隔の標準ピッチで自動算出した参考値です。
        実際の階段の形状・寸法・取付下地により長さ・本数・金額が変わります。
        下の「見積もり依頼」からこの内容がそのまま引き継がれます（お見積もり無料）。
      </p>
    </div>
  )
}
