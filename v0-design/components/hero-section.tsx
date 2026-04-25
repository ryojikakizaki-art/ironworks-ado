"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRef, useState, useEffect, useCallback } from "react"

type HeroMedia =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string }

const heroMedia: HeroMedia[] = [
  { type: "image", src: "/images/DSCF1995.JPG", alt: "アイアン手すり施工例 1" },
  { type: "video", src: "/videos/hero-reel.mp4" },
  { type: "image", src: "/images/DSCF6186.JPG", alt: "アイアン手すり施工例 2" },
  { type: "image", src: "/images/DSCF6234.JPG", alt: "アイアン手すり施工例 3" },
  { type: "image", src: "/images/DSCF6699.JPG", alt: "アイアン手すり施工例 4" },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroMedia.length)
  }, [])

  // 画像スライドは6秒で自動送り（動画スライドは onEnded で送る）
  useEffect(() => {
    if (heroMedia[currentSlide].type === "video") return
    const timer = setTimeout(nextSlide, 6000)
    return () => clearTimeout(timer)
  }, [currentSlide, nextSlide])

  // 動画スライドに切り替わったら即再生
  useEffect(() => {
    const current = heroMedia[currentSlide]
    if (current.type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {
        // 再生失敗時は次のスライドへ
        setTimeout(nextSlide, 100)
      })
    }
  }, [currentSlide, nextSlide])

  const current = heroMedia[currentSlide]

  return (
    <>
      {/* ── 固定背景レイヤー（GPU最適化） ── */}
      <div className="fixed inset-0 z-0 overflow-hidden" style={{ willChange: "transform", transform: "translateZ(0)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {current.type === "video" ? (
              <video
                ref={videoRef}
                src={current.src}
                autoPlay
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
                onEnded={nextSlide}
              />
            ) : (
              <Image
                src={current.src}
                alt={current.alt}
                fill
                className="object-cover"
                priority
              />
            )}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* ── ヒーローコンテンツ ── */}
      <section className="relative z-10 h-screen min-h-[700px] flex flex-col justify-center items-center text-center px-6">

        {/* メインコピー：中央から拡大フェードイン */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.3, ease: "easeOut" }}
          className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6 leading-snug tracking-wide"
        >
          手仕事と、暮らそう。
        </motion.h1>

        {/* サブコピー：明朝・中央から */}
        <motion.p
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.55, ease: "easeOut" }}
          className="font-serif text-lg md:text-xl text-white/85 max-w-lg leading-loose mb-6"
        >
          鍛冶職人が一本ずつ仕上げる、オーダーメイドの鉄製手すり。
        </motion.p>

        {/* 追記テキスト */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.75, ease: "easeOut" }}
          className="font-serif text-sm md:text-base text-white/70 max-w-lg leading-relaxed text-center"
        >
          <p className="mb-2 text-white/90">メイド・イン・ジャパンの「ものづくり」を追求したい。</p>
          <p>
            千葉の工房で、15年以上にわたり鉄と向き合ってきました。<br />
            一本一本、火と鉄と向き合い、<br />
            機械では出せない、手仕事ならではの温かみと風合い。<br />
            お客様の暮らしに寄り添う、世界に一つだけの手すりをお届けします。
          </p>
        </motion.div>

        {/* スライドドット */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-3"
        >
          {heroMedia.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-500 ${
                currentSlide === index
                  ? "bg-gold w-8"
                  : "bg-white/40 w-2 hover:bg-white/70"
              }`}
              aria-label={`スライド ${index + 1}`}
            />
          ))}
        </motion.div>

        {/* スクロールインジケーター */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/60 text-xs tracking-widest uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent"
            />
          </div>
        </motion.div>
      </section>
    </>
  )
}
