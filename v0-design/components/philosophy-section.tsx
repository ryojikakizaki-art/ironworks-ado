"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export function PhilosophySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 md:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Diamond Divider */}
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={isInView ? { scale: 1, rotate: 45 } : {}}
          transition={{ duration: 0.6 }}
          className="w-3 h-3 bg-gold mx-auto mb-12"
        />

        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-block text-xs tracking-[0.3em] text-muted-foreground uppercase mb-6"
        >
          Our Philosophy
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-serif text-3xl md:text-4xl text-dark mb-8 leading-relaxed text-balance"
        >
          手摺は、毎日触れるもの。
          <br />
          だからこそ、本物を届けたい。
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-muted-foreground text-sm md:text-base leading-loose max-w-2xl mx-auto"
        >
          IRONWORKS adoは、千葉県の工房で一本一本手作りで手摺を製作しています。
          機械では出せない温かみと、使い込むほどに馴染む質感。
          それは、職人の手仕事でしか生み出せない価値です。
          お客様の暮らしに寄り添い、何世代にも受け継がれる手摺をお届けします。
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border"
        >
          {[
            { number: "30", unit: "年", label: "鍛冶職人歴" },
            { number: "1,500", unit: "+", label: "製作実績" },
            { number: "100", unit: "%", label: "国産手作り" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              className="text-center"
            >
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl md:text-5xl lg:text-6xl font-light text-dark">{stat.number}</span>
                <span className="text-lg text-gold">{stat.unit}</span>
              </div>
              <span className="text-xs text-muted-foreground mt-2 block tracking-wide">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
