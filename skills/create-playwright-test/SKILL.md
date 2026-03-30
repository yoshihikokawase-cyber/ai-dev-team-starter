# Skill: Playwrightテストを作成する（create-playwright-test）

## このスキルの目的

実装された機能に対して、Playwrightを使った自動テストを作成します。
正常系・異常系・境界値を網羅し、CIで実行可能なテストコードを作成します。

---

## 使い方

```
skills/create-playwright-test/SKILL.md を読んで、
[機能名]のPlaywrightテストを作成してください。

仕様書: docs/requirements/[仕様書名].md
受け入れ条件: docs/requirements/acceptance-criteria.md
テスト保存先: tests/e2e/[機能名].spec.ts
```

---

## テスト作成手順

### STEP 1: 仕様書から受け入れ条件を抽出する

受け入れ条件の「Given / When / Then」をテストケースに変換します:

```
Given [前提条件] → beforeEach / テスト内の初期設定
When  [操作]     → ユーザー操作（click / fill / navigate）
Then  [期待結果] → アサーション（expect）
```

### STEP 2: テストケースを設計する

```
正常系（Happy Path）
- [ ] 正しい入力で正しく動作する
- [ ] 画面遷移が正しい
- [ ] データが正しく保存・表示される

異常系（Error Case）
- [ ] 必須項目が空の場合
- [ ] 不正な形式の入力の場合
- [ ] 権限のない操作の場合

境界値（Edge Case）
- [ ] 最小値・最大値の入力
- [ ] 文字数制限の境界
- [ ] 数値の境界（0 / 負数 / 最大値）
```

### STEP 3: テストコードを書く

```typescript
// tests/e2e/[機能名].spec.ts

import { test, expect } from '@playwright/test';

test.describe('[機能名]', () => {
  // 共通の前処理
  test.beforeEach(async ({ page }) => {
    await page.goto('/[対象ページのURL]');
  });

  // 正常系
  test.describe('正常系', () => {
    test('有効な入力で正常に完了する', async ({ page }) => {
      // Given: ページが開かれている（beforeEachで済み）

      // When: 有効な値を入力して送信する
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="submit-button"]');

      // Then: 成功メッセージが表示される / ページ遷移する
      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByText('ようこそ')).toBeVisible();
    });
  });

  // 異常系
  test.describe('異常系', () => {
    test('メールアドレスが空の場合エラーが表示される', async ({ page }) => {
      // When: メールアドレスを空にして送信
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="submit-button"]');

      // Then: エラーメッセージが表示される
      await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    });

    test('不正な形式のメールアドレスでエラーが表示される', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="submit-button"]');

      await expect(page.getByText('有効なメールアドレスを入力してください')).toBeVisible();
    });
  });

  // 境界値
  test.describe('境界値', () => {
    test('パスワード7文字でエラーが表示される（最小値未満）', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', '1234567'); // 7文字
      await page.click('[data-testid="submit-button"]');

      await expect(page.getByText('パスワードは8文字以上で入力してください')).toBeVisible();
    });

    test('パスワード8文字で正常に完了する（最小値ぴったり）', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', '12345678'); // 8文字
      await page.click('[data-testid="submit-button"]');

      await expect(page).toHaveURL('/dashboard');
    });
  });
});
```

---

## テストのベストプラクティス

### セレクターの優先順位
1. `data-testid` 属性（推奨: UIの変更に強い）
2. `getByRole` / `getByLabel`（アクセシビリティに優しい）
3. `getByText`（テキスト内容で特定）
4. CSSセレクター（最終手段）

### 非同期処理の扱い
```typescript
// ✅ 正しい: Playwrightが自動的に待機してくれる
await expect(page.getByText('成功')).toBeVisible();

// ❌ 避ける: 固定時間の待機
await page.waitForTimeout(3000);
```

### テストの独立性
```typescript
// 各テストは独立して実行できるようにする
// 共有状態（DBのデータなど）に依存しないよう注意
test.beforeEach(async ({ page }) => {
  // テストデータをリセットする処理
});
```

---

## playwright.config.ts の設定例

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
```
