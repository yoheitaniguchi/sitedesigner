const { test, expect } = require('@playwright/test');
const { APP_URL, MINIMAL_DEF, setJson } = require('./helpers');

test.describe('データタブ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    await page.locator('#ltab-data').click();
  });

  test('データタブに切り替えるとパネルが表示される', async ({ page }) => {
    await expect(page.locator('#lpanel-data')).toBeVisible();
    await expect(page.locator('#lpanel-json')).not.toBeVisible();
  });

  test('デフォルト定義の8フィールドが表示される', async ({ page }) => {
    const rows = page.locator('#data-def-body > table > tbody > tr');
    await expect(rows).toHaveCount(8);
  });

  test('項目IDが読み取り専用で表示される', async ({ page }) => {
    const firstIdCell = page.locator('#data-def-body > table > tbody > tr:first-child td:first-child');
    await expect(firstIdCell).toHaveText('itemCode');
    await expect(firstIdCell.locator('input')).toHaveCount(0);
  });

  test('項目名の入力欄が表示される', async ({ page }) => {
    const labelInput = page.locator('#data-def-body > table > tbody > tr:first-child td:nth-child(2) input');
    await expect(labelInput).toBeVisible();
    await expect(labelInput).toHaveValue('品目コード');
  });

  test('型のセレクトボックスが表示される', async ({ page }) => {
    const typeSelect = page.locator('#data-def-body > table > tbody > tr:first-child td:nth-child(3) select');
    await expect(typeSelect).toBeVisible();
    await expect(typeSelect).toHaveValue('string');
  });

  test('長さの入力欄が表示される', async ({ page }) => {
    const lenInput = page.locator('#data-def-body > table > tbody > tr:first-child td:nth-child(4) input');
    await expect(lenInput).toBeVisible();
    await expect(lenInput).toHaveValue('10');
  });

  test('文字列型の値欄はテキスト入力', async ({ page }) => {
    const valInput = page.locator('#data-def-body > table > tbody > tr:first-child td:nth-child(5) input[type="text"]');
    await expect(valInput).toBeVisible();
    await expect(valInput).toHaveValue('ITM-001');
  });

  test('number型の値欄は数値入力', async ({ page }) => {
    const unitPriceRow = page.locator('#data-def-body > table > tbody > tr:nth-child(6)');
    const valInput = unitPriceRow.locator('td:nth-child(5) input[type="number"]');
    await expect(valInput).toBeVisible();
    await expect(valInput).toHaveValue('4800');
  });

  test('date型の値欄は日付入力', async ({ page }) => {
    const dateRow = page.locator('#data-def-body > table > tbody > tr:nth-child(7)');
    const valInput = dateRow.locator('td:nth-child(5) input[type="date"]');
    await expect(valInput).toBeVisible();
    await expect(valInput).toHaveValue('2024-04-01');
  });

  test('boolean型の値欄はセレクト（true/false）', async ({ page }) => {
    const boolRow = page.locator('#data-def-body > table > tbody > tr:last-child');
    const valSelect = boolRow.locator('td:nth-child(5) select');
    await expect(valSelect).toBeVisible();
    await expect(valSelect).toHaveValue('true');
  });

  test.describe('インライン編集 — JSONへの反映', () => {
    test.beforeEach(async ({ page }) => {
      await setJson(page, MINIMAL_DEF);
      await page.locator('#ltab-data').click();
    });

    test('項目名を編集するとJSONエディタに反映される', async ({ page }) => {
      const labelInput = page.locator('#data-def-body > table > tbody > tr:first-child td:nth-child(2) input');
      await labelInput.fill('コードID');
      const jsonValue = await page.locator('#json-editor').inputValue();
      const parsed = JSON.parse(jsonValue);
      expect(parsed.dataFields[0].label).toBe('コードID');
    });

    test('値を編集するとJSONエディタに反映される', async ({ page }) => {
      const valInput = page.locator('#data-def-body > table > tbody > tr:first-child td:nth-child(5) input[type="text"]');
      await valInput.fill('C-999');
      const jsonValue = await page.locator('#json-editor').inputValue();
      const parsed = JSON.parse(jsonValue);
      expect(parsed.dataFields[0].value).toBe('C-999');
    });

    test('長さを編集するとJSONエディタに反映される', async ({ page }) => {
      const lenInput = page.locator('#data-def-body > table > tbody > tr:first-child td:nth-child(4) input');
      await lenInput.fill('20');
      const jsonValue = await page.locator('#json-editor').inputValue();
      const parsed = JSON.parse(jsonValue);
      expect(parsed.dataFields[0].length).toBe(20);
    });

    test('number型の値を編集すると数値としてJSONに反映される', async ({ page }) => {
      const amountRow = page.locator('#data-def-body > table > tbody > tr:nth-child(2)');
      const valInput = amountRow.locator('td:nth-child(5) input[type="number"]');
      await valInput.fill('9999');
      const jsonValue = await page.locator('#json-editor').inputValue();
      const parsed = JSON.parse(jsonValue);
      expect(typeof parsed.dataFields[1].value).toBe('number');
      expect(parsed.dataFields[1].value).toBe(9999);
    });

    test('boolean型の値を変更するとJSONに反映される', async ({ page }) => {
      await page.goto(APP_URL);
      await page.locator('#ltab-data').click();
      const boolRow = page.locator('#data-def-body > table > tbody > tr:last-child');
      const valSelect = boolRow.locator('td:nth-child(5) select');
      await valSelect.selectOption('false');
      const jsonValue = await page.locator('#json-editor').inputValue();
      const parsed = JSON.parse(jsonValue);
      expect(parsed.dataFields[7].value).toBe(false);
    });

    test('型を変更するとJSONのtypeが更新される', async ({ page }) => {
      const typeSelect = page.locator('#data-def-body > table > tbody > tr:first-child td:nth-child(3) select');
      await typeSelect.selectOption('number');
      const jsonValue = await page.locator('#json-editor').inputValue();
      const parsed = JSON.parse(jsonValue);
      expect(parsed.dataFields[0].type).toBe('number');
    });

    test('型を変更するとvalueがデフォルト値にリセットされる', async ({ page }) => {
      const typeSelect = page.locator('#data-def-body > table > tbody > tr:first-child td:nth-child(3) select');
      await typeSelect.selectOption('number');
      const jsonValue = await page.locator('#json-editor').inputValue();
      const parsed = JSON.parse(jsonValue);
      expect(parsed.dataFields[0].value).toBe(0);
    });

    test('型変更後に値の入力欄がその型に応じた要素に切り替わる', async ({ page }) => {
      const typeSelect = page.locator('#data-def-body > table > tbody > tr:first-child td:nth-child(3) select');
      await typeSelect.selectOption('date');
      const valInput = page.locator('#data-def-body > table > tbody > tr:first-child td:nth-child(5) input[type="date"]');
      await expect(valInput).toBeVisible();
    });
  });

  test.describe('API定義セクション', () => {
    test('apiを持つアクションがある場合にAPI定義セクションが表示される', async ({ page }) => {
      await expect(page.locator('#data-def-body')).toContainText('API定義');
    });

    test('APIカードにメソッドとURLが表示される', async ({ page }) => {
      await expect(page.locator('#data-def-body')).toContainText('POST');
      await expect(page.locator('#data-def-body')).toContainText('https://api.example.com/items');
    });

    test('paramMappingのマッピング行が表示される', async ({ page }) => {
      await expect(page.locator('#data-def-body')).toContainText('code');
      await expect(page.locator('#data-def-body')).toContainText('body');
    });
  });
});
