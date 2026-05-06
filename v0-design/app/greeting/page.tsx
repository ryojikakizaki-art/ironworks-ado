import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "ごあいさつ｜IRONWORKS ado 代表 蠣﨑良治",
  description:
    "IRONWORKS ado 代表 蠣﨑良治からのごあいさつ。鍛冶職人としての経歴とアイアン手すりへの想いをご紹介します。",
  alternates: { canonical: "/greeting" },
}

type SectionImage = { src: string; alt: string; aspect: "video" | "square" | "portrait" }

const sections: {
  eyebrow: string
  title: string
  paragraphs: string[]
  image?: SectionImage
}[] = [
  {
    eyebrow: "About",
    title: "IRONWORKS ado について",
    paragraphs: [
      "はじめまして、IRONWORKS ado 代表 蠣﨑良治（カキザキリョウジ）と申します。当ショップの商品に興味を持っていただき、数あるショップの中から訪れていただきありがとうございます。",
      "私は鉄の美しさと可能性に惹かれ、本格ロートアイアンの工房『鍛鉄工房ZEST』として、フルオーダーを中心に鉄のインテリアやエクステリアを制作してまいりました。",
      "ロートアイアンは古典技法を用い、工芸・美術的な要素を取り入れた一点ものでデザインから形にしていくため、価格帯としてはどうしても限られた方へのご提供となります。これまで培い磨いてきた感性と技術をセミオーダーへと規格化し、お求めやすい価格で提供することで、より多くの方に本物の鉄を届けたい——そうした想いから、セカンドブランドの【IRONWORKS ado】を立ち上げました。",
    ],
  },
  {
    eyebrow: "Career",
    title: "これまでの歩み",
    image: {
      src: "/images/greeting-career.jpg",
      alt: "イタリア・鉄のビエンナーレでの鍛造制作",
      aspect: "video",
    },
    paragraphs: [
      "個人工房だからこそ、ひとつひとつの仕事に正面から向き合えること、私にしかできないことがあります。私の強みは、一般的な鉄職人にはない、有数の修行経験から得た『用の美』への意識です。",
      "10年ほど勤めた機械製造会社で板金技術を身につけた後、より深い鉄の工芸・芸術の世界に魅せられ、西洋鍛冶（ロートアイアン）の世界へと進みました。",
      "弟子入りさせていただいた国内有数のロートアイアン工房では、古典的な鍛冶技術を用いながら自由な造形で『大胆に繊細に』作り上げるをテーマに、力強く美しい鉄のインテリア・エクステリア、オブジェの制作を経験しました。素晴らしい感性の兄弟子たちにも恵まれ、ものづくりへの美意識を磨かせていただきました。",
      "2023年夏にはイタリアで開催された鉄のビエンナーレに、その兄弟子たちと共に日本を代表して参加し、オブジェ制作を依頼される作り手として光栄な機会にも恵まれました。",
    ],
  },
  {
    eyebrow: "Craft",
    title: "ロートアイアンという技術",
    image: {
      src: "/images/greeting-craft.jpg",
      alt: "火造り鍛造によるアイアンディテール",
      aspect: "square",
    },
    paragraphs: [
      "無垢の鉄を叩いて成形する『火造り鍛造』とも呼ばれるロートアイアンは、日本ではまだ歴史が浅く広く知られていないため、鉄を型に溶かして作る『鋳物（イモノ）』としばしば混同されます。日本で見かける豪華なアイアン製の門扉やフェンスの多くは、実は鋳物でロートアイアンを模したものです。（イタリアでは鋳物・アルミ製のものはほとんど見かけませんでした）",
      "IRONWORKS ado はこれまで見てきた鉄の世界での経験を活かし、使い続けるほど愛着が増し、本物と言っていただけるような商品を提案してまいります。",
    ],
  },
  {
    eyebrow: "Promise",
    title: "お客様への約束",
    paragraphs: [
      "一つひとつの品質には自信を持っております。アイアン製品をお探しでご縁のあったお客様にとって最適な選択となり、喜んでいただけるよう、手間や技術を惜しまず、誠実な説明と仕事を心がけてまいります。作り手として『良い物を遺す』『喜ばれる』ことを信条に制作しております。",
      "業者様のまとまった量のご依頼にも、一点一点誠実な仕事でお応えいたします。",
    ],
  },
  {
    eyebrow: "Personal",
    title: "私の暮らし",
    paragraphs: [
      "私生活では、二人の息子と、書籍デザイナーの妻との4人暮らし。自然、映画、焚き火、ウイスキー、ギター、猫、蕎麦が好きです。",
      "長く暮らすこだわりの住まいだからこそ、良いものを。お問い合わせを心よりお待ちしております。",
    ],
  },
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
          {/* 代表ポートレート */}
          <div className="mb-14 flex justify-center">
            <div className="relative w-[260px] sm:w-[300px] aspect-square overflow-hidden rounded-full bg-secondary shadow-sm">
              <Image
                src="/images/greeting-portrait.jpg"
                alt="IRONWORKS ado 代表 蠣﨑良治"
                fill
                sizes="(max-width: 640px) 260px, 300px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="space-y-14">
            {sections.map((section, i) => (
              <section key={i}>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                  {section.eyebrow}
                </p>
                <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-6 pb-3 border-b border-border">
                  {section.title}
                </h2>
                {section.image && (
                  <div
                    className={`relative w-full mb-7 overflow-hidden rounded-md bg-secondary ${
                      section.image.aspect === "square"
                        ? "aspect-square sm:aspect-[4/3]"
                        : section.image.aspect === "portrait"
                        ? "aspect-[3/4]"
                        : "aspect-[3/2]"
                    }`}
                  >
                    <Image
                      src={section.image.src}
                      alt={section.image.alt}
                      fill
                      sizes="(max-width: 800px) 100vw, 800px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="space-y-5">
                  {section.paragraphs.map((p, j) => (
                    <p key={j} className="text-[14px] leading-[2] text-foreground/80">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-border text-right">
            <p className="text-[12px] tracking-wide text-muted-foreground mb-1">
              IRONWORKS ado 代表
            </p>
            <p className="text-[11px] tracking-wide text-muted-foreground mb-2">
              （鍛鉄工房ZEST）
            </p>
            <p className="font-serif text-lg text-foreground">蠣﨑 良治</p>
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
