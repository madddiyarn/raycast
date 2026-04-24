/**
 * Jumys Relay — Mock Telegram AI Assistant / Parser
 *
 * Simulates the complete AI bot flow for the frontend demo.
 * Replace mock AI functions with real LLM API calls when backend is ready.
 */

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────

export type BotState =
  | "idle"
  | "received_raw_job"
  | "parsing"
  | "needs_missing_info"
  | "waiting_for_missing_info"
  | "preview_ready"
  | "waiting_for_confirmation"
  | "published"
  | "cancelled"
  | "duplicate_detected"
  | "suspicious_warning";

export interface ParsedJob {
  title?: string;
  district?: string;
  salary?: number;
  salaryText?: string;
  schedule?: string;
  contact?: string;
  category?: string;
  experienceRequired?: boolean;
  studentFriendly?: boolean;
  description?: string;
  languages?: string[];
}

export interface MissingFieldInfo {
  field: string;
  label: string;
  example: string;
}

export interface BotTurn {
  role: "user" | "bot";
  text: string;
  state: BotState;
  parsedJob?: ParsedJob;
  missingFields?: MissingFieldInfo[];
  actions?: { label: string; value: string; style?: "primary" | "secondary" | "danger" }[];
}

export interface TelegramConversation {
  turns: BotTurn[];
  finalJob?: ParsedJob;
  state: BotState;
}

// ──────────────────────────────────────────────────────────────────────────────
// PARSING
// ──────────────────────────────────────────────────────────────────────────────

const DISTRICT_PATTERNS = [
  "1 мкр","2 мкр","3а мкр","3б мкр","4 мкр","5 мкр","6 мкр","7 мкр","8 мкр",
  "9 мкр","10 мкр","11 мкр","12 мкр","13 мкр","14 мкр","15 мкр","16 мкр",
  "17 мкр","18 мкр","19 мкр","20 мкр","21 мкр","22 мкр","23 мкр","24 мкр",
  "25 мкр","26 мкр","27 мкр","28 мкр","29 мкр","30 мкр","31 мкр","32 мкр",
  "Самал","Кен-Баба","Нурсат","Центр","ЖК Томирис","Мунайлы",
];

const SCHEDULE_PATTERNS = ["2/2","5/2","6/1","3/3","2/3","30/30","15/15","вахта","гибкий","свободный","по договоренности"];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "HoReCa":    ["бариста","официант","повар","кухня","ресторан","кафе","буфет","шеф","курьер еда"],
  "Retail":    ["продавец","магазин","склад","кассир","аксессуары","торговля","консультант"],
  "Service":   ["автомойка","уборщик","горничная","охранник","чистка","техник"],
  "Admin":     ["офис","администратор","менеджер","секретарь","помощник руководителя"],
  "IT":        ["разработчик","программист","верстальщик","дизайнер","smm","контент"],
  "Строительство": ["сварщик","строитель","прораб","инженер","монтажник","оператор бсу"],
  "Beauty":    ["маникюр","парикмахер","салон","косметолог","визажист","мастер"],
  "Доставка":  ["курьер","доставка","водитель","мопед"],
};

