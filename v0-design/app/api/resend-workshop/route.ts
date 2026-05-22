import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendWorkshopEmail } from '../webhook/route';

// Stripe API を使うため Node ランタイム固定。
export const runtime = 'nodejs';

/**
 * 工房（蠣﨑さん）宛の受注控えメールを後から再送する管理用エンドポイント。
 *
 * 用途:
 * - 工房控えメール機能(PR #334)の導入前に決済された注文へ後追いで送る。
 * - 何らかの理由で工房控えメールが届かなかった注文に再送する。
 *
 * webhook 全体を再実行すると お客様への二重確認メール / カレンダー重複 /
 * 受注台帳の二重計上 が起きるため、ここでは sendWorkshopEmail だけを呼ぶ。
 *
 * 認証: ヘッダー `x-order-entry-secret` が env `ORDER_ENTRY_SECRET` と一致すること。
 * 引数: `?session=cs_xxx` で特定の注文を指定。省略時は直近30時間に完了した注文すべて。
 */
export async function GET(request: NextRequest) {
  const secret = process.env.ORDER_ENTRY_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'endpoint not configured' }, { status: 503 });
  }
  if (request.headers.get('x-order-entry-secret') !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ ok: false, error: 'stripe not configured' }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });

  const sessionId = new URL(request.url).searchParams.get('session');

  let sessions: Stripe.Checkout.Session[];
  if (sessionId) {
    sessions = [await stripe.checkout.sessions.retrieve(sessionId)];
  } else {
    // 直近30時間に作成され、決済が完了した Checkout セッション。
    const gte = Math.floor(Date.now() / 1000) - 30 * 3600;
    const list = await stripe.checkout.sessions.list({ created: { gte }, limit: 100 });
    sessions = list.data.filter(
      (s) => s.status === 'complete' && s.payment_status === 'paid'
    );
  }

  const results: Array<Record<string, unknown>> = [];
  for (const s of sessions) {
    const isSimple = (s.metadata?.product_type) === 'simple';
    try {
      await sendWorkshopEmail(s, isSimple);
      results.push({
        session: s.id,
        customer: s.customer_details?.name ?? null,
        product: s.metadata?.product_name ?? s.metadata?.product ?? null,
        sent: true,
      });
    } catch (err) {
      results.push({
        session: s.id,
        sent: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return NextResponse.json(
    { ok: true, count: results.length, results },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
