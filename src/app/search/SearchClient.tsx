"use client";

import { useState, useEffect } from "react";
import { Job, CandidateProfile, SearchFilters } from "@/lib/types";
import { filterJobs, enhanceJobsWithAI } from "@/lib/search";
import { SearchVacancyCard } from "@/components/cards/SearchVacancyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, MapPin, X, Loader2, CheckCircle2, Bot, Globe, Shield, Zap, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchClient({ initialJobs, initialCandidate }: { initialJobs: Job[], initialCandidate: CandidateProfile | null }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [loading, setLoading] = useState(true);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [applyingTo, setApplyingTo] = useState<Job | null>(null);
  const [applyState, setApplyState] = useState<"idle" | "loading" | "success">("idle");

  useEffect(() => {
    
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("jumys_user") : null;
    let candidate = initialCandidate;
    try {
      if (savedUser) candidate = JSON.parse(savedUser);
    } catch (e) {
      console.error("Failed to parse saved user:", e);
    }
    
    const enhanced = enhanceJobsWithAI(initialJobs, candidate);
    setJobs(enhanced);
    setLoading(false);
  }, [initialJobs, initialCandidate]);

  const filteredJobs = filterJobs(jobs, filters).sort((a,b) => (b.matchScore || 0) - (a.matchScore || 0));

  const handleApply = (j: Job) => { setApplyingTo(j); setApplyState("idle"); };
  const confirmApply = () => {
    setApplyState("loading");
    setTimeout(() => { setApplyState("success"); setTimeout(() => setApplyingTo(null), 2000); }, 1500);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== false && v !== "" && !(Array.isArray(v) && v.length === 0)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Подбор вакансий</h1>
        <p className="text-slate-500 mt-2">ИИ анализирует сотни вакансий из Telegram и показывает те, что подходят вам лучше всего.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4"/> Фильтры {activeFilterCount > 0 && <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">{activeFilterCount}</span>}</h3>
              <button onClick={() => setFilters({})} className="text-xs font-semibold text-slate-400 hover:text-red-500">Сбросить</button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="бариста, продавец..." value={filters.query || ""} onChange={e => setFilters({...filters, query: e.target.value})} className="h-10 pl-9 rounded-xl bg-slate-50 border-slate-200" />
                </div>
              </div>

              {/* Basic toggles */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Умные фильтры</label>
                <div className="space-y-2.5">
                  {[
                    { key: "noExperienceOnly", label: "Без опыта", icon: "🌱" },
                    { key: "studentFriendlyOnly", label: "Для студентов", icon: "🎓" },
                    { key: "trialShiftAvailable", label: "Пробная смена", icon: "🧪" },
                    { key: "verifiedEmployerOnly", label: "Проверенный работодатель", icon: "✅" },
                    { key: "urgentOnly", label: "Срочный найм", icon: "⚡" },
                    { key: "readyToday", label: "Готовы сегодня", icon: "🕐" },
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={(filters as any)[f.key] || false} onChange={e => setFilters({...filters, [f.key]: e.target.checked})} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">{f.icon} {f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Зарплата от</label>
                <input type="range" min="0" max="500000" step="10000" value={filters.salaryMin || 0} onChange={e => setFilters({...filters, salaryMin: parseInt(e.target.value)})} className="w-full accent-indigo-600" />
                <p className="text-sm font-semibold text-slate-700 mt-2">от {(filters.salaryMin || 0).toLocaleString()} ₸</p>
              </div>

              {/* Languages */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-1"><Globe className="w-3 h-3" /> Языки</label>
                <div className="flex flex-wrap gap-1.5">
                  {["Казахский","Русский","English"].map(l => {
                    const active = filters.requiredLanguages?.includes(l);
                    return (
                      <button key={l} onClick={() => {
                        const cur = filters.requiredLanguages || [];
                        setFilters({...filters, requiredLanguages: active ? cur.filter(x => x !== l) : [...cur, l]});
                      }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${active ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">График</label>
                <div className="flex flex-wrap gap-1.5">
                  {["2/2","5/2","6/1","Гибкий","Удаленно"].map(s => {
                    const active = filters.schedule?.includes(s);
                    return (
                      <button key={s} onClick={() => {
                        const cur = filters.schedule || [];
                        setFilters({...filters, schedule: active ? cur.filter(x => x !== s) : [...cur, s]});
                      }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${active ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Сфера</label>
                <div className="flex flex-wrap gap-1.5">
                  {["HoReCa","Retail","Доставка","Service","Beauty","IT","Строительство","Медицина","Образование"].map(c => {
                    const active = filters.categories?.includes(c);
                    return (
                      <button key={c} onClick={() => {
                        const cur = filters.categories || [];
                        setFilters({...filters, categories: active ? cur.filter(x => x !== c) : [...cur, c]});
                      }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${active ? "border-violet-600 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-500"}`}>
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-500 font-medium">Найдено: <span className="font-bold text-slate-900">{filteredJobs.length}</span></p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-slate-900">Ничего не найдено</p>
              <p className="text-slate-500 font-medium mt-2">Попробуйте убрать фильтры или расширить район поиска.</p>
              <Button onClick={() => setFilters({})} className="mt-6 rounded-xl bg-slate-100 text-slate-900 font-bold hover:bg-slate-200">Очистить фильтры</Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-5">
              {filteredJobs.map(j => <SearchVacancyCard key={j.id} job={j} candidate={initialCandidate} onApply={handleApply} />)}
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyingTo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => applyState === "idle" && setApplyingTo(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }} onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
              <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-2xl font-extrabold text-slate-900">Отклик на вакансию</h2><p className="text-slate-500 font-medium mt-1">{applyingTo.title}</p></div>
                {applyState === "idle" && <button onClick={() => setApplyingTo(null)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200"><X className="w-5 h-5 text-slate-500"/></button>}
              </div>
              {applyState === "success" ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-emerald-500" /></div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Отклик отправлен!</h3>
                  <p className="text-slate-500 font-medium">Работодатель получит ваше резюме. Ожидайте ответа.</p>
                </div>
              ) : (
                <>
                  <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 mb-6">
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Bot className="w-4 h-4"/> AI-сообщение</p>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed italic">"Здравствуйте! Меня заинтересовала вакансия {applyingTo.title}. Готов оперативно приступить к работе."</p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setApplyingTo(null)} className="rounded-xl font-bold h-12 px-6">Отмена</Button>
                    <Button onClick={confirmApply} disabled={applyState === "loading"} className="rounded-xl font-bold h-12 px-8 bg-indigo-600 hover:bg-slate-900 text-white shadow-lg shadow-indigo-600/20">
                      {applyState === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Отправить отклик"}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
