import { NextRequest, NextResponse } from 'next/server';
import { getBookingsForReminder, markReminderSent, getMember } from '@/lib/sheets';
import { sendReminderEmail } from '@/lib/email';

/** 日本時間（Asia/Tokyo）で日付・時刻をフォーマット（サーバーがUTCでも正しく表示） */
const JST = 'Asia/Tokyo';

function formatDateStr(iso: string): string {
  const d = new Date(iso);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const parts = new Intl.DateTimeFormat('ja-JP', { timeZone: JST, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' }).formatToParts(d);
  const y = parts.find((p) => p.type === 'year')?.value ?? '';
  const m = parts.find((p) => p.type === 'month')?.value ?? '';
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  const w = parts.find((p) => p.type === 'weekday')?.value?.replace('曜日', '') ?? '';
  return `${y}年${m}月${day}日(${w})`;
}

function formatTimeStr(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const startJst = new Intl.DateTimeFormat('ja-JP', { timeZone: JST, hour: '2-digit', minute: '2-digit', hour12: false }).format(s);
  const endJst = new Intl.DateTimeFormat('ja-JP', { timeZone: JST, hour: '2-digit', minute: '2-digit', hour12: false }).format(e);
  return `${startJst} - ${endJst}`;
}

async function runReminders() {
  const bookings = await getBookingsForReminder();
  let sent = 0;
  let skipped = 0;

  for (const b of bookings) {
    const member = await getMember(b.memberId);
    if (!member?.email?.trim()) {
      skipped++;
      await markReminderSent(b.rowIndex);
      continue;
    }
    const dateStr = formatDateStr(b.start);
    const timeStr = formatTimeStr(b.start, b.end);
    const ok = await sendReminderEmail({
      to: member.email,
      memberName: member.name,
      dateStr,
      timeStr,
    });
    if (ok) {
      sent++;
      await markReminderSent(b.rowIndex);
    }
  }

  return { sent, skipped, total: bookings.length };
}

/**
 * GET: Vercel Cron 用。CRON_SECRET が設定されていれば Authorization: Bearer で検証。
 * POST: 管理画面の手動実行用（認証なし）。
 * 開始が「今」から24時間以内の予約のうち、未送信分にリマインドを送り、送信済みフラグを立てる。
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  try {
    const result = await runReminders();
    return NextResponse.json({
      ok: true,
      message: `リマインドメールを ${result.sent} 件送信しました。`,
      ...result,
    });
  } catch (error: any) {
    console.error('send-reminders error:', error);
    return NextResponse.json(
      { error: error?.message || 'リマインド送信に失敗しました。' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await runReminders();
    return NextResponse.json({
      ok: true,
      message: `リマインドメールを ${result.sent} 件送信しました。メール未登録などで ${result.skipped} 件スキップしました。`,
      ...result,
    });
  } catch (error: any) {
    console.error('send-reminders error:', error);
    return NextResponse.json(
      { error: error?.message || 'リマインド送信に失敗しました。' },
      { status: 500 }
    );
  }
}
