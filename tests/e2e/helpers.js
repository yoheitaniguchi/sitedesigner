const path = require('path');
const { pathToFileURL } = require('url');

const APP_URL = pathToFileURL(
  path.resolve(__dirname, '../../src/screen_prototype_builder.html')
).href;

/** 最小限のJSON定義（検索画面のみ） */
const MINIMAL_DEF = JSON.stringify({
  id: 'test',
  title: 'テスト画面',
  dataFields: [
    { id: 'code', label: 'コード', type: 'string', length: 10, value: 'C-001' },
    { id: 'amount', label: '金額', type: 'number', length: 10, value: 1000 },
  ],
  sampleData: [
    { code: 'C-001', amount: 1000 },
    { code: 'C-002', amount: 2000 },
  ],
  screens: [
    {
      id: 'search',
      label: '検索',
      type: 'search',
      searchFields: [
        { id: 'code', label: 'コード', type: 'text', dataFieldId: 'code' },
      ],
      grid: {
        columns: [
          { id: 'code',   label: 'コード', dataFieldId: 'code'   },
          { id: 'amount', label: '金額',   dataFieldId: 'amount' },
        ],
      },
      pagination: { pageSize: 10, totalItems: 2 },
    },
  ],
}, null, 2);

/** フォーム画面付き定義 */
const FORM_DEF = JSON.stringify({
  id: 'form-test',
  title: 'フォームテスト',
  dataFields: [
    { id: 'name', label: '名前', type: 'string', length: 50, value: '山田太郎' },
    { id: 'age',  label: '年齢', type: 'number', length: 3,  value: 30 },
  ],
  sampleData: [],
  screens: [
    {
      id: 'edit',
      label: '編集',
      type: 'form',
      fields: [
        { id: 'name', label: '名前', type: 'text',   required: true, dataFieldId: 'name' },
        { id: 'age',  label: '年齢', type: 'number', dataFieldId: 'age', unit: '歳' },
      ],
      actions: [
        {
          id: 'save', label: '保存', type: 'primary',
          api: {
            method: 'POST',
            url: 'https://api.example.com/items',
            paramMapping: [
              { param: 'name', fieldId: 'name', in: 'body' },
              { param: 'age',  fieldId: 'age',  in: 'body' },
            ],
          },
        },
        { id: 'cancel', label: 'キャンセル', type: 'secondary' },
        {
          id: 'delete', label: '削除', type: 'danger',
          api: {
            method: 'DELETE',
            url: 'https://api.example.com/items/{name}',
            paramMapping: [{ param: 'name', fieldId: 'name', in: 'path' }],
          },
        },
      ],
    },
  ],
}, null, 2);

/**
 * JSONエディタにテキストをセットしてinputイベントを発火する。
 * タブの表示/非表示にかかわらず動作するよう page.evaluate 経由で書き込む。
 * @param {import('@playwright/test').Page} page
 * @param {string} json
 */
async function setJson(page, json) {
  await page.evaluate((val) => {
    const el = document.getElementById('json-editor');
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, json);
}

module.exports = { APP_URL, MINIMAL_DEF, FORM_DEF, setJson };
