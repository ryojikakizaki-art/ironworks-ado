// お客様の声データ
// 2026-07-02: 画像スライド(voices-1〜7.jpg)からテキストへ書き起こし(タスク5-4)。
// 原文の書き起こしのため quote の文言は改変しない（highlight は表示強調のみで本文は不変）。
// avatar は元画像内の人物イラストを切り出したもの(avatar-1〜16.jpg)。
// 元画像はアーカイブとして public/images/voices に保管。

export interface VoiceSlide {
  id: number
  src: string
  alt: string
  regions: string[] // そのスライドに掲載されているお客様の地域
}

// アーカイブ用（元画像との照合用に保持。UI表示には使用しない）
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

export interface ReviewQuote {
  id: number
  prefecture: string
  quote: string // 原文どおり
  avatar: string // 元画像から切り出した人物イラスト
  highlight?: string[] // 吹き出し内でマーカー強調する要点（quote 内の部分文字列）
  featured?: boolean // トップページに抜粋表示するか
  photo?: string // 元画像から切り出した施工後写真（あれば）
}

export const REVIEW_QUOTES: ReviewQuote[] = [
  {
    id: 1,
    prefecture: "兵庫県",
    quote: "丁寧な回答、ありがとうございます。",
    avatar: "/images/voices/avatar-1.jpg",
    highlight: ["丁寧な回答"],
  },
  {
    id: 2,
    prefecture: "広島県",
    quote:
      "昨日無事に、手すりが届きました。ありがとうございました。早速、玄関に設置いたしました。近くのスイッチ等ともマッチして、すごくよい感じになっております！大切に使わせていただきます。",
    avatar: "/images/voices/avatar-2.jpg",
    highlight: ["すごくよい感じになっております"],
    photo: "/images/voices/review-photo-hiroshima.jpg",
  },
  {
    id: 3,
    prefecture: "東京都",
    quote: "やっと空間のノイズにならない手すりが見つかった！そんな感じです。",
    avatar: "/images/voices/avatar-3.jpg",
    highlight: ["空間のノイズにならない手すり"],
    featured: true,
  },
  {
    id: 4,
    prefecture: "神奈川県",
    quote:
      "玄関の顔のひとつにもなり、もしかしたら何十年と私共を支えてくれる手すりですので、妥協せずに探しておりました。細かい質問にもしっかりとご回答いただけた上、誠実なお言葉を頂戴し、信頼できる方へ依頼することができたと大変嬉しく思っております。引き続き、宜しくお願いいたします。",
    avatar: "/images/voices/avatar-4.jpg",
    highlight: ["信頼できる方へ依頼することができた"],
    featured: true,
  },
  {
    id: 5,
    prefecture: "神奈川県",
    quote:
      "先ほど返信した後に改めてHPを拝見しました。魅力的な作品の数々やご経歴、お人柄を知り、素晴らしい方に依頼したのだなと感動しておりました。新居へ引っ越したら来客がある度に自慢させていただきますね。",
    avatar: "/images/voices/avatar-5.jpg",
    highlight: ["来客がある度に自慢させていただきます"],
  },
  {
    id: 6,
    prefecture: "東京都",
    quote: "ご丁寧にご案内いただきありがとうございます。",
    avatar: "/images/voices/avatar-6.jpg",
  },
  {
    id: 7,
    prefecture: "兵庫県",
    quote: "早々の返信と提案ありがとうございました。",
    avatar: "/images/voices/avatar-7.jpg",
  },
  {
    id: 8,
    prefecture: "茨城県",
    quote:
      "図面ありがとうございます！とてもわかりやすいです。L字に溶接可能とのこと、良かったです。手すり、取り付けましたが、とてもいい感じです。介護施設感をだしたくなかったので、質感、形ともすっきりしていて、母も喜んでいます。どうもありがとうございました！",
    avatar: "/images/voices/avatar-8.jpg",
    highlight: ["質感、形ともすっきりしていて、母も喜んでいます"],
    featured: true,
    photo: "/images/voices/review-photo-ibaraki.jpg",
  },
  {
    id: 9,
    prefecture: "栃木県",
    quote: "急なお願いでしたのに、ありがとうございました。また、ご丁寧なお返事ありがとうございます。",
    avatar: "/images/voices/avatar-9.jpg",
  },
  {
    id: 10,
    prefecture: "福岡県",
    quote:
      "嬉しいです。気に入ってたので良かったです。造られる工程からみました。私には少し贅沢に思ましたが、他をいくら探してもこれ以外に気にいる物がなく、たまたま気になる真っ直ぐな手摺りもよく見ると御社の作品でした（笑）。手摺りですが玄関オブジェのつもりで依頼しました。素敵な感じです。",
    avatar: "/images/voices/avatar-10.jpg",
    highlight: ["他をいくら探してもこれ以外に気にいる物がなく"],
  },
  {
    id: 11,
    prefecture: "大阪府",
    quote: "イメージどおりで嬉しいです。",
    avatar: "/images/voices/avatar-11.jpg",
    highlight: ["イメージどおり"],
  },
  {
    id: 12,
    prefecture: "静岡県",
    quote: "お世話になっております。丁寧に対応してくださり、ありがとうございます。",
    avatar: "/images/voices/avatar-12.jpg",
  },
  {
    id: 13,
    prefecture: "京都府",
    quote:
      "ご相談の段階からとてもご丁寧にアドバイスを頂き、大満足の仕上がりになりました。来客の目にも止まるようで、必ず何かしらコメントがあります。本当にありがとうございました。",
    avatar: "/images/voices/avatar-13.jpg",
    highlight: ["大満足の仕上がり", "必ず何かしらコメントがあります"],
    featured: true,
    photo: "/images/voices/review-photo-kyoto.jpg",
  },
  {
    id: 14,
    prefecture: "東京都",
    quote: "早速、お見積りを送ってくださりどうもありがとうございます。また、確認や注意点も分かりやすく教えてくださりとても助かります。",
    avatar: "/images/voices/avatar-14.jpg",
    highlight: ["確認や注意点も分かりやすく"],
  },
  {
    id: 15,
    prefecture: "兵庫県",
    quote:
      "素敵な手すりありがとうございました。まだ、クロスの張り替えが終わっていないので、設置しておりませんが、予想とおりの出来上がりになると思います。この度は本当に色々ありがとうございました。",
    avatar: "/images/voices/avatar-15.jpg",
    highlight: ["予想とおりの出来上がり"],
  },
  {
    id: 16,
    prefecture: "長崎県",
    quote: "お世話になっております。度々の丁寧なご対応ありがとうございます。",
    avatar: "/images/voices/avatar-16.jpg",
  },
]

export const TOTAL_VOICE_COUNT = REVIEW_QUOTES.length
