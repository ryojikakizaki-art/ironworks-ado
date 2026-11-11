import Image from "next/image"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { REVIEW_QUOTES, TOTAL_VOICE_COUNT, type ReviewQuote } from "@/lib/testimonials"

/**
 * ProductTrustStrip — 商品ページの「価格の目安」直下に置く、短い安心材料（2026-11-11）。
 *
 * なぜ必要か:
 *   広告から商品ページに着いた人の成果率は 0.4〜0.9% で、トップに着いた人（1.72%）の半分以下
 *   （GA4 90日）。お客様の声は計算機のずっと下にリンクが 1 本あるだけで、不良時の対応は
 *   商品ページに一言も無かった。価格を見た直後に「買った人の声」と「届いた品に問題があったら」を置く。
 *
 * 文言のルール:
 *   - お客様の声は lib/testimonials.ts の highlight（原文の一部）をそのまま使い、改変しない
 *   - 不良時の対応は特商法表記・利用規約の記載（到着後 7 日以内・当店負担で交換または修理）と同じ内容。
 *     ここで新しい約束を足さないこと
 */
const PICK_IDS = [3, 8]

export function ProductTrustStrip() {
  const voices = PICK_IDS.map((id) => REVIEW_QUOTES.find((q) => q.id === id)).filter(
    (q): q is ReviewQuote & { highlight: string[] } => !!q && !!q.highlight && q.highlight.length > 0,
  )

  return (
    <div className="rounded-lg bg-[#f3f4f6] p-4 sm:p-5">
      {voices.length > 0 && (
        <ul className="space-y-3">
          {voices.map((v) => (
            <li key={v.id} className="flex items-center gap-3">
              <Image
                src={v.avatar}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-[#e5e7eb]"
              />
              <p className="min-w-0 leading-snug">
                <span className="font-serif text-[15px] md:text-[17px] font-bold text-foreground">
                  「{v.highlight[0]}」
                </span>
                <span className="mt-0.5 block text-[13px] text-muted-foreground">{v.prefecture}のお客様</span>
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className={`flex items-start gap-2 ${voices.length > 0 ? "mt-4 border-t border-[#e5e7eb] pt-3" : ""}`}>
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
        <p className="text-[13px] md:text-[14px] leading-relaxed text-foreground/80">
          届いた品に不良・破損があれば、到着後 7 日以内にご連絡ください。
          <span className="font-medium text-foreground">当工房の負担で交換・修理</span>します。
        </p>
      </div>

      {TOTAL_VOICE_COUNT > 0 && (
        <Link
          href="/reviews"
          className="mt-3 inline-flex items-center gap-1 text-[13px] md:text-[14px] font-medium text-gold hover:underline"
        >
          お客様の声 {TOTAL_VOICE_COUNT} 件をすべて見る
          <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  )
}
