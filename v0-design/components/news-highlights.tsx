import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import {
  NEWS,
  isExternalHref,
  newsCategory,
  newsHeadline,
  shouldShowNewBadge,
  type NewsCategory,
  type NewsItem,
} from "@/lib/news"

/**
 * ヒーロー直下の「最新のお知らせ」帯（2026-09-10 蠣﨑さん指示）。
 *
 * 新商品・SNS 投稿・お知らせなど種類を問わず、最新の見出しだけを 3 件並べて
 * それぞれ該当ページ（外部 URL なら別タブ）へ飛ばす。
 * 記事の追加は lib/news.ts の NEWS を 1 件足すだけで済むようにしてある。
 *
 * ページ下部の <NewsSection /> は従来どおり残す（こちらは最新の入口、
 * 下部は読み物としての一覧という役割分担）。
 */

const STRIP_COUNT = 3

// 分類タグの色。ado の配色（白＋薄グレー＋ゴールド）から外れないよう、
// 差をつけるのは文字色だけにしている。
const TAG_TONE: Record<NewsCategory, string> = {
  お知らせ: "text-muted-foreground",
  新商品: "text-gold",
  施工事例: "text-muted-foreground",
  SNS: "text-gold",
  メディア: "text-muted-foreground",
}

function Row({ item }: { item: NewsItem }) {
  const category = newsCategory(item)
  const external = isExternalHref(item.href)
  // 外部 URL（SNS 投稿など）は「別タブで開く」記号にする
  const Icon = external ? ArrowUpRight : ArrowRight

  const inner = (
    <>
      <div className="flex items-center gap-2.5 shrink-0 sm:w-[204px]">
        <span
          className={`shrink-0 whitespace-nowrap px-2 py-0.5 bg-white border border-black/10 rounded text-[11px] tracking-wide ${TAG_TONE[category]}`}
        >
          {category}
        </span>
        <span className="shrink-0 text-[13px] text-muted-foreground tabular-nums">{item.date}</span>
        {shouldShowNewBadge(item) && (
          <span className="shrink-0 px-1.5 py-0.5 bg-gold text-white text-[10px] rounded font-medium">
            New
          </span>
        )}
        {/* モバイルは見出しが下段に回るので、矢印は日付行の右端に寄せる */}
        {item.href && (
          <Icon className="sm:hidden ml-auto w-4 h-4 shrink-0 text-muted-foreground" />
        )}
      </div>

      <span className="flex-1 text-[15px] md:text-[16px] leading-relaxed text-dark line-clamp-2 group-hover:text-gold transition-colors">
        {newsHeadline(item)}
      </span>

      {item.href && (
        <Icon
          className={`hidden sm:block w-4 h-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-gold transition-all ${
            external ? "" : "group-hover:translate-x-0.5"
          }`}
        />
      )}
    </>
  )

  const rowClass =
    "group flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-5 py-3 sm:py-3.5"

  if (!item.href) {
    return <div className={rowClass}>{inner}</div>
  }
  if (external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={rowClass}>
        {inner}
      </a>
    )
  }
  return (
    <Link href={item.href} className={rowClass}>
      {inner}
    </Link>
  )
}

export function NewsHighlights() {
  const items = NEWS.slice(0, STRIP_COUNT)
  if (items.length === 0) return null

  return (
    <section aria-labelledby="news-highlights-title" className="bg-secondary border-b border-black/10">
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
          {/* 見出し（PC は左に固定、モバイルは上） */}
          <div className="shrink-0 lg:w-[180px] mb-4 lg:mb-0">
            <p className="text-[11px] tracking-[0.25em] text-gold uppercase mb-1.5">News</p>
            <h2 id="news-highlights-title" className="font-serif text-[20px] md:text-[22px] text-dark">
              最新のお知らせ
            </h2>
            <Link
              href="/news"
              className="hidden lg:inline-flex items-center gap-1.5 mt-3 text-[13px] text-muted-foreground hover:text-gold transition-colors group"
            >
              <span>すべて見る</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 見出しリスト */}
          <div className="flex-1 min-w-0 divide-y divide-black/10 border-t border-black/10 lg:border-t-0">
            {items.map((item, i) => (
              <Row key={`${item.date}-${i}`} item={item} />
            ))}
          </div>
        </div>

        {/* モバイルのみ下に「すべて見る」 */}
        <div className="lg:hidden mt-4 pt-4 border-t border-black/10">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-gold transition-colors"
          >
            <span>すべてのお知らせを見る</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