export function extractJobFields(rawText: string): ParsedJob {
  const text = rawText.toLowerCase();
  const original = rawText;

  // Title: first meaningful noun phrase  
  const titleMatch = original.match(/(?:нужен|ищу|требуется|ищем)\s+([А-Яа-яёЁA-z\s-]{2,40}?)(?:[,\n]|$)/i);
  const title = titleMatch ? titleMatch[1].trim() : undefined;

  // District
  const district = DISTRICT_PATTERNS.find(d => text.includes(d.toLowerCase())) || undefined;

  // Salary
  const salaryMatch = text.match(/(\d[\d\s]*)[кk](?:\s*тг?|\s*тыс)?|(\d{6,})\s*(?:₸|тг|тенге)/);
  let salary: number | undefined;
  let salaryText: string | undefined;
  if (salaryMatch) {
    const raw = (salaryMatch[1] ?? salaryMatch[2] ?? "").replace(/\s+/g, "");
    const n = parseInt(raw);
    salary = raw.endsWith("к") || raw.endsWith("k") || n < 10000 ? n * 1000 : n;
    salaryText = salaryMatch[0].trim();
  }

  // Schedule
  const schedule = SCHEDULE_PATTERNS.find(s => text.includes(s.toLowerCase())) || undefined;

  // Contact
  const contactMatch = original.match(/(@[a-zA-Z0-9_]{2,}|\+?[78]\d{10}|8\s?\(\d{3}\)\s?\d{3}-?\d{2}-?\d{2})/);
  const contact = contactMatch ? contactMatch[0].trim() : undefined;

  // Category
  let category: string | undefined;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      category = cat;
      break;
    }
  }

  // Student friendly
  const studentFriendly = text.includes("студент") || text.includes("без опыта");

  // Experience
  const experienceRequired = text.includes("опыт обязателен") || text.includes("с опытом") ||
                              (!text.includes("без опыта") && !text.includes("можно без"));

  return { title, district, salary, salaryText, schedule, contact, category, experienceRequired, studentFriendly };
}

export function findMissingJobFields(job: ParsedJob): MissingFieldInfo[] {
  const required: MissingFieldInfo[] = [];

  if (!job.title)    required.push({ field: "title",    label: "название вакансии", example: "Продавец, Бариста" });
  if (!job.district) required.push({ field: "district", label: "район работы",      example: "15 мкр, Самал, Центр" });
  if (!job.salary && !job.salaryText) required.push({ field: "salary", label: "зарплата", example: "180к, по договорённости" });
  if (!job.schedule) required.push({ field: "schedule", label: "график",            example: "2/2, 5/2, гибкий" });
  if (!job.contact)  required.push({ field: "contact",  label: "контакт",           example: "@username или номер телефона" });

  return required;
}

export function generateClarifyingQuestions(missing: MissingFieldInfo[]): string {
  if (missing.length === 0) return "";
  const lines = missing.map(m => `— ${m.label} (пример: ${m.example})`).join("\n");
  return `Похоже, это вакансия! Но не хватает данных:\n${lines}\n\nОтветьте одним сообщением, например:\n15 мкр, 180к, 2/2, @storeaktau`;
}

export function improveVacancyText(job: ParsedJob): string {
  const parts: string[] = [];

  const who = job.title ?? "Специалист";
  const where = job.district ? `в ${job.district}` : "";
  const salary = job.salaryText ? `, зарплата ${job.salaryText}` : "";
  const schedule = job.schedule ? `, график ${job.schedule}` : "";
  const exp = job.experienceRequired === false ? " Подходит кандидатам без опыта." : "";
  const student = job.studentFriendly ? " Можно студентам." : "";

  parts.push(`Ищем ${who} ${where}${salary}${schedule}.`);
  parts.push(`${exp}${student}`);
  if (job.contact) parts.push(`Связаться: ${job.contact}`);

  return parts.filter(Boolean).join(" ").trim();
}

export function generateVacancyPreview(job: ParsedJob): string {
  const improved = improveVacancyText(job);
  return `
📋 Вакансия готова:

**${job.title ?? "Вакансия"}**
${[job.district, job.salaryText, job.schedule].filter(Boolean).join(" · ")}
Опыт: ${job.experienceRequired ? "требуется" : "не обязателен"}
Контакт: ${job.contact ?? "не указан"}

✨ AI улучшил описание:
«${improved}»
`.trim();
}

export function generateConfirmationMessage(job: ParsedJob): string {
  return generateVacancyPreview(job) + "\n\nОпубликовать вакансию?";
}

