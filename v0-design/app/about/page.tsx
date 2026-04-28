import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export const metadata = {
  title: "About | IRONWORKS ado",
  description:
    "IRONWORKS ado について — 鍛冶職人が一点ずつ手仕事で制作する、本物のアイアン手すり・インテリアのショップです。",
}

type Section = {
  eyebrow: string
  title: string
  paragraphs?: string[]
  steps?: { num: string; title: string; body: string }[]
  links?: { label: string; href: string }[]
}

const sections: Section[] = [
  {
    eyebrow: "About",
    title: "IRONWORKS ado について",
    paragraphs: [
      "IRONWORKS ado は、鍛冶職人がひとつずつ手仕事で制作するアイアン製品のオンラインショップです。手すりを中心に、テーブルの脚や雑貨など、暮らしを支えるアイアンインテリアをお届けしています。",
      "母体は本格ロートアイアン工房『鍛鉄工房ZEST』。フルオーダーで培ってきた鍛造技術と意匠を、お求めやすいセミオーダーへと規格化したのが ado です。サイズ・色・取付方法をご相談しながら、一点ずつ仕立ててお届けします。",
    ],
  },
  {
    eyebrow: "Lineup",
    title: "取扱商品",
    paragraphs: [
      "アイアン手すりを軸に、Scroll（縦型ロートアイアン手すり）、階段手すり、フェンス、テーブル脚、雑貨類まで、暮らしの中で使うアイアン製品を幅広く取り扱っています。",
      "屋外・屋内、サイズ、デザインに応じてご相談ください。掲載のないご要望もセミオーダーで承ります。",
    ],
    links: [{ label: "商品一覧を見る", href: "/products" }],
  },
  {
    eyebrow: "Process",
    title: "ものづくりの工程",
    paragraphs: [
      "鍛冶職人が一本ずつ火造り鍛造で成形し、素地調整から下塗り、仕上げ塗装までを工房内で一貫して行います。屋外用には溶融亜鉛メッキ＋塗装の二重防錆を採用し、長期間の使用に耐える仕上がりを実現しています。",
    ],
    links: [
      { label: "塗装について", href: "/paint" },
      { label: "亜鉛メッキについて", href: "/galvanizing" },
    ],
  },
  {
    eyebrow: "Order Flow",
    title: "ご注文の流れ",
    steps: [
      {
        num: "01",
        title: "ご注文・ご決済",
        body: "商品ページからサイズ・仕様を選んでご注文ください。Stripe によるクレジットカード決済に対応しています。",
      },
      {
        num: "02",
        title: "ご注文確定",
        body: "ご決済確認後、自動でご注文確定メールをお送りします。製作開始のご連絡を兼ねていますので大切に保管ください。",
      },
      {
        num: "03",
        title: "製作（3〜4週間）",
        body: "鍛冶職人が一点ずつ火造り鍛造で制作いたします。お急ぎの場合は別途ご相談ください。",
      },
      {
        num: "04",
        title: "発送・お届け",
        body: "完成後、配送業者にて梱包・発送いたします。発送時に追跡番号をメールでお送りします。",
      },
      {
        num: "05",
        title: "取付・ご使用開始",
        body: "取付に関するご質問やトラブルがございましたら、お気軽にお問い合わせください。",
      },
    ],
  },
  {
    eyebrow: "Aftercare",
    title: "アフターサポート",
    paragraphs: [
      "永くお使いいただくために、ご購入後のご相談も承ります。傷の補修・再塗装・取付調整など、ご使用にあたってのお困りごとはお気軽にお問い合わせください。",
      "業者様のまとまった量のご依頼にも、一点一点誠実な仕事でお応えいたします。",
    ],
    links: [{ label: "お問い合わせする", href: "/contact" }],
  },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">About</p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground">
              IRONWORKS ado について
            </h1>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-16">
          <div className="space-y-14">
            {sections.map((section, i) => (
              <section key={i}>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                  {section.eyebrow}
                </p>
                <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-6 pb-3 border-b border-border">
                  {section.title}
                </h2>

                {section.paragraphs && (
                  <div className="space-y-5">
                    {section.paragraphs.map((p, j) => (
                      <p key={j} className="text-[14px] leading-[2] text-foreground/80">
                        {p}
                      </p>
                    ))}
                  </div>
                )}

                {section.steps && (
                  <ol className="space-y-6">
                    {section.steps.map((step) => (
                      <li key={step.num} className="flex gap-5">
                        <span className="flex-shrink-0 font-serif text-base text-gold tabular-nums tracking-wider pt-1">
                          {step.num}
                        </span>
                        <div className="flex-1">
                          <p className="font-serif text-[15px] text-foreground mb-2">
                            {step.title}
                          </p>
                          <p className="text-[13px] leading-[1.95] text-foreground/75">
                            {step.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}

                {section.links && (
                  <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
                    {section.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="inline-flex items-center text-[12px] tracking-wider text-foreground border-b border-foreground/30 pb-0.5 hover:text-gold hover:border-gold transition-colors"
                      >
                        {link.label} →
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-border flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-4 border border-gold text-gold text-[10px] tracking-[0.3em] uppercase hover:bg-gold hover:text-dark transition-colors"
            >
              お問い合わせする
            </Link>
            <Link
              href="/products"
              className="inline-block px-8 py-4 border border-border text-foreground text-[10px] tracking-[0.3em] uppercase hover:border-foreground transition-colors"
            >
              商品一覧を見る
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
