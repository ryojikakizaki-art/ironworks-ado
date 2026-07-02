/**
 * 数字で見る ado。タスク5-3。「選ばれる理由」セクションの直上に配置。
 * 数字は蠣﨑さん確認済みの実数のみを使用（捏造・水増し禁止）。
 */

const STATS = [
  { value: "1,000", suffix: "件+", label: "施工・納品実績" },
  { value: "25", suffix: "年", label: "鉄職人歴" },
]

export function StatsSection() {
  return (
    <section className="bg-white py-16 md:py-24 border-b border-border">
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3 text-center">Numbers</p>
        <h2 className="font-serif text-2xl md:text-3xl text-foreground text-center mb-14 md:mb-16">
          数字で見る ado
        </h2>

        <div className="grid grid-cols-2 gap-10 md:gap-20 max-w-xl mx-auto">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-foreground leading-none">
                <span className="text-[44px] md:text-[56px]">{s.value}</span>
                <span className="text-[18px] md:text-[22px] ml-1">{s.suffix}</span>
              </p>
              <p className="mt-3 text-[13px] md:text-[14px] text-foreground/70 leading-snug text-balance">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
