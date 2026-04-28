"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { PrimaryCTA } from "@/components/ui/primary-cta"

const products = [
  {
    id: 1,
    name: "シンプルストレート",
    nameEn: "Simple Straight",
    price: "¥48,000",
    image: "/images/product-straight.jpg",
    tag: "人気No.1",
  },
  {
    id: 2,
    name: "クラシックカーブ",
    nameEn: "Classic Curve",
    price: "¥68,000",
    image: "/images/product-curved.jpg",
    tag: null,
  },
  {
    id: 3,
    name: "オーナメント",
    nameEn: "Ornament",
    price: "¥88,000",
    image: "/images/product-ornate.jpg",
    tag: "職人推奨",
  },
  {
    id: 4,
    name: "モダンミニマル",
    nameEn: "Modern Minimal",
    price: "¥52,000",
    image: "/images/product-straight.jpg",
    tag: null,
  },
  {
    id: 5,
    name: "和モダン",
    nameEn: "Japanese Modern",
    price: "¥72,000",
    image: "/images/product-curved.jpg",
    tag: "新作",
  },
  {
    id: 6,
    name: "アールデコ",
    nameEn: "Art Deco",
    price: "¥95,000",
    image: "/images/product-ornate.jpg",
    tag: null,
  },
]

export function ProductGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 md:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4"
          >
            Products
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl md:text-4xl text-dark mb-4"
          >
            製品ラインナップ
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-sm"
          >
            様々なスタイルに合わせた手摺をご用意しています
          </motion.p>
        </div>

        {/* Product Grid with Masonry Effect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className={`group ${index % 2 === 1 ? "lg:mt-6" : ""}`}
            >
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-colors duration-300" />
                  
                  {/* Tag */}
                  {product.tag && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-gold text-white text-xs rounded-full">
                      {product.tag}
                    </span>
                  )}

                  {/* Quick View Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ scale: 1.05 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white text-dark text-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold hover:text-white"
                  >
                    詳細を見る
                  </motion.button>
                </div>

                {/* Info */}
                <div className="p-5">
                  <span className="text-xs text-muted-foreground tracking-wider uppercase">
                    {product.nameEn}
                  </span>
                  <h3 className="font-serif text-lg text-dark mt-1 group-hover:text-gold transition-colors duration-300">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-dark font-medium">{product.price}</span>
                    <span className="text-xs text-muted-foreground">〜</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <PrimaryCTA href="/products" variant="outline" size="md">
            すべての製品を見る
          </PrimaryCTA>
        </motion.div>
      </div>
    </section>
  )
}
