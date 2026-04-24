import prisma from "@/lib/prisma";
import VacanciesContent from "./VacanciesContent";
import { getHybridJobs } from "@/lib/mock-data";
import { Job } from "@/lib/types";

export default async function VacanciesPage() {
  const dbJobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" }
  });

  const jobs = getHybridJobs(dbJobs as any);

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Поиск вакансий</h1>
        <p className="text-slate-500 mt-2">Реальные данные поступают в систему через Telegram-вебхуки.</p>
      </div>
      <VacanciesContent initialJobs={jobs as unknown as any[]} />
    </div>
  );
}
