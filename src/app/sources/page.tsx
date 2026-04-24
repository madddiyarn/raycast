"use client";

import { mockSources } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ShieldCheck, Database, RefreshCw, PowerOff, ShieldAlert, Check } from "lucide-react";

export default function SourcesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Интеграция каналов</h1>
          <p className="text-slate-500 mt-1">Добавьте источники Telegram для сбора вакансий.</p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full">
          + Добавить бота
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {mockSources.length > 0 ? (
          mockSources.map(source => (
            <Card key={source.id} className={"relative overflow-hidden " + (source.status === 'inactive' ? 'opacity-70 saturate-50' : '')}>
              {source.status === "active" && (
                <div className="absolute top-0 right-0 p-4">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
              )}
              
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{source.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">ID чата:</span>
                  <code className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">{source.chatId}</code>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Захвачено вакансий:</span>
                  <span className="font-bold text-slate-900">{source.vacanciesCaptured}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Доверие ИИ:</span>
                  {source.trustLevel === "high" ? (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50"><ShieldCheck className="w-3 h-3 mr-1"/>Высокое</Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50"><ShieldAlert className="w-3 h-3 mr-1"/>Среднее</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t flex justify-between gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl" disabled={source.status === "inactive"}>
                  <RefreshCw className="w-3 h-3 mr-2" /> Синхр
                </Button>
                <Button variant="outline" size="sm" className="flex-1 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                  <PowerOff className="w-3 h-3 mr-2" /> {source.status === "active" ? "Откл" : "Вкл"}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-slate-50/50">
             <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
             <h3 className="text-2xl font-bold text-slate-800 mb-2">Источники не добавлены</h3>
             <p className="text-slate-500 max-w-sm mx-auto">Интегрируйте первого бота или добавьте группу Telegram для запуска Raycast AI pipeline.</p>
             <Button className="mt-6 bg-slate-900 text-white rounded-full">Перейти к интеграции</Button>
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white mt-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Никакой ручной модерации</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Установите Raycast Bot администратором в локальный чат с вакансиями. 
            Дальше работает система: сбор данных, отсев спама, нормализация текстов и умный мэтчинг.
          </p>
          <ul className="space-y-4 text-slate-200 font-medium">
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> Парсинг 24/7</li>
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> Семантический отсев дубликатов</li>
            <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> Извлечение зарплат, графиков и локаций</li>
          </ul>
        </div>
        <div className="shrink-0 hidden md:block">
          <div className="w-48 h-48 bg-slate-800 rounded-full border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent" />
            <Database className="w-12 h-12 text-slate-300 mb-2 relative z-10" />
            <span className="font-bold tracking-tight text-slate-300 relative z-10">AI Ingestion</span>
          </div>
        </div>
      </div>
    </div>
  );
}
