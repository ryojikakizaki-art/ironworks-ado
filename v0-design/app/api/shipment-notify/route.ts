import { NextRequest, NextResponse } from 'next/server';
import { sendShipmentNotification } from '@/lib/shipment-notify';

export const runtime = 'nodejs';

/**
 * 発送通知メール送信エンドポイント（ORDER_ENTRY_SECRET 認証・Claude / CLI 経路）。
 *
 * 受注台帳の指定行から顧客情報を読み、お客様に「発送しました + 追跡番号」メールを送り、
 * 同時に O 列に「発送済み YYYY-MM-DD 佐川急便 NNNN」を書き込む。
 *
 * 通常運用: Claude が「○○様発送、佐川 NNNN」を受けてこのエンドポイントを叩く。
 * /admin ダッシュボードの「発送通知メール」ボタンは Basic 認証経路
 * （app/api/admin/order/[row]/notify）から同じ中核処理を呼ぶ。
 *
 * 中核ロジックは lib/shipment-notify.ts に集約（両経路で本文・台帳記録を完全一致させるため）。
 */

type Body = {
  row?: number;
  trackingNumber?: string;
  carrier?: string;
  draft?: boolean; // 互換用に受けるが現在は無視（下書きは Gmail MCP 側で作成）
};

export async function POST(request: NextRequest) {
  const secret = process.env.ORDER_ENTRY_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'endpoint not configured' }, { status: 503 });
  }
  if (request.headers.get('x-order-entry-secret') !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  try {
    const result = await sendShipmentNotification({
      row: Number(body.row),
      trackingNumber: String(body.trackingNumber ?? ''),
      carrier: body.carrier,
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[shipment-notify] error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
