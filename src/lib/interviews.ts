import { Interview, InterviewQuestion, InterviewScorecard, InterviewPlatform, Job, CandidateProfile } from "./types";

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));



export async function scheduleInterview(data: {
  applicationId: string;
  candidateId: string;
  employerId: string;
  jobId: string;
  platform: InterviewPlatform;
  date: string;
  time: string;
  duration: number;
}): Promise<Interview> {
  await delay(800);
  const interview: Interview = {
    id: "int_" + Math.random().toString(36).substring(7),
    ...data,
    status: "scheduled",
    aiQuestions: generateInterviewQuestions(data.jobId),
    createdAt: new Date(),
  };
  return interview;
}

export async function rescheduleInterview(interviewId: string, date: string, time: string): Promise<Interview> {
  await delay(500);

  return { id: interviewId, date, time, status: "rescheduled" } as any;
}

export async function cancelInterview(interviewId: string): Promise<void> {
  await delay(400);
}

export async function confirmInterview(interviewId: string): Promise<void> {
  await delay(400);
}

export async function getInterviewsForEmployer(employerId: string): Promise<Interview[]> {
  await delay(300);
  return []; 
}

export async function getInterviewsForCandidate(candidateId: string): Promise<Interview[]> {
  await delay(300);
  return [];
}



const QUESTION_BANKS: Record<string, InterviewQuestion[]> = {
  HoReCa: [
    { id: "q1", type: "warmup", question: "Расскажите коротко о себе и почему вам интересна работа в общепите?", purpose: "Оценить мотивацию", evaluationCriteria: "Искренность, энтузиазм" },
    { id: "q2", type: "experience", question: "Был ли у вас опыт общения с клиентами?", purpose: "Проверить навыки сервиса", evaluationCriteria: "Конкретные примеры" },
    { id: "q3", type: "situation", question: "Что вы сделаете, если клиент недоволен заказом?", purpose: "Оценить стрессоустойчивость", evaluationCriteria: "Спокойствие, решение проблемы" },
    { id: "q4", type: "availability", question: "Сможете ли вы работать по графику 2/2 после учёбы?", purpose: "Проверить доступность", evaluationCriteria: "Честный ответ о графике" },
    { id: "q5", type: "language", question: "Можете ли вы обслуживать клиентов на русском и казахском?", purpose: "Языковая готовность", evaluationCriteria: "Уровень владения" },
    { id: "q6", type: "reliability", question: "Что для вас означает приходить на смену вовремя?", purpose: "Пунктуальность", evaluationCriteria: "Ответственность" },
    { id: "q7", type: "candidate_question", question: "Какие вопросы у вас есть к нам?", purpose: "Интерес кандидата", evaluationCriteria: "Осмысленные вопросы" },
  ],
  Retail: [
    { id: "q1", type: "warmup", question: "Что вас привлекает в работе продавца?", purpose: "Мотивация", evaluationCriteria: "Искренность" },
    { id: "q2", type: "experience", question: "Расскажите о вашем опыте работы с покупателями.", purpose: "Навыки продаж", evaluationCriteria: "Конкретика" },
    { id: "q3", type: "situation", question: "Покупатель не может выбрать между двумя товарами. Что вы скажете?", purpose: "Консультирование", evaluationCriteria: "Помощь без навязывания" },
    { id: "q4", type: "availability", question: "Готовы ли вы работать в выходные и праздники?", purpose: "Доступность", evaluationCriteria: "Гибкость" },
    { id: "q5", type: "language", question: "На каких языках вы можете обслуживать?", purpose: "Языки", evaluationCriteria: "Уверенность" },
    { id: "q6", type: "reliability", question: "Как вы справляетесь, когда много покупателей одновременно?", purpose: "Стресс", evaluationCriteria: "Организованность" },
    { id: "q7", type: "candidate_question", question: "Что для вас важно знать о нашем магазине?", purpose: "Интерес", evaluationCriteria: "Вопросы" },
  ],
  default: [
    { id: "q1", type: "warmup", question: "Расскажите о себе — чем занимаетесь, что ищете?", purpose: "Знакомство", evaluationCriteria: "Открытость" },
    { id: "q2", type: "experience", question: "Какой опыт из учёбы, волонтёрства или проектов показывает вашу ответственность?", purpose: "Опыт без опыта", evaluationCriteria: "Примеры" },
    { id: "q3", type: "situation", question: "Как вы поступите, если вам поручили задачу, которую вы никогда не делали?", purpose: "Обучаемость", evaluationCriteria: "Готовность учиться" },
    { id: "q4", type: "availability", question: "Какой график работы для вас удобен?", purpose: "Доступность", evaluationCriteria: "Честность" },
    { id: "q5", type: "language", question: "На каких языках вы свободно общаетесь?", purpose: "Языки", evaluationCriteria: "Уровни" },
    { id: "q6", type: "reliability", question: "Насколько быстро вы готовы обучаться новым задачам?", purpose: "Обучаемость", evaluationCriteria: "Мотивация" },
    { id: "q7", type: "candidate_question", question: "Что бы вы хотели узнать о рабочем месте?", purpose: "Интерес", evaluationCriteria: "Инициативность" },
  ],
};

