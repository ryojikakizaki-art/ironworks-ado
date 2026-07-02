import Image from "next/image"
import { Instagram, ArrowUpRight } from "lucide-react"

/**
 * Instagram（@zest_eye）への静的リンクカード。
 * 奥様が発信する工房・取り付け現場・暮らしのアカウント。
 * 自動フィードはトークン運用が必要なため使わず、静的カード＋手動更新の写真数枚で構成
 * （2026-07-02 蠣﨑さん決定）。
 *
 * 写真の追加方法:
 * 1. 投稿写真を受け取り、掲載標準どおり圧縮する
 *    （magick 元.jpg -auto-orient -resize "800x800>" -quality 80 -strip 出力.jpg）
 * 2. public/images/instagram/ に置き、下の PHOTOS に {src, alt} を追加（3〜4枚推奨）
 */

const INSTAGRAM_URL = "https://www.instagram.com/zest_eye/"

const PHOTOS: { src: string; alt: string }[] = [
  // 例: { src: "/images/instagram/ig-1.jpg", alt: "取り付け現場の様子" },
]

export function InstagramCard() {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-2xl ring-1 ring-border p-7 md:p-9 hover:ring-gold/40 transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        {/* アイコン＋テキスト */}
        <div className="flex items-start gap-5 flex-1 min-w-0">
          <span className="shrink-0 w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
            <Instagram className="w-6 h-6 text-gold" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-1.5">Instagram</p>
            <h3 className="font-serif text-[18px] md:text-[20px] text-foreground leading-snug">
              工房と現場の日々 <span className="text-[14px] text-muted-foreground">@zest_eye</span>
            </h3>
            <p className="mt-2 text-[13px] md:text-[14px] leading-[1.9] text-muted-foreground">
              鍛冶の仕事場や取り付け現場の風景、ときどき暮らしのこと。妻の目線で綴っています。
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-gold">
              Instagramで見る
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>

        {/* 投稿写真（PHOTOS が空の間は非表示） */}
        {PHOTOS.length > 0 && (
          <div className="flex gap-2.5 md:gap-3 shrink-0">
            {PHOTOS.slice(0, 4).map((p) => (
              <span
                key={p.src}
                className="relative w-[72px] h-[72px] md:w-[96px] md:h-[96px] overflow-hidden rounded-xl bg-secondary"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="96px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
