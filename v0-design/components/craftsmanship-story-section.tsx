"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CraftsmanshipStorySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="craftsmanship" ref={ref} className="py-20 md:py-28 bg-dark text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image — クリックで /greeting へ遷移 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <Link
              href="/greeting"
              className="group block relative aspect-[4/3] rounded-2xl overflow-hidden"
              aria-label="代表あいさつページへ"
            >
              <Image
                src="/images/greeting-rose.jpg"
                alt="鍛鉄で作られた薔薇とハンマー"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* ホバー時の暗幕 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
              {/* ホバー時のテキスト */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="inline-flex items-center gap-3 text-white text-[13px] tracking-wider border-b border-white/60 pb-1">
                  代表あいさつを読む
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Decorative frame */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-l-2 border-t-2 border-gold/30 rounded-tl-2xl pointer-events-none" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-gold/30 rounded-br-2xl pointer-events-none" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-block text-[11px] tracking-[0.3em] text-gold uppercase mb-4"
            >
              Greeting
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-8"
            >
              代表あいさつ
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-[14px] md:text-[15px] text-white/75 leading-loose mb-10"
            >
              千葉の工房で、15年以上にわたり鉄と向き合ってきました。
              一本一本、火と鉄と向き合い、心を込めて打ち出す。
              機械では出せない、手仕事ならではの温かみと風合いを、
              世界に一つだけの作品としてお届けします。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <Link
                href="/greeting"
                className="group inline-flex items-center gap-3 text-[13px] text-white border-b border-white/30 pb-1 hover:border-gold hover:text-gold transition-colors duration-300"
              >
                <span>代表あいさつを読む</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
