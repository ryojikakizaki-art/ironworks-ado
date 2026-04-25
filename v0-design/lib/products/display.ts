// 商品詳細ページ表示用マスター
// 既存 item/*.html から harvest したテキストコンテンツ
// 画像 URL / 関連商品は別途対応予定

import { DRAWING_PRODUCTS, getDrawingProduct } from "@/lib/drawing-modal/products"
import type { DrawingProductConfig } from "@/lib/drawing-modal/products"

export interface ProductSpec {
  label: string
  value: string
}

// 商品ページの「製品について」セクションに表示する 4 つの特徴アイコン
export type FeatureIconName = "Hammer" | "Paintbrush" | "Ruler" | "Wrench"
export interface FeatureBullet {
  icon: FeatureIconName
  title: string
  desc: string
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
  featureBullets: FeatureBullet[] // 「製品について」の 4 点アイコン (仕上げ・製法で変わる)
  galleryIds: string[] // 既存 item/*.html の GALLERY_IDS から抜粋 (先頭6件程度)
  youtubeId?: string // 制作動画 (あれば埋め込み表示)
}

// 仕上げ別の特徴プリセット (同一プリセットを複数商品で共有)
const FB_STKM_URETHANE: FeatureBullet[] = [
  { icon: "Hammer", title: "職人の手仕上げ", desc: "一点一点、職人が手作業で丁寧に仕上げます" },
  { icon: "Paintbrush", title: "2液ウレタン塗装", desc: "耐久性の高い2液型ウレタン塗装で長持ち" },
  { icon: "Ruler", title: "オーダーメイド", desc: "お好みのサイズでお作りします" },
  { icon: "Wrench", title: "取付簡単", desc: "付属の金具で簡単に取り付け可能" },
]

const FB_EMILE_SILVER: FeatureBullet[] = [
  { icon: "Hammer", title: "手打ち鎚目", desc: "職人が一打ち一打ち手で仕上げた独特の表情" },
  { icon: "Paintbrush", title: "銀古美仕上げ", desc: "クラシカルで格調高い経年変化を楽しめる仕上げ" },
  { icon: "Ruler", title: "オーダーメイド", desc: "お好みのサイズでお作りします" },
  { icon: "Wrench", title: "取付簡単", desc: "付属の金具で簡単に取り付け可能" },
]

const FB_MITSUROU: FeatureBullet[] = [
  { icon: "Hammer", title: "火造り鍛造", desc: "職人の手打ちで一本一本鍛え上げた無垢鉄" },
  { icon: "Paintbrush", title: "ミツロウ仕上げ", desc: "使い込むほどに深まる経年変化を楽しめる天然仕上げ" },
  { icon: "Ruler", title: "固定サイズ", desc: "職人の逸品として決まった寸法でお届けします" },
  { icon: "Wrench", title: "取付簡単", desc: "付属の金具で簡単に取り付け可能" },
]

const FB_TSUCHIME: FeatureBullet[] = [
  { icon: "Hammer", title: "手打ち鎚目", desc: "職人の一打ち一打ちが生む、唯一無二の表情" },
  { icon: "Paintbrush", title: "火造り鍛造", desc: "伝統の火造り鍛造で無垢鉄を鍛え上げます" },
  { icon: "Ruler", title: "固定サイズ", desc: "職人の逸品として決まった寸法でお届けします" },
  { icon: "Wrench", title: "取付簡単", desc: "付属の金具で簡単に取り付け可能" },
]

// Cloudflare Images CDN
export const CDN_BASE = "https://imagedelivery.net/QondspN4HIUvB_R16-ddAQ/60e3e0f9c3289c7ab78f13e7"

// ローカル差し替え: Cloudflare Images の元画像に代えて public/ の加工済み画像を使う
// 元画像 ID → ローカルパス のマップ
const LOCAL_IMAGE_OVERRIDES: Record<string, string> = {
  // Antoine: "2.3~2.5m限定 ¥56,000" 文字を削除した加工版
  "2d1043dcd7658a96e5f3.jpg": "/images/gallery/antoine-top.jpg",
}

