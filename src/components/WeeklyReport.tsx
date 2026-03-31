'use client';

import { WeeklyReportData } from '@/lib/types';

interface Props {
  report: WeeklyReportData;
}

export default function WeeklyReport({ report }: Props) {
  return (
    <div
      data-testid="weekly-report"
      className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-4 mt-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🤖</span>
        <h3 className="font-semibold text-purple-800">今週のふり返り</h3>
        <span className="text-xs text-gray-400 ml-auto">
          {new Date(report.generatedAt).toLocaleDateString('ja-JP')}
        </span>
      </div>
      <p
        data-testid="report-content"
        className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
      >
        {report.content}
      </p>
    </div>
  );
}
