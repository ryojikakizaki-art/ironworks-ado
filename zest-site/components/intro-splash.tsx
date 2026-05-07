'use client';

import { useEffect, useRef, useState } from 'react';
import { LOGO_PATHS } from './zest-mark';

const STORAGE_KEY = 'zest-intro-seen';

/* タイムライン（合計 約 5 秒）
 *  0.00s   黒画面
 *  0.15s   最下部のパスから「下→上」順に描画開始（0.05s ズラし、各 0.8s）
 *  1.30s   全パス描画完了（最後のパスは 0.50s + 0.80s = 1.30s）
 *  0.70s   内側に白がじわっと染み込み開始（1.0s）
 *  2.30s   塗り完了
 *  2.30s   「鍛鉄工房 ZEST」フェードイン（0.9s）
 *  2.90s   完成ロゴ＋文字をホールド
 *  4.00s   ロゴ・文字を中央でその場フェードアウト（1.0s、移動なし）
 *  5.00s   splash 消滅 → 左上の TopLogoButton が現れる
 */
const TOTAL_MS = 4000;
const FADE_OUT_MS = 1000;

export function IntroSplash() {
  const [stage, setStage] = useState<'idle' | 'visible' | 'exiting' | 'gone'>('idle');
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    /* リロード時のフラグクリアは layout.tsx の <head> 内 inline script で行う。
       ここでは単純に sessionStorage の有無だけ見ればよい。 */
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setStage('gone');
      return;
    }
    setStage('visible');
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const auto = window.setTimeout(() => dismiss(), TOTAL_MS);
    return () => {
      window.clearTimeout(auto);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  function dismiss() {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    sessionStorage.setItem(STORAGE_KEY, '1');
    setStage('exiting');
    window.setTimeout(() => {
      document.body.style.overflow = '';
      setStage('gone');
    }, FADE_OUT_MS);
  }

  /* スキップ：クリック / スクロール / Enter / Space / Esc / タッチ */
  useEffect(() => {
    if (stage !== 'visible') return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        dismiss();
      }
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      dismiss();
    }
    function onTouch() {
      dismiss();
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouch, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouch);
    };
  }, [stage]);

  if (stage === 'idle' || stage === 'gone') return null;

  return (
    <div
      onClick={dismiss}
      role="button"
      tabIndex={0}
      aria-label="サイトに入る"
      className={`splash ${stage === 'exiting' ? 'splash--exit' : ''}`}
    >
      <div className="splash__center">
        <svg
          className="splash__svg"
          viewBox="0 0 800 800"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(0,800) scale(0.1,-0.1)">
            {LOGO_PATHS.map((d, i) => (
              <path key={i} className="splash__path" pathLength={100} d={d} />
            ))}
          </g>
        </svg>
        <div className="splash__brand">
          鍛鉄工房 <em>ZEST</em>
        </div>
      </div>
    </div>
  );
}
