"use client";

import { type Job } from "@prisma/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Briefcase, GraduationCap, Building2, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";

export function VacancyCard({ job, matchScore }: { job: Job; matchScore?: number }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 relative overflow-hidden border border-slate-100 rounded-2xl bg-white">
      {/* Subtle accent top line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500" />

      <CardHeader className="pb-2 pt-5">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full px-2.5 py-0.5 border border-indigo-100">
                <Building2 className="w-3 h-3" />
                {job.category}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
              {job.title}
            </h3>
            <p className="text-lg font-extrabold text-indigo-600 mt-1 tracking-tight">
              {job.salaryText || (job.salaryMin > 0 ? `от ${job.salaryMin.toLocaleString()} ₸` : "По договорённости")}
            </p>
          </div>
          {matchScore && (
            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-violet-50 text-indigo-700 w-14 h-14 rounded-xl border border-indigo-100 shrink-0 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Match</span>
              <span className="text-xl font-black leading-none">{matchScore}%</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{job.district || "Актау"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{job.schedule || "Обсуждается"}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{job.employmentType || "Полная занятость"}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {job.studentFriendly && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs gap-1 rounded-full">
              <GraduationCap className="w-3 h-3" />
              Студентам
            </Badge>
          )}
          {!job.experienceRequired && (
            <Badge className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 text-xs rounded-full">
              Без опыта
            </Badge>
          )}
          <Badge variant="outline" className="text-slate-400 border-slate-200 text-xs gap-1 rounded-full">
            <MessageSquare className="w-3 h-3" />
            Telegram
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Link
          href={`/vacancies/${job.id}`}
          className="flex-1 inline-flex items-center justify-center h-10 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-sm font-semibold transition-all duration-200 gap-1.5"
        >
          Подробнее <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        {job.contact && (
          <a
            href={`https://t.me/${job.contact.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center h-10 rounded-xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-700 text-sm font-semibold transition-all duration-200"
          >
            Откликнуться
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
