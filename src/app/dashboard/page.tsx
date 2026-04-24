import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, CheckCircle, DatabaseZap, LayoutDashboard } from "lucide-react";

export default async function Dashboard() {
  const jobsCount = await prisma.job.count();
  const employerCount = await prisma.user.count({ where: { role: "employer" } });
  const candidateCount = await prisma.user.count({ where: { role: "candidate" } });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Live Dashboard</h1>
        <p className="text-slate-500 mt-2">Статистика платформы Raycast</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-sm transition-shadow rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">
              Вакансий сегодня
            </CardTitle>
            <DatabaseZap className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{jobsCount}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Ожидание данных...</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">
              Активные работодатели
            </CardTitle>
            <Briefcase className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{employerCount}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Ожидание активности</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">
              Кандидаты в сети
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{candidateCount}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Обозначено в БД</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">
              Средний Match
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">—</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Недостаточно данных</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Системные логи</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <DatabaseZap className="h-10 w-10 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900">Пока нет интеграций</p>
              <p className="text-sm mt-1 max-w-sm text-center">Ожидается поступление первых webhook-событий из Telegram для запуска AI пайплайна.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Теплокарта активности</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-10 text-slate-500">
              <LayoutDashboard className="h-10 w-10 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900">Нет статистики</p>
              <p className="text-sm mt-1 text-center">Графики появятся после первой собранной вакансии.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
