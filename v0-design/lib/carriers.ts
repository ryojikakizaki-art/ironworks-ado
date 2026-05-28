/**
 * 配送業者ごとの表示名と追跡URL生成。
 *
 * 現在は佐川急便のみ。ヤマト・日本郵便を追加するときは
 * このマップに 1 エントリ足すだけで shipment-notify エンドポイント全体が対応する。
 */

export type CarrierCode = 'sagawa';

type Carrier = {
  readonly name: string;
  readonly trackingUrl: (trackingNumber: string) => string;
};

export const CARRIERS: Record<CarrierCode, Carrier> = {
  sagawa: {
    name: '佐川急便',
    // 追跡番号はハイフンを除いた数字のみで投げる（佐川の追跡フォームの仕様）。
    trackingUrl: (no) =>
      `https://k2k.sagawa-exp.co.jp/p/web/okurijoinput.do?okurijoNo=${no.replace(/\D/g, '')}`,
  },
};

export const DEFAULT_CARRIER: CarrierCode = 'sagawa';

export function isCarrierCode(v: unknown): v is CarrierCode {
  return typeof v === 'string' && v in CARRIERS;
}
