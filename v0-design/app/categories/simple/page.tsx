"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Minus, Shield, Ruler, ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CATALOG_PRODUCTS } from "@/lib/products/catalog"
import { galleryUrl } from "@/lib/products/display"
import { PrimaryCTA } from "@/components/ui/primary-cta"

// シンプル手すり LP に並べる商品（12点）
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
  "/products/stair-straight",
  "/products/fence-zigzag",
] as const

const SIMPLE_PRODUCTS = SIMPLE_HREFS.map((href) => {
  const p = CATALOG_PRODUCTS.find((x) => x.href === href)
  if (!p) throw new Error(`Catalog product not found: ${href}`)
  return p
})

const FEATURES = [
  {
    icon: Minus,
    title: "直線でつくる、引き算の美",
    desc: "装飾を削ぎ落としたミニマルな造形。25φ パイプ材の絶妙な細さが、空間の余白を主役にします。",
  },
  {
    icon: Shield,
    title: "25φ STKM 材 ＋ 2 液ウレタン",
    desc: "JIS 規格の機械構造用炭素鋼鋼管（STKM）を採用。錆止め吹付塗装の上に 2 液型ウレタンを重ね、堅牢かつシックなマット仕上げに。",
  },
  {
    icon: Ruler,
    title: "オーダーメイドが基本",
    desc: "5cm 単位でご希望の長さに製作可能（最大 5m）。マットブラック／マットホワイトの 2 色から選べます。",
  },
] as const

