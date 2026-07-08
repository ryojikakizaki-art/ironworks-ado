"use client"

// Clémence（L型トイレ手すり）の寸法・ブラケット位置指定パネル。
// 商品ページ（simple-product-page）の Clémence のみに表示する。
//
// - 横 W（〜1,000）・縦 H（〜500）と、ブラケット3点の位置を入力
//   （標準: 横部2点＝開放端から100・そこから910間隔ベース／縦部上端から50。
//    壁下地 455/910 ピッチに合わせてお客様が調整できるのがこの商品の売り）
// - ミニ図解がリアルタイムに反映され、「設計図（PDF）を見る」で CAD 図面モーダルを開く
// - 入力内容は onQueryChange 経由で「ご注文・お問い合わせ」リンクに引き継がれる

import { useEffect, useMemo, useState } from "react"
import { FileText } from "lucide-react"
import { ClemenceDrawingModal } from "@/components/drawing-modal/clemence-drawing-modal"

const W_MIN = 300
const W_MAX = 1000
const H_MIN = 200
const H_MAX = 500

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(Math.round(v) || lo, lo), hi)

interface ClemenceSpecPanelProps {
  onQueryChange?: (qs: string) => void
}

export function ClemenceSpecPanel({ onQueryChange }: ClemenceSpecPanelProps) {
  const [w, setW] = useState(1000)
  const [h, setH] = useState(500)
  const [b1, setB1] = useState(100) // 横部・開放端から
  const [b2, setB2] = useState(970) // 横部・開放端から（下地 910 ピッチベース）
  const [b3, setB3] = useState(50) // 縦部・上端から
  const [drawingOpen, setDrawingOpen] = useState(false)

  // クランプ後の実効値（図・図面・注文引き継ぎはこの値を使う）
  const eff = useMemo(() => {
    const W = clamp(w, W_MIN, W_MAX)
    const H = clamp(h, H_MIN, H_MAX)
    const B1 = clamp(b1, 30, W - 90)
    const B2 = clamp(b2, B1 + 60, W - 30)
    const B3 = clamp(b3, 30, H - 60)
    return { W, H, B1, B2, B3 }
  }, [w, h, b1, b2, b3])

  useEffect(() => {
    onQueryChange?.(
      `&type=clemence&w=${eff.W}&h=${eff.H}&b1=${eff.B1}&b2=${eff.B2}&b3=${eff.B3}`,
    )
  }, [eff, onQueryChange])

  // ── ミニ図解（正面図・入力に連動） ──
  const VB_W = 340
  const VB_H = 220
  const pad = 46
  const scale = Math.min((VB_W - pad * 2) / eff.W, (VB_H - pad * 2) / eff.H)
  const ox = pad + (VB_W - pad * 2 - eff.W * scale) / 2
  const oy = VB_H - pad
  const X = (v: number) => ox + v * scale
  const Y = (v: number) => oy - v * scale
  const c = 11 // 丸棒中心線オフセット
  const barW = Math.max(6, 22 * scale)
  const brackets: Array<[number, number, string]> = [
    [eff.W - eff.B1, c, "①"],
    [eff.W - eff.B2, c, "②"],
    [c, eff.H - eff.B3, "③"],
  ]

  const inputCls =
    "w-full border border-border rounded-md px-3 py-2 text-[15px] bg-white focus:outline-none focus:border-gold"

  return (
    <div className="mb-8 border-2 border-gold/20 bg-card rounded-md p-5">
      <p className="font-serif text-[15px] font-medium text-foreground mb-1">
        サイズとブラケット位置の指定
      </p>
      <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
        壁下地（柱・間柱）の位置に合わせてブラケット3点を指定できます（補強板不要）。
        入力すると下の図と設計図に反映されます。
      </p>

      {/* ミニ図解 */}
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto bg-white rounded-md border border-border mb-4">
        {/* 座金 */}
        {brackets.map(([bx, by, label]) => (
          <g key={label}>
            <circle cx={X(bx)} cy={Y(by)} r={Math.max(9, 22.5 * scale)} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
          </g>
        ))}
        {/* 丸棒（L型） */}
        <path
          d={`M ${X(c)} ${Y(eff.H)} L ${X(c)} ${Y(c + 50)} Q ${X(c)} ${Y(c)} ${X(c + 50)} ${Y(c)} L ${X(eff.W)} ${Y(c)}`}
          fill="none"
          stroke="#1f2937"
          strokeWidth={barW}
          strokeLinecap="butt"
        />
        {/* ブラケット番号 */}
        {brackets.map(([bx, by, label]) => (
          <text
            key={label}
            x={X(bx) + (label === "③" ? 26 : 0)}
            y={Y(by) + (label === "③" ? 4 : 30)}
            fontSize="13"
            fill="#92650a"
            textAnchor="middle"
            fontWeight="600"
          >
            {label}
          </text>
        ))}
        {/* 寸法ラベル */}
        <text x={X(eff.W / 2)} y={oy + 30} fontSize="12" fill="#6b7280" textAnchor="middle">
          横 W = {eff.W.toLocaleString()}mm
        </text>
        <text
          x={X(0) - 26}
          y={Y(eff.H / 2)}
          fontSize="12"
          fill="#6b7280"
          textAnchor="middle"
          transform={`rotate(-90 ${X(0) - 26} ${Y(eff.H / 2)})`}
        >
          縦 H = {eff.H.toLocaleString()}mm
        </text>
      </svg>

      {/* 入力グリッド */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-[13px] text-muted-foreground">横 W（{W_MIN}〜{W_MAX}mm）</span>
          <input type="number" inputMode="numeric" min={W_MIN} max={W_MAX} step={10} value={w}
            onChange={(e) => setW(Number(e.target.value))} onBlur={() => setW(eff.W)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-[13px] text-muted-foreground">縦 H（{H_MIN}〜{H_MAX}mm）</span>
          <input type="number" inputMode="numeric" min={H_MIN} max={H_MAX} step={10} value={h}
            onChange={(e) => setH(Number(e.target.value))} onBlur={() => setH(eff.H)} className={inputCls} />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <label className="block">
          <span className="text-[13px] text-muted-foreground">① 開放端から</span>
          <input type="number" inputMode="numeric" step={5} value={b1}
            onChange={(e) => setB1(Number(e.target.value))} onBlur={() => setB1(eff.B1)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-[13px] text-muted-foreground">② 開放端から</span>
          <input type="number" inputMode="numeric" step={5} value={b2}
            onChange={(e) => setB2(Number(e.target.value))} onBlur={() => setB2(eff.B2)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-[13px] text-muted-foreground">③ 上端から</span>
          <input type="number" inputMode="numeric" step={5} value={b3}
            onChange={(e) => setB3(Number(e.target.value))} onBlur={() => setB3(eff.B3)} className={inputCls} />
        </label>
      </div>
      <p className="text-[12px] md:text-[13px] text-muted-foreground leading-relaxed mb-4">
        ※ 壁下地は一般に 455mm／910mm ピッチです。下地位置が分かる場合はその位置に合わせてください。
        ご不明な場合は標準位置のままで構いません（ご注文後に調整できます）。
      </p>

      <button
        type="button"
        onClick={() => setDrawingOpen(true)}
        className="inline-flex items-center gap-2 border border-dark/20 bg-white hover:border-gold hover:text-gold transition-colors rounded-md px-4 py-2.5 text-[14px] font-medium"
      >
        <FileText className="w-4 h-4" />
        入力内容の設計図（PDF）を見る
      </button>

      <ClemenceDrawingModal
        open={drawingOpen}
        onClose={() => setDrawingOpen(false)}
        drawing={{ wMm: eff.W, hMm: eff.H, b1Mm: eff.B1, b2Mm: eff.B2, b3Mm: eff.B3 }}
      />
    </div>
  )
}
