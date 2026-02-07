import { NextRequest, NextResponse } from 'next/server';
import { createMember } from '@/lib/sheets';
import { toJapaneseError } from '@/lib/errorMessages';
import { z } from 'zod';

const createMemberSchema = z.object({
  memberId: z.string().min(1),
  name: z.string().min(1),
  plan: z.enum(['4', '8', 'unlimited']),
  email: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, name, plan, email } = createMemberSchema.parse(body);

    const { pin } = await createMember(memberId, name, plan, email);

    return NextResponse.json({
      success: true,
      memberId,
      name,
      plan,
      pin, // 生成されたPINを返す
    });
  } catch (error: any) {
    console.error('Create member error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'リクエストデータが不正です', details: error.errors },
        { status: 400 }
      );
    }

    const msg = toJapaneseError(error?.message) || '会員の作成に失敗しました';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
