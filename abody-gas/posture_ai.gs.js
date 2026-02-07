/******************************************************
 * posture_ai.gs（完成版：全部コピペOK / 404モデル自動回避）
 *
 * ✅ 仕様
 * - 対象シート：姿勢評価
 * - 会員名：C列（3）
 * - 会員ID：D列（4）
 * - 入力（トレーナー所見）：AG列（33）※空でもOK
 * - 出力（AI結果）：AH列（34）
 * - 1)〜7) を必ず出す（7)はスクワット/ベンチ/ショルプレス注意点）
 * - 途中で切れたら自動で続きを取りに行く（END_MARK）
 * - 不足章があれば不足分だけ追記させる
 * - Geminiモデルは ListModels で「使えるモデル」を自動選択（404回避）
 ******************************************************/

const CFG = {
  // ====== シート設定 ======
  SHEET_NAME: "姿勢評価",

  // ====== 列設定 ======
  COL_MEMBER_NAME: 3,  // C列
  COL_MEMBER_ID: 4,    // D列
  COL_INPUT: 33,       // AG列（トレーナー所見）※空でもOK
  COL_OUTPUT: 34,      // AH列（AI出力）
  OUTPUT_HEADER: "姿勢AIアプローチ",

  // ====== 生成設定 ======
  END_MARK: "<<END>>",
  TEMPERATURE: 0.4,
  MAX_OUTPUT_TOKENS: 2048,      // 長文出るように（環境によっては上限あり）
  CONTINUE_MAX_TRIES: 3,        // 途中切れ対策（続き取得回数）

  // ====== Gemini API ======
  API_ROOT: "https://generativelanguage.googleapis.com/v1beta/",
  API_KEY_PROP: "GEMINI_API_KEY",
  MODEL_PROP: "GEMINI_SELECTED_MODEL" // 自動選択したモデルをキャッシュ
};

/** スプレッドシートを開いた時にメニュー追加 */
function onOpen() {
  addPostureMenu_();
}

/** メニュー追加 */
function addPostureMenu_() {
  SpreadsheetApp.getUi()
    .createMenu("姿勢AI")
    .addItem("① APIキー登録", "setGeminiApiKey")
    .addItem("② 姿勢フォーム送信トリガー作成", "installPostureTrigger")
    .addSeparator()
    .addItem("テスト：選択行を生成", "testGenerateActiveRow")
    .addToUi();
}

/** APIキー登録（スクリプトプロパティに保存） */
function setGeminiApiKey() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt(
    "Gemini APIキーを入力",
    "Google AI Studioで発行したAPIキーを貼り付けてOKを押してください。",
    ui.ButtonSet.OK_CANCEL
  );
  if (res.getSelectedButton() !== ui.Button.OK) return;

  const key = String(res.getResponseText() || "").trim();
  if (!key) {
    ui.alert("APIキーが空です。もう一度入力してください。");
    return;
  }

  const props = PropertiesService.getScriptProperties();
  props.setProperty(CFG.API_KEY_PROP, key);
  props.deleteProperty(CFG.MODEL_PROP); // モデルキャッシュはリセット（再自動選択）
  ui.alert("保存しました！\n次に「② 姿勢フォーム送信トリガー作成」を実行してください。");
}

/** トリガー作成（インストール型 onFormSubmit） */
function installPostureTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 既存の同名トリガーを削除（重複防止）
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === "onPostureFormSubmit") ScriptApp.deleteTrigger(t);
  });

  // 新規作成
  ScriptApp.newTrigger("onPostureFormSubmit")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  SpreadsheetApp.getUi().alert("トリガーを作成しました！\nフォーム送信で自動生成されます。");
}

/** フォーム送信トリガー */
function onPostureFormSubmit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== CFG.SHEET_NAME) return;

  const row = e.range.getRow();
  generateForRow_(sheet, row, false);
}

/** テスト：選択行を生成（強制上書き） */
function testGenerateActiveRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  generateForRow_(sheet, row, true);
}

/** メイン：指定行のAI出力を作る */
function generateForRow_(sheet, row, force) {
  ensureOutputHeader_(sheet);

  const outCell = sheet.getRange(row, CFG.COL_OUTPUT);

  if (!force) {
    const existing = String(outCell.getValue() || "").trim();
    if (existing) return;
  }

  const ctx = collectRowContext_(sheet, row);
  const prompt = buildPrompt_(ctx);

  const summaryRaw = callGeminiWithRepair_(prompt);
  const summary = stripEndMark_(summaryRaw);

  outCell.setValue(summary);
  outCell.setWrap(true);
  outCell.setVerticalAlignment("top");

  // 見やすく：行高を広げる（必要なら数字だけ変えてOK）
  try {
    sheet.setRowHeight(row, 420);
  } catch (_) {}
}

/** 出力列ヘッダーの保証 */
function ensureOutputHeader_(sheet) {
  const headerCell = sheet.getRange(1, CFG.COL_OUTPUT);
  const header = String(headerCell.getValue() || "").trim();
  if (!header) headerCell.setValue(CFG.OUTPUT_HEADER);
}

