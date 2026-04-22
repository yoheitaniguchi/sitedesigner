const { test, expect } = require('@playwright/test');
const { APP_URL, MINIMAL_DEF, FORM_DEF, setJson } = require('./helpers');

test.describe('エクスポート機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test.describe('JSONエクスポート', () => {
    test('↓ JSONボタンでモーダルが開く', async ({ page }) => {
      await page.locator('button:has-text("↓ JSON")').click();
      await expect(page.locator('#modal')).toBeVisible();
    });

    test('モーダルタイトルにJSON定義エクスポートと表示される', async ({ page }) => {
      await page.locator('button:has-text("↓ JSON")').click();
      await expect(page.locator('#modal-title')).toContainText('JSON定義エクスポート');
    });

    test('モーダルのコードエリアに有効なJSONが表示される', async ({ page }) => {
      await page.locator('button:has-text("↓ JSON")').click();
      const code = await page.locator('#modal-code').textContent();
      const parsed = JSON.parse(code);
      expect(parsed.id).toBe('item-master');
      expect(parsed.dataFields).toHaveLength(8);
    });

    test('カスタム定義でJSONエクスポートすると定義が反映される', async ({ page }) => {
      await setJson(page, MINIMAL_DEF);
      await page.locator('button:has-text("↓ JSON")').click();
      const code = await page.locator('#modal-code').textContent();
      const parsed = JSON.parse(code);
      expect(parsed.id).toBe('test');
      expect(parsed.title).toBe('テスト画面');
    });

    test('閉じるボタンでモーダルが閉じる', async ({ page }) => {
      await page.locator('button:has-text("↓ JSON")').click();
      await expect(page.locator('#modal')).toBeVisible();
      await page.locator('#modal button:has-text("閉じる")').click();
      await expect(page.locator('#modal')).not.toBeVisible();
    });
  });

  test.describe('HTMLエクスポート', () => {
    test('↓ HTML出力ボタンでモーダルが開く', async ({ page }) => {
      await page.locator('button:has-text("↓ HTML出力")').click();
      await expect(page.locator('#modal')).toBeVisible();
    });

    test('モーダルタイトルにHTMLエクスポートと表示される', async ({ page }) => {
      await page.locator('button:has-text("↓ HTML出力")').click();
      await expect(page.locator('#modal-title')).toContainText('HTMLエクスポート');
    });

    test('検索画面のHTMLエクスポートはDOCTYPEを含む', async ({ page }) => {
      await page.locator('button:has-text("↓ HTML出力")').click();
      const code = await page.locator('#modal-code').textContent();
      expect(code).toContain('<!DOCTYPE html>');
    });

    test('検索画面のHTMLエクスポートはtitleを含む', async ({ page }) => {
      await page.locator('button:has-text("↓ HTML出力")').click();
      const code = await page.locator('#modal-code').textContent();
      expect(code).toContain('品目マスタ');
    });

    test('フォーム画面のHTMLエクスポート', async ({ page }) => {
      await setJson(page, FORM_DEF);
      await page.locator('#screen-tabs button').first().click();
      await page.locator('button:has-text("↓ HTML出力")').click();
      const code = await page.locator('#modal-code').textContent();
      expect(code).toContain('<!DOCTYPE html>');
      expect(code).toContain('フォームテスト');
    });

    test('フォーム画面に切り替えてHTMLエクスポートするとform要素が含まれる', async ({ page }) => {
      await page.locator('#screen-tabs button').nth(1).click();
      await page.locator('button:has-text("↓ HTML出力")').click();
      const code = await page.locator('#modal-code').textContent();
      expect(code).toContain('<!DOCTYPE html>');
      expect(code).toContain('詳細・編集画面');
    });
  });

  test.describe('モーダル共通操作', () => {
    test('📋 コピーボタンが表示される', async ({ page }) => {
      await page.locator('button:has-text("↓ JSON")').click();
      await expect(page.locator('#modal-copy-btn')).toBeVisible();
    });

    test('↓ DLボタンが表示される', async ({ page }) => {
      await page.locator('button:has-text("↓ JSON")').click();
      await expect(page.locator('#modal button:has-text("↓ DL")')).toBeVisible();
    });

    test('コピーボタンを押すと「✓ コピー済」に変わる', async ({ page }) => {
      await page.goto(APP_URL, { waitUntil: 'load' });
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'clipboard', {
          value: { writeText: () => Promise.resolve() },
          configurable: true,
        });
      });
      await page.locator('button:has-text("↓ JSON")').click();
      await page.locator('#modal-copy-btn').click();
      await expect(page.locator('#modal-copy-btn')).toHaveText('✓ コピー済');
    });
  });
});
