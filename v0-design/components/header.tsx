"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Menu, X, ShoppingBag } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "製品一覧", href: "/#lineup" },
    { label: "ご注文について", href: "/about" },
    { label: "お客様の声", href: "/#testimonials" },
    { label: "ブログ", href: "/blog" },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled 
            ? "bg-white/95 backdrop-blur-md shadow-sm" 
            : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo - Left */}
            <Link href="/" className="group flex items-center gap-2 shrink-0">
              <div className="relative">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-dark flex items-center justify-center group-hover:bg-gold transition-colors duration-300">
                  <span className="text-white font-serif text-sm lg:text-base">鍛</span>
                </div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                  IRONWORKS
                </span>
                <span className="font-serif text-lg lg:text-xl tracking-wider text-dark">
                  ado
                </span>
              </div>
            </Link>

            {/* Center Navigation - Desktop */}
            <nav className="hidden lg:flex items-center justify-center gap-10 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-[13px] tracking-wide text-dark/80 hover:text-dark transition-colors duration-300 group py-2"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-dark transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Cart Icon */}
              <button 
                className="p-2 rounded-full transition-all duration-300 hover:bg-muted relative text-dark"
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
                className="p-2 rounded-full transition-all duration-300 hover:bg-muted text-dark flex items-center gap-2"
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-dark flex items-center justify-center">
                      <span className="text-white font-serif text-sm">鍛</span>
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">IRONWORKS</span>
                      <span className="font-serif text-base tracking-wider text-dark">ado</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
