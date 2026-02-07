/**
 * Abody 会員用カルテ（会員ID + メールアドレスログイン）
 * 改善版：身長データ、理想値計算、進捗プラン追加
 */

const MW_SPREADSHEET_ID = "1CJ1PrsAwW_yohmw0NB7viOUaeKIP6qQFmRQhHstjtiE";

const MW_SHEETS = {
  MEMBERS: "メンバーシート",
  SESSIONS: "フォームの回答 1",
  POSTURE: "姿勢評価",
  AI_2026: "2026_AI",
  GOALS_2026: "2026_最新",
  GOALS_HEARING: "2026目標ヒアリング_回答",
  WEIGHT_LOG: "体重記録",
};

const MW_HEADERS = {
  member_id: ["member_id", "会員ID", "会員コード", "ID"],
  member_name: ["氏名", "会員名", "名前", "会員様名"],
  member_email: ["メールアドレス", "メール", "email", "Email", "mail", "Mail"],
  member_height: ["ボディメ身長", "身長", "身長cm", "身長（cm）", "height", "Height"],
  
  session_ts: ["タイムスタンプ", "timestamp", "日時", "日付", "送信日時"],
  session_member_id: ["member_id", "会員ID", "会員コード", "ID"],
  session_trainer: ["担当", "担当トレーナー", "トレーナー"],
  session_body_part: ["部位", "部位（どこ）", "トレ部位", "部位選択"],
  menu1: ["メニュー①", "メニュー1", "種目①", "種目1"],
  set1: ["回数×セット①", "回数×セット1", "回数セット①", "回数セット1"],
  menu2: ["メニュー②", "メニュー2", "種目②", "種目2"],
  set2: ["回数×セット②", "回数×セット2", "回数セット②", "回数セット2"],
  
  posture_member_id: ["member_id", "会員ID", "会員コード", "ID"],
  posture_ai: ["AI", "AIサマリー", "姿勢AI", "Gemini", "姿勢評価アプローチ（Gemini）"],
  
  goals_member_id: ["member_id", "会員ID", "会員コード", "ID"],
  goals_target_photo: ["理想の体型写真", "目標の体型写真", "目標写真", "target_photo"],
  goals_height: ["ボディメ身長", "身長", "身長cm", "身長（cm）"],
  goals_goal_date: ["目標達成日", "目標日", "達成予定日"],
};

const MW_FALLBACK = {
  SESSION_TIMESTAMP_COL: 1,
  SESSION_MEMBER_ID_COL: 3,
  SESSION_TRAINER_COL: 5,
  SESSION_BODY_PART_COL: 6,
  MENU_PAIRS: [
    { menu: 9, set: 10 },
    { menu: 11, set: 12 },
    { menu: 13, set: 14 },
    { menu: 15, set: 16 },
    { menu: 17, set: 18 },
  ],
};

const MW_AI_2026_COLS = {
  MEMBER_ID_COL: 2,
  AI_TEXT_COL: 3,
  DONE_COL: 4,
  ANALYZED_AT_COL: 5,
  STATUS_COL: 6,
};

