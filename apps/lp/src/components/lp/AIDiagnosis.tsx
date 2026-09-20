"use client";

import { useMemo, useRef, useState } from "react";
import { Brain, Check, ChevronRight } from "lucide-react";
import { CAMPAIGN_STORES } from "@/lib/campaign";
import { LINE_URL_BY_STORE } from "@/lib/constants";
import { navigateToStoreLine } from "@/lib/googleAdsTracking";

type Answers = Record<string, string>;

const QUESTIONS = [
  { key: "goal", title: "いまいちばん叶えたいことは？", type: "choice", options: [
    { id: "muscle", label: "筋肉をつけて大きくしたい" },
    { id: "flex", label: "柔らかく動ける体にしたい" },
    { id: "posture", label: "姿勢や体幹を整えたい" },
    { id: "diet", label: "無理なく減量したい" },
  ]},
  { key: "trigger", title: "ボディメイクしたいきっかけは？", type: "choice", options: [
    { id: "look", label: "見た目を変えたい / 写真や服装を気にしている" },
    { id: "health", label: "健康診断や体調がきっかけ" },
    { id: "event", label: "結婚式・旅行など期限がある" },
    { id: "habit", label: "運動を習慣にしたい" },
    { id: "restart", label: "以前やっていて、また始めたい" },
  ]},
  { key: "timeline", title: "どのくらいの期間で変わりたい？", type: "choice", options: [
    { id: "3m", label: "3ヶ月以内に変化を感じたい" },
    { id: "6m", label: "半年かけてしっかり変えたい" },
    { id: "year", label: "1年かけて無理なく続けたい" },
    { id: "asap", label: "できるだけ早く" },
  ]},
  { key: "gender", title: "性別を教えてください", type: "choice", options: [
    { id: "male", label: "男性" },
    { id: "female", label: "女性" },
    { id: "other", label: "回答しない / その他" },
  ]},
  { key: "age", title: "年代を教えてください", type: "choice", options: [
    { id: "20", label: "20代" }, { id: "30", label: "30代" }, { id: "40", label: "40代" }, { id: "50", label: "50代以上" },
  ]},
  { key: "body", title: "身長と体重を教えてください", type: "body" },
  { key: "concern", title: "特に気になるのは？", type: "choice", options: [
    { id: "belly", label: "お腹まわり" }, { id: "upper", label: "二の腕・背中" }, { id: "lower", label: "脚・ヒップ" }, { id: "neck", label: "姿勢・肩こり" }, { id: "all", label: "全身" },
  ]},
  { key: "habit", title: "今の運動習慣は？", type: "choice", options: [
    { id: "none", label: "ほとんどしていない" }, { id: "light", label: "週1〜2回" }, { id: "often", label: "週3回以上" },
  ]},
  { key: "timezone", title: "どの時間帯に通えそう？", type: "choice", options: [
    { id: "morning", label: "朝（開店〜12時）" }, { id: "day", label: "日中（12〜17時）" }, { id: "night", label: "夜（17時〜閉店）" }, { id: "flex", label: "週によって変わる" },
  ]},
  { key: "frequency", title: "週に通えそうな目安は？", type: "choice", options: [
    { id: "1", label: "週1回くらい" }, { id: "2", label: "週2回" }, { id: "3", label: "週3回以上" },
  ]},
  { key: "demand", title: "パーソナルにいちばん求めることは？", type: "choice", options: [
    { id: "form", label: "正しいやり方を教えてほしい" }, { id: "plan", label: "目標までのメニューを組んでほしい" }, { id: "motivate", label: "一緒に追い込んでほしい / 継続の伴走" }, { id: "care", label: "体の不調に合わせて調整してほしい" },
  ]},
  { key: "intensity", title: "希望の強度感は？", type: "choice", options: [
    { id: "hard", label: "しっかり追い込みたい" }, { id: "mid", label: "きつすぎず、続けられる強さ" }, { id: "easy", label: "まずは軽めから慣らしたい" },
  ]},
] as const;

