const { test, expect } = require('@playwright/test');
const { APP_URL, MINIMAL_DEF, setJson } = require('./helpers');

test.describe('JSONエディタ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('不正なJSONを入力するとエラーステータスを表示する', async ({ page }) => {
    await setJson(page, '{ invalid json }');
    const status = page.locator('#json-status');
    await expect(status).toContainText('⚠');
    await expect(status).toHaveCSS('color', 'rgb(248, 113, 113)');
  });

  test('有効なJSONに修正するとステータスが成功に戻る', async ({ page }) => {
    await setJson(page, '{ invalid }');
    await expect(page.locator('#json-status')).toContainText('⚠');

    await setJson(page, MINIMAL_DEF);
    await expect(page.locator('#json-status')).toHaveText('✓ 有効なJSON');
  });

  test('JSONを変更するとプレビューのアプリバーが更新される', async ({ page }) => {
    await setJson(page, MINIMAL_DEF);
    await expect(page.locator('#preview-appbar')).toContainText('テスト画面');
  });

  test('JSONを変更するとパンくずが更新される', async ({ page }) => {
    await setJson(page, MINIMAL_DEF);
    await expect(page.locator('#preview-breadcrumb')).toContainText('テスト画面');
  });

  test('screensの数に応じて画面切替タブが動的に生成される', async ({ page }) => {
    await setJson(page, MINIMAL_DEF);
    await expect(page.locator('#screen-tabs button')).toHaveCount(1);
    await expect(page.locator('#screen-tabs button').first()).toHaveText('検索');
  });

  test('screensに複数定義するとタブが増える', async ({ page }) => {
    const def = JSON.parse(MINIMAL_DEF);
    def.screens.push({
      id: 'detail',
      label: '詳細',
      type: 'form',
      fields: [],
      actions: [],
    });
    await setJson(page, JSON.stringify(def, null, 2));
    await expect(page.locator('#screen-tabs button')).toHaveCount(2);
  });

  test('タブをクリックすると対応する画面が表示される', async ({ page }) => {
    await page.locator('#screen-tabs button').nth(1).click();
    await expect(page.locator('#preview-breadcrumb')).toContainText('詳細・編集画面');
    await expect(page.locator('#preview-appbar')).toContainText('詳細・編集画面');
  });

  test('不正JSON時はプレビューが最後の有効状態を維持する', async ({ page }) => {
    await expect(page.locator('#preview-appbar')).toContainText('品目マスタ');
    await setJson(page, '{ bad }');
    await expect(page.locator('#preview-appbar')).toContainText('品目マスタ');
  });
});
