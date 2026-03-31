import { CoachingParts } from '@/lib/types';

/**
 * AI が返す ①②③ 形式のテキストを構造体へパースする。
 * パースできない場合は null を返す（後方互換のため）。
 */
export function parseCoaching(content: string): CoachingParts | null {
  const positive = content.match(/①\s*([\s\S]+?)(?=②|$)/)?.[1]?.trim() ?? '';
  const analysis  = content.match(/②\s*([\s\S]+?)(?=③|$)/)?.[1]?.trim() ?? '';
  const action    = content.match(/③\s*([\s\S]+?)$/)?.[1]?.trim() ?? '';
  if (!positive && !analysis && !action) return null;
  return { positive, analysis, action };
}
