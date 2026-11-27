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
//   - ただし広告に出している見積もり手すり（Élisabeth・Élan L）は、基本構成の梱包サイズを
//     蠣﨑さんに確認して送料を書く（2026-11-27）。送料欄が空だと Merchant Center の
//     アカウント共通の送料（関東など 8 都県だけ一律 ¥2,500）が当てられていたため。

import { getDrawingProduct } from "@/lib/drawing-modal/products"
import { getSimpleProduct } from "@/lib/products/simple"
import {
  calcClemenceShipping,
  getShippingRange,
  PREF_TO_REGION,
  SHIPPING_RATES,
  shippingSurcharge,
  type ProductType,
} from "./sagawa"

const TAX_RATE = 1.1

/**
 * 見積もり手すりのうち、広告に出す基本構成の送料が決まっているもの（2026-11-27 蠣﨑さん確認）。
 * - length: 横型手すりと同じ「長さ」の送料ルールで出す（Élisabeth L1000 → 1,000mm 以下の一律枠）
 * - bracket: L 型などの固定梱包で、サイズ区分を直接指定する（Élan L 縦1000×横1300 → 160 サイズ）
 */
const QUOTE_RAIL_SHIPPING: Record<string, { length: number } | { bracket: keyof typeof SHIPPING_RATES }> = {
  elisabeth: { length: 1000 },
  "elan-l": { bracket: 160 },
}

/**
 * 発送までの日数（営業日）。Merchant Center の共通設定（手すり標準＝約 10 営業日で発送）より
 * 長い商品だけ、商品ページの納期に合わせて書く。週は 5 営業日で換算する。
 */
const LISTING_HANDLING_DAYS: Record<string, { min: number; max: number }> = {
  elisabeth: { min: 20, max: 30 }, // 商品ページ「納期目安 4〜6 週間」
  "elan-l": { min: 15, max: 25 }, // 商品ページ「おおよそ 3〜5 週間でお届け」
}

/** 発送までの日数（営業日）。共通設定どおりの商品は null。 */
export function listingHandlingDays(slug: string): { min: number; max: number } | null {
  return LISTING_HANDLING_DAYS[slug] ?? null
}

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

  const quoteRail = QUOTE_RAIL_SHIPPING[slug]
  if (quoteRail) {
    if ("length" in quoteRail) {
      const range = getShippingRange([quoteRail.length], "yokogata")
      return range ? withTax(range.maxShipping) : null
    }
    // 沖縄は佐川の運賃表に無い（要問合せ）ため、表にある地域の最大額
    return withTax(Math.max(...Object.values(SHIPPING_RATES[quoteRail.bracket])) + shippingSurcharge())
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
