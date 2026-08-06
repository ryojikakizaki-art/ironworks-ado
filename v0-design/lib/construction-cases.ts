export type ConstructionCase = {
  src: string
  alt: string
  w: number
  h: number
  caption: string
  prefecture?: string
  href?: string
}

// 施工事例 — 商品ページへのリンク(href)は商品が確認できたものだけ追記する（未確認のうちは書かない）
export const CONSTRUCTION_CASES: ConstructionCase[] = [
  {
    src: "/images/gallery/case-5.jpg",
    alt: "白壁の階段に取り付けた曲線のロートアイアン手すり",
    w: 900,
    h: 1600,
    caption: "白壁の階段に、渦巻き装飾の壁付け手すり",
  },
  {
    src: "/images/gallery/case-1.jpg",
    alt: "コンクリート壁の廻り階段に取り付けた白い壁付け手すり",
    w: 941,
    h: 1150,
    caption: "コンクリートの廻り階段に、白い壁付け手すり",
  },
  {
    src: "/images/voices/review-photo-hiroshima.jpg",
    alt: "広島県のお客様宅の玄関に取り付けた黒い縦手すり",
    w: 996,
    h: 660,
    caption: "玄関に取り付けた、黒い縦型の壁付け手すり",
    prefecture: "広島県",
  },
  {
    src: "/images/gallery/case-3.jpg",
    alt: "玄関の上がり框に取り付けた渦巻き装飾の手すり",
    w: 1600,
    h: 1600,
    caption: "玄関の上がり框に、唐草模様の据え置き手すり",
  },
  {
    src: "/images/voices/review-photo-ibaraki.jpg",
    alt: "茨城県のお客様宅に取り付けたL字型の据え置き手すり",
    w: 503,
    h: 611,
    caption: "介護保険を使った、L字型の据え置き手すり",
    prefecture: "茨城県",
  },
  {
    src: "/images/gallery/case-2.jpg",
    alt: "コンクリート外階段と黒いアプローチ手すりのある住宅外観",
    w: 900,
    h: 1600,
    caption: "コンクリート外階段に、黒いアプローチ手すり",
  },
  {
    src: "/images/gallery/case-4.jpg",
    alt: "バルコニーの黒いアイアン手すりとウッドデッキ",
    w: 740,
    h: 1600,
    caption: "バルコニーに、黒いアイアン手すり",
  },
]
