"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Shield, Leaf, Wrench, Heart, Award, Truck } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "10年保証",
    description: "製品の品質に自信があるからこそ、長期保証をお約束します。",
  },
  {
    icon: Leaf,
    title: "環境配慮",
    description: "リサイクル可能な素材を使用し、環境に優しい製造工程を実現。",
  },
  {
    icon: Wrench,
    title: "カスタム対応",
    description: "お客様のご要望に合わせた完全オーダーメイドも承ります。",
  },
  {
    icon: Heart,
    title: "丁寧な対応",
    description: "お問い合わせから施工後まで、一貫してサポートいたします。",
  },
  {
    icon: Award,
    title: "匠の技",
    description: "伝統工芸士の資格を持つ職人が、一点一点製作します。",
  },
  {
    icon: Truck,
    title: "全国配送",
    description: "日本全国どこでも配送・施工に対応いたします。",
  },
]

export function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 md:py-32 bg-cream relative overflow-hidden">
      {/* Diagonal Background */}
      <div className="absolute inset-0 -skew-y-3 bg-cream origin-top-left scale-110" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: -30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: -30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl md:text-4xl text-dark"
          >
            選ばれる理由
          </motion.h2>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center mb-5 group-hover:bg-gold transition-colors duration-300">
                  <Icon className="w-6 h-6 text-dark group-hover:text-white transition-colors duration-300" />
                </div>

                <h3 className="font-serif text-xl text-dark mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>

                {/* Decorative line */}
                <div className="mt-6 h-px bg-gradient-to-r from-gold via-gold/50 to-transparent w-0 group-hover:w-full transition-all duration-500" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
