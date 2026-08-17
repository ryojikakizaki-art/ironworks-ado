import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CONSTRUCTION_CASES } from "@/lib/construction-cases"
import { CaseLightboxGallery } from "@/components/case-lightbox-gallery"

/**
 * 施工事例ギャラリー（タスク5-5）。
 * 空間全体が写った施工写真のマソンリーグリッド。データは /construction ページと共有（lib/construction-cases.ts）。
 * もっと見るは施工案内ページ（/construction）の事例セクションへ。
 */
export function CaseGallery() {
  return (
    <section id="works" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] tracking-[0.25em] text-gold uppercase mb-3">
            Works
          </span>
          <h2 className="font-serif text-[28px] md:text-[32px] text-foreground">施工事例</h2>
          <p className="text-[13px] text-muted-foreground mt-3">
            実際の住まいに取り付けた様子をご紹介します。
          </p>
        </div>

        <CaseLightboxGallery cases={CONSTRUCTION_CASES} />

        {/* もっと見る */}
        <div className="text-center mt-10">
          <Link
            href="/construction"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-gold transition-colors group"
          >
            <span>施工の流れ・事例をもっと見る</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
