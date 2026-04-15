// 商品詳細ページ表示用マスター
// 既存 item/*.html から harvest したテキストコンテンツ
// 画像 URL / 関連商品は別途対応予定

import { DRAWING_PRODUCTS, getDrawingProduct } from "@/lib/drawing-modal/products"
import type { DrawingProductConfig } from "@/lib/drawing-modal/products"

export interface ProductSpec {
  label: string
  value: string
}

export interface ProductDisplay {
  slug: string
  nameEn: string // "René"
  nameJaShort: string // "ルネ"
  breadcrumbCategory: string // "横型手すり" など (一覧ページ用カテゴリ名)
  subtitle: string // "壁付け手すり ・ 横型"
  shortDescription: string // 1行キャッチ
  longDescription: string // 「製品について」本文
  specs: ProductSpec[]
  galleryIds: string[] // 既存 item/*.html の GALLERY_IDS から抜粋 (先頭6件程度)
}

// Cloudflare Images CDN
export const CDN_BASE = "https://imagedelivery.net/QondspN4HIUvB_R16-ddAQ/60e3e0f9c3289c7ab78f13e7"

export function galleryUrl(id: string, variant: string = "public"): string {
  return `${CDN_BASE}/${id}/${variant}`
}

const DISPLAY: Record<string, ProductDisplay> = {
  rene: {
    slug: "rene",
    nameEn: "René",
    nameJaShort: "ルネ",
    breadcrumbCategory: "横型手すり",
    subtitle: "壁付け手すり ・ 横型",
    shortDescription: "鍛冶職人制作 壁付けアイアン手すり 横型 φ25 マットブラック",
    longDescription:
      "René（ルネ）は、シンプルでありながら存在感のある横型アイアン手すりです。φ25mmの無垢丸鋼を鍛冶職人が一本一本手作りし、焼付マット塗装で仕上げています。マットブラックの落ち着いた佇まいは和洋どちらの空間にも馴染み、握りやすい太さで安全性と美しさを両立。座金・取付ビス一式付属で、届いたらすぐに取り付けられます。",
    specs: [
      { label: "素材", value: "鉄（無垢丸鋼）" },
      { label: "仕上げ", value: "焼付マット塗装" },
      { label: "カラー", value: "マットブラック" },
      { label: "標準長さ", value: "〜1500mm（最大5000mm）" },
      { label: "太さ", value: "φ25mm" },
      { label: "付属品", value: "座金3個・取付ビス一式" },
    ],
    galleryIds: [
      "d0f5f0e83d40a4d29044.jpg",
      "441adb48d70157c88ced.jpg",
      "7918619d2ac80c628b18.jpg",
      "8b014530a248acab27b4.jpg",
      "2f3045de2d64fb258555.jpg",
      "95c11abfffdb58afc397.jpg",
    ],
  },
  claire: {
    slug: "claire",
    nameEn: "Claire",
    nameJaShort: "クレール",
    breadcrumbCategory: "横型手すり",
    subtitle: "壁付け手すり ・ 横型",
    shortDescription: "鍛冶職人制作 壁付けアイアン手すり 横型 φ25 マットホワイト",
    longDescription:
      "Claire（クレール）は、セミマットホワイトで仕上げた明るく柔らかな印象の壁付け手すりです。デザイナー住宅のようなコンクリート住宅から和風建築にもよく合います。角やひっかかる危ない箇所がないよう丁寧に仕上げておりますので、小さなお子様がいるご家庭でも安心してお使いいただけます。",
    specs: [
      { label: "素材", value: "鉄（無垢丸鋼）" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットホワイト" },
      { label: "標準長さ", value: "〜1500mm（最大5000mm）" },
      { label: "太さ", value: "φ25mm" },
      { label: "付属品", value: "座金3個・取付ビス一式" },
    ],
    galleryIds: [
      "0a0c0c78f9f636cca733.jpg",
      "eae60ee60278fdc5aef7.jpg",
      "7669ac50e3027f2f4056.jpg",
      "5bda48c8598f2c5e0fa4.jpg",
      "28918bd828b8c4793b5a.jpg",
      "1eb8f8e79ab4b31ec686.jpg",
    ],
  },
  marcel: {
    slug: "marcel",
    nameEn: "Marcel",
    nameJaShort: "マルセル",
    breadcrumbCategory: "横型手すり",
    subtitle: "壁付け手すり ・ 横型フラットバー",
    shortDescription: "鍛冶職人制作 フラットバー手すり 9×32 マットブラック",
    longDescription:
      "Marcel（マルセル）は、艶消し黒で仕上げたシックな印象のフラットバー壁付け手すりです。デザイナー住宅のようなコンクリート住宅から和風建築にもよく合います。角やひっかかる危ない箇所がないよう丁寧に仕上げておりますので、小さなお子様がいるご家庭でも安心してお使いいただけます。",
    specs: [
      { label: "素材", value: "ss400 フラットバー" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットブラック" },
      { label: "標準長さ", value: "〜1500mm（最大5000mm）" },
      { label: "寸法", value: "9×32mm" },
      { label: "付属品", value: "座金3個・取付ビス一式" },
    ],
    galleryIds: [
      "939d0690971c550c1dd9.jpg",
      "a3959136fa0812a028ab.jpg",
      "c3d3980716a89741f308.jpg",
      "c65c9c3e16afcb54dfd1.jpg",
      "918bdf512ec60b0714fc.jpg",
      "6ae94e74595cc9233f9a.jpg",
    ],
  },
  emile: {
    slug: "emile",
    nameEn: "Émile",
    nameJaShort: "エミール",
    breadcrumbCategory: "横型手すり",
    subtitle: "壁付け手すり ・ 横型フラットバー 鎚目",
    shortDescription: "鍛冶職人制作 鎚目仕上げフラットバー手すり 銀古美",
    longDescription:
      "Émile（エミール）は、鎚目加工を施した上質な横型手すりです。職人による手仕上げの鎚目が、光と影を織り交ぜた独特の表情を生み出します。銀古美仕上げにより、クラシカルで格調高い雰囲気を演出します。光の当たり具合で表情が変わる鎚目は、毎日のご使用の中で新しい美しさを発見できます。",
    specs: [
      { label: "素材", value: "ss400 フラットバー" },
      { label: "仕上げ", value: "手打ち鎚目 + 銀古美" },
      { label: "カラー", value: "銀古美（シルバーアンティーク）" },
      { label: "標準長さ", value: "〜1500mm（最大5000mm）" },
      { label: "寸法", value: "9×32mm" },
      { label: "付属品", value: "座金3個・取付ビス一式" },
    ],
    galleryIds: [
      "fa95f550baa05216d291.jpg",
      "52eb04f0bc4006be50ab.jpg",
      "ad5c57a5a6d663f39de5.jpg",
      "c31fc7db2bfd832d548d.jpg",
      "f5a0332bb1ab9928a512.jpg",
      "7feab012748952757a3c.jpg",
    ],
  },
  claude: {
    slug: "claude",
    nameEn: "Claude",
    nameJaShort: "クロード",
    breadcrumbCategory: "縦型手すり",
    subtitle: "壁付け手すり ・ 縦型",
    shortDescription: "鍛冶職人制作 縦型アイアン手すり φ25 マットブラック",
    longDescription:
      "Claude（クロード）は、縦型手すりのスタンダードモデルです。シンプルで使いやすく、セミオーダー対応で多くのシーンに対応できます。一律料金〜1000mmで設定されており、短い範囲での設置に最適です。",
    specs: [
      { label: "素材", value: "SS400 STKM 25.4φ" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットブラック" },
      { label: "標準長さ", value: "〜1000mm 一律料金（最大3000mm）" },
      { label: "太さ", value: "φ25mm" },
      { label: "付属品", value: "座金・取付ビス一式" },
    ],
    galleryIds: [
      "86278edb68c21957e339.jpg",
      "4891b02ffce1786113ae.jpg",
      "e490e7cc7493378ef896.jpg",
      "2c953ba91fe0b264c2fe.jpg",
      "ad53ccfcea905eea06b9.jpg",
      "3942c2d19e73235a5b7f.jpg",
    ],
  },
  catherine: {
    slug: "catherine",
    nameEn: "Catherine",
    nameJaShort: "カトリーヌ",
    breadcrumbCategory: "縦型手すり",
    subtitle: "壁付け手すり ・ 縦型",
    shortDescription: "鍛冶職人制作 縦型アイアン手すり φ25 マットホワイト",
    longDescription:
      "Catherine（カトリーヌ）は、マットホワイトで仕上げた縦型手すりです。明るく清潔感のある印象で、洗面所や玄関まわりなど、明るい空間によく馴染みます。〜1000mmまで一律料金でご提供しており、短い範囲の設置にも最適です。",
    specs: [
      { label: "素材", value: "SS400 STKM 25.4φ" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットホワイト" },
      { label: "標準長さ", value: "〜1000mm 一律料金（最大3000mm）" },
      { label: "太さ", value: "φ25mm" },
      { label: "付属品", value: "座金・取付ビス一式" },
    ],
    galleryIds: [
      "8775cfcb40298257834a.jpg",
      "5e4377eb8cce3ba15572.jpg",
      "8e9f10b474c179961a81.jpg",
      "f4a030f56d5784dc460c.jpg",
      "dfc095e36e07842b1e1a.jpg",
      "be8ace3369f4527a90ce.jpg",
    ],
  },
  alexandre: {
    slug: "alexandre",
    nameEn: "Alexandre",
    nameJaShort: "アレクサンドル",
    breadcrumbCategory: "縦型手すり",
    subtitle: "壁付け手すり ・ 縦型 太径",
    shortDescription: "鍛冶職人制作 縦型アイアン手すり φ31.8 太径 マットブラック",
    longDescription:
      "Alexandre（アレクサンドル）は、標準より太いφ31.8mmの縦型手すりです。握りやすさと存在感を兼ね備え、しっかりとした安心感のある手すりをお求めの方に最適です。〜1000mmまで一律料金でご提供しています。",
    specs: [
      { label: "素材", value: "SS400 STKM 31.8φ" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットブラック" },
      { label: "標準長さ", value: "〜1000mm 一律料金（最大3000mm）" },
      { label: "太さ", value: "φ31.8mm（太径）" },
      { label: "付属品", value: "座金・取付ビス一式" },
    ],
    galleryIds: [
      "759848de1a99945b4d90.jpg",
      "b10994fb69518432cb40.jpg",
      "35ec7502d69a4e5aea2b.jpg",
      "8b61a9e2e373016b634a.jpg",
      "51f634876bc5ffff0639.jpg",
      "ed9cafa6cf003bdf2ed1.jpg",
    ],
  },
  antoine: {
    slug: "antoine",
    nameEn: "Antoine",
    nameJaShort: "アントワーヌ",
    breadcrumbCategory: "縦型手すり",
    subtitle: "壁付け手すり ・ 縦型ロング",
    shortDescription: "鍛冶職人制作 縦型ロング手すり φ25 マットブラック",
    longDescription:
      "Antoine（アントワーヌ）は、2300〜2500mmに対応する縦型ロング手すりです。天井近くまで届く長尺のため、階段や吹き抜け空間など、通常の縦型手すりでは対応しきれない場所に最適です。製作期間は通常より長く、ご注文後4〜5週間となります。",
    specs: [
      { label: "素材", value: "SS400 STKM 25.4φ" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットブラック" },
      { label: "標準長さ", value: "2300〜2500mm 固定" },
      { label: "太さ", value: "φ25mm" },
      { label: "付属品", value: "座金4個・取付ビス一式" },
    ],
    galleryIds: ["2d1043dcd7658a96e5f3.jpg"],
  },
}

export function getProductDisplay(slug: string): ProductDisplay | null {
  return DISPLAY[slug] ?? null
}

// 表示情報と描画モーダル情報の結合ビュー
export interface ProductFull extends ProductDisplay {
  drawing: DrawingProductConfig
}

export function getProductFull(slug: string): ProductFull | null {
  const display = getProductDisplay(slug)
  const drawing = getDrawingProduct(slug)
  if (!display || !drawing) return null
  return { ...display, drawing }
}

// デバッグ用: 全商品のスラッグ一覧
export function listProductSlugs(): string[] {
  return Object.keys(DISPLAY).filter((s) => s in DRAWING_PRODUCTS)
}
