# Vercel デプロイ手順（丁寧版）

このドキュメントでは、**初めての方でも迷わないように**、画面の操作とコマンドを順番に説明します。  
一度セットアップすれば、あとは Cursor で編集して push するだけで自動で反映されます。

---

## 全体の流れ（3ステップ）

1. **GitHub にコードを上げる**（Cursor のターミナル + GitHub のサイト）
2. **Vercel でプロジェクトを作ってデプロイする**（Vercel のサイト）
3. **環境変数を登録して再デプロイする**（Vercel のサイト）

---

# ステップ1: GitHub にプロジェクトを上げる

## 1-1. GitHub でリポジトリを新規作成する

1. ブラウザで **https://github.com** を開く
2. ログインしていなければ **Sign in** でログインする
3. 画面右上の **＋** をクリック → **New repository** を選ぶ
4. 次のように入力する  
   - **Repository name**: `abody-gas`（または好きな名前）  
   - **Public** を選ぶ  
   - **Add a README file** は**チェックしない**（空のリポジトリにする）
5. **Create repository** をクリックする
6. 次の画面で **「…or push an existing repository from the command line」** のところに、次の2行が表示される（URL はあなたのユーザー名に応じて変わります）:
   ```
   git remote add origin https://github.com/あなたのユーザー名/abody-gas.git
   git push -u origin main
   ```
   この2行は**あとで使う**ので、このまま画面を開いたままにしておく

---

## 1-2. Cursor でターミナルを開く

1. Cursor で **abody-gas** プロジェクトを開いていることを確認する
2. 画面上部メニュー **「表示」** → **「ターミナル」** をクリック（または **Ctrl + `**）
3. 画面下にターミナルが表示される
4. 左側に `abody-gas` やパスが表示されていれば、このフォルダで作業できている

---

## 1-3. Git を初期化してコミットする

ターミナルに、**1行ずつ**次のコマンドを打って Enter する（コピー＆ペーストでOK）。

```bash
git init
```

何かメッセージが出ても、エラーでなければ次へ。

```bash
git add .
```

```bash
git commit -m "Initial commit"
```

「○ files changed」のような表示が出れば成功。

---

## 1-4. GitHub のリポジトリと紐づけて push する

1. GitHub の画面（1-1 で開いた「…or push an existing repository」のところ）に戻る
2. 表示されている **1行目** をコピーする  
   例: `git remote add origin https://github.com/あなたのユーザー名/abody-gas.git`
3. Cursor のターミナルに貼り付けて Enter
4. 表示されている **2行目** をコピーする  
   例: `git push -u origin main`
5. ターミナルに貼り付けて Enter
6. 初回は GitHub のログインを求められることがある。表示に従ってログインする
7. 最後に「Enumerating objects: …」や「Writing objects: 100%」と出て、エラーがなければ **ステップ1 完了**

---

# ステップ2: Vercel でプロジェクトを作成する

## 2-1. Vercel に登録してログインする

1. ブラウザで **https://vercel.com** を開く
2. **Sign Up** をクリック
3. **Continue with GitHub** を選ぶ
4. GitHub の認証画面が出たら **Authorize Vercel** などをクリックして許可する
5. Vercel のダッシュボード（最初の画面）が表示されればOK

---

## 2-2. 新しいプロジェクトを追加する

1. ダッシュボードで **「Add New…」** をクリック
2. **「Project」** を選ぶ
3. **Import Git Repository** のところに、GitHub のリポジトリ一覧が表示される
4. **abody-gas**（1-1 で作ったリポジトリ）を探して、横の **「Import」** をクリック

---

## 2-3. 設定を確認してデプロイする

1. **Configure Project** の画面になる
2. **Project Name** はそのまま（`abody-gas` など）でOK
3. **Framework Preset** に **Next.js** と出ていればそのままでOK
4. **Environment Variables** は**いったん何も入れない**（あとで登録する）
5. **Deploy** をクリック
6. 「Building…」「Deploying…」と進み、数十秒〜1分ほどで **「Congratulations」** や **「Visit」** と表示される
7. **Visit** をクリックすると、デプロイされたサイトが開く  
   この時点では環境変数がないので、予約画面は**エラーになる**。次のステップで直す

---

# ステップ3: 環境変数を登録して再デプロイする

## 3-1. 環境変数の画面を開く

1. Vercel のダッシュボードで、**abody-gas** のプロジェクト名をクリックしてプロジェクトを開く
2. 上の方のタブで **「Settings」** をクリック
3. 左のメニューで **「Environment Variables」** をクリック

---

