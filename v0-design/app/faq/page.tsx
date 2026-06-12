"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { SITE_FAQS } from "@/lib/faq-data"

// FAQ データは lib/faq-data.ts が正本（FAQPage スキーマ・商品ページ FAQ と共用）
const faqs = SITE_FAQS

export const dynamic = "force-static"

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        {/* ── ページヘッダー ── */}
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">FAQ</p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground mb-4">
              よくあるご質問
            </h1>
            <p className="text-[14px] leading-[1.95] text-muted-foreground max-w-[640px]">
              納期・取り付け・オーダーメイド・お支払いなど、ご注文前にお寄せいただくことの多いご質問をまとめました。記載のない内容はお気軽にお問い合わせください。
            </p>
          </div>
        </div>

        {/* ── FAQ アコーディオン ── */}
        <section className="max-w-[880px] mx-auto px-4 lg:px-8 py-16">
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={index}
                  className="border border-border rounded-lg overflow-hidden bg-card"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-start justify-between gap-4 p-5 lg:p-6 text-left hover:bg-secondary/40 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif text-[15px] lg:text-[17px] font-medium text-foreground leading-relaxed">
                      {faq.q}
                    </span>
                    <span
                      className={`shrink-0 w-7 h-7 rounded-full border border-border flex items-center justify-center transition-transform ${
                        isOpen ? "rotate-45 border-gold text-gold" : ""
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="text-[14px] leading-[1.95] text-muted-foreground px-5 lg:px-6 pb-5 lg:pb-6 whitespace-pre-line">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 業者の方への導線 ── */}
        <section className="max-w-[880px] mx-auto px-4 lg:px-8 pb-12">
          <div className="border border-border rounded-xl bg-card p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-5">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">For Builders</p>
              <h2 className="font-serif text-xl lg:text-2xl text-foreground mb-2">
                工務店様・設計事務所様へ
              </h2>
              <p className="text-[13px] leading-[1.85] text-muted-foreground">
                業者様向けの卸価格・図面 / CAD 対応・特急納期・施工事例については、業者様専用ページをご用意しております。
              </p>
            </div>
            <PrimaryCTA href="/trade" variant="dark" size="md" withArrow>
              業者様専用ページへ
            </PrimaryCTA>
          </div>
        </section>

        {/* ── 解決しなかった場合の CTA ── */}
        <section className="max-w-[880px] mx-auto px-4 lg:px-8 pb-16 text-center">
          <p className="text-[14px] text-muted-foreground mb-5">
            その他のご質問は、お気軽にお問い合わせください。
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-[14px] text-foreground hover:text-gold transition-colors"
          >
            お問い合わせフォームへ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
