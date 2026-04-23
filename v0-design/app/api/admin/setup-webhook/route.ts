// 一時的な admin セットアップエンドポイント:
// Stripe に webhook endpoint を登録し、署名シークレット (whsec_...) を返す
// 使用後はこの route ファイルごと削除する想定
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// 使い切りトークン. 使用後ファイルごと削除されるため git 履歴には残るが
// エンドポイント自体が存在しなくなるため無害化される
const ADMIN_TOKEN = '__SmwsyNeHIo4ntddDAxL7r4E8A8iSfJcz7uFZulc6Y'

const WEBHOOK_URL = 'https://ado.tantetuzest.com/api/webhook'

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  if (url.searchParams.get('token') !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not set' }, { status: 500 })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' })

  try {
    // 既存の同 URL webhook を削除 (署名シークレットを新たに取得するため)
    const list = await stripe.webhookEndpoints.list({ limit: 100 })
    for (const w of list.data) {
      if (w.url === WEBHOOK_URL) {
        await stripe.webhookEndpoints.del(w.id)
      }
    }

    // 新規登録
    const endpoint = await stripe.webhookEndpoints.create({
      url: WEBHOOK_URL,
      enabled_events: ['checkout.session.completed'],
      description: 'IRONWORKS ado — Checkout completion (auto-setup)',
    })

    return NextResponse.json({
      id: endpoint.id,
      url: endpoint.url,
      status: endpoint.status,
      secret: endpoint.secret,
      message: 'whsec を Vercel 環境変数 STRIPE_WEBHOOK_SECRET に設定して redeploy してください',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[admin/setup-webhook] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
