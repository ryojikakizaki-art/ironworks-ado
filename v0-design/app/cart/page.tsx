"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronDown, Check, Trash2, ShoppingBag, Truck } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { EmbeddedCheckoutModal, type OrderSummary } from "@/components/checkout/embedded-checkout-modal"
import { BankOrderModal } from "@/components/checkout/bank-order-modal"
import { useCart } from "@/lib/cart/store"
import { calcCartPricing } from "@/lib/cart/pricing"
import { CART_MAX_QUANTITY, isClemenceSlug } from "@/lib/cart/types"
import { getProductDisplay } from "@/lib/products/display"
import {
  CUSTOMER_NOTE_MAX,
  DELIVERY_TIME_SLOTS,
  earliestArrivalFor,
  formatDeliveryWish,
  preferredDateOptions,
} from "@/lib/delivery-request"
import { fireGtagEvent } from "@/lib/gtag"

const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

function CartContent() {
  // 商品ページの「購入手続きへ」から引き継いだ配送先・配送区分（選び直しの手間を省く）
  const searchParams = useSearchParams()
  const initialPrefecture = searchParams.get("pref") || ""
  const initialRush = searchParams.get("rush") === "1"

  const { items, count, remove, setQuantity } = useCart()
  const [prefecture, setPrefecture] = useState(
    prefectures.includes(initialPrefecture) ? initialPrefecture : "",
  )
  const [isPrefectureOpen, setIsPrefectureOpen] = useState(false)
  const [deliveryType, setDeliveryType] = useState<"normal" | "express">(initialRush ? "express" : "normal")
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null)
  const [isBankOpen, setIsBankOpen] = useState(false)
  // お届け希望日時・備考（任意）。カード決済・銀行振込のどちらにも同じ内容を渡す。
  const [preferredDate, setPreferredDate] = useState("")
  const [timeSlot, setTimeSlot] = useState("")
  const [customerNote, setCustomerNote] = useState("")

  // 特急は 3 本まで（商品ページと同一ルール）
  const expressAllowed = count <= 3
  const rushDelivery = deliveryType === "express" && expressAllowed

  const pricing = useMemo(
    () => calcCartPricing(items, prefecture, rushDelivery),
    [items, prefecture, rushDelivery],
  )

  // 希望日の選択肢は「最短お届け予定日」以降。納期（通常/特急）や配送先を変えて
  // 最短日より前になった希望日は無効扱い（選択欄は「指定なし」に戻る）。
  const dateOptions = useMemo(
    () => preferredDateOptions(new Date(), rushDelivery, prefecture),
    [rushDelivery, prefecture],
  )
  const effectiveDate = dateOptions.some((o) => o.value === preferredDate) ? preferredDate : ""
  const deliveryWish = formatDeliveryWish(effectiveDate, timeSlot)
  const trimmedNote = customerNote.trim()

  const orderPayload = {
    cart: true,
    items,
    prefecture,
    rushDelivery,
    preferredArrivalDate: effectiveDate,
    preferredTimeSlot: timeSlot,
    customerNote: trimmedNote,
  }

  const summary: OrderSummary = {
    productName: `カートのご注文（${items.length}点 / 計${count}本）`,
    productNote: rushDelivery ? "特急配送 5営業日" : "通常配送 10営業日",
    lines: [
      ...pricing.lines.map((l) => ({
        label: `${l.label}${l.item.quantity > 1 ? ` × ${l.item.quantity}本` : ""}`,
        amount: l.lineTotal,
      })),
      { label: "本体小計", amount: pricing.itemsSubtotal, emphasize: true },
      ...(pricing.rushSurcharge > 0 ? [{ label: "特急割増（+20%）", amount: pricing.rushSurcharge }] : []),
      ...(pricing.shipping > 0 ? [{ label: `送料（佐川急便・${prefecture}・税抜）`, amount: pricing.shipping }] : []),
      ...(pricing.shippingTax > 0 ? [{ label: "送料消費税（10%）", amount: pricing.shippingTax }] : []),
    ],
    totalLabel: "合計（税込）",
    totalAmount: pricing.total,
    requests: [
      ...(deliveryWish ? [{ label: "お届け希望日時", value: deliveryWish }] : []),
      ...(trimmedNote ? [{ label: "備考", value: trimmedNote }] : []),
    ],
  }

  const arrivalLabel = earliestArrivalFor(new Date(), rushDelivery, prefecture)
    .toLocaleDateString("ja-JP", { month: "long", day: "numeric" })

  const handleCheckout = async () => {
    if (pricing.shippingInquiry || isCheckingOut) return
    if (!prefecture) {
      setCheckoutError("配送先都道府県を選択してください")
      setIsPrefectureOpen(true)
      return
    }
    setCheckoutError(null)
    setIsCheckingOut(true)
    fireGtagEvent("begin_checkout", {
      currency: "JPY",
      value: pricing.total,
      checkout_method: "card",
      items: pricing.lines.map((l) => ({
        item_id: l.item.product,
        item_name: l.titleLabel,
        quantity: l.item.quantity,
      })),
    })
    try {
      const res = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })
      const data = await res.json()
      if (!res.ok || !data?.clientSecret) {
        setCheckoutError(data?.error ?? "購入手続きを開始できませんでした")
        setIsCheckingOut(false)
        return
      }
      setCheckoutClientSecret(data.clientSecret)
      setIsCheckingOut(false)
    } catch {
      setCheckoutError("ネットワークエラーが発生しました。時間をおいて再度お試しください")
      setIsCheckingOut(false)
    }
  }

  const handleBankOrder = () => {
    if (pricing.shippingInquiry) return
    if (!prefecture) {
      setCheckoutError("配送先都道府県を選択してください")
      setIsPrefectureOpen(true)
      return
    }
    setCheckoutError(null)
    setIsBankOpen(true)
  }

  return (
    <>
      {/* ヒーロー画像を持たないページなので forceDark。省略するとヘッダーが
          白背景に白文字・白ロゴで埋没する（/kaigo・シミュレーターと同じ扱い）。 */}
      <Header forceDark />

      <main className="pt-20 lg:pt-24 pb-20 bg-background min-h-screen">
        <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-[11px] font-mono tracking-wide text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">カート</span>
          </nav>
        </div>

        <div className="max-w-[1000px] mx-auto px-4 lg:px-8">
          <h1 className="font-serif text-3xl lg:text-4xl text-foreground mb-2">カート</h1>
          <p className="text-[15px] text-muted-foreground mb-8">
            壁付け手すりを合わせて最大 {CART_MAX_QUANTITY} 点まで、一度のお支払いでまとめてご注文いただけます。
            <br className="hidden sm:inline" />
            壁付け手すりは同じ梱包に収まる分だけ送料がまとまるため、別々にご注文いただくより送料が抑えられます。
          </p>

          {items.length === 0 ? (
            <div className="bg-[#f3f4f6] border border-border rounded-lg px-6 py-14 text-center">
              <ShoppingBag className="w-10 h-10 text-gold mx-auto mb-4" strokeWidth={1.2} />
              <p className="font-serif text-[20px] text-foreground mb-2">カートは空です</p>
              <p className="text-[15px] text-muted-foreground mb-7">
                商品ページで長さ・仕様をお選びのうえ「カートに追加」してください。
              </p>
              <div className="flex justify-center">
                <PrimaryCTA href="/products" variant="gold" size="md" className="max-w-[300px] w-full">
                  製品一覧を見る
                </PrimaryCTA>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
              {/* ── 明細 ── */}
              <div className="space-y-4">
                {pricing.lines.map((line) => {
                  const display = getProductDisplay(line.item.product)
                  // Clémence は L型固定梱包のためカート内 1 台まで（数量変更なし・lib/cart/types.ts 参照）
                  const isClemence = isClemenceSlug(line.item.product)
                  return (
                    <div
                      key={line.item.id}
                      className="bg-white border border-gold/20 rounded-lg p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${line.item.product}`}
                            className="font-serif text-[19px] text-foreground hover:text-gold transition-colors"
                          >
                            {display ? `${display.nameEn} ${display.nameJaShort}` : line.titleLabel}
                          </Link>
                          <p className="text-[14px] text-muted-foreground mt-1">
                            {line.variantLabel}
                          </p>
                          <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                            {line.specLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(line.item.id)}
                          aria-label="カートから削除"
                          className="shrink-0 p-2 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-border/60">
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] text-muted-foreground">{isClemence ? "台数" : "本数"}</span>
                          <div className="flex items-center border border-gold/30 rounded-md overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setQuantity(line.item.id, line.item.quantity - 1)}
                              disabled={isClemence || line.item.quantity <= 1}
                              aria-label={isClemence ? "台数を減らす" : "本数を減らす"}
                              className="w-9 h-9 text-[16px] text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            >
                              −
                            </button>
                            <span className="w-10 text-center text-[15px] font-medium">{line.item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => setQuantity(line.item.id, line.item.quantity + 1)}
                              disabled={isClemence || count >= CART_MAX_QUANTITY}
                              aria-label={isClemence ? "台数を増やす" : "本数を増やす"}
                              className="w-9 h-9 text-[16px] text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            >
                              ＋
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          {line.item.quantity > 1 && (
                            <span className="block text-[12px] text-muted-foreground">
                              単価 ¥{line.unitPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="font-mono text-[17px] text-foreground">
                            ¥{line.lineTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {isClemence && (
                        <p className="text-[13px] text-muted-foreground leading-relaxed mt-3">
                          L型に固定して梱包するため、カートでは 1 台までとなります ── 2 台以上をご希望の場合は
                          <Link href="/contact?type=invoice" className="text-gold underline mx-1">お問い合わせ</Link>
                          から承ります。送料も手すりとは別梱包での計算になります。
                        </p>
                      )}
                    </div>
                  )
                })}

                {count >= CART_MAX_QUANTITY && (
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    カートは {CART_MAX_QUANTITY} 点までです。7 点以上のご注文は
                    <Link href="/contact?type=invoice" className="text-gold underline mx-1">お問い合わせ</Link>
                    から承ります（請求書振込）。
                  </p>
                )}

                <Link
                  href="/products"
                  className="inline-block text-[14px] text-muted-foreground hover:text-gold transition-colors"
                >
                  ← 買い物を続ける
                </Link>
              </div>

              {/* ── 配送・お支払い ── */}
              <div className="bg-white border border-gold/20 rounded-lg p-5 space-y-5 lg:sticky lg:top-28">
                <div className="space-y-3">
                  <h2 className="font-serif text-[18px] font-bold text-foreground">
                    配送先
                    {!prefecture && (
                      <span className="ml-2 text-[11px] font-sans font-medium text-red-600 align-middle tracking-wider">必須</span>
                    )}
                  </h2>
                  <div className="relative">
                    <button
                      onClick={() => setIsPrefectureOpen(!isPrefectureOpen)}
                      className={`w-full h-12 px-4 flex items-center justify-between border-2 rounded-md text-[14px] font-medium transition-colors ${
                        prefecture
                          ? "border-gold bg-gold/5 text-foreground"
                          : "border-gold/60 bg-white text-foreground hover:border-gold"
                      }`}
                    >
                      <span>{prefecture || "配送先都道府県を選択 ▸"}</span>
                      <ChevronDown className={`w-5 h-5 text-gold transition-transform ${isPrefectureOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isPrefectureOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gold/20 rounded-md shadow-lg max-h-60 overflow-y-auto z-20"
                        >
                          {prefectures.map((pref) => (
                            <button
                              key={pref}
                              onClick={() => { setPrefecture(pref); setIsPrefectureOpen(false); setCheckoutError(null) }}
                              className="w-full px-4 py-2 text-left text-[13px] hover:bg-muted transition-colors flex items-center justify-between"
                            >
                              {pref}
                              {prefecture === pref && <Check className="w-4 h-4 text-gold" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="font-serif text-[18px] font-bold text-foreground">納期</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeliveryType("normal")}
                      className={`flex-1 py-4 px-3 rounded-md border-2 transition-all ${
                        deliveryType === "normal" ? "border-gold bg-gold/5" : "border-gold/20 hover:border-gold/50"
                      }`}
                    >
                      <div className="text-[15px] font-medium">通常</div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">10営業日</div>
                    </button>
                    <button
                      onClick={() => setDeliveryType("express")}
                      disabled={!expressAllowed}
                      className={`flex-1 py-4 px-3 rounded-md border-2 transition-all ${
                        !expressAllowed
                          ? "border-border opacity-50 cursor-not-allowed"
                          : deliveryType === "express"
                          ? "border-gold bg-gold/5"
                          : "border-gold/20 hover:border-gold/50"
                      }`}
                    >
                      <div className="text-[15px] font-medium">特急 <span className="text-gold">+20%</span></div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">5営業日</div>
                    </button>
                  </div>
                  {!expressAllowed && (
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      特急配送は <span className="text-foreground font-medium">3 本まで</span> のご注文が対象です。
                    </p>
                  )}
                  <p className="text-[14px] text-muted-foreground">
                    お届け予定日: <span className="text-foreground font-medium">{arrivalLabel}頃</span>
                  </p>
                </div>

                {/* お届け日時・備考（任意）── カード決済・銀行振込のどちらにも同じ内容が渡る */}
                <div className="space-y-4">
                  <h2 className="font-serif text-[18px] font-bold text-foreground">
                    お届け日時・備考
                    <span className="ml-2 text-[11px] font-sans font-medium text-muted-foreground align-middle tracking-wider">任意</span>
                  </h2>

                  <div>
                    <label htmlFor="cart-preferred-date" className="block text-[14px] font-medium text-foreground mb-1.5">
                      お届け希望日
                    </label>
                    <div className="relative">
                      <select
                        id="cart-preferred-date"
                        value={effectiveDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full h-12 pl-4 pr-10 appearance-none bg-white border-2 border-gold/30 rounded-md text-[16px] text-foreground focus:border-gold focus:outline-none transition-colors"
                      >
                        <option value="">指定なし（最短でお届け）</option>
                        {dateOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                    </div>
                    {preferredDate && !effectiveDate && (
                      <p className="text-[13px] text-red-600 leading-relaxed mt-1.5">
                        納期・配送先の変更で、選んでいた希望日が最短お届け予定日より前になりました。日付を選び直してください。
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cart-time-slot" className="block text-[14px] font-medium text-foreground mb-1.5">
                      時間帯
                    </label>
                    <div className="relative">
                      <select
                        id="cart-time-slot"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full h-12 pl-4 pr-10 appearance-none bg-white border-2 border-gold/30 rounded-md text-[16px] text-foreground focus:border-gold focus:outline-none transition-colors"
                      >
                        <option value="">指定なし</option>
                        {DELIVERY_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cart-note" className="block text-[14px] font-medium text-foreground mb-1.5">
                      備考
                    </label>
                    <textarea
                      id="cart-note"
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      maxLength={CUSTOMER_NOTE_MAX}
                      rows={3}
                      placeholder="例）平日の日中は不在がちです／取り付けについて相談したい など"
                      className="w-full px-4 py-3 bg-white border-2 border-gold/30 rounded-md text-[16px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none transition-colors resize-y"
                    />
                    <p className="text-right text-[12px] text-muted-foreground mt-1">
                      {customerNote.length} / {CUSTOMER_NOTE_MAX}
                    </p>
                  </div>

                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    佐川急便でお届けします。ご希望の日時に添えない場合は、工房からメールでご相談します。
                  </p>
                </div>

                {/* 内訳 */}
                <div className="bg-[#f3f4f6] rounded-md p-4 space-y-2">
                  <div className="flex justify-between text-[15px]">
                    <span className="text-muted-foreground">本体小計（{count}点）</span>
                    <span className="font-mono">¥{pricing.itemsSubtotal.toLocaleString()}</span>
                  </div>
                  {pricing.rushSurcharge > 0 && (
                    <div className="flex justify-between text-[15px]">
                      <span className="text-muted-foreground">特急割増（+20%）</span>
                      <span className="font-mono">+¥{pricing.rushSurcharge.toLocaleString()}</span>
                    </div>
                  )}
                  {pricing.shipping > 0 && !pricing.shippingInquiry && (
                    <div className="pt-2 border-t border-border/60 space-y-1">
                      <div className="flex justify-between text-[15px]">
                        <span className="text-muted-foreground">送料（税抜）</span>
                        <span className="font-mono">+¥{pricing.shipping.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[15px]">
                        <span className="text-muted-foreground">送料消費税（10%）</span>
                        <span className="font-mono">+¥{pricing.shippingTax.toLocaleString()}</span>
                      </div>
                      {pricing.shippingNote && (
                        <p className="flex items-start gap-1.5 text-[12px] text-muted-foreground pt-1">
                          <Truck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gold" />
                          <span>{pricing.shippingNote}</span>
                        </p>
                      )}
                    </div>
                  )}
                  {!prefecture && (
                    <p className="text-[13px] text-muted-foreground pt-1">
                      配送先を選択すると送料が確定します。
                    </p>
                  )}
                </div>

                {pricing.shippingInquiry && (
                  <div className="border-2 border-yellow-500/60 bg-yellow-500/5 rounded-lg p-4">
                    <p className="text-[14px] text-yellow-700 font-medium">
                      ⚠ {pricing.shippingInquiryReason}
                    </p>
                    <Link href="/contact?type=invoice" className="inline-block mt-2 text-[14px] text-gold underline">
                      お問い合わせよりご相談ください
                    </Link>
                  </div>
                )}

                <div className="flex items-center gap-3 py-2">
                  <div className="w-2 h-12 bg-gold rounded-full" />
                  <div>
                    <span className="text-[12px] tracking-[0.15em] uppercase text-muted-foreground block mb-0.5">合計（税込）</span>
                    <span className="font-serif text-3xl text-foreground">¥{pricing.total.toLocaleString()}</span>
                  </div>
                </div>

                {checkoutError && (
                  <div className="border-2 border-red-500/60 bg-red-50 rounded-md p-3 text-[13px] text-red-700">
                    {checkoutError}
                  </div>
                )}

                {!pricing.shippingInquiry && (
                  <div className="space-y-3">
                    <PrimaryCTA
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      variant="purchase"
                      size="lg"
                      withArrow
                      className={`font-sans w-full ${isCheckingOut ? "cursor-wait" : ""}`}
                    >
                      {isCheckingOut ? "購入ページへ移動中…" : "クレジットカードで購入"}
                    </PrimaryCTA>
                    <PrimaryCTA
                      type="button"
                      onClick={handleBankOrder}
                      variant="purchase-steel"
                      size="lg"
                      withArrow
                      className="font-sans w-full"
                    >
                      銀行振込で購入する
                    </PrimaryCTA>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <EmbeddedCheckoutModal
        clientSecret={checkoutClientSecret}
        open={!!checkoutClientSecret}
        onClose={() => setCheckoutClientSecret(null)}
        summary={summary}
      />
      <BankOrderModal
        open={isBankOpen}
        onClose={() => setIsBankOpen(false)}
        orderPayload={orderPayload}
        summary={summary}
      />

      <Footer />
    </>
  )
}

/**
 * useSearchParams（商品ページから引き継ぐ配送先・配送区分）は Suspense 境界が要る。
 * フォールバックはヘッダーだけの素の枠にして、レイアウトのガタつきを避ける。
 */
export default function CartPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header forceDark />
          <main className="pt-20 lg:pt-24 pb-20 bg-background min-h-screen" />
          <Footer />
        </>
      }
    >
      <CartContent />
    </Suspense>
  )
}
