"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const words = [
  "メイド・イン・ジャパンの",
  "「ものづくり」を",
  "追求したい。"
]

export function CraftsmanshipStorySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  // Parallax: background moves slower than content
  const bgY = useTransform(scrollYProgress, [0, 1], [100, -100])
  const textY = useTransform(scrollYProgress, [0, 1], [50, -50])

  return (
    <section id="craftsmanship" ref={ref} className="py-20 md:py-28 bg-dark text-white relative overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        style={{ y: bgY }}
      >
        <Image
          src="/images/craftsman.jpg"
          alt="職人の作業風景"
          fill
          className="object-cover scale-110"
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/90 to-dark/70" />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <motion.div style={{ y: textY }} className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/craftsman.jpg"
                alt="職人の作業風景"
                fill
                className="object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent" />
            </motion.div>
            
            {/* Decorative frame */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-l-2 border-t-2 border-gold/30 rounded-tl-2xl" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-gold/30 rounded-br-2xl" />
          </motion.div>

          {/* Content - Word by word animation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="font-serif text-[24px] md:text-[28px] leading-relaxed mb-6">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.2 }}
                  className="inline-block mr-2"
                >
                  {word}
                  {i < words.length - 1 && <br />}
                </motion.span>
              ))}
            </h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-[14px] text-white/70 leading-loose mb-8"
            >
              福岡の工房で、15年以上にわたり鉄と向き合ってきました。
              一本一本、火と鉄と向き合い、心を込めて打ち出す。
              機械では出せない、手仕事ならではの温かみと風合い。
              お客様の暮らしに寄り添う、世界に一つだけの手すりをお届けします。
            </motion.p>

            <motion.a
              href="/greeting"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="group inline-flex items-center gap-3 text-[13px] text-white border-b border-white/30 pb-1 hover:border-gold hover:text-gold transition-colors duration-300"
            >
              <span>職人のご挨拶を見る</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
