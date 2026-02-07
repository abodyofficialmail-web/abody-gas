// ... existing code ...

/**
 * ======== 緊急実行：送信待ちを即座に処理（ログ詳細版） ========
 * GASエディタでこの関数を実行すると、すぐに送信待ちのメールを処理します
 * ログを詳細に出力して問題を特定します
 */
function processPendingEmails_Now() {
  Logger.log('=== 緊急実行: processPendingEmails ===');
  Logger.log(`実行時刻: ${new Date().toLocaleString()}`);
  
  // トリガー状態を確認
  const triggers = ScriptApp.getProjectTriggers();
  const emailTriggers = triggers.filter(t => t.getHandlerFunction() === "processPendingEmails");
  Logger.log(`メール処理トリガー数: ${emailTriggers.length}`);
  if (emailTriggers.length === 0) {
    Logger.log('⚠️ 警告: メール処理トリガーが設定されていません！');
    Logger.log('setupEmailProcessingTrigger()を実行してトリガーを設定してください。');
  }
  
  // 処理を実行
  processPendingEmails();
  
  Logger.log('=== 緊急実行完了 ===');
}

// ... existing code ...
