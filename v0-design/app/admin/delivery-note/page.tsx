'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

/**
 * 納品書（A4 印刷用）。
 * URL: /admin/delivery-note?row=<受注台帳のシート行番号>
 *
 * Cmd+P で印刷／PDF 化する前提のため、CSS は @page A4 + @media print で
 * UI を非表示にする。1 注文 = 1 ページに収まる設計。
 *
 * 印鑑欄は空白で配置（紙に蠣﨑さんが手押し）。
 * 振込先は記載しない（決済済の注文を想定）。
 */

type OrderDetail = {
  row: number;
  orderDate: string;
  channel: string;
  customer: string;
  prefecture: string;
  address: string;
  email: string;
  phone: string;
  product: string;
  spec: string;
  totalYen: number;
  subtotalYen: number;
  taxYen: number;
  orderRef: string;
  note: string;
  status: string;
};

const yen = (n: number): string => `¥${n.toLocaleString('ja-JP')}`;

// 注文番号末尾 8 文字を納品書番号にする（cs_live_… のフル長は紙に書けないため）
function deliveryNoteNo(orderRef: string, row: number): string {
  const tail = (orderRef || '').replace(/[^A-Za-z0-9]/g, '').slice(-8).toUpperCase();
  return tail ? `DN-${tail}` : `DN-R${row}`;
}

// 今日の日付（JST、YYYY/MM/DD）。発行日。
function todayJp(): string {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// 区分から決済済の文言を組み立てる
function paymentNote(channel: string): string {
  const c = channel.trim();
  if (/stripe|ado|クレジット|オンライン/i.test(c)) return 'Stripeにて決済済';
  if (/stores/i.test(c)) return 'STORESにて決済済';
  if (/現金/.test(c)) return '現金にて受領済';
  if (/銀行|振込/.test(c)) return '銀行振込にて入金確認済';
  if (c) return `${c} にて決済済`;
  return '決済済';
}

export default function DeliveryNotePage() {
  // useSearchParams は Suspense 境界の中で呼ぶ必要がある（Next.js 14+）
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl px-4 py-12 text-center text-sm text-gray-500">読み込み中...</main>}>
      <DeliveryNoteInner />
    </Suspense>
  );
}

// dev / PR レビュー用のダミー（?demo=1&row=2 または ?demo=1&row=3）。本番では受注台帳から取得。
const DEMO_ORDERS: Record<string, OrderDetail> = {
  '2': {
    row: 2,
    orderDate: '2026/06/01',
    channel: 'ado',
    customer: '大澤 ゆかり',
    prefecture: '埼玉県',
    address: '埼玉県八潮市垳518',
    email: '',
    phone: '',
    product: 'Antoine 縦型ロング 25φ マットブラック',
    spec: '1500mm 座金2個',
    totalYen: 48685,
    subtotalYen: 44259,
    taxYen: 4426,
    orderRef: 'cs_live_b1EFAkgij7kMBfDgJ6BolywH52tPZUQWXMvAz6AKD4KW6iOODvXNQx3xLT',
    note: '',
    status: '',
  },
  '3': {
    row: 3,
    orderDate: '2026/06/01',
    channel: 'ado',
    customer: '坂本 聡',
    prefecture: '岩手県',
    address: '岩手県久慈市長内町17-9-14',
    email: '',
    phone: '',
    product: 'René 横型 25φ マットブラック',
    spec: '1200mm 座金3個',
    totalYen: 38040,
    subtotalYen: 34582,
    taxYen: 3458,
    orderRef: 'cs_live_b1OhgaqY8ZmT4PLHlFguUzMu2tYjaSCy9cAxJImH9PIJG3TU7vW143Lm3k',
    note: '',
    status: '',
  },
};

