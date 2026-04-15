"use client"

import { useEffect, useRef } from "react"
import { buildVerticalRailDrawingSvg } from "@/lib/drawing-modal/vertical-svg"
import { calcZakin, getZakinPositions } from "@/lib/drawing-modal/rene-constants"
import type { DrawingProductConfig } from "@/lib/drawing-modal/products"

interface InlineRailSimulatorProps {
  product: DrawingProductConfig
  lengthMm: number
  /** Optional: override positions (for editor integration later) */
  positions?: number[]
  /** 角度 (度) — 横型のみ有効 */
  angleDeg?: number
  /** 角度方向 — 横型のみ有効 */
  angleDir?: "left" | "right"
  className?: string
}

/**
 * 長さに連動してリアルタイム更新される簡易シミュレータ SVG。
 * 既存 item/rene.html の `<svg id="zakinSvg">` に相当。
 * 縦型手すり用の簡易 schematic ビルダーを流用している。
 */
export function InlineRailSimulator({
  product,
  lengthMm,
  positions,
  angleDeg,
  angleDir,
  className,
}: InlineRailSimulatorProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    const actualPositions =
      positions ?? getZakinPositions(lengthMm, calcZakin(lengthMm))
    buildVerticalRailDrawingSvg(svgRef.current, {
      L_mm: lengthMm,
      positions: actualPositions,
      product,
      angleDeg,
      angleDir,
    })
  }, [product, lengthMm, positions, angleDeg, angleDir])

  return (
    <div
      className={`bg-card border border-border rounded-md p-4 ${className ?? ""}`}
    >
      <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
        Simulator
      </div>
      <svg ref={svgRef} viewBox="0 0 500 130" className="w-full h-auto" />
      <div className="text-[10px] text-muted-foreground mt-1">
        推奨座金数 {calcZakin(lengthMm)} 個（自動計算）
      </div>
    </div>
  )
}
