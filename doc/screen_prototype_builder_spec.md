# 画面プロトタイプビルダー 仕様書

**バージョン:** 1.0  
**作成日:** 2026-04-14  
**対象ファイル:** `screen_prototype_builder.html`

---

## 1. 概要

### 1.1 目的

JSON定義ファイルをもとに、社内業務向けWeb画面のプロトタイプをリアルタイムで描画・確認し、スタンドアロンHTMLとしてエクスポートできるツール。要件定義・レビュー・ステークホルダーへのデモを主な用途とする。

### 1.2 主な特徴

- JSON定義を編集するとプレビューがリアルタイムに更新される
- AIへの自然言語入力から画面定義JSONを自動生成できる
- 画面定義（UIレイアウト）とデータ定義（フィールド仕様）を一体で管理できる
- 検索画面・詳細編集画面の2種類の画面テンプレートに対応
- プロトタイプをスタンドアロンHTMLファイルとしてエクスポートできる
- 外部ライブラリ不要。単一HTMLファイルとして動作する

### 1.3 動作環境

| 項目 | 内容 |
|------|------|
| 形式 | スタンドアロン HTML ファイル（単一ファイル） |
| 実行環境 | モダンブラウザ（Chrome / Edge / Safari / Firefox 最新版） |
| 外部依存 | Anthropic API（AI生成機能を使用する場合のみ） |
| サーバー不要 | ローカルファイルとして直接ブラウザで開いて使用可能 |

---

## 2. 画面構成

### 2.1 全体レイアウト

```
┌──────────────────────────────────────────────────────────────────────┐
│ トップバー（ツール名 ／ 画面切替タブ ／ エクスポートボタン）              │
├─────────────────────────┬────────────────────────────────────────────┤
│                         │  プレビューヘッダー（パンくず）              │
│  左パネル（380px）        ├────────────────────────────────────────────┤
│  ├ 📄 JSON タブ          │                                            │
│  ├ 📊 データタブ          │  プレビューエリア                           │
│  └ ✨ AI生成タブ          │  （検索画面 or 詳細・編集画面）              │
│                         │                                            │
└─────────────────────────┴────────────────────────────────────────────┘
```

### 2.2 トップバー

| 要素 | 内容 |
|------|------|
| ツール名ロゴ | 「画面プロトタイプビルダー」 |
| 画面切替タブ | 定義に含まれる screens[] の数だけ動的に生成 |
| ↓ JSON ボタン | 現在の定義をJSON形式でエクスポート |
| ↓ HTML出力 ボタン | 現在プレビュー中の画面をスタンドアロンHTMLとしてエクスポート |

### 2.3 左パネル

#### 📄 JSON タブ

- テキストエリアに直接JSONを編集する
- 入力のたびにパース処理を実行し、成功時はプレビューを即時更新
- ステータスバーに「✓ 有効なJSON」または「⚠ パースエラー内容」を表示

#### 📊 データタブ

`dataFields` と `screens` の対応関係を表形式で可視化する。

| 列 | 内容 |
|----|------|
| 項目ID | フィールドID（monospace） |
| 項目名 | 論理名 |
| 型 | データ型バッジ（string / number / date / boolean で色分け） |
| 長さ | 文字数・桁数制限 |
| 値 | `dataFields[].value` のサンプル値 |
| 対応画面項目 | 「検索: ラベル」「一覧: ラベル」「フォーム: ラベル」形式のバッジ |

JSONを編集するとデータタブの内容もリアルタイムに更新される。

#### ✨ AI生成タブ

- Anthropic APIキーを入力する（`sessionStorage` に保持。タブを閉じると消去）
- 日本語でUI要件を記述し「画面定義を生成」ボタンを押すと、AIが定義JSONを生成してJSONエディタに反映する
- APIキーの形式バリデーション（`sk-ant-` プレフィックスチェック）

### 2.4 プレビューエリア

