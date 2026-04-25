import { Job, CandidateProfile, Application, EmployerProfile } from "./types";
import { MOCK_CANDIDATES, MOCK_EMPLOYERS } from "./mock-candidates";


export const mockCandidates: any[] = [
  ...MOCK_CANDIDATES,
  {
    userId: "cand_aliya",
    name: "Алия",
    preferredDistricts: ["14 мкр"],
    rating: {
      workScore: 88,
      level: "ready",
      scoreBreakdown: { profileCompleteness: 15, languagesAdded: 10, availabilityAdded: 10, cvOrAiSummary: 10, fastResponse: 20, completedInterview: 10, positiveFeedback: 0, noShowPenalty: 0 },
      averageResponseTime: 8,
      completedInterviews: 2,
      noShowCount: 0,
      badges: [{ id: "fast", title: "Быстрый ответ", icon: "⚡" }, { id: "student", title: "Студент", icon: "🎓" }],
      responseRate: 100,
      completedShifts: 0,
      employerFeedbackAvg: 0
    },
   
    aiHeadline: "Студент без опыта, готова к обучению",
    aiSummary: "Ищет подработку после 16:00 в сфере HoReCa или Retail. Отлично владеет русским и знает казахский на базовом уровне. Проактивная, с высокой скоростью ответов.",
    languages: [
      { language: "Русский", level: "fluent", canServeCustomers: true, canWriteMessages: true, canInterview: true }, 
      { language: "Казахский", level: "conversational", canServeCustomers: true, canWriteMessages: false, canInterview: false }
    ],
    preferredCategories: ["HoReCa", "Retail"],
    experienceLevel: "Без опыта",
    employmentTypes: ["Подработка"],
    salaryExpectation: 100000,
  }
];

export const mockEmployers: EmployerProfile[] = MOCK_EMPLOYERS as unknown as EmployerProfile[];


