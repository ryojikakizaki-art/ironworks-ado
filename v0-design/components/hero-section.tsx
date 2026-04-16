"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRef, useState, useEffect, useCallback } from "react"
import { ChevronRight } from "lucide-react"

const heroImages = [
  { src: "/images/DSCF1995.JPG", alt: "アイアン手すり施工例 1" },
  { src: "/images/DSCF6186.JPG", alt: "アイアン手すり施工例 2" },
  { src: "/images/DSCF6234.JPG", alt: "アイアン手すり施工例 3" },
  { src: "/images/DSCF6699.JPG", alt: "アイアン手すり施工例 4" },
]

export function HeroSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
  }, [])

  // 自動スライド (5秒間隔)
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  return (
    <section ref={ref} className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Background Image Slideshow with Parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[currentSlide].src}
              alt={heroImages[currentSlide].alt}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/30 text-white/80 text-xs tracking-[0.2em] uppercase">
            Handcrafted Iron Handrails
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight text-balance"
        >
          <span className="block">鍛冶職人の手が紡ぐ</span>
          <span className="block mt-2">唯一無二のアイアン手摺</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-white/80 text-sm md:text-base max-w-xl mb-10 leading-relaxed"
        >
          一本一本、火と鉄と向き合い、心を込めて打ち出す。
          <br className="hidden md:block" />
          あなたの暮らしに、100年続く美しさを。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/products" className="group relative px-8 py-4 bg-gold text-white rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(184,134,11,0.4)] inline-block">
            <span className="relative z-10 flex items-center gap-2 text-sm tracking-wide">
              製品を見る
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gold-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          <Link href="/contact" className="group px-8 py-4 border border-white/40 text-white rounded-full transition-all duration-300 hover:bg-white hover:text-dark hover:border-white inline-block">
            <span className="text-sm tracking-wide">お問い合わせ</span>
          </Link>
        </motion.div>

        {/* Slide Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-3"
        >
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index ? "bg-gold w-8" : "bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`スライド ${index + 1}`}
            />
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/60 text-xs tracking-widest uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
