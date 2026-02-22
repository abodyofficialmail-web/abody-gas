import { NextRequest, NextResponse } from 'next/server';
import { createMembersBulk } from '@/lib/sheets';
import { z } from 'zod';

const bulkSchema = z.object({
  members: z.array(
    z.object({
      memberId: z.string().min(1),
      name: z.string().min(1),
      email: z.string().optional(),
    })
  ),
});

/** 既存会員を一括登録（無制限プラン、PIN自動生成） */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { members } = bulkSchema.parse(body);
    if (members.length === 0) {
      return NextResponse.json(
        { error: '1件以上の会員を入力してください。' },
        { status: 400 }
      );
    }
    const result = await createMembersBulk(members);
    return NextResponse.json({
      created: result.created,
      pins: result.pins,
      message: `${result.created}件の会員を無制限プランで登録しました。PINは各会員に伝えてください。`,
    });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: '入力形式が不正です。会員ID・名前を必須で入力してください。' },
        { status: 400 }
      );
    }
    console.error('Bulk create error:', error);
    return NextResponse.json(
      { error: error?.message || '一括登録に失敗しました。' },
      { status: 500 }
    );
  }
}
