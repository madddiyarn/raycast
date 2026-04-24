"use client";

import { useState } from "react";
import { Calendar, Clock, Video, Phone, MapPin, Bot, Star, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_CANDIDATES } from "@/lib/mock-candidates";
import { generateInterviewQuestionsForJob, generateCandidatePreparation, INTERVIEW_PLATFORMS } from "@/lib/interviews";
import { motion } from "framer-motion";

const MOCK_INTERVIEWS = [
  {
    id: "int_1", candidateName: "Алия", jobTitle: "Бариста", platform: "google_meet",
    date: "2026-04-26", time: "16:30", duration: 15, status: "scheduled" as const,
    employer: "Cafe Aktau",
  },
  {
    id: "int_2", candidateName: "Данияр", jobTitle: "Продавец-консультант", platform: "telegram_call",
    date: "2026-04-25", time: "11:00", duration: 30, status: "confirmed" as const,
    employer: "Nura Store",
  },
  {
    id: "int_3", candidateName: "Мадина", jobTitle: "Администратор", platform: "in_person",
    date: "2026-04-22", time: "14:00", duration: 15, status: "completed" as const,
    employer: "Cafe Aktau",
  },
];

export default function InterviewsPage() {
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null);
  const [showPrep, setShowPrep] = useState(false);

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-50 text-blue-700",
    confirmed: "bg-emerald-50 text-emerald-700",
    completed: "bg-slate-100 text-slate-600",
    cancelled: "bg-red-50 text-red-600",
  };
  const statusLabels: Record<string, string> = {
    scheduled: "Назначено",
    confirmed: "Подтверждено",
    completed: "Завершено",
    cancelled: "Отменено",
  };

  const questions = generateInterviewQuestionsForJob({ category: "HoReCa" });
  const prep = generateCandidatePreparation({ category: "HoReCa", title: "Бариста" }, { hasExperience: false, readyToday: true, preferredDistricts: ["14 мкр"] });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Собеседования</h1>
      <p className="text-slate-500 font-medium mb-10">Предстоящие и прошедшие интервью</p>

      <div className="space-y-4">
        {MOCK_INTERVIEWS.map(intv => {
          const isOpen = selectedInterview === intv.id;
          const platformInfo = INTERVIEW_PLATFORMS.find(p => p.id === intv.platform);

          return (
            <motion.div key={intv.id} layout className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Header */}
              <button onClick={() => setSelectedInterview(isOpen ? null : intv.id)} className="w-full p-6 flex items-center gap-5 text-left hover:bg-slate-50/50 transition-colors">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl shrink-0">{platformInfo?.icon || "📞"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-extrabold text-slate-900">{intv.jobTitle}</h3>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${statusColors[intv.status]}`}>{statusLabels[intv.status]}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mt-1">{intv.candidateName} · {intv.employer} · {platformInfo?.label}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-900">{new Date(intv.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</p>
                  <p className="text-xs font-bold text-indigo-600">{intv.time} · {intv.duration} мин</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Expanded */}
              {isOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-slate-100 px-6 pb-6">
                  <div className="pt-6 grid lg:grid-cols-2 gap-6">
                    {/* AI Questions */}
                    <div>
                      <h4 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Bot className="w-4 h-4 text-indigo-600" /> AI-подготовленные вопросы</h4>
                      <div className="space-y-3">
                        {questions.slice(0, 5).map((q, i) => (
                          <div key={q.id} className="flex gap-3 items-start">
                            <span className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
                            <p className="text-sm font-medium text-slate-700">{q.question}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Candidate Preparation */}
                    <div>
                      <h4 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Подготовка к интервью</h4>
                      <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 mb-4">
                        <p className="text-xs font-bold text-amber-700 uppercase mb-2">Рекомендуемое введение</p>
                        <p className="text-sm font-medium text-slate-700 italic">"{prep.suggestedIntro}"</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-3">Уточнить у работодателя</p>
                        <div className="space-y-2">
                          {prep.clarify.map(c => <p key={c} className="text-sm font-medium text-slate-600 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {c}</p>)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Buttons */}
                  {intv.status === "scheduled" && (
                    <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
                      <Button className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"><CheckCircle2 className="w-4 h-4" /> Подтвердить участие</Button>
                      <Button variant="outline" className="rounded-xl font-bold">Перенести</Button>
                      <Button variant="outline" className="rounded-xl text-red-600 border-red-200 font-bold">Отменить</Button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation System Info */}
      <div className="mt-8 bg-blue-50/50 rounded-3xl border border-blue-100 p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900">Система подтверждения</p>
          <p className="text-sm font-medium text-slate-600 mt-1">Подтвердите участие в интервью до начала. Неподтверждённые и пропущенные интервью снижают ваш Work Score.</p>
        </div>
      </div>
    </div>
  );
}
