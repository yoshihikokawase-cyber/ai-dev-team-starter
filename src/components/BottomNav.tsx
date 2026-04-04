'use client';

export type TabId = 'home' | 'stats' | 'coach' | 'settings';

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'home',     icon: '🏠', label: 'ホーム'  },
  { id: 'stats',    icon: '📊', label: '統計'    },
  { id: 'coach',    icon: '🤖', label: 'コーチ'  },
  { id: 'settings', icon: '⚙️', label: '設定'    },
];

/** 画面下部の固定ナビゲーション（4タブ） */
export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto flex">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all ${
                isActive ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`text-[22px] leading-none transition-transform duration-150 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              >
                {tab.icon}
              </span>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-green-500' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* iOS ホームインジケータ用スペース */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
