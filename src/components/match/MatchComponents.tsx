"use client";

import { MatchResult, MatchScoreBreakdown, MATCH_LEVEL_CONFIG } from "@/lib/matching";

// ── ScoreBar ─────────────────────────────────────────────────────────────────
export function ScoreBar({ value, max, color = "indigo" }: { value: number; max: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-400",
    blue: "bg-blue-500",
  };
  const bar = colorMap[color] ?? "bg-indigo-500";

  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5">
      <div
        className={`${bar} h-1.5 rounded-full transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── MatchLevelBadge ───────────────────────────────────────────────────────────
export function MatchLevelBadge({ level }: { level: keyof typeof MATCH_LEVEL_CONFIG }) {
  const cfg = MATCH_LEVEL_CONFIG[level];
  return (
    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

// ── MatchScoreCard ────────────────────────────────────────────────────────────
export function MatchScoreCard({ result, compact = false }: { result: MatchResult; compact?: boolean }) {
  const cfg = MATCH_LEVEL_CONFIG[result.level];

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow">
          {result.score}%
        </div>
        <MatchLevelBadge level={result.level} />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-lg">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Match Score</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black">{result.score}</span>
              <span className="text-lg font-bold text-indigo-400">%</span>
            </div>
          </div>
          <span className={`text-xs font-black px-3 py-1.5 rounded-xl ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.6)]"
            style={{ width: `${result.score}%` }}
          />
        </div>
      </div>

      {/* Top reasons */}
      {result.reasons.length > 0 && (
        <div className="border-t border-slate-700 px-5 py-4 space-y-1.5">
          {result.reasons.slice(0, 3).map((r, i) => (
            <p key={i} className="text-xs font-medium text-slate-300">{r}</p>
          ))}
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="border-t border-yellow-900/40 px-5 py-3 bg-yellow-950/20 space-y-1.5">
          {result.warnings.slice(0, 2).map((w, i) => (
            <p key={i} className="text-xs font-medium text-amber-300">{w}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MatchBreakdown ────────────────────────────────────────────────────────────
const BREAKDOWN_LABELS: Record<keyof MatchScoreBreakdown, string> = {
  location:     "Местоположение",
  category:     "Категория",
  availability: "Доступность",
  experience:   "Опыт",
  skills:       "Навыки",
  language:     "Языки",
  salary:       "Зарплата",
  studentFit:   "Студентам",
  trustSafety:  "Доверие",
};

export function MatchBreakdown({ breakdown }: { breakdown: MatchScoreBreakdown }) {
  return (
    <div className="space-y-3">
      {(Object.entries(breakdown) as [keyof MatchScoreBreakdown, { awarded: number; max: number; label: string }][]).map(([key, val]) => {
        const pct = val.max > 0 ? val.awarded / val.max : 0;
        const color = pct >= 0.8 ? "emerald" : pct >= 0.5 ? "blue" : pct >= 0.2 ? "amber" : "red";
        return (
          <div key={key}>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700">{BREAKDOWN_LABELS[key]}</span>
              <span className="text-slate-500">{val.awarded}/{val.max}</span>
            </div>
            <ScoreBar value={val.awarded} max={val.max} color={color} />
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">{val.label}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── MatchReasonList ───────────────────────────────────────────────────────────
export function MatchReasonList({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Почему подходит</p>
      {reasons.map((r, i) => (
        <p key={i} className="text-sm text-slate-700 font-medium flex items-start gap-2">{r}</p>
      ))}
    </div>
  );
}

// ── MatchWarnings ─────────────────────────────────────────────────────────────
export function MatchWarnings({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null;
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-1.5">
      <p className="text-xs font-black text-amber-800 uppercase tracking-wider mb-2">Обратите внимание</p>
      {warnings.map((w, i) => (
        <p key={i} className="text-sm text-amber-700 font-medium">{w}</p>
      ))}
    </div>
  );
}

// ── MatchDebugPanel ───────────────────────────────────────────────────────────
export function MatchDebugPanel({ result, candidate, job }: { result: MatchResult; candidate: any; job: any }) {
  return (
    <div className="bg-slate-950 text-green-400 rounded-2xl p-6 font-mono text-xs overflow-auto max-h-[500px] shadow-2xl border border-green-900/30">
      <h3 className="font-black text-green-300 text-sm mb-4 uppercase tracking-wider">🔍 Match Debug Panel</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-green-600 mb-1">CANDIDATE</p>
          <p>name:     {candidate.name}</p>
          <p>districts:{(candidate.preferredDistricts ?? []).join(", ")}</p>
          <p>categories:{(candidate.preferredCategories ?? []).join(", ")}</p>
          <p>exp:      {candidate.experienceLevel}</p>
          <p>salary↑:  {candidate.salaryExpectation}</p>
        </div>
        <div>
          <p className="text-green-600 mb-1">JOB</p>
          <p>title:    {job.title}</p>
          <p>district: {job.district}</p>
          <p>category: {job.category}</p>
          <p>schedule: {job.schedule}</p>
          <p>salary:   {job.salaryMin}–{job.salaryMax}</p>
          <p>expReq:   {String(job.experienceRequired)}</p>
          <p>student:  {String(job.studentFriendly)}</p>
        </div>
      </div>

      <div className="border-t border-green-900/40 pt-4 mb-4">
        <p className="text-green-600 mb-2">SCORING BREAKDOWN</p>
        {(Object.entries(result.breakdown) as [string, { awarded: number; max: number; label: string }][]).map(([k, v]) => (
          <div key={k} className="flex gap-3 mb-1">
            <span className="w-20 text-green-700">{k}:</span>
            <span className={v.awarded === v.max ? "text-emerald-400" : v.awarded === 0 ? "text-red-400" : "text-amber-400"}>
              {v.awarded}/{v.max}
            </span>
            <span className="text-green-600 truncate">&rarr; {v.label}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-green-900/40 pt-4">
        <p className="text-green-600 mb-1">TOTAL SCORE</p>
        <p className="text-2xl font-black text-white">{result.score}/100 — {MATCH_LEVEL_CONFIG[result.level].label}</p>
      </div>
    </div>
  );
}
