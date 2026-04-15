"use client"

import { motion, useScroll, useSpring } from "framer-motion"
import { useEffect, useState } from "react"

const sections = [
  { id: "hero", label: "Top" },
  { id: "services", label: "Services" },
  { id: "ranking", label: "Ranking" },
  { id: "lineup", label: "Lineup" },
  { id: "testimonials", label: "Voice" },
  { id: "support", label: "Support" },
  { id: "craftsmanship", label: "Story" },
  { id: "news", label: "News" },
  { id: "cta", label: "Contact" },
]

export function ScrollIndicator() {
  const [activeSection, setActiveSection] = useState(0)
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2

      sections.forEach((section, index) => {
        const element = document.getElementById(section.id)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(index)
          }
        }
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      {/* Progress Bar at Top */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gold z-[60] origin-left"
        style={{ scaleX: scaleY }}
      />

      {/* Vertical Dot Indicator */}
      <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group relative flex items-center justify-end"
            aria-label={`Go to ${section.label}`}
          >
            {/* Label on hover */}
            <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] tracking-wider text-foreground/70 whitespace-nowrap bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
              {section.label}
            </span>
            
            {/* Dot */}
            <motion.div
              animate={{
                scale: activeSection === index ? 1.5 : 1,
                backgroundColor: activeSection === index ? "#b8860b" : "#d1d5db",
              }}
              transition={{ duration: 0.3 }}
              className="w-2 h-2 rounded-full"
            />
          </button>
        ))}
      </div>
    </>
  )
}
