import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { NEWS, isExternalHref, newsCategory, shouldShowNewBadge, type NewsItem } from "@/lib/news"

export const metadata = {
  title: "お知らせ｜IRONWORKS ado",
  description:
    "IRONWORKS ado からのお知らせ・新商品情報・価格改定・営業のご案内などをまとめています。",
  alternates: { canonical: "/news" },
}

/** 見出し。href があれば該当ページ（外部 URL は別タブ）へのリンクにする */
function NewsTitle({ item }: { item: NewsItem }) {
  const text = <span className="text-[15px] text-foreground leading-relaxed">{item.title}</span>
  if (!item.href) return text
  // 見出しは左、矢印は行の右端に固定（inline-flex だと矢印が 1 行目の末尾に来て読みにくい）
  const cls =
    "group flex items-start gap-3 text-[15px] text-foreground leading-relaxed hover:text-gold transition-colors"
  if (isExternalHref(item.href)) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
        <span className="flex-1 underline underline-offset-4 decoration-transparent group-hover:decoration-current transition-colors">
          {item.title}
        </span>
        <ArrowUpRight className="w-4 h-4 mt-1 shrink-0" />
      </a>
    )
  }
  return (
    <Link href={item.href} className={cls}>
      <span className="flex-1 underline underline-offset-4 decoration-transparent group-hover:decoration-current transition-colors">
        {item.title}
      </span>
      <ArrowRight className="w-4 h-4 mt-1 shrink-0 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  )
}

export default function NewsPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <div className="border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">News</p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground">お知らせ</h1>
            <p className="text-[13px] text-muted-foreground mt-3">
              新商品情報、価格改定、営業日のご案内、施工事例などをお届けします。
            </p>
          </div>
        </div>

        <div className="max-w-[900px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
          {NEWS.length === 0 ? (
            <p className="text-[14px] text-muted-foreground text-center py-12">
              現在お知らせはありません。
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {NEWS.map((item, i) => (
                <li
                  key={`${item.date}-${i}`}
                  className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 py-5"
                >
                  <div className="flex items-center gap-2 flex-shrink-0 sm:w-52">
                    <span className="shrink-0 whitespace-nowrap px-2 py-0.5 bg-white border border-black/10 rounded text-[11px] tracking-wide text-muted-foreground">
                      {newsCategory(item)}
                    </span>
                    <span className="shrink-0 text-[13px] text-muted-foreground tabular-nums">
                      {item.date}
                    </span>
                    {shouldShowNewBadge(item) && (
                      <span className="shrink-0 px-2 py-0.5 bg-gold text-white text-[10px] rounded font-medium">
                        New
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <NewsTitle item={item} />
                    {item.body && (
                      <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">
                        {item.body}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-block px-8 py-4 border border-border text-muted-foreground text-[10px] tracking-[0.3em] uppercase hover:border-gold hover:text-gold transition-colors"
            >
              トップへ戻る
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
