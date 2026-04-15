"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const CDN = "https://imagedelivery.net/QondspN4HIUvB_R16-ddAQ/60e3e0f9c3289c7ab78f13e7"

const categories = [
  {
    id: "horizontal",
    nameEn: "Horizontal",
    nameJp: "横型手すり",
    image: `${CDN}/d0f5f0e83d40a4d29044.jpg/public`,
    size: "large",
    products: [
      { name: "René", image: `${CDN}/d0f5f0e83d40a4d29044.jpg/fit=cover,w=200,h=200` },
      { name: "Claire", image: `${CDN}/0a0c0c78f9f636cca733.jpg/fit=cover,w=200,h=200` },
      { name: "Marcel", image: `${CDN}/939d0690971c550c1dd9.jpg/fit=cover,w=200,h=200` },
    ],
  },
  {
    id: "vertical",
    nameEn: "Vertical",
    nameJp: "縦型手すり",
    image: `${CDN}/86278edb68c21957e339.jpg/public`,
    size: "large",
    products: [
      { name: "Claude", image: `${CDN}/86278edb68c21957e339.jpg/fit=cover,w=200,h=200` },
      { name: "Antoine", image: `${CDN}/2d1043dcd7658a96e5f3.jpg/fit=cover,w=200,h=200` },
      { name: "Marie", image: `${CDN}/87e67f50ff23dceb4f20.jpg/fit=cover,w=200,h=200` },
    ],
  },
  {
    id: "wrought-iron",
    nameEn: "Wrought Iron",
    nameJp: "ロートアイアン",
    image: `${CDN}/2a64ecfb5e50e78cb374.jpg/public`,
    size: "small",
    products: [
      { name: "Scroll 16φ", image: `${CDN}/2a64ecfb5e50e78cb374.jpg/fit=cover,w=200,h=200` },
      { name: "Scroll 19φ", image: `${CDN}/ef8821265072eeb099dc.jpg/fit=cover,w=200,h=200` },
    ],
  },
  {
    id: "stairs-fence",
    nameEn: "Stairs & Fence",
    nameJp: "階段・フェンス",
    image: `${CDN}/579e79e794eed28d9ac7.jpg/public`,
    size: "small",
    products: [
      { name: "階段手すり", image: `${CDN}/579e79e794eed28d9ac7.jpg/fit=cover,w=200,h=200` },
      { name: "フェンス", image: `${CDN}/720c42cc222961d0c4f7.jpg/fit=cover,w=200,h=200` },
    ],
  },
  {
    id: "gate-door",
    nameEn: "Gate & Door",
    nameJp: "ゲート・ドア",
    image: `${CDN}/ef8821265072eeb099dc.jpg/public`,
    size: "small",
    products: [
      { name: "ゲート", image: `${CDN}/ef8821265072eeb099dc.jpg/fit=cover,w=200,h=200` },
      { name: "ドア", image: `${CDN}/720c42cc222961d0c4f7.jpg/fit=cover,w=200,h=200` },
    ],
  },
  {
    id: "others",
    nameEn: "Others",
    nameJp: "その他",
    image: `${CDN}/720c42cc222961d0c4f7.jpg/public`,
    size: "small",
    products: [
      { name: "テーブル脚", image: `${CDN}/720c42cc222961d0c4f7.jpg/fit=cover,w=200,h=200` },
      { name: "装飾品", image: `${CDN}/579e79e794eed28d9ac7.jpg/fit=cover,w=200,h=200` },
    ],
  },
]

export function LineupSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const largeCategories = categories.filter(c => c.size === "large")
  const smallCategories = categories.filter(c => c.size === "small")

  const CategoryTile = ({ category, isLarge }: { category: typeof categories[0], isLarge: boolean }) => {
    const isExpanded = expandedId === category.id

    return (
      <motion.div
        className="group cursor-pointer relative"
        onMouseEnter={() => setExpandedId(category.id)}
        onMouseLeave={() => setExpandedId(null)}
        layout
      >
        <motion.div
          className={`relative overflow-hidden bg-secondary transition-colors duration-500 ${isLarge ? "aspect-[4/3]" : "aspect-square"}`}
          animate={{
            height: isExpanded ? (isLarge ? "calc(100% + 100px)" : "calc(100% + 80px)") : "100%"
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Image
            src={category.image}
            alt={category.nameJp}
            fill
            className={`transition-all duration-500 ease-out ${
              isExpanded ? "object-contain p-2" : "object-cover"
            }`}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-dark/30 group-hover:bg-dark/20 transition-colors duration-500" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6">
            <div>
              <span className={`tracking-[0.25em] text-white/70 uppercase mb-1 ${isLarge ? "text-[10px]" : "text-[9px]"}`}>
                {category.nameEn}
              </span>
              <h3 className={`font-serif text-white ${isLarge ? "text-xl md:text-2xl" : "text-base md:text-lg"}`}>
                {category.nameJp}
              </h3>
            </div>
            
            {/* Hover CTA */}
            <div className="flex items-center gap-2 text-white text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <span>詳しく見る</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          {/* Expandable Product Preview */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3"
              >
                <div className="flex gap-2">
                  {category.products.map((product, idx) => (
                    <motion.div
                      key={product.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="flex-1"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden mb-1">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-[10px] text-dark text-center truncate">{product.name}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    )
  }

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

        {/* Category Grid - 2 large + 4 small, sharp edges (rounded-none) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Large Categories - Top Row */}
          {largeCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + index * 0.1 }}
            >
              <CategoryTile category={category} isLarge={true} />
            </motion.div>
          ))}
        </div>

        {/* Small Categories - Bottom Row (2x2 grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-4 md:mt-6">
          {smallCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 + index * 0.08 }}
            >
              <CategoryTile category={category} isLarge={false} />
            </motion.div>
          ))}
        </div>

        {/* All Products Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex justify-center mt-12"
        >
          <button className="group inline-flex items-center gap-3 px-8 py-3 border border-dark text-dark text-sm tracking-wider hover:bg-dark hover:text-white transition-all duration-300">
            <span>すべての製品を見る</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
