import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '鍛鉄工房 ZEST ｜ 蠣﨑良治',
  description:
    '千葉・若葉区の鍛鉄工房 ZEST。鍛冶師・蠣﨑良治が、西洋で発展した鍛鉄［Wrought iron］の手仕事で、住まいに据える一点ものを制作しています。',
  metadataBase: new URL('https://tantetuzest.com'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: '鍛鉄工房 ZEST',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
