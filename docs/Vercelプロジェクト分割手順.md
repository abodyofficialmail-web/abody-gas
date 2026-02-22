# Vercel で LP と上野店個室利用ジムを別URLで運用する手順

## 現状

- **1 つの Next.js アプリ**（リポジトリルート）がそのまま Vercel にデプロイされている
- ルート `/` = LP、`/booking` = 個室利用予約、`/api/*` = 共通API のため、**同じ `*.vercel.app` に上書き**されている
- リポジトリには `abody-lp/`（別 Next アプリ）や `feedback-cloud/` もあるが、**モノレポ構成（apps/ 配下）にはなっていない**

---

## 方針：モノレポ化して Root Directory で分離

LP 用と個室利用用で **Vercel プロジェクトを 2 つ**に分け、それぞれ別の **Root Directory** を指定してデプロイする。

| アプリ | Root Directory | 想定プロジェクト名 | 想定 URL（xxx.vercel.app） |
|--------|----------------|---------------------|----------------------------|
| **LP** | `apps/lp` | `abody-lp` | **abody-lp.vercel.app** |
| **上野店個室利用ジム** | `apps/ueno-gym` | `abody-ueno-gym` | **abody-ueno-gym.vercel.app** |

※ 既存の `abody-lp` フォルダは別物なので、LP 用は新たに `apps/lp` を用意する想定です。

---

## 1. モノレポ用ディレクトリ構成（案）

リポジトリを次のように整理する。

```
abody-gas/                    # リポジトリルート
├── apps/
│   ├── lp/                   # LP 専用 Next.js（Root Directory: apps/lp）
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx   # LP のみ
│   │   │   │   └── globals.css
│   │   │   ├── components/lp/
│   │   │   └── lib/
│   │   │       └── constants.ts
│   │   └── public/
│   │
│   └── ueno-gym/             # 個室利用専用 Next.js（Root Directory: apps/ueno-gym）
│       ├── package.json
│       ├── next.config.js
│       ├── vercel.json       # crons: send-reminders
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx   # リダイレクト or 簡易トップ
│       │   │   ├── booking/page.tsx
│       │   │   ├── globals.css
│       │   │   └── api/
│       │   │       ├── availability/
│       │   │       ├── book/
│       │   │       ├── my-bookings/
│       │   │       ├── cancel-booking/
│       │   │       └── send-reminders/
│       │   └── lib/
│       └── public/
│
├── abody-gas/                # GAS 用（従来どおり）
├── feedback-cloud/
└── package.json              # ルートは workspace 用 or 未使用
```

- **apps/lp**: LP 用のみ（`/` のみ。`/booking` や予約 API は持たない）
- **apps/ueno-gym**: 個室利用の予約画面（`/booking`）と、予約・マイカルテ・キャンセル・リマインド用 API のみ

---

## 2. 各アプリの Root Directory と役割

| 項目 | apps/lp | apps/ueno-gym |
|------|---------|----------------|
| **Vercel Root Directory** | `apps/lp` | `apps/ueno-gym` |
| **ルート `/`** | LP トップ | リダイレクト to `/booking` または簡易案内 |
| **/booking** | なし | 個室利用予約ページ |
| **API** | なし（または LP 用だけ） | availability, book, my-bookings, cancel-booking, send-reminders |
| **Cron** | なし | send-reminders（vercel.json） |

---

## 3. Vercel で別プロジェクトとして Import する手順

### 共通：リポジトリは 1 つのまま

- 同じ Git リポジトリ（例: `abody-gas`）を **2 回** Import し、**プロジェクト名と Root Directory だけ変える**形で 2 プロジェクトにする。

---

### プロジェクト 1：LP（abody-lp）

