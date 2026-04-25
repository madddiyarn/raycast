import { AnimatedPipeline } from "@/components/pipeline/AnimatedPipeline";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap, Filter, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { VacancyCard } from "@/components/cards/VacancyCard";

export default async function Home() {
  let latestJobs: any[] = [];
  try {
    latestJobs = await prisma.job.findMany({
      where: { status: "published" },
      take: 12,
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Failed to fetch latest jobs:", error);
    
  }

  return (
    <div className="flex flex-col gap-16 md:gap-24 mb-16">
      {/* Hero Section */}
      <section className="relative pt-12 text-center md:pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white" />
        

        <h1 className="max-w-4xl mx-auto text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl lg:text-7xl mb-6 leading-[1.1]">
          Вакансии из Telegram-чатов <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">— сразу в понятную базу</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
          Raycast превращает хаотичные сообщения малого бизнеса в структурированные вакансии, публикует их на сайте и доставляет подходящим кандидатам <b>рядом с их домом</b>.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/pipeline" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white px-10 h-14 text-lg font-bold shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95 group">
            Посмотреть демо <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/vacancies" className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-100 bg-white px-10 h-14 text-lg font-bold text-slate-900 shadow-lg shadow-slate-100 transition-all hover:border-indigo-200 hover:bg-slate-50 hover:-translate-y-1 active:scale-95">
            Открыть вакансии
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Никаких долгих форм</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Работодатель просто пишет сообщение с хештегом <code>/job</code> в привычную Telegram-группу. Никаких неудобных сайтов.</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">AI-очистка текста</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Хаотичный сленг превращается в таблицу: ИИ извлекает зарплату, график, контакт, и проверяет полноту данных.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Умный мэтчинг</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Кандидаты получают вакансии, которые подходят им по району (мкр), графику работы и требованиям к студентам.</p>
        </div>
      </section>

      {/* Pipeline Demo Preview */}
      <section className="bg-white border rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Как это работает под капотом?</h2>
          <p className="text-slate-500 mt-3 md:text-lg">Наш AI конвейер делает всю рутину за модераторов</p>
        </div>
        <AnimatedPipeline />
        
        <div className="flex justify-center mt-6">
          <Link href="/pipeline" className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <LayoutDashboard className="w-4 h-4 mr-2" /> Полноэкранный демо-режим
          </Link>
        </div>
      </section>

      {/* Live Previews */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Последние 128 вакансий</h2>
            <p className="text-slate-500 mt-2">Перехвачено из чатов и опубликовано сегодня</p>
          </div>
          <Link href="/vacancies" className="hidden sm:inline-flex items-center text-indigo-600 font-medium hover:underline">
            Смотреть все <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestJobs.length > 0 ? (
            latestJobs.map((job: any) => (
              <VacancyCard key={job.id} job={job} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <p className="text-xl font-medium text-slate-900">Данные отсутствуют</p>
              <p className="mt-2 max-w-sm mx-auto">Подключите источник данных и AI Engine обработает входящие сообщения.</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center sm:hidden">
          <Link href="/vacancies" className="inline-flex items-center justify-center w-full rounded-md bg-indigo-600 px-8 h-11 text-white font-medium hover:bg-indigo-700 transition-colors">
            Смотреть все вакансии
          </Link>
        </div>
      </section>
    </div>
  );
}
