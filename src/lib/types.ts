// =============================================
// CORE USER TYPES
// =============================================

export type UserRole = "candidate" | "employer" | "admin" | "guest";

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  email?: string;
  telegramUsername: string;
  city?: string;
  district?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
}

// =============================================
// LANGUAGE SYSTEM
// =============================================

export type LanguageLevel = "basic" | "conversational" | "fluent" | "native";

export interface LanguageProficiency {
  language: string;         // "Казахский", "Русский", "English", etc
  level: LanguageLevel;
  canServeCustomers: boolean;
  canWriteMessages: boolean;
  canInterview: boolean;
}

// =============================================
// CANDIDATE PROFILE & RATING
// =============================================

export type InterestIntensity = "high" | "medium" | "open";

export interface CategoryInterest {
  category: string;
  intensity: InterestIntensity;
  subRoles: string[];       // e.g. ["бариста", "официант"]
}

export type SkillLevel = "beginner" | "basic" | "confident" | "experienced";

export interface SkillEntry {
  name: string;
  group: "soft" | "service" | "digital" | "physical";
  level: SkillLevel;
}

export interface WorkExperience {
  role: string;
  workplace: string;
  duration: string;
  responsibilities: string;
  achievements: string;
}

export interface AvailabilitySlot {
  day: string;              // "Понедельник" etc
  from: string;             // "16:00"
  to: string;               // "22:00"
}

export interface CandidateProfile {
  userId: string;

  // Interests
  categoryInterests: CategoryInterest[];
  preferredCategories: string[];
  employmentTypes: string[];

  // Skills
  skills: SkillEntry[];
  customSkills: string[];

  // Languages
  languages: LanguageProficiency[];

  // Experience
  hasExperience: boolean;
  workExperiences: WorkExperience[];
  volunteerExperience: string;
  schoolProjects: string;
  certificates: string[];
  cvUrl?: string;
  cvText?: string;

  // Availability
  availability: AvailabilitySlot[];
  preferredDistricts: string[];
  readyToday: boolean;
  readyTomorrow: boolean;
  canAcceptUrgentShifts: boolean;
  maxTravelDistance: number; // km

  // Expectations
  salaryExpectation: number;
  minPerShiftPayment: number;
  preferredSchedules: string[];
  maxShiftLength: number;   // hours
  acceptsTrialShift: boolean;
  acceptsUnpaidInternship: boolean;
  wantsFirstJobFriendly: boolean;
  wantsVerifiedEmployersOnly: boolean;

  // AI
  aiSummary: string;
  aiHeadline: string;

  // Legacy compat
  experienceLevel: string;
  availableDays: string[];
  availableTime: string[];
  completenessScore: number;
}

export type CandidateLevel = "new" | "ready" | "reliable" | "trusted" | "top";

export interface CandidateBadge {
  id: string;
  title: string;
  icon: string;
  unlockedAt?: Date;
}

export interface CandidateRating {
  workScore: number;        // 0-100
  level: CandidateLevel;
  responseRate: number;
  completedInterviews: number;
  completedShifts: number;
  employerFeedbackAvg: number;
  noShowCount: number;
  badges: CandidateBadge[];
  scoreBreakdown: {
    profileCompleteness: number;
    languagesAdded: number;
    availabilityAdded: number;
    cvOrAiSummary: number;
    fastResponse: number;
    completedInterview: number;
    positiveFeedback: number;
    noShowPenalty: number;
  };
}

// =============================================
// EMPLOYER PROFILE & RATING
// =============================================

export interface EmployerProfile {
  userId: string;
  businessName: string;
  businessCategory: string;
  city: string;
  district: string;
  contactPerson: string;
  telegramUsername: string;
  phone: string;

  // Hiring
  hiringNeeds: string[];
  employmentTypes: string[];
  requiredLanguages: LanguageProficiency[];
  candidateRequirements: string[];

  // Interview prefs
  interviewPlatforms: string[];
  interviewDuration: number;

  telegramIntegrationStatus: "none" | "pending" | "connected";
  sourceTrustLevel: number;
}

export type EmployerLevel = "new_source" | "basic" | "verified" | "trusted" | "recommended";

export interface EmployerRating {
  trustScore: number;       // 0-100
  level: EmployerLevel;
  responseRate: number;
  averageResponseTime: number; // minutes
  candidateFeedbackAvg: number;
  vacancyCompletenessAvg: number;
  complaintCount: number;
  verifiedContact: boolean;
  scoreBreakdown: {
    verifiedContact: number;
    completeProfile: number;
    vacancyCompleteness: number;
    fastResponse: number;
    positiveFeedback: number;
    freshnessConfirmations: number;
    complaintsPenalty: number;
  };
}

// =============================================
// JOB / VACANCY
// =============================================

