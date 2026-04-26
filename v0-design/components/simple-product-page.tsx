"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Mail, MessageSquare } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { SimpleProduct } from "@/lib/products/simple"

/**
 * シンプルな商品詳細ページ（手すり以外の 17 商品向け）
 *
 * - 画像ギャラリー（/public/images/products/{slug}/ から読み込み）
 * - 商品説明・スペック表
 * - 価格 > 0: 表示価格 + ご購入ボタン（Stripe — 追って実装）
 * - 価格 = 0: 「お見積もりを取る」ボタン → /contact （商品プリセレクト）
 *
 * 画像が未配置でも壊れず、placeholder としてプレースホルダーが表示される
 */
export function SimpleProductPage({ product }: { product: SimpleProduct }) {
  const [selectedImage, setSelectedImage] = useState(0)

  // 画像 URL を構築：/public/images/products/{slug}/{filename}
  const imageUrls = product.images.map(
    (filename) => `/images/products/${product.slug}/${filename}`,
  )

  const goNext = () => setSelectedImage((i) => (i + 1) % imageUrls.length)
  const goPrev = () => setSelectedImage((i) => (i - 1 + imageUrls.length) % imageUrls.length)

  const isQuoteOnly = product.basePrice === 0

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* ── パンくず ── */}
      <div className="pt-24 pb-6 px-6 max-w-7xl mx-auto">
        <nav className="text-xs text-muted-foreground tracking-wider">
          <Link href="/" className="hover:text-dark transition-colors">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-dark transition-colors">
            PRODUCTS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-dark">{product.nameEn}</span>
        </nav>
      </div>

      {/* ── 商品メイン ── */}
      <section className="px-6 max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── 左：画像ギャラリー ── */}
          <div>
            {/* メイン画像 */}
            <div className="relative aspect-square bg-secondary rounded-xl overflow-hidden mb-3">
              <Image
                key={imageUrls[selectedImage]}
                src={imageUrls[selectedImage]}
                alt={`${product.nameEn} ${selectedImage + 1}`}
                fill
                className="object-cover"
                priority={selectedImage === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* 前後ボタン（画像 2 枚以上の場合のみ表示） */}
              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="前の画像"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="次の画像"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {product.badge && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-gold text-white text-xs tracking-wider rounded-full">
                  {product.badge}
                </div>
              )}
            </div>

            {/* サムネイル */}
            {imageUrls.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {imageUrls.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square bg-secondary rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? "border-gold" : "border-transparent hover:border-muted"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.nameEn} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── 右：商品情報 ── */}
          <div>
            <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-3">
              {product.category}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-dark mb-2">
              {product.nameEn}
            </h1>
            <p className="text-lg text-muted-foreground mb-1">{product.nameJa}</p>
            <p className="text-sm text-muted-foreground mb-8">{product.subtitle}</p>

            {/* 価格表示 */}
            {!isQuoteOnly && (
              <div className="mb-8 pb-8 border-b border-border">
                <p className="text-xs text-muted-foreground mb-1 tracking-wider">PRICE</p>
                <p className="font-serif text-3xl text-dark">
                  ¥{product.basePrice.toLocaleString()}
                  <span className="text-sm text-muted-foreground ml-2">（税込・送料別）</span>
                </p>
              </div>
            )}

            {/* キャッチ */}
            <p className="text-base text-dark leading-relaxed mb-6">
              {product.shortDescription}
            </p>

            {/* 詳細 */}
            <p className="text-sm text-muted-foreground leading-loose mb-10 whitespace-pre-line">
              {product.longDescription}
            </p>

            {/* スペック表 */}
            <div className="mb-10">
              <h2 className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4">
                Specs
              </h2>
              <dl className="divide-y divide-border border-y border-border">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="grid grid-cols-3 py-3">
                    <dt className="text-sm text-muted-foreground col-span-1">{spec.label}</dt>
                    <dd className="text-sm text-dark col-span-2">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-3"
            >
              {isQuoteOnly ? (
                <Link
                  href={`/contact?product=${encodeURIComponent(product.slug)}&category=size`}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-dark text-white rounded-full hover:bg-gold transition-colors duration-300"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm tracking-wider">お見積もり・ご相談はこちら</span>
                </Link>
              ) : (
                <>
                  {/* 価格付き商品：Stripe 決済は追って実装。現状はお問い合わせフォームで承る */}
                  <Link
                    href={`/contact?product=${encodeURIComponent(product.slug)}&category=order`}
                    className="group flex items-center justify-center gap-3 px-8 py-4 bg-gold text-white rounded-full hover:bg-dark transition-colors duration-300"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm tracking-wider font-medium">ご注文・お問い合わせ</span>
                  </Link>
                  <p className="text-xs text-muted-foreground text-center leading-loose">
                    ご注文確認後、見積書（送料込）をお送りいたします。
                    <br />
                    オンライン決済対応は順次拡大中です。
                  </p>
                </>
              )}

              {/* STORES への補助リンク（移行期間中の保険） */}
              {product.storesUrl && (
                <a
                  href={product.storesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground text-center hover:text-dark transition-colors mt-2"
                >
                  STORES のページを見る ↗
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
