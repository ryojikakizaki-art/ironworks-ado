"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { LimitedServiceSection } from "@/components/limited-service-section"
import { RankingSection } from "@/components/ranking-section"
import { LineupSection } from "@/components/lineup-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CraftsmanshipStorySection } from "@/components/craftsmanship-story-section"
import { NewsSection } from "@/components/news-section"
import { BlogSection } from "@/components/blog-section"
import { CtaBanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"
import { BackToTop } from "@/components/back-to-top"

export default function HomePage() {
  return (
    <main className="relative">
      <Header />

      {/* ── ヒーロー（固定背景 + スクロール駆動テキスト） ── */}
      <div id="hero">
        <HeroSection />
      </div>

      {/* ── コンテンツセクション（白背景で固定ヒーローを隠す） ── */}
      <div className="relative z-10 bg-white">
        <LimitedServiceSection />
        <RankingSection />
      </div>

      {/* ── 透明スペーサー ── */}
      <div className="h-48 md:h-64" />

      {/* ── コンテンツセクション（白背景） ── */}
      <div className="relative z-10 bg-white">
        <LineupSection />
        <TestimonialsSection />
      </div>

      {/* ── 透明スペーサー ── */}
      <div className="h-48 md:h-64" />

      <div className="relative z-10">
        <CraftsmanshipStorySection />
        <NewsSection />
        <BlogSection />
        <CtaBanner />
        <Footer />
      </div>

      <BackToTop />
    </main>
  )
}
