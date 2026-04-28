"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { Instagram, Facebook, Mail } from "lucide-react"
import { LineIcon } from "@/components/ui/line-icon"

const footerLinks = {
  products: {
    title: "製品",
    links: [
      { label: "横型手すり", href: "/#lineup" },
      { label: "縦型手すり", href: "/#lineup" },
      { label: "ロートアイアン", href: "/#lineup" },
      { label: "階段・フェンス", href: "/#lineup" },
    ],
  },
  support: {
    title: "ご利用案内",
    links: [
      { label: "ご注文について", href: "/about" },
      { label: "お問い合わせ", href: "/contact" },
      { label: "塗装について", href: "/paint" },
      { label: "溶融亜鉛めっき", href: "/galvanizing" },
    ],
  },
  company: {
    title: "IRONWORKS ado",
    links: [
      { label: "ご挨拶", href: "/greeting" },
      { label: "ブログ", href: "/blog" },
      { label: "特定商取引法に基づく表記", href: "/tokushoho" },
    ],
  },
}

const socialLinks = [
  { icon: LineIcon, href: "https://lin.ee/Tnjukrf", label: "LINE" },
  { icon: Instagram, href: "https://www.instagram.com/ironworks_ado/", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61556286998274", label: "Facebook" },
  { icon: Mail, href: "mailto:ado@tantetuzest.com", label: "メール" },
]

export function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <footer ref={ref} className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                <span className="text-white font-serif text-lg">鍛</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs tracking-[0.3em] text-white/50 uppercase">IRONWORKS</span>
                <span className="font-serif text-xl tracking-wider">ado</span>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              千葉の工房から、
              <br />
              心を込めた手摺をお届けします。
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all duration-300 hover:scale-110"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          </motion.div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
            >
              <h4 className="font-serif text-sm mb-6 text-gold">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 text-sm hover:text-white transition-colors duration-300 inline-block relative group"
                    >
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} IRONWORKS ado. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-white/40 text-xs hover:text-white transition-colors duration-300">
              利用規約
            </Link>
            <Link href="/privacy" className="text-white/40 text-xs hover:text-white transition-colors duration-300">
              プライバシーポリシー
            </Link>
            <Link href="/sitemap" className="text-white/40 text-xs hover:text-white transition-colors duration-300">
              サイトマップ
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
