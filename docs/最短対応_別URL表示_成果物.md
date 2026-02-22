# 最短対応：LP と予約システムを別 URL で表示（成果物）

## ゴール（達成内容）

- 1 つのリポジトリから Vercel プロジェクトを 2 つ作成できる状態にした
- **LP**: https://abody-lp.vercel.app （デプロイ後）
- **予約**: https://abody-ueno-gym.vercel.app （デプロイ後）
- 別 URL で「別アプリ」だと判別できるよう、画面上部にラベルを表示

---

## 1. 変更したファイル一覧

### 新規作成（ディレクトリ・ファイル）

| パス | 説明 |
|------|------|
| `apps/lp/` | LP 用 Next.js アプリ（ルート一式のコピー） |
| `apps/lp/package.json` | 名前 `abody-lp`、scripts は dev/build/start/lint のみ |
| `apps/lp/tsconfig.json` | ルートのコピー（exclude から abody-lp を削除） |
| `apps/lp/next.config.js` | ルートのコピー |
| `apps/lp/postcss.config.js` | ルートのコピー |
| `apps/lp/tailwind.config.ts` | ルートのコピー |
| `apps/lp/src/` | ルートの `src/` を丸ごとコピー |
| `apps/lp/public/` | ルートの `public/` を丸ごとコピー |
| `apps/ueno-gym/` | 予約用 Next.js アプリ（ルート一式のコピー） |
| `apps/ueno-gym/package.json` | 名前 `abody-ueno-gym`、scripts 同上 |
| `apps/ueno-gym/tsconfig.json` | ルートのコピー（exclude 調整） |
| `apps/ueno-gym/next.config.js` | ルートのコピー |
| `apps/ueno-gym/postcss.config.js` | ルートのコピー |
| `apps/ueno-gym/tailwind.config.ts` | ルートのコピー |
| `apps/ueno-gym/vercel.json` | ルートのコピー（Cron 用） |
| `apps/ueno-gym/src/` | ルートの `src/` を丸ごとコピー |
| `apps/ueno-gym/public/` | ルートの `public/` を丸ごとコピー |

### 編集したファイル（ラベル追加・設定）

| パス | 変更内容 |
|------|----------|
| `apps/lp/src/app/layout.tsx` | 画面上部に **「LP: abody-lp」** のラベル（黄系）を追加 |
| `apps/ueno-gym/src/app/layout.tsx` | 画面上部に **「BOOKING: abody-ueno-gym」** のラベル（緑系）を追加 |

### ルート側

- ルートの `package.json` / `src/` / `vercel.json` 等は**変更していません**（従来どおり利用可能）

---

## 2. 別 URL で別画面になっている証拠（表示される文言）

デプロイ後、次のように**ラベルで判別**できます。

| URL | 画面上部に表示されるラベル |
|-----|----------------------------|
| **https://abody-lp.vercel.app** | **LP: abody-lp**（黄背景・小さく固定） |
| **https://abody-ueno-gym.vercel.app** | **BOOKING: abody-ueno-gym**（緑背景・小さく固定） |

- LP 用は **amber（黄）**、予約用は **emerald（緑）** でスタイルを分けているため、スクショでも「別アプリ」と分かります。

---

## 3. Vercel で 2 プロジェクトを Import する手順

同じ GitHub リポジトリを **2 回** Import し、**Root Directory** だけ変えます。

### (1) LP 用プロジェクト

1. Vercel ダッシュボード → **Add New…** → **Project**
2. 対象の **Git リポジトリ**を選択（例: abody-gas）
3. **Configure Project** で設定：
   - **Project Name**: `abody-lp`
   - **Root Directory**: **Edit** → `apps/lp` を指定
   - **Framework Preset**: Next.js
   - Build / Output / Install はデフォルトのままで OK
4. **Deploy**
5. デプロイ完了後、**Settings → Domains** で `abody-lp.vercel.app` を確認

### (2) 予約用プロジェクト

1. 再度 **Add New…** → **Project** で**同じリポジトリ**を選択
2. **Configure Project** で設定：
   - **Project Name**: `abody-ueno-gym`
   - **Root Directory**: **Edit** → `apps/ueno-gym` を指定
   - **Framework Preset**: Next.js
   - 環境変数は必要に応じて設定（今回の「表示だけ」では未設定でも表示は可能）
3. **Deploy**
4. **Settings → Domains** で `abody-ueno-gym.vercel.app` を確認

---

## 4. ローカル起動手順（任意）

各アプリは独立してビルド・起動できます。

```bash
# LP
cd apps/lp && npm install && npm run dev
# → デフォルトで http://localhost:3000

# 予約（別ターミナルで、ポートを変える場合）
cd apps/ueno-gym && npm install && npm run dev -p 3001
# → http://localhost:3001
```

- 両方同時に起動する場合は、片方で `npm run dev -- -p 3001` のようにポートを変更してください。
- ローカルでも画面上部に **「LP: abody-lp」** / **「BOOKING: abody-ueno-gym」** が表示され、別アプリであることが確認できます。

---

## 5. 注意（今回の範囲）

- **連動・予約の完全動作・環境変数・Cron 整理は未対応**（表示の分離のみ）
- 予約側の API / Cron / env は「残っていても OK」という前提で、両アプリとも同じソースのコピーから作成
- 今後、LP 側から予約サイトへのリンクを `https://abody-ueno-gym.vercel.app/booking` に差し替えるなどは別対応

---

## 6. ビルド確認結果

- `apps/lp`: `npm run build` 成功（Next.js 14.2.35）
- `apps/ueno-gym`: `npm run build` 成功（Next.js 14.2.35）

両方とも `/` と `/booking` および既存 API ルートを含んだままビルドできています。
