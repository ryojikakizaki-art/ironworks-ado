import type { Metadata } from "next"
import { SeizuDrawing } from "./seizu-drawing"

// 受注ごとの制作図ページ。社内（工房）用なので必ず検索エンジンに非表示。
export const metadata: Metadata = {
  title: "制作図 — IRONWORKS ado",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
}

type SearchParams = Record<string, string | string[] | undefined>

export default async function SeizuPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const get = (key: string): string => {
    const v = sp[key]
    return (Array.isArray(v) ? v[0] : v) ?? ""
  }

  return (
    <SeizuDrawing
      product={get("product")}
      lengths={get("lengths") || get("length")}
      positions={get("positions")}
      washer={get("washer")}
      angle={get("angle")}
      dir={get("dir")}
      order={get("order")}
    />
  )
}
