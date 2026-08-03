"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart/store"

type NavChild = { label: string; href: string; sub?: string }
type NavItem =
  | { label: string; href: string; children?: undefined }
  | { label: string; href?: undefined; children: NavChild[] }

export function Header({
  forceDark = false,
  hasHero = false,
}: { forceDark?: boolean; hasHero?: boolean } = {}) {
  // 暗いヒーロー写真の上にいる間だけ白ロゴ（ado_logo_W）＋白文字にする。
  //
  // 既定は false = 黒ロゴ（ado_logo_K）。これは安全側の既定値で、
  // ヒーローを持たない白背景のページ（/faq /price /products など大多数）で
  // 白ロゴ・白ナビが白地に描画されて「ヘッダーが真っ白で見えない」状態になるのを防ぐ。
  // 新しいページで hasHero を書き忘れても、最悪「白地に黒ロゴ＝読める」で済む。
  //
  // hasHero:   暗い全画面ヒーローを持つページだけ true を渡す
  //            （/ トップ, /about, /categories/antique, /categories/simple, /wrought-iron）
  //            true のときだけスクロール監視を行い、ヒーローを抜けたら黒ロゴへ切り替える。
  // forceDark: 明るいヒーローで白ロゴが埋没するページの打ち消し用（/kaigo など）。hasHero より優先。
  const [overHeroRaw, setOverHero] = useState(hasHero)
  const overHero = forceDark ? false : overHeroRaw
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  // Hide on Scroll: 下スクロールでヘッダーを隠し、上スクロールで戻す。
  const [hideHeader, setHideHeader] = useState(false)
  // ページ先頭を離れているか。離れている間だけヘッダーに半透明の白帯を敷き、
  // 背後の本文とロゴ・メニューが重なって読みにくくなるのを防ぐ。
  const [scrolledPastTop, setScrolledPastTop] = useState(false)
  // カートに 1 本以上入っている時だけアイコンを出す。空の時に「0」を常時表示すると
  // 壊れている印象を与えるため、2026-06-12 に一度撤去した経緯がある。
  const { count: cartCount } = useCart()

  useEffect(() => {
    // ヒーローを持たないページはスクロールしても常に黒ロゴなので監視不要
    if (!hasHero) return
    const handleScroll = () => {
      const y = window.scrollY
      const vh = window.innerHeight
      // ヒーロー（100vh）を抜けたら濃いテキスト色へ
      setOverHero(y < vh - 80)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasHero])

  // メニュー／ドロップダウンの開閉状態。スクロール監視の中から参照するが、
  // これを useEffect の依存配列に入れると開閉のたびに監視を貼り直すことになり、
  // 閉じた判定を取りこぼした時に監視が復帰せず「常に表示」で固まる。
  // そのため ref に持たせ、監視自体はマウント時に一度だけ貼る。
  const menuOpenRef = useRef(false)
  menuOpenRef.current = isMobileMenuOpen || openDropdown !== null

  // Hide on Scroll のスクロール監視（マウント時に一度だけ登録）
  useEffect(() => {
    let lastY = window.scrollY
    // 指の微細な揺れや慣性スクロールの揺り戻しでチラつかせないための下限
    const MIN_DELTA = 8
    // 最上部付近では常に表示する（ページ先頭でヘッダーが無い状態を作らない）
    const TOP_ZONE = 80
    const handleScroll = () => {
      const y = window.scrollY
      // 帯の出し入れは「先頭にいるか」だけで決まるので、
      // 下の微小移動フィルタ（MIN_DELTA）より先に判定する。
      setScrolledPastTop(y > TOP_ZONE)
      const delta = y - lastY
      if (Math.abs(delta) < MIN_DELTA) return
      lastY = y
      // メニューを開いている間は隠さない（開いたまま隠れると操作不能になるため）
      if (menuOpenRef.current) return
      if (y <= TOP_ZONE) {
        setHideHeader(false)
        return
      }
      setHideHeader(delta > 0)
    }
    // 途中位置で読み込まれた場合（アンカーリンク・リロード）にも帯を正しく反映する
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // メニューを開いたら、隠れていても必ず表示に戻す
  useEffect(() => {
    if (isMobileMenuOpen || openDropdown) setHideHeader(false)
  }, [isMobileMenuOpen, openDropdown])

  const navItems: NavItem[] = [
    // /#lineup は LineupSection がトップページから外された際に参照先を失い、
    // 押しても何も起きないリンク切れになっていた。全商品が並ぶ /products へ向ける。
    { label: "製品一覧", href: "/products" },
    {
      label: "カテゴリ",
      children: [
        { label: "アンティーク・クラシック手すり", href: "/categories/antique", sub: "ロートアイアン・装飾・職人手打ち" },
        { label: "シンプル手すり", href: "/categories/simple", sub: "25φ STKM パイプ・モダン定番" },
      ],
    },
    { label: "ABOUT", href: "/about" },
    { label: "お客様の声", href: "/#testimonials" },
    { label: "介護保険", href: "/kaigo" },
    { label: "FAQ", href: "/faq" },
  ]

  return (
    <>
      {/* Hide on Scroll のスライドは、この外側ラッパーの CSS transition が担当する。
          内側 motion.header の入場アニメーション（framer-motion の y）と同じ要素で
          transform を奪い合うと入場が発火しなくなるため、レイヤーを分けている。
          -translate-y-full はセーフエリア込みの実高ぶん動くので、ノッチ端末でも隠しきれる。 */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-out ${
          hideHeader ? "-translate-y-full" : "translate-y-0"
        }`}
      >
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        // 半透明の白帯は「先頭を離れている」かつ「暗いヒーローの上にいない」ときだけ。
        // ヒーロー上（overHero）はロゴ・文字が白なので、白帯を敷くと埋没して見えなくなる。
        className={`pointer-events-auto transition-colors duration-300 [padding-top:env(safe-area-inset-top)] ${
          scrolledPastTop && !overHero
            ? "bg-white/85 backdrop-blur-md shadow-sm"
            : "bg-transparent"
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
                  unoptimized
                  sizes="(min-width: 1024px) 48px, 40px"
                  className="object-contain object-left"
                />
              </div>
            </Link>

            {/* Center Navigation - Desktop */}
            <nav className="hidden lg:flex items-center justify-center gap-7 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => {
                if (item.children) {
                  const isOpen = openDropdown === item.label
                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => setOpenDropdown(item.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button
                        type="button"
                        className={`relative text-[15px] tracking-wide transition-colors duration-300 group py-2 inline-flex items-center gap-1 ${
                          overHero
                            ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] hover:text-white"
                            : "text-dark/80 hover:text-dark"
                        }`}
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                      >
                        {item.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} strokeWidth={1.8} />
                        <span className={`absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-300 group-hover:w-full ${
                          overHero ? "bg-white" : "bg-dark"
                        }`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            key="dropdown-panel"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[300px]"
                          >
                            <div className="bg-white rounded-md shadow-xl border border-border overflow-hidden">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className="block px-5 py-4 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <div className="text-[14px] text-dark font-medium leading-tight">{child.label}</div>
                                  {child.sub && (
                                    <div className="text-[11px] text-muted-foreground mt-1 tracking-wide">{child.sub}</div>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative text-[15px] tracking-wide transition-colors duration-300 group py-2 ${
                      overHero
                        ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] hover:text-white"
                        : "text-dark/80 hover:text-dark"
                    }`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-300 group-hover:w-full ${
                      overHero ? "bg-white" : "bg-dark"
                    }`} />
                  </Link>
                )
              })}
              <Link
                href="/contact"
                className={`relative text-[15px] tracking-wide transition-colors duration-300 group py-2 ${
                  overHero
                    ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] hover:text-white"
                    : "text-dark/80 hover:text-dark"
                }`}
              >
                お問い合わせ
                <span className={`absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-300 group-hover:w-full ${
                  overHero ? "bg-white" : "bg-dark"
                }`} />
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* カートアイコン — 中身がある時だけ表示する。
                  2026-06-12 に一度撤去したのは「カート機能が無いのに常時 0 表示・
                  クリック無反応」だったため。カート機能の新設に伴い、
                  0 件では出さない形で復活させている。 */}
              {cartCount > 0 && (
                <Link
                  href="/cart"
                  aria-label={`カート（${cartCount}本）`}
                  className={`relative p-2 rounded-full transition-all duration-300 ${
                    overHero ? "text-white hover:bg-white/10" : "text-dark hover:bg-muted"
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-gold text-white text-[11px] font-bold leading-none">
                    {cartCount}
                  </span>
                </Link>
              )}

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
      </div>

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
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {item.children ? (
                          <div>
                            <div className="px-6 pt-4 pb-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
                              {item.label}
                            </div>
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="flex items-center justify-between pl-8 pr-6 py-3 text-dark hover:bg-muted/50 transition-colors duration-200 group"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <span className="text-[14px] tracking-wide leading-tight">{child.label}</span>
                                <span className="text-muted-foreground group-hover:text-dark group-hover:translate-x-1 transition-all duration-200">
                                  &rarr;
                                </span>
                              </Link>
                            ))}
                          </div>
                        ) : (
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
                        )}
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
                      { label: "業者様へ", href: "/trade" },
                      { label: "ご挨拶", href: "/greeting" },
                      { label: "塗装について", href: "/paint" },
                      { label: "溶融亜鉛メッキについて", href: "/galvanizing" },
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
                        unoptimized
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
