"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Star, ArrowRight } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "田中 美咲",
    location: "東京都",
    rating: 5,
    text: "新築の家に合わせて手摺をお願いしました。職人さんの技術力の高さに感動しました。毎日触れるたびに、温かみを感じます。家族みんなが気に入っています。",
    product: "シンプルストレート",
    variant: "マットブラック",
    avatar: "TM",
  },
  {
    id: 2,
    name: "佐藤 健一",
    location: "大阪府",
    rating: 5,
    text: "リフォームで取り付けていただきました。既存の雰囲気を壊さず、むしろ空間の質が上がりました。アフターフォローも丁寧で安心です。",
    product: "クラシックカーブ",
    variant: "アンティークブラウン",
    avatar: "SK",
  },
  {
    id: 3,
    name: "山本 設計事務所",
    location: "福岡県",
    rating: 5,
    text: "何度もお願いしています。細かい要望にも柔軟に対応いただけ、クライアントからの評判も上々です。信頼できるパートナーです。",
    product: "オーナメント",
    variant: "マットブラック",
    avatar: "YS",
  },
  {
    id: 4,
    name: "鈴木 幸子",
    location: "神奈川県",
    rating: 5,
    text: "両親の家の手摺を新調しました。握りやすさと美しさを両立していて、両親も大変喜んでいます。孫の代まで使える品質です。",
    product: "和モダン",
    variant: "黒皮鉄仕上げ",
    avatar: "SS",
  },
  {
    id: 5,
    name: "木村 大輔",
    location: "愛知県",
    rating: 5,
    text: "インスタで見て一目惚れしました。実物は写真以上に美しく、来客の度に褒められます。職人技の素晴らしさを実感しています。",
    product: "螺旋階段用",
    variant: "マットブラック",
    avatar: "KD",
  },
  {
    id: 6,
    name: "伊藤 真理",
    location: "北海道",
    rating: 4,
    text: "北海道まで丁寧に対応いただきました。寒冷地でも安心の品質で、冬でも冷たくなりすぎないのが嬉しいです。",
    product: "シンプルストレート",
    variant: "アンティークブラウン",
    avatar: "IM",
  },
]

const overallRating = 4.8
const totalReviews = 127

export function TestimonialsSection() {
  const ref = useRef(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const checkScrollButtons = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = 340
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      setIsAutoPlaying(false)
    }
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (!isAutoPlaying || !scrollRef.current) return
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
        } else {
          scrollRef.current.scrollBy({ left: 340, behavior: "smooth" })
        }
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.addEventListener("scroll", checkScrollButtons)
      checkScrollButtons()
      return () => el.removeEventListener("scroll", checkScrollButtons)
    }
  }, [checkScrollButtons])

  // Render stars
  const renderStars = (rating: number, size: "sm" | "lg" = "sm") => {
    const sizeClass = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5"
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`${sizeClass} ${i < rating ? "fill-gold text-gold" : "fill-border text-border"}`} 
          />
        ))}
      </div>
    )
  }

  return (
    <section id="testimonials" ref={ref} className="py-20 md:py-28 bg-[#f9f7f4] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header with Overall Rating */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-3"
            >
              IRONWORKS Lover&apos;s Voice
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif text-[28px] md:text-[32px] text-foreground"
            >
              お客様の声
            </motion.h2>
          </div>

          {/* Overall Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-sm"
          >
            <div className="flex items-baseline gap-1">
              <span className="text-[40px] font-light text-gold leading-none">{overallRating}</span>
              <span className="text-[14px] text-muted-foreground">/5</span>
            </div>
            <div className="flex flex-col gap-1">
              {renderStars(Math.round(overallRating), "lg")}
              <span className="text-[11px] text-muted-foreground">{totalReviews}件以上のレビュー</span>
            </div>
          </motion.div>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-5 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 ${
              canScrollLeft 
                ? "hover:bg-gold hover:text-white cursor-pointer opacity-100" 
                : "opacity-0 cursor-default"
            }`}
            aria-label="前のレビュー"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-5 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 ${
              canScrollRight 
                ? "hover:bg-gold hover:text-white cursor-pointer opacity-100" 
                : "opacity-0 cursor-default"
            }`}
            aria-label="次のレビュー"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ 
                  opacity: 0, 
                  x: index % 2 === 0 ? -50 : 50 // Odd from left, even from right
                }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                className="flex-shrink-0 w-[320px] snap-start"
              >
                <div className="bg-white rounded-xl p-6 h-full shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer">
                  {/* Avatar + Author */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-medium text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-[13px] text-foreground font-medium">{testimonial.name}</p>
                      <p className="text-[11px] text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="mb-4">
                    {renderStars(testimonial.rating)}
                  </div>

                  {/* Product Info */}
                  <div className="mb-4">
                    <p className="text-[13px] font-medium text-foreground">{testimonial.product}</p>
                    <p className="text-[11px] text-gold">{testimonial.variant}</p>
                  </div>

                  {/* Review Text */}
                  <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-4 group-hover:text-foreground transition-colors duration-300">
                    {testimonial.text}
                  </p>

                  {/* Arrow */}
                  <div className="mt-4 flex justify-end">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-gold transition-colors duration-300">
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10"
        >
          <span className="inline-flex items-center gap-2 text-[13px] text-muted-foreground pb-0.5">
            <span>すべてのレビューを見る</span>
          </span>
        </motion.div>
      </div>
    </section>
  )
}
