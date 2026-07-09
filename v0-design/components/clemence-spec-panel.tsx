"use client"

// Clémence（トイレ手すり・緩やか曲線タイプ）の寸法・ブラケット位置・延長オプション指定パネル。
// 商品ページ（simple-product-page）の Clémence のみに表示する。
//
// - 横 W（950〜1,000。標準サイズ・一律料金）・縦 H（〜500）と、
//   ブラケット②③の位置（①＝バー上端からの水平距離）を入力
//   （標準: 座金間 455 ＝ 壁下地の尺モジュールピッチ。②=455 / ③=910）
// - ③側は最大+200mmまで延長可（+¥3,000）
// - ミニ図解がリアルタイムに反映され、「設計図（PDF）を見る」で CAD 図面モーダルを開く
// - 入力内容・延長・概算合計額は onQueryChange 経由で「ご注文・お問い合わせ」リンクに引き継がれる

import { useEffect, useMemo, useState } from "react"
import { FileText } from "lucide-react"
import { ClemenceDrawingModal } from "@/components/drawing-modal/clemence-drawing-modal"
import {
  clemencePathD,
  clemencePathY,
  BASE_PRICE,
  EXTENSION_MAX_MM,
  EXTENSION_PRICE,
  W_STANDARD_MIN,
  BAR_D,
  ROUND_POST_GAP_MM,
  PLATE_A_POST_D,
} from "@/lib/drawing-modal/clemence-svg"

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
  const [x2, setX2] = useState(455) // ②: ①（上端）から右への水平距離（下地 455 ピッチ）
  const [x3, setX3] = useState(910) // ③: ①から右への水平距離
  const [extension, setExtension] = useState(0) // ③側の延長（0〜200mm）
  const [drawingOpen, setDrawingOpen] = useState(false)

  // クランプ後の実効値（図・図面・注文引き継ぎはこの値を使う）
  const eff = useMemo(() => {
    const W = clamp(w, W_STANDARD_MIN, W_MAX)
    const H = clamp(h, H_MIN, H_MAX)
    const X2 = clamp(x2, 120, W - 170)
    const X3 = clamp(x3, X2 + 100, W - 70)
    const EXT = clamp(extension, 0, EXTENSION_MAX_MM)
    return { W, H, X2, X3, EXT }
  }, [w, h, x2, x3, extension])

  const totalPrice = BASE_PRICE + (eff.EXT > 0 ? EXTENSION_PRICE : 0)

  useEffect(() => {
    onQueryChange?.(
      `&type=clemence&w=${eff.W}&h=${eff.H}&x2=${eff.X2}&x3=${eff.X3}&ext=${eff.EXT}&total=${totalPrice}`,
    )
  }, [eff, totalPrice, onQueryChange])

  // ── ミニ図解（正面図・入力に連動・図面と同じ形状関数を使用） ──
  const VB_W = 340
  const VB_H = 220
  const pad = 46
  const totalW = eff.W + eff.EXT
  const scale = Math.min((VB_W - pad * 2) / totalW, (VB_H - pad * 2) / eff.H)
  const ox = pad + (VB_W - pad * 2 - totalW * scale) / 2
  const oy = VB_H - pad
  const X = (v: number) => ox + v * scale
  const Y = (v: number) => oy - v * scale
  // 実寸 mm × scale をそのまま使う（最小値は視認性確保のための下限のみで、
  // 以前の大きすぎる下限=座金が実際よりだいぶ大きく見える原因だった）
  const barW = Math.max(3, 22 * scale)
  const roundR = Math.max(4, 22.5 * scale)
  const ovalRx = Math.max(3, 12.5 * scale)
  const ovalRy = Math.max(5, 23.5 * scale)
  // バー中心線 → 座金A（丸型）円中心までのオフセット（バー半径＋支柱ぶんの隙間＋座金半径）。
  // バー線と座金円が重ならないよう、必ずバーの半太さ+隙間ぶん離す。
  const discOffset = (BAR_D / 2 + ROUND_POST_GAP_MM) * scale + roundR

  const inputCls =
    "w-full border border-border rounded-md px-3 py-2 text-[15px] bg-white focus:outline-none focus:border-gold"

  return (
    <div className="mb-8 border-2 border-gold/20 bg-card rounded-md p-5">
      <p className="font-serif text-[15px] font-medium text-foreground mb-1">
        サイズとブラケット位置の指定
      </p>
      <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
        壁下地（柱・間柱）の位置に合わせてブラケット位置を指定できます（補強板不要）。
        ①はバー上端の座金B、②③はバー下面の座金A（①からの水平距離で指定）です。
        入力すると下の図と設計図に反映されます。
      </p>

      {/* ミニ図解 */}
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto bg-white rounded-md border border-border mb-4">
        {/* 座金A（②③・丸型）: バーに接触する程度まで近づけ、支柱は座金の中心からバーへ伸ばす
            （中心〜円周の部分は下で描く座金円に隠れ、結果として座金から支柱が出て見える） */}
        {[eff.X2, eff.X3].map((bx, i) => {
          const barBottomY = Y(clemencePathY(eff.W, eff.H, bx, eff.EXT)) + (BAR_D / 2) * scale
          const discCy = Y(clemencePathY(eff.W, eff.H, bx, eff.EXT)) + discOffset
          const postW = Math.max(2, PLATE_A_POST_D * scale)
          return (
            <g key={i}>
              <rect
                x={X(bx) - postW / 2}
                y={barBottomY}
                width={postW}
                height={Math.max(0, discCy - barBottomY)}
                fill="#ffffff"
                stroke="#9ca3af"
                strokeWidth="1"
              />
              <circle cx={X(bx)} cy={discCy} r={roundR} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
            </g>
          )
        })}
        {/* 丸棒（緩やか曲線＋延長・図面と同じ形状） */}
        <path
          d={clemencePathD(eff.W, eff.H, X, Y, eff.EXT)}
          fill="none"
          stroke="#1f2937"
          strokeWidth={barW}
          strokeLinecap="round"
        />
        {/* 座金B（①・楕円・バー上端。中心をバー中心線に揃える） */}
        <ellipse
          cx={X(0)}
          cy={Y(clemencePathY(eff.W, eff.H, 0, eff.EXT))}
          rx={ovalRx}
          ry={ovalRy}
          fill="#e5e7eb"
          stroke="#9ca3af"
          strokeWidth="1"
        />
        {/* ブラケット番号 */}
        <text x={X(0) + ovalRx + 10} y={Y(clemencePathY(eff.W, eff.H, 0, eff.EXT))} fontSize="13" fill="#92650a" fontWeight="600">①</text>
        <text x={X(eff.X2)} y={Y(clemencePathY(eff.W, eff.H, eff.X2, eff.EXT)) + discOffset + roundR + 13} fontSize="13" fill="#92650a" textAnchor="middle" fontWeight="600">②</text>
        <text x={X(eff.X3)} y={Y(clemencePathY(eff.W, eff.H, eff.X3, eff.EXT)) + discOffset + roundR + 13} fontSize="13" fill="#92650a" textAnchor="middle" fontWeight="600">③</text>
        {/* 寸法ラベル */}
        <text x={X(eff.W / 2)} y={oy + 40} fontSize="12" fill="#6b7280" textAnchor="middle">
          横 W = {eff.W.toLocaleString()}mm{eff.EXT > 0 ? ` (+${eff.EXT}mm延長)` : ""}
        </text>
        <text
          x={X(0) - 30}
          y={Y(eff.H / 2)}
          fontSize="12"
          fill="#6b7280"
          textAnchor="middle"
          transform={`rotate(-90 ${X(0) - 30} ${Y(eff.H / 2)})`}
        >
          縦 H = {eff.H.toLocaleString()}mm
        </text>
      </svg>

      {/* 入力グリッド */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-[13px] text-muted-foreground">横 W（{W_STANDARD_MIN}〜{W_MAX}mm）</span>
          <input type="number" inputMode="numeric" min={W_STANDARD_MIN} max={W_MAX} step={10} value={w}
            onChange={(e) => setW(Number(e.target.value))} onBlur={() => setW(eff.W)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-[13px] text-muted-foreground">縦 H（{H_MIN}〜{H_MAX}mm）</span>
          <input type="number" inputMode="numeric" min={H_MIN} max={H_MAX} step={10} value={h}
            onChange={(e) => setH(Number(e.target.value))} onBlur={() => setH(eff.H)} className={inputCls} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <label className="block">
          <span className="text-[13px] text-muted-foreground">② ①から右へ（mm）</span>
          <input type="number" inputMode="numeric" step={5} value={x2}
            onChange={(e) => setX2(Number(e.target.value))} onBlur={() => setX2(eff.X2)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-[13px] text-muted-foreground">③ ①から右へ（mm）</span>
          <input type="number" inputMode="numeric" step={5} value={x3}
            onChange={(e) => setX3(Number(e.target.value))} onBlur={() => setX3(eff.X3)} className={inputCls} />
        </label>
      </div>
      <p className="text-[12px] md:text-[13px] text-muted-foreground leading-relaxed mb-4">
        ※ 壁下地は一般に 455mm／910mm ピッチです。標準は座金間 455（②=455・③=910）。
        下地位置が分かる場合はその位置に合わせてください。ご不明な場合は標準のままで構いません（ご注文後に調整できます）。
        500×1000mmの標準サイズより小さいご希望（横950mm未満）は、このツールでは指定できません。お問い合わせにてご相談ください。
      </p>

      {/* ③側延長オプション */}
      <div className="border border-border rounded-md p-4 mb-4 bg-white">
        <label className="flex items-center gap-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={eff.EXT > 0}
            onChange={(e) => setExtension(e.target.checked ? EXTENSION_MAX_MM : 0)}
            className="w-4 h-4 accent-[color:var(--gold,#b8860b)]"
          />
          <span className="text-[14px] font-medium text-foreground">
            ③側を延長する（最大{EXTENSION_MAX_MM}mm・+¥{EXTENSION_PRICE.toLocaleString()}）
          </span>
        </label>
        {eff.EXT > 0 && (
          <label className="block pl-6">
            <span className="text-[13px] text-muted-foreground">延長量（0〜{EXTENSION_MAX_MM}mm）</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={EXTENSION_MAX_MM}
              step={5}
              value={extension}
              onChange={(e) => setExtension(Number(e.target.value))}
              onBlur={() => setExtension(eff.EXT)}
              className={`${inputCls} max-w-[160px]`}
            />
          </label>
        )}
      </div>

      <div className="flex items-baseline justify-between border-t border-border pt-3 mb-4">
        <span className="text-[14px] text-muted-foreground">概算合計（税込・送料別）</span>
        <span className="font-serif text-[20px] font-medium text-foreground">
          ¥{totalPrice.toLocaleString()}
        </span>
      </div>

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
        drawing={{ wMm: eff.W, hMm: eff.H, x2Mm: eff.X2, x3Mm: eff.X3, extensionMm: eff.EXT }}
      />
    </div>
  )
}
