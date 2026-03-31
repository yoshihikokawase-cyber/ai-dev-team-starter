'use client';

import { DayStatus } from '@/lib/storage';

interface Props {
  weekStatus: DayStatus[];
}

export default function HabitMiniGraph({ weekStatus }: Props) {
  return (
    <div
      data-testid="habit-mini-graph"
      className="flex gap-1 mt-2"
    >
      {weekStatus.map((day) => (
        <div
          key={day.date}
          data-testid={`graph-dot-${day.date}`}
          className="flex flex-col items-center gap-0.5"
        >
          <div
            className={`w-6 h-6 rounded-full transition-colors ${
              day.completed
                ? 'bg-green-400'
                : 'bg-gray-200'
            } ${
              day.isToday
                ? 'ring-2 ring-blue-400 ring-offset-1'
                : ''
            }`}
          />
          <span className="text-xs text-gray-300 leading-none">
            {day.dayLabel}
          </span>
        </div>
      ))}
    </div>
  );
}
