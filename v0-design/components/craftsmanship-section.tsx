"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

export function CraftsmanshipSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50])

  return (
    <section ref={ref} className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <motion.div 
              style={{ y: imageY }}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden"
            >
              <Image
                src="/images/craftsman.jpg"
                alt="鍛冶職人"
                fill
                className="object-cover"
              />
            </motion.div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-gold rounded-3xl -z-10" />
            
            {/* Experience Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -bottom-4 -left-4 md:bottom-8 md:left-8 bg-dark text-white p-6 rounded-2xl shadow-xl"
            >
              <span className="text-5xl font-light text-gold">30</span>
              <span className="text-xs block mt-1 text-white/70">年の経験</span>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4"
            >
              Craftsmanship
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-serif text-3xl md:text-4xl text-dark mb-6 leading-relaxed"
            >
              火と鉄と向き合う、
              <br />
              職人の手仕事
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4 text-muted-foreground text-sm leading-loose"
            >
              <p>
                私たちの工房では、昔ながらの鍛冶技法を守りながら、
                現代の住空間に調和するデザインを追求しています。
              </p>
              <p>
                一本の鉄材を真っ赤に熱し、ハンマーで叩いて形を作る。
                この工程を何度も繰り返すことで、機械では出せない
                独特の風合いと強度が生まれます。
              </p>
              <p>
                手摺に触れたとき感じる、あたたかみのある質感。
                それは、職人の魂が宿った証です。
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-2 gap-6 mt-10"
            >
              {[
                { icon: "🔥", title: "伝統技法", desc: "受け継がれた技術" },
                { icon: "⚒️", title: "一点物", desc: "すべて手作り" },
                { icon: "🏆", title: "高品質", desc: "国産素材使用" },
                { icon: "♾️", title: "耐久性", desc: "100年の品質保証" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="group flex items-start gap-3 p-4 rounded-xl hover:bg-cream transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-lg group-hover:bg-gold group-hover:scale-110 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-dark font-medium text-sm">{feature.title}</h4>
                    <p className="text-muted-foreground text-xs mt-0.5">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
