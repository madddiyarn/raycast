"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageSquare, BrainCircuit, CheckCircle2, Users, Send, RefreshCcw, ArrowRight, Shield, Zap } from "lucide-react";
import { simulateTelegramConversation, BotTurn } from "@/lib/telegram-parser";
import { getFullMatchResult } from "@/lib/matching";
import { calculateVacancyCompleteness, calculateVacancySafety, getPublishabilityStatus } from "@/lib/vacancy-quality";
import { MatchBreakdown, MatchWarnings, MatchReasonList, ScoreBar } from "@/components/match/MatchComponents";
import { mockCandidates, mockJobs } from "@/lib/mock-data";

const DEMO_INPUTS = [
  "нужен бариста срочно в 15 мкр 180к 2/2 можно студентам @cafeaktau",
  "/job ищу продавца 14 мкр 150к 5/2 без опыта @storeaktau",
  "нужен курьер гибкий график от 250к по городу @dostavka_aktau",
];

export default function DemoFlowClient() {
  const [rawInput, setRawInput] = useState(DEMO_INPUTS[0]);
  const [step, setStep] = useState<number>(0);
  const [conversation, setConversation] = useState<ReturnType<typeof simulateTelegramConversation> | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const demo = conversation;
  const demoCandidate = mockCandidates.find(c => c.userId === "cand_aliya") ?? mockCandidates[0];
  const finalJob = demo?.finalJob
    ? {
        ...demo.finalJob,
        id: "demo-job",
        salaryMin: demo.finalJob.salary ?? 180000,
        salaryMax: demo.finalJob.salary ? demo.finalJob.salary + 40000 : 220000,
        employerTrustScore: 85,
      }
    : null;

  const matchResult = finalJob ? getFullMatchResult(demoCandidate, finalJob) : null;
  const completeness = finalJob ? calculateVacancyCompleteness(finalJob) : null;
  const safety = finalJob ? calculateVacancySafety(finalJob) : null;
  const publishability = finalJob ? getPublishabilityStatus(finalJob) : null;

  function run() {
    const conv = simulateTelegramConversation(rawInput);
    setConversation(conv);
    setStep(1);
  }

  function reset() {
    setConversation(null);
    setStep(0);
  }

  const visibleTurns: BotTurn[] = demo ? demo.turns.slice(0, step < 2 ? 99 : 99) : [];

  return (
    <div className="absolute inset-0 flex flex-col text-sm bg-slate-900">
      
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          <span className="text-white font-black text-sm tracking-tight">Jumys AI — End-to-End Demo</span>
        </div>
        <div className="flex items-center gap-2">
          {matchResult && (
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 border border-indigo-700 rounded-lg px-3 py-1 transition-colors"
            >
              {showDebug ? "Скрыть Debug" : "🔍 Debug Panel"}
            </button>
          )}
          {demo && (
            <button
              onClick={reset}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-300 flex items-center gap-1 border border-slate-700 rounded-lg px-3 py-1"
            >
              <RefreshCcw className="w-3 h-3" /> Сброс
            </button>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-3 overflow-hidden min-h-0">

        {/* LEFT: Telegram Conversation */}
        <div className="border-r border-white/10 flex flex-col bg-slate-900/50">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
            <MessageSquare className="w-3.5 h-3.5" /> Telegram
          </div>

          {!demo ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="w-full space-y-2">
                <label className="text-white/60 font-bold text-[11px] uppercase tracking-wider">Введите вакансию для теста</label>
                <textarea
                  value={rawInput}
                  onChange={e => setRawInput(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl text-white text-sm px-4 py-3 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="нужен бариста 15 мкр 180к 2/2..."
                />
                <div className="flex gap-2 flex-wrap">
                  {DEMO_INPUTS.map((d, i) => (
                    <button key={i} onClick={() => setRawInput(d)} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 border border-indigo-900 rounded-lg px-2 py-0.5 truncate max-w-[120px]">
                      {["Бариста", "Продавец", "Курьер"][i]}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={run}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl py-3 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/30"
              >
                <Send className="w-4 h-4" /> Запустить AI Demo
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence initial={false}>
                {demo.turns.map((turn, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2, duration: 0.3 }}
                    className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2.5 ${
                        turn.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-md"
                          : "bg-slate-700 text-slate-100 rounded-bl-md"
                      }`}
                    >
                      {turn.role === "bot" && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Bot className="w-3 h-3 text-indigo-400" />
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Jumys AI</span>
                        </div>
                      )}
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{turn.text}</p>
                      {turn.actions && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {turn.actions.map(a => (
                            <span
                              key={a.value}
                              className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${
                                a.style === "primary"
                                  ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                                  : a.style === "danger"
                                  ? "border-red-500 text-red-400 bg-red-500/10"
                                  : "border-slate-500 text-slate-400"
                              }`}
                            >
                              {a.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* CENTER: AI Processing + Vacancy Data */}
        <div className="border-r border-white/10 flex flex-col overflow-y-auto">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" /> AI Обработка
          </div>

          {showDebug && matchResult ? (
            <div className="flex-1 p-4">
              <div className="bg-slate-950 text-green-400 rounded-xl p-4 font-mono text-[10px] overflow-auto h-full space-y-2 border border-green-900/30">
                <p className="text-green-300 font-black text-xs mb-3">🔍 Match Debug Panel</p>
                <p className="text-green-600">CANDIDATE: {demoCandidate.name}</p>
                <p>districts: {(demoCandidate.preferredDistricts ?? []).join(", ")}</p>
                <p>categories: {(demoCandidate.preferredCategories ?? []).join(", ")}</p>
                <p>exp: {demoCandidate.experienceLevel}</p>
                <p className="mt-2 text-green-600">JOB: {finalJob?.title}</p>
                <p>district: {finalJob?.district}</p>
                <p>schedule: {finalJob?.schedule}</p>
                <p>expReq: {String(finalJob?.experienceRequired)}</p>
                <div className="mt-3 border-t border-green-900/40 pt-3">
                  <p className="text-green-600 mb-2">BREAKDOWN:</p>
                  {Object.entries(matchResult.breakdown).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex gap-2 mb-0.5">
                      <span className="w-20 text-green-700">{k}:</span>
                      <span className={v.awarded === v.max ? "text-emerald-400" : v.awarded === 0 ? "text-red-400" : "text-amber-400"}>{v.awarded}/{v.max}</span>
                      <span className="text-green-600 truncate text-[9px]">{v.label}</span>
                    </div>
                  ))}
                  <p className="mt-3 text-xl font-black text-white">{matchResult.score}/100</p>
                </div>
              </div>
            </div>
          ) : !demo ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/20 text-xs font-medium text-center px-6">Запустите demo слева, чтобы увидеть AI обработку</p>
            </div>
          ) : (
            <div className="flex-1 p-4 space-y-4">
              {/* Parsed fields */}
              {demo.finalJob && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Структурированная вакансия</p>
                  <h3 className="font-black text-xl text-slate-900 mb-1">{demo.finalJob.title ?? "Вакансия"}</h3>
                  <div className="flex flex-wrap gap-2 text-xs font-bold mb-3">
                    {demo.finalJob.district && <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">📍 {demo.finalJob.district}</span>}
                    {demo.finalJob.salaryText && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg">💰 {demo.finalJob.salaryText}</span>}
                    {demo.finalJob.schedule && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg">🕐 {demo.finalJob.schedule}</span>}
                    {demo.finalJob.studentFriendly && <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-lg">🎓 Студентам</span>}
                  </div>
                  {demo.finalJob.contact && <p className="text-xs text-slate-500 font-mono">{demo.finalJob.contact}</p>}
                </motion.div>
              )}

              {/* Quality Score */}
              {completeness && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Качество вакансии</p>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>Полнота</span>
                    <span className="text-slate-400">{completeness.score}/100</span>
                  </div>
                  <ScoreBar value={completeness.score} max={100} color="emerald" />
                  <div className="flex justify-between text-xs font-bold mt-3 mb-1">
                    <span>Безопасность</span>
                    <span className={safety?.level === "high" ? "text-emerald-600" : "text-amber-600"}>{safety?.level === "high" ? "Высокая" : safety?.level === "medium" ? "Средняя" : "Низкая"}</span>
                  </div>
                  <ScoreBar value={safety?.score ?? 75} max={100} color={safety?.level === "high" ? "emerald" : "amber"} />
                  {publishability && (
                    <div className={`mt-3 text-xs font-bold rounded-lg px-3 py-1.5 inline-block ${publishability.status === "ready" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {publishability.label}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Before / After AI text */}
              {demo.finalJob && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">AI улучшение текста</p>
                  <div className="mb-2">
                    <p className="text-[10px] font-black text-slate-400 mb-1">До:</p>
                    <p className="text-xs font-mono bg-slate-50 rounded-lg p-2 text-slate-600">{rawInput}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-400 mx-auto my-1" />
                  <div>
                    <p className="text-[10px] font-black text-indigo-600 mb-1">После (AI):</p>
                    <p className="text-xs bg-indigo-50 text-indigo-800 rounded-lg p-2 font-medium leading-relaxed">
                      {demo.finalJob.title && `${demo.finalJob.title} в ${demo.finalJob.district ?? "Актау"}. Зарплата: ${demo.finalJob.salaryText ?? "по договорённости"}. График: ${demo.finalJob.schedule ?? "уточнять"}. ${demo.finalJob.studentFriendly ? "Подходит студентам." : ""} ${(demo.finalJob as any).experienceRequired === false ? "Опыт не обязателен." : ""} Контакт: ${demo.finalJob.contact ?? "уточните"}.`}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Match Result */}
        <div className="flex flex-col overflow-y-auto">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" /> Кандидат и Мэтч
          </div>

          {!matchResult ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/20 text-xs font-medium text-center px-6">Мэтч рассчитается после обработки вакансии</p>
            </div>
          ) : (
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* Candidate card */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl">🧑‍🎓</div>
                  <div>
                    <p className="font-black text-slate-900">{demoCandidate.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{demoCandidate.aiHeadline}</p>
                  </div>
                  <div className="ml-auto text-center">
                    <div className="text-2xl font-black text-indigo-600">{demoCandidate.rating?.workScore ?? 88}</div>
                    <div className="text-[9px] font-bold text-slate-400">Work Score</div>
                  </div>
                </div>
              </motion.div>

              {/* Match score */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-slate-800 rounded-2xl p-4">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-black text-white">{matchResult.score}</span>
                  <span className="text-base font-bold text-indigo-400 pb-1">%</span>
                </div>
                <p className="text-sm font-bold text-indigo-400 mb-3">{matchResult.level === "excellent" ? "Отличный мэтч" : matchResult.level === "strong" ? "Хороший мэтч" : "Возможный мэтч"}</p>
                <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.7)]" style={{ width: `${matchResult.score}%` }} />
                </div>
              </motion.div>

              {/* Breakdown */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Детальный breakdown</p>
                <MatchBreakdown breakdown={matchResult.breakdown} />
              </motion.div>

              {/* Reasons */}
              {matchResult.reasons.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl p-4">
                  <MatchReasonList reasons={matchResult.reasons} />
                </motion.div>
              )}

              {/* Warnings */}
              {matchResult.warnings.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  <MatchWarnings warnings={matchResult.warnings} />
                </motion.div>
              )}

              {/* Interview questions from weaknesses */}
              {matchResult.generatedInterviewQuestions.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="bg-indigo-900/50 border border-indigo-700 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-wider mb-3">🎤 Вопросы на интервью (из слабостей мэтча)</p>
                  <div className="space-y-2">
                    {matchResult.generatedInterviewQuestions.map((q, i) => (
                      <p key={i} className="text-xs text-slate-300 font-medium leading-relaxed">
                        {i + 1}. {q}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
