import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { COLUMN_ARTICLES } from "@/lib/column-data"

const SITE_URL = "https://ado.tantetuzest.com"

export const metadata: Metadata = {
  title: "読みもの｜アイアン手すりの選び方・施工事例コラム｜IRONWORKS ado",
  description:
    "玄関・階段の手すり選びをおしゃれに楽しむためのコラム。鍛冶職人の自社工房から、素材・仕上げ・価格・介護保険の使い方まで、手すり選びに役立つ情報をお届けします。",
  alternates: { canonical: "/column" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/column`,
    siteName: "IRONWORKS ado",
    title: "読みもの｜アイアン手すりの選び方コラム｜IRONWORKS ado",
    description: "玄関・階段の手すり選びに役立つコラム。鍛冶職人の工房からお届けします。",
    locale: "ja_JP",
  },
}

export default function ColumnIndexPage() {
  return (
    <>
      <Header />
      <main className="pt-20 lg:pt-24 pb-20 bg-background">
        <div className="border-b border-border">
          <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Column</p>
            <h1 className="font-serif text-3xl lg:text-5xl text-foreground">読みもの</h1>
            <p className="text-[13px] md:text-sm text-muted-foreground mt-4 max-w-[640px] leading-relaxed">
              手すり選びに役立つ知識を、鍛冶職人の自社工房からお届けします。
            </p>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-4 lg:px-8 mt-12">
          <div className="grid sm:grid-cols-2 gap-6">
            {COLUMN_ARTICLES.map((a) => (
              <Link
                key={a.slug}
                href={`/column/${a.slug}`}
                className="group rounded-lg border border-border bg-white overflow-hidden hover:border-gold transition-colors"
              >
                <div className="relative aspect-[16/9] bg-secondary overflow-hidden">
                  <Image
                    src={a.hero.src}
                    alt={a.hero.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 520px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 md:p-6">
                  <p className="text-[11px] tracking-[0.15em] text-muted-foreground">
                    {a.date.replaceAll("-", ".")}
                  </p>
                  <h2 className="mt-1.5 font-serif text-[17px] md:text-[19px] text-foreground leading-snug group-hover:text-gold transition-colors">
                    {a.title}
                  </h2>
                  <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                    {a.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
