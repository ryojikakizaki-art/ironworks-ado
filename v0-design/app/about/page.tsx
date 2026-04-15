import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export const metadata = {
  title: "About | IRONWORKS ado",
  description: "IRONWORKS ado について — 鍛冶職人が制作するアイアン手すり・インテリアのショップです。",
}

const sections = [
  {
    title: "IRONWORKS ado について",
    body:
      "世界でも第一線の技術力を持つ工房で修行し、鍛冶職人として独立した後、価格以上の確かな品質でこれから毎日お使いいただく方の心豊かな暮らしを思い制作しております。アイアン手すりを中心に、テーブルの脚や棚など、アイアンインテリアをセミオーダーでご提供いたします。",
  },
  {
    title: "塗装へのこだわり",
    body:
      "良い状態で永く使っていただきたいという思いで、素地調整から下塗り、塗装までの工程を丁寧に作業しております。各製品に最適な塗装方法を選択し、耐久性と美しさを両立した仕上がりを実現しています。",
  },
  {
    title: "受注生産について",
    body:
      "手すりはすべて受注生産です。ご注文後、3〜4週間でのお届けを目安としております。お客様のご希望に合わせたセミオーダーで、最適なサイズ、色、素材をご提案させていただきます。特別なご要望やカスタマイズなども、お気軽にご相談ください。",
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

        <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-16 space-y-14">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-serif text-xl lg:text-2xl mb-4 text-foreground">
                {s.title}
              </h2>
              <p className="text-[14px] leading-[1.9] text-muted-foreground">
                {s.body}
              </p>
            </section>
          ))}

          <div className="pt-8 border-t border-border">
            <Link
              href="/contact"
              className="inline-block px-8 py-4 border border-gold text-gold text-[10px] tracking-[0.3em] uppercase hover:bg-gold hover:text-dark transition-colors"
            >
              お問い合わせする
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
