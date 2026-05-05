"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ShoppingBag } from "lucide-react"

export function Header() {
  // 「手仕事と、暮らそう。」のエントランス完了に合わせて自然に降りてくる
  const [headerVisible, setHeaderVisible] = useState(false)
  // ヒーローエリア上は背景が暗いので文字色を白に。
  const [overHero, setOverHero] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // ヒーローのエントランス（金線 0.3s + 0.8s + H1 1.2s 待ち + 1.2s = 約 2.4s）後にヘッダー出現。
  // 既にスクロールされている（戻る／復元）場合は即時表示。
  useEffect(() => {
    if (typeof window !== "undefined" && window.scrollY > 50) {
      setHeaderVisible(true)
      return
    }
    const t = setTimeout(() => setHeaderVisible(true), 2500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const vh = window.innerHeight
      // ヒーロー（500vh）を抜けたら濃いテキスト色へ
      setOverHero(y < vh * 5 - 80)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "製品一覧", href: "/#lineup" },
    { label: "ABOUT", href: "/about" },
    { label: "お客様の声", href: "/#testimonials" },
    { label: "お問い合わせ", href: "/contact" },
  ]

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          y: headerVisible ? 0 : -100,
          opacity: headerVisible ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-40 bg-transparent transition-colors duration-500 ${
          headerVisible ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo - Left */}
            <Link href="/" className="group shrink-0 flex items-center" aria-label="IRONWORKS ado トップへ">
              <div className="relative w-10 h-12 lg:w-12 lg:h-14 transition-opacity duration-300 group-hover:opacity-80">
                <Image
                  src={overHero ? "/images/ado_logo_W.png" : "/images/ado_logo_K.png"}
                  alt="IRONWORKS ado"
                  fill
                  priority
                  sizes="(min-width: 1024px) 48px, 40px"
                  className="object-contain object-left"
                />
              </div>
            </Link>

            {/* Center Navigation - Desktop */}
            <nav className="hidden lg:flex items-center justify-center gap-10 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-[13px] tracking-wide transition-colors duration-300 group py-2 ${
                    overHero
                      ? "text-white/85 hover:text-white"
                      : "text-dark/80 hover:text-dark"
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-300 group-hover:w-full ${
                    overHero ? "bg-white" : "bg-dark"
                  }`} />
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Cart Icon */}
              <button
                className={`p-2 rounded-full transition-all duration-300 relative ${
                  overHero
                    ? "text-white hover:bg-white/10"
                    : "text-dark hover:bg-muted"
                }`}
                aria-label="カート"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                  0
                </span>
              </button>

              {/* Hamburger Menu */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`p-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
                  overHero
                    ? "text-white hover:bg-white/10"
                    : "text-dark hover:bg-muted"
                }`}
                aria-label="メニューを開く"
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
                <span className="hidden lg:inline text-[13px] tracking-wide">MENU</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile/Full Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex justify-between items-center p-6 border-b border-border">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">MENU</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                    aria-label="メニューを閉じる"
                  >
                    <X className="w-5 h-5 text-dark" strokeWidth={1.5} />
                  </button>
                </div>
                
                {/* Menu Content */}
                <nav className="flex-1 overflow-y-auto">
                  <div className="py-4">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center justify-between px-6 py-4 text-dark hover:bg-muted/50 transition-colors duration-200 group"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className="text-[15px] tracking-wide">{item.label}</span>
                          <span className="text-muted-foreground group-hover:text-dark group-hover:translate-x-1 transition-all duration-200">
                            &rarr;
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Additional Links */}
                  <div className="border-t border-border py-4">
                    <div className="px-6 py-2">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">SUPPORT</span>
                    </div>
                    {[
                      { label: "お問い合わせ", href: "/contact" },
                      { label: "ご挨拶", href: "/greeting" },
                      { label: "塗装について", href: "/paint" },
                    ].map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center px-6 py-3 text-[13px] text-muted-foreground hover:text-dark hover:bg-muted/50 transition-colors duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>
                
                {/* Menu Footer */}
                <div className="p-6 border-t border-border bg-muted/30">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-block"
                    aria-label="IRONWORKS ado トップへ"
                  >
                    <div className="relative w-10 h-12">
                      <Image
                        src="/images/ado_logo_K.png"
                        alt="IRONWORKS ado"
                        fill
                        sizes="40px"
                        className="object-contain object-left"
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
