import { NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/google';
import { toJapaneseError } from '@/lib/errorMessages';

/** 「data」シートの1行目にヘッダー（A1〜R1）を書き込む。初回セットアップ用。日本語表示。 */
const DATA_HEADER_ROW = [
  '会員ID',
  '名前',
  'プラン',
  'PIN',
  '有効',
  'メール', // F
  '会員ID',
  '月',
  '回数',
  '', // J
  '予約ID',
  '会員ID',
  '開始',
  '終了',
  'イベントID',
  '作成日時',
  'リマインド送信済', // Q
  'キャンセル済み', // R
];

export async function POST() {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      return NextResponse.json(
        { error: 'GOOGLE_SHEET_ID が設定されていません。' },
        { status: 500 }
      );
    }

    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'data!A1:R1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [DATA_HEADER_ROW],
      },
    });

    return NextResponse.json({ ok: true, message: '「data」シートの1行目にヘッダーを入れました。' });
  } catch (error: any) {
    console.error('setup-sheet error:', error);
    const msg = toJapaneseError(error?.message) || '1行目の書き込みに失敗しました。';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
