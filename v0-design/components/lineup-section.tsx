"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Minus, GripVertical, Sparkles, ArrowUpDown, DoorOpen, LayoutGrid, ExternalLink } from "lucide-react"

const CDN = "https://imagedelivery.net/QondspN4HIUvB_R16-ddAQ/60e3e0f9c3289c7ab78f13e7"

const categories = [
  {
    id: "horizontal",
    icon: Minus,
    nameEn: "Horizontal",
    nameJp: "横型手すり",
    desc: "壁付け丸パイプ・フラットバー",
    products: [
      { name: "René", sub: "25φ 黒", img: "d0f5f0e83d40a4d29044", href: "/products/rene" },
      { name: "Claire", sub: "25φ 白", img: "0a0c0c78f9f636cca733", href: "/products/claire" },
      { name: "Marcel", sub: "FB 黒", img: "939d0690971c550c1dd9", href: "/products/marcel" },
      { name: "Émile", sub: "FB 鎚目", img: "fa95f550baa05216d291", href: "/products/emile" },
      { name: "Élisabeth", sub: "ロート 22φ", img: "9a24b2c661dea08ef6f4", href: "https://ironworks-ado.stores.jp/items/63ea2bfd34e01709f8fa4ac9", external: true },
      { name: "Clémence", sub: "L型 22φ", img: "9c1e7cf67204880a41e2", href: "https://ironworks-ado.stores.jp/items/68f839882fa52af95b4e403e", external: true },
    ],
  },
  {
    id: "vertical",
    icon: GripVertical,
    nameEn: "Vertical",
    nameJp: "縦型手すり",
    desc: "壁付け縦型・ロング",
    products: [
      { name: "Claude", sub: "25φ 黒", img: "86278edb68c21957e339", href: "/products/claude" },
      { name: "Catherine", sub: "25φ 白", img: "8775cfcb40298257834a", href: "/products/catherine" },
      { name: "Alexandre", sub: "31.8φ 黒", img: "759848de1a99945b4d90", href: "/products/alexandre" },
      { name: "Antoine", sub: "ロング 25φ", img: "2d1043dcd7658a96e5f3", href: "/products/antoine" },
    ],
  },
  {
    id: "wrought-iron",
    icon: Sparkles,
    nameEn: "Wrought Iron",
    nameJp: "ロートアイアン",
    desc: "無垢鉄・火造り鍛造",
    products: [
      { name: "Scroll 16φ", sub: "70cm", img: "2a64ecfb5e50e78cb374", href: "/products/scroll16" },
      { name: "Scroll 19φ", sub: "70cm", img: "25b6438ea6a9393aa027", href: "/products/scroll19" },
      { name: "Scroll 22φ", sub: "80cm", img: "d09c9426e8510d2ca152", href: "/products/scroll22" },
      { name: "Fabrice", sub: "80cm", img: "66a699b295bcdb8f3598", href: "/products/fabrice" },
      { name: "鎚目", sub: "80cm", img: "569af3ee76a1999863e7", href: "/products/tsuchime" },
    ],
  },
  {
    id: "stairs-fence",
    icon: ArrowUpDown,
    nameEn: "ArrowUpDown & Fence",
    nameJp: "階段・フェンス",
    desc: "スケルトン階段・フェンス",
    products: [
      { name: "直線階段", sub: "オーダー", img: "7a3358b5d7a86318eda1", href: "https://ironworks-ado.stores.jp/items/6458a2646e44950030b06a70", external: true },
      { name: "廻り階段", sub: "オーダー", img: "853fb7dae26475eee4a0", href: "https://ironworks-ado.stores.jp/items/645b965813edcc003101fec5", external: true },
      { name: "吹き抜けフェンス", sub: "オーダー", img: "1aaca5578d6e1f890e31", href: "https://ironworks-ado.stores.jp/items/63eaf4431c151869487fdc83", external: true },
    ],
  },
  {
    id: "gate-door",
    icon: DoorOpen,
    nameEn: "Gate & Door",
    nameJp: "ゲート・ドア",
    desc: "バーンドア・アラベスク",
    products: [
      { name: "Barn Door", sub: "スライド", img: "ef8821265072eeb099dc", href: "https://ironworks-ado.stores.jp/items/689dc80a62bb05fe83b69ed0", external: true },
      { name: "Arabesque", sub: "室内扉", img: "b8269f71f7c7462e47a1", href: "https://ironworks-ado.stores.jp/items/67bd6f532a10e40a2e61cc20", external: true },
      { name: "ドッグゲート", sub: "H95cm", img: "f91ef98ec5690d2f9562", href: "https://ironworks-ado.stores.jp/items/645a32986ebf640035c692b3", external: true },
    ],
  },
  {
    id: "others",
    icon: LayoutGrid,
    nameEn: "Others",
    nameJp: "その他",
    desc: "アプローチ・家具・什器",
    products: [
      { name: "アプローチ 黒", sub: "FB", img: "579e79e794eed28d9ac7", href: "https://ironworks-ado.stores.jp/items/678f8682c6500803fc924386", external: true },
      { name: "アプローチ 蔦", sub: "亜鉛メッキ", img: "051b216ddd9e64d0ae37", href: "https://ironworks-ado.stores.jp/items/64584887edfbca00302b343f", external: true },
      { name: "テーブル脚", sub: "サイズオーダー", img: "720c42cc222961d0c4f7", href: "https://ironworks-ado.stores.jp/items/64cc5d6bf55a3000329bb450", external: true },
    ],
  },
]

