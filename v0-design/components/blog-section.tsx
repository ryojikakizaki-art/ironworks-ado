"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { ArrowRight, Play, X, Volume2, VolumeX } from "lucide-react"
import { InstagramCard } from "@/components/instagram-card"

export function BlogSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // 動画自動再生用
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const videoInView = useInView(videoContainerRef, { amount: 0.5 })
  const [videoOpen, setVideoOpen] = useState(false)

  // スクロールで表示領域に入ったら自動再生（ミュート）
  useEffect(() => {
    if (!videoRef.current) return
    if (videoInView) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
    }
  }, [videoInView])

  const openFullscreen = () => {
    setVideoOpen(true)
    document.body.style.overflow = "hidden"
  }

  const closeFullscreen = () => {
    setVideoOpen(false)
    document.body.style.overflow = ""
  }

  return (
    <section ref={ref} className="py-24 md:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-block text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4"
            >
              Media
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl text-dark"
            >
              動画・Instagram
            </motion.h2>
          </div>
        </div>

        {/* Featured Video — 別枠で大きく表示 */}
        <motion.div
          ref={videoContainerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div
            className="relative bg-dark rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
            onClick={openFullscreen}
          >
            <div className="grid md:grid-cols-[1.2fr_1fr] items-center">
              {/* Video */}
              <div className="relative aspect-video md:aspect-auto md:h-[400px] overflow-hidden">
                <video
                  ref={videoRef}
                  src="/videos/staircase-handrail.mp4"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors duration-300">
                  <div className="w-20 h-20 rounded-full bg-gold/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-9 h-9 text-white ml-1" fill="white" />
                  </div>
                </div>
                {/* Mute indicator */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/60 text-xs">
                  <VolumeX className="w-4 h-4" />
                  <span>クリックで音声付き再生</span>
                </div>
              </div>
              {/* Info */}
              <div className="p-8 md:p-10">
                <span className="inline-block px-3 py-1 bg-gold/10 text-gold text-xs rounded-full mb-4 tracking-wide">
                  施工動画
                </span>
                <h3 className="font-serif text-2xl md:text-3xl text-white mb-4 leading-snug [word-break:keep-all]">
                  階段手すりのオーダー制作例
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  吹き抜け空間を活かしたオーダーメイドのアイアン手すり。
                  鍛冶職人の技と現場の息遣いをご覧ください。
                </p>
                <span className="inline-flex items-center gap-2 text-gold text-sm group-hover:gap-3 transition-all duration-300">
                  <Play className="w-4 h-4" />
                  <span>音声付きで再生する</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Instagram（@zest_eye）— 工房と現場の日々（タスク5-6-3 の News 代替・2026-07-02） */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <InstagramCard />
        </motion.div>

      </div>

      {/* Fullscreen Video Modal — 音声付き再生 */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeFullscreen}
          >
            <button
              onClick={closeFullscreen}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              aria-label="閉じる"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="relative w-full max-w-5xl mx-6" onClick={(e) => e.stopPropagation()}>
              <video
                src="/videos/staircase-handrail.mp4"
                controls
                autoPlay
                className="w-full rounded-lg"
                style={{ maxHeight: "85vh" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
