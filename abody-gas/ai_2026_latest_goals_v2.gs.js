/***********************
 * 2026 Goals AI (SAFE版・トリガー対応)
 * - メニュー不要。関数を直接実行する方式
 * - 既存の code.gs を触らない
 * - 2026_最新 は数式のスピルを壊さない（A:Xには書かない）
 * - AI結果は別シート 2026_AI に保存し、2026_最新 は VLOOKUP 表示のみ
 ***********************/

const AI2026_CFG = {
  // ===== シート名（必要ならここだけ変更）=====
  SHEET_LATEST: '2026_最新',
  SHEET_AI: '2026_AI',
  SHEET_TRAINING: 'フォームの回答 1',  // トレーニング記録シート
  // ===== キー列（どれで突合するか）=====
  KEY_CANDIDATES: ['Submission ID', 'submission id', 'submission_id', 'id'],
  // ===== 入力として拾う列 =====
  MEMBER_ID_CANDIDATES: ['member_id', 'member id', 'memberId'],
  NAME_CANDIDATES: ['氏名', '名前', 'name'],
  HEIGHT_CANDIDATES: ['身長', '身長（cm）', '身長 (cm)', '身長cm'],
  WEIGHT_CANDIDATES: ['体重', '体重（kg）', '体重 (kg)', '体重kg'],
  BF_CANDIDATES: ['体脂肪率', '体脂肪率（%）', '体脂肪率 (%)', '体脂肪'],
  TARGET_TEXT_CANDIDATES: ['2026年トレーニ', '2026年トレーニング目標', '目標', '数値目標'],
  GOAL1_CANDIDATES: ['【1番】', '(1)', '①', '1番', '目標1'],
  GOAL2_CANDIDATES: ['【2番】', '(2)', '②', '2番', '目標2'],
  GOAL3_CANDIDATES: ['【3番】', '(3)', '③', '3番', '目標3'],
  // ===== 性別 =====
  GENDER_CANDIDATES: ['性別', 'gender', 'Gender', '男性/女性'],
  // ===== 目標写真 =====
  TARGET_PHOTO_CANDIDATES: ['理想の体型写真', '目標の体型写真', '目標写真', 'target_photo'],
  // ===== トレーニング記録用 =====
  TRAINING_MEMBER_ID_COL: 'member_id',  // X列
  TRAINING_FETCH_LIMIT: 10,  // 最新10回分
  // ===== Gemini =====
  MODEL: 'gemini-2.0-flash-exp',
  MAX_RETRY: 4,
  MAX_OUTPUT_CHARS: 5000
};

/**
 * ステップ1：VLOOKUP列を設定（最初に1回だけ実行）
 */
function STEP1_setupVlookupColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(AI2026_CFG.SHEET_LATEST);
  if (!sh) {
    Logger.log(`エラー: シートが見つかりません: ${AI2026_CFG.SHEET_LATEST}`);
    return;
  }

  const lastCol = sh.getLastColumn();
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  const hMap = ai2026_buildHeaderMap_(headers);

  const keyCol = ai2026_findCol_(hMap, AI2026_CFG.KEY_CANDIDATES);
  if (!keyCol) {
    Logger.log('エラー: キー列（Submission ID 等）が見つかりません。');
    return;
  }

  // 固定で以下の3列を使う
  const COL_AI_TEXT = 25;   // Y
  const COL_AI_DONE = 26;   // Z
  const COL_AI_AT = 27;     // AA

  sh.getRange(1, COL_AI_TEXT).setValue('AI分析');
  sh.getRange(1, COL_AI_DONE).setValue('AI分析済み');
  sh.getRange(1, COL_AI_AT).setValue('AI分析日時');

  const keyA1 = sh.getRange(1, keyCol).getA1Notation().replace('1','');
  
  sh.getRange(2, COL_AI_TEXT).setFormula(`=IFERROR(VLOOKUP(${keyA1}2, '${AI2026_CFG.SHEET_AI}'!$A:$F, 3, false), "")`);
  sh.getRange(2, COL_AI_DONE).setFormula(`=IFERROR(VLOOKUP(${keyA1}2, '${AI2026_CFG.SHEET_AI}'!$A:$F, 4, false), "")`);
  sh.getRange(2, COL_AI_AT).setFormula(`=IFERROR(VLOOKUP(${keyA1}2, '${AI2026_CFG.SHEET_AI}'!$A:$F, 5, false), "")`);

  const lastRow = Math.max(2, sh.getLastRow());
  if (lastRow > 2) {
    sh.getRange(2, COL_AI_TEXT, 1, 1).copyTo(sh.getRange(3, COL_AI_TEXT, lastRow - 2, 1));
    sh.getRange(2, COL_AI_DONE, 1, 1).copyTo(sh.getRange(3, COL_AI_DONE, lastRow - 2, 1));
    sh.getRange(2, COL_AI_AT, 1, 1).copyTo(sh.getRange(3, COL_AI_AT, lastRow - 2, 1));
  }

  Logger.log('✅ VLOOKUP列を設定しました。次は STEP2_runAiAnalysis を実行してください。');
}

/**
 * ステップ2：AI分析を実行
 */
