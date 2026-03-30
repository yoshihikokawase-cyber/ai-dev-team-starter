'use client';

import { useState } from 'react';

const ICONS = ['💪', '🏃', '📚', '💧', '😴', '🧘', '🥗', '✍️', '🎯', '🌅'];

interface Props {
  onAdd: (name: string, icon: string) => void;
  onCancel: () => void;
}

export default function AddHabitForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💪');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('習慣名を入力してください');
      return;
    }
    if (name.trim().length > 30) {
      setError('習慣名は30文字以内にしてください');
      return;
    }
    onAdd(name.trim(), icon);
  }

  return (
    <div
      data-testid="add-habit-form"
      className="bg-white rounded-xl border-2 border-blue-200 p-4 mb-4"
    >
      <h3 className="font-semibold text-gray-700 mb-3">新しい習慣を追加</h3>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-2 mb-3">
          {ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              data-testid={`icon-option`}
              onClick={() => setIcon(ic)}
              className={`text-2xl p-1 rounded-lg transition-all ${
                icon === ic
                  ? 'bg-blue-100 scale-110 ring-2 ring-blue-400'
                  : 'hover:bg-gray-100'
              }`}
              aria-label={`アイコン ${ic} を選択`}
              aria-pressed={icon === ic}
            >
              {ic}
            </button>
          ))}
        </div>

        <input
          data-testid="habit-name-input"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          placeholder="習慣名を入力（例: 毎朝ストレッチ）"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-blue-400"
          maxLength={50}
        />

        {error && (
          <p data-testid="form-error" className="text-red-500 text-xs mb-2">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            data-testid="add-habit-submit"
            type="submit"
            className="flex-1 bg-blue-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            追加する
          </button>
          <button
            data-testid="add-habit-cancel"
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
