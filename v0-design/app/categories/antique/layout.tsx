import type { Metadata } from "next"

const SITE_URL = "https://ado.tantetuzest.com"

export const metadata: Metadata = {
  title: "アンティーク・クラシック手すり｜鍛冶職人手打ちのロートアイアン手すり ¥18,000〜｜IRONWORKS ado",
  description:
    "本物のロートアイアン（鍛鉄）手すりを鍛冶職人が一本ずつ手打ちで製作。玄関・階段をおしゃれに飾るアンティーク・クラシック調の装飾手すり13種類を ¥18,000〜・工房直販。火造り鍛造・鎚目仕上げ・銀古美。全国オーダー対応。",
  keywords: [
    "アンティーク手すり",
    "玄関 手すり おしゃれ",
    "階段 手すり おしゃれ",
    "クラシック手すり",
    "ロートアイアン手すり",
    "鍛鉄 手すり",
    "アイアン手すり 装飾",
    "ロートアイアン 階段手すり",
    "アンティーク調 手すり",
    "オーダーメイド アイアン手すり",
    "鍛造 手すり 職人",
    "アートアイアン",
  ],
  alternates: { canonical: "/categories/antique" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/categories/antique`,
    siteName: "IRONWORKS ado",
    title: "アンティーク・クラシック手すり｜鍛冶職人手打ちのロートアイアン手すり",
    description:
      "本物のロートアイアン（鍛鉄）手すりを鍛冶職人が一本ずつ手打ち。装飾手すり13種類を ¥18,000〜。",
    locale: "ja_JP",
    images: [{ url: `${SITE_URL}/images/products/elisabeth/02.jpg`, width: 1200, height: 630, alt: "Élisabeth ロートアイアン手すり" }],
  },
}

export default function AntiqueCategoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
