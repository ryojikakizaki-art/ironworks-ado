"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { buildRoundRailDrawingSvg } from "@/lib/drawing-modal/rene-svg"
import { buildVerticalRailDrawingSvg } from "@/lib/drawing-modal/vertical-svg"
import { buildVerticalCadDrawingSvg } from "@/lib/drawing-modal/vertical-cad-svg"
import { calcZakin, getZakinPositions } from "@/lib/drawing-modal/rene-constants"
import { getDrawingProduct, type WasherTypeId } from "@/lib/drawing-modal/products"

// 受注ごとの制作図スタンドアロンページ。決済 webhook から送られる工房宛メールの
// リンク先。URL クエリ（商品・長さ・座金位置・座金タイプ・角度）だけで、商品ページの
// 制作図モーダルと同じビルダーを使って図面を再現する。蠣﨑さんはブラウザで開いて
// 「PDF保存 / 印刷」できる。
export interface SeizuDrawingProps {
  product: string
  /** CSV。複数本注文なら複数値 */
  lengths: string
  /** CSV。単品注文時のみ。お客様が指定した座金位置 */
  positions: string
  washer: string
  angle: string
  dir: string
  order: string
}

function parseCsvNumbers(csv: string): number[] {
  return csv
    .split(",")
    .map((s) => Math.round(Number(s.trim())))
    .filter((n) => Number.isFinite(n) && n > 0)
}

export function SeizuDrawing(props: SeizuDrawingProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const product = getDrawingProduct(props.product)

  const lengthsArr = useMemo(() => parseCsvNumbers(props.lengths), [props.lengths])
  // positions クエリが無い注文（座金カスタム指定なし）は null を返し、
  // 描画側で長さに応じた自動配置にフォールバックさせる。
  // 空文字列を split すると [""] → [0] になり「座金1点」と誤描画されるため、
  // 明示的に空判定し、座金位置は 0 より大きい値だけ採用する。
  const customPositions = useMemo(() => {
    if (!props.positions.trim()) return null
    const arr = parseCsvNumbers(props.positions)
    return arr.length ? arr : null
  }, [props.positions])

  const washerType: WasherTypeId =
    props.washer.toUpperCase() === "B"
      ? "B"
      : props.washer.toUpperCase() === "A"
      ? "A"
      : product?.washerSpec?.id ?? "A"
  const angleDeg = Math.max(0, Math.min(60, Math.round(Number(props.angle) || 0)))
  const angleDir: "left" | "right" = props.dir === "right" ? "right" : "left"

  const isMulti = lengthsArr.length > 1
  const [idx, setIdx] = useState(0)
  const safeIdx = Math.min(idx, Math.max(0, lengthsArr.length - 1))
  const currentLength = lengthsArr[safeIdx] ?? 0

  useEffect(() => {
    if (!svgRef.current || !product || !currentLength) return
    const rule = product.zakinRule
    // 多本注文は本ごとに長さが違うため座金は自動配置。単品はお客様指定の位置を使う。
    const positions = isMulti
      ? getZakinPositions(currentLength, calcZakin(currentLength, rule), rule)
      : customPositions ?? getZakinPositions(currentLength, calcZakin(currentLength, rule), rule)

    if (product.category === "vertical") {
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
  }, [product, currentLength, isMulti, customPositions, washerType, angleDeg, angleDir])

  if (!product || !lengthsArr.length) {
    return (
      <div className="seizu-root">
        <style>{SEIZU_CSS}</style>
        <div className="seizu-error">
          制作図を表示できませんでした。<br />
          メールのリンクをそのまま開いているかご確認ください。
        </div>
      </div>
    )
  }

  // CAD 精密図はビルダー側で viewBox を上書きするため初期値はプレースホルダ。
  const viewBox =
    product.category === "vertical"
      ? product.washerSpec && product.titleBlock
        ? "-1200 -835 2020 1790"
        : "0 0 500 130"
      : "0 0 840 400"

  return (
    <div className="seizu-root">
      <style>{SEIZU_CSS}</style>

      <header className="seizu-chrome seizu-head">
        <div>
          <div className="seizu-eyebrow">IRONWORKS ado — 制作図</div>
          <h1 className="seizu-title">{product.nameJa}</h1>
          <div className="seizu-meta">
            図番 {product.drawingCode}
            {" ／ "}
            {isMulti ? `${lengthsArr.length}本（複数長さ）` : `全長 ${currentLength}mm`}
            {props.order ? (
              <>
                {" ／ "}
                <span className="seizu-order">注文 {props.order}</span>
              </>
            ) : null}
          </div>
        </div>
        <button className="seizu-print" onClick={() => window.print()}>
          PDF保存 / 印刷{isMulti ? `（${safeIdx + 1}本目）` : ""}
        </button>
      </header>

      {isMulti && (
        <div className="seizu-chrome seizu-tabs">
          {lengthsArr.map((L, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={i === safeIdx ? "on" : ""}
            >
              {i + 1}本目 <span className="seizu-tab-mm">{L}mm</span>
            </button>
          ))}
        </div>
      )}

      <div className="seizu-sheet">
        <svg ref={svgRef} viewBox={viewBox} />
      </div>

      <p className="seizu-chrome seizu-note">
        {isMulti
          ? "※ 複数本のご注文です。各本の制作図はタブで切替えてご確認ください（座金は長さに応じて自動配置）。印刷は表示中の1本ぶんです。"
          : "※ 座金の本数・位置はご注文時の設定で作図しています。"}
      </p>
    </div>
  )
}

const SEIZU_CSS = `
.seizu-root {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 20px 56px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #222;
}
.seizu-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.seizu-eyebrow {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #999;
}
.seizu-title {
  font-size: 21px;
  font-weight: 600;
  margin: 5px 0 7px;
}
.seizu-meta { font-size: 12px; color: #666; line-height: 1.7; }
.seizu-order { font-family: monospace; color: #888; }
.seizu-print {
  padding: 11px 24px;
  background: #333;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 0.08em;
  white-space: nowrap;
}
.seizu-print:hover { background: #555; }
.seizu-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.seizu-tabs button {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  color: #444;
  font-size: 13px;
  cursor: pointer;
}
.seizu-tabs button.on {
  border: 2px solid #c8a96e;
  color: #9a8049;
  font-weight: 600;
  background: rgba(200, 169, 110, 0.06);
}
.seizu-tab-mm { font-family: monospace; margin-left: 4px; }
.seizu-sheet { border: 1px solid #e0e0e0; background: #fff; }
.seizu-sheet svg { width: 100%; height: auto; display: block; }
.seizu-note { font-size: 11px; color: #999; margin-top: 10px; line-height: 1.7; }
.seizu-error {
  max-width: 560px;
  margin: 88px auto;
  text-align: center;
  color: #666;
  font-size: 14px;
  line-height: 1.9;
}
@media print {
  .seizu-chrome { display: none !important; }
  .seizu-root { max-width: none; margin: 0; padding: 0; }
  .seizu-sheet { border: none; }
  @page { margin: 8mm; }
}
`
