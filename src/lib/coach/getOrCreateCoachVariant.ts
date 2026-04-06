const VARIANT_KEY = 'taphabit_variant';

/**
 * A/B variant を取得または初回生成して localStorage に保存する。
 * A: やさしい系、B: 少し行動促進系
 */
export function getOrCreateCoachVariant(): 'A' | 'B' {
  if (typeof window === 'undefined') return 'A';
  const stored = localStorage.getItem(VARIANT_KEY);
  if (stored === 'A' || stored === 'B') return stored;
  const variant = Math.random() < 0.5 ? 'A' : 'B';
  localStorage.setItem(VARIANT_KEY, variant);
  return variant;
}
