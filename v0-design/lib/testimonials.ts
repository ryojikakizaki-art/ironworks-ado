// お客様の声データ
// 実際のお客様のレビューを追加していく

export interface Testimonial {
  id: number
  name: string
  location: string
  rating: number // 1-5
  text: string
  product: string
  variant: string
  avatar: string // 2文字のイニシャル
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "田中 美咲",
    location: "東京都",
    rating: 5,
    text: "新築の家に合わせて手摺をお願いしました。職人さんの技術力の高さに感動しました。毎日触れるたびに、温かみを感じます。家族みんなが気に入っています。",
    product: "シンプルストレート",
    variant: "マットブラック",
    avatar: "TM",
  },
  {
    id: 2,
    name: "佐藤 健一",
    location: "大阪府",
    rating: 5,
    text: "リフォームで取り付けていただきました。既存の雰囲気を壊さず、むしろ空間の質が上がりました。アフターフォローも丁寧で安心です。",
    product: "クラシックカーブ",
    variant: "アンティークブラウン",
    avatar: "SK",
  },
  {
    id: 3,
    name: "山本 設計事務所",
    location: "福岡県",
    rating: 5,
    text: "何度もお願いしています。細かい要望にも柔軟に対応いただけ、クライアントからの評判も上々です。信頼できるパートナーです。",
    product: "オーナメント",
    variant: "マットブラック",
    avatar: "YS",
  },
  {
    id: 4,
    name: "鈴木 幸子",
    location: "神奈川県",
    rating: 5,
    text: "両親の家の手摺を新調しました。握りやすさと美しさを両立していて、両親も大変喜んでいます。孫の代まで使える品質です。",
    product: "和モダン",
    variant: "黒皮鉄仕上げ",
    avatar: "SS",
  },
  {
    id: 5,
    name: "木村 大輔",
    location: "愛知県",
    rating: 5,
    text: "インスタで見て一目惚れしました。実物は写真以上に美しく、来客の度に褒められます。職人技の素晴らしさを実感しています。",
    product: "螺旋階段用",
    variant: "マットブラック",
    avatar: "KD",
  },
  {
    id: 6,
    name: "伊藤 真理",
    location: "北海道",
    rating: 4,
    text: "北海道まで丁寧に対応いただきました。寒冷地でも安心の品質で、冬でも冷たくなりすぎないのが嬉しいです。",
    product: "シンプルストレート",
    variant: "アンティークブラウン",
    avatar: "IM",
  },
]

export const OVERALL_RATING = 4.8
export const TOTAL_REVIEWS = 127
