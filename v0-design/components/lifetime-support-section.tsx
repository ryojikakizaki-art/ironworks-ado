"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Phone, Mail, ArrowRight } from "lucide-react"
import { PrimaryCTA } from "@/components/ui/primary-cta"

const supportSteps = [
  {
    number: "01",
    title: "楽しく選ぶ",
    description: "あなたに最適なデザインをアシストする機能や、実際のユーザーのレビューで購入をサポート",
    features: [
      { label: "INTERIOR SIMULATION", tag: "New", description: "お部屋に合わせたシミュレーション機能" },
      { label: "USER REVIEWS", tag: null, description: "レビュー機能" },
      { label: "SIZE ASSIST", tag: "New", description: "サイズアシスト機能" },
    ],
  },
  {
    number: "02",
    title: "毎日使う",
    description: "充実のメンテナンスガイドで毎日の暮らしを楽しく！ポイントも貯まってお得に",
    features: [
      { label: "MAINTENANCE GUIDE", tag: null, description: "メンテナンスガイドでお手入れ方法をサポート" },
      { label: "THANKS POINTS", tag: null, description: "オリジナルサンクスポイント" },
    ],
  },
  {
    number: "03",
    title: "生まれ変わる",
    description: "お持ちの製品が生まれ変わる再塗装プログラムで一生サポート",
    features: [
      { label: "RE-COATING", tag: null, description: "再塗装で新品同様に" },
      { label: "REPAIR PROGRAM", tag: "New", description: "修理プログラム" },
    ],
  },
]

export function LifetimeSupportSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section id="support" ref={ref} className="py-20 md:py-28 bg-secondary">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-6">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-2"
          >
            Sustainability
          </motion.span>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-[28px] md:text-[36px] text-dark leading-tight mb-4">
            Life Time <span className="text-gold">IRONWORKS</span>
            <br />
            Support
          </h2>
          <p className="text-[14px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            お客様のこと、環境のことをあらためて考えてみました。
            <br className="hidden md:block" />
            すべてのお客さまに毎日、手摺を楽しんでいただくために、
            <br className="hidden md:block" />
            そして一生使っていただくために、購入前から購入後までサポートいたします。
          </p>
        </motion.div>

        {/* Support Steps */}
        <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
          {supportSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className="relative"
            >
              {/* Number */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[48px] md:text-[56px] font-light text-gold/30">
                  {step.number}
                </span>
              </div>

              {/* Content Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="font-serif text-xl text-dark mb-3">{step.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Features */}
                <div className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.15 + featureIndex * 0.1 }}
                      className="group flex items-start gap-3 p-3 rounded-xl bg-secondary hover:bg-gold/5 transition-colors duration-300 cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] tracking-wider text-gold font-medium uppercase">
                            {feature.label}
                          </span>
                          {feature.tag && (
                            <span className="px-1.5 py-0.5 bg-gold text-white text-[9px] rounded">
                              {feature.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-muted-foreground">{feature.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Connector line (hidden on mobile, first two items) */}
              {index < 2 && (
                <div className="hidden md:block absolute top-12 -right-4 w-8 h-px bg-border" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 bg-white rounded-2xl p-8 md:p-10 text-center"
        >
          <p className="text-[13px] text-muted-foreground mb-4">
            購入前のお困りごとから、購入後のお悩みまで、
            <br className="hidden sm:block" />
            手摺を知り尽くしたコンシェルジュがいつでもサポート。
          </p>
          
          <h4 className="font-serif text-lg text-dark mb-4">お客様サポート</h4>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <a 
              href="tel:0120-000-000" 
              className="group flex items-center gap-2 text-dark hover:text-gold transition-colors duration-300"
            >
              <Phone className="w-4 h-4" />
              <span className="text-xl md:text-2xl font-light tracking-wider">0120-000-000</span>
            </a>
            <span className="text-[11px] text-muted-foreground">［月〜金 9:00〜17:00］</span>
          </div>
          
          <div className="mt-6">
            <PrimaryCTA
              href="/contact"
              variant="outline"
              size="md"
              icon={<Mail className="w-4 h-4" />}
            >
              メールでのお問い合わせ
            </PrimaryCTA>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
