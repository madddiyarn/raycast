"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, completeCandidateOnboarding, completeEmployerOnboarding } from "@/lib/auth";
import { User } from "@/lib/types";
import { calculateCandidateWorkScore, getCandidateLevel, getCandidateLevelLabel, getCandidateImprovementTips, getCandidateBadges } from "@/lib/ratings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, ArrowLeft, Bot, Sparkles, Building2, MapPin, Globe, Briefcase, Calendar, DollarSign, Star, CheckCircle2, Zap } from "lucide-react";

const CATEGORY_DATA = [
  { name: "HoReCa", emoji: "☕", roles: ["бариста", "официант", "помощник кухни"] },
  { name: "Retail", emoji: "🛒", roles: ["продавец", "консультант", "кассир"] },
  { name: "Доставка", emoji: "🚴", roles: ["курьер", "пеший курьер", "доставка документов"] },
  { name: "Service", emoji: "🔧", roles: ["автомойка", "помощник", "уборка"] },
  { name: "Beauty", emoji: "💅", roles: ["администратор салона", "помощник мастера"] },
  { name: "Office", emoji: "💼", roles: ["администратор", "оператор", "помощник менеджера"] },
  { name: "Образование", emoji: "📚", roles: ["репетиторство", "помощник преподавателя"] },
  { name: "Events", emoji: "🎉", roles: ["промоутер", "ивент-помощник", "регистрация гостей"] },
  { name: "Строительство", emoji: "🏗️", roles: ["разнорабочий", "помощник бригады"] },
  { name: "Стажировка", emoji: "🌱", roles: ["стажировка", "практика", "первый опыт"] },
];

const SOFT_SKILLS = ["Коммуникабельность", "Ответственность", "Пунктуальность", "Стрессоустойчивость", "Быстрообучаемость", "Работа в команде", "Вежливость", "Управление конфликтами"];
const SERVICE_SKILLS = ["Обслуживание клиентов", "Продажи", "Работа с кассой", "Приём заказов", "Сервировка", "Презентация товаров", "Чистота рабочего места"];
const DIGITAL_SKILLS = ["ПК грамотность", "Excel / Google Sheets", "Соцсети", "Canva", "POS терминал", "Онлайн коммуникация"];
const PHYSICAL_SKILLS = ["Могу стоять долго", "Могу носить лёгкие грузы", "Работа на улице", "Вечерние смены", "Работа по выходным"];

const LANGUAGES = ["Казахский", "Русский", "English"];
const LANG_LEVELS = [
  { key: "basic", label: "Базовый", desc: "Простые фразы" },
  { key: "conversational", label: "Разговорный", desc: "Свободное общение" },
  { key: "fluent", label: "Свободный", desc: "Полная беглость" },
  { key: "native", label: "Родной", desc: "Родной язык" },
];

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const TIME_SLOTS = ["08:00–12:00", "12:00–16:00", "16:00–20:00", "20:00–00:00"];

