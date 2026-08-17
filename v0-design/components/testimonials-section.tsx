"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { REVIEW_QUOTES } from "@/lib/testimonials"
import { VoiceBubble } from "@/components/voice-bubble"

const FEATURED = REVIEW_QUOTES.filter((q) => q.featured)

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section id="testimonials" ref={ref} className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-[11px] tracking-[0.25em] text-gold uppercase mb-3"
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

        {/* 吹き出しカード（マソンリー2列） */}
        <div className="columns-1 md:columns-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {FEATURED.map((q, i) => (
            <motion.div
              key={q.id}
              className="break-inside-avoid"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
            >
              <VoiceBubble voice={q} seed={i} />
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
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
