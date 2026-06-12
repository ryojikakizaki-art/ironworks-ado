import type { Metadata } from "next"

const SITE_URL = "https://ado.tantetuzest.com"

export const metadata: Metadata = {
  title: "業者様お取引窓口｜アイアン手すり 参考見積もり計算機｜IRONWORKS ado",
  description:
    "工務店・設計事務所・リフォーム会社様向けの専用窓口。アイアン手すりの参考見積もり計算機で概算金額がその場で分かります。銀行振込対応・図面のご相談可。鍛冶職人の自社工房から直接お届けします。",
  alternates: { canonical: "/trade" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/trade`,
    siteName: "IRONWORKS ado",
    title: "業者様お取引窓口｜アイアン手すり 参考見積もり計算機｜IRONWORKS ado",
    description:
      "工務店・設計事務所・リフォーム会社様向けの専用窓口。参考見積もり計算機で概算金額がその場で分かります。銀行振込対応。",
    locale: "ja_JP",
  },
}

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return children
}
