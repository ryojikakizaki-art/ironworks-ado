"use client"

import Link from "next/link"
import { Building2, ArrowRight } from "lucide-react"

/**
 * トップページのヒーロー直下に置く、業者向け導線バナー。
 * 個人客の購入動線を妨げないよう控えめなトーンで、業者層には確実に拾わせる。
 */
export function TradeBanner() {
  return (
    <section className="border-b border-border bg-dark text-white">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4 lg:py-5">
        <Link
          href="/trade"
          className="group flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 text-left"
        >
          <div className="flex items-start md:items-center gap-3 md:gap-4">
            <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-gold/15 text-gold">
              <Building2 className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-1">
                For Builders
              </p>
              <p className="font-serif text-[15px] md:text-[17px] leading-snug">
                工務店・設計事務所の方へ。
                <span className="text-white/70">
                  「無理」と言われた図面こそ、ado で形にしませんか。
                </span>
              </p>
            </div>
          </div>
          <span className="self-end md:self-auto shrink-0 inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/30 group-hover:border-gold group-hover:bg-gold group-hover:text-dark transition-colors text-[12px] md:text-[13px] tracking-wide">
            業者専用ページへ
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </section>
  )
}