function STEP2_runAiAnalysis() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    Logger.log('エラー: スクリプトプロパティに GEMINI_API_KEY がありません');
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(AI2026_CFG.SHEET_LATEST);
  if (!sh) {
    Logger.log(`エラー: シートが見つかりません: ${AI2026_CFG.SHEET_LATEST}`);
    return;
  }

  const aiSh = ai2026_getOrCreateAiSheet_(ss);

  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) {
    Logger.log('データがありません（2行目以降）');
    return;
  }

  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(v => String(v || '').trim());
  const hMap = ai2026_buildHeaderMap_(headers);

  const keyCol = ai2026_findCol_(hMap, AI2026_CFG.KEY_CANDIDATES);
  if (!keyCol) {
    Logger.log('エラー: キー列（Submission ID 等）が見つかりません。');
    return;
  }

  const existingMap = ai2026_readExistingAiMap_(aiSh);
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  let processed = 0;
  let skipped = 0;
  
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const key = String(row[keyCol - 1] || '').trim();
    if (!key) continue;

    const existing = existingMap[key];
    if (existing && aiSh.getRange(existing, 4).getValue() === '済') {
      skipped++;
      continue;
    }

    const memberId = ai2026_getByAny_(hMap, row, AI2026_CFG.MEMBER_ID_CANDIDATES);
    const name = ai2026_getByAny_(hMap, row, AI2026_CFG.NAME_CANDIDATES);
    const height = ai2026_getByAny_(hMap, row, AI2026_CFG.HEIGHT_CANDIDATES);
    const weight = ai2026_getByAny_(hMap, row, AI2026_CFG.WEIGHT_CANDIDATES);
    const bf = ai2026_getByAny_(hMap, row, AI2026_CFG.BF_CANDIDATES);
    const targetText = ai2026_getByAny_(hMap, row, AI2026_CFG.TARGET_TEXT_CANDIDATES);
    const g1 = ai2026_getByAny_(hMap, row, AI2026_CFG.GOAL1_CANDIDATES);
    const g2 = ai2026_getByAny_(hMap, row, AI2026_CFG.GOAL2_CANDIDATES);
    const g3 = ai2026_getByAny_(hMap, row, AI2026_CFG.GOAL3_CANDIDATES);

    // 性別を取得（画像分析で使用）
    const gender = ai2026_getByAny_(hMap, row, AI2026_CFG.GENDER_CANDIDATES) || '男性';

    // トレーニング履歴を取得
    const trainingHistory = ai2026_getTrainingHistory_(ss, memberId, AI2026_CFG.TRAINING_FETCH_LIMIT);

    // 目標写真を分析
    const targetPhotoUrl = ai2026_getByAny_(hMap, row, AI2026_CFG.TARGET_PHOTO_CANDIDATES);
    const photoAnalysis = ai2026_analyzeTargetPhoto_(apiKey, targetPhotoUrl, gender);

    const prompt = ai2026_buildPrompt_({
      key, memberId, name, height, weight, bf, targetText, g1, g2, g3, gender, trainingHistory, photoAnalysis
    });

    const result = ai2026_callGeminiJson_(apiKey, prompt);

    const now = new Date();
    const done = result.ok ? '済' : '失敗';
    const status = result.ok ? 'OK' : (result.error || 'ERROR');
    const aiText = result.ok ? ai2026_clip_(result.data.ai_text || '', AI2026_CFG.MAX_OUTPUT_CHARS) : ai2026_clip_(result.raw || '', AI2026_CFG.MAX_OUTPUT_CHARS);

    const writeRow = existing || aiSh.getLastRow() + 1;
    aiSh.getRange(writeRow, 1, 1, 6).setValues([[
      key,
      memberId || '',
      aiText || '',
      done,
      now,
      status
    ]]);

    if (!existing) existingMap[key] = writeRow;

    processed++;
    Logger.log(`処理: ${processed}/${values.length} (key: ${key})`);
    Utilities.sleep(250);
  }

  Logger.log(`✅ 完了！処理：${processed}件、スキップ：${skipped}件`);
  Logger.log(`AI結果は「${AI2026_CFG.SHEET_AI}」シートに保存されています。`);
}

/**
 * デバッグ用：AI保存シートを開く
 */
function openAiSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ai2026_getOrCreateAiSheet_(ss);
  ss.setActiveSheet(sh);
}

/**
 * 特定の会員IDのAI分析を手動実行
 * 使い方: processGoalHearingForMember('SAK015')
 * 引数なしで実行すると、SAK015をデフォルトで処理します
 */
