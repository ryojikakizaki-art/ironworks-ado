"use client"

// 参考価格シミュレーターの全画面ページ。商品ページ埋め込み版と同じ
// RailPriceSimulator をスマホでも操作しやすい広い画面幅で表示する
// （2026-07-22 蠣﨑さん指示: スマホでは入力マスが小さく操作しづらいとの指摘）

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Header } from "@/components/header"
import { getSimpleProduct } from "@/lib/products/simple"
import { RailPriceSimulator } from "@/components/rail-price-simulator"
import { PrimaryCTA } from "@/components/ui/primary-cta"

export default function SimulatorFullPage() {
  const routeParams = useParams<{ slug: string }>()
  const slug = routeParams?.slug ?? ""
  const product = getSimpleProduct(slug)
  const [simulatorQuery, setSimulatorQuery] = useState("")

  if (!product || !product.simulator) {
    return (
      <>
        <Header forceDark />
        <main className="pt-24 pb-20 px-4 text-center">
          <p className="text-[14px] text-muted-foreground mb-4">
            このシミュレーターは見つかりませんでした。
          </p>
          <Link href="/products" className="text-gold underline text-[14px]">
            商品一覧へ戻る
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Header forceDark />
      <main className="pt-20 lg:pt-24 pb-16 bg-background min-h-screen">
        <div className="max-w-[720px] mx-auto px-4 py-4">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            {product.nameEn} {product.nameJa} の商品ページへ戻る
          </Link>
          <h1 className="font-serif text-[22px] md:text-[26px] text-foreground mb-4">
            {product.nameEn} {product.nameJa}｜参考価格シミュレーター
          </h1>

          <RailPriceSimulator
            config={product.simulator}
            queryType={product.slug}
            onQueryChange={setSimulatorQuery}
            hideFullscreenLink
          />

          <div className="flex justify-center">
            <PrimaryCTA
              href={`/contact?product=${encodeURIComponent(product.slug)}&category=order${simulatorQuery}`}
              variant="dark"
              size="lg"
              withArrow
              className="w-full max-w-[340px]"
            >
              この内容で見積もり依頼
            </PrimaryCTA>
          </div>
        </div>
      </main>
    </>
  )
}
