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

## 環境変数

- `NEXT_PUBLIC_SITE_URL`（必須。上記の PILARIM 用URL）
- `NEXT_PUBLIC_LINE_URL`
- `NEXT_PUBLIC_LINE_URL_UENO`
- `NEXT_PUBLIC_LINE_URL_SHINJUKU`（デフォルト: https://lin.ee/yuANKps）
- `NEXT_PUBLIC_LINE_URL_RECRUIT`
