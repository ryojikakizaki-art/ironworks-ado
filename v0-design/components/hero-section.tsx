"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useRef, useState, useEffect, useCallback } from "react"

/**
 * ヒーロー：固定背景の動画/画像カルーセル + 入場演出 + スクロール駆動のテキスト演出
 *
 * カルーセル: 動画 → 静止画5枚 → 動画 → ループ（フェードなし、即時切替）
 *
 * 入場演出（サイト訪問時に1回だけ再生）:
 *  Step 1 (0.3s〜1.1s): 金色の横線が中央から左右に伸びて出現
 *  Step 2 (1.2s〜2.4s): 「手仕事と、暮らそう。」が線の下から浮き上がって定着
 *  Step 3: entrance done → 以降スクロール駆動に切替
 *
 * スクロール演出（入場完了後）:
 *  Phase 1 (progress 0.17–0.30): 文字が下に沈む（線は固定位置で視認しつつ最後にフェード）
 *  Phase 2 (progress 0.20–0.65): 「鍛冶職人が…」が画面下→画面上を通過
 *  Phase 3 (progress 0.55–1.00): 「メイド・イン・ジャパン…」が同じ動きで通過
 */

type HeroMedia =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string }

const heroMedia: HeroMedia[] = [
  { type: "video", src: "/videos/hero-reel.mp4" },
  { type: "image", src: "/images/_1140304.jpg", alt: "アイアン手すり 主要カット" },
  { type: "image", src: "/images/DSCF1995.JPG", alt: "アイアン手すり施工例 1" },
  { type: "image", src: "/images/DSCF6186.JPG", alt: "アイアン手すり施工例 2" },
  { type: "image", src: "/images/DSCF6234.JPG", alt: "アイアン手すり施工例 3" },
  { type: "image", src: "/images/DSCF6699.JPG", alt: "アイアン手すり施工例 4" },
]

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [entranceDone, setEntranceDone] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // 戻るボタン等で途中スクロール位置に復元された場合は入場演出をスキップ
  // （入場演出と Phase 2/3 のスクロール駆動描画が衝突して画面が壊れて見えるため）
  useEffect(() => {
    if (typeof window !== "undefined" && window.scrollY > 50) {
      setEntranceDone(true)
    }
  }, [])

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
        setTimeout(nextSlide, 100)
      })
    }
  }, [currentSlide, nextSlide])

  const current = heroMedia[currentSlide]

  // ── スクロール駆動アニメーション（セクション内 progress = 0..1） ──
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  // Phase 1（スクロール駆動）: 文字が下降、線は維持しつつ後半でフェード
  // 入場完了時点で「文字 y=0%／線 width=70% opacity=1」と一致する初期値を持つ
  const p1Y = useTransform(scrollYProgress, [0.17, 0.30], ["0%", "110%"])
  const p1LineWidth = useTransform(scrollYProgress, [0.17, 0.30], ["70%", "0%"])
  const p1LineOpacity = useTransform(scrollYProgress, [0.17, 0.30], [1, 0])

  // Phase 2: 80vh → -80vh（画面下→画面上、止まらず通過）
  const p2Y = useTransform(scrollYProgress, [0.20, 0.65], ["80vh", "-80vh"])

  // Phase 3: 110vh → -90vh（行数多いので初期位置をさらに下に）
  const p3Y = useTransform(scrollYProgress, [0.55, 1.0], ["110vh", "-90vh"])

  // スクロール誘導は最初の数十%でフェードアウト
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "500vh" }}
    >
      {/* ── 固定背景：カルーセル（動画 + 画像5枚、フェードなし即時切替） ── */}
      <div
        className="fixed inset-0 z-0 overflow-hidden"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        <div key={currentSlide} className="absolute inset-0">
          {current.type === "video" ? (
            <video
              ref={videoRef}
              src={current.src}
              autoPlay
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              onEnded={nextSlide}
            />
          ) : (
            <Image
              src={current.src}
              alt={current.alt}
              fill
              priority={currentSlide === 0}
              sizes="100vw"
              className="object-cover"
            />
          )}
        </div>
        {/* 文字の可読性を保つための暗幕（やや濃いめ） */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/65" />
      </div>

      {/* ── スクロールに張り付くテキスト舞台 ── */}
      <div className="sticky top-0 h-screen w-full z-10 overflow-hidden">
        {/* ─ Phase 1：入場演出（線→文字）→ 完了後はスクロール駆動で沈む ─ */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6">
          <div className="relative max-w-3xl mx-auto text-center">
            {/* マスク：水面より上だけが見える */}
            <div className="overflow-hidden">
              {entranceDone ? (
                <motion.h1
                  style={{ y: p1Y }}
                  className="font-serif text-3xl md:text-5xl lg:text-6xl text-white tracking-[0.15em] leading-snug"
                >
                  手仕事と、暮らそう。
                </motion.h1>
              ) : (
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  transition={{ delay: 1.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  onAnimationComplete={() => setEntranceDone(true)}
                  className="font-serif text-3xl md:text-5xl lg:text-6xl text-white tracking-[0.15em] leading-snug"
                >
                  手仕事と、暮らそう。
                </motion.h1>
              )}
            </div>
            {/* 金色の固定ライン（水面）：入場時に左右に伸びて出現 → 入場完了後は維持 → 沈降終わりにフェード */}
            {entranceDone ? (
              <motion.div
                style={{ width: p1LineWidth, opacity: p1LineOpacity }}
                className="absolute left-1/2 -translate-x-1/2 top-full h-px bg-gradient-to-r from-transparent via-gold to-transparent"
              />
            ) : (
              <motion.div
                initial={{ width: "0%", opacity: 0 }}
                animate={{ width: "70%", opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="absolute left-1/2 -translate-x-1/2 top-full h-px bg-gradient-to-r from-transparent via-gold to-transparent"
              />
            )}
          </div>
        </div>

        {/* ─ Phase 2：画面下→画面上を通過 ─ */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div style={{ y: p2Y }}>
              <h2 className="font-serif text-xl md:text-3xl lg:text-4xl text-white leading-loose tracking-wider">
                鍛冶職人が一本ずつ仕上げる、
                <br />
                オーダーメイドの鉄製手すり。
              </h2>
            </motion.div>
          </div>
        </div>

        {/* ─ Phase 3：同じ動き / 改行追加で倍の行数・文字大きめ・行間広く ─ */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div style={{ y: p3Y }}>
              <div className="font-serif text-white tracking-wide">
                {/* リード文 */}
                <p className="text-2xl md:text-3xl lg:text-4xl leading-loose mb-16 md:mb-24">
                  メイド・イン・ジャパンの
                  <br />
                  「ものづくり」を追求して。
                </p>
                {/* 本文（段落間は space-y-10 を維持） */}
                <div className="space-y-10">
                  <p className="text-base md:text-lg lg:text-xl text-white/90 leading-loose">
                    千葉の工房で、
                    <br />
                    15年以上にわたり鉄と向き合ってきました。
                  </p>
                  <p className="text-base md:text-lg lg:text-xl text-white/90 leading-loose">
                    火と鉄のあいだで生まれる、
                    <br />
                    機械では出せない温かみと風合い。
                  </p>
                  <p className="text-base md:text-lg lg:text-xl text-white/90 leading-loose">
                    お客様の暮らしに寄り添う、
                    <br />
                    世界に一つだけの手すりをお届けします。
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── スクロール誘導（右下） ── */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-10 right-8 md:right-12 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/70 text-xs tracking-[0.3em] uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-12 bg-gradient-to-b from-white/70 to-transparent"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
