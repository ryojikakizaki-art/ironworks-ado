'use client'

/**
 * カートの永続化（localStorage）と React 購読。
 *
 * サイトに DB・会員機能が無いため、カートはブラウザの localStorage にのみ保存する。
 * ヘッダーのカートアイコンとカートページが同じ状態を見る必要があるが、
 * そのためだけに app/layout.tsx へ Provider を足すと全ページの SSR 構造に
 * 影響するため、Context ではなくモジュールスコープの購読（useSyncExternalStore）
 * で共有する。
 *
 * 保存されるのは「何をカートに入れたか」だけで、価格は保存しない。
 * 表示・請求のどちらも lib/cart/pricing.ts の calcCartPricing で毎回計算するため、
 * 商品価格を改定しても古いカートに旧価格が残ることはない。
 */

import { useCallback, useSyncExternalStore } from 'react'
import { CART_MAX_QUANTITY, type CartItem } from './types'
import { sanitizeCart } from './pricing'

const STORAGE_KEY = 'ado-cart-v1'

const listeners = new Set<() => void>()
let snapshot: CartItem[] = []
let loaded = false

const EMPTY: CartItem[] = []

function read(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return sanitizeCart(JSON.parse(raw))
  } catch {
    return []
  }
}

function persist(items: CartItem[]) {
  snapshot = items
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // プライベートブラウジング等で書き込めない場合もカートは同一タブ内では動く
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  if (!loaded) {
    loaded = true
    snapshot = read()
  }
  listeners.add(listener)
  // 別タブでの変更にも追随する
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return
    snapshot = read()
    listeners.forEach((l) => l())
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

// useSyncExternalStore は毎回同じ参照を返す必要がある（新しい配列を返すと無限ループ）
function getSnapshot(): CartItem[] {
  if (!loaded) {
    loaded = true
    snapshot = read()
  }
  return snapshot
}

// SSR 時は常に空。ハイドレーション後にクライアントの実データへ切り替わる。
function getServerSnapshot(): CartItem[] {
  return EMPTY
}

export interface UseCartResult {
  items: CartItem[]
  /** カート内の合計本数 */
  count: number
  /** 追加できる残り本数 */
  remaining: number
  /** 追加した場合 true、上限で追加できなかった場合 false */
  add: (item: Omit<CartItem, 'id'>) => boolean
  remove: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
}

export function useCart(): UseCartResult {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const count = items.reduce((s, i) => s + i.quantity, 0)
  const remaining = Math.max(0, CART_MAX_QUANTITY - count)

  const add = useCallback((item: Omit<CartItem, 'id'>) => {
    const current = getSnapshot()
    const used = current.reduce((s, i) => s + i.quantity, 0)
    const room = CART_MAX_QUANTITY - used
    if (room <= 0) return false
    const next: CartItem = {
      ...item,
      quantity: Math.min(item.quantity, room),
      id: `${item.product}-${item.lengthMm}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }
    persist(sanitizeCart([...current, next]))
    return true
  }, [])

  const remove = useCallback((id: string) => {
    persist(getSnapshot().filter((i) => i.id !== id))
  }, [])

  const setQuantity = useCallback((id: string, quantity: number) => {
    const current = getSnapshot()
    const other = current.reduce((s, i) => (i.id === id ? s : s + i.quantity), 0)
    const capped = Math.max(1, Math.min(CART_MAX_QUANTITY - other, quantity))
    persist(current.map((i) => (i.id === id ? { ...i, quantity: capped } : i)))
  }, [])

  const clear = useCallback(() => {
    persist([])
  }, [])

  return { items, count, remaining, add, remove, setQuantity, clear }
}

/** 決済完了後にカートを空にする（/thanks から呼ぶ） */
export function clearCartStorage() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 書き込めない環境では何もしない
  }
  snapshot = []
  loaded = true
  listeners.forEach((l) => l())
}