export default function SimpleCategoryPage() {
  return (
    <>
      <Header />

      <main className="bg-white text-neutral-900">
        {/* HERO */}
        <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden">
          <Image
            src={galleryUrl("d0f5f0e83d40a4d29044.jpg")}
            alt="René シンプルアイアン手すり 25φ マットブラック 施工事例"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* 上部濃いグラデーション（ヘッダー視認性） */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 via-black/35 to-transparent" />
          {/* 全体に薄い白幕で「白の世界」を演出 */}
          <div className="absolute inset-0 bg-white/30" />
          {/* 下部白ぼかし */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/70 to-transparent" />

          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 [padding-bottom:env(safe-area-inset-bottom)]">
            <p className="text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-neutral-800 mb-6 font-medium drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]">
              SIMPLE &amp; MODERN
            </p>
            <h1 className="text-[28px] md:text-[44px] lg:text-[56px] text-neutral-950 font-light leading-[1.4] tracking-tight">
              シンプル<span className="font-normal">手すり</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[14px] md:text-[16px] leading-loose text-neutral-800">
              25φ STKM パイプ材＋2 液ウレタン塗装。<br />
              モダンでミニマル、毎日の暮らしに静かに寄り添う<br />
              定番アイアン手すり 12 種。
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
              <PrimaryCTA href="#lineup" variant="dark" size="md">
                12 商品を見る
              </PrimaryCTA>
              <PrimaryCTA href="/contact" variant="outline" size="md">
                オーダーメイド相談
              </PrimaryCTA>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="px-6 py-20 md:py-28 max-w-[1000px] mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-neutral-500 mb-5">About</p>
            <h2 className="text-[24px] md:text-[34px] leading-[1.5] text-neutral-950 font-light tracking-tight">
              手すりは、暮らしの背景でいい。
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-6 text-[15px] md:text-[16px] leading-[2.1] text-neutral-700">
            <p>
              シンプル手すりは、装飾の主張を控えた「背景に溶け込む」シリーズです。<br />
              壁の白、床の木、空気の余白を引き立てるのが役目。
            </p>
            <p>
              採用したのは <strong className="text-neutral-950 font-medium">25φ の STKM 材（機械構造用炭素鋼鋼管・JIS 規格パイプ）</strong>。安価な製品にありがちな 16φ や 19φ の頼りなさを避け、握ったときに「手のひらが安心する太さ」に揃えています。
            </p>
            <p className="text-neutral-500 text-[14px]">
              ※ 一般的な大人の人差し指が 16φ、親指が 19φ。25φ は単 2 電池より少し細いくらいの太さです。
            </p>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-6 py-20 md:py-24 bg-neutral-50 border-y border-neutral-200">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-neutral-500 mb-4">Material &amp; Make</p>
              <h2 className="text-[24px] md:text-[32px] text-neutral-950 font-light leading-[1.5] tracking-tight">
                3 つの基本仕様
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-10">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white border border-neutral-200 p-7 md:p-8 rounded-sm">
                  <Icon className="w-7 h-7 text-neutral-900 mb-5" strokeWidth={1.5} />
                  <h3 className="text-[17px] md:text-[18px] text-neutral-950 font-medium mb-3 tracking-tight">
                    {title}
                  </h3>
                  <p className="text-[14px] leading-[1.95] text-neutral-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LINEUP */}
        <section id="lineup" className="px-6 py-20 md:py-28 max-w-[1300px] mx-auto scroll-mt-24">
          <div className="text-center mb-14">
            <p className="text-[10px] tracking-[0.4em] uppercase text-neutral-500 mb-4">Lineup</p>
            <h2 className="text-[24px] md:text-[34px] text-neutral-950 font-light leading-[1.5] tracking-tight">
              シンプル手すり 12 商品
            </h2>
            <p className="mt-5 text-[14px] md:text-[15px] text-neutral-600 leading-loose max-w-2xl mx-auto">
              ¥30,000〜の Claude（縦型）から、Best Seller の René（横型）、<br />
              太径 31.8φ の Alexandre まで。全商品オーダーサイズ対応。
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {SIMPLE_PRODUCTS.map((p) => (
              <motion.div
                key={p.href}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Link href={p.href} className="group block">
                  <div className="relative aspect-square overflow-hidden bg-neutral-100 rounded-sm">
                    <Image
                      src={galleryUrl(`${p.img}.jpg`)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                    {p.badge && (
                      <span className="absolute top-2 left-2 bg-neutral-950 text-white text-[9px] tracking-[0.18em] uppercase font-medium px-2 py-0.5 rounded-sm">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="pt-3 pb-1 px-1">
                    <div className="text-[14px] md:text-[15px] text-neutral-950 font-medium leading-tight group-hover:text-neutral-600 transition-colors">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1 leading-snug">{p.sub}</div>
                    {p.price > 0 ? (
                      <div className="text-[12px] text-neutral-900 mt-1.5 tracking-wide">
                        ¥{p.price.toLocaleString()}{p.priceFrom ? "〜" : ""}
                      </div>
                    ) : (
                      <div className="text-[12px] text-neutral-500 mt-1.5">要見積もり</div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* THICKNESS COMPARISON */}
        <section className="px-6 py-20 md:py-24 bg-neutral-950 text-white">
          <div className="max-w-[1000px] mx-auto">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-neutral-400 mb-4">Why 25φ</p>
              <h2 className="text-[24px] md:text-[32px] text-white font-light leading-[1.5] tracking-tight">
                太さは、安全性と握り心地を決める。
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-[700px] mx-auto">
              <div className="text-center py-8 md:py-10 border border-neutral-800 rounded-sm">
                <div className="text-[28px] md:text-[40px] font-light text-neutral-400 mb-2">16<span className="text-[14px] md:text-[18px]">φ</span></div>
                <p className="text-[11px] md:text-[12px] text-neutral-500 leading-snug">
                  量産品によくある<br />細さ（人差し指相当）
                </p>
              </div>
              <div className="text-center py-8 md:py-10 border border-neutral-800 rounded-sm">
                <div className="text-[28px] md:text-[40px] font-light text-neutral-400 mb-2">19<span className="text-[14px] md:text-[18px]">φ</span></div>
                <p className="text-[11px] md:text-[12px] text-neutral-500 leading-snug">
                  少し太め<br />（親指相当）
                </p>
              </div>
              <div className="text-center py-8 md:py-10 border-2 border-white rounded-sm bg-white text-neutral-950">
                <div className="text-[28px] md:text-[40px] font-medium mb-2">25<span className="text-[14px] md:text-[18px]">φ</span></div>
                <p className="text-[11px] md:text-[12px] text-neutral-700 leading-snug font-medium">
                  ado 標準<br />（単 2 電池より少し細い）
                </p>
              </div>
            </div>

            <p className="mt-10 text-center text-[14px] md:text-[15px] text-neutral-400 leading-loose max-w-2xl mx-auto">
              玄関やトイレで「ぐっ」と体重を預けても、たわまず安心感のある太さ。<br />
              さらに体重をかけて使う場面では、太径 31.8φ の Alexandre もご用意しています。
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 md:py-28 bg-neutral-50">
          <div className="max-w-[800px] mx-auto text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-neutral-500 mb-5">Order &amp; Inquiry</p>
            <h2 className="text-[24px] md:text-[34px] text-neutral-950 font-light leading-[1.5] tracking-tight mb-6">
              長さ・色・取付場所をお知らせください
            </h2>
            <p className="text-[14px] md:text-[15px] leading-loose text-neutral-700 mb-10 max-w-xl mx-auto">
              ご希望のサイズ・カラー・取付場所をお伺いし、職人歴 15 年の鍛冶職人がお見積りいたします。<br />
              発送まで最短 5 日。介護保険（受領委任払）にも対応しています。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PrimaryCTA href="/contact" variant="dark" size="lg">
                お問い合わせ
              </PrimaryCTA>
              <Link
                href="/categories/antique"
                className="text-[13px] tracking-wide text-neutral-700 hover:text-neutral-950 transition-colors inline-flex items-center gap-1.5 group"
              >
                アンティーク・クラシック手すりを見る
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