- 現在選択中の画面定義を業務システム風のUIで描画する
- アプリケーションヘッダー（紺色バー）と本体コンテンツで構成
- 画面種別（`search` / `form`）に応じてレイアウトを自動切替

---

## 3. JSONスキーマ仕様

### 3.1 ルート構造

```json
{
  "id":         "（文字列）定義の識別子",
  "title":      "（文字列）画面タイトル",
  "dataFields": [ ... ],
  "sampleData": [ ... ],
  "screens":    [ ... ]
}
```

### 3.2 dataFields（データフィールド定義）

データモデルのフィールド仕様を定義する。`screens` 内の各フィールドから `dataFieldId` で参照される。

```json
{
  "id":     "（文字列・必須）フィールドID（キャメルケース推奨）",
  "label":  "（文字列・必須）論理名",
  "type":   "（文字列・必須）データ型。string | number | date | boolean",
  "length": "（数値）最大桁数または文字数",
  "value":  "（任意型）サンプル値。フォームプレビューの初期値として使用"
}
```

**データ型とサンプル値の対応**

| `type` | `value` の型 | プレビュー表示 |
|--------|-------------|---------------|
| `string` | 文字列 | テキストそのまま |
| `number` | 数値 | `toLocaleString('ja-JP')` で桁区切り |
| `date` | `"YYYY-MM-DD"` 形式文字列 | date input に反映 |
| `boolean` | `true` / `false` | 一覧: 「有効」（緑）/ 「無効」（グレー）バッジ |

### 3.3 sampleData（サンプルデータ）

検索一覧のプレビュー行データを定義する。省略した場合はツール組み込みのフォールバックデータを使用する。

```json
[
  { "fieldId1": "値1", "fieldId2": "値2", ... },
  ...
]
```

- `fieldId` は `dataFields[].id` と一致させる（必須ではないが推奨）
- 行数に制限はないが、プレビューは定義した全行を表示する

### 3.4 screens（画面定義）

#### 共通プロパティ

```json
{
  "id":    "（文字列・必須）画面識別子",
  "label": "（文字列・必須）画面名（タブに表示）",
  "type":  "（文字列・必須）search | form"
}
```

#### 3.4.1 search（検索画面）

```json
{
  "id": "search",
  "label": "検索画面",
  "type": "search",
  "searchFields": [ <SearchField>, ... ],
  "grid": {
    "columns": [ <GridColumn>, ... ]
  },
  "pagination": {
    "pageSize":   10,
    "totalItems": 100
  }
}
```

**SearchField プロパティ**

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ○ | フィールドID |
| `label` | string | ○ | ラベル文言 |
| `type` | string | ○ | 入力型（後述） |
| `dataFieldId` | string | - | 対応するデータフィールドID |
| `placeholder` | string | - | プレースホルダー（text/number） |
| `options` | string[] | - | 選択肢（select） |
| `min` | number | - | 最小値（number） |
| `max` | number | - | 最大値（number） |
| `step` | number | - | ステップ（number。デフォルト: 1） |

**GridColumn プロパティ**

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ○ | 列ID（sampleData のキーと対応） |
| `label` | string | ○ | 列ヘッダー文言 |
| `dataFieldId` | string | - | 対応するデータフィールドID |

**pagination プロパティ**

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `pageSize` | number | 1ページあたりの件数 |
| `totalItems` | number | 総件数（ページネーション計算に使用） |

省略した場合は sampleData の件数を総件数として扱う。ページボタンは最大7個まで表示する。

#### 3.4.2 form（詳細・編集画面）

```json
{
  "id": "detail",
  "label": "詳細・編集画面",
  "type": "form",
  "fields":  [ <FormField>, ... ],
  "actions": [ <Action>, ... ]
}
```

