// 広告フィード（/merchant-feed.xml）と構造化データ（Product JSON-LD）に載せる送料。
//
// なぜ必要か:
//   以前はフィード・構造化データとも全商品「送料 0 円」と書いていた（2026-04 の初期実装）。
//   実際は佐川急便の送料が別途かかるため、ショッピング広告に「送料無料」と出て、
//   着地後に送料が足される食い違いになっていた（2026-11-11 判明）。
//
// 考え方:
//   - 広告・検索結果に出る価格は「基本の長さ」の価格（例: Alexandre 1m ¥32,000）。
//     送料もその基本構成で買ったときの額を、商品ページと同じ calcShipping で出す。
//     レート表・計算式は sagawa.ts の一か所だけを使い、ここでは複製しない。
//   - 地域で送料が変わる商品（横型 1.5m・Antoine・Clémence 等）は、全国で最も高い地域の額を出す。
//     都道府県ごとの書き分け（g:region）は日本向けの書式が公式に例示されておらず、
//     誤ると商品ごと不承認になるため採用していない。実際より安く見せないことを優先する。
//   - 金額は税込（商品ページの「送料込み目安」と同じく 送料 × 1.1 を四捨五入）。
//   - 送料が見積もり時に決まる商品（大型品・階段など）は null を返す。

import { getDrawingProduct } from "@/lib/drawing-modal/products"
import { getSimpleProduct } from "@/lib/products/simple"
import { calcClemenceShipping, getShippingRange, PREF_TO_REGION, type ProductType } from "./sagawa"

const TAX_RATE = 1.1

function withTax(yen: number): number {
  return Math.round(yen * TAX_RATE)
}

/**
 * 基本構成で購入したときの送料（税込・円）。全国で最も高い地域の額。
 * 送料が見積もり時に決まる商品は null。
 */
export function listingShippingYen(slug: string): number | null {
  const simple = getSimpleProduct(slug)
  if (simple?.shippingIncluded) return 0

  if (slug === "clemence") {
    // Clémence は L 型固定梱包で 160 サイズ（延長なしの基本構成）。沖縄は要問合せのため除く。
    let max = 0
    for (const pref of Object.keys(PREF_TO_REGION)) {
      const r = calcClemenceShipping(pref, 0)
      if (!r.inquiry) max = Math.max(max, r.shipping)
    }
    return max > 0 ? withTax(max) : null
  }

  // 計算機つきの手すり: 商品ページと同じ区分・基本長さで計算する
  const drawing = getDrawingProduct(slug)
  if (drawing) {
    const productType: ProductType =
      drawing.category === "horizontal" ? "yokogata"
      : drawing.category === "vertical" ? "tategata"
      : "fixed"
    const range = getShippingRange([drawing.stdLengthMm], productType)
    return range ? withTax(range.maxShipping) : null
  }

  return null
}
