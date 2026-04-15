import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export const metadata = {
  title: "ごあいさつ | IRONWORKS ado",
  description:
    "IRONWORKS ado 代表 蠣崎良治からのごあいさつ。鍛冶職人としての経歴と製品への想いをご紹介します。",
}

const paragraphs = [
  "はじめまして、IRONWORKS ado 代表 蠣崎良治（カキザキリョウジ）と申します。",
  "当ショップの商品に興味を持っていただき、数あるショップの中から訪れていただきありがとうございます。私は鉄の美しさ、可能性に惹かれ、本格ロートアイアンの工房『鍛鉄工房ZEST』として、フルオーダーを中心に鉄のインテリアやエクステリアを制作してまいりました。ロートアイアンは、古典技法を用いて工芸や美術的要素も取り入れ一点ものでデザインし形にするため、高額になり少し敷居が高くなってしまいます。そこで、これまでに培い磨いてきた感性と技術を用いて、規格化しお求めやすい価格でご提供できればきっと喜んでいただけると感じておりました。そうした想いから、セミオーダーでご注文をいただくセカンドブランドの【IRONWORKS ado】を立ち上げることにいたしました。",
  "個人の小さな工房ですが、だからこそできること、私にしかできないことがあると考えております。私の強みは一般的な鉄職人にはない、有数な修行経験から得た『用の美』への意識だと考えております。",
  "10年ほど勤めた機械製造会社で板金技術（いわゆる一般的な鉄工所の職人の技術）を身につけた後、より深い鉄の工芸、芸術の世界に魅せられ、西洋鍛冶（ロートアイアン）の世界へと進みました。",
  "弟子入り修行させていただいた国内有数のロートアイアン工房では、古典的な鍛冶技術を用いながら自由な造形で『大胆に繊細に』作り上げるをテーマに、今まで見たことのない力強く美しい鉄のインテリア・エクステリア、オブジェの制作を経験しました。そこでそれぞれに素晴らしい感性の兄弟子たちにも恵まれたこともあり、それまで希薄だったものづくりへの美意識を急速に学ぶことができました。",
  "2023年夏にはイタリアで行われた鉄のビエンナーレでは、その兄弟子たちと共に日本を代表し海を渡り、オブジェ制作を依頼される作り手として光栄な機会にも恵まれました。",
  "無垢の鉄を叩き作り、『火造り鍛造』とも言われるロートアイアンは、日本では歴史が浅く建築にも文化がありませんので、鉄を型に溶かして作る『鋳物（イモノ）』とよく間違えられます。日本で見る豪華そうに見える門扉やフェンスでアイアン製と認識されているものは、ほぼこの鋳物によるロートアイアンを模した物です。（イタリアでは鋳物もアルミの物もほとんど見かけませんでした）",
  "IRONWORKS ado はこれまで見てきた鉄の世界での経験を活かし、使い続けるほど好きに、本物と言っていただけるような商品を提案してまいります。",
  "当ショップはアイアン製品の販売ショップとしてはアイテム数はまだ多くはございませんが、一つひとつの品質には自信を持っております。アイアン製品をお探しでご縁のあったお客様にとって、必ず最適な選択となり喜んでいただけるよう手間や技術を惜しまず、誠実な説明と仕事を心がけ、作り手として『良い物を遺す』『喜ばれる』ことを信条に制作しております。",
  "業者様のまとまった量のご依頼にも、一点一点誠実な仕事でお応えいたします。",
  "私生活では二人の息子と書籍のデザインをしている妻との4人暮らし。自然、映画、焚き火、ウイスキー、ギター、猫、蕎麦、が好きです。",
  "長く暮らすこだわりの住まいだからこそ、良いものを。",
  "お問い合わせを心よりお待ちしております。",
]

export default function GreetingPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Greeting</p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground">ごあいさつ</h1>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-16">
          <div className="space-y-6">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-[14px] leading-[1.9] text-muted-foreground">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-border text-right">
            <p className="text-[12px] tracking-wide text-muted-foreground mb-1">
              IRONWORKS ado 代表
            </p>
            <p className="font-serif text-lg text-foreground">蠣崎 良治</p>
          </div>

          <div className="mt-12 text-center">
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
