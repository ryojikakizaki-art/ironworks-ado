"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useCallback } from "react"
import { Hammer, Ruler, Truck, MessageCircle, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"

const services = [
  {
    icon: Hammer,
    title: "職人手作り",
    description: "一本一本、熟練の鍛冶職人が丹精込めて手作り。",
    backTitle: "こだわりの技術",
    backDescription: "機械では出せない温かみと個性。40年以上の経験を持つ職人が、伝統の技法で仕上げます。",
  },
  {
    icon: Ruler,
    title: "サイズオーダー対応",
    description: "お住まいの階段に合わせて、1mm単位でオーダー。",
    backTitle: "完璧なフィット",
    backDescription: "採寸から製作まで一貫対応。複雑な形状や特殊サイズも承ります。",
  },
  {
    icon: Truck,
    title: "全国配送",
    description: "北海道から沖縄まで、全国どこでも丁寧にお届け。",
    backTitle: "安心の配送",
    backDescription: "専用の梱包で破損を防止。30,000円以上で送料無料。設置サービスも対応可能。",
  },
  {
    icon: MessageCircle,
    title: "LINEで簡単相談",
    description: "ご質問やご相談はLINEでお気軽に。",
    backTitle: "職人が直接回答",
    backDescription: "写真を送るだけで無料見積もり。平均回答時間は2時間以内。",
  },
  {
    icon: CreditCard,
    title: "クレジットカード決済",
    description: "各種クレジットカードに対応。",
    backTitle: "お支払いも安心",
    backDescription: "分割払いもご利用可能。請求書払い、銀行振込にも対応しています。",
  },
]

export function LimitedServiceSection() {
  const ref = useRef(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())

  const checkScrollButtons = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
      setTimeout(checkScrollButtons, 300)
    }
  }

  const toggleFlip = (index: number) => {
    setFlippedCards(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <section id="services" ref={ref} className="py-16 md:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-2"
            >
              Limited Service
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif text-[24px] md:text-[28px] text-foreground"
            >
              オンラインショップが選ばれる理由
            </motion.h2>
          </div>

          {/* Navigation Arrows */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-2"
          >
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                canScrollLeft
                  ? "border-foreground/30 hover:border-foreground hover:bg-foreground hover:text-white"
                  : "border-muted-foreground/20 text-muted-foreground/40 cursor-not-allowed"
              }`}
              aria-label="前へ"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                canScrollRight
                  ? "border-foreground/30 hover:border-foreground hover:bg-foreground hover:text-white"
                  : "border-muted-foreground/20 text-muted-foreground/40 cursor-not-allowed"
              }`}
              aria-label="次へ"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Horizontal Scroll Cards with 3D Flip */}
        <div className="relative">
          <motion.div 
            ref={scrollRef}
            initial={{ x: 60, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onScroll={checkScrollButtons}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch", perspective: "1000px" }}
          >
            {services.map((service, index) => {
              const Icon = service.icon
              const isFlipped = flippedCards.has(index)
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, x: 40 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 + index * 0.08 }}
                  className="flex-shrink-0 w-[260px] md:w-[280px] snap-start cursor-pointer"
                  style={{ perspective: "1000px" }}
                  onClick={() => toggleFlip(index)}
                >
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative h-[220px]"
                  >
                    {/* Front Side */}
                    <div 
                      className="absolute inset-0 bg-[#f9f7f4] rounded-2xl p-6 border border-transparent hover:border-gold/20 transition-all duration-300"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      {/* Number Badge */}
                      <span className="absolute top-4 right-4 text-[48px] font-serif text-foreground/5 leading-none select-none">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-5 shadow-sm">
                        <Icon className="w-6 h-6 text-gold" strokeWidth={1.5} />
                      </div>

                      {/* Content */}
                      <h3 className="font-serif text-lg text-foreground mb-3">
                        {service.title}
                      </h3>
                      <p className="text-[13px] text-muted-foreground leading-[1.8]">
                        {service.description}
                      </p>
                      
                      {/* Flip hint */}
                      <span className="absolute bottom-4 right-4 text-[10px] text-muted-foreground/50">
                        tap to flip
                      </span>
                    </div>

                    {/* Back Side */}
                    <div 
                      className="absolute inset-0 bg-dark rounded-2xl p-6 text-white"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                      </div>

                      {/* Content */}
                      <h3 className="font-serif text-lg text-gold mb-3">
                        {service.backTitle}
                      </h3>
                      <p className="text-[13px] text-white/80 leading-[1.8]">
                        {service.backDescription}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Fade edges */}
          <div className="absolute top-0 right-0 bottom-4 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none hidden md:block" />
          <div className="absolute top-0 left-0 bottom-4 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none hidden md:block" />
        </div>

        {/* Mobile scroll indicator */}
        <div className="flex justify-center gap-1.5 mt-4 md:hidden">
          {services.map((_, index) => (
            <div
              key={index}
              className="w-1.5 h-1.5 rounded-full bg-foreground/20"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
