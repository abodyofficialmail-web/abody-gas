/**
 * 会員PIN自動生成スクリプト
 * メンバーシートのPINが空の会員に対して、4桁のPINを自動生成して反映します
 */

const PIN_SHEET_NAME = "メンバーシート";

/**
 * 4桁のPINを生成（1000〜9999）
 */
function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * メンバーシートのPINを一括生成・更新
 * 実行方法: GASエディタでこの関数を実行
 */
function generatePinsForMembers() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(PIN_SHEET_NAME);
    
    if (!sheet) {
      Logger.log(`❌ シートが見つかりません: ${PIN_SHEET_NAME}`);
      return;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      Logger.log('会員データがありません');
      return;
    }
    
    // ヘッダー行を取得
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // 列を検索
    const colMemberId = findColumnIndex(header, ['memberId', 'member_id', '会員ID', 'ID']);
    const colPin = findColumnIndex(header, ['pin', 'PIN', 'パスワード']);
    
    if (!colMemberId) {
      Logger.log('❌ 会員ID列が見つかりません');
      return;
    }
    
    if (!colPin) {
      Logger.log('❌ PIN列が見つかりません');
      return;
    }
    
    Logger.log(`会員ID列: ${colMemberId}, PIN列: ${colPin}`);
    
    // データを取得
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    let updatedCount = 0;
    const updates = [];
    
    data.forEach((row, index) => {
      const actualRow = index + 2;
      const memberId = String(row[colMemberId - 1] || '').trim();
      const currentPin = String(row[colPin - 1] || '').trim();
      
      if (!memberId) return; // 会員IDが空の行はスキップ
      
      // PINが空または未設定の場合のみ生成
      if (!currentPin || currentPin === '' || currentPin === '0' || currentPin === '未設定') {
        const newPin = generatePin();
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
      Logger.log(`\n✅ 完了: ${updatedCount}件のPINを生成しました`);
    } else {
      Logger.log('✅ PINが空の会員は見つかりませんでした');
    }
    
    // 結果を表示
    const result = updates.map(u => `${u.memberId}: ${u.pin}`).join('\n');
    Logger.log('\n【生成されたPIN一覧】\n' + result);
    
  } catch (e) {
    Logger.log('❌ エラー: ' + e.message);
    Logger.log('スタック: ' + e.stack);
  }
}

/**
 * 特定の会員IDのPINを生成・更新
 * @param {string} memberId - 会員ID
 * @return {string} 生成されたPIN
 */
function generatePinForMember(memberId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(PIN_SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`シートが見つかりません: ${PIN_SHEET_NAME}`);
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      throw new Error('会員データがありません');
    }
    
    // ヘッダー行を取得
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // 列を検索
    const colMemberId = findColumnIndex(header, ['memberId', 'member_id', '会員ID', 'ID']);
    const colPin = findColumnIndex(header, ['pin', 'PIN', 'パスワード']);
    
    if (!colMemberId || !colPin) {
      throw new Error('必要な列が見つかりません');
    }
    
    // データを取得
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    // 会員IDで検索
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const actualRow = i + 2;
      const id = String(row[colMemberId - 1] || '').trim();
      
      if (id === memberId) {
        const newPin = generatePin();
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

/**
 * 列名から列インデックスを検索
 */
function findColumnIndex(header, names) {
  for (let i = 0; i < header.length; i++) {
    const cellValue = String(header[i] || '').trim().toLowerCase();
    for (const name of names) {
      if (cellValue === name.toLowerCase()) {
        return i + 1; // 1ベースのインデックス
      }
    }
  }
  return null;
}
