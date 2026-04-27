import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { NEWS, shouldShowNewBadge } from "@/lib/news"

export const metadata = {
  title: "お知らせ | IRONWORKS ado",
  description:
    "IRONWORKS ado からのお知らせ・新商品情報・価格改定・営業のご案内などをまとめています。",
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
                  <div className="flex items-center gap-2 flex-shrink-0 sm:w-32">
                    <span className="text-[13px] text-muted-foreground tabular-nums">
                      {item.date}
                    </span>
                    {shouldShowNewBadge(item) && (
                      <span className="px-2 py-0.5 bg-gold text-white text-[10px] rounded font-medium">
                        New
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] text-foreground leading-relaxed">
                      {item.title}
                    </p>
                    {item.body && (
                      <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">
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
