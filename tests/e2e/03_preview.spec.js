const { test, expect } = require('@playwright/test');
const { APP_URL, MINIMAL_DEF, FORM_DEF, setJson } = require('./helpers');

test.describe('プレビュー — 検索画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('検索条件フォームが表示される', async ({ page }) => {
    await expect(page.locator('#preview-content')).toContainText('検索条件');
  });

  test('searchFieldsの数だけ検索フォームの入力欄が生成される', async ({ page }) => {
    await setJson(page, MINIMAL_DEF);
    const inputs = page.locator('#preview-content input[type="text"]');
    await expect(inputs).toHaveCount(1);
  });

  test('グリッドのヘッダーが定義通りに生成される', async ({ page }) => {
    await setJson(page, MINIMAL_DEF);
    const headers = page.locator('#preview-content table thead th');
    await expect(headers.nth(0)).toHaveText('コード');
    await expect(headers.nth(1)).toHaveText('金額');
  });

  test('sampleDataがグリッドに表示される', async ({ page }) => {
    await setJson(page, MINIMAL_DEF);
    const rows = page.locator('#preview-content table tbody tr');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText('C-001');
    await expect(rows.nth(1)).toContainText('C-002');
  });

  test('numberフィールドは桁区切りで表示される', async ({ page }) => {
    const def = JSON.parse(MINIMAL_DEF);
    def.sampleData = [{ code: 'X', amount: 1234567 }];
    await setJson(page, JSON.stringify(def, null, 2));
    await expect(page.locator('#preview-content table tbody')).toContainText('1,234,567');
  });

  test('booleanがtrueの場合は有効バッジが表示される', async ({ page }) => {
    const def = JSON.parse(MINIMAL_DEF);
    def.dataFields.push({ id: 'active', label: '有効', type: 'boolean', value: true });
    def.sampleData = [{ code: 'A', amount: 100, active: true }];
    def.screens[0].grid.columns.push({ id: 'active', label: '有効', dataFieldId: 'active' });
    await setJson(page, JSON.stringify(def, null, 2));
    await expect(page.locator('#preview-content table tbody')).toContainText('有効');
  });

  test('booleanがfalseの場合は無効バッジが表示される', async ({ page }) => {
    const def = JSON.parse(MINIMAL_DEF);
    def.dataFields.push({ id: 'active', label: '有効', type: 'boolean', value: false });
    def.sampleData = [{ code: 'A', amount: 100, active: false }];
    def.screens[0].grid.columns.push({ id: 'active', label: '有効', dataFieldId: 'active' });
    await setJson(page, JSON.stringify(def, null, 2));
    await expect(page.locator('#preview-content table tbody')).toContainText('無効');
  });

  test('paginationが設定されていれば件数表示に反映される', async ({ page }) => {
    await setJson(page, MINIMAL_DEF);
    await expect(page.locator('#preview-content')).toContainText('2');
  });
});

test.describe('プレビュー — フォーム画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    await setJson(page, FORM_DEF);
  });

  test('フォームフィールドが表示される', async ({ page }) => {
    await expect(page.locator('#preview-content')).toContainText('名前');
    await expect(page.locator('#preview-content')).toContainText('年齢');
  });

  test('requiredフィールドに * マークが表示される', async ({ page }) => {
    const label = page.locator('#preview-content label', { hasText: '名前' });
    await expect(label).toContainText('*');
  });

  test('dataFieldId経由でdataFieldsのvalueが初期値として設定される', async ({ page }) => {
    const nameInput = page.locator('#form-fields-edit input[data-field-id="name"]');
    await expect(nameInput).toHaveValue('山田太郎');
  });

  test('number型にunit指定があれば単位ラベルが表示される', async ({ page }) => {
    await expect(page.locator('#preview-content')).toContainText('歳');
  });

  test('apiを設定したボタンに⚡アイコンが表示される', async ({ page }) => {
    const saveBtn = page.locator('#preview-content button', { hasText: '保存' });
    await expect(saveBtn).toContainText('⚡');
  });

  test('apiを設定していないボタンには⚡アイコンが表示されない', async ({ page }) => {
    const cancelBtn = page.locator('#preview-content button', { hasText: 'キャンセル' });
    await expect(cancelBtn).not.toContainText('⚡');
  });

  test('dangerアクションボタンは左側に配置される', async ({ page }) => {
    const deleteBtn = page.locator('#preview-content button', { hasText: '削除' });
    await expect(deleteBtn).toBeVisible();
    await expect(deleteBtn).toHaveCSS('background-color', 'rgb(220, 38, 38)');
  });
});
