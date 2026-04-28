import type { MetadataRoute } from 'next'
import { listProductSlugs } from '@/lib/products/display'
import { SIMPLE_PRODUCT_SLUGS } from '@/lib/products/simple'

const SITE_URL = 'https://ado.tantetuzest.com'

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/greeting', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/news', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/reviews', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'yearly' },
  { path: '/paint', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/galvanizing', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/tokushoho', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  const productSlugs = Array.from(new Set([...listProductSlugs(), ...SIMPLE_PRODUCT_SLUGS]))

  const productEntries: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${SITE_URL}/products/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticEntries, ...productEntries]
}
