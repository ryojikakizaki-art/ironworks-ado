/**
 * 制作図ページ /seizu へのリンクを組み立てる・受注台帳 R 列とやり取りする。
 *
 * カード決済は webhook が工房控えメールに直接リンクを載せる。銀行振込（サイト・見積）は
 * 入金確認まで日が空くため、記帳時に R 列へリンクを保存しておき、
 * /api/admin/order/[row]/confirm-payment が工房メールとお客様の制作開始メールに載せる。
 */

export const SITE_ORIGIN = 'https://ado.tantetuzest.com';

// 長さを指定できる手すり = /seizu で描ける商品（webhook の DRAWING_LINK_PRODUCTS と同じ）。
export const SEIZU_PRODUCTS = new Set([
  'rene', 'claire', 'emile', 'marcel',
  'alexandre', 'catherine', 'claude', 'antoine',
]);

export type SeizuSpec = {
  product: string;
  lengths: number[];
  washer?: string;
  positions?: number[];
  angleDeg?: number;
  angleDir?: string;
  label?: string;
};

export type SeizuLink = { label: string; url: string };

/** /seizu で描けない商品・長さが無い場合は null。 */
export function buildSeizuLink(spec: SeizuSpec, orderRef: string): SeizuLink | null {
  const product = String(spec.product || '').toLowerCase();
  const lengths = (spec.lengths || []).map((n) => Math.round(Number(n))).filter((n) => n > 0);
  if (!SEIZU_PRODUCTS.has(product) || lengths.length === 0) return null;
  const params = new URLSearchParams();
  params.set('product', product);
  params.set('lengths', lengths.join(','));
  if (spec.washer) params.set('washer', String(spec.washer).toUpperCase() === 'B' ? 'B' : 'A');
  if (lengths.length === 1 && spec.positions?.length) params.set('positions', spec.positions.join(','));
  if (lengths.length === 1 && spec.angleDeg && spec.angleDeg > 0) {
    params.set('angle', String(Math.round(spec.angleDeg)));
    params.set('dir', spec.angleDir === 'right' ? 'right' : 'left');
  }
  if (orderRef) params.set('order', orderRef);
  const label = spec.label || `${product} ${lengths.join('/')}mm`;
  return { label, url: `${SITE_ORIGIN}/seizu?${params.toString()}` };
}

export function buildSeizuLinks(specs: SeizuSpec[], orderRef: string): SeizuLink[] {
  return specs.map((s) => buildSeizuLink(s, orderRef)).filter((l): l is SeizuLink => !!l);
}

/** R 列のセル文字列（1 行 1 リンク「ラベル URL」）。 */
export function encodeSeizuCell(links: SeizuLink[]): string {
  return links.map((l) => `${l.label} ${l.url}`).join('\n');
}

export function decodeSeizuCell(cell: string): SeizuLink[] {
  return String(cell || '')
    .split('\n')
    .map((line) => {
      const m = line.match(/^(.*?)\s*(https:\/\/\S+)\s*$/);
      return m ? { label: m[1].trim() || '制作図', url: m[2] } : null;
    })
    .filter((l): l is SeizuLink => !!l && l.url.startsWith(`${SITE_ORIGIN}/seizu?`));
}
