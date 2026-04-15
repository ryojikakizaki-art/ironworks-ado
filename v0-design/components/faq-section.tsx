"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "納期はどのくらいかかりますか?",
    answer: "通常、ご注文確定後4〜6週間程度お時間をいただいております。繁忙期や複雑なデザインの場合は、さらにお時間をいただく場合がございます。お急ぎの場合はご相談ください。",
  },
  {
    question: "取り付け工事は必要ですか?",
    answer: "はい、安全のため専門スタッフによる取り付け工事をお勧めしております。全国対応しており、施工費用は別途お見積りとなります。DIYでの取り付けをご希望の場合は、詳しい説明書をお付けいたします。",
  },
  {
    question: "オーダーメイドは可能ですか?",
    answer: "もちろん可能です。お客様のご要望に合わせた完全オーダーメイドの手摺を製作いたします。デザイン、サイズ、仕上げなど、お気軽にご相談ください。",
  },
  {
    question: "メンテナンスは必要ですか?",
    answer: "当店の手摺は耐久性の高い塗装を施しておりますが、長くお使いいただくために年1〜2回の簡単なお手入れをお勧めしております。柔らかい布で乾拭きするだけで十分です。",
  },
  {
    question: "返品・交換はできますか?",
    answer: "オーダーメイド商品のため、お客様都合による返品・交換は承っておりません。ただし、製品に欠陥があった場合は、無償で交換・修理させていただきます。",
  },
]

export function FaqSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section ref={ref} className="py-24 md:py-32 bg-light-gray">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4"
          >
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl md:text-4xl text-dark"
          >
            よくあるご質問
          </motion.h2>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left group hover:bg-cream/50 transition-colors duration-300"
              >
                <span className="font-serif text-dark pr-4">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-cream flex items-center justify-center group-hover:bg-gold transition-colors duration-300"
                >
                  <ChevronDown className="w-4 h-4 text-dark group-hover:text-white transition-colors duration-300" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed border-t border-border pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-sm mb-4">
            その他ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <button className="group inline-flex items-center gap-2 text-sm text-dark hover:text-gold transition-colors duration-300">
            お問い合わせフォームへ
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center group-hover:bg-gold group-hover:border-gold group-hover:text-white transition-all duration-300">
              →
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
