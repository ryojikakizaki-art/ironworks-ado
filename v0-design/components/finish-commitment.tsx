import Link from "next/link"
import { Paintbrush, Flame } from "lucide-react"

/**
 * 商品ページの説明文の下に置く「仕上げのこだわり」コンパクト訴求ブロック。
 * ado の差別化ポイントを初見の人にも目に付く位置で簡潔に伝える。
 * 商品の「仕上げ」spec から自動でバリアントを切り替える:
 *  - 溶融亜鉛メッキ仕上げ（屋外設置想定）→ 「メッキ＋塗装の二段構え」訴求＋/paint へ誘導
 *  - 蜜蝋／ミツロウ仕上げの商品 → 「あえて塗装しない蜜蝋仕上げ」訴求（別の こだわり）
 *  - それ以外（室内・共通）→ 「塗装の技術＋防錆の知識」訴求＋/paint へ誘導
 * 手すり／簡易商品の両テンプレートで共有し、全商品で一貫させる。
 */

type FinishSpec = { label: string; value: string }

type Variant = {
  Icon: typeof Paintbrush
  title: string
  body: string
  href?: string
  linkLabel?: string
}

function resolveVariant(specs: FinishSpec[]): Variant {
  const finish = specs.find((s) => s.label === "仕上げ")?.value ?? ""
  // 蜜蝋・ミツロウ・黒皮仕上げの商品は「塗装ではない」ので別訴求にする。
  // これらの商品では塗装には一切触れず、蜜蝋仕上げそのものの魅力で訴求する。
  if (/蜜蝋|ミツロウ|黒皮/.test(finish)) {
    return {
      Icon: Flame,
      title: "熱した鉄に焼き付ける、蜜蝋仕上げ",
      body: "熱した鉄の表面に蜜蝋を焼き付けるようにコーティング。しっとりと落ち着いた質感で、鍛冶仕事が生んだ鉄そのものの表情を生かしています。",
    }
  }
  // 溶融亜鉛メッキを施す商品（屋外設置を想定するアプローチ手すり・外構など）。
  // メッキ＋塗装の二段構えで屋外の錆から守ることを訴求する。
  if (/亜鉛メッキ|溶融亜鉛|メッキ/.test(finish)) {
    return {
      Icon: Paintbrush,
      title: "屋外を錆から守る、二段構えの仕上げ",
      body: "屋外でも安心してお使いいただけるよう、溶融亜鉛メッキで鉄を錆から守り、塗装で美しく仕上げています。表面処理を専門に学んだ職人が、一点ずつ丁寧に仕上げました。",
      href: "/paint",
      linkLabel: "塗装・表面処理のこだわりを見る →",
    }
  }
  // それ以外（室内・共通）— 塗装の技術と防錆の知識で仕上げる二本柱を訴求。
  return {
    Icon: Paintbrush,
    title: "塗装の技術と、防錆の知識で",
    body: "塗装の技術と、メッキ工程を 10 年監督した防錆の知識で仕上げています。近代工業の確かな技術と、工芸の美意識を、一本の手すりに。毎日手に触れるものだからこそ、見えない部分にこそ手を抜きません。",
    href: "/paint",
    linkLabel: "塗装・表面処理のこだわりを見る →",
  }
}

export function FinishCommitment({ specs }: { specs: FinishSpec[] }) {
  const v = resolveVariant(specs)
  const baseClass =
    "group flex items-start gap-4 rounded-lg border border-gold/20 bg-gold/[0.03] p-4 md:p-5"

  const inner = (
    <>
      <span className="shrink-0 mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold">
        <v.Icon className="h-5 w-5" strokeWidth={1.6} />
      </span>
      <span className="flex-1">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.25em] text-gold">
          Finishing
        </span>
        <span className="mb-1 block font-serif text-[15px] leading-snug text-dark md:text-[16px]">
          {v.title}
        </span>
        <span className="block text-[12px] leading-relaxed text-muted-foreground md:text-[13px]">
          {v.body}
        </span>
        {v.linkLabel && (
          <span className="mt-2 inline-flex items-center gap-1 text-[12px] tracking-wider text-gold transition-all group-hover:gap-2">
            {v.linkLabel}
          </span>
        )}
      </span>
    </>
  )

  if (v.href) {
    return (
      <Link href={v.href} className={`${baseClass} transition-colors hover:border-gold/50`}>
        {inner}
      </Link>
    )
  }
  return <div className={baseClass}>{inner}</div>
}
