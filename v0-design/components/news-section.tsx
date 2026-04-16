"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"

const news = [
  {
    date: "2025.04.10",
    isNew: true,
    title: "【施工動画】階段手すりのオーダー制作例 — 職人の技と現場の息遣いをご紹介します。",
  },
  {
    date: "2025.04.01",
    isNew: true,
    title: "2025年4月 価格改定のお知らせ — 一部商品の価格を改定いたしました。",
  },
  {
    date: "2025.02.01",
    isNew: false,
    title: "新商品「Clémence クレマンス」横型フラットバー手すり 発売開始しました。",
  },
  {
    date: "2024.12.20",
    isNew: false,
    title: "年末年始の営業について — 12/28〜1/5は冬季休業とさせていただきます。",
  },
]

export function NewsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section id="news" ref={ref} className="py-20 md:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-3"
          >
            News
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-[28px] md:text-[32px] text-dark"
          >
            お知らせ
          </motion.h2>
        </div>

        {/* News List - items slide in from right with stagger */}
        <div className="divide-y divide-border">
          {news.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 60 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
              className="group flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 py-5 hover:bg-secondary/50 -mx-4 px-4 rounded-lg transition-colors duration-300"
            >
              {/* Date */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[13px] text-muted-foreground tabular-nums">
                  {item.date}
                </span>
                {item.isNew && (
                  <motion.span 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="px-2 py-0.5 bg-gold text-white text-[10px] rounded font-medium"
                  >
                    New
                  </motion.span>
                )}
              </div>

              {/* Title */}
              <p className="flex-1 text-[14px] text-dark leading-relaxed group-hover:text-gold transition-colors duration-300">
                {item.title}
              </p>

              {/* Arrow */}
              <ArrowRight className="hidden sm:block w-4 h-4 text-muted-foreground/30 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-0.5" />
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-8"
        >
          <span className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
            <span>すべてのお知らせを見る</span>
          </span>
        </motion.div>
      </div>
    </section>
  )
}
