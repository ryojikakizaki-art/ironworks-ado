"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TradeBanner } from "@/components/trade-banner"
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
    <main className="relative bg-white">
      <Header />

      {/* ── ヒーロー（100vh、中央に ado ロゴ、下部にカテゴリードック） ── */}
      <div id="hero">
        <HeroSection />
      </div>

      <TradeBanner />
      <RankingSection />
      <LineupSection />
      <TestimonialsSection />
      <CraftsmanshipStorySection />
      <LimitedServiceSection />
      <NewsSection />
      <BlogSection />
      <CtaBanner />
      <Footer />

      <BackToTop />
    </main>
  )
}
