import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { CATALOG_PRODUCTS } from "@/lib/products/catalog"

const SITE_URL = "https://ado.tantetuzest.com"

export const metadata: Metadata = {
  title: "ロートアイアンとは？鍛冶職人が解説する本物の鍛鉄｜IRONWORKS ado",
  description:
    "ロートアイアン（wrought iron・鍛鉄）とは、無垢の鉄を炉で熱しハンマーで叩いて成形する、ヨーロッパで発達した装飾鉄工の技術。量産の「鍛造風」アイアンとの違い、唐草・鎚目などの意匠、手すり・面格子・ドアへの活かし方を、自社工房の鍛冶職人が解説します。",
  alternates: { canonical: "/wrought-iron" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/wrought-iron`,
    siteName: "IRONWORKS ado",
    title: "ロートアイアンとは？鍛冶職人が解説する本物の鍛鉄｜IRONWORKS ado",
    description:
      "無垢鉄を 1000℃ で熱し、ハンマーで叩いて成形する西洋鍛冶の技術。量産品との違いと意匠の見どころを職人が解説。",
    locale: "ja_JP",
  },
}

// 意匠の見どころ — 実際の商品写真で見せる
const MOTIFS = [
  {
    href: "/products/scroll22",
    title: "Scroll｜唐草",
    img: "/images/wrought-iron/motif-scroll.jpg",
    desc: "鉄の先端を熱して細く延ばし、渦巻き状に巻き上げる古典意匠。ヨーロッパの門扉や教会の金物に受け継がれてきた、ロートアイアンの象徴です。",
  },
  {
    href: "/products/tsuchime",
    title: "鎚目",
    img: "/images/wrought-iron/motif-tsuchime.jpg",
    desc: "表面を打ち残しなくハンマーで叩き上げた跡。光を受けるたび表情が変わり、鉄は叩かれることで素材としての強さも増します。",
  },
  {
    href: "/products/elisabeth",
    title: "アール・ヌーヴォー曲線",
    img: "/images/wrought-iron/motif-curve.jpg",
    desc: "植物の茎のようにしなやかな曲線。型に頼らず、職人が火加減と鎚の力だけで起こすラインは、二本と同じものがありません。",
  },
] as const

const motifProducts = MOTIFS.map((m) => {
  const p = CATALOG_PRODUCTS.find((x) => x.href === m.href)
  if (!p) throw new Error(`Catalog product not found: ${m.href}`)
  return { ...m, product: p }
})

// 比較表 — 量産アイアンとの違い
const COMPARISON = [
  { label: "素材", mass: "中空パイプ・既製型材", ado: "無垢の鉄（ソリッド）" },
  { label: "成形", mass: "機械曲げ・型抜き", ado: "炉で熱してハンマーで手打ち" },
  { label: "表情", mass: "均一でフラット", ado: "打ち跡・細り・ねじりが一本ごとに違う" },
  { label: "同じもの", mass: "無数にある", ado: "二本とない" },
  { label: "経年", mass: "傷むと安っぽく見えやすい", ado: "使い込むほど味わいが深まる" },
] as const

export default function WroughtIronPage() {
  return (
    <>
      <Header hasHero />
      <main className="bg-background text-foreground">
        {/* HERO — スクロール意匠のクローズアップを主役に */}
        <section className="relative h-[72vh] min-h-[520px] w-full overflow-hidden">
          <Image
            src="/images/wrought-iron-hero-forging.jpg"
            alt="炉で熱した鉄をハンマーで打つ鍛冶職人。奥にはスクロール意匠の装飾ゲート"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* 明るい写真でも白ロゴ・ナビが読めるよう上部暗幕は強め（既知の落とし穴対応） */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background via-background/85 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-14 md:pb-20">
            <div className="max-w-[1100px] mx-auto">
              <p className="text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-gold mb-4">
                Wrought Iron
              </p>
              <h1 className="font-serif text-foreground text-[30px] md:text-[46px] lg:text-[56px] font-light leading-[1.3] tracking-tight">
                炎と鎚が、<br className="md:hidden" />鉄を意匠に。
              </h1>
              <p className="mt-5 max-w-xl text-[14px] md:text-[16px] leading-loose text-foreground/75">
                ロートアイアンとは何か——自社工房の鍛冶職人が解説します。
              </p>
            </div>
          </div>
        </section>

        {/* ロートアイアンとは */}
        <section className="px-6 py-20 md:py-28">
          <div className="max-w-[760px] mx-auto">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6 text-center">About</p>
            <h2 className="font-serif text-center text-[26px] md:text-[36px] leading-[1.5] font-light mb-12">
              ロートアイアンとは
            </h2>
            <div className="space-y-6 text-[15px] md:text-[16px] leading-[2.2] text-foreground/80">
              <p>
                ロートアイアン（wrought iron）は、日本語で<strong className="text-foreground font-medium">「鍛鉄（たんてつ）」</strong>。
                無垢の鉄を炉で 1000℃ まで熱し、ハンマーで叩いて形を起こす、ヨーロッパで発達した西洋鍛冶の技術です。
              </p>
              <p>
                パリの街灯、バルセロナの門扉、教会の蝶番——ヨーロッパの街並みを飾ってきた鉄の装飾は、みなこの技術で作られてきました。
                鋳型に流し込む鋳物（キャストアイアン）とも、パイプを機械で曲げる量産アイアンとも違う、
                <strong className="text-foreground font-medium">「叩いて造る」</strong>ことそのものが名前になった鉄工です。
              </p>
              <p>
                ado は、この西洋鍛冶の技術で手すり・面格子・門扉・ドアを一本ずつ製作している自社工房です。
              </p>
            </div>
          </div>
        </section>

        {/* 工房写真 — フルブリード */}
        <section className="relative h-[52vh] min-h-[380px] w-full overflow-hidden">
          <Image
            src="/images/about/craftsman-hands.jpg"
            alt="鍛冶職人が鉄を手作業で仕上げる様子"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </section>

        {/* 量産アイアンとの違い */}
        <section className="px-6 py-20 md:py-28">
          <div className="max-w-[900px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Difference</p>
              <h2 className="font-serif text-[26px] md:text-[34px] font-light leading-[1.5]">
                「鍛造風」量産品との違い
              </h2>
              <p className="mt-5 text-[14px] md:text-[15px] text-muted-foreground leading-loose max-w-xl mx-auto">
                市場に並ぶアイアン製品の多くは、パイプ材を機械で曲げた「鍛造風」です。
                見分けるポイントを比べてみてください。
              </p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border bg-white">
              <table className="w-full border-collapse">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="py-3.5 px-4 text-left text-[12px] tracking-[0.12em] uppercase text-muted-foreground font-medium whitespace-nowrap w-[22%]"></th>
                    <th className="py-3.5 px-4 text-left text-[13px] text-muted-foreground font-medium whitespace-nowrap">
                      量産アイアン
                    </th>
                    <th className="py-3.5 px-4 text-left text-[13px] text-gold font-semibold whitespace-nowrap">
                      ロートアイアン（鍛鉄）
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {COMPARISON.map((row) => (
                    <tr key={row.label} className="hover:bg-muted/40 transition-colors">
                      <td className="py-4 px-4 text-[13px] md:text-[14px] font-medium text-foreground whitespace-nowrap">
                        {row.label}
                      </td>
                      <td className="py-4 px-4 text-[13px] md:text-[14px] text-muted-foreground">{row.mass}</td>
                      <td className="py-4 px-4 text-[13px] md:text-[14px] text-foreground font-medium">{row.ado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 意匠の見どころ — 実物写真で */}
        <section className="px-6 py-20 md:py-28 bg-secondary/60 border-y border-border">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Motif</p>
              <h2 className="font-serif text-[26px] md:text-[34px] font-light leading-[1.5]">
                意匠の見どころ
              </h2>
              <p className="mt-5 text-[14px] md:text-[15px] text-muted-foreground leading-loose">
                ado の実際の製品で、代表的な 3 つの意匠をご覧ください。
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
              {motifProducts.map((m) => (
                <Link key={m.href} href={m.href} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
                    <Image
                      src={m.img}
                      alt={`${m.title} — ${m.product.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-4">
                    <h3 className="font-serif text-[18px] md:text-[19px] text-foreground group-hover:text-gold transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-[13px] md:text-[14px] leading-[1.9] text-muted-foreground mt-2">{m.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-gold">
                      {m.product.name} を見る
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 商品への導線 */}
        <section className="px-6 py-20 md:py-28">
          <div className="max-w-[900px] mx-auto text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Collection</p>
            <h2 className="font-serif text-[26px] md:text-[34px] font-light leading-[1.5] mb-6">
              ロートアイアンの製品を見る
            </h2>
            <p className="text-[14px] md:text-[15px] text-muted-foreground leading-loose max-w-xl mx-auto mb-12">
              手すり・面格子・門扉・ドアまで。¥18,000 の Scroll 16φ から職人手打ちの一点物まで、
              全 13 商品をアンティーク・クラシックのページにまとめています。
            </p>
            <Link
              href="/categories/antique"
              className="group block relative aspect-[21/9] overflow-hidden rounded-2xl bg-secondary"
            >
              <Image
                src="/images/wrought-iron/collection-hammered.jpg"
                alt="鎚目を打ち込んだロートアイアン手すりの先端"
                fill
                sizes="(max-width: 900px) 100vw, 900px"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 top-0 p-6 md:p-8 text-left">
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Antique &amp; Classical</p>
                <p className="font-serif text-white text-[22px] md:text-[28px]">
                  アンティーク・クラシック 全 13 商品
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-white/85">
                  一覧を見る
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-24 md:pb-32">
          <div className="max-w-[640px] mx-auto text-center border-t border-border pt-14">
            <h2 className="font-serif text-[24px] md:text-[30px] font-light leading-[1.5] mb-6">
              世界に一本の鉄を、<br className="md:hidden" />あなたの住まいに。
            </h2>
            <p className="text-[14px] md:text-[15px] leading-loose text-muted-foreground mb-10">
              ご希望のサイズ・意匠・取付場所をお知らせください。図面やお写真から無料でお見積もりします。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PrimaryCTA href="/categories/antique" variant="dark" size="lg" withArrow>
                製品を見る
              </PrimaryCTA>
              <PrimaryCTA href="/contact" variant="gold" size="lg" withArrow>
                無料で相談する
              </PrimaryCTA>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