function doGet_Member() {
  return HtmlService.createTemplateFromFile("member_index")
    .evaluate()
    .setTitle("Abody マイカルテ")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** ===== デバッグ用：身長データ確認 ===== */
function DEBUG_checkHeightData(memberId) {
  if (!memberId) memberId = "TEST001"; // テスト用のデフォルトID
  
  Logger.log("========== 身長データデバッグ ==========");
  Logger.log(`対象会員ID: ${memberId}`);
  
  // メンバーシートをチェック
  try {
    const sh = mw_getSheet_(MW_SHEETS.MEMBERS);
    const header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    Logger.log(`\n【メンバーシート】`);
    Logger.log(`ヘッダー行: ${JSON.stringify(header)}`);
    
    const colHeight = mw_findColByHeader_(header, MW_HEADERS.member_height);
    Logger.log(`身長列番号: ${colHeight}`);
    Logger.log(`検索キーワード: ${JSON.stringify(MW_HEADERS.member_height)}`);
  } catch (e) {
    Logger.log(`メンバーシートエラー: ${e}`);
  }
  
  // 目標シートをチェック
  try {
    const sh = mw_getSheet_(MW_SHEETS.GOALS_2026);
    const header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    Logger.log(`\n【目標シート (2026_最新)】`);
    Logger.log(`ヘッダー行: ${JSON.stringify(header)}`);
    
    const colHeight = mw_findColByHeader_(header, MW_HEADERS.goals_height);
    Logger.log(`身長列番号: ${colHeight}`);
    Logger.log(`検索キーワード: ${JSON.stringify(MW_HEADERS.goals_height)}`);
  } catch (e) {
    Logger.log(`目標シートエラー: ${e}`);
  }
  
  // 実際のデータ取得
  Logger.log(`\n【実際のデータ取得結果】`);
  const memberInfo = mw_getMemberInfo_(memberId);
  Logger.log(`会員情報: ${JSON.stringify(memberInfo)}`);
  
  const goalInfo = mw_getGoalInfo_(memberId);
  Logger.log(`目標情報: ${JSON.stringify(goalInfo)}`);
  
  const ai2026 = mw_getAi2026_(memberId);
  Logger.log(`AI2026情報の身長: ${ai2026.height}`);
  
  Logger.log("========================================");
  
  return {
    memberInfo,
    goalInfo,
    ai2026Height: ai2026.height
  };
}

/** ===== API: ログイン（会員ID + メールアドレス、またはメールアドレスのみ） ===== */
function mw_api_login(memberId, email) {
  try {
    memberId = String(memberId || '').trim();
    email = String(email || '').trim().toLowerCase();
    
    if (!email) {
      return { ok: false, message: "メールアドレスを入力してください" };
    }
    
    // メールアドレスだけの場合：会員IDを自動検索
    if (!memberId) {
      memberId = mw_getMemberIdByEmail_(email);
      if (!memberId) {
        return { 
          ok: false, 
          message: "このメールアドレスは登録されていません。\n\nメールアドレスをご確認いただくか、会員IDも入力してください。" 
        };
      }
    } else {
      // 会員ID + メールアドレス両方ある場合：照合
      const isValid = mw_validateMember_(memberId, email);
      if (!isValid) {
        return { 
          ok: false, 
          message: "会員IDとメールアドレスが一致しません。\n\n入力内容をご確認ください。" 
        };
      }
    }
    
    // ログイン成功 - サマリー取得
    const memberInfo = mw_getMemberInfo_(memberId);
    const session = mw_getLatestSession_(memberId);
    const history = mw_getSessionHistory_(memberId, 30);
    const posture = mw_getPostureAi_(memberId);
    const ai2026 = mw_getAi2026_(memberId);
    const weightLog = mw_getWeightLog_(memberId, 90);
    
    // 理想値計算とプラン生成（新規追加）
    const idealMetrics = mw_calculateIdealMetrics_(memberInfo, ai2026);
    const progressPlan = mw_generateProgressPlan_(memberInfo, ai2026, idealMetrics);
    
    return {
      ok: true,
      memberId,
      email,
      memberInfo,
      latest: session,
      history,
      posture,
      ai2026,
      weightLog,
      idealMetrics,      // 追加
      progressPlan,      // 追加
    };
    
  } catch (e) {
    return { 
      ok: false, 
      message: `エラーが発生しました: ${e.toString()}` 
    };
  }
}

/** ===== 会員ID + メールアドレスの検証 ===== */
function mw_validateMember_(memberId, email) {
  const sh = mw_getSheet_(MW_SHEETS.MEMBERS);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return false;

  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colId = mw_findColByHeader_(header, MW_HEADERS.member_id) || 1;
  const colEmail = mw_findColByHeader_(header, MW_HEADERS.member_email);
  
  if (!colEmail) return false;

  const normalizedEmail = email.toLowerCase().trim();

  for (let r of values) {
    const id = String(r[colId - 1] ?? "").trim();
    const e = String(r[colEmail - 1] ?? "").toLowerCase().trim();
    
    if (id === memberId && e === normalizedEmail) {
      return true;
    }
  }
  
  return false;
}

/** ===== 体重記録保存（会員入力） ===== */
function mw_api_saveWeight(weight) {
  try {
    // 注：ログイン後は memberId を保持する必要があるため、
    // 実際の実装ではセッション管理が必要
    // ここでは簡易実装として、エラーを返す
    return { ok: false, message: "体重記録機能は現在準備中です" };
    
  } catch (e) {
    return { ok: false, message: `エラー: ${e.toString()}` };
  }
}

/** ===== 体重記録取得 ===== */
function mw_getWeightLog_(memberId, days) {
  try {
    const sessionWeights = mw_getWeightFromSessions_(memberId, days);
    const combined = sessionWeights.sort((a, b) => new Date(b.date) - new Date(a.date));
    return combined;
  } catch (e) {
    Logger.log(`体重記録取得エラー: ${e}`);
    return [];
  }
}

function mw_getWeightFromSessions_(memberId, days) {
  try {
    const sh = mw_getSheet_(MW_SHEETS.SESSIONS);
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    if (lastRow < 2) return [];

    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

    const colTs = mw_findColByHeader_(header, MW_HEADERS.session_ts) || 1;
    const colMember = mw_findColByHeader_(header, MW_HEADERS.session_member_id) || 3;
    const colWeight = mw_findColByHeader_(header, ["体重", "体重kg", "体重（kg）", "今日の体重"]);

    if (!colWeight) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const weights = [];
    values.forEach(r => {
      const id = String(r[colMember - 1] ?? "").trim();
      if (id !== memberId) return;

      const ts = mw_toDate_(r[colTs - 1]);
      if (!ts || ts < cutoffDate) return;

      const w = parseFloat(r[colWeight - 1]);
      if (isNaN(w) || w <= 0) return;

      weights.push({
        date: mw_formatDate_(ts),
        weight: w,
        source: "トレーナー記録"
      });
    });

    return weights;
  } catch (e) {
    Logger.log(`体重取得エラー: ${e}`);
    return [];
  }
}

/** ===== 会員情報取得（身長追加） ===== */
function mw_getMemberInfo_(memberId) {
  const sh = mw_getSheet_(MW_SHEETS.MEMBERS);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return null;

  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colId = mw_findColByHeader_(header, MW_HEADERS.member_id) || 1;
  const colName = mw_findColByHeader_(header, MW_HEADERS.member_name) || 2;
  const colHeight = mw_findColByHeader_(header, MW_HEADERS.member_height);

  Logger.log(`[DEBUG] メンバーシートのヘッダー: ${header}`);
  Logger.log(`[DEBUG] 身長列番号: ${colHeight}`);

  for (let r of values) {
    const id = String(r[colId - 1] ?? "").trim();
    if (id === memberId) {
      const heightRaw = colHeight ? r[colHeight - 1] : null;
      const heightValue = parseFloat(heightRaw);
      
      Logger.log(`[DEBUG] 会員ID: ${id}, 身長生データ: ${heightRaw}, 変換後: ${heightValue}`);
      
      return {
        id,
        name: String(r[colName - 1] ?? "").trim(),
        height: (!isNaN(heightValue) && heightValue > 0) ? heightValue : null
      };
    }
  }
  return null;
}

/** ===== メールアドレスから会員ID取得 ===== */
function mw_getMemberIdByEmail_(email) {
  const sh = mw_getSheet_(MW_SHEETS.MEMBERS);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return null;

  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colId = mw_findColByHeader_(header, MW_HEADERS.member_id) || 1;
  const colEmail = mw_findColByHeader_(header, MW_HEADERS.member_email);
  
  if (!colEmail) {
    Logger.log("警告: メールアドレス列が見つかりません");
    return null;
  }

  const normalizedEmail = email.toLowerCase().trim();

  for (let r of values) {
    const e = String(r[colEmail - 1] ?? "").toLowerCase().trim();
    if (e === normalizedEmail) {
      return String(r[colId - 1] ?? "").trim();
    }
  }
  return null;
}

/** ===== 最新セッション ===== */
function mw_getLatestSession_(memberId) {
  const sh = mw_getSheet_(MW_SHEETS.SESSIONS);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return null;

  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colTs = mw_findColByHeader_(header, MW_HEADERS.session_ts) || MW_FALLBACK.SESSION_TIMESTAMP_COL;
  const colMember = mw_findColByHeader_(header, MW_HEADERS.session_member_id) || MW_FALLBACK.SESSION_MEMBER_ID_COL;
  const colTrainer = mw_findColByHeader_(header, MW_HEADERS.session_trainer) || MW_FALLBACK.SESSION_TRAINER_COL;
  const colPart = mw_findColByHeader_(header, MW_HEADERS.session_body_part) || MW_FALLBACK.SESSION_BODY_PART_COL;

  const menuPairs = mw_buildMenuPairs_(header);

  let latest = null;
  let latestTs = null;

  values.forEach(r => {
    const id = String(r[colMember - 1] ?? "").trim();
    if (id !== memberId) return;

    const ts = mw_toDate_(r[colTs - 1]);
    if (!ts) return;

    if (!latestTs || ts.getTime() > latestTs.getTime()) {
      latestTs = ts;
      latest = mw_buildSessionObject_(r, { colTs, colTrainer, colPart, menuPairs });
    }
  });

  return latest;
}

/** ===== 履歴一覧 ===== */
function mw_getSessionHistory_(memberId, limit) {
  const sh = mw_getSheet_(MW_SHEETS.SESSIONS);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return [];

  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colTs = mw_findColByHeader_(header, MW_HEADERS.session_ts) || MW_FALLBACK.SESSION_TIMESTAMP_COL;
  const colMember = mw_findColByHeader_(header, MW_HEADERS.session_member_id) || MW_FALLBACK.SESSION_MEMBER_ID_COL;
  const colTrainer = mw_findColByHeader_(header, MW_HEADERS.session_trainer) || MW_FALLBACK.SESSION_TRAINER_COL;
  const colPart = mw_findColByHeader_(header, MW_HEADERS.session_body_part) || MW_FALLBACK.SESSION_BODY_PART_COL;

  const menuPairs = mw_buildMenuPairs_(header);

  const list = values
    .map(r => {
      const id = String(r[colMember - 1] ?? "").trim();
      if (id !== memberId) return null;
      const ts = mw_toDate_(r[colTs - 1]);
      if (!ts) return null;
      const obj = mw_buildSessionObject_(r, { colTs, colTrainer, colPart, menuPairs });
      obj._ts = ts.getTime();
      return obj;
    })
    .filter(Boolean)
    .sort((a, b) => b._ts - a._ts)
    .slice(0, limit)
    .map(({ _ts, ...rest }) => rest);

  return list;
}

/** ===== 姿勢AI ===== */
function mw_getPostureAi_(memberId) {
  const sh = mw_getSheet_(MW_SHEETS.POSTURE);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return "";

  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colMember = mw_findColByHeader_(header, MW_HEADERS.posture_member_id);
  const colAi = mw_findColByHeader_(header, MW_HEADERS.posture_ai);

  if (!colMember || !colAi) return "";

  let text = "";
  values.forEach(r => {
    const id = String(r[colMember - 1] ?? "").trim();
    if (id !== memberId) return;
    const t = String(r[colAi - 1] ?? "").trim();
    if (t) text = t;
  });
  return text;
}

/** ===== 2026年目標AI（身長・目標日追加） ===== */
function mw_getAi2026_(memberId) {
  try {
    const sh = mw_getSheet_(MW_SHEETS.AI_2026);
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return { 
      text: "", 
      photo: "", 
      status: "未分析", 
      height: "", 
      goalDate: "",
      currentWeight: null,
      currentBodyFat: null,
      currentLeanMass: null,
      targetWeight: null,
      targetBodyFat: null,
      targetLeanMass: null
    };

    const values = sh.getRange(2, 1, lastRow - 1, 6).getValues();

    let aiText = "";
    let status = "未分析";
    let analyzedAt = "";
    
    values.forEach(r => {
      const id = String(r[MW_AI_2026_COLS.MEMBER_ID_COL - 1] ?? "").trim();
      if (id !== memberId) return;
      
      const done = String(r[MW_AI_2026_COLS.DONE_COL - 1] ?? "").trim();
      if (done === "済") {
        aiText = String(r[MW_AI_2026_COLS.AI_TEXT_COL - 1] ?? "").trim();
        status = String(r[MW_AI_2026_COLS.STATUS_COL - 1] ?? "").trim();
        const at = r[MW_AI_2026_COLS.ANALYZED_AT_COL - 1];
        analyzedAt = mw_formatDate_(mw_toDate_(at));
      }
    });

    const photoUrl = mw_getTargetPhotoUrl_(memberId);
    const goalInfo = mw_getGoalInfo_(memberId);
    const currentMetrics = mw_extractCurrentMetrics_(aiText);
    const targetMetrics = mw_extractTargetMetrics_(aiText);

    return {
      text: aiText,
      photo: photoUrl,
      status: status,
      analyzedAt: analyzedAt,
      height: goalInfo.height ? goalInfo.height.toString() : "",
      goalDate: goalInfo.goalDate || "",
      currentWeight: currentMetrics.weight,
      currentBodyFat: currentMetrics.bodyFat,
      currentLeanMass: currentMetrics.leanMass,
      targetWeight: targetMetrics.weight,
      targetBodyFat: targetMetrics.bodyFat,
      targetLeanMass: targetMetrics.leanMass,
      trainingContent: goalInfo.trainingContent || "",
      bodyMake1: goalInfo.bodyMake1 || "",
      bodyMake2: goalInfo.bodyMake2 || "",
      bodyMake3: goalInfo.bodyMake3 || "",
      bodyMakeHeight: goalInfo.bodyMakeHeight || "",
      bodyMakeWeight: goalInfo.bodyMakeWeight || "",
      bodyMakeBodyFat: goalInfo.bodyMakeBodyFat || "",
      numericGoal: goalInfo.numericGoal || ""
    };

  } catch (e) {
    Logger.log(`AI2026取得エラー: ${e}`);
    return { 
      text: "", 
      photo: "", 
      status: "エラー", 
      height: "", 
      goalDate: "",
      currentWeight: null,
      currentBodyFat: null,
      currentLeanMass: null,
      targetWeight: null,
      targetBodyFat: null,
      targetLeanMass: null
    };
  }
}

/** ===== 目標情報取得（2026目標ヒアリング_回答シートから最新回答を取得） ===== */
function mw_getGoalInfo_(memberId) {
  try {
    Logger.log(`=== mw_getGoalInfo_ 開始: ${memberId} ===`);
    
    const sh = mw_getSheet_(MW_SHEETS.GOALS_HEARING);
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    
    if (lastRow < 2) {
      Logger.log('シートにデータがありません');
      return {
        trainingContent: "",
        bodyMake1: "",
        bodyMake2: "",
        bodyMake3: "",
        height: null,
        weight: null,
        bodyFat: null,
        numericGoal: "",
        goalDate: "",
        targetPhoto: "",
        bodyMakeHeight: "",
        bodyMakeWeight: "",
        bodyMakeBodyFat: ""
      };
    }

    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

    // 列の検索（柔軟な列名マッチング）
    const colMemberId = mw_findColByHeader_(header, ['member_id', '会員ID', 'ID']);
    const colTrainingContent = mw_findColByHeader_(header, ['2026年トレーニング内容', 'トレーニング内容']);
    const colBodyMake1 = mw_findColByHeader_(header, ['【1番】ボディメイク', '1番ボディメイク']);
    const colBodyMake2 = mw_findColByHeader_(header, ['【2番】ボディメイク', '2番ボディメイク']);
    const colBodyMake3 = mw_findColByHeader_(header, ['【3番】ボディメイク', '3番ボディメイク']);
    const colHeight = mw_findColByHeader_(header, ['ボディメイク身長', '身長']);
    const colWeight = mw_findColByHeader_(header, ['体重', 'ボディメイク体重']);
    const colBodyFat = mw_findColByHeader_(header, ['体脂肪率', 'ボディメイク体脂肪率']);
    const colNumericGoal = mw_findColByHeader_(header, ['数値目標']);
    const colGoalDate = mw_findColByHeader_(header, ['目標達成日', '目標日']);
    const colTargetPhoto = mw_findColByHeader_(header, ['理想の体型写真', '目標写真']);

    if (!colMemberId) {
      Logger.log('❌ member_id列が見つかりません');
      return {
        trainingContent: "",
        bodyMake1: "",
        bodyMake2: "",
        bodyMake3: "",
        height: null,
        weight: null,
        bodyFat: null,
        numericGoal: "",
        goalDate: "",
        targetPhoto: "",
        bodyMakeHeight: "",
        bodyMakeWeight: "",
        bodyMakeBodyFat: ""
      };
    }

    // 最新の回答を取得（タイムスタンプの降順で最新）
    let latestRow = null;
    let latestTimestamp = null;

    values.forEach((r, index) => {
      const id = String(r[colMemberId - 1] ?? "").trim();
      
      if (id === memberId) {
        const timestamp = r[0]; // A列: タイムスタンプ
        const ts = timestamp instanceof Date ? timestamp : new Date(timestamp);
        
        if (!isNaN(ts.getTime())) {
          if (!latestTimestamp || ts > latestTimestamp) {
            latestTimestamp = ts;
            latestRow = r;
          }
        } else if (!latestRow) {
          // タイムスタンプが無効でも、最初に見つかった行を保持
          latestRow = r;
        }
      }
    });

    if (!latestRow) {
      Logger.log('該当する会員IDのデータが見つかりません');
      return {
        trainingContent: "",
        bodyMake1: "",
        bodyMake2: "",
        bodyMake3: "",
        height: null,
        weight: null,
        bodyFat: null,
        numericGoal: "",
        goalDate: "",
        targetPhoto: "",
        bodyMakeHeight: "",
        bodyMakeWeight: "",
        bodyMakeBodyFat: ""
      };
    }

    // データを整形して返す
    const heightVal = colHeight ? parseFloat(latestRow[colHeight - 1]) : null;
    const weightVal = colWeight ? parseFloat(latestRow[colWeight - 1]) : null;
    const bodyFatVal = colBodyFat ? parseFloat(latestRow[colBodyFat - 1]) : null;

    const result = {
      trainingContent: colTrainingContent ? String(latestRow[colTrainingContent - 1] ?? "").trim() : "",
      bodyMake1: colBodyMake1 ? String(latestRow[colBodyMake1 - 1] ?? "").trim() : "",
      bodyMake2: colBodyMake2 ? String(latestRow[colBodyMake2 - 1] ?? "").trim() : "",
      bodyMake3: colBodyMake3 ? String(latestRow[colBodyMake3 - 1] ?? "").trim() : "",
      height: (!isNaN(heightVal) && heightVal > 0) ? heightVal : null,
      weight: (!isNaN(weightVal) && weightVal > 0) ? weightVal : null,
      bodyFat: (!isNaN(bodyFatVal) && bodyFatVal > 0) ? bodyFatVal : null,
      numericGoal: colNumericGoal ? String(latestRow[colNumericGoal - 1] ?? "").trim() : "",
      goalDate: colGoalDate ? mw_formatDate_(mw_toDate_(latestRow[colGoalDate - 1])) : "",
      targetPhoto: colTargetPhoto ? String(latestRow[colTargetPhoto - 1] ?? "").trim() : "",
      bodyMakeHeight: heightVal ? heightVal.toString() : "",
      bodyMakeWeight: weightVal ? weightVal.toString() : "",
      bodyMakeBodyFat: bodyFatVal ? bodyFatVal.toString() : ""
    };

    Logger.log(`✅ 取得成功: ${JSON.stringify(result)}`);
    return result;

  } catch (e) {
    Logger.log(`❌ 目標情報取得エラー: ${e.message}`);
    Logger.log(`スタック: ${e.stack}`);
    return {
      trainingContent: "",
      bodyMake1: "",
      bodyMake2: "",
      bodyMake3: "",
      height: null,
      weight: null,
      bodyFat: null,
      numericGoal: "",
      goalDate: "",
      targetPhoto: "",
      bodyMakeHeight: "",
      bodyMakeWeight: "",
      bodyMakeBodyFat: ""
    };
  }
}

/** ===== 目標写真URL取得 ===== */
function mw_getTargetPhotoUrl_(memberId) {
  try {
    const goalInfo = mw_getGoalInfo_(memberId);
    return goalInfo?.targetPhoto || "";
  } catch (e) {
    Logger.log(`目標写真取得エラー: ${e}`);
    return "";
  }
}

/** ===== AIテキストから現在値を抽出 ===== */
function mw_extractCurrentMetrics_(aiText) {
  const metrics = {
    weight: null,
    bodyFat: null,
    leanMass: null
  };
  
  if (!aiText) return metrics;
  
  // 体重抽出（複数パターン対応）
  let weightMatch = aiText.match(/体重[：:\s]*(\d+\.?\d*)\s*kg/i);
  if (!weightMatch) weightMatch = aiText.match(/(\d+\.?\d*)\s*kg\s*[\/／]/);
  if (weightMatch) metrics.weight = parseFloat(weightMatch[1]);
  
  // 体脂肪率抽出（複数パターン対応）
  let bodyFatMatch = aiText.match(/体脂肪[率]*[：:\s]*(\d+\.?\d*)\s*%/i);
  if (!bodyFatMatch) bodyFatMatch = aiText.match(/[\/／]\s*体脂肪[率]*[：:\s]*(\d+\.?\d*)\s*%/i);
  if (bodyFatMatch) metrics.bodyFat = parseFloat(bodyFatMatch[1]);
  
  // 除脂肪体重抽出（複数パターン対応）
  let leanMassMatch = aiText.match(/除脂肪[体重]*[：:\s]*(\d+\.?\d*)\s*kg/i);
  if (!leanMassMatch) leanMassMatch = aiText.match(/[\/／]\s*除脂肪[体重]*[：:\s]*(\d+\.?\d*)\s*kg/i);
  if (leanMassMatch) metrics.leanMass = parseFloat(leanMassMatch[1]);
  
  return metrics;
}

/** ===== AIテキストから目標値を抽出 ===== */
function mw_extractTargetMetrics_(aiText) {
  const metrics = {
    weight: null,
    bodyFat: null,
    leanMass: null
  };
  
  if (!aiText) return metrics;
  
  // 目標体重抽出（複数パターン対応）
  let weightMatch = aiText.match(/目標体重[：:\s]*(\d+\.?\d*)\s*kg/i);
  if (!weightMatch) weightMatch = aiText.match(/最終目標[^\d]*(\d+\.?\d*)\s*kg/i);
  if (weightMatch) metrics.weight = parseFloat(weightMatch[1]);
  
  // 目標体脂肪率抽出（複数パターン対応）
  let bodyFatMatch = aiText.match(/目標体脂肪[率]*[：:\s]*(\d+\.?\d*)\s*%/i);
  if (!bodyFatMatch) bodyFatMatch = aiText.match(/体脂肪[率]*[：:\s]*(\d+\.?\d*)\s*%[^現在]/i);
  if (bodyFatMatch) metrics.bodyFat = parseFloat(bodyFatMatch[1]);
  
  // 目標除脂肪体重抽出（複数パターン対応）
  let leanMassMatch = aiText.match(/目標除脂肪[体重]*[：:\s]*(\d+\.?\d*)\s*kg/i);
  if (!leanMassMatch) leanMassMatch = aiText.match(/除脂肪[体重]*[：:\s]*(\d+\.?\d*)\s*kg[^現在]/i);
  if (leanMassMatch) metrics.leanMass = parseFloat(leanMassMatch[1]);
  
  return metrics;
}

/** ===== 【新機能】理想値計算 ===== */
function mw_calculateIdealMetrics_(memberInfo, ai2026) {
  const result = {
    hasHeight: false,
    height: null,
    idealWeight: null,
    idealBodyFat: null,
    idealLeanMass: null,
    bmi: null,
    calculations: {}
  };
  
  // 身長取得（会員情報 > 目標シート）
  let height = memberInfo?.height || null;
  if (!height && ai2026?.height) {
    height = parseFloat(ai2026.height);
  }
  
  if (!height || height <= 0) {
    return result;
  }
  
  result.hasHeight = true;
  result.height = height;
  
  // 標準体重計算（BMI 22）
  const heightM = height / 100;
  result.idealWeight = Math.round(22 * heightM * heightM * 10) / 10;
  
  // BMI計算（現在の体重がある場合）
  if (ai2026?.currentWeight) {
    result.bmi = Math.round((ai2026.currentWeight / (heightM * heightM)) * 10) / 10;
  }
  
  // 理想体脂肪率（男性：10-15%、女性：18-25%）
  // ※性別情報がない場合は男性基準
  result.idealBodyFat = 12.5; // 中央値
  
  // 理想除脂肪体重
  result.idealLeanMass = Math.round(result.idealWeight * (1 - result.idealBodyFat / 100) * 10) / 10;
  
  // 追加計算情報
  result.calculations = {
    bmrRange: mw_calculateBMR_(height, result.idealWeight),
    maintenanceCalories: mw_calculateMaintenanceCalories_(height, result.idealWeight),
    proteinNeeds: mw_calculateProteinNeeds_(result.idealWeight)
  };
  
  return result;
}

/** ===== 基礎代謝計算 ===== */
function mw_calculateBMR_(height, weight) {
  // Harris-Benedict式（男性基準）
  const bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * 30); // 年齢30歳と仮定
  return {
    min: Math.round(bmr * 0.95),
    max: Math.round(bmr * 1.05)
  };
}

