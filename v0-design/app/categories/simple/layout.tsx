import type { Metadata } from "next"

const SITE_URL = "https://ado.tantetuzest.com"

export const metadata: Metadata = {
  title: "シンプル手すり｜25φ STKM パイプの本物アイアン手すり ¥30,000〜｜IRONWORKS ado",
  description:
    "モダンでミニマル、直線基調のアイアン手すり。玄関・階段・屋外をおしゃれに整える 25φ STKM パイプ材＋2液ウレタン塗装、鍛冶職人の手仕上げ。横型・縦型・フラットバーの定番13種を ¥30,000〜・工房直販。全国オーダーサイズ対応。",
  keywords: [
    "シンプル手すり",
    "アイアン手すり おしゃれ",
    "玄関 手すり おしゃれ",
    "階段 手すり おしゃれ",
    "モダン 手すり",
    "アイアン手すり 縦型",
    "アイアン手すり 横型",
    "アイアン手すり 25φ",
    "STKM 手すり",
    "アイアン手すり マットブラック",
    "アイアン手すり マットホワイト",
    "オーダーメイド アイアン手すり",
  ],
  alternates: { canonical: "/categories/simple" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/categories/simple`,
    siteName: "IRONWORKS ado",
    title: "シンプル手すり｜25φ STKM パイプの本物アイアン手すり",
    description:
      "モダン・ミニマル・直線基調の定番アイアン手すり13種。25φ STKM パイプ＋2液ウレタン塗装。¥30,000〜・全国オーダーサイズ対応。",
    locale: "ja_JP",
  },
}

export default function SimpleCategoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
