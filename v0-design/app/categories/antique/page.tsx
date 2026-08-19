"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CATALOG_PRODUCTS } from "@/lib/products/catalog"
import { galleryUrl } from "@/lib/products/display"
import { PrimaryCTA } from "@/components/ui/primary-cta"

// アンティーク・クラシック手すり LP に並べる商品（13点）
const ANTIQUE_HREFS = [
  "/products/elisabeth",
  "/products/clemence",
  "/products/european",
  "/products/fabrice",
  "/products/tsuchime",
  "/products/scroll22",
  "/products/scroll19",
  "/products/scroll16",
  "/products/emile",
  "/products/gaston",
  "/products/tsuta",
  "/products/arabesque",
  "/products/mengoshi",
] as const

const ANTIQUE_PRODUCTS = ANTIQUE_HREFS.map((href) => {
  const p = CATALOG_PRODUCTS.find((x) => x.href === href)
  if (!p) throw new Error(`Catalog product not found: ${href}`)
  return p
})

const CRAFTS = [
  {
    n: "01",
    title: "火造り鍛造",
    desc: "無垢鉄を 1000℃ まで熱し、ハンマーで叩いて形を起こす伝統技法。量産品にはない凹凸と表情が宿ります。",
  },
  {
    n: "02",
    title: "手打ち鎚目",
    desc: "表面を打ち残しなくハンマーで叩き上げて生まれる、唯一無二の鎚目。鉄は素材として強さを増し、握り心地と温かみも備わります。",
  },
  {
    n: "03",
    title: "アートアイアン",
    desc: "蔦・スクロール・アラベスクなど古典的な意匠を手仕事で組み上げる装飾鉄工。住まいの格を一段引き上げます。",
  },
] as const

