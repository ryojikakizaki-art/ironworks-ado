import type { Metadata } from "next"

const SITE_URL = "https://ado.tantetuzest.com"

export const metadata: Metadata = {
  title: "お問い合わせ｜アイアン手すりのサイズ相談・特注見積もり｜IRONWORKS ado",
  description:
    "アイアン手すりのサイズ相談・特注オーダー・施工見積もりはこちらから。千葉の鍛冶職人が直接ご対応します。図面なしでも概算お見積もり可能。LINE でもご相談を承ります。",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/contact`,
    siteName: "IRONWORKS ado",
    title: "お問い合わせ｜アイアン手すりのサイズ相談・特注見積もり｜IRONWORKS ado",
    description:
      "アイアン手すりのサイズ相談・特注オーダー・施工見積もりはこちらから。千葉の鍛冶職人が直接ご対応します。",
    locale: "ja_JP",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
