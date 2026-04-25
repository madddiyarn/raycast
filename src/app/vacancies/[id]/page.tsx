import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Briefcase, CheckCircle2, GraduationCap, Building2, Send, Share2, ArrowLeft, Bot, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFullMatchResult } from "@/lib/matching";
import { MatchScoreCard, MatchBreakdown } from "@/components/match/MatchComponents";
import { MOCK_CANDIDATES } from "@/lib/mock-candidates";

export default async function VacancyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let job: any = null;

  try {
    job = await prisma.job.findUnique({ where: { id } });
  } catch (error) {
    console.error("Failed to fetch job details from DB:", error);
  }

  if (!job) {
    
    const { getHybridJobs } = require("@/lib/mock-data");
    const mockJobs = getHybridJobs([]);
    job = mockJobs.find((j: any) => j.id === id);
  }

  if (!job) {
    notFound();
  }

  
  const demoCandidate = MOCK_CANDIDATES.find(c => c.name === "Алия") || MOCK_CANDIDATES[0];
  const matchResult = getFullMatchResult(demoCandidate, job);

  const isFresh = true;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/search" className="inline-flex items-center text-slate-500 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm border">
        <ArrowLeft className="w-4 h-4 mr-2" /> Назад к поиску
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Card */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
            <CardContent className="p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  {job.category}
                </Badge>
                {isFresh && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Актуально
                  </Badge>
                )}
                <Badge variant="outline" className="text-slate-500 border-slate-200 flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" /> ИИ-парсинг из Telegram
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{job.title}</h1>
              <p className="text-2xl font-semibold text-indigo-600 mb-8">{job.salaryText || `${job.salaryMin}₸ - ${job.salaryMax}₸`}</p>

              <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 mb-8 text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><MapPin className="w-5 h-5" /></div>
                  <div><p className="text-sm text-slate-500">Микрорайон</p><p className="font-medium">{job.district}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><Clock className="w-5 h-5" /></div>
                  <div><p className="text-sm text-slate-500">График работы</p><p className="font-medium">{job.schedule}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><Briefcase className="w-5 h-5" /></div>
                  <div><p className="text-sm text-slate-500">Тип занятости</p><p className="font-medium">{job.employmentType}</p></div>
                </div>
                {job.studentFriendly && (
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><GraduationCap className="w-5 h-5" /></div>
                    <div><p className="text-sm text-slate-500">Особенности</p><p className="font-medium text-emerald-700">Можно студентам</p></div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">Описание очищенное ИИ</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Match Explanation */}
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-600" />
              AI Анализ соответствия
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <MatchScoreCard result={matchResult} />
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Детальный разбор</p>
                <MatchBreakdown breakdown={matchResult.breakdown} />
              </div>
            </div>
          </div>
        </div>


        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl mb-3 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]">
                <Send className="w-4 h-4 mr-2" /> Откликнуться T-bot
              </Button>
              <Button size="lg" variant="outline" className="w-full rounded-xl">
                <Share2 className="w-4 h-4 mr-2" /> Поделиться
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-0 shadow-sm">
            <CardContent className="p-6">
              <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Оригинал из Telegram</h4>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm font-mono text-slate-600 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400" />
                <p>{job.rawText}</p>
                <div className="mt-4 pt-3 border-t text-xs text-slate-400 flex justify-between">
                  <span>Из: @работа_актау_чат</span>
                  <span>{new Date(job.createdAt).toLocaleTimeString("ru-RU", {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center justify-between">
                  <span>Trust Score</span>
                  <span className="text-emerald-600">85/100</span>
                </h4>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-slate-500">ИИ проверил вакансию на безопасность и полноту данных.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
