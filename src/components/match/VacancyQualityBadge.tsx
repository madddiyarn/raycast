"use client";

import { getPublishabilityStatus, calculateVacancyCompleteness, calculateVacancySafety, getVacancyImprovementTips } from "@/lib/vacancy-quality";
import { ShieldCheck, ShieldAlert, ShieldX, CheckCircle2, AlertCircle } from "lucide-react";

// ── VacancyQualityBadge ───────────────────────────────────────────────────────
export function VacancyQualityBadge({ job, compact = false }: { job: any; compact?: boolean }) {
  const status = getPublishabilityStatus(job);
  const safety = calculateVacancySafety(job);
  const completeness = calculateVacancyCompleteness(job);

  const statusConfig = {
    ready:       { icon: <CheckCircle2 className="w-4 h-4" />,   color: "text-emerald-700 bg-emerald-100 border-emerald-200" },
    needs_info:  { icon: <AlertCircle className="w-4 h-4" />,    color: "text-amber-700 bg-amber-100 border-amber-200" },
    weak:        { icon: <AlertCircle className="w-4 h-4" />,    color: "text-orange-700 bg-orange-100 border-orange-200" },
    suspicious:  { icon: <ShieldX className="w-4 h-4" />,        color: "text-red-700 bg-red-100 border-red-200" },
  };
  const cfg = statusConfig[status.status];

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${cfg.color}`}>
        {cfg.icon}
        {status.label}
      </span>
    );
  }

  const safetyConfig = {
    high:   { icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />, label: "Высокий", color: "text-emerald-700" },
    medium: { icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,   label: "Средний", color: "text-amber-700" },
    low:    { icon: <ShieldX className="w-5 h-5 text-red-600" />,         label: "Низкий",  color: "text-red-700" },
  };
  const safeCfg = safetyConfig[safety.level];
  const tips = getVacancyImprovementTips(job);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      {/* Publishability */}
      <div>
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Готовность к публикации</p>
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold border ${cfg.color}`}>
          {cfg.icon} {status.label}
        </span>
        {status.missingRequired.length > 0 && (
          <p className="text-xs text-red-600 font-medium mt-1">Обязательно: {status.missingRequired.join(", ")}</p>
        )}
      </div>

      {/* Completeness bar */}
      <div>
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="text-slate-700">Полнота</span>
          <span className="text-slate-500">{completeness.score}/100</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full">
          <div
            className={`h-full rounded-full transition-all ${completeness.score >= 80 ? "bg-emerald-500" : completeness.score >= 50 ? "bg-amber-500" : "bg-red-400"}`}
            style={{ width: `${completeness.score}%` }}
          />
        </div>
      </div>

      {/* Safety */}
      <div className="flex items-center gap-2">
        {safeCfg.icon}
        <span className={`text-sm font-bold ${safeCfg.color}`}>Безопасность: {safeCfg.label}</span>
      </div>

      {/* Safety flags */}
      {safety.flags.length > 0 && (
        <div className="space-y-1">
          {safety.flags.map((f, i) => (
            <p key={i} className="text-xs text-slate-500 font-medium">{f}</p>
          ))}
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div className="border-t border-slate-100 pt-3 space-y-1">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Советы по улучшению</p>
          {tips.map((t, i) => (
            <p key={i} className="text-xs text-indigo-700 font-medium">{t}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CompletionBadge (inline chip) ─────────────────────────────────────────────
export function CompletionBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-700 bg-emerald-100" : score >= 50 ? "text-amber-700 bg-amber-100" : "text-red-700 bg-red-100";
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${color}`}>
      {score}% полнота
    </span>
  );
}
