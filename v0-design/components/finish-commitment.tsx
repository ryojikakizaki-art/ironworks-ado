import Link from "next/link"
import { Paintbrush, Flame } from "lucide-react"

/**
 * 商品ページの説明文の下に置く「仕上げのこだわり」コンパクト訴求ブロック。
 * ado の差別化ポイントを初見の人にも目に付く位置で簡潔に伝える。
 * 商品の「仕上げ」spec から自動でバリアントを切り替える:
 *  - ウレタン塗装の商品 → 「2 液型ウレタン塗装」訴求＋/paint へ誘導
 *  - 蜜蝋／ミツロウ仕上げの商品 → 「あえて塗装しない蜜蝋仕上げ」訴求（別の こだわり）
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
  // 蜜蝋・ミツロウ・黒皮仕上げの商品は「塗装ではない」ので別訴求にする
  if (/蜜蝋|ミツロウ|黒皮/.test(finish)) {
    return {
      Icon: Flame,
      title: "あえて塗装しない、蜜蝋仕上げ",
      body: "塗料で覆わず、熱した鉄に蜜蝋を溶かし込む。鍛冶仕事が生んだ鉄そのものの表情を、そのまま生かす仕上げです。",
    }
  }
  return {
    Icon: Paintbrush,
    title: "自動車塗装と同じ、2 液型ウレタン塗装",
    body: "毎日手にする手すりだから、塗膜の強さと美しさにこだわって。屋内なら 10 年以上、美観が続きます。",
    href: "/paint",
    linkLabel: "塗装のこだわりを見る →",
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
