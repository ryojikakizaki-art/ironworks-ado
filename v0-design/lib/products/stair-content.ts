// 階段手摺（段数ベース商品）のページ表示コンテンツ。
//
// 価格・寸法の正本は lib/products/stair-pricing.ts。こちらは「見せ方」だけを持つ。
// components/stair-product-page.tsx が slug で引いて 1 つのテンプレートを使い回す。
//
// 金額はここに書かないこと（二重管理になる）。価格の内訳表示は
// StairProductConfig.pricing から組み立てる。

import { galleryUrl } from "@/lib/products/display"
import type { CrossbarMaterial, StairColor, StairProductConfig, StairProductSlug } from "@/lib/products/stair-pricing"

export interface StairGalleryItem {
  src: string
  /** 画像に実際に写っている横桟の本数・素材・色（商品名横の参考価格用） */
  crossbarCount: number
  crossbarMaterial: CrossbarMaterial
  color: StairColor
  label: string
}

export interface StairContent {
  /** パンくず・見出しに出す表示名 */
  nameEn: string
  nameJa: string
  /** ヒーロー下の 1 行キャッチ */
  subtitle: string
  /** 商品名の上に出す区分ラベル（例: 階段手摺・フラットバー 9×38） */
  categoryLabel: string
  /** 商品名の下の 1 行（素材・仕上げ） */
  tagline: string
  /** その下の短い紹介文 */
  lead: string
  /** 色の選択が無い商品の仕上げ名（注文内容・参考価格の表示用） */
  finishLabel: string
  gallery: StairGalleryItem[]
  /** 商品名横の参考価格を計算する段数（サムネイルの階段に合わせる） */
  galleryReferenceSteps: number
  specs: { label: string; value: string }[]
  longDescription: string
  /** 価格の目安カードに並べる段数 */
  priceGuideSteps: number[]
  /** 価格の目安カードの計算式の後ろに足す補足（無ければ出さない） */
  priceModelNote?: string
  /** 写真の下に出す注記（写真が実物とどう違うか） */
  photoNote: string
}

function crossbarSpecLabel(crossbarCount: number, crossbarMaterial: CrossbarMaterial): string {
  if (crossbarCount === 0) return "横桟なし"
  return `${crossbarMaterial === "round" ? "丸棒" : "フラット"}横桟${crossbarCount}本`
}

const LAURENT_GALLERY: Omit<StairGalleryItem, "label">[] = [
  { src: "/images/products/laurent/hero.jpg", crossbarCount: 0, crossbarMaterial: "round", color: "black" },
  { src: "/images/products/laurent/hero-crossbar.jpg", crossbarCount: 2, crossbarMaterial: "flat", color: "black" },
  { src: "/images/products/laurent/hero-crossbar-round.jpg", crossbarCount: 2, crossbarMaterial: "round", color: "black" },
  { src: "/images/products/laurent/hero-crossbar-white.jpg", crossbarCount: 2, crossbarMaterial: "flat", color: "white" },
  { src: "/images/products/laurent/hero-crossbar-2-white.jpg", crossbarCount: 2, crossbarMaterial: "round", color: "white" },
]

// 蔦の実物写真（屋外アプローチ仕様）。室内設置イメージが用意でき次第、先頭に差し替える。
const TSUTA_GALLERY_IDS = [
  "8c7c57432198f43a5581",
  "ca753a1c8defc7d08da0",
  "87bda98b13566f567039",
  "e567a5fc77ff175fcd67",
  "cfb9087dfa8b95bb6f87",
]
// 上のうち、職人が鍛造している写真（手すりの実物ではない）
const TSUTA_FORGING_PHOTO_ID = "cfb9087dfa8b95bb6f87"