/** ===== 維持カロリー計算 ===== */
function mw_calculateMaintenanceCalories_(height, weight) {
  const bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * 30);
  // 活動レベル：中程度（週3-4回トレーニング）
  return Math.round(bmr * 1.55);
}

/** ===== タンパク質必要量計算 ===== */
function mw_calculateProteinNeeds_(weight) {
  return {
    min: Math.round(weight * 1.6 * 10) / 10,  // 体重×1.6g
    max: Math.round(weight * 2.2 * 10) / 10   // 体重×2.2g
  };
}

/** ===== 【新機能】進捗プラン生成 ===== */
function mw_generateProgressPlan_(memberInfo, ai2026, idealMetrics) {
  const plan = {
    hasPlan: false,
    currentStatus: {},
    goals: {},
    timeline: {},
    recommendations: []
  };
  
  // データ不足チェック
  if (!ai2026?.currentWeight || !ai2026?.targetWeight) {
    return plan;
  }
  
  plan.hasPlan = true;
  
  // 現在の状態
  plan.currentStatus = {
    weight: ai2026.currentWeight,
    bodyFat: ai2026.currentBodyFat,
    leanMass: ai2026.currentLeanMass,
    bmi: idealMetrics.bmi
  };
  
  // 目標
  plan.goals = {
    weight: ai2026.targetWeight,
    bodyFat: ai2026.targetBodyFat,
    leanMass: ai2026.targetLeanMass,
    deadline: ai2026.goalDate || "2026年12月"
  };
  
  // 進捗計算
  const weightDiff = ai2026.currentWeight - ai2026.targetWeight;
  const bodyFatDiff = ai2026.currentBodyFat - ai2026.targetBodyFat;
  
  // タイムライン計算
  const weeksToGoal = mw_calculateWeeksToDeadline_(ai2026.goalDate);
  const weeklyWeightLoss = weeksToGoal > 0 ? Math.round((weightDiff / weeksToGoal) * 10) / 10 : 0;
  
  plan.timeline = {
    weeksRemaining: weeksToGoal,
    monthsRemaining: Math.ceil(weeksToGoal / 4),
    weeklyWeightLoss: weeklyWeightLoss,
    weeklyBodyFatReduction: weeksToGoal > 0 ? Math.round((bodyFatDiff / weeksToGoal) * 10) / 10 : 0
  };
  
  // レコメンデーション生成
  plan.recommendations = mw_generateRecommendations_(weightDiff, bodyFatDiff, weeklyWeightLoss, ai2026);
  
  return plan;
}

