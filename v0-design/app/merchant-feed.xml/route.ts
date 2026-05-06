import { CATALOG_PRODUCTS } from "@/lib/products/catalog"
import { CDN_BASE, getProductDisplay } from "@/lib/products/display"
import { SIMPLE_PRODUCTS, getSimpleProduct } from "@/lib/products/simple"

export const dynamic = "force-static"
export const revalidate = 86400

const SITE_URL = "https://ado.tantetuzest.com"
const SHOP_NAME = "IRONWORKS ado"
const SHOP_DESCRIPTION = "鍛冶職人が一本一本手作りするアイアン手すり・建材・家具"

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function imageUrl(imgId: string): string {
  // ローカルパス（既に拡張子付き）はそのまま絶対URL化
  if (imgId.startsWith("/")) return `${SITE_URL}${imgId}`
  // CDN: 拡張子なしの bare ID には .jpg を付与する
  // （Cloudflare Images の URL は ID に拡張子が含まれていないと 404 を返し、
  //   Google Merchant 側で「サポートされていない画像形式」エラーになる）
  const id = imgId.includes(".") ? imgId : `${imgId}.jpg`
  return `${CDN_BASE}/${id}/public`
}

function catalogFeedTitle(p: { cat: string; label: string; name: string; sub: string }): string {
  const isHandrail = p.cat === "handrail_h" || p.cat === "handrail_v"
  const cleanLabel = p.label.replace(/\s*・\s*/g, " ").trim()
  const prefix = isHandrail ? `アイアン手すり ${cleanLabel}` : cleanLabel
  return `${prefix} ${p.name} ${p.sub}`.trim()
}

function productDescription(slug: string, fallback: string): string {
  const full = getProductDisplay(slug)
  if (full?.longDescription) {
    const firstParagraph = full.longDescription.split("\n\n")[0]
    return firstParagraph.length > 50 ? firstParagraph : full.longDescription.slice(0, 4000)
  }
  const simple = getSimpleProduct(slug)
  if (simple?.longDescription) {
    const firstParagraph = simple.longDescription.split("\n\n")[0]
    return firstParagraph.length > 50 ? firstParagraph : simple.longDescription.slice(0, 4000)
  }
  return fallback
}

interface FeedItem {
  slug: string
  title: string
  description: string
  href: string
  image: string
  price: number
  productType: string
}

function buildItem(item: FeedItem): string {
  return [
    "    <item>",
    `      <g:id>${escapeXml(item.slug)}</g:id>`,
    `      <g:title>${escapeXml(item.title)}</g:title>`,
    `      <g:description>${escapeXml(item.description)}</g:description>`,
    `      <g:link>${SITE_URL}${item.href}</g:link>`,
    `      <g:image_link>${escapeXml(imageUrl(item.image))}</g:image_link>`,
    `      <g:availability>in_stock</g:availability>`,
    `      <g:price>${item.price} JPY</g:price>`,
    `      <g:condition>new</g:condition>`,
    `      <g:brand>${escapeXml(SHOP_NAME)}</g:brand>`,
    `      <g:identifier_exists>false</g:identifier_exists>`,
    `      <g:product_type>${escapeXml(item.productType)}</g:product_type>`,
    `      <g:custom_label_0>ado</g:custom_label_0>`,
    `      <g:shipping><g:country>JP</g:country><g:service>佐川急便</g:service><g:price>0 JPY</g:price></g:shipping>`,
    "    </item>",
  ].join("\n")
}

export async function GET() {
  const collected: FeedItem[] = []
  const seen = new Set<string>()

  for (const p of CATALOG_PRODUCTS) {
    if (p.price <= 0) continue
    if (!p.href.startsWith("/products/")) continue
    const slug = p.href.replace("/products/", "")
    seen.add(slug)
    collected.push({
      slug,
      title: catalogFeedTitle(p),
      description: productDescription(slug, `${p.label} ${p.sub}`),
      href: p.href,
      image: p.img,
      price: p.price,
      productType: p.label,
    })
  }

  for (const p of Object.values(SIMPLE_PRODUCTS)) {
    if (seen.has(p.slug)) continue
    if (p.basePrice <= 0) continue
    if (!p.images || p.images.length === 0) continue
    collected.push({
      slug: p.slug,
      title: `${p.category} ${p.nameEn} ${p.nameJa} ${p.subtitle}`.trim(),
      description: productDescription(p.slug, p.shortDescription),
      href: `/products/${p.slug}`,
      image: p.images[0],
      price: p.basePrice,
      productType: p.category,
    })
  }

  const items = collected.map(buildItem)

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">',
    "  <channel>",
    `    <title>${escapeXml(SHOP_NAME)}</title>`,
    `    <link>${SITE_URL}</link>`,
    `    <description>${escapeXml(SHOP_DESCRIPTION)}</description>`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n")

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
