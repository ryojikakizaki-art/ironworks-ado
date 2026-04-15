"use client"

import { useState, useCallback } from "react"
import { calcZakin, getZakinPositions, END_DIST_MM } from "@/lib/drawing-modal/rene-constants"
import type { DrawingProductConfig } from "@/lib/drawing-modal/products"

interface InlineRailSimulatorProps {
  product: DrawingProductConfig
  lengthMm: number
  /** 座金位置 mm[]。undefined なら自動計算 */
  positions?: number[]
  /** 角度 (度) — 横型のみ有効 */
  angleDeg?: number
  /** 角度方向 — 横型のみ有効 */
  angleDir?: "left" | "right"
  /** 座金をドラッグ可能にする場合、変更を受け取るコールバック */
  onPositionsChange?: (next: number[]) => void
  className?: string
}

// SVG viewBox と layout 定数 (vertical-svg.ts と同じ)
const VB_W = 500
const VB_H = 130
const PAD = 40
const BAR_Y = 55
const BAR_LEFT = PAD
const BAR_RIGHT = VB_W - PAD
const BAR_LEN = BAR_RIGHT - BAR_LEFT
const DIM_Y = 18
const SEG_Y = BAR_Y + 28

const COLOR_BAR = "#333"
const COLOR_DIM = "#888"
const COLOR_TEXT = "#555"
const COLOR_TOTAL_TEXT = "#222"
const COLOR_BRACKET = "#c8a96e"
const BRACKET_R = 5

/**
 * 長さに連動してリアルタイム更新される簡易シミュレータ SVG (React JSX版)。
 * onPositionsChange を渡すと、座金をドラッグで位置調整できる。
 */
