"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { buildClemenceDrawingSvg, type ClemenceDrawingOpts } from "@/lib/drawing-modal/clemence-svg"

interface ClemenceDrawingModalProps {
  open: boolean
  onClose: () => void
  drawing: ClemenceDrawingOpts
}

/**
 * Clémence（L型手すり）の設計図モーダル。dm-overlay 方式で
 * そのまま印刷/PDF 保存できる（globals.css の @media print が dm-overlay を残す）。
 */
export function ClemenceDrawingModal({ open, onClose, drawing }: ClemenceDrawingModalProps) {
  const svgRef = useRef<SVGSVGElement>(null)

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
    buildClemenceDrawingSvg(svgRef.current, drawing)
  }, [open, drawing])

  if (!open) return null

  // globals.css の @media print は `body > *:not(.dm-overlay)...{display:none}` で
  // dm-overlay 以外の body 直下要素を消して印刷スコープを絞る。ClemenceSpecPanel
  // （= このモーダルの呼び出し元）は simple-product-page.tsx の <main> 配下に
  // ネストされているため、通常の JSX ツリーのままだと dm-overlay も <main> の内側になり
  // body の直接の子にならず、印刷時に <main> ごと非表示になってしまう。
  // Portal で document.body 直下に描画することで、ネスト位置によらず印刷スコープに入る。
  return createPortal(
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
        <div className="dm-title">設計図プレビュー ── Clémence クレマンス トイレ手すり</div>
        {/* A4 横・余白 8.5mm で印刷すると図面シート(280×193mm)が実寸で出力され、表題欄の尺度が実際に合う。
            商品ページには見積書PDF (.quote-pdf-root) が常時 DOM にあり、そのままだと図面と一緒に
            印刷されてしまう（縦向き用のため横向き用紙に流れて 4 ページになる・2026-09-28 蠣﨑さん指摘）。
            図面の印刷は図面 1 枚だけにする。 */}
        <style>{`
          @page { size: A4 landscape; margin: 8.5mm; }
          @media print {
            .quote-pdf-root { display: none !important; }
            /* 図面シート以外（タイトル・印刷ボタン行）は出さない。残すと余白ぶんだけ
               用紙からあふれ、空白の 2 ページ目が付く。 */
            .dm-overlay.open .dm-modal > *:not(.dm-svg-wrap) { display: none !important; }
            .dm-overlay.open .dm-svg-wrap { margin: 0 !important; }
          }
        `}</style>
        <div className="dm-svg-wrap">
          <svg ref={svgRef} id="clemenceDrawingSvg" className="cad-sheet" viewBox="0 0 1120 772" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          <button className="dm-print-btn" onClick={() => window.print()}>
            PDF保存 / 印刷
          </button>
          <span className="dm-note" style={{ margin: 0 }}>
            ※ 入力寸法から自動生成した目安の設計図です。A4横・倍率100%で印刷すると表題欄の尺度どおりに出力されます。
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
