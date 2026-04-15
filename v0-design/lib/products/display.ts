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
  youtubeId?: string // 制作動画 (あれば埋め込み表示)
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
      "René（ルネ）は、シンプルでありながら存在感のある横型アイアン手すりです。φ25mmの無垢丸鋼を鍛冶職人が一本一本手作りし、2液型ウレタン塗装で仕上げています。マットブラックの落ち着いた佇まいは和洋どちらの空間にも馴染み、握りやすい太さで安全性と美しさを両立。座金・取付ビス一式付属で、届いたらすぐに取り付けられます。",
    specs: [
      { label: "素材", value: "STKM 炭素鋼鋼管" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットブラック" },
      { label: "標準長さ", value: "〜1500mm（最大5000mm）" },
      { label: "太さ", value: "25.4φ" },
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
    youtubeId: "NYRb4pMN0NI",
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
    youtubeId: "NYRb4pMN0NI",
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
  scroll16: {
    slug: "scroll16",
    nameEn: "Scroll 16φ",
    nameJaShort: "スクロール",
    breadcrumbCategory: "ロートアイアン ・ 縦型",
    subtitle: "ロートアイアン ・ 縦型 16φ",
    shortDescription: "無垢鉄 16φ 70cm固定 ミツロウ仕上げ",
    longDescription:
      "Scroll スクロール は、最もコンパクトな無垢鉄の手すりです。16φの細いパイプながら、無垢鉄の質感がお洒落に映ります。高さ70cm、直径16φのコンパクトなサイズは、玄関や階段の踏み面に設置する小型の手すりに最適です。ミツロウ仕上げにより、経年変化を楽しめる味わい深い風合いを実現しています。アイアンの素材感を活かしたシンプルな設計で、小さなスペースでも上質な雰囲気を演出できる逸品です。",
    specs: [
      { label: "素材", value: "無垢鉄" },
      { label: "仕上げ", value: "ミツロウ仕上げ" },
      { label: "サイズ", value: "高さ 70cm 固定" },
      { label: "太さ", value: "φ16mm" },
      { label: "製法", value: "火造り鍛造" },
      { label: "納期", value: "ご注文後 3〜4週間" },
    ],
    galleryIds: ["2a64ecfb5e50e78cb374.jpg"],
  },
  scroll19: {
    slug: "scroll19",
    nameEn: "Scroll 19φ",
    nameJaShort: "スクロール",
    breadcrumbCategory: "ロートアイアン ・ 縦型",
    subtitle: "ロートアイアン ・ 縦型 19φ",
    shortDescription: "無垢鉄 19φ 70cm固定 ミツロウ仕上げ",
    longDescription:
      "Scroll スクロール 19φは、バランスの取れたサイズの無垢鉄手すりです。16φより太く、存在感のあるデザインながら、シンプルさを保ちます。握りやすいサイズで、安全性と美しさの両立を実現しています。ミツロウ仕上げの無垢鉄は、使い込むほどに味わい深くなります。玄関、デッキ、小スペースなど、色々な場所で活躍する無垢鉄の逸品です。",
    specs: [
      { label: "素材", value: "無垢鉄" },
      { label: "仕上げ", value: "ミツロウ仕上げ" },
      { label: "サイズ", value: "高さ 70cm 固定" },
      { label: "太さ", value: "φ19mm" },
      { label: "製法", value: "火造り鍛造" },
      { label: "納期", value: "ご注文後 4〜5週間" },
    ],
    galleryIds: ["25b6438ea6a9393aa027.jpg"],
  },
  scroll22: {
    slug: "scroll22",
    nameEn: "Scroll 22φ",
    nameJaShort: "スクロール",
    breadcrumbCategory: "ロートアイアン ・ 縦型",
    subtitle: "ロートアイアン ・ 縦型 22φ プレミアム",
    shortDescription: "無垢鉄 22φ 80cm固定 ミツロウ仕上げ",
    longDescription:
      "Scroll スクロール 22φは、最も太く、最もプレミアムな無垢鉄の手すりです。太径の22φは握りやすく、安全性を優先される方に最適です。80cmの高さと組み合わせて、大人らしい落ち着いた佇まいを演出します。無垢鉄の質感とミツロウ仕上げにより、時を重ねるごとに深まる色合いが最大の魅力です。一生使い続けたい、工芸品としての手すりです。",
    specs: [
      { label: "素材", value: "無垢鉄" },
      { label: "仕上げ", value: "ミツロウ仕上げ" },
      { label: "サイズ", value: "高さ 80cm 固定" },
      { label: "太さ", value: "φ22mm" },
      { label: "製法", value: "火造り鍛造" },
      { label: "納期", value: "ご注文後 4〜5週間" },
    ],
    galleryIds: ["d09c9426e8510d2ca152.jpg"],
  },
  fabrice: {
    slug: "fabrice",
    nameEn: "Fabrice",
    nameJaShort: "ファブリス",
    breadcrumbCategory: "ロートアイアン ・ 縦型",
    subtitle: "ロートアイアン ・ 縦型 職人の逸品",
    shortDescription: "純無垢鉄 80cm 火造り鍛造 ミツロウ仕上げ",
    longDescription:
      "Fabrice ファブリスは、職人が一本一本丁寧に仕上げた最高級の無垢鉄手すりです。100年を超えて使い続けられることを想定した設計と制作です。純無垢鉄の質感とミツロウ仕上げの組み合わせにより、使い込むほどに深みのある色合いへと変化していく逸品です。代々受け継ぐことができる工芸品としての手すりです。上質な暮らしをお望みの方へ、世代を超えて愛用していただきたい、最高級の手すりです。オーダーメイドで丁寧に製作いたします。",
    specs: [
      { label: "素材", value: "純無垢鉄" },
      { label: "仕上げ", value: "ミツロウ仕上げ" },
      { label: "サイズ", value: "高さ 80cm 固定" },
      { label: "製法", value: "火造り鍛造（職人手打ち）" },
      { label: "付属品", value: "座金2個・取付ビス一式" },
      { label: "納期", value: "ご注文後 5〜6週間" },
    ],
    galleryIds: ["66a699b295bcdb8f3598.jpg"],
  },
  tsuchime: {
    slug: "tsuchime",
    nameEn: "TSUCHIME",
    nameJaShort: "鎚目",
    breadcrumbCategory: "ロートアイアン ・ 縦型",
    subtitle: "ロートアイアン ・ 縦型 手打ち鎚目",
    shortDescription: "純無垢鉄 80cm 手打ち鎚目仕上げ",
    longDescription:
      "鎚目 ツチメは、無垢鉄に手打ちで施した鎚目加工の手すりです。職人の手による一打ち一打ちが、光と影を織り交ぜた独特の表情を生み出します。古来から鍛冶の技法として伝わる鎚目加工は、見る角度によって異なる表情を見せます。時間とともに風化し、益々味わい深くなる無垢鉄の美しさを最大限に引き出しています。伝統工芸の技と現代性が融合した、唯一無二の手すり。クラシカルで上質な空間づくりに最適な、職人の逸品です。",
    specs: [
      { label: "素材", value: "純無垢鉄" },
      { label: "仕上げ", value: "手打ち鎚目仕上げ" },
      { label: "サイズ", value: "高さ 80cm 固定" },
      { label: "製法", value: "火造り鍛造 + 手打ち加工" },
      { label: "付属品", value: "座金2個・取付ビス一式" },
      { label: "納期", value: "ご注文後 5〜6週間" },
    ],
    galleryIds: ["569af3ee76a1999863e7.jpg"],
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
