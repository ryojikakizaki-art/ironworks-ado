"use client"

import { useEffect, useRef } from "react"
import { buildRoundRailDrawingSvg } from "@/lib/drawing-modal/rene-svg"
import { calcZakin, getZakinPositions } from "@/lib/drawing-modal/rene-constants"
import { getDrawingProduct } from "@/lib/drawing-modal/products"

interface DrawingModalProps {
  open: boolean
  onClose: () => void
  lengthMm: number
  productSlug: string
}

export function ReneDrawingModal({ open, onClose, lengthMm, productSlug }: DrawingModalProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const product = getDrawingProduct(productSlug)

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
    if (!open || !svgRef.current || !product) return
    const count = calcZakin(lengthMm)
    const positions = getZakinPositions(lengthMm, count)
    buildRoundRailDrawingSvg(svgRef.current, {
      L_mm: lengthMm,
      positions,
      angleDeg: 0,
      angleDir: "left",
      product,
    })
  }, [open, lengthMm, product])

  if (!open) return null

  // 対応外の商品の場合はフォールバック
  if (!product) {
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
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#666" }}>
            この商品の制作図は現在準備中です。
          </div>
        </div>
      </div>
    )
  }

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
