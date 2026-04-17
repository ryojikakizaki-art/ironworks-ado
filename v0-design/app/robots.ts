import type { MetadataRoute } from 'next'

// 制作中のためデフォルトで全クローラー拒否
// 本番公開時に Vercel 環境変数 SITE_INDEXABLE=true を設定する
export default function robots(): MetadataRoute.Robots {
  const isIndexable = process.env.SITE_INDEXABLE === 'true'

  if (isIndexable) {
    return {
      rules: [{ userAgent: '*', allow: '/' }],
      sitemap: 'https://ado.tantetuzest.com/sitemap.xml',
    }
  }

  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  }
}