/** ===== 目標日までの週数計算 ===== */
function mw_calculateWeeksToDeadline_(goalDateStr) {
  if (!goalDateStr) {
    // デフォルト：2026年12月末
    const defaultGoal = new Date(2026, 11, 31);
    const now = new Date();
    return Math.ceil((defaultGoal - now) / (7 * 24 * 60 * 60 * 1000));
  }
  
  const goalDate = mw_toDate_(goalDateStr);
  if (!goalDate) return 48; // デフォルト48週
  
  const now = new Date();
  const weeks = Math.ceil((goalDate - now) / (7 * 24 * 60 * 60 * 1000));
  return weeks > 0 ? weeks : 1;
}

/** ===== レコメンデーション生成 ===== */
function mw_generateRecommendations_(weightDiff, bodyFatDiff, weeklyWeightLoss, ai2026) {
  const recs = [];
  
  // 体重減少ペース
  if (weeklyWeightLoss > 1.0) {
    recs.push({
      category: "ペース調整",
      priority: "高",
      message: `週${weeklyWeightLoss}kgの減量は急激すぎます。週0.5〜1.0kgのペースに調整しましょう。`,
      action: "カロリー設定の見直し（現在より+200〜300kcal）"
    });
  } else if (weeklyWeightLoss < 0.3) {
    recs.push({
      category: "ペース調整",
      priority: "中",
      message: "減量ペースが緩やかです。目標達成のためにペースアップを検討しましょう。",
      action: "カロリー設定の見直し（現在より-200kcal程度）"
    });
  } else {
    recs.push({
      category: "ペース",
      priority: "良好",
      message: "理想的な減量ペースです。このまま継続しましょう。",
      action: "現在の食事・トレーニングを継続"
    });
  }
  
  // トレーニング頻度
  recs.push({
    category: "トレーニング",
    priority: "高",
    message: "筋肉量を維持しながら脂肪を減らすため、週3回以上の筋力トレーニングが必要です。",
    action: "上半身・下半身・全身の3分割ルーティンを継続"
  });
  
  // 栄養バランス
  if (ai2026.targetWeight) {
    const proteinNeeds = mw_calculateProteinNeeds_(ai2026.targetWeight);
    recs.push({
      category: "栄養",
      priority: "高",
      message: `タンパク質摂取を意識しましょう。目標：1日${proteinNeeds.min}〜${proteinNeeds.max}g`,
      action: "各食事でタンパク質源（肉・魚・卵・プロテイン）を確保"
    });
  }
  
  // 体脂肪率の変化
  if (bodyFatDiff > 5) {
    recs.push({
      category: "ボディメイク",
      priority: "高",
      message: "体脂肪率を大きく下げる必要があります。有酸素運動も取り入れましょう。",
      action: "週2〜3回、20〜30分の軽い有酸素運動（ウォーキング・自転車）"
    });
  }
  
  // 休息とリカバリー
  recs.push({
    category: "リカバリー",
    priority: "中",
    message: "筋肉の成長と脂肪燃焼には質の高い睡眠が不可欠です。",
    action: "毎日7〜8時間の睡眠を確保"
  });
  
  return recs;
}

