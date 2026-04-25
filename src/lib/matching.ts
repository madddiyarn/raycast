

export interface MatchScoreBreakdown {
  location: { awarded: number; max: 20; label: string };
  category: { awarded: number; max: 15; label: string };
  availability: { awarded: number; max: 15; label: string };
  experience: { awarded: number; max: 10; label: string };
  skills: { awarded: number; max: 15; label: string };
  language: { awarded: number; max: 10; label: string };
  salary: { awarded: number; max: 7; label: string };
  studentFit: { awarded: number; max: 5; label: string };
  trustSafety: { awarded: number; max: 3; label: string };
}

export interface MatchResult {
  score: number;           
  level: MatchLevel;
  breakdown: MatchScoreBreakdown;
  reasons: string[];       
  warnings: string[];    
  improvementTips: string[]; 
  generatedInterviewQuestions: string[]; 
}

export type MatchLevel =
  | "excellent"   
  | "strong"       
  | "possible"    
  | "weak"         
  | "poor";       

export const MATCH_LEVEL_CONFIG: Record<MatchLevel, { label: string; color: string; bg: string }> = {
  excellent: { label: "Отличный мэтч", color: "text-emerald-700", bg: "bg-emerald-100" },
  strong:    { label: "Хороший мэтч",  color: "text-blue-700",    bg: "bg-blue-100"    },
  possible:  { label: "Возможный мэтч",color: "text-amber-700",   bg: "bg-amber-100"   },
  weak:      { label: "Слабый мэтч",   color: "text-orange-700",  bg: "bg-orange-100"  },
  poor:      { label: "Плохой мэтч",   color: "text-red-700",     bg: "bg-red-100"     },
};



const NEARBY_DISTRICTS: Record<string, string[]> = {
  "14 мкр": ["13 мкр", "15 мкр", "17 мкр", "16 мкр"],
  "15 мкр": ["14 мкр", "16 мкр", "17 мкр", "13 мкр"],
  "17 мкр": ["15 мкр", "16 мкр", "14 мкр", "18 мкр"],
  "16 мкр": ["15 мкр", "17 мкр", "14 мкр"],
  "12 мкр": ["11 мкр", "13 мкр", "9 мкр"],
  "29 мкр": ["28 мкр", "30 мкр"],
  "3а мкр": ["3б мкр", "4 мкр", "5 мкр"],
  "Кен-Баба": ["Самал", "ЖК Томирис"],
};

function locationScore(candidate: any, job: any): { awarded: number; label: string } {
  if (!candidate) return { awarded: 7, label: "Профиль не загружен" };
  const preferred: string[] = candidate.preferredDistricts ?? [];
  const jobDistrict: string = job.district ?? "";
  if (!jobDistrict) return { awarded: 4, label: "Район не указан" };

  if (preferred.includes(jobDistrict)) {
    return { awarded: 20, label: `${jobDistrict} — предпочтительный район кандидата` };
  }
  const nearbyMatch = preferred.some(d => (NEARBY_DISTRICTS[d] ?? []).includes(jobDistrict));
  if (nearbyMatch) {
    return { awarded: 14, label: `${jobDistrict} рядом с предпочтительным районом` };
  }
  if (preferred.length > 0) {
    return { awarded: 7, label: "Тот же город, но не предпочтительный район" };
  }
  return { awarded: 7, label: "Район не указан кандидатом" };
}

function categoryScore(candidate: any, job: any): { awarded: number; label: string } {
  if (!candidate) return { awarded: 0, label: "Интересы не указаны" };
  const preferred: string[] = candidate.preferredCategories ?? candidate.interests?.map((i: any) => i.category) ?? [];
  const jobCat: string = job.category ?? "";
  if (!jobCat) return { awarded: 6, label: "Категория вакансии не указана" };

  const highInterest = preferred.slice(0, 2);
  const medInterest = preferred.slice(2, 5);

  if (highInterest.includes(jobCat)) {
    return { awarded: 15, label: `Высокий интерес продукта к категории ${jobCat}` };
  }
  if (medInterest.includes(jobCat)) {
    return { awarded: 10, label: `Средний интерес к ${jobCat}` };
  }
  if (preferred.includes(jobCat)) {
    return { awarded: 6, label: `Открыт к ${jobCat}` };
  }
  return { awarded: 0, label: "Категория не в интересах кандидата" };
}

