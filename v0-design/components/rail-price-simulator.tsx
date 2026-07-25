"use client"

// 横型オーダーメイド階段手すり（Élisabeth 等）の参考価格シミュレーター。
// simple.ts の product.simulator 指定がある商品ページの価格表示直下に表示する。
//
// - 階段の段数（直階段・6〜15段）と「階段の幅」「床から最上段までの高さ」を
//   入力すると、手すりを階段に実配置した側面図と参考価格がリアルタイムに出る。
//   幅・高さの入力マスは図中の寸法線上に配置（2026-07-14 蠣﨑さん指示:
//   一般のお客様に測る場所が伝わるように）
// - 手すりの長さ＝1段目と最上段の段鼻の直線距離＋両端の水平部。水平部は
//   下段・上段それぞれ入力で指定でき（既定 各200mm）、全長が確定できる
//   （2026-07-19 蠣﨑さん指示）
// - エンド（唐草形状 Type A / B）は下側（登り始め）・上側（登り終わり）で
//   それぞれ実物写真サムネイルから選択でき、図中の手すり端の形も連動して変わる
// - 座金数は横型座金ルール（端100mm・最大ピッチ850mm ＝ calcZakin）で
//   自動算出し、「価格について」の公開価格表と同じ算出基準になる
// - 選択内容・参考価格は onQueryChange 経由で「見積もり依頼」リンクに引き継がれ、
//   お問い合わせフォームの本文にプリフィルされる（app/contact/page.tsx）
// - 回り階段（かね折れ L字・折り返し コの字）にも対応（2026-07-25 蠣﨑さん指示）。
//   上から見た平面図を選び、蹴上・踏面・蹴込と各壁の幅を入れると、手すりが
//   複数本（L字=2本・コの字=3本）に分かれた概算長さと本ごとの金額が出る。
//   製作ルール: 手すりは曲げ加工せずフライトごとの直線ピース別体。曲がり角では
//   曲がる側の壁の80mm手前で終わり、90度回った後のぼってきた側の壁から80mm
//   空けて次の1本が始まる。唐草エンドは1段目側・最終段側の2個のみ
//   （_shared-memory/ec-knowledge-products.md「横型手すりの製作・施工」と同一ルール）

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Maximize2 } from "lucide-react"
import { calcZakin, getZakinPositions } from "@/lib/drawing-modal/rene-constants"
import { galleryUrl } from "@/lib/products/display"
import { END_ART } from "@/lib/products/elisabeth-end-art"
import type { RailSimulatorConfig } from "@/lib/products/simple"

// ── 階段の標準寸法 (mm)。幅・高さの自動セットに使う ──
const STD_RISER = 200 // 蹴上
const STD_TREAD = 240 // 踏面
const STD_KICK = 20 // 蹴込み
const STD_GOING = STD_TREAD - STD_KICK // 1段あたりの水平進み（段鼻々距離）＝踏面−蹴込み
const RAIL_H = 800 // 段鼻から手すり中心までの高さ

// ── 蹴上・踏面・蹴込の入力範囲 (mm)。正確な階段寸法出し用
// （2026-07-22 蠣﨑さん指示: 段鼻・蹴上・踏面・蹴込の説明とともに入力欄を作る） ──
const RISER_MIN = 120
const RISER_MAX = 250
const TREAD_MIN = 180
const TREAD_MAX = 350
const KICK_MIN = 0
const KICK_MAX = 40
// 1段目〜最上段の段鼻の直線距離を直接入力する場合の範囲 (mm)
const DIAG_MIN = 800
const DIAG_MAX = 6000

// ── エンド装飾（唐草）の実寸比率描画パラメータ ──
// 手すり本体の実寸径 (mm)。唐草はこの径基準の実寸比率で描く（× SIZE_FACTOR）
const BAR_DIAMETER_MM = 22
// 実寸に対してやや大きく（＝太く）描く倍率。実寸ぴったりだと図で小さすぎるため
// （2026-07-22 蠣﨑さん指示: もう少し大きく／太く）。描画サイズ（s）と張り出し量（reach）を
// 同率で伸ばすので、ループ先端と寸法線の一致は保たれる。1.0 = 実寸ぴったり
const END_ART_SIZE_FACTOR = 1.6
// 唐草を実寸比率(×SIZE_FACTOR)で描いたときの、ネック切り口からループ先端までの
// 水平張り出し量 (mm)。トレース由来の一定値でブラウザ実測で微調整（s = BAR_DIAMETER_MM/
// barPx × scale × SIZE_FACTOR で描くと×1.0 で A≒170mm・B≒182mm）。エンド部の入力値
// （段鼻からループ先端まで）に対しレール直線部の終点＝取付ネックをこの分内側へ置く
const END_CURL_REACH_MM: Record<string, number> = { A: 170, B: 182 }
const END_CURL_REACH_MM_FALLBACK = 170
// 唐草の最大張り出し量（上側エンドを常に水平に保つための下限計算に使う）
const MAX_END_REACH_MM = Math.max(...Object.values(END_CURL_REACH_MM)) * END_ART_SIZE_FACTOR

// ── エンド部（段鼻からループ先端まで）の入力範囲 (mm) ──
// 下段は段鼻より出ないこともあるため 0 まで（2026-07-22 蠣﨑さん指示・マイナスなし）。
// 上段は登り切りで必ず外へ出るため、唐草が水平部に収まる最短＝最大張り出し量を下限とする
// （これ未満だと唐草が斜面に食い込むため）
const RUN_MIN_BOTTOM = 0
const RUN_MIN_TOP = Math.ceil(MAX_END_REACH_MM / 10) * 10
const RUN_MAX = 1000
// 標準値（段鼻から出る標準的なエンド部）。上側下限＋余裕を確保し、下段も水平に収まる
const END_RUN = Math.max(300, RUN_MIN_TOP + 20)

// 入力範囲 (mm) — 幅・高さ
const W_MIN = 800
const W_MAX = 6000
const H_MIN = 800
const H_MAX = 3600

// ── 回り階段（かね折れ L字・折り返し コの字）の概算パラメータ (mm) ──
// （2026-07-25 蠣﨑さん指示・製作ルールは ec-knowledge-products.md と同一）
// 曲がり角で壁から逃がす距離。曲がる側の壁の 80mm 手前で手すりが終わり、
// 90度回った後は のぼってきた側の壁から 80mm 空けて次の1本が始まる
const CORNER_WALL_GAP = 80
// 回り階段モードのエンド部（段鼻から唐草先端までの水平部）。
// 最終段の段鼻から 300mm 過ぎてエンドの端が終わる＝1段目側も同値で概算
const WINDING_END_RUN = 300
// 各壁の幅の入力範囲。コの字の壁②（壁から壁の内寸）は階段2列ぶんで最小値が大きい
const WALL_MIN = 600
const WALL_MID_MIN = 1400
const WALL_MAX = 4000
// 既定値（一般的な住宅の回り階段を想定）
const WALL_DEFAULT = 2000
const WALL_MID_DEFAULT = 1800
// 平面図で手すり中心線を壁面から離す距離（壁〜手すり離れ40mm＋バー半径）
const RAIL_WALL_OFFSET_MM = 55
// 平面図の壁の描画厚み
const PLAN_WALL_T = 100

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(Math.round(v) || lo, lo), hi)

/** 段数 → 標準の階段の幅（1段目〜最上段の段鼻の水平距離） */
const stdWidth = (steps: number) => (steps - 1) * STD_GOING
/** 段数 → 標準の床から最上段までの高さ */
const stdHeight = (steps: number) => steps * STD_RISER

// ミニ図解の viewBox / 配色（inline-rail-simulator.tsx と揃える）。
// 注記テキストは縮小時に小さくなりすぎるため SVG 内には置かず、HTML 側に出す
const VB_W = 500
const VB_H = 340
// 回り階段の平面図（上から見た図）は縦長になりやすいため viewBox を別に持つ
const VB_PLAN_H = 470
const COLOR_BAR = "#333"
const COLOR_DIM = "#9ca3af" // 寸法線
// 壁＝薄グレー・階段＝白抜き。壁を敷くことで座金支柱が「壁付け」に見え、
// 手すりが宙に浮いた印象になるのを防ぐ（配色は承認済みグレー #f3f4f6 系）
const COLOR_WALL = "#f3f4f6"
const COLOR_STAIR_FILL = "#ffffff"
const COLOR_STAIR_LINE = "#c2c6cd"

