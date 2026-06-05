import { NextRequest, NextResponse } from 'next/server';
import { sendShipmentNotification } from '@/lib/shipment-notify';

export const runtime = 'nodejs';

/**
 * /admin ダッシュボードの「発送通知メール」ボタンが呼ぶエンドポイント。
 *
 * 受注台帳の指定行のお客様に「発送しました + 追跡番号」メールを送り、
 * O 列に「発送済み YYYY-MM-DD 佐川急便 NNNN」を書き込む。
 *
 * 認証は middleware.ts の Basic 認証で済む（/api/admin/* は matcher 対象）。
 * ブラウザは管理画面を開いた時点で Basic 認証済みなので、
 * シークレットをフロントに持たせる必要がない。
 *
 * 入力（JSON body）: { trackingNumber: string, carrier?: 'sagawa' }
 * 中核ロジックは lib/shipment-notify.ts（ORDER_ENTRY_SECRET 経路と共有）。
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ row: string }> },
) {
  const { row: rowParam } = await context.params;
  const row = Number(rowParam);
  if (!Number.isInteger(row) || row < 2) {
    return NextResponse.json({ ok: false, error: 'row must be an integer >= 2' }, { status: 400 });
  }

  let body: { trackingNumber?: unknown; carrier?: unknown };
  try {
    body = (await request.json()) as { trackingNumber?: unknown; carrier?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  try {
    const result = await sendShipmentNotification({
      row,
      trackingNumber: String(body.trackingNumber ?? ''),
      carrier: typeof body.carrier === 'string' ? body.carrier : undefined,
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/order/:row/notify] error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
