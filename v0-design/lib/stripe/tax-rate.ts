import type Stripe from 'stripe'

// Stripe Tax Rate ID のサーバー側キャッシュ (cold start ごとに 1 回だけ API 呼び出し)
let cachedTaxRateId: string | null = null

/**
 * 日本の消費税 10% (税込) の Tax Rate を取得。
 * 既に Stripe アカウントに存在する (inclusive, percentage=10, country=JP) を探し、
 * 無ければ作成してキャッシュする。
 *
 * 失敗時は null を返し、呼び出し側は tax_rates を付与しない (決済は通る)。
 */
export async function getOrCreateConsumptionTaxRate(
  stripe: Stripe
): Promise<string | null> {
  if (cachedTaxRateId) return cachedTaxRateId

  // 明示指定があればそれを使う (後方互換)
  const envOverride = process.env.STRIPE_TAX_RATE_ID?.trim()
  if (envOverride) {
    cachedTaxRateId = envOverride
    return envOverride
  }

  try {
    // 既存検索
    const existing = await stripe.taxRates.list({ active: true, limit: 100 })
    const match = existing.data.find(
      (r) => r.percentage === 10 && r.inclusive === true && r.country === 'JP'
    )
    if (match) {
      cachedTaxRateId = match.id
      return match.id
    }

    // 無ければ作成
    const created = await stripe.taxRates.create({
      display_name: '消費税',
      description: '日本の消費税 10%（税込価格）',
      percentage: 10,
      inclusive: true,
      country: 'JP',
      tax_type: 'jct',
      jurisdiction: 'JP',
    })
    cachedTaxRateId = created.id
    return created.id
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[stripe/tax-rate] 消費税率の取得/作成に失敗:', msg)
    return null
  }
}