**FormField プロパティ**

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ○ | フィールドID |
| `label` | string | ○ | ラベル文言 |
| `type` | string | ○ | 入力型（後述） |
| `required` | boolean | - | 必須フラグ（`*` マーク表示） |
| `dataFieldId` | string | - | 対応するデータフィールドID |
| `options` | string[] | - | 選択肢（select） |
| `min` | number | - | 最小値（number） |
| `max` | number | - | 最大値（number） |
| `step` | number | - | ステップ（number。デフォルト: 1） |
| `unit` | string | - | 単位ラベル（例: 「円」。number の右側に表示） |
| `defaultChecked` | boolean | - | チェックボックスの初期状態 |
| `checkboxLabel` | string | - | チェックボックス横のラベル（省略時は `label` を使用） |

**Action プロパティ**

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | ○ | アクションID |
| `label` | string | ○ | ボタン文言 |
| `type` | string | ○ | `primary`（青）/ `secondary`（白）/ `danger`（赤） |
| `api` | object | - | API呼び出し定義（後述）。設定するとボタンにAPIが紐付く |

- `danger` ボタンはフォーム左側に配置される
- `primary` / `secondary` ボタンはフォーム右側に配置される
- `api` を設定したボタンにはプレビュー上で ⚡ アイコンが表示され、クリックするとAPI呼び出しが実行される

**api プロパティ**

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `method` | string | ○ | HTTPメソッド（`GET` / `POST` / `PUT` / `PATCH` / `DELETE`） |
| `url` | string | ○ | エンドポイントURL。パスパラメータは `{paramName}` 形式で埋め込む |
| `headers` | object | - | 追加リクエストヘッダー（`Content-Type: application/json` は自動付与） |
| `paramMapping` | ParamMapping[] | - | 画面フィールドとAPIパラメータのマッピング定義 |

**ParamMapping プロパティ**

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `param` | string | ○ | APIパラメータ名 |
| `fieldId` | string | ○ | 対応するフォームフィールドID（`fields[].id`） |
| `in` | string | ○ | パラメータ位置: `body`（リクエストボディ）/ `query`（クエリ文字列）/ `path`（URLパス埋め込み） |

**API呼び出しの動作**

1. ボタンクリック時にフォームの現在値を収集
2. `paramMapping` に従い、`body` / `query` / `path` へ値をマッピング
3. `fetch` でAPIを呼び出し、リクエスト内容とレスポンスをモーダルで表示
4. データタブの「API定義 — アクション連携」セクションにマッピング定義が可視化される

---

## 4. フィールド入力型一覧

### 4.1 検索フォーム（searchFields）

| `type` | UI部品 | 備考 |
|--------|--------|------|
| `text` | `<input type="text">` | `placeholder` を表示 |
| `select` | `<select>` | `options` から選択肢を生成 |
| `date` | `<input type="date">` | ブラウザネイティブのdate picker |
| `number` | `<input type="number">` | `min` / `max` / `step` に対応 |
| `checkbox` | `<input type="checkbox">` | グリッド2列をまたぐ全幅表示。ラベルはフィールドの `label` を使用 |

### 4.2 編集フォーム（fields）

| `type` | UI部品 | 備考 |
|--------|--------|------|
| `text` | `<input type="text">` | `dataFields.value` または `value` を初期値に設定 |
| `textarea` | `<textarea rows="3">` | リサイズ不可 |
| `select` | `<select>` | `options` から選択肢を生成。初期値は `dataFields.value` と一致する選択肢を自動選択 |
| `date` | `<input type="date">` | `dataFields.value`（`YYYY-MM-DD` 形式）を初期値に設定 |
| `number` | `<input type="number">` | 幅140px固定。`unit` 指定時は右側に単位ラベルを表示 |
| `checkbox` | `<input type="checkbox">` | `dataFields.value` または `defaultChecked` で初期状態を設定 |

### 4.3 グリッド列の値表示

| データ型 | 表示方式 |
|----------|----------|
| `boolean: true` | 「有効」バッジ（緑） |
| `boolean: false` | 「無効」バッジ（グレー） |
| `number` | `toLocaleString('ja-JP')` で桁区切り表示 |
| その他 | そのまま文字列として表示 |

