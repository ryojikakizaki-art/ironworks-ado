import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "特定商取引法に基づく表記 | IRONWORKS ado",
  description: "IRONWORKS ado（鍛鉄工房ZEST）— 特定商取引法に基づく表記",
}

const rows: { label: string; value: React.ReactNode }[] = [
  { label: "販売業者", value: "鍛鉄工房ZEST（屋号）／IRONWORKS ado" },
  { label: "運営責任者", value: "蠣崎 良治" },
  { label: "所在地", value: "〒265-0052 千葉県千葉市若葉区和泉町239-2" },
  { label: "電話番号", value: "080-5424-2221（受付時間 9:00〜18:00／土日祝休）" },
  { label: "メールアドレス", value: "ado@tantetuzest.com" },
  {
    label: "適格請求書発行事業者登録番号",
    value: "T7810771171765",
  },
  {
    label: "販売価格",
    value: "各商品ページに記載（すべて税込表示）",
  },
  {
    label: "商品代金以外の必要料金",
    value: (
      <ul className="list-disc pl-5 space-y-1">
        <li>送料：お届け地域・サイズにより実費</li>
        <li>決済手数料：無料（当店負担）</li>
        <li>特急配送をご希望の場合は合計金額の20%を別途申し受けます</li>
      </ul>
    ),
  },
  {
    label: "お支払方法",
    value: (
      <ul className="list-disc pl-5 space-y-1">
        <li>クレジットカード決済（Visa / Mastercard / American Express / JCB / Diners）</li>
        <li>決済代行：Stripe, Inc.</li>
      </ul>
    ),
  },
  {
    label: "お支払時期",
    value: "ご注文確定時（クレジットカード会社の規約に準じます）",
  },
  {
    label: "商品の引渡時期",
    value: (
      <>
        受注制作のため、通常配送は入金確認後 約10営業日、特急配送は約5営業日で発送いたします。
        <br />
        大型品・特注品は別途ご案内いたします。
      </>
    ),
  },
  {
    label: "返品・交換について",
    value: (
      <>
        お客様ご都合による返品・交換は受注制作のためお受けできません。
        <br />
        商品に不良・破損がある場合は、商品到着後 7日以内にご連絡ください。当店負担にて新品と交換、または修理対応いたします。
      </>
    ),
  },
  {
    label: "キャンセルについて",
    value: (
      <>
        受注制作のため、制作開始後のキャンセルはお受けできません。
        <br />
        ご注文後 24時間以内にご連絡いただいた場合のみ、キャンセルを承ります。
      </>
    ),
  },
  {
    label: "不良品の取り扱い",
    value:
      "到着時に破損・不良が確認された場合は、お手数ですが商品到着後 7日以内に ado@tantetuzest.com までご連絡ください。",
  },
]

export default function TokushohoPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
              Legal
            </p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground">
              特定商取引法に基づく表記
            </h1>
          </div>
        </div>

        <div className="max-w-[960px] mx-auto px-4 lg:px-8 py-16">
          <dl className="divide-y divide-border">
            {rows.map((r) => (
              <div
                key={r.label}
                className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2 md:gap-8 py-6"
              >
                <dt className="text-[12px] tracking-[0.2em] uppercase text-muted-foreground md:text-foreground">
                  {r.label}
                </dt>
                <dd className="text-[14px] leading-[1.9] text-foreground">
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-12 text-[12px] text-muted-foreground">
            最終更新日: 2026年4月20日
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
