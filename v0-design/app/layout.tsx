import type { Metadata, Viewport } from 'next'
import { Noto_Serif_JP, Inter, Zen_Maru_Gothic, Zen_Kaku_Gothic_New } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { IntroSplash } from '@/components/intro-splash'
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

// 介護ページなど「やわらかい印象」が必要な文脈で使う丸ゴシック系（feedback_kaigo_page_design 参照）
const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-rounded",
});

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-rounded-body",
});

// 制作中のためデフォルトで検索エンジンに非表示
// 本番公開時に Vercel 環境変数 SITE_INDEXABLE=true を設定する
const isIndexable = process.env.SITE_INDEXABLE === 'true'

const SITE_URL = 'https://ado.tantetuzest.com'
const SITE_TITLE = 'IRONWORKS ado｜鍛冶職人が一本ずつ手作りするアイアン手すり'
const SITE_DESCRIPTION = '鍛冶職人が一本ずつ手作りするアイアン手すり。横型・縦型・ロートアイアン手すりを 22 商品ラインナップ。¥18,000〜、サイズオーダー対応、全国配送。アプローチ・フェンス・面格子・アイアンドアもオーダー可能。'
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

// iOS の notch・ホームバー領域までコンテンツを伸ばす（safe-area-inset で
// ヘッダー / splash / カテゴリードックを安全領域に揃える前提）
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  generator: 'v0.app',
  alternates: {
    canonical: '/',
  },
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
        alt: 'IRONWORKS ado — 鍛冶職人が一本ずつ手作りするアイアン手すり',
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

  // gtag-init は head に inline で埋め込むことで、ブラウザが HTML をパースした
  // 直後（hydration / useEffect より前）に config が発火し、dataLayer 順序問題で
  // CV イベントが取りこぼされるのを防ぐ。
  const gtagInit = gtagSrc
    ? `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${GA_ID ? `gtag('config', '${GA_ID}');` : ''}
${ADS_ID ? `gtag('config', '${ADS_ID}');` : ''}`
    : null

  return (
    <html
      lang="ja"
      className={`${notoSerifJP.variable} ${inter.variable} ${zenMaruGothic.variable} ${zenKakuGothicNew.variable} bg-background`}
      // 意図的に head inline script で data-splash-skip 属性を立てているため、
      // hydration mismatch 警告を抑止する (FOUC 防止のための想定動作)
      suppressHydrationWarning
    >
      <head>
        {/* Splash FOUC 防止: SSR で <body> 直下に黒オーバーレイ <div id="pre-splash">
            を必ずレンダリングしておき、初期ペイントの瞬間からトップ画像を覆う。
            head の inline script が sessionStorage で「既に見た」と判定したら
            その場で <html data-splash-skip="1"> を立て、CSS で pre-splash を display:none に。
            React がマウントして IntroSplash に切り替わったタイミングで pre-splash を
            消去する（intro-splash.tsx の useEffect 内）。 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname;if(p!=='/'&&p!==''){document.documentElement.setAttribute('data-splash-skip','1');return}var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];if(n&&n.type==='reload'){try{sessionStorage.removeItem('ado-intro-seen')}catch(e){}}var s=false;try{s=sessionStorage.getItem('ado-intro-seen')==='1'}catch(e){}if(s){document.documentElement.setAttribute('data-splash-skip','1')}}catch(e){}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `#pre-splash{position:fixed;inset:0;background:#000;z-index:9998;pointer-events:none}html[data-splash-skip="1"] #pre-splash{display:none}`,
          }}
        />
        <script
          type="application/ld+json"
          // 構造化データは静的なので JSON.stringify を直接埋め込み (XSS 対策不要なノード構成)
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        {gtagInit && (
          <script id="gtag-init" dangerouslySetInnerHTML={{ __html: gtagInit }} />
        )}
        {gtagSrc && <script async src={gtagSrc} />}
      </head>
      <body className="font-sans antialiased">
        {/* SSR でレンダリングする pre-splash オーバーレイ（FOUC 防止）。
            head の inline script が「既読」と判定した場合のみ data-splash-skip="1" が立ち
            CSS で display:none になる。React の IntroSplash がマウントしたら useEffect で
            この要素自体を削除して、splash アニメーションに引き継ぐ。 */}
        <div id="pre-splash" aria-hidden="true" />
        <IntroSplash />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
