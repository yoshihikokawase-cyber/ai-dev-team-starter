import { test, expect } from '@playwright/test';

// ローカルストレージをリセットするヘルパー
async function resetStorage(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    localStorage.removeItem('quickhabit_habits');
    localStorage.removeItem('quickhabit_logs');
    localStorage.removeItem('quickhabit_report');
  });
}

// 習慣を1件追加するヘルパー
async function addHabit(page: import('@playwright/test').Page, name = 'テスト習慣', icon = '💪') {
  await page.click('[data-testid="show-add-form"]');
  await page.fill('input[placeholder="例: 朝のストレッチ"]', name);
  // アイコンはデフォルトで選択済みの想定
  await page.click('[data-testid="add-habit-submit"]');
}

test.describe('Day02 HabitCard チェック体験 + 7日グラフ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await resetStorage(page);
    await page.reload();
  });

  test.describe('正常系', () => {
    test('AC-01: チェックボタンをタップすると緑に変わる', async ({ page }) => {
      await addHabit(page);
      const toggleBtn = page.locator('[data-testid="habit-toggle"]').first();
      await expect(toggleBtn).toHaveText('○');
      await toggleBtn.click();
      await expect(toggleBtn).toHaveText('✓');
      await expect(toggleBtn).toHaveClass(/bg-green-400/);
    });

    test('AC-02: HabitCardに7つの小丸が表示される', async ({ page }) => {
      await addHabit(page);
      const graph = page.locator('[data-testid="habit-mini-graph"]').first();
      await expect(graph).toBeVisible();
      const dots = graph.locator('div > div');
      await expect(dots).toHaveCount(7);
    });

    test('AC-03: ログがない場合、7つ全てグレー（bg-gray-200）', async ({ page }) => {
      await addHabit(page);
      const graph = page.locator('[data-testid="habit-mini-graph"]').first();
      const coloredDots = graph.locator('.bg-green-400');
      await expect(coloredDots).toHaveCount(0);
    });

    test('AC-04: チェック後、今日の丸が緑になる', async ({ page }) => {
      await addHabit(page);
      await page.locator('[data-testid="habit-toggle"]').first().click();
      const today = new Date().toISOString().split('T')[0];
      const todayDot = page.locator(`[data-testid="graph-dot-${today}"]`).first();
      await expect(todayDot.locator('div')).toHaveClass(/bg-green-400/);
    });

    test('AC-05: 今日の丸に青いリングが付いている', async ({ page }) => {
      await addHabit(page);
      const today = new Date().toISOString().split('T')[0];
      const todayDot = page.locator(`[data-testid="graph-dot-${today}"]`).first();
      await expect(todayDot.locator('div')).toHaveClass(/ring-blue-400/);
    });

    test('AC-06: チェックを2回押すと未完了に戻る（トグル）', async ({ page }) => {
      await addHabit(page);
      const toggleBtn = page.locator('[data-testid="habit-toggle"]').first();
      await toggleBtn.click();
      await expect(toggleBtn).toHaveText('✓');
      await toggleBtn.click();
      await expect(toggleBtn).toHaveText('○');
    });
  });

  test.describe('異常系', () => {
    test('AE-01: 習慣が0件の場合、グラフは表示されない', async ({ page }) => {
      const graph = page.locator('[data-testid="habit-mini-graph"]');
      await expect(graph).toHaveCount(0);
    });
  });

  test.describe('境界値', () => {
    test('BV-01: 10件の習慣すべてにグラフが表示される', async ({ page }) => {
      for (let i = 1; i <= 10; i++) {
        await addHabit(page, `習慣${i}`);
      }
      const graphs = page.locator('[data-testid="habit-mini-graph"]');
      await expect(graphs).toHaveCount(10);
    });
  });
});