export const mockJobs: Job[] = [
  {
    id: "job-1", title: "Бариста", description: "Ищу бариста с опытом и без (научим). Варить кофе, поддерживать чистоту.",
    category: "HoReCa", district: "15 мкр", salaryMin: 180000, salaryMax: 220000, salaryText: "180к",
    schedule: "2/2", employmentType: "Полная занятость", experienceRequired: false, studentFriendly: true,
    contact: "@cafeaktau", sourceType: "telegram", status: "published", employerId: MOCK_EMPLOYERS[0]?.userId,
    rawText: "нужен бариста 15 мкр 180к 2/2 можно студентам опыт не обязателен @cafeaktau",
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "job-2", title: "Продавец-консультант", description: "Продажа аксессуаров, консультация клиентов.",
    category: "Retail", district: "14 мкр", salaryMin: 150000, salaryMax: 200000, salaryText: "150-200 тыс",
    schedule: "5/2", employmentType: "Полная занятость", experienceRequired: false, studentFriendly: true,
    contact: "@akses_store", sourceType: "telegram", status: "published", employerId: MOCK_EMPLOYERS[1]?.userId,
    rawText: "Срочно ищем продавца консультанта 14 мкр 5/2. зп 150-200. можно без опыта",
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "job-3", title: "Курьер", description: "Доставка еды по городу. Желательно на своем авто или мопеде.",
    category: "Доставка", district: "12 мкр", salaryMin: 250000, salaryMax: 350000, salaryText: "сдельная от 250к",
    schedule: "Гибкий", employmentType: "Подработка", experienceRequired: false, studentFriendly: true,
    contact: "@dostavka_aktau", sourceType: "telegram", status: "published", employerId: MOCK_EMPLOYERS[2]?.userId,
    rawText: "Курьеры с мопедом или авто! Зп сдельная от 250к график гибкий. писать сюда",
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "job-4", title: "Помощник на автомойку", description: "Мойка авто, уборка бокса.",
    category: "Service", district: "29 мкр", salaryMin: 4000, salaryMax: 6000, salaryText: "5000 за смену",
    schedule: "6/1", employmentType: "Частичная занятость", experienceRequired: false, studentFriendly: false,
    contact: "@autowash_akt", sourceType: "telegram", status: "published", employerId: "emp-4",
    rawText: "Нужен помощник на автомойку 29мкр 5000 день 6/1",
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "job-5", title: "Администратор салона", description: "Встреча гостей, запись клиентов, ведение инстаграм.",
    category: "Beauty", district: "17 мкр", salaryMin: 170000, salaryMax: 170000, salaryText: "170 000 тг",
    schedule: "2/2", employmentType: "Полная занятость", experienceRequired: true, studentFriendly: false,
    contact: "@salon_aktau", sourceType: "telegram", status: "published", employerId: "emp-5",
    rawText: "Требуется админ в салон 17 мкр. 2/2 зп 170к. Опыт приветствуется",
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "job-6", title: "Грузчик на склад", description: "Погрузка/разгрузка товаров.",
    category: "Логистика", district: "Приозерный", salaryMin: 200000, salaryMax: 200000, salaryText: "200к",
    schedule: "5/2", employmentType: "Полная занятость", experienceRequired: false, studentFriendly: false,
    contact: "@skladbase", sourceType: "telegram", status: "published", employerId: "emp-6",
    rawText: "Ищем грузчиков на склад база Приозерный. 5/2 200тыс",
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "job-7", title: "Промоутер", description: "Раздача листовок в ТРЦ Актау.",
    category: "Retail", district: "16 мкр", salaryMin: 1000, salaryMax: 1500, salaryText: "1000 тг/час",
    schedule: "Гибкий", employmentType: "Подработка", experienceRequired: false, studentFriendly: true,
    contact: "@promo_manager", sourceType: "telegram", status: "published", employerId: "emp-7",
    rawText: "Промоутеры в ТРЦ. 1000 тг в час, график свободный, идеально для студентов",
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "job-8", title: "Ассистент репетитора", description: "Проверка домашних заданий, помощь на уроках.",
    category: "Образование", district: "11 мкр", salaryMin: 80000, salaryMax: 120000, salaryText: "от 80к",
    schedule: "Частичная занятость", employmentType: "Подработка", experienceRequired: false, studentFriendly: true,
    contact: "@math_akt", sourceType: "telegram", status: "published", employerId: "emp-8",
    rawText: "Ищу ассистента, проверка дз, 11 мкр. от 80к.",
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "job-9", title: "Повар (сушист)", description: "Приготовление суши и роллов.",
    category: "HoReCa", district: "8 мкр", salaryMin: 250000, salaryMax: 300000, salaryText: "250-300к",
    schedule: "6/1", employmentType: "Полная занятость", experienceRequired: true, studentFriendly: false,
    contact: "@sushi_aktau", sourceType: "telegram", status: "published", employerId: MOCK_EMPLOYERS[0]?.userId,
    rawText: "В доставку срочно повар сушист опыт работы от 1 года 8мкр зп до 300тыс",
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "job-10", title: "Официант", description: "Обслуживание гостей, знание меню.",
    category: "HoReCa", district: "7 мкр", salaryMin: 150000, salaryMax: 0, salaryText: "150к + чай",
    schedule: "2/2", employmentType: "Полная занятость", experienceRequired: false, studentFriendly: true,
    contact: "@terrasa_akt", sourceType: "telegram", status: "published", employerId: MOCK_EMPLOYERS[0]?.userId,
    rawText: "Официанты можно студентам 7 мкр 150к+чат 2/2",
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "job-11", title: "СММ специалист", description: "Съемка рилс, ведение сторис.",
    category: "IT / Media", district: "26 мкр", salaryMin: 100000, salaryMax: 150000, salaryText: "от 100к",
    schedule: "Удаленно", employmentType: "Проектная", experienceRequired: false, studentFriendly: true,
    contact: "@smm_agency_akt", sourceType: "telegram", status: "published", employerId: "emp-9",
    rawText: "Ищем мобилографа смм. Удаленно/26 мкр. 100тыс. можно без опыта главное желание",
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "job-12", title: "Кассир", description: "Работа на кассе, расчет покупателей.",
    category: "Retail", district: "4 мкр", salaryMin: 120000, salaryMax: 140000, salaryText: "120-140к",
    schedule: "2/2", employmentType: "Полная занятость", experienceRequired: false, studentFriendly: true,
    contact: "@supermarket4", sourceType: "telegram", status: "published", employerId: "emp-10",
    rawText: "В супермаркет требуется кассир 4 мкр 2через2 зп 120",
    createdAt: new Date(), updatedAt: new Date()
  }
];

export const mockSources: any[] = [];


export function getHybridJobs(dbJobs: Job[]): Job[] {

  const merged = [...dbJobs];
  const dbIds = new Set(dbJobs.map(j => j.id));
  
  for (const job of mockJobs) {
    if (!dbIds.has(job.id)) {
      merged.push(job);
    }
  }
  
  return merged;
}

