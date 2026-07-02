import Link from "next/link"
import { type CategoryKey } from "@/lib/products/catalog"

/**
 * ヒーロー下部に常時表示されるカテゴリードック。
 *
 * 2026-07-02 タスク5-1: 商品マーキー（30商品ループ）は蠣﨑さんの判断でページ下部の
 * ProductMarquee へ移動。ドックはカテゴリタブのみとなり、各タブは製品一覧の
 * 該当カテゴリ（/products?cat=）へのリンクに変更。
 */

type DockCategory = {
  key: CategoryKey
  label: string
}

const DOCK_CATEGORIES: DockCategory[] = [
  { key: "handrail_h", label: "手すり 横型" },
  { key: "handrail_v", label: "手すり 縦型" },
  { key: "approach", label: "アプローチ" },
  { key: "fence", label: "フェンス" },
  { key: "door", label: "ドア" },
  { key: "stair", label: "階段" },
  { key: "other", label: "その他" },
]

export function CategoryDock() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20">
      <nav className="bg-black/85 backdrop-blur-sm border-t border-white/15">
        <div className="max-w-[1400px] mx-auto px-2 lg:px-6">
          <ul className="flex items-stretch overflow-x-auto scrollbar-hide">
            {DOCK_CATEGORIES.map((cat) => (
              <li key={cat.key} className="flex-1 min-w-[120px] md:min-w-[150px]">
                <Link
                  href={`/products?cat=${cat.key}`}
                  className="group block w-full px-3 py-3 md:py-4 text-center text-[13px] md:text-[15px] tracking-[0.15em] text-white/85 hover:text-gold transition-all duration-300"
                >
                  <span className="block font-serif">{cat.label}</span>
                  <span className="block h-px w-0 mx-auto mt-2 bg-gold transition-all duration-300 group-hover:w-8" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  )
}
