const { test, expect } = require('@playwright/test');
const { APP_URL, FORM_DEF, setJson } = require('./helpers');

test.describe('APIアクション呼び出し', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    await setJson(page, FORM_DEF);
  });

  test('apiを設定したアクションボタンに⚡が表示される', async ({ page }) => {
    const saveBtn = page.locator('#preview-content button', { hasText: '保存' });
    await expect(saveBtn).toContainText('⚡');
    const deleteBtn = page.locator('#preview-content button', { hasText: '削除' });
    await expect(deleteBtn).toContainText('⚡');
  });

  test('apiを設定していないボタンに⚡が表示されない', async ({ page }) => {
    const cancelBtn = page.locator('#preview-content button', { hasText: 'キャンセル' });
    await expect(cancelBtn).not.toContainText('⚡');
  });

  test.describe('APIモーダル', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('https://api.example.com/**', route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: '{"result":"ok"}' })
      );
    });

    test('保存ボタンをクリックするとAPIモーダルが開く', async ({ page }) => {
      await page.locator('#preview-content button', { hasText: '保存' }).click();
      await expect(page.locator('#api-modal')).toBeVisible();
    });

    test('APIモーダルのタイトルにアクション名が表示される', async ({ page }) => {
      await page.locator('#preview-content button', { hasText: '保存' }).click();
      await expect(page.locator('#api-modal-title')).toContainText('保存');
      await expect(page.locator('#api-modal-title')).toContainText('API呼び出し');
    });

    test('REQUESTセクションにHTTPメソッドとURLが表示される', async ({ page }) => {
      await page.locator('#preview-content button', { hasText: '保存' }).click();
      await expect(page.locator('#api-modal-body')).toContainText('POST');
      await expect(page.locator('#api-modal-body')).toContainText('https://api.example.com/items');
    });

    test('フォームの入力値がリクエストボディに反映される', async ({ page }) => {
      const nameInput = page.locator('#form-fields-edit input[data-field-id="name"]');
      await nameInput.fill('テストユーザー');
      await page.locator('#preview-content button', { hasText: '保存' }).click();
      await expect(page.locator('#api-modal-body')).toContainText('テストユーザー');
    });

    test('モックレスポンスがRESPONSEセクションに表示される', async ({ page }) => {
      await page.locator('#preview-content button', { hasText: '保存' }).click();
      await expect(page.locator('#api-modal-body')).toContainText('HTTP 200', { timeout: 8000 });
      await expect(page.locator('#api-modal-body')).toContainText('"result"');
    });

    test('pathパラメータがURLに正しく埋め込まれる（DELETEアクション）', async ({ page }) => {
      await page.locator('#preview-content button', { hasText: '削除' }).click();
      await expect(page.locator('#api-modal-body')).toContainText('DELETE');
      await expect(page.locator('#api-modal-body')).toContainText('/items/');
    });

    test('閉じるボタンでAPIモーダルが閉じる', async ({ page }) => {
      await page.locator('#preview-content button', { hasText: '保存' }).click();
      await expect(page.locator('#api-modal')).toBeVisible();
      await page.locator('#api-modal button:has-text("閉じる")').click();
      await expect(page.locator('#api-modal')).not.toBeVisible();
    });
  });

  test.describe('API呼び出しエラー', () => {
    test('ネットワークエラーの場合にエラーメッセージが表示される', async ({ page }) => {
      await page.route('https://api.example.com/**', route => route.abort('failed'));
      await page.locator('#preview-content button', { hasText: '保存' }).click();
      await expect(page.locator('#api-modal-body')).toContainText('エラー', { timeout: 8000 });
    });

    test('4xxレスポンスもRESPONSEに表示される', async ({ page }) => {
      await page.route('https://api.example.com/**', route =>
        route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"not found"}' })
      );
      await page.locator('#preview-content button', { hasText: '保存' }).click();
      await expect(page.locator('#api-modal-body')).toContainText('HTTP 404', { timeout: 8000 });
    });
  });
});