/** 行の情報をまとめる（所見が空でもOK） */
function collectRowContext_(sheet, row) {
  const lastCol = Math.max(sheet.getLastColumn(), CFG.COL_OUTPUT);
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];

  const memberName = String(values[CFG.COL_MEMBER_NAME - 1] || "").trim(); // C
  const memberId = String(values[CFG.COL_MEMBER_ID - 1] || "").trim();     // D
  const trainerMemo = String(values[CFG.COL_INPUT - 1] || "").trim();      // AG

  const lines = [];
  for (let c = 1; c <= lastCol; c++) {
    if (c === CFG.COL_OUTPUT) continue; // AHは除外
    const h = String(headers[c - 1] || "").trim();
    const v = values[c - 1];
    if (!h) continue;
    if (v === null || v === "" || typeof v === "undefined") continue;

    const vs = String(v).trim();
    if (!vs) continue;

    lines.push(`・${h}：${vs}`);
  }

  return {
    row,
    memberName,
    memberId,
    trainerMemo,
    inputLines: lines.join("\n")
  };
}

/** 出力プロンプト */
function buildPrompt_(ctx) {
  const name = ctx.memberName ? ctx.memberName : "会員";
  const memoLine = ctx.trainerMemo
    ? ctx.trainerMemo
    : "（トレーナー所見は未入力。フォーム回答の情報だけで分析してください）";

  const idLine = ctx.memberId ? `\n（会員ID：${ctx.memberId}）` : "";

  return `
あなたは経験豊富なパーソナルトレーナーです。
以下の姿勢評価データをもとに、会員様にそのまま渡せる「姿勢分析サマリー」を作成してください。

【最重要ルール】
・日本語
・医学的診断はしない（断定しない。「〜しやすい傾向」「可能性」表現）
・不安を煽らない
・専門用語は使いすぎない（必要ならカッコで短く補足）
・Markdown記号（###, **, - など）は使わない
・必ず 1)〜7) を全て出力（省略禁止）
・7) は「スクワット」「ベンチプレス」「ショルダープレス」それぞれ3〜6個の注意点（箇条書き）
・最後の行に必ず ${CFG.END_MARK} とだけ書く（これが無いと途中切れ扱い）

【文章の冒頭】
・1行目は必ず「${name}様」と書く${idLine}

【構成（必ずこの順番・番号も必須）】
1) 総合タイプ（結論）
2) 入力から見える特徴（側面/正面/背面を分けて）
3) 姿勢と痛み・不調の関係（関連の可能性）
4) 硬くなりやすい筋肉（短縮・過緊張）
5) 弱くなりやすい筋肉（鍛えたい）
6) 改善アプローチ（箇条書き。優先順位は付けない）
7) スクワット・ベンチプレス・ショルダープレス時の注意点（各種目ごとに箇条書き）

【入力データ（フォーム/記録）】
${ctx.inputLines}

【補足（トレーナー所見）】
${memoLine}
`.trim();
}

/** 途中切れ/不足章を自動修復して返す */
function callGeminiWithRepair_(prompt) {
  let text = callGeminiSafe_(prompt);

  // 1) END_MARKが無い → 続きを取りに行く
  for (let i = 0; i < CFG.CONTINUE_MAX_TRIES; i++) {
    if (String(text).includes(CFG.END_MARK)) break;

    const continuePrompt = `
前回の文章が途中で切れています。
続きだけを書いてください（重複しないこと）。

【厳守】
・続きだけ（冒頭から書き直さない）
・Markdown記号は禁止
・最後の行に必ず ${CFG.END_MARK} とだけ書く

【前回の文章】
${text}
`.trim();

    const rest = callGeminiSafe_(continuePrompt);
    text = String(text).trim() + "\n\n" + String(rest).trim();
  }

  // 2) 章が欠ける → 不足章だけ追記
  for (let i = 0; i < CFG.CONTINUE_MAX_TRIES; i++) {
    const missing = missingSections_(stripEndMark_(text));
    if (missing.length === 0) break;

    const fixPrompt = buildMissingSectionsPrompt_(stripEndMark_(text), missing);
    const add = callGeminiSafe_(fixPrompt);
    text = String(text).trim() + "\n\n" + String(add).trim();
  }

  return text;
}

/** 必須章(1..7)が揃っているかチェック */
function missingSections_(text) {
  const t = String(text || "");
  const checks = [
    { n: 1, re: /(^|\n)\s*1\)\s*/ },
    { n: 2, re: /(^|\n)\s*2\)\s*/ },
    { n: 3, re: /(^|\n)\s*3\)\s*/ },
    { n: 4, re: /(^|\n)\s*4\)\s*/ },
    { n: 5, re: /(^|\n)\s*5\)\s*/ },
    { n: 6, re: /(^|\n)\s*6\)\s*/ },
    { n: 7, re: /(^|\n)\s*7\)\s*/ }
  ];
  return checks.filter(x => !x.re.test(t)).map(x => x.n);
}

