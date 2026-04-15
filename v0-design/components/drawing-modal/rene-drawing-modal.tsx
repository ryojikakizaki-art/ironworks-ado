"use client"

import { useEffect, useRef } from "react"
import { buildReneDrawingSvg } from "@/lib/drawing-modal/rene-svg"
import { calcZakin, getZakinPositions } from "@/lib/drawing-modal/rene-constants"

interface ReneDrawingModalProps {
  open: boolean
  onClose: () => void
  lengthMm: number
}

export function ReneDrawingModal({ open, onClose, lengthMm }: ReneDrawingModalProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // モーダルが開いている間、bodyスクロールを止める
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  // SVGを再描画
  useEffect(() => {
    if (!open || !svgRef.current) return
    const count = calcZakin(lengthMm)
    const positions = getZakinPositions(lengthMm, count)
    buildReneDrawingSvg(svgRef.current, {
      L_mm: lengthMm,
      positions,
      angleDeg: 0,
      angleDir: "left",
    })
  }, [open, lengthMm])

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
        <div className="dm-title">制作図プレビュー</div>
        <div className="dm-svg-wrap">
          <svg ref={svgRef} id="drawingSvg" viewBox="0 0 840 400" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          <button className="dm-print-btn" onClick={() => window.print()}>
            PDF保存 / 印刷
          </button>
          <span className="dm-note" style={{ margin: 0 }}>
            ※ 座金の数量・位置・角度は今後のアップデートで設定可能になります（現在は自動配置のみ）
          </span>
        </div>
      </div>
    </div>
  )
}
