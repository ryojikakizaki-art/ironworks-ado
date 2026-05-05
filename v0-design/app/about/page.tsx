import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { Hammer, Flame, Paintbrush, ArrowRight, Mail, MessageSquare, MapPin } from "lucide-react"

export const metadata = {
  title: "About | IRONWORKS ado — 千葉の鍛冶職人が手掛けるアイアン製品",
  description:
    "千葉市の鍛鉄工房ZESTで 15 年の経験を持つ鍛冶職人が、火造り鍛造で一本ずつ仕上げるアイアン手すり・インテリアの工房。",
}

const numbers = [
  { value: "15", unit: "年", label: "鍛鉄職人歴", note: "西洋鍛冶（フォージング）の手仕事" },
  { value: "30+", unit: "種", label: "商品ラインナップ", note: "手すり・フェンス・家具・小物" },
  { value: "47", unit: "都道府県", label: "全国配送対応", note: "施工は千葉＋関東 4 都県" },
  { value: "千葉", unit: "市", label: "工房拠点", note: "鍛鉄工房ZEST 内に併設" },
]

type ProcessMedia = { type: "image"; src: string } | { type: "video"; src: string }

const processSteps: {
  icon: typeof Flame
  eyebrow: string
  title: string
  body: string
  media: ProcessMedia
}[] = [
  {
    icon: Flame,
    eyebrow: "Step 01",
    title: "火造り・鍛造",
    body: "炉で 1000 ℃ 以上に熱した無垢鉄を、まだ赤いうちにハンマーで叩いて成形します。曲げ・捻り・延ばしを繰り返し、目指す形を生み出します。鉄は叩くことで内部組織が締まり、より強く・粘り強くなります。",
    media: { type: "video", src: "/videos/about-forging.mp4" },
  },
  {
    icon: Paintbrush,
    eyebrow: "Step 02",
    title: "塗装・仕上げ",
    body: "錆止め下地に 2 液型ウレタン艶消し黒を吹き付け、必要に応じて古美・銀古美仕上げを重ねます。屋外設置品は溶融亜鉛メッキで二重防錆を採用しています。",
    media: { type: "video", src: "/videos/about-painting.mp4" },
  },
  {
    icon: Hammer,
    eyebrow: "Step 03",
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
  {
    quote:
      "昨日無事に、手すりが届きました。早速、玄関に設置いたしました。近くのスイッチ等ともマッチして、すごくよい感じになっております！ 大切に使わせていただきます。",
    region: "広島県のお客様",
  },
]

const galleryImages = [
  { src: "/images/hero/dscf6699.jpg", alt: "鍛造ハンマー痕の手すり" },
  { src: "/images/hero/1140304.jpg", alt: "鉄骨階段とシャンデリア" },
  { src: "/images/hero/dscf1995.jpg", alt: "吹き抜けの縦格子フェンス" },
  { src: "/images/products/elisabeth/01.jpg", alt: "Élisabeth 階段全景" },
  { src: "/images/hero/dscf6234.jpg", alt: "白丸棒のシンプル手すり" },
  { src: "/images/products/elisabeth/05.jpg", alt: "Élisabeth 終端の渦巻き装飾" },
  { src: "/images/hero/dscf6186.jpg", alt: "ベランダの手すり（ガラス＋鉄）" },
  { src: "/images/hero/loft-staircase.jpg", alt: "ロフト鉄骨階段" },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-background">
        {/* ── HERO ── */}
        <section className="relative h-[88vh] min-h-[600px] overflow-hidden">
          <video
            src="/videos/hero-reel.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <p className="text-[10px] sm:text-[11px] tracking-[0.5em] uppercase text-gold mb-6">
              About IRONWORKS ado
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl text-white leading-tight">
              鉄を、火で、手で。
            </h1>
            <p className="mt-8 text-[15px] sm:text-[16px] text-white/85 max-w-xl leading-loose">
              千葉市の小さな鍛冶工房から、
              <br />
              一本ずつ手仕事で生まれるアイアン製品をお届けしています。
            </p>
            <div className="mt-12 flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-white/60 animate-pulse">
              <span>Scroll</span>
              <span className="w-12 h-px bg-white/40" />
            </div>
          </div>
        </section>

        {/* ── PROLOGUE ── */}
        <section className="max-w-3xl mx-auto px-6 py-24 lg:py-32">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4 text-center">Prologue</p>
          <h2 className="font-serif text-2xl lg:text-3xl text-foreground text-center mb-10 leading-relaxed">
            ようこそ、IRONWORKS ado へ
          </h2>
          <div className="space-y-6 text-[15px] leading-[2.1] text-foreground/85">
            <p>
              IRONWORKS ado（アイアンワークス・アド）は、千葉市の鍛冶工房から生まれた、アイアン製品のオンラインショップです。
              母体は本格ロートアイアンを手がける <strong>鍛鉄工房ZEST</strong>。職人がフルオーダーで培ってきた西洋鍛冶の技術と意匠を、ご家庭でも取り入れやすいかたちにお仕立てし、お届けしています。
            </p>
            <p>
              手すり・階段・フェンス・家具・小物まで、暮らしのなかで毎日触れるアイアンを、一本ずつ手仕事で作る。
              そんな当たり前のものづくりを、今もまっすぐに続けています。
            </p>
          </div>
        </section>

        {/* ── CRAFTSMAN ── */}
        <section className="bg-secondary/40 py-24 lg:py-32">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[3/2] rounded-lg overflow-hidden order-2 lg:order-1 bg-black">
              <Image
                src="/images/about/craftsman-hands.jpg"
                alt="鍛冶職人 蠣﨑良治の手 — 15 年の手仕事の証"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <p className="text-white/90 text-[12px] tracking-wide">
                  鍛冶職人 ・ 蠣﨑 良治（かきざき りょうじ）
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Craftsman</p>
              <h2 className="font-serif text-3xl lg:text-4xl text-foreground mb-8 leading-tight">
                15 年、
                <br className="sm:hidden" />
                火と鉄に向き合って。
              </h2>
              <div className="space-y-5 text-[14px] leading-[2.1] text-foreground/85">
                <p>
                  代表の蠣﨑良治は、千葉市を拠点に <strong>鍛鉄職人として 15 年</strong> にわたり、火造り鍛造の手仕事を続けてきました。
                </p>
                <p>
                  日本では馴染みの薄い <strong>西洋鍛冶（フォージング）</strong> は、熱した鉄をハンマーで叩き、引き伸ばし、ねじり、丸めて造形する技法。鋳型で量産する製品とはまったく違い、一本一本が「打ち手の物語」を持つ仕上がりになります。
                </p>
                <p>
                  「住まいのなかで毎日触れる金物だからこそ、握ったときに手がよろこぶものを作りたい」 — それが工房を構えてから今日まで変わらない、ものづくりの原点です。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── WORKSHOP (ZEST x ado) ── */}
        <section className="max-w-5xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center mb-14">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Workshop</p>
            <h2 className="font-serif text-3xl lg:text-4xl text-foreground mb-4">
              鍛鉄工房ZEST と IRONWORKS ado
            </h2>
            <p className="text-[14px] text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              同じ職人の手、同じ工房から、二つのかたちでお届けしています。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <a
              href="https://tantetuzest.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block border border-border bg-card rounded-lg p-8 lg:p-10 hover:border-gold/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/50">Brand 01</p>
                <ArrowRight className="w-4 h-4 -rotate-45 text-foreground/40 group-hover:text-gold group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-2 group-hover:text-gold transition-colors">鍛鉄工房ZEST</h3>
              <p className="text-[12px] text-foreground/60 mb-6 tracking-wider">FULL ORDER</p>
              <ul className="space-y-3 text-[13px] text-foreground/85 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-gold flex-shrink-0">●</span>
                  <span>建築家・設計事務所・工務店との協業実績</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold flex-shrink-0">●</span>
                  <span>図面ご相談からの完全フルオーダー</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold flex-shrink-0">●</span>
                  <span>本格ロートアイアン・装飾門扉・大型階段</span>
                </li>
              </ul>
              <p className="mt-6 text-[11px] tracking-wider text-foreground/50 group-hover:text-gold transition-colors">
                tantetuzest.com を見る ↗
              </p>
            </a>
            <div className="border-2 border-gold bg-gold/5 rounded-lg p-8 lg:p-10 relative">
              <span className="absolute -top-3 right-6 bg-gold text-white text-[10px] px-3 py-1 tracking-widest rounded-full">
                THIS SITE
              </span>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">Brand 02</p>
              <h3 className="font-serif text-2xl text-foreground mb-2">IRONWORKS ado</h3>
              <p className="text-[12px] text-gold mb-6 tracking-wider">SEMI ORDER</p>
              <ul className="space-y-3 text-[13px] text-foreground/85 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-gold flex-shrink-0">●</span>
                  <span>個人・法人どちらにもオンライン販売（建築会社・設計事務所からのご注文も対応）</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold flex-shrink-0">●</span>
                  <span>定形デザインを長さ・色・取付方法でセミオーダー</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold flex-shrink-0">●</span>
                  <span>クレジット決済・銀行振込対応／全国配送</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 max-w-2xl mx-auto text-center text-[13px] text-foreground/70 leading-loose">
            ZEST のフルオーダーで磨いた技術を、ado ではご家庭サイズに整えてお届けしています。手仕事の品質は、ふたつのブランドで一切変わりません。
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section className="bg-secondary/40 py-24 lg:py-32">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Process</p>
              <h2 className="font-serif text-3xl lg:text-4xl text-foreground mb-4">
                ものづくりの工程
              </h2>
              <p className="text-[14px] text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                火造りから仕上げまで、すべての工程を工房内で一貫して行っています。
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
              {processSteps.map((step) => {
                const Icon = step.icon
                return (
                  <div key={step.title} className="bg-white rounded-lg overflow-hidden">
                    <div className="relative aspect-[3/4] bg-black">
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
                    <div className="p-6 lg:p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className="w-6 h-6 text-gold" />
                        <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/50">
                          {step.eyebrow}
                        </p>
                      </div>
                      <h3 className="font-serif text-xl text-foreground mb-3">{step.title}</h3>
                      <p className="text-[13px] leading-[1.95] text-foreground/75">{step.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 justify-center">
              <Link
                href="/paint"
                className="inline-flex items-center gap-2 text-[12px] tracking-wider text-foreground border-b border-foreground/30 pb-1 hover:text-gold hover:border-gold transition-colors"
              >
                塗装について詳しく <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/galvanizing"
                className="inline-flex items-center gap-2 text-[12px] tracking-wider text-foreground border-b border-foreground/30 pb-1 hover:text-gold hover:border-gold transition-colors"
              >
                溶融亜鉛メッキについて <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── NUMBERS ── */}
        <section className="max-w-6xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center mb-14">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Numbers</p>
            <h2 className="font-serif text-3xl lg:text-4xl text-foreground mb-4">
              数字で見る ado
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {numbers.map((n) => (
              <div
                key={n.label}
                className="border border-border bg-card rounded-lg p-6 lg:p-8 text-center hover:border-gold transition-colors"
              >
                <div className="flex items-baseline justify-center gap-1 mb-3">
                  <span className="font-serif text-4xl lg:text-5xl text-foreground tabular-nums">
                    {n.value}
                  </span>
                  <span className="font-serif text-lg lg:text-xl text-foreground/70">{n.unit}</span>
                </div>
                <p className="text-[12px] tracking-[0.2em] uppercase text-gold mb-2">{n.label}</p>
                <p className="text-[11px] text-foreground/60 leading-relaxed">{n.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WORKS GALLERY ── */}
        <section className="bg-secondary/40 py-24 lg:py-32">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Works</p>
              <h2 className="font-serif text-3xl lg:text-4xl text-foreground mb-4">
                施工事例
              </h2>
              <p className="text-[14px] text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                これまでに納めた手すり・階段・フェンスの一部をご覧いただけます。
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {galleryImages.map((img, i) => (
                <div
                  key={img.src}
                  className={`relative overflow-hidden rounded-lg group ${
                    i === 0 || i === 5 ? "lg:col-span-2 lg:row-span-2 aspect-square" : "aspect-square"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-[12px] tracking-wider text-foreground border-b border-foreground/30 pb-1 hover:text-gold hover:border-gold transition-colors"
              >
                商品ラインナップを見る <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── VOICE ── */}
        <section className="max-w-6xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center mb-14">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Voice</p>
            <h2 className="font-serif text-3xl lg:text-4xl text-foreground mb-4">
              お客様からの声
            </h2>
            <p className="text-[14px] text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              全国のお客様から頂いた、納品後のお言葉です。
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {voiceCards.map((v, i) => (
              <figure
                key={i}
                className="bg-card border border-border rounded-lg p-6 lg:p-7 flex flex-col h-full"
              >
                <span className="font-serif text-4xl text-gold/40 leading-none mb-3" aria-hidden>
                  &ldquo;
                </span>
                <blockquote className="text-[14px] leading-[2] text-foreground/85 flex-1">
                  {v.quote}
                </blockquote>
                <figcaption className="mt-5 pt-4 border-t border-border/60 text-[11px] tracking-[0.15em] text-foreground/55">
                  {v.region}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── LOCATION ── */}
        <section className="bg-secondary/40 py-20 lg:py-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Location</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-6">
              工房は千葉市にあります
            </h2>
            <div className="inline-flex items-center gap-2 text-[14px] text-foreground/80 mb-6">
              <MapPin className="w-4 h-4 text-gold" />
              <span>千葉県千葉市 ・ 鍛鉄工房ZEST 内</span>
            </div>
            <p className="text-[13px] text-foreground/70 leading-loose">
              施工は <strong>千葉県全域・神奈川/東京/埼玉（一部エリア）</strong> に対応しています。
              <br />
              本体製作のみのご注文は <strong>全国 47 都道府県</strong> へ配送いたします。
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-3xl mx-auto px-6 py-24 lg:py-32 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">Contact</p>
          <h2 className="font-serif text-3xl lg:text-4xl text-foreground mb-6">
            まずはお気軽に、
            <br className="sm:hidden" />
            ご相談ください。
          </h2>
          <p className="text-[14px] text-foreground/75 leading-loose mb-10 max-w-xl mx-auto">
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
        </section>
      </main>
      <Footer />
    </>
  )
}