function DeliveryNoteInner() {
  const params = useSearchParams();
  const row = params.get('row');
  const demo = params.get('demo') === '1';
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [issueDate] = useState<string>(todayJp());

  useEffect(() => {
    if (!row) {
      setError('row パラメータが指定されていません');
      return;
    }
    if (demo) {
      const d = DEMO_ORDERS[row];
      if (d) setOrder(d);
      else setError(`デモ用 row=${row} はありません（2 または 3 を指定してください）`);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/admin/order/${row}`, { cache: 'no-store' });
        const data = (await res.json()) as
          | { ok: true; order: OrderDetail }
          | { ok: false; error: string };
        if (!('ok' in data) || !data.ok) {
          setError('error' in data ? data.error : '取得に失敗しました');
          return;
        }
        setOrder(data.order);
      } catch (e) {
        setError(e instanceof Error ? e.message : '取得に失敗しました');
      }
    })();
  }, [row, demo]);

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
        <p className="mt-4">
          <Link href="/admin/orders" className="text-sm text-gray-700 underline">
            ← 受注一覧へ戻る
          </Link>
        </p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center text-sm text-gray-500">
        読み込み中...
      </main>
    );
  }

  const dnNo = deliveryNoteNo(order.orderRef, order.row);

  return (
    <>
      {/* 印刷用 CSS。Tailwind v4 の lightning CSS で @layer 外の vanilla CSS が
          落ちることがあるため、ページ内 <style> に直接書く（admin/layout.tsx と同じ方針）。
          @page も dev / prod 両環境で確実に効くよう @layer 外に置く必要がある。 */}
      <style>{`
        @page { size: A4; margin: 15mm; }

        .delivery-note { font-family: var(--font-rounded-body, "Zen Kaku Gothic New"), "Hiragino Sans", "Yu Gothic", sans-serif; color: #111; }
        /*
         * A4 印刷を主目的とするため .dn-paper は A4 縦の本文幅 180mm 固定。
         * mobile / 狭い画面で開いた場合は親が overflow-x:auto で横スクロールする。
         * 「スマホで縦に潰れる」より「PC / 印刷で一定の体裁」を優先する設計。
         */
        .dn-paper {
          width: 180mm;
          margin: 0 auto;
          padding: 12mm 10mm;
          background: #fff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          font-size: 11pt;
          line-height: 1.55;
        }

        @media print {
          html, body { background: #fff !important; }
          .dn-toolbar { display: none !important; }
          .dn-scroll { overflow: visible !important; padding: 0 !important; }
          .dn-paper { width: auto; margin: 0; padding: 0; border: none; box-shadow: none; }
        }
      `}</style>

      <main className="delivery-note min-h-screen bg-gray-50 print:bg-white">
        {/* 印刷時には隠れるツールバー */}
        <div className="dn-toolbar sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 shadow-sm print:hidden">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
            <Link
              href="/admin/orders"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← 受注一覧
            </Link>
            <div className="text-xs text-gray-500">
              納品書 {dnNo} ／ 受注台帳 行 {order.row}
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              印刷 / PDF 化（Cmd+P）
            </button>
          </div>
        </div>

        <div className="dn-scroll overflow-x-auto px-4 py-6 print:p-0">
          <div className="dn-paper">
            {/* 見出しと番号 */}
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold tracking-[0.15em] text-gray-900">
                  納　品　書
                </h1>
                <p className="mt-1 text-xs text-gray-500">DELIVERY NOTE</p>
              </div>
              <div className="text-right text-xs leading-relaxed text-gray-700">
                <div>発行日: <span className="font-medium text-gray-900">{issueDate}</span></div>
                <div className="mt-0.5">納品書番号: <span className="font-mono font-medium text-gray-900">{dnNo}</span></div>
                {order.orderDate && (
                  <div className="mt-0.5">ご注文日: <span className="text-gray-900">{order.orderDate}</span></div>
                )}
              </div>
            </div>

            {/* 宛名 + 発行元 */}
            <div className="mt-6 grid grid-cols-2 gap-6">
              {/* 宛名 */}
              <div className="border-b-2 border-gray-900 pb-3">
                {order.prefecture && order.address && (
                  <div className="text-[11px] text-gray-700">
                    {order.address.startsWith(order.prefecture)
                      ? order.address
                      : `${order.prefecture}${order.address}`}
                  </div>
                )}
                {(!order.prefecture || !order.address) && (order.address || order.prefecture) && (
                  <div className="text-[11px] text-gray-700">
                    {[order.prefecture, order.address].filter(Boolean).join(' ')}
                  </div>
                )}
                <div className="mt-2 text-xl font-medium text-gray-900">
                  {order.customer || 'お客様'} <span className="ml-1 text-base">様</span>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  この度はご注文いただき、誠にありがとうございます。下記の通り納品いたします。
                </p>
              </div>

              {/* 発行元 + ロゴ + 印鑑欄 */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] leading-relaxed text-gray-800">
                    <div className="font-medium text-gray-900">鍛鉄工房ZEST</div>
                    <div>代表 蠣﨑 良治</div>
                    <div className="mt-1">〒265-0052</div>
                    <div>千葉県千葉市若葉区和泉町239-2</div>
                    <div className="mt-0.5">TEL 070-3817-0659</div>
                    <div>ado@tantetuzest.com</div>
                    <div className="mt-1 text-[10px] text-gray-600">
                      適格請求書発行事業者
                      <br />
                      登録番号 T7810771171765
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Image
                      src="/images/ado_logo_K.png"
                      alt="IRONWORKS ado"
                      width={72}
                      height={48}
                      className="h-auto w-[60px]"
                      unoptimized
                    />
                    {/* 印鑑欄（空白で配置・蠣﨑さんが紙に手押し） */}
                    <div
                      aria-hidden="true"
                      className="mt-1 h-[54px] w-[54px] rounded-full border border-gray-400 text-center text-[9px] leading-[54px] text-gray-400"
                    >
                      印
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 件名 */}
            <div className="mt-8">
              <div className="text-[10px] tracking-[0.2em] text-gray-500">件名</div>
              <div className="mt-1 border-b border-gray-200 pb-1 text-base font-medium text-gray-900">
                {order.product}
                {order.spec && <span className="ml-2 text-sm text-gray-600">／ {order.spec}</span>}
              </div>
            </div>

            {/* 金額大表示 */}
            <div className="mt-4 flex items-end justify-between gap-4 border-y-2 border-gray-900 bg-gray-50 px-4 py-3">
              <div className="text-xs text-gray-700">合計金額（税込）</div>
              <div className="font-mono text-2xl font-bold text-gray-900">
                {yen(order.totalYen)}
              </div>
            </div>

            {/* 明細表 */}
            <div className="mt-5">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-gray-100 text-left text-[10px] tracking-wider text-gray-700">
                    <th className="border border-gray-300 px-2 py-1.5 font-medium">商品 / 仕様</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-right font-medium w-16">数量</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-right font-medium w-24">単価（税抜）</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-right font-medium w-24">金額（税抜）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-2 align-top text-gray-900">
                      <div className="font-medium">{order.product}</div>
                      {order.spec && (
                        <div className="mt-0.5 text-[10px] leading-relaxed text-gray-600">
                          {order.spec}
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-right font-mono text-gray-900 align-top">1</td>
                    <td className="border border-gray-300 px-2 py-2 text-right font-mono text-gray-900 align-top">
                      {yen(order.subtotalYen)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-right font-mono text-gray-900 align-top">
                      {yen(order.subtotalYen)}
                    </td>
                  </tr>
                  {/* 空行を 3 行入れて A4 に体裁を合わせる */}
                  {[0, 1, 2].map((i) => (
                    <tr key={i}>
                      <td className="h-7 border border-gray-300 px-2"></td>
                      <td className="border border-gray-300 px-2"></td>
                      <td className="border border-gray-300 px-2"></td>
                      <td className="border border-gray-300 px-2"></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="text-[11px]">
                  <tr>
                    <td colSpan={2} className="border border-gray-300 bg-gray-50 px-2 py-1.5"></td>
                    <td className="border border-gray-300 bg-gray-50 px-2 py-1.5 text-right text-gray-700">小計（税抜）</td>
                    <td className="border border-gray-300 bg-gray-50 px-2 py-1.5 text-right font-mono text-gray-900">
                      {yen(order.subtotalYen)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="border border-gray-300 bg-gray-50 px-2 py-1.5"></td>
                    <td className="border border-gray-300 bg-gray-50 px-2 py-1.5 text-right text-gray-700">消費税 10%</td>
                    <td className="border border-gray-300 bg-gray-50 px-2 py-1.5 text-right font-mono text-gray-900">
                      {yen(order.taxYen)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="border border-gray-300 bg-gray-900 px-2 py-2"></td>
                    <td className="border border-gray-300 bg-gray-900 px-2 py-2 text-right text-xs font-medium text-white">
                      合計（税込）
                    </td>
                    <td className="border border-gray-300 bg-gray-900 px-2 py-2 text-right font-mono text-base font-bold text-white">
                      {yen(order.totalYen)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 備考 */}
            <div className="mt-5">
              <div className="text-[10px] tracking-[0.2em] text-gray-500">備考</div>
              <div className="mt-1 min-h-[40px] border border-gray-200 px-3 py-2 text-[11px] leading-relaxed text-gray-800">
                {paymentNote(order.channel)}
                {order.note && (
                  <>
                    <br />
                    {order.note}
                  </>
                )}
              </div>
            </div>

            {/* フッター */}
            <div className="mt-6 border-t border-gray-200 pt-2 text-center text-[10px] text-gray-500">
              IRONWORKS ado — https://ado.tantetuzest.com
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
