import { test, expect, Page } from '@playwright/test';

// localStorage クリアヘルパー
async function clearStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

test.describe('QuickHabit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
  });

  // ──────────────────────────────────────────────
  // 正常系
  // ──────────────────────────────────────────────
  test.describe('正常系', () => {
    test('FR-01: 習慣を名前とアイコンで追加できる', async ({ page }) => {
      // 空の状態を確認
      await expect(page.getByTestId('empty-state')).toBeVisible();

      // フォームを開く
      await page.getByTestId('show-add-form').click();
      await expect(page.getByTestId('add-habit-form')).toBeVisible();

      // 名前を入力して送信
      await page.getByTestId('habit-name-input').fill('毎朝ストレッチ');
      await page.getByTestId('add-habit-submit').click();

      // 習慣が表示される
      await expect(page.getByTestId('habit-card')).toHaveCount(1);
      await expect(page.getByTestId('habit-name')).toHaveText('毎朝ストレッチ');
    });

    test('FR-02: 習慣を1タップで記録できる（完了状態になる）', async ({ page }) => {
      // 習慣を追加
      await page.getByTestId('show-add-form').click();
      await page.getByTestId('habit-name-input').fill('読書30分');
      await page.getByTestId('add-habit-submit').click();

      // 記録ボタンをタップ
      const toggleBtn = page.getByTestId('habit-toggle');
      await expect(toggleBtn).toHaveText('○');
      await toggleBtn.click();

      // 完了状態に変わる
      await expect(toggleBtn).toHaveText('✓');
    });

    test('FR-02: 同じ習慣を2回タップすると未完了に戻る（トグル動作）', async ({ page }) => {
      await page.getByTestId('show-add-form').click();
      await page.getByTestId('habit-name-input').fill('水を飲む');
      await page.getByTestId('add-habit-submit').click();

      const toggleBtn = page.getByTestId('habit-toggle');
      await toggleBtn.click();
      await expect(toggleBtn).toHaveText('✓');

      await toggleBtn.click();
      await expect(toggleBtn).toHaveText('○');
    });

    test('FR-02: 記録後に達成数カウンターが更新される', async ({ page }) => {
      await page.getByTestId('show-add-form').click();
      await page.getByTestId('habit-name-input').fill('瞑想');
      await page.getByTestId('add-habit-submit').click();

      await expect(page.getByTestId('progress-count')).toHaveText('0 / 1');
      await page.getByTestId('habit-toggle').click();
      await expect(page.getByTestId('progress-count')).toHaveText('1 / 1');
    });

    test('習慣を削除できる', async ({ page }) => {
      await page.getByTestId('show-add-form').click();
      await page.getByTestId('habit-name-input').fill('削除する習慣');
      await page.getByTestId('add-habit-submit').click();

      await expect(page.getByTestId('habit-card')).toHaveCount(1);
      await page.getByTestId('habit-delete').click();
      await expect(page.getByTestId('empty-state')).toBeVisible();
    });

    test('キャンセルボタンでフォームが閉じる', async ({ page }) => {
      await page.getByTestId('show-add-form').click();
      await expect(page.getByTestId('add-habit-form')).toBeVisible();

      await page.getByTestId('add-habit-cancel').click();
      await expect(page.getByTestId('add-habit-form')).not.toBeVisible();
    });
  });

  // ──────────────────────────────────────────────
  // 異常系
  // ──────────────────────────────────────────────
  test.describe('異常系', () => {
    test('FR-01: 習慣名が空のままでは追加できない（エラー表示）', async ({ page }) => {
      await page.getByTestId('show-add-form').click();
      // 名前を入力せずに送信
      await page.getByTestId('add-habit-submit').click();

      await expect(page.getByTestId('form-error')).toBeVisible();
      await expect(page.getByTestId('form-error')).toContainText('習慣名を入力してください');
      // 習慣は追加されない
      await expect(page.getByTestId('habit-card')).toHaveCount(0);
    });

    test('FR-01: スペースのみの入力は空文字として扱われる', async ({ page }) => {
      await page.getByTestId('show-add-form').click();
      await page.getByTestId('habit-name-input').fill('   ');
      await page.getByTestId('add-habit-submit').click();

      await expect(page.getByTestId('form-error')).toBeVisible();
    });

    test('FR-01: 31文字以上の習慣名はエラーになる', async ({ page }) => {
      await page.getByTestId('show-add-form').click();
      // 31文字を入力（maxLength=50なので入力自体は可能）
      await page.getByTestId('habit-name-input').fill('あ'.repeat(31));
      await page.getByTestId('add-habit-submit').click();

      await expect(page.getByTestId('form-error')).toBeVisible();
      await expect(page.getByTestId('form-error')).toContainText('30文字以内');
    });
  });

  // ──────────────────────────────────────────────
  // 境界値
  // ──────────────────────────────────────────────
  test.describe('境界値', () => {
    test('FR-01: ちょうど30文字の習慣名は登録できる', async ({ page }) => {
      await page.getByTestId('show-add-form').click();
      await page.getByTestId('habit-name-input').fill('あ'.repeat(30));
      await page.getByTestId('add-habit-submit').click();

      await expect(page.getByTestId('habit-card')).toHaveCount(1);
    });

    test('FR-01: 1文字の習慣名は登録できる', async ({ page }) => {
      await page.getByTestId('show-add-form').click();
      await page.getByTestId('habit-name-input').fill('A');
      await page.getByTestId('add-habit-submit').click();

      await expect(page.getByTestId('habit-card')).toHaveCount(1);
    });

    test('FR-01: 特殊文字・絵文字を含む習慣名も登録できる', async ({ page }) => {
      await page.getByTestId('show-add-form').click();
      await page.getByTestId('habit-name-input').fill('毎日ランニング🏃‍♂️');
      await page.getByTestId('add-habit-submit').click();

      await expect(page.getByTestId('habit-card')).toHaveCount(1);
    });
  });
});
