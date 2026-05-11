import type { Metadata } from "next"

const SITE_URL = "https://ado.tantetuzest.com"

export const metadata: Metadata = {
  title: "シンプル手すり｜25φ STKM パイプの本物アイアン手すり ¥30,000〜｜IRONWORKS ado",
  description:
    "モダンでミニマル、直線基調のアイアン手すり。25φ STKM（機械構造用炭素鋼鋼管）パイプ材＋2液ウレタン塗装で、職人歴15年の鍛冶職人が一本ずつ手仕上げ。横型・縦型・フラットバーの定番12種を ¥30,000〜。全国オーダーサイズ対応。",
  keywords: [
    "シンプル手すり",
    "アイアン手すり おしゃれ",
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
      "モダン・ミニマル・直線基調の定番アイアン手すり12種。25φ STKM パイプ＋2液ウレタン塗装。¥30,000〜・全国オーダーサイズ対応。",
    locale: "ja_JP",
  },
}

export default function SimpleCategoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