1. **Vercel ダッシュボード** → **Add New…** → **Project**
2. **Import Git Repository** で同じリポジトリ（abody-gas）を選択
3. **Configure Project** で以下を設定：
   - **Project Name**: `abody-lp`
   - **Root Directory**: **Edit** → `apps/lp` を指定
   - **Framework Preset**: Next.js
   - **Build Command**: 空欄（Next のデフォルト）または `npm run build` / `pnpm run build`
   - **Output Directory**: 空欄（Next のデフォルト）
   - **Install Command**: `npm install` など（apps/lp 直下で実行される）
4. **Environment Variables**: LP 用（例: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_LINE_URL` など必要なら）を設定
5. **Deploy** する
6. デプロイ後、**Settings → Domains** で `abody-lp.vercel.app` を確認（カスタムドメインもここで追加可能）

---

### プロジェクト 2：上野店個室利用ジム（abody-ueno-gym）

1. 再度 **Add New…** → **Project** で **同じリポジトリ** を Import
2. **Configure Project** で以下を設定：
   - **Project Name**: `abody-ueno-gym`
   - **Root Directory**: **Edit** → `apps/ueno-gym` を指定
   - **Framework Preset**: Next.js
   - **Build Command**: 空欄または `npm run build`
   - **Output Directory**: 空欄
   - **Install Command**: `npm install` など
3. **Environment Variables**: 個室利用・API 用（GCP、スプレッドシート、メール、`NEXT_PUBLIC_SITE_URL` など）を **すべて** 設定
4. **Deploy** する
5. **Settings → Domains** で `abody-ueno-gym.vercel.app` を確認
6. **Cron**: `vercel.json` の `send-reminders` は apps/ueno-gym に含めておけば、このプロジェクトだけで実行される

---

## 4. プロジェクト名と想定 URL のまとめ

| 用途 | Vercel Project Name | 想定 URL（デフォルト） |
|------|----------------------|-------------------------|
| LP（体験予約・キャンペーン等） | `abody-lp` | **https://abody-lp.vercel.app** |
| 上野店個室利用ジム（予約・マイカルテ・API） | `abody-ueno-gym` | **https://abody-ueno-gym.vercel.app** |

- カスタムドメインを使う場合は、各プロジェクトの **Settings → Domains** で追加する。
- 例: LP → `abody.jp`、個室利用 → `booking.abody.jp` など。

---

## 5. 分割後にやること（コード側）

1. **apps/lp** と **apps/ueno-gym** を、現在のルートの Next アプリから **必要なファイルだけコピーして作成**する（上記ディレクトリ構成に合わせる）。
2. **LP 側（apps/lp）**  
   - 個室利用へのリンクは、**絶対URL** で `https://abody-ueno-gym.vercel.app/booking` を指定する（定数化推奨）。
3. **GAS・マイカルテ（abody-gas/member_index.html）**  
   - 予約ページ・キャンセル API の URL を **abody-ueno-gym** 用に変更する。  
     - 予約ページ: `https://abody-ueno-gym.vercel.app/booking`  
     - キャンセル API: `https://abody-ueno-gym.vercel.app/api/cancel-booking`
4. **環境変数**  
   - `abody-ueno-gym` に、現在の本番で使っている GCP・スプレッドシート・メール等の環境変数をすべて移す。

---

## 6. 注意点

- **ルートの package.json（現在の Next アプリ）** は、モノレポ化後は「どちらにも使わない」か、`apps/lp` / `apps/ueno-gym` のビルドはそれぞれのディレクトリ内の `package.json` に任せる形にする。
- 既存の **abody-gas.vercel.app** プロジェクトは、LP を `abody-lp` に移行したあと、**削除するか、別用途に回す**と混乱が少ない。
- Cron（send-reminders）は **ueno-gym 側** にだけ必要。`vercel.json` は `apps/ueno-gym/vercel.json` に置く。

---

次のステップとして、実際に `apps/lp` と `apps/ueno-gym` の雛形を作成する作業に進めます。必要なら「apps/lp と apps/ueno-gym の雛形を作って」と依頼してください。
