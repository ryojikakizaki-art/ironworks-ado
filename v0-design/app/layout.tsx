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

export const metadata: Metadata = {
  title: 'IRONWORKS ado | 鍛冶職人が手掛けるアイアン手摺',
  description: '一本一本、鍛冶職人が心を込めて手作りするアイアン手摺。伝統の技と現代のデザインが融合した、唯一無二の手摺をお届けします。',
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
