// schema.org Product JSON-LD 生成
// 商品ページに埋め込み Google 検索のリッチカード化を狙う
import { CATALOG_PRODUCTS } from "./catalog"
import { CDN_BASE, getProductDisplay } from "./display"
import { getSimpleProduct } from "./simple"

const SITE_URL = "https://ado.tantetuzest.com"
const BRAND = "IRONWORKS ado"

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

  const offers: Record<string, unknown> = {
    "@type": "Offer",
    priceCurrency: "JPY",
    availability: "https://schema.org/InStock",
    url: productUrl,
    seller: {
      "@type": "Organization",
      name: BRAND,
    },
  }

  if (price > 0) {
    offers.price = String(price)
  }

  return {
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
    offers,
  }
}
