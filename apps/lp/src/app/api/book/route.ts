import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { authenticateMember } from '@/lib/auth';
import { getUsage, incrementUsage, createBooking } from '@/lib/sheets';
import { checkFreeBusy, createEvent } from '@/lib/calendar';
import { bookRequestSchema } from '@/lib/validation';
import { toJapaneseError, getErrorMessage } from '@/lib/errorMessages';
import { sendBookingConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, pin, start, end } = bookRequestSchema.parse(body);

    console.log('Booking request:', { memberId, pin: '***', start, end });

    // 認証
    const authResult = await authenticateMember(memberId, pin);
    console.log('Auth result:', { success: authResult.success, hasMember: !!authResult.member });
    
    if (!authResult.success || !authResult.member) {
      console.error('Authentication failed:', { memberId, pinProvided: !!pin });
      return NextResponse.json(
        { error: '認証に失敗しました。会員IDとPINを確認してください。' },
        { status: 401 }
      );
    }

    const member = authResult.member;

    // 月回数制限チェック
    if (member.plan !== 'unlimited') {
      const timezone = process.env.TIMEZONE || 'Asia/Tokyo';
      const startDate = DateTime.fromISO(start).setZone(timezone);
      const month = startDate.toFormat('yyyy-MM');
      const limit = parseInt(member.plan, 10);

      try {
        const usage = await getUsage(memberId, month);
        const currentCount = usage?.count || 0;

        if (currentCount >= limit) {
          return NextResponse.json(
            {
              error: `月${limit}回の上限に達しています`,
              message: `今月の利用回数: ${currentCount}回 / ${limit}回`,
            },
            { status: 403 }
          );
        }
      } catch (err: any) {
        const errMsg = getErrorMessage(err);
        console.error('getUsage (limit check) failed:', errMsg);
        const msg = toJapaneseError(errMsg) || '利用回数の確認に失敗しました。スプレッドシートの共有設定を確認してください。';
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }

    // 予約直前にfreebusyで再確認
    let isAvailable: boolean;
    try {
      isAvailable = await checkFreeBusy(start, end);
    } catch (err: any) {
      const errMsg = getErrorMessage(err);
      console.error('checkFreeBusy failed:', errMsg);
      const msg = toJapaneseError(errMsg) || '空き状況の確認に失敗しました。カレンダーの共有設定を確認してください。';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'この時間帯は既に予約されています' },
        { status: 409 }
      );
    }

    // カレンダーにイベント作成
    const timezone = process.env.TIMEZONE || 'Asia/Tokyo';
    const startDate = DateTime.fromISO(start).setZone(timezone);
    const month = startDate.toFormat('yyyy-MM');
    const summary = `個人利用：${member.name}(${memberId})`;
    let eventId: string;
    try {
      eventId = await createEvent(start, end, summary);
    } catch (err: any) {
      const errMsg = getErrorMessage(err);
      console.error('createEvent failed:', errMsg);
      const msg = toJapaneseError(errMsg) || 'カレンダーに予定を追加できませんでした。予約用カレンダーをサービスアカウントと「予定の変更」で共有しているか確認してください。';
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // 利用回数をカウント
    let newCount: number;
    try {
      newCount = await incrementUsage(memberId, month);
    } catch (err: any) {
      const errMsg = getErrorMessage(err);
      console.error('incrementUsage failed:', errMsg);
      const msg = toJapaneseError(errMsg) || '利用回数の記録に失敗しました。スプレッドシートの共有設定を確認してください。';
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // 予約ログを記録
    const bookingId = nanoid();
    try {
      await createBooking({
        bookingId,
        memberId,
        start,
        end,
        eventId,
        createdAt: DateTime.now().setZone(timezone).toISO()!,
      });
    } catch (err: any) {
      const errMsg = getErrorMessage(err);
      console.error('createBooking failed:', errMsg);
      const msg = toJapaneseError(errMsg) || '予約ログの記録に失敗しました。スプレッドシートの共有設定を確認してください。';
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // 残り回数を計算
    let remaining: number | null = null;
    if (member.plan !== 'unlimited') {
      const limit = parseInt(member.plan, 10);
      remaining = Math.max(0, limit - newCount);
    }

    // 予約確定メール送信（メールアドレスがある場合、SMTP設定があれば送信）
    let emailSent = false;
    if (member.email) {
      const dateStr = startDate.toFormat('yyyy年M月d日(E)', { locale: 'ja' });
      const timeStr = `${startDate.toFormat('HH:mm')} - ${DateTime.fromISO(end).setZone(timezone).toFormat('HH:mm')}`;
      emailSent = await sendBookingConfirmation({
        to: member.email,
        memberName: member.name,
        dateStr,
        timeStr,
      });
    }

    const dateStr = startDate.toFormat('yyyy年M月d日(E)', { locale: 'ja' });
    const timeStr = `${startDate.toFormat('HH:mm')} - ${DateTime.fromISO(end).setZone(timezone).toFormat('HH:mm')}`;

    return NextResponse.json({
      bookingId,
      remaining,
      emailSent,
      dateStr,
      timeStr,
      memberName: member.name,
    });
  } catch (error: any) {
    const raw = getErrorMessage(error);
    console.error('Booking error:', raw || error);
    
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'リクエストデータが不正です' },
        { status: 400 }
      );
    }

    const msg = toJapaneseError(raw) || (raw || '予約に失敗しました。ターミナル（npm run dev の画面）のログを確認してください。');
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