/** ===== ユーティリティ ===== */
function mw_buildSessionObject_(r, opt) {
  const ts = mw_formatDate_(mw_toDate_(r[opt.colTs - 1]));
  const trainer = String(r[opt.colTrainer - 1] ?? "").trim();
  const part = String(r[opt.colPart - 1] ?? "").trim();

  const menus = [];
  opt.menuPairs.forEach(p => {
    const m = String(r[p.menu - 1] ?? "").trim();
    const s = String(r[p.set - 1] ?? "").trim();
    if (m || s) menus.push({ menu: m, set: s });
  });

  return { ts, trainer, part, menus };
}

function mw_buildMenuPairs_(header) {
  const m1 = mw_findColByHeader_(header, MW_HEADERS.menu1);
  const s1 = mw_findColByHeader_(header, MW_HEADERS.set1);
  const m2 = mw_findColByHeader_(header, MW_HEADERS.menu2);
  const s2 = mw_findColByHeader_(header, MW_HEADERS.set2);

  const pairs = [];
  if (m1 && s1) pairs.push({ menu: m1, set: s1 });
  if (m2 && s2) pairs.push({ menu: m2, set: s2 });

  if (pairs.length === 0) return MW_FALLBACK.MENU_PAIRS;

  MW_FALLBACK.MENU_PAIRS.forEach(p => {
    if (!pairs.some(x => x.menu === p.menu && x.set === p.set)) pairs.push(p);
  });
  return pairs;
}

