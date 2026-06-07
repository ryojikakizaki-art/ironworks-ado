"use client"

import { useState } from "react"

/**
 * 銀行振込のお振込み先口座カード（コピー機能つき）。
 *
 * ⚠️ 口座情報の正本はこの定数。蠣﨑さんが必ず目視で正誤を確認すること。
 *    （誤記は入金喪失に直結するため、公開前チェック必須）
 */
const BANK_INFO: { label: string; value: string; emphasize?: boolean }[] = [
  { label: "銀行名", value: "楽天銀行" },
  { label: "支店名", value: "ラテン支店" },
  { label: "口座種別", value: "普通預金" },
  { label: "口座番号", value: "5015300", emphasize: true },
  { label: "口座名義", value: "タンテツコウボウゼスト　カキザキリョウジ" },
]

export function BankTransferDetails() {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (value: string, label: string) => {
    // 全角スペースを除いた素の値をコピー（口座名義のスペースで桁ズレしないように）
    navigator.clipboard?.writeText(value.replace(/　/g, " ").trim())
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      {/* カードヘッダー */}
      <div className="flex items-center gap-3 bg-foreground px-6 py-4 lg:px-7">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gold text-[13px] font-bold text-white">
          ¥
        </span>
        <span className="font-serif text-[15px] tracking-wider text-white lg:text-base">
          お振込み先口座
        </span>
      </div>

      {/* 口座情報 */}
      <div className="divide-y divide-border">
        {BANK_INFO.map((item) => (
          <div
            key={item.label}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-4 transition-colors hover:bg-secondary/40 lg:px-7"
          >
            <span className="w-full text-[12px] font-medium tracking-wide text-muted-foreground sm:w-[88px] sm:flex-shrink-0">
              {item.label}
            </span>
            <span
              className={
                item.emphasize
                  ? "flex-1 font-serif text-[22px] font-bold tracking-[0.08em] text-foreground"
                  : "flex-1 text-[15px] tracking-wide text-foreground"
              }
            >
              {item.value}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(item.value, item.label)}
              className={
                "flex-shrink-0 rounded border px-3 py-1.5 text-[12px] tracking-wide transition-colors " +
                (copied === item.label
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border text-muted-foreground hover:border-gold hover:text-gold")
              }
            >
              {copied === item.label ? "✓ コピー済" : "コピー"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