function processGoalHearingForMember(memberId) {
  // 引数が指定されていない場合は、SAK015をデフォルトとして使用
  if (!memberId) {
    memberId = 'SAK015';
    Logger.log('引数が指定されていないため、SAK015を処理します');
  }
  
  try {
    Logger.log(`=== 特定会員のAI分析実行: ${memberId} ===`);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hearingSheet = ss.getSheetByName('2026目標ヒアリング_回答');
    
    if (!hearingSheet) {
      Logger.log('エラー: 2026目標ヒアリング_回答シートが見つかりません');
      return;
    }
    
    const lastRow = hearingSheet.getLastRow();
    if (lastRow < 2) {
      Logger.log('データがありません');
      return;
    }
    
    // 指定された会員IDの最新の回答を取得
    const lastCol = hearingSheet.getLastColumn();
    const headers = hearingSheet.getRange(1, 1, 1, lastCol).getValues()[0].map(v => String(v || '').trim());
    const hMap = ai2026_buildHeaderMap_(headers);
    
    const colMemberId = ai2026_findCol_(hMap, AI2026_CFG.MEMBER_ID_CANDIDATES);
    if (!colMemberId) {
      Logger.log('エラー: member_id列が見つかりません');
      return;
    }
    
    const values = hearingSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    let targetRow = null;
    let latestTimestamp = null;
    
    // 指定された会員IDの最新の回答を探す
    values.forEach((row, index) => {
      const id = String(row[colMemberId - 1] || '').trim();
      if (id === memberId) {
        const timestamp = row[0]; // A列: タイムスタンプ
        const ts = timestamp instanceof Date ? timestamp : new Date(timestamp);
        if (!isNaN(ts.getTime())) {
          if (!latestTimestamp || ts > latestTimestamp) {
            latestTimestamp = ts;
            targetRow = row;
          }
        } else if (!targetRow) {
          targetRow = row;
        }
      }
    });
    
    if (!targetRow) {
      Logger.log(`エラー: 会員ID ${memberId} のデータが見つかりません`);
      return;
    }
    
    // 以降はprocessNewGoalHearingResponseと同じ処理
    const keyCol = ai2026_findCol_(hMap, AI2026_CFG.KEY_CANDIDATES);
    if (!keyCol) {
      Logger.log('エラー: Submission ID列が見つかりません');
      return;
    }
    
    const submissionId = String(targetRow[keyCol - 1] || '').trim();
    if (!submissionId) {
      Logger.log('Submission IDがありません');
      return;
    }
    
    // 既に処理済みかチェック
    const aiSh = ai2026_getOrCreateAiSheet_(ss);
    const existingMap = ai2026_readExistingAiMap_(aiSh);
    
    if (existingMap[submissionId]) {
      const existingRow = existingMap[submissionId];
      const done = aiSh.getRange(existingRow, 4).getValue();
      if (done === '済') {
        Logger.log(`Submission ID=${submissionId} は既に処理済みです`);
        return;
      }
    }
    
    // AI分析を実行
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      Logger.log('エラー: GEMINI_API_KEYが設定されていません');
      return;
    }
    
    const memberIdFromRow = ai2026_getByAny_(hMap, targetRow, AI2026_CFG.MEMBER_ID_CANDIDATES);
    const name = ai2026_getByAny_(hMap, targetRow, AI2026_CFG.NAME_CANDIDATES);
    const height = ai2026_getByAny_(hMap, targetRow, AI2026_CFG.HEIGHT_CANDIDATES);
    const weight = ai2026_getByAny_(hMap, targetRow, AI2026_CFG.WEIGHT_CANDIDATES);
    const bf = ai2026_getByAny_(hMap, targetRow, AI2026_CFG.BF_CANDIDATES);
    const targetText = ai2026_getByAny_(hMap, targetRow, AI2026_CFG.TARGET_TEXT_CANDIDATES);
    const g1 = ai2026_getByAny_(hMap, targetRow, AI2026_CFG.GOAL1_CANDIDATES);
    const g2 = ai2026_getByAny_(hMap, targetRow, AI2026_CFG.GOAL2_CANDIDATES);
    const g3 = ai2026_getByAny_(hMap, targetRow, AI2026_CFG.GOAL3_CANDIDATES);
    const gender = ai2026_getByAny_(hMap, targetRow, AI2026_CFG.GENDER_CANDIDATES) || '男性';
    const targetPhotoUrl = ai2026_getByAny_(hMap, targetRow, AI2026_CFG.TARGET_PHOTO_CANDIDATES);
    
    // トレーニング履歴を取得
    const trainingHistory = ai2026_getTrainingHistory_(ss, memberIdFromRow, AI2026_CFG.TRAINING_FETCH_LIMIT);
    
    // 目標写真を分析
    const photoAnalysis = ai2026_analyzeTargetPhoto_(apiKey, targetPhotoUrl, gender);
    
    const prompt = ai2026_buildPrompt_({
      key: submissionId,
      memberId: memberIdFromRow,
      name,
      height,
      weight,
      bf,
      targetText,
      g1,
      g2,
      g3,
      gender,
      trainingHistory,
      photoAnalysis
    });
    
    const result = ai2026_callGeminiJson_(apiKey, prompt);
    
    const now = new Date();
    const done = result.ok ? '済' : '失敗';
    const status = result.ok ? 'OK' : (result.error || 'ERROR');
    const aiText = result.ok ? ai2026_clip_(result.data.ai_text || '', AI2026_CFG.MAX_OUTPUT_CHARS) : ai2026_clip_(result.raw || '', AI2026_CFG.MAX_OUTPUT_CHARS);
    
    const writeRow = existingMap[submissionId] || aiSh.getLastRow() + 1;
    aiSh.getRange(writeRow, 1, 1, 6).setValues([[
      submissionId,
      memberIdFromRow || '',
      aiText || '',
      done,
      now,
      status
    ]]);
    
    Logger.log(`✅ AI分析完了: Submission ID=${submissionId}, memberId=${memberIdFromRow}, status=${status}`);
    
  } catch (error) {
    Logger.log(`❌ AI分析エラー: ${error.message}`);
    Logger.log(`エラースタック: ${error.stack}`);
  }
}

/**
 * 新規フォーム回答を自動処理（トリガー用）
 * 「2026目標ヒアリング_回答」シートに新しい行が追加されたときに実行
 * 最新の回答に対してAI分析を実行
 */
