import type { Metadata } from 'next'
import { Noto_Serif_JP, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const ADS_ID = process.env.NEXT_PUBLIC_ADS_ID

const notoSerifJP = Noto_Serif_JP({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif-jp"
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

// 制作中のためデフォルトで検索エンジンに非表示
// 本番公開時に Vercel 環境変数 SITE_INDEXABLE=true を設定する
const isIndexable = process.env.SITE_INDEXABLE === 'true'

const SITE_URL = 'https://ado.tantetuzest.com'
const SITE_TITLE = 'IRONWORKS ado | 鍛冶職人が手掛けるアイアン手摺'
const SITE_DESCRIPTION = '一本一本、鍛冶職人が心を込めて手作りするアイアン手摺。伝統の技と現代のデザインが融合した、唯一無二の手摺をお届けします。'
const OG_IMAGE = `${SITE_URL}/images/hero/loft-staircase.jpg`

// schema.org 構造化データ — Organization / LocalBusiness / WebSite を1ノードグラフで宣言
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'IRONWORKS ado',
      alternateName: ['アイアンワークス・アド', '鍛鉄工房ZEST'],
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-light-32x32.png`,
      },
      sameAs: [],
      founder: {
        '@type': 'Person',
        name: '蠣﨑 良治',
        jobTitle: '鍛鉄職人',
      },
      foundingDate: '2011',
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#localbusiness`,
      name: 'IRONWORKS ado',
      image: OG_IMAGE,
      url: SITE_URL,
      telephone: '+81-70-3817-0659',
      email: 'ado@tantetuzest.com',
      priceRange: '¥¥',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '若葉区和泉町239-2',
        addressLocality: '千葉市',
        addressRegion: '千葉県',
        postalCode: '265-0052',
        addressCountry: 'JP',
      },
      areaServed: { '@type': 'Country', name: '日本' },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
      ],
      parentOrganization: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      inLanguage: 'ja',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  generator: 'v0.app',
  robots: isIndexable
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        noarchive: true,
        nosnippet: true,
        noimageindex: true,
        googleBot: { index: false, follow: false, noimageindex: true },
      },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'IRONWORKS ado',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: 'ja_JP',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'IRONWORKS ado — 鍛冶職人が手掛けるアイアン手摺',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gtagSrc = GA_ID
    ? `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    : ADS_ID
    ? `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`
    : null

  return (
    <html lang="ja" className={`${notoSerifJP.variable} ${inter.variable} bg-background`}>
      <head>
        <script
          type="application/ld+json"
          // 構造化データは静的なので JSON.stringify を直接埋め込み (XSS 対策不要なノード構成)
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {gtagSrc && (
          <>
            <Script src={gtagSrc} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                ${GA_ID ? `gtag('config', '${GA_ID}');` : ''}
                ${ADS_ID ? `gtag('config', '${ADS_ID}');` : ''}
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
