"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Bot, FileText, CheckCircle2, ShieldCheck, Database, Globe, Bell, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: "msg", icon: MessageSquare, label: "Сообщение в Telegram", color: "bg-blue-500", desc: "Распознание команды /job" },
  { id: "ai", icon: Bot, label: "AI Парсинг", color: "bg-indigo-500", desc: "Извлечение должностей, з/п" },
  { id: "check", icon: FileSearch, label: "Проверка полей", color: "bg-amber-500", desc: "Дозапрос недостающих данных" },
  { id: "safe", icon: ShieldCheck, label: "Скоринг", color: "bg-emerald-500", desc: "Оценка безопасности вакансии" },
  { id: "db", icon: Database, label: "База данных", color: "bg-slate-700", desc: "Сохранение структуры" },
  { id: "web", icon: Globe, label: "Сайт", color: "bg-cyan-500", desc: "Публикация" },
  { id: "match", icon: CheckCircle2, label: "Мэтчинг", color: "bg-violet-500", desc: "Поиск подходящих кандидатов" },
  { id: "notify", icon: Bell, label: "Уведомление", color: "bg-pink-500", desc: "Отправка кандидату в ТГ" },
];

export function AnimatedPipeline({ autoRun = false }: { autoRun?: boolean }) {
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (autoRun) {
      runPipeline();
    }
  }, [autoRun]);

  const runPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveStep(0);
    
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current >= STEPS.length) {
        clearInterval(interval);
        setTimeout(() => setIsRunning(false), 1000);
      }
      setActiveStep(current);
    }, 1200);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">Интеллектуальная обработка</h3>
          <p className="text-slate-500 mt-1">Один текст — алгоритм делает всё остальное.</p>
        </div>
        <Button 
          onClick={runPipeline} 
          disabled={isRunning}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
        >
          {isRunning ? "Идет процесс..." : "Запустить демо-пайплайн"}
        </Button>
      </div>

      <div className="relative mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        <AnimatePresence>
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            const isPast = activeStep > idx;
            const isPending = activeStep === -1 || activeStep < idx;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative flex flex-col pt-6"
              >
                {}
                {idx > 0 && idx % 4 !== 0 && (
                  <div className="hidden md:block absolute top-[28px] left-[calc(-50%+1rem)] w-[calc(100%-2rem)] h-1 rounded-full bg-slate-100 z-0 overflow-hidden">
                    {(isPast || isActive) && (
                      <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </div>
                )}

                <div 
                  className={
                    "relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-all duration-300 " +
                    (isActive ? step.color + " scale-110 shadow-" + step.color + "/40 text-white " : "") +
                    (isPast ? step.color + " opacity-80 text-white " : "") +
                    (isPending ? "bg-white border-2 border-slate-100 text-slate-400 " : "")
                  }
                >
                  <Icon className={(isActive || isPast ? "h-6 w-6" : "h-5 w-5")} />
                  
                  {isActive && (
                    <motion.div 
                      className="absolute inset-0 rounded-2xl border-2 border-indigo-400"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
                
                <div className="text-center mt-4">
                  <h4 className={`font-semibold text-sm ${isActive ? "text-indigo-700" : isPast ? "text-slate-800" : "text-slate-500"}`}>
                    {step.label}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[140px] mx-auto leading-tight">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {}
      <div className="mt-16 bg-white border rounded-2xl p-6 shadow-sm min-h-[140px] flex items-center justify-center text-center relative overflow-hidden">
        {activeStep === -1 && <p className="text-slate-400 font-medium">Нажмите на кнопку запуска, чтобы увидеть как происходит магия</p>}
        {activeStep === 0 && <p className="text-lg font-mono text-slate-700">/job нужен бариста срочно 180к 2/2 студентам можно @cvaktau</p>}
        {activeStep === 1 && <p className="text-lg font-medium text-indigo-600">Распознана профессия (Бариста), ЗП (180 000₸), График (2/2)...</p>}
        {activeStep === 2 && <p className="text-lg font-medium text-amber-600">Отсутствует район. Отправка уточняющего вопроса работодетелю...</p>}
        {activeStep === 3 && <p className="text-lg font-medium text-emerald-600">Безопасность подтверждена. Контакт указан, ЗП в рынке.</p>}
        {activeStep === 4 && <p className="text-lg font-medium text-slate-600">JSON сгенерирован. Запись в {`{jobs_table}`}</p>}
        {activeStep === 5 && <p className="text-lg font-medium text-cyan-600">Опубликовано на сайте в категории HoReCa</p>}
        {activeStep === 6 && <p className="text-lg font-medium text-violet-600">Найдено 4 релевантных кандидата по алгоритму близости и навыкам</p>}
        {activeStep >= 7 && <p className="text-lg font-medium text-pink-600 animate-pulse">Уведомление "Новая вакансия рядом с вами" отправлено Аружан!</p>}
      </div>
    </div>
  );
}