function availabilityScore(candidate: any, job: any): { awarded: number; label: string } {
  if (!candidate) return { awarded: 4, label: "График не указан кандидатом" };
  const candidateSchedules: string[] = candidate.availableSchedules ?? candidate.employmentTypes ?? [];
  const jobSchedule: string = job.schedule ?? "";

  if (!jobSchedule) return { awarded: 4, label: "График не указан" };


  if (candidateSchedules.some((s: string) => s.toLowerCase().includes(jobSchedule.toLowerCase()) || jobSchedule.toLowerCase().includes(s.toLowerCase()))) {
    return { awarded: 15, label: "График полностью совместим" };
  }

  const isFlexible = candidateSchedules.some(s => s.toLowerCase().includes("гибк") || s.toLowerCase().includes("подраб"));
  if (isFlexible && ["2/2", "Гибкий"].includes(jobSchedule)) {
    return { awarded: 12, label: "График подходит при гибком подходе" };
  }
  if (isFlexible) {
    return { awarded: 8, label: "Кандидат гибкий, но график не совсем совпадает" };
  }
  return { awarded: 4, label: "График частично совместим" };
}

function experienceScore(candidate: any, job: any): { awarded: number; label: string } {
  if (!candidate) return { awarded: 5, label: "Опыт не указан" };
  const hasExp = (candidate.experienceLevel ?? "").toLowerCase().includes("опыт") && 
                 !(candidate.experienceLevel ?? "").toLowerCase().includes("без");
  const jobRequiresExp: boolean = job.experienceRequired ?? false;

  if (!jobRequiresExp && !hasExp) {
    return { awarded: 10, label: "Опыт не требуется — кандидат подходит" };
  }
  if (!jobRequiresExp && hasExp) {
    return { awarded: 10, label: "Кандидат с опытом, опыт не обязателен" };
  }
  if (jobRequiresExp && hasExp) {
    return { awarded: 10, label: "Кандидат имеет требуемый опыт" };
  }
 
  return { awarded: 2, label: "Вакансия требует опыт, у кандидата его нет" };
}

function skillsScore(candidate: any, job: any): { awarded: number; label: string } {
  if (!candidate) return { awarded: 4, label: "Навыки не указаны" };
  const candidateSkills: string[] = (candidate.skills ?? []).map((s: any) => (typeof s === "string" ? s : s.name).toLowerCase());
  const requiredSkills: string[] = (job.requiredSkills ?? job.skills ?? []).map((s: string) => s.toLowerCase());

  if (requiredSkills.length === 0) {
    return { awarded: 9, label: "Навыки не указаны в вакансии" };
  }

  const matched = requiredSkills.filter(s => candidateSkills.some(c => c.includes(s) || s.includes(c)));
  const ratio = matched.length / requiredSkills.length;

  if (ratio >= 0.8) return { awarded: 15, label: `Высокое совпадение навыков (${matched.length}/${requiredSkills.length})` };
  if (ratio >= 0.5) return { awarded: 9, label: `Среднее совпадение навыков (${matched.length}/${requiredSkills.length})` };
  if (ratio >= 0.2) return { awarded: 4, label: `Низкое совпадение навыков (${matched.length}/${requiredSkills.length})` };
  return { awarded: 0, label: "Навыки не совпадают" };
}

function languageScore(candidate: any, job: any): { awarded: number; label: string } {
  if (!candidate) return { awarded: 3, label: "Языки не указаны" };
  const candidateLangs: any[] = candidate.languages ?? [];
  const requiredLangs: string[] = job.requiredLanguages ?? [];

  if (requiredLangs.length === 0) {
    return { awarded: 6, label: "Языки не указаны в вакансии" };
  }
  if (candidateLangs.length === 0) {
    return { awarded: 3, label: "Языки кандидата не указаны" };
  }

  const candidateLangNames = candidateLangs.map(l => l.language.toLowerCase());
  const matched = requiredLangs.filter(rl => candidateLangNames.some(cl => cl.includes(rl.toLowerCase()) || rl.toLowerCase().includes(cl)));

  const ratio = matched.length / requiredLangs.length;
  if (ratio >= 1) return { awarded: 10, label: "Все требуемые языки есть у кандидата" };
  if (ratio >= 0.5) return { awarded: 6, label: "Часть требуемых языков есть у кандидата" };
  return { awarded: 0, label: "Кандидат не владеет требуемыми языками" };
}

