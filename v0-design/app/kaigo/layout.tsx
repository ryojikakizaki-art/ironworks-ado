import type { Metadata } from "next"

const SITE_URL = "https://ado.tantetuzest.com"

export const metadata: Metadata = {
  title: "介護保険1割負担で本物の鍛鉄手すりを｜千葉市指定事業者 IRONWORKS ado",
  description:
    "千葉市の介護保険住宅改修費 受領委任払取扱事業者として登録済（2026年4月〜）。立替え不要・自己負担1割のみで、鍛冶職人が一本ずつ手打ちする鍛鉄手すりを取付け。ケアマネージャー・福祉用具事業者からのご紹介も承ります。",
  keywords: [
    "介護保険 手すり 千葉市",
    "受領委任払 千葉市 事業者",
    "アイアン手すり 介護保険",
    "鍛鉄 手すり 介護",
    "住宅改修費 受領委任払",
    "バリアフリー 鉄製 手すり おしゃれ",
  ],
  alternates: { canonical: "/kaigo" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/kaigo`,
    siteName: "IRONWORKS ado",
    title: "介護保険1割負担で本物の鍛鉄手すりを｜千葉市指定事業者 IRONWORKS ado",
    description:
      "千葉市の介護保険住宅改修費 受領委任払取扱事業者。立替え不要・自己負担1割のみで鍛鉄手すりを取付け。",
    locale: "ja_JP",
  },
}

export default function KaigoLayout({ children }: { children: React.ReactNode }) {
  return children
}
