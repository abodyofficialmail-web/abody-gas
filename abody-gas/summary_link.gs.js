/******************************************************
 * セッション前サマリー ← 姿勢評価(AH) を 会員IDで自動反映
 * - プルダウン(C2)変更で即更新
 * - 出力先：B16
 ******************************************************/

const CONFIG = {
  // ---- シート名 ----
  POSTURE_SHEET_NAME: "姿勢評価",
  SUMMARY_SHEET_NAME: "セッション前サマリー",

  // ---- 姿勢評価側 ----
  POSTURE_MEMBER_ID_HEADERS: ["member_id", "会員ID", "会員ID（自動）", "会員番号", "会員コード"],
  POSTURE_MEMBER_ID_FALLBACK_COL: 4, // D列想定（見つからない時の保険）
  POSTURE_AI_COL: 34, // AH列
  POSTURE_TIMESTAMP_HEADERS: ["タイムスタンプ", "timestamp", "日時", "日付", "送信日時"],

  // ---- サマリー側 ----
  SUMMARY_MEMBER_ID_CELL: "D2",        // member_id が入るセル（画像通り）
  SUMMARY_MEMBER_SELECT_CELL: "C2",    // ★プルダウンはC2（ここが重要）
  SUMMARY_OUTPUT_A1: "B16",            // ★表示先（希望通りB16）
  SUMMARY_OUTPUT_ROW_HEIGHT_MIN: 180,
  SUMMARY_OUTPUT_ROW_HEIGHT_MAX: 900
};

/**
 * トリガーを確実に作り直す（最初に1回だけ実行）
 * - onOpen：開いたとき反映
 * - onEdit：C2 / D2 が変わったら反映
 */
function setupTriggers() {
  const ss = SpreadsheetApp.getActive();

  // 既存の同名トリガーを削除（重複防止）
  ScriptApp.getProjectTriggers().forEach(t => {
    const fn = t.getHandlerFunction();
    if (fn === "onOpen" || fn === "onSummaryEdit") ScriptApp.deleteTrigger(t);
  });

  // 作成
  ScriptApp.newTrigger("onOpen").forSpreadsheet(ss).onOpen().create();
  ScriptApp.newTrigger("onSummaryEdit").forSpreadsheet(ss).onEdit().create();
}

function onOpen(e) {
  try { refreshSummaryFromPosture_(); } catch (err) { Logger.log(err); }
}

/**
 * サマリーシートで「会員切替」されたら自動反映
 * - C2（プルダウン） or D2（member_id）が編集された時のみ反応
 */
function onSummaryEdit(e) {
  try {
    if (!e || !e.range) return;

    const sheet = e.range.getSheet();
    if (sheet.getName() !== CONFIG.SUMMARY_SHEET_NAME) return;

    const a1 = e.range.getA1Notation();
    if (a1 !== CONFIG.SUMMARY_MEMBER_SELECT_CELL && a1 !== CONFIG.SUMMARY_MEMBER_ID_CELL) return;

    refreshSummaryFromPosture_();
  } catch (err) {
    Logger.log(err);
  }
}

/**
 * サマリーの member_id を見て、姿勢評価シートから最新AHを拾って B16 に表示
 */
function refreshSummaryFromPosture_() {
  const ss = SpreadsheetApp.getActive();
  const summarySheet = ss.getSheetByName(CONFIG.SUMMARY_SHEET_NAME);
  const postureSheet = ss.getSheetByName(CONFIG.POSTURE_SHEET_NAME);

  if (!summarySheet) throw new Error("サマリーシートが見つかりません: " + CONFIG.SUMMARY_SHEET_NAME);
  if (!postureSheet) throw new Error("姿勢評価シートが見つかりません: " + CONFIG.POSTURE_SHEET_NAME);

  // まず D2(member_id) を優先
  let memberId = String(summarySheet.getRange(CONFIG.SUMMARY_MEMBER_ID_CELL).getValue() || "").trim();

  // D2 が空なら C2（SAK012 | 名前）からID抽出
  if (!memberId) {
    const sel = String(summarySheet.getRange(CONFIG.SUMMARY_MEMBER_SELECT_CELL).getValue() || "").trim();
    memberId = extractMemberId_(sel);
  }

  const outRange = summarySheet.getRange(CONFIG.SUMMARY_OUTPUT_A1);

  if (!memberId) {
    setOutput_(summarySheet, outRange, "⚠️ 会員IDが空です（C2 または D2 を確認）");
    return;
  }

  const result = findLatestPostureAIByMemberId_(postureSheet, memberId);

  if (!result.found) {
    setOutput_(summarySheet, outRange, `⚠️ 姿勢評価シートに該当データがありません（member_id=${memberId}）`);
    return;
  }

  if (!result.aiText) {
    setOutput_(summarySheet, outRange, `⚠️ 姿勢評価AH（姿勢AIアプローチ）が空です（member_id=${memberId}, row=${result.row}）`);
    return;
  }

  setOutput_(summarySheet, outRange, result.aiText);
}

