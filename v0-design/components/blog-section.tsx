"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const CDN = "https://imagedelivery.net/QondspN4HIUvB_R16-ddAQ/60e3e0f9c3289c7ab78f13e7"

const blogPosts = [
  {
    id: 1,
    title: "階段・廊下の手すりの取り付け方",
    excerpt: "手すりの高さ・位置・取り付け方法を詳しく解説。DIYでも安心の施工ガイド。",
    image: `${CDN}/579e79e794eed28d9ac7.jpg/fit=cover,w=600,h=450`,
    category: "施工ガイド",
    date: "2025.12.10",
    href: "/blog/kaidan",
  },
  {
    id: 2,
    title: "ペットと暮らす家の手すり選び",
    excerpt: "ペットの安全を守りながら、インテリアにも馴染むアイアン手すりの選び方。",
    image: `${CDN}/720c42cc222961d0c4f7.jpg/fit=cover,w=600,h=450`,
    category: "暮らしのヒント",
    date: "2025.11.20",
    href: "/blog/pet",
  },
  {
    id: 3,
    title: "アイアン手すりの魅力と選び方",
    excerpt: "素材の特徴から施工事例まで。アイアン手すりを検討中の方へ。",
    image: `${CDN}/d0f5f0e83d40a4d29044.jpg/fit=cover,w=600,h=450`,
    category: "選び方ガイド",
    date: "2025.10.15",
    href: "/blog/handrail",
  },
]

export function BlogSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 md:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-block text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4"
            >
              Blog
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl text-dark"
            >
              お知らせ・コラム
            </motion.h2>
          </div>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group inline-flex items-center gap-2 text-sm text-dark hover:text-gold transition-colors duration-300"
          >
            すべての記事を見る
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
        </div>

        {/* Blog Grid - with left gold border accent and grayscale reveal */}
        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 50, rotateY: -15 }}
              animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="group cursor-pointer"
            >
              {/* Card with left gold border accent */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border-l-4 border-transparent hover:border-gold hover:-translate-y-2">
                {/* Image with grayscale to color transition */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                  />
                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-dark text-xs rounded-full">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <time className="text-xs text-muted-foreground">{post.date}</time>
                  <h3 className="font-serif text-lg text-dark mt-2 mb-3 group-hover:text-gold transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>

                  {/* Read More with arrow reveal */}
                  <span className="inline-flex items-center gap-2 text-sm text-dark group-hover:text-gold transition-colors duration-300">
                    <span className="relative">
                      READ
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
