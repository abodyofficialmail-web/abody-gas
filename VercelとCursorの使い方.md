# Vercel と Cursor の連携

## できること

- **編集** … いつも通り **Cursor でコードを編集**します。
- **デプロイ** … GitHub に push すると Vercel が自動でデプロイします。または Cursor のターミナルから `npx vercel` でデプロイできます。
- **設定（環境変数など）** … Vercel のダッシュボード（ブラウザ）で設定します。一度設定すれば Cursor 側では触りません。

---

## 初回セットアップ（一度だけ）

### 1. GitHub にプロジェクトを上げる

Cursor のターミナルで（abody-gas フォルダで）:

```bash
git init
git add .
git commit -m "Initial commit"
```

GitHub で新しいリポジトリを作成し、表示されるコマンドで `git remote add origin ...` と `git push -u origin main` を実行。

### 2. Vercel でプロジェクトを作成

1. https://vercel.com にアクセス → GitHub でログイン
2. **Add New** → **Project** → さきほど push したリポジトリを選択
3. **Deploy** をクリック（いったん環境変数なしでOK）

### 3. 環境変数を Vercel に登録

1. Vercel のダッシュボードで、作成したプロジェクトを開く
2. **Settings** → **Environment Variables**
3. `.env.local` の内容をコピーして、同じ名前・値で登録する  
   - 例: `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON_PATH`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` など
4. **重要**: サービスアカウント鍵は JSON 全体を 1 行で貼るか、または「Vercel では JSON を環境変数で渡す」方式に変更が必要な場合があります（下記「Vercel でのサービスアカウント」参照）
5. 登録後、**Deployments** → 最新の右の **⋯** → **Redeploy** で再デプロイ

### 4. （任意）Cursor のターミナルから Vercel と紐づける

プロジェクトを Vercel と「紐づけ」すると、Cursor のターミナルから `vercel` コマンドでデプロイできます。

```bash
npx vercel link
```

表示に従い、Vercel のプロジェクトを選択。以後、同じフォルダで `npx vercel` または `npx vercel --prod` を実行するとデプロイされます。

---

## 普段の流れ（Cursor 側）

1. **Cursor で編集** … いつも通り `src/` や設定ファイルを編集
2. **Git で保存して GitHub に push**
   ```bash
   git add .
   git commit -m "メール文を変更"
   git push
   ```
3. **Vercel が自動でデプロイ** … 数十秒〜数分で本番 URL に反映されます

または、紐づけ済みなら Cursor のターミナルで:

```bash
npx vercel --prod
```

で手動デプロイもできます。

---

## 設定を変えたいとき

| 内容 | どこでやる |
|------|------------|
| コード・文言の変更 | **Cursor** で編集 → push（または `npx vercel --prod`） |
| 環境変数（SMTP、シートID など） | **Vercel ダッシュボード** → Settings → Environment Variables |
| ドメイン・リマインドの Cron | **Vercel ダッシュボード** → Settings |

Cursor から「Vercel の環境変数を編集」するには、Vercel CLI で `npx vercel env add` なども使えますが、初めはブラウザのダッシュボードの方が分かりやすいです。

---

## Vercel でのサービスアカウント鍵（Google）

Vercel では `service-account.json` のようなファイルは使えません。**環境変数**で対応します。

このプロジェクトは **GOOGLE_SERVICE_ACCOUNT_EMAIL** と **GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY** を環境変数で読めるようになっています。

1. Vercel の **Settings** → **Environment Variables** を開く
2. `.env.local` にある次の2つを、**同じ名前・同じ値**で登録する  
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`  
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`（`-----BEGIN PRIVATE KEY-----` ～ `-----END PRIVATE KEY-----` をそのまま。改行は `\n` のままでOK）
3. そのほか **GOOGLE_SHEET_ID**, **GOOGLE_CALENDAR_ID**, **SMTP_HOST**, **SMTP_USER**, **SMTP_PASS**, **MAIL_FROM** なども `.env.local` からコピーして登録

※ローカル（Cursor）では `GOOGLE_SERVICE_ACCOUNT_JSON_PATH=service-account.json` のまま、Vercel では上記の環境変数のみで動きます。

---

## まとめ

- **編集** … Cursor でいつも通り
- **デプロイ** … GitHub に push（自動）または Cursor のターミナルで `npx vercel --prod`
- **設定** … 環境変数・ドメインなどは Vercel のダッシュボード（ブラウザ）。Cursor と「紐づけ」すれば、Cursor からデプロイも可能。
