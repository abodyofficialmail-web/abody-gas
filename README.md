# ジム個人利用予約システム

Next.js (App Router) + TypeScript で実装されたジム個人利用の予約サイトです。

## 機能

- 会員ID + PIN でのログイン
- Googleカレンダーの空き枠から30分枠を選んで予約
- 月回数制限チェック（4回/8回/無制限）
- 予約確定時にGoogle Calendarにイベント作成、Google Sheetsに記録
- 予約確定メールを会員のメールアドレスに送信（SMTP設定時）
- 予約前に確認画面で会員名・日時・枠を確認してから確定
- 既存会員の一括登録（無制限プラン、PIN自動生成）
- ダブルブッキング防止（freebusy API使用）

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして、実際の値を設定してください。

```bash
cp .env.local.example .env.local
```

`.env.local` を編集：

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GOOGLE_SHEET_ID=your-spreadsheet-id
TIMEZONE=Asia/Tokyo
SLOT_MINUTES=30
DAYS_AHEAD=14
OPEN_HOUR=9
CLOSE_HOUR=22

# 予約確定メール送信（任意）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=your-email@gmail.com
```

### 3. Google側の設定

#### Service Account の作成

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「APIとサービス」→「認証情報」→「認証情報を作成」→「サービスアカウント」
3. サービスアカウントを作成し、JSONキーをダウンロード
4. JSONキーから `client_email` と `private_key` を取得

#### Calendar API の有効化

1. 「APIとサービス」→「ライブラリ」
2. 「Google Calendar API」を検索して有効化

#### Sheets API の有効化

1. 「APIとサービス」→「ライブラリ」
2. 「Google Sheets API」を検索して有効化

#### カレンダーの共有

1. Googleカレンダーで新しいカレンダーを作成（例：「ジム個人利用予約」）
2. カレンダーの設定 → 「特定のユーザーと共有」
3. Service Account のメールアドレスを追加し、「予定の変更」権限を付与
4. カレンダーIDを取得（設定 → 「カレンダーの統合」→「カレンダーID」）

#### スプレッドシートの作成

1. 新しいGoogleスプレッドシートを作成
2. 以下の3シートを作成し、1行目にヘッダーを設定：

**members シート**
```
A1: memberId
B1: name
C1: plan
D1: pin
E1: active
```

**usage シート**
```
A1: memberId
B1: month
C1: count
```

**bookings シート**
```
A1: bookingId
B1: memberId
C1: start
D1: end
E1: eventId
F1: createdAt
```

3. スプレッドシートをService Accountのメールアドレスと共有（編集権限）

4. スプレッドシートIDを取得（URLの `/d/` と `/edit` の間の文字列）

### 4. テストデータの追加

`members` シートにテスト会員を追加：

```
memberId: TEST001
name: テスト会員
plan: 4
pin: 1234
active: TRUE
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## API エンドポイント

### POST /api/availability

空き枠を取得します。

**リクエスト:**
```json
{
  "dayIndex": 0
}
```

**レスポンス:**
```json
{
  "date": "2026-02-15",
  "slots": [
    {
      "start": "2026-02-15T09:00:00+09:00",
      "end": "2026-02-15T09:30:00+09:00"
    }
  ]
}
```

### POST /api/book

予約を確定します。

**リクエスト:**
```json
{
  "memberId": "TEST001",
  "pin": "1234",
  "start": "2026-02-15T09:00:00+09:00",
  "end": "2026-02-15T09:30:00+09:00"
}
```

**レスポンス:**
```json
{
  "bookingId": "abc123",
  "remaining": 3
}
```

## curl テスト例

### 空き枠取得

```bash
curl -X POST http://localhost:3000/api/availability \
  -H "Content-Type: application/json" \
  -d '{"dayIndex": 0}'
```

### 予約

```bash
curl -X POST http://localhost:3000/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "TEST001",
    "pin": "1234",
    "start": "2026-02-15T09:00:00+09:00",
    "end": "2026-02-15T09:30:00+09:00"
  }'
```

## エラーレスポンス

- `401`: 認証失敗（会員IDまたはPINが不正）
- `403`: 予約上限に達している
- `409`: この時間帯は既に予約されている（ダブルブッキング）
- `400`: リクエストデータが不正

## ファイル構成

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── availability/
│   │   │   │   └── route.ts
│   │   │   └── book/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       ├── auth.ts
│       ├── calendar.ts
│       ├── google.ts
│       ├── sheets.ts
│       └── validation.ts
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
├── README.md
└── tsconfig.json
```

## 注意事項

- 営業時間は毎日 9:00〜22:00（定休日なし）
- 予約枠は30分固定
- 予約できる期間は今日〜14日先まで
- 同時利用は1人（Googleカレンダーの予定がある時間は埋まる）
- 回数カウントの単位は予約開始日時が属する月（Asia/Tokyo）
