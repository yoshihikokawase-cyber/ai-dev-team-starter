# 動作例: Tester Agent

## サンプル案件

**テーマ**: シンプルなTodo管理Webアプリ — Todo追加フォームをテストする

---

## Playwrightモードの呼び出し例

```
agents/tester.md を読んで、
Todo追加フォームの Playwright テストを作成・実行してください。

テスト対象:
- ページ: http://localhost:3000
- 仕様書: docs/requirements/todo-feature.md
- 受け入れ条件: docs/requirements/acceptance-criteria.md

テストコードの保存先: tests/e2e/todo-form.spec.ts

以下を必ずカバーしてください:
- 正常系（有効な入力でTodoが追加される）
- 異常系（タイトル空で送信した場合のエラー）
- 境界値（タイトル1文字・255文字）
```

---

## Playwrightテストの出力例（tests/e2e/todo-form.spec.ts）

```typescript
import { test, expect } from '@playwright/test';

test.describe('Todo追加フォーム', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('正常系', () => {
    test('タイトルを入力して追加ボタンをクリックするとTodoが追加される', async ({ page }) => {
      await page.fill('[data-testid="todo-title-input"]', '買い物をする');
      await page.click('[data-testid="todo-submit-button"]');

      await expect(page.getByText('買い物をする')).toBeVisible();
    });

    test('Enterキーでも追加できる', async ({ page }) => {
      await page.fill('[data-testid="todo-title-input"]', '洗濯をする');
      await page.press('[data-testid="todo-title-input"]', 'Enter');

      await expect(page.getByText('洗濯をする')).toBeVisible();
    });

    test('追加後にフォームがリセットされる', async ({ page }) => {
      await page.fill('[data-testid="todo-title-input"]', '散歩する');
      await page.click('[data-testid="todo-submit-button"]');

      await expect(page.locator('[data-testid="todo-title-input"]')).toHaveValue('');
    });

    test('期限日を設定してTodoを追加できる', async ({ page }) => {
      await page.fill('[data-testid="todo-title-input"]', '報告書を書く');
      await page.fill('[data-testid="todo-due-date-input"]', '2026-03-31');
      await page.click('[data-testid="todo-submit-button"]');

      await expect(page.getByText('報告書を書く')).toBeVisible();
    });
  });

  test.describe('異常系', () => {
    test('タイトルが空の場合エラーメッセージが表示される', async ({ page }) => {
      await page.click('[data-testid="todo-submit-button"]');

      await expect(page.locator('[data-testid="todo-error-message"]'))
        .toHaveText('タイトルを入力してください');
    });

    test('スペースのみの場合もエラーになる', async ({ page }) => {
      await page.fill('[data-testid="todo-title-input"]', '   ');
      await page.click('[data-testid="todo-submit-button"]');

      await expect(page.locator('[data-testid="todo-error-message"]')).toBeVisible();
    });

    test('エラー後に正しい入力をすればエラーが消える', async ({ page }) => {
      await page.click('[data-testid="todo-submit-button"]');
      await expect(page.locator('[data-testid="todo-error-message"]')).toBeVisible();

      await page.fill('[data-testid="todo-title-input"]', 'テスト');
      await page.click('[data-testid="todo-submit-button"]');

      await expect(page.locator('[data-testid="todo-error-message"]')).not.toBeVisible();
    });
  });

  test.describe('境界値', () => {
    test('タイトル1文字で追加できる', async ({ page }) => {
      await page.fill('[data-testid="todo-title-input"]', 'あ');
      await page.click('[data-testid="todo-submit-button"]');

      await expect(page.getByText('あ')).toBeVisible();
    });

    test('タイトル255文字で追加できる', async ({ page }) => {
      const longTitle = 'あ'.repeat(255);
      await page.fill('[data-testid="todo-title-input"]', longTitle);
      await page.click('[data-testid="todo-submit-button"]');

      await expect(page.getByText(longTitle.substring(0, 20))).toBeVisible();
    });
  });
});
```

