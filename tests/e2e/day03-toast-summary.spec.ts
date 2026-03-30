import { test, expect, Page } from '@playwright/test';

async function clearStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

async function addHabit(page: Page, name: string) {
  await page.getByTestId('show-add-form').click();
  await page.getByTestId('habit-name-input').fill(name);
  await page.getByTestId('add-habit-submit').click();
}

test.describe('Day03: 完了トースト & 週次サマリー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
  });

  // ──────────────────────────────────────────────
  // 正常系
  // ──────────────────────────────────────────────
  test.describe('正常系', () => {
    test('FR-01: 習慣を完了するとトーストが表示される', async ({ page }) => {
      await addHabit(page, 'ストレッチ');

      await page.getByTestId('habit-toggle').click();

      const toast = page.getByTestId('toast');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('ストレッチ 完了！');
    });

    test('FR-01: トーストは3秒後に自動消去される', async ({ page }) => {
      await addHabit(page, 'ランニング');

      await page.getByTestId('habit-toggle').click();
      await expect(page.getByTestId('toast')).toBeVisible();

      // 3秒待機後に消える
      await page.waitForTimeout(3200);
      await expect(page.getByTestId('toast')).not.toBeVisible();
    });

    test('FR-01: 習慣をOFF（取り消し）してもトーストは表示されない', async ({ page }) => {
      await addHabit(page, '読書');

      // 完了にする
      await page.getByTestId('habit-toggle').click();
      // トーストが消えるのを待つ
      await page.waitForTimeout(3200);

      // 取り消しにする
      await page.getByTestId('habit-toggle').click();
      await expect(page.getByTestId('toast')).not.toBeVisible();
    });

    test('FR-02: 全習慣完了時に特別トーストが表示される', async ({ page }) => {
      await addHabit(page, '習慣A');
      await addHabit(page, '習慣B');

      const toggles = page.getByTestId('habit-toggle');
      await toggles.first().click();
      // 通常トーストを待つ
      await page.waitForTimeout(3200);

      // 2件目を完了 → 全完了トースト
      await toggles.last().click();
      const toast = page.getByTestId('toast');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('全部完了');
    });

    test('FR-03: 習慣が1件以上ある場合、週次サマリーが表示される', async ({ page }) => {
      await addHabit(page, '瞑想');

      await expect(page.getByTestId('weekly-summary')).toBeVisible();
    });

    test('FR-03: 週次サマリーに全体達成率が表示される', async ({ page }) => {
      await addHabit(page, '水を飲む');

      await expect(page.getByTestId('weekly-overall-rate')).toBeVisible();
      // 何もしていないのでデータなし → 0%
      await expect(page.getByTestId('weekly-overall-rate')).toHaveText('0%');
    });

    test('FR-03: 週次サマリーに各習慣の達成数が表示される', async ({ page }) => {
      await addHabit(page, '日記');

      await expect(page.getByTestId('weekly-habit-row')).toHaveCount(1);
      await expect(page.getByTestId('weekly-habit-count')).toBeVisible();
    });
  });

  // ──────────────────────────────────────────────
  // 異常系
  // ──────────────────────────────────────────────
  test.describe('異常系', () => {
    test('習慣が0件の場合、週次サマリーは表示されない', async ({ page }) => {
      await expect(page.getByTestId('weekly-summary')).not.toBeVisible();
    });

    test('トーストは1件ずつ表示され、連打しても多重表示にならない', async ({ page }) => {
      await addHabit(page, '連打テスト');
      // 一度完了してから取り消してから再完了（連続操作）
      await page.getByTestId('habit-toggle').click();
      await page.waitForTimeout(3200);
      await page.getByTestId('habit-toggle').click(); // OFF
      await page.getByTestId('habit-toggle').click(); // ON → toast

      const toasts = page.getByTestId('toast');
      await expect(toasts).toHaveCount(1);
    });
  });

  // ──────────────────────────────────────────────
  // 境界値
  // ──────────────────────────────────────────────
  test.describe('境界値', () => {
    test('習慣が1件だけで完了すると全完了トーストが表示される', async ({ page }) => {
      await addHabit(page, '唯一の習慣');

      await page.getByTestId('habit-toggle').click();

      const toast = page.getByTestId('toast');
      await expect(toast).toBeVisible();
      // 1件 = 全完了 → 特別トースト
      await expect(toast).toContainText('全部完了');
    });

    test('週次サマリーは今日完了した習慣の達成数を即時反映する', async ({ page }) => {
      await addHabit(page, '即時確認');

      // 初期は 0/7
      await expect(page.getByTestId('weekly-habit-count')).toHaveText('0');

      // 完了
      await page.getByTestId('habit-toggle').click();

      // 1/7 に更新される
      await expect(page.getByTestId('weekly-habit-count')).toHaveText('1');
    });
  });
});
