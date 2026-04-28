"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { LineIcon } from "@/components/ui/line-icon"

export function CtaBanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section 
      id="cta"
      ref={ref} 
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Diagonal Clip Top */}
      <div 
        className="absolute top-0 left-0 right-0 h-16 bg-white"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 100%)" }}
      />

      {/* Animated Gradient Background */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)",
            "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #2a2a2a 100%)",
            "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)",
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Decorative Elements */}
      <div className="absolute top-16 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      
      {/* Subtle Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-8">
        {/* Diamond Divider */}
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={isInView ? { scale: 1, rotate: 45 } : {}}
          transition={{ duration: 0.6 }}
          className="w-3 h-3 bg-gold mx-auto mb-10"
        />

        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-block text-xs tracking-[0.3em] text-gold uppercase mb-6"
        >
          Contact Us
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6 leading-relaxed text-balance"
        >
          あなただけの手摺を、
          <br />
          一緒につくりませんか
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed"
        >
          千葉の工房から、ひとつずつ手仕事で仕上げます。
          <br className="hidden md:block" />
          図面・現場写真・ご相談、お気軽にお寄せください。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <PrimaryCTA href="/contact" variant="gold" size="lg">
            お問い合わせ
          </PrimaryCTA>

          <PrimaryCTA href="/#lineup" variant="ghost-light" size="lg" withArrow={false}>
            製品を見る
          </PrimaryCTA>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 pt-10 border-t border-white/10 grid gap-8 md:grid-cols-3 max-w-4xl mx-auto text-left md:text-center"
        >
          {/* LINE（個人情報なし・気軽に） */}
          <div>
            <p className="text-white/50 text-xs mb-2 tracking-wider">LINEでのお問い合わせ</p>
            <a
              href="https://lin.ee/Tnjukrf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-lg md:text-xl text-[#06C755] font-light tracking-wider hover:text-white transition-colors duration-300"
            >
              <LineIcon className="w-6 h-6 md:w-7 md:h-7" />
              LINEで友だち追加
            </a>
            <p className="text-white/50 text-xs mt-2">個人情報なしで気軽にご相談いただけます</p>
          </div>

          {/* メール */}
          <div>
            <p className="text-white/50 text-xs mb-2 tracking-wider">メールでのお問い合わせ</p>
            <a
              href="mailto:ado@tantetuzest.com"
              className="text-lg md:text-xl text-white font-light tracking-wider hover:text-gold transition-colors duration-300 break-all"
            >
              ado@tantetuzest.com
            </a>
            <p className="text-white/50 text-xs mt-2">通常2営業日以内にご返信いたします</p>
          </div>

          {/* 電話 */}
          <div>
            <p className="text-white/50 text-xs mb-2 tracking-wider">お電話でのお問い合わせ</p>
            <a
              href="tel:07038170659"
              className="text-lg md:text-xl text-white font-light tracking-wider hover:text-gold transition-colors duration-300"
            >
              070-3817-0659
            </a>
            <p className="text-white/50 text-xs mt-2">平日 9:00〜17:00（作業中は折り返しになります）</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
