const { test, expect } = require('@playwright/test');
const { APP_URL } = require('./helpers');

test.describe('初期レイアウト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('ツール名が表示される', async ({ page }) => {
    await expect(page.locator('text=画面プロトタイプビルダー')).toBeVisible();
  });

  test('デフォルトで検索画面タブが選択されている', async ({ page }) => {
    const activeTab = page.locator('#screen-tabs button').first();
    await expect(activeTab).toHaveText('検索画面');
    await expect(activeTab).toHaveCSS('background-color', 'rgb(37, 99, 235)');
  });

  test('左パネルの3タブが表示される', async ({ page }) => {
    await expect(page.locator('text=📄 JSON')).toBeVisible();
    await expect(page.locator('text=📊 データ')).toBeVisible();
    await expect(page.locator('text=✨ AI生成')).toBeVisible();
  });

  test('JSONタブがデフォルトで選択されている', async ({ page }) => {
    const jsonPanel = page.locator('#lpanel-json');
    await expect(jsonPanel).toBeVisible();
  });

  test('JSONエディタにデフォルト定義が読み込まれている', async ({ page }) => {
    const editorValue = await page.locator('#json-editor').inputValue();
    const parsed = JSON.parse(editorValue);
    expect(parsed.id).toBe('item-master');
    expect(parsed.title).toBe('品目マスタ');
    expect(parsed.dataFields).toHaveLength(8);
    expect(parsed.screens).toHaveLength(2);
  });

  test('JSONステータスが有効を表示する', async ({ page }) => {
    await expect(page.locator('#json-status')).toHaveText('✓ 有効なJSON');
  });

  test('上部に画面切替タブが2つ表示される', async ({ page }) => {
    const tabs = page.locator('#screen-tabs button');
    await expect(tabs).toHaveCount(2);
    await expect(tabs.nth(0)).toHaveText('検索画面');
    await expect(tabs.nth(1)).toHaveText('詳細・編集画面');
  });

  test('エクスポートボタンが表示される', async ({ page }) => {
    await expect(page.locator('button:has-text("↓ JSON")')).toBeVisible();
    await expect(page.locator('button:has-text("↓ HTML出力")')).toBeVisible();
  });

  test('プレビューに品目マスタが表示される', async ({ page }) => {
    await expect(page.locator('#preview-appbar')).toContainText('品目マスタ');
    await expect(page.locator('#preview-breadcrumb')).toContainText('品目マスタ');
  });
});