---

## 5. dataFieldId によるマッピング

画面フィールド（`searchFields` / `grid.columns` / `fields`）の `dataFieldId` に `dataFields[].id` を指定することで、データ定義と画面定義を紐付ける。

**値解決の優先順位（フォーム初期値）**

1. `dataFieldId` が指定されていれば `dataFields` から `value` を取得
2. `dataFieldId` がなければフィールド自身の `value` プロパティを使用
3. いずれもなければ空文字

**マッピングなし（省略可能）**

`dataFieldId` は省略可能。省略した場合、`dataFields` との連動は行われないが、画面定義単体としては正常に動作する。

---

## 6. エクスポート機能

### 6.1 HTMLエクスポート

現在プレビュー中の画面（`search` または `form`）を単一のスタンドアロンHTMLファイルとして出力する。

- Tailwind CSS CDN不使用（インラインスタイルのみで完結）
- sampleData の内容をHTMLに埋め込む
- ダウンロードファイル名: `{definition.id}-{screen.id}.html`

**出力HTMLの構成**

```
<!DOCTYPE html>
  <header>  タイトル / 画面名
  <main>
    ├─（search）検索条件フォーム + 検索結果グリッド + ページネーション
    └─（form）  編集フォーム + アクションボタン
```

### 6.2 JSONエクスポート

現在の定義全体（`dataFields` / `sampleData` / `screens` を含む）を整形済みJSONとして出力する。

- ダウンロードファイル名: `{definition.id}.json`
- エクスポートしたJSONは再インポート（JSONエディタへの貼り付け）が可能

### 6.3 エクスポートモーダル

コードプレビュー（緑文字のダークテーマ）、コピー、ダウンロードの3操作を提供する。

---

## 7. AI生成機能

### 7.1 概要

Anthropic API（`claude-sonnet-4-20250514`）を使用して、自然言語の要件説明から画面定義JSONを自動生成する。

### 7.2 APIキーの扱い

| 項目 | 仕様 |
|------|------|
| 入力場所 | ✨ AI生成タブ内 |
| 表示 | `type="password"` でマスク。「表示」ボタンで平文切替 |
| 保存先 | `sessionStorage`（タブを閉じると自動消去） |
| バリデーション | `sk-ant-` プレフィックスチェック。不一致時は警告表示 |

### 7.3 プロンプト入力のコツ

- 管理対象（例: 取引先、在庫、受注）を明示する
- 必要な検索条件を列挙する
- フォームに含める項目名と型（日付、数値、区分など）を具体的に書く
- 「検索と編集画面が必要」のように必要な画面種別を明示する

**入力例:**
```
取引先マスタの画面が欲しい。
項目は取引先コード、取引先名、担当者名、電話番号、メールアドレス、契約日、有効フラグ。
検索画面と詳細編集画面が必要。ページサイズは10件。
```

### 7.4 生成されるスキーマ

AI生成機能が参照するスキーマは画面定義スキーマに加え、`dataFields` / `sampleData` / `dataFieldId` のマッピングも含む完全スキーマを対象とする。

---

## 8. 定義JSONの完全サンプル

以下は品目マスタの完全なサンプル定義。

