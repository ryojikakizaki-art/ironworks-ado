"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CATALOG_PRODUCTS, CATEGORIES, type CategoryKey } from "@/lib/products/catalog"
import { galleryUrl } from "@/lib/products/display"
import { ExternalLink } from "lucide-react"
import { PrimaryCTA } from "@/components/ui/primary-cta"

type FilterKey = CategoryKey | "all"

/**
 * 「どこに付けますか？」の場所別の入口。
 *
 * 検索広告（ado お問い合わせ訴求）の費用の約 8 割がサイトリンク経由でこのページに
 * 着地しているのに、上部が商品グリッドだけで「自分の場所はどれか」が分からず、
 * 相談導線もヘッダーの 1 本しか無かった（2026-08-24 の広告調査で判明）。
 * 広告のキーワードは「玄関」「階段」「屋外・バルコニー」と場所ベースなので、
 * 商品カテゴリ（横型／縦型／アプローチ）へ場所の言葉で橋渡しする。
 *
 * 場所の言い回しと写真は /handrail のガイドと揃えている（サイト内で用語をぶらさない）。
 */
const PLACES: {
  key: CategoryKey
  title: string
  desc: string
  img: string
  alt: string
  imgPos?: string
}[] = [
  {
    key: "handrail_h",
    title: "階段・廊下",
    desc: "壁に沿って長く渡す横型。階段の長さに合わせて最長 5m まで 1mm 単位で作ります。",
    img: "/images/gallery/case-1.jpg",
    alt: "コンクリート壁の廻り階段に取り付けた白い壁付け横型手すり",
    // 写真下部に紺色の床が写り込むため 42% で踊り場を中心に置く（/handrail と同じ調整）
    imgPos: "object-[50%_42%]",
  },
  {
    key: "handrail_v",
    title: "玄関・上がり框",
    desc: "立ち上がる・靴を履く動作を一点で支える縦型。丸棒から火造りの装飾まで選べます。",
    img: "/images/gallery/vertical-entrance.jpg",
    alt: "壁に垂直に取り付けた鎚目仕上げの縦型アイアン手すり",
  },
  {
    key: "approach",
    title: "屋外・アプローチ",
    desc: "溶融亜鉛メッキを重ねた二重防錆。潮風や雨の当たる外まわりにも置けます。",
    img: "/images/gallery/case-2.jpg",
    alt: "コンクリート外階段と黒いアプローチ手すりのある住宅外観の施工事例",
    // 縦長の外観写真で、肝心の手すりは下部（中央やや右）にある。
    // 既定の中央クロップだと建物だけが写って手すりが切れるため下寄せする。
    imgPos: "object-[60%_85%]",
  },
]

