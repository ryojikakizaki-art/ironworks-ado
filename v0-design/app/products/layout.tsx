import type { Metadata } from "next"

const SITE_URL = "https://ado.tantetuzest.com"

export const metadata: Metadata = {
  title: "アイアン手すり 商品一覧｜横型・縦型・ロートアイアン｜IRONWORKS ado",
  description:
    "鍛冶職人が一本ずつ手作りするアイアン手すりを横型・縦型・ロートアイアンの 22 商品ラインナップでお届け。¥18,000〜、サイズオーダー対応、全国配送。アプローチ・フェンス・面格子・アイアンドアもオーダー可能。",
  alternates: { canonical: "/products" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/products`,
    siteName: "IRONWORKS ado",
    title: "アイアン手すり 商品一覧｜横型・縦型・ロートアイアン｜IRONWORKS ado",
    description:
      "鍛冶職人が一本ずつ手作りするアイアン手すりを横型・縦型・ロートアイアンの 22 商品ラインナップでお届け。",
    locale: "ja_JP",
  },
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