/** 不足章だけ追記させるプロンプト */
function buildMissingSectionsPrompt_(currentText, missingNums) {
  return `
前回の文章に不足している章があります。
不足している章だけを「同じ形式」で追記してください（既存の文章は書き換えない）。

【不足している章】
${missingNums.map(n => `${n})`).join(" ")}

【厳守】
・追記するのは不足章のみ
・各章は必ず「n)」で開始
・7)はスクワット/ベンチプレス/ショルダープレスの注意点を各3〜6個（箇条書き）
・Markdown記号は禁止
・最後の行に必ず ${CFG.END_MARK} とだけ書く

【前回の文章】
${currentText}
`.trim();
}

/** END_MARKを除去 */
function stripEndMark_(text) {
  return String(text || "")
    .replace(new RegExp("\\s*" + escapeRegex_(CFG.END_MARK) + "\\s*$", "g"), "")
    .trim();
}

/** Gemini呼び出し（ListModelsで「使えるモデル」を自動選択して404回避） */
function callGeminiSafe_(prompt) {
  const apiKey = getApiKey_();

  // まずキャッシュモデルを試す → ダメならListModelsで選び直す
  let model = getCachedModel_();
  if (!model) model = selectAvailableModel_();

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: CFG.TEMPERATURE,
      maxOutputTokens: CFG.MAX_OUTPUT_TOKENS
    }
  };

  // 1回目：キャッシュor自動選択モデルで実行
  let res = fetchGenerate_(apiKey, model, payload);

  // 404ならモデルキャッシュが古い/無効 → 再選択して再実行
  if (res.code === 404) {
    clearCachedModel_();
    model = selectAvailableModel_();
    res = fetchGenerate_(apiKey, model, payload);
  }

  if (res.code < 200 || res.code >= 300) {
    throw new Error(`Gemini API error (${res.code}) model=${model}: ${res.body}`);
  }

  const json = JSON.parse(res.body);
  const text =
    (json?.candidates?.[0]?.content?.parts
      ? json.candidates[0].content.parts.map(p => p.text || "").join("")
      : "") || "";

  if (!String(text).trim()) throw new Error("Geminiの返答が空でした。");
  return String(text).trim();
}

/** generateContent実行 */
function fetchGenerate_(apiKey, model, payload) {
  // model は "models/xxx" 形式で保持する
  const url = `${CFG.API_ROOT}${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const r = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  return {
    code: r.getResponseCode(),
    body: r.getContentText()
  };
}

/** 利用可能モデルを選ぶ（ListModels） */
function selectAvailableModel_() {
  const apiKey = getApiKey_();
  const url = `${CFG.API_ROOT}models?key=${encodeURIComponent(apiKey)}`;

  const r = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const code = r.getResponseCode();
  const body = r.getContentText();

  if (code < 200 || code >= 300) {
    throw new Error(`ListModels error (${code}): ${body}`);
  }

  const json = JSON.parse(body);
  const models = json?.models || [];

  // generateContent対応のみ
  const usable = models.filter(m => {
    const methods = m?.supportedGenerationMethods || [];
    return methods.indexOf("generateContent") !== -1;
  });

  if (usable.length === 0) {
    throw new Error("利用可能なモデルが見つかりませんでした（generateContent対応が0）。");
  }

  // できるだけ「flash系」を優先（速い＆無料枠で動きやすいことが多い）
  // スコアリングして一番良いものを採用
  const scored = usable.map(m => {
    const name = String(m.name || "");
    let score = 0;
    const lower = name.toLowerCase();

    // 速度優先：flash > pro
    if (lower.includes("flash")) score += 100;
    if (lower.includes("pro")) score += 70;

    // 新しめ優先（2.0やlatestっぽいのがあれば少し加点）
    if (lower.includes("2.0")) score += 20;
    if (lower.includes("latest")) score += 10;

    // 1.5も一応加点
    if (lower.includes("1.5")) score += 5;

    return { name, score };
  }).sort((a, b) => b.score - a.score);

  const selected = scored[0].name; // 例："models/gemini-1.5-flash"
  cacheModel_(selected);
  return selected;
}

/** APIキー取得 */
function getApiKey_() {
  const key = PropertiesService.getScriptProperties().getProperty(CFG.API_KEY_PROP);
  if (!key || !String(key).trim()) {
    throw new Error("Gemini APIキーが未設定です。メニュー「姿勢AI → ① APIキー登録」を実行してください。");
  }
  return String(key).trim();
}

/** モデルキャッシュ */
function getCachedModel_() {
  const m = PropertiesService.getScriptProperties().getProperty(CFG.MODEL_PROP);
  return m ? String(m).trim() : "";
}
function cacheModel_(modelName) {
  PropertiesService.getScriptProperties().setProperty(CFG.MODEL_PROP, String(modelName).trim());
}
function clearCachedModel_() {
  PropertiesService.getScriptProperties().deleteProperty(CFG.MODEL_PROP);
}

/** 正規表現エスケープ */
function escapeRegex_(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
