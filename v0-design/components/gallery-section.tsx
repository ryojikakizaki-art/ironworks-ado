"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import Image from "next/image"
import { ArrowRight, X } from "lucide-react"

const galleryItems = [
  { id: 1, image: "/images/installation.jpg", title: "モダン住宅", location: "東京都" },
  { id: 2, image: "/images/hero-handrail.jpg", title: "和風建築", location: "京都府" },
  { id: 3, image: "/images/product-curved.jpg", title: "リノベーション", location: "大阪府" },
  { id: 4, image: "/images/craftsman.jpg", title: "店舗デザイン", location: "福岡県" },
  { id: 5, image: "/images/product-ornate.jpg", title: "クラシック邸宅", location: "神奈川県" },
  { id: 6, image: "/images/product-straight.jpg", title: "ミニマル空間", location: "愛知県" },
]

export function GallerySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <>
      <section ref={ref} className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <motion.span
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="inline-block text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4"
              >
                Gallery
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-serif text-3xl md:text-4xl text-dark"
              >
                施工事例
              </motion.h2>
            </div>
            <motion.button
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group inline-flex items-center gap-2 text-sm text-dark hover:text-gold transition-colors duration-300"
            >
              すべて見る
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className={`group relative cursor-pointer overflow-hidden rounded-xl ${
                  index === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
                onClick={() => setSelectedImage(item.image)}
              >
                <div className={`relative ${index === 0 ? "aspect-square md:aspect-auto md:h-full" : "aspect-square"}`}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="text-white font-serif text-lg">{item.title}</h4>
                    <span className="text-white/70 text-xs">{item.location}</span>
                  </div>

                  {/* Corner Decoration */}
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/0 group-hover:border-gold transition-colors duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <Image
            src={selectedImage}
            alt="Gallery image"
            width={1200}
            height={800}
            className="max-w-full max-h-full object-contain"
          />
        </motion.div>
      )}
    </>
  )
}
