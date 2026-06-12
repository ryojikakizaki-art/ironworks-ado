import type { Metadata } from "next"

const SITE_URL = "https://ado.tantetuzest.com"

export const metadata: Metadata = {
  title: "よくあるご質問｜アイアン手すりの納期・強度・取り付け｜IRONWORKS ado",
  description:
    "アイアン手すりの納期、取り付け強度、ご自身での取り付け可否、オーダーメイドや図面なしでのご注文、屋外使用・メンテナンス方法など、よくいただくご質問に鍛冶職人がお答えします。",
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/faq`,
    siteName: "IRONWORKS ado",
    title: "よくあるご質問｜アイアン手すりの納期・強度・取り付け｜IRONWORKS ado",
    description:
      "アイアン手すりの納期、取り付け強度、オーダーメイド、屋外使用・メンテナンスなど、よくいただくご質問にお答えします。",
    locale: "ja_JP",
  },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
