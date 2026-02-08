'use client';

import { useState } from 'react';

function getCalendarDays() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days: (number | null)[] = [];
  
  // 前月の空白日
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // 今月の日付
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return { days, year, month: month + 1, today: today.getDate() };
}

function CalendarView({ selectedDayIndex, onDateSelect }: { selectedDayIndex: number; onDateSelect: (dayIndex: number) => void }) {
  const { days, year, month, today } = getCalendarDays();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const isDateSelectable = (day: number | null) => {
    if (day === null) return false;
    const date = new Date(year, month - 1, day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    // 今月末まで選択可能
    const lastDayOfMonth = new Date(year, month, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    
    return date >= now && date <= lastDayOfMonth;
  };

  const getDayIndex = (day: number) => {
    const date = new Date(year, month - 1, day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isSelected = (day: number | null) => {
    if (day === null) return false;
    return getDayIndex(day) === selectedDayIndex;
  };

  const isToday = (day: number | null) => {
    return day === today;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h3>{year}年 {monthNames[month - 1]}</h3>
      </div>
      <div className="calendar-weekdays">
        {weekdays.map((day, idx) => (
          <div key={day} className={`calendar-weekday ${idx === 0 ? 'sunday' : ''} ${idx === 6 ? 'saturday' : ''}`}>
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((day, index) => {
          const selectable = isDateSelectable(day);
          const selected = isSelected(day);
          const todayClass = isToday(day) ? 'today' : '';
          const isWeekend = index % 7 === 0 || index % 7 === 6;
          
          return (
            <button
              key={index}
              className={`calendar-day ${selected ? 'selected' : ''} ${!selectable ? 'disabled' : ''} ${todayClass} ${isWeekend ? 'weekend' : ''}`}
              onClick={() => {
                if (selectable && day !== null) {
                  onDateSelect(getDayIndex(day));
                }
              }}
              disabled={!selectable}
            >
              <span className="calendar-day-number">{day || ''}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TimeSlot {
  start: string;
  end: string;
}

export default function Home() {
  const [memberId, setMemberId] = useState('');
  const [pin, setPin] = useState('');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [memberName, setMemberName] = useState('');
  const [pendingSlot, setPendingSlot] = useState<TimeSlot | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCompleteScreen, setShowCompleteScreen] = useState(false);
  const [lastBooking, setLastBooking] = useState<{
    bookingId: string;
    dateStr: string;
    timeStr: string;
    memberName: string;
    remaining: number | null;
    emailSent: boolean;
  } | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (dayIndex: number) => {
    const date = new Date();
    date.setDate(date.getDate() + dayIndex);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    
    if (dayIndex === 0) {
      return `今日 (${month}/${day})`;
    } else if (dayIndex === 1) {
      return `明日 (${month}/${day})`;
    } else {
      return `${month}/${day}(${weekday})`;
    }
  };

  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (number | null)[] = [];
    
    // 前月の空白日
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 今月の日付
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return { days, year, month: month + 1, today: today.getDate() };
  };

  const isDateSelectable = (day: number | null, month: number, year: number) => {
    if (day === null) return false;
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    maxDate.setHours(23, 59, 59, 999);
    
    return date >= today && date <= maxDate;
  };

  const getDayIndex = (day: number, month: number, year: number) => {
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const fetchAvailability = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setSlots([]);

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayIndex: selectedDayIndex,
          memberId: memberId || undefined,
          pin: pin || undefined,
        }),
      });

      const text = await response.text();
      let data: { slots?: TimeSlot[]; error?: string; memberName?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError('空き枠の取得に失敗しました。しばらくしてからやり直してください。');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || '空き枠の取得に失敗しました');
      }

      setSlots(data.slots || []);
      setMemberName(data.memberName || '');
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (slot: TimeSlot) => {
    if (!memberId || !pin) {
      setError('会員IDとPINを入力してください');
      return;
    }

    setBooking(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          pin,
          start: slot.start,
          end: slot.end,
        }),
      });

      const text = await response.text();
      let data: { bookingId?: string; remaining?: number | null; error?: string; message?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError('予約の処理に失敗しました。しばらくしてからやり直してください。');
        setBooking(false);
        return;
      }
      console.log('Booking response:', { status: response.status, data });

      if (!response.ok) {
        console.error('Booking failed:', { status: response.status, data });
        if (response.status === 401) {
          throw new Error('認証に失敗しました。会員IDとPINを確認してください。');
        } else if (response.status === 403) {
          throw new Error(`予約上限に達しています。${data.message || ''}`);
        } else if (response.status === 409) {
          throw new Error('この時間帯は既に予約されています。別の時間を選択してください。');
        } else {
          throw new Error(data.error || `予約に失敗しました（エラーコード: ${response.status}）`);
        }
      }

      setRemaining(data.remaining ?? null);
      setPendingSlot(null);
      setShowConfirm(false);
      setLastBooking({
        bookingId: data.bookingId,
        dateStr: data.dateStr ?? '',
        timeStr: data.timeStr ?? '',
        memberName: data.memberName ?? memberName,
        remaining: data.remaining ?? null,
        emailSent: data.emailSent === true,
      });
      setShowCompleteScreen(true);
      setSuccess('');
      await fetchAvailability();
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setBooking(false);
    }
  };

  const formatDateForConfirm = (iso: string) => {
    const d = new Date(iso);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${weekdays[d.getDay()]})`;
  };

  return (
    <div className="container">
      <h1>Abodyジム利用カレンダー</h1>

      <div className="card">
        <h2>日付を選択</h2>
        <CalendarView
          selectedDayIndex={selectedDayIndex}
          onDateSelect={(dayIndex) => {
            setSelectedDayIndex(dayIndex);
            setSlots([]);
            setError('');
            setSuccess('');
          }}
        />
        <button onClick={fetchAvailability} disabled={loading}>
          {loading ? '取得中...' : '空き枠を確認'}
        </button>
        {error && <div className="error">{error}</div>}
        {success && (
          <div className="success">
            {success}
            {remaining !== null && (
              <div style={{ marginTop: '8px' }}>
                残り回数: {remaining === null ? '無制限' : `${remaining}回`}
              </div>
            )}
          </div>
        )}
        {showCompleteScreen && lastBooking && (
          <div className="card" style={{ marginTop: '16px', border: '2px solid var(--primary)', background: 'var(--bg)' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '12px' }}>予約完了</h2>
            <p style={{ marginBottom: '16px' }}>ご予約ありがとうございます。以下の内容で予約が確定しました。</p>
            <dl style={{ marginBottom: '16px', lineHeight: '1.8' }}>
              <dt style={{ fontWeight: 600 }}>予約ID</dt>
              <dd style={{ marginLeft: 0, marginBottom: '8px' }}>{lastBooking.bookingId}</dd>
              <dt style={{ fontWeight: 600 }}>日付・時間</dt>
              <dd style={{ marginLeft: 0, marginBottom: '8px' }}>{lastBooking.dateStr} {lastBooking.timeStr}</dd>
              <dt style={{ fontWeight: 600 }}>会員名</dt>
              <dd style={{ marginLeft: 0, marginBottom: '8px' }}>{lastBooking.memberName}</dd>
              <dt style={{ fontWeight: 600 }}>残り回数</dt>
              <dd style={{ marginLeft: 0 }}>{lastBooking.remaining === null ? '無制限' : `${lastBooking.remaining}回`}</dd>
            </dl>
            {lastBooking.emailSent ? (
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                確認メールを送信しました。ご登録のメールアドレスをご確認ください。
              </p>
            ) : (
              <p style={{ fontSize: '14px', color: '#c00', marginBottom: '12px' }}>
                確認メールは送信されていません。dataのF列にメールアドレスが登録されているか、.env.local の SMTP_HOST・SMTP_USER・SMTP_PASS を設定しているかご確認ください。
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setShowCompleteScreen(false);
                setLastBooking(null);
              }}
            >
              閉じる
            </button>
          </div>
        )}
      </div>

      {slots.length > 0 && !showConfirm && (
        <div className="card">
          <h2>空き枠</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>予約したい枠をクリックし、会員IDとPINを入力して予約してください。</p>
          <div className="slots-grid">
            {slots.map((slot, index) => (
              <button
                key={index}
                className="slot-button"
                onClick={() => {
                  setPendingSlot(slot);
                  setShowConfirm(true);
                  setError('');
                }}
                disabled={booking}
              >
                {formatTime(slot.start)} - {formatTime(slot.end)}
              </button>
            ))}
          </div>
        </div>
      )}

      {showConfirm && pendingSlot && (
        <div className="card" style={{ border: '2px solid #0070f3', background: '#f0f8ff' }}>
          <h2>予約内容の確認</h2>
          <div style={{ marginBottom: '16px', fontSize: '15px' }}>
            <p><strong>日付:</strong> {formatDateForConfirm(pendingSlot.start)}</p>
            <p><strong>時間枠:</strong> {formatTime(pendingSlot.start)} - {formatTime(pendingSlot.end)}</p>
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>会員ID</label>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="例: MEM001"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PINを入力"
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleBook(pendingSlot)}
              disabled={booking}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '14px',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: booking ? 'not-allowed' : 'pointer',
              }}
            >
              {booking ? '予約処理中...' : '予約確定'}
            </button>
            <button
              onClick={() => { setPendingSlot(null); setShowConfirm(false); setError(''); }}
              disabled={booking}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '14px',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: booking ? 'not-allowed' : 'pointer',
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {loading && slots.length === 0 && (
        <div className="card">
          <div className="loading">空き枠を取得中...</div>
        </div>
      )}

      <div className="card" style={{ marginTop: '24px', background: '#f5f5f5' }}>
        <h3 style={{ marginTop: 0, fontSize: '14px', color: '#666' }}>初回セットアップ（管理者用）</h3>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>
          「data」シートの1行目にヘッダーがまだ入っていない場合、下のボタンで一括で入れられます。
        </p>
        <button
          onClick={async () => {
            setSetupLoading(true);
            setSetupMessage('');
            try {
              const res = await fetch('/api/setup-sheet', { method: 'POST' });
              const text = await res.text();
              let data: { message?: string; error?: string } = {};
              try {
                data = text ? JSON.parse(text) : {};
              } catch {
                setSetupMessage('通信エラーが発生しました。');
                setSetupLoading(false);
                return;
              }
              if (res.ok) {
                setSetupMessage(data.message || '1行目を設定しました。');
              } else {
                setSetupMessage(data.error || '失敗しました。');
              }
            } catch (e: any) {
              setSetupMessage(e.message || 'エラー');
            } finally {
              setSetupLoading(false);
            }
          }}
          disabled={setupLoading}
          style={{
            padding: '8px 16px',
            background: setupLoading ? '#999' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: setupLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          {setupLoading ? '実行中...' : '「data」シートの1行目にヘッダーを入れる'}
        </button>
        {setupMessage && (
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#333' }}>{setupMessage}</div>
        )}
      </div>

      <div className="card" style={{ marginTop: '16px', background: '#f9f5f0' }}>
        <h3 style={{ marginTop: 0, fontSize: '14px', color: '#666' }}>既存会員を一括登録（無制限プラン）</h3>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>
          1行1件で「会員ID,名前,メール」の形式で入力（メールは任意）。PINは自動生成され、dataシートに追加されます。
        </p>
        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder={'例:\nMEM001,山田太郎,yamada@example.com\nMEM002,佐藤花,sato@example.com'}
          rows={6}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit',
            marginBottom: '12px',
          }}
        />
        <button
          onClick={async () => {
            const lines = bulkText.trim().split(/\n/).filter(Boolean);
            const members = lines.map((line) => {
              const parts = line.split(',').map((p) => p.trim());
              return {
                memberId: parts[0] || '',
                name: parts[1] || '',
                email: parts[2] || undefined,
              };
            }).filter((m) => m.memberId && m.name);
            if (members.length === 0) {
              setBulkMessage('有効な行がありません。会員ID,名前 を入力してください。');
              return;
            }
            setBulkLoading(true);
            setBulkMessage('');
            try {
              const res = await fetch('/api/members/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ members }),
              });
              const data = await res.json();
              if (res.ok) {
                setBulkMessage(`${data.message} PIN一覧: ${data.pins?.map((p: { memberId: string; pin: string }) => `${p.memberId}=${p.pin}`).join(', ') || ''}`);
                setBulkText('');
              } else {
                setBulkMessage(data.error || '登録に失敗しました。');
              }
            } catch (e: any) {
              setBulkMessage(e.message || 'エラー');
            } finally {
              setBulkLoading(false);
            }
          }}
          disabled={bulkLoading || !bulkText.trim()}
          style={{
            padding: '10px 20px',
            background: bulkLoading ? '#999' : '#8b6914',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: bulkLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          {bulkLoading ? '登録中...' : '一括登録（無制限プラン）'}
        </button>
        {bulkMessage && (
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap' }}>{bulkMessage}</div>
        )}
      </div>
    </div>
  );
}
