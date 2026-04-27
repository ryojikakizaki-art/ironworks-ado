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
  // ローカルパス（"/" で始まる）は CDN 解決をスキップして直接返す
  if (id.startsWith("/")) return id
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
    shortDescription: "鍛冶職人制作 壁付けアイアン手すり 横型 25φ マットブラック",
    longDescription:
      "艶消し黒で仕上げたシックな印象の壁付け手すり。デザイナー住宅のようなコンクリート住宅から和風建築まで、空間を選ばずよく馴染みます。艶消し白の仕上げにも対応可能です。\n\n仕上がりの美しさ、使いやすさにこだわり、目立たない細かな部分も手をぬかず、長く愛用していただけるよう丁寧に制作しております。IRONWORKS ado は、傷や錆を「鉄の味わい」と謳うような不誠実なものづくりはいたしません。\n\n手すりは毎日手に触れ、安全のために付けるもの。握りやすく安心して掴める強度を考え、25φ（単2電池より少し細いくらい）のしっかりした太さで作っています。安価な商品にありがちな 16φ や 19φ では、手すりとしては不安を感じる細さです（一般的な大人の人差し指が 16φ、親指が 19φ ほど）。\n\n住まいづくりの中で手すりはこだわる優先度が低いものかもしれませんが、『丁寧に作られた』アイアン手すりのある空間は全体を引き締め、毎日を上質で豊かにしてくれます。\n\n角やひっかかる危ない箇所がないよう丁寧に仕上げておりますので、小さなお子様がいるご家庭でも安心してお使いいただけます。これから毎日お使いいただく方の心豊かな暮らしを思い、制作しております。",
    specs: [
      { label: "タイプ", value: "丸棒（パイプ材）" },
      { label: "素材", value: "鉄" },
      { label: "仕上げ", value: "錆止め吹付塗装 + 2液型ウレタン艶消し黒塗装" },
      { label: "カラー", value: "マットブラック（艶消し白も対応可）" },
      { label: "太さ", value: "25φ" },
      { label: "サイズ", value: "D65×H75mm / ブラケット座金 φ45mm" },
      { label: "標準長さ", value: "〜1500mm（最大5000mm）" },
      { label: "付属品", value: "取付用ビス M4×40mm・タッチアップ剤" },
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
    shortDescription: "鍛冶職人制作 壁付けアイアン手すり 横型 25φ マットホワイト",
    longDescription:
      "半艶消し白で仕上げ、明るく柔らかい印象の壁付け手すり。デザイナー住宅のようなコンクリート住宅から和風建築まで、空間を選ばずよく馴染みます。\n\n仕上がりの美しさ、使いやすさにこだわり、目立たない細かな部分も手をぬかず、長く愛用していただけるよう丁寧に制作しております。IRONWORKS ado は、傷や錆を「鉄の味わい」と謳うような不誠実なものづくりはいたしません。\n\n手すりは毎日手に触れ、安全のために付けるもの。握りやすく安心して掴める強度を考え、25φ（単2電池より少し細いくらい）のしっかりした太さで作っています。16φ や 19φ では、手すりとしては不安を感じる細さです（一般的な大人の人差し指が 16φ、親指が 19φ ほど）。\n\n座金は大きくて主張するとあまり見栄えが良くありませんので、φ45mm 程度が適切と考え制作しております。\n\n住まいづくりの中で手すりはこだわる優先度が低いものかもしれませんが、『丁寧に作られた』アイアン手すりのある空間は全体を引き締め、毎日を上質で豊かにしてくれます。角やひっかかる危ない箇所がないよう丁寧に仕上げておりますので、小さなお子様がいるご家庭でも安心してお使いいただけます。\n\n納期：ご注文から最短 5 日発送。",
    specs: [
      { label: "タイプ", value: "丸棒（パイプ材）" },
      { label: "素材", value: "鉄" },
      { label: "仕上げ", value: "錆止め吹付塗装 + 2液型ウレタン艶消し白塗装" },
      { label: "カラー", value: "マットホワイト" },
      { label: "太さ", value: "25φ" },
      { label: "サイズ", value: "D65×H75mm / ブラケット座金 厚み4.5mm φ45" },
      { label: "標準長さ", value: "〜1500mm（最大5000mm）" },
      { label: "付属品", value: "取付用ビス M4×40mm・タッチアップ剤" },
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
      "艶消し黒で仕上げたシックな印象のフラットバー壁付け手すり。デザイナー住宅のようなコンクリート住宅から和風建築まで、空間を選ばずよく馴染みます。\n\n仕上がりの美しさ、使いやすさにこだわり、目立たない細かな部分も手をぬかず、長く愛用していただけるよう丁寧に制作しております。IRONWORKS ado は、傷や錆を「鉄の味わい」と謳うような不誠実なものづくりはいたしません。\n\n住まいづくりの中で手すりはこだわる優先度が低いものかもしれませんが、『丁寧に作られた』アイアン手すりのある空間は全体を引き締め、毎日を上質で豊かにしてくれます。\n\n角やひっかかる危ない箇所がないよう丁寧に仕上げておりますので、小さなお子様がいるご家庭でも安心してお使いいただけます。これから毎日お使いいただく方の心豊かな暮らしを思い、制作しております。\n\n納期：ご注文から最短 5 日発送。",
    specs: [
      { label: "タイプ", value: "フラットバー" },
      { label: "素材", value: "フラットバー 9×32" },
      { label: "仕上げ", value: "錆止め吹付塗装 + 2液型ウレタン艶消し黒塗装" },
      { label: "カラー", value: "マットブラック" },
      { label: "サイズ", value: "D67×H60mm / ブラケット座金 φ45mm" },
      { label: "標準長さ", value: "〜1500mm（最大5000mm）" },
      { label: "付属品", value: "取付用ビス M4×40mm・タッチアップ剤" },
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
      "サイドに手打ちで打ち込んだハンマートーンが上質な暮らしを演出するロートアイアン手すり。\n\n一般的なフラットバータイプの手すりは無機質でクールな印象ですが、こちらの手すりは、サイドの槌目・エンドの仕上げのテクスチャーにより、鉄の力強さと豪華さを感じられるものとなっております。\n\n艶消し黒塗装だけでは真っ黒に沈んでしまう、せっかくの鉄の表情を、銀古美で仕上げることで浮き立たせ、高級感も感じられる仕上がりとなっております。\n\n仕上がりの美しさ、使いやすさにこだわり、目立たない細かな部分も手をぬかず、長く愛用していただけるよう丁寧に制作しております。IRONWORKS ado は、傷や錆を「鉄の味わい」と謳うような不誠実なものづくりはいたしません。\n\n住まいづくりの中で手すりはこだわる優先度が低いものかもしれませんが、『丁寧に作られた』アイアン手すりのある空間は全体を引き締め、毎日を上質で豊かにしてくれます。\n\n角やひっかかる危ない箇所がないよう丁寧に仕上げておりますので、小さなお子様がいるご家庭でも安心してお使いいただけます。これから毎日お使いいただく方の心豊かな暮らしを思い、制作しております。",
    specs: [
      { label: "タイプ", value: "ハンマートーン（フラットバー）" },
      { label: "素材", value: "鉄" },
      { label: "仕上げ", value: "錆止め吹付塗装 + 2液型ウレタン艶消し黒塗装 銀古美" },
      { label: "カラー", value: "マットブラック銀古美" },
      { label: "サイズ", value: "D67×H60mm / ブラケット座金 φ45mm" },
      { label: "標準長さ", value: "〜1500mm（最大5000mm）" },
      { label: "付属品", value: "取付用ビス M4×40mm・タッチアップ剤" },
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
    galleryIds: [
      "2a64ecfb5e50e78cb374.jpg",
      "280ac83ba03d4887b590.jpg",
      "dd3b4b75d5ceff116576.jpg",
      "d52a1c1f2c6fee21fd38.jpg",
      "cadc12f52f3178ea924c.jpg",
      "df4ae48e21ad60902b5e.jpg",
      "85a177c8681d11dd9a16.jpg",
      "937ce4a7008303169588.jpg",
      "4598534967607fa9e0a8.jpg",
      "99c87b680151b1f26ee3.jpg",
      "c01bfe8000eec5a77fb2.jpg",
      "2c673b389c3fff616efe.jpg",
      "0670bf8567bab54a9070.jpg",
      "0e12b14b7359cba75998.jpg",
      "2dc6bdc5b54a2459afcf.jpg",
      "d94cdf5906ac4b2c88b6.jpg",
      "485002d62590ff25c0a5.jpg",
      "6506add352342f3f6630.jpg",
      "85f0a672129766a6745a.jpg",
      "763e0743ed11d99ed565.jpg",
      "1791ac922b445c7d33ef.jpg",
    ],
  },
  scroll19: {
    slug: "scroll19",
    nameEn: "Scroll 19φ",
    nameJaShort: "スクロール",
    breadcrumbCategory: "ロートアイアン ・ 縦型",
    subtitle: "ロートアイアン ・ 縦型 19φ",
    shortDescription: "無垢鉄 19φ 70cm固定 ミツロウ仕上げ",
    longDescription:
      "くるっとした形がおしゃれな縦型のロートアイアン手すりです。\n\n魔法のステッキのような可愛らしい見た目とは裏腹に、無垢鉄を火造り鍛造した本格的な作りの逸品。鉄の工芸家が一つひとつ手仕事で丹念に、情熱をもって作り上げております。手すり全体を打ち残しなくハンマーで叩き、美しく鎚目の付けられた鉄は素材としても強さが増し、握り心地が良く、温かみも感じる仕上がりとなっております。\n\nこちらの手すりの太さは【19φ（直径 19mm）】です。約 2kg でズシッと安心感のある作り。細めの 16φ の手すりとの比較や寸法詳細は画像にてご確認ください。\n\n下側のエンド部分は少し細くすることで、野暮ったい印象にならないよう仕上げています。写真で見ただけでは尖って危なく感じる方もおられるかもしれませんが、先端は丸く危険のないように仕上げ、少し壁に向かわせるようにしております。\n\n● くるっとした部分は【右向き・左向き】をご指定いただけます。\n\n● 表面の仕上げ処理は『蜜蝋仕上げ』です。\n蜂の巣から取れるミツロウを、熱した状態の鉄の表面に溶かし付け（焦がし付ける感じ）表面をコーティングしています。触った感触は塗装のものと比べてしっとりとした感触です（ベタついてはおりません）。\n\n【なぜ塗装ではないのか？】\n塗装は錆への対策や仕上がりの均一性などの観点では、ミツロウなどの天然素材による仕上げに比べて優れていますが、どうしても表面は『塗料の色』になり、少し無機質な表情になりがちです。この手すりは、アナログな手仕事を経たからこそ生まれる鉄の美しい表情をできるだけ生かしてお届けしたい想いから、ミツロウで仕上げております。\n\nミツロウ仕上げの防錆についての補足ですが、（湿度の高くない）室内で一般的な使用方法であれば、完璧ではありませんが十分な錆止め効果はあります。雨風にさらされる屋外や、常に直射日光が当たるような場所での使用はおすすめできません。\n\n取り付けビスが付属します（ステンレス製タッピングビス M4-40 × 4本）。",
    specs: [
      { label: "タイプ", value: "丸棒 19φ（無垢鉄）" },
      { label: "素材", value: "鉄" },
      { label: "仕上げ", value: "ミツロウ仕上げ" },
      { label: "製法", value: "火造り鍛造（手打ち鎚目）" },
      { label: "サイズ", value: "高さ 70cm 固定" },
      { label: "太さ", value: "19φ（重量 約 2kg）" },
      { label: "向き", value: "右向き・左向き 選択可（同価格）" },
      { label: "付属品", value: "ステンレス製タッピングビス M4-40 × 4本" },
      { label: "用途", value: "湿度の高くない屋内推奨（屋外・直射日光は不可）" },
    ],
    featureBullets: FB_MITSUROU,
    galleryIds: [
      "25b6438ea6a9393aa027.jpg",
      "fea7217f211a29df0e43.jpg",
      "0630006139d111737e7f.jpg",
      "a0402280e722c61c0dac.jpg",
      "7a69f8c04cf83820f170.jpg",
      "72cc1204de1f906f4075.jpg",
      "574b95afacc17374375a.jpg",
      "4d4dc34b1b51fd30eb70.jpg",
      "aa5b679dda115b0ddee9.jpg",
      "256b36b5444128f66f08.jpg",
      "8c805aec99e3b311e474.jpg",
      "50e86f62c6b9f05a776d.jpg",
      "1bc22e0d2130416405e0.jpg",
      "6f83556eefb5d647d2cb.jpg",
      "090238db146b1a5180ad.jpg",
      "ba7e3b44939db78e2b35.jpg",
      "618446b3a5e6fd9b2a5f.jpg",
      "47f9040016e5f2cc557f.jpg",
      "10d3aed01aa4b4a2f1d4.jpg",
      "4362be679e07e50c5d13.jpg",
      "7d9b7f43e27f163222b8.jpg",
      "a2e4b6d304e92513c400.jpg",
      "97ff2ded4fc5a051967b.jpg",
      "f73450651247007e3587.jpg",
      "88809972ee40f40eacfc.jpg",
    ],
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
    galleryIds: [
      "d09c9426e8510d2ca152.jpg",
      "f5e4a548c19deb9bbe35.jpg",
      "8381204db770a9109122.jpg",
      "6dfd5989e8222e5138af.jpg",
      "ca8b4df4b8408ef15323.jpg",
      "fde6d8d112b7d8996f05.jpg",
      "2623eab0c5410dce2913.jpg",
      "9aa5c6f286516574b60e.jpg",
      "bbef460f0c0f88f6f063.jpg",
      "b3245c49ade95b655b95.jpg",
      "ad316c81378e66e6d765.jpg",
      "4fdd38afc44cc7ce9290.jpg",
      "efaf7bfc13d1a9de11be.jpg",
      "36cac164002d963cef46.jpg",
      "e09e9ca8d074b56a050f.jpg",
      "e4cb8039ce036474c610.jpg",
      "95540c11e3e2ec3b3210.jpg",
      "a4d2c033709a1dbc3f8d.jpg",
      "de13c9f89a76f626933a.jpg",
    ],
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
    galleryIds: [
      "66a699b295bcdb8f3598.jpg",
      "1a801d9390c7268ecf6b.jpg",
      "4516f01c990df9ba6c74.jpg",
      "bb63da1409f36068ff0a.jpg",
      "6d596b7f75c9af02a387.jpg",
      "af9e472a1b33a0cb509b.jpg",
      "587aaa4db087f6f90a38.jpg",
      "88b8ad5b989e4a346b95.jpg",
      "6a6bc52f849ae138c62e.jpg",
      "e36e3f21333cd34bd462.jpg",
      "89ff8d603abd3da872ba.jpg",
      "b477b98660ff30599f0a.jpg",
    ],
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
    galleryIds: [
      "569af3ee76a1999863e7.jpg",
      "0a410b0b8a054dc8d9a8.jpg",
      "597889a7c8c7c32e8fb5.jpg",
      "9c6387bdaeb9ba731456.jpg",
      "7d053bfd959b65d38040.jpg",
      "d6a16b30872381554056.jpg",
      "4e68f04540483ab72163.jpg",
      "fd89bcb0ced6f2f044c6.jpg",
      "bc9f7db825938714f35e.jpg",
      "c4b1dfbf03b516c872fd.jpg",
      "d52396b4a9a7bd98e286.jpg",
      "421380f1d97505988bee.jpg",
      "4ec369a02d819585f7d0.jpg",
      "32885ce3e0d0478adb50.jpg",
    ],
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
