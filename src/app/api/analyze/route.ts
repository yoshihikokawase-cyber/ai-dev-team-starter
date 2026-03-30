import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

interface HabitStat {
  id: string;
  name: string;
  icon: string;
  completedDays: number;
}

export async function POST(request: NextRequest) {
  // API キー未設定チェック（起動時ではなくリクエスト時に検証）
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[analyze] ANTHROPIC_API_KEY が設定されていません。.env.local を確認してください。');
    return NextResponse.json(
      { error: 'サーバー設定エラー: APIキーが未設定です。管理者に連絡してください。' },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const { habits } = (await request.json()) as { habits: HabitStat[] };

    if (!habits || habits.length === 0) {
      return NextResponse.json({ error: '習慣データがありません' }, { status: 400 });
    }

    const statsText = habits
    .map(
      (h) =>
        `- ${h.icon} ${h.name}: ${h.completedDays}/7日達成（達成率${Math.round((h.completedDays / 7) * 100)}%）`
    )
    .join('\n');

  const prompt = `あなたは習慣コーチです。ユーザーの過去7日間の習慣記録を分析し、日本語で温かく励ましながら具体的なアドバイスを提供してください。

習慣データ（過去7日間）:
${statsText}

以下の3点を300文字以内で出力してください:
① 今週の総評（1文）
② 最も頑張った習慣への称賛（1文）
③ 来週の改善アドバイス（具体的に1つだけ）`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const content =
    message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ report: content });
  } catch (error) {
    console.error('[analyze] Error:', error);
    return NextResponse.json(
      { error: 'レポートの生成に失敗しました' },
      { status: 500 }
    );
  }
}
