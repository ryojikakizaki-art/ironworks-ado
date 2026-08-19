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

// シンプル手すり LP に並べる商品（13点）
const SIMPLE_HREFS = [
  "/products/rene",        // Best Seller・25φ 横型 ブラック
  "/products/claire",      // 25φ 横型 ホワイト
  "/products/catherine",   // 25φ 縦型 ホワイト
  "/products/claude",      // 25φ 縦型 ブラック
  "/products/alexandre",   // 31.8φ 縦型 太径
  "/products/antoine",     // 25φ 縦型ロング
  "/products/marcel",      // フラットバー 横型
  "/products/simple-black",
  "/products/simple-white",
  "/products/barn-door",
  "/products/laurent",       // フラットバー 9×38 階段手摺
  "/products/stair-straight",
  "/products/fence-zigzag",
] as const

const SIMPLE_PRODUCTS = SIMPLE_HREFS.map((href) => {
  const p = CATALOG_PRODUCTS.find((x) => x.href === href)
  if (!p) throw new Error(`Catalog product not found: ${href}`)
  return p
})

export default function SimpleCategoryPage() {
  return (
    <>
      <Header hasHero />

      <main className="bg-background text-foreground">
        {/* HERO — /antique と同じオーバーレイ型。写真の暗部に文字を重ね、下端は
            白フェードで本文セクションへ繋ぐ。 */}
        <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
          {/* 元写真の上 22% を落として書き出し済み（手の最上端が画像の 41% に来る）。
              縦位置を object-position で寄せる方法は画面の縦横比によって効かないため使わない。
              横位置は、縦長のウィンドウで左右が切られたときに手の甲が残るよう左寄りにする
              （手は画像の 0.7%〜37.9% にある）。ファイル名の -v2 はキャッシュ避け。 */}
          <Image
            src="/images/categories/simple-hero-black-v2.webp"
            alt="René シンプルアイアン手すり 25φ マットブラックを握ったところ"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[30%_center] md:object-[12%_center]"
          />
          {/* ヘッダー視認性のための上部薄幕 */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 via-black/20 to-transparent" />
          {/* テキスト側（左）を落として可読性を確保 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
          {/* 下端は白フェードで本文セクションへ繋ぐ。
              Tailwind の from/via/to は 0%/50%/100% の3点しか置けず、via の位置で
              変化率が折れて横線に見えてしまう。多段の色停止でなだらかな曲線にする。 */}
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

          {/* 見出しは写真上部の平らな壁面へ。中央だと手すり・手と重なる。 */}
          <div className="absolute inset-0 flex items-start px-6 pt-28 md:pt-32 lg:pt-36">
            <div className="max-w-[1100px] w-full mx-auto">
              <p className="text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-gold-light mb-4 md:mb-6">
                Simple &amp; Modern
              </p>
              <h1 className="font-serif text-white text-[30px] md:text-[48px] lg:text-[60px] font-light leading-[1.25] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                直線でつくる、<br />
                引き算の美しさ。
              </h1>
              <p className="mt-6 max-w-xl text-[14px] md:text-[16px] leading-loose text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
                25φ STKM パイプ材＋2 液ウレタン塗装。<br />
                モダンでミニマル、定番アイアン手すり 13 種。
              </p>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="px-6 py-24 md:py-32">
          <div className="max-w-[760px] mx-auto">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6 text-center">About</p>
            <h2 className="font-serif text-center text-[26px] md:text-[36px] leading-[1.5] font-light mb-12 md:mb-16">
              暮らしの背景に、<br />
              静かに寄り添う。
            </h2>
            <div className="space-y-6 text-[15px] md:text-[16px] leading-[2.2] text-foreground/80">
              <p>
                シンプル手すりは、装飾の主張を控えた「背景に溶け込む」シリーズ。壁の白、床の木、空気の余白を引き立てるのが役目です。
              </p>
              <p>
                採用したのは <strong className="text-foreground font-medium">25φ の STKM 材（機械構造用炭素鋼鋼管・JIS 規格パイプ）</strong>。安価な製品にありがちな 16φ や 19φ の頼りなさを避け、握ったときに「手のひらが安心する太さ」に揃えています。
              </p>
              <p className="text-[13px] text-foreground/55 tracking-wide pt-2 border-t border-border">
                ※ 一般的な大人の人差し指が 16φ、親指が 19φ。25φ は単 2 電池より少し細いくらいの太さです。
              </p>
            </div>
          </div>
        </section>

        {/* WORK PHOTO — フルブリードの大きな写真 */}
        <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
          {/* 座金が中央にあるので、スマホで左右が切れても構図が崩れない */}
          <Image
            src="/images/categories/simple-work-white.webp"
            alt="Claire シンプルアイアン手すり 25φ マットホワイトのブラケット"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </section>

        {/* SPEC — 製品仕様を 3 段組で */}
        <section className="px-6 py-24 md:py-32 bg-[#faf8f4]">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-16 md:mb-20">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Material &amp; Make</p>
              <h2 className="font-serif text-[26px] md:text-[36px] font-light leading-[1.5]">
                3 つの基本仕様
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12 md:gap-16">
              <div>
                <p className="font-serif text-foreground/60 text-[14px] tracking-[0.3em] mb-4">01</p>
                <h3 className="font-serif text-[20px] md:text-[22px] mb-5 leading-tight">25φ STKM 材</h3>
                <p className="text-[14px] leading-[2] text-foreground/75">
                  JIS 規格の機械構造用炭素鋼鋼管（STKM）を採用。安価な 16φ・19φ に比べ「手のひらが安心する太さ」を確保しています。
                </p>
              </div>
              <div>
                <p className="font-serif text-foreground/60 text-[14px] tracking-[0.3em] mb-4">02</p>
                <h3 className="font-serif text-[20px] md:text-[22px] mb-5 leading-tight">2 液ウレタン塗装</h3>
                <p className="text-[14px] leading-[2] text-foreground/75">
                  錆止め吹付塗装の上に 2 液型ウレタンを重ね、堅牢で深みのあるマット仕上げに。マットブラックとマットホワイトの 2 色から選べます。
                </p>
              </div>
              <div>
                <p className="font-serif text-foreground/60 text-[14px] tracking-[0.3em] mb-4">03</p>
                <h3 className="font-serif text-[20px] md:text-[22px] mb-5 leading-tight">オーダーメイド</h3>
                <p className="text-[14px] leading-[2] text-foreground/75">
                  5cm 単位でご希望の長さに製作可能（最大 5m）。ブラケット位置・座金タイプも住宅設計に合わせて調整できます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LINEUP */}
        <section id="lineup" className="px-6 py-24 md:py-32 scroll-mt-24">
          <div className="max-w-[1300px] mx-auto">
            <div className="text-center mb-16 md:mb-20">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Lineup</p>
              <h2 className="font-serif text-[26px] md:text-[36px] font-light leading-[1.5]">
                シンプル手すり 13 商品
              </h2>
              <p className="mt-6 text-[14px] md:text-[15px] text-foreground/65 leading-loose max-w-xl mx-auto">
                ¥30,000〜の Claude から、Best Seller の René、太径 31.8φ の Alexandre まで。全商品オーダーサイズ対応。
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-8 gap-y-12 md:gap-y-16"
            >
              {SIMPLE_PRODUCTS.map((p) => (
                <motion.div
                  key={p.href}
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Link href={p.href} className="group block">
                    {/* 商品画像は正方形。縦長（4/5）だと object-cover で左右が切れ、
                        画像内の文字（「1.5mまで一律」等）が欠けるため。
                        アンティーク・クラシック側と揃えている。 */}
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
                      <div className="font-serif text-[15px] md:text-[16px] leading-tight group-hover:text-foreground/60 transition-colors">
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

        {/* THICKNESS COMPARISON — ミニマル設計 */}
        <section className="px-6 py-24 md:py-32 bg-[#faf8f4]">
          <div className="max-w-[900px] mx-auto">
            <div className="text-center mb-16 md:mb-20">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Why 25φ</p>
              <h2 className="font-serif text-[26px] md:text-[36px] font-light leading-[1.5]">
                太さは、安全性と<br className="md:hidden" />握り心地を決める。
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-[700px] mx-auto">
              <div className="text-center">
                <div className="font-serif text-[36px] md:text-[56px] font-light text-foreground/40 mb-3 leading-none">16<span className="text-[16px] md:text-[20px]">φ</span></div>
                <p className="text-[11px] md:text-[12px] text-foreground/55 leading-snug">
                  量産品の細さ<br />（人差し指相当）
                </p>
              </div>
              <div className="text-center">
                <div className="font-serif text-[36px] md:text-[56px] font-light text-foreground/40 mb-3 leading-none">19<span className="text-[16px] md:text-[20px]">φ</span></div>
                <p className="text-[11px] md:text-[12px] text-foreground/55 leading-snug">
                  少し太め<br />（親指相当）
                </p>
              </div>
              <div className="text-center">
                <div className="font-serif text-[36px] md:text-[56px] text-foreground mb-3 leading-none">25<span className="text-[16px] md:text-[20px]">φ</span></div>
                <p className="text-[11px] md:text-[12px] text-foreground leading-snug font-medium">
                  ado 標準<br />（単 2 電池相当）
                </p>
              </div>
            </div>

            <p className="mt-16 text-center text-[14px] md:text-[15px] text-foreground/65 leading-loose max-w-2xl mx-auto">
              玄関やトイレで「ぐっ」と体重を預けても、たわまず安心感のある太さ。さらに体重をかけて使う場面では、太径 31.8φ の Alexandre もご用意しています。
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24 md:py-32">
          <div className="max-w-[640px] mx-auto text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-6">Order &amp; Inquiry</p>
            <h2 className="font-serif text-[26px] md:text-[36px] font-light leading-[1.4] mb-8">
              長さ・色・取付場所を<br />お知らせください
            </h2>
            <p className="text-[14px] md:text-[15px] leading-loose text-foreground/70 mb-12 max-w-md mx-auto">
              ご希望のサイズ・カラー・取付場所をお伺いし、鍛冶職人がお見積りいたします。発送まで最短 5 日。介護保険（受領委任払）にも対応しています。
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <PrimaryCTA href="/contact" variant="dark" size="lg">
                お問い合わせ
              </PrimaryCTA>
              <Link
                href="/categories/antique"
                className="text-[12px] tracking-[0.2em] uppercase text-foreground/60 hover:text-foreground transition-colors inline-flex items-center gap-1.5 group"
              >
                Antique &amp; Classical
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