const CONTENT: Record<StairProductSlug, StairContent> = {
  laurent: {
    nameEn: "Laurent",
    nameJa: "ローラン",
    subtitle: "フラットバー 9×38 直線階段専用 アイアン階段手摺",
    categoryLabel: "階段手摺・フラットバー 9×38",
    tagline: "鍛冶職人制作 階段手摺 フラットバー 9×38 マットブラック",
    lead: "箱階段・オープン側の階段に。無垢鉄の直線が空間を引き締める、床固定式の階段手摺です。",
    finishLabel: "マットブラック",
    gallery: LAURENT_GALLERY.map((g) => ({
      ...g,
      label: `Laurent 階段手すり ${crossbarSpecLabel(g.crossbarCount, g.crossbarMaterial)} マット${
        g.color === "white" ? "ホワイト" : "ブラック"
      }`,
    })),
    galleryReferenceSteps: 8,
    specs: [
      { label: "タイプ", value: "階段手摺（直線階段専用）" },
      { label: "素材", value: "鉄 フラットバー 9×38" },
      { label: "仕上げ", value: "錆止め吹付塗装 + 2液型ウレタン塗装" },
      { label: "カラー", value: "マットブラック（標準）／マットホワイト（+15%）" },
      { label: "取付方式", value: "1本目の柱＝1段目の踏み板中央に固定・端部＝壁付け（5段ごとに柱を追加）" },
      { label: "固定金具", value: "柱脚座金 60×60mm t6（段付き穴×4）／壁付け座金 80×25mm t6（段付き穴×2）" },
      { label: "付属品", value: "取付用タッピングビス M5×40mm（柱脚 4本／箇所・壁付け 2本）" },
      { label: "手すり高さ", value: "標準800mm（段鼻から笠木上端まで・600〜1,100mmで変更可）" },
      { label: "横桟オプション", value: "0〜3本（6×25 フラットバー／13φ 丸鋼）" },
      { label: "対応段数", value: "3〜20段（全長3.5mまで。超える場合は要問合せ）" },
    ],
    longDescription: `厚み9mm×幅38mmのフラットバー（平鋼）を主材にした、直線階段用のアイアン手摺です。無垢の鉄ならではの重厚な直線が階段まわりを美しく引き締め、握った瞬間にわかる剛性が毎日の上り下りを支えます。

柱は床固定、端部は壁付けで確実に固定する構造です。段数と階段の寸法を入力するだけで、その場で価格と手摺全長の目安がわかります。

足元には横桟（6×25 フラットバー または 13φ 丸鋼）を最大3本まで追加できます。小さなお子様やペットのいるご家庭の落下対策にもどうぞ。

色は標準のマットブラックのほか、マットホワイト（合計金額+15%）にも対応。仕上がりの美しさにこだわり、目立たない細部まで手を抜かず、長く愛用していただけるよう丁寧に制作しています。

※本商品は直線階段専用です。コーナー（曲がり）のある階段は別途お見積もりで対応しますので、お問い合わせください。`,
    priceGuideSteps: [3, 6, 10],
    photoNote: "※画像は完成イメージです。実物の施工写真は準備中です。横桟の有無で見え方が変わります。",
  },

  "tsuta-stair": {
    nameEn: "Tsuta",
    nameJa: "蔦",
    subtitle: "無垢鉄 手打ち鎚目 室内階段用アートアイアン手摺",
    categoryLabel: "室内階段手摺・無垢鉄 手打ち鎚目",
    tagline: "鍛冶職人制作 室内階段手摺 無垢鉄 丸鋼 艶消し黒塗装＋古美仕上げ",
    lead: "玄関の上がり口や室内の短い階段に。手打ちの鎚目と蔦の曲線が、毎日の上り下りに表情を添えます。",
    finishLabel: "艶消し黒塗装＋古美",
    gallery: TSUTA_GALLERY_IDS.map((id, i) => ({
      src: galleryUrl(`${id}.jpg`),
      crossbarCount: 0,
      crossbarMaterial: "round" as CrossbarMaterial,
      color: "black" as StairColor,
      label: i === 0 ? "蔦 実物写真（屋外アプローチ仕様）" : id === TSUTA_FORGING_PHOTO_ID ? "蔦 制作の様子" : `蔦 実物写真 ${i + 1}`,
    })),
    galleryReferenceSteps: 4,
    specs: [
      { label: "タイプ", value: "室内階段手摺（直線階段・段差）" },
      { label: "素材", value: "鉄（無垢材 / 丸鋼）" },
      { label: "仕上げ", value: "錆止め吹付塗装＋艶消し黒塗装＋古美仕上げ（室内用・メッキなし）" },
      { label: "意匠", value: "蔦モチーフ（全面手打ち鎚目・一点ずつ造形）" },
      { label: "取付方式", value: "握り手の下端＝床・途中の柱（3段目・5段目）＝踏み板にベースプレートで固定／上端＝壁付け" },
      { label: "付属品", value: "取付用ビス・タッチアップ剤" },
      { label: "手すり高さ", value: "標準800mm（段鼻から握り手上端まで・600〜1,100mmで変更可）" },
      { label: "対応段数", value: "2〜7段（8段以上・曲がり階段は要問合せ）" },
    ],
    longDescription: `鉄がぎっしりと詰まった無垢鉄の丸鋼全体を、打ち残しなくハンマーで叩いて造形した、蔦をイメージするアートアイアンの手摺です。屋外アプローチ用として作ってきたものを、室内の階段・段差向けに仕立てました。

室内は雨風にさらされないため溶融亜鉛メッキを省き、錆止めの上に艶消し黒の塗装と古美仕上げを施しています。手打ちの鎚目の凹凸が、古美の陰影でいっそう引き立ちます。

段数と階段の寸法を入力すると、その場で価格と手摺全長の目安がわかります。握り手の下端は床に、途中の柱は踏み板に固定し、上端は壁付けで確実に留めます。

蔦の絡み方・鎚目の出方は一点ずつ手仕事で造形するため、同じものは二つとありません。階段の勾配や壁の位置に合わせて流れを調整しますので、ご希望があればお問い合わせからご相談ください。

※直線階段・段差向けです。曲がり階段、8段を超える階段は別途お見積もりで対応します。`,
    priceGuideSteps: [2, 4, 7],
    priceModelNote: "基本料は型取り・端部の造形など、段数によらない手間の分です。",
    photoNote:
      "※写真は屋外アプローチ仕様（溶融亜鉛メッキあり）の実物です。室内仕様はメッキを省いた塗装仕上げ（錆止め＋艶消し黒塗装＋古美）になります。",
  },
}

export function getStairContent(product: StairProductConfig): StairContent {
  return CONTENT[product.slug]
}
