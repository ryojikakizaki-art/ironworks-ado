import type Stripe from 'stripe'

// inclusive / exclusive 別に cold start 単位でキャッシュ
const cache: Record<'inclusive' | 'exclusive', string | null> = {
  inclusive: null,
  exclusive: null,
}

/**
 * 日本の消費税 10% の Tax Rate を取得 (無ければ作成)。
 * - inclusive=true: 税込 (本体価格表示用)
 * - inclusive=false: 税抜 (送料など、税を上乗せ表示したい項目用)
 *
 * 失敗時は null を返し、呼び出し側は tax_rates を付与しない (決済は継続)。
 */
export async function getOrCreateConsumptionTaxRate(
  stripe: Stripe,
  inclusive: boolean = true
): Promise<string | null> {
  const key = inclusive ? 'inclusive' : 'exclusive'
  if (cache[key]) return cache[key]

  // 明示指定があればそれを使う (後方互換)
  const envOverride = inclusive
    ? process.env.STRIPE_TAX_RATE_ID_INCLUSIVE?.trim() ||
      process.env.STRIPE_TAX_RATE_ID?.trim()
    : process.env.STRIPE_TAX_RATE_ID_EXCLUSIVE?.trim()
  if (envOverride) {
    cache[key] = envOverride
    return envOverride
  }

  try {
    const existing = await stripe.taxRates.list({ active: true, limit: 100 })
    const match = existing.data.find(
      (r) =>
        r.percentage === 10 && r.inclusive === inclusive && r.country === 'JP'
    )
    if (match) {
      cache[key] = match.id
      return match.id
    }

    const created = await stripe.taxRates.create({
      display_name: '消費税',
      description: inclusive
        ? '日本の消費税 10%（税込価格）'
        : '日本の消費税 10%（税抜価格）',
      percentage: 10,
      inclusive,
      country: 'JP',
      tax_type: 'jct',
      jurisdiction: 'JP',
    })
    cache[key] = created.id
    return created.id
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(
      `[stripe/tax-rate] 消費税率 (${inclusive ? 'inclusive' : 'exclusive'}) の取得/作成に失敗:`,
      msg
    )
    return null
  }
}
