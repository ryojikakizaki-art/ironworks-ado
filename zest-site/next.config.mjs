/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'tantetuzest.com' },
      { protocol: 'https', hostname: 'i0.wp.com' },
      { protocol: 'https', hostname: 'i1.wp.com' },
      { protocol: 'https', hostname: 'i2.wp.com' },
    ],
  },
  async redirects() {
    return [
      // ─── Blog posts (旧 WP の Day-and-name パーマリンク) ────────────
      // /yyyy/mm/dd/{slug}/ → /story/{slug}
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug',
        destination: '/story/:slug',
        permanent: true,
      },
      // 年月の archive index → /story
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})',
        destination: '/story',
        permanent: true,
      },
      {
        source: '/:year(\\d{4})/:month(\\d{2})',
        destination: '/story',
        permanent: true,
      },
      {
        source: '/:year(\\d{4})',
        destination: '/story/year/:year',
        permanent: true,
      },

      // ─── Works (旧 WP /products/{wp-cat}/{slug}/ 構造) ─────────────
      // 6 つの WP カテゴリを内部カテゴリへマッピング
      { source: '/products/sign/:slug',       destination: '/works/sign-:slug',       permanent: true },
      { source: '/products/gate-2/:slug',     destination: '/works/gate-:slug',       permanent: true },
      { source: '/products/fence/:slug',      destination: '/works/fence-:slug',      permanent: true },
      { source: '/products/handrail-3/:slug', destination: '/works/handrail-:slug',   permanent: true },
      { source: '/products/interior-2/:slug', destination: '/works/interior-:slug',   permanent: true },
      { source: '/products/other-2/:slug',    destination: '/works/other-:slug',      permanent: true },

      // 旧カテゴリ index → /works (フラグメントでアンカー)
      { source: '/products/sign',       destination: '/works#sign',     permanent: true },
      { source: '/products/gate-2',     destination: '/works#gate',     permanent: true },
      { source: '/products/fence',      destination: '/works#fence',    permanent: true },
      { source: '/products/handrail-3', destination: '/works#handrail', permanent: true },
      { source: '/products/interior-2', destination: '/works#interior', permanent: true },
      { source: '/products/other-2',    destination: '/works#other',    permanent: true },
      { source: '/products',            destination: '/works',          permanent: true },

      // ─── アトリエ／会社情報 ───────────────────────────────────────
      { source: '/zest',               destination: '/studio', permanent: true },
      { source: '/zest/wrought-iron',  destination: '/studio', permanent: true },
      { source: '/zest/movie',         destination: '/studio', permanent: true },
      { source: '/zest/user_policy',   destination: '/studio', permanent: true },

      // ─── オーダー受付 ────────────────────────────────────────────
      { source: '/order-2', destination: '/order', permanent: true },

      // ─── 介護リフォーム (手すり関連) → 手すり Works へ ────────────
      { source: '/care-renovation',        destination: '/works#handrail', permanent: true },
      { source: '/care-renovation/:slug',  destination: '/works#handrail', permanent: true },

      // ─── 旧 ado / フライパン系（別サイト ado.tantetuzest.com へ）─
      { source: '/products-2',                  destination: 'https://ado.tantetuzest.com', permanent: true },
      { source: '/products-2/:path*',           destination: 'https://ado.tantetuzest.com', permanent: true },

      // ─── その他の単発ページ ─────────────────────────────────────
      { source: '/sns',  destination: '/contact', permanent: true },
      { source: '/life', destination: '/story',   permanent: true },
    ];
  },
};

export default nextConfig;