// レール本体の描画太さ (viewBox 単位)。見やすさのため実寸 22φ より太く誇張する。
// 2026-07-16 蠣﨑さん指示: エンドの切り口太さと揃うよう 5 → 3.5 に細く
const RAIL_STROKE = 3.5
// 座金（丸座金）の実寸半径 (mm)・支柱の実寸長さ (mm)。座金は実際の大きさに合わせて
// 小さく描く（2026-07-22 蠣﨑さん指示: 座金を実際通りに小さく・色は黒に）
const WASHER_R_MM = 22
const POST_MM = 90
// エンドを外側へ向かってわずかに下げる角度 (度・上下で別指定)。
// 2026-07-15 蠣﨑さん調整: 下段はもう少し下げ、上段は手すりから
// スムーズに繋がるよう浅く
const END_TILT_BOTTOM_DEG = 5
const END_TILT_TOP_DEG = 1.5
// 2026-07-16 蠣﨑さん指摘: 上段では A はもう少し下向きに。
// 2026-07-19 蠣﨑さん指示: B は手すりに綺麗につながるよう接続角度を修正
// （レール端は水平・B 再生成アートのネック接線も水平。先端の持ち上げは
//   アート側の曲げワープで表現＝elisabeth-end-art.ts 参照）。下段は 0、
//   上段はプレビュー確認で「もう少し上げる」指摘 → -5（負＝先端が上がる向き）
const END_TILT_TOP_DEG_BY_ID: Record<string, number> = { A: 9, B: -5 }
const END_TILT_BOTTOM_DEG_BY_ID: Record<string, number> = { B: 0 }
// エンド装飾の微調整倍率（実寸比率に対する補正・通常 1）。A/B で個別に効かせられる
const END_ART_EXTRA_SCALE_BY_ID: Record<string, number> = { A: 1, B: 1 }
// レール本体の曲線プロファイル。蠣﨑さんの言語化仕様（2026-07-16）:
// 「登り始めは少しきつめに上がり、その後山なりに緩やかに曲がり、
//   中央座金を中心として下弓なりになり、上がりきり付近でエンド部が
//   水平近くになるように少しきつめに下がり、エンドに綺麗につながる（登りと逆）」
// を、斜め区間の弦からの偏差（弦長比 %）として等間隔 33 点で表現したもの
// （生成 = ado作業ファイル/elisabeth-simulator-curve/spec_profile.py）。
// 8 回の正弦波近似がすべて不合格だった後、この言語化仕様ベースで初めて
// 「ほぼ良い」の評価を得た形（2026-07-16 蠣﨑さん確認済み）。
const WAVE_PROFILE_PCT = [
  0, 0.39, 0.75, 1.07, 1.33, 1.51, 1.59, 1.57, 1.41, 1.11, 0.7, 0.24, -0.23,
  -0.66, -1.0, -1.22, -1.3, -1.22, -1.0, -0.66, -0.23, 0.24, 0.7, 1.11, 1.41,
  1.57, 1.59, 1.51, 1.33, 1.07, 0.75, 0.39, 0,
]
// 偏差の倍率（1 = 仕様どおり。プレビューでの見た目調整用ノブ）
const WAVE_SCALE = 1
// 両端の曲がりの丸み（移動平均フィレットの半径感 mm）。「きつめ」だが折れない程度
const FILLET_MM = 160
// レール中心線のサンプリング間隔 (mm)
const SAMPLE_MM = 25

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
function EndDecoration({
  id,
  x,
  y,
  outward,
  scale,
  railAngleDeg = 0,
}: {
  id: string
  x: number
  y: number
  outward: 1 | -1
  /** 階段側の縮尺 (viewBox 単位/mm)。実寸比率で唐草を描くために使う */
  scale: number
  /** 取付ネックがレールのどの傾きの位置にあるか（水平部＝0・斜面上＝斜面角）。
      段鼻近くに引っ込めたとき（RB 小）唐草が斜面に沿って巻くように回す */
  railAngleDeg?: number
}) {
  const art = END_ART[id]
  if (art) {
    // 実寸比率: バー太さ barPx が「階段と同じ縮尺で 22mm」になる縮尺で描く。
    // これにより唐草全体が階段に対して実寸の大きさになり、ループ先端が水平部の
    // 入力値の位置に収まる（2026-07-22 蠣﨑さん指示）
    const s = (BAR_DIAMETER_MM / art.barPx) * scale * END_ART_SIZE_FACTOR * (END_ART_EXTRA_SCALE_BY_ID[id] ?? 1)
    // アート座標系はループ=左・切り口=右端。x 方向だけ -outward・s を掛けると
    // 下側で scale(s, s)（そのまま）、上側で scale(-s, s) = 左右反転になる。
    // rotate は外側の先端が tilt ぶん下がる向き（下側=反時計回り・上側=時計回り）＋
    // レール斜面角（段鼻近くに引っ込めたときに斜面へ沿わせる）
    const tilt =
      outward === 1
        ? (END_TILT_TOP_DEG_BY_ID[id] ?? END_TILT_TOP_DEG)
        : (END_TILT_BOTTOM_DEG_BY_ID[id] ?? END_TILT_BOTTOM_DEG)
    return (
      <g
        transform={`translate(${x} ${y}) rotate(${outward * tilt + railAngleDeg}) scale(${-outward * s} ${s}) translate(${-art.viewW} ${-art.attachY})`}
      >
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

/**
 * 図の下に置く寸法入力コントロール（幅・高さ・下側エンド・上側エンド共通）。
 * 以前は SVG の寸法線上に入力マスを重ねていたが、スマホなど図が小さい端末では
 * 固定サイズの入力欄が手すり・階段に重なって見づらかったため（2026-07-22 蠣﨑さん指摘）、
 * 図の中には数値ラベルだけ出し、編集は図の下のこのコントロールで行う。
 * value=入力中の生値・effective=クランプ後の実効値（±ボタンの基準）。
 */
function DimStepper({
  label,
  hint,
  value,
  effective,
  setValue,
  min,
  max,
  step = 10,
}: {
  label: string
  hint?: string
  value: number
  effective: number
  /** number でも関数更新でも受ける（±ボタンは関数更新で連打でも取りこぼさない） */
  setValue: (v: number | ((prev: number) => number)) => void
  min: number
  max: number
  step?: number
}) {
  // ±ボタンは関数更新（prev ベース）でクランプする。prop の effective を使うと
  // React のバッチ処理中に古い値のまま複数回加算されて取りこぼす（連打で +10 しか
  // 増えない不具合）ため、必ず prev から計算する
  const stepBy = (delta: number) =>
    setValue((prev) => Math.min(max, Math.max(min, (Number.isFinite(prev) ? prev : effective) + delta)))
  const btnCls =
    "w-8 h-8 shrink-0 flex items-center justify-center rounded-md border border-border bg-white text-foreground hover:border-gold active:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed"
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-white px-3 py-2">
      <span className="text-[13px] text-foreground leading-tight">
        {label}
        {hint && <span className="block text-[10px] text-muted-foreground mt-0.5">{hint}</span>}
      </span>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => stepBy(-step)} disabled={effective <= min} aria-label={`${label}を減らす`} className={btnCls}>
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onBlur={() => setValue(effective)}
          aria-label={label}
          className="w-16 h-8 border border-border rounded-md text-center text-[14px] bg-white focus:outline-none focus:border-gold"
        />
        <button type="button" onClick={() => stepBy(step)} disabled={effective >= max} aria-label={`${label}を増やす`} className={btnCls}>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

/** 両端に矢印のついた寸法線（水平・垂直どちらの向きでも使える汎用パーツ） */
function DoubleArrow({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 3,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
  width?: number
}) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux
  const head = 7
  const halfW = 4
  const tri = (tipX: number, tipY: number, dx2: number, dy2: number) => {
    const baseX = tipX - dx2 * head
    const baseY = tipY - dy2 * head
    return `${tipX},${tipY} ${baseX + px * halfW},${baseY + py * halfW} ${baseX - px * halfW},${baseY - py * halfW}`
  }
  return (
    <g>
      <line x1={x1 + ux * head} y1={y1 + uy * head} x2={x2 - ux * head} y2={y2 - uy * head} stroke={color} strokeWidth={width} />
      <polygon points={tri(x1, y1, -ux, -uy)} fill={color} />
      <polygon points={tri(x2, y2, ux, uy)} fill={color} />
    </g>
  )
}

/**
 * 「段鼻・蹴上・踏面・蹴込」の用語説明イラスト（1段ぶんの断面・シンプルな L 字形）。
 * 踏面＝青・蹴込＝緑・蹴上＝赤の両矢印で色分けし、名前をひと目で対応づけられるように
 * する（2026-07-22 蠣﨑さん指示: 分かりやすい図にしたい。参考画像のスタイルに合わせた）
 */
function StairPartsDiagram() {
  const COLOR_TREAD = "#2563eb" // 踏面＝青
  const COLOR_KICK = "#16a34a" // 蹴込＝緑
  const COLOR_RISER = "#dc2626" // 蹴上＝赤
  // ローカル座標系（図解用の任意スケール）
  const noseX = 34 // 段鼻（踏面の手前端）
  const backX = 210 // 踏面の奥端
  const setbackX = 66 // 蹴込み板の位置（段鼻から蹴込ぶん奥）
  const topY = 34 // 踏面の上面
  const treadThick = 20 // 踏面の板厚（見た目用）
  const midY = topY + treadThick
  const botY = 168 // 蹴込み板の下端

  return (
    <svg viewBox="0 0 300 210" className="w-full h-auto max-w-[300px] mx-auto">
      {/* 段の断面（L字形。段鼻の下にオーバーハングした蹴込みを表現） */}
      <path
        d={`M ${noseX} ${topY} L ${backX} ${topY} L ${backX} ${botY} L ${setbackX} ${botY} L ${setbackX} ${midY} L ${noseX} ${midY} Z`}
        fill="#fff"
        stroke={COLOR_BAR}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* 段鼻（強調ドット＋ラベル） */}
      <circle cx={noseX} cy={topY} r={3.5} fill="#b8860b" />
      <text x={noseX - 6} y={topY - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill="#b8860b">
        段鼻
      </text>
      <line x1={noseX} y1={topY - 6} x2={noseX - 4} y2={topY - 16} stroke="#b8860b" strokeWidth="1" />

      {/* 踏面（青・上面いっぱいの幅） */}
      <DoubleArrow x1={noseX} y1={topY - 16} x2={backX} y2={topY - 16} color={COLOR_TREAD} />
      <text x={(noseX + backX) / 2} y={topY - 22} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLOR_TREAD}>
        踏面
      </text>

      {/* 蹴込（緑・段鼻の真下の小さな引っ込み） */}
      <DoubleArrow x1={noseX} y1={midY + 11} x2={setbackX} y2={midY + 11} color={COLOR_KICK} width={2.5} />
      <text x={noseX - 8} y={midY + 15} textAnchor="end" fontSize="12" fontWeight="700" fill={COLOR_KICK}>
        蹴込
      </text>

      {/* 蹴上（赤・段の全高） */}
      <DoubleArrow x1={backX + 24} y1={topY} x2={backX + 24} y2={botY} color={COLOR_RISER} />
      <text x={backX + 32} y={(topY + botY) / 2} fontSize="14" fontWeight="700" fill={COLOR_RISER} dominantBaseline="middle">
        蹴上
      </text>
    </svg>
  )
}

// ── 階段の形（上から見た図）の選択肢 ──
type StairShape = "straight" | "L" | "U"

const SHAPE_OPTIONS: { id: StairShape; label: string; sub: string }[] = [
  { id: "straight", label: "直階段", sub: "手すり1本" },
  { id: "L", label: "かね折れ（L字）", sub: "曲がり1回・手すり2本" },
  { id: "U", label: "折り返し（コの字）", sub: "曲がり2回・手すり3本" },
]

/** 形状セレクタ用のミニ平面図アイコン（上から見た階段の形） */
function ShapeIcon({ shape }: { shape: StairShape }) {
  const s = COLOR_BAR
  if (shape === "straight") {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 mx-auto" aria-hidden>
        <rect x="17" y="6" width="14" height="36" fill="#fff" stroke={s} strokeWidth="2" />
        {[13, 20, 27, 34].map((y) => (
          <line key={y} x1="17" y1={y} x2="31" y2={y} stroke={s} strokeWidth="1.5" />
        ))}
        <path d="M 38 34 L 38 16 M 34.5 20 L 38 15 L 41.5 20" fill="none" stroke={s} strokeWidth="1.8" />
      </svg>
    )
  }
  if (shape === "L") {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 mx-auto" aria-hidden>
        <rect x="30" y="14" width="12" height="28" fill="#fff" stroke={s} strokeWidth="2" />
        <rect x="6" y="14" width="24" height="12" fill="#fff" stroke={s} strokeWidth="2" />
        {[32, 38].map((y) => (
          <line key={y} x1="30" y1={y} x2="42" y2={y} stroke={s} strokeWidth="1.5" />
        ))}
        {[12, 18, 24].map((x) => (
          <line key={x} x1={x} y1="14" x2={x} y2="26" stroke={s} strokeWidth="1.5" />
        ))}
        <line x1="30" y1="26" x2="42" y2="14" stroke={s} strokeWidth="1.2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10 mx-auto" aria-hidden>
      <rect x="30" y="14" width="12" height="28" fill="#fff" stroke={s} strokeWidth="2" />
      <rect x="6" y="14" width="12" height="28" fill="#fff" stroke={s} strokeWidth="2" />
      <rect x="18" y="14" width="12" height="12" fill="#fff" stroke={s} strokeWidth="2" />
      {[32, 38].map((y) => (
        <g key={y}>
          <line x1="30" y1={y} x2="42" y2={y} stroke={s} strokeWidth="1.5" />
          <line x1="6" y1={y} x2="18" y2={y} stroke={s} strokeWidth="1.5" />
        </g>
      ))}
      <line x1="24" y1="14" x2="24" y2="26" stroke={s} strokeWidth="1.5" />
      <line x1="30" y1="26" x2="42" y2="14" stroke={s} strokeWidth="1.2" />
      <line x1="18" y1="26" x2="6" y2="14" stroke={s} strokeWidth="1.2" />
    </svg>
  )
}

