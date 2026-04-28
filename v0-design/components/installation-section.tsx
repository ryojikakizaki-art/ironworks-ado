"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Check } from "lucide-react"
import { PrimaryCTA } from "@/components/ui/primary-cta"

const installationFeatures = [
  "専門スタッフによる丁寧な施工",
  "既存の壁材に合わせた取り付け方法",
  "施工後の清掃・点検サービス",
  "アフターサポート体制完備",
]

export function InstallationSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const x = useTransform(scrollYProgress, [0, 1], [-100, 100])

  return (
    <section ref={ref} className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <span className="inline-block text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4">
              Installation
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-dark mb-6 leading-relaxed">
              プロの施工で、
              <br />
              安心をお届け
            </h2>

            <p className="text-muted-foreground text-sm leading-loose mb-8">
              手摺の取り付けは、安全性に直結する重要な作業です。
              IRONWORKS adoでは、経験豊富な施工スタッフが
              お客様のご自宅に伺い、丁寧に取り付けを行います。
            </p>

            {/* Checklist */}
            <ul className="space-y-4 mb-10">
              {installationFeatures.map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold transition-colors duration-300">
                    <Check className="w-3.5 h-3.5 text-gold group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-dark text-sm">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* TODO: 元々 onClick 無しの非機能ボタン。遷移先が決まったら href を指定 */}
            <PrimaryCTA variant="dark" size="md">
              施工について詳しく
            </PrimaryCTA>
          </motion.div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
              <Image
                src="/images/installation.jpg"
                alt="施工イメージ"
                fill
                className="object-cover"
              />
            </div>

            {/* Floating Stats Card */}
            <motion.div
              style={{ x }}
              className="absolute -bottom-6 right-6 bg-white p-6 rounded-2xl shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="text-2xl">🔧</span>
                </div>
                <div>
                  <span className="text-3xl font-light text-dark">98</span>
                  <span className="text-lg text-gold">%</span>
                  <p className="text-xs text-muted-foreground">施工満足度</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
