import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TapHabit — 1タップ習慣記録',
  description: '毎日の習慣を1タップで記録し、AIが週次フィードバックを提供します',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