---

## Antigravityモードの呼び出し例

```
agents/tester.md を読んで、
Todo管理アプリ（http://localhost:3000）に対して
Google Antigravity で探索的テストを実施してください。

実施時間の目安: 30分
特に以下の観点を重点的に確認してください:
- Todo追加の異常入力（特殊文字・超長文）
- 高速連打での二重追加
- モバイルサイズ（375px）でのUI崩れ
- ページリロード後のデータ保持
```

---

## Antigravityテストの出力例

```markdown
## 探索的テストレポート（Antigravity）: Todo管理アプリ

**実施日時**: 2026-03-27 14:00
**実施時間**: 35分
**テスト対象**: http://localhost:3000

### 実施した観点
- [x] 想定外操作（追加ボタン連打・高速入力・ブラウザ戻る）
- [x] 異常入力（特殊文字・超長文・SQLインジェクション相当）
- [x] UI崩れ確認（375px / 768px / 1440px）
- [x] データ不整合確認（リロード・二重送信）

---

### 発見した不具合

| # | 概要 | 重大度 | 再現性 |
|---|---|---|---|
| 1 | 追加ボタンを素早く連打すると同じTodoが複数追加される | High | 確実 |
| 2 | 375px幅で「追加」ボタンがフォームの外にはみ出す | Medium | 確実 |
| 3 | タイトルに`<script>alert('xss')</script>`を入力してもXSSは発生しないが、表示が崩れる | Medium | 確実 |

---

### バグ報告 #1: 追加ボタン連打で同じTodoが複数追加される

**重大度**: High

**発生条件**
- ブラウザ: Chrome 120
- OS: Windows 11
- 画面サイズ: 1440px

**再現手順**
1. http://localhost:3000 を開く
2. タイトル入力欄に「テスト」と入力する
3. 「追加」ボタンを素早く3回クリックする（0.5秒以内）

**期待する動作**: Todoが1件だけ追加される

**実際の動作**: 「テスト」というTodoが3件追加される

**Engineerへの補足**:
送信後にボタンを一時的にdisabledにするか、
送信処理中のフラグ（isSubmitting）でガードする実装が必要と思われます。

---

### バグ報告 #2: 375px幅で追加ボタンがはみ出す

**重大度**: Medium

**再現手順**
1. ブラウザの幅を375pxに変更する
2. Todo追加フォームを確認する

**期待する動作**: ボタンがフォーム内に収まっている

**実際の動作**: 「追加」ボタンが画面右端からはみ出て見切れている

**Engineerへの補足**: CSS の `flex-wrap: wrap` またはボタン幅の見直しで解消できると思われます。

---

### 気づき・改善提案

- タイトルの最大文字数制限がないため、1000文字以上入力できてしまう（UIが崩れる）
- 期限日に過去の日付を入れても何も警告が出ない（UX改善の余地）

---

### 総評
❌ 修正が必要（High: 1件 / Medium: 2件 / Low: 0件）

Highバグ（二重送信）を修正後、再テストをお願いします。
```

---

## Engineerへの差し戻し例

```
agents/engineer.md を読んで、以下のバグを修正してください:

【バグ #1 / 重大度: High】
「追加」ボタンを素早く連打すると、同じTodoが複数追加される。

再現手順:
1. タイトル入力欄に「テスト」と入力する
2. 「追加」ボタンを0.5秒以内に3回クリックする

修正方針の提案（参考）:
送信中は isSubmitting フラグを true にしてボタンを disabled にする。
または、onSubmit 関数内で送信中の重複呼び出しをガードする。

修正後に再テストを実施します。
```

---

## ポイント

- **Playwright**: 受け入れ条件を自動テスト化している（data-testid を使用）
- **Antigravity**: 想定外操作から高優先度のバグを発見している
- **バグ報告が具体的**: 再現手順が明確で、Engineerがすぐ着手できる
- **差し戻しが明快**: 「agents/engineer.md を読んで〜」と明示して連携している
