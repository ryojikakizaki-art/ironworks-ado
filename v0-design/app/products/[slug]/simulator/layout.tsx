import type { Metadata } from "next"
import { getSimpleProduct } from "@/lib/products/simple"

// 参考価格シミュレーターの全画面ページ。商品ページ（/products/{slug}）の
// 内容と重複するため検索エンジンには登録せず、正規URLも商品ページ側にする
// （2026-07-22 蠣﨑さん指示: スマホで操作しやすい全画面ページを追加）
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = getSimpleProduct(slug)
  const title = product
    ? `参考価格シミュレーター｜${product.nameEn} ${product.nameJa}｜IRONWORKS ado`
    : "参考価格シミュレーター｜IRONWORKS ado"
  return {
    title,
    alternates: { canonical: `/products/${slug}` },
    robots: { index: false, follow: true },
  }
}

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
