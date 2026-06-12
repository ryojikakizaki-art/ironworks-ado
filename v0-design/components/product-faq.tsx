"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MessageSquare } from "lucide-react"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { PRODUCT_PAGE_FAQS } from "@/lib/faq-data"

/** FAQ アコーディオン項目（simple-product-page の FAQItem と同デザイン） */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left hover:text-gold transition-colors"
        aria-expanded={open}
      >
        <span className="font-serif text-[16px] font-medium text-foreground leading-relaxed">{q}</span>
        <span className={`shrink-0 w-7 h-7 rounded-full border border-gold/20 flex items-center justify-center transition-transform ${open ? "rotate-45 border-gold" : ""}`}>
          <Plus className="w-4 h-4" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-[14px] leading-loose text-muted-foreground pb-5 whitespace-pre-line">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * 図面フロー商品ページ用の「よくあるご質問」セクション。
 * simple 側（Élisabeth 等）には FAQ があるのに主力の rene/claude/antoine に
 * 無かった逆転状態の解消（2026-06-12 監査 B群⑩）。
 * 内容は lib/faq-data の購入判断 5 問を共通利用する。
 */
export function ProductFaq({ slug }: { slug: string }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-gold rounded-full" />
        <h2 className="font-serif text-2xl text-foreground">よくあるご質問</h2>
      </div>
      <div className="border-t border-border">
        {PRODUCT_PAGE_FAQS.map((item, i) => (
          <FAQItem key={i} q={item.q} a={item.a} />
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center gap-4">
        <PrimaryCTA
          href={`/contact?product=${encodeURIComponent(slug)}&category=product`}
          variant="gold"
          size="md"
          icon={<MessageSquare className="w-4 h-4" />}
          withArrow
        >
          その他のご質問はこちら
        </PrimaryCTA>
        <div className="flex gap-6 text-[13px] md:text-sm">
          <Link href="/faq" className="text-muted-foreground hover:text-gold transition-colors underline underline-offset-4">
            すべての質問を見る
          </Link>
          <Link href="/reviews" className="text-muted-foreground hover:text-gold transition-colors underline underline-offset-4">
            ご購入者の声を見る
          </Link>
        </div>
      </div>
    </section>
  )
}