/**
 * 姿勢評価シートから member_id一致の「最新」行を探し、AH列を返す
 */
function findLatestPostureAIByMemberId_(postureSheet, memberId) {
  const lastRow = postureSheet.getLastRow();
  const lastCol = postureSheet.getLastColumn();
  if (lastRow < 2) return { found: false };

  const headers = postureSheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || "").trim());

  // member_id列をヘッダーから探索（なければD列想定にフォールバック）
  let idCol = findHeaderIndex_(headers, CONFIG.POSTURE_MEMBER_ID_HEADERS);
  if (idCol === -1) idCol = CONFIG.POSTURE_MEMBER_ID_FALLBACK_COL - 1;
  const idCol1 = idCol + 1;

  // タイムスタンプ列（あれば「最新」判定に使用）
  const tsIdx = findHeaderIndex_(headers, CONFIG.POSTURE_TIMESTAMP_HEADERS);
  const tsCol1 = tsIdx === -1 ? null : tsIdx + 1;

  const idValues = postureSheet.getRange(2, idCol1, lastRow - 1, 1).getValues();
  const aiValues = postureSheet.getRange(2, CONFIG.POSTURE_AI_COL, lastRow - 1, 1).getValues();
  const tsValues = tsCol1 ? postureSheet.getRange(2, tsCol1, lastRow - 1, 1).getValues() : null;

  let bestIndex = -1;
  let bestTime = null;

  for (let i = 0; i < idValues.length; i++) {
    const id = String(idValues[i][0] || "").trim();
    if (id !== memberId) continue;

    // タイムスタンプが無い場合は「下の行ほど新しい」想定で上書き
    if (!tsValues) {
      bestIndex = i;
      continue;
    }

    const t = toDate_(tsValues[i][0]);
    if (!t) {
      bestIndex = i;
      continue;
    }

    if (!bestTime || t.getTime() >= bestTime.getTime()) {
      bestTime = t;
      bestIndex = i;
    }
  }

  if (bestIndex === -1) return { found: false };

  const aiText = String(aiValues[bestIndex][0] || "").trim();
  const row = bestIndex + 2;

  return { found: true, row, aiText };
}

/**
 * 出力セル整形（折り返し・行高さ）
 */
function setOutput_(sheet, range, text) {
  range.setValue(text);
  range.setWrap(true);
  range.setVerticalAlignment("top");

  const row = range.getRow();
  const lines = String(text || "").split("\n").length;
  const estimated = Math.min(
    CONFIG.SUMMARY_OUTPUT_ROW_HEIGHT_MAX,
    Math.max(CONFIG.SUMMARY_OUTPUT_ROW_HEIGHT_MIN, 20 * lines + 60)
  );
  sheet.setRowHeight(row, estimated);
}

function extractMemberId_(s) {
  if (!s) return "";
  const left = s.split("|")[0];
  return String(left || "").trim();
}

function findHeaderIndex_(headers, candidates) {
  const lowerHeaders = headers.map(h => String(h || "").toLowerCase());
  for (let i = 0; i < candidates.length; i++) {
    const c = String(candidates[i] || "").trim().toLowerCase();
    const idx = lowerHeaders.indexOf(c);
    if (idx !== -1) return idx;
  }
  return -1;
}

function toDate_(v) {
  if (!v) return null;
  if (v instanceof Date) return v;

  // シリアル値（スプレッドシートの日付）対策
  if (typeof v === "number") {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
  }

  const s = String(v).trim();
  if (!s) return null;

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
