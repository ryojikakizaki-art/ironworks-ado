"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { LimitedServiceSection } from "@/components/limited-service-section"
import { RankingSection } from "@/components/ranking-section"
import { LineupSection } from "@/components/lineup-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { LifetimeSupportSection } from "@/components/lifetime-support-section"
import { CraftsmanshipStorySection } from "@/components/craftsmanship-story-section"
import { NewsSection } from "@/components/news-section"
import { BlogSection } from "@/components/blog-section"
import { CtaBanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"
import { ScrollIndicator } from "@/components/scroll-indicator"
import { BackToTop } from "@/components/back-to-top"

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden">
      {/* Scroll Progress Bar + Section Dots */}
      <ScrollIndicator />

      <Header />
      
      {/* Hero Section */}
      <div id="hero">
        <HeroSection />
      </div>
      
      {/* Limited Service - 3D flip cards on hover */}
      <LimitedServiceSection />
      
      {/* Ranking - Cards tilt on hover with gold glow on #1 */}
      <RankingSection />
      
      {/* Line Up - Expandable preview on hover */}
      <LineupSection />
      
      {/* Customer Voices - Alternating slide-in, auto-scroll carousel */}
      <TestimonialsSection />
      
      {/* Life Time Support - 01/02/03 vertical flow */}
      <LifetimeSupportSection />
      
      {/* Craftsmanship Story - Parallax with word-by-word animation */}
      <CraftsmanshipStorySection />
      
      {/* News - Slide-in from right with pulsing NEW badge */}
      <NewsSection />
      
      {/* Blog - Grayscale to color reveal, left gold border */}
      <BlogSection />
      
      {/* CTA Banner - Diagonal clip, animated gradient, shimmer button */}
      <CtaBanner />
      
      <Footer />

      {/* Back to Top Button */}
      <BackToTop />
    </main>
  )
}