export function galleryUrl(id: string, variant: string = "public"): string {
  const local = LOCAL_IMAGE_OVERRIDES[id]
  if (local) return local
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
      "René（ルネ）は、シンプルでありながら存在感のある横型アイアン手すりです。STKM 炭素鋼鋼管 25.4φ を鍛冶職人が一本一本手作業で仕上げ、2液型ウレタン塗装で仕上げています。マットブラックの落ち着いた佇まいは和洋どちらの空間にも馴染み、握りやすい太さで安全性と美しさを両立。座金・取付ビス一式付属で、届いたらすぐに取り付けられます。",
    specs: [
      { label: "素材", value: "STKM 炭素鋼鋼管" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットブラック" },
      { label: "標準長さ", value: "〜1500mm（最大5000mm）" },
      { label: "太さ", value: "25.4φ" },
      { label: "付属品", value: "取付ビス一式・タッチアップ材" },
    ],
    featureBullets: FB_STKM_URETHANE,
    galleryIds: [
      "d0f5f0e83d40a4d29044.jpg","441adb48d70157c88ced.jpg","7918619d2ac80c628b18.jpg",
      "8b014530a248acab27b4.jpg","2f3045de2d64fb258555.jpg","95c11abfffdb58afc397.jpg",
      "f5923b0c53f5c1fea716.jpg","7d7c66c9c805ef20aff7.jpg","b9519407dd0b4b289459.jpg",
      "558035c05662b6447525.jpg","1cb251b4c76525126564.jpg","6a9cc507ff374b5ad7f3.jpg",
      "550457e79b7c329b2543.jpg","a6febd2e52de5465d22a.jpg","ad695366e8e2d7623b38.jpg",
      "f7f519fb453322a8cb2a.jpg","52e804336a605048b0ad.jpg","9c60c929bcf4b8d2f201.jpg",
      "6af00541b422cefa2348.jpg","6431145df3f48a69b3ba.jpg","ef59fb2d37647f61563d.jpg",
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
      "Claire（クレール）は、STKM 炭素鋼鋼管 25.4φ を鍛冶職人が一本一本手作業で仕上げ、2液型ウレタンのセミマットホワイトで塗装した明るく柔らかな印象の壁付け手すりです。デザイナー住宅のようなコンクリート住宅から和風建築にもよく合います。角やひっかかる危ない箇所がないよう丁寧に仕上げておりますので、小さなお子様がいるご家庭でも安心してお使いいただけます。",
    specs: [
      { label: "素材", value: "STKM 炭素鋼鋼管" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットホワイト" },
      { label: "標準長さ", value: "〜1500mm（最大5000mm）" },
      { label: "太さ", value: "25.4φ" },
      { label: "付属品", value: "取付ビス一式・タッチアップ材" },
    ],
    featureBullets: FB_STKM_URETHANE,
    galleryIds: [
      "0a0c0c78f9f636cca733.jpg","eae60ee60278fdc5aef7.jpg","7669ac50e3027f2f4056.jpg",
      "5bda48c8598f2c5e0fa4.jpg","28918bd828b8c4793b5a.jpg","1eb8f8e79ab4b31ec686.jpg",
      "374085d195f2bd44031e.jpg","d7840abff7cfd7a131bb.jpg","cc1ea26a6a478049a3a1.jpg",
      "0fb17f6f640b5245e77d.jpg","5d4d6b92202ca5bb041b.jpg","53f698a1ab1ec93519e2.jpg",
      "df41b26c077e3e52e10c.jpg","c0b0cb5a64f885dc1253.jpg","102be58797d82ee14f65.jpg",
      "0b272022f9aba67d8894.jpg","1bd38b194fc0153fe861.jpg","115127d7d836eea83193.jpg",
      "ad9843b14844b53c2370.jpg","9bd7c49c093569f7c3e3.jpg","6e7454ad84c24a43c1ae.jpg",
      "bb34c201580ca0240c31.jpg","93e0cdb295c2bf73c357.jpg","4e118a43e6e6a5fa942b.jpg",
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
      { label: "付属品", value: "取付ビス一式・タッチアップ材" },
    ],
    featureBullets: FB_STKM_URETHANE,
    galleryIds: [
      "939d0690971c550c1dd9.jpg","a3959136fa0812a028ab.jpg","c3d3980716a89741f308.jpg",
      "c65c9c3e16afcb54dfd1.jpg","918bdf512ec60b0714fc.jpg","6ae94e74595cc9233f9a.jpg",
      "c75334af59eaf090d4c2.jpg","f9eb8a412c6eb57c2c75.jpg","f1e384f0c04e4aa41cd2.jpg",
      "6024fde062d0eba1a6ea.jpg","90b7b10f6116554b5c8d.jpg","2eac76404e96056b6e86.jpg",
      "a9681609b2a2cbb8d71d.jpg","de07eb4bda3c3bc1a6d9.jpg","3ab4501143e0c6e65e21.jpg",
      "acbe409bf05b3cefdd7c.jpg","0121262109ff2b470d7c.jpg",
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
      { label: "付属品", value: "取付ビス一式・タッチアップ材" },
    ],
    featureBullets: FB_EMILE_SILVER,
    galleryIds: [
      "fa95f550baa05216d291.jpg","52eb04f0bc4006be50ab.jpg","ad5c57a5a6d663f39de5.jpg",
      "c31fc7db2bfd832d548d.jpg","f5a0332bb1ab9928a512.jpg","7feab012748952757a3c.jpg",
      "a7781d91b2f4ffc4ff82.jpg","913ca1e1d0d87ec6b477.jpg","ffba9c3dfa8dbdd0692f.jpg",
      "55e325fefaf128867661.jpg","d45406d07efddd68dee9.jpg","ec4cf1df9faef6c8875d.jpg",
      "df7275a5e72204c7044c.jpg","4520446536bce11b67e2.jpg","55f37f48b3b04c253dd6.jpg",
      "4b1c1130fefdfea3a146.jpg",
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
      "Claude（クロード）は、STKM 炭素鋼鋼管 25.4φ を鍛冶職人が一本一本手作業で仕上げ、2液型ウレタン塗装で仕上げた縦型手すりのスタンダードモデルです。シンプルで使いやすく、セミオーダー対応で多くのシーンに対応できます。一律料金〜1000mmで設定されており、短い範囲での設置に最適です。",
    specs: [
      { label: "素材", value: "STKM 炭素鋼鋼管" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットブラック" },
      { label: "標準長さ", value: "〜1000mm 一律料金（500〜1500mm）" },
      { label: "太さ", value: "25.4φ" },
      { label: "付属品", value: "取付ビス一式・タッチアップ材" },
    ],
    featureBullets: FB_STKM_URETHANE,
    galleryIds: [
      "86278edb68c21957e339.jpg","4891b02ffce1786113ae.jpg","e490e7cc7493378ef896.jpg",
      "2c953ba91fe0b264c2fe.jpg","ad53ccfcea905eea06b9.jpg","3942c2d19e73235a5b7f.jpg",
      "6b720c7b85466c7359e7.jpg","7266d7bfe087d226608e.jpg","9f1e0f69a54476b5caff.jpg",
      "82e1cc3d3168d6f46cd8.jpg","156414dbec3475dec9ae.jpg",
      "3a6e533f6dd44cfab66b.jpg","a0ac37e66b1c7989e727.jpg","156c48ab2885448a90d7.jpg",
      "88eb66165a7f2ff8773d.jpg","4d8beb3b89354bf181bf.jpg","b8fd8dbbe2b28beff3f1.jpg",
      "4380b8f100b251599f3d.jpg","8ea249f541b73524afa5.jpg","93769cb9994dc6f4c7e5.jpg",
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
      { label: "素材", value: "STKM 25.4φ" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットホワイト" },
      { label: "標準長さ", value: "〜1000mm 一律料金（500〜1500mm）" },
      { label: "太さ", value: "φ25mm" },
      { label: "付属品", value: "取付ビス一式・タッチアップ材" },
    ],
    featureBullets: FB_STKM_URETHANE,
    galleryIds: [
      "8775cfcb40298257834a.jpg","5e4377eb8cce3ba15572.jpg","8e9f10b474c179961a81.jpg",
      "f4a030f56d5784dc460c.jpg","dfc095e36e07842b1e1a.jpg","be8ace3369f4527a90ce.jpg",
      "340d022f48e0aee6e96b.jpg","0867afe603e501db8ede.jpg","8f88e87c208e9273ed2a.jpg",
      "99fc87f58c4321ab6a5f.jpg","dd16c6f3769ef886a8eb.jpg","82e1cc3d3168d6f46cd8.jpg",
      "156414dbec3475dec9ae.jpg","c176c6746b8db4bf6b8f.jpg",
      "d706b98edf0298cb0fde.jpg","e52b2cf97144be5b3ad9.jpg","bdac7a64dc3c49e65541.jpg",
      "4d8beb3b89354bf181bf.jpg","b8fd8dbbe2b28beff3f1.jpg","33d99fc7e30df4dc8983.jpg",
      "0c87b33aaf166d4e805e.jpg",
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
      { label: "素材", value: "STKM 31.8φ" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットブラック" },
      { label: "標準長さ", value: "〜1000mm 一律料金（最大3000mm）" },
      { label: "太さ", value: "φ31.8mm（太径）" },
      { label: "付属品", value: "取付ビス一式・タッチアップ材" },
    ],
    featureBullets: FB_STKM_URETHANE,
    galleryIds: [
      "759848de1a99945b4d90.jpg","b10994fb69518432cb40.jpg","35ec7502d69a4e5aea2b.jpg",
      "8b61a9e2e373016b634a.jpg","51f634876bc5ffff0639.jpg","ed9cafa6cf003bdf2ed1.jpg",
      "be3cc88ce54ebba2376a.jpg","ea536206ca80d65d0cee.jpg","88c995ff27574b2c8ce8.jpg",
      "71e9a25279852f4c852c.jpg","9835a48475e6947e659a.jpg","247b5da896b2fabbfb5d.jpg",
      "802663981d66cc60f1ea.jpg","d1a3a09b5cc397166a27.jpg","801be0c88a0f4a16dbd6.jpg",
      "1df61d2807882f3278a9.jpg","40efcf72c193232e0252.jpg","32713b9ad53615ee3d9f.jpg",
      "b03b8770729408d808cf.jpg","d6378ab3773bd0fcd172.jpg","ca7f54fc8d274a5bfeef.jpg",
      "af5da23e3730a90c9a2b.jpg",
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
      "Antoine（アントワーヌ）は、1500〜3000mmに対応する縦型ロング手すりです。天井近くまで届く長尺のため、階段や吹き抜け空間など、通常の縦型手すりでは対応しきれない場所に最適です。素材の厚みが、1500mmまでの長さのClaude（2.3mm）より厚い素材（3.2mm）を使用しているため、座金間を広く取れます。",
    specs: [
      { label: "素材", value: "STKM 25.4φ" },
      { label: "仕上げ", value: "2液型ウレタン塗装" },
      { label: "カラー", value: "マットブラック" },
      { label: "標準長さ", value: "1500〜3000mm" },
      { label: "太さ", value: "φ25mm" },
      { label: "付属品", value: "取付ビス一式・タッチアップ材" },
    ],
    featureBullets: FB_STKM_URETHANE,
    // STORES アイテムページ (.../items/66c843839dd5030955588e20) から抽出した 20 枚
    galleryIds: [
      "2d1043dcd7658a96e5f3.jpg", "27028bc72ffa6bf103d8.jpg", "fbdf60c247bea8b3c486.jpg",
      "711648a707f963c9b59a.jpg", "c5fb2dd278941bd5fd39.jpg", "97fa0e33493cacbe986a.jpg",
      "e2bf8d7d8ad4bcaf847f.jpg", "87cea36aa852942ae05f.jpg", "724e568b9455f3a68e96.jpg",
      "0169bd76e91e8b32d3c7.jpg", "4625e309d2e7d3f13f51.jpg", "e7989a9da84d34b0bdd6.jpg",
      "439ff410f397b16fa4ab.jpg", "82e1cc3d3168d6f46cd8.jpg", "156414dbec3475dec9ae.jpg",
      "4d8beb3b89354bf181bf.jpg", "b8fd8dbbe2b28beff3f1.jpg", "c44c2c4ac9b6765f2a70.jpg",
      "8ca535d71a1edd180f5f.jpg", "59b5908472bc96a523a1.jpg",
    ],
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
    featureBullets: FB_MITSUROU,
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
    featureBullets: FB_MITSUROU,
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
    featureBullets: FB_MITSUROU,
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
      { label: "付属品", value: "取付ビス一式・タッチアップ材" },
      { label: "納期", value: "ご注文後 5〜6週間" },
    ],
    featureBullets: FB_MITSUROU,
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
      { label: "付属品", value: "取付ビス一式・タッチアップ材" },
      { label: "納期", value: "ご注文後 5〜6週間" },
    ],
    featureBullets: FB_TSUCHIME,
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
