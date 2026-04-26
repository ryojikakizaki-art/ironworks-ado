"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"

const CDN = "https://imagedelivery.net/QondspN4HIUvB_R16-ddAQ/60e3e0f9c3289c7ab78f13e7"

const categories = [
  {
    id: "horizontal",
    nameEn: "Horizontal",
    nameJp: "横型手すり",
    heroImg: "d0f5f0e83d40a4d29044",
    products: [
      { name: "René", sub: "25φ 黒", img: "d0f5f0e83d40a4d29044", href: "/products/rene" },
      { name: "Claire", sub: "25φ 白", img: "0a0c0c78f9f636cca733", href: "/products/claire" },
      { name: "Marcel", sub: "FB 黒", img: "939d0690971c550c1dd9", href: "/products/marcel" },
      { name: "Émile", sub: "FB 鎚目", img: "fa95f550baa05216d291", href: "/products/emile" },
      { name: "Élisabeth", sub: "ロート 22φ", img: "9a24b2c661dea08ef6f4", href: "/products/elisabeth" },
      { name: "Clémence", sub: "L型 22φ", img: "9c1e7cf67204880a41e2", href: "/products/clemence" },
    ],
  },
  {
    id: "vertical",
    nameEn: "Vertical",
    nameJp: "縦型手すり",
    heroImg: "86278edb68c21957e339",
    products: [
      { name: "Claude", sub: "25φ 黒", img: "86278edb68c21957e339", href: "/products/claude" },
      { name: "Catherine", sub: "25φ 白", img: "8775cfcb40298257834a", href: "/products/catherine" },
      { name: "Alexandre", sub: "31.8φ 黒", img: "759848de1a99945b4d90", href: "/products/alexandre" },
      { name: "Antoine", sub: "ロング 25φ", img: "2d1043dcd7658a96e5f3", href: "/products/antoine" },
    ],
  },
  {
    id: "wrought-iron",
    nameEn: "Wrought Iron",
    nameJp: "ロートアイアン",
    heroImg: "2a64ecfb5e50e78cb374",
    products: [
      { name: "Scroll 16φ", sub: "70cm", img: "2a64ecfb5e50e78cb374", href: "/products/scroll16" },
      { name: "Scroll 19φ", sub: "70cm", img: "25b6438ea6a9393aa027", href: "/products/scroll19" },
      { name: "Scroll 22φ", sub: "80cm", img: "d09c9426e8510d2ca152", href: "/products/scroll22" },
      { name: "Fabrice", sub: "80cm", img: "66a699b295bcdb8f3598", href: "/products/fabrice" },
      { name: "鎚目", sub: "80cm", img: "569af3ee76a1999863e7", href: "/products/tsuchime" },
    ],
  },
  {
    id: "stairs",
    nameEn: "Stairs",
    nameJp: "階段",
    heroImg: "7a3358b5d7a86318eda1",
    products: [
      { name: "直線階段", sub: "オーダー", img: "7a3358b5d7a86318eda1", href: "/products/stair-straight" },
      { name: "廻り階段", sub: "力桁1本型", img: "853fb7dae26475eee4a0", href: "/products/stair-spiral" },
      { name: "外階段", sub: "かね折れ", img: "6957d69de71788107932", href: "/products/stair-outdoor" },
    ],
  },
  {
    id: "fence",
    nameEn: "Fence",
    nameJp: "フェンス",
    heroImg: "1aaca5578d6e1f890e31",
    products: [
      { name: "吹き抜けフェンス", sub: "オーダー", img: "1aaca5578d6e1f890e31", href: "/products/fence-fukinuke" },
      { name: "屋外フェンス", sub: "zigzag", img: "ff214d4dd6a4e6f0b3b1", href: "/products/fence-zigzag" },
      { name: "面格子", sub: "防犯", img: "9a7ccb077d6627266f13", href: "/products/mengoshi" },
    ],
  },
  {
    id: "gate-door",
    nameEn: "Gate & Door",
    nameJp: "ゲート・ドア",
    heroImg: "ef8821265072eeb099dc",
    products: [
      { name: "Barn Door", sub: "スライド", img: "ef8821265072eeb099dc", href: "/products/barn-door" },
      { name: "Arabesque", sub: "室内扉", img: "b8269f71f7c7462e47a1", href: "/products/arabesque" },
      { name: "ドッグゲート", sub: "H95cm", img: "f91ef98ec5690d2f9562", href: "/products/dog-gate" },
    ],
  },
  {
    id: "approach",
    nameEn: "Approach",
    nameJp: "アプローチ",
    heroImg: "579e79e794eed28d9ac7",
    products: [
      { name: "Simple 黒", sub: "FB", img: "579e79e794eed28d9ac7", href: "/products/simple-black" },
      { name: "Simple 白", sub: "FB", img: "ef1a6b4999d530d6fb67", href: "/products/simple-white" },
      { name: "蔦", sub: "亜鉛メッキ", img: "051b216ddd9e64d0ae37", href: "/products/tsuta" },
    ],
  },
  {
    id: "furniture",
    nameEn: "Furniture",
    nameJp: "家具・什器",
    heroImg: "720c42cc222961d0c4f7",
    products: [
      { name: "テーブル脚", sub: "サイズオーダー", img: "720c42cc222961d0c4f7", href: "/products/table-leg" },
      { name: "パーテーション", sub: "アクリル", img: "162201d592318f444a98", href: "/products/partition" },
      { name: "アイアンラック", sub: "棚・什器", img: "2aecc4e6b289986d9859", href: "/products/iron-rack" },
    ],
  },
]

