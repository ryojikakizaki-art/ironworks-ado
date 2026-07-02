import Image from "next/image"
import type { ReviewQuote } from "@/lib/testimonials"

/**
 * お客様の声の吹き出しカード（タスク5-4）。
 * 人物イラスト＋吹き出し＋要点マーカー強調。トップページと /reviews で共用。
 * seed（通常は voice.id）で吹き出しの形・アバターの左右を変え、
 * 整然と並びすぎない柔らかい印象にする。
 */

const BUBBLE_SHAPES = [
  "rounded-[1.75rem]",
  "rounded-[2.5rem_1.25rem_2.5rem_1.25rem]",
  "rounded-[1.25rem_2.5rem_1.25rem_2.5rem]",
]

function QuoteText({ quote, highlight }: { quote: string; highlight?: string[] }) {
  if (!highlight || highlight.length === 0) return <>{quote}</>
  type Part = { text: string; marked: boolean }
  let parts: Part[] = [{ text: quote, marked: false }]
  for (const h of highlight) {
    parts = parts.flatMap((p) => {
      if (p.marked || !p.text.includes(h)) return [p]
      const out: Part[] = []
      p.text.split(h).forEach((s, i) => {
        if (i > 0) out.push({ text: h, marked: true })
        if (s) out.push({ text: s, marked: false })
      })
      return out
    })
  }
  return (
    <>
      {parts.map((p, i) =>
        p.marked ? (
          <em
            key={i}
            className="not-italic font-medium text-foreground bg-[linear-gradient(transparent_62%,rgba(200,169,110,0.35)_62%)]"
          >
            {p.text}
          </em>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  )
}

export function VoiceBubble({ voice, seed }: { voice: ReviewQuote; seed?: number }) {
  const s = seed ?? voice.id
  const flip = s % 2 === 1
  const shape = BUBBLE_SHAPES[s % BUBBLE_SHAPES.length]
  const short = voice.quote.length <= 30

  return (
    <figure className="break-inside-avoid mb-6 md:mb-8">
      <div className={`relative bg-secondary ${shape} ${voice.photo ? "p-5 md:p-6" : "p-6 md:p-7"}`}>
        {voice.photo && (
          <div className="relative w-full aspect-[16/10] overflow-hidden rounded-[1.25rem] mb-5">
            <Image
              src={voice.photo}
              alt={`${voice.prefecture}のお客様の設置後写真`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        )}
        <blockquote
          className={`${short ? "text-[15px] md:text-[16px]" : "text-[14px] md:text-[15px]"} leading-[1.95] text-foreground/85`}
        >
          <QuoteText quote={voice.quote} highlight={voice.highlight} />
        </blockquote>
        {/* 吹き出しの尻尾（下のアバターを指す） */}
        <span
          aria-hidden
          className={`absolute -bottom-[7px] ${flip ? "right-10" : "left-10"} w-3.5 h-3.5 rotate-45 bg-secondary`}
        />
      </div>
      <figcaption
        className={`mt-3.5 flex items-center gap-3 ${flip ? "flex-row-reverse pr-7" : "pl-7"}`}
      >
        <span className="relative w-12 h-12 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-border">
          <Image
            src={voice.avatar}
            alt=""
            fill
            sizes="48px"
            className="object-cover scale-[1.2]"
          />
        </span>
        <span className="text-[12px] tracking-wide text-muted-foreground">
          {voice.prefecture}のお客様
        </span>
      </figcaption>
    </figure>
  )
}
