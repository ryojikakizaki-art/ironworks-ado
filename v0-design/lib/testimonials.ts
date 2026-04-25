// お客様の声データ
// 実際のお客様から頂いたお言葉をスライド画像として掲載

export interface VoiceSlide {
  id: number
  src: string
  alt: string
  regions: string[] // そのスライドに掲載されているお客様の地域
}

export const VOICE_SLIDES: VoiceSlide[] = [
  {
    id: 1,
    src: "/images/voices/voices-1.jpg",
    alt: "お客様の声 — 兵庫県、広島県のお客様より",
    regions: ["兵庫県", "広島県"],
  },
  {
    id: 2,
    src: "/images/voices/voices-2.jpg",
    alt: "お客様の声 — 東京都、神奈川県のお客様より",
    regions: ["東京都", "神奈川県"],
  },
  {
    id: 3,
    src: "/images/voices/voices-3.jpg",
    alt: "お客様の声 — 神奈川県、東京都、兵庫県のお客様より",
    regions: ["神奈川県", "東京都", "兵庫県"],
  },
  {
    id: 4,
    src: "/images/voices/voices-4.jpg",
    alt: "お客様の声 — 茨城県、栃木県のお客様より",
    regions: ["茨城県", "栃木県"],
  },
  {
    id: 5,
    src: "/images/voices/voices-5.jpg",
    alt: "お客様の声 — 福岡県、大阪府、静岡県のお客様より",
    regions: ["福岡県", "大阪府", "静岡県"],
  },
  {
    id: 6,
    src: "/images/voices/voices-6.jpg",
    alt: "お客様の声 — 京都府のお客様より",
    regions: ["京都府"],
  },
  {
    id: 7,
    src: "/images/voices/voices-7.jpg",
    alt: "お客様の声 — 東京都、兵庫県、長崎県のお客様より",
    regions: ["東京都", "兵庫県", "長崎県"],
  },
]

// スライド内のお客様の声の合計件数 (region の総数)
export const TOTAL_VOICE_COUNT = VOICE_SLIDES.reduce((sum, s) => sum + s.regions.length, 0)