// 斜め配置用のオフセット (偶数列は下にずらす)
const staggerOffsets = [0, 60, 20, 80, 10, 70, 30, 50]

export function LineupSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <section id="lineup" ref={ref} className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-14">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="font-serif text-3xl md:text-4xl text-dark"
          >
            Line Up
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground text-sm mt-2"
          >
            ラインナップ
          </motion.p>
        </div>

        {/* Staggered Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
          {categories.map((cat, index) => {
            const isExpanded = expandedId === cat.id
            const offset = staggerOffsets[index % staggerOffsets.length]
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.08 * index }}
                className="relative"
                style={{ marginTop: `${offset}px` }}
                onMouseEnter={() => setExpandedId(cat.id)}
                onMouseLeave={() => setExpandedId(null)}
              >
                {/* Hero Image — ホバーで縮小 */}
                <motion.div
                  animate={{ height: isExpanded ? 120 : 280 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="relative overflow-hidden bg-secondary rounded-xl cursor-pointer"
                >
                  <Image
                    src={`${CDN}/${cat.heroImg}.jpg/fit=cover,w=400,h=400`}
                    alt={cat.nameJp}
                    fill
                    className="object-cover"
                  />
                </motion.div>

                {/* Category Name */}
                <div className="mt-3">
                  <h3 className="font-serif text-lg text-dark">{cat.nameEn}</h3>
                  <p className="text-[12px] text-muted-foreground">{cat.nameJp}</p>
                </div>

                {/* Product List — ホバーで展開 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">すべて</p>
                        {cat.products.map((product) => (
                          <Link
                            key={product.name}
                            href={product.href}
                            target={product.external ? "_blank" : undefined}
                            className="group/item flex items-center gap-2 py-1.5 text-[13px] text-dark hover:text-gold transition-colors"
                          >
                            <span className="group-hover/item:translate-x-1 transition-transform duration-200">{product.name}</span>
                            <span className="text-[10px] text-muted-foreground">［{product.sub}］</span>
                            {product.external && <ExternalLink className="w-3 h-3 text-muted-foreground/40" />}
                          </Link>
                        ))}
                      </div>
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
          className="flex justify-center mt-16"
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
