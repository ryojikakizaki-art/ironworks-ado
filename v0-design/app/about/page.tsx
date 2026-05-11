import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { ArrowRight, Mail, MessageSquare, MapPin } from "lucide-react"

export const metadata = {
  title: "About｜鍛冶職人が手作りするアイアン手すりの工房｜IRONWORKS ado",
  description:
    "鍛鉄工房ZEST 内で、鍛冶職人が火造り鍛造で一本ずつ仕上げるアイアン手すり・インテリアの工房。",
  alternates: { canonical: "/about" },
}

const numbers = [
  { value: "30+", unit: "種", label: "商品ラインナップ", note: "手すり・フェンス・家具・小物" },
  { value: "47", unit: "都道府県", label: "全国配送対応", note: "施工は千葉＋関東 4 都県" },
  { value: "千葉", unit: "市", label: "工房拠点", note: "鍛鉄工房ZEST 内に併設" },
]

type ProcessMedia = { type: "image"; src: string } | { type: "video"; src: string }

const processSteps: {
  chapter: string
  eyebrow: string
  title: string
  body: string
  media: ProcessMedia
}[] = [
  {
    chapter: "01",
    eyebrow: "Forging",
    title: "火造り・鍛造",
    body: "炉で 1000℃ 以上に熱した無垢鉄を、まだ赤いうちにハンマーで叩いて成形します。曲げ・捻り・延ばしを繰り返し、目指す形を生み出します。鉄は叩くことで内部組織が締まり、より強く・粘り強くなります。",
    media: { type: "video", src: "/videos/about-forging.mp4" },
  },
  {
    chapter: "02",
    eyebrow: "Finishing",
    title: "塗装・仕上げ",
    body: "錆止め下地に 2 液型ウレタン艶消し黒を吹き付け、必要に応じて古美・銀古美仕上げを重ねます。屋外設置品は溶融亜鉛メッキで二重防錆を採用しています。",
    media: { type: "video", src: "/videos/about-painting.mp4" },
  },
  {
    chapter: "03",
    eyebrow: "Polishing",
    title: "水研ぎ",
    body: "塗装後に紙やすりで丁寧に水研ぎして表面を整えます。塗膜の仕上がり・耐久性を左右する地味で大切な工程です。",
    media: { type: "video", src: "/videos/about-sanding.mp4" },
  },
]

const voiceCards: { quote: string; region: string }[] = [
  {
    quote:
      "玄関の顔のひとつにもなり、もしかしたら何十年と私共を支えてくれる手すりですので、妥協せずに探しておりました。細かい質問にもしっかりとご回答いただけた上、誠実なお言葉を頂戴し、信頼できる方へ依頼することができたと大変嬉しく思っております。",
    region: "神奈川県のお客様",
  },
  {
    quote: "やっと空間のノイズにならない手すりが見つかった！ そんな感じです。",
    region: "東京都のお客様",
  },
  {
    quote:
      "魅力的な作品の数々やご経歴、お人柄を知り、素晴らしい方に依頼したのだなと感動しておりました。新居へ引っ越したら来客がある度に自慢させていただきますね。",
    region: "神奈川県のお客様",
  },
  {
    quote:
      "介護施設感をだしたくなかったので、質感、形ともすっきりしていて、母も喜んでいます。どうもありがとうございました！",
    region: "茨城県のお客様",
  },
  {
    quote:
      "他をいくら探してもこれ以外に気にいる物がなく、たまたま気になる真っ直ぐな手摺りもよく見ると御社の作品でした（笑）。手摺りですが玄関オブジェのつもりで依頼しました。素敵な感じです。",
    region: "福岡県のお客様",
  },
  {
    quote:
      "ご相談の段階からとてもご丁寧にアドバイスを頂き、大満足の仕上がりになりました。来客の目にも止まるようで、必ず何かしらコメントがあります。",
    region: "京都府のお客様",
  },
]