export function LineupSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <section id="lineup" ref={ref} className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-3"
          >
            Line Up
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-[28px] md:text-[32px] text-dark"
          >
            ラインナップ
          </motion.h2>
        </div>

        {/* Category Grid — アイコン中心 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((cat, index) => {
            const isExpanded = expandedId === cat.id
            const Icon = cat.icon
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.06 }}
                className="relative"
                onMouseEnter={() => setExpandedId(cat.id)}
                onMouseLeave={() => setExpandedId(null)}
              >
                {/* Icon Card */}
                <div className={`relative flex flex-col items-center justify-center py-8 px-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isExpanded
                    ? "bg-dark text-white border-dark shadow-xl scale-105"
                    : "bg-white text-dark border-border hover:border-gold hover:shadow-md"
                }`}>
                  <Icon className={`w-8 h-8 mb-3 transition-colors duration-300 ${isExpanded ? "text-gold" : "text-muted-foreground"}`} strokeWidth={1.5} />
                  <h3 className="font-serif text-sm md:text-base text-center leading-tight">{cat.nameJp}</h3>
                  <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground mt-1">{cat.nameEn}</span>
                  <p className={`text-[10px] mt-2 transition-colors duration-300 ${isExpanded ? "text-white/60" : "text-muted-foreground"}`}>{cat.desc}</p>
                </div>

                {/* Radial Product Expansion */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50"
                    >
                      <div className="bg-white rounded-2xl shadow-2xl border border-border p-4 min-w-[280px]">
                        <div className="flex flex-wrap justify-center gap-3">
                          {cat.products.map((product, pIdx) => (
                            <motion.div
                              key={product.name}
                              initial={{ opacity: 0, y: 10, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.2, delay: pIdx * 0.05 }}
                            >
                              <Link
                                href={product.href}
                                target={product.external ? "_blank" : undefined}
                                className="group/item flex flex-col items-center w-[72px]"
                              >
                                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-secondary ring-2 ring-transparent group-hover/item:ring-gold transition-all duration-200 shadow-sm">
                                  <Image
                                    src={`${CDN}/${product.img}.jpg/fit=cover,w=120,h=120`}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <span className="text-[10px] text-dark text-center mt-1.5 leading-tight group-hover/item:text-gold transition-colors">
                                  {product.name}
                                </span>
                                <span className="text-[8px] text-muted-foreground">{product.sub}</span>
                                {product.external && (
                                  <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/50 mt-0.5" />
                                )}
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      {/* Arrow pointing up to card */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-border rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* All Products Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex justify-center mt-12"
        >
          <Link href="/products" className="group inline-flex items-center gap-3 px-8 py-3 border border-dark text-dark text-sm tracking-wider hover:bg-dark hover:text-white transition-all duration-300">
            <span>すべての製品を見る</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
