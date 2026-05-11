"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Hammer, Flame, Sparkles, ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CATALOG_PRODUCTS } from "@/lib/products/catalog"
import { galleryUrl } from "@/lib/products/display"
import { PrimaryCTA } from "@/components/ui/primary-cta"

// アンティーク・クラシック手すり LP に並べる商品（11点）
// catalog.ts から該当する href を順序付きで抽出
const ANTIQUE_HREFS = [
  "/products/elisabeth",
  "/products/clemence",
  "/products/fabrice",
  "/products/tsuchime",
  "/products/scroll22",
  "/products/scroll19",
  "/products/scroll16",
  "/products/emile",
  "/products/tsuta",
  "/products/arabesque",
  "/products/mengoshi",
] as const

const ANTIQUE_PRODUCTS = ANTIQUE_HREFS.map((href) => {
  const p = CATALOG_PRODUCTS.find((x) => x.href === href)
  if (!p) throw new Error(`Catalog product not found: ${href}`)
  return p
})

// 手打ち・装飾の世界観を支える 3 つの製法
const PROCESSES = [
  {
    icon: Flame,
    title: "火造り鍛造",
    desc: "無垢鉄を 1000℃ まで加熱して赤らめ、鍛冶職人の手と熟練の感覚でハンマー成形する伝統技法。量産品にはない凹凸と表情が宿ります。",
  },
  {
    icon: Hammer,
    title: "手打ち鎚目",
    desc: "表面を打ち残しなくハンマーで叩き上げて生まれる、唯一無二の鎚目。鉄は素材として強さを増し、握り心地と温かみも備わります。",
  },
  {
    icon: Sparkles,
    title: "アートアイアン",
    desc: "蔦・スクロール・アラベスクなど、古典的な意匠を職人が手仕事で組み上げる装飾鉄工。住まいの格を一段引き上げる存在感を持ちます。",
  },
] as const

