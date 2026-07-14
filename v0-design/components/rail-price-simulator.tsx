"use client"

// 横型オーダーメイド手すり（Élisabeth 等）の参考価格シミュレーター。
// simple.ts の product.simulator 指定がある商品ページの価格表示直下に表示する。
//
// - 長さ (mm)・座金タイプ・エンド形状を選ぶと参考価格の内訳がリアルタイムに出る
// - 座金数は横型座金ルール（端100mm・最大ピッチ850mm ＝ calcZakin）で自動算出し、
//   「価格について」の公開価格表と同じ金額になる
// - 選択内容・参考価格は onQueryChange 経由で「見積もり依頼」リンクに引き継がれ、
//   お問い合わせフォームの本文にプリフィルされる（app/contact/page.tsx）

import { useEffect, useMemo, useState } from "react"
import { calcZakin, getZakinPositions } from "@/lib/drawing-modal/rene-constants"
import type { RailSimulatorConfig } from "@/lib/products/simple"

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(Math.round(v) || lo, lo), hi)

// ミニ図解の viewBox / 配色（inline-rail-simulator.tsx と揃える）
const VB_W = 500
const VB_H = 120
const PAD = 40
const BAR_Y = 48
const COLOR_BAR = "#333"
const COLOR_DIM = "#888"
const COLOR_TEXT = "#555"
const COLOR_BRACKET = "#c8a96e" // 座金（金色）

interface RailPriceSimulatorProps {
  config: RailSimulatorConfig
  /** 見積もり依頼リンクに付ける type= の値（商品 slug） */
  queryType: string
  onQueryChange?: (qs: string) => void
}

export function RailPriceSimulator({ config, queryType, onQueryChange }: RailPriceSimulatorProps) {
  const [lengthMm, setLengthMm] = useState(3000)
  const [zakinId, setZakinId] = useState(config.zakinTypes[0]?.id ?? "")
  const [endShape, setEndShape] = useState(config.endShapes?.[0] ?? "")

  const L = useMemo(() => clamp(lengthMm, config.minMm, config.maxMm), [lengthMm, config.minMm, config.maxMm])
  const zakinType = config.zakinTypes.find((z) => z.id === zakinId) ?? config.zakinTypes[0]
  const zakinCount = calcZakin(L)

  const railPrice = Math.round((L / 1000) * config.unitPricePerM)
  const endTotal = config.endPrice * config.endCount
  const zakinTotal = zakinCount * zakinType.price
  const total = railPrice + endTotal + zakinTotal

  useEffect(() => {
    onQueryChange?.(
      `&type=${queryType}&len=${L}&end=${encodeURIComponent(endShape)}&zakin=${zakinType.id}&zcount=${zakinCount}&total=${total}`,
    )
  }, [L, endShape, zakinType.id, zakinCount, total, queryType, onQueryChange])

  // ── ミニ図解（長さ・座金数に連動） ──
  const X = (mm: number) => PAD + (mm / L) * (VB_W - PAD * 2)
  const zakinPositions = getZakinPositions(L, zakinCount)

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
        長さと座金タイプを選ぶと、参考価格がすぐに確認できます。
        座金の数は強度上の標準ピッチから自動で算出します。
      </p>

      {/* ミニ図解（正面図・長さと座金数に連動） */}
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto bg-white rounded-md border border-border mb-4">
        {/* 寸法線 */}
        <line x1={PAD} y1={20} x2={VB_W - PAD} y2={20} stroke={COLOR_DIM} strokeWidth="1" />
        <line x1={PAD} y1={14} x2={PAD} y2={26} stroke={COLOR_DIM} strokeWidth="1" />
        <line x1={VB_W - PAD} y1={14} x2={VB_W - PAD} y2={26} stroke={COLOR_DIM} strokeWidth="1" />
        <text x={VB_W / 2} y={14} fontSize="12" fill={COLOR_TEXT} textAnchor="middle">
          L = {L.toLocaleString()}mm
        </text>
        {/* 手すり本体（両端はエンド装飾を小さな渦巻きで示す） */}
        <line x1={X(0)} y1={BAR_Y} x2={X(L)} y2={BAR_Y} stroke={COLOR_BAR} strokeWidth="5" strokeLinecap="round" />
        <path
          d={`M ${X(0)} ${BAR_Y} c -10 2 -12 12 -4 14 c 6 1.5 8 -4 3 -6`}
          fill="none"
          stroke={COLOR_BAR}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d={`M ${X(L)} ${BAR_Y} c 10 2 12 12 4 14 c -6 1.5 -8 -4 -3 -6`}
          fill="none"
          stroke={COLOR_BAR}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* 座金（支柱 + 金色の円） */}
        {zakinPositions.map((pos, i) => (
          <g key={i}>
            <line x1={X(pos)} y1={BAR_Y + 2} x2={X(pos)} y2={BAR_Y + 22} stroke={COLOR_BAR} strokeWidth="2.5" />
            <circle cx={X(pos)} cy={BAR_Y + 26} r={5.5} fill={COLOR_BRACKET} stroke="#a8894e" strokeWidth="1" />
          </g>
        ))}
        <text x={VB_W / 2} y={BAR_Y + 52} fontSize="12" fill={COLOR_TEXT} textAnchor="middle">
          座金 {zakinCount} 箇所（自動算出・位置は目安）
        </text>
      </svg>

      {/* 長さ */}
      <label className="block mb-2">
        <span className="text-[13px] text-muted-foreground">
          手すりの長さ（{config.minMm.toLocaleString()}〜{config.maxMm.toLocaleString()}mm）
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={config.minMm}
          max={config.maxMm}
          step={100}
          value={lengthMm}
          onChange={(e) => setLengthMm(Number(e.target.value))}
          onBlur={() => setLengthMm(L)}
          className={inputCls}
        />
      </label>
      {config.presetsMm && config.presetsMm.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {config.presetsMm.map((mm) => (
            <button
              key={mm}
              type="button"
              onClick={() => setLengthMm(mm)}
              className={`rounded-full border px-3 py-1 text-[13px] transition-colors ${
                L === mm
                  ? "border-gold bg-gold/10 text-foreground font-medium"
                  : "border-border bg-white text-muted-foreground hover:border-gold hover:text-gold"
              }`}
            >
              {mm / 1000}m
            </button>
          ))}
        </div>
      )}

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
            本体（{(L / 1000).toLocaleString()}m × ¥{config.unitPricePerM.toLocaleString()}）
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
        ※ 座金の数は端 100mm・最大 850mm 間隔の標準ピッチで自動算出した参考値です。
        階段の形状・取付下地により本数・金額が変わります。
        下の「見積もり依頼」からこの内容がそのまま引き継がれます（お見積もり無料）。
      </p>
    </div>
  )
}
