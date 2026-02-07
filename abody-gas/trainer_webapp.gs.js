/**
 * Abody Trainer Web Summary - 完全修正版
 * 目標写真アップロード機能 + メールに画像リンク追加
 */

const TW_SPREADSHEET_ID = "1CJ1PrsAwW_yohmw0NB7viOUaeKIP6qQFmRQhHstjtiE";

const TW_SHEETS = {
  MEMBERS: "メンバーシート",
  SESSIONS: "フォームの回答 1",
  POSTURE: "姿勢評価",
  POSTURE_MANUAL: "姿勢評価_手入力",
  AI_2026: "2026_AI",
  GOALS_2026: "2026_最新",
  GOALS_HEARING: "2026目標ヒアリング_回答",
  BODY_IMAGES: "体の画像記録",
};

const TW_FALLBACK = {
  SESSION_TIMESTAMP_COL: 1,
  SESSION_MEMBER_ID_COL: 3,
  SESSION_TRAINER_COL: 5,
  SESSION_BODY_PART_COL: 9,
  MENU_PAIRS: [
    { menu: 12, set: 13 },
    { menu: 14, set: 15 },
    { menu: 16, set: 17 },
    { menu: 18, set: 19 },
    { menu: 20, set: 21 },
  ],
};

const TW_POSTURE_FALLBACK = {
  MEMBER_ID_COL: 4,
  AI_TEXT_COL: 34,
};

const TW_AI_2026_COLS = {
  KEY_COL: 1,
  MEMBER_ID_COL: 2,
  AI_TEXT_COL: 3,
  DONE_COL: 4,
  ANALYZED_AT_COL: 5,
  STATUS_COL: 6,
};

const TW_HEADERS = {
  member_id: ["member_id", "会員ID", "会員コード", "ID"],
  member_name: ["氏名", "会員名", "名前", "会員様名"],
  member_height: ["ボディメ身長", "身長", "身長cm", "身長（cm）", "height", "Height"],

  session_ts: ["タイムスタンプ", "timestamp", "日時", "日付", "送信日時"],
  session_member_id: ["member_id", "会員ID", "会員コード", "ID", "会員様"],
  session_trainer: ["担当", "担当トレーナー", "トレーナー"],
  session_body_part: ["部位", "部位（どこ）", "トレ部位", "部位選択", "トレーニング内容"],
  menu1: ["トレーニングメニュー①", "メニュー①", "メニュー1", "種目①", "種目1"],
  set1: ["回数×セット数①", "回数×セット①", "回数×セット1", "回数セット①", "回数セット1"],
  menu2: ["トレーニングメニュー②", "メニュー②", "メニュー2", "種目②", "種目2"],
  set2: ["回数×セット数②", "回数×セット②", "回数×セット2", "回数セット②", "回数セット2"],

  posture_member_id: ["member_id", "会員ID", "会員コード", "ID"],
  posture_ai: ["AI", "AIサマリー", "姿勢AI", "Gemini", "姿勢評価アプローチ（Gemini）"],

  goals_member_id: ["member_id", "会員ID", "会員コード", "ID"],
  goals_target_photo: ["理想の体型写真", "目標の体型写真", "目標写真", "target_photo"],
  goals_height: ["ボディメ身長", "身長", "身長cm", "身長（cm）"],
  goals_goal_date: ["目標達成日", "目標日", "達成予定日"],
};

// 体の画像記録システム用定数
const DRIVE_FOLDER_NAME = "Abody会員写真";
const DAYS_WITHOUT_PHOTO_ALERT = 30;

function doGet(e) {
  const page = e.parameter.page;
  
  if (page === 'rating') {
    // 評価ページの初期データを取得（既に評価済みかチェック）
    const sessionId = e.parameter.id;
    const memberId = e.parameter.member;
    let isAlreadyRated = false;
    
    if (sessionId) {
      try {
        Logger.log(`評価ページ表示: セッションID=${sessionId}, 会員ID=${memberId}`);
        const result = fb_api_checkRatingStatus(sessionId);
        isAlreadyRated = result.isRated || false;
        Logger.log(`評価ステータス: isAlreadyRated=${isAlreadyRated}`);
      } catch (e) {
        Logger.log('評価ステータスチェックエラー: ' + e.message);
        Logger.log('エラースタック: ' + e.stack);
        isAlreadyRated = false; // エラー時は評価可能にする
      }
    }
    
    const template = HtmlService.createTemplateFromFile('feedback_rating');
    template.isAlreadyRated = isAlreadyRated;
    template.sessionId = sessionId || '';
    template.memberId = memberId || '';
    
    return template.evaluate()
      .setTitle('トレーニング評価')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("Abodyカルテ（トレーナー用）")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** ===== スプレッドシート用カスタムメニュー ===== */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📧 メール送信')
    .addItem('送信待ちメールを処理', 'processPendingEmails')
    .addItem('🔧 自動送信トリガーを設定（1分ごと）', 'tw_setupEmailProcessingTrigger')
    .addItem('🚀 いますぐ送信待ちを処理（即時）', 'tw_kickEmailProcessingOnce_')
    .addItem('テスト：行2を処理', 'testProcessRow2')
    .addToUi();
  
  ui.createMenu('📊 会員管理')
    .addItem('1月・2月入会者リスト', 'tw_listJanFebEnrollments')
    .addSeparator()
    .addItem('🔑 PINを一括生成（空のPINに自動生成）', 'tw_generatePinsForMembers')
    .addToUi();
}

/**
 * ===== 自動送信トリガーを設定（1分ごと） =====
 * Webアプリ経由の送信では onFormSubmit が発火しないため、時間主導トリガーが必須。
 */
function tw_setupEmailProcessingTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  // 重複防止：processPendingEmails の時間主導トリガーを削除
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'processPendingEmails' && t.getEventType() === ScriptApp.EventType.CLOCK) {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('processPendingEmails')
    .timeBased()
    .everyMinutes(1)
    .create();

  Logger.log('✅ 1分ごとの processPendingEmails トリガーを設定しました');
}

/**
 * ===== 送信直後の即時キック（1回だけ） =====
 * 1分トリガーを待たず、送信直後に処理を走らせる（最短でも約1分後）。
 */
function tw_kickEmailProcessingOnce_() {
  try {
    // after() のトリガーは最低1分程度の遅延になるが、常駐トリガーより早く拾えることが多い
    ScriptApp.newTrigger('processPendingEmails')
      .timeBased()
      .after(60 * 1000)
      .create();
    Logger.log('🚀 processPendingEmails を1回キックするトリガーを追加しました（約1分後に実行）');
  } catch (e) {
    Logger.log('tw_kickEmailProcessingOnce_ エラー: ' + e.message);
  }
}

/** ===== API: トレーニングデータ送信（完全修正版） ===== */
function tw_api_submitTraining(formData) {
  try {
    if (!formData) {
      return { success: false, message: 'formDataが空です' };
    }
    
    const sh = tw_getSheet_(TW_SHEETS.SESSIONS);
    
    // メニューデータを事前にフォーマット（高速化）
    const formattedMenus = [];
    if (formData.menus && Array.isArray(formData.menus) && formData.menus.length > 0) {
      Logger.log(`=== メニューデータ受信 ===`);
      Logger.log(`メニュー数: ${formData.menus.length}`);
      formData.menus.forEach((menu, idx) => {
        if (!menu || !menu.sets) {
          Logger.log(`メニュー${idx + 1}: スキップ（menu=${!!menu}, sets=${!!menu?.sets}）`);
          return;
        }
        Logger.log(`メニュー${idx + 1}: name=${menu.name}, sets数=${menu.sets.length}`);
        Logger.log(`sets内容: ${JSON.stringify(menu.sets)}`);
        
        // setsが配列で、各要素にweightとrepsがあることを確認
        if (Array.isArray(menu.sets) && menu.sets.length > 0) {
          const setStrings = menu.sets.map(s => {
            const weight = s.weight || '';
            const reps = s.reps || '';
            if (!weight || !reps) {
              Logger.log(`警告: セットデータが不完全 weight=${weight}, reps=${reps}`);
              return '';
            }
            return `${weight}×${reps}`;
          }).filter(s => s !== '').join(', ');
          
          Logger.log(`フォーマット後: ${setStrings}`);
          
        formattedMenus.push({
          name: menu.name,
          sets: setStrings
        });
        } else {
          Logger.log(`警告: メニュー${idx + 1}のsetsが配列でないか空です`);
        }
      });
      Logger.log(`=== フォーマット済みメニュー数: ${formattedMenus.length} ===`);
    } else {
      Logger.log(`警告: formData.menusが空または配列でありません`);
      Logger.log(`formData.menus: ${JSON.stringify(formData.menus)}`);
    }
    
    // 実際の列数を取得（タイムアウトを避けるため）
    const lastCol = sh.getLastColumn();
    if (lastCol === 0) {
      return { success: false, message: 'シートの列数が0です。ヘッダーを確認してください。' };
    }
    
    // ヘッダーを1回だけ取得（実際の列数分のみ）
    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    
    // 列の位置を高速検索（正規表現を避ける）
    const findCol = (patterns) => {
      for (let i = 0; i < lastCol; i++) {
        const colName = String(header[i] || '').trim().toLowerCase();
        for (const pattern of patterns) {
          if (colName.includes(pattern.toLowerCase())) {
            return i;
          }
        }
      }
      return -1;
    };
    
    // 列の位置を一度だけ検索（重複呼び出しを避ける）
    const colTs = findCol(['タイムスタンプ']);
    const colDate = findCol(['実施日']);
    const colMember = findCol(['会員様', '会員']);
    const colStore = findCol(['実施店舗', '店舗']);
    const colTrainer = findCol(['担当トレーナー', 'トレーナー']);
    const colWeight = findCol(['体重']);
    const colBodyFat = findCol(['体脂肪']);
    const colConcept = findCol(['トレーニングコンセプト', 'コンセプト']);
    const colBodyParts = findCol(['トレーニング内容']);
    const colStretch = findCol(['ストレッチ']);
    const colStretchContent = findCol(['ストレッチ内容']);
    const colMenu1 = findCol(['トレーニングメニュー①', 'トレーニングメニュー1', 'メニュー①', 'メニュー1', '種目①', '種目1']);
    const colSet1 = findCol(['回数×セット①', '回数×セット1', '回数セット①', '回数セット1', 'セット①', 'セット1', '回数×セット数①']);
    const colMenu2 = findCol(['トレーニングメニュー②', 'トレーニングメニュー2', 'メニュー②', 'メニュー2', '種目②', '種目2']);
    const colSet2 = findCol(['回数×セット②', '回数×セット2', '回数セット②', '回数セット2', 'セット②', 'セット2', '回数×セット数②']);
    const colMenu3 = findCol(['トレーニングメニュー③', 'トレーニングメニュー3', 'メニュー③', 'メニュー3', '種目③', '種目3']);
    const colSet3 = findCol(['回数×セット③', '回数×セット3', '回数セット③', '回数セット3', 'セット③', 'セット3', '回数×セット数③']);
    const colMenu4 = findCol(['トレーニングメニュー④', 'トレーニングメニュー4', 'メニュー④', 'メニュー4', '種目④', '種目4']);
    const colSet4 = findCol(['回数×セット④', '回数×セット4', '回数セット④', '回数セット4', 'セット④', 'セット4', '回数×セット数④']);
    const colMenu5 = findCol(['トレーニングメニュー⑤', 'トレーニングメニュー5', 'メニュー⑤', 'メニュー5', '種目⑤', '種目5']);
    const colSet5 = findCol(['回数×セット⑤', '回数×セット5', '回数セット⑤', '回数セット5', 'セット⑤', 'セット5', '回数×セット数⑤']);
    
    // デバッグ: 列検索結果をログ出力
    Logger.log(`=== メニュー列検索結果 ===`);
    Logger.log(`メニュー1列: ${colMenu1 !== -1 ? colMenu1 + 1 : '見つかりません'}`);
    Logger.log(`セット1列: ${colSet1 !== -1 ? colSet1 + 1 : '見つかりません'}`);
    Logger.log(`メニュー2列: ${colMenu2 !== -1 ? colMenu2 + 1 : '見つかりません'}`);
    Logger.log(`セット2列: ${colSet2 !== -1 ? colSet2 + 1 : '見つかりません'}`);
    const colConversation = findCol(['会話の内容', '会話内容']);
    const colGoodPoints = findCol(['良かった点']);
    const colImprovements = findCol(['改善点', '気付き']);
    const colPain = findCol(['痛み', '違和感']);
    const colCondition = findCol(['体調']);
    const colEmail = findCol(['送信先メール', 'メールアドレス', 'email', 'emailアドレス', 'メール']);
    const colStatus = findCol(['メール送信ログ', 'status', 'ステータス']);
    
    // デバッグ: ヘッダーと列位置をログ出力
    Logger.log(`=== 列検索結果 ===`);
    Logger.log(`メールアドレス列: ${colEmail !== -1 ? colEmail + 1 : '見つかりません'}`);
    Logger.log(`ステータス列: ${colStatus !== -1 ? colStatus + 1 : '見つかりません'}`);
    if (colEmail === -1) {
      Logger.log(`ヘッダー一覧: ${header.slice(0, 30).map((h, i) => `${i + 1}:${h}`).join(', ')}`);
    }
    
    // newRowを初期化（実際の列数分）
    const newRow = new Array(lastCol).fill('');
    
    // 日付を設定（タイムスタンプ列が見つからない場合は最初の列に設定）
    const now = new Date();
    if (colTs !== -1) {
      newRow[colTs] = now;
    } else {
      newRow[0] = now; // フォールバック
    }
    if (colDate !== -1) {
      newRow[colDate] = Utilities.formatDate(now, "Asia/Tokyo", "yyyy/MM/dd");
    }
    
    // データを設定（存在する列のみ）
    if (colMember !== -1) newRow[colMember] = formData.memberId + ' | ' + formData.memberName;
    if (colStore !== -1) newRow[colStore] = formData.store || '';
    if (colTrainer !== -1) newRow[colTrainer] = formData.trainer || '';
    if (colWeight !== -1) newRow[colWeight] = formData.weight || '';
    if (colBodyFat !== -1) newRow[colBodyFat] = formData.bodyFat || '';
    if (colConcept !== -1) newRow[colConcept] = formData.concept || '';
    if (colBodyParts !== -1) newRow[colBodyParts] = formData.bodyParts || '';
    if (colStretch !== -1) newRow[colStretch] = formData.stretch || 'あり';
    if (colStretchContent !== -1) newRow[colStretchContent] = formData.stretchContent || '';
    // メニューとセット数を保存（デバッグログ付き）
    if (colMenu1 !== -1) {
      newRow[colMenu1] = formattedMenus[0] ? formattedMenus[0].name : '';
      Logger.log(`メニュー1保存: name=${newRow[colMenu1]}`);
    }
    if (colSet1 !== -1) {
      newRow[colSet1] = formattedMenus[0] ? formattedMenus[0].sets : '';
      Logger.log(`セット1保存: sets=${newRow[colSet1]}`);
    }
    if (colMenu2 !== -1) {
      newRow[colMenu2] = formattedMenus[1] ? formattedMenus[1].name : '';
      Logger.log(`メニュー2保存: name=${newRow[colMenu2]}`);
    }
    if (colSet2 !== -1) {
      newRow[colSet2] = formattedMenus[1] ? formattedMenus[1].sets : '';
      Logger.log(`セット2保存: sets=${newRow[colSet2]}`);
    }
    if (colMenu3 !== -1) {
      newRow[colMenu3] = formattedMenus[2] ? formattedMenus[2].name : '';
      Logger.log(`メニュー3保存: name=${newRow[colMenu3]}`);
    }
    if (colSet3 !== -1) {
      newRow[colSet3] = formattedMenus[2] ? formattedMenus[2].sets : '';
      Logger.log(`セット3保存: sets=${newRow[colSet3]}`);
    }
    if (colMenu4 !== -1) {
      newRow[colMenu4] = formattedMenus[3] ? formattedMenus[3].name : '';
      Logger.log(`メニュー4保存: name=${newRow[colMenu4]}`);
    }
    if (colSet4 !== -1) {
      newRow[colSet4] = formattedMenus[3] ? formattedMenus[3].sets : '';
      Logger.log(`セット4保存: sets=${newRow[colSet4]}`);
    }
    if (colMenu5 !== -1) {
      newRow[colMenu5] = formattedMenus[4] ? formattedMenus[4].name : '';
      Logger.log(`メニュー5保存: name=${newRow[colMenu5]}`);
    }
    if (colSet5 !== -1) {
      newRow[colSet5] = formattedMenus[4] ? formattedMenus[4].sets : '';
      Logger.log(`セット5保存: sets=${newRow[colSet5]}`);
    }
    if (colConversation !== -1) newRow[colConversation] = formData.conversation || '';
    if (colGoodPoints !== -1) newRow[colGoodPoints] = formData.goodPoints || '';
    if (colImprovements !== -1) newRow[colImprovements] = formData.improvements || '';
    if (colPain !== -1) newRow[colPain] = formData.pain || '';
    if (colCondition !== -1) newRow[colCondition] = formData.condition || '';
    
    // メールアドレスを取得して設定（後でprocessPendingEmailsで使用）
    let memberEmail = '';
    if (colEmail !== -1) {
      try {
        memberEmail = tw_getMemberEmail_(formData.memberId);
        newRow[colEmail] = memberEmail || '';
        Logger.log(`メールアドレス取得: ${formData.memberId} → ${memberEmail || '未登録'}`);
      } catch (e) {
        Logger.log(`メールアドレス取得エラー: ${e.message}`);
        newRow[colEmail] = ''; // エラー時は空にする
      }
    } else {
      // メールアドレス列が見つからない場合、固定列（26列目 = Z列）に設定を試みる
      Logger.log('⚠️ メールアドレス列が見つかりません。固定列（26列目）に設定を試みます');
      if (lastCol >= 26) {
        try {
          memberEmail = tw_getMemberEmail_(formData.memberId);
          newRow[25] = memberEmail || ''; // 26列目 = インデックス25
          Logger.log(`メールアドレス取得（固定列）: ${formData.memberId} → ${memberEmail || '未登録'}`);
        } catch (e) {
          Logger.log(`メールアドレス取得エラー（固定列）: ${e.message}`);
        }
      }
    }
    
    if (colStatus !== -1) {
      // メールアドレスがある場合は「送信待ち」、ない場合は「❌メールアドレス未登録」
      const hasEmail = memberEmail && String(memberEmail).trim() !== '';
      newRow[colStatus] = hasEmail ? '送信待ち' : '❌メールアドレス未登録';
      Logger.log(`ステータス設定: ${hasEmail ? '送信待ち' : '❌メールアドレス未登録'}`);
    } else if (lastCol >= 28) {
      // ステータス列が見つからない場合、固定列（28列目 = AB列）に設定
      const hasEmail = memberEmail && String(memberEmail).trim() !== '';
      newRow[27] = hasEmail ? '送信待ち' : '❌メールアドレス未登録'; // 28列目 = インデックス27
      Logger.log(`ステータス設定（固定列）: ${hasEmail ? '送信待ち' : '❌メールアドレス未登録'}`);
    }
    
    // タイムアウトを避けるため、appendRowの前にデータを検証
    try {
      // 1回の操作でデータを保存（高速化）
    sh.appendRow(newRow);
      Logger.log('✅ トレーニングデータを保存しました');
    } catch (appendError) {
      Logger.log(`❌ appendRowエラー: ${appendError.message}`);
      // フォールバック: setValuesを使用
      const nextRow = sh.getLastRow() + 1;
      sh.getRange(nextRow, 1, 1, lastCol).setValues([newRow]);
      Logger.log('✅ setValuesで保存しました（フォールバック）');
    }

    // Webアプリ経由では onFormSubmit が動かないため、送信待ち処理を自動で回す
    // - 常駐（1分ごと）トリガーを保証
    // - 送信直後に1回だけキック（約1分後）
    try {
      tw_setupEmailProcessingTrigger();
      tw_kickEmailProcessingOnce_();
    } catch (e) {
      Logger.log('⚠️ 送信待ち処理トリガー設定に失敗: ' + e.message);
    }
    
    return { success: true, message: 'トレーニングデータを保存しました' };
    
  } catch (e) {
    Logger.log(`トレーニング送信エラー: ${e.message}\n${e.stack}`);
    return { success: false, message: `エラー: ${e.message}` };
  }
}