export default function AntiqueCategoryPage() {
  return (
    <>
      <Header />

      <main className="bg-[#0a0907] text-[#f0e6d2]">
        {/* HERO */}
        <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden">
          <Image
            src="/images/products/elisabeth/02.jpg"
            alt="Élisabeth ロートアイアン手すり 階段への施工事例"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* 上部濃いグラデーション（ヘッダー視認性） */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/90 via-black/55 to-transparent" />
          {/* メイン暗幕 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/85" />

          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 [padding-bottom:env(safe-area-inset-bottom)]">
            <p className="text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-[#c9a96b] mb-6">
              ANTIQUE &amp; CLASSICAL
            </p>
            <h1 className="font-serif text-[28px] md:text-[44px] lg:text-[56px] text-white font-light leading-[1.4] tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              アンティーク・クラシック<br className="md:hidden" />
              <span className="text-[#e0c787]">手すり</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[14px] md:text-[16px] leading-loose text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              鍛造の凹凸、手打ちの鎚目、装飾の意匠──<br />
              職人歴 15 年の鍛冶職人が一本ずつ手打ちした<br />
              本物のロートアイアン手すり 11 種
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
              <PrimaryCTA href="#lineup" variant="gold-glass" size="md">
                11 商品を見る
              </PrimaryCTA>
              <PrimaryCTA href="/contact" variant="ghost-light" size="md">
                オーダーメイド相談
              </PrimaryCTA>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="px-6 py-20 md:py-28 max-w-[1100px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#c9a96b] mb-5">About</p>
              <h2 className="font-serif text-[24px] md:text-[34px] leading-[1.5] text-white font-light mb-8">
                量産にはない、<br />
                <span className="text-[#e0c787]">一本ごとの表情。</span>
              </h2>
              <div className="space-y-5 text-[15px] md:text-[16px] leading-[2] text-[#d8c9a8]">
                <p>
                  アイアン手すりの世界では「鍛造風」の量産パイプ材がほとんどです。<br />
                  IRONWORKS ado のアンティーク・クラシック手すりは、無垢の鉄を職人が炉で熱し、ハンマーで叩いて成形する <strong className="text-white font-medium">本物のロートアイアン（鍛鉄）</strong>。
                </p>
                <p>
                  打ち跡、曲線、エンドの細りひとつまで、すべて手仕事による表情です。だからこそ「もう同じものはない」一本になります。
                </p>
                <p className="text-[14px] text-[#c9a96b] tracking-wide">
                  ロートアイアンは日本語で「鍛鉄」と呼ばれ、ヨーロッパで発達した西洋鍛冶の技術です。
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src="/images/products/elisabeth/03.jpg"
                alt="Élisabeth ロートアイアン手すりのスクロール意匠クローズアップ"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-[#c9a96b]/20" />
            </div>
          </div>
        </section>

        {/* PROCESS — 3 columns */}
        <section className="px-6 py-20 md:py-24 bg-[#14110d] border-y border-[#2a221a]">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#c9a96b] mb-4">Process</p>
              <h2 className="font-serif text-[24px] md:text-[32px] text-white font-light leading-[1.5]">
                職人技が生む、3 つの仕上げ
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {PROCESSES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-[#1c1814] border border-[#2a221a] p-7 md:p-8 rounded-sm hover:border-[#c9a96b]/40 transition-colors"
                >
                  <Icon className="w-7 h-7 text-[#c9a96b] mb-5" strokeWidth={1.5} />
                  <h3 className="font-serif text-[18px] md:text-[20px] text-white mb-3 tracking-wide">
                    {title}
                  </h3>
                  <p className="text-[14px] leading-[1.95] text-[#bfae8a]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LINEUP */}
        <section id="lineup" className="px-6 py-20 md:py-28 max-w-[1300px] mx-auto scroll-mt-24">
          <div className="text-center mb-14">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#c9a96b] mb-4">Lineup</p>
            <h2 className="font-serif text-[24px] md:text-[34px] text-white font-light leading-[1.5]">
              アンティーク・クラシック 11 商品
            </h2>
            <p className="mt-5 text-[14px] md:text-[15px] text-[#bfae8a] leading-loose max-w-2xl mx-auto">
              ¥18,000 のスクロール 16φ から、職人手打ち¥149,000 の Élisabeth まで。<br />
              全商品オーダーサイズ可。
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
            {ANTIQUE_PRODUCTS.map((p) => (
              <motion.div
                key={p.href}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Link href={p.href} className="group block">
                  <div className="relative aspect-square overflow-hidden bg-[#1c1814] rounded-sm">
                    <Image
                      src={galleryUrl(`${p.img}.jpg`)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                    {p.badge && (
                      <span className="absolute top-2 left-2 bg-[#c9a96b] text-[#0a0907] text-[9px] tracking-[0.18em] uppercase font-semibold px-2 py-0.5 rounded-sm">
                        {p.badge}
                      </span>
                    )}
                    <div className="absolute inset-0 ring-1 ring-inset ring-[#c9a96b]/10 group-hover:ring-[#c9a96b]/30 transition" />
                  </div>
                  <div className="pt-3 pb-1 px-1">
                    <div className="font-serif text-[14px] md:text-[15px] text-white leading-tight group-hover:text-[#e0c787] transition-colors">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-[#9d8c6b] mt-1 leading-snug">{p.sub}</div>
                    {p.price > 0 ? (
                      <div className="text-[12px] text-[#c9a96b] mt-1.5 tracking-wide">
                        ¥{p.price.toLocaleString()}{p.priceFrom ? "〜" : ""}
                      </div>
                    ) : (
                      <div className="text-[12px] text-[#9d8c6b] mt-1.5">要見積もり</div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* USE CASES */}
        <section className="px-6 py-20 md:py-24 bg-[#14110d] border-y border-[#2a221a]">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#c9a96b] mb-4">For your home</p>
              <h2 className="font-serif text-[24px] md:text-[32px] text-white font-light leading-[1.5]">
                こんな住まいに似合います
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#1c1814] border border-[#2a221a] p-8 rounded-sm">
                <p className="text-[11px] tracking-[0.3em] uppercase text-[#c9a96b] mb-3">Use 01</p>
                <h3 className="font-serif text-[20px] text-white mb-4">アンティーク調の住宅</h3>
                <p className="text-[14px] leading-[2] text-[#bfae8a]">
                  漆喰壁・無垢材フローリング・古道具を集めた住まいに、火造り鍛造のスクロールや鎚目フラットバーを。床と同じく、年を重ねるほどに味が出る素材です。
                </p>
              </div>
              <div className="bg-[#1c1814] border border-[#2a221a] p-8 rounded-sm">
                <p className="text-[11px] tracking-[0.3em] uppercase text-[#c9a96b] mb-3">Use 02</p>
                <h3 className="font-serif text-[20px] text-white mb-4">クラシカルな邸宅・別荘</h3>
                <p className="text-[14px] leading-[2] text-[#bfae8a]">
                  Élisabeth や蔦のアートアイアンを階段やアプローチに。鋳物では出せない一本ずつの曲線と、職人手打ちの存在感が空間の格を整えます。
                </p>
              </div>
              <div className="bg-[#1c1814] border border-[#2a221a] p-8 rounded-sm">
                <p className="text-[11px] tracking-[0.3em] uppercase text-[#c9a96b] mb-3">Use 03</p>
                <h3 className="font-serif text-[20px] text-white mb-4">和洋折衷・古民家リノベ</h3>
                <p className="text-[14px] leading-[2] text-[#bfae8a]">
                  ロートアイアンは洋風だけのものではありません。古民家の漆黒の梁と、銀古美仕上げの Émile やミツロウ仕上げの Scroll は驚くほど調和します。
                </p>
              </div>
              <div className="bg-[#1c1814] border border-[#2a221a] p-8 rounded-sm">
                <p className="text-[11px] tracking-[0.3em] uppercase text-[#c9a96b] mb-3">Use 04</p>
                <h3 className="font-serif text-[20px] text-white mb-4">ホテル・店舗・カフェ</h3>
                <p className="text-[14px] leading-[2] text-[#bfae8a]">
                  Arabesque Gate やオーダーフェンスで、空間に意匠を効かせる導入も承ります。サイズ・形状はオーダーメイドでお作りいたします。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CASE STUDY */}
        <section className="px-6 py-20 md:py-28 max-w-[1100px] mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm order-2 md:order-1">
              <Image
                src="/images/products/elisabeth/04.jpg"
                alt="Élisabeth 階段手すりの設置事例"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-[#c9a96b]/20" />
            </div>
            <div className="order-1 md:order-2">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#c9a96b] mb-5">Case study</p>
              <h2 className="font-serif text-[24px] md:text-[32px] leading-[1.5] text-white font-light mb-8">
                Élisabeth<br />
                <span className="text-[#e0c787] text-[20px] md:text-[24px]">エリザベート</span>
              </h2>
              <div className="space-y-5 text-[15px] leading-[2] text-[#d8c9a8]">
                <p>
                  オーダーメイドで階段の両側に施工した事例。階段の長さに合わせて、職人が一本ずつ熱し叩いて延ばし、現場で位置を合わせています。
                </p>
                <p>
                  写真の手すりは無垢鉄を 1000℃ で赤らめ、ハンマーで成形した本物のロートアイアン。<strong className="text-white font-medium">¥149,000〜</strong> から。
                </p>
              </div>
              <div className="mt-8">
                <PrimaryCTA href="/products/elisabeth" variant="outline" size="md" className="!bg-transparent !border-[#c9a96b] !text-[#e0c787] hover:!bg-[#c9a96b] hover:!text-[#0a0907]">
                  Élisabeth の詳細を見る
                </PrimaryCTA>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 md:py-28 bg-gradient-to-b from-[#14110d] to-[#0a0907] border-t border-[#2a221a]">
          <div className="max-w-[800px] mx-auto text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#c9a96b] mb-5">Order &amp; Inquiry</p>
            <h2 className="font-serif text-[24px] md:text-[34px] text-white font-light leading-[1.5] mb-6">
              サイズ・仕上げのご相談を<br />承ります
            </h2>
            <p className="text-[14px] md:text-[15px] leading-loose text-[#bfae8a] mb-10 max-w-xl mx-auto">
              ご希望のサイズ・カラー・取付場所をお知らせください。職人歴 15 年の鍛冶職人がお見積りいたします。<br />
              ケアマネージャー・福祉用具事業者様には介護保険（受領委任払）も対応可能です。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PrimaryCTA href="/contact" variant="gold" size="lg">
                お問い合わせ
              </PrimaryCTA>
              <Link
                href="/categories/simple"
                className="text-[13px] tracking-wide text-[#c9a96b] hover:text-[#e0c787] transition-colors inline-flex items-center gap-1.5 group"
              >
                シンプル手すりを見る
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