export function InlineRailSimulator({
  product,
  lengthMm,
  positions,
  angleDeg = 0,
  angleDir = "left",
  onPositionsChange,
  className,
}: InlineRailSimulatorProps) {
  const effectivePositions = positions ?? getZakinPositions(lengthMm, calcZakin(lengthMm))
  const sorted = [...effectivePositions]
    .map((p, i) => ({ pos: p, origIdx: i }))
    .sort((a, b) => a.pos - b.pos)

  const isHorizontal = product.category === "horizontal"
  const effectiveAngle = isHorizontal ? angleDeg : 0
  const angleRad = (effectiveAngle * Math.PI) / 180
  const tiltSign = angleDir === "left" ? -1 : 1

  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)

  // viewBox x → mm
  const xToMm = useCallback(
    (viewBoxX: number): number => {
      const rel = (viewBoxX - BAR_LEFT) / BAR_LEN
      const mm = Math.round(rel * lengthMm)
      // 両端から END_DIST_MM (100mm) 以内に
      return Math.max(END_DIST_MM, Math.min(lengthMm - END_DIST_MM, mm))
    },
    [lengthMm]
  )

  // pointer event → viewBox 座標
  const pointerToViewBox = (
    e: React.PointerEvent<SVGSVGElement>
  ): { x: number; y: number } => {
    const svg = e.currentTarget
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const inv = ctm.inverse()
    const local = pt.matrixTransform(inv)
    return { x: local.x, y: local.y }
  }

  const handlePointerDown =
    (idx: number) => (e: React.PointerEvent<SVGCircleElement>) => {
      if (!onPositionsChange) return
      e.stopPropagation()
      ;(e.target as Element).setPointerCapture(e.pointerId)
      setDraggingIdx(idx)
    }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingIdx === null || !onPositionsChange) return
    const { x } = pointerToViewBox(e)
    const newMm = xToMm(x)
    const next = [...effectivePositions]
    next[draggingIdx] = newMm
    onPositionsChange(next)
  }

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingIdx === null) return
    try {
      ;(e.target as Element).releasePointerCapture?.(e.pointerId)
    } catch {
      // ignore
    }
    setDraggingIdx(null)
  }

  const scaleX = (mm: number) => BAR_LEFT + (mm / lengthMm) * BAR_LEN

  // セグメント寸法
  const segPoints = [0, ...sorted.map((s) => s.pos), lengthMm]

  return (
    <div
      className={`bg-card border border-border rounded-md p-4 ${className ?? ""}`}
    >
      <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
        Simulator
      </div>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: draggingIdx !== null ? "none" : "auto" }}
      >
        {/* 全長寸法 */}
        <text
          x={(BAR_LEFT + BAR_RIGHT) / 2}
          y={DIM_Y - 3}
          fontSize={12}
          fill={COLOR_TOTAL_TEXT}
          textAnchor="middle"
          fontWeight={600}
          fontFamily="sans-serif"
        >
          {lengthMm}
        </text>
        <line x1={BAR_LEFT} y1={DIM_Y} x2={BAR_RIGHT} y2={DIM_Y} stroke={COLOR_BAR} strokeWidth={0.8} />
        <line x1={BAR_LEFT} y1={DIM_Y - 4} x2={BAR_LEFT} y2={DIM_Y + 4} stroke={COLOR_BAR} strokeWidth={0.8} />
        <line x1={BAR_RIGHT} y1={DIM_Y - 4} x2={BAR_RIGHT} y2={DIM_Y + 4} stroke={COLOR_BAR} strokeWidth={0.8} />
        <line x1={BAR_LEFT} y1={DIM_Y + 4} x2={BAR_LEFT} y2={BAR_Y - 8} stroke={COLOR_DIM} strokeWidth={0.7} />
        <line x1={BAR_RIGHT} y1={DIM_Y + 4} x2={BAR_RIGHT} y2={BAR_Y - 8} stroke={COLOR_DIM} strokeWidth={0.7} />

        {/* メインバー */}
        <line
          x1={BAR_LEFT}
          y1={BAR_Y}
          x2={BAR_RIGHT}
          y2={BAR_Y}
          stroke={COLOR_BAR}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <line x1={BAR_LEFT} y1={BAR_Y - 6} x2={BAR_LEFT} y2={BAR_Y + 6} stroke={COLOR_BAR} strokeWidth={1.5} />
        <line x1={BAR_RIGHT} y1={BAR_Y - 6} x2={BAR_RIGHT} y2={BAR_Y + 6} stroke={COLOR_BAR} strokeWidth={1.5} />

        {/* 座金 (描画順: 支柱線 → 円) ソート後のインデックスでレンダーし、
            元の配列インデックスを onPointerDown に渡す */}
        {sorted.map((item) => {
          const barX = scaleX(item.pos)
          const isDragging = draggingIdx === item.origIdx
          const interactive = !!onPositionsChange
          if (isHorizontal) {
            const circleX = barX
            const circleY = BAR_Y + BRACKET_R + 2
            const pillarTopX =
              barX + (effectiveAngle > 0 ? BRACKET_R * Math.sin(angleRad) * tiltSign : 0)
            return (
              <g key={item.origIdx}>
                <line
                  x1={circleX}
                  y1={circleY}
                  x2={pillarTopX}
                  y2={BAR_Y}
                  stroke={COLOR_BRACKET}
                  strokeWidth={1.2}
                />
                {/* Visible circle */}
                <circle
                  cx={circleX}
                  cy={circleY}
                  r={BRACKET_R}
                  fill={COLOR_BRACKET}
                  stroke={COLOR_BRACKET}
                />
                {/* Larger transparent hit area for easier dragging */}
                {interactive && (
                  <circle
                    cx={circleX}
                    cy={circleY}
                    r={12}
                    fill="transparent"
                    stroke={isDragging ? COLOR_BRACKET : "transparent"}
                    strokeWidth={1}
                    strokeDasharray={isDragging ? "2,2" : undefined}
                    style={{ cursor: interactive ? "ew-resize" : "default" }}
                    onPointerDown={handlePointerDown(item.origIdx)}
                  />
                )}
              </g>
            )
          }
          // vertical: circle on bar
          return (
            <g key={item.origIdx}>
              <circle cx={barX} cy={BAR_Y} r={BRACKET_R} fill={COLOR_BRACKET} />
              {interactive && (
                <circle
                  cx={barX}
                  cy={BAR_Y}
                  r={12}
                  fill="transparent"
                  stroke={isDragging ? COLOR_BRACKET : "transparent"}
                  strokeWidth={1}
                  strokeDasharray={isDragging ? "2,2" : undefined}
                  style={{ cursor: interactive ? "ew-resize" : "default" }}
                  onPointerDown={handlePointerDown(item.origIdx)}
                />
              )}
            </g>
          )
        })}

        {/* セグメント寸法 */}
        {segPoints.slice(0, -1).map((p1, i) => {
          const p2 = segPoints[i + 1]
          const segLen = p2 - p1
          if (segLen <= 0) return null
          const x1 = scaleX(p1)
          const x2 = scaleX(p2)
          const midX = (x1 + x2) / 2
          return (
            <g key={`seg-${i}`}>
              <line x1={x1} y1={SEG_Y} x2={x2} y2={SEG_Y} stroke={COLOR_DIM} strokeWidth={0.7} />
              <line x1={x1} y1={SEG_Y - 3} x2={x1} y2={SEG_Y + 3} stroke={COLOR_DIM} strokeWidth={0.7} />
              <line x1={x2} y1={SEG_Y - 3} x2={x2} y2={SEG_Y + 3} stroke={COLOR_DIM} strokeWidth={0.7} />
              <text
                x={midX}
                y={SEG_Y + 14}
                fontSize={11}
                fill={COLOR_TEXT}
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {segLen}
              </text>
            </g>
          )
        })}

        {/* 座金 N 点 ラベル */}
        <text
          x={(BAR_LEFT + BAR_RIGHT) / 2}
          y={SEG_Y + 32}
          fontSize={10}
          fill={COLOR_DIM}
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          《 座金 {sorted.length}点 》
        </text>
      </svg>
      <div className="text-[10px] text-muted-foreground mt-1">
        推奨座金数 {calcZakin(lengthMm)} 個（自動計算）
        {onPositionsChange && (
          <span className="ml-2 text-gold">・座金をドラッグで位置調整できます</span>
        )}
      </div>
    </div>
  )
}