export function detectSuspiciousVacancy(job: ParsedJob): { suspicious: boolean; reason?: string } {
  if ((job.salary ?? 0) > 2_000_000) {
    return { suspicious: true, reason: "Зарплата подозрительно высокая" };
  }
  const vagueTerms = ["активных", "партнёров", "сетевой", "инвестиции"];
  if (vagueTerms.some(t => (job.title ?? "").toLowerCase().includes(t))) {
    return { suspicious: true, reason: "Расплывчатое название вакансии" };
  }
  return { suspicious: false };
}

// ──────────────────────────────────────────────────────────────────────────────
// CONVERSATION SIMULATOR (for /demo-flow and pipeline pages)
// ──────────────────────────────────────────────────────────────────────────────

export function simulateTelegramConversation(rawText: string, existingJobs: any[] = []): TelegramConversation {
  const turns: BotTurn[] = [];

  // Turn 1: User sends raw message
  turns.push({ role: "user", text: rawText, state: "received_raw_job" });

  // Turn 2: Bot parses
  const parsed = extractJobFields(rawText);
  const missing = findMissingJobFields(parsed);
  const suspicious = detectSuspiciousVacancy(parsed);

  if (suspicious.suspicious) {
    turns.push({
      role: "bot",
      text: `🚨 Вакансия выглядит подозрительно: ${suspicious.reason}.\nПожалуйста, уточните детали или свяжитесь с поддержкой.`,
      state: "suspicious_warning",
      parsedJob: parsed,
      actions: [
        { label: "Всё равно опубликовать", value: "publish_anyway", style: "danger" },
        { label: "Отменить", value: "cancel", style: "secondary" },
      ],
    });
    return { turns, state: "suspicious_warning" };
  }

  if (missing.length > 0) {
    turns.push({
      role: "bot",
      text: generateClarifyingQuestions(missing),
      state: "needs_missing_info",
      parsedJob: parsed,
      missingFields: missing,
    });

    // Simulate user filling in missing information
    const filledText = missing.map(m => {
      if (m.field === "district") return "15 мкр";
      if (m.field === "salary")   return "180к";
      if (m.field === "schedule") return "2/2";
      if (m.field === "contact")  return "@storeaktau";
      return m.example.split(",")[0];
    }).join(", ");

    turns.push({ role: "user", text: filledText, state: "waiting_for_missing_info" });

    // Merge filled data
    const filled = extractJobFields(filledText);
    Object.assign(parsed, filled);
  }

  // Final preview + confirmation
  const preview = generateConfirmationMessage(parsed);
  turns.push({
    role: "bot",
    text: preview,
    state: "waiting_for_confirmation",
    parsedJob: parsed,
    actions: [
      { label: "✅ Опубликовать", value: "publish",  style: "primary" },
      { label: "✏️ Редактировать", value: "edit",   style: "secondary" },
      { label: "❌ Отменить",     value: "cancel",  style: "danger" },
    ],
  });

  // Simulate confirmation
  turns.push({ role: "user", text: "Опубликовать", state: "waiting_for_confirmation" });

  turns.push({
    role: "bot",
    text: `✅ Вакансия "${parsed.title}" опубликована!\n\nAI уже ищет подходящих кандидатов...`,
    state: "published",
    parsedJob: parsed,
  });

  return { turns, finalJob: parsed, state: "published" };
}

// Visible label for each BotState
export const BOT_STATE_LABELS: Record<BotState, string> = {
  idle:                    "Ожидание",
  received_raw_job:        "Получено сообщение",
  parsing:                 "Разбор ИИ",
  needs_missing_info:      "Не хватает данных",
  waiting_for_missing_info:"Ожидание ответа",
  preview_ready:           "Предпросмотр готов",
  waiting_for_confirmation:"Ожидание подтверждения",
  published:               "Опубликовано",
  cancelled:               "Отменено",
  duplicate_detected:      "Обнаружен дубликат",
  suspicious_warning:      "Подозрительная вакансия",
};