const SCHEDULES = ["2/2", "5/2", "6/1", "Гибкий", "Вечерние", "Выходные"];

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});
  const [selectedSkills, setSelectedSkills] = useState<Record<string, string>>({});
  const [customSkill, setCustomSkill] = useState("");
  const [customSkillsList, setCustomSkillsList] = useState<string[]>([]);
  const [languages, setLanguages] = useState<Record<string, { level: string; serve: boolean; write: boolean; interview: boolean }>>({});
  const [hasExperience, setHasExperience] = useState(false);
  const [prevRole, setPrevRole] = useState("");
  const [prevWorkplace, setPrevWorkplace] = useState("");
  const [volunteerExp, setVolunteerExp] = useState("");
  const [cvText, setCvText] = useState("");
  const [availDays, setAvailDays] = useState<string[]>([]);
  const [availTimes, setAvailTimes] = useState<string[]>([]);
  const [readyToday, setReadyToday] = useState(false);
  const [urgentShifts, setUrgentShifts] = useState(false);
  const [prefDistricts, setPrefDistricts] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState(100000);
  const [prefSchedules, setPrefSchedules] = useState<string[]>([]);
  const [acceptsTrial, setAcceptsTrial] = useState(true);
  const [wantsFirstJob, setWantsFirstJob] = useState(true);
  const [wantsVerified, setWantsVerified] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("HoReCa");
  const [empDistrict, setEmpDistrict] = useState("14 мкр");
  const [hiringRoles, setHiringRoles] = useState<string[]>([]);
  const [candidateReqs, setCandidateReqs] = useState<string[]>([]);
  const [reqLanguages, setReqLanguages] = useState<string[]>([]);
  const [interviewPlatforms, setInterviewPlatforms] = useState<string[]>([]);
  const [interviewDuration, setInterviewDuration] = useState(15);

  useEffect(() => {
    setIsClient(true);
    const u = getCurrentUser();
    if (!u) {
      router.push("/auth/register");
    } else if (u.onboardingCompleted) {
      router.push(u.role === "employer" ? "/employer" : "/search");
    } else {
      setUser(u);
    }
    setLoading(false);
  }, [router]);

  const toggle = (arr: string[], val: string) => arr.includes(val) ? arr.filter(a => a !== val) : [...arr, val];

  const handleFinish = async () => {
    setSaving(true);
    try {
      if (user?.role === "candidate") {
        await completeCandidateOnboarding({
          preferredCategories: Object.keys(selectedCategories),
          skills: Object.entries(selectedSkills).map(([name, level]) => ({ name, group: "soft" as const, level: level as any })),
          languages: Object.entries(languages).map(([lang, d]) => ({ language: lang, level: d.level as any, canServeCustomers: d.serve, canWriteMessages: d.write, canInterview: d.interview })),
          hasExperience,
          readyToday,
          salaryExpectation: salaryMin,
          acceptsTrialShift: acceptsTrial,
          wantsFirstJobFriendly: wantsFirstJob,
          aiSummary: cvText || `${user.fullName} ищет работу в сферах ${Object.keys(selectedCategories).join(", ")}`,
        });
        router.push("/search");
      } else {
        await completeEmployerOnboarding({
          businessName, businessCategory, district: empDistrict,
          hiringNeeds: hiringRoles,
          requiredLanguages: reqLanguages.map(l => ({ language: l, level: "conversational" as any, canServeCustomers: true, canWriteMessages: false, canInterview: true })),
          interviewPlatforms, interviewDuration,
          telegramIntegrationStatus: "none",
        });
        router.push("/employer");
      }
    } catch { setSaving(false); }
  };

  if (!isClient || loading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  const role = user.role;
  const totalSteps = role === "candidate" ? 8 : 7;
  const progress = (step / totalSteps) * 100;

  const chip = (label: string, active: boolean, onClick: () => void, color = "indigo") => (
    <button key={label} onClick={onClick} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${active ? `border-${color}-600 bg-${color}-50 text-${color}-700 shadow-sm` : "border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}>
      {label}
    </button>
  );

  const stepAnim = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 }, transition: { duration: 0.25 } };

  const StepWrapper = ({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) => (
    <motion.div {...stepAnim} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10">
      {step > 1 && <button onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-900 mb-6"><ArrowLeft className="w-4 h-4" /> Назад</button>}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-500 mb-8 border-b border-slate-100 pb-6">{subtitle}</p>
      {children}
      <div className="mt-10 flex justify-end">
        {step < totalSteps ? (
          <Button onClick={() => setStep(step + 1)} className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold group shadow-lg shadow-slate-200">
            Далее <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={saving} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-slate-900 text-white font-bold shadow-xl shadow-indigo-600/20">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Завершить и начать"}
          </Button>
        )}
      </div>
    </motion.div>
  );

  const candidateSteps: Record<number, React.ReactNode> = {
    1: (
      <StepWrapper title="В какой сфере хотите работать?" subtitle="Выберите категории и укажите интерес">
        <div className="grid sm:grid-cols-2 gap-3">
          {CATEGORY_DATA.map(cat => {
            const sel = selectedCategories[cat.name];
            return (
              <button key={cat.name} onClick={() => {
                const next = { ...selectedCategories };
                if (next[cat.name]) delete next[cat.name];
                else next[cat.name] = "high";
                setSelectedCategories(next);
              }} className={`p-4 rounded-2xl border-2 text-left transition-all ${sel ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 hover:border-slate-200"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="font-bold text-slate-900">{cat.name}</span>
                  {sel && <span className="ml-auto bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase">✓</span>}
                </div>
                <p className="text-xs text-slate-500 font-medium">{cat.roles.join(", ")}</p>
                {sel && (
                  <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                    {(["high", "medium", "open"] as const).map(lvl => (
                      <button key={lvl} onClick={() => setSelectedCategories({ ...selectedCategories, [cat.name]: lvl })} className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${selectedCategories[cat.name] === lvl ? "border-indigo-500 bg-indigo-100 text-indigo-700" : "border-slate-200 text-slate-500"}`}>
                        {lvl === "high" ? "🔥 Хочу" : lvl === "medium" ? "👍 Интересно" : "🤷 Готов попробовать"}
                      </button>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </StepWrapper>
    ),

    2: (
      <StepWrapper title="Ваши навыки" subtitle="Укажите уровень владения каждым навыком">
        <div className="space-y-6">
          {[
            { title: "Soft Skills", skills: SOFT_SKILLS, color: "indigo" },
            { title: "Обслуживание", skills: SERVICE_SKILLS, color: "emerald" },
            { title: "Цифровые", skills: DIGITAL_SKILLS, color: "blue" },
            { title: "Физические", skills: PHYSICAL_SKILLS, color: "amber" },
          ].map(group => (
            <div key={group.title}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{group.title}</p>
              <div className="flex flex-wrap gap-2">
                {group.skills.map(sk => {
                  const sel = selectedSkills[sk];
                  return (
                    <div key={sk} className="relative group">
                      <button onClick={() => {
                        const n = { ...selectedSkills };
                        if (n[sk]) delete n[sk]; else n[sk] = "basic";
                        setSelectedSkills(n);
                      }} className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all ${sel ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-600 hover:border-slate-200"}`}>
                        {sk} {sel && <span className="text-[10px] ml-1 opacity-70">({sel === "beginner" ? "нач." : sel === "basic" ? "базов." : sel === "confident" ? "увер." : "опытн."})</span>}
                      </button>
                      {sel && (
                        <div className="absolute top-full left-0 mt-1 flex gap-1 z-10 bg-white border border-slate-200 rounded-lg p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                          {(["beginner", "basic", "confident", "experienced"] as const).map(lvl => (
                            <button key={lvl} onClick={() => setSelectedSkills({ ...selectedSkills, [sk]: lvl })} className={`px-2 py-1 text-[10px] rounded font-bold ${selectedSkills[sk] === lvl ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                              {lvl === "beginner" ? "Нач" : lvl === "basic" ? "Баз" : lvl === "confident" ? "Ув" : "Оп"}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Свой навык</p>
            <div className="flex gap-2">
              <Input value={customSkill} onChange={e => setCustomSkill(e.target.value)} placeholder="Напр: Latte Art" className="h-10 rounded-xl" />
              <Button variant="outline" onClick={() => { if (customSkill.trim()) { setCustomSkillsList([...customSkillsList, customSkill.trim()]); setCustomSkill(""); }}} className="rounded-xl h-10 font-bold shrink-0">Добавить</Button>
            </div>
            {customSkillsList.length > 0 && <div className="flex gap-2 mt-3 flex-wrap">{customSkillsList.map(s => <span key={s} className="bg-violet-100 text-violet-700 px-3 py-1 rounded-lg text-xs font-bold">{s}</span>)}</div>}
          </div>
        </div>
      </StepWrapper>
    ),

    3: (
      <StepWrapper title="Языки" subtitle="Укажите языки и уровень владения">
        <div className="space-y-5">
          {LANGUAGES.map(lang => {
            const data = languages[lang];
            return (
              <div key={lang} className={`p-5 rounded-2xl border-2 transition-all ${data ? "border-indigo-200 bg-indigo-50/30" : "border-slate-100"}`}>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => {
                    const n = { ...languages };
                    if (n[lang]) delete n[lang]; else n[lang] = { level: "conversational", serve: false, write: false, interview: false };
                    setLanguages(n);
                  }} className="flex items-center gap-3">
                    <Globe className={`w-5 h-5 ${data ? "text-indigo-600" : "text-slate-400"}`} />
                    <span className={`font-bold ${data ? "text-slate-900" : "text-slate-600"}`}>{lang}</span>
                  </button>
                  {data && <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold">✓</span>}
                </div>
                {data && (
                  <div className="space-y-4 mt-3">
                    <div className="flex flex-wrap gap-2">
                      {LANG_LEVELS.map(ll => (
                        <button key={ll.key} onClick={() => setLanguages({ ...languages, [lang]: { ...data, level: ll.key } })} className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${data.level === ll.key ? "border-indigo-600 bg-indigo-100 text-indigo-700" : "border-slate-200 text-slate-500"}`}>
                          {ll.label}<br /><span className="font-medium opacity-70">{ll.desc}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { key: "serve", label: "Обслуживать клиентов" },
                        { key: "write", label: "Писать сообщения" },
                        { key: "interview", label: "Пройти собеседование" },
                      ].map(ctx => (
                        <label key={ctx.key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={(data as any)[ctx.key]} onChange={() => setLanguages({ ...languages, [lang]: { ...data, [ctx.key]: !(data as any)[ctx.key] } })} className="w-4 h-4 rounded text-indigo-600" />
                          <span className="text-xs font-medium text-slate-600">{ctx.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </StepWrapper>
    ),

    4: (
      <StepWrapper title="Опыт и Резюме" subtitle="Нет опыта — это нормально. Расскажите про учёбу и волонтёрство.">
        <div className="space-y-6">
          <div className="flex gap-4">
            <button onClick={() => setHasExperience(false)} className={`flex-1 p-5 rounded-2xl border-2 text-center transition-all ${!hasExperience ? "border-indigo-600 bg-indigo-50" : "border-slate-100"}`}>
              <span className="text-2xl block mb-2">🌱</span>
              <p className="font-bold text-slate-900">Нет опыта</p>
              <p className="text-xs text-slate-500 mt-1">Первая работа</p>
            </button>
            <button onClick={() => setHasExperience(true)} className={`flex-1 p-5 rounded-2xl border-2 text-center transition-all ${hasExperience ? "border-indigo-600 bg-indigo-50" : "border-slate-100"}`}>
              <span className="text-2xl block mb-2">💼</span>
              <p className="font-bold text-slate-900">Есть опыт</p>
              <p className="text-xs text-slate-500 mt-1">Работал(а) раньше</p>
            </button>
          </div>
          {hasExperience ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-bold text-slate-700 mb-2 block">Должность</label><Input value={prevRole} onChange={e => setPrevRole(e.target.value)} placeholder="Бариста" className="h-11 rounded-xl" /></div>
                <div><label className="text-sm font-bold text-slate-700 mb-2 block">Место работы</label><Input value={prevWorkplace} onChange={e => setPrevWorkplace(e.target.value)} placeholder="Кофейня" className="h-11 rounded-xl" /></div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
              <p className="text-sm font-bold text-emerald-800 mb-2">💡 Нет опыта — это нормально!</p>
              <p className="text-xs text-emerald-700 font-medium">Укажите учебные проекты, волонтёрство или обязанности, которые показывают ответственность.</p>
            </div>
          )}
          <div><label className="text-sm font-bold text-slate-700 mb-2 block">Волонтёрство / Проекты</label><Input value={volunteerExp} onChange={e => setVolunteerExp(e.target.value)} placeholder="Волонтёр на школьных мероприятиях" className="h-11 rounded-xl" /></div>
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">О себе <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Profiler</span></label>
            <textarea value={cvText} onChange={e => setCvText(e.target.value)} placeholder="Студент 2 курса, живу в 14 мкр, могу работать по выходным. Готов учиться делать кофе." rows={4} className="w-full rounded-2xl border-2 border-slate-100 p-4 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all resize-none bg-slate-50/50" />
          </div>
        </div>
      </StepWrapper>
    ),

    5: (
      <StepWrapper title="Доступность" subtitle="Когда вы можете работать?">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-bold text-slate-900 mb-4">Дни недели</p>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(d => (
                <button key={d} onClick={() => setAvailDays(toggle(availDays, d))} className={`w-12 h-12 rounded-xl font-bold text-sm border-2 transition-all ${availDays.includes(d) ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 mb-4">Время</p>
            <div className="grid grid-cols-2 gap-3">
              {TIME_SLOTS.map(t => (
                <button key={t} onClick={() => setAvailTimes(toggle(availTimes, t))} className={`p-3 rounded-xl text-sm font-semibold border-2 transition-all ${availTimes.includes(t) ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-100 text-slate-600"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={readyToday} onChange={() => setReadyToday(!readyToday)} className="w-5 h-5 rounded text-indigo-600" /><span className="text-sm font-bold text-slate-700">⚡ Готов сегодня</span></label>
            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={urgentShifts} onChange={() => setUrgentShifts(!urgentShifts)} className="w-5 h-5 rounded text-indigo-600" /><span className="text-sm font-bold text-slate-700">🔔 Срочные смены</span></label>
          </div>
        </div>
      </StepWrapper>
    ),

    6: (
      <StepWrapper title="Ожидания от работы" subtitle="Помогите нам подобрать вакансии точнее">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-slate-900 mb-3 block">Минимальная зарплата (₸/мес)</label>
            <input type="range" min={50000} max={500000} step={10000} value={salaryMin} onChange={e => setSalaryMin(Number(e.target.value))} className="w-full accent-indigo-600" />
            <p className="text-lg font-extrabold text-indigo-600 mt-2">от {salaryMin.toLocaleString()} ₸</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 mb-3">Предпочитаемый график</p>
            <div className="flex flex-wrap gap-2">
              {SCHEDULES.map(s => (
                <button key={s} onClick={() => setPrefSchedules(toggle(prefSchedules, s))} className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${prefSchedules.includes(s) ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-600"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={acceptsTrial} onChange={() => setAcceptsTrial(!acceptsTrial)} className="w-5 h-5 rounded text-indigo-600" /><span className="text-sm font-medium text-slate-700">Готов на пробную смену</span></label>
            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={wantsFirstJob} onChange={() => setWantsFirstJob(!wantsFirstJob)} className="w-5 h-5 rounded text-indigo-600" /><span className="text-sm font-medium text-slate-700">Только «Первая работа» вакансии</span></label>
            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={wantsVerified} onChange={() => setWantsVerified(!wantsVerified)} className="w-5 h-5 rounded text-indigo-600" /><span className="text-sm font-medium text-slate-700">Только проверенные работодатели</span></label>
          </div>
        </div>
      </StepWrapper>
    ),

    7: (
      <StepWrapper title="Предпочитаемые микрорайоны" subtitle="Где вам удобно работать?">
        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2">
          {["1 мкр","2 мкр","3 мкр","4 мкр","5 мкр","6 мкр","7 мкр","8 мкр","9 мкр","10 мкр","11 мкр","12 мкр","13 мкр","14 мкр","15 мкр","16 мкр","17 мкр","18 мкр","19 мкр","20 мкр","21 мкр","22 мкр","24 мкр","26 мкр","27 мкр","28 мкр","29 мкр","30 мкр","31 мкр","32 мкр","33 мкр","34 мкр","35 мкр","Самал","Болашак","Нурсат","Центр","Береке"].map(d => (
            <button key={d} onClick={() => setPrefDistricts(toggle(prefDistricts, d))} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${prefDistricts.includes(d) ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>{d}</button>
          ))}
        </div>
      </StepWrapper>
    ),

    8: (() => {
      const mockProfile: any = { preferredCategories: Object.keys(selectedCategories), skills: Object.entries(selectedSkills).map(([n]) => ({ name: n })), languages: Object.entries(languages).map(([l, d]) => ({ language: l, level: d.level })), hasExperience, readyToday, aiSummary: cvText || "Активный кандидат", availability: availDays, cvText };
      const score = calculateCandidateWorkScore(mockProfile);
      const level = getCandidateLevel(score);
      const tips = getCandidateImprovementTips(mockProfile);
      const badges = getCandidateBadges(mockProfile);

      return (
        <StepWrapper title="Ваш AI-профиль готов!" subtitle="Нейросеть подготовила вашу карточку для работодателей">
          <div className="space-y-6">
            {/* Score */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[40px]" />
              <p className="text-sm font-bold text-slate-400 mb-2">Work Score</p>
              <p className="text-5xl font-black text-white">{score}</p>
              <p className="text-sm font-bold text-indigo-400 mt-1">{getCandidateLevelLabel(level)}</p>
              <div className="h-2 w-full bg-slate-800 rounded-full mt-4"><div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${score}%` }} /></div>
            </div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {badges.map(b => <span key={b.id} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">{b.icon} {b.title}</span>)}
            </div>
            {/* AI Summary */}
            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
              <div className="flex items-center gap-2 mb-3"><Bot className="w-5 h-5 text-indigo-600" /><span className="text-sm font-bold text-slate-900">AI-Саммари</span></div>
              <p className="text-sm text-slate-600 italic leading-relaxed">«{cvText || `${user.fullName} ищет работу в сферах ${Object.keys(selectedCategories).join(", ") || "разных сферах"}. ${hasExperience ? "Имеет опыт работы." : "Без формального опыта, но готов(-а) быстро учиться."} ${readyToday ? "Готов(-а) выйти сегодня." : ""}`}»</p>
            </div>
            {/* Tips */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Как улучшить профиль</p>
              {tips.map((t, i) => <p key={i} className="text-sm text-slate-600 font-medium flex items-start gap-2 mb-1"><Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> {t}</p>)}
            </div>
          </div>
        </StepWrapper>
      );
    })(),
  };

  const employerSteps: Record<number, React.ReactNode> = {
    1: (
      <StepWrapper title="Настройка бизнеса" subtitle="Расскажите о своей компании">
        <div className="space-y-6">
          <div><label className="text-sm font-bold text-slate-700 mb-2 block">Название бизнеса</label><div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Coffee Boom, Магазин Аружан..." className="h-12 rounded-xl pl-10" /></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-bold text-slate-700 mb-2 block">Сфера</label><select value={businessCategory} onChange={e => setBusinessCategory(e.target.value)} className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/50 shadow-sm px-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none">{["HoReCa","Retail","Доставка","Beauty","Service","Медицина","Строительство","Образование","Другое"].map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="text-sm font-bold text-slate-700 mb-2 block">Микрорайон</label><select value={empDistrict} onChange={e => setEmpDistrict(e.target.value)} className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/50 shadow-sm px-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none">{["1 мкр","4 мкр","7 мкр","11 мкр","12 мкр","14 мкр","16 мкр","27 мкр","29 мкр","Самал","Центр","Береке"].map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
        </div>
      </StepWrapper>
    ),
    2: (
      <StepWrapper title="Кого вы ищете?" subtitle="Типичные позиции и требования">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-bold text-slate-900 mb-3">Позиции</p>
            <div className="flex flex-wrap gap-2">{["Бариста","Официант","Продавец","Кассир","Курьер","Помощник","Администратор","Разнорабочий","Повар","Водитель","Уборщик","Автомойщик","Охранник"].map(r => <button key={r} onClick={() => setHiringRoles(toggle(hiringRoles, r))} className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${hiringRoles.includes(r) ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-100 text-slate-600"}`}>{r}</button>)}</div>
          </div>
        </div>
      </StepWrapper>
    ),
    3: (
      <StepWrapper title="Требования к кандидатам" subtitle="Что важно для вас в сотрудниках?">
        <div className="flex flex-wrap gap-2">
          {["Пунктуальность","Опыт работы","Обучаемость","Коммуникабельность","Ответственность","Стрессоустойчивость","Без вредных привычек","Знание кассового аппарата","Клиентоориентированность"].map(r => <button key={r} onClick={() => setCandidateReqs(toggle(candidateReqs, r))} className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${candidateReqs.includes(r) ? "border-violet-600 bg-violet-50 text-violet-700" : "border-slate-100 text-slate-600"}`}>{r}</button>)}
        </div>
      </StepWrapper>
    ),
    4: (
      <StepWrapper title="Языки для вакансий" subtitle="Какие языки нужны кандидатам?">
        <div className="flex flex-wrap gap-3">
          {["Казахский","Русский","English"].map(l => <button key={l} onClick={() => setReqLanguages(toggle(reqLanguages, l))} className={`px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${reqLanguages.includes(l) ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"}`}><Globe className="w-4 h-4 inline mr-2" />{l}</button>)}
        </div>
      </StepWrapper>
    ),
    5: (
      <StepWrapper title="Собеседования" subtitle="Как вы предпочитаете проводить интервью?">
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { id: "telegram_call", label: "Telegram звонок", icon: "📞" },
              { id: "google_meet", label: "Google Meet", icon: "🟢" },
              { id: "phone", label: "Телефон", icon: "☎️" },
              { id: "in_person", label: "Лично", icon: "🤝" },
              { id: "whatsapp_call", label: "WhatsApp", icon: "📱" },
              { id: "zoom", label: "Zoom", icon: "📹" },
            ].map(p => <button key={p.id} onClick={() => setInterviewPlatforms(toggle(interviewPlatforms, p.id))} className={`p-4 rounded-2xl border-2 text-left transition-all ${interviewPlatforms.includes(p.id) ? "border-indigo-600 bg-indigo-50" : "border-slate-100"}`}><span className="text-xl mr-2">{p.icon}</span><span className="font-bold text-slate-900">{p.label}</span></button>)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 mb-3">Длительность интервью</p>
            <div className="flex gap-2">{[10,15,30,45].map(d => <button key={d} onClick={() => setInterviewDuration(d)} className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${interviewDuration === d ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>{d} мин</button>)}</div>
          </div>
        </div>
      </StepWrapper>
    ),
    6: (
      <StepWrapper title="Подключите Telegram бота" subtitle="Публикуйте вакансии прямо из мессенджера">
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span> Откройте бота</h3>
            <p className="text-sm text-slate-600 mb-4 font-medium">Перейдите к @RaycastKZ_Bot и нажмите Start.</p>
            <a href="#" className="inline-flex h-10 px-4 items-center justify-center rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm">Открыть в Telegram</a>
          </div>
          <div className="bg-slate-900 text-emerald-400 rounded-2xl p-5 font-mono text-sm leading-relaxed shadow-lg">
            <span className="text-white">/job</span> Бариста в кофейню, 12 мкр<br/>Зарплата: 150 000 ₸<br/>График: 2/2<br/>Писать: @username
          </div>
        </div>
      </StepWrapper>
    ),
    7: (
      <StepWrapper title="Ваш профиль работодателя" subtitle="Готово! Вот как вас увидят кандидаты">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-slate-100 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center"><Building2 className="w-7 h-7 text-emerald-600" /></div>
              <div><h3 className="text-xl font-extrabold text-slate-900">{businessName || "Ваш бизнес"}</h3><p className="text-sm font-medium text-slate-500">{businessCategory} · {empDistrict}</p></div>
            </div>
            <div className="flex gap-2 flex-wrap">{hiringRoles.map(r => <span key={r} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">{r}</span>)}</div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-5 text-center text-white">
            <p className="text-sm font-bold text-slate-400 mb-1">Trust Score</p>
            <p className="text-4xl font-black">80</p>
            <p className="text-sm font-bold text-emerald-400">Доверенный</p>
          </div>
        </div>
      </StepWrapper>
    ),
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
      {/* Top Bar */}
      <div className="h-16 bg-white border-b border-slate-100 flex items-center px-4 sm:px-8 justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm">R</div>
          <span className="font-bold text-slate-900 hidden sm:block">Raycast Setup</span>
        </div>
        {/* Progress Bar */}
        <div className="flex-1 max-w-xs mx-6"><div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div></div>
        <div className="text-sm font-semibold text-slate-400">Шаг {step} из {totalSteps}</div>
      </div>

      <div className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-8 pt-8 sm:pt-12">
        <AnimatePresence mode="wait">
          {role === "candidate" ? candidateSteps[step] : employerSteps[step]}
        </AnimatePresence>
      </div>
    </div>
  );
}
