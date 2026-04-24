"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/lib/types";
import { calculateCandidateWorkScore, getCandidateLevel, getCandidateLevelLabel, getCandidateImprovementTips, getCandidateBadges } from "@/lib/ratings";
import { mockCandidates } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Settings, Briefcase, Bot, Globe, Shield, Zap, Award, MapPin, Clock, ChevronRight, Unlock, Upload, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) router.push("/auth/login");
    else setUser(u);
  }, [router]);

  if (!user) return null;

  // Use Aliya demo candidate data
  const mockData = mockCandidates.find(c => c.userId === "cand_aliya") || mockCandidates[0];
  const rating = mockData.rating;
  const score = rating.workScore;
  const level = rating.level;
  const badges = rating.badges;
  const tips = getCandidateImprovementTips(mockData as any);

  // Opportunity unlocking mock
  const opportunities = [
    { action: "Добавьте казахский язык", locked: 7, category: "Service" },
    { action: "Укажите выходные дни", locked: 12, category: "Shift" },
    { action: "Пройдите Customer Service", locked: 9, category: "HoReCa" },
    { action: "Загрузите резюме", locked: 0, category: "quality" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Личный кабинет</h1>
          <p className="text-slate-500 font-medium mt-1">Ваш профессиональный профиль и репутация</p>
        </div>
        <Button variant="outline" className="rounded-xl font-bold gap-2 text-slate-600 border-slate-200"><Settings className="w-4 h-4" /> Настройки</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-white shadow-md"><UserIcon className="w-8 h-8 text-indigo-600" /></div>
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-slate-900">{user.fullName}</h2>
                <p className="text-indigo-600 font-semibold text-sm mt-0.5">{mockData.aiHeadline}</p>
                <div className="flex items-center gap-3 text-sm text-slate-500 font-medium mt-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Актау</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {mockData.readyToday ? "Готов сегодня" : "В поиске"}</span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Bot className="w-32 h-32" /></div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0"><Bot className="w-5 h-5 text-indigo-600" /></div>
                <div><h3 className="text-sm font-bold text-slate-900 mb-1">AI-Саммари</h3><p className="text-sm font-medium text-slate-600 leading-relaxed italic">«{mockData.aiSummary}»</p></div>
              </div>
            </div>
          </motion.div>

          {/* Languages */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6"><Globe className="w-5 h-5 text-indigo-600" /> Языки</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {mockData.languages?.map((lang: any) => (
                <div key={lang.language} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-indigo-200 transition-colors">
                  <p className="font-bold text-slate-900">{lang.language}</p>
                  <p className="text-xs font-semibold text-indigo-600 capitalize mt-0.5">{lang.level === "native" ? "Родной" : lang.level === "fluent" ? "Свободный" : lang.level === "conversational" ? "Разговорный" : "Базовый"}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {lang.canServeCustomers && <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">🛒 Обслуживание</span>}
                    {lang.canInterview && <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">🎤 Интервью</span>}
                    {lang.canWriteMessages && <span className="bg-violet-50 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full">✍️ Письмо</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6"><Star className="w-5 h-5 text-indigo-600" /> Навыки</h3>
            <div className="flex flex-wrap gap-2">
              {mockData.skills?.map((sk: any) => (
                <span key={sk.name} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5">
                  {sk.name}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${sk.level === "experienced" ? "bg-indigo-600 text-white" : sk.level === "confident" ? "bg-indigo-100 text-indigo-700" : sk.level === "basic" ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-400"}`}>
                    {sk.level === "experienced" ? "Опыт" : sk.level === "confident" ? "Увер" : sk.level === "basic" ? "Баз" : "Нач"}
                  </span>
                </span>
              ))}
            </div>
          </motion.div>

          {/* Opportunity Unlocking */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 shadow-sm p-8">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-2"><Unlock className="w-5 h-5 text-amber-600" /> Откройте больше вакансий</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Сейчас доступно: <span className="font-bold text-slate-900">18 вакансий</span>. Улучшите профиль для доступа к большему.</p>
            <div className="space-y-3">
              {opportunities.filter(o => o.locked > 0).map(o => (
                <div key={o.action} className="flex items-center justify-between bg-white/80 rounded-2xl p-4 border border-amber-100/50">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-bold text-slate-800">{o.action}</span>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-xs font-extrabold px-3 py-1 rounded-full">+{o.locked} вакансий</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Work Score */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-lg shadow-slate-900/20">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-[30px]" />
            <div className="relative z-10">
              <p className="text-sm font-bold text-slate-400 mb-1">Work Score</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black">{score}</span>
                <span className="text-sm font-bold text-indigo-400 pb-1.5">/ 100</span>
              </div>
              <p className="text-sm font-bold text-indigo-400">{getCandidateLevelLabel(level)}</p>
              <div className="h-2 w-full bg-slate-800 rounded-full mt-4 mb-2"><div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" style={{ width: `${score}%` }} /></div>
            </div>
          </motion.div>

          {/* Score Breakdown */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h4 className="font-extrabold text-slate-900 mb-4">Состав Work Score</h4>
            <div className="space-y-3">
              {[
                { label: "Профиль", value: rating.scoreBreakdown.profileCompleteness, max: 20 },
                { label: "Языки", value: rating.scoreBreakdown.languagesAdded, max: 10 },
                { label: "Доступность", value: rating.scoreBreakdown.availabilityAdded, max: 10 },
                { label: "Резюме/AI", value: rating.scoreBreakdown.cvOrAiSummary, max: 10 },
                { label: "Скорость", value: rating.scoreBreakdown.fastResponse, max: 10 },
                { label: "Интервью", value: rating.scoreBreakdown.completedInterview, max: 15 },
                { label: "Отзывы", value: rating.scoreBreakdown.positiveFeedback, max: 15 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-600">{item.label}</span><span className="text-slate-400">{item.value}/{item.max}</span></div>
                  <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(item.value / item.max) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h4 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-indigo-600" /> Бейджи</h4>
            <div className="space-y-2">
              {badges.map((b: any) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-50 bg-slate-50/50">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-sm font-bold text-slate-700">{b.title}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Improvement Tips */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h4 className="font-extrabold text-slate-900 mb-4">Как улучшить</h4>
            <div className="space-y-2">
              {tips.map((t, i) => (
                <p key={i} className="text-sm text-slate-600 font-medium flex items-start gap-2"><Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> {t}</p>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={() => router.push("/search")} className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-slate-900 text-white font-bold shadow-lg shadow-indigo-600/20">Найти работу</Button>
            <Button onClick={() => router.push("/interviews")} variant="outline" className="w-full h-12 rounded-xl font-bold border-slate-200">Мои собеседования</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
