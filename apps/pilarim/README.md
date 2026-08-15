# PILARIM LP

受け放題ピラティス＋パーソナルトレーニングのランディングページです。

## 起動

```bash
cd apps/pilarim
npm install
npm run dev
```

## ドメイン（Abody を含めない）

このアプリは **PILARIM 専用の Vercel プロジェクト** で公開してください。  
既存の `abody-lp` / `abody-gas` / `abody-ueno-gym` にはデプロイしないでください。`*.vercel.app` に `abody` が入ります。

| 項目 | 値 |
|------|-----|
| Vercel Project Name | `pilarim` |
| Root Directory | `apps/pilarim` |
| 公開URL | `https://pilarim.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://pilarim.vercel.app`（カスタムドメイン時はそのURL） |

カスタムドメインを付ける場合も、ホスト名に `abody` を含めないでください。

## Vercel で新しいプロジェクトを作る手順

GitHub のリポジトリ（`abody-gas`）はそのままで大丈夫です。  
**Vercel 側でプロジェクトをもう1つ作る**だけです。Abody の既存プロジェクトは触らないでください。

1. ブラウザで [https://vercel.com](https://vercel.com) を開いてログインする
2. 右上の **Add New…** → **Project** をクリックする
3. **Import Git Repository** で `abodyofficialmail-web/abody-gas` を選ぶ  
   （一覧に無ければ **Import Third-Party Git Repository** や GitHub 連携を確認）
4. **Configure Project** で次を入れる
   - **Project Name**: `pilarim`（ここが URL になる。`abody` と付けない）
   - **Framework Preset**: Next.js
   - **Root Directory**: **Edit** を押して `apps/pilarim` を選ぶ
   - **Build Command** / **Output Directory**: 空欄のままでよい
   - **Install Command**: `npm install`
5. **Environment Variables** を追加する
   - `NEXT_PUBLIC_SITE_URL` = `https://pilarim.vercel.app`
   - `NEXT_PUBLIC_LINE_URL_SHINJUKU` = `https://lin.ee/yuANKps`
   - 上野店 LINE が分かっていれば `NEXT_PUBLIC_LINE_URL_UENO` も追加
6. **Deploy** を押す
7. 完了後、**Settings → Domains** で `pilarim.vercel.app` になっていることを確認する

既存の Abody プロジェクト（`abody-lp` など）の Settings は変更しないでください。  
そちらは今までどおり Abody 用です。

## 環境変数

- `NEXT_PUBLIC_SITE_URL`（必須。上記の PILARIM 用URL）
- `NEXT_PUBLIC_LINE_URL`
- `NEXT_PUBLIC_LINE_URL_UENO`
- `NEXT_PUBLIC_LINE_URL_SHINJUKU`（デフォルト: https://lin.ee/yuANKps）
- `NEXT_PUBLIC_LINE_URL_RECRUIT`
