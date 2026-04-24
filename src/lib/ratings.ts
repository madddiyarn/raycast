import {
  CandidateProfile, CandidateRating, CandidateLevel, CandidateBadge,
  EmployerProfile, EmployerRating, EmployerLevel,
} from "./types";

// =============================================
// CANDIDATE WORK SCORE
// =============================================

export function calculateCandidateWorkScore(candidate: Partial<CandidateProfile>): number {
  let score = 0;

  // Profile completeness (+20)
  if (candidate.aiSummary || candidate.cvText) score += 10;
  if (candidate.preferredCategories?.length) score += 5;
  if (candidate.employmentTypes?.length) score += 5;

  // Languages (+10)
  if (candidate.languages?.length) score += 10;

  // Availability (+10)
  if (candidate.availability?.length || candidate.readyToday) score += 10;

  // CV or AI summary (+10)
  if (candidate.cvUrl || candidate.cvText || candidate.aiSummary) score += 10;

  // Skills (+10)
  if ((candidate.skills?.length ?? 0) >= 3) score += 10;

  // Experience data (+10)
  if (candidate.workExperiences?.length || candidate.volunteerExperience) score += 10;

  // Base points for having a profile at all
  score += 20;

  return Math.min(100, Math.max(0, score));
}

export function getCandidateLevel(score: number): CandidateLevel {
  if (score >= 90) return "top";
  if (score >= 75) return "trusted";
  if (score >= 60) return "reliable";
  if (score >= 40) return "ready";
  return "new";
}

export function getCandidateLevelLabel(level: CandidateLevel): string {
  const labels: Record<CandidateLevel, string> = {
    new: "Новичок",
    ready: "Готов к работе",
    reliable: "Надёжный",
    trusted: "Проверенный",
    top: "Топ кандидат",
  };
  return labels[level];
}

export function getCandidateScoreBreakdown(candidate: Partial<CandidateProfile>) {
  return {
    profileCompleteness: (candidate.aiSummary ? 10 : 0) + (candidate.preferredCategories?.length ? 5 : 0) + (candidate.employmentTypes?.length ? 5 : 0),
    languagesAdded: candidate.languages?.length ? 10 : 0,
    availabilityAdded: (candidate.availability?.length || candidate.readyToday) ? 10 : 0,
    cvOrAiSummary: (candidate.cvUrl || candidate.cvText || candidate.aiSummary) ? 10 : 0,
    fastResponse: 10, // mock
    completedInterview: 0,
    positiveFeedback: 0,
    noShowPenalty: 0,
  };
}

export function getCandidateImprovementTips(candidate: Partial<CandidateProfile>): string[] {
  const tips: string[] = [];
  if (!candidate.languages?.length) tips.push("Добавьте языки → +10 к Work Score");
  if (!candidate.availability?.length && !candidate.readyToday) tips.push("Укажите расписание → +10 к Work Score");
  if (!candidate.cvUrl && !candidate.cvText) tips.push("Загрузите резюме → +10 к Work Score");
  if ((candidate.skills?.length ?? 0) < 3) tips.push("Добавьте минимум 3 навыка → +10 к Work Score");
  if (!candidate.workExperiences?.length && !candidate.volunteerExperience) tips.push("Укажите опыт или волонтёрство → +10 к Work Score");
  if (tips.length === 0) tips.push("Пройдите мини-проверку навыков, чтобы получить бейдж");
  return tips;
}

export function getCandidateBadges(candidate: Partial<CandidateProfile>): CandidateBadge[] {
  const badges: CandidateBadge[] = [];
  if (candidate.aiSummary) badges.push({ id: "profile_complete", title: "Профиль заполнен", icon: "✅" });
  if (candidate.readyToday) badges.push({ id: "ready_today", title: "Готов сегодня", icon: "⚡" });
  if (!candidate.hasExperience) badges.push({ id: "no_exp_friendly", title: "Без опыта", icon: "🌱" });
  if (candidate.languages?.length) badges.push({ id: "multilingual", title: "Многоязычный", icon: "🌐" });
  if ((candidate.skills?.length ?? 0) >= 5) badges.push({ id: "skilled", title: "Навыки подтверждены", icon: "💪" });
  return badges;
}

// =============================================
// EMPLOYER TRUST SCORE
// =============================================

export function calculateEmployerTrustScore(employer: Partial<EmployerProfile>): number {
  let score = 0;

  // Verified contact (+15)
  if (employer.telegramUsername || employer.phone) score += 15;

  // Complete business profile (+15)
  if (employer.businessName && employer.businessCategory && employer.district) score += 15;

  // Vacancy completeness average (+20) — mock
  score += 20;

  // Fast response (+15) — mock
  score += 15;

  // Positive candidate feedback (+20) — mock
  score += 10;

  // Freshness confirmations (+10) — mock
  score += 5;

  return Math.min(100, Math.max(0, score));
}

export function getEmployerTrustLevel(score: number): EmployerLevel {
  if (score >= 90) return "recommended";
  if (score >= 75) return "trusted";
  if (score >= 55) return "verified";
  if (score >= 35) return "basic";
  return "new_source";
}

export function getEmployerLevelLabel(level: EmployerLevel): string {
  const labels: Record<EmployerLevel, string> = {
    new_source: "Новый источник",
    basic: "Базовый",
    verified: "Проверенный",
    trusted: "Доверенный",
    recommended: "Рекомендуемый",
  };
  return labels[level];
}

export function getEmployerScoreBreakdown(employer: Partial<EmployerProfile>) {
  return {
    verifiedContact: (employer.telegramUsername || employer.phone) ? 15 : 0,
    completeProfile: (employer.businessName && employer.businessCategory) ? 15 : 0,
    vacancyCompleteness: 20, // mock
    fastResponse: 15,         // mock
    positiveFeedback: 10,     // mock
    freshnessConfirmations: 5, // mock
    complaintsPenalty: 0,
  };
}

export function getEmployerImprovementTips(employer: Partial<EmployerProfile>): string[] {
  const tips: string[] = [];
  if (!employer.telegramUsername) tips.push("Подтвердите Telegram — +15 к Trust Score");
  if (!employer.businessName) tips.push("Укажите название бизнеса — +15 к Trust Score");
  if (!employer.requiredLanguages?.length) tips.push("Укажите языки вакансий для точного мэтчинга");
  tips.push("Подтверждайте актуальность вакансий каждый день");
  return tips;
}