const CASES = [
  { name: "Tさん（男性）", habit: "受け放題で週3回、毎回マンツーマン", result: "フォームが安定し、ベンチプレスが約+20kg。見た目の厚みも出てきた。", goals: ["muscle"], genders: ["male", "other"] },
  { name: "Oさん（通い始めて6ヶ月）", habit: "1回30分を週3回以上。仕事の前後に通う", result: "6ヶ月で筋肉のつきを実感。短時間でも習慣が続き、モチベーションが維持できている。", goals: ["muscle", "flex"], genders: ["male", "female", "other"] },
  { name: "Rさん（女性）", habit: "個室で毎回マンツーマン。受け放題で回数を多めに", result: "入会1ヶ月で変化を実感。周りの目を気にせず続けられたのが大きい。", goals: ["diet", "posture", "flex"], genders: ["female", "other"] },
  { name: "Yさん", habit: "楽しく、でもしっかり追い込む通い方", result: "他のジムでは続かなかったが、今も継続中。効果を感じながら習慣になっている。", goals: ["diet", "muscle", "habit"], genders: ["male", "female", "other"] },
];

function round1(n: number) {
  return Math.round(10 * n) / 10;
}

function changeLabel(kind: string, min: number, max: number) {
  return kind === "gain" ? `+${min}〜${max}kg` : `${min}〜${max}kg減`;
}

function weightSentence(current: number, range: { minKg: number; maxKg: number; changeMin: number; changeMax: number }, kind: string) {
  return `いま ${current}kg → ${range.minKg}〜${range.maxKg}kg（${changeLabel(kind, range.changeMin, range.changeMax)}）`;
}

function bmiOf(a: Answers) {
  const h = Number(a.height);
  const w = Number(a.weight);
  if (!h || !w || h < 100 || h > 230 || w < 30 || w > 250) return null;
  return w / (h / 100) ** 2;
}

function optionLabel(key: string, id?: string) {
  const q = QUESTIONS.find((item) => item.type === "choice" && item.key === key);
  return q && "options" in q ? q.options.find((o) => o.id === id)?.label ?? "" : "";
}

function sessionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `d-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function logEvent(payload: object) {
  try {
    await fetch("/api/ai-diagnosis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true });
  } catch {
    /* ignore */
  }
}

function buildResult(a: Answers) {
  const goal = a.goal;
  const freq = a.frequency === "3" ? 3 : a.frequency === "1" ? 1 : 2;
  const easyStart = a.habit === "none" || freq === 1 || a.intensity === "easy";
  let headline = "あなたに合うのは、パーソナルを軸にした受け放題です。";
  let plan = "パーソナルトレーニングメイン受け放題";
  const body: string[] = [];

  if (goal === "muscle") {
    headline = "筋力アップを最短で進めるなら、トレーニング中心が合いそうです。";
    plan = "パーソナルトレーニングメイン受け放題";
    body.push("毎回マンツーマンで、今の体力に合わせたオリジナルメニューを組むのが近道です。");
  } else if (goal === "flex") {
    headline = "筋力だけでなく、動ける体まで作る組み合わせが合いそうです。";
    plan = "パーソナルトレーニングとパーソナルストレッチで受け放題";
    body.push("週のメインはトレーニング、調子が悪い日はストレッチ。同じ料金内で切り替えられます。");
  } else if (goal === "posture") {
    headline = "体幹と姿勢を整えながら、鍛える進め方が合いそうです。";
    plan = "パーソナルトレーニングとピラティスで受け放題";
    body.push("筋トレだけで終わらせず、ピラティスで体幹を入れると、見た目も日常の動きも変わりやすくなります。");
  } else {
    headline = "無理なく減量して戻しにくくするなら、トレーニングと食事の両輪が合いそうです。";
    plan = "トレーニングと食事パーソナルで受け放題";
    body.push("通う習慣を先につくり、食事は「続けられる食べ方」から整えるとリバウンドしにくいです。");
  }

  if (a.trigger === "event") body.push("期限があるので、最初の4週間で通うリズムを確定させるのがポイントです。");
  if (a.demand === "care") body.push("不調に合わせてメニューを変える前提なので、ストレッチやピラティスも同じ枠で使います。");
  if (a.demand === "form") body.push("最初の1ヶ月は重量よりフォーム優先。ここが後の伸びを決めます。");
  if (a.intensity === "easy" || a.habit === "none") body.push("最初は軽めから入り、通えた週を褒める設計にします。きつさは体験で調整できます。");
  if (a.intensity === "hard") body.push("追い込みたい意向は活かしつつ、回復日をストレッチにすると週あたりの質が上がります。");
  if (a.timezone === "night") body.push("夜の通いが現実的なので、仕事終わり30分で完結するメニューが向いています。");
  if (a.timezone === "morning") body.push("朝型なら、短時間で覚醒も兼ねたトレーニングが続きやすいです。");
  if (a.age === "40" || a.age === "50") body.push("関節への負担を抑えた種目選択もできるので、強度は「効いているが翌日に残しすぎない」が目安です。");

  const bmi = bmiOf(a);
  if (bmi && bmi >= 25 && goal === "diet") body.push("今の体型からは、食事と通いをセットにすると見た目の変化が出やすい段階です。");
  if (bmi && bmi < 18.5 && goal === "muscle") body.push("まずは体重を落とさず、食事量とトレーニング回数で厚みをつける方針が合いそうです。");

  let weekly = "まずは週2回。通えた週は3回に伸ばす。";
  if (freq === 1) weekly = "最初は週1回で習慣化。慣れたら週2回へ。";
  if (freq === 3) weekly = "週3回を基本に、うち1回は整える日にする。";
  if (goal === "flex") weekly = "週2回トレーニング＋週1回ストレッチが目安です。";
  if (goal === "posture") weekly = "週2回トレーニング＋週1回ピラティスが目安です。";

  let month3 = "";
  let month6 = "";
  if (goal === "diet") {
    month3 = easyStart ? "服のフィット感が変わり始める。むくみや姿勢の変化を先に感じやすい時期です。" : "体脂肪が落ち始め、お腹まわりのサイズ感が変わる。週2回以上＋食事を整えた場合のイメージです。";
    month6 = easyStart ? "見た目の変化が周囲にも伝わりやすい。食べ方の習慣が残ることが半年後の本体です。" : "見た目がはっきり変わる。リバウンドしにくい食べ方が定着している状態を目指します。";
  } else if (goal === "muscle") {
    month3 = easyStart ? "フォームが安定し、扱える重量が伸び始める。見た目の変化はまだ控えめでも「できなかった種目ができる」が増える時期です。" : "神経系が適応し、重量が伸びやすい。鏡での変化はまだ小さくても、肩・背中のハリを感じ始めます。";
    month6 = "胸・肩・背中の厚みが出やすい時期。会員のTさんのようにベンチが+20kg伸びた例もあります。見た目の変化を写真で比較しやすいです。";
  } else if (goal === "flex") {
    month3 = "可動域が広がり、朝の動きやすさや痛みの軽減を感じやすい。トレーニングのフォームも安定します。";
    month6 = "柔らかさと筋力の両方が底上げされ、引き締まって見える。週2トレ＋週1ストレッチを続けた場合のイメージです。";
  } else {
    month3 = "肩こりや猫背の自覚が軽くなり、写真の立ち姿が変わり始める。体幹を使う感覚がつかめる時期です。";
    month6 = "日常の姿勢が楽になり、ウエストや背中のラインも整いやすい。ピラティスを週1入れた場合のイメージです。";
  }
  if (freq === 3 && a.habit !== "none" && a.timeline !== "year" && goal === "diet") month3 = `変化を早めに感じやすいペースです。${month3}`;

  const weight = (() => {
    const current = Number(a.weight);
    if (!current || current < 30 || current > 250) return null;
    const height = Number(a.height);
    const floor = height >= 100 && height <= 230 ? round1(18.5 * (height / 100) ** 2) : 40;
    const b = bmiOf(a);
    let kind = "lose";
    let c3: [number, number] = [2, 4];
    let c6: [number, number] = [4, 8];
    if (goal === "muscle") {
      kind = "gain";
      c3 = easyStart ? [0.5, 1.5] : [1, 2];
      c6 = easyStart ? [1.5, 3] : [2, 4];
    } else if (goal === "diet") {
      kind = "lose";
      c3 = easyStart ? [1.5, 3] : [2, 4];
      c6 = easyStart ? [3, 6] : [4, 8];
      if (b && b < 18.5) { kind = "recomp"; c3 = [0, 0.5]; c6 = [0, 1]; }
    } else if (b && b >= 25) {
      kind = "lose"; c3 = [1, 2.5]; c6 = [2, 4];
    } else {
      kind = "recomp"; c3 = [0.5, 1.5]; c6 = [1, 2.5];
    }
    const range = (min: number, max: number) => {
      if (kind === "gain") return { minKg: round1(current + min), maxKg: round1(current + max), changeMin: min, changeMax: max };
      const lo = Math.max(floor, round1(current - max));
      const hi = Math.max(floor, round1(current - min));
      return { minKg: Math.min(lo, hi), maxKg: Math.max(lo, hi), changeMin: round1(current - Math.max(lo, hi)), changeMax: round1(current - Math.min(lo, hi)) };
    };
    return { currentKg: round1(current), kind, month3: range(c3[0], c3[1]), month6: range(c6[0], c6[1]) };
  })();

  if (weight) {
    month3 = `${weightSentence(weight.currentKg, weight.month3, weight.kind)}。${month3}`;
    month6 = `${weightSentence(weight.currentKg, weight.month6, weight.kind)}。${month6}`;
  }

  const cases = CASES.filter((item) => (!goal || item.goals.includes(goal) || item.goals.includes("habit")) && (!a.gender || item.genders.includes(a.gender))).slice(0, 2);

  return { headline, plan, body, weekly, month3, month6, weight, bmi, cases: cases.length ? cases : CASES.slice(0, 2) };
}

export function LPAIDiagnosis() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pickStore, setPickStore] = useState(false);
  const [error, setError] = useState("");
  const sid = useRef(sessionId());
  const logged = useRef(false);
  const question = QUESTIONS[step];
  const result = useMemo(() => (done ? buildResult(answers) : null), [done, answers]);

  const finish = (next: Answers) => {
    setAnswers(next);
    setDone(true);
    if (!logged.current) {
      logged.current = true;
      logEvent({ event: "completed", sessionId: sid.current, answers: next });
    }
  };

  const advance = (next: Answers) => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      setAnswers(next);
      return;
    }
    finish(next);
  };

  const copyToLine = async (storeId: string) => {
    if (!result) return;
    const text = [
      "【Abody AIボディメイク診断】", result.headline, `おすすめ：${result.plan}`,
      "通い方：30分受け放題 / 月60分4回＋30分2回 どちらでもOK", "（60分受け放題プランもある）",
      `進め方：${result.weekly}`, result.weight ? `いまの体重：${result.weight.currentKg}kg` : "",
      "", "3ヶ月後の見込み", result.month3, "", "半年後の見込み", result.month6, "",
      "近い会員様の例", ...result.cases.flatMap((c) => [`・${c.name}`, `  通い方：${c.habit}`, `  結果：${c.result}`]),
      "", ...result.body, "", "回答",
      `目的：${optionLabel("goal", answers.goal)}`, `きっかけ：${optionLabel("trigger", answers.trigger)}`,
      `期間：${optionLabel("timeline", answers.timeline)}`, `性別：${optionLabel("gender", answers.gender)}`,
      `年代：${optionLabel("age", answers.age)}`, `身長：${answers.height ?? ""}cm`, `体重：${answers.weight ?? ""}kg`,
      `気になる部位：${optionLabel("concern", answers.concern)}`, `運動習慣：${optionLabel("habit", answers.habit)}`,
      `時間帯：${optionLabel("timezone", answers.timezone)}`, `頻度：${optionLabel("frequency", answers.frequency)}`,
      `パーソナルに求めること：${optionLabel("demand", answers.demand)}`, `強度：${optionLabel("intensity", answers.intensity)}`,
      "", "この内容をもとに相談したいです。体験の日程を調整してください。",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    logEvent({ event: "line", sessionId: sid.current, storeId, answers });
    navigateToStoreLine(storeId, LINE_URL_BY_STORE[storeId] ?? LINE_URL_BY_STORE.ebisu);
  };

  const reset = () => {
    setStarted(false); setStep(0); setAnswers({}); setDone(false); setCopied(false); setPickStore(false); setError("");
    sid.current = sessionId(); logged.current = false;
  };

  return (
    <section id="ai-diagnosis" className="relative overflow-hidden py-16 sm:py-24">
      <div className="absolute inset-0 bg-[#07332f]" />
      <div className="absolute inset-0 bg-gradient-to-br from-abody-teal/50 via-[#07332f] to-[#021716]" />
      <div aria-hidden className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-abody-teal/35 blur-3xl" />
      <div aria-hidden className="absolute -left-10 -bottom-16 h-48 w-48 rounded-full bg-teal-200/20 blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {!started && (
          <div className="text-center text-white">
            <p className="mb-5 flex items-center justify-center gap-3 text-[11px] sm:text-xs font-bold tracking-[0.38em] text-teal-100/90">
              <span className="h-px w-8 sm:w-12 bg-teal-100/50" />AI DIAGNOSIS<span className="h-px w-8 sm:w-12 bg-teal-100/50" />
            </p>
            <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
              <Brain className="w-7 h-7 text-teal-100" strokeWidth={1.6} />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold leading-relaxed tracking-wide mb-4">AIボディメイク診断</h2>
            <p className="text-sm sm:text-base text-white/80 mb-6 leading-relaxed max-w-xl mx-auto">
              きっかけ・期間・通い方を答えると、3ヶ月後・半年後の変化の目安を出します。
              <br />
              結果を持って、プロのトレーナーに相談できます。
            </p>
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              {["無料", "約1分", "3ヶ月・半年後の目安"].map((item) => (
                <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs sm:text-sm tracking-wide backdrop-blur-sm">{item}</span>
              ))}
            </div>
            <button type="button" onClick={() => setStarted(true)} className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[260px] px-10 py-4 rounded-2xl bg-white text-[#07332f] text-base sm:text-lg font-bold shadow-lg hover:bg-teal-50 transition-colors">
              無料で診断をはじめる <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {started && !done && question && (
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft p-6 sm:p-8">
            <p className="text-abody-teal text-xs font-bold mb-2">Q{step + 1} / {QUESTIONS.length}</p>
            <div className="h-1.5 rounded-full bg-neutral-100 mb-6 overflow-hidden">
              <div className="h-full bg-abody-teal transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-5">{question.title}</h3>
            {question.type === "choice" && "options" in question && (
              <div className="space-y-3">
                {question.options.map((opt) => (
                  <button key={opt.id} type="button" onClick={() => advance({ ...answers, [question.key]: opt.id })} className="w-full text-left px-4 py-3.5 rounded-2xl border border-neutral-200 hover:border-abody-teal hover:bg-abody-teal/5 font-medium text-neutral-800 transition-colors">
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {question.type === "body" && (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm text-neutral-600">身長（cm）</span>
                  <input type="number" inputMode="decimal" min={120} max={220} value={answers.height ?? ""} onChange={(e) => setAnswers({ ...answers, height: e.target.value })} className="mt-1 w-full h-12 px-4 rounded-2xl border border-neutral-200 focus:border-abody-teal focus:ring-2 focus:ring-abody-teal/20 outline-none" placeholder="例: 170" />
                </label>
                <label className="block">
                  <span className="text-sm text-neutral-600">体重（kg）</span>
                  <input type="number" inputMode="decimal" min={30} max={200} value={answers.weight ?? ""} onChange={(e) => setAnswers({ ...answers, weight: e.target.value })} className="mt-1 w-full h-12 px-4 rounded-2xl border border-neutral-200 focus:border-abody-teal focus:ring-2 focus:ring-abody-teal/20 outline-none" placeholder="例: 65" />
                </label>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="button" onClick={() => {
                  const h = Number(answers.height);
                  const w = Number(answers.weight);
                  if (!h || h < 120 || h > 220) { setError("身長は120〜220cmで入力してください"); return; }
                  if (!w || w < 30 || w > 200) { setError("体重は30〜200kgで入力してください"); return; }
                  setError("");
                  advance({ ...answers });
                }} className="w-full h-12 rounded-2xl bg-abody-teal text-white font-bold hover:bg-abody-teal-dark">次へ</button>
              </div>
            )}
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="mt-5 text-sm text-neutral-500 hover:text-neutral-800">前の質問に戻る</button>
            )}
          </div>
        )}

        {done && result && (
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft p-6 sm:p-8">
            <p className="text-abody-teal text-xs font-bold tracking-widest mb-2">YOUR DIAGNOSIS</p>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 leading-relaxed">{result.headline}</h3>
            <p className="text-abody-teal font-bold text-base sm:text-lg mb-3">{result.plan}</p>
            <p className="text-xs font-bold text-neutral-500 mb-2">通い方は、どちらでもOK</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
              <div className="rounded-2xl border border-abody-teal/25 bg-abody-teal/5 px-4 py-3 text-center">
                <p className="text-sm font-bold text-neutral-900">30分受け放題</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">通いたいだけ通える</p>
              </div>
              <div className="rounded-2xl border border-abody-teal/25 bg-abody-teal/5 px-4 py-3 text-center">
                <p className="text-sm font-bold text-neutral-900">月60分4回＋30分2回</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">長めと短めを組み合わせる</p>
              </div>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-neutral-700 leading-relaxed mb-5">
              {result.body.map((line) => <p key={line}>{line}</p>)}
            </div>
            <p className="text-sm bg-neutral-50 rounded-2xl px-4 py-3 text-neutral-800 mb-4">
              <span className="font-bold">進め方の目安：</span>{result.weekly}
            </p>
            {result.weight && (
              <div className="rounded-2xl border border-neutral-200 p-4 mb-4">
                <p className="text-xs font-bold text-neutral-500 mb-2">体重の目安</p>
                <p className="text-2xl font-bold text-neutral-900">いま {result.weight.currentKg}<span className="text-base font-semibold text-neutral-500"> kg</span></p>
                {result.bmi != null && <p className="text-xs text-neutral-500 mt-1">BMI {result.bmi.toFixed(1)}</p>}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-abody-teal/5 px-3 py-2">
                    <p className="text-[11px] font-bold text-abody-teal">3ヶ月後</p>
                    <p className="text-sm font-bold text-neutral-900">{result.weight.month3.minKg}〜{result.weight.month3.maxKg}kg</p>
                    <p className="text-xs text-neutral-600">{changeLabel(result.weight.kind, result.weight.month3.changeMin, result.weight.month3.changeMax)}</p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 px-3 py-2">
                    <p className="text-[11px] font-bold text-neutral-500">半年後</p>
                    <p className="text-sm font-bold text-neutral-900">{result.weight.month6.minKg}〜{result.weight.month6.maxKg}kg</p>
                    <p className="text-xs text-neutral-600">{changeLabel(result.weight.kind, result.weight.month6.changeMin, result.weight.month6.changeMax)}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl border border-abody-teal/20 bg-abody-teal/5 p-4">
                <p className="text-xs font-bold text-abody-teal mb-1">3ヶ月後</p>
                <p className="text-sm text-neutral-800 leading-relaxed">{result.month3}</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-bold text-neutral-500 mb-1">半年後</p>
                <p className="text-sm text-neutral-800 leading-relaxed">{result.month6}</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm font-bold text-neutral-900 mb-3">実際の会員様は、こんな通い方でこんな結果が出ています</p>
              <div className="space-y-3">
                {result.cases.map((c) => (
                  <div key={c.name} className="rounded-2xl border border-neutral-100 p-4">
                    <p className="font-bold text-neutral-900 text-sm mb-1">{c.name}</p>
                    <p className="text-xs text-neutral-500 mb-2">通い方：{c.habit}</p>
                    <p className="text-sm text-neutral-700 leading-relaxed">{c.result}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-neutral-500 mb-2">※数字は目安です。体質・食事・睡眠で差が出ます。詳細は体験でトレーナーが確認します。</p>
            <p className="text-[11px] text-neutral-400 mb-6">60分受け放題プランもある</p>
            {pickStore ? (
              <div>
                <p className="text-sm font-bold text-neutral-900 mb-3">体験もしくは相談する店舗を選んでください</p>
                <p className="text-xs text-neutral-500 mb-4">診断結果をコピーして公式LINEを開きます。トークに貼ると、この内容をもとに体験の案内ができます。</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CAMPAIGN_STORES.map((store) => (
                    <button key={store.id} type="button" onClick={() => copyToLine(store.id)} className={`h-12 rounded-xl font-semibold ${store.buttonClass}`}>
                      {store.name}の公式LINE
                    </button>
                  ))}
                </div>
                {copied && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-abody-teal font-medium">
                    <Check className="w-4 h-4" />診断結果をコピーしました。LINEに貼り付けて送ってください。
                  </p>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => setPickStore(true)} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-abody-teal text-white font-bold shadow-soft hover:bg-abody-teal-dark transition-colors">
                この内容を元にプロのトレーナーに相談する <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button type="button" onClick={reset} className="mt-5 block text-center w-full text-sm text-neutral-500">もう一度診断する</button>
          </div>
        )}
      </div>
    </section>
  );
}