export default function AntiqueCategoryPage() {
  return (
    <>
      <Header hasHero />

      {/* 背景はサイト共通 background。文字は dark。アンティークは "warm" な印象なのでセクションごとに ivory アクセントを差す */}
      <main className="bg-background text-foreground">
        {/* HERO — 写真を主役に。暗幕は最小限。 */}
        <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
          <Image
            src="/images/products/gaston/15.webp"
            alt="Gaston 極太32φ ロートアイアン手すり 階段への施工事例"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* ヘッダー視認性のための上部薄幕 */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 via-black/20 to-transparent" />
          {/* テキスト側（左）を落として可読性を確保。写真の被写体（右側の階段）は隠さない */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
          {/* 下端は白フェードで本文セクションへ繋ぐ */}
          {/* Tailwind の from/via/to は 0%/50%/100% の3点しか置けず、via の位置で
              変化率が折れて横線に見える。多段の色停止でなだらかな曲線にする（/simple と共通） */}
          <div
            className="absolute inset-x-0 bottom-0 h-48"
            style={{
              backgroundImage: [
                "linear-gradient(to top,",
                "var(--background) 0%,",
                "var(--background) 10%,",
                "color-mix(in srgb, var(--background) 90%, transparent) 26%,",
                "color-mix(in srgb, var(--background) 70%, transparent) 42%,",
                "color-mix(in srgb, var(--background) 45%, transparent) 58%,",
                "color-mix(in srgb, var(--background) 24%, transparent) 74%,",
                "color-mix(in srgb, var(--background) 9%, transparent) 88%,",
                "transparent 100%)",
              ].join(" "),
            }}
          />

          {/* HERO テキストは写真の暗部（左側）に配置。白フェードの上に置くと
              ゴールドが白背景に埋没して読めないため、下端には置かない。
              中央だと上に空白が溜まって間延びするため、上寄せにする（/simple と共通）。 */}
          <div className="absolute inset-0 flex items-start px-6 pt-28 md:pt-32 lg:pt-36">
            <div className="max-w-[1100px] w-full mx-auto">
              <p className="text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-gold-light mb-4 md:mb-6">
                Antique &amp; Classical
              </p>
              <h1 className="font-serif text-white text-[30px] md:text-[48px] lg:text-[64px] font-light leading-[1.25] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                鉄が描く曲線で<br />
                <span className="text-gold-light">住まいに格を。</span>
              </h1>
              <p className="mt-6 max-w-xl text-[14px] md:text-[16px] leading-loose text-white/85">
                鍛冶職人が一本ずつ手打ちした、本物のロートアイアン手すり 13 種。
              </p>
            </div>
          </div>
        </section>

        {/* INTRO — 単段組・余白広めの「読ませる」セクション */}
        <section className="px-6 py-24 md:py-32">
          <div className="max-w-[760px] mx-auto">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6 text-center">About</p>
            <h2 className="font-serif text-center text-[26px] md:text-[36px] leading-[1.5] font-light mb-12 md:mb-16">
              量産にはない、<br />
              一本ごとの表情。
            </h2>
            <div className="space-y-6 text-[15px] md:text-[16px] leading-[2.2] text-foreground/80">
              <p>
                市場に並ぶアイアン手すりの多くは「鍛造風」の量産パイプ材です。IRONWORKS ado のアンティーク・クラシック手すりは、無垢の鉄を炉で熱し、ハンマーで叩いて成形する <strong className="text-foreground font-medium">本物のロートアイアン（鍛鉄）</strong>。
              </p>
              <p>
                打ち跡、曲線、エンドの細りひとつまで、すべて手仕事による表情です。だからこそ「もう同じものはない」一本になります。
              </p>
              <p className="text-[13px] text-foreground/55 tracking-wide pt-2 border-t border-border">
                ※ ロートアイアンは日本語で「鍛鉄」と呼ばれ、ヨーロッパで発達した西洋鍛冶の技術です。
              </p>
            </div>
          </div>
        </section>

        {/* WORK PHOTO — フルブリードの大きな写真で「実物」を見せる */}
        {/* 正方形の写真を横長の帯に流し込むため PC ほど上下が切れる。
            画面が横長になるほど高さを増やして、切り取られる量を抑える。 */}
        <section className="relative h-[60vh] min-h-[420px] md:h-[85vh] lg:h-[92vh] w-full overflow-hidden">
          {/* ヒーロー（ガストン／室内・暗い）と対になるよう、別商品・屋外・明るい絵を置く。
              直後の Craftsmanship 03「アートアイアン」への導入も兼ねる。 */}
          {/* 既定の "public" variant は 768px で、全画面に引き伸ばすと粗くなる。
              元データは 1600px あるので w=1600 を明示して取得する。 */}
          <Image
            src={galleryUrl("ca753a1c8defc7d08da0.jpg", "w=1600")}
            alt="アプローチ手すり『蔦』 レンガ階段への施工事例"
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* キャプションの可読性のための下端の薄幕 */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
          {/* 写真だけだと間延びするため、何の商品かを示すキャプションを添える */}
          <div className="absolute inset-x-0 bottom-0 px-6 pb-10 md:pb-14">
            <div className="max-w-[1300px] mx-auto">
              <p className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-gold-light mb-2 md:mb-3">
                Art Iron
              </p>
              <Link href="/products/tsuta" className="group block">
                <span className="block font-serif text-white text-[20px] md:text-[28px] font-light leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                  アプローチ手すり『蔦』
                </span>
                <span className="mt-2 md:mt-3 block max-w-xl text-[13px] md:text-[14px] leading-relaxed text-white/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
                  無垢の丸鉄を叩いて起こした蔦のモチーフ。<br />
                  絡ませた蔓の一本一本まで手仕事で、<br />
                  玄関アプローチに草花のような佇まいを添えます。
                </span>
                <span className="mt-3 md:mt-4 inline-flex items-center gap-1.5 text-[12px] md:text-[13px] tracking-wider text-white/75 group-hover:text-gold-light transition-colors">
                  この商品を見る
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* CRAFT — 3 つの仕上げを serif 見出しで上品に */}
        <section className="px-6 py-24 md:py-32 bg-[#faf8f4]">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-16 md:mb-20">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Craftsmanship</p>
              <h2 className="font-serif text-[26px] md:text-[36px] font-light leading-[1.5]">
                職人技が生む、3 つの仕上げ
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12 md:gap-16">
              {CRAFTS.map(({ n, title, desc }) => (
                <div key={n}>
                  <p className="font-serif text-gold text-[14px] tracking-[0.3em] mb-4">{n}</p>
                  <h3 className="font-serif text-[22px] md:text-[24px] mb-5 leading-tight">{title}</h3>
                  <p className="text-[14px] leading-[2] text-foreground/75">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LINEUP — ホワイトベースのギャラリー */}
        <section id="lineup" className="px-6 py-24 md:py-32 scroll-mt-24">
          <div className="max-w-[1300px] mx-auto">
            <div className="text-center mb-16 md:mb-20">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Lineup</p>
              <h2 className="font-serif text-[26px] md:text-[36px] font-light leading-[1.5]">
                アンティーク・クラシック 13 商品
              </h2>
              <p className="mt-6 text-[14px] md:text-[15px] text-foreground/65 leading-loose max-w-xl mx-auto">
                ¥18,000 のスクロール 16φ から、職人手打ちの Élisabeth まで。全商品オーダーサイズ可。
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-8 gap-y-12 md:gap-y-16"
            >
              {ANTIQUE_PRODUCTS.map((p) => (
                <motion.div
                  key={p.href}
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Link href={p.href} className="group block">
                    {/* 商品画像は正方形。縦長（4/5）だと object-cover で左右が切れ、
                        画像内の文字（「80cm」「サイズオーダーOK」等）が欠けるため。 */}
                    <div className="relative aspect-square overflow-hidden bg-secondary">
                      <Image
                        src={galleryUrl(`${p.img}.jpg`)}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                      />
                      {p.badge && (
                        <span className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground text-[9px] tracking-[0.2em] uppercase font-medium px-2 py-1">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="pt-5">
                      <div className="font-serif text-[15px] md:text-[16px] leading-tight group-hover:text-gold transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[12px] text-foreground/55 mt-1.5 leading-snug">{p.sub}</div>
                      {p.price > 0 ? (
                        <div className="text-[12px] text-foreground mt-2 tracking-wide">
                          ¥{p.price.toLocaleString()}{p.priceFrom ? "〜" : ""}
                        </div>
                      ) : (
                        <div className="text-[12px] text-foreground/55 mt-2">要見積もり</div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CASE STUDY — Élisabeth を主役に */}
        <section className="px-6 py-24 md:py-32 bg-[#faf8f4]">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/products/elisabeth/04.jpg"
                  alt="Élisabeth 階段手すりの設置事例"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6">Case study</p>
                <h2 className="font-serif text-[26px] md:text-[36px] leading-[1.4] font-light mb-3">
                  Élisabeth
                </h2>
                <p className="text-[13px] text-foreground/60 tracking-wide mb-10">エリザベート</p>
                <div className="space-y-5 text-[15px] leading-[2.1] text-foreground/80">
                  <p>
                    オーダーメイドで階段の両側に施工した事例。階段の長さに合わせて、職人が一本ずつ熱し叩いて延ばし、現場で位置を合わせています。
                  </p>
                  <p>
                    無垢鉄を 1000℃ で赤らめ、ハンマーで成形した本物のロートアイアン。<strong className="text-foreground font-medium">¥36,000〜 / m</strong>（例：3m ¥168,000）
                  </p>
                </div>
                <div className="mt-10">
                  <Link
                    href="/products/elisabeth"
                    className="inline-flex items-center gap-2 text-[13px] tracking-[0.15em] uppercase text-foreground border-b border-foreground pb-1 hover:text-gold hover:border-gold transition-colors"
                  >
                    詳細を見る
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA — シンプルに */}
        <section className="px-6 py-24 md:py-32">
          <div className="max-w-[640px] mx-auto text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6">Order &amp; Inquiry</p>
            <h2 className="font-serif text-[26px] md:text-[36px] font-light leading-[1.4] mb-8">
              サイズ・仕上げの<br />
              ご相談を承ります
            </h2>
            <p className="text-[14px] md:text-[15px] leading-loose text-foreground/70 mb-12 max-w-md mx-auto">
              ご希望のサイズ・カラー・取付場所をお知らせください。鍛冶職人がお見積りいたします。ケアマネージャー様には介護保険（受領委任払）も対応可能です。
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <PrimaryCTA href="/contact" variant="gold" size="lg">
                お問い合わせ
              </PrimaryCTA>
              <Link
                href="/categories/simple"
                className="text-[12px] tracking-[0.2em] uppercase text-foreground/60 hover:text-foreground transition-colors inline-flex items-center gap-1.5 group"
              >
                Simple
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