```json
{
  "id": "item-master",
  "title": "品目マスタ",

  "dataFields": [
    { "id": "itemCode",       "label": "品目コード", "type": "string",  "length": 10,  "value": "ITM-001"         },
    { "id": "itemName",       "label": "品名",       "type": "string",  "length": 100, "value": "アルミフレーム A型" },
    { "id": "description",    "label": "説明",       "type": "string",  "length": 500, "value": "アルミ製フレーム材" },
    { "id": "itemCategory",   "label": "品目区分",   "type": "string",  "length": 20,  "value": "原材料"            },
    { "id": "itemType",       "label": "品種",       "type": "string",  "length": 20,  "value": "A種"               },
    { "id": "unitPrice",      "label": "単価",       "type": "number",  "length": 10,  "value": 4800               },
    { "id": "registeredDate", "label": "登録日",     "type": "date",    "length": 10,  "value": "2024-04-01"       },
    { "id": "isActive",       "label": "有効",       "type": "boolean", "length": 1,   "value": true               }
  ],

  "sampleData": [
    { "itemCode": "ITM-001", "itemName": "アルミフレーム A型", "itemCategory": "原材料", "itemType": "A種", "unitPrice": 4800,  "registeredDate": "2024-04-01", "isActive": true  },
    { "itemCode": "ITM-002", "itemName": "ステンレスボルト M8", "itemCategory": "副資材", "itemType": "B種", "unitPrice": 120,   "registeredDate": "2024-04-15", "isActive": true  },
    { "itemCode": "ITM-003", "itemName": "樹脂カバー Type-C",  "itemCategory": "半製品", "itemType": "C種", "unitPrice": 2200,  "registeredDate": "2024-05-10", "isActive": false }
  ],

  "screens": [
    {
      "id": "search",
      "label": "検索画面",
      "type": "search",
      "searchFields": [
        { "id": "itemCode",     "label": "品目コード", "type": "text",     "dataFieldId": "itemCode",     "placeholder": "例: ITM-001" },
        { "id": "itemCategory", "label": "品目区分",   "type": "select",   "dataFieldId": "itemCategory", "options": ["（全て）","原材料","半製品","製品","副資材"] },
        { "id": "regFrom",      "label": "登録日",     "type": "date",     "dataFieldId": "registeredDate" },
        { "id": "isActive",     "label": "有効のみ",   "type": "checkbox" }
      ],
      "grid": {
        "columns": [
          { "id": "itemCode",       "label": "品目コード", "dataFieldId": "itemCode"       },
          { "id": "itemName",       "label": "品名",       "dataFieldId": "itemName"       },
          { "id": "itemCategory",   "label": "品目区分",   "dataFieldId": "itemCategory"   },
          { "id": "unitPrice",      "label": "単価",       "dataFieldId": "unitPrice"      },
          { "id": "registeredDate", "label": "登録日",     "dataFieldId": "registeredDate" },
          { "id": "isActive",       "label": "有効",       "dataFieldId": "isActive"       }
        ]
      },
      "pagination": { "pageSize": 10, "totalItems": 47 }
    },
    {
      "id": "detail",
      "label": "詳細・編集画面",
      "type": "form",
      "fields": [
        { "id": "itemCode",       "label": "品目コード", "type": "text",     "required": true, "dataFieldId": "itemCode"       },
        { "id": "itemName",       "label": "品名",       "type": "text",     "required": true, "dataFieldId": "itemName"       },
        { "id": "description",    "label": "説明",       "type": "textarea",                   "dataFieldId": "description"    },
        { "id": "itemCategory",   "label": "品目区分",   "type": "select",   "required": true, "dataFieldId": "itemCategory",  "options": ["原材料","半製品","製品","副資材"] },
        { "id": "itemType",       "label": "品種",       "type": "select",   "required": true, "dataFieldId": "itemType",      "options": ["A種","B種","C種"] },
        { "id": "unitPrice",      "label": "単価",       "type": "number",   "min": 0,         "dataFieldId": "unitPrice",     "unit": "円" },
        { "id": "registeredDate", "label": "登録日",     "type": "date",     "required": true, "dataFieldId": "registeredDate" },
        { "id": "isActive",       "label": "有効",       "type": "checkbox", "defaultChecked": true, "dataFieldId": "isActive" }
      ],
      "actions": [
        { "id": "save", "label": "保存", "type": "primary",
          "api": {
            "method": "POST",
            "url": "https://api.example.com/items",
            "paramMapping": [
              { "param": "code",     "fieldId": "itemCode",     "in": "body" },
              { "param": "name",     "fieldId": "itemName",     "in": "body" },
              { "param": "category", "fieldId": "itemCategory", "in": "body" },
              { "param": "price",    "fieldId": "unitPrice",    "in": "body" }
            ]
          }
        },
        { "id": "cancel", "label": "キャンセル", "type": "secondary" },
        { "id": "delete", "label": "削除", "type": "danger",
          "api": {
            "method": "DELETE",
            "url": "https://api.example.com/items/{itemCode}",
            "paramMapping": [
              { "param": "itemCode", "fieldId": "itemCode", "in": "path" }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## 9. 技術仕様

### 9.1 実装構成

| 区分 | 内容 |
|------|------|
| フォーマット | 単一 HTML ファイル（`screen_prototype_builder.html`） |
| フロントエンド | バニラ JavaScript（ES2020）、インラインスタイル |
| 外部CSS | なし |
| 外部JS | なし |
| API呼び出し | Anthropic Messages API `v1/messages`（AI生成時のみ） |
| 使用モデル | `claude-sonnet-4-20250514` |
| APIキー保存 | `sessionStorage`（永続化なし） |

### 9.2 主要関数

| 関数名 | 役割 |
|--------|------|
| `init()` | 初期化（デフォルト定義のロード、初回描画） |
| `handleJsonChange(text)` | JSONパースとプレビュー更新 |
| `switchLeftTab(tab)` | 左パネルのタブ切替（`json` / `data` / `ai`） |
| `renderScreenTabs()` | 上部の画面切替タブを動的生成 |
| `renderPreview()` | 右パネルのプレビューを更新 |
| `renderSearch(sc)` | 検索画面HTMLを生成（文字列返却） |
| `renderForm(sc)` | 編集フォームHTMLを生成（文字列返却） |
| `renderDataDefPanel()` | データ定義テーブルを生成・描画 |
| `getFieldValue(f)` | `dataFieldId` 経由でサンプル値を解決 |
| `getSampleRows()` | `sampleData` またはフォールバックデータを返す |
| `handleAiGenerate()` | Anthropic APIを呼び出してJSONを生成 |
| `genSearchHtml(sc)` | 検索画面のエクスポート用HTMLを生成 |
| `genFormHtml(sc)` | 編集フォームのエクスポート用HTMLを生成 |
| `handleExportHtml()` | HTMLエクスポートモーダルを開く |
| `handleExportJson()` | JSONエクスポートモーダルを開く |
| `handleDownload()` | ファイルダウンロードを実行 |
| `callActionApi(scId, actionId)` | アクションに紐づくAPIを呼び出す。フォーム値を収集してリクエストを構築し結果モーダルを表示 |
| `renderApiModal(label, req, res, loading)` | API呼び出し結果モーダルを描画（リクエスト内容・レスポンスを表示） |

### 9.3 既知の制約

| 制約 | 内容 |
|------|------|
| 画面種別 | `search`（検索画面）と `form`（編集フォーム）の2種類のみ |
| 複数画面間の遷移 | 定義可能だが、画面遷移ロジックはプレビューに含まれない |
| グリッドソート | 定義・プレビューともに未対応 |
| バリデーション | プレビュー上では動作しない（レイアウト確認のみ） |
| AI生成のsampleData | AIが生成するsampleDataの件数・品質はプロンプト内容に依存 |
| CORS | AI生成機能はブラウザの CORS 制限を受ける。`anthropic-dangerous-direct-browser-access: true` ヘッダーを送信 |

---

## 10. 今後の拡張候補

| 優先度 | 拡張項目 |
|--------|----------|
| 高 | グリッドのソート定義（昇順/降順） |
| 高 | バリデーションルール定義（必須/最大長/パターン） |
| 中 | 画面間ナビゲーション定義（一覧→詳細の遷移） |
| 中 | ダッシュボード型画面テンプレート（KPIカード + グラフ） |
| 中 | ウィザード型フォーム（ステップ進行） |
| 低 | CSV/JSON定義ファイルの直接インポート |
| 低 | 複数定義ファイルの切替管理 |
