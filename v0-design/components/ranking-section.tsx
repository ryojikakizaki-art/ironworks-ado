"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

const CDN = "https://imagedelivery.net/QondspN4HIUvB_R16-ddAQ/60e3e0f9c3289c7ab78f13e7"

const rankings = [
  {
    rank: 1,
    name: "René ルネ",
    variant: "横型 25φ｜マットブラック",
    price: "36,500",
    image: `${CDN}/d0f5f0e83d40a4d29044.jpg/public`,
    href: "/products/rene",
  },
  {
    rank: 2,
    name: "Claude クロード",
    variant: "縦型 25φ｜マットブラック",
    price: "30,000",
    image: `${CDN}/86278edb68c21957e339.jpg/public`,
    href: "/products/claude",
  },
  {
    rank: 3,
    name: "Claire クレール",
    variant: "横型 25φ｜マットホワイト",
    price: "42,000",
    image: `${CDN}/0a0c0c78f9f636cca733.jpg/public`,
    href: "/products/claire",
  },
  {
    rank: 4,
    name: "Antoine アントワーヌ",
    variant: "縦型ロング 25φ｜マットブラック",
    price: "56,000",
    image: `${CDN}/2d1043dcd7658a96e5f3.jpg/public`,
    href: "/products/antoine",
  },
  {
    rank: 5,
    name: "Marcel マルセル",
    variant: "横型 フラットバー｜マットブラック",
    price: "36,000",
    image: `${CDN}/939d0690971c550c1dd9.jpg/public`,
    href: "/products/marcel",
  },
  {
    rank: 6,
    name: "Scroll スクロール 16φ",
    variant: "ロートアイアン 70cm｜無垢鉄",
    price: "18,000",
    image: `${CDN}/2a64ecfb5e50e78cb374.jpg/public`,
    href: "/products/scroll16",
  },
]

export function RankingSection() {
  const ref = useRef(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = window.innerWidth < 768 ? 280 : 320
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section id="ranking" ref={ref} className="py-20 md:py-28 bg-secondary overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="px-6 flex items-end justify-between mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="block text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-2"
            >
              Ranking
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif text-[28px] md:text-[32px] text-foreground"
            >
              製品ランキング
            </motion.h2>
          </div>

          {/* Navigation Arrows */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-2"
          >
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground disabled:hover:border-border disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground disabled:hover:border-border disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Horizontal Scroll Cards with Tilt Effect */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth px-6 pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", perspective: "1200px" }}
        >
          {rankings.map((item, index) => (
            <motion.div
              key={item.rank}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex-shrink-0 snap-start cursor-pointer ${
                item.rank === 1 ? "w-[320px] md:w-[380px]" : "w-[260px] md:w-[300px]"
              }`}
              style={{ perspective: "1000px" }}
            >
              <motion.div
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`bg-white overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 h-full relative ${
                  item.rank === 1 ? "rounded-2xl" : "rounded-t-none rounded-b-lg"
                }`}
              >
                {/* Pulsing Gold Glow for Rank 1 */}
                {item.rank === 1 && (
                  <motion.div
                    animate={{ 
                      boxShadow: ["0 0 20px rgba(184,134,11,0.3)", "0 0 40px rgba(184,134,11,0.5)", "0 0 20px rgba(184,134,11,0.3)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                  />
                )}

                {/* Image Container */}
                <div
                  className={`relative overflow-hidden bg-secondary ${
                    item.rank === 1 ? "h-[240px] md:h-[300px]" : "h-[180px] md:h-[220px]"
                  }`}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={{ scale: hoveredIndex === index ? 1.1 : 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </motion.div>
                  {/* Rank Badge */}
                  <div className={`absolute top-4 left-4 rounded-full bg-gold text-white flex items-center justify-center font-medium shadow-lg ${
                    item.rank === 1 ? "w-14 h-14 text-2xl" : "w-10 h-10 text-lg"
                  }`}>
                    {item.rank}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className={`font-serif text-foreground transition-colors duration-300 mb-2 ${
                    item.rank === 1 ? "text-lg md:text-xl" : "text-base"
                  } ${hoveredIndex === index ? "text-gold" : ""}`}>
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground tracking-wide mb-3">
                    {item.variant}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[11px] text-muted-foreground">¥</span>
                    <span className={`font-medium text-foreground ${item.rank === 1 ? "text-xl" : "text-lg"}`}>
                      {item.price}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1">（税込）</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