/** ===== API: 会員一覧 ===== */
function tw_api_getMembers() {
  const sh = tw_getSheet_(TW_SHEETS.MEMBERS);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return [];

  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colId = tw_findColByHeader_(header, TW_HEADERS.member_id) || 1;
  const colName = tw_findColByHeader_(header, TW_HEADERS.member_name) || 2;
  // 入会/退会列を検索（M列 = 13列目）
  const colStatus = tw_findColByHeader_(header, ['入会/退会', '入会退会', 'ステータス', 'status', '会員ステータス']) || 13;

  const members = values
    .map(r => {
      const id = String(r[colId - 1] ?? "").trim();
      if (!id) return null;
      
      // 入会/退会列をチェック（入会の人だけを表示）
      const status = String(r[colStatus - 1] ?? "").trim();
      if (status !== '入会' && status !== '') {
        // 「退会」やその他の値の場合はスキップ
        return null;
      }
      
      const name = String(r[colName - 1] ?? "").trim();
      return { id, name, display: name ? `${id}｜${name}` : id };
    })
    .filter(Boolean);

  members.sort((a, b) => (a.display || "").localeCompare(b.display || "", "ja"));
  Logger.log(`会員一覧取得: ${members.length}名（入会のみ）`);
  return members;
}

/** ===== API: 会員IDでサマリー取得 ===== */
function tw_api_getSummary(memberId) {
  Logger.log(`=== tw_api_getSummary called for member: ${memberId} ===`);
  
  memberId = String(memberId ?? "").trim();
  if (!memberId) {
    Logger.log('Error: memberIdが空です');
    return { ok: false, message: "memberIdが空です" };
  }

  Logger.log('Getting member info...');
  const memberInfo = tw_getMemberInfo_(memberId);
  Logger.log(`Member info: ${JSON.stringify(memberInfo)}`);
  
  Logger.log('Getting latest session...');
  const session = tw_getLatestSession_(memberId);
  Logger.log(`Latest session: ${session ? 'found' : 'not found'}`);
  
  Logger.log('Getting session history...');
  const history = tw_getSessionHistory_(memberId, 50);
  Logger.log(`History count: ${history.length}`);
  
  Logger.log('Getting posture AI...');
  const posture = tw_getPostureAi_(memberId);
  Logger.log(`Posture AI length: ${posture.length}`);
  
  Logger.log('Getting posture manual...');
  const postureManual = tw_api_getPostureManual(memberId);
  Logger.log(`Posture manual: ${postureManual.text ? 'あり' : 'なし'}`);
  
  Logger.log('Getting AI 2026...');
  const ai2026 = tw_getAi2026_(memberId);
  Logger.log(`AI 2026: ${ai2026 ? 'found' : 'not found'}`);
  
  Logger.log('Getting body images...');
  const bodyImages = tw_api_getBodyImages(memberId);
  Logger.log(`Body images count: ${bodyImages.length}`);
  
  Logger.log('Checking photo alert...');
  const photoAlert = tw_api_checkPhotoAlert(memberId);
  Logger.log(`Photo alert: ${JSON.stringify(photoAlert)}`);
  
  Logger.log('Calculating ideal metrics...');
  const idealMetrics = tw_calculateIdealMetrics_(memberInfo, ai2026);
  
  Logger.log('Generating progress plan...');
  Logger.log(`ai2026 before progressPlan: ${JSON.stringify(ai2026)}`);
  const progressPlan = tw_generateProgressPlan_(memberInfo, ai2026, idealMetrics);
  Logger.log(`progressPlan result: ${JSON.stringify(progressPlan)}`);
  
  Logger.log('Getting ratings...');
  const ratings = tw_api_getRatings(memberId, 10);

  const result = {
    ok: true,
    memberId,
    memberInfo,
    latest: session,
    history,
    posture,
    postureManual,
    ai2026,
    idealMetrics,
    progressPlan,
    bodyImages,
    photoAlert,
    ratings
  };
  
  Logger.log(`=== Returning result with ${bodyImages.length} body images ===`);
  
  return result;
}

/** ===== 会員情報取得 ===== */
function tw_getMemberInfo_(memberId) {
  const sh = tw_getSheet_(TW_SHEETS.MEMBERS);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return null;

  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colId = tw_findColByHeader_(header, TW_HEADERS.member_id) || 1;
  const colName = tw_findColByHeader_(header, TW_HEADERS.member_name) || 2;
  const colHeight = tw_findColByHeader_(header, TW_HEADERS.member_height);

  for (let r of values) {
    const id = String(r[colId - 1] ?? "").trim();
    if (id === memberId) {
      const heightRaw = colHeight ? r[colHeight - 1] : null;
      const heightValue = parseFloat(heightRaw);
      
      return {
        id,
        name: String(r[colName - 1] ?? "").trim(),
        height: (!isNaN(heightValue) && heightValue > 0) ? heightValue : null
      };
    }
  }
  return null;
}

/** ===== 最新セッション（AD列優先） ===== */
function tw_getLatestSession_(memberId) {
  const sh = tw_getSheet_(TW_SHEETS.SESSIONS);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return null;

  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colTs = tw_findColByHeader_(header, TW_HEADERS.session_ts) || TW_FALLBACK.SESSION_TIMESTAMP_COL;
  const colMember = tw_findColByHeader_(header, TW_HEADERS.session_member_id) || TW_FALLBACK.SESSION_MEMBER_ID_COL;
  const colTrainer = tw_findColByHeader_(header, TW_HEADERS.session_trainer) || TW_FALLBACK.SESSION_TRAINER_COL;
  const colPart = tw_findColByHeader_(header, TW_HEADERS.session_body_part) || TW_FALLBACK.SESSION_BODY_PART_COL;

  const colMemberId = tw_findColByHeader_(header, ["member_id"]);

  const menuPairs = tw_buildMenuPairs_(header);

  let latest = null;
  let latestTs = null;

  values.forEach(r => {
    let id = "";
    
    if (colMemberId) {
      id = String(r[colMemberId - 1] ?? "").trim();
    }
    
    if (!id) {
      const idRaw = String(r[colMember - 1] ?? "").trim();
      id = idRaw.includes('|') ? idRaw.split('|')[0].trim() : idRaw;
    }
    
    if (id !== memberId) return;

    const tsRaw = r[colTs - 1];
    const ts = tw_toDate_(tsRaw);
    if (!ts) return;

    if (!latestTs || ts.getTime() > latestTs.getTime()) {
      latestTs = ts;
      latest = tw_buildSessionObject_(r, { colTs, colTrainer, colPart, menuPairs });
    }
  });

  return latest;
}

