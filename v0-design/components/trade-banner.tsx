"use client"

import Link from "next/link"
import { Building2, ArrowRight } from "lucide-react"

/**
 * トップページのヒーロー直下に置く、業者向け導線バナー。
 *
 * 2026-05-13 改修:
 * - 上下入替: ado 工房の一貫体制ブロックを上に / For Builders 業者導線を下に
 * - 工房ブロック: 背景白・全部黒文字 (ゴールド除去) で本文を 2 行構成に
 * - 「手すり最短 5 日発送」の「5」は黒のままサイズ突出表示
 */
export function TradeBanner() {
  return (
    <section className="border-b border-border bg-white text-foreground">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-5 lg:py-6">
        {/* (1) ado 工房の一貫体制 + 最短発送日 — トップに配置 */}
        <div className="text-center md:text-left text-foreground">
          <p className="text-[13px] md:text-[14px] leading-relaxed">
            <span className="block">当工房はオーダーから制作、発送までを一貫して行っているため、</span>
            <span className="block">スピーディー、ハイクオリティ、リーズナブルにお届けします</span>
          </p>
          <p className="mt-3 font-serif text-[22px] md:text-[28px] font-bold tracking-wide flex items-baseline justify-center md:justify-start gap-1">
            <span>手すり最短</span>
            <span className="text-[48px] md:text-[60px] leading-none font-bold tracking-tight">
              5
            </span>
            <span>日発送</span>
          </p>
        </div>

        {/* (2) 工務店・設計事務所 向けバナー — 下に配置 (元の上ブロック) */}
        <Link
          href="/trade"
          className="mt-5 pt-5 border-t border-border group flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 text-left"
        >
          <div className="flex items-start md:items-center gap-3 md:gap-4">
            <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-gold/15 text-gold">
              <Building2 className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-1">
                For Builders
              </p>
              <p className="font-serif text-[15px] md:text-[17px] leading-snug text-foreground">
                工務店・設計事務所の方へ。
                <span className="text-foreground/70">
                  「無理」と言われた図面こそ、ado で形にしませんか。
                </span>
              </p>
            </div>
          </div>
          <span className="self-end md:self-auto shrink-0 inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-foreground/30 text-foreground group-hover:border-gold group-hover:bg-gold group-hover:text-white transition-colors text-[12px] md:text-[13px] tracking-wide">
            業者専用ページへ
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </section>
  )
}
