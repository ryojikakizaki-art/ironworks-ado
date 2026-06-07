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
  note: string;
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
    note: '',
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
    note: '',
    status: '',
  },
  {
    row: 4,
    date: '2026/06/07',
    channel: '銀行振込',
    customer: '田中 花子',
    prefecture: '東京都',
    product: 'René ルネ 壁付け手すり 1500mm',
    spec: '座金3個 / 通常配送 / マットブラック',
    totalYen: 40185,
    orderRef: 'BT-260607-XXXX',
    note: '入金待ち',
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
  // 行ごとの「発送済みにする（メール無し）」操作状態（row → 状態）。
  const [shipping, setShipping] = useState<Record<number, 'idle' | 'sending' | 'error'>>({});
  // 行ごとの追跡番号入力値（row → 文字列）。
  const [tracking, setTracking] = useState<Record<number, string>>({});
  // 行ごとの「発送通知メール送信」操作状態（row → 状態）。
  const [notify, setNotify] = useState<Record<number, 'idle' | 'sending' | 'error'>>({});
  // 発送通知メール送信時のエラーメッセージ（row → 文字列）。
  const [notifyErr, setNotifyErr] = useState<Record<number, string>>({});
  // 銀行振込の「入金確認」操作状態（row → 状態）。
  const [confirming, setConfirming] = useState<Record<number, 'idle' | 'sending' | 'error'>>({});
  const [confirmErr, setConfirmErr] = useState<Record<number, string>>({});

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

  // O列に「発送 (当日)」を書き、成功したらその行を一覧から外す。
  const markShipped = async (row: number) => {
    if (demo) {
      // デモモードでは書き込まず、見た目だけ一覧から外す。
      setOrders((prev) => (prev ? prev.filter((o) => o.row !== row) : prev));
      return;
    }
    setShipping((s) => ({ ...s, [row]: 'sending' }));
    try {
      const res = await fetch(`/api/admin/order/${row}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: '{}', // body 省略 = サーバ側で当日の「発送 YYYY/MM/DD」を入れる
        cache: 'no-store',
      });
      const data = (await res.json()) as
        | { ok: true; row: number; status: string }
        | { ok: false; error: string };
      if (!res.ok || !('ok' in data) || !data.ok) {
        setShipping((s) => ({ ...s, [row]: 'error' }));
        return;
      }
      // 書き込み成功 → 一覧から外す。
      setOrders((prev) => (prev ? prev.filter((o) => o.row !== row) : prev));
    } catch {
      setShipping((s) => ({ ...s, [row]: 'error' }));
    }
  };

  // 銀行振込の入金確認: カレンダー登録＋制作開始メール＋台帳メモ更新。
  // 成功したらその行の note から「入金待ち」を消し、通常の発送フロー（追跡番号入力）に切り替える。
  const confirmPayment = async (row: number) => {
    if (demo) {
      setOrders((prev) =>
        prev ? prev.map((o) => (o.row === row ? { ...o, note: '入金確認 2026/06/07' } : o)) : prev,
      );
      return;
    }
    setConfirming((s) => ({ ...s, [row]: 'sending' }));
    setConfirmErr((s) => ({ ...s, [row]: '' }));
    try {
      const res = await fetch(`/api/admin/order/${row}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        cache: 'no-store',
      });
      const data = (await res.json()) as
        | { ok: true; row: number; status: string; eventsCreated: number; emailSent: boolean }
        | { ok: false; error: string };
      if (!res.ok || !('ok' in data) || !data.ok) {
        setConfirming((s) => ({ ...s, [row]: 'error' }));
        setConfirmErr((s) => ({ ...s, [row]: 'error' in data ? data.error : '入金確認に失敗しました' }));
        return;
      }
      // 成功 → note を更新（入金待ち→入金確認）。行は残し、発送フローに切り替わる。
      setConfirming((s) => ({ ...s, [row]: 'idle' }));
      setOrders((prev) =>
        prev ? prev.map((o) => (o.row === row ? { ...o, note: data.status } : o)) : prev,
      );
    } catch (e) {
      setConfirming((s) => ({ ...s, [row]: 'error' }));
      setConfirmErr((s) => ({ ...s, [row]: e instanceof Error ? e.message : '入金確認に失敗しました' }));
    }
  };

  // 追跡番号入りで発送通知メールを送信し、O列に「発送済み 日付 佐川急便 番号」を記録する。
  // 成功したらその行を一覧から外す（O列が埋まる＝未発送一覧の対象外になるため）。
  const notifyShipment = async (row: number) => {
    const trackingNumber = (tracking[row] ?? '').trim();
    if (!trackingNumber) {
      setNotify((s) => ({ ...s, [row]: 'error' }));
      setNotifyErr((s) => ({ ...s, [row]: '追跡番号を入力してください' }));
      return;
    }
    if (demo) {
      // デモモードでは送信せず、見た目だけ一覧から外す。
      setOrders((prev) => (prev ? prev.filter((o) => o.row !== row) : prev));
      return;
    }
    setNotify((s) => ({ ...s, [row]: 'sending' }));
    setNotifyErr((s) => ({ ...s, [row]: '' }));
    try {
      const res = await fetch(`/api/admin/order/${row}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber, carrier: 'sagawa' }),
        cache: 'no-store',
      });
      const data = (await res.json()) as
        | { ok: true; sentTo: string }
        | { ok: false; error: string };
      if (!res.ok || !('ok' in data) || !data.ok) {
        setNotify((s) => ({ ...s, [row]: 'error' }));
        setNotifyErr((s) => ({
          ...s,
          [row]: 'error' in data ? data.error : '送信に失敗しました',
        }));
        return;
      }
      // 送信＋記録成功 → 一覧から外す。
      setOrders((prev) => (prev ? prev.filter((o) => o.row !== row) : prev));
    } catch (e) {
      setNotify((s) => ({ ...s, [row]: 'error' }));
      setNotifyErr((s) => ({
        ...s,
        [row]: e instanceof Error ? e.message : '送信に失敗しました',
      }));
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-gray-500">IRONWORKS ado / ADMIN</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">未発送 受注一覧</h1>
          <p className="mt-1 text-sm text-gray-600">
            対応状況（O列）が空欄の注文を表示しています。発送したら追跡番号を入れて
            「発送通知メール」を押すと、お客様に追跡番号入りの発送メールが届き、台帳にも記録されます。
            <br />
            銀行振込で「入金待ち」の注文は、入金を確認してから「入金確認 → 制作開始」を押してください
            （制作スケジュールに登録し、お客様へ制作開始メールを送ります）。
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
                <th className="px-4 py-3 font-medium">対応</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {orders.map((o) => (
                <tr key={o.row} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{o.date}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{o.channel}</td>
                  <td className="whitespace-nowrap px-4 py-3">
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
                      className="inline-flex items-center gap-1 rounded-md border border-gray-900 bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-gray-700"
                    >
                      納品書
                    </Link>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex w-44 flex-col gap-1.5">
                      {o.channel.includes('銀行振込') && o.note.includes('入金待ち') ? (
                        <>
                          <span className="inline-flex w-fit items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
                            入金待ち
                          </span>
                          <button
                            type="button"
                            onClick={() => confirmPayment(o.row)}
                            disabled={confirming[o.row] === 'sending'}
                            className="inline-flex items-center justify-center gap-1 rounded-md border border-amber-700 bg-amber-600 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {confirming[o.row] === 'sending' ? '確認中…' : '入金確認 → 制作開始'}
                          </button>
                          <p className="text-[11px] leading-snug text-gray-500">
                            押すと制作スケジュール（カレンダー）に登録し、お客様へ制作開始メールを送ります。
                          </p>
                          {confirming[o.row] === 'error' && confirmErr[o.row] && (
                            <div className="text-[11px] leading-snug text-red-600">{confirmErr[o.row]}</div>
                          )}
                        </>
                      ) : (
                        <>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={tracking[o.row] ?? ''}
                        onChange={(e) =>
                          setTracking((t) => ({ ...t, [o.row]: e.target.value }))
                        }
                        placeholder="佐川 追跡番号"
                        disabled={notify[o.row] === 'sending'}
                        className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none disabled:bg-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => notifyShipment(o.row)}
                        disabled={notify[o.row] === 'sending'}
                        className="inline-flex items-center justify-center gap-1 rounded-md border border-emerald-700 bg-emerald-600 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {notify[o.row] === 'sending' ? '送信中…' : '発送通知メール'}
                      </button>
                      {notify[o.row] === 'error' && notifyErr[o.row] && (
                        <div className="text-[11px] leading-snug text-red-600">
                          {notifyErr[o.row]}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => markShipped(o.row)}
                        disabled={shipping[o.row] === 'sending'}
                        className="text-[11px] text-gray-500 underline underline-offset-2 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {shipping[o.row] === 'sending'
                          ? '更新中…'
                          : 'メール無しで発送済みにする'}
                      </button>
                      {shipping[o.row] === 'error' && (
                        <div className="text-[11px] text-red-600">
                          更新に失敗しました。再度お試しください。
                        </div>
                      )}
                        </>
                      )}
                    </div>
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
