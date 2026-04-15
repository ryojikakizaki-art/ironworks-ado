import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return _stripe;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id || !id.startsWith('cs_')) {
    return NextResponse.json(
      { error: 'session_id が不正です' },
      { status: 400 }
    );
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(id, {
      expand: ['line_items', 'customer_details'],
    });

    return NextResponse.json({
      id:               session.id,
      payment_status:   session.payment_status,
      amount_total:     session.amount_total,
      currency:         session.currency,
      customer_details: session.customer_details || null,
      metadata:         session.metadata || {},
      line_items:       session.line_items?.data || [],
      created:          session.created,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[session] Stripe error:', message);
    return NextResponse.json(
      { error: 'セッション情報の取得に失敗しました', detail: message },
      { status: 500 }
    );
  }
}
