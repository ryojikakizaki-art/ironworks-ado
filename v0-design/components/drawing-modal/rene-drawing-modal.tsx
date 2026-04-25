"use client"

import { useEffect, useRef } from "react"
import { buildRoundRailDrawingSvg } from "@/lib/drawing-modal/rene-svg"
import { buildVerticalRailDrawingSvg } from "@/lib/drawing-modal/vertical-svg"
import { buildVerticalCadDrawingSvg } from "@/lib/drawing-modal/vertical-cad-svg"
import { calcZakin, getZakinPositions, type ZakinRule } from "@/lib/drawing-modal/rene-constants"
import { getDrawingProduct, type WasherTypeId } from "@/lib/drawing-modal/products"

interface DrawingModalProps {
  open: boolean
  onClose: () => void
  lengthMm: number
  productSlug: string
  /** 座金エディターから渡される位置配列。未指定時は自動計算 */
  positions?: number[]
  /** 角度 (度) — 横型のみ有効 */
  angleDeg?: number
  /** 角度方向 — 横型のみ有効 */
  angleDir?: "left" | "right"
  /** 商品固有の座金ルール (未指定なら product.zakinRule を使用) */
  zakinRule?: ZakinRule
  /** 座金タイプ (A=55×35 / B=60×25)。縦型CAD精密図のみ有効 */
  washerType?: WasherTypeId
}

export function ReneDrawingModal({
  open,
  onClose,
  lengthMm,
  productSlug,
  positions: positionsProp,
  angleDeg = 0,
  angleDir = "left",
  zakinRule,
  washerType = "A",
}: DrawingModalProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const product = getDrawingProduct(productSlug)
  const effectiveRule = zakinRule ?? product?.zakinRule

  // モーダルが開いている間、bodyスクロールを止める
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [open])

  // SVGを再描画 (category で横型/縦型を分岐、washerType も依存)
  useEffect(() => {
    if (!open || !svgRef.current || !product) return
    const positions =
      positionsProp ?? getZakinPositions(lengthMm, calcZakin(lengthMm, effectiveRule), effectiveRule)
    if (product.category === "vertical") {
      // washerSpec + titleBlock がある商品 (Claude) はCAD精密図、それ以外は旧シンプル schematic
      if (product.washerSpec && product.titleBlock) {
        buildVerticalCadDrawingSvg(svgRef.current, {
          L_mm: lengthMm,
          positions,
          product,
          washerType,
        })
      } else {
        buildVerticalRailDrawingSvg(svgRef.current, {
          L_mm: lengthMm,
          positions,
          product,
          angleDeg,
          angleDir,
        })
      }
    } else {
      if (!product.shape) return
      buildRoundRailDrawingSvg(svgRef.current, {
        L_mm: lengthMm,
        positions,
        angleDeg,
        angleDir,
        product,
      })
    }
  }, [open, lengthMm, product, positionsProp, angleDeg, angleDir, effectiveRule, washerType])

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

  // viewBox 切替: 縦型CAD精密図 (DXF抽出, builder 側で再設定) / 旧縦型schematic / 横型
  // CAD精密図モードでは buildVerticalCadDrawingSvg が viewBox を上書きする
  const viewBox =
    product.category === "vertical"
      ? product.washerSpec && product.titleBlock
        ? "-1200 -835 2020 1790"
        : "0 0 500 130"
      : "0 0 840 400"

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
          <svg ref={svgRef} id="drawingSvg" viewBox={viewBox} />
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
