/****************************************************
 * Abody 2026 目標ヒアリング 一斉送信（Fillout URL）
 * - テスト送信：EBI020 を使って自分宛に送る
 * - 本番送信：メンバーシートを全行回して送る
 * - 担当は全員「ともき」固定
 ****************************************************/

/** ====== 設定（ここだけ必要なら変更） ====== **/
const MEMBER_SHEET_NAME = "メンバーシート";   // メンバー一覧があるシート名
const COL_MEMBER_ID_NAME = "member_id";        // ヘッダー名
const COL_NAME_NAME      = "名前";             // ヘッダー名
const COL_EMAIL_NAME     = "メール";           // ヘッダー名
const COL_URL_NAME       = "2026ヒアリングURL";// ヘッダー名

const BRAND_NAME   = "Abody";
const TRAINER_NAME = "ともき";                // ← 全員これ固定

const TEST_EMAIL     = "abodyofficial.mail@gmail.com"; // テスト送信先
const TEST_MEMBER_ID = "EBI020";                        // テストで拾うmember_id

// 送信ログを書きたい場合（任意）
// const COL_STATUS_NAME = "送信ステータス"; // 例：列を作っておくとOK
// const COL_SENT_AT_NAME = "送信日時";      // 例：列を作っておくとOK


/** ====== 共通：ヘッダーから列番号を作る ====== **/
function buildHeaderIndex_(headerRow) {
  const map = {};
  headerRow.forEach((h, i) => {
    const key = String(h || "").trim();
    if (key) map[key] = i;
  });
  return map;
}

/** ====== 共通：シートデータ取得 ====== **/
function getMemberSheetData_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MEMBER_SHEET_NAME);
  if (!sheet) throw new Error(`シートが見つかりません: ${MEMBER_SHEET_NAME}`);

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) throw new Error("メンバーシートにデータがありません（ヘッダー＋1行以上必要）");

  const header = values[0];
  const idx = buildHeaderIndex_(header);

  // 必須列チェック
  const required = [COL_MEMBER_ID_NAME, COL_NAME_NAME, COL_EMAIL_NAME, COL_URL_NAME];
  required.forEach((col) => {
    if (idx[col] === undefined) {
      throw new Error(`メンバーシートのヘッダーに「${col}」が見つかりません。列名を確認してください。`);
    }
  });

  return { sheet, values, idx };
}

/** ====== 件名 ====== **/
function buildSubject_() {
  return `【${BRAND_NAME}】2026目標ヒアリングのお願い（担当：${TRAINER_NAME}）`;
}

/** ====== 本文（文字化けしない：プレーンテキスト） ====== **/
function buildBody_(name, url) {
  return `${name} 様

いつもありがとうございます。
${BRAND_NAME}トレーナーの ${TRAINER_NAME} です。

2026年の目標に向けて、
今の状態を一度整理し、これからの進め方を明確にするため
目標ヒアリングのご協力をお願いいたします。

【ヒアリングフォーム（1〜3分で完了）】
${url}

【ご回答いただくメリット】
・今月〜数ヶ月の「進め方」を改めて一緒に決められる
・目標に合わせて、トレーニング種目や強度を最適化できる
・体づくりの優先順位が明確になり、迷いなく進められる
・食事や生活リズムも含め、達成までのルートがクリアになる

ご回答内容をもとに、
次回以降のセッション内容やトレーニング構成に反映します。

お時間ある際に、ぜひご協力ください。
よろしくお願いいたします。

${BRAND_NAME}
`;
}

/** ====== テスト送信：EBI020の行を拾って TEST_EMAIL に送る ====== **/
function sendTestToMe() {
  if (!TEST_EMAIL) throw new Error("TEST_EMAIL が空です。コード上部にメールを入れてください。");
  if (!TEST_MEMBER_ID) throw new Error("TEST_MEMBER_ID が空です。");

  const { values, idx } = getMemberSheetData_();

  const memberIdCol = idx[COL_MEMBER_ID_NAME];
  const nameCol     = idx[COL_NAME_NAME];
  const emailCol    = idx[COL_EMAIL_NAME];
  const urlCol      = idx[COL_URL_NAME];

  // EBI020の行を探す
  const row = values.slice(1).find(r => String(r[memberIdCol] || "").trim() === TEST_MEMBER_ID);
  if (!row) throw new Error(`member_id=${TEST_MEMBER_ID} の行が見つかりません（メンバーシート確認）`);

  const name = String(row[nameCol] || "").trim() || "会員";
  const url  = String(row[urlCol]  || "").trim();
  if (!url) throw new Error(`${TEST_MEMBER_ID} の「${COL_URL_NAME}」が空です`);

  const subject = buildSubject_();
  const body    = buildBody_(name, url);

  GmailApp.sendEmail(TEST_EMAIL, subject, body);

  Logger.log(`✅ テスト送信OK: to=${TEST_EMAIL} / picked=${TEST_MEMBER_ID} / name=${name}`);
}

/** ====== 本番：メンバーシート全員に一斉送信 ======
 * 送信条件：
 * - メールが空はスキップ
 * - URLが空もスキップ
 * - member_idが空もスキップ
 */
function sendAllGoalHearingMails() {
  const { sheet, values, idx } = getMemberSheetData_();

  const memberIdCol = idx[COL_MEMBER_ID_NAME];
  const nameCol     = idx[COL_NAME_NAME];
  const emailCol    = idx[COL_EMAIL_NAME];
  const urlCol      = idx[COL_URL_NAME];

  const subject = buildSubject_();

  let sent = 0;
  let skipped = 0;

  for (let i = 1; i < values.length; i++) {
    const r = values[i];

    const memberId = String(r[memberIdCol] || "").trim();
    const name     = String(r[nameCol]     || "").trim() || "会員";
    const email    = String(r[emailCol]    || "").trim();
    const url      = String(r[urlCol]      || "").trim();

    if (!memberId || !email || !url) {
      skipped++;
      continue;
    }

    const body = buildBody_(name, url);
    GmailApp.sendEmail(email, subject, body);
    sent++;

    // 連続送信の安全のため、少し待つ（任意）
    Utilities.sleep(200);
  }

  Logger.log(`✅ 完了: sent=${sent}, skipped=${skipped}`);
}

function scheduleSendAt20Today() {
  // 既存の同名トリガーがあれば削除（重複防止）
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === "sendAllGoalHearingMails") {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 今日の20:00（スクリプトのタイムゾーン基準）
  const now = new Date();
  const runAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);

  if (runAt <= now) {
    throw new Error("もう20:00を過ぎています。時間を変えるか、明日にしてください。");
  }

  ScriptApp.newTrigger("sendAllGoalHearingMails")
    .timeBased()
    .at(runAt)
    .create();

  Logger.log("✅ 20:00の一斉送信トリガーを作成しました: " + runAt);
}

