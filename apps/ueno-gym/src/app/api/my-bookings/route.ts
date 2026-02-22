import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateMember } from '@/lib/auth';
import { getBookingsByMemberId } from '@/lib/sheets';

const bodySchema = z.object({
  memberId: z.string().min(1, '会員IDを入力してください'),
  pin: z.string().min(1, 'PINを入力してください'),
});

/** 会員認証後、その会員の予約一覧を返す（マイカルテ用） */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join(' ');
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { memberId, pin } = parsed.data;

    const authResult = await authenticateMember(memberId, pin);
    if (!authResult.success || !authResult.member) {
      return NextResponse.json(
        { error: '認証に失敗しました。会員IDとPINを確認してください。' },
        { status: 401 }
      );
    }

    const bookings = await getBookingsByMemberId(memberId);
    return NextResponse.json({
      memberName: authResult.member.name,
      bookings,
    });
  } catch (error: any) {
    console.error('my-bookings error:', error);
    return NextResponse.json(
      { error: error?.message || '予約一覧の取得に失敗しました。' },
      { status: 500 }
    );
  }
}
