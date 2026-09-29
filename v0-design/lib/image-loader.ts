// next/image のカスタムローダー。
// public/images/ の写真は、ビルド時に scripts/gen-image-variants.mjs が作った縮小版
// （/_v/<幅>/images/...）を指す。/_next/image（Vercel の有料最適化）は使わない。
//
// - dev では縮小版を作らないので原寸を返す
// - 外部 CDN（imagedelivery.net 等）・SVG・GIF は原寸のまま
// - 要求幅が最大の縮小版より大きければ原寸（写真は長辺 1600px 基準で圧縮済み）

// scripts/gen-image-variants.mjs の VARIANT_WIDTHS と必ず一致させる
const VARIANT_WIDTHS = [384, 640, 828, 1200]
const RASTER = /\.(jpe?g|png|webp)$/i

export default function adoImageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (process.env.NODE_ENV !== "production") return src
  if (!src.startsWith("/images/") || src.includes("?") || !RASTER.test(src)) return src
  const w = VARIANT_WIDTHS.find((v) => v >= width)
  return w ? `/_v/${w}${src}` : src
}
