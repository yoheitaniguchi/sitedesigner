const { test, expect } = require('@playwright/test');
const { APP_URL } = require('./helpers');

test.describe('AI生成タブ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    await page.locator('#ltab-ai').click();
  });

  test('AIタブに切り替えるとAIパネルが表示される', async ({ page }) => {
    await expect(page.locator('#lpanel-ai')).toBeVisible();
    await expect(page.locator('#lpanel-json')).not.toBeVisible();
  });

  test('APIキー入力欄がデフォルトでパスワード表示', async ({ page }) => {
    const input = page.locator('#api-key-input');
    await expect(input).toHaveAttribute('type', 'password');
  });

  test('「表示」ボタンでAPIキーが平文表示に切り替わる', async ({ page }) => {
    await page.locator('#key-vis-btn').click();
    await expect(page.locator('#api-key-input')).toHaveAttribute('type', 'text');
    await expect(page.locator('#key-vis-btn')).toHaveText('隠す');
  });

  test('「隠す」ボタンで再度パスワード表示に戻る', async ({ page }) => {
    await page.locator('#key-vis-btn').click();
    await page.locator('#key-vis-btn').click();
    await expect(page.locator('#api-key-input')).toHaveAttribute('type', 'password');
    await expect(page.locator('#key-vis-btn')).toHaveText('表示');
  });

  test('不正な形式のAPIキーで警告が表示される', async ({ page }) => {
    await page.locator('#api-key-input').fill('invalid-key-12345');
    await expect(page.locator('#key-status')).toContainText('形式が正しくない');
    await expect(page.locator('#key-status')).toHaveCSS('color', 'rgb(251, 191, 36)');
  });

  test('sk-ant-で始まるキーで成功表示になる', async ({ page }) => {
    await page.locator('#api-key-input').fill('sk-ant-api03-testkey');
    await expect(page.locator('#key-status')).toContainText('✓ キーを設定済み');
    await expect(page.locator('#key-status')).toHaveCSS('color', 'rgb(34, 197, 94)');
  });

  test('APIキーを空にするとデフォルトメッセージに戻る', async ({ page }) => {
    await page.locator('#api-key-input').fill('sk-ant-api03-test');
    await page.locator('#api-key-input').fill('');
    await expect(page.locator('#key-status')).toContainText('セッション中のみ保持');
  });

  test('APIキーなしで生成ボタンを押すとエラーメッセージが表示される', async ({ page }) => {
    await page.locator('#ai-prompt').fill('取引先マスタの画面が欲しい');
    await page.locator('#ai-btn').click();
    await expect(page.locator('#ai-error')).toBeVisible();
    await expect(page.locator('#ai-error')).toContainText('APIキーを入力');
  });

  test('プロンプト入力欄が表示される', async ({ page }) => {
    await expect(page.locator('#ai-prompt')).toBeVisible();
  });

  test('「画面定義を生成」ボタンが表示される', async ({ page }) => {
    await expect(page.locator('#ai-btn')).toBeVisible();
  });

  test.describe('API呼び出しのモック', () => {
    test('有効なキーでAPIを叩くとJSONエディタに生成結果が反映される', async ({ page }) => {
      const mockResponse = {
        content: [{ type: 'text', text: JSON.stringify({
          id: 'mock-def',
          title: 'モック画面',
          dataFields: [],
          sampleData: [],
          screens: [{
            id: 'search',
            label: '検索',
            type: 'search',
            searchFields: [],
            grid: { columns: [] },
          }],
        }) }],
      };
      await page.route('https://api.anthropic.com/v1/messages', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse),
        })
      );

      await page.locator('#api-key-input').fill('sk-ant-api03-testkey');
      await page.locator('#ai-prompt').fill('テスト画面を作ってください');
      await page.locator('#ai-btn').click();

      await expect(page.locator('#json-editor')).toHaveValue(/mock-def/, { timeout: 8000 });
      await expect(page.locator('#preview-appbar')).toContainText('モック画面');
    });

    test('APIエラー時にエラーメッセージが表示される', async ({ page }) => {
      await page.route('https://api.anthropic.com/v1/messages', route =>
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Invalid API key' } }),
        })
      );

      await page.locator('#api-key-input').fill('sk-ant-api03-testkey');
      await page.locator('#ai-prompt').fill('テスト');
      await page.locator('#ai-btn').click();

      await expect(page.locator('#ai-error')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('#ai-error')).toContainText('生成エラー');
    });
  });
});
