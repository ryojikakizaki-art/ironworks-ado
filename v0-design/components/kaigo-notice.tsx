import Link from "next/link"
import { HeartHandshake } from "lucide-react"

/**
 * 介護保険のご案内ブロック（手すり商品ページ共通）。
 * 縦型¥30,000台の手すりが自己負担1割になり得る情報が購買地点に無かったため、
 * 価格ブロック付近に常設する（2026-06-12 監査 A群④）。
 */
export function KaigoNotice({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-gold/30 bg-muted/60 p-4 md:p-5 ${className}`}>
      <p className="mb-1.5 flex items-center gap-2 text-sm md:text-[15px] font-medium text-dark">
        <HeartHandshake className="w-4 h-4 text-gold shrink-0" />
        介護保険で自己負担1割になる場合があります
      </p>
      <p className="text-[13px] md:text-sm text-muted-foreground leading-relaxed mb-2">
        要介護・要支援認定を受けている方の手すり取付は、介護保険「住宅改修費」の支給対象になる場合があります。
        当工房は千葉市の受領委任払 取扱事業者です（立替え不要）。
      </p>
      <Link
        href="/kaigo"
        className="text-[13px] md:text-sm text-gold font-medium hover:underline"
      >
        介護保険のご利用について詳しく →
      </Link>
    </div>
  )
}
