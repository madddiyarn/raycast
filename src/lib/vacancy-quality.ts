/**
 * Jumys Relay — Deterministic Vacancy Quality Scoring
 *
 * Measures completeness and safety of a vacancy object, giving employers
 * transparent feedback about their postings.
 */

export interface VacancyCompleteness {
  score: number;         // 0–100
  breakdown: Record<string, { awarded: number; max: number; label: string }>;
}

export interface VacancySafety {
  score: number;         // 0–100 (starts at 100, penalties deducted)
  level: "high" | "medium" | "low";
  flags: string[];
}

export interface PublishabilityStatus {
  status: "ready" | "needs_info" | "weak" | "suspicious";
  label: string;
  color: string;
  missingRequired: string[];
  missingOptional: string[];
}

// ──────────────────────────────────────────────────────────────────────────────

export function calculateVacancyCompleteness(job: any): VacancyCompleteness {
  const breakdown: Record<string, { awarded: number; max: number; label: string }> = {
    title:      { awarded: job.title                                ? 15 : 0, max: 15, label: "Название вакансии" },
    category:   { awarded: job.category                             ? 10 : 0, max: 10, label: "Категория" },
    district:   { awarded: job.district                             ? 15 : 0, max: 15, label: "Район" },
    salary:     { awarded: (job.salaryMin || job.salaryText)        ? 15 : 0, max: 15, label: "Зарплата" },
    schedule:   { awarded: job.schedule                             ? 15 : 0, max: 15, label: "График" },
    contact:    { awarded: job.contact                              ? 10 : 0, max: 10, label: "Контакт" },
    experience: { awarded: job.experienceRequired !== undefined      ?  5 : 0, max:  5, label: "Требования к опыту" },
    skillLang:  { awarded: (job.requiredLanguages?.length || job.skills?.length) ? 5 : 0, max: 5, label: "Навыки/Языки" },
    duties:     { awarded: (job.description?.length ?? 0) > 40      ?  5 : 0, max:  5, label: "Описание обязанностей" },
    freshness:  { awarded: job.status === "published"               ?  5 : 0, max:  5, label: "Актуальность" },
  };

  const score = Object.values(breakdown).reduce((s, b) => s + b.awarded, 0);
  return { score, breakdown };
}

export function calculateVacancySafety(job: any): VacancySafety {
  let score = 100;
  const flags: string[] = [];

  if (!job.salaryMin && !job.salaryText) {
    score -= 20;
    flags.push("⚠️ Зарплата не указана");
  }
  if (!job.district) {
    score -= 15;
    flags.push("⚠️ Район не указан");
  }
  if (!job.contact) {
    score -= 20;
    flags.push("⚠️ Контакт отсутствует");
  }

  const suspicious_salary = (job.salaryMin ?? 0) > 1_000_000;
  if (suspicious_salary && (!job.description || job.description.length < 30)) {
    score -= 25;
    flags.push("🚨 Подозрительно высокая зарплата без описания");
  }

  const vagueTerms = ["активных людей", "требуются все", "не нужен опыт, нужна активность", "партнёры"];
  if (vagueTerms.some(t => (job.title ?? "").toLowerCase().includes(t) || (job.description ?? "").toLowerCase().includes(t))) {
    score -= 15;
    flags.push("⚠️ Расплывчатое описание вакансии");
  }

  const depositTerms = ["взнос", "депозит", "оплата за обучение", "инвестиция"];
  if (depositTerms.some(t => (job.rawText ?? job.description ?? "").toLowerCase().includes(t))) {
    score -= 40;
    flags.push("🚨 Запрос на депозит/взнос — возможное мошенничество");
  }

  if (!job.employerId) {
    score -= 10;
    flags.push("⚠️ Личность работодателя не верифицирована");
  }

  const clamped = Math.max(0, Math.min(100, score));
  const level: "high" | "medium" | "low" = clamped >= 75 ? "high" : clamped >= 45 ? "medium" : "low";

  return { score: clamped, level, flags };
}

export function getVacancyWarnings(job: any): string[] {
  const safety = calculateVacancySafety(job);
  const completeness = calculateVacancyCompleteness(job);
  const warnings: string[] = [...safety.flags];

  Object.entries(completeness.breakdown).forEach(([, v]) => {
    if (v.awarded === 0) warnings.push(`📋 Не заполнено: ${v.label}`);
  });

  return warnings;
}

export function getVacancyImprovementTips(job: any): string[] {
  const tips: string[] = [];
  if (!job.salaryMin && !job.salaryText) tips.push("💰 Укажите зарплату — вакансии с зарплатой получают на 3× больше откликов");
  if (!job.requiredLanguages?.length) tips.push("🌐 Укажите требуемые языки для лучшего мэтча");
  if (!job.studentFriendly) tips.push("🎓 Если подходит студентам, включите эту опцию — расширит аудиторию");
  if (!job.skills?.length && !job.requiredSkills?.length) tips.push("🛠 Добавьте список навыков для точного AI-мэтча");
  if ((job.description?.length ?? 0) < 50) tips.push("📝 Расширьте описание обязанностей");

  return tips;
}

export function getPublishabilityStatus(job: any): PublishabilityStatus {
  const requiredFields = [
    { key: "title",    label: "название" },
    { key: "district", label: "район" },
    { key: "schedule", label: "график" },
    { key: "contact",  label: "контакт" },
  ];

  const missingRequired = requiredFields
    .filter(f => !job[f.key])
    .map(f => f.label);

  const missingOptional: string[] = [];
  if (!job.salaryMin && !job.salaryText) missingOptional.push("зарплата");
  if (job.experienceRequired === undefined) missingOptional.push("требования к опыту");
  if (!job.requiredLanguages?.length) missingOptional.push("языки");

  const safety = calculateVacancySafety(job);

  if (safety.flags.some(f => f.includes("мошенничество") || f.includes("подозрит"))) {
    return { status: "suspicious", label: "Подозрительная — требует проверки", color: "text-red-700", missingRequired, missingOptional };
  }
  if (missingRequired.length > 0) {
    return { status: "needs_info", label: `Нужна информация: ${missingRequired.join(", ")}`, color: "text-amber-700", missingRequired, missingOptional };
  }
  if (missingOptional.length >= 2) {
    return { status: "weak", label: "Можно опубликовать, но слабая", color: "text-orange-600", missingRequired, missingOptional };
  }
  return { status: "ready", label: "Готова к публикации", color: "text-emerald-700", missingRequired, missingOptional };
}

export function detectDuplicateVacancy(newJob: any, existingJobs: any[]): { isDuplicate: boolean; duplicate?: any; type: "exact" | "possible" | "none" } {
  // Exact: same title + district + contact
  const exact = existingJobs.find(j =>
    j.id !== newJob.id &&
    j.title?.toLowerCase() === newJob.title?.toLowerCase() &&
    j.district === newJob.district &&
    j.contact === newJob.contact
  );
  if (exact) return { isDuplicate: true, duplicate: exact, type: "exact" };

  // Possible: same title + similar salary + same employer
  const possible = existingJobs.find(j =>
    j.id !== newJob.id &&
    j.title?.toLowerCase() === newJob.title?.toLowerCase() &&
    j.employerId === newJob.employerId &&
    Math.abs((j.salaryMin ?? 0) - (newJob.salaryMin ?? 0)) < 30000
  );
  if (possible) return { isDuplicate: true, duplicate: possible, type: "possible" };

  return { isDuplicate: false, type: "none" };
}
