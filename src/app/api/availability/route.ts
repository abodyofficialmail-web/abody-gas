import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { getAvailableSlots } from '@/lib/calendar';
import { availabilityRequestSchema } from '@/lib/validation';
import { toJapaneseError } from '@/lib/errorMessages';
import { authenticateMember } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dayIndex, memberId, pin } = availabilityRequestSchema.parse(body);

    const timezone = process.env.TIMEZONE || 'Asia/Tokyo';
    const today = DateTime.now().setZone(timezone).startOf('day');
    const targetDate = today.plus({ days: dayIndex });
    
    const lastDayOfMonth = today.endOf('month');
    if (targetDate > lastDayOfMonth) {
      return NextResponse.json(
        { error: '選択できるのは今月末までです' },
        { status: 400 }
      );
    }

    // カレンダー空き枠と会員名を並列取得（取得時間短縮）
    const [slots, authResult] = await Promise.all([
      getAvailableSlots(targetDate),
      memberId && pin ? authenticateMember(memberId, pin) : Promise.resolve({ success: false, member: undefined }),
    ]);

    const memberName = authResult.success && authResult.member ? authResult.member.name : undefined;

    return NextResponse.json({
      date: targetDate.toFormat('yyyy-MM-dd'),
      slots: slots.map(slot => ({ start: slot.start, end: slot.end })),
      memberName,
    });
  } catch (error: any) {
    console.error('Availability error:', error);
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'リクエストデータが不正です。日付を選び直して「空き枠を確認」を押してください。' },
        { status: 400 }
      );
    }
    const msg = toJapaneseError(error?.message) || '空き枠の取得に失敗しました';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
