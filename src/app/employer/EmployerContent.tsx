"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Bot, Clock, Send, ExternalLink, Users, Briefcase, Star, Mail, Calendar, Zap, Shield, CheckCircle2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_CANDIDATES, MOCK_EMPLOYERS } from "@/lib/mock-candidates";
import { mockCandidates, mockEmployers } from "@/lib/mock-data";
import { calculateEmployerTrustScore, getEmployerTrustLevel, getEmployerLevelLabel, getEmployerImprovementTips, getEmployerScoreBreakdown } from "@/lib/ratings";
import { INTERVIEW_PLATFORMS, generateInterviewQuestionsForJob, getEmptyScorecard } from "@/lib/interviews";
import { motion, AnimatePresence } from "framer-motion";
import { calculateMatchScore, getFullMatchResult } from "@/lib/matching";
import { MatchScoreCard } from "@/components/match/MatchComponents";
import { VacancyQualityBadge } from "@/components/match/VacancyQualityBadge";

type Job = { id: string; title: string; district: string; salaryText: string; salaryMin: number; salaryMax: number; schedule: string; status: string; createdAt: string; contact: string; category?: string };

export default function EmployerContent({ jobs, jobsCount }: { jobs: Job[]; jobsCount: number }) {
  const [showTgModal, setShowTgModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"jobs" | "candidates" | "interviews" | "coach">("jobs");
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewPlatform, setInterviewPlatform] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewDuration, setInterviewDuration] = useState(15);
  const [schedulingFor, setSchedulingFor] = useState<string | null>(null);
  const [scheduleState, setScheduleState] = useState<"idle" | "loading" | "success">("idle");

  const empData = MOCK_EMPLOYERS[0];
  const trustScore = empData.rating.trustScore;
  const trustLevel = empData.rating.level;
  const tips = getEmployerImprovementTips(empData as any);
  const breakdown = empData.rating.scoreBreakdown;

  // Use the first job as the demo context for matching
  const demoJob = jobs[0] || { title: "Бариста", category: "HoReCa", district: "14 мкр", schedule: "2/2", salaryMin: 150000 };

  const scheduleInterview = () => {
    setScheduleState("loading");
    setTimeout(() => { setScheduleState("success"); setTimeout(() => { setShowInterviewModal(false); setScheduleState("idle"); }, 2000); }, 1500);
  };

  // AI Hiring Coach suggestions
  const coachSuggestions = [
    { icon: "💰", text: "Добавьте зарплату к вакансиям без указанной оплаты — это увеличит отклики на 40%", priority: "high" },
    { icon: "📍", text: "Укажите точный микрорайон для каждой вакансии — кандидатам важна близость к дому", priority: "medium" },
    { icon: "🌱", text: "Отметьте вакансии как «Подходит для студентов» — это расширит охват на 25%", priority: "medium" },
    { icon: "✅", text: "Подтвердите актуальность вакансий — это повысит ваш Trust Score", priority: "low" },
    { icon: "🗣️", text: "Добавьте требуемые языки — это улучшит мэтчинг с подходящими кандидатами", priority: "medium" },
  ];

  const mockInterviewQuestions = generateInterviewQuestionsForJob({ category: "HoReCa" });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Кабинет работодателя</h1>
          <p className="text-slate-500 text-sm mt-1">{empData.businessName} · {empData.district}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowTgModal(true)} className="rounded-xl font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2"><Bot className="w-4 h-4" /> Telegram</Button>
          <Link href="/employer/new"><Button className="rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold gap-2"><Plus className="w-4 h-4" /> Новая вакансия</Button></Link>
        </div>
      </div>

      {/* Trust Score Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-[40px]" />
        <div className="relative z-10 flex items-center gap-5 flex-1">
          <div className="text-center">
            <p className="text-4xl font-black">{trustScore}</p>
            <p className="text-xs font-bold text-emerald-400 mt-1">{getEmployerLevelLabel(trustLevel)}</p>
          </div>
          <div className="h-12 w-px bg-slate-700" />
          <div className="text-sm space-y-1">
            <p className="text-slate-400 font-medium">Скорость ответа: <span className="text-white font-bold">{empData.rating.averageResponseTime} мин</span></p>
            <p className="text-slate-400 font-medium">Отклик: <span className="text-white font-bold">{empData.rating.responseRate}%</span></p>
            <p className="text-slate-400 font-medium">Полнота вакансий: <span className="text-white font-bold">{empData.rating.vacancyCompletenessAvg}%</span></p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <Shield className={`w-5 h-5 ${empData.rating.verifiedContact ? "text-emerald-400" : "text-slate-500"}`} />
          <span className="text-sm font-bold text-slate-300">{empData.rating.verifiedContact ? "Контакт подтверждён" : "Не подтверждён"}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {([
          { key: "jobs", label: `Вакансии (${jobsCount})` },
          { key: "candidates", label: "Кандидаты" },
          { key: "interviews", label: "Собеседования" },
          { key: "coach", label: "AI Коуч" },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {tab.label} {tab.key === "coach" && <span className="bg-amber-100 text-amber-700 text-[10px] ml-1 px-1.5 py-0.5 rounded-full uppercase">AI</span>}
          </button>
        ))}
      </div>

      {/* JOBS TAB */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-4" /><p className="text-xl font-bold text-slate-800">Пока нет вакансий</p>
            </div>
          ) : jobs.map(job => (
            <div key={job.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row justify-between gap-4 group hover:border-indigo-100 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                  <VacancyQualityBadge job={job} />
                </div>
                <p className="text-sm font-bold text-indigo-600 mb-2">{job.salaryText || (job.salaryMin > 0 ? `от ${job.salaryMin.toLocaleString()} ₸` : "По договорённости")}</p>
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-3"><span className="bg-slate-100 px-2 py-1 rounded-md">{job.district}</span><span className="bg-slate-100 px-2 py-1 rounded-md">{job.schedule}</span></p>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                <Link href={`/vacancies/${job.id}`}><Button variant="outline" className="w-full rounded-xl text-xs font-bold gap-2"><ExternalLink className="w-3.5 h-3.5" /> Открыть</Button></Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CANDIDATES TAB */}
      {activeTab === "candidates" && (
        <div className="space-y-6">
          <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 flex items-start gap-4">
            <Bot className="w-6 h-6 text-indigo-600 shrink-0" />
            <div><p className="font-bold text-slate-900">AI-мэтчинг кандидатов</p><p className="text-sm font-medium text-slate-600 mt-1">Кандидаты отсортированы по соответствию вашей вакансии "{demoJob.title}".</p></div>
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            {mockCandidates
              .map(cand => ({ ...cand, matchResult: getFullMatchResult(cand, demoJob) }))
              .sort((a, b) => b.matchResult.score - a.matchResult.score)
              .map((cand: any) => (
              <div key={cand.userId} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all border-l-4 border-l-indigo-500">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-lg truncate">{cand.name}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1">{cand.aiHeadline}</p>
                    </div>
                    <div className="shrink-0 scale-90 origin-top-right">
                      <MatchScoreCard result={cand.matchResult} compact />
                    </div>
                  </div>
                  
                  {/* Languages */}
                  <div className="flex gap-2 flex-wrap mb-4">
                    {cand.languages?.map((l: any) => <span key={l.language} className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{l.language} ({l.level === "native" ? "родной" : l.level === "fluent" ? "своб." : l.level === "conversational" ? "разг." : "баз."})</span>)}
                  </div>
                  
                  {/* Reasons */}
                  <div className="space-y-1.5 mb-6">
                    {cand.matchResult.reasons.slice(0, 3).map((r: string, i: number) => (
                      <p key={i} className="text-xs font-medium text-slate-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> {r}</p>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => { setSchedulingFor(cand.name); setShowInterviewModal(true); }} className="flex-1 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold h-11 gap-2"><Calendar className="w-4 h-4" /> Вызвать</Button>
                    <Button variant="outline" className="rounded-xl font-bold h-11 px-5 border-slate-200"><Mail className="w-4 h-4 text-slate-500" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* INTERVIEWS TAB */}
      {activeTab === "interviews" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-600" /> AI-подготовленные вопросы</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Нейросеть подготовила вопросы на основе ваших вакансий и профилей кандидатов.</p>
            <div className="space-y-4">
              {mockInterviewQuestions.map((q, i) => (
                <div key={q.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-indigo-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{q.question}</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase">{q.type === "warmup" ? "Знакомство" : q.type === "experience" ? "Опыт" : q.type === "situation" ? "Ситуация" : q.type === "availability" ? "График" : q.type === "language" ? "Язык" : q.type === "reliability" ? "Надёжность" : "Вопрос кандидата"}</span>
                        <span className="text-[10px] font-medium text-slate-400">{q.purpose}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COACH TAB */}
      {activeTab === "coach" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-6 flex items-start gap-4">
            <Bot className="w-8 h-8 text-amber-600 shrink-0" />
            <div><p className="font-bold text-slate-900 text-lg">AI Hiring Coach</p><p className="text-sm font-medium text-slate-600 mt-1">Персональные рекомендации для улучшения ваших вакансий и привлечения кандидатов.</p></div>
          </div>
          <div className="space-y-4">
            {coachSuggestions.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 hover:border-indigo-100 transition-colors">
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{s.text}</p>
                  <span className={`mt-2 inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${s.priority === "high" ? "bg-red-50 text-red-600" : s.priority === "medium" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"}`}>{s.priority === "high" ? "Важно" : s.priority === "medium" ? "Рекомендация" : "Совет"}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Trust Score Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h4 className="font-extrabold text-slate-900 mb-4">Состав Trust Score</h4>
            {[
              { label: "Подтв. контакт", value: breakdown.verifiedContact, max: 15 },
              { label: "Профиль", value: breakdown.completeProfile, max: 15 },
              { label: "Вакансии", value: breakdown.vacancyCompleteness, max: 20 },
              { label: "Скорость", value: breakdown.fastResponse, max: 15 },
              { label: "Отзывы", value: breakdown.positiveFeedback, max: 20 },
              { label: "Актуальность", value: breakdown.freshnessConfirmations, max: 10 },
            ].map(item => (
              <div key={item.label} className="mb-3">
                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-600">{item.label}</span><span className="text-slate-400">{item.value}/{item.max}</span></div>
                <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(item.value / item.max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Scheduler Modal */}
      <AnimatePresence>
        {showInterviewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => scheduleState === "idle" && setShowInterviewModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }} onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
              {scheduleState === "success" ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-emerald-500" /></div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Собеседование назначено!</h3>
                  <p className="text-slate-500 font-medium">Кандидат {schedulingFor} получит уведомление.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div><h2 className="text-2xl font-extrabold text-slate-900">Назначить собеседование</h2><p className="text-slate-500 font-medium mt-1">Кандидат: {schedulingFor}</p></div>
                    <button onClick={() => setShowInterviewModal(false)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200"><X className="w-5 h-5 text-slate-500" /></button>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-3">Платформа</p>
                      <div className="grid grid-cols-3 gap-2">
                        {INTERVIEW_PLATFORMS.map(p => (
                          <button key={p.id} onClick={() => setInterviewPlatform(p.id)} className={`p-3 rounded-xl text-center border-2 transition-all ${interviewPlatform === p.id ? "border-indigo-600 bg-indigo-50" : "border-slate-100"}`}>
                            <span className="text-lg block">{p.icon}</span>
                            <span className="text-[10px] font-bold text-slate-700">{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-bold text-slate-700 mb-2 block">Дата</label><Input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="h-11 rounded-xl" /></div>
                      <div><label className="text-sm font-bold text-slate-700 mb-2 block">Время</label><Input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} className="h-11 rounded-xl" /></div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-3">Длительность</p>
                      <div className="flex gap-2">{[10,15,30,45].map(d => <button key={d} onClick={() => setInterviewDuration(d)} className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${interviewDuration === d ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>{d} мин</button>)}</div>
                    </div>
                    <Button onClick={scheduleInterview} disabled={scheduleState === "loading"} className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-slate-900 text-white font-bold">
                      {scheduleState === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Назначить"}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telegram Modal */}
      {showTgModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTgModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
            <Bot className="w-8 h-8 text-blue-500 mb-4" /><h3 className="text-2xl font-extrabold text-slate-900 mb-4">Telegram-публикация</h3>
            <div className="bg-slate-900 text-emerald-400 rounded-2xl p-5 font-mono text-sm mb-6"><span className="text-white">/job</span> Бариста, 12 мкр<br/>Зарплата: 150 000 ₸<br/>Писать: @username</div>
            <Button onClick={() => setShowTgModal(false)} className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold">Понятно</Button>
          </div>
        </div>
      )}
    </div>
  );
}
