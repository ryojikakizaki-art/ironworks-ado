import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { KaigoNotice } from "@/components/kaigo-notice"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { CATALOG_PRODUCTS, type CatalogProduct } from "@/lib/products/catalog"
import { galleryUrl } from "@/lib/products/display"

const SITE_URL = "https://ado.tantetuzest.com"

export const metadata: Metadata = {
  title: "アイアン手すりの選び方・購入ガイド｜横型・縦型 全15商品｜IRONWORKS ado",
  description:
    "鍛冶職人が一本ずつ手作りするアイアン手すりの購入ガイド。階段・廊下に沿わせる横型と、玄関・立ち上がりで体を支える縦型の選び方、二重防錆のつくり、採寸から取付までの流れをまとめました。全商品 1mm 単位のサイズオーダー・全国配送。",
  alternates: { canonical: "/handrail" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/handrail`,
    siteName: "IRONWORKS ado",
    title: "アイアン手すりの選び方・購入ガイド｜IRONWORKS ado",
    description:
      "横型・縦型 全15商品。鍛冶職人の手仕事・1mm 単位オーダー・全国配送のアイアン手すり購入ガイド。",
    locale: "ja_JP",
  },
}

const horizontals = CATALOG_PRODUCTS.filter((p) => p.cat === "handrail_h")
const verticals = CATALOG_PRODUCTS.filter((p) => p.cat === "handrail_v")

const FEATURES = [
  {
    n: "01",
    title: "鍛冶職人の手仕事",
    desc: "工場の量産品ではなく、自社工房で職人が一本ずつ曲げ・溶接・仕上げまで行います。壁に付いた瞬間から、空間の質が変わります。",
  },
  {
    n: "02",
    title: "1mm 単位のサイズオーダー",
    desc: "既製品の「あと少し足りない」がありません。設置場所に合わせて 1mm 単位で製作。商品ページの計算機で送料込みの総額がその場で分かります。",
  },
  {
    n: "03",
    title: "10 年先まで見据えた塗装",
    desc: "自動車塗装と同じ 2 液型ウレタン塗装が標準。屋外には溶融亜鉛メッキを重ねた二重防錆で、10 年以上の耐久性を確保します。",
  },
] as const

const FLOW: {
  num: string
  title: string
  desc: string
  link?: { href: string; label: string }
}[] = [
  {
    num: "01",
    title: "採寸する",
    desc: "メジャーで取付位置の長さを測るだけ。迷ったら設置場所の写真を送っていただければ、職人が寸法の取り方からご案内します。",
    link: { href: "/measurement", label: "採寸ガイドを見る" },
  },
  {
    num: "02",
    title: "注文する",
    desc: "商品ページで長さと配送先を選ぶと、送料込みの総額を確認してそのまま注文できます。カード決済・銀行振込に対応しています。",
  },
  {
    num: "03",
    title: "職人が製作",
    desc: "ご注文のサイズで一本ずつ製作します。発送は通常 10 営業日。お急ぎの場合は特急対応（5 営業日）もあります。",
  },
  {
    num: "04",
    title: "お届け・取付",
    desc: "全国配送。付属のビスで下地に固定するだけなので、工務店様はもちろん DIY での取付事例も多数あります。千葉エリアは取付工事もお任せいただけます。",
    link: { href: "/construction", label: "施工案内を見る" },
  },
]

function ProductGrid({ products }: { products: CatalogProduct[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-8">
      {products.map((p) => (
        <Link key={p.href} href={p.href} className="group block">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
            <Image
              src={galleryUrl(`${p.img}.jpg`)}
              alt={p.name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {p.badge && (
              <span className="absolute top-2 left-2 bg-gold text-dark text-[8px] tracking-[0.15em] uppercase font-semibold px-1.5 py-0.5 rounded-sm">
                {p.badge}
              </span>
            )}
          </div>
          <div className="pt-3">
            <div className="text-[14px] md:text-[15px] font-medium text-foreground leading-tight group-hover:text-gold transition-colors">
              {p.name}
            </div>
            <div className="text-[12px] text-muted-foreground mt-1 leading-snug">{p.sub}</div>
            <div className="text-[13px] text-foreground mt-1.5">
              ¥{p.price.toLocaleString()}
              {p.priceFrom ? "〜" : ""}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function HandrailGuidePage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* ページヘッダー */}
        <div className="border-b border-border">
          <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-12 lg:py-16 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Handrail Guide</p>
              <h1 className="font-serif text-3xl lg:text-5xl text-foreground leading-[1.3]">
                毎日、手が触れる<br className="md:hidden" />ものだから。
              </h1>
              <p className="text-[13px] md:text-[15px] text-muted-foreground mt-5 max-w-[560px] leading-[2]">
                ado の手すりは、鍛冶職人が一本ずつ手作りする鉄の手すりです。
                階段・廊下に沿わせる「横型」と、玄関や立ち上がりで体を支える「縦型」——
                全 15 商品を、設置場所に合わせて 1mm 単位でオーダーできます。
              </p>
            </div>
            <div className="relative w-full md:w-[320px] aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
              <Image
                // 旧 dscf6699 はトップのヒーロースライドショーと同じ写真だった。
                // 見出し「毎日、手が触れるものだから。」に合わせ、手が触れる質感が
                // 分かる鎚目のクローズアップへ。
                src="/images/products/elisabeth/04.jpg"
                alt="鎚目仕上げのロートアイアン手すりの表面"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-4 lg:px-8 mt-14 space-y-20 md:space-y-24">
          {/* 横型と縦型の選び方 */}
          <section>
            <div className="text-center mb-10">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Type</p>
              <h2 className="font-serif text-[24px] md:text-[32px] text-foreground">
                横型と縦型、どちらを選ぶ？
              </h2>
              <p className="text-[13px] md:text-[14px] text-muted-foreground mt-3 leading-relaxed">
                取り付ける場所で決まります。迷ったら写真を送ってご相談ください。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* 横型 */}
              <div className="rounded-xl border border-border bg-white overflow-hidden">
                <div className="relative aspect-[16/9] bg-secondary">
                  <Image
                    // 階段に沿って長く渡す「横型」の説明に合わせ、両側の壁を
                    // 上まで走る施工写真へ（旧 case-1 は階段を見下ろす構図で
                    // 手すりが細く白く、横型の特徴が伝わりにくかった）。
                    src="/images/products/elisabeth/01.jpg"
                    alt="階段の両側の壁に沿って取り付けた黒いアイアン横型手すり"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-[50%_40%]"
                  />
                </div>
                <div className="p-6 md:p-7">
                  <h3 className="font-serif text-[20px] md:text-[22px] text-foreground">横型</h3>
                  <p className="text-[12px] tracking-[0.15em] text-gold mt-1">階段・廊下・吹き抜けに</p>
                  <p className="text-[13px] md:text-[14px] text-muted-foreground mt-3 leading-[1.9]">
                    壁に沿って長く渡し、昇り降りの間ずっと手を添えられる形。
                    階段の長さに合わせて最長 5m まで 1mm 単位でオーダーできます。
                  </p>
                </div>
              </div>

              {/* 縦型 */}
              <div className="rounded-xl border border-border bg-white overflow-hidden">
                <div className="relative aspect-[16/9] bg-secondary">
                  <Image
                    // 旧 catherine-top は商品名や太さが焼き込まれた販促バナーで、
                    // 隣の「横型」が素の施工写真なのに対して不揃いだった。
                    // 玄関ドア脇に垂直に設置した Antoine（縦型ロング）の施工写真へ。
                    // 文字入りでない・縦向きに設置されている写真を優先（蠣﨑さん指定）。
                    src={galleryUrl("27028bc72ffa6bf103d8.jpg")}
                    alt="玄関ドア脇の壁に垂直に取り付けた縦型アイアン手すり"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:p-7">
                  <h3 className="font-serif text-[20px] md:text-[22px] text-foreground">縦型</h3>
                  <p className="text-[12px] tracking-[0.15em] text-gold mt-1">玄関・上がり框・トイレに</p>
                  <p className="text-[13px] md:text-[14px] text-muted-foreground mt-3 leading-[1.9]">
                    立ち上がる・靴を履くといった動作を一点で支える形。
                    シンプルな丸棒から、火造りの装飾シリーズまで 9 商品から選べます。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 横型ラインナップ */}
          <section>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-7 bg-gold rounded-full" />
              <h2 className="font-serif text-2xl text-foreground">横型手すり</h2>
              <span className="text-[12px] text-muted-foreground">全 {horizontals.length} 商品</span>
            </div>
            <p className="text-[13px] md:text-sm text-muted-foreground mb-8">
              丸棒・フラットバー・鎚目・ロートアイアンまで。〜1.5m は一律料金です。
            </p>
            <ProductGrid products={horizontals} />
          </section>

          {/* 縦型ラインナップ */}
          <section>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-7 bg-gold rounded-full" />
              <h2 className="font-serif text-2xl text-foreground">縦型手すり</h2>
              <span className="text-[12px] text-muted-foreground">全 {verticals.length} 商品</span>
            </div>
            <p className="text-[13px] md:text-sm text-muted-foreground mb-8">
              定番の 25φ 丸棒から、一本ずつ火造りする Scroll・鎚目シリーズまで。
            </p>
            <ProductGrid products={verticals} />
            <div className="mt-8">
              <KaigoNotice />
            </div>
          </section>

          {/* adoの手すりの特徴 */}
          <section className="rounded-2xl bg-secondary/60 border border-border px-6 md:px-12 py-12 md:py-16">
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Why ado</p>
              <h2 className="font-serif text-[24px] md:text-[32px] text-foreground">ado の手すりが選ばれる理由</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-10 md:gap-8">
              {FEATURES.map((f) => (
                <div key={f.n}>
                  <p className="font-serif text-gold text-[14px] tracking-[0.3em] mb-3">{f.n}</p>
                  <h3 className="font-serif text-[18px] md:text-[20px] text-foreground mb-3">{f.title}</h3>
                  <p className="text-[13px] md:text-[14px] leading-[1.9] text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center mt-10 text-[13px] text-muted-foreground">
              防錆のしくみは
              <Link href="/galvanizing" className="text-gold hover:underline mx-1">溶融亜鉛メッキ</Link>
              ・
              <Link href="/paint" className="text-gold hover:underline mx-1">塗装について</Link>
              で図解しています。
            </p>
          </section>

          {/* 購入の流れ */}
          <section>
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Flow</p>
              <h2 className="font-serif text-[24px] md:text-[32px] text-foreground">ご注文からお届けまで</h2>
              <p className="text-[13px] md:text-[14px] text-muted-foreground mt-3">
                採寸から取付まで、オンラインで完結します。
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {FLOW.map((s) => (
                <div key={s.num} className="rounded-xl border border-border bg-white p-6 flex flex-col">
                  <p className="font-serif text-gold text-[13px] tracking-[0.3em]">STEP {s.num}</p>
                  <h3 className="font-serif text-[18px] text-foreground mt-2">{s.title}</h3>
                  <p className="text-[13px] leading-[1.9] text-muted-foreground mt-3 flex-1">{s.desc}</p>
                  {s.link && (
                    <Link
                      href={s.link.href}
                      className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-gold hover:underline"
                    >
                      {s.link.label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-6 text-[13px] text-muted-foreground text-center">
              長さ別の価格目安は
              <Link href="/price" className="text-gold hover:underline mx-1">価格一覧</Link>
              にまとめています。
            </p>
          </section>

          {/* CTA */}
          <section className="text-center border-t border-border pt-14">
            <p className="font-serif text-xl md:text-2xl text-foreground mb-3">
              まずは、設置場所に合う一本を。
            </p>
            <p className="text-[13px] md:text-sm text-muted-foreground mb-8 leading-relaxed">
              サイズや取付に迷ったら、設置場所のお写真を添えてご相談ください。
              <br className="hidden md:block" />
              職人本人がお答えします。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <PrimaryCTA href="/products" variant="dark" size="lg" withArrow>
                製品一覧を見る
              </PrimaryCTA>
              <PrimaryCTA href="/contact" variant="gold" size="lg" withArrow>
                無料で相談する
              </PrimaryCTA>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
