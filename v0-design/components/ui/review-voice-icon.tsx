// お客様の声アイコン — 重なり合う吹き出し2つ＋星3つ（2026-07-02 Gemini デザイン仕様）
// currentColor で描画するため、使う側で text-gold 等の色クラスを指定する
export function ReviewVoiceIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 星 × 3（吹き出しの上） */}
      <path
        d="M0 -3 L0.76 -1.05 L2.85 -0.93 L1.24 0.4 L1.76 2.43 L0 1.3 L-1.76 2.43 L-1.24 0.4 L-2.85 -0.93 L-0.76 -1.05 Z"
        fill="currentColor"
        transform="translate(8.5 5)"
      />
      <path
        d="M0 -3 L0.76 -1.05 L2.85 -0.93 L1.24 0.4 L1.76 2.43 L0 1.3 L-1.76 2.43 L-1.24 0.4 L-2.85 -0.93 L-0.76 -1.05 Z"
        fill="currentColor"
        transform="translate(16 5)"
      />
      <path
        d="M0 -3 L0.76 -1.05 L2.85 -0.93 L1.24 0.4 L1.76 2.43 L0 1.3 L-1.76 2.43 L-1.24 0.4 L-2.85 -0.93 L-0.76 -1.05 Z"
        fill="currentColor"
        transform="translate(23.5 5)"
      />
      {/* 奥の吹き出し（薄いゴールド） */}
      <path
        d="M16 10 H25 Q29 10 29 14 V18 Q29 22 25 22 H23.2 L24.8 26 L19.4 22 H16 Q12 22 12 18 V14 Q12 10 16 10 Z"
        fill="currentColor"
        opacity="0.4"
      />
      {/* 手前の吹き出し */}
      <path
        d="M7.5 13 H16.5 Q21 13 21 17.5 V21.5 Q21 26 16.5 26 H12.8 L8.2 29.6 L9.5 26 H7.5 Q3 26 3 21.5 V17.5 Q3 13 7.5 13 Z"
        fill="currentColor"
      />
    </svg>
  )
}