function processNewGoalHearingResponse() {
  try {
    Logger.log('=== 新規フォーム回答の自動処理を開始 ===');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hearingSheet = ss.getSheetByName('2026目標ヒアリング_回答');
    
    if (!hearingSheet) {
      Logger.log('エラー: 2026目標ヒアリング_回答シートが見つかりません');
      return;
    }
    
    const lastRow = hearingSheet.getLastRow();
    if (lastRow < 2) {
      Logger.log('データがありません');
      return;
    }
    
    // 最新の回答を取得
    const lastCol = hearingSheet.getLastColumn();
    const headers = hearingSheet.getRange(1, 1, 1, lastCol).getValues()[0].map(v => String(v || '').trim());
    const hMap = ai2026_buildHeaderMap_(headers);
    
    const latestRow = hearingSheet.getRange(lastRow, 1, 1, lastCol).getValues()[0];
    
    // Submission IDを取得
    const keyCol = ai2026_findCol_(hMap, AI2026_CFG.KEY_CANDIDATES);
    if (!keyCol) {
      Logger.log('エラー: Submission ID列が見つかりません');
      return;
    }
    
    const submissionId = String(latestRow[keyCol - 1] || '').trim();
    if (!submissionId) {
      Logger.log('最新行にSubmission IDがありません');
      return;
    }
    
    // 既に処理済みかチェック
    const aiSh = ai2026_getOrCreateAiSheet_(ss);
    const existingMap = ai2026_readExistingAiMap_(aiSh);
    
    if (existingMap[submissionId]) {
      const existingRow = existingMap[submissionId];
      const done = aiSh.getRange(existingRow, 4).getValue();
      if (done === '済') {
        Logger.log(`Submission ID=${submissionId} は既に処理済みです`);
        return;
      }
    }
    
    // AI分析を実行
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      Logger.log('エラー: GEMINI_API_KEYが設定されていません');
      return;
    }
    
    const memberId = ai2026_getByAny_(hMap, latestRow, AI2026_CFG.MEMBER_ID_CANDIDATES);
    const name = ai2026_getByAny_(hMap, latestRow, AI2026_CFG.NAME_CANDIDATES);
    const height = ai2026_getByAny_(hMap, latestRow, AI2026_CFG.HEIGHT_CANDIDATES);
    const weight = ai2026_getByAny_(hMap, latestRow, AI2026_CFG.WEIGHT_CANDIDATES);
    const bf = ai2026_getByAny_(hMap, latestRow, AI2026_CFG.BF_CANDIDATES);
    const targetText = ai2026_getByAny_(hMap, latestRow, AI2026_CFG.TARGET_TEXT_CANDIDATES);
    const g1 = ai2026_getByAny_(hMap, latestRow, AI2026_CFG.GOAL1_CANDIDATES);
    const g2 = ai2026_getByAny_(hMap, latestRow, AI2026_CFG.GOAL2_CANDIDATES);
    const g3 = ai2026_getByAny_(hMap, latestRow, AI2026_CFG.GOAL3_CANDIDATES);
    const gender = ai2026_getByAny_(hMap, latestRow, AI2026_CFG.GENDER_CANDIDATES) || '男性';
    const targetPhotoUrl = ai2026_getByAny_(hMap, latestRow, AI2026_CFG.TARGET_PHOTO_CANDIDATES);
    
    // トレーニング履歴を取得
    const trainingHistory = ai2026_getTrainingHistory_(ss, memberId, AI2026_CFG.TRAINING_FETCH_LIMIT);
    
    // 目標写真を分析
    const photoAnalysis = ai2026_analyzeTargetPhoto_(apiKey, targetPhotoUrl, gender);
    
    const prompt = ai2026_buildPrompt_({
      key: submissionId,
      memberId,
      name,
      height,
      weight,
      bf,
      targetText,
      g1,
      g2,
      g3,
      gender,
      trainingHistory,
      photoAnalysis
    });
    
    const result = ai2026_callGeminiJson_(apiKey, prompt);
    
    const now = new Date();
    const done = result.ok ? '済' : '失敗';
    const status = result.ok ? 'OK' : (result.error || 'ERROR');
    const aiText = result.ok ? ai2026_clip_(result.data.ai_text || '', AI2026_CFG.MAX_OUTPUT_CHARS) : ai2026_clip_(result.raw || '', AI2026_CFG.MAX_OUTPUT_CHARS);
    
    const writeRow = existingMap[submissionId] || aiSh.getLastRow() + 1;
    aiSh.getRange(writeRow, 1, 1, 6).setValues([[
      submissionId,
      memberId || '',
      aiText || '',
      done,
      now,
      status
    ]]);
    
    Logger.log(`✅ 新規フォーム回答を処理しました: Submission ID=${submissionId}, memberId=${memberId}, status=${status}`);
    
  } catch (error) {
    Logger.log(`❌ 新規フォーム回答の自動処理エラー: ${error.message}`);
    Logger.log(`エラースタック: ${error.stack}`);
  }
}

/**
 * 未処理のフォーム回答をすべてAI分析する
 * 「2026目標ヒアリング_回答」シートの未処理回答をすべて処理します
 */
function processAllPendingGoalHearingResponses() {
  try {
    Logger.log('=== 未処理フォーム回答の一括処理を開始 ===');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hearingSheet = ss.getSheetByName('2026目標ヒアリング_回答');
    
    if (!hearingSheet) {
      Logger.log('エラー: 2026目標ヒアリング_回答シートが見つかりません');
      return;
    }
    
    const lastRow = hearingSheet.getLastRow();
    if (lastRow < 2) {
      Logger.log('データがありません');
      return;
    }
    
    // AI分析シートから既に処理済みのSubmission IDを取得
    const aiSh = ai2026_getOrCreateAiSheet_(ss);
    const existingMap = ai2026_readExistingAiSheet_(aiSh);
    
    // フォーム回答シートのデータを取得
    const lastCol = hearingSheet.getLastColumn();
    const headers = hearingSheet.getRange(1, 1, 1, lastCol).getValues()[0].map(v => String(v || '').trim());
    const hMap = ai2026_buildHeaderMap_(headers);
    
    const keyCol = ai2026_findCol_(hMap, AI2026_CFG.KEY_CANDIDATES);
    const colMemberId = ai2026_findCol_(hMap, AI2026_CFG.MEMBER_ID_CANDIDATES);
    
    if (!keyCol || !colMemberId) {
      Logger.log('エラー: 必要な列（Submission ID、member_id）が見つかりません');
      return;
    }
    
    const values = hearingSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (!apiKey) {
      Logger.log('エラー: GEMINI_API_KEYが設定されていません');
      return;
    }
    
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    
    // 各回答をチェックして、未処理のものだけ処理
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const submissionId = String(row[keyCol - 1] || '').trim();
      const memberId = String(row[colMemberId - 1] || '').trim();
      
      if (!submissionId || !memberId) {
        skipped++;
        continue;
      }
      
      // 既に処理済みかチェック
      if (existingMap[submissionId]) {
        const existingRow = existingMap[submissionId];
        const done = aiSh.getRange(existingRow, 4).getValue();
        if (done === '済') {
          skipped++;
          continue;
        }
      }
      
      Logger.log(`処理中: ${memberId} (Submission ID: ${submissionId})`);
      
      try {
        // AI分析を実行
        const name = ai2026_getByAny_(hMap, row, AI2026_CFG.NAME_CANDIDATES);
        const height = ai2026_getByAny_(hMap, row, AI2026_CFG.HEIGHT_CANDIDATES);
        const weight = ai2026_getByAny_(hMap, row, AI2026_CFG.WEIGHT_CANDIDATES);
        const bf = ai2026_getByAny_(hMap, row, AI2026_CFG.BF_CANDIDATES);
        const targetText = ai2026_getByAny_(hMap, row, AI2026_CFG.TARGET_TEXT_CANDIDATES);
        const g1 = ai2026_getByAny_(hMap, row, AI2026_CFG.GOAL1_CANDIDATES);
        const g2 = ai2026_getByAny_(hMap, row, AI2026_CFG.GOAL2_CANDIDATES);
        const g3 = ai2026_getByAny_(hMap, row, AI2026_CFG.GOAL3_CANDIDATES);
        const gender = ai2026_getByAny_(hMap, row, AI2026_CFG.GENDER_CANDIDATES) || '男性';
        const targetPhotoUrl = ai2026_getByAny_(hMap, row, AI2026_CFG.TARGET_PHOTO_CANDIDATES);
        
        // トレーニング履歴を取得
        const trainingHistory = ai2026_getTrainingHistory_(ss, memberId, AI2026_CFG.TRAINING_FETCH_LIMIT);
        
        // 目標写真を分析
        const photoAnalysis = ai2026_analyzeTargetPhoto_(apiKey, targetPhotoUrl, gender);
        
        const prompt = ai2026_buildPrompt_({
          key: submissionId,
          memberId,
          name,
          height,
          weight,
          bf,
          targetText,
          g1,
          g2,
          g3,
          gender,
          trainingHistory,
          photoAnalysis
        });
        
        const result = ai2026_callGeminiJson_(apiKey, prompt);
        
        const now = new Date();
        const done = result.ok ? '済' : '失敗';
        const status = result.ok ? 'OK' : (result.error || 'ERROR');
        const aiText = result.ok ? ai2026_clip_(result.data.ai_text || '', AI2026_CFG.MAX_OUTPUT_CHARS) : ai2026_clip_(result.raw || '', AI2026_CFG.MAX_OUTPUT_CHARS);
        
        const writeRow = existingMap[submissionId] || aiSh.getLastRow() + 1;
        aiSh.getRange(writeRow, 1, 1, 6).setValues([[
          submissionId,
          memberId || '',
          aiText || '',
          done,
          now,
          status
        ]]);
        
        if (!existingMap[submissionId]) {
          existingMap[submissionId] = writeRow;
        }
        
        processed++;
        Logger.log(`✅ 処理完了: ${memberId} (${processed}件目)`);
        
        // API制限を考慮して少し待つ
        Utilities.sleep(500);
        
      } catch (error) {
        errors++;
        Logger.log(`❌ エラー: ${memberId} - ${error.message}`);
      }
    }
    
    Logger.log(`=== 一括処理完了 ===`);
    Logger.log(`処理済み: ${processed}件`);
    Logger.log(`スキップ: ${skipped}件（既に処理済み）`);
    Logger.log(`エラー: ${errors}件`);
    
  } catch (error) {
    Logger.log(`❌ 一括処理エラー: ${error.message}`);
    Logger.log(`エラースタック: ${error.stack}`);
  }
}

