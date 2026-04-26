// シンプル商品マスター（手すり以外の 17 商品）
// 寸法・座金計算等が不要な商品向けのシンプルなデータ構造
// 画像は /public/images/products/{slug}/ にローカル配置
//
// 価格 0 = 要見積もり（お問い合わせフォーム誘導）
// 価格 > 0 = Stripe 決済対応（追って Stripe 設定）

export interface SimpleProduct {
  slug: string
  nameEn: string
  nameJa: string
  category: string // breadcrumb 用カテゴリ名
  subtitle: string // サブタイトル（仕様要約）
  shortDescription: string // 1行キャッチ
  longDescription: string // 詳細説明
  specs: { label: string; value: string }[]
  /** 画像ファイル名（/public/images/products/{slug}/{filename} に配置） */
  images: string[]
  basePrice: number // 0 = 要見積もり
  badge?: string
  /** 旧 STORES URL（参考・移行期間中の補助リンク） */
  storesUrl?: string
}

export const SIMPLE_PRODUCTS: Record<string, SimpleProduct> = {
  elisabeth: {
    slug: "elisabeth",
    nameEn: "Élisabeth",
    nameJa: "エリザベート",
    category: "ロートアイアン手すり",
    subtitle: "鍛冶職人手打ち ロートアイアン 22φ",
    shortDescription: "鍛冶職人が一本ずつ火造りで仕上げた、ロートアイアンの装飾的な横型手すり",
    longDescription:
      "Élisabeth（エリザベート）は、鍛冶職人が炎の中で鉄を打って仕上げる、火造り鍛造のロートアイアン手すりです。22φ の無垢鉄を素材に、唐草文様風の装飾を一本一本手作業で打ち出しています。重厚感のある黒皮仕上げは経年で深みを増し、和洋問わず格調高い空間に馴染みます。サイズオーダー対応。",
    specs: [
      { label: "素材", value: "無垢鉄 22φ" },
      { label: "仕上げ", value: "黒皮 / 焼付塗装（オプション）" },
      { label: "製法", value: "火造り鍛造（手打ち）" },
      { label: "形状", value: "横型・装飾付き" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg", "4.jpg"],
    basePrice: 149000,
    badge: "Artisan",
    storesUrl: "https://ironworks-ado.stores.jp/items/63ea2bfd34e01709f8fa4ac9",
  },
  clemence: {
    slug: "clemence",
    nameEn: "Clémence",
    nameJa: "クレマンス",
    category: "ロートアイアン手すり",
    subtitle: "L型 22φ 無垢鉄",
    shortDescription: "コーナーや階段の曲がり角にも対応する L 字型ロートアイアン手すり",
    longDescription:
      "Clémence（クレマンス）は、L 字型に成形したロートアイアン手すりです。コーナーや階段の踊り場など、直線では納まらない場所に最適。22φ の無垢鉄を鍛冶職人が手作業で曲げ加工しています。",
    specs: [
      { label: "素材", value: "無垢鉄 22φ" },
      { label: "仕上げ", value: "黒皮 / 焼付塗装" },
      { label: "形状", value: "L 字型" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 88000,
    storesUrl: "https://ironworks-ado.stores.jp/items/68f839882fa52af95b4e403e",
  },
  "simple-black": {
    slug: "simple-black",
    nameEn: "Simple",
    nameJa: "シンプル ブラック",
    category: "アプローチ手すり",
    subtitle: "フラットバー マットブラック",
    shortDescription: "玄関アプローチ用のフラットバー手すり（マットブラック）",
    longDescription:
      "玄関ポーチや屋外アプローチ向けの、フラットバー製のシンプルな手すりです。耐候性の高い焼付塗装でマットブラックに仕上げ、雨ざらしでも美しさが長持ち。サイズ・本数に応じてオーダーメイドで製作します。",
    specs: [
      { label: "素材", value: "鋼鉄フラットバー" },
      { label: "仕上げ", value: "焼付塗装 マットブラック" },
      { label: "想定設置場所", value: "屋外アプローチ・ポーチ" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 0,
    storesUrl: "https://ironworks-ado.stores.jp/items/678f8682c6500803fc924386",
  },
  "simple-white": {
    slug: "simple-white",
    nameEn: "Simple",
    nameJa: "シンプル ホワイト",
    category: "アプローチ手すり",
    subtitle: "フラットバー マットホワイト",
    shortDescription: "玄関アプローチ用のフラットバー手すり（マットホワイト）",
    longDescription:
      "Simple ブラックと同じフラットバー手すりのホワイト版。明るい外壁と相性のよいマットホワイト塗装で、上品な印象を与えます。屋外耐候焼付塗装。",
    specs: [
      { label: "素材", value: "鋼鉄フラットバー" },
      { label: "仕上げ", value: "焼付塗装 マットホワイト" },
      { label: "想定設置場所", value: "屋外アプローチ・ポーチ" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 0,
    storesUrl: "https://ironworks-ado.stores.jp/items/64585625559798002e8072e2",
  },
  tsuta: {
    slug: "tsuta",
    nameEn: "Tsuta",
    nameJa: "蔦",
    category: "アプローチ手すり",
    subtitle: "アートアイアン 亜鉛メッキ",
    shortDescription: "蔦の意匠を施したアートアイアン手すり（亜鉛メッキ仕上げ）",
    longDescription:
      "アプローチ手すり『蔦』は、蔦のしなやかな曲線をモチーフにしたアートアイアン手すりです。屋外耐候性の高い溶融亜鉛メッキを施しており、長年メンテナンスフリーで使用できます。鍛冶職人の手仕事による一点物の表情。",
    specs: [
      { label: "素材", value: "鋼鉄" },
      { label: "仕上げ", value: "溶融亜鉛メッキ" },
      { label: "意匠", value: "蔦モチーフ・手作業" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 132000,
    badge: "Artisan",
    storesUrl: "https://ironworks-ado.stores.jp/items/64584887edfbca00302b343f",
  },
  "fence-fukinuke": {
    slug: "fence-fukinuke",
    nameEn: "Atrium Fence",
    nameJa: "吹き抜けフェンス",
    category: "アイアンフェンス",
    subtitle: "オーダーメイド",
    shortDescription: "吹き抜け空間に映えるオーダーメイドのアイアンフェンス",
    longDescription:
      "リビング吹き抜けや階段ホールに設置するアイアンフェンスです。空間のアクセントとなる繊細なデザインから重厚な格子状まで、お住まいに合わせてオーダーメイドで製作します。",
    specs: [
      { label: "素材", value: "鋼鉄" },
      { label: "仕上げ", value: "焼付塗装" },
      { label: "対応", value: "完全オーダーメイド" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 0,
    storesUrl: "https://ironworks-ado.stores.jp/items/63eaf4431c151869487fdc83",
  },
  "fence-zigzag": {
    slug: "fence-zigzag",
    nameEn: "Zigzag Fence",
    nameJa: "屋外フェンス zigzag",
    category: "アイアンフェンス",
    subtitle: "外構 オーダーメイド",
    shortDescription: "ジグザグデザインの屋外用アイアンフェンス",
    longDescription:
      "外構・敷地境界用のアイアンフェンスです。ジグザグ柄のデザインで、目隠し性とデザイン性を両立。サイズ・パターンともにオーダーメイド対応。",
    specs: [
      { label: "素材", value: "鋼鉄" },
      { label: "仕上げ", value: "焼付塗装 / 亜鉛メッキ" },
      { label: "用途", value: "外構・境界フェンス" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 0,
    storesUrl: "https://ironworks-ado.stores.jp/items/645882ac32510f002d97ec96",
  },
  mengoshi: {
    slug: "mengoshi",
    nameEn: "Window Grille",
    nameJa: "面格子",
    category: "ロートアイアン面格子",
    subtitle: "窓 防犯 後付け",
    shortDescription: "窓に取り付ける防犯・装飾兼用のアイアン面格子",
    longDescription:
      "窓の外側に取り付ける面格子です。防犯性能と装飾性を兼ね備え、シンプルなものから装飾的なロートアイアンまで対応。既存窓への後付けも可能です。",
    specs: [
      { label: "素材", value: "鋼鉄" },
      { label: "仕上げ", value: "焼付塗装" },
      { label: "用途", value: "窓 防犯・装飾" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 0,
    storesUrl: "https://ironworks-ado.stores.jp/items/67959f99ce75b203a869f649",
  },
  "barn-door": {
    slug: "barn-door",
    nameEn: "Barn Door",
    nameJa: "バーンドア",
    category: "アイアンドア",
    subtitle: "室内スライドドア マットブラック",
    shortDescription: "室内空間を演出するスライド式バーンドア（マットブラック）",
    longDescription:
      "室内用のスライド式バーンドアです。アイアンフレームに木材やガラスを組み合わせ、モダン〜ヴィンテージ調の空間を演出します。レール・金具一式付属、サイズオーダー可能。",
    specs: [
      { label: "素材", value: "鋼鉄フレーム + 木材/ガラス" },
      { label: "仕上げ", value: "マットブラック焼付塗装" },
      { label: "形式", value: "スライド式（レール・金具付属）" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 275000,
    storesUrl: "https://ironworks-ado.stores.jp/items/689dc80a62bb05fe83b69ed0",
  },
  arabesque: {
    slug: "arabesque",
    nameEn: "Arabesque Gate",
    nameJa: "アラベスク ゲート",
    category: "ロートアイアンドア",
    subtitle: "室内扉 マットブラック",
    shortDescription: "唐草文様のロートアイアン室内扉（マットブラック）",
    longDescription:
      "アラベスク（唐草文様）を施したロートアイアン製の室内扉です。鍛冶職人が一本一本手打ちした唐草の流麗な曲線が、空間の主役になります。",
    specs: [
      { label: "素材", value: "無垢鉄" },
      { label: "仕上げ", value: "マットブラック焼付塗装" },
      { label: "意匠", value: "アラベスク（唐草）手打ち" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 253000,
    badge: "Artisan",
    storesUrl: "https://ironworks-ado.stores.jp/items/67bd6f532a10e40a2e61cc20",
  },
  "dog-gate": {
    slug: "dog-gate",
    nameEn: "Dog Gate",
    nameJa: "ドッグゲート",
    category: "ペット用品",
    subtitle: "H95 × W70〜80cm",
    shortDescription: "アイアンフレームのペット用ゲート（高さ 95cm）",
    longDescription:
      "ペットの飛び出し防止用のドッグゲートです。アイアンフレームでしっかり強度を保ちつつ、デザイン性も両立。リビング・廊下の入口設置を想定。サイズオーダー対応。",
    specs: [
      { label: "素材", value: "鋼鉄" },
      { label: "仕上げ", value: "焼付塗装" },
      { label: "標準寸法", value: "H95 × W70〜80cm" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 130000,
    storesUrl: "https://ironworks-ado.stores.jp/items/645a32986ebf640035c692b3",
  },
  "stair-straight": {
    slug: "stair-straight",
    nameEn: "Straight Stair",
    nameJa: "スケルトン階段 直線",
    category: "スケルトン階段",
    subtitle: "オーダーメイド",
    shortDescription: "鉄骨スケルトンの直線型オーダー階段",
    longDescription:
      "スケルトン構造の鉄骨階段（直線型）です。骨格をすっきり見せるデザインで、空間に開放感を生み出します。蹴上・段板・手摺りまで一貫してオーダーメイド製作。",
    specs: [
      { label: "構造", value: "鉄骨スケルトン" },
      { label: "形状", value: "直線型" },
      { label: "対応", value: "完全オーダーメイド" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 0,
    storesUrl: "https://ironworks-ado.stores.jp/items/6458a2646e44950030b06a70",
  },
  "stair-spiral": {
    slug: "stair-spiral",
    nameEn: "Spiral Stair",
    nameJa: "スケルトン階段 廻り",
    category: "スケルトン階段",
    subtitle: "力桁1本型 オーダーメイド",
    shortDescription: "力桁1本型の廻り階段（スケルトン構造）",
    longDescription:
      "力桁1本型でデザインされた、廻り階段（スパイラル風の踏面構成）です。中央の鉄骨力桁に段板を片持ちで取り付け、視覚的な軽やかさを実現します。",
    specs: [
      { label: "構造", value: "力桁1本型 鉄骨スケルトン" },
      { label: "形状", value: "廻り（スパイラル）" },
      { label: "対応", value: "完全オーダーメイド" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 1400000,
    badge: "Artisan",
    storesUrl: "https://ironworks-ado.stores.jp/items/645b965813edcc003101fec5",
  },
  "stair-outdoor": {
    slug: "stair-outdoor",
    nameEn: "Outdoor Stair",
    nameJa: "鉄骨外階段 かね折れ",
    category: "鉄骨外階段",
    subtitle: "外階段 オーダーメイド",
    shortDescription: "屋外用かね折れ型の鉄骨外階段",
    longDescription:
      "屋外用の鉄骨外階段（かね折れ型）です。耐候焼付塗装または溶融亜鉛メッキで仕上げ、長期メンテナンスフリーを実現。住宅・店舗・工場いずれにも対応可能。",
    specs: [
      { label: "構造", value: "鉄骨" },
      { label: "形状", value: "かね折れ型（L 字）" },
      { label: "仕上げ", value: "焼付塗装 / 溶融亜鉛メッキ" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 0,
    storesUrl: "https://ironworks-ado.stores.jp/items/6460dfe3418fdf00312349c1",
  },
  partition: {
    slug: "partition",
    nameEn: "Partition",
    nameJa: "パーテーション",
    category: "インテリア",
    subtitle: "アイアンフレーム アクリルパネル",
    shortDescription: "アイアンフレーム + アクリルパネルの空間仕切り",
    longDescription:
      "アイアンフレームに半透明アクリルパネルを組み合わせたパーテーションです。光を通しながら空間を緩やかに区切り、オフィスや住宅の間仕切りに最適。サイズオーダー対応。",
    specs: [
      { label: "フレーム素材", value: "鋼鉄" },
      { label: "パネル素材", value: "アクリル" },
      { label: "仕上げ", value: "マットブラック焼付塗装" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 0,
    storesUrl: "https://ironworks-ado.stores.jp/items/645b851613edcc002b021dc9",
  },
  "table-leg": {
    slug: "table-leg",
    nameEn: "Table Leg",
    nameJa: "横揺れしないテーブル脚",
    category: "家具",
    subtitle: "アイアンレッグ サイズオーダー",
    shortDescription: "横揺れしない構造のアイアンテーブル脚（サイズオーダー）",
    longDescription:
      "横揺れに強い構造を追求したアイアン製テーブル脚です。デスク・ダイニング・ワークベンチ等、用途に合わせてサイズオーダー。天板はお手持ちの木材を組み合わせ可能。",
    specs: [
      { label: "素材", value: "鋼鉄" },
      { label: "仕上げ", value: "マットブラック焼付塗装" },
      { label: "対応サイズ", value: "完全オーダーメイド" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 0,
    storesUrl: "https://ironworks-ado.stores.jp/items/64cc5d6bf55a3000329bb450",
  },
  "iron-rack": {
    slug: "iron-rack",
    nameEn: "Iron Rack",
    nameJa: "アイアンラック",
    category: "家具・インテリア",
    subtitle: "アイアンシェルフ 棚 什器",
    shortDescription: "オーダー可能なアイアンラック・シェルフ",
    longDescription:
      "店舗什器・住宅収納のためのアイアンラックです。サイズ・段数・天板素材を組み合わせ、用途に応じた最適な形状で製作します。",
    specs: [
      { label: "素材", value: "鋼鉄" },
      { label: "仕上げ", value: "マットブラック焼付塗装" },
      { label: "対応", value: "サイズ・段数オーダーメイド" },
    ],
    images: ["1.jpg", "2.jpg", "3.jpg"],
    basePrice: 0,
    storesUrl: "https://ironworks-ado.stores.jp/items/64be2861d397ae002db004cd",
  },
}

export function getSimpleProduct(slug: string): SimpleProduct | null {
  return SIMPLE_PRODUCTS[slug] ?? null
}

export const SIMPLE_PRODUCT_SLUGS = Object.keys(SIMPLE_PRODUCTS)