function salaryScore(candidate: any, job: any): { awarded: number; label: string } {
  if (!candidate) return { awarded: 3, label: "Ожидания не указаны" };
  const expectation: number = candidate.salaryExpectation ?? 0;
  const jobMin: number = job.salaryMin ?? 0;
  const jobMax: number = job.salaryMax ?? jobMin;

  if (!expectation) return { awarded: 3, label: "Ожидания по зарплате не указаны" };
  if (!jobMin)      return { awarded: 2, label: "Зарплата не указана в вакансии" };

  if (jobMax >= expectation) return { awarded: 7, label: "Зарплата соответствует ожиданиям" };
  const gap = (expectation - jobMin) / expectation;
  if (gap <= 0.2) return { awarded: 4, label: "Зарплата немного ниже ожиданий" };
  return { awarded: 0, label: "Зарплата значительно ниже ожиданий" };
}

function studentFitScore(candidate: any, job: any): { awarded: number; label: string } {
  if (!candidate) return { awarded: 3, label: "Для всех категорий" };
  const isStudent = (candidate.experienceLevel ?? "").toLowerCase().includes("студент") ||
    (candidate.rating?.badges ?? []).some((b: any) => b.id === "student");
  const jobStudentFriendly: boolean = job.studentFriendly ?? false;

  if (isStudent && jobStudentFriendly) {
    return { awarded: 5, label: "Вакансия подходит для студентов" };
  }
  if (!isStudent && jobStudentFriendly) {
    return { awarded: 3, label: "Вакансия доступна, но кандидат не студент" };
  }
  if (isStudent && !jobStudentFriendly) {
    return { awarded: 1, label: "Кандидат студент, но вакансия не студенческая" };
  }
  return { awarded: 3, label: "Оба не в студенческом контексте" };
}

function trustSafetyScore(job: any): { awarded: number; label: string } {
  const trustScore: number = job.employerTrustScore ?? 75;
  if (trustScore >= 80) return { awarded: 3, label: "Высокий Trust Score работодателя" };
  if (trustScore >= 50) return { awarded: 2, label: "Средний Trust Score работодателя" };
  return { awarded: 0, label: "Низкий или неизвестный Trust Score" };
}



export function getMatchBreakdown(candidate: any, job: any): MatchScoreBreakdown {
  const loc = locationScore(candidate, job);
  const cat = categoryScore(candidate, job);
  const avail = availabilityScore(candidate, job);
  const exp = experienceScore(candidate, job);
  const sk = skillsScore(candidate, job);
  const lang = languageScore(candidate, job);
  const sal = salaryScore(candidate, job);
  const stud = studentFitScore(candidate, job);
  const trust = trustSafetyScore(job);

  return {
    location:    { awarded: loc.awarded,   max: 20, label: loc.label },
    category:    { awarded: cat.awarded,   max: 15, label: cat.label },
    availability:{ awarded: avail.awarded, max: 15, label: avail.label },
    experience:  { awarded: exp.awarded,   max: 10, label: exp.label },
    skills:      { awarded: sk.awarded,    max: 15, label: sk.label },
    language:    { awarded: lang.awarded,  max: 10, label: lang.label },
    salary:      { awarded: sal.awarded,   max: 7,  label: sal.label },
    studentFit:  { awarded: stud.awarded,  max: 5,  label: stud.label },
    trustSafety: { awarded: trust.awarded, max: 3,  label: trust.label },
  };
}

export function normalizeMatchScore(breakdown: MatchScoreBreakdown): number {
  const total = Object.values(breakdown).reduce((sum, b) => sum + b.awarded, 0);
  return Math.min(100, Math.round(total));
}

export function calculateMatchScore(candidate: any, job: any): number {
  return normalizeMatchScore(getMatchBreakdown(candidate, job));
}

export function getMatchLevel(score: number): MatchLevel {
  if (score >= 85) return "excellent";
  if (score >= 70) return "strong";
  if (score >= 55) return "possible";
  if (score >= 40) return "weak";
  return "poor";
}

