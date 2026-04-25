"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { VOICE_SLIDES } from "@/lib/testimonials"

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const slideCount = VOICE_SLIDES.length

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(((idx % slideCount) + slideCount) % slideCount)
  }, [slideCount])

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % slideCount)
    setIsAutoPlaying(false)
  }, [slideCount])

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + slideCount) % slideCount)
    setIsAutoPlaying(false)
  }, [slideCount])

  // 6秒ごとに自動送り
  useEffect(() => {
    if (!isAutoPlaying) return
    const t = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % slideCount)
    }, 6000)
    return () => clearInterval(t)
  }, [isAutoPlaying, slideCount])

  return (
    <section id="testimonials" ref={ref} className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-10">
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
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[13px] text-muted-foreground mt-3"
          >
            全国のお客様から、たくさんの嬉しいお言葉を頂戴しております。
          </motion.p>
        </div>

        {/* Slide Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative max-w-[1200px] mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* 画像エリア — 常に最新 1 枚のみ表示 */}
          <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden">
            {VOICE_SLIDES.map((slide, i) => (
              <div key={slide.id} className={i === currentIndex ? "block" : "hidden"}>
                <div className="relative aspect-[1600/650] w-full">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-contain"
                    priority={i === 0}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 左右ナビゲーションボタン */}
          <button
            onClick={prev}
            aria-label="前のお客様の声"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-5 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="次のお客様の声"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-5 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* インジケーター */}
          <div className="flex justify-center gap-2 mt-6">
            {VOICE_SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => { goTo(i); setIsAutoPlaying(false) }}
                aria-label={`${i + 1} 枚目のお客様の声`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "w-8 bg-gold" : "w-1.5 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-gold transition-colors pb-0.5 group"
          >
            <span>すべてのお客様の声を見る</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
