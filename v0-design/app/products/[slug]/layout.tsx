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

  // 階段手摺 Laurent（専用テンプレート・段数ベース見積計算機）
  if (slug === "laurent") {
    const title = "【工房直販】Laurent ローラン｜階段手摺 フラットバー9×38 マットブラック｜段数から即見積もり｜IRONWORKS ado"
    const description =
      "鍛冶職人が一本ずつ手仕上げする直線階段用アイアン手摺。フラットバー9×38の重厚な直線美と剛性。段数を入力するだけで価格がその場で分かります。¥75,000〜・横桟オプション・白仕上げ対応・全国配送。"
    const image = `${SITE_URL}/images/products/laurent/hero.jpg`
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
        images: [{ url: image, width: 1200, height: 1200, alt: "Laurent ローラン 階段手摺" }],
      },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    }
  }

  // Drawing 系商品（手すり）
  const product = getProductFull(slug)
  if (product) {
    const catalog = CATALOG_PRODUCTS.find((p) => p.href === `/products/${slug}`)
    const price = catalog?.price ?? 0
    // SEO 個別最適化フィールドがあれば優先採用（STORES 旧サイトと差別化したい商品向け）
    const title = product.seoTitle
      ?? `${product.nameEn} ${product.nameJaShort}｜${product.subtitle}｜IRONWORKS ado アイアン手すり`
    const description = product.seoDescription
      ?? `${product.shortDescription}。${priceText(price)}。鍛冶職人が一本ずつ手仕上げするアイアン手すり。サイズオーダー対応・全国配送。`
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