export function generateInterviewQuestions(jobIdOrCategory: string): InterviewQuestion[] {

  return QUESTION_BANKS[jobIdOrCategory] || QUESTION_BANKS["default"];
}

export function generateInterviewQuestionsForJob(job: Partial<Job>, candidate?: Partial<CandidateProfile>): InterviewQuestion[] {
  const bank = QUESTION_BANKS[job.category || ""] || QUESTION_BANKS["default"];


  if (candidate && !candidate.hasExperience) {
   
    return bank.map(q => {
      if (q.type === "experience") {
        return {
          ...q,
          question: "Какой опыт из учёбы, волонтёрства или проектов показывает вашу ответственность?",
          purpose: "Для кандидатов без формального опыта",
        };
      }
      return q;
    });
  }

  return bank;
}



export function generateCandidatePreparation(job: Partial<Job>, candidate: Partial<CandidateProfile>) {
  const tips = [
    "Подготовьте короткий рассказ о себе (30 секунд)",
    "Узнайте заранее точный адрес и как добраться",
    "Подготовьте вопросы к работодателю",
  ];

  const clarify = [
    "Зарплата (точная сумма, сроки выплаты)",
    "График работы (точные часы)",
    "Адрес и транспорт",
    "Обязанности в первый день",
    "Есть ли пробная смена",
    "Сроки выплат",
  ];

  const suggestedIntro = `Я ${candidate.hasExperience ? "имею опыт работы" : "студент без формального опыта, но"} готов(-а) к работе. ${
    candidate.preferredDistricts?.length ? `Живу рядом с ${candidate.preferredDistricts[0]}.` : ""
  } ${candidate.readyToday ? "Могу начать сегодня." : "Готов(-а) начать в ближайшее время."}`;

  return { tips, clarify, suggestedIntro };
}


export function getEmptyScorecard(): InterviewScorecard {
  return {
    communication: 0,
    motivation: 0,
    reliability: 0,
    scheduleFit: 0,
    languageFit: 0,
    customerOrientation: 0,
    learningAbility: 0,
    notes: "",
    decision: "maybe_later",
  };
}

export const INTERVIEW_PLATFORMS: { id: InterviewPlatform; label: string; icon: string }[] = [
  { id: "zoom", label: "Zoom", icon: "📹" },
  { id: "google_meet", label: "Google Meet", icon: "🟢" },
  { id: "teams", label: "Microsoft Teams", icon: "🟣" },
  { id: "telegram_call", label: "Telegram звонок", icon: "📞" },
  { id: "whatsapp_call", label: "WhatsApp звонок", icon: "📱" },
  { id: "phone", label: "Телефон", icon: "☎️" },
  { id: "in_person", label: "Лично", icon: "🤝" },
];
