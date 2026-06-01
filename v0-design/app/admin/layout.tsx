import type { Metadata } from 'next';

/**
 * /admin/* 用のミニマルレイアウト。
 *
 * 親レイアウト（app/layout.tsx）は IntroSplash / GA / カートヘッダーなど EC サイトの
 * 装飾をすべて入れるが、管理画面では邪魔。App Router の入れ子レイアウトは
 * 親を「上書き」できないため、子で wrapper を入れずに children をそのまま返し、
 * かつ親側の装飾要素（splash / カートドック）はクライアント側で
 * data-admin 属性を見て非表示にする CSS で隠す方針。
 *
 * 検索エンジンインデックスは noindex で明確に拒否（顧客情報を含むため）。
 */
export const metadata: Metadata = {
  title: 'ado 管理画面',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root min-h-screen bg-white text-[#111]">
      {/*
        親レイアウトの IntroSplash / カートドック / ヘッダーを admin 配下では隠す。
        CSS class でターゲットしたいが、親が data 属性を持たないので body 直下に
        スタイル注入する。print 時にも干渉しないよう class 限定で書く。
      */}
      <style>{`
        /* admin 配下では親の装飾を全部隠す */
        body:has(.admin-root) > .ado-splash,
        body:has(.admin-root) > #pre-splash,
        body:has(.admin-root) > [data-cart-dock],
        body:has(.admin-root) > [data-category-dock] { display: none !important; }

        /* globals.css の @media print に
           body > *:not(.dm-overlay):not(.seizu-root) { display: none !important; }
           があるため、admin-root も対象に含まれて消えてしまう。
           ここで !important で再表示を強制する。 */
        @media print {
          body > .admin-root { display: block !important; }
        }
      `}</style>
      {children}
    </div>
  );
}
