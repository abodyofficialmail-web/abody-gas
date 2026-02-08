import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { getMember } from '@/lib/sheets';
import {
  getBookingRowByBookingId,
  setBookingCancelled,
} from '@/lib/sheets';
import { deleteEvent } from '@/lib/calendar';
import { sendCancellationEmail } from '@/lib/email';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** マイカルテから予約キャンセル。会員メール＋Abodyにキャンセル通知を送信。 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const memberId = String(body?.memberId ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const bookingId = String(body?.bookingId ?? '').trim();

    if (!memberId || !email || !bookingId) {
      return NextResponse.json(
        { error: '会員ID・メール・予約IDを送信してください。' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const member = await getMember(memberId);
    if (!member) {
      return NextResponse.json(
        { error: '会員が見つかりません。' },
        { status: 404, headers: CORS_HEADERS }
      );
    }
    const memberEmailNorm = (member.email ?? '').trim().toLowerCase();
    if (memberEmailNorm !== email) {
      return NextResponse.json(
        { error: 'メールアドレスが会員情報と一致しません。' },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const row = await getBookingRowByBookingId(bookingId);
    if (!row) {
      return NextResponse.json(
        { error: '予約が見つからないか、すでにキャンセルされています。' },
        { status: 404, headers: CORS_HEADERS }
      );
    }
    if (row.memberId !== memberId) {
      return NextResponse.json(
        { error: 'この予約はご本人のものではありません。' },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const timezone = process.env.TIMEZONE || 'Asia/Tokyo';
    const startDt = DateTime.fromISO(row.start, { zone: timezone });
    const dateStr = startDt.toFormat('yyyy年M月d日');
    const timeStr = startDt.toFormat('HH:mm');

    if (row.eventId) {
      try {
        await deleteEvent(row.eventId);
      } catch (err: any) {
        console.error('Calendar delete failed:', err?.message);
      }
    }
    await setBookingCancelled(row.rowIndex);

    const abodyEmail = process.env.ABODY_EMAIL || process.env.MAIL_FROM;
    await sendCancellationEmail({
      memberEmail: member.email ?? email,
      memberName: member.name,
      dateStr,
      timeStr,
      abodyEmail,
    });

    return NextResponse.json(
      { ok: true, message: '予約をキャンセルしました。' },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('cancel-booking error:', err);
    return NextResponse.json(
      { error: err?.message || 'キャンセルに失敗しました。' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      'Access-Control-Max-Age': '86400',
    },
  });
}
