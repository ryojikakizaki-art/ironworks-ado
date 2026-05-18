"use client"

import { useEffect, useRef, useState } from "react"
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
  /**
   * 多本長さ違い対応 (PR #2): 各本の長さ配列。
   * 渡された場合、タブで本ごとに図面を切替可能。
   * 渡されない or length=1 なら従来通り単本表示。
   */
  lengths?: number[]
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
  lengths,
}: DrawingModalProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const product = getDrawingProduct(productSlug)
  const effectiveRule = zakinRule ?? product?.zakinRule

  // 多本対応: lengths が来たらタブ管理、無ければ単本互換 ([lengthMm])
  const lengthsArray = lengths && lengths.length > 0 ? lengths : [lengthMm]
  const isMulti = lengthsArray.length > 1
  const [selectedIdx, setSelectedIdx] = useState(0)
  // モーダル開閉時に先頭タブへリセット
  useEffect(() => {
    if (open) setSelectedIdx(0)
  }, [open])
  const safeIdx = Math.min(selectedIdx, lengthsArray.length - 1)
  const currentLength = lengthsArray[safeIdx] ?? lengthMm

  // モーダルが開いている間、bodyスクロールを止める
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [open])

  // SVGを再描画 (category で横型/縦型を分岐、washerType も依存)
  // 多本時は currentLength に応じて自動計算 positions を使う (positionsProp は単本時のみ尊重)
  useEffect(() => {
    if (!open || !svgRef.current || !product) return
    const positions = isMulti
      ? getZakinPositions(currentLength, calcZakin(currentLength, effectiveRule), effectiveRule)
      : (positionsProp ?? getZakinPositions(currentLength, calcZakin(currentLength, effectiveRule), effectiveRule))
    if (product.category === "vertical") {
      // washerSpec + titleBlock がある商品 (Claude) はCAD精密図、それ以外は旧シンプル schematic
      if (product.washerSpec && product.titleBlock) {
        buildVerticalCadDrawingSvg(svgRef.current, {
          L_mm: currentLength,
          positions,
          product,
          washerType,
        })
      } else {
        buildVerticalRailDrawingSvg(svgRef.current, {
          L_mm: currentLength,
          positions,
          product,
          angleDeg: isMulti ? 0 : angleDeg,
          angleDir,
        })
      }
    } else {
      if (!product.shape) return
      buildRoundRailDrawingSvg(svgRef.current, {
        L_mm: currentLength,
        positions,
        angleDeg: isMulti ? 0 : angleDeg,
        angleDir,
        product,
      })
    }
  }, [open, currentLength, isMulti, product, positionsProp, angleDeg, angleDir, effectiveRule, washerType])

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
        <div className="dm-title">
          制作図プレビュー
          {isMulti && (
            <span style={{ fontSize: 13, color: "#888", marginLeft: 10, fontWeight: 400 }}>
              （{safeIdx + 1} / {lengthsArray.length} 本目: {currentLength}mm）
            </span>
          )}
        </div>
        {/* 多本タブ切替: 本ごとに違う長さの図面を表示できる (PR #2) */}
        {isMulti && (
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {lengthsArray.map((L, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIdx(i)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 6,
                  border: safeIdx === i ? "2px solid #c8a96e" : "1px solid #ddd",
                  background: safeIdx === i ? "rgba(200, 169, 110, 0.06)" : "#fff",
                  color: safeIdx === i ? "#9a8049" : "#444",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: safeIdx === i ? 600 : 400,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {i + 1}本目 <span style={{ fontFamily: "monospace", marginLeft: 4 }}>{L}mm</span>
              </button>
            ))}
          </div>
        )}
        <div className="dm-svg-wrap">
          <svg ref={svgRef} id="drawingSvg" viewBox={viewBox} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          <button className="dm-print-btn" onClick={() => window.print()}>
            PDF保存 / 印刷{isMulti ? `（${safeIdx + 1}本目のみ）` : ""}
          </button>
          <span className="dm-note" style={{ margin: 0 }}>
            {isMulti
              ? "※ 各本の図面はタブで切替えてご確認ください。座金は自動配置です。"
              : "※ 座金の数量・位置・角度は今後のアップデートで設定可能になります（現在は自動配置のみ）"}
          </span>
        </div>
      </div>
    </div>
  )
}
