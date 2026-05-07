'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ZestMark } from './zest-mark';

const STORAGE_KEY = 'zest-intro-seen';
/* splash の TOTAL_MS（4000）+ 少しのバッファ。splash がフェードアウトしてから現れる */
const APPEAR_AFTER_FRESH_LOAD_MS = 4200;

/**
 * 画面上部 中央に常駐する ZEST マーク。クリックでトップへ戻る。
 * - 初回訪問の home：splash が真上へ飛んだ終点でこのボタンが現れて見た目を引き継ぐ
 * - 同タブ再訪 home / その他のページ：即座に表示
 */
export function TopLogoButton() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isHome) {
      setShow(true);
      return;
    }
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (seen) {
      setShow(true);
      return;
    }
    const timer = window.setTimeout(() => setShow(true), APPEAR_AFTER_FRESH_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, [isHome]);

  return (
    <Link
      href="/"
      aria-label="トップへ戻る"
      className={`top-logo ${show ? 'top-logo--show' : ''}`}
    >
      <ZestMark className="top-logo__mark" />
      <span className="top-logo__brand">
        鍛鉄工房 <em>ZEST</em>
      </span>
    </Link>
  );
}
