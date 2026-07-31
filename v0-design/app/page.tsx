"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ThreeEntrances } from "@/components/three-entrances"
import { StatsSection } from "@/components/stats-section"
import { TradeBanner } from "@/components/trade-banner"
import { FinishQualitySection } from "@/components/finish-quality-section"
import { LimitedServiceSection } from "@/components/limited-service-section"
import { RankingSection } from "@/components/ranking-section"
import { CaseGallery } from "@/components/case-gallery"
import { ProductMarquee } from "@/components/product-marquee"
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
      <Header hasHero />

      {/* ── ヒーロー（100vh、中央に ado ロゴ、下部にカテゴリードック） ── */}
      <div id="hero">
        <HeroSection />
      </div>

      {/* 3つの入口（手すり／ロートアイアン・装飾／施工）— タスク5-1 */}
      <ThreeEntrances />

      <TradeBanner />
      <RankingSection />

      {/* 二重防錆（めっき×塗装）品質セクション — /galvanizing・/paint への導線 */}
      <FinishQualitySection />

      {/* 施工事例ギャラリー — タスク5-5 */}
      <CaseGallery />

      <TestimonialsSection />
      <StatsSection />
      <CraftsmanshipStorySection />
      <LimitedServiceSection />
      <NewsSection />
      <BlogSection />

      {/* 全商品マーキー（旧ヒーロー下部から移動）— タスク5-1 */}
      <ProductMarquee />

      <CtaBanner />
      <Footer />

      <BackToTop />
    </main>
  )
}
