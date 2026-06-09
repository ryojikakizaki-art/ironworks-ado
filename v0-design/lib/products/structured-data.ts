// schema.org Product JSON-LD 生成
// 商品ページに埋め込み Google 検索のリッチカード化を狙う
import { CATALOG_PRODUCTS } from "./catalog"
import { CDN_BASE, getProductDisplay } from "./display"
import { getSimpleProduct } from "./simple"

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
  if (img.startsWith("/")) return `${SITE_URL}${img}`
  // 画像ID（拡張子あり/なし両対応）
  return `${CDN_BASE}/${img}/public`
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
    images = display.galleryIds.slice(0, 5).map(imgUrl)
    category = display.breadcrumbCategory
  } else if (simple) {
    name = `${simple.nameEn} ${simple.nameJa}`.trim()
    description = simple.longDescription.split("\n\n")[0]
    images = simple.images.slice(0, 5).map(imgUrl)
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

  // 価格が確定している商品だけ offers を付与する。
  // price 0 = 要見積もり（オーダーメイド）の商品で offers を出すと、
  // price 欠落により「商品スニペット / 販売者のリスティング」が無効判定になる。
  // offers 無しの Product は schema.org 的に正常（価格リッチリザルトの対象外になるだけ）。
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
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "JPY",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "JP",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 7,
            maxValue: 14,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "JP",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
    }
  }

  return product
}