export default function ProductListPage() {
  const [filter, setFilter] = useState<FilterKey>("all")
  const gridRef = useRef<HTMLDivElement>(null)

  // 場所カードから絞り込む。同じページ内の遷移なので ?cat= のリンクにはせず
  // （App Router では同一ルートへの遷移で初期化用の useEffect が再実行されない）、
  // state を直接更新してグリッドまでスクロールする。
  const selectPlace = (key: CategoryKey) => {
    setFilter(key)
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // ?cat= で初期カテゴリを指定できるようにする（トップの3つの入口・カテゴリードックから使用）
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get("cat")
    if (cat && CATEGORIES.some((c) => c.key === cat)) {
      setFilter(cat as FilterKey)
    }
  }, [])

  const products = useMemo(() => {
    if (filter === "all") return CATALOG_PRODUCTS
    return CATALOG_PRODUCTS.filter((p) => p.cat === filter)
  }, [filter])

  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* Page Header */}
        <div className="border-b border-border">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Item</p>
                <h1 className="font-serif text-2xl lg:text-4xl text-foreground">製品一覧</h1>
              </div>

              {/* Filter bar */}
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setFilter(c.key as FilterKey)}
                    className={`px-3 py-1.5 text-[9px] tracking-[0.15em] uppercase border rounded-full transition-colors ${
                      filter === c.key
                        ? "border-gold text-gold bg-gold/10"
                        : "border-border text-muted-foreground hover:border-gold hover:text-gold"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== どこに付けますか？ — 場所別の入口 + 相談導線 =====
            広告の主要着地ページとしての「関連性」と「相談のしやすさ」を上げるための
            ブロック。既存のフィルタバー・グリッド・カスタムオーダー CTA は据え置き。 */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-10 lg:pt-14">
          <div className="mb-7 lg:mb-9">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">Where</p>
            <h2 className="font-serif text-[24px] lg:text-[34px] text-foreground leading-tight">
              どこに付けますか？
            </h2>
            <p className="mt-3 text-[13px] md:text-[15px] text-muted-foreground leading-relaxed max-w-[560px]">
              取り付ける場所で、選ぶ形が決まります。迷ったら写真を 1 枚送ってください。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {PLACES.map((p) => {
              const count = CATALOG_PRODUCTS.filter((x) => x.cat === p.key).length
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => selectPlace(p.key)}
                  // モバイルは写真を左に置いた横並び。縦積みにすると 3 枚で 1,200px を超え、
                  // 下の相談導線が画面から遠ざかるため（広告の着地ページとして不利）。
                  className="group flex sm:block text-left rounded-xl border border-border bg-white overflow-hidden transition-colors hover:border-gold"
                >
                  <div className="relative w-[38%] shrink-0 self-stretch sm:w-auto sm:self-auto aspect-auto sm:aspect-[4/3] bg-secondary overflow-hidden">
                    <Image
                      src={p.img}
                      alt={p.alt}
                      fill
                      sizes="(max-width: 640px) 40vw, 33vw"
                      className={`object-cover ${p.imgPos ?? ""} transition-transform duration-500 group-hover:scale-[1.03]`}
                    />
                  </div>
                  <div className="flex-1 p-4 sm:p-5 lg:p-6">
                    <h3 className="font-serif text-[19px] lg:text-[22px] text-foreground">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-[12px] tracking-[0.15em] text-gold">{count} 商品</p>
                    <p className="mt-2 sm:mt-2.5 text-[13px] md:text-[14px] text-muted-foreground leading-[1.75] sm:leading-[1.85]">
                      {p.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* 相談導線 — 広告で来た人がスクロールせずに connect できるように上部へ置く。
              商品ページと同じく LINE / 電話 / フォームの 3 本立て。 */}
          <div className="mt-8 lg:mt-10 rounded-xl border-2 border-gold/40 bg-gold/[0.04] p-5 lg:p-7">
            <p className="font-serif text-[17px] lg:text-[20px] font-bold text-foreground">
              サイズも取り付けも、決める前に相談できます
            </p>
            <p className="mt-2 text-[13px] md:text-[14px] text-muted-foreground leading-relaxed">
              「この壁に付くか」「何ミリで頼めばいいか」── 写真 1 枚で職人がお答えします。お見積もりまで無料です。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <PrimaryCTA href="https://lin.ee/Tnjukrf" external variant="line" size="md" withArrow={false}>
                LINE で写真を送る
              </PrimaryCTA>
              <PrimaryCTA href="tel:07038170659" variant="dark" size="md" withArrow={false}>
                電話で相談する
              </PrimaryCTA>
              <PrimaryCTA href="/contact" variant="gold" size="md">
                フォームで相談する
              </PrimaryCTA>
            </div>
            <p className="mt-3.5 text-[13px] md:text-[14px] text-muted-foreground">
              070-3817-0659（受付 9:00〜18:00／土日祝休）
            </p>
          </div>
        </section>

        {/* Products grid — 6列ミニマル */}
        <div ref={gridRef} className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 scroll-mt-20 lg:scroll-mt-24">
          <motion.div
            className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3"
            layout
          >
            {products.map((p) => {
              const isExternal = p.external === true
              const content = (
                <div className="group">
                  <div className="relative aspect-square overflow-hidden bg-secondary rounded-lg">
                    <Image
                      src={galleryUrl(`${p.img}.jpg`)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                    {p.badge && (
                      <span className="absolute top-1.5 left-1.5 bg-gold text-dark text-[7px] tracking-[0.15em] uppercase font-semibold px-1.5 py-0.5 rounded-sm">
                        {p.badge}
                      </span>
                    )}
                    {isExternal && (
                      <ExternalLink className="absolute top-1.5 right-1.5 w-3 h-3 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="pt-2 pb-1 px-0.5">
                    <div className="text-[11px] font-medium text-foreground leading-tight truncate group-hover:text-gold transition-colors">
                      {p.name}
                    </div>
                    {p.cat === "handrail_h" && (
                      <div className="text-[9px] text-muted-foreground mt-0.5 leading-tight">壁付け階段手すり</div>
                    )}
                    {p.price > 0 ? (
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        ¥{p.price.toLocaleString()}{p.priceFrom ? "〜" : ""}
                      </div>
                    ) : (
                      <div className="text-[10px] text-muted-foreground mt-0.5">要見積もり</div>
                    )}
                  </div>
                </div>
              )
              return isExternal ? (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noopener"
                  className="block"
                >
                  {content}
                </a>
              ) : (
                <Link key={p.name} href={p.href} className="block">
                  {content}
                </Link>
              )
            })}
          </motion.div>

          {/* Custom CTA */}
          <div className="mt-12 border border-border p-6 lg:p-8 bg-card rounded-xl grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="text-base font-light mb-1">ご要望に合わせたカスタムオーダー</div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                掲載製品以外のデザイン・サイズ・仕様にも対応します。まずはお気軽にお問い合わせください。
              </p>
            </div>
            <PrimaryCTA href="/contact" variant="gold" size="md" withShimmer={true}>
              お問い合わせ
            </PrimaryCTA>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
