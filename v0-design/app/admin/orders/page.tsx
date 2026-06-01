'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * 未発送（対応中）の受注一覧。各行に「納品書」ボタン。
 * 認証は middleware の Basic 認証で済むため、ここでは fetch のみ。
 */

type AdminOrderRow = {
  row: number;
  date: string;
  channel: string;
  customer: string;
  prefecture: string;
  product: string;
  spec: string;
  totalYen: number;
  orderRef: string;
  status: string;
};

const yen = (n: number): string => `¥${n.toLocaleString('ja-JP')}`;

// dev / PR レビュー用のダミーデータ。?demo=1 で表示。本番では受注台帳から取得。
const DEMO_ORDERS: AdminOrderRow[] = [
  {
    row: 2,
    date: '2026/06/01',
    channel: 'ado',
    customer: '大澤 ゆかり',
    prefecture: '埼玉県',
    product: 'Antoine 縦型ロング',
    spec: '25φ 1500mm 座金2個 マットブラック',
    totalYen: 48685,
    orderRef: 'cs_live_b1EFAkgij7kMBfDgJ6BolywH52tPZUQWXMvAz6AKD4KW6iOODvXNQx3xLT',
    status: '',
  },
  {
    row: 3,
    date: '2026/06/01',
    channel: 'ado',
    customer: '坂本 聡',
    prefecture: '岩手県',
    product: 'René 横型',
    spec: '25φ 1200mm 座金3個 マットブラック',
    totalYen: 38040,
    orderRef: 'cs_live_b1OhgaqY8ZmT4PLHlFguUzMu2tYjaSCy9cAxJImH9PIJG3TU7vW143Lm3k',
    status: '',
  },
];

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<main className="py-12 text-center text-sm text-gray-500">読み込み中...</main>}>
      <AdminOrdersInner />
    </Suspense>
  );
}

function AdminOrdersInner() {
  const params = useSearchParams();
  const demo = params.get('demo') === '1';
  const [orders, setOrders] = useState<AdminOrderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demo) {
      setOrders(DEMO_ORDERS);
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/admin/orders', { cache: 'no-store' });
        const data = (await res.json()) as
          | { ok: true; orders: AdminOrderRow[] }
          | { ok: false; error: string };
        if (!('ok' in data) || !data.ok) {
          setError('error' in data ? data.error : '取得に失敗しました');
          return;
        }
        setOrders(data.orders);
      } catch (e) {
        setError(e instanceof Error ? e.message : '取得に失敗しました');
      }
    })();
  }, [demo]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-gray-500">IRONWORKS ado / ADMIN</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">未発送 受注一覧</h1>
          <p className="mt-1 text-sm text-gray-600">
            対応状況（O列）が空欄の注文を表示しています。発送が済んだら受注台帳の O列に記入してください。
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!orders && !error && (
        <div className="py-12 text-center text-sm text-gray-500">読み込み中...</div>
      )}

      {orders && orders.length === 0 && (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-600">
          未発送の受注はありません
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">受注日</th>
                <th className="px-4 py-3 font-medium">区分</th>
                <th className="px-4 py-3 font-medium">顧客</th>
                <th className="px-4 py-3 font-medium">商品 / 仕様</th>
                <th className="px-4 py-3 text-right font-medium">税込</th>
                <th className="px-4 py-3 font-medium">注文番号</th>
                <th className="px-4 py-3 font-medium">納品書</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {orders.map((o) => (
                <tr key={o.row} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{o.date}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{o.channel}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{o.customer || '—'}</div>
                    {o.prefecture && (
                      <div className="text-xs text-gray-500">{o.prefecture}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{o.product}</div>
                    {o.spec && (
                      <div className="mt-0.5 text-xs leading-relaxed text-gray-600">
                        {o.spec}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-gray-900">
                    {yen(o.totalYen)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                    {o.orderRef ? (
                      <span title={o.orderRef}>
                        {o.orderRef.length > 18 ? `${o.orderRef.slice(0, 18)}…` : o.orderRef}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/admin/delivery-note?row=${o.row}${demo ? '&demo=1' : ''}`}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-900 bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                    >
                      納品書
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="mt-10 border-t border-gray-200 pt-4 text-xs text-gray-500">
        鍛鉄工房ZEST / IRONWORKS ado — 適格請求書発行事業者登録番号 T7810771171765
      </footer>
    </main>
  );
}