/**
 * AI分析シートから既存データを読み込む（改善版）
 */
function ai2026_readExistingAiSheet_(aiSh) {
  const map = {};
  const lastRow = aiSh.getLastRow();
  if (lastRow < 2) return map;
  
  const values = aiSh.getRange(2, 1, lastRow - 1, 1).getValues(); // key列のみ
  values.forEach((row, index) => {
    const key = String(row[0] || '').trim();
    if (key) map[key] = index + 2; // 行番号（ヘッダー行を考慮）
  });
  
  return map;
}

/**
 * フォーム送信時に自動実行されるトリガーを設定
 * 使い方: GASエディタでこの関数を1回実行すると、フォーム送信時に自動的にprocessNewGoalHearingResponse()が実行されます
 */
function setupGoalHearingFormTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 既存のトリガーを削除（重複防止）
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'onGoalHearingFormSubmit') {
      ScriptApp.deleteTrigger(t);
    }
  });
  
  // フォーム送信時に実行されるトリガーを作成
  ScriptApp.newTrigger('onGoalHearingFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
  
  Logger.log('✅ フォーム送信トリガーを設定しました');
  Logger.log('「2026目標ヒアリング_回答」シートに新しい回答が追加されると、自動的にAI分析が実行されます。');
}

/**
 * フォーム送信トリガー（自動実行される関数）
 */
function onGoalHearingFormSubmit(e) {
  if (!e || !e.range) return;
  
  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();
  
  // 「2026目標ヒアリング_回答」シートの送信時のみ処理
  if (sheetName !== '2026目標ヒアリング_回答') return;
  
  Logger.log(`フォーム送信を検知: シート=${sheetName}, 行=${e.range.getRow()}`);
  
  // 少し待ってから処理（データが完全に書き込まれるのを待つ）
  Utilities.sleep(1000);
  
  // 新規回答を処理
  processNewGoalHearingResponse();
}

/**
 * 目標写真をGeminiで分析
 */