## 3-2. 変数を1つずつ登録する

Cursor で **.env.local** を開き、次の変数を **1つずつ** Vercel に登録する。

**登録のやり方（各変数とも同じ）:**

1. **Key** の欄に「変数名」を入力
2. **Value** の欄に「値」を貼り付け（`.env.local` からコピー）
3. **Environment** は **Production**（と **Preview** があれば両方）にチェック
4. **Save** をクリック

**登録する変数一覧（.env.local の行をそのまま使う）:**

| Key（変数名） | どこからコピーする |
|---------------|-------------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | .env.local の `GOOGLE_SERVICE_ACCOUNT_EMAIL=` の**右側**（= の後ろ全部） |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | .env.local の `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=` の**右側**（引用符 `"` も含めて全部。改行は `\n` のままでOK） |
| `GOOGLE_SHEET_ID` | .env.local の `GOOGLE_SHEET_ID=` の右側 |
| `GOOGLE_CALENDAR_ID` | .env.local の `GOOGLE_CALENDAR_ID=` の右側 |
| `TIMEZONE` | .env.local の `TIMEZONE=` の右側（なければ `Asia/Tokyo`） |
| `SMTP_HOST` | .env.local の `SMTP_HOST=` の右側 |
| `SMTP_USER` | .env.local の `SMTP_USER=` の右側 |
| `SMTP_PASS` | .env.local の `SMTP_PASS=` の右側 |
| `MAIL_FROM` | .env.local の `MAIL_FROM=` の右側 |

※ `GOOGLE_SERVICE_ACCOUNT_JSON_PATH` は **Vercel には登録しない**（Vercel では EMAIL と PRIVATE_KEY だけで動きます）。

※ 値に **=** や **#** が含まれている場合、引用符で囲まれた部分は **引用符ごと** コピーしてOK。

---

## 3-3. 再デプロイする

1. 上の方のタブで **「Deployments」** をクリック
2. 一番上（最新）のデプロイの、**右端の「⋯」（3点リーダー）** をクリック
3. **「Redeploy」** を選ぶ
4. 確認画面で **「Redeploy」** をクリック
5. 数十秒〜1分待つと、ステータスが **Ready** になる
6. **「Visit」** または **「Open」** をクリックして、予約画面が開くか確認する
7. スマホのブラウザで同じ URL を開いて、表示されるか確認する

ここまでできれば **本番公開完了** です。

---

# 普段の使い方（編集 → 反映の流れ）

## コードを直したあと、本番に反映する手順

1. **Cursor で** いつも通りファイルを編集して保存する
2. Cursor の**ターミナル**で、次の3つを実行する:
   ```bash
   git add .
   git commit -m "変更内容を一言で"
   git push
   ```
3. **何もしなくてOK**。Vercel が自動で「新しい push を検知 → ビルド → デプロイ」する
4. 1〜2分後、本番の URL を開くと変更が反映されている

「変更内容を一言で」のところは、例として「メール文を修正」「ボタンの色を変更」など、分かりやすいメッセージでOKです。

---

# 困ったときの確認リスト

- **Git push でエラーになる**  
  - ターミナルで `cd /Users/kazuhiko/abody-gas` を打って、正しいフォルダにいるか確認する  
  - GitHub にログインできているか確認する

- **Vercel でデプロイは成功するが、サイトでエラーになる**  
  - **Settings** → **Environment Variables** で、必要な変数が**すべて**登録されているか確認する  
  - 特に `GOOGLE_SERVICE_ACCOUNT_EMAIL` と `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` が正しく貼り付けてあるか確認する  
  - 登録し直したあとは、**Deployments** から **Redeploy** する

- **スマホで開けない**  
  - パソコンのブラウザで、Vercel の **Visit** の URL（例: `https://abody-gas.vercel.app`）が開けるか確認する  
  - スマホのブラウザのアドレス欄に、**同じ URL** を入力して開く（localhost ではない）

- **変更が反映されない**  
  - `git push` まで実行したか確認する  
  - Vercel の **Deployments** で、最新のデプロイが **Ready** になっているか確認する

---

# まとめ

| やること | どこでやる |
|----------|------------|
| コードの編集 | **Cursor** |
| 本番への反映 | Cursor のターミナルで **git add → commit → push**（Vercel が自動デプロイ） |
| 環境変数・ドメインの変更 | **Vercel のダッシュボード**（ブラウザ） |

初回は「GitHub に上げる → Vercel で Import → 環境変数を登録 → Redeploy」の順で進めれば、あとは Cursor で編集して push するだけで、本番に反映されます。
