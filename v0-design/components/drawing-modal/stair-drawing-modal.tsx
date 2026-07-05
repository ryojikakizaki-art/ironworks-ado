"use client"

import { useEffect, useRef } from "react"
import { buildStairDrawingSvg, type StairDrawingOpts } from "@/lib/drawing-modal/stair-svg"

interface StairDrawingModalProps {
  open: boolean
  onClose: () => void
  drawing: StairDrawingOpts
}

/**
 * Laurent（階段手摺）の設計図モーダル。既存の制作図モーダルと同じ dm-overlay 方式で、
 * そのまま印刷/PDF 保存できる（globals.css の @media print が dm-overlay を残す）。
 */
export function StairDrawingModal({ open, onClose, drawing }: StairDrawingModalProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // モーダルが開いている間、body スクロールを止める
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [open])

  useEffect(() => {
    if (!open || !svgRef.current) return
    buildStairDrawingSvg(svgRef.current, drawing)
  }, [open, drawing])

  if (!open) return null

  return (
    <div
      className="dm-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="dm-modal">
        <button className="dm-close" onClick={onClose} aria-label="閉じる">
          ×
        </button>
        <div className="dm-title">設計図プレビュー ── Laurent ローラン 階段手摺</div>
        <div className="dm-svg-wrap">
          <svg ref={svgRef} id="stairDrawingSvg" viewBox="0 0 1000 720" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          <button className="dm-print-btn" onClick={() => window.print()}>
            PDF保存 / 印刷
          </button>
          <span className="dm-note" style={{ margin: 0 }}>
            ※ 入力寸法から自動生成した目安の設計図です。製作時に現場状況へ合わせて微調整します。
          </span>
        </div>
      </div>
    </div>
  )
}
