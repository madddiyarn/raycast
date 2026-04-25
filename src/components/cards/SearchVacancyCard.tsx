"use client";

import Link from "next/link";
import { Job, CandidateProfile } from "@/lib/types";
import { getFullMatchResult, MATCH_LEVEL_CONFIG } from "@/lib/matching";
import { calculateVacancyCompleteness } from "@/lib/vacancy-quality";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Building2, Bot, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export const SearchVacancyCard = ({
  job,
  candidate,
  onApply,
}: {
  job: Job;
  candidate: CandidateProfile | null;
  onApply: (j: Job) => void;
}) => {
  const matchResult = candidate ? getFullMatchResult(candidate, job) : null;
  const score = matchResult?.score ?? 0;
  const matchCfg = matchResult ? MATCH_LEVEL_CONFIG[matchResult.level] : null;
  const completeness = calculateVacancyCompleteness(job);
  const isHighMatch = score >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
    >
      {}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-2">
          {job.sourceType === "telegram" && (
            <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">
              <Bot className="w-3 h-3" /> Telegram
            </span>
          )}
          {job.freshnessStatus === "confirmed_today" && (
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">
              Актуально сегодня
            </span>
          )}
          {isHighMatch && (
            <span className="flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm shadow-indigo-600/30">
              <Zap className="w-3 h-3" /> Лучшее совпадение
            </span>
          )}
          {}
          {completeness.score >= 80 && (
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {completeness.score}% полнота
            </span>
          )}
        </div>

        {}
        {matchResult && (
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path
                  className={isHighMatch ? "text-indigo-500" : score > 60 ? "text-emerald-500" : "text-amber-500"}
                  strokeDasharray={`${score}, 100`}
                  strokeWidth="3"
                  stroke="currentColor"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className={`font-black text-xs ${isHighMatch ? "text-indigo-600" : score > 60 ? "text-emerald-600" : "text-amber-600"}`}>{score}%</span>
            </div>
            {matchCfg && (
              <span className={`text-[9px] font-bold mt-1 ${matchCfg.color}`}>{matchCfg.label}</span>
            )}
          </div>
        )}
      </div>

      <Link href={`/vacancies/${job.id}`}>
        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer">{job.title}</h3>
      </Link>
      <p className="font-bold text-indigo-600 mt-1">
        {job.salaryText || (job.salaryMin > 0 ? `от ${job.salaryMin.toLocaleString()} ₸` : "Зарплата не указана")}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium mt-4">
        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {job.district}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {job.schedule}</span>
        <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400" /> {job.category}</span>
      </div>

      {}
      <div className="flex gap-2 mt-3 flex-wrap">
        {job.studentFriendly && <span className="bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-full text-xs font-bold">🎓 Студентам</span>}
        {!job.experienceRequired && <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">✅ Без опыта</span>}
        {(job as any).requiredLanguages?.map((l: string) => (
          <span key={l} className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">🌐 {l}</span>
        ))}
      </div>

      {}
      {matchResult && matchResult.reasons.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Bot className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-bold text-indigo-700">Почему подходит:</span>
          </div>
          <ul className="space-y-0.5">
            {matchResult.reasons.slice(0, 2).map((r, i) => (
              <li key={i} className="text-xs text-indigo-700 font-medium flex items-start gap-1.5">
                <span className="mt-0.5">•</span> {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {}
      {matchResult && matchResult.warnings.length > 0 && (
        <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-700 font-medium">{matchResult.warnings[0]}</p>
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <Button
          onClick={() => onApply(job)}
          className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold transition-all shadow-md shadow-slate-200"
        >
          Откликнуться
        </Button>
        <Link href={`/vacancies/${job.id}`}>
          <Button variant="outline" className="h-11 px-5 rounded-xl font-bold border-slate-200 hover:bg-slate-50">
            Подробнее
          </Button>
        </Link>
      </div>

      {(job as any).safetyWarnings?.length ? (
        <div className="mt-4 flex items-start gap-2 bg-rose-50 text-rose-700 p-2.5 rounded-xl text-xs font-medium">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{(job as any).safetyWarnings[0]}</p>
        </div>
      ) : null}
    </motion.div>
  );
};
