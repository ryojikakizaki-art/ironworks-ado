import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { BankTransferDetails } from "./bank-transfer-details"

// 注文者向けの振込先ご案内ページ。見積もり / 注文確認メールから個別に案内するため
// 検索エンジンには非表示（noindex）。sitemap.ts にも登録しない。
export const metadata: Metadata = {
  title: "銀行振込でのお支払い — IRONWORKS ado",
  description:
    "ご注文金額を下記口座へお振込みください。入金確認後、制作・発送の手配を開始いたします。",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
}

const STEPS: { title: string; desc: string }[] = [
  {
    title: "ご注文・お見積もりの確定",
    desc: "お問い合わせフォームまたはメールにてご注文内容をお知らせください。工房より金額・納期をご案内いたします。",
  },
  {
    title: "お振込み",
    desc: "ご確認の上、上記口座へご注文金額をお振込みください。",
  },
  {
    title: "入金確認・制作開始",
    desc: "ご入金の確認が取れ次第、メールにてご連絡いたします。確認後に制作・発送の手配を開始いたします。",
  },
  {
    title: "発送・お届け",
    desc: "制作完了後、丁寧に梱包のうえ佐川急便にて全国へお届けいたします。発送時に追跡番号をご案内します。",
  },
]

export default function BankTransferPage() {
  return (
    <>
      <Header />
      <main className="bg-background pt-20 pb-20 lg:pt-24">
        {/* ヒーロー */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8 lg:py-16">
            <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-gold">
              Payment — Bank Transfer
            </p>
            <h1 className="mb-4 font-serif text-3xl text-foreground lg:text-5xl">
              銀行振込でのお支払い
            </h1>
            <p className="max-w-[640px] text-[14px] leading-[1.95] text-muted-foreground">
              下記の口座へご注文金額をお振込みください。
              ご入金の確認後、制作・発送の手配を開始いたします。
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[800px] px-4 py-14 lg:px-8 lg:py-16">
          <div className="space-y-12">
            {/* ご確認ください */}
            <div className="rounded-lg border border-border border-l-4 border-l-gold bg-secondary/50 px-5 py-5 lg:px-6">
              <p className="mb-2 text-[13px] font-bold tracking-wide text-gold">
                ● ご確認ください
              </p>
              <ul className="space-y-1.5 text-[14px] leading-[1.9] text-foreground/80">
                <li>・振込手数料はお客様のご負担となります。</li>
                <li>・ご入金の確認が取れ次第、メールにてご連絡いたします。</li>
              </ul>
            </div>

            {/* 口座情報（コピー機能つき） */}
            <BankTransferDetails />

            {/* お支払いの流れ */}
            <section>
              <p className="mb-2 text-[10px] uppercase tracking-[0.4em] text-gold">
                Flow
              </p>
              <h2 className="mb-8 border-b border-border pb-3 font-serif text-xl text-foreground lg:text-2xl">
                お支払いの流れ
              </h2>
              <ol className="space-y-7">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="flex items-start gap-5">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-gold bg-gold/15 font-serif text-lg font-bold text-foreground">
                      {i + 1}
                    </span>
                    <div className="flex-1 pt-1">
                      <p className="mb-1.5 text-[15px] font-bold text-foreground">
                        {step.title}
                      </p>
                      <p className="text-[14px] leading-[1.9] text-foreground/70">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* お問い合わせ */}
            <div className="rounded-lg border border-border bg-secondary/50 px-6 py-8 text-center">
              <p className="mb-5 text-[14px] leading-[1.9] text-muted-foreground">
                ご不明な点がございましたら、お気軽にお問い合わせください。
              </p>
              <PrimaryCTA href="/contact" variant="dark" size="md">
                お問い合わせはこちら
              </PrimaryCTA>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
