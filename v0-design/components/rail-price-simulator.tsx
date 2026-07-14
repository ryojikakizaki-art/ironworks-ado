"use client"

// 横型オーダーメイド階段手すり（Élisabeth 等）の参考価格シミュレーター。
// simple.ts の product.simulator 指定がある商品ページの価格表示直下に表示する。
//
// - 階段の段数（直階段・6〜15段）と「階段の幅」「床から最上段までの高さ」を
//   入力すると、手すりを階段に実配置した側面図と参考価格がリアルタイムに出る
// - 手すりの長さ＝1段目と最上段の段鼻の直線距離＋両端の水平部（段鼻から各200mm）
//   （2026-07-14 蠣﨑さん指示。幅・高さ未入力時は蹴上200mm・踏面220mm相当の
//   標準寸法を段数から自動セットする）
// - 手すりは緩やかな曲線で、登り始めと登り終わりは水平に近く曲がる形状で描画
// - 座金数は横型座金ルール（端100mm・最大ピッチ850mm ＝ calcZakin）で
//   自動算出し、「価格について」の公開価格表と同じ算出基準になる
// - 選択内容・参考価格は onQueryChange 経由で「見積もり依頼」リンクに引き継がれ、
//   お問い合わせフォームの本文にプリフィルされる（app/contact/page.tsx）

import { useEffect, useMemo, useState } from "react"
import { Minus, Plus } from "lucide-react"
import { calcZakin, getZakinPositions } from "@/lib/drawing-modal/rene-constants"
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
const VB_H = 320
const COLOR_BAR = "#333"
const COLOR_BRACKET = "#c8a96e" // 座金（金色）
// 壁＝薄グレー・階段＝白抜き。壁を敷くことで座金支柱が「壁付け」に見え、
// 手すりが宙に浮いた印象になるのを防ぐ（配色は承認済みグレー #f3f4f6 系）
const COLOR_WALL = "#f3f4f6"
const COLOR_STAIR_FILL = "#ffffff"
const COLOR_STAIR_LINE = "#c2c6cd"

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
  const [endShape, setEndShape] = useState(config.endShapes?.[0] ?? "")

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
      `&type=${queryType}&steps=${N}&w=${W}&h=${H}&len=${L}&end=${encodeURIComponent(endShape)}&zakin=${zakinType.id}&zcount=${zakinCount}&total=${total}`,
    )
  }, [N, W, H, L, endShape, zakinType.id, zakinCount, total, queryType, onQueryChange])

  // ── ミニ図解（側面図・階段に実配置。段数・幅・高さ・座金数に連動） ──
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

    const wAll = x3 - x0 + margin * 2
    const hAll = yt
    const padX = 24
    const padTop = 24
    const padBottom = 24
    const scale = Math.min((VB_W - padX * 2) / wAll, (VB_H - padTop - padBottom) / hAll)
    const ox = padX + ((VB_W - padX * 2) - wAll * scale) / 2 - (x0 - margin) * scale
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

    // 唐草エンド（両端の渦巻き・固定 px サイズ）
    const curlStart = `M ${X(x0)} ${Y(yb)} c -10 2 -12 12 -4 14 c 6 1.5 8 -4 3 -6`
    const curlEnd = `M ${X(x3)} ${Y(yt)} c 10 2 12 12 4 14 c -6 1.5 -8 -4 -3 -6`

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

    return { stair, rail, curlStart, curlEnd, zakin }
  }, [N, W, H, riser, going, L, zakinCount])

  const inputCls =
    "w-full border border-border rounded-md px-3 py-2 text-[15px] bg-white focus:outline-none focus:border-gold"

  return (
    <div className="mb-8 border-2 border-gold/20 bg-card rounded-md p-5">
      <p className="text-[11px] tracking-[0.2em] text-gold font-semibold uppercase mb-1">
        Price simulator
      </p>
      <p className="font-serif text-[15px] font-medium text-foreground mb-1">
        参考価格シミュレーター
      </p>
      <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
        階段の段数・幅・高さを入れると、実際の取り付けイメージと参考価格がすぐに確認できます。
        手すりは緩やかな曲線で、登り始めと登り終わりは水平に近く曲がる形状です。
      </p>

      {/* ミニ図解（側面図・入力に連動） */}
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto bg-white rounded-md border border-border mb-2">
        <rect x="0" y="0" width={VB_W} height={VB_H} rx="6" fill={COLOR_WALL} />
        <path d={svg.stair} fill={COLOR_STAIR_FILL} stroke={COLOR_STAIR_LINE} strokeWidth="1.5" strokeLinejoin="round" />
        {svg.zakin.map((z, i) => (
          <g key={i}>
            <line x1={z.x1} y1={z.y1} x2={z.x2} y2={z.y2} stroke={COLOR_BAR} strokeWidth="2.5" />
            <circle cx={z.cx} cy={z.cy} r={5} fill={COLOR_BRACKET} stroke="#a8894e" strokeWidth="1" />
          </g>
        ))}
        <path d={svg.rail} fill="none" stroke={COLOR_BAR} strokeWidth="5" strokeLinecap="round" />
        <path d={svg.curlStart} fill="none" stroke={COLOR_BAR} strokeWidth="3.5" strokeLinecap="round" />
        <path d={svg.curlEnd} fill="none" stroke={COLOR_BAR} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      <p className="text-[12px] md:text-[13px] text-muted-foreground text-center mb-4 leading-relaxed">
        直階段 {N}段・手すり全長 約{L.toLocaleString()}mm・座金 {zakinCount} 箇所
        <span className="block text-[11px] md:text-[12px]">
          （段鼻間 約{noseDiag.toLocaleString()}mm ＋ 両端の水平部 各{END_RUN}mm／座金は自動算出・位置は目安）
        </span>
      </p>

      {/* 段数 */}
      <div className="flex items-center justify-between border border-border rounded-md bg-white px-4 py-3 mb-3">
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

      {/* 階段の幅・高さ（ラベルの折返し差があっても入力欄は下端で揃える） */}
      <div className="grid grid-cols-2 gap-3 mb-1 items-end">
        <label className="block">
          <span className="text-[13px] text-muted-foreground">階段の幅（mm）</span>
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
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-[13px] text-muted-foreground">床から最上段の高さ（mm）</span>
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
            className={inputCls}
          />
        </label>
      </div>
      <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
        幅＝1段目から最上段までの段鼻の水平距離。分からない場合はそのままで構いません
        （段数に合わせた一般的な寸法・蹴上200mm・踏面220mm相当を自動セットしています）。
      </p>

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

      {/* エンド形状（価格は同一） */}
      {config.endShapes && config.endShapes.length > 0 && (
        <div className="mb-4">
          <p className="text-[13px] text-muted-foreground mb-2">
            エンド形状（両端 {config.endCount} 個・どちらも同価格）
          </p>
          <div className="flex gap-2">
            {config.endShapes.map((shape) => (
              <button
                key={shape}
                type="button"
                onClick={() => setEndShape(shape)}
                className={`rounded-md border-2 px-5 py-2 text-[14px] font-medium transition-colors ${
                  endShape === shape
                    ? "border-gold bg-gold/10 text-foreground"
                    : "border-border bg-white text-muted-foreground hover:border-gold/50"
                }`}
              >
                {shape} パターン
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            エンド部分の形状はギャラリーの商品写真でご確認いただけます。
          </p>
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
          <dt className="text-muted-foreground">唐草エンド（両端 {config.endCount} 個）</dt>
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
