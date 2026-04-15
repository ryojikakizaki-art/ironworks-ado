"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const steps = [
  {
    number: "01",
    title: "ご相談・お見積り",
    description: "設置場所の写真やご希望のデザインをお送りください。専門スタッフが丁寧にヒアリングし、最適なプランをご提案します。",
  },
  {
    number: "02",
    title: "採寸・デザイン確定",
    description: "ご自宅に伺い正確な採寸を行います。デザインの詳細を打ち合わせ、図面をお作りして最終確認いたします。",
  },
  {
    number: "03",
    title: "製作",
    description: "福岡の工房で、熟練の職人が一本一本丁寧に製作します。製作期間は通常4〜6週間ほどいただいております。",
  },
  {
    number: "04",
    title: "お届け・施工",
    description: "完成した手摺をご自宅までお届けし、専門スタッフが丁寧に取り付けを行います。アフターサポートも万全です。",
  },
]

export function ProcessSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 md:py-32 bg-light-gray">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, rotateX: -90 }}
            animate={isInView ? { opacity: 1, rotateX: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4"
          >
            Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, rotateX: -90 }}
            animate={isInView ? { opacity: 1, rotateX: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl md:text-4xl text-dark"
          >
            ご注文の流れ
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-px bg-border" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                className="relative group"
              >
                {/* Number Circle */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-dark mx-auto mb-6 flex items-center justify-center group-hover:bg-gold group-hover:border-gold group-hover:scale-110 transition-all duration-300">
                  <span className="text-sm font-medium text-dark group-hover:text-white transition-colors duration-300">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="font-serif text-lg text-dark mb-3 group-hover:text-gold transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-6">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={isInView ? { scaleY: 1 } : {}}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.15 }}
                      className="w-px h-8 bg-border origin-top"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Diamond Divider */}
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={isInView ? { scale: 1, rotate: 45 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="w-3 h-3 bg-gold mx-auto mt-16"
        />
      </div>
    </section>
  )
}