/** ===== 履歴一覧（AD列優先） ===== */
function tw_getSessionHistory_(memberId, limit) {
  const sh = tw_getSheet_(TW_SHEETS.SESSIONS);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return [];

  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colTs = tw_findColByHeader_(header, TW_HEADERS.session_ts) || TW_FALLBACK.SESSION_TIMESTAMP_COL;
  const colMember = tw_findColByHeader_(header, TW_HEADERS.session_member_id) || TW_FALLBACK.SESSION_MEMBER_ID_COL;
  const colTrainer = tw_findColByHeader_(header, TW_HEADERS.session_trainer) || TW_FALLBACK.SESSION_TRAINER_COL;
  const colPart = tw_findColByHeader_(header, TW_HEADERS.session_body_part) || TW_FALLBACK.SESSION_BODY_PART_COL;

  const colMemberId = tw_findColByHeader_(header, ["member_id"]);

  const menuPairs = tw_buildMenuPairs_(header);

  const list = values
    .map(r => {
      let id = "";
      
      if (colMemberId) {
        id = String(r[colMemberId - 1] ?? "").trim();
      }
      
      if (!id) {
        const idRaw = String(r[colMember - 1] ?? "").trim();
        id = idRaw.includes('|') ? idRaw.split('|')[0].trim() : idRaw;
      }
      
      if (id !== memberId) return null;
      const ts = tw_toDate_(r[colTs - 1]);
      if (!ts) return null;
      const obj = tw_buildSessionObject_(r, { colTs, colTrainer, colPart, menuPairs });
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
function tw_getPostureAi_(memberId) {
  const sh = tw_getSheet_(TW_SHEETS.POSTURE);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return "";

  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const colMember =
    tw_findColByHeader_(header, TW_HEADERS.posture_member_id) ||
    TW_POSTURE_FALLBACK.MEMBER_ID_COL;

  const colAi =
    tw_findColByHeader_(header, TW_HEADERS.posture_ai) ||
    TW_POSTURE_FALLBACK.AI_TEXT_COL;

  let text = "";
  values.forEach(r => {
    const id = String(r[colMember - 1] ?? "").trim();
    if (id !== memberId) return;
    const t = String(r[colAi - 1] ?? "").trim();
    if (t) text = t;
  });
  return text;
}

/** ===== 姿勢評価手入力：シート取得/作成 ===== */
function tw_getOrCreatePostureManualSheet_() {
  try {
    return tw_getSheet_(TW_SHEETS.POSTURE_MANUAL);
  } catch (e) {
    // シートが存在しない場合は作成
    const ss = TW_SPREADSHEET_ID
      ? SpreadsheetApp.openById(TW_SPREADSHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.insertSheet(TW_SHEETS.POSTURE_MANUAL);
    
    // ヘッダー行を設定
    sh.getRange(1, 1, 1, 4).setValues([['member_id', 'updated_at', 'text', 'trainer']]);
    
    Logger.log(`✅ 姿勢評価_手入力シートを作成しました`);
    return sh;
  }
}

/** ===== API: 姿勢評価手入力取得 ===== */
function tw_api_getPostureManual(memberId) {
  try {
    Logger.log(`=== tw_api_getPostureManual called for member: ${memberId} ===`);
    
    const sh = tw_getOrCreatePostureManualSheet_();
    const lastRow = sh.getLastRow();
    
    if (lastRow < 2) {
      Logger.log('姿勢評価_手入力シートにデータがありません');
      return { text: "", updatedAt: "" };
    }
    
    const header = sh.getRange(1, 1, 1, 4).getValues()[0];
    const values = sh.getRange(2, 1, lastRow - 1, 4).getValues();
    
    // 最新のtextを取得（updated_atが最新のもの）
    let latestText = "";
    let latestUpdatedAt = null;
    
    values.forEach(r => {
      const id = String(r[0] ?? "").trim();
      if (id !== memberId) return;
      
      const updatedAt = tw_toDate_(r[1]);
      const text = String(r[2] ?? "").trim();
      
      if (text && (!latestUpdatedAt || (updatedAt && updatedAt.getTime() > latestUpdatedAt.getTime()))) {
        latestText = text;
        latestUpdatedAt = updatedAt;
      }
    });
    
    Logger.log(`最新の手入力: ${latestText ? 'あり' : 'なし'}`);
    
    return {
      text: latestText,
      updatedAt: latestUpdatedAt ? tw_formatDate_(latestUpdatedAt) : ""
    };
    
  } catch (e) {
    Logger.log(`姿勢評価手入力取得エラー: ${e.message}`);
    return { text: "", updatedAt: "" };
  }
}

/** ===== API: 姿勢評価手入力保存 ===== */
function tw_api_savePostureManual(memberId, text) {
  try {
    Logger.log(`=== tw_api_savePostureManual called ===`);
    Logger.log(`memberId: ${memberId}, text length: ${text ? text.length : 0}`);
    
    if (!memberId) {
      return { success: false, message: 'memberIdが必要です' };
    }
    
    const sh = tw_getOrCreatePostureManualSheet_();
    const now = new Date();
    
    // 新しい行を追加（追記方式）
    const newRow = [
      memberId,
      now,
      text || "",
      "" // trainerは任意
    ];
    
    sh.appendRow(newRow);
    
    Logger.log(`✅ 姿勢評価手入力を保存しました`);
    
    return { success: true, message: '保存しました', updatedAt: tw_formatDate_(now) };
    
  } catch (e) {
    Logger.log(`姿勢評価手入力保存エラー: ${e.message}`);
    return { success: false, message: e.toString() };
  }
}

/** ===== 2026年目標AI分析（未完了原因ログ化追加） ===== */
function tw_getAi2026_(memberId) {
  try {
    Logger.log(`=== tw_getAi2026_ called for member: ${memberId} ===`);
    
    // ヒアリング回答の有無をチェック
    let hasHearing = false;
    try {
      const hearingSh = tw_getSheet_(TW_SHEETS.GOALS_HEARING);
      const hearingLastRow = hearingSh.getLastRow();
      if (hearingLastRow >= 2) {
        const hearingHeader = hearingSh.getRange(1, 1, 1, hearingSh.getLastColumn()).getValues()[0];
        const hearingValues = hearingSh.getRange(2, 1, hearingLastRow - 1, hearingSh.getLastColumn()).getValues();
        const colMemberId = tw_findColByHeader_(hearingHeader, ['member_id', '会員ID', 'ID']);
        
        if (colMemberId) {
          hearingValues.forEach(r => {
            const id = String(r[colMemberId - 1] ?? "").trim();
            if (id === memberId) {
              hasHearing = true;
            }
          });
        }
      }
      Logger.log(`ヒアリング回答チェック: ${hasHearing ? 'あり' : 'なし'}`);
    } catch (e) {
      Logger.log(`ヒアリング回答チェックエラー: ${e.message}`);
    }
    
    const sh = tw_getSheet_(TW_SHEETS.AI_2026);
    const lastRow = sh.getLastRow();
    
    // AI分析の有無をチェック
    let hasAiAnalysis = false;
    let incompleteReason = "";
    
    if (lastRow < 2) {
      Logger.log('2026_AIシートにデータがありません');
      hasAiAnalysis = false;
      if (!hasHearing) {
        incompleteReason = "ヒアリング未回答";
      } else {
        incompleteReason = "AI分析未作成";
      }
    } else {
      const values = sh.getRange(2, 1, lastRow - 1, 6).getValues();
      // Submission IDを取得（2026目標ヒアリング_回答シートから）
      const goalInfoForCheck = tw_getGoalInfo_(memberId);
      const submissionIdForCheck = goalInfoForCheck?.submissionId || "";
      
      values.forEach(r => {
        // key列（Submission ID）で検索
        const key = String(r[TW_AI_2026_COLS.KEY_COL - 1] ?? "").trim();
        // member_id列で検索（後方互換性のため）
        const id = String(r[TW_AI_2026_COLS.MEMBER_ID_COL - 1] ?? "").trim();
        
        // Submission IDまたはmemberIdでマッチ
        const isMatch = (submissionIdForCheck && key === submissionIdForCheck) || id === memberId;
        
        if (isMatch) {
          hasAiAnalysis = true;
        }
      });
      
      if (!hasAiAnalysis) {
        if (!hasHearing) {
          incompleteReason = "ヒアリング未回答";
        } else {
          incompleteReason = "AI分析未作成";
        }
      }
    }
    
    Logger.log(`AI分析チェック: ${hasAiAnalysis ? 'あり' : 'なし'}`);
    if (incompleteReason) {
      Logger.log(`未完了理由: ${incompleteReason}`);
    }
    
    if (lastRow < 2) {
      return { 
        text: "", 
        photo: "", 
        status: "未分析",
        incompleteReason: incompleteReason,
        currentWeight: null,
        currentBodyFat: null,
        currentLeanMass: null,
        targetWeight: null,
        targetBodyFat: null,
        targetLeanMass: null,
        height: "",
        goalDate: "",
        trainingContent: "",
        bodyMake1: "",
        bodyMake2: "",
        bodyMake3: "",
        bodyMakeHeight: "",
        bodyMakeWeight: "",
        bodyMakeBodyFat: "",
        numericGoal: ""
      };
    }

    const values = sh.getRange(2, 1, lastRow - 1, 6).getValues();

    // Submission IDを取得（2026目標ヒアリング_回答シートから）
    const goalInfo = tw_getGoalInfo_(memberId);
    const submissionId = goalInfo?.submissionId || "";
    
    Logger.log(`検索条件: memberId=${memberId}, submissionId=${submissionId}`);
    Logger.log(`2026_AIシートのデータ行数: ${values.length}`);

    let aiText = "";
    let status = "未分析";
    let analyzedAt = "";
    let foundRow = false;
    
    values.forEach((r, index) => {
      // key列（Submission ID）で検索
      const key = String(r[TW_AI_2026_COLS.KEY_COL - 1] ?? "").trim();
      // member_id列で検索（後方互換性のため）
      const id = String(r[TW_AI_2026_COLS.MEMBER_ID_COL - 1] ?? "").trim();
      
      Logger.log(`行${index + 2}: key="${key}", member_id="${id}"`);
      
      // Submission IDまたはmemberIdでマッチ
      const isMatch = (submissionId && key === submissionId) || id === memberId;
      
      if (!isMatch) return;
      
      foundRow = true;
      const done = String(r[TW_AI_2026_COLS.DONE_COL - 1] ?? "").trim();
      Logger.log(`マッチした行${index + 2}: done="${done}"`);
      
      // doneが「済」でなくても、ai_textがあれば取得（doneチェックを緩和）
      const textValue = String(r[TW_AI_2026_COLS.AI_TEXT_COL - 1] ?? "").trim();
      if (textValue) {
        aiText = textValue;
        status = String(r[TW_AI_2026_COLS.STATUS_COL - 1] ?? "").trim() || "OK";
        const at = r[TW_AI_2026_COLS.ANALYZED_AT_COL - 1];
        analyzedAt = tw_formatDate_(tw_toDate_(at));
        Logger.log(`✅ AI分析データを取得: status=${status}, textLength=${aiText.length}`);
      } else if (done === "済") {
        // doneが「済」でもテキストがない場合はスキップ
        Logger.log(`⚠️ done="済"だがテキストが空: 行${index + 2}`);
      }
    });
    
    if (!foundRow) {
      Logger.log(`⚠️ memberId=${memberId}のデータが見つかりませんでした`);
    }

    const photoUrl = tw_getTargetPhotoUrl_(memberId);
    // goalInfoは既に上で取得済み
    const currentMetrics = tw_extractCurrentMetrics_(aiText);
    const targetMetrics = tw_extractTargetMetrics_(aiText);
    
    // 最終的な未完了理由を決定
    let finalIncompleteReason = incompleteReason;
    if (!aiText && !foundRow) {
      finalIncompleteReason = "AI分析未作成";
    } else if (!aiText && foundRow) {
      finalIncompleteReason = "AI分析データが空です";
    }

    const result = {
      text: aiText,
      photo: photoUrl,
      status: status,
      analyzedAt: analyzedAt,
      incompleteReason: aiText ? "" : finalIncompleteReason,
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
    
    Logger.log(`✅ AI2026取得成功: status=${status}, incompleteReason=${incompleteReason || 'なし'}`);
    Logger.log(`AI2026 result詳細: currentWeight=${result.currentWeight}, targetWeight=${result.targetWeight}, bodyMakeWeight=${result.bodyMakeWeight}, numericGoal=${result.numericGoal}`);
    return result;

  } catch (e) {
    Logger.log(`❌ AI2026取得エラー: ${e.message}`);
    Logger.log(`スタック: ${e.stack}`);
    return { 
      text: "", 
      photo: "", 
      status: "エラー",
      incompleteReason: "目標データ取得エラー",
      currentWeight: null,
      currentBodyFat: null,
      currentLeanMass: null,
      targetWeight: null,
      targetBodyFat: null,
      targetLeanMass: null,
      height: "",
      goalDate: "",
      trainingContent: "",
      bodyMake1: "",
      bodyMake2: "",
      bodyMake3: "",
      bodyMakeHeight: "",
      bodyMakeWeight: "",
      bodyMakeBodyFat: "",
      numericGoal: ""
    };
  }
}

/** ===== 目標情報取得（2026目標ヒアリング_回答シートから最新回答を取得） ===== */
function tw_getGoalInfo_(memberId) {
  try {
    Logger.log(`=== tw_getGoalInfo_ 開始: ${memberId} ===`);
    
    const sh = tw_getSheet_(TW_SHEETS.GOALS_HEARING);
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    
    if (lastRow < 2) {
      Logger.log('シートにデータがありません');
      return {
        submissionId: "",
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
    const colSubmissionId = tw_findColByHeader_(header, ['Submission ID', 'submission id', 'submission_id', 'id']);
    const colMemberId = tw_findColByHeader_(header, ['member_id', '会員ID', 'ID']);
    const colTrainingContent = tw_findColByHeader_(header, ['2026年トレーニング内容', 'トレーニング内容']);
    const colBodyMake1 = tw_findColByHeader_(header, ['【1番】ボディメイク', '1番ボディメイク']);
    const colBodyMake2 = tw_findColByHeader_(header, ['【2番】ボディメイク', '2番ボディメイク']);
    const colBodyMake3 = tw_findColByHeader_(header, ['【3番】ボディメイク', '3番ボディメイク']);
    const colHeight = tw_findColByHeader_(header, ['ボディメイク身長', '身長']);
    const colWeight = tw_findColByHeader_(header, ['体重', 'ボディメイク体重']);
    const colBodyFat = tw_findColByHeader_(header, ['体脂肪率', 'ボディメイク体脂肪率']);
    const colNumericGoal = tw_findColByHeader_(header, ['数値目標']);
    const colGoalDate = tw_findColByHeader_(header, ['目標達成日', '目標日']);
    const colTargetPhoto = tw_findColByHeader_(header, ['理想の体型写真', '目標写真']);

    if (!colMemberId) {
      Logger.log('❌ member_id列が見つかりません');
      return {
        submissionId: "",
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
        submissionId: "",
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
    const submissionId = colSubmissionId ? String(latestRow[colSubmissionId - 1] ?? "").trim() : "";

    const result = {
      submissionId: submissionId,
      trainingContent: colTrainingContent ? String(latestRow[colTrainingContent - 1] ?? "").trim() : "",
      bodyMake1: colBodyMake1 ? String(latestRow[colBodyMake1 - 1] ?? "").trim() : "",
      bodyMake2: colBodyMake2 ? String(latestRow[colBodyMake2 - 1] ?? "").trim() : "",
      bodyMake3: colBodyMake3 ? String(latestRow[colBodyMake3 - 1] ?? "").trim() : "",
      height: (!isNaN(heightVal) && heightVal > 0) ? heightVal : null,
      weight: (!isNaN(weightVal) && weightVal > 0) ? weightVal : null,
      bodyFat: (!isNaN(bodyFatVal) && bodyFatVal > 0) ? bodyFatVal : null,
      numericGoal: colNumericGoal ? String(latestRow[colNumericGoal - 1] ?? "").trim() : "",
      goalDate: colGoalDate ? tw_formatDate_(tw_toDate_(latestRow[colGoalDate - 1])) : "",
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
      submissionId: "",
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
function tw_getTargetPhotoUrl_(memberId) {
  try {
    const goalInfo = tw_getGoalInfo_(memberId);
    return goalInfo?.targetPhoto || "";
  } catch (e) {
    Logger.log(`目標写真取得エラー: ${e}`);
    return "";
  }
}

/** ===== API: 目標画像アップロード ===== */
function tw_api_uploadGoalPhoto(memberId, base64, filename) {
  try {
    Logger.log(`=== tw_api_uploadGoalPhoto called ===`);
    Logger.log(`memberId: ${memberId}, filename: ${filename}`);
    
    if (!memberId || !base64) {
      return { success: false, message: 'memberIdとbase64が必要です' };
    }
    
    // Base64→Blob→Drive保存
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64),
      'image/jpeg',
      filename || `${memberId}_target_photo.jpg`
    );
    
    // Driveフォルダを取得（Abody会員写真フォルダ）
    const driveFolder = getOrCreateDriveFolder_();
    const file = driveFolder.createFile(blob);
    
    // 共有設定（リンクで閲覧可能）
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const url = file.getUrl();
    
    Logger.log(`✅ Driveに保存完了: ${url}`);
    
    // 2026_最新シートにURLを保存（まずは2026_最新シートを試す）
    let sh = null;
    let colMemberId = null;
    let colTargetPhoto = null;
    
    try {
      sh = tw_getSheet_(TW_SHEETS.GOALS_2026);
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    
    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
      colMemberId = tw_findColByHeader_(header, TW_HEADERS.goals_member_id);
      colTargetPhoto = tw_findColByHeader_(header, TW_HEADERS.goals_target_photo);
      
      Logger.log(`列検索結果: colMemberId=${colMemberId}, colTargetPhoto=${colTargetPhoto}`);
    } catch (e) {
      Logger.log(`⚠️ 2026_最新シート取得エラー: ${e.message}`);
      // 2026目標ヒアリング_回答シートも試す
      try {
        sh = tw_getSheet_(TW_SHEETS.GOALS_HEARING);
        const lastRow = sh.getLastRow();
        const lastCol = sh.getLastColumn();
        
        const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
        colMemberId = tw_findColByHeader_(header, TW_HEADERS.goals_member_id);
        colTargetPhoto = tw_findColByHeader_(header, TW_HEADERS.goals_target_photo);
        
        Logger.log(`2026目標ヒアリング_回答シート: colMemberId=${colMemberId}, colTargetPhoto=${colTargetPhoto}`);
      } catch (e2) {
        Logger.log(`⚠️ 2026目標ヒアリング_回答シート取得エラー: ${e2.message}`);
      }
    }
    
    if (!sh || !colMemberId || !colTargetPhoto) {
      Logger.log('⚠️ 必要な列が見つかりません。URLを返します');
      Logger.log(`sh: ${sh ? '存在' : 'なし'}, colMemberId: ${colMemberId || 'なし'}, colTargetPhoto: ${colTargetPhoto || 'なし'}`);
      return { success: true, message: 'Driveに保存しましたが、シート更新に失敗しました（必要な列が見つかりません）', imageUrl: url };
    }
    
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
    // 既存の行を探す
    let targetRow = null;
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][colMemberId - 1]).trim() === memberId) {
        targetRow = i + 2;
        break;
      }
    }
    
    if (targetRow) {
      // 既存行を更新
      sh.getRange(targetRow, colTargetPhoto).setValue(url);
      Logger.log(`✅ 既存行を更新: 行${targetRow}`);
    } else {
      // 新しい行を追加
      const newRow = new Array(lastCol).fill('');
      newRow[colMemberId - 1] = memberId;
      newRow[colTargetPhoto - 1] = url;
      sh.appendRow(newRow);
      Logger.log(`✅ 新しい行を追加`);
    }
    
    return { 
      success: true, 
      message: '目標画像を保存しました',
      imageUrl: url
    };
    
  } catch (e) {
    Logger.log(`❌ 目標画像アップロードエラー: ${e.message}`);
    return { success: false, message: e.toString() };
  }
}

/** ===== 🆕 API: AI分析を実行 ===== */
function tw_api_runGoalAnalysis(memberId) {
  try {
    Logger.log(`=== tw_api_runGoalAnalysis called for member: ${memberId} ===`);
    
    if (!memberId) {
      Logger.log('❌ memberIdが空です');
      return { success: false, message: 'memberIdが必要です' };
    }
    
    // 最新の目標回答を取得
    const goalInfo = tw_getGoalInfo_(memberId);
    Logger.log(`目標情報取得結果: ${JSON.stringify(goalInfo)}`);
    
    // 目標画像URLを取得（goalInfoから優先、なければ2026_最新シートから）
    const targetPhotoUrl = goalInfo?.targetPhoto || tw_getTargetPhotoUrl_(memberId) || '';
    Logger.log(`目標画像URL: ${targetPhotoUrl || 'なし'}`);
    
    // ログ出力：取得した目標回答の状態をチェック
    let logMessages = [];
    if (!goalInfo || Object.keys(goalInfo).length === 0) {
      logMessages.push('❌ 目標回答が空です');
    } else {
      // 必須項目のチェック
      const requiredFields = ['trainingContent', 'bodyMake1', 'bodyMake2', 'bodyMake3'];
      const missingRequired = [];
      requiredFields.forEach(field => {
        if (!goalInfo[field] || String(goalInfo[field]).trim() === '') {
          missingRequired.push(field);
        }
      });
      if (missingRequired.length > 0) {
        logMessages.push(`⚠️ 必須項目が空です: ${missingRequired.join(', ')}`);
      } else {
        logMessages.push('✅ 必須項目はすべて入力されています');
      }
    }
    
    // AI分析処理を実行
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      Logger.log('❌ GEMINI_API_KEYが設定されていません');
      logMessages.push('❌ 保存先（GEMINI_API_KEY）が空です');
      Logger.log(`分析が未完了になる原因: ${logMessages.join(', ')}`);
      return { success: false, message: 'GEMINI_API_KEYが設定されていません' };
    }
    
    // キーを決定（Submission IDがあればそれを使用、なければmemberIdを使用）
    const key = goalInfo?.submissionId || memberId;
    Logger.log(`使用するキー: ${key} (submissionId: ${goalInfo?.submissionId || 'なし'}, memberId: ${memberId})`);
    
    // 既存のAI_2026シートをチェック
    const aiSh = tw_getOrCreateAiSheet_();
    
    // キー（Submission IDまたはmemberId）で既存の分析結果を検索
    const existingRow = tw_findAiAnalysisByKey_(aiSh, key);
    
    // 会員情報を取得（氏名など）
    const memberInfo = tw_getMemberInfo_(memberId);
    const name = memberInfo?.name || '';
    
    // 目標情報から必要なデータを準備
    const height = goalInfo?.height || '';
    const weight = goalInfo?.bodyMakeWeight || goalInfo?.weight || '';
    const bf = goalInfo?.bodyMakeBodyFat || goalInfo?.bodyFat || '';
    const targetText = goalInfo?.trainingContent || goalInfo?.numericGoal || '';
    const g1 = goalInfo?.bodyMake1 || '';
    const g2 = goalInfo?.bodyMake2 || '';
    const g3 = goalInfo?.bodyMake3 || '';
    const gender = '男性'; // デフォルト値（必要に応じて取得）
    
    // トレーニング履歴を取得
    const trainingHistory = tw_getTrainingHistoryForAnalysis_(memberId, 10);
    
    // 目標写真を分析
    const photoAnalysis = tw_analyzeTargetPhoto_(apiKey, targetPhotoUrl, gender);
    
    // プロンプトを構築
    const prompt = tw_buildGoalAnalysisPrompt_({
      memberId, name, height, weight, bf, targetText, g1, g2, g3, gender, trainingHistory, photoAnalysis
    });
    
    // Gemini APIを呼び出し
    const result = tw_callGeminiForGoalAnalysis_(apiKey, prompt);
    
    const now = new Date();
    const done = result.ok ? '済' : '失敗';
    const status = result.ok ? 'OK' : (result.error || 'ERROR');
    const aiText = result.ok ? tw_clipText_(result.data.ai_text || '', 5000) : tw_clipText_(result.raw || '', 5000);
    
    // AI_2026シートに保存
    if (existingRow) {
      // 既存行を更新
      aiSh.getRange(existingRow, 1, 1, 6).setValues([[
        key,
        memberId,
        aiText || '',
        done,
        now,
        status
      ]]);
      Logger.log(`✅ 既存の分析結果を更新: 行${existingRow}`);
    } else {
      // 新しい行を追加
      aiSh.appendRow([
        key,
        memberId,
        aiText || '',
        done,
        now,
        status
      ]);
      Logger.log(`✅ 新しい分析結果を追加`);
    }
    
    // 保存先の確認ログ
    if (aiSh) {
      logMessages.push('✅ 保存先（AI_2026シート）は正常です');
    } else {
      logMessages.push('❌ 保存先（AI_2026シート）が空です');
    }
    
    Logger.log(`分析が未完了になる原因: ${logMessages.join(', ')}`);
    
    if (result.ok) {
      return {
        success: true,
        message: 'AI分析が完了しました',
        updatedAt: tw_formatDate_(now)
      };
    } else {
      return {
        success: false,
        message: `AI分析に失敗しました: ${result.error || '不明なエラー'}`
      };
    }
    
  } catch (e) {
    Logger.log(`❌ tw_api_runGoalAnalysis エラー: ${e.message}`);
    Logger.log(`スタック: ${e.stack}`);
    return {
      success: false,
      message: `エラーが発生しました: ${e.toString()}`
    };
  }
}

/** ===== AI_2026シートを取得/作成 ===== */
function tw_getOrCreateAiSheet_() {
  const ss = TW_SPREADSHEET_ID
    ? SpreadsheetApp.openById(TW_SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  
  let aiSh = ss.getSheetByName(TW_SHEETS.AI_2026);
  if (!aiSh) {
    aiSh = ss.insertSheet(TW_SHEETS.AI_2026);
    aiSh.getRange(1, 1, 1, 6).setValues([[
      'key', 'member_id', 'ai_text', 'done', 'analyzed_at', 'status'
    ]]);
    aiSh.setFrozenRows(1);
  } else {
    const h = aiSh.getRange(1, 1, 1, Math.max(6, aiSh.getLastColumn())).getValues()[0].map(String);
    if (String(h[0] || '').trim() !== 'key') {
      aiSh.getRange(1, 1, 1, 6).setValues([[
        'key', 'member_id', 'ai_text', 'done', 'analyzed_at', 'status'
      ]]);
      aiSh.setFrozenRows(1);
    }
  }
  return aiSh;
}

/** ===== キー（Submission IDまたはmemberId）でAI分析結果を検索 ===== */
function tw_findAiAnalysisByKey_(aiSh, key) {
  const lastRow = aiSh.getLastRow();
  if (lastRow < 2) return null;
  
  // key列（1列目）をチェック
  const keyValues = aiSh.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < keyValues.length; i++) {
    const k = String(keyValues[i][0] || '').trim();
    if (k === key) {
      return i + 2; // 実際の行番号
    }
  }
  
  // member_id列（2列目）もチェック（後方互換性のため）
  const memberIdValues = aiSh.getRange(2, 2, lastRow - 1, 1).getValues();
  for (let i = 0; i < memberIdValues.length; i++) {
    const id = String(memberIdValues[i][0] || '').trim();
    if (id === key) {
      return i + 2; // 実際の行番号
    }
  }
  
  return null;
}

/** ===== トレーニング履歴を取得（AI分析用） ===== */
function tw_getTrainingHistoryForAnalysis_(memberId, limit) {
  try {
    const sessions = tw_getSessionHistory_(memberId, limit);
    if (!sessions || sessions.length === 0) {
      return { summary: `会員ID:${memberId}のトレーニング記録なし`, count: 0 };
    }
    
    const summary = `
【トレーニング履歴サマリー】
- 記録回数: ${sessions.length}回
- 最新記録:
${sessions.slice(0, 3).map((s, i) => {
  const menuStr = s.menus && s.menus.length > 0 
    ? s.menus.map(m => `${m.menu || ''} ${m.set || ''}`).join(', ')
    : 'メニュー詳細不明';
  return `  ${i + 1}. ${s.ts || '日時不明'}: ${menuStr.slice(0, 100)}`;
}).join('\n')}

- 継続状況: 直近${sessions.length}回のトレーニング実施
- 頻度パターン: ${sessions.length >= 5 ? '定期的に実施' : '記録少なめ'}
`.trim();
    
    return { summary, count: sessions.length, records: sessions };
  } catch (e) {
    Logger.log(`トレーニング履歴取得エラー: ${e.message}`);
    return { summary: 'トレーニング履歴データなし', count: 0 };
  }
}

/** ===== 目標写真をGeminiで分析（完全版） ===== */
function tw_analyzeTargetPhoto_(apiKey, imageUrl, gender) {
  if (!imageUrl || imageUrl.trim() === '' || !imageUrl.startsWith('http')) {
    Logger.log('目標写真なし');
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
      const extracted = tw_extractJson_(candidateText);
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

    Logger.log(`✅ 目標写真分析完了`);
    return { summary, data };

  } catch (e) {
    Logger.log(`画像分析エラー: ${e.message}`);
    return { summary: '画像分析失敗（取得エラー）' };
  }
}

/** ===== プロンプトを構築（完全版） ===== */
function tw_buildGoalAnalysisPrompt_(d) {
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

/** ===== Gemini APIを呼び出し（AI分析用） ===== */
function tw_callGeminiForGoalAnalysis_(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${encodeURIComponent(apiKey)}`;
  
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
  
  try {
    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const code = res.getResponseCode();
    const text = res.getContentText() || '';
    
    if (code < 200 || code >= 300) {
      return { ok: false, error: `HTTP ${code}`, raw: text };
    }
    
    const json = JSON.parse(text);
    const candidateText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    
    let data;
    try {
      data = JSON.parse(candidateText);
    } catch (e) {
      const extracted = tw_extractJson_(candidateText);
      if (!extracted.ok) return { ok: false, error: 'JSON抽出失敗', raw: candidateText };
      data = extracted.obj;
    }
    
    return { ok: true, data };
    
  } catch (e) {
    Logger.log(`Gemini API呼び出しエラー: ${e.message}`);
    return { ok: false, error: e.toString(), raw: '' };
  }
}

/** ===== JSONを抽出 ===== */
function tw_extractJson_(s) {
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

/** ===== テキストをクリップ ===== */
function tw_clipText_(s, maxChars) {
  const t = String(s || '');
  return t.length > maxChars ? t.slice(0, maxChars) + '…' : t;
}

/** ===== 🆕 目標写真をアップロード（後方互換性のため保持） ===== */
function tw_api_saveTargetPhoto(data) {
  try {
    if (!data || !data.memberId || !data.imageData) {
      return { success: false, message: '必要なデータが不足しています' };
    }
    
    // Google Driveにアップロード
    const fileName = `${data.memberId}_target_photo.jpg`;
    const url = uploadImageToDrive_(data.memberId, data.memberName, data.imageData, fileName);
    
    // 2026_最新シートに保存
    const sh = tw_getSheet_(TW_SHEETS.GOALS_2026);
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    
    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
    const colMemberId = tw_findColByHeader_(header, TW_HEADERS.goals_member_id);
    const colTargetPhoto = tw_findColByHeader_(header, TW_HEADERS.goals_target_photo);
    
    if (!colMemberId || !colTargetPhoto) {
      return { success: false, message: '必要な列が見つかりません' };
    }
    
    // 既存の行を探す
    let targetRow = null;
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][colMemberId - 1]).trim() === data.memberId) {
        targetRow = i + 2;
        break;
      }
    }
    
    if (targetRow) {
      // 既存行を更新
      sh.getRange(targetRow, colTargetPhoto).setValue(url);
    } else {
      // 新しい行を追加
      const newRow = new Array(lastCol).fill('');
      newRow[colMemberId - 1] = data.memberId;
      newRow[colTargetPhoto - 1] = url;
      sh.appendRow(newRow);
    }
    
    return { 
      success: true, 
      message: '目標写真を保存しました',
      imageUrl: url
    };
    
  } catch (e) {
    Logger.log('目標写真保存エラー: ' + e.message);
    return { success: false, message: e.toString() };
  }
}

/** ===== AIテキストから現在値を抽出 ===== */
function tw_extractCurrentMetrics_(aiText) {
  const metrics = {
    weight: null,
    bodyFat: null,
    leanMass: null
  };
  
  if (!aiText) return metrics;
  
  let weightMatch = aiText.match(/体重[：:\s]*(\d+\.?\d*)\s*kg/i);
  if (!weightMatch) weightMatch = aiText.match(/(\d+\.?\d*)\s*kg\s*[\/／]/);
  if (weightMatch) metrics.weight = parseFloat(weightMatch[1]);
  
  let bodyFatMatch = aiText.match(/体脂肪[率]*[：:\s]*(\d+\.?\d*)\s*%/i);
  if (!bodyFatMatch) bodyFatMatch = aiText.match(/[\/／]\s*体脂肪[率]*[：:\s]*(\d+\.?\d*)\s*%/i);
  if (bodyFatMatch) metrics.bodyFat = parseFloat(bodyFatMatch[1]);
  
  let leanMassMatch = aiText.match(/除脂肪[体重]*[：:\s]*(\d+\.?\d*)\s*kg/i);
  if (!leanMassMatch) leanMassMatch = aiText.match(/[\/／]\s*除脂肪[体重]*[：:\s]*(\d+\.?\d*)\s*kg/i);
  if (leanMassMatch) metrics.leanMass = parseFloat(leanMassMatch[1]);
  
  return metrics;
}

/** ===== AIテキストから目標値を抽出 ===== */
function tw_extractTargetMetrics_(aiText) {
  const metrics = {
    weight: null,
    bodyFat: null,
    leanMass: null
  };
  
  if (!aiText) return metrics;
  
  let weightMatch = aiText.match(/目標体重[：:\s]*(\d+\.?\d*)\s*kg/i);
  if (!weightMatch) weightMatch = aiText.match(/最終目標[^\d]*(\d+\.?\d*)\s*kg/i);
  if (weightMatch) metrics.weight = parseFloat(weightMatch[1]);
  
  let bodyFatMatch = aiText.match(/目標体脂肪[率]*[：:\s]*(\d+\.?\d*)\s*%/i);
  if (!bodyFatMatch) bodyFatMatch = aiText.match(/体脂肪[率]*[：:\s]*(\d+\.?\d*)\s*%[^現在]/i);
  if (bodyFatMatch) metrics.bodyFat = parseFloat(bodyFatMatch[1]);
  
  let leanMassMatch = aiText.match(/目標除脂肪[体重]*[：:\s]*(\d+\.?\d*)\s*kg/i);
  if (!leanMassMatch) leanMassMatch = aiText.match(/除脂肪[体重]*[：:\s]*(\d+\.?\d*)\s*kg[^現在]/i);
  if (leanMassMatch) metrics.leanMass = parseFloat(leanMassMatch[1]);
  
  return metrics;
}

/** ===== 理想値計算 ===== */
function tw_calculateIdealMetrics_(memberInfo, ai2026) {
  const result = {
    hasHeight: false,
    height: null,
    currentWeight: null,
    currentBodyFat: null,
    currentLeanMass: null,
    idealWeight: null,
    idealBodyFat: null,
    idealLeanMass: null,
    bmi: null,
    calculations: {}
  };
  
  let height = memberInfo?.height || null;
  if (!height && ai2026?.height) {
    height = parseFloat(ai2026.height);
  }
  
  if (!height || height <= 0) return result;
  
  result.hasHeight = true;
  result.height = height;
  
  const heightM = height / 100;
  
  if (ai2026?.currentWeight) {
    result.currentWeight = ai2026.currentWeight;
    result.bmi = Math.round((ai2026.currentWeight / (heightM * heightM)) * 10) / 10;
  }
  if (ai2026?.currentBodyFat) result.currentBodyFat = ai2026.currentBodyFat;
  if (ai2026?.currentLeanMass) result.currentLeanMass = ai2026.currentLeanMass;
  
  if (result.currentWeight) {
    result.idealWeight = Math.round((result.currentWeight - 2) * 10) / 10;
  }
  
  if (result.currentBodyFat) {
    result.idealBodyFat = Math.round((result.currentBodyFat - 1) * 10) / 10;
  }
  
  if (result.idealWeight && result.idealBodyFat) {
    result.idealLeanMass = Math.round(result.idealWeight * (1 - result.idealBodyFat / 100) * 10) / 10;
  }
  
  result.calculations = {
    bmrRange: tw_calculateBMR_(height, result.currentWeight || result.idealWeight),
    maintenanceCalories: tw_calculateMaintenanceCalories_(height, result.currentWeight || result.idealWeight),
    proteinNeeds: tw_calculateProteinNeeds_(result.currentWeight || result.idealWeight)
  };
  
  return result;
}

function tw_calculateBMR_(height, weight) {
  const bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * 30);
  return {
    min: Math.round(bmr * 0.95),
    max: Math.round(bmr * 1.05)
  };
}

function tw_calculateMaintenanceCalories_(height, weight) {
  const bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * 30);
  return Math.round(bmr * 1.55);
}

function tw_calculateProteinNeeds_(weight) {
  return {
    min: Math.round(weight * 1.6 * 10) / 10,
    max: Math.round(weight * 2.2 * 10) / 10
  };
}

/** ===== 進捗プラン生成 ===== */
function tw_generateProgressPlan_(memberInfo, ai2026, idealMetrics) {
  Logger.log('=== tw_generateProgressPlan_ 開始 ===');
  Logger.log(`ai2026: ${JSON.stringify(ai2026)}`);
  
  const plan = {
    hasPlan: false,
    currentStatus: {},
    goals: {},
    timeline: {},
    recommendations: []
  };
  
  // currentWeightとtargetWeightを取得（AIテキストから抽出した値、またはgoalInfoから取得）
  const currentWeight = ai2026?.currentWeight || (ai2026?.bodyMakeWeight ? parseFloat(ai2026.bodyMakeWeight) : null);
  const targetWeight = ai2026?.targetWeight || null;
  
  Logger.log(`currentWeight: ${currentWeight}, targetWeight: ${targetWeight}`);
  Logger.log(`bodyMakeWeight: ${ai2026?.bodyMakeWeight}, numericGoal: ${ai2026?.numericGoal}`);
  
  // 目標体重が取得できない場合は、goalInfoの数値目標から抽出を試みる
  let finalTargetWeight = targetWeight;
  if (!finalTargetWeight && ai2026?.numericGoal && currentWeight) {
    // 「-6kg」のような減量目標の場合、現在体重から減算
    const numericGoalMatch = ai2026.numericGoal.match(/([+-]?\d+\.?\d*)\s*kg/i);
    if (numericGoalMatch) {
      const diff = parseFloat(numericGoalMatch[1]);
      finalTargetWeight = currentWeight + diff; // diffが負の値なら減算、正の値なら加算
      Logger.log(`numericGoalから目標体重を計算: 現在${currentWeight}kg ${diff > 0 ? '+' : ''}${diff}kg = ${finalTargetWeight}kg`);
    }
  }
  
  // currentWeightまたはtargetWeightのいずれかが取得できればプランを生成
  if (!currentWeight && !finalTargetWeight) {
    Logger.log('⚠️ 現在体重と目標体重の両方が取得できません。ロードマップを表示できません。');
    Logger.log(`currentWeight: ${currentWeight}, finalTargetWeight: ${finalTargetWeight}`);
    return plan;
  }
  
  plan.hasPlan = true;
  
  plan.currentStatus = {
    weight: currentWeight,
    bodyFat: ai2026?.currentBodyFat || (ai2026?.bodyMakeBodyFat ? parseFloat(ai2026.bodyMakeBodyFat) : null),
    leanMass: ai2026?.currentLeanMass || null,
    bmi: idealMetrics.bmi
  };
  
  plan.goals = {
    weight: finalTargetWeight,
    bodyFat: ai2026?.targetBodyFat || null,
    leanMass: ai2026?.targetLeanMass || null,
    deadline: ai2026.goalDate || "2026年12月"
  };
  
  const weightDiff = currentWeight && finalTargetWeight ? (currentWeight - finalTargetWeight) : 0;
  const bodyFatDiff = plan.currentStatus.bodyFat && plan.goals.bodyFat ? (plan.currentStatus.bodyFat - plan.goals.bodyFat) : 0;
  
  const weeksToGoal = tw_calculateWeeksToDeadline_(ai2026.goalDate);
  const weeklyWeightLoss = weeksToGoal > 0 ? Math.round((weightDiff / weeksToGoal) * 10) / 10 : 0;
  
  plan.timeline = {
    weeksRemaining: weeksToGoal,
    monthsRemaining: Math.ceil(weeksToGoal / 4),
    weeklyWeightLoss: weeklyWeightLoss,
    weeklyBodyFatReduction: weeksToGoal > 0 ? Math.round((bodyFatDiff / weeksToGoal) * 10) / 10 : 0
  };
  
  plan.recommendations = tw_generateRecommendations_(weightDiff, bodyFatDiff, weeklyWeightLoss, ai2026);
  
  Logger.log(`✅ 進捗プラン生成完了: hasPlan=${plan.hasPlan}`);
  Logger.log(`plan: ${JSON.stringify(plan)}`);
  
  return plan;
}

function tw_calculateWeeksToDeadline_(goalDateStr) {
  if (!goalDateStr) {
    const defaultGoal = new Date(2026, 11, 31);
    const now = new Date();
    return Math.ceil((defaultGoal - now) / (7 * 24 * 60 * 60 * 1000));
  }
  
  const goalDate = tw_toDate_(goalDateStr);
  if (!goalDate) return 48;
  
  const now = new Date();
  const weeks = Math.ceil((goalDate - now) / (7 * 24 * 60 * 60 * 1000));
  return weeks > 0 ? weeks : 1;
}

function tw_generateRecommendations_(weightDiff, bodyFatDiff, weeklyWeightLoss, ai2026) {
  const recs = [];
  
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
  
  recs.push({
    category: "トレーニング",
    priority: "高",
    message: "筋肉量を維持しながら脂肪を減らすため、週3回以上の筋力トレーニングが必要です。",
    action: "上半身・下半身・全身の3分割ルーティンを継続"
  });
  
  if (ai2026.targetWeight) {
    const proteinNeeds = tw_calculateProteinNeeds_(ai2026.targetWeight);
    recs.push({
      category: "栄養",
      priority: "高",
      message: `タンパク質摂取を意識しましょう。目標：1日${proteinNeeds.min}〜${proteinNeeds.max}g`,
      action: "各食事でタンパク質源（肉・魚・卵・プロテイン）を確保"
    });
  }
  
  if (bodyFatDiff > 5) {
    recs.push({
      category: "ボディメイク",
      priority: "高",
      message: "体脂肪率を大きく下げる必要があります。有酸素運動も取り入れましょう。",
      action: "週2〜3回、20〜30分の軽い有酸素運動（ウォーキング・自転車）"
    });
  }
  
  recs.push({
    category: "リカバリー",
    priority: "中",
    message: "筋肉の成長と脂肪燃焼には質の高い睡眠が不可欠です。",
    action: "毎日7〜8時間の睡眠を確保"
  });
  
  return recs;
}

/** ===== セッション1行から表示用オブジェクトを作る ===== */
function tw_buildSessionObject_(r, opt) {
  const ts = tw_formatDate_(tw_toDate_(r[opt.colTs - 1]));
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

/** ===== メニュー列ペア ===== */
function tw_buildMenuPairs_(header) {
  const m1 = tw_findColByHeader_(header, TW_HEADERS.menu1);
  const s1 = tw_findColByHeader_(header, TW_HEADERS.set1);
  const m2 = tw_findColByHeader_(header, TW_HEADERS.menu2);
  const s2 = tw_findColByHeader_(header, TW_HEADERS.set2);

  const pairs = [];
  if (m1 && s1) pairs.push({ menu: m1, set: s1 });
  if (m2 && s2) pairs.push({ menu: m2, set: s2 });

  if (pairs.length === 0) return TW_FALLBACK.MENU_PAIRS;

  TW_FALLBACK.MENU_PAIRS.forEach(p => {
    if (!pairs.some(x => x.menu === p.menu && x.set === p.set)) pairs.push(p);
  });
  return pairs;
}

/** ===== ユーティリティ ===== */
function tw_getSheet_(name) {
  const ss = TW_SPREADSHEET_ID
    ? SpreadsheetApp.openById(TW_SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error(`シート「${name}」が見つかりません（タブ名を確認してね）`);
  return sh;
}

function tw_findColByHeader_(headerRow, candidates) {
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

function tw_toDate_(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function tw_formatDate_(d) {
  if (!d) return "";
  return Utilities.formatDate(d, "Asia/Tokyo", "yyyy/MM/dd HH:mm");
}

/** ===== メール送信トリガー ===== */
function sendAIEmailForRow_(rowNumber) {
  try {
    if (typeof processRow === 'function') {
      const sheet = SpreadsheetApp.openById(TW_SPREADSHEET_ID).getSheetByName(TW_SHEETS.SESSIONS);
      processRow(sheet, rowNumber);
    }
  } catch (e) {
    Logger.log('AIメール送信スキップ: ' + e.message);
  }
}

/** ===== 会員のメールアドレスを取得 ===== */
function tw_getMemberEmail_(memberId) {
  try {
    const sh = tw_getSheet_(TW_SHEETS.MEMBERS);
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    if (lastRow < 2) return null;

    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();

    const colId = tw_findColByHeader_(header, TW_HEADERS.member_id) || 1;
    // F列（6列目）からメールアドレスを取得
    const colEmail = tw_findColByHeader_(header, ['メール', 'メールアドレス', 'email', 'Email', 'E-mail']) || 6;

    Logger.log(`メールアドレス列検索: ${colEmail}列目（会員ID列: ${colId}列目）`);

    for (let r of values) {
      const id = String(r[colId - 1] ?? "").trim();
      if (id === memberId) {
        const email = String(r[colEmail - 1] ?? "").trim();
        Logger.log(`メールアドレス取得成功: ${memberId} → ${email || '空'}`);
        return email;
      }
    }
    Logger.log(`メールアドレス取得失敗: 会員ID ${memberId} が見つかりません`);
    return null;
  } catch (e) {
    Logger.log('メールアドレス取得エラー: ' + e.message);
    return null;
  }
}

/** ===== 送信待ちメールを処理 ===== */
function processPendingEmails() {
  try {
    const sh = SpreadsheetApp.openById(TW_SPREADSHEET_ID).getSheetByName(TW_SHEETS.SESSIONS);
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    if (lastRow < 2) return;
    
    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const statusCol = tw_findColByHeader_(header, ['メール送信ログ', 'status', 'ステータス']);
    const emailCol = tw_findColByHeader_(header, ['送信先メール', 'メールアドレス', 'email']);
    const memberCol = tw_findColByHeader_(header, ['会員様', '会員ID', 'member_id']);
    
    if (!statusCol || !emailCol || !memberCol) {
      Logger.log('必要な列が見つかりません');
      return;
    }
    
    const startRow = Math.max(2, lastRow - 19);
    const checkRows = lastRow - startRow + 1;
    const values = sh.getRange(startRow, 1, checkRows, lastCol).getValues();
    
    let processedCount = 0;
    
    values.forEach((row, index) => {
      const actualRow = startRow + index;
      const status = String(row[statusCol - 1] ?? "").trim();
      const email = String(row[emailCol - 1] ?? "").trim();
      
      if (!email && !status) {
        try {
          const memberRaw = String(row[memberCol - 1] ?? "").trim();
          const memberId = memberRaw.includes('|') ? memberRaw.split('|')[0].trim() : memberRaw;
          
          if (memberId) {
            const memberEmail = tw_getMemberEmail_(memberId);
            if (memberEmail) {
              sh.getRange(actualRow, emailCol).setValue(memberEmail);
              sh.getRange(actualRow, statusCol).setValue('送信待ち');
              Logger.log(`行${actualRow}: メールアドレスを設定しました`);
            } else {
              sh.getRange(actualRow, statusCol).setValue('❌メールアドレスなし');
            }
          }
        } catch (e) {
          Logger.log(`行${actualRow}のメールアドレス設定エラー: ${e.message}`);
        }
      }
      else if (status === '送信待ち' && email) {
        try {
          if (typeof processRow === 'function') {
            processRow(sh, actualRow);
            processedCount++;
          }
        } catch (e) {
          Logger.log(`行${actualRow}のメール送信エラー: ${e.message}`);
          sh.getRange(actualRow, statusCol).setValue('❌エラー：' + e.message);
        }
      }
    });
    
    if (processedCount > 0) {
      Logger.log(`${processedCount}件のメールを送信しました`);
    }
    
  } catch (e) {
    Logger.log('processPendingEmails エラー: ' + e.message);
  }
}

/** ===== 🆕 最新の体の画像URLを取得 ===== */
function tw_getLatestBodyImageUrls_(memberId) {
  try {
    const images = tw_api_getBodyImages(memberId);
    if (images.length === 0) return [];
    
    // 最新の記録の画像URLを返す
    return images[0].urls;
  } catch (e) {
    Logger.log('体の画像URL取得エラー: ' + e.message);
    return [];
  }
}

/** ===== processRow関数（完全修正版 - 画像リンク追加） ===== */
function processRow(sheet, rowNumber) {
  const row = rowNumber;
  const COL_STATUS = 28;
  
  try {
    sheet.getRange(row, COL_STATUS).setValue("処理開始… " + new Date().toLocaleString());
    SpreadsheetApp.flush();
    Logger.log(`=== 行${row}の処理開始 ===`);
    
    const COL_TIMESTAMP = 1;
    const COL_MEMBER = 3;
    const COL_STORE = 4;
    const COL_TRAINER = 5;
    const COL_BODY_PART = 9;
    const COL_MENU1 = 12;
    const COL_SET1 = 13;
    const COL_MENU2 = 14;
    const COL_SET2 = 15;
    const COL_MENU3 = 16;
    const COL_SET3 = 17;
    const COL_MENU4 = 18;
    const COL_SET4 = 19;
    const COL_MENU5 = 20;
    const COL_SET5 = 21;
    const COL_GOOD_POINT = 22;
    const COL_IMPROVE = 23;
    const COL_PAIN = 24;
    const COL_CONVERSATION = 25;
    const COL_EMAIL = 26;
    const COL_AI = 27;
    
    const ts = sheet.getRange(row, COL_TIMESTAMP).getValue();
    const memberRaw = sheet.getRange(row, COL_MEMBER).getValue();
    const store = sheet.getRange(row, COL_STORE).getValue();
    const trainer = sheet.getRange(row, COL_TRAINER).getValue();
    const bodyPart = sheet.getRange(row, COL_BODY_PART).getValue();
    const toEmail = sheet.getRange(row, COL_EMAIL).getValue();
    
    const goodPoint = String(sheet.getRange(row, COL_GOOD_POINT).getValue() || "").trim();
    const improve = String(sheet.getRange(row, COL_IMPROVE).getValue() || "").trim();
    const pain = String(sheet.getRange(row, COL_PAIN).getValue() || "").trim();
    const conversation = String(sheet.getRange(row, COL_CONVERSATION).getValue() || "").trim();
    
    const menus = [];
    const menuData = [
      { menu: sheet.getRange(row, COL_MENU1).getValue(), set: sheet.getRange(row, COL_SET1).getValue() },
      { menu: sheet.getRange(row, COL_MENU2).getValue(), set: sheet.getRange(row, COL_SET2).getValue() },
      { menu: sheet.getRange(row, COL_MENU3).getValue(), set: sheet.getRange(row, COL_SET3).getValue() },
      { menu: sheet.getRange(row, COL_MENU4).getValue(), set: sheet.getRange(row, COL_SET4).getValue() },
      { menu: sheet.getRange(row, COL_MENU5).getValue(), set: sheet.getRange(row, COL_SET5).getValue() }
    ];
    
    menuData.forEach(m => {
      const menuName = String(m.menu || "").trim();
      const setInfo = String(m.set || "").trim();
      if (menuName && setInfo) {
        menus.push({ menu: menuName, set: setInfo });
      }
    });
    
    Logger.log(`会員: ${memberRaw}, メール: ${toEmail}`);
    
    if (!toEmail || String(toEmail).trim() === '') {
      throw new Error('送信先メールが空です');
    }
    
    if (!memberRaw || String(memberRaw).trim() === '') {
      throw new Error('会員が空です');
    }
    
    const emailStr = String(toEmail).trim();
    if (!emailStr.includes('@')) {
      throw new Error(`メールアドレスが不正です: ${emailStr}`);
    }
    
    const memberName = extractMemberName_(memberRaw);
    const memberId = extractMemberId_(memberRaw);
    Logger.log(`会員名: ${memberName}, 会員ID: ${memberId}`);
    
    const goals2026 = get2026Goals_(memberId);
    
    // AI分析でフィードバックを生成
    let aiText = '';
    try {
      const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
      if (apiKey) {
        Logger.log('AI分析を実行します...');
        
        // メニュー情報を整形
        const menuLines = menus.map((m, idx) => {
          return `■ ${m.menu || "（メニュー名未入力）"}\n  ${m.set || "（回数/重量 未入力）"}`;
        }).join("\n");
        
        // プロンプトを構築（詳細版）
        const prompt = `あなたはAbodyのパーソナルトレーナーです。
会員様のモチベーションが最高に上がる、熱意あふれるフィードバックを作成してください。

【絶対条件】
- 日本語で400〜700文字
- 「AI」「自動生成」という単語は絶対に使わない
- 明るく前向きで、次も頑張ろう！と思える内容
- トレーナーが直接語りかけるような自然な文体
- メニュー内容に具体的に触れる
${!goodPoint ? "- 良かった点を1〜2つ具体的に褒める" : ""}
${!improve ? "- 改善アドバイスを1つ入れる" : ""}

【文章構成】
1. 今日のトレーニングの成果を褒める（具体的に）
2. 良かった点を詳しく（フォーム、回数、重量など）
3. 改善ポイントや次への提案
4. 前向きな締めの言葉

【会員情報】
お名前：${memberName}様
担当：${trainer}
店舗：${store}

【本日の内容】
部位：${bodyPart}
メニュー詳細：
${menuLines}

【トレーナーのフィードバック】
${goodPoint ? `【良かった点】\n${goodPoint}\n\n` : ''}${improve ? `【改善点・気付き】\n${improve}\n\n` : ''}${conversation ? `【会話の内容】\n${conversation}\n\n` : ''}${pain && pain !== 'なし' ? `【体の状態】\n痛みや違和感：${pain}\n\n` : ''}

---
上記を踏まえて、${memberName}様のモチベーションが爆上がりする熱いフィードバックを書いてください。
最後は必ず「次回も一緒に頑張りましょう！」のような前向きな締めで。`;
        
        // Gemini APIを呼び出し
        const model = "gemini-1.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        
        const payload = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            maxOutputTokens: 800,
            topK: 40
          }
        };
        
        const res = UrlFetchApp.fetch(url, {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(payload),
          muteHttpExceptions: true,
          timeout: 20000
        });
        
        const code = res.getResponseCode();
        const text = res.getContentText();
        
        if (code === 200) {
          const json = JSON.parse(text);
          aiText = json?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
          aiText = String(aiText).trim();
          
          if (!aiText || aiText.length < 200) {
            Logger.log(`⚠️ AI生成テキストが短すぎます（${aiText.length}文字）。再生成を試みます...`);
            // 短い場合は再試行（1回のみ）
            const retryRes = UrlFetchApp.fetch(url, {
              method: "post",
              contentType: "application/json",
              payload: JSON.stringify(payload),
              muteHttpExceptions: true,
              timeout: 20000
            });
            if (retryRes.getResponseCode() === 200) {
              const retryJson = JSON.parse(retryRes.getContentText());
              aiText = retryJson?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
              aiText = String(aiText).trim();
            }
            
            if (!aiText || aiText.length < 200) {
              throw new Error('AI生成テキストが短すぎます（再試行後も短い）');
            }
          }
          
          Logger.log(`✅ AI分析完了（${aiText.length}文字）`);
        } else {
          throw new Error(`Gemini API error ${code}: ${text.substring(0, 100)}`);
        }
      } else {
        throw new Error('GEMINI_API_KEYが設定されていません');
      }
    } catch (aiError) {
      Logger.log(`AI分析エラー: ${aiError.message}`);
      // エラー時はフォールバック（簡易テンプレート）
      aiText = `${memberName}様、本日もトレーニングお疲れさまでした！\n\n`;
    
    if (goodPoint) {
      aiText += `【良かった点】\n${goodPoint}\n\n`;
    }
    
    if (improve) {
      aiText += `【次回に向けて】\n${improve}\n\n`;
    }
    
    if (pain && pain !== 'なし') {
      aiText += `【体の状態】\n${pain}\n\n`;
    }
    
    if (conversation) {
      aiText += `【会話の内容】\n${conversation}\n\n`;
    }
    
    aiText += `今日は「${bodyPart || ""}」をしっかり追い込めましたね。この調子で継続していきましょう！`;
    }
    
    sheet.getRange(row, COL_AI).setValue(aiText);
    SpreadsheetApp.flush();
    Logger.log('AIフィードバック設定完了');
    
    const subject = `【Abody】${memberName}様、本日のトレーニングフィードバック`;
    const dateStr = formatDateJP_(ts);
    
    let body = `${memberName}様

本日もトレーニングお疲れさまでした！

担当：${trainer || ""}
実施日：${dateStr}
店舗：${store || ""}

【本日のトレーニング内容】
部位：${bodyPart || ""}
`;

    if (menus.length > 0) {
      body += '\n【実施メニュー】\n';
      menus.forEach((m, index) => {
        body += `${index + 1}. ${m.menu} - ${m.set}\n`;
      });
    }
    
    body += `
【トレーナーからのフィードバック】
${aiText}
`;

    // 🆕 目標写真と体の画像リンクを追加
    const targetPhotoUrl = tw_getTargetPhotoUrl_(memberId);
    const bodyImageUrls = tw_getLatestBodyImageUrls_(memberId);

    if (targetPhotoUrl || bodyImageUrls.length > 0) {
      body += '\n【参考画像】\n';
      if (targetPhotoUrl) {
        body += `🎯 目標写真: ${targetPhotoUrl}\n`;
      }
      if (bodyImageUrls.length > 0) {
        body += `📸 最新の体の写真:\n`;
        bodyImageUrls.forEach((url, index) => {
          body += `  ${index + 1}. ${url}\n`;
        });
      }
    }

    if (goals2026) {
      body += '\n【あなたの2026年目標】\n';
      if (goals2026.trainingContent) {
        body += `トレーニング内容：${goals2026.trainingContent}\n`;
      }
      if (goals2026.bodyMake1 || goals2026.bodyMake2 || goals2026.bodyMake3) {
        body += 'ボディメイク重点部位：\n';
        if (goals2026.bodyMake1) body += `  ① ${goals2026.bodyMake1}\n`;
        if (goals2026.bodyMake2) body += `  ② ${goals2026.bodyMake2}\n`;
        if (goals2026.bodyMake3) body += `  ③ ${goals2026.bodyMake3}\n`;
      }
      if (goals2026.numericGoal) {
        body += `数値目標：${goals2026.numericGoal}\n`;
      }
    }
    
    body += `
次回も一緒に頑張りましょう！

Abody ${store || ""}`;

    Logger.log(`メール送信開始: ${emailStr}`);
    GmailApp.sendEmail(emailStr, subject, body);
    Logger.log('メール送信完了');

    sheet.getRange(row, COL_STATUS).setValue("✅送信完了 " + new Date().toLocaleString());
    Logger.log(`=== 行${row}の処理完了 ===`);

  } catch (error) {
    const errorMsg = `❌エラー：${error.message}`;
    Logger.log(`行${row}のエラー: ${errorMsg}`);
    sheet.getRange(row, COL_STATUS).setValue(errorMsg);
  }
}

function extractMemberId_(memberRaw) {
  const s = String(memberRaw).trim();
  if (s.includes('|')) {
    const parts = s.split('|');
    return parts[0].trim();
  }
  return s;
}

function get2026Goals_(memberId) {
  try {
    const goalInfo = tw_getGoalInfo_(memberId);
    if (!goalInfo) return null;
    
    return {
      trainingContent: goalInfo.trainingContent || "",
      bodyMake1: goalInfo.bodyMake1 || "",
      bodyMake2: goalInfo.bodyMake2 || "",
      bodyMake3: goalInfo.bodyMake3 || "",
      numericGoal: goalInfo.numericGoal || ""
    };
  } catch (e) {
    Logger.log('2026年目標取得エラー: ' + e.message);
    return null;
  }
}

function extractMemberName_(memberRaw) {
  const s = String(memberRaw).trim();
  if (s.includes('|')) {
    const parts = s.split('|');
    return (parts[1] || "").trim().replace(/様/g, "");
  }
  return s.replace(/様/g, "");
}

function formatDateJP_(v) {
  const d = (v instanceof Date) ? v : new Date(v);
  if (isNaN(d.getTime())) return String(v);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}年${m}月${day}日`;
}

function testProcessRow2() {
  try {
    const SPREADSHEET_ID = "1CJ1PrsAwW_yohmw0NB7viOUaeKIP6qQFmRQhHstjtiE";
    const SHEET_NAME = "フォームの回答 1";
    
    const sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    Logger.log('シート取得成功');
    Logger.log('行2の処理を開始します');
    processRow(sh, 2);
    Logger.log('処理完了');
  } catch (e) {
    Logger.log('エラー: ' + e.message);
    Logger.log('スタック: ' + e.stack);
  }
}

/** ========================================
 * 体の画像記録システム
 * ======================================== */

function getOrCreateDriveFolder_() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function getOrCreateMemberFolder_(memberId, memberName) {
  const parentFolder = getOrCreateDriveFolder_();
  const folderName = `${memberId}_${memberName}`;
  
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

function uploadImageToDrive_(memberId, memberName, imageData, fileName) {
  try {
    const blob = Utilities.newBlob(
      Utilities.base64Decode(imageData),
      'image/jpeg',
      fileName
    );
    
    const folder = getOrCreateMemberFolder_(memberId, memberName);
    const file = folder.createFile(blob);
    
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
  } catch (e) {
    Logger.log('画像アップロードエラー: ' + e.message);
    throw new Error('画像のアップロードに失敗しました: ' + e.message);
  }
}

function tw_api_saveBodyImages(data) {
  try {
    if (!data || !data.memberId || !data.images || data.images.length === 0) {
      return { success: false, message: '必要なデータが不足しています' };
    }
    
    const sh = tw_getSheet_(TW_SHEETS.BODY_IMAGES);
    const header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    
    const imageUrls = [];
    data.images.forEach((imgData, index) => {
      const fileName = `${data.memberId}_${data.shootingDate}_${index + 1}.jpg`;
      const url = uploadImageToDrive_(data.memberId, data.memberName, imgData, fileName);
      imageUrls.push(url);
    });
    
    const newRow = [
      new Date(),
      data.memberId,
      data.memberName,
      data.shootingDate,
      imageUrls[0] || '',
      imageUrls[1] || '',
      imageUrls[2] || '',
      data.memo || ''
    ];
    
    sh.appendRow(newRow);
    
    return { 
      success: true, 
      message: '画像を保存しました',
      imageUrls: imageUrls
    };
    
  } catch (e) {
    Logger.log('画像保存エラー: ' + e.message);
    return { success: false, message: e.toString() };
  }
}

function tw_api_getBodyImages(memberId) {
  try {
    Logger.log(`=== tw_api_getBodyImages called for member: ${memberId} ===`);
    const sh = tw_getSheet_(TW_SHEETS.BODY_IMAGES);
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    
    Logger.log(`Sheet found. Last row: ${lastRow}, Last col: ${lastCol}`);
    
    if (lastRow < 2) {
      Logger.log('No data in sheet (lastRow < 2)');
      return [];
    }
    
    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
    Logger.log(`Header: ${JSON.stringify(header)}`);
    
    const colMemberId = tw_findColByHeader_(header, ['member_id', '会員ID']);
    const colShootingDate = tw_findColByHeader_(header, ['撮影日']);
    const colImage1 = tw_findColByHeader_(header, ['画像URL1']);
    const colImage2 = tw_findColByHeader_(header, ['画像URL2']);
    const colImage3 = tw_findColByHeader_(header, ['画像URL3']);
    const colMemo = tw_findColByHeader_(header, ['メモ']);
    
    Logger.log(`Column indices - member_id: ${colMemberId}, shootingDate: ${colShootingDate}, image1: ${colImage1}`);
    
    if (!colMemberId) {
      Logger.log('member_id column not found');
      return [];
    }
    
    const images = [];
    values.forEach((r, index) => {
      const id = String(r[colMemberId - 1] || '').trim();
      Logger.log(`Row ${index + 2}: member_id = ${id}`);
      
      if (id !== memberId) return;
      
      Logger.log(`Match found at row ${index + 2}`);
      
      const shootingDate = r[colShootingDate - 1];
      const urls = [
        colImage1 ? String(r[colImage1 - 1] || '').trim() : '',
        colImage2 ? String(r[colImage2 - 1] || '').trim() : '',
        colImage3 ? String(r[colImage3 - 1] || '').trim() : ''
      ].filter(url => url !== '');
      
      Logger.log(`URLs found: ${urls.length}`);
      
      if (urls.length > 0) {
        const dateObj = tw_toDate_(shootingDate);
        images.push({
          date: tw_formatDate_(dateObj),
          dateRaw: dateObj ? dateObj.getTime() : 0,
          urls: urls,
          memo: colMemo ? String(r[colMemo - 1] || '').trim() : ''
        });
      }
    });
    
    Logger.log(`Total images found: ${images.length}`);
    
    images.sort((a, b) => b.dateRaw - a.dateRaw);
    
    return images;
    
  } catch (e) {
    Logger.log('画像取得エラー: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return [];
  }
}

function tw_api_checkPhotoAlert(memberId) {
  try {
    const images = tw_api_getBodyImages(memberId);
    
    if (images.length === 0) {
      return {
        hasAlert: true,
        daysSinceLastPhoto: null,
        lastPhotoDate: null,
        message: '📸 まだ体の写真が撮影されていません'
      };
    }
    
    const lastPhoto = images[0];
    const lastPhotoDate = lastPhoto.dateRaw ? new Date(lastPhoto.dateRaw) : null;
    
    if (!lastPhotoDate) {
      return {
        hasAlert: false,
        daysSinceLastPhoto: null,
        lastPhotoDate: null,
        message: ''
      };
    }
    
    const now = new Date();
    const daysSince = Math.floor((now - lastPhotoDate) / (1000 * 60 * 60 * 24));
    
    return {
      hasAlert: daysSince >= DAYS_WITHOUT_PHOTO_ALERT,
      daysSinceLastPhoto: daysSince,
      lastPhotoDate: tw_formatDate_(lastPhotoDate),
      message: daysSince >= DAYS_WITHOUT_PHOTO_ALERT 
        ? `📸 最後の撮影から${daysSince}日経過しています。撮影を推奨します。`
        : `前回撮影：${daysSince}日前`
    };
    
  } catch (e) {
    Logger.log('写真アラートチェックエラー: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return {
      hasAlert: false,
      daysSinceLastPhoto: null,
      lastPhotoDate: null,
      message: ''
    };
  }
}

function tw_api_deleteBodyImageRecord(memberId, shootingDate) {
  try {
    if (!memberId || !shootingDate) {
      return { success: false, deletedCount: 0, message: 'memberIdとshootingDateが必要です' };
    }
    
    Logger.log(`=== tw_api_deleteBodyImageRecord called ===`);
    Logger.log(`memberId: ${memberId}, shootingDate: ${shootingDate}`);
    
    const sh = tw_getSheet_(TW_SHEETS.BODY_IMAGES);
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    
    if (lastRow < 2) {
      return { success: true, deletedCount: 0, message: '削除するデータがありません' };
    }
    
    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
    const colMemberId = tw_findColByHeader_(header, ['member_id', '会員ID']);
    const colShootingDate = tw_findColByHeader_(header, ['撮影日']);
    
    if (!colMemberId || !colShootingDate) {
      return { success: false, deletedCount: 0, message: '必要な列が見つかりません' };
    }
    
    // shootingDateをDateオブジェクトに変換（文字列形式 YYYY-MM-DD または dateRaw タイムスタンプをサポート）
    let targetDate = null;
    if (typeof shootingDate === 'number' || (typeof shootingDate === 'string' && /^\d+$/.test(shootingDate))) {
      // dateRaw（タイムスタンプ）の場合
      targetDate = new Date(parseInt(shootingDate));
    } else {
      // 文字列形式（YYYY-MM-DDなど）の場合
      targetDate = tw_toDate_(shootingDate);
    }
    
    if (!targetDate || isNaN(targetDate.getTime())) {
      return { success: false, deletedCount: 0, message: '無効な日付形式です' };
    }
    
    // 削除する行番号を収集（下から削除するため、降順でソート）
    const rowsToDelete = [];
    
    values.forEach((r, index) => {
      const id = String(r[colMemberId - 1] || '').trim();
      if (id !== memberId) return;
      
      const rowShootingDate = tw_toDate_(r[colShootingDate - 1]);
      if (!rowShootingDate) return;
      
      // 日付を比較（時間部分を無視して日付のみで比較）
      const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const rowDateOnly = new Date(rowShootingDate.getFullYear(), rowShootingDate.getMonth(), rowShootingDate.getDate());
      
      if (targetDateOnly.getTime() === rowDateOnly.getTime()) {
        rowsToDelete.push(index + 2); // 実際の行番号（ヘッダー行の下から開始）
      }
    });
    
    if (rowsToDelete.length === 0) {
      return { success: true, deletedCount: 0, message: '一致するデータが見つかりませんでした' };
    }
    
    // 下から削除（行番号がずれないように）
    rowsToDelete.sort((a, b) => b - a);
    
    rowsToDelete.forEach(rowNum => {
      sh.deleteRow(rowNum);
      Logger.log(`Deleted row ${rowNum}`);
    });
    
    Logger.log(`Deleted ${rowsToDelete.length} row(s)`);
    
    return { 
      success: true, 
      deletedCount: rowsToDelete.length, 
      message: `${rowsToDelete.length}件の記録を削除しました` 
    };
    
  } catch (e) {
    Logger.log('画像削除エラー: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return { success: false, deletedCount: 0, message: e.toString() };
  }
}

/** ===== テスト関数: 目標情報取得 ===== */
function testGoalInfo() {
  const memberId = "SAK001"; // ← 実際の会員IDに変更してください
  Logger.log(`=== 目標情報テスト開始: ${memberId} ===`);
  
  const result = tw_getGoalInfo_(memberId);
  
  Logger.log('=== 取得結果 ===');
  Logger.log(JSON.stringify(result, null, 2));
  
  Logger.log('=== テスト完了 ===');
  return result;
}

function testGoalInfo_TW() {
  // テスト対象の会員ID（変更可能）
  const memberId = "SAK001";
  const r = tw_getGoalInfo_(memberId);
  Logger.log(JSON.stringify(r, null, 2));
}

/** ===== テスト関数: 目標写真URL取得 ===== */
function testTargetPhotoUrl_TW() {
  // テスト対象の会員ID（変更可能）
  const memberId = "SAK001";
  const url = tw_getTargetPhotoUrl_(memberId);
  Logger.log(`目標写真URL: ${url}`);
}

/** ===== テスト関数: サマリー取得（進捗プラン確認用） ===== */
function testGetSummary() {
  // テスト対象の会員ID（変更可能）
  const memberId = "SAK015";
  
  Logger.log(`=== サマリー取得テスト開始: ${memberId} ===`);
  
  const result = tw_api_getSummary(memberId);
  
  Logger.log('=== テスト結果 ===');
  Logger.log(`progressPlan.hasPlan: ${result.progressPlan?.hasPlan}`);
  Logger.log(`progressPlan: ${JSON.stringify(result.progressPlan, null, 2)}`);
  Logger.log(`ai2026.currentWeight: ${result.ai2026?.currentWeight}`);
  Logger.log(`ai2026.targetWeight: ${result.ai2026?.targetWeight}`);
  Logger.log(`ai2026.bodyMakeWeight: ${result.ai2026?.bodyMakeWeight}`);
  Logger.log(`ai2026.numericGoal: ${result.ai2026?.numericGoal}`);
  
  Logger.log('=== テスト完了 ===');
}

/** ===== テスト関数: 2026年目標全体（GoalInfo + AI2026） ===== */
function test2026Goals_TW() {
  // テスト対象の会員ID（変更可能）
  const memberId = "SAK001";
  
  Logger.log(`=== 2026年目標テスト開始: ${memberId} ===`);
  
  const goalInfo = tw_getGoalInfo_(memberId);
  Logger.log('【GoalInfo】');
  Logger.log(JSON.stringify(goalInfo, null, 2));
  
  const ai2026 = tw_getAi2026_(memberId);
  Logger.log('【AI2026】');
  Logger.log(JSON.stringify(ai2026, null, 2));
  
  const targetPhotoUrl = tw_getTargetPhotoUrl_(memberId);
  Logger.log(`【目標写真URL】: ${targetPhotoUrl}`);
  
  Logger.log('=== テスト完了 ===');
}

/** ===== API: 評価結果を取得 ===== */
function tw_api_getRatings(memberId, limit) {
  try {
    // コード.jsのfb_api_getRatings関数を呼び出す
    const result = fb_api_getRatings(memberId, limit || 10);
    if (result.success) {
      return result.ratings || [];
    }
    return [];
  } catch (error) {
    Logger.log(`評価取得エラー: ${error.message}`);
    return [];
  }
}

/** ===== 1月・2月入会者リスト ===== */
function tw_listJanFebEnrollments() {
  try {
    const sh = tw_getSheet_(TW_SHEETS.MEMBERS);
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    if (lastRow < 2) {
      Logger.log('会員データがありません');
      return;
    }
    
    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
    // 列を検索（固定列番号を使用）
    const colId = tw_findColByHeader_(header, TW_HEADERS.member_id) || 1;
    const colName = tw_findColByHeader_(header, TW_HEADERS.member_name) || 2;
    const colSalesPerson = 5; // E列（固定：営業担当）
    const colEnrollmentDate = 8; // H列（固定）
    const colContractPeriod = 15; // O列（固定）
    const colStatus = 13; // M列（固定）
    
    Logger.log(`列番号: ID=${colId}, 名前=${colName}, 営業担当=${colSalesPerson}(E列), 入会日=${colEnrollmentDate}(H列), 入会/退会=${colStatus}(M列), 最低継続期間=${colContractPeriod}(O列)`);
    
    const currentYear = new Date().getFullYear();
    const janStart = new Date(currentYear, 0, 1); // 1月1日
    const marStart = new Date(currentYear, 2, 1); // 3月1日
    
    const enrollments = [];
    
    values.forEach((row, index) => {
      const actualRow = index + 2;
      const status = String(row[colStatus - 1] ?? "").trim();
      
      // 「入会」の会員のみを対象
      if (status !== '入会' && status !== '') {
        return;
      }
      
      const enrollmentDateValue = row[colEnrollmentDate - 1];
      if (!enrollmentDateValue) return;
      
      let enrollmentDate;
      if (enrollmentDateValue instanceof Date) {
        enrollmentDate = enrollmentDateValue;
      } else {
        const dateStr = String(enrollmentDateValue).trim();
        // 「1/5」「2/3」などの形式に対応
        if (dateStr.match(/^\d{1,2}\/\d{1,2}$/)) {
          const [month, day] = dateStr.split('/').map(Number);
          const currentYear = new Date().getFullYear();
          enrollmentDate = new Date(currentYear, month - 1, day);
        } else {
          enrollmentDate = new Date(enrollmentDateValue);
        }
      }
      
      if (isNaN(enrollmentDate.getTime())) {
        Logger.log(`行${actualRow}: 入会日の解析に失敗: ${enrollmentDateValue}`);
        return;
      }
      
      // 1月または2月に入会した人を抽出
      if (enrollmentDate >= janStart && enrollmentDate < marStart) {
        const memberId = String(row[colId - 1] ?? "").trim();
        const memberName = String(row[colName - 1] ?? "").trim();
        const salesPerson = String(row[colSalesPerson - 1] ?? "").trim();
        const contractPeriod = colContractPeriod ? String(row[colContractPeriod - 1] ?? "").trim() : '';
        
        const enrollmentMonth = enrollmentDate.getMonth() + 1; // 1月=1, 2月=2
        const enrollmentDay = enrollmentDate.getDate();
        
        enrollments.push({
          memberId,
          memberName,
          salesPerson,
          enrollmentDate: enrollmentDate,
          enrollmentMonth,
          enrollmentDay,
          contractPeriod,
          row: actualRow
        });
      }
    });
    
    // 入会月、入会日でソート
    enrollments.sort((a, b) => {
      if (a.enrollmentMonth !== b.enrollmentMonth) {
        return a.enrollmentMonth - b.enrollmentMonth;
      }
      return a.enrollmentDay - b.enrollmentDay;
    });
    
    // 結果をログ出力
    Logger.log('=== 1月・2月入会者リスト ===');
    Logger.log(`合計人数: ${enrollments.length}名`);
    
    let totalContractMonths = 0;
    
    enrollments.forEach((e, index) => {
      const dateStr = `${e.enrollmentMonth}月${e.enrollmentDay}日`;
      const periodStr = e.contractPeriod || '未設定';
      const salesStr = e.salesPerson || '未設定';
      
      // 契約期間を月数に変換（「3ヶ月」「6ヶ月」などの形式を想定）
      let months = 0;
      if (e.contractPeriod) {
        const match = String(e.contractPeriod).match(/(\d+)/);
        if (match) {
          months = parseInt(match[1]);
        }
      }
      totalContractMonths += months;
      
      Logger.log(`${index + 1}. ${e.memberId} | ${e.memberName} | ${salesStr} | ${dateStr} | ${periodStr}`);
    });
    
    Logger.log(`\n合計契約期間: ${totalContractMonths}ヶ月`);
    Logger.log(`平均契約期間: ${enrollments.length > 0 ? (totalContractMonths / enrollments.length).toFixed(1) : 0}ヶ月`);
    
    // スプレッドシートに結果を出力（新しいシートを作成）
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let resultSheet = ss.getSheetByName('1-2月入会者リスト');
    if (!resultSheet) {
      resultSheet = ss.insertSheet('1-2月入会者リスト');
    } else {
      resultSheet.clear();
    }
    
    // ヘッダー
    resultSheet.getRange(1, 1, 1, 7).setValues([[
      '順位', '会員ID', '会員名', '営業担当', '入会日', '入会月', '最低継続期間'
    ]]);
    
    // データ
    if (enrollments.length > 0) {
      const data = enrollments.map((e, index) => {
        const dateStr = `${e.enrollmentMonth}月${e.enrollmentDay}日`;
        return [
          index + 1,
          e.memberId,
          e.memberName,
          e.salesPerson || '未設定',
          dateStr,
          e.enrollmentMonth + '月',
          e.contractPeriod || '未設定'
        ];
      });
      
      resultSheet.getRange(2, 1, enrollments.length, 7).setValues(data);
      
      // 合計行
      const summaryRow = enrollments.length + 3;
      resultSheet.getRange(summaryRow, 1).setValue('合計');
      resultSheet.getRange(summaryRow, 2).setValue(`${enrollments.length}名`);
      resultSheet.getRange(summaryRow, 5).setValue('合計契約期間');
      resultSheet.getRange(summaryRow, 6).setValue(`${totalContractMonths}ヶ月`);
      
      // 平均行
      const avgRow = enrollments.length + 4;
      resultSheet.getRange(avgRow, 5).setValue('平均契約期間');
      resultSheet.getRange(avgRow, 6).setValue(`${enrollments.length > 0 ? (totalContractMonths / enrollments.length).toFixed(1) : 0}ヶ月`);
      
      // 書式設定
      resultSheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      resultSheet.getRange(summaryRow, 1, 1, 7).setFontWeight('bold');
      resultSheet.setFrozenRows(1);
    }
    
    Logger.log('✅ 結果を「1-2月入会者リスト」シートに出力しました');
    
    // メール送信
    try {
      // 送信先メールアドレス（スプレッドシートの所有者）
      const recipientEmail = ss.getOwner().getEmail();
      Logger.log(`📧 送信先メールアドレス: ${recipientEmail}`);
      
      const monthStr = `${currentYear}年1月・2月`;
      const subject = `【Abody】${monthStr} 入会者リスト`;
      
      // HTMLメール本文を作成
      let tableRows = '';
      enrollments.forEach((e, index) => {
        const dateStr = `${e.enrollmentMonth}月${e.enrollmentDay}日`;
        tableRows += `
          <tr>
            <td>${index + 1}</td>
            <td>${e.memberId}</td>
            <td>${e.memberName}</td>
            <td>${e.salesPerson || '未設定'}</td>
            <td>${dateStr}</td>
            <td>${e.enrollmentMonth}月</td>
            <td>${e.contractPeriod || '未設定'}</td>
          </tr>
        `;
      });
      
      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .summary { background: #f5f5f5; padding: 20px; border-left: 4px solid #DC143C; }
            .summary-item { margin: 8px 0; font-size: 16px; }
            .summary-item strong { color: #DC143C; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
            th { background: #DC143C; color: white; padding: 12px; text-align: left; font-weight: 700; }
            td { padding: 10px 12px; border-bottom: 1px solid #ddd; }
            tr:hover { background: #f9f9f9; }
            .footer { margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 0 0 8px 8px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${monthStr} 入会者リスト</h1>
          </div>
          <div class="summary">
            <div class="summary-item"><strong>合計人数:</strong> ${enrollments.length}名</div>
            <div class="summary-item"><strong>合計契約期間:</strong> ${totalContractMonths}ヶ月</div>
            <div class="summary-item"><strong>平均契約期間:</strong> ${enrollments.length > 0 ? (totalContractMonths / enrollments.length).toFixed(1) : 0}ヶ月</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>順位</th>
                <th>会員ID</th>
                <th>会員名</th>
                <th>営業担当</th>
                <th>入会日</th>
                <th>入会月</th>
                <th>最低継続期間</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            <p>Abody</p>
            <p>このメールは自動生成されました。</p>
          </div>
        </body>
        </html>
      `;
      
      // プレーンテキスト版
      const plainTextBody = `
【${monthStr} 入会者リスト】

合計人数: ${enrollments.length}名
合計契約期間: ${totalContractMonths}ヶ月
平均契約期間: ${enrollments.length > 0 ? (totalContractMonths / enrollments.length).toFixed(1) : 0}ヶ月

━━━━━━━━━━━━━━━━
【入会者一覧】
順位 | 会員ID | 会員名 | 営業担当 | 入会日 | 入会月 | 最低継続期間
━━━━━━━━━━━━━━━━
${enrollments.map((e, index) => {
  const dateStr = `${e.enrollmentMonth}月${e.enrollmentDay}日`;
  return `${index + 1} | ${e.memberId} | ${e.memberName} | ${e.salesPerson || '未設定'} | ${dateStr} | ${e.enrollmentMonth}月 | ${e.contractPeriod || '未設定'}`;
}).join('\n')}
━━━━━━━━━━━━━━━━

Abody
      `.trim();
      
      GmailApp.sendEmail(recipientEmail, subject, plainTextBody, {
        htmlBody: htmlBody
      });
      
      Logger.log(`✅ メール送信完了: ${recipientEmail}`);
    } catch (emailError) {
      Logger.log(`⚠️ メール送信エラー: ${emailError.message}`);
    }
    
  } catch (e) {
    Logger.log('❌ エラー: ' + e.message);
    Logger.log('スタック: ' + e.stack);
  }
}

/** ===== 1月分析・2月提案 ===== */
function tw_api_analyzeJanuaryAndPlanFebruary(memberId) {
  try {
    Logger.log(`=== tw_api_analyzeJanuaryAndPlanFebruary called for member: ${memberId} ===`);
    
    if (!memberId) {
      return { success: false, message: '会員IDが指定されていません' };
    }
    
    // 1月のトレーニング記録を取得
    const januaryRecords = tw_getJanuaryTrainingRecords_(memberId);
    Logger.log(`1月の記録数: ${januaryRecords.length}`);
    
    if (januaryRecords.length === 0) {
      return {
        success: false,
        message: '1月のトレーニング記録が見つかりませんでした'
      };
    }
    
    // 会員情報と目標情報を取得
    const memberInfo = tw_getMemberInfo_(memberId);
    const ai2026 = tw_getAi2026_(memberId);
    const goals2026 = get2026Goals_(memberId);
    
    // 統計情報を計算
    const stats = tw_calculateJanuaryStats_(januaryRecords);
    
    // AI分析を実行
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      return { success: false, message: 'GEMINI_API_KEYが設定されていません' };
    }
    
    // 1月の成長分析
    const januaryAnalysis = tw_analyzeJanuaryGrowth_(apiKey, memberInfo, januaryRecords, stats, ai2026, goals2026);
    
    // 2月の進め方
    const februaryPlan = tw_planFebruary_(apiKey, memberInfo, januaryRecords, stats, ai2026, goals2026, januaryAnalysis);
    
    // セッション計画と成長予測
    const sessionPlan = tw_planSessionsAndGrowth_(apiKey, memberInfo, stats, ai2026, goals2026);
    
    return {
      success: true,
      data: {
        januaryAnalysis,
        februaryPlan,
        sessionPlan,
        stats
      }
    };
    
  } catch (e) {
    Logger.log('❌ 1月分析エラー: ' + e.message);
    Logger.log('スタック: ' + e.stack);
    return { success: false, message: e.message };
  }
}

/** 1月のトレーニング記録を取得 */
function tw_getJanuaryTrainingRecords_(memberId) {
  try {
    Logger.log(`1月記録取得開始: memberId=${memberId}`);
    const sh = tw_getSheet_(TW_SHEETS.SESSIONS); // TRAININGではなくSESSIONSを使用
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    
    Logger.log(`シート: ${TW_SHEETS.SESSIONS}, 最終行: ${lastRow}, 最終列: ${lastCol}`);
    
    if (lastRow < 2) {
      Logger.log('データがありません（lastRow < 2）');
      return [];
    }
    
    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const values = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
    // 会員ID列を検索（member_id列を優先、なければ会員列を使用）
    const colMemberId = tw_findColByHeader_(header, ["member_id"]);
    const colMember = tw_findColByHeader_(header, TW_HEADERS.session_member_id) || TW_FALLBACK.SESSION_MEMBER_ID_COL;
    const colTimestamp = tw_findColByHeader_(header, TW_HEADERS.session_ts) || TW_FALLBACK.SESSION_TIMESTAMP_COL;
    
    Logger.log(`列番号: member_id=${colMemberId}, member=${colMember}, timestamp=${colTimestamp}`);
    
    if (!colMember && !colMemberId) {
      Logger.log('会員列が見つかりません');
      return [];
    }
    
    const januaryStart = new Date(2026, 0, 1); // 2026年1月1日
    const februaryStart = new Date(2026, 1, 1); // 2026年2月1日
    
    Logger.log(`検索期間: ${januaryStart.toLocaleDateString()} ～ ${februaryStart.toLocaleDateString()}`);
    
    const records = [];
    values.forEach((row, index) => {
      let id = "";
      
      // member_id列を優先
      if (colMemberId) {
        id = String(row[colMemberId - 1] ?? "").trim();
      }
      
      // member_id列がない場合は会員列から抽出
      if (!id && colMember) {
        const idRaw = String(row[colMember - 1] ?? "").trim();
        // 半角・全角パイプの両方に対応
        id = idRaw.includes('|') ? idRaw.split('|')[0].trim() : 
             idRaw.includes('｜') ? idRaw.split('｜')[0].trim() : idRaw;
      }
      
      if (!id || id !== memberId) return;
      
      const timestamp = row[colTimestamp - 1];
      if (!timestamp) return;
      
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) {
        Logger.log(`行${index + 2}: 日時解析失敗: ${timestamp}`);
        return;
      }
      
      // 1月の記録のみ
      if (date >= januaryStart && date < februaryStart) {
        Logger.log(`行${index + 2}: 1月の記録を発見 - ${date.toLocaleDateString()}`);
        records.push({
          date: date,
          row: index + 2,
          data: row,
          header: header
        });
      }
    });
    
    Logger.log(`1月の記録数: ${records.length}件`);
    
    // 日付順にソート（古い順）
    records.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return records;
  } catch (e) {
    Logger.log('1月記録取得エラー: ' + e.message);
    Logger.log('スタック: ' + e.stack);
    return [];
  }
}

/** 1月の統計を計算 */
function tw_calculateJanuaryStats_(records) {
  if (records.length === 0) {
    Logger.log('統計計算: 記録が0件');
    return { sessionCount: 0 };
  }
  
  Logger.log(`統計計算開始: ${records.length}件の記録`);
  const header = records[0].header;
  
  // 体重・体脂肪率の列を検索（複数の候補を試す）
  const colWeight = tw_findColByHeader_(header, ['weight', '体重', '体重（kg）', '体重(kg)', '体重kg']) || 
                    tw_findColByHeader_(header, ['体組成_体重']);
  const colBodyFat = tw_findColByHeader_(header, ['bodyfat', '体脂肪率', 'body_fat', '体脂肪率（%）', '体脂肪率(%)']) ||
                     tw_findColByHeader_(header, ['体組成_体脂肪率']);
  
  Logger.log(`列番号: weight=${colWeight}, bodyFat=${colBodyFat}`);
  
  let firstWeight = null;
  let lastWeight = null;
  let firstBodyFat = null;
  let lastBodyFat = null;
  
  records.forEach((record, idx) => {
    if (colWeight) {
      const weightValue = record.data[colWeight - 1];
      const weight = typeof weightValue === 'number' ? weightValue : parseFloat(weightValue);
      if (!isNaN(weight) && weight > 0) {
        if (firstWeight === null) {
          firstWeight = weight;
          Logger.log(`最初の体重: ${weight}kg (行${record.row})`);
        }
        lastWeight = weight;
      }
    }
    
    if (colBodyFat) {
      const bodyFatValue = record.data[colBodyFat - 1];
      const bodyFat = typeof bodyFatValue === 'number' ? bodyFatValue : parseFloat(bodyFatValue);
      if (!isNaN(bodyFat) && bodyFat > 0) {
        if (firstBodyFat === null) {
          firstBodyFat = bodyFat;
          Logger.log(`最初の体脂肪率: ${bodyFat}% (行${record.row})`);
        }
        lastBodyFat = bodyFat;
      }
    }
  });
  
  const stats = {
    sessionCount: records.length,
    weightChange: firstWeight !== null && lastWeight !== null ? (lastWeight - firstWeight) : null,
    bodyFatChange: firstBodyFat !== null && lastBodyFat !== null ? (lastBodyFat - firstBodyFat) : null,
    firstWeight,
    lastWeight,
    firstBodyFat,
    lastBodyFat
  };
  
  Logger.log(`統計計算完了: ${JSON.stringify(stats)}`);
  return stats;
}

/** 1月の成長をAI分析 */
function tw_analyzeJanuaryGrowth_(apiKey, memberInfo, records, stats, ai2026, goals2026) {
  try {
    // 記録を要約
    const recordSummary = records.map((r, idx) => {
      const header = r.header;
      const colBodyPart = tw_findColByHeader_(header, TW_HEADERS.session_body_part) || TW_FALLBACK.SESSION_BODY_PART_COL;
      const colMenu1 = tw_findColByHeader_(header, TW_HEADERS.menu1);
      const colGoodPoint = tw_findColByHeader_(header, ['good_point', '良かった点', '良かったポイント']);
      const colImprove = tw_findColByHeader_(header, ['improve', '改善点', '改善ポイント', '気付き']);
      
      return {
        date: tw_formatDate_(r.date),
        bodyPart: colBodyPart ? String(r.data[colBodyPart - 1] || '') : '',
        menu1: colMenu1 ? String(r.data[colMenu1 - 1] || '') : '',
        goodPoint: colGoodPoint ? String(r.data[colGoodPoint - 1] || '') : '',
        improve: colImprove ? String(r.data[colImprove - 1] || '') : ''
      };
    }).slice(0, 20); // 最大20件
    
    const prompt = `あなたはAbodyのパーソナルトレーナーです。
${memberInfo?.name || '会員'}様の2026年1月のトレーニング記録を分析し、成長したポイントを具体的にまとめてください。

【会員情報】
名前: ${memberInfo?.name || '不明'}
${ai2026?.currentWeight ? `現在の体重: ${ai2026.currentWeight}kg` : ''}
${ai2026?.currentBodyFat ? `現在の体脂肪率: ${ai2026.currentBodyFat}%` : ''}

【1月の統計】
セッション回数: ${stats.sessionCount}回
${stats.weightChange !== null ? `体重変化: ${stats.weightChange > 0 ? '+' : ''}${stats.weightChange}kg` : ''}
${stats.bodyFatChange !== null ? `体脂肪率変化: ${stats.bodyFatChange > 0 ? '+' : ''}${stats.bodyFatChange}%` : ''}

【1月のトレーニング記録（${recordSummary.length}件）】
${recordSummary.map((r, i) => `${i + 1}. ${r.date} - 部位: ${r.bodyPart}, メニュー: ${r.menu1}${r.goodPoint ? `, 良かった点: ${r.goodPoint}` : ''}${r.improve ? `, 改善点: ${r.improve}` : ''}`).join('\n')}

【2026年目標】
${goals2026?.targetText || ai2026?.numericGoal || '目標未設定'}

---
上記の情報を基に、以下の観点で1月の成長ポイントを分析してください：
1. トレーニング頻度と継続性
2. 部位別のトレーニングバランス
3. 良かった点の傾向
4. 改善点の傾向
5. 体組成データの変化（体重・体脂肪率）
6. 目標への進捗度

400-600文字で、具体的で前向きな分析を書いてください。`;

    const result = tw_callGeminiForGoalAnalysis_(apiKey, prompt);
    return result.ok ? result.data.ai_text || result.raw : '分析に失敗しました';
    
  } catch (e) {
    Logger.log('1月成長分析エラー: ' + e.message);
    return '分析中にエラーが発生しました: ' + e.message;
  }
}

/** 2月の進め方をAIで作成 */
function tw_planFebruary_(apiKey, memberInfo, records, stats, ai2026, goals2026, januaryAnalysis) {
  try {
    const prompt = `あなたはAbodyのパーソナルトレーナーです。
${memberInfo?.name || '会員'}様の2026年2月のトレーニング計画を作成してください。

【会員情報】
名前: ${memberInfo?.name || '不明'}
${ai2026?.currentWeight ? `現在の体重: ${ai2026.currentWeight}kg` : ''}
${ai2026?.currentBodyFat ? `現在の体脂肪率: ${ai2026.currentBodyFat}%` : ''}
${ai2026?.targetWeight ? `目標体重: ${ai2026.targetWeight}kg` : ''}
${ai2026?.targetBodyFat ? `目標体脂肪率: ${ai2026.targetBodyFat}%` : ''}

【1月の実績】
セッション回数: ${stats.sessionCount}回
${stats.weightChange !== null ? `体重変化: ${stats.weightChange > 0 ? '+' : ''}${stats.weightChange}kg` : ''}
${stats.bodyFatChange !== null ? `体脂肪率変化: ${stats.bodyFatChange > 0 ? '+' : ''}${stats.bodyFatChange}%` : ''}

【1月の成長分析】
${januaryAnalysis}

【2026年目標】
${goals2026?.targetText || ai2026?.numericGoal || '目標未設定'}

---
上記を踏まえて、2月のトレーニング進め方を具体的に提案してください：
1. 推奨セッション頻度（週何回）
2. 重点的に取り組む部位
3. 1月の改善点を活かしたトレーニング内容
4. 目標体系に近づくための具体的なアプローチ
5. 食事や生活習慣のアドバイス（必要に応じて）

400-600文字で、実践的で前向きな提案を書いてください。`;

    const result = tw_callGeminiForGoalAnalysis_(apiKey, prompt);
    return result.ok ? result.data.ai_text || result.raw : '計画作成に失敗しました';
    
  } catch (e) {
    Logger.log('2月計画作成エラー: ' + e.message);
    return '計画作成中にエラーが発生しました: ' + e.message;
  }
}

/** セッション計画と成長予測をAIで作成 */
function tw_planSessionsAndGrowth_(apiKey, memberInfo, stats, ai2026, goals2026) {
  try {
    const prompt = `あなたはAbodyのパーソナルトレーナーです。
${memberInfo?.name || '会員'}様のセッション計画と成長予測を作成してください。

【会員情報】
名前: ${memberInfo?.name || '不明'}
${ai2026?.currentWeight ? `現在の体重: ${ai2026.currentWeight}kg` : ''}
${ai2026?.currentBodyFat ? `現在の体脂肪率: ${ai2026.currentBodyFat}%` : ''}
${ai2026?.targetWeight ? `目標体重: ${ai2026.targetWeight}kg` : ''}
${ai2026?.targetBodyFat ? `目標体脂肪率: ${ai2026.targetBodyFat}%` : ''}

【1月の実績】
セッション回数: ${stats.sessionCount}回
${stats.weightChange !== null ? `体重変化: ${stats.weightChange > 0 ? '+' : ''}${stats.weightChange}kg` : ''}
${stats.bodyFatChange !== null ? `体脂肪率変化: ${stats.bodyFatChange > 0 ? '+' : ''}${stats.bodyFatChange}%` : ''}

【2026年目標】
${goals2026?.targetText || ai2026?.numericGoal || '目標未設定'}

---
上記を踏まえて、以下の内容を具体的に提案してください：
1. 2月の推奨セッション回数（週何回、月何回）
2. 各セッション回数での成長予測（体重・体脂肪率の変化予測）
3. 目標達成に必要なセッション回数の目安
4. セッション頻度別の成長スピードの違い

例：
- 週1回（月4回）の場合: 体重-0.5kg、体脂肪率-0.3%程度の変化が見込めます
- 週2回（月8回）の場合: 体重-1.0kg、体脂肪率-0.6%程度の変化が見込めます
- 週3回（月12回）の場合: 体重-1.5kg、体脂肪率-0.9%程度の変化が見込めます

400-600文字で、具体的で実践的な提案を書いてください。`;

    const result = tw_callGeminiForGoalAnalysis_(apiKey, prompt);
    return result.ok ? result.data.ai_text || result.raw : 'セッション計画作成に失敗しました';
    
  } catch (e) {
    Logger.log('セッション計画作成エラー: ' + e.message);
    return 'セッション計画作成中にエラーが発生しました: ' + e.message;
  }
}

/** ===== PIN自動生成機能 ===== */
/**
 * 4桁のPINを生成（1000〜9999）
 */
function tw_generatePin_() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * メンバーシートのPINが空の会員に対して、4桁のPINを自動生成して反映
 * 実行方法: スプレッドシートのメニュー「📊 会員管理」→「🔑 PINを一括生成」
 */
function tw_generatePinsForMembers() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(TW_SHEETS.MEMBERS);
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert(`❌ シートが見つかりません: ${TW_SHEETS.MEMBERS}`);
      return;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      SpreadsheetApp.getUi().alert('会員データがありません');
      return;
    }
    
    // ヘッダー行を取得
    const lastCol = sheet.getLastColumn();
    const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    // 列を検索
    const colMemberId = tw_findColByHeader_(header, TW_HEADERS.member_id) || 1;
    const colPin = tw_findColByHeader_(header, ['pin', 'PIN', 'パスワード', 'password']);
    
    if (!colPin) {
      SpreadsheetApp.getUi().alert('❌ PIN列が見つかりません。ヘッダーに「pin」または「PIN」列を追加してください。');
      return;
    }
    
    Logger.log(`会員ID列: ${colMemberId}, PIN列: ${colPin}`);
    
    // データを取得
    const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
    let updatedCount = 0;
    const updates = [];
    
    data.forEach((row, index) => {
      const actualRow = index + 2;
      const memberId = String(row[colMemberId - 1] || '').trim();
      const currentPin = String(row[colPin - 1] || '').trim();
      
      if (!memberId) return; // 会員IDが空の行はスキップ
      
      // PINが空または未設定の場合のみ生成
      if (!currentPin || currentPin === '' || currentPin === '0' || currentPin === '未設定') {
        const newPin = tw_generatePin_();
        updates.push({
          row: actualRow,
          memberId: memberId,
          pin: newPin
        });
        updatedCount++;
      }
    });
    
    // 一括更新
    if (updates.length > 0) {
      updates.forEach(update => {
        sheet.getRange(update.row, colPin).setValue(update.pin);
        Logger.log(`✅ 行${update.row}: ${update.memberId} → PIN: ${update.pin}`);
      });
      
      SpreadsheetApp.flush();
      
      // 結果を表示
      const result = updates.map(u => `${u.memberId}: ${u.pin}`).join('\n');
      const message = `✅ 完了: ${updatedCount}件のPINを生成しました\n\n【生成されたPIN一覧】\n${result}`;
      
      SpreadsheetApp.getUi().alert(message);
      Logger.log(`\n✅ 完了: ${updatedCount}件のPINを生成しました`);
      Logger.log('\n【生成されたPIN一覧】\n' + result);
    } else {
      SpreadsheetApp.getUi().alert('✅ PINが空の会員は見つかりませんでした');
      Logger.log('✅ PINが空の会員は見つかりませんでした');
    }
    
  } catch (e) {
    const errorMsg = '❌ エラー: ' + e.message;
    Logger.log(errorMsg);
    Logger.log('スタック: ' + e.stack);
    SpreadsheetApp.getUi().alert(errorMsg);
  }
}

/**
 * 特定の会員IDのPINを生成・更新
 * @param {string} memberId - 会員ID
 * @return {string} 生成されたPIN
 */
function tw_generatePinForMember(memberId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(TW_SHEETS.MEMBERS);
    
    if (!sheet) {
      throw new Error(`シートが見つかりません: ${TW_SHEETS.MEMBERS}`);
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      throw new Error('会員データがありません');
    }
    
    // ヘッダー行を取得
    const lastCol = sheet.getLastColumn();
    const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    // 列を検索
    const colMemberId = tw_findColByHeader_(header, TW_HEADERS.member_id) || 1;
    const colPin = tw_findColByHeader_(header, ['pin', 'PIN', 'パスワード', 'password']);
    
    if (!colPin) {
      throw new Error('PIN列が見つかりません');
    }
    
    // データを取得
    const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
    // 会員IDで検索
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const actualRow = i + 2;
      const id = String(row[colMemberId - 1] || '').trim();
      
      if (id === memberId) {
        const newPin = tw_generatePin_();
        sheet.getRange(actualRow, colPin).setValue(newPin);
        SpreadsheetApp.flush();
        Logger.log(`✅ ${memberId} のPINを生成しました: ${newPin}`);
        return newPin;
      }
    }
    
    throw new Error(`会員IDが見つかりません: ${memberId}`);
    
  } catch (e) {
    Logger.log('❌ エラー: ' + e.message);
    throw e;
  }
}