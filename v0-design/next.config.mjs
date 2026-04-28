import { fileURLToPath } from "url"
import { dirname } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "imagedelivery.net" },
      { protocol: "https", hostname: "ironworks-ado.stores.jp" },
    ],
  },
  // 旧 HTML サイト (repo ルートの index.html / item/*.html 等) から
  // 新 Next.js ルートへの 301 リダイレクト。
  // Google 等に既存インデックスがある可能性があるため SEO 引継ぎ目的で設定。
  async redirects() {
    return [
      // ルート HTML ページ
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/paint.html", destination: "/paint", permanent: true },
      { source: "/galvanizing.html", destination: "/galvanizing", permanent: true },
      { source: "/greeting.html", destination: "/greeting", permanent: true },
      { source: "/thanks.html", destination: "/thanks", permanent: true },
      { source: "/success.html", destination: "/thanks", permanent: true },

      // v0-design に相当ページが未整備のもの
      { source: "/blog.html", destination: "/", permanent: true },
      { source: "/marie.html", destination: "/#lineup", permanent: true },
      { source: "/category.html", destination: "/products", permanent: true },
      { source: "/item.html", destination: "/products", permanent: true },
      { source: "/checkout.html", destination: "/#lineup", permanent: true },

      // 商品一覧 (旧)
      { source: "/item/index.html", destination: "/products", permanent: true },

      // 商品詳細ページ (v0-design に移植済)
      { source: "/item/rene.html", destination: "/products/rene", permanent: true },
      { source: "/item/claire.html", destination: "/products/claire", permanent: true },
      { source: "/item/marcel.html", destination: "/products/marcel", permanent: true },
      { source: "/item/emile.html", destination: "/products/emile", permanent: true },
      { source: "/item/claude.html", destination: "/products/claude", permanent: true },
      { source: "/item/catherine.html", destination: "/products/catherine", permanent: true },
      { source: "/item/alexandre.html", destination: "/products/alexandre", permanent: true },
      { source: "/item/antoine.html", destination: "/products/antoine", permanent: true },
      { source: "/item/scroll16.html", destination: "/products/scroll16", permanent: true },
      { source: "/item/scroll19.html", destination: "/products/scroll19", permanent: true },
      { source: "/item/scroll22.html", destination: "/products/scroll22", permanent: true },
      { source: "/item/fabrice.html", destination: "/products/fabrice", permanent: true },
      { source: "/item/tsuchime.html", destination: "/products/tsuchime", permanent: true },

      // 旧 STORES 外部リンクだった商品 → 新規内部詳細ページへ
      { source: "/item/elisabeth.html", destination: "/products/elisabeth", permanent: true },
      { source: "/item/clemence.html", destination: "/products/clemence", permanent: true },

      // 旧デモ・開発用ページ
      { source: "/item/zakin-angle.html", destination: "/#lineup", permanent: true },
    ]
  },
}

export default nextConfig
