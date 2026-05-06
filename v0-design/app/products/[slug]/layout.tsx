import type { Metadata } from "next"
import { getProductFull, galleryUrl } from "@/lib/products/display"
import { getSimpleProduct } from "@/lib/products/simple"
import { CATALOG_PRODUCTS } from "@/lib/products/catalog"

const SITE_URL = "https://ado.tantetuzest.com"

interface Props {
  params: Promise<{ slug: string }>
}

function priceText(price: number): string {
  if (price > 0) return `¥${price.toLocaleString()}〜`
  return "オーダーメイドお見積もり"
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const canonical = `/products/${slug}`

  // Simple 商品（手すり以外 + Élisabeth/Clémence 等）
  const simple = getSimpleProduct(slug)
  if (simple) {
    const title = `${simple.nameEn} ${simple.nameJa}｜${simple.category} ${simple.subtitle}｜IRONWORKS ado アイアン手すり`
    const description = `${simple.shortDescription}。${priceText(simple.basePrice)}。鍛冶職人が一本ずつ手作業で仕上げる本物のアイアン手すり・アイアン製品。サイズオーダー・全国配送対応。`
    const image = simple.images[0] ? galleryUrl(simple.images[0]) : undefined
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: `${SITE_URL}${canonical}`,
        siteName: "IRONWORKS ado",
        title,
        description,
        locale: "ja_JP",
        images: image ? [{ url: image, width: 1200, height: 1200, alt: `${simple.nameEn} ${simple.nameJa}` }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : undefined,
      },
    }
  }

  // Drawing 系商品（手すり）
  const product = getProductFull(slug)
  if (product) {
    const catalog = CATALOG_PRODUCTS.find((p) => p.href === `/products/${slug}`)
    const price = catalog?.price ?? 0
    const title = `${product.nameEn} ${product.nameJaShort}｜${product.subtitle}｜IRONWORKS ado アイアン手すり`
    const description = `${product.shortDescription}。${priceText(price)}。鍛冶職人が一本ずつ手仕上げするアイアン手すり。サイズオーダー対応・全国配送。`
    const firstImage = product.galleryIds[0]
    const image = firstImage ? galleryUrl(firstImage) : undefined
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: `${SITE_URL}${canonical}`,
        siteName: "IRONWORKS ado",
        title,
        description,
        locale: "ja_JP",
        images: image ? [{ url: image, width: 1200, height: 1200, alt: `${product.nameEn} ${product.nameJaShort}` }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : undefined,
      },
    }
  }

  // 未登録 slug — 親 layout の metadata を継承
  return {
    title: "アイアン手すり｜IRONWORKS ado",
    alternates: { canonical },
  }
}

export default function ProductSlugLayout({ children }: { children: React.ReactNode }) {
  return children
}