function mw_getSheet_(name) {
  const ss = MW_SPREADSHEET_ID
    ? SpreadsheetApp.openById(MW_SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error(`シート「${name}」が見つかりません`);
  return sh;
}

function mw_findColByHeader_(headerRow, candidates) {
  const normalized = headerRow.map(v => String(v ?? "").trim());
  for (let i = 0; i < normalized.length; i++) {
    const h = normalized[i];
    if (!h) continue;
    if (candidates.some(c => c === h)) return i + 1;
  }
  for (let i = 0; i < normalized.length; i++) {
    const h = normalized[i];
    if (!h) continue;
    if (candidates.some(c => h.includes(c))) return i + 1;
  }
  return null;
}

function mw_toDate_(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function mw_formatDate_(d) {
  if (!d) return "";
  return Utilities.formatDate(d, "Asia/Tokyo", "yyyy/MM/dd HH:mm");
}

/** ===== テスト関数: 目標情報取得（会員用） ===== */
function testGoalInfo_Member() {
  const memberId = "SAK001"; // ← 実際の会員IDに変更してください
  Logger.log(`=== 目標情報テスト開始（会員用）: ${memberId} ===`);
  
  const result = mw_getGoalInfo_(memberId);
  
  Logger.log('=== 取得結果 ===');
  Logger.log(JSON.stringify(result, null, 2));
  
  Logger.log('=== テスト完了 ===');
  return result;
}

function testGoalInfo_MW() {
  // テスト対象の会員ID（変更可能）
  const memberId = "SAK001";
  const r = mw_getGoalInfo_(memberId);
  Logger.log(JSON.stringify(r, null, 2));
}

/** ===== テスト関数: 目標写真URL取得 ===== */
function testTargetPhotoUrl_MW() {
  // テスト対象の会員ID（変更可能）
  const memberId = "SAK001";
  const url = mw_getTargetPhotoUrl_(memberId);
  Logger.log(`目標写真URL: ${url}`);
}

/** ===== テスト関数: 2026年目標全体（GoalInfo + AI2026） ===== */
function test2026Goals_MW() {
  // テスト対象の会員ID（変更可能）
  const memberId = "SAK001";
  
  Logger.log(`=== 2026年目標テスト開始: ${memberId} ===`);
  
  const goalInfo = mw_getGoalInfo_(memberId);
  Logger.log('【GoalInfo】');
  Logger.log(JSON.stringify(goalInfo, null, 2));
  
  const ai2026 = mw_getAi2026_(memberId);
  Logger.log('【AI2026】');
  Logger.log(JSON.stringify(ai2026, null, 2));
  
  const targetPhotoUrl = mw_getTargetPhotoUrl_(memberId);
  Logger.log(`【目標写真URL】: ${targetPhotoUrl}`);
  
  Logger.log('=== テスト完了 ===');
}