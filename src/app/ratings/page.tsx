"use client";

import { Shield, Star, Award, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function RatingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Система репутации</h1>
      <p className="text-slate-500 font-medium mb-10">Прозрачная оценка для кандидатов и работодателей</p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Work Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6"><Star className="w-7 h-7 text-indigo-600" /></div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Work Score</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">Оценка надёжности и готовности кандидата — не популярности.</p>

          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-bold text-slate-900">Как начисляется</h3>
            {[
              { label: "Заполненность профиля", points: "+20" },
              { label: "Добавление языков", points: "+10" },
              { label: "Указание доступности", points: "+10" },
              { label: "Резюме / AI-саммари", points: "+10" },
              { label: "Быстрый отклик", points: "+10" },
              { label: "Пройденное интервью", points: "+15" },
              { label: "Положительный отзыв", points: "+15" },
              { label: "Пропуск без уведомления", points: "−25", negative: true },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600">{item.label}</span>
                <span className={`font-extrabold ${(item as any).negative ? "text-red-500" : "text-emerald-600"}`}>{item.points}</span>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-slate-900 mb-3">Уровни</h3>
          <div className="space-y-2">
            {[
              { level: "Новичок", range: "0–39", color: "bg-slate-100 text-slate-600" },
              { level: "Готов к работе", range: "40–59", color: "bg-blue-50 text-blue-600" },
              { level: "Надёжный", range: "60–74", color: "bg-indigo-50 text-indigo-600" },
              { level: "Проверенный", range: "75–89", color: "bg-emerald-50 text-emerald-600" },
              { level: "Топ кандидат", range: "90–100", color: "bg-amber-50 text-amber-700" },
            ].map(l => (
              <div key={l.level} className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${l.color}`}>{l.range}</span>
                <span className="text-sm font-bold text-slate-700">{l.level}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6"><Shield className="w-7 h-7 text-emerald-600" /></div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Trust Score</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">Оценка надёжности работодателя — помогает кандидатам делать выбор.</p>

          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-bold text-slate-900">Как начисляется</h3>
            {[
              { label: "Подтверждённый контакт", points: "+15" },
              { label: "Полный профиль бизнеса", points: "+15" },
              { label: "Полнота вакансий", points: "+20" },
              { label: "Быстрый ответ", points: "+15" },
              { label: "Положительные отзывы", points: "+20" },
              { label: "Подтверждение актуальности", points: "+10" },
              { label: "Жалобы", points: "−30", negative: true },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600">{item.label}</span>
                <span className={`font-extrabold ${(item as any).negative ? "text-red-500" : "text-emerald-600"}`}>{item.points}</span>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-slate-900 mb-3">Уровни</h3>
          <div className="space-y-2">
            {[
              { level: "Новый источник", range: "0–34", color: "bg-slate-100 text-slate-600" },
              { level: "Базовый", range: "35–54", color: "bg-blue-50 text-blue-600" },
              { level: "Проверенный", range: "55–74", color: "bg-indigo-50 text-indigo-600" },
              { level: "Доверенный", range: "75–89", color: "bg-emerald-50 text-emerald-600" },
              { level: "Рекомендуемый", range: "90–100", color: "bg-amber-50 text-amber-700" },
            ].map(l => (
              <div key={l.level} className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${l.color}`}>{l.range}</span>
                <span className="text-sm font-bold text-slate-700">{l.level}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Key Principles */}
      <div className="mt-10 bg-slate-50 rounded-3xl p-8 border border-slate-100">
        <h3 className="text-xl font-extrabold text-slate-900 mb-6">Принципы системы</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-4"><TrendingUp className="w-6 h-6 text-indigo-600 shrink-0" /><div><p className="font-bold text-slate-900">Не рейтинг лайков</p><p className="text-sm text-slate-500 mt-1">Work Score и Trust Score — это структурированные сигналы репутации, а не звёзды.</p></div></div>
          <div className="flex gap-4"><Award className="w-6 h-6 text-emerald-600 shrink-0" /><div><p className="font-bold text-slate-900">Бейджи за действия</p><p className="text-sm text-slate-500 mt-1">Каждый бейдж отражает реальное достижение, а не субъективную оценку.</p></div></div>
          <div className="flex gap-4"><CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" /><div><p className="font-bold text-slate-900">Система подтверждения</p><p className="text-sm text-slate-500 mt-1">Подтверждение перед интервью защищает обе стороны от no-show.</p></div></div>
          <div className="flex gap-4"><AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" /><div><p className="font-bold text-slate-900">Прозрачность</p><p className="text-sm text-slate-500 mt-1">Каждый балл показывает, за что он начислен или снят.</p></div></div>
        </div>
      </div>
    </div>
  );
}
