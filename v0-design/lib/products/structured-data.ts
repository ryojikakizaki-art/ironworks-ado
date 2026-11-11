// schema.org Product JSON-LD 生成
// 商品ページに埋め込み Google 検索のリッチカード化を狙う
import { CATALOG_PRODUCTS } from "./catalog"
import { galleryUrl, getProductDisplay } from "./display"
import { getSimpleProduct } from "./simple"
import { listingShippingYen } from "@/lib/shipping/listing-shipping"
// 手すり（オーダー品）の基準価格の単一正本。basePrice = 標準長以下の一律価格 = 価格フロア。
// これを AggregateOffer.lowPrice（「◯◯円〜」）に使い、リッチリザルト対象を維持する。
// （価格ロジックの複製は PR #347 の事故元なので必ずこの 1 箇所を参照する）
import { PRODUCTS as ORDER_PRODUCTS } from "./order-pricing"

const SITE_URL = "https://ado.tantetuzest.com"
const BRAND = "IRONWORKS ado"

// Offer.priceValidUntil 用。Google は将来日付を推奨（無いと「価格情報が古い」警告が出る）。
// この関数は client component の描画中に走るため、"now" の時刻そのものを使うと
// SSR と hydration で文字列がズレてハイドレーションミスマッチになりうる。
// 「翌年の年末」固定にして 1 年に一度しか変わらないようにし、常に未来日付を保証する。
function priceValidUntil(): string {
  return `${new Date().getFullYear() + 1}-12-31`
}

function imgUrl(img: string): string {
  // galleryUrl が返すのはサイト内パス（画像ID・"/" 始まりの両対応）。JSON-LD には絶対 URL が要る
  return `${SITE_URL}${galleryUrl(img)}`
}

export function getProductStructuredData(slug: string): Record<string, unknown> | null {
  const display = getProductDisplay(slug)
  const simple = getSimpleProduct(slug)
  const catalog = CATALOG_PRODUCTS.find((p) => p.href === `/products/${slug}`)

  if (!display && !simple && !catalog) return null

  let name = ""
  let description = ""
  let images: string[] = []
  let price = 0
  let category = ""

  if (display) {
    name = `${display.nameEn} ${display.nameJaShort}`.trim()
    description = display.longDescription.split("\n\n")[0]
    images = display.galleryIds.slice(0, 10).map(imgUrl)
    category = display.breadcrumbCategory
  } else if (simple) {
    name = `${simple.nameEn} ${simple.nameJa}`.trim()
    description = simple.longDescription.split("\n\n")[0]
    images = simple.images.slice(0, 10).map(imgUrl)
    price = simple.basePrice
    category = simple.category
  }

  if (catalog) {
    if (!price) price = catalog.price
    if (!description) description = `${catalog.label} - ${catalog.sub}`
    if (images.length === 0) images = [imgUrl(catalog.img)]
    if (!name) name = catalog.name
    if (!category) category = catalog.label
  }

  // 価格フロア（手すりは長さ可変で exact price を出せないため「◯◯円〜」を使う）。
  // price（定価）が無い slug について order-pricing の basePrice を参照する。
  const floorPrice = price > 0 ? 0 : ORDER_PRODUCTS[slug]?.basePrice ?? 0

  // offers / review / aggregateRating のいずれも付けられない Product は
  // Google 商品スニペットで「重大な問題」（検索のリッチ結果から除外）になる。
  // 価格情報が一切無い商品は無効な Product を出さず、構造化データ自体を省く。
  if (price === 0 && floorPrice === 0) return null

  const productUrl = `${SITE_URL}/products/${slug}`

  const product: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name,
    description,
    image: images,
    sku: slug,
    category,
    brand: {
      "@type": "Brand",
      name: BRAND,
    },
  }

  // 送料（税込・全国で最も高い地域の額）。以前は全商品「送料 0 円・発送 0〜1 日」と書いていたが
  // 実態と違うため、送料が決まっている商品だけ書く。見積もりで決まる商品は省く（任意項目）。
  // 発送までの日数は商品ごとに異なる（手すり 10 営業日・家具 6〜8 週間）ため書かない。
  const shippingYen = listingShippingYen(slug)
  const shippingDetails =
    shippingYen === null
      ? undefined
      : {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: String(shippingYen), currency: "JPY" },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "JP" },
        }

  // 価格が確定している商品は exact price の Offer を付与する。
  if (price > 0) {
    product.offers = {
      "@type": "Offer",
      priceCurrency: "JPY",
      price: String(price),
      priceValidUntil: priceValidUntil(),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: BRAND,
      },
      ...(shippingDetails ? { shippingDetails } : {}),
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "JP",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
    }
  } else {
    // 手すり（長さ・装飾で価格可変）は基準価格を下限とする AggregateOffer。
    // lowPrice で「◯◯円〜」を表し、offers 必須要件を満たしてリッチリザルト対象を維持する。
    product.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "JPY",
      lowPrice: String(floorPrice),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: BRAND,
      },
    }
  }

  return product
}