const galleryImages = [
  { src: "/images/hero/dscf6699.jpg", alt: "鍛造ハンマー痕の手すり" },
  { src: "/images/hero/1140304.jpg", alt: "鉄骨階段とシャンデリア" },
  { src: "/images/hero/dscf1995.jpg", alt: "吹き抜けの縦格子フェンス" },
  { src: "/images/products/elisabeth/01.jpg", alt: "Élisabeth 階段全景" },
  { src: "/images/hero/dscf6234.jpg", alt: "白丸棒のシンプル手すり" },
  { src: "/images/products/elisabeth/05.jpg", alt: "Élisabeth 終端の渦巻き装飾" },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-background">
        {/* ── HERO（C アシメ型）──
            左 60% に映像 / 右 40% にテキストを「並べる」エディトリアル構成。
            オーバーレイ型と差別化し、ヒーロー直下から雑誌的なリズムを始める。 */}
        <section className="relative">
          <div className="grid lg:grid-cols-[60fr_40fr] min-h-[88vh]">
            {/* 左: 映像（モバイルでは先に上に出る） */}
            <div className="relative h-[55vh] min-h-[420px] lg:h-auto lg:min-h-[88vh] overflow-hidden order-1">
              <video
                src="/videos/hero-reel.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                aria-hidden
              />
              {/* 上部薄幕でヘッダー視認性 */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 via-black/15 to-transparent" />
            </div>

            {/* 右: テキストパネル */}
            <div className="order-2 flex flex-col justify-center px-6 lg:px-14 py-16 lg:py-0">
              <div className="max-w-md">
                <p className="text-[10px] sm:text-[11px] tracking-[0.5em] uppercase text-gold mb-6 lg:mb-8">
                  About
                </p>
                <h1 className="font-serif text-foreground text-[32px] md:text-[44px] lg:text-[52px] font-light leading-[1.25] tracking-tight mb-8 lg:mb-10">
                  鉄を、<br />火で、<br />手で。
                </h1>
                <p className="text-[14px] md:text-[15px] leading-[2.1] text-foreground/75">
                  鍛冶工房から、一本ずつ手仕事で生まれるアイアン製品をお届けしています。
                </p>
                <div className="mt-12 flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-foreground/45">
                  <span className="w-10 h-px bg-foreground/30" />
                  <span>IRONWORKS ado</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 01. PROLOGUE（マガジン章立て）── */}
        <section className="px-6 py-28 lg:py-40">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid lg:grid-cols-[200px_1fr] gap-10 lg:gap-20">
              <div>
                <p className="font-serif text-[14px] tracking-[0.4em] text-gold mb-2">Chapter</p>
                <p className="font-serif text-[64px] lg:text-[80px] text-foreground/15 leading-none">01</p>
              </div>
              <div className="max-w-[640px]">
                <h2 className="font-serif text-[24px] md:text-[32px] leading-[1.5] text-foreground mb-10 font-light">
                  ようこそ、IRONWORKS ado へ
                </h2>
                <div className="space-y-6 text-[15px] leading-[2.2] text-foreground/80">
                  <p>
                    IRONWORKS ado（アイアンワークス・アド）は、鍛冶工房から生まれたアイアン製品のオンラインショップです。母体は本格ロートアイアンを手がける <strong className="font-medium text-foreground">鍛鉄工房ZEST</strong>。職人がフルオーダーで培ってきた西洋鍛冶の技術と意匠を、ご家庭でも取り入れやすいかたちにお仕立てし、お届けしています。
                  </p>
                  <p>
                    手すり・階段・フェンス・家具・小物まで、暮らしのなかで毎日触れるアイアンを、一本ずつ手仕事で作る。そんな当たり前のものづくりを、今もまっすぐに続けています。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── マガジン: フルブリード写真 + 余白キャプション ── */}
        <section className="relative">
          <div className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
            <Image
              src="/images/about/craftsman-hands.jpg"
              alt="鍛冶職人 蠣﨑良治の手"
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          <div className="px-6 py-10 lg:py-14 bg-background border-b border-border">
            <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-4 lg:gap-12 items-start">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold lg:w-32 shrink-0">Caption</p>
              <p className="text-[13px] md:text-[14px] leading-[2] text-foreground/70 max-w-2xl">
                鍛冶職人 ・ 蠣﨑 良治（かきざき りょうじ）。鉄を熱して叩き、人の手で形を起こす西洋鍛冶（フォージング）の作り手。
              </p>
            </div>
          </div>
        </section>

        {/* ── 02. CRAFTSMAN（マガジン: pull-quote + sparse text）── */}
        <section className="px-6 py-28 lg:py-40">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid lg:grid-cols-[200px_1fr] gap-10 lg:gap-20">
              <div>
                <p className="font-serif text-[14px] tracking-[0.4em] text-gold mb-2">Chapter</p>
                <p className="font-serif text-[64px] lg:text-[80px] text-foreground/15 leading-none">02</p>
              </div>
              <div className="max-w-[640px]">
                <h2 className="font-serif text-[24px] md:text-[32px] leading-[1.5] text-foreground mb-12 font-light">
                  火と鉄に、<br className="md:hidden" />向き合いつづける。
                </h2>

                {/* Pull-quote */}
                <blockquote className="border-l-2 border-gold pl-6 mb-12">
                  <p className="font-serif text-[18px] md:text-[22px] leading-[1.7] text-foreground/80 italic">
                    「住まいのなかで毎日触れる金物だからこそ、握ったときに手がよろこぶものを作りたい」
                  </p>
                </blockquote>

                <div className="space-y-6 text-[15px] leading-[2.2] text-foreground/80">
                  <p>
                    代表の蠣﨑良治は、千葉市を拠点に火造り鍛造の手仕事を続けてきました。日本では馴染みの薄い <strong className="font-medium text-foreground">西洋鍛冶（フォージング）</strong> は、熱した鉄をハンマーで叩き、引き伸ばし、ねじり、丸めて造形する技法。鋳型で量産する製品とはまったく違い、一本一本が「打ち手の物語」を持つ仕上がりになります。
                  </p>
                  <p>
                    工房を構えてから今日まで変わらない、ものづくりの原点です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 03. WORKSHOP（ZEST × ado）── */}
        <section className="bg-[#faf8f4] px-6 py-28 lg:py-40">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid lg:grid-cols-[200px_1fr] gap-10 lg:gap-20 mb-16">
              <div>
                <p className="font-serif text-[14px] tracking-[0.4em] text-gold mb-2">Chapter</p>
                <p className="font-serif text-[64px] lg:text-[80px] text-foreground/15 leading-none">03</p>
              </div>
              <div className="max-w-[640px]">
                <h2 className="font-serif text-[24px] md:text-[32px] leading-[1.5] text-foreground mb-8 font-light">
                  同じ工房から、<br className="md:hidden" />二つのかたちで。
                </h2>
                <p className="text-[14px] md:text-[15px] leading-[2.1] text-foreground/75">
                  鍛鉄工房ZEST のフルオーダーで磨いた技術を、ado ではご家庭サイズに整えてお届け。手仕事の品質は、ふたつのブランドで一切変わりません。
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <a
                href="https://tantetuzest.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group block border border-border bg-background p-10 lg:p-12 hover:border-gold/50 transition-all"
              >
                <p className="text-[10px] tracking-[0.4em] uppercase text-foreground/50 mb-3">Brand 01 / Full Order</p>
                <h3 className="font-serif text-[24px] md:text-[28px] text-foreground mb-8 group-hover:text-gold transition-colors leading-tight">
                  鍛鉄工房ZEST
                </h3>
                <ul className="space-y-3 text-[13px] text-foreground/80 leading-[1.95]">
                  <li>― 建築家・設計事務所・工務店との協業実績</li>
                  <li>― 図面ご相談からの完全フルオーダー</li>
                  <li>― 本格ロートアイアン・装飾門扉・大型階段</li>
                </ul>
                <p className="mt-10 text-[11px] tracking-[0.2em] uppercase text-foreground/45 group-hover:text-gold transition-colors inline-flex items-center gap-2">
                  tantetuzest.com <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                </p>
              </a>
              <div className="border border-gold bg-background p-10 lg:p-12 relative">
                <span className="absolute -top-3 right-6 bg-gold text-white text-[9px] tracking-[0.2em] uppercase px-3 py-1">
                  This Site
                </span>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">Brand 02 / Semi Order</p>
                <h3 className="font-serif text-[24px] md:text-[28px] text-foreground mb-8 leading-tight">
                  IRONWORKS ado
                </h3>
                <ul className="space-y-3 text-[13px] text-foreground/80 leading-[1.95]">
                  <li>― 個人・法人どちらにもオンライン販売</li>
                  <li>― 定形デザインを長さ・色・取付方法でセミオーダー</li>
                  <li>― クレジット決済・銀行振込対応／全国配送</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── 04. PROCESS（マガジン 3up・大きめ動画）── */}
        <section className="px-6 py-28 lg:py-40">
          <div className="max-w-[1300px] mx-auto">
            <div className="grid lg:grid-cols-[200px_1fr] gap-10 lg:gap-20 mb-20">
              <div>
                <p className="font-serif text-[14px] tracking-[0.4em] text-gold mb-2">Chapter</p>
                <p className="font-serif text-[64px] lg:text-[80px] text-foreground/15 leading-none">04</p>
              </div>
              <div className="max-w-[640px]">
                <h2 className="font-serif text-[24px] md:text-[32px] leading-[1.5] text-foreground mb-8 font-light">
                  ものづくりの工程
                </h2>
                <p className="text-[14px] md:text-[15px] leading-[2.1] text-foreground/75">
                  火造りから仕上げまで、すべての工程を工房内で一貫して行っています。
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {processSteps.map((step) => (
                <div key={step.title}>
                  <div className="relative aspect-[3/4] bg-black overflow-hidden mb-6">
                    {step.media.type === "image" ? (
                      <Image
                        src={step.media.src}
                        alt={step.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <video
                        src={step.media.src}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                        aria-label={step.title}
                      />
                    )}
                  </div>
                  <div className="px-1">
                    <p className="font-serif text-gold text-[14px] tracking-[0.3em] mb-3">{step.chapter} ・ {step.eyebrow}</p>
                    <h3 className="font-serif text-[20px] md:text-[22px] text-foreground mb-4 leading-tight">{step.title}</h3>
                    <p className="text-[13px] leading-[2] text-foreground/75">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 flex flex-wrap gap-x-10 gap-y-3 justify-center">
              <Link
                href="/paint"
                className="inline-flex items-center gap-2 text-[12px] tracking-[0.15em] uppercase text-foreground border-b border-foreground/30 pb-1 hover:text-gold hover:border-gold transition-colors"
              >
                塗装について <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/galvanizing"
                className="inline-flex items-center gap-2 text-[12px] tracking-[0.15em] uppercase text-foreground border-b border-foreground/30 pb-1 hover:text-gold hover:border-gold transition-colors"
              >
                溶融亜鉛メッキ <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── マガジン: フルブリード写真（Élisabeth 階段事例）── */}
        <section className="relative">
          <div className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
            <Image
              src="/images/products/elisabeth/01.jpg"
              alt="Élisabeth ロートアイアン階段手すり 山田邸"
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          <div className="px-6 py-10 lg:py-14 bg-background border-b border-border">
            <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-4 lg:gap-12 items-start">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold lg:w-32 shrink-0">Case</p>
              <p className="text-[13px] md:text-[14px] leading-[2] text-foreground/70 max-w-2xl">
                Élisabeth エリザベート ― 階段の両側に施工した本格ロートアイアン手すり事例。階段の長さに合わせて、職人が一本ずつ熱し叩いて延ばし、現場で位置を合わせています。
              </p>
            </div>
          </div>
        </section>

        {/* ── 05. NUMBERS（数字を控えめに 3 つ）── */}
        <section className="px-6 py-28 lg:py-40">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid lg:grid-cols-[200px_1fr] gap-10 lg:gap-20 mb-16">
              <div>
                <p className="font-serif text-[14px] tracking-[0.4em] text-gold mb-2">Chapter</p>
                <p className="font-serif text-[64px] lg:text-[80px] text-foreground/15 leading-none">05</p>
              </div>
              <div className="max-w-[640px]">
                <h2 className="font-serif text-[24px] md:text-[32px] leading-[1.5] text-foreground font-light">
                  数字で見る ado
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-12 md:gap-y-0 border-y border-border py-12 lg:py-16">
              {numbers.map((n) => (
                <div key={n.label} className="text-center md:border-r md:border-border last:border-r-0 md:px-6">
                  <div className="flex items-baseline justify-center gap-1 mb-4">
                    <span className="font-serif text-[44px] lg:text-[56px] text-foreground tabular-nums leading-none">
                      {n.value}
                    </span>
                    <span className="font-serif text-[18px] lg:text-[22px] text-foreground/70">{n.unit}</span>
                  </div>
                  <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">{n.label}</p>
                  <p className="text-[12px] text-foreground/55 leading-relaxed max-w-[200px] mx-auto">{n.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 06. WORKS GALLERY（マガジン的モザイク）── */}
        <section className="bg-[#faf8f4] px-6 py-28 lg:py-40">
          <div className="max-w-[1300px] mx-auto">
            <div className="grid lg:grid-cols-[200px_1fr] gap-10 lg:gap-20 mb-16">
              <div>
                <p className="font-serif text-[14px] tracking-[0.4em] text-gold mb-2">Chapter</p>
                <p className="font-serif text-[64px] lg:text-[80px] text-foreground/15 leading-none">06</p>
              </div>
              <div className="max-w-[640px]">
                <h2 className="font-serif text-[24px] md:text-[32px] leading-[1.5] text-foreground mb-8 font-light">
                  施工事例
                </h2>
                <p className="text-[14px] md:text-[15px] leading-[2.1] text-foreground/75">
                  これまでに納めた手すり・階段・フェンスの一部をご覧いただけます。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {galleryImages.map((img, i) => (
                <div
                  key={img.src}
                  className={`relative overflow-hidden group ${
                    i === 0 || i === 5 ? "lg:col-span-2 lg:row-span-2 aspect-square" : "aspect-square"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-[1200ms]"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-[12px] tracking-[0.15em] uppercase text-foreground border-b border-foreground/30 pb-1 hover:text-gold hover:border-gold transition-colors"
              >
                商品ラインナップを見る <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── 07. VOICE（pull-quotes 編集風）── */}
        <section className="px-6 py-28 lg:py-40">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid lg:grid-cols-[200px_1fr] gap-10 lg:gap-20 mb-16">
              <div>
                <p className="font-serif text-[14px] tracking-[0.4em] text-gold mb-2">Chapter</p>
                <p className="font-serif text-[64px] lg:text-[80px] text-foreground/15 leading-none">07</p>
              </div>
              <div className="max-w-[640px]">
                <h2 className="font-serif text-[24px] md:text-[32px] leading-[1.5] text-foreground mb-8 font-light">
                  お客様からの声
                </h2>
                <p className="text-[14px] md:text-[15px] leading-[2.1] text-foreground/75">
                  全国のお客様から頂いた、納品後のお言葉です。
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-14">
              {voiceCards.map((v, i) => (
                <figure key={i}>
                  <span className="font-serif text-[48px] text-gold/30 leading-none block mb-2" aria-hidden>
                    &ldquo;
                  </span>
                  <blockquote className="font-serif text-[15px] md:text-[16px] leading-[2.1] text-foreground/85 italic">
                    {v.quote}
                  </blockquote>
                  <figcaption className="mt-6 text-[11px] tracking-[0.2em] uppercase text-foreground/55">
                    ― {v.region}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── 08. LOCATION ── */}
        <section className="bg-[#faf8f4] px-6 py-24">
          <div className="max-w-[640px] mx-auto text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-5">Location</p>
            <h2 className="font-serif text-[24px] md:text-[28px] text-foreground mb-8 font-light">
              工房は千葉市にあります
            </h2>
            <div className="inline-flex items-center gap-2 text-[14px] text-foreground/80 mb-6">
              <MapPin className="w-4 h-4 text-gold" />
              <span>千葉県千葉市 ・ 鍛鉄工房ZEST 内</span>
            </div>
            <p className="text-[13px] text-foreground/70 leading-[2]">
              施工は <strong className="text-foreground font-medium">千葉県全域・神奈川/東京/埼玉（一部エリア）</strong> に対応しています。本体製作のみのご注文は <strong className="text-foreground font-medium">全国 47 都道府県</strong> へ配送いたします。
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-6 py-28 lg:py-40">
          <div className="max-w-[640px] mx-auto text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-5">Contact</p>
            <h2 className="font-serif text-[26px] md:text-[36px] text-foreground mb-8 font-light leading-[1.4]">
              まずはお気軽に、<br className="sm:hidden" />ご相談ください。
            </h2>
            <p className="text-[14px] text-foreground/75 leading-loose mb-12 max-w-md mx-auto">
              「こんなサイズで作れる？」「うちの階段に合うかな？」など、ざっくりした段階のご相談を歓迎しています。写真と簡単な記入で OK、お見積もりは無料です。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <PrimaryCTA href="/contact#form" variant="gold" size="md" icon={<Mail className="w-4 h-4" />} className="flex-1">
                フォームで相談
              </PrimaryCTA>
              <PrimaryCTA href="/contact#line" variant="dark" size="md" icon={<MessageSquare className="w-4 h-4" />} className="flex-1">
                LINE で相談
              </PrimaryCTA>
            </div>
            <p className="text-[11px] text-foreground/55 mt-6">
              個人情報の入力なしで LINE からも相談できます
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