function ai2026_analyzeTargetPhoto_(apiKey, imageUrl, gender) {
  if (!imageUrl || imageUrl.trim() === '' || !imageUrl.startsWith('http')) {
    return { summary: '目標写真なし' };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${encodeURIComponent(apiKey)}`;

  // 性別に応じた分析項目を変更
  const genderSpecificPrompt = gender === '女性' || gender === 'female' || gender === 'Female' ? `
7. 推定食生活: （タンパク質重視、低糖質など）
8. 推定トレーニング頻度: 週○回
9. 推定トレーニング強度: [軽い/中程度/高い]
10. 推定有酸素運動: [少なめ/適度/多め]

JSON形式で返してください：
{
  "body_fat_percentage": "18-20%",
  "estimated_height": "160cm",
  "estimated_weight": "52-54kg",
  "lean_mass": "42kg",
  "muscle_level": "普通",
  "features": "腹部が引き締まっている、脚に筋肉のライン...",
  "key_points": ["体脂肪率を20%以下に", "下半身トレ重視", "タンパク質1.5g/kg"],
  "estimated_diet": "高タンパク・中糖質・低脂質、間食少なめ",
  "estimated_frequency": "週3-4回",
  "estimated_intensity": "中程度（8-12回で限界になる重量）",
  "estimated_cardio": "適度（週2-3回、20-30分）"
}
` : `
7. 推定ベンチプレスMAX: ○kg（1RM）
8. 推定スクワットMAX: ○kg（1RM）
9. 推定デッドリフトMAX: ○kg（1RM）
10. 推定トレーニング経験: [初心者/中級者/上級者]

JSON形式で返してください：
{
  "body_fat_percentage": "10-12%",
  "estimated_height": "172cm",
  "estimated_weight": "68-70kg",
  "lean_mass": "60kg",
  "muscle_level": "高い",
  "features": "腹筋が6パックに割れている、肩と胸が発達...",
  "key_points": ["体脂肪率を12%以下に", "胸・肩の筋トレ重視", "タンパク質2g/kg"],
  "estimated_bench_press": "80-90kg",
  "estimated_squat": "100-120kg",
  "estimated_deadlift": "120-140kg",
  "estimated_experience": "中級者（トレーニング歴1-3年）"
}
`;

  const prompt = `
この画像の人物の体型を専門トレーナーとして詳しく分析してください。

以下の項目を数値で推定してください：
1. 推定体脂肪率: ○%
2. 推定身長: ○cm（写真から体型バランスで推測）
3. 推定体重: ○kg
4. 推定除脂肪体重: ○kg
5. 筋肉量レベル: [低い/普通/高い/非常に高い]
6. 体型の特徴: （腹筋の見え方、肩の発達、腕の太さなど）
${genderSpecificPrompt}
`;

  const payload = {
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: ''
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1000,
      responseMimeType: "application/json"
    }
  };

  // URLから画像を取得してBase64に変換
  try {
    const imgResponse = UrlFetchApp.fetch(imageUrl, { muteHttpExceptions: true });
    const imgBlob = imgResponse.getBlob();
    const base64 = Utilities.base64Encode(imgBlob.getBytes());
    
    payload.contents[0].parts[1].inline_data.data = base64;
    payload.contents[0].parts[1].inline_data.mime_type = imgBlob.getContentType() || 'image/jpeg';

    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const code = res.getResponseCode();
    const text = res.getContentText() || '';

    if (code < 200 || code >= 300) {
      Logger.log(`画像分析エラー: HTTP ${code}`);
      return { summary: '画像分析失敗（API エラー）' };
    }

    const json = JSON.parse(text);
    const candidateText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let data;
    try {
      data = JSON.parse(candidateText);
    } catch (e) {
      const extracted = ai2026_extractJson_(candidateText);
      if (!extracted.ok) {
        return { summary: '画像分析失敗（JSON パース失敗）' };
      }
      data = extracted.obj;
    }

    // サマリー作成（性別で分岐）
    const genderSpecificSummary = gender === '女性' || gender === 'female' || gender === 'Female' ? `
- 推定食生活: ${data.estimated_diet || '不明'}
- 推定トレーニング頻度: ${data.estimated_frequency || '不明'}
- 推定トレーニング強度: ${data.estimated_intensity || '不明'}
- 推定有酸素運動: ${data.estimated_cardio || '不明'}
` : `
- 推定ベンチプレスMAX: ${data.estimated_bench_press || '不明'}
- 推定スクワットMAX: ${data.estimated_squat || '不明'}
- 推定デッドリフトMAX: ${data.estimated_deadlift || '不明'}
- 推定トレーニング経験: ${data.estimated_experience || '不明'}
`;

    const summary = `
【目標写真の分析結果】
- 推定体脂肪率: ${data.body_fat_percentage || '不明'}
- 推定身長: ${data.estimated_height || '不明'}
- 推定体重: ${data.estimated_weight || '不明'}
- 推定除脂肪体重: ${data.lean_mass || '不明'}
- 筋肉量レベル: ${data.muscle_level || '不明'}
- 体型の特徴: ${data.features || '不明'}
${genderSpecificSummary}
- この体型になるには:
  ${(data.key_points || []).map((p, i) => `  ${i + 1}. ${p}`).join('\n')}
`.trim();

    return { summary, data };

  } catch (e) {
    Logger.log(`画像分析エラー: ${e}`);
    return { summary: '画像分析失敗（取得エラー）' };
  }
}

/**
 * 会員のトレーニング履歴を取得（最新N回分）
 */
function ai2026_getTrainingHistory_(ss, memberId, limit) {
  const sh = ss.getSheetByName(AI2026_CFG.SHEET_TRAINING);
  if (!sh) {
    Logger.log(`警告: トレーニング記録シート「${AI2026_CFG.SHEET_TRAINING}」が見つかりません`);
    return { summary: 'トレーニング履歴データなし' };
  }

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return { summary: 'トレーニング記録なし' };

  const lastCol = sh.getLastColumn();
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  const hMap = ai2026_buildHeaderMap_(headers);

  const memberIdCol = ai2026_findCol_(hMap, [AI2026_CFG.TRAINING_MEMBER_ID_COL]);
  if (!memberIdCol) {
    Logger.log('警告: トレーニング記録シートにmember_id列が見つかりません');
    return { summary: 'member_id列が見つかりません' };
  }

  // 全データを取得
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  // この会員のデータだけフィルタ
  const filtered = values
    .map((row, idx) => ({ row, originalRow: idx + 2 }))
    .filter(item => String(item.row[memberIdCol - 1] || '').trim() === String(memberId).trim())
    .reverse()  // 新しい順
    .slice(0, limit);  // 最新N件

  if (filtered.length === 0) {
    return { summary: `会員ID:${memberId}のトレーニング記録なし`, count: 0 };
  }

  // データを整形
  const records = filtered.map(item => {
    const row = item.row;
    const record = {};
    headers.forEach((h, i) => {
      const key = String(h).trim();
      if (key) record[key] = String(row[i] || '').trim();
    });
    return record;
  });

  // サマリー作成（AIに渡しやすい形式）
  const summary = `
【トレーニング履歴サマリー】
- 記録回数: ${records.length}回
- 最新記録:
${records.slice(0, 3).map((r, i) => {
  const date = r['タイムスタンプ'] || r['日付'] || '日付不明';
  const menu = r['メニューまみあ'] || r['セットまとめ'] || r['種目セットまとめ'] || 'メニュー詳細不明';
  return `  ${i + 1}. ${date}: ${menu.slice(0, 100)}`;
}).join('\n')}

- 継続状況: 直近${records.length}回のトレーニング実施
- 頻度パターン: ${records.length >= 5 ? '定期的に実施' : '記録少なめ'}
`.trim();

  return { summary, count: records.length, records };
}

/* =================== 内部関数 =================== */

function ai2026_getOrCreateAiSheet_(ss) {
  let sh = ss.getSheetByName(AI2026_CFG.SHEET_AI);
  if (!sh) {
    sh = ss.insertSheet(AI2026_CFG.SHEET_AI);
    sh.getRange(1, 1, 1, 6).setValues([[
      'key', 'member_id', 'ai_text', 'done', 'analyzed_at', 'status'
    ]]);
    sh.setFrozenRows(1);
  } else {
    const h = sh.getRange(1, 1, 1, Math.max(6, sh.getLastColumn())).getValues()[0].map(String);
    if (String(h[0] || '').trim() !== 'key') {
      sh.getRange(1, 1, 1, 6).setValues([[
        'key', 'member_id', 'ai_text', 'done', 'analyzed_at', 'status'
      ]]);
      sh.setFrozenRows(1);
    }
  }
  return sh;
}

function ai2026_readExistingAiMap_(aiSh) {
  const lastRow = aiSh.getLastRow();
  const map = {};
  if (lastRow < 2) return map;
  const keys = aiSh.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  for (let i = 0; i < keys.length; i++) {
    const k = String(keys[i] || '').trim();
    if (k) map[k] = i + 2;
  }
  return map;
}

function ai2026_callGeminiJson_(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI2026_CFG.MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const payload = {
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 3000,
      responseMimeType: "application/json"
    }
  };

  let lastErr = null;
  for (let attempt = 0; attempt <= AI2026_CFG.MAX_RETRY; attempt++) {
    try {
      const res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      const code = res.getResponseCode();
      const text = res.getContentText() || '';

      if (code === 503 || code === 429) {
        lastErr = `[HTTP ${code}] ${text}`;
        Utilities.sleep(500 * Math.pow(2, attempt));
        continue;
      }
      if (code < 200 || code >= 300) {
        return { ok: false, error: `HTTP ${code}`, raw: text };
      }

      const json = JSON.parse(text);
      const candidateText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      let data;
      try {
        data = JSON.parse(candidateText);
      } catch (e) {
        const extracted = ai2026_extractJson_(candidateText);
        if (!extracted.ok) return { ok: false, error: 'JSON抽出失敗', raw: candidateText };
        data = extracted.obj;
      }

      return { ok: true, data };

    } catch (e) {
      lastErr = String(e);
      Utilities.sleep(500 * Math.pow(2, attempt));
    }
  }

  return { ok: false, error: 'RETRY_EXCEEDED', raw: lastErr || '' };
}

function ai2026_extractJson_(s) {
  const t = String(s || '');
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return { ok: false };
  const slice = t.slice(start, end + 1);
  try {
    return { ok: true, obj: JSON.parse(slice) };
  } catch (e) {
    return { ok: false };
  }
}

function ai2026_buildPrompt_(d) {
  return `
あなたはAbodyのデータ分析に強いトレーナーです。
会員様の過去のトレーニング履歴から**現実的な進捗ペース**を計算し、
シンプルで見やすい目標達成ロードマップを作成してください。

# 入力データ
- 会員ID: ${d.memberId || ''}
- 氏名: ${d.name || ''}
- 性別: ${d.gender || '男性'}
- 身長: ${d.height || ''}cm
- 現在の体重: ${d.weight || ''}kg
- 現在の体脂肪率: ${d.bf || ''}%
- 2026年の目標: ${d.targetText || ''}
- 優先順位1: ${d.g1 || ''}
- 優先順位2: ${d.g2 || ''}
- 優先順位3: ${d.g3 || ''}

# 過去のトレーニング履歴（重要）
${d.trainingHistory?.summary || 'トレーニング履歴データなし'}

# 目標写真の分析結果（重要）
${d.photoAnalysis?.summary || '目標写真なし'}

# 出力形式（JSON）
{
  "ai_text": "（ここに分析結果を記述）"
}

# ai_textの構成（必須・この順番で）

## 📊 現状分析と目標設定

### 現在の数値
- 体重: ○kg / 体脂肪率: ○% / 除脂肪体重: ○kg

### 過去データから見た特徴
- トレーニング頻度: 週○回ペース（過去${d.trainingHistory?.count || 0}回記録）
- 継続性: [高い/普通/低い]
- よく行う種目: ○○、○○（履歴から抽出）

### 2026年12月の最終目標
${d.gender === '女性' || d.gender === 'female' || d.gender === 'Female' ? `
- 目標体重: ○kg（現状から-○kg、目標写真の推定: ${d.photoAnalysis?.data?.estimated_weight || '不明'}）
- 目標体脂肪率: ○%（現状から-○%、目標写真の推定: ${d.photoAnalysis?.data?.body_fat_percentage || '不明'}）
- 目標除脂肪体重: ○kg（筋肉量○kg増加、目標写真の推定: ${d.photoAnalysis?.data?.lean_mass || '不明'}）
- **目標写真の体型:** ${d.photoAnalysis?.data?.features || '目標写真なし'}
- **目標写真の推定食生活:** ${d.photoAnalysis?.data?.estimated_diet || '不明'}
- **目標写真の推定トレーニング:** ${d.photoAnalysis?.data?.estimated_frequency || '不明'}、強度: ${d.photoAnalysis?.data?.estimated_intensity || '不明'}
` : `
- 目標体重: ○kg（現状から-○kg、目標写真の推定: ${d.photoAnalysis?.data?.estimated_weight || '不明'}）
- 目標体脂肪率: ○%（現状から-○%、目標写真の推定: ${d.photoAnalysis?.data?.body_fat_percentage || '不明'}）
- 目標除脂肪体重: ○kg（筋肉量○kg増加、目標写真の推定: ${d.photoAnalysis?.data?.lean_mass || '不明'}）
- 目標ベンチプレス: ○kg（現状+○kg、目標写真の推定: ${d.photoAnalysis?.data?.estimated_bench_press || '不明'}）
- 目標スクワット: ○kg（現状+○kg、目標写真の推定: ${d.photoAnalysis?.data?.estimated_squat || '不明'}）
- **目標写真の体型:** ${d.photoAnalysis?.data?.features || '目標写真なし'}
`}

---

## 🎯 マイルストーン目標（4段階）

### 【1ヶ月後】2026年2月
- 体重: ○kg（-○kg）
- 体脂肪率: ○%（-○%）
- ベンチプレス: ○kg（+○kg）
- 達成の鍵: ○○を週○回、食事記録を○日間

### 【3ヶ月後】2026年4月
- 体重: ○kg（-○kg）
- 体脂肪率: ○%（-○%）
- ベンチプレス: ○kg（+○kg）
- スクワット: ○kg（+○kg）
- 達成の鍵: ○○を継続、PFC比率を○:○:○に調整

### 【6ヶ月後】2026年7月
- 体重: ○kg（-○kg）
- 体脂肪率: ○%（-○%）
- ベンチプレス: ○kg（+○kg）
- スクワット: ○kg（+○kg）
- 達成の鍵: ○○の重量をさらに伸ばす、有酸素追加

### 【12ヶ月後】2026年12月（最終目標）
- 体重: ○kg（目標達成！）
- 体脂肪率: ○%（腹筋バキバキ）
- ベンチプレス: ○kg（+○kg）
- スクワット: ○kg（+○kg）
- 見た目: ○○の目標写真に到達

---

## 💪 具体的なトレーニング戦略

### 第1期（1-3ヶ月）基礎づくり
**目的:** 筋力向上 + 食習慣の改善
**頻度:** 週3回
**推奨種目（5つ）:**
1. スクワット: ○kg → ○kg（○回×3セット）
2. ベンチプレス: ○kg → ○kg（○回×3セット）
3. デッドリフト: ○kg → ○kg（○回×3セット）
4. ラットプルダウン: ○kg → ○kg（○回×3セット）
5. クランチ: 自重（○回×3セット）

### 第2期（4-6ヶ月）減量集中
**目的:** 体脂肪率を○%まで落とす
**頻度:** 週3-4回（筋トレ3回 + 有酸素1回）
**推奨種目（5つ）:**
1. スクワット: ○kg（○回×4セット）
2. ベンチプレス: ○kg（○回×4セット）
3. ショルダープレス: ○kg（○回×3セット）
4. ローイング: ○kg（○回×3セット）
5. プランク: ○秒×3セット

### 第3期（7-9ヶ月）筋肥大
**目的:** 除脂肪体重を○kg増やす
**頻度:** 週4回
**変更点:** ボリューム増加、セット数4-5に

### 第4期（10-12ヶ月）仕上げ
**目的:** 腹筋のカットを出す
**頻度:** 週3回
**変更点:** 高回数・低負荷で引き締め

---

## 🍽️ 食事戦略（実行可能）

### PFCバランス
- **第1-2期（減量）:** P=体重×2.2g / F=体重×0.8g / C=○g
  → カロリー: ○kcal/日
- **第3期（増量）:** P=体重×2.0g / F=体重×1.0g / C=○g
  → カロリー: ○kcal/日

### 外食時のルール
1. ○○を選ぶ（例: 焼き魚定食、鶏むね肉）
2. ○○は避ける（例: 揚げ物、ラーメン）

### 間食テンプレ（3パターン）
1. プロテイン + バナナ
2. ゆで卵2個 + ナッツ10粒
3. ギリシャヨーグルト + ベリー

---

## ⚠️ よくあるつまずきポイント（過去データから予測）

### 1. 停滞期（4-5ヶ月目）
**症状:** 体重が2週間変わらない
**対策:** カロリーを○kcal減らす、有酸素を週2回に

### 2. トレーニング頻度の低下
**症状:** 週1回になる
**対策:** ○○だけでもやる（最低ライン）

### 3. 食事の乱れ
**症状:** 外食が続く
**対策:** コンビニで○○を買う（予備プラン）

---

## 📅 今週やること（5つ）

1. ✅ スクワット○kg×○回を達成
2. ✅ 食事記録を7日間つける
3. ✅ 体重・体脂肪率を月曜に測定
4. ✅ プロテインを1日2回飲む
5. ✅ 睡眠7時間を3日以上確保

---

## 💬 トレーナーから

${d.name || '会員様'}、過去のデータを見ると${d.trainingHistory?.count || 0}回のトレーニング記録があり、継続力は素晴らしいです。
目標の「${d.targetText || ''}」は、上記のペースなら○月頃に達成できる見込みです。
毎月○日に測定して、進捗を確認しましょう！

---

# 重要な計算根拠
- 月あたりの体脂肪減少: 0.5-1.0%（健康的なペース）
- 月あたりの筋力向上: ベンチプレス+2-3kg（初心者）
- 除脂肪体重の維持: タンパク質○g/日で維持可能

※上記の数値は、過去のトレーニング頻度（週○回）と継続性から算出した現実的な目標です。
`.trim();
}

function ai2026_buildHeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    map[ai2026_norm_(h)] = i + 1;
  });
  return map;
}

function ai2026_findCol_(hMap, candidates) {
  for (const c of candidates) {
    const key = ai2026_norm_(c);
    if (hMap[key]) return hMap[key];
    const hit = Object.keys(hMap).find(k => k.includes(key));
    if (hit) return hMap[hit];
  }
  return null;
}

function ai2026_getByAny_(hMap, row, candidates) {
  const col = ai2026_findCol_(hMap, candidates);
  if (!col) return '';
  return String(row[col - 1] || '').trim();
}

function ai2026_norm_(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/　+/g, '')
    .replace(/[‐-‒–—−]/g, '-')
    .replace(/[（）()]/g, '');
}

function ai2026_clip_(s, maxChars) {
  const t = String(s || '');
  return t.length > maxChars ? t.slice(0, maxChars) + '…' : t;
}