interface RailPriceSimulatorProps {
  config: RailSimulatorConfig
  /** 見積もり依頼リンクに付ける type= の値（商品 slug） */
  queryType: string
  onQueryChange?: (qs: string) => void
  /** 全画面ページ（/products/{slug}/simulator）自身では「全画面で開く」リンクを隠す */
  hideFullscreenLink?: boolean
}

export function RailPriceSimulator({ config, queryType, onQueryChange, hideFullscreenLink }: RailPriceSimulatorProps) {
  // 階段の形（上から見た図）。直階段＝従来の側面図モード、L字・コの字＝平面図モード
  const [shape, setShape] = useState<StairShape>("straight")
  // 回り階段モードの各壁の幅（意味は形状ごとに違う。DimStepper の hint 参照）
  const [w1Mm, setW1Mm] = useState(WALL_DEFAULT)
  const [w2Mm, setW2Mm] = useState(WALL_MID_DEFAULT)
  const [w3Mm, setW3Mm] = useState(WALL_DEFAULT)
  const [steps, setSteps] = useState(config.steps.default)
  const [wMm, setWMm] = useState(stdWidth(config.steps.default))
  const [hMm, setHMm] = useState(stdHeight(config.steps.default))
  // 幅・高さをお客様が手入力したら、以降は段数を変えても上書きしない
  const [wTouched, setWTouched] = useState(false)
  const [hTouched, setHTouched] = useState(false)
  // 蹴上・踏面・蹴込（正確な階段寸法出し用・2026-07-22 蠣﨑さん指示）。
  // 触ると幅・高さより優先され、段数を変えるたびにこの値から幅・高さを再計算する
  const [riserMm, setRiserMm] = useState(STD_RISER)
  const [treadMm, setTreadMm] = useState(STD_TREAD)
  const [kickMm, setKickMm] = useState(STD_KICK)
  const [perStepTouched, setPerStepTouched] = useState(false)
  // 両端の水平部（段鼻から手すり端まで）。下段・上段で個別指定
  const [runBMm, setRunBMm] = useState(END_RUN)
  const [runTMm, setRunTMm] = useState(END_RUN)
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
  const riserEff = clamp(riserMm, RISER_MIN, RISER_MAX)
  const treadEff = clamp(treadMm, TREAD_MIN, TREAD_MAX)
  const kickEff = clamp(kickMm, KICK_MIN, KICK_MAX)
  // 蹴上・踏面・蹴込を入力した場合はそちらを優先し、幅・高さはそこから逆算する
  // （2026-07-22 蠣﨑さん指示: 正確な階段の寸法出しのため）
  const W = perStepTouched
    ? clamp((N - 1) * (treadEff - kickEff), W_MIN, W_MAX)
    : clamp(wMm, W_MIN, W_MAX)
  const H = perStepTouched ? clamp(N * riserEff, H_MIN, H_MAX) : clamp(hMm, H_MIN, H_MAX)
  const RB = clamp(runBMm, RUN_MIN_BOTTOM, RUN_MAX) // 下側（登り始め）の水平部
  const RT = clamp(runTMm, RUN_MIN_TOP, RUN_MAX) // 上側（登り終わり）の水平部
  const riser = H / N // 蹴上（床から最上段の高さ ÷ 段数）
  const going = W / (N - 1) // 1段あたりの水平進み

  // 手すりの長さ: 1段目と最上段の段鼻の直線距離 ＋ 両端の水平部
  const noseDiag = Math.round(Math.hypot(W, H - riser))
  const L = Math.round((noseDiag + RB + RT) / 10) * 10

  // 1段目〜最上段の段鼻の距離を直接入力（2026-07-22 蠣﨑さん指示: 現場で斜めに
  // 一発で測れる寸法）。幅・高さと同じ比率を保ったまま、入力値に合わせて両方を
  // 比例縮尺する（角度＝階段の勾配は変えない）。蹴上・踏面・蹴込モードよりも
  // 優先し、直接測った実測値を最終的な正とする
  const setNoseDiagDirect = (v: number) => {
    if (!(v > 0) || !(noseDiag > 0)) return
    const scale = v / noseDiag
    setWMm(Math.round(W * scale))
    setHMm(Math.round(riser + (H - riser) * scale))
    setWTouched(true)
    setHTouched(true)
    setPerStepTouched(false)
  }

  const zakinType = config.zakinTypes.find((z) => z.id === zakinId) ?? config.zakinTypes[0]
  const zakinCount = calcZakin(L)

  const railPrice = Math.round((L / 1000) * config.unitPricePerM)
  const endTotal = config.endPrice * config.endCount
  const zakinTotal = zakinCount * zakinType.price
  const total = railPrice + endTotal + zakinTotal

  // ── 回り階段モード（L字・コの字）の概算 ──
  // 手すりはフライトごとの直線ピース別体（曲げ加工しない）。各本の長さ＝
  // 壁沿いの水平距離（曲がり角は壁から80mm逃がし）を階段勾配で斜めに換算し、
  // 1段目側・最終段側だけエンド部（段鼻から先端300mm・水平）を足す。
  // 勾配＝蹴上 ÷（踏面−蹴込）。廻り段部分も同じ勾配とみなす概算
  const w1 = clamp(w1Mm, WALL_MIN, WALL_MAX)
  const w2 = clamp(w2Mm, shape === "U" ? WALL_MID_MIN : WALL_MIN, WALL_MAX)
  const w3 = clamp(w3Mm, WALL_MIN, WALL_MAX)
  const winding = useMemo(() => {
    if (shape === "straight") return null
    const going = Math.max(treadEff - kickEff, 1)
    const slopeFactor = Math.hypot(going, riserEff) / going
    const defs =
      shape === "L"
        ? [
            { pos: "1段目側", runMm: w1 - CORNER_WALL_GAP, flatMm: WINDING_END_RUN, end: "bottom" as const },
            { pos: "最終段側", runMm: w2 - CORNER_WALL_GAP, flatMm: WINDING_END_RUN, end: "top" as const },
          ]
        : [
            { pos: "1段目側", runMm: w1 - CORNER_WALL_GAP, flatMm: WINDING_END_RUN, end: "bottom" as const },
            { pos: "中間", runMm: w2 - CORNER_WALL_GAP * 2, flatMm: 0, end: null },
            { pos: "最終段側", runMm: w3 - CORNER_WALL_GAP, flatMm: WINDING_END_RUN, end: "top" as const },
          ]
    const rails = defs.map((d, i) => {
      const len = Math.round((Math.max(d.runMm, 0) * slopeFactor + d.flatMm) / 10) * 10
      const zakin = calcZakin(len)
      const body = Math.round((len / 1000) * config.unitPricePerM)
      const endFee = d.end ? config.endPrice : 0
      return {
        no: ["①", "②", "③"][i],
        pos: d.pos,
        end: d.end,
        len,
        zakin,
        price: body + zakin * zakinType.price + endFee,
      }
    })
    return {
      slopeFactor,
      rails,
      totalLen: rails.reduce((s, r) => s + r.len, 0),
      totalZakin: rails.reduce((s, r) => s + r.zakin, 0),
      totalPrice: rails.reduce((s, r) => s + r.price, 0),
    }
  }, [shape, w1, w2, w3, riserEff, treadEff, kickEff, config.unitPricePerM, config.endPrice, zakinType.price])

  useEffect(() => {
    if (winding) {
      const railsQ = winding.rails.map((r, i) => `&len${i + 1}=${r.len}&zc${i + 1}=${r.zakin}`).join("")
      onQueryChange?.(
        `&type=${queryType}&shape=${shape}&riser=${riserEff}&tread=${treadEff}&kick=${kickEff}&w1=${w1}&w2=${w2}${shape === "U" ? `&w3=${w3}` : ""}${railsQ}&len=${winding.totalLen}&endb=${encodeURIComponent(endBottom)}&endt=${encodeURIComponent(endTop)}&zakin=${zakinType.id}&zcount=${winding.totalZakin}&total=${winding.totalPrice}`,
      )
      return
    }
    onQueryChange?.(
      `&type=${queryType}&steps=${N}&w=${W}&h=${H}&riser=${riserEff}&tread=${treadEff}&kick=${kickEff}&diag=${noseDiag}&erb=${RB}&ert=${RT}&len=${L}&endb=${encodeURIComponent(endBottom)}&endt=${encodeURIComponent(endTop)}&zakin=${zakinType.id}&zcount=${zakinCount}&total=${total}`,
    )
  }, [winding, shape, w1, w2, w3, N, W, H, riserEff, treadEff, kickEff, noseDiag, RB, RT, L, endBottom, endTop, zakinType.id, zakinCount, total, queryType, onQueryChange])

  // ── ミニ図解（側面図・階段に実配置。入力に連動） ──
  const svg = useMemo(() => {
    // mm 座標系（y は上向き・床 = 0）。手すりは段鼻ラインの RAIL_H 上を通り、
    // 両端は水平に近く曲がる（登り始め = 床上、登り終わり = 上階床上）。
    const x1 = 0 // 1段目の段鼻 x
    const x2 = W // 最上段の段鼻 x
    const yb = riser + RAIL_H // 下側水平部の高さ
    const yt = H + RAIL_H // 上側水平部の高さ
    const x0 = x1 - RB
    const x3 = x2 + RT
    const margin = 130 // 唐草・床の張り出しぶん

    // 余白（数値ラベルは小さいので入力マスぶんの大きな余白は不要）。
    // 右 = 高さ寸法線＋数値、下 = 幅寸法線＋全長の入れ子寸法線＋数値、上 = 上側エンド寸法
    const padL = 16
    const padR = 52
    const padTop = 34
    const padBottom = 78
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

    // 手すり: 水平部 → 斜め区間（言語化仕様の揺らぎ） → 水平部 を細かい
    // 折れ線でサンプリングし、全体を移動平均でならして角に自然なフィレット
    // （きつめだが折れない曲がり）を作る。Q ベジェ + 正弦の合成では実物の
    // 非対称な流れを再現できなかったため、実測プロファイルベースに刷新
    // （2026-07-16。経緯は WAVE_PROFILE_PCT のコメント参照）
    const diagLen = Math.hypot(W, H - riser)
    const unx = -(H - riser) / diagLen // 斜め区間の上向き法線
    const uny = W / diagLen
    const devAt = (s: number) => {
      // s: 斜め区間の進行率 0..1 → 弦からの偏差 mm（上向き正・線形補間）
      const f = Math.min(Math.max(s, 0), 1) * (WAVE_PROFILE_PCT.length - 1)
      const i = Math.floor(f)
      const j = Math.min(i + 1, WAVE_PROFILE_PCT.length - 1)
      const pct = WAVE_PROFILE_PCT[i] + (WAVE_PROFILE_PCT[j] - WAVE_PROFILE_PCT[i]) * (f - i)
      return (pct / 100) * diagLen * WAVE_SCALE
    }
    // レール直線部が実際に終わる取付ネック位置。x0・x3 は「エンドの先端＝ループの端」で、
    // 唐草の水平張り出し（reach）ぶん内側にネックが入る（2026-07-22 蠣﨑さん指示）。
    // reach は実寸比率で描いた唐草の一定張り出し量（END_CURL_REACH_MM）。
    const reachBottom = (END_CURL_REACH_MM[endBottom] ?? END_CURL_REACH_MM_FALLBACK) * END_ART_SIZE_FACTOR
    const reachTop = (END_CURL_REACH_MM[endTop] ?? END_CURL_REACH_MM_FALLBACK) * END_ART_SIZE_FACTOR
    const neckXb = x0 + reachBottom // 下側ネックの水平位置（先端から段鼻側へ）
    const neckXt = x3 - reachTop // 上側ネック
    const railEndX = Math.max(neckXt, x2)

    const raw: Array<{ x: number; y: number }> = []
    // 下側の水平部＝ネック(neckXb)から段鼻(x1)まで、常に高さ yb（水平）でつなぐ。
    // RB が大きいとき neckXb は段鼻より外側（左）、RB が小さい（0〜約290）とき neckXb は
    // 段鼻より内側（右）に来てエンドが階段側へ引っ込むが、どちらもネックは水平のまま
    // （2026-07-22 蠣﨑さん指示: エンドの角度は変えず、手すりとは必ず緩やかに水平でつなぐ）。
    // ここを yb 一定にすることで、斜面から段鼻へ下りきってから水平部へ入り、エンドへ
    // 緩やかに繋がる（斜面角ぶん唐草を上向きに回していた旧実装をやめる）
    if (neckXb <= x1) {
      for (let x = neckXb; x < x1; x += SAMPLE_MM) raw.push({ x, y: yb })
    } else {
      for (let x = neckXb; x > x1; x -= SAMPLE_MM) raw.push({ x, y: yb })
    }
    const diagSteps = Math.ceil(diagLen / SAMPLE_MM)
    for (let i = 0; i <= diagSteps; i++) {
      const s = i / diagSteps
      const off = devAt(s)
      raw.push({ x: x1 + W * s + unx * off, y: yb + (H - riser) * s + uny * off })
    }
    for (let d = SAMPLE_MM; d <= railEndX - x2; d += SAMPLE_MM) raw.push({ x: x2 + d, y: yt })
    if (raw[raw.length - 1].x < railEndX) raw.push({ x: railEndX, y: yt })
    const win = Math.round(FILLET_MM / SAMPLE_MM)
    // 両端の外側に水平の仮想点を足してから移動平均する。端で窓を縮める方式だと
    // 「コーナーに引かれて下がる→接続点で戻る」浅い凹みがエンド手前に出るため
    // （2026-07-16 蠣﨑さん指摘: 最後の山からエンドの間が凹む）。下側はネック(neckXb)から
    // 外側へ水平に延長（エンドの接線＝水平を保つ）
    const padded = [
      ...Array.from({ length: win }, (_, k) => ({ x: neckXb - (win - k) * SAMPLE_MM, y: yb })),
      ...raw,
      ...Array.from({ length: win }, (_, k) => ({ x: railEndX + (k + 1) * SAMPLE_MM, y: yt })),
    ]
    const pts = raw.map((_, i) => {
      let sx = 0
      let sy = 0
      for (let k = i; k <= i + 2 * win; k++) {
        sx += padded[k].x
        sy += padded[k].y
      }
      return { x: sx / (2 * win + 1), y: sy / (2 * win + 1) }
    })
    const rail = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${X(p.x)} ${Y(p.y)}`).join(" ")

    // エンド（唐草）の取り付け位置＝ネックの座標。角度は上下とも常に水平（0）で、
    // 斜面角では回さない（2026-07-22 蠣﨑さん指示: エンドの角度は変えない）。上側は
    // RUN_MIN_TOP により reachTop を必ず満たすため neckXt ≥ x2（水平）。下側もネックを
    // 高さ yb 一定で描くため水平
    const endBottomAt = { x: X(neckXb), y: Y(yb), angleDeg: 0 }
    const endTopAt = { x: X(neckXt), y: Y(yt), angleDeg: 0 }

    // 座金: 手すりに沿った距離 → 折れ線（水平/斜め/水平）上の位置と法線方向
    const segs = [
      { len: RB, from: { x: x0, y: yb }, dir: { x: 1, y: 0 } },
      { len: diagLen, from: { x: x1, y: yb }, dir: { x: W / diagLen, y: (H - riser) / diagLen } },
      { len: RT, from: { x: x2, y: yt }, dir: { x: 1, y: 0 } },
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
    // 座金は「先端」基準の arc 距離（0〜L）で自動配置されるが、両端の reach 分は
    // 唐草装飾の領域でレールが無いため、端の座金がループの上に乗らないようネック位置
    // までクランプする（本数＝価格は不変・位置は目安）
    // 斜め区間の座金はレールの揺らぎに追従させる（arc 距離 → プロファイル s へ変換）
    const zakin = getZakinPositions(L, zakinCount).map((rawPos) => {
      const pos = Math.min(Math.max(rawPos, reachBottom), totalLen - reachTop)
      const p = pointAt(pos)
      const dOnDiag = pos - RB // 斜めセグメント内の距離（負なら水平部）
      if (dOnDiag > 0 && dOnDiag < diagLen) {
        const off = devAt(dOnDiag / diagLen)
        p.x += unx * off
        p.y += uny * off
      }
      // 座金＝実寸に合わせた小さな丸座金を支柱の端（壁側）に描く（2026-07-22 蠣﨑さん指示）
      const postMm = POST_MM
      return {
        x1: X(p.x),
        y1: Y(p.y),
        x2: X(p.x + p.nx * postMm),
        y2: Y(p.y + p.ny * postMm),
        cx: X(p.x + p.nx * postMm),
        cy: Y(p.y + p.ny * postMm),
        r: Math.max(1.4, WASHER_R_MM * scale),
      }
    })

    // ── 寸法線（幅・高さ・エンド部）と数値ラベルの位置 ──
    // 入力は図の下のコントロールで行い、図の中には数値ラベル（読み取り専用）だけ出す
    // （2026-07-22 蠣﨑さん指示: スマホで入力欄が手すり・階段に重なるため）
    // 幅: 1段目の段鼻 x=0 〜 最上段の段鼻 x=W。床下の寸法線に補助線でつなぐ
    const dimWy = Y(0) + 20
    const dimW = {
      line: { x1: X(0), x2: X(W), y: dimWy },
      ext1: { x: X(0), y1: Y(riser), y2: dimWy + 5 },
      ext2: { x: X(W), y1: Y(H), y2: dimWy + 5 },
      labelX: (X(0) + X(W)) / 2,
      labelY: dimWy - 5,
    }
    // 高さ: 床 0 〜 最上段 H。階段右側の寸法線に補助線でつなぐ
    const dimHx = X(x3 + margin) + 16
    const dimH = {
      line: { y1: Y(0), y2: Y(H), x: dimHx },
      ext1: { y: Y(0), x1: X(x3 + margin), x2: dimHx + 5 },
      ext2: { y: Y(H), x1: X(x2), x2: dimHx + 5 },
      labelX: dimHx + 5,
      labelY: (Y(0) + Y(H)) / 2,
    }
    // 下側のエンド部（RB）: 段鼻 x0〜x1。手すりのすぐ下に寸法線を添える
    const dimRBy = Y(yb) + 14
    const dimRB = {
      line: { x1: X(x0), x2: X(x1), y: dimRBy },
      ext1: { x: X(x0), y1: Y(yb), y2: dimRBy + 4 },
      ext2: { x: X(x1), y1: Y(yb), y2: dimRBy + 4 },
      labelX: (X(x0) + X(x1)) / 2,
      labelY: dimRBy + 13,
    }
    // 上側のエンド部（RT）: 段鼻 x2〜x3。手すりのすぐ上に寸法線を添える
    const dimRTy = Y(yt) - 14
    const dimRT = {
      line: { x1: X(x2), x2: X(x3), y: dimRTy },
      ext1: { x: X(x2), y1: Y(yt), y2: dimRTy - 4 },
      ext2: { x: X(x3), y1: Y(yt), y2: dimRTy - 4 },
      labelX: (X(x2) + X(x3)) / 2,
      labelY: dimRTy - 6,
    }

    // 手すり全長（入れ子の外側寸法）: 幅の寸法線のさらに下に、下側エンドの先端〜
    // 上側エンドの先端の全体を囲む形で表示する。線の見た目の長さは水平投影（斜め区間
    // は実際はもっと長い）だが、ラベルには実際の全長 L を表示する（2026-07-22
    // 蠣﨑さん指示: 階段全長の並びに寸法線を出してほしいとの指摘）
    const dimTotalY = dimWy + 54
    const dimTotal = {
      line: { x1: X(x0), x2: X(x3), y: dimTotalY },
      ext1: { x: X(x0), y1: Y(0), y2: dimTotalY + 5 },
      ext2: { x: X(x3), y1: Y(0), y2: dimTotalY + 5 },
      labelX: (X(x0) + X(x3)) / 2,
      labelY: dimTotalY + 15,
    }

    return { stair, rail, endBottomAt, endTopAt, zakin, dimW, dimH, dimRB, dimRT, dimTotal, scale }
  }, [N, W, H, RB, RT, riser, going, L, zakinCount, endBottom, endTop])

  // ── 平面図（上から見た図・回り階段モード）──
  // 右壁（1段目側）の内面を x=0（左へ負）・曲がる側の壁の内面を y=0（手前へ正）
  // とした mm 座標系で描き、viewBox にフィットさせる。廻り段は 90 度を 3 段で
  // 廻る扇形の段割りで表現（描画のみ・長さ計算には影響しない）
  const plan = useMemo(() => {
    if (!winding || shape === "straight") return null
    const going = Math.max(treadEff - kickEff, 1)
    const isU = shape === "U"
    // 階段の有効幅（描画用）。コの字は壁②の内寸に「廻り段2箇所＋その間の直線部」が
    // 収まるよう、間に最低 300mm 残る幅に自動調整する（2列がぴったり収まる幅にすると
    // 廻り段の扇形が同じ位置に重なって図が破綻するため）
    const bandW = isU
      ? Math.max(400, Math.min(950, (w2 - 300) / 2, Math.min(w1, w3) * 0.45))
      : Math.max(500, Math.min(950, Math.min(w1, w2) * 0.45))
    const XL = -w2 // コの字: 左壁の内面
    const dimSide = PLAN_WALL_T + 170 // 壁の外側の寸法線・ラベル用スペース
    const xMin = isU ? XL - dimSide : -w2 - WINDING_END_RUN - 260
    const xMax = dimSide
    const yMin = -PLAN_WALL_T - 150
    const yMax = (isU ? Math.max(w1, w3) : w1) + WINDING_END_RUN + 130
    const s = Math.min((VB_W - 8) / (xMax - xMin), (VB_PLAN_H - 8) / (yMax - yMin))
    const ox = (VB_W - (xMax - xMin) * s) / 2 - xMin * s
    const oy = (VB_PLAN_H - (yMax - yMin) * s) / 2 - yMin * s
    const X = (mm: number) => ox + mm * s
    const Y = (mm: number) => oy + mm * s

    type PlanRect = { x: number; y: number; w: number; h: number; fill: string; stroke?: string }
    type PlanLine = { x1: number; y1: number; x2: number; y2: number; dash?: boolean }
    type PlanLabel = {
      x: number
      y: number
      text: string
      size?: number
      weight?: number
      anchor?: "start" | "middle" | "end"
      rotate?: number
      muted?: boolean
    }
    const rects: PlanRect[] = [] // 壁・2階の床
    const stairRects: PlanRect[] = [] // 階段の白抜き
    const stepLines: PlanLine[] = [] // 段板・廻り段の線
    const dims: PlanLine[] = [] // 寸法線・補助線
    const labels: PlanLabel[] = []
    const rectMm = (arr: PlanRect[], x1: number, y1: number, x2: number, y2: number, fill: string) =>
      arr.push({
        x: X(Math.min(x1, x2)),
        y: Y(Math.min(y1, y2)),
        w: Math.abs(x2 - x1) * s,
        h: Math.abs(y2 - y1) * s,
        fill,
      })
    const lineMm = (arr: PlanLine[], x1: number, y1: number, x2: number, y2: number, dash?: boolean) =>
      arr.push({ x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2), dash })
    // 寸法線（両端に短い直交ティック付き）
    const dimWithTicks = (x1: number, y1: number, x2: number, y2: number) => {
      const X1 = X(x1)
      const Y1 = Y(y1)
      const X2 = X(x2)
      const Y2 = Y(y2)
      const dx = X2 - X1
      const dy = Y2 - Y1
      const len = Math.hypot(dx, dy) || 1
      const nx = -dy / len
      const ny = dx / len
      dims.push({ x1: X1, y1: Y1, x2: X2, y2: Y2 })
      dims.push({ x1: X1 + nx * 4, y1: Y1 + ny * 4, x2: X1 - nx * 4, y2: Y1 - ny * 4 })
      dims.push({ x1: X2 + nx * 4, y1: Y2 + ny * 4, x2: X2 - nx * 4, y2: Y2 - ny * 4 })
    }

    const wallBottomR = w1 + WINDING_END_RUN + 60 // 右壁の下端
    if (isU) {
      // 壁: 右（壁①側）・正面（曲がり部）・左（壁③側）
      rectMm(rects, 0, -PLAN_WALL_T, PLAN_WALL_T, wallBottomR, "#e5e7eb")
      rectMm(rects, XL - PLAN_WALL_T, -PLAN_WALL_T, PLAN_WALL_T, 0, "#e5e7eb")
      rectMm(rects, XL - PLAN_WALL_T, 0, XL, w3 + WINDING_END_RUN + 60, "#e5e7eb")
      // 階段の白抜き: フライト1（廻り段込み）・フライト2・フライト3
      rectMm(stairRects, -bandW, 0, 0, w1, COLOR_STAIR_FILL)
      rectMm(stairRects, XL + bandW, 0, -bandW, bandW, COLOR_STAIR_FILL)
      rectMm(stairRects, XL, 0, XL + bandW, w3, COLOR_STAIR_FILL)
      // 2階の床（最終段の先）
      rectMm(rects, XL, w3, XL + bandW, w3 + WINDING_END_RUN + 140, COLOR_WALL)
      labels.push({ x: X(XL + bandW / 2), y: Y(w3 + (WINDING_END_RUN + 140) / 2) + 4, text: "2階", size: 12, muted: true, anchor: "middle" })
    } else {
      rectMm(rects, 0, -PLAN_WALL_T, PLAN_WALL_T, wallBottomR, "#e5e7eb")
      rectMm(rects, -w2 - WINDING_END_RUN - 200, -PLAN_WALL_T, PLAN_WALL_T, 0, "#e5e7eb")
      rectMm(stairRects, -bandW, 0, 0, w1, COLOR_STAIR_FILL)
      rectMm(stairRects, -w2, 0, -bandW, bandW, COLOR_STAIR_FILL)
      rectMm(rects, -w2 - WINDING_END_RUN - 200, 0, -w2, bandW, COLOR_WALL)
      labels.push({ x: X(-w2 - (WINDING_END_RUN + 200) / 2), y: Y(bandW / 2) + 4, text: "2階", size: 12, muted: true, anchor: "middle" })
    }
    labels.push({ x: X(-bandW / 2), y: Y(w1 + 230), text: "1階", size: 12, muted: true, anchor: "middle" })

    // 段板の線（踏面−蹴込 間隔）。フライト1 は 1段目の段鼻 y=w1 から廻り段まで
    for (let yy = w1; yy > bandW + 1; yy -= going) lineMm(stepLines, -bandW, yy, 0, yy)
    if (isU) {
      for (let xx = XL + bandW + going; xx < -bandW - 1; xx += going) lineMm(stepLines, xx, 0, xx, bandW)
      for (let yy = w3; yy > bandW + 1; yy -= going) lineMm(stepLines, XL, yy, XL + bandW, yy)
    } else {
      for (let xx = -w2; xx < -bandW - 1; xx += going) lineMm(stepLines, xx, 0, xx, bandW)
    }
    // 廻り段（扇形の段割り。sx=+1 右コーナー・-1 左コーナー）
    const fan = (px: number, py: number, sx: number) => {
      lineMm(stepLines, px, py, px + sx * bandW, py)
      lineMm(stepLines, px, py, px, py - bandW)
      lineMm(stepLines, px, py, px + sx * bandW, py - bandW * 0.577)
      lineMm(stepLines, px, py, px + sx * bandW * 0.577, py - bandW)
    }
    fan(-bandW, bandW, 1)
    if (isU) fan(XL + bandW, bandW, -1)

    // 手すり（本ごとの直線ピース）。a=登り始め側の端・b=登り終わり側の端。
    // tip の側に唐草エンド（1段目側=① の a・最終段側=最後の本の b）
    const railDefs = isU
      ? [
          { a: { x: -RAIL_WALL_OFFSET_MM, y: w1 + WINDING_END_RUN }, b: { x: -RAIL_WALL_OFFSET_MM, y: CORNER_WALL_GAP }, tip: "a" as const, wallDir: { x: 1, y: 0 } },
          { a: { x: -CORNER_WALL_GAP, y: RAIL_WALL_OFFSET_MM }, b: { x: XL + CORNER_WALL_GAP, y: RAIL_WALL_OFFSET_MM }, tip: null, wallDir: { x: 0, y: -1 } },
          { a: { x: XL + RAIL_WALL_OFFSET_MM, y: CORNER_WALL_GAP }, b: { x: XL + RAIL_WALL_OFFSET_MM, y: w3 + WINDING_END_RUN }, tip: "b" as const, wallDir: { x: -1, y: 0 } },
        ]
      : [
          { a: { x: -RAIL_WALL_OFFSET_MM, y: w1 + WINDING_END_RUN }, b: { x: -RAIL_WALL_OFFSET_MM, y: CORNER_WALL_GAP }, tip: "a" as const, wallDir: { x: 1, y: 0 } },
          { a: { x: -CORNER_WALL_GAP, y: RAIL_WALL_OFFSET_MM }, b: { x: -w2 - WINDING_END_RUN, y: RAIL_WALL_OFFSET_MM }, tip: "b" as const, wallDir: { x: 0, y: -1 } },
        ]
    const railLines: PlanLine[] = []
    const zakinTicks: PlanLine[] = []
    const tips: { x: number; y: number }[] = []
    railDefs.forEach((d, i) => {
      railLines.push({ x1: X(d.a.x), y1: Y(d.a.y), x2: X(d.b.x), y2: Y(d.b.y) })
      const tipPt = d.tip === "a" ? d.a : d.tip === "b" ? d.b : null
      if (tipPt) tips.push({ x: X(tipPt.x), y: Y(tipPt.y) })
      // 座金の位置（実長 0〜len を平面上の線分に比例配置・目安）
      const r = winding.rails[i]
      const dx = d.b.x - d.a.x
      const dy = d.b.y - d.a.y
      getZakinPositions(r.len, r.zakin).forEach((pos) => {
        const f = Math.min(Math.max(pos / r.len, 0.02), 0.98)
        const px = d.a.x + dx * f
        const py = d.a.y + dy * f
        zakinTicks.push({ x1: X(px), y1: Y(py), x2: X(px + d.wallDir.x * RAIL_WALL_OFFSET_MM), y2: Y(py + d.wallDir.y * RAIL_WALL_OFFSET_MM) })
      })
      // 手すり番号ラベル（①②③）
      const midX = (d.a.x + d.b.x) / 2
      const midY = (d.a.y + d.b.y) / 2
      if (dx === 0) {
        // 縦向きの手すり: 右壁側（x>-bandW）は左に・左壁側は右に番号を出す
        const onRightWall = d.a.x > -bandW
        labels.push({
          x: X(midX) + (onRightWall ? -14 : 14),
          y: Y(midY) + 4,
          text: ["①", "②", "③"][i],
          size: 15,
          weight: 700,
          anchor: onRightWall ? "end" : "start",
        })
      } else {
        labels.push({ x: X(midX), y: Y(midY) + 22, text: ["①", "②", "③"][i], size: 15, weight: 700, anchor: "middle" })
      }
    })
    // 唐草エンドの先端ラベル
    labels.push({ x: X(-RAIL_WALL_OFFSET_MM) - 12, y: Y(w1 + WINDING_END_RUN) + 4, text: "唐草エンド", size: 11, anchor: "end" })
    if (isU) {
      labels.push({ x: X(XL + RAIL_WALL_OFFSET_MM) + 12, y: Y(w3 + WINDING_END_RUN) + 4, text: "唐草エンド", size: 11, anchor: "start" })
    } else {
      // L字の上側エンドは壁沿いに水平なので、ラベルは手すりの下（2階の床側）に出す
      // （壁の帯の上に重ねると読みにくいため）
      labels.push({ x: X(-w2 - WINDING_END_RUN), y: Y(RAIL_WALL_OFFSET_MM) + 20, text: "唐草エンド", size: 11, anchor: "middle" })
    }

    // 上り方向の矢印（フライト1 の中央）
    const arrowTailY = w1 - 80
    const arrowHeadY = Math.max(bandW + 180, w1 - 700)
    const arrow = {
      x1: X(-bandW / 2),
      y1: Y(arrowTailY),
      x2: X(-bandW / 2),
      y2: Y(arrowHeadY),
    }
    labels.push({ x: X(-bandW / 2) + 8, y: Y((arrowTailY + arrowHeadY) / 2) + 4, text: "上り", size: 11, anchor: "start", muted: true })

    // 寸法線: 壁①（右壁沿い・正面の壁の面 〜 1段目の段鼻）
    const dimX1 = PLAN_WALL_T + 90
    dimWithTicks(dimX1, 0, dimX1, w1)
    lineMm(dims, 0, 0, dimX1 + 15, 0, true)
    lineMm(dims, 0, w1, dimX1 + 15, w1, true)
    labels.push({ x: X(dimX1) + 12, y: Y(w1 / 2), text: `壁① ${w1.toLocaleString()}`, size: 11, weight: 600, anchor: "middle", rotate: 90 })
    // 寸法線: 壁②（正面の壁の外側）
    const dimY2 = -PLAN_WALL_T - 70
    if (isU) {
      dimWithTicks(0, dimY2, XL, dimY2)
      lineMm(dims, 0, -PLAN_WALL_T, 0, dimY2 - 15, true)
      lineMm(dims, XL, -PLAN_WALL_T, XL, dimY2 - 15, true)
      labels.push({ x: X(XL / 2), y: Y(dimY2) - 6, text: `壁② ${w2.toLocaleString()}`, size: 11, weight: 600, anchor: "middle" })
    } else {
      dimWithTicks(0, dimY2, -w2, dimY2)
      lineMm(dims, 0, -PLAN_WALL_T, 0, dimY2 - 15, true)
      lineMm(dims, -w2, 0, -w2, dimY2 - 15, true)
      labels.push({ x: X(-w2 / 2), y: Y(dimY2) - 6, text: `壁② ${w2.toLocaleString()}`, size: 11, weight: 600, anchor: "middle" })
    }
    // 寸法線: 壁③（コの字のみ・左壁沿い）
    if (isU) {
      const dimX3 = XL - PLAN_WALL_T - 90
      dimWithTicks(dimX3, 0, dimX3, w3)
      lineMm(dims, XL, 0, dimX3 - 15, 0, true)
      lineMm(dims, XL, w3, dimX3 - 15, w3, true)
      labels.push({ x: X(dimX3) - 12, y: Y(w3 / 2), text: `壁③ ${w3.toLocaleString()}`, size: 11, weight: 600, anchor: "middle", rotate: -90 })
    }

    return { rects, stairRects, stepLines, dims, labels, railLines, zakinTicks, tips, arrow }
  }, [winding, shape, w1, w2, w3, treadEff, kickEff])

  return (
    <div className="mb-8 border-2 border-gold/20 bg-card rounded-md p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-[11px] tracking-[0.2em] text-gold font-semibold uppercase">
          Price simulator
        </p>
        {/* スマホでは入力マスが小さく操作しづらいため、全画面ページへの導線を用意
            （2026-07-22 蠣﨑さん指示）。全画面ページ自身では非表示。
            周囲のゴールド系文字に埋もれて気づきにくいとの指摘を受け、あえて
            ダーク塗りつぶし＋大きめの文字で目立たせる（2026-07-22 蠣﨑さん指示） */}
        {!hideFullscreenLink && (
          <Link
            href={`/products/${queryType}/simulator`}
            className="shrink-0 inline-flex items-center gap-1.5 text-[13px] md:text-[14px] font-semibold text-white bg-dark rounded-full px-4 py-1.5 shadow-sm hover:bg-dark/85 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            全画面で開く
          </Link>
        )}
      </div>
      <p className="font-serif text-[15px] font-medium text-foreground mb-1">
        参考価格シミュレーター
      </p>
      <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
        階段の形（上から見た形）を選んで寸法を入れると、取り付けイメージと参考価格がすぐに確認できます。
        回り階段（かね折れ・折り返し）では手すりが本ごとに分かれて作られるため、1本ずつの概算長さと金額が出ます。
        手すりは緩やかな曲線で、登り始めと登り終わりは水平に近く曲がる形状です。
      </p>

      {/* 開発中バナー: 手すりの曲線描画はまだ調整中のため、図のイメージ精度について
          お客様に誤解を与えないよう明示する（2026-07-15 蠣﨑さん指示・仕切り直し前提） */}
      <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3">
        <p className="text-[12px] md:text-[13px] text-amber-800 leading-relaxed">
          <span className="font-semibold">※ このシミュレーターは現在開発中です。</span>
          曲線の描画は調整中のため、図の形状は実際の仕上がりと異なる場合があります。
          長さ・座金数・参考価格の数値は目安としてご利用いただけます。
        </p>
      </div>

      {/* 階段の形（上から見た形）の選択（2026-07-25 蠣﨑さん指示: 回り階段対応） */}
      <p className="text-[13px] text-muted-foreground mb-2">階段の形（上から見た形を選択）</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {SHAPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setShape(opt.id)}
            aria-pressed={shape === opt.id}
            className={`rounded-md border-2 bg-white px-2 py-3 transition-colors ${
              shape === opt.id ? "border-gold" : "border-border hover:border-gold/50"
            }`}
          >
            <ShapeIcon shape={opt.id} />
            <span className="block text-[12px] md:text-[13px] font-medium text-foreground mt-1.5 leading-tight">
              {opt.label}
            </span>
            <span className="block text-[10px] md:text-[11px] text-muted-foreground mt-0.5">{opt.sub}</span>
          </button>
        ))}
      </div>

      {!winding && (
      <>
      {/* ミニ図解（側面図・入力に連動）。数値は図内にラベル表示、編集は図の下のコントロール */}
      <div className="mb-2">
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
          {/* 寸法線: 下側の水平部（登り始め・段鼻からエンドまで） */}
          <g stroke={COLOR_DIM} strokeWidth="1">
            <line x1={svg.dimRB.ext1.x} y1={svg.dimRB.ext1.y1} x2={svg.dimRB.ext1.x} y2={svg.dimRB.ext1.y2} strokeDasharray="3 3" />
            <line x1={svg.dimRB.ext2.x} y1={svg.dimRB.ext2.y1} x2={svg.dimRB.ext2.x} y2={svg.dimRB.ext2.y2} strokeDasharray="3 3" />
            <line x1={svg.dimRB.line.x1} y1={svg.dimRB.line.y} x2={svg.dimRB.line.x2} y2={svg.dimRB.line.y} />
            <line x1={svg.dimRB.line.x1} y1={svg.dimRB.line.y - 4} x2={svg.dimRB.line.x1} y2={svg.dimRB.line.y + 4} />
            <line x1={svg.dimRB.line.x2} y1={svg.dimRB.line.y - 4} x2={svg.dimRB.line.x2} y2={svg.dimRB.line.y + 4} />
          </g>
          {/* 寸法線: 上側の水平部（登り終わり・段鼻からエンドまで） */}
          <g stroke={COLOR_DIM} strokeWidth="1">
            <line x1={svg.dimRT.ext1.x} y1={svg.dimRT.ext1.y1} x2={svg.dimRT.ext1.x} y2={svg.dimRT.ext1.y2} strokeDasharray="3 3" />
            <line x1={svg.dimRT.ext2.x} y1={svg.dimRT.ext2.y1} x2={svg.dimRT.ext2.x} y2={svg.dimRT.ext2.y2} strokeDasharray="3 3" />
            <line x1={svg.dimRT.line.x1} y1={svg.dimRT.line.y} x2={svg.dimRT.line.x2} y2={svg.dimRT.line.y} />
            <line x1={svg.dimRT.line.x1} y1={svg.dimRT.line.y - 4} x2={svg.dimRT.line.x1} y2={svg.dimRT.line.y + 4} />
            <line x1={svg.dimRT.line.x2} y1={svg.dimRT.line.y - 4} x2={svg.dimRT.line.x2} y2={svg.dimRT.line.y + 4} />
          </g>
          {/* 寸法線: 手すり全長（幅の寸法線の下に入れ子で表示。下側エンド先端〜上側エンド先端） */}
          <g stroke={COLOR_DIM} strokeWidth="1">
            <line x1={svg.dimTotal.ext1.x} y1={svg.dimTotal.ext1.y1} x2={svg.dimTotal.ext1.x} y2={svg.dimTotal.ext1.y2} strokeDasharray="3 3" />
            <line x1={svg.dimTotal.ext2.x} y1={svg.dimTotal.ext2.y1} x2={svg.dimTotal.ext2.x} y2={svg.dimTotal.ext2.y2} strokeDasharray="3 3" />
            <line x1={svg.dimTotal.line.x1} y1={svg.dimTotal.line.y} x2={svg.dimTotal.line.x2} y2={svg.dimTotal.line.y} />
            <line x1={svg.dimTotal.line.x1} y1={svg.dimTotal.line.y - 4} x2={svg.dimTotal.line.x1} y2={svg.dimTotal.line.y + 4} />
            <line x1={svg.dimTotal.line.x2} y1={svg.dimTotal.line.y - 4} x2={svg.dimTotal.line.x2} y2={svg.dimTotal.line.y + 4} />
          </g>
          {/* 寸法の数値ラベル（読み取り専用・編集は図の下のコントロール）。
              背景に白フチ（paint-order stroke）を付けて壁・階段の上でも読めるように */}
          <g fill={COLOR_BAR} stroke="#fff" strokeWidth="3" paintOrder="stroke" style={{ strokeLinejoin: "round" }}>
            <text x={svg.dimW.labelX} y={svg.dimW.labelY} textAnchor="middle" fontSize="12" fontWeight="600">
              幅 {W.toLocaleString()}
            </text>
            <text x={svg.dimH.labelX} y={svg.dimH.labelY} textAnchor="start" dominantBaseline="middle" fontSize="12" fontWeight="600">
              高さ {H.toLocaleString()}
            </text>
            <text x={svg.dimRB.labelX} y={svg.dimRB.labelY} textAnchor="middle" fontSize="12" fontWeight="600">
              下側 {RB.toLocaleString()}
            </text>
            <text x={svg.dimRT.labelX} y={svg.dimRT.labelY} textAnchor="middle" fontSize="12" fontWeight="600">
              上側 {RT.toLocaleString()}
            </text>
            <text x={svg.dimTotal.labelX} y={svg.dimTotal.labelY} textAnchor="middle" fontSize="11.5" fontWeight="700">
              全長 約{L.toLocaleString()}mm
            </text>
          </g>
          {svg.zakin.map((z, i) => (
            <g key={i}>
              <line x1={z.x1} y1={z.y1} x2={z.x2} y2={z.y2} stroke={COLOR_BAR} strokeWidth="1.5" />
              <circle cx={z.cx} cy={z.cy} r={z.r} fill={COLOR_BAR} />
            </g>
          ))}
          <path d={svg.rail} fill="none" stroke={COLOR_BAR} strokeWidth={RAIL_STROKE} strokeLinecap="round" />
          {/* エンド（唐草 Type A/B・選択に連動。実物写真トレースのシルエット） */}
          <EndDecoration id={endBottom} x={svg.endBottomAt.x} y={svg.endBottomAt.y} outward={-1} scale={svg.scale} railAngleDeg={svg.endBottomAt.angleDeg} />
          <EndDecoration id={endTop} x={svg.endTopAt.x} y={svg.endTopAt.y} outward={1} scale={svg.scale} railAngleDeg={svg.endTopAt.angleDeg} />
        </svg>
      </div>
      <p className="text-[13px] md:text-[14px] text-foreground text-center mb-3 leading-relaxed">
        直階段 {N}段・手すり全長{" "}
        <span className="font-serif font-bold text-[15px] md:text-[16px]">
          約{L.toLocaleString()}mm
        </span>
        ・座金 {zakinCount} 箇所
        <span className="block text-[11px] md:text-[12px] text-muted-foreground">
          （段鼻間 約{noseDiag.toLocaleString()}mm ＋ エンド部 下{RB}mm・上{RT}mm／座金は自動算出・位置は目安）
        </span>
      </p>

      {/* 各部の寸法入力（図の下・−/＋ ボタン付き。図には数値ラベルだけ出す） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <DimStepper
          label="階段の幅"
          hint="1段目〜最上段の段鼻"
          value={perStepTouched ? W : wMm}
          effective={W}
          setValue={(v) => {
            setWMm(v)
            setWTouched(true)
            setPerStepTouched(false)
          }}
          min={W_MIN}
          max={W_MAX}
        />
        <DimStepper
          label="高さ"
          hint="床〜最上段"
          value={perStepTouched ? H : hMm}
          effective={H}
          setValue={(v) => {
            setHMm(v)
            setHTouched(true)
            setPerStepTouched(false)
          }}
          min={H_MIN}
          max={H_MAX}
        />
        {/* ↑ setWMm/setHMm は number でも関数更新でも受けられる（useState の setter）ため
             DimStepper の関数更新がそのまま通る。蹴上・踏面・蹴込モード中は value に
             逆算した実効値を出す（stale な wMm/hMm を表示してしまわないため） */}
        <DimStepper
          label="下側エンド"
          hint={`段鼻〜先端（${RUN_MIN_BOTTOM}〜${RUN_MAX}）`}
          value={runBMm}
          effective={RB}
          setValue={setRunBMm}
          min={RUN_MIN_BOTTOM}
          max={RUN_MAX}
        />
        <DimStepper
          label="上側エンド"
          hint={`段鼻〜先端（${RUN_MIN_TOP}〜${RUN_MAX}）`}
          value={runTMm}
          effective={RT}
          setValue={setRunTMm}
          min={RUN_MIN_TOP}
          max={RUN_MAX}
        />
      </div>
      <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
        幅＝1段目から最上段までの段鼻の水平距離、高さ＝床から最上段までの高さ、
        エンド部＝段鼻から唐草エンドの先端（ループの端）までです。
        下側は段鼻より出ないこともあり、0 で段鼻とループの端が揃います。
        分からない場合はそのままで構いません（段数に合わせた一般的な寸法を自動セットしています）。
      </p>

      {/* 正確な階段寸法の入力（蹴上・踏面・蹴込／段鼻間の直線距離）。
          現地で正確に測って仕様を確定したいお客様向けの詳細入力
          （2026-07-22 蠣﨑さん指示: 段鼻・蹴上・踏面・蹴込の説明とともに入力欄を作る。
          1段目〜最上段の段鼻の距離も直接入力できるように） */}
      <div className="mb-4 rounded-md border border-border bg-white p-4">
        <p className="text-[13px] font-medium text-foreground mb-1">
          より正確に測りたい方へ ── 階段各部の寸法
        </p>
        <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">
          現地で階段を実測できる場合は、蹴上・踏面・蹴込（下図）を入力すると幅・高さが自動計算され、
          より正確な仕様になります。入力すると上の「階段の幅」「高さ」より優先されます。
        </p>
        <StairPartsDiagram />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground leading-relaxed mt-2 mb-3">
          <div><dt className="inline font-medium text-foreground">段鼻：</dt><dd className="inline">各段の踏面の前端（一番手前に出た角）</dd></div>
          <div><dt className="inline font-medium text-foreground">蹴上：</dt><dd className="inline">1段あたりの高さ（垂直）</dd></div>
          <div><dt className="inline font-medium text-foreground">踏面：</dt><dd className="inline">足を乗せる面の奥行き（水平）</dd></div>
          <div><dt className="inline font-medium text-foreground">蹴込：</dt><dd className="inline">段鼻の真下、蹴込み板の引っ込み幅</dd></div>
        </dl>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          <DimStepper
            label="蹴上"
            hint="1段の高さ"
            value={riserMm}
            effective={riserEff}
            setValue={(v) => {
              setRiserMm(v)
              setPerStepTouched(true)
            }}
            min={RISER_MIN}
            max={RISER_MAX}
          />
          <DimStepper
            label="踏面"
            hint="足を乗せる面の奥行き"
            value={treadMm}
            effective={treadEff}
            setValue={(v) => {
              setTreadMm(v)
              setPerStepTouched(true)
            }}
            min={TREAD_MIN}
            max={TREAD_MAX}
          />
          <DimStepper
            label="蹴込"
            hint="段鼻下の引っ込み"
            value={kickMm}
            effective={kickEff}
            setValue={(v) => {
              setKickMm(v)
              setPerStepTouched(true)
            }}
            min={KICK_MIN}
            max={KICK_MAX}
          />
        </div>
        <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-white px-3 py-2">
          <span className="text-[13px] text-foreground leading-tight">
            段鼻間の距離（直接入力）
            <span className="block text-[10px] text-muted-foreground mt-0.5">
              1段目〜最上段の段鼻を斜めに直接測った場合はこちら
            </span>
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              inputMode="numeric"
              min={DIAG_MIN}
              max={DIAG_MAX}
              step={10}
              value={noseDiag}
              onChange={(e) => setNoseDiagDirect(Number(e.target.value))}
              onBlur={(e) => setNoseDiagDirect(clamp(Number(e.target.value), DIAG_MIN, DIAG_MAX))}
              aria-label="1段目と最上段の段鼻の距離（mm）"
              className="w-20 h-8 border border-border rounded-md text-center text-[14px] bg-white focus:outline-none focus:border-gold"
            />
            <span className="text-[12px] text-muted-foreground">mm</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
          段鼻間の距離を入力すると、現在の幅・高さの比率（勾配）を保ったまま両方を自動で伸縮します。
        </p>
      </div>

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
      </>
      )}

      {winding && plan && (
        <>
          {/* 平面図（上から見た図・入力に連動）。壁の幅の寸法線と手すり①②③を表示 */}
          <div className="mb-2">
            <svg viewBox={`0 0 ${VB_W} ${VB_PLAN_H}`} className="w-full h-auto bg-white rounded-md border border-border">
              {plan.rects.map((r, i) => (
                <rect key={`r${i}`} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} />
              ))}
              {plan.stairRects.map((r, i) => (
                <rect key={`s${i}`} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} stroke={COLOR_STAIR_LINE} strokeWidth="1.5" />
              ))}
              {plan.stepLines.map((l, i) => (
                <line key={`t${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={COLOR_STAIR_LINE} strokeWidth="1.2" />
              ))}
              {plan.dims.map((l, i) => (
                <line
                  key={`d${i}`}
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke={COLOR_DIM}
                  strokeWidth="1"
                  strokeDasharray={l.dash ? "3 3" : undefined}
                />
              ))}
              {/* 上り方向の矢印 */}
              <line x1={plan.arrow.x1} y1={plan.arrow.y1} x2={plan.arrow.x2} y2={plan.arrow.y2 + 8} stroke={COLOR_DIM} strokeWidth="1.5" />
              <polygon
                points={`${plan.arrow.x2},${plan.arrow.y2} ${plan.arrow.x2 - 4},${plan.arrow.y2 + 9} ${plan.arrow.x2 + 4},${plan.arrow.y2 + 9}`}
                fill={COLOR_DIM}
              />
              {/* 座金（壁への支持位置・目安） */}
              {plan.zakinTicks.map((l, i) => (
                <line key={`z${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={COLOR_BAR} strokeWidth="1.5" />
              ))}
              {/* 手すり本体（本ごとの直線ピース・曲がり角で分割） */}
              {plan.railLines.map((l, i) => (
                <line key={`rail${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={COLOR_BAR} strokeWidth={RAIL_STROKE} strokeLinecap="round" />
              ))}
              {/* 唐草エンドの先端（1段目側・最終段側のみ） */}
              {plan.tips.map((t, i) => (
                <circle key={`tip${i}`} cx={t.x} cy={t.y} r="4.5" fill={COLOR_BAR} />
              ))}
              {plan.labels.map((t, i) => (
                <text
                  key={`lb${i}`}
                  x={t.x}
                  y={t.y}
                  textAnchor={t.anchor ?? "start"}
                  fontSize={t.size ?? 12}
                  fontWeight={t.weight ?? 400}
                  fill={t.muted ? "#6b7280" : COLOR_BAR}
                  stroke="#fff"
                  strokeWidth="3"
                  paintOrder="stroke"
                  style={{ strokeLinejoin: "round" }}
                  transform={t.rotate ? `rotate(${t.rotate} ${t.x} ${t.y})` : undefined}
                >
                  {t.text}
                </text>
              ))}
            </svg>
          </div>
          <p className="text-[13px] md:text-[14px] text-foreground text-center mb-3 leading-relaxed">
            {shape === "L" ? "かね折れ階段（L字）" : "折り返し階段（コの字）"}・手すり{winding.rails.length}本{" "}
            <span className="font-serif font-bold text-[15px] md:text-[16px]">
              合計 約{winding.totalLen.toLocaleString()}mm
            </span>
            ・座金 合計{winding.totalZakin}箇所
            <span className="block text-[11px] md:text-[12px] text-muted-foreground">
              （曲がり角は壁から{CORNER_WALL_GAP}mm 逃がし・エンド部は段鼻から{WINDING_END_RUN}mm・勾配は蹴上/踏面から換算した概算）
            </span>
          </p>

          {/* 本ごとの概算長さ（図の①②③に対応） */}
          <div className="grid grid-cols-1 gap-1.5 mb-3">
            {winding.rails.map((r) => (
              <div key={r.no} className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-[13px] md:text-[14px]">
                <span className="text-foreground">
                  {r.no} {r.pos}
                  {r.end && <span className="text-[11px] text-muted-foreground ml-1">唐草エンド付き</span>}
                </span>
                <span className="font-serif text-foreground">
                  約{r.len.toLocaleString()}mm・座金{r.zakin}箇所
                </span>
              </div>
            ))}
          </div>

          {/* 壁の幅の入力（図の寸法線に対応） */}
          <div className={`grid grid-cols-1 gap-2 mb-3 ${shape === "U" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            <DimStepper
              label="壁①の幅"
              hint="1段目の段鼻 〜 正面の壁"
              value={w1Mm}
              effective={w1}
              setValue={setW1Mm}
              min={WALL_MIN}
              max={WALL_MAX}
            />
            <DimStepper
              label="壁②の幅"
              hint={shape === "U" ? "壁から壁の内寸" : "のぼってきた壁 〜 最終段の段鼻"}
              value={w2Mm}
              effective={w2}
              setValue={setW2Mm}
              min={shape === "U" ? WALL_MID_MIN : WALL_MIN}
              max={WALL_MAX}
            />
            {shape === "U" && (
              <DimStepper
                label="壁③の幅"
                hint="曲がってきた壁 〜 最終段の段鼻"
                value={w3Mm}
                effective={w3}
                setValue={setW3Mm}
                min={WALL_MIN}
                max={WALL_MAX}
              />
            )}
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
            壁の幅＝手すりが付く壁に沿った水平距離です（図の寸法線の位置）。
            左右が逆向きの階段でも同じ入力で概算できます。分からない場合はそのままで構いません。
          </p>

          {/* 蹴上・踏面・蹴込（勾配の計算に使用） */}
          <div className="mb-4 rounded-md border border-border bg-white p-4">
            <p className="text-[13px] font-medium text-foreground mb-1">階段の勾配 ── 蹴上・踏面・蹴込</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">
              手すりの斜めの長さは、蹴上・踏面・蹴込（下図）から計算した階段の勾配で換算します。
              分かる範囲で入力してください（未入力なら一般的な寸法で概算します）。
            </p>
            <StairPartsDiagram />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <DimStepper
                label="蹴上"
                hint="1段の高さ"
                value={riserMm}
                effective={riserEff}
                setValue={(v) => {
                  setRiserMm(v)
                  setPerStepTouched(true)
                }}
                min={RISER_MIN}
                max={RISER_MAX}
              />
              <DimStepper
                label="踏面"
                hint="足を乗せる面の奥行き"
                value={treadMm}
                effective={treadEff}
                setValue={(v) => {
                  setTreadMm(v)
                  setPerStepTouched(true)
                }}
                min={TREAD_MIN}
                max={TREAD_MAX}
              />
              <DimStepper
                label="蹴込"
                hint="段鼻下の引っ込み"
                value={kickMm}
                effective={kickEff}
                setValue={(v) => {
                  setKickMm(v)
                  setPerStepTouched(true)
                }}
                min={KICK_MIN}
                max={KICK_MAX}
              />
            </div>
          </div>
        </>
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
      {!winding ? (
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
      ) : (
        // 回り階段モード: 手すり1本ごとの金額（本体＋座金＋唐草エンドの合算）
        <dl className="divide-y divide-border border-y border-border text-[13px] md:text-[14px] mb-3">
          {winding.rails.map((r) => (
            <div key={r.no} className="flex justify-between gap-3 py-2">
              <dt className="text-muted-foreground">
                {r.no} {r.pos} 約{r.len.toLocaleString()}mm・座金{r.zakin}箇所
                {r.end ? `・唐草エンド（${r.end === "bottom" ? endBottom : endTop}）` : ""}
              </dt>
              <dd className="font-serif text-foreground shrink-0">¥{r.price.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[14px] text-muted-foreground">参考価格（税込・送料別）</span>
        <span className="font-serif text-[22px] font-medium text-foreground">
          ¥{(winding ? winding.totalPrice : total).toLocaleString()}
        </span>
      </div>

      {!winding ? (
        <p className="text-[11px] md:text-[12px] text-muted-foreground leading-relaxed">
          ※ 手すり全長＝1段目と最上段の段鼻の直線距離＋両端のエンド部（段鼻からループ先端まで 下{RB}mm・上{RT}mm）。
          座金の数は端 100mm・最大 850mm 間隔の標準ピッチで自動算出した参考値です。
          実際の階段の形状・寸法・取付下地により長さ・本数・金額が変わります。
          下の「見積もり依頼」からこの内容がそのまま引き継がれます（お見積もり無料）。
        </p>
      ) : (
        <p className="text-[11px] md:text-[12px] text-muted-foreground leading-relaxed">
          ※ 回り階段の手すりは曲げ加工せず、曲がりごとに分かれた直線の手すりを1本ずつお作りします。
          曲がり角では曲がる側の壁の{CORNER_WALL_GAP}mm手前で手すりが終わり、90度回った先は
          のぼってきた側の壁から{CORNER_WALL_GAP}mm空けて次の1本が始まります。
          各本の金額＝本体（1mあたり¥{config.unitPricePerM.toLocaleString()}）＋座金で、
          唐草エンドは1段目側・最終段側の2箇所のみ（各¥{config.endPrice.toLocaleString()}）に付きます。
          エンド部は段鼻から先端まで{WINDING_END_RUN}mm・勾配は蹴上/踏面からの換算による概算のため、
          実際の階段の形状・寸法・取付下地により長さ・本数・金額が変わります。
          下の「見積もり依頼」からこの内容がそのまま引き継がれます（お見積もり無料）。
        </p>
      )}
    </div>
  )
}
