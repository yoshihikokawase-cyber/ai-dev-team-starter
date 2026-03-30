# 動作例: Engineer Agent

## サンプル案件

**テーマ**: シンプルなTodo管理Webアプリ — Todo追加フォームを実装する

---

## 呼び出し例

```
agents/engineer.md を読んで、
docs/requirements/todo-feature.md の仕様に従い、
Todo追加フォームを実装してください。

技術スタック:
- フロントエンド: React 18 + TypeScript
- スタイル: CSS Modules（または Tailwind CSS）
- 状態管理: React useState（外部ライブラリ不要）

実装前に:
1. src/ フォルダーの既存コードを確認する
2. 変更するファイルを列挙する
3. 影響範囲を整理する

実装後に検証結果をまとめてください。
```

---

## Engineerエージェントの出力例

```markdown
## 実装レポート: Todo追加フォーム

---

### 1. 方針

仕様書 FR-01, FR-05, FR-06 に対応するフォームコンポーネントを作成する。
- タイトル必須・期限日任意の入力フォーム
- バリデーション（空文字チェック）
- Enterキーでの送信対応

既存コードを確認したところ、src/components/ は空の状態のため、
新規コンポーネントを作成する形で進める。

---

### 2. 変更ファイル一覧

| ファイルパス | 変更種別 | 変更内容 |
|---|---|---|
| src/components/TodoForm.tsx | 新規作成 | Todo追加フォームコンポーネント |
| src/components/TodoForm.module.css | 新規作成 | フォームのスタイル |
| src/types/todo.ts | 新規作成 | Todo型定義 |
| src/App.tsx | 変更 | TodoFormコンポーネントを組み込む |

---

### 3. 実装内容

**src/types/todo.ts**
```typescript
export interface Todo {
  id: string;
  title: string;
  dueDate?: string;  // ISO 8601形式（YYYY-MM-DD）
  completed: boolean;
  createdAt: string;
}

export interface CreateTodoInput {
  title: string;
  dueDate?: string;
}
```

**src/components/TodoForm.tsx**
```typescript
import { useState, FormEvent } from 'react';
import { CreateTodoInput } from '../types/todo';
import styles from './TodoForm.module.css';

interface TodoFormProps {
  onSubmit: (input: CreateTodoInput) => void;
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // バリデーション（FR-05）
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    setError('');
    onSubmit({
      title: title.trim(),
      dueDate: dueDate || undefined,
    });

    // フォームをリセット（UC-01の事後条件）
    setTitle('');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Todoを入力..."
          className={styles.titleInput}
          data-testid="todo-title-input"
          aria-label="Todoのタイトル"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={styles.dateInput}
          data-testid="todo-due-date-input"
          aria-label="期限日"
        />
        <button
          type="submit"
          className={styles.submitButton}
          data-testid="todo-submit-button"
        >
          追加
        </button>
      </div>
      {error && (
        <p className={styles.errorMessage} role="alert" data-testid="todo-error-message">
          {error}
        </p>
      )}
    </form>
  );
}
```

---

### 4. 検証結果

- ビルド: ✅ 成功（`npm run build` エラーなし）
- 型チェック: ✅ 通過（`npm run type-check` エラーなし）
- 手動確認:
  - ✅ 正常入力でTodoが追加される
  - ✅ 空文字でエラーメッセージが表示される
  - ✅ Enterキーで送信できる
  - ✅ 送信後にフォームがリセットされる
  - ✅ data-testid が設定されておりPlaywrightテストを書ける状態

---

### 5. 残課題

- データ永続化（FR-07）: 現状はReact stateのみ。LocalStorageまたはAPIへの保存は次タスクで実装
  優先度: High
- 期限日が過去の場合の警告表示: 仕様書に記載なしのためスコープ外と判断
  優先度: Low（次フェーズで確認）
```

---

## ポイント

- **実装前に方針を明示**: 何をどう作るかを先に宣言している
- **data-testid を設定**: Testerエージェントがすぐにテストを書ける
- **aria-label を設定**: アクセシビリティに配慮している
- **残課題が明確**: スコープ外と判断したものは理由付きで記録している
- **検証結果が具体的**: 「確認した」ではなく何を確認したかが書かれている
