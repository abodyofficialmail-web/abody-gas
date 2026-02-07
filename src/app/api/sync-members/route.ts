import { NextRequest, NextResponse } from 'next/server';
import { syncMembersFromSheet } from '@/lib/sheets';
import { z } from 'zod';

const bodySchema = z.object({
  sheetName: z.string().min(1).optional(),
});

/** メンバーシート（または指定シート名）の会員を data に反映。未登録のみ無制限プラン・PIN自動生成で追加。 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sheetName } = bodySchema.parse({ sheetName: body?.sheetName || 'メンバーシート' });
    const membersSheetId = process.env.MEMBERS_SHEET_ID;
    const result = await syncMembersFromSheet(sheetName, membersSheetId);
    const msgParts = [];
    if (result.synced > 0) msgParts.push(`${result.synced}件をdataに追加`);
    if (result.updated > 0) msgParts.push(`${result.updated}件のメールアドレスをdataのF列に反映しました`);
    if (result.skipped > 0) msgParts.push(`${result.skipped}件は既に登録済みのためスキップ`);
    const message = msgParts.length ? msgParts.join('。') + '。PINは新規追加分のみ表示します。' : '変更はありません。';

    return NextResponse.json({
      synced: result.synced,
      skipped: result.skipped,
      updated: result.updated,
      pins: result.pins,
      message,
    });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'シート名を指定してください。' },
        { status: 400 }
      );
    }
    console.error('Sync members error:', error);
    const msg = error?.message || 'メンバーシートの反映に失敗しました。シート名（メンバーシート）とGOOGLE_SHEET_IDが同じスプレッドシートを指しているか確認してください。';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
