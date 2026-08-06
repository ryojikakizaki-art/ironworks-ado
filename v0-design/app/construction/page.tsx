import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MessageCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { CATALOG_PRODUCTS } from "@/lib/products/catalog"
import { galleryUrl } from "@/lib/products/display"

const SITE_URL = "https://ado.tantetuzest.com"
const LINE_URL = "https://lin.ee/Tnjukrf"

export const metadata: Metadata = {
  title: "アイアン製品の施工・取付工事（千葉エリア）｜製作から取付まで一貫対応｜IRONWORKS ado",
  description:
    "階段・門扉・フェンス・アプローチ手すりなどのアイアン製品を、自社工房（千葉市）での製作から現地の取付工事まで一貫対応。現地調査は鍛冶職人本人が伺います。施工の流れ・対応エリア・実際の施工事例をご紹介します。",
  alternates: { canonical: "/construction" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/construction`,
    siteName: "IRONWORKS ado",
    title: "アイアン製品の施工・取付工事（千葉エリア）｜IRONWORKS ado",
    description:
      "製作から取付工事まで一貫対応。現地調査は鍛冶職人本人が伺います。施工の流れと事例をご紹介。",
    locale: "ja_JP",
  },
}

// 施工でお受けしている製品（工事込みが中心のカテゴリから）
const WORK_HREFS = [
  "/products/stair-straight",
  "/products/stair-spiral",
  "/products/stair-outdoor",
  "/products/fence-fukinuke",
  "/products/fence-zigzag",
  "/products/mengoshi",
  "/products/simple-black",
  "/products/barn-door",
] as const

const workProducts = WORK_HREFS.map((href) => {
  const p = CATALOG_PRODUCTS.find((x) => x.href === href)
  if (!p) throw new Error(`Catalog product not found: ${href}`)
  return p
})

const FLOW = [
  {
    num: "01",
    title: "お問い合わせ",
    desc: "設置したい場所の写真とご希望をお送りください。フォームでも LINE でも、写真を送るだけで大丈夫です。",
  },
  {
    num: "02",
    title: "現地調査・採寸",
    desc: "鍛冶職人本人がお伺いし、取付位置・下地・寸法を確認します。その場で仕様のご相談もできます。",
  },
  {
    num: "03",
    title: "お見積もり",
    desc: "製作費・取付工事費を明記したお見積もりをお渡しします。内容にご納得いただいてからのご契約です。",
  },
  {
    num: "04",
    title: "自社工房で製作",
    desc: "千葉市若葉区の自社工房で、職人が一点ずつ製作します。製作中の様子は写真でご報告できます。",
  },
  {
    num: "05",
    title: "取付工事",
    desc: "製作した本人がそのまま取付まで行います。現場との細かな差異も、鍛冶職人だからその場で調整できます。",
  },
] as const

// 施工事例
const CASES: { src: string; alt: string; w: number; h: number; caption: string; prefecture?: string }[] = [
  {
    src: "/images/gallery/case-5.jpg",
    alt: "白壁の階段に取り付けた曲線のロートアイアン手すり",
    w: 900,
    h: 1600,
    caption: "白壁の階段に、渦巻き装飾の壁付け手すり",
  },
  {
    src: "/images/gallery/case-1.jpg",
    alt: "コンクリート壁の廻り階段に取り付けた白い壁付け手すり",
    w: 941,
    h: 1150,
    caption: "コンクリートの廻り階段に、白い壁付け手すり",
  },
  {
    src: "/images/voices/review-photo-hiroshima.jpg",
    alt: "広島県のお客様宅の玄関に取り付けた黒い縦手すり",
    w: 996,
    h: 660,
    caption: "玄関に取り付けた、黒い縦型の壁付け手すり",
    prefecture: "広島県",
  },
  {
    src: "/images/gallery/case-3.jpg",
    alt: "玄関の上がり框に取り付けた渦巻き装飾の手すり",
    w: 1600,
    h: 1600,
    caption: "玄関の上がり框に、唐草模様の据え置き手すり",
  },
  {
    src: "/images/voices/review-photo-ibaraki.jpg",
    alt: "茨城県のお客様宅に取り付けたL字型の据え置き手すり",
    w: 503,
    h: 611,
    caption: "介護保険を使った、L字型の据え置き手すり",
    prefecture: "茨城県",
  },
  {
    src: "/images/gallery/case-2.jpg",
    alt: "コンクリート外階段と黒いアプローチ手すりのある住宅外観",
    w: 900,
    h: 1600,
    caption: "コンクリート外階段に、黒いアプローチ手すり",
  },
  {
    src: "/images/gallery/case-4.jpg",
    alt: "バルコニーの黒いアイアン手すりとウッドデッキ",
    w: 740,
    h: 1600,
    caption: "バルコニーに、黒いアイアン手すり",
  },
]

export default function ConstructionPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* ページヘッダー */}
        <div className="border-b border-border">
          <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-12 lg:py-16 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Construction</p>
              <h1 className="font-serif text-3xl lg:text-5xl text-foreground leading-[1.3]">
                作って、<br className="md:hidden" />取り付けるまで。
              </h1>
              <p className="text-[13px] md:text-[15px] text-muted-foreground mt-5 max-w-[560px] leading-[2]">
                階段・門扉・フェンス・アプローチ手すり——
                自社工房（千葉市）での製作から現地の取付工事まで、鍛冶職人が一貫してお引き受けします。
                現地調査に伺うのも、製作するのも、取り付けるのも、同じ職人です。
              </p>
            </div>
            <div className="relative w-full md:w-[320px] aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
              <Image
                src="/images/hero/construction-install.jpg"
                alt="階段の壁にロートアイアン手すりを取り付ける職人"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-4 lg:px-8 mt-14 space-y-20 md:space-y-24">
          {/* 施工でできること */}
          <section>
            <div className="text-center mb-10">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Service</p>
              <h2 className="font-serif text-[24px] md:text-[32px] text-foreground">施工でお受けしているもの</h2>
              <p className="text-[13px] md:text-[14px] text-muted-foreground mt-3 leading-relaxed">
                下記は代表例です。「こんな鉄のものを作って付けてほしい」というご相談から始められます。
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {workProducts.map((p) => (
                <Link key={p.href} href={p.href} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                    <Image
                      src={galleryUrl(`${p.img}.jpg`)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-2.5">
                    <p className="text-[11px] tracking-[0.1em] text-muted-foreground">{p.label}</p>
                    <p className="text-[13px] md:text-[14px] font-medium text-foreground leading-tight mt-0.5 group-hover:text-gold transition-colors">
                      {p.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 施工の流れ */}
          <section>
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Flow</p>
              <h2 className="font-serif text-[24px] md:text-[32px] text-foreground">施工の流れ</h2>
              <p className="text-[13px] md:text-[14px] text-muted-foreground mt-3">
                ご相談から取付完了まで、窓口はずっと職人本人です。
              </p>
            </div>
            <div className="grid md:grid-cols-5 gap-4">
              {FLOW.map((s, i) => (
                <div key={s.num} className="relative rounded-xl border border-border bg-white p-5 md:p-6">
                  <p className="font-serif text-gold text-[13px] tracking-[0.3em]">STEP {s.num}</p>
                  <h3 className="font-serif text-[17px] md:text-[18px] text-foreground mt-2">{s.title}</h3>
                  <p className="text-[13px] leading-[1.9] text-muted-foreground mt-3">{s.desc}</p>
                  {i < FLOW.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 対応エリア */}
          <section className="rounded-2xl bg-secondary/60 border border-border px-6 md:px-12 py-12 md:py-14">
            <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-14 items-center">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Area</p>
                <h2 className="font-serif text-[24px] md:text-[30px] text-foreground">対応エリア</h2>
              </div>
              <div>
                <p className="text-[14px] md:text-[15px] leading-[2] text-foreground/85">
                  自社工房（千葉市若葉区）から、職人が直接お伺いします。
                  <strong className="font-medium">千葉市内・千葉県内を中心に対応</strong>し、
                  近隣県も内容によりご相談いただけます。
                </p>
                <p className="text-[13px] text-muted-foreground mt-3 leading-relaxed">
                  遠方の場合も、製品の製作＋配送（取付は現地の工務店様）という形でお受けできます。
                </p>
              </div>
            </div>
          </section>

          {/* 施工事例 */}
          <section id="works">
            <div className="text-center mb-10">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Works</p>
              <h2 className="font-serif text-[24px] md:text-[32px] text-foreground">施工事例</h2>
              <p className="text-[13px] md:text-[14px] text-muted-foreground mt-3">
                実際の住まいに取り付けた様子です。
              </p>
            </div>
            <div className="columns-2 md:columns-3 gap-3 md:gap-4">
              {CASES.map((c) => (
                <figure key={c.src} className="break-inside-avoid mb-3 md:mb-4">
                  <div className="relative overflow-hidden rounded-xl bg-secondary">
                    <Image
                      src={c.src}
                      alt={c.alt}
                      width={c.w}
                      height={c.h}
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                      {c.prefecture && (
                        <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-gold mb-1">
                          {c.prefecture}
                        </p>
                      )}
                      <p className="text-[12px] md:text-[13px] text-white leading-snug">{c.caption}</p>
                    </div>
                  </div>
                </figure>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-gold transition-colors group"
              >
                <span>お客様の声もあわせてご覧ください</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>

          {/* 介護保険バナー */}
          <section className="rounded-2xl border border-border bg-white px-6 md:px-12 py-10 md:py-12 grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Kaigo</p>
              <h2 className="font-serif text-[20px] md:text-[24px] text-foreground mb-3">
                介護保険を使った手すりの取付工事
              </h2>
              <p className="text-[13px] md:text-[14px] text-muted-foreground leading-[1.9]">
                千葉市の住宅改修費「受領委任払」取扱事業者として登録済み。
                立替え不要・自己負担 1 割のみで、鍛冶職人の手すりを取り付けられます。
              </p>
            </div>
            <PrimaryCTA href="/kaigo" variant="dark" size="md" withArrow>
              介護保険のご案内
            </PrimaryCTA>
          </section>

          {/* CTA */}
          <section className="text-center border-t border-border pt-14">
            <p className="font-serif text-xl md:text-2xl text-foreground mb-3">
              まずは、場所の写真を一枚。
            </p>
            <p className="text-[13px] md:text-sm text-muted-foreground mb-8 leading-relaxed">
              「ここに付けられる？」の一言で構いません。
              <br className="hidden md:block" />
              職人本人が拝見して、できること・費用の目安をお答えします。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <PrimaryCTA href="/contact" variant="gold" size="lg" withArrow>
                無料で相談する
              </PrimaryCTA>
              <PrimaryCTA
                href={LINE_URL}
                external
                variant="line"
                size="lg"
                icon={<MessageCircle className="w-4.5 h-4.5" />}
              >
                LINE で写真を送って相談
              </PrimaryCTA>
            </div>
            <p className="text-[12px] text-muted-foreground mt-4">
              LINE なら個人情報の入力なしで、写真を送るだけでご相談いただけます。
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