export interface TrialShift {
  available: boolean;
  paid: boolean;
  duration: string;
  payment: number;
  goal: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  content?: string;
  salaryText?: string;
  salaryMin: number;
  salaryMax: number;
  district: string;
  category: string;
  schedule: string;
  employmentType: string;
  contact?: string;
  studentFriendly: boolean;
  experienceRequired: boolean;
  status: "draft" | "published" | "archived";
  rawText?: string;
  sourceType?: string;
  employerId?: string;
  createdAt: Date;
  updatedAt: Date;

  // Location
  lat?: number;
  lng?: number;
  address?: string;

  // Languages
  requiredLanguages?: LanguageProficiency[];

  // Trial shift
  trialShift?: TrialShift;

  // Employer info for display
  employerTrustScore?: number;
  employerVerified?: boolean;

  // AI enhancements (computed client-side)
  matchScore?: number;
  completenessScore?: number;
  safetyWarnings?: string[];
  freshnessStatus?: string;
}

// =============================================
// APPLICATION FLOW
// =============================================

export type ApplicationStatus =
  | "applied"
  | "viewed"
  | "shortlisted"
  | "interview_scheduled"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  employerId: string;
  status: ApplicationStatus;
  matchScore: number;
  aiMessage: string;
  createdAt: Date;
  updatedAt?: Date;
  timeline: ApplicationEvent[];
}

export interface ApplicationEvent {
  status: ApplicationStatus;
  timestamp: Date;
  note?: string;
}

// =============================================
// INTERVIEW SYSTEM
// =============================================

export type InterviewPlatform =
  | "zoom" | "google_meet" | "teams" | "telegram_call"
  | "whatsapp_call" | "phone" | "in_person";

export type InterviewStatus =
  | "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled";

export interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  employerId: string;
  jobId: string;
  platform: InterviewPlatform;
  date: string;
  time: string;
  duration: number; // minutes
  status: InterviewStatus;
  meetingLink?: string;
  aiQuestions: InterviewQuestion[];
  scorecard?: InterviewScorecard;
  createdAt: Date;
}

export interface InterviewQuestion {
  id: string;
  type: "warmup" | "experience" | "situation" | "availability" | "language" | "reliability" | "candidate_question";
  question: string;
  purpose: string;
  evaluationCriteria: string;
}

export interface InterviewScorecard {
  communication: number;    // 1-5
  motivation: number;
  reliability: number;
  scheduleFit: number;
  languageFit: number;
  customerOrientation: number;
  learningAbility: number;
  notes: string;
  decision: "hire" | "trial_shift" | "maybe_later" | "reject";
}

// =============================================
// SKILL VERIFICATION
// =============================================

export interface SkillVerification {
  id: string;
  title: string;
  category: string;
  status: "not_started" | "in_progress" | "completed";
  score: number;
  badgeUnlocked: boolean;
}

// =============================================
// CONFIRMATION SYSTEM (Anti-Ghost)
// =============================================

export type ConfirmationStatus =
  | "pending" | "candidate_confirmed" | "employer_confirmed"
  | "both_confirmed" | "missed" | "cancelled";

export interface Confirmation {
  id: string;
  interviewId?: string;
  shiftId?: string;
  candidateId: string;
  employerId: string;
  status: ConfirmationStatus;
  deadline: Date;
}

// =============================================
// SEARCH FILTERS
// =============================================

export interface SearchFilters {
  query?: string;
  categories?: string[];
  districts?: string[];
  salaryMin?: number;
  salaryMax?: number;
  employmentTypes?: string[];
  schedule?: string[];
  experienceRequired?: boolean;
  studentFriendlyOnly?: boolean;
  noExperienceOnly?: boolean;
  safetyLevels?: string[];
  sources?: string[];
  freshnessStatuses?: string[];
  minMatchScore?: number;
  urgentOnly?: boolean;

  // New extended filters
  requiredLanguages?: string[];
  languageLevel?: LanguageLevel;
  minEmployerTrustScore?: number;
  minCandidateWorkScore?: number;
  trialShiftAvailable?: boolean;
  interviewAvailable?: boolean;
  verifiedEmployerOnly?: boolean;
  readyToday?: boolean;
  onlineInterviewAvailable?: boolean;
}

// =============================================
// MISC
// =============================================

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  createdAt: Date;
}

// Rating modal types
export interface CandidateReview {
  punctuality: number;
  communication: number;
  motivation: number;
  skillFit: number;
  reliability: number;
  overall: number;
  privateNote: string;
  wouldInviteAgain: boolean;
}

export interface EmployerReview {
  vacancyClarity: number;
  communication: number;
  respectfulness: number;
  paymentClarity: number;
  scheduleClarity: number;
  overallTrust: number;
  wouldRecommend: boolean;
}
