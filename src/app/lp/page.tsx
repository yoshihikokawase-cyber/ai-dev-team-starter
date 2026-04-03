// TapHabit Landing Page
// Route: /lp
// Design: iOS-minimal, green gradient, generous whitespace

import Link from 'next/link';

/* ── SVG アイコン（チェックマーク） ─────────────────── */
function CheckIcon({ size = 24, strokeWidth = 2.5 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── アプリアイコン（丸角正方形＋チェック） ─────────── */
function AppIcon({ size = 140, radius = 'rounded-[38px]' }: { size?: number; radius?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-green-400 to-green-500 ${radius} overflow-hidden`}
      style={{
        width: size,
        height: size,
        boxShadow: '0 16px 48px rgba(34,197,94,0.30)',
      }}
    >
      {/* ハイライト */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent pointer-events-none" />
      <CheckIcon size={Math.round(size * 0.52)} strokeWidth={2.5} />
    </div>
  );
}

/* ── ヒーローセクション ──────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 overflow-hidden bg-white">
      {/* 背景グラデーション光 */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(74,222,128,0.13)_0%,transparent_70%)] pointer-events-none" />

      {/* アイコン＋波紋 */}
      <div className="relative w-[140px] h-[140px] mb-14 flex items-center justify-center">
        {/* 波紋 1 */}
        <div
          className="animate-ripple-1 absolute inset-[-20px] rounded-full border border-green-300/40 pointer-events-none"
        />
        {/* 波紋 2 */}
        <div
          className="animate-ripple-2 absolute inset-[-40px] rounded-full border border-green-300/25 pointer-events-none"
        />
        <AppIcon size={140} radius="rounded-[38px]" />
      </div>

      {/* バッジ */}
      <span className="inline-flex items-center gap-2 bg-green-50 text-green-600 text-xs font-semibold tracking-widest uppercase rounded-full px-4 py-1.5 mb-7 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        習慣管理アプリ
      </span>

      {/* 見出し */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-5">
        <span className="bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
          1タップ
        </span>
        で、<br />続く習慣。
      </h1>

      {/* サブコピー */}
      <p className="text-gray-500 text-base sm:text-lg mb-10 max-w-xs mx-auto leading-relaxed">
        記録はカンタン。続けることが<br />
        自然と気持ちよくなる。
      </p>

      {/* CTAボタン */}
      <Link
        href="/"
        className="inline-flex items-center gap-3 bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-base rounded-full px-10 py-4 transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
        style={{ boxShadow: '0 10px 32px rgba(34,197,94,0.32)' }}
      >
        今すぐ始める
        <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs">→</span>
      </Link>

      <p className="mt-5 text-xs text-gray-400">無料で使えます • 登録60秒</p>
    </section>
  );
}

/* ── Featuresセクション ──────────────────────────────── */
const features = [
  {
    emoji: '✅',
    title: '1タップで完了',
    desc: '難しい操作はゼロ。チェックするだけで記録完了。習慣の壁を限りなく低くしました。',
  },
  {
    emoji: '🔥',
    title: '継続が目に見える',
    desc: '連続記録日数でモチベーションが上がる。続けた事実が、次の一歩を自然に生み出します。',
  },
  {
    emoji: '🌱',
    title: '習慣が育つ感覚',
    desc: '記録を重ねるほど、自分が変わっているのを実感。続けることが楽しくなっていきます。',
  },
];

function FeaturesSection() {
  return (
    <section className="px-6 py-24 bg-green-50" id="features">
      <p className="text-center text-xs font-bold tracking-[0.14em] uppercase text-green-600 mb-4">
        Features
      </p>
      <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug text-gray-900 mb-3">
        続けるのが<br />気持ちいい理由
      </h2>
      <p className="text-center text-gray-500 mb-14 text-sm">
        シンプルだから、毎日続く。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-3xl px-8 py-9 transition-all duration-200 hover:-translate-y-1"
            style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-2xl mb-6">
              {f.emoji}
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2 tracking-tight">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Stepsセクション ─────────────────────────────────── */
const steps = [
  {
    n: '1',
    title: '習慣を追加する',
    desc: '続けたいことを入力するだけ。「運動」「読書」「水を飲む」——小さな習慣から始めましょう。',
  },
  {
    n: '2',
    title: '毎日タップして記録',
    desc: 'できたらチェック。ただそれだけ。1タップの軽さが、継続のカギです。',
  },
  {
    n: '3',
    title: '自然と続くようになる',
    desc: '記録が積み重なるほど、やらないことが気持ち悪くなる。それが本当の習慣化です。',
  },
];

function StepsSection() {
  return (
    <section className="px-6 py-24 bg-white" id="how">
      <p className="text-center text-xs font-bold tracking-[0.14em] uppercase text-green-600 mb-4">
        How it works
      </p>
      <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug text-gray-900 mb-3">
        使い方は<br />たった3ステップ
      </h2>
      <p className="text-center text-gray-500 mb-14 text-sm">
        考えるより先に、体が動く。
      </p>

      <div className="max-w-lg mx-auto relative">
        {/* 縦線 */}
        <div className="absolute left-[27px] top-14 bottom-14 w-0.5 bg-gradient-to-b from-green-400 to-green-500 opacity-20" />

        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-6 py-8">
            {/* 丸番号 */}
            <div
              className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white text-xl font-extrabold relative z-10"
              style={{ boxShadow: '0 4px 16px rgba(34,197,94,0.28)' }}
            >
              {s.n}
            </div>
            <div className="pt-2">
              <h3 className="text-lg font-bold text-gray-900 mb-1.5 tracking-tight">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── CTAセクション ───────────────────────────────────── */
function CTASection() {
  return (
    <section
      className="px-6 py-28 text-center"
      id="cta"
      style={{
        background: 'linear-gradient(160deg, #F0FDF4 0%, rgba(220,252,231,0.55) 100%)',
      }}
    >
      {/* アイコン */}
      <div className="flex justify-center mb-10">
        <div className="relative">
          <AppIcon size={100} radius="rounded-[28px]" />
        </div>
      </div>

      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug text-gray-900 mb-4">
        今日の1タップが、<br />明日の自分をつくる。
      </h2>
      <p className="text-gray-500 text-sm mb-10">
        まずは1つの習慣から。無料で始められます。
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-3 bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-base rounded-full px-10 py-4 transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
        style={{ boxShadow: '0 10px 32px rgba(34,197,94,0.32)' }}
      >
        アプリを開いて始める
        <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs">→</span>
      </Link>
    </section>
  );
}

/* ── ナビゲーション ──────────────────────────────────── */
function Nav() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
      <Link href="/lp" className="flex items-center gap-2.5 font-bold text-gray-900 text-lg tracking-tight no-underline">
        <span
          className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: '0 2px 8px rgba(34,197,94,0.30)' }}
        >
          <CheckIcon size={16} strokeWidth={3} />
        </span>
        TapHabit
      </Link>
      <Link
        href="/"
        className="text-sm font-semibold text-white bg-gradient-to-r from-green-400 to-green-500 rounded-full px-5 py-2.5 transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
        style={{ boxShadow: '0 4px 14px rgba(34,197,94,0.28)' }}
      >
        今すぐ始める
      </Link>
    </nav>
  );
}

/* ── フッター ────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="px-6 py-10 text-center border-t border-black/[0.04]">
      <div className="inline-flex items-center gap-2 font-bold text-gray-800 mb-3">
        <span
          className="w-6 h-6 rounded-[7px] bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: '0 2px 6px rgba(34,197,94,0.25)' }}
        >
          <CheckIcon size={12} strokeWidth={3} />
        </span>
        TapHabit
      </div>
      <p className="text-xs text-gray-400">© 2026 TapHabit. 1タップで続く習慣。</p>
    </footer>
  );
}

/* ── ページ本体 ──────────────────────────────────────── */
export default function LPPage() {
  return (
    <div className="min-h-screen bg-white antialiased">
      <Nav />
      <HeroSection />
      <FeaturesSection />
      <StepsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