export function getMatchReasons(candidate: any, job: any): string[] {
  const breakdown = getMatchBreakdown(candidate, job);
  const reasons: string[] = [];

  if (breakdown.location.awarded >= 14) reasons.push(`📍 Рядом с вашим районом (${job.district})`);
  if (breakdown.category.awarded >= 10) reasons.push(`✅ ${job.category} — в ваших интересах`);
  if (breakdown.availability.awarded >= 12) reasons.push("🕐 График совпадает с вашей доступностью");
  if (breakdown.experience.awarded >= 8) reasons.push(job.experienceRequired ? "💼 Ваш опыт соответствует требованиям" : "🎯 Опыт не обязателен");
  if (breakdown.skills.awarded >= 9) reasons.push("🛠 Ваши навыки подходят для этой работы");
  if (breakdown.language.awarded >= 6) reasons.push("🌐 Ваш уровень языка подходит");
  if (breakdown.salary.awarded >= 4) reasons.push("💰 Зарплата соответствует ожиданиям");
  if (breakdown.studentFit.awarded >= 4) reasons.push("🎓 Вакансия подходит студентам");
  if (breakdown.trustSafety.awarded >= 2) reasons.push("🛡 Проверенный работодатель");

  return reasons;
}

export function getMatchWarnings(candidate: any, job: any): string[] {
  const breakdown = getMatchBreakdown(candidate, job);
  const warnings: string[] = [];

  if (breakdown.location.awarded < 7) warnings.push(`⚠️ Работа далеко от предпочтительного района`);
  if (breakdown.category.awarded < 6) warnings.push(`⚠️ ${job.category} не в вашем списке интересов`);
  if (breakdown.availability.awarded < 8) warnings.push("⚠️ График может не совпадать с вашим расписанием");
  if (breakdown.experience.awarded < 5) warnings.push("⚠️ Требуется опыт работы, которого у вас пока нет");
  if (breakdown.skills.awarded < 4) warnings.push("⚠️ Мало совпадений по навыкам");
  if (breakdown.language.awarded < 3) warnings.push("⚠️ Языки не подходят под требования вакансии");
  if (breakdown.salary.awarded === 0) warnings.push("⚠️ Зарплата значительно ниже ваших ожиданий");

  return warnings;
}

export function getImprovementTips(candidate: any, job: any): string[] {
  const breakdown = getMatchBreakdown(candidate, job);
  const tips: string[] = [];

  if (breakdown.language.awarded < 6) tips.push("📚 Добавьте уровень казахского языка в профиль");
  if (breakdown.availability.awarded < 12) tips.push("📅 Уточните выходные дни в вашей доступности");
  if (breakdown.skills.awarded < 9) tips.push("🛠 Пройдите курс Customer Service или добавьте навыки");
  if (breakdown.category.awarded < 6) tips.push(`🔍 Попробуйте добавить "${job.category}" в ваши интересы`);

  return tips;
}

export function generateInterviewQuestions(candidate: any, job: any): string[] {
  const warnings = getMatchWarnings(candidate, job);
  const questions: string[] = [];

  if (warnings.some(w => w.includes("опыт"))) {
    questions.push("У вас пока нет опыта в этой сфере. Какой опыт из учёбы, волонтёрства или проектов показывает вашу ответственность?");
  }
  if (warnings.some(w => w.includes("язык"))) {
    questions.push("Сможете ли вы обслуживать клиентов на казахском языке в простых ситуациях?");
  }
  if (warnings.some(w => w.includes("График"))) {
    questions.push(`Сможете ли вы стабильно выходить по графику ${job.schedule} после учёбы?`);
  }
  if (warnings.some(w => w.includes("навык"))) {
    questions.push("Какие навыки вы готовы развить в течение первого месяца работы?");
  }
  if (warnings.some(w => w.includes("Зарплата"))) {
    questions.push("Текущая зарплата ниже ваших ожиданий. Готовы ли рассмотреть с перспективой роста?");
  }


  questions.push(`Почему вас интересует работа в сфере ${job.category}?`);

  return questions;
}

export function getFullMatchResult(candidate: any, job: any): MatchResult {
  const breakdown = getMatchBreakdown(candidate, job);
  const score = normalizeMatchScore(breakdown);
  return {
    score,
    level: getMatchLevel(score),
    breakdown,
    reasons: getMatchReasons(candidate, job),
    warnings: getMatchWarnings(candidate, job),
    improvementTips: getImprovementTips(candidate, job),
    generatedInterviewQuestions: generateInterviewQuestions(candidate, job),
  };
}
