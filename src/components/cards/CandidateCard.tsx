"use client";

import { Application } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Calendar, CheckCircle2, User, PhoneCall, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function CandidateCard({ application }: { application: any }) {
  const candidate = application.candidate || { name: "User" };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border border-indigo-100">
            <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold">
              {candidate.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-lg text-slate-900 border-b-2 border-transparent hover:border-indigo-600 cursor-pointer transition-colors inline-block">{candidate.name}</h3>
            <p className="text-sm text-slate-500 font-medium">Отклик от {new Date(application.createdAt).toLocaleDateString("ru-RU")}</p>
          </div>
        </div>
        <div className="flex flex-col items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
          <span className="text-xs font-semibold uppercase">Match</span>
          <span className="text-lg font-bold leading-none">{application.matchScore}%</span>
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{candidate.district}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{candidate.availability}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Навыки:</p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills?.map((skill: string) => (
              <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                {skill}
              </Badge>
            ))}
            {(!candidate.skills || candidate.skills.length === 0) && (
              <span className="text-sm text-slate-400">Не указано</span>
            )}
          </div>
        </div>

        {application.aiReason && application.aiReason.length > 0 && (
          <div className="bg-indigo-50/50 rounded-lg p-3 text-sm border border-indigo-100">
            <p className="text-indigo-800 mb-1 font-medium flex gap-1.5 items-center">
              <span className="text-indigo-600">✨</span> Анализ ИИ:
            </p>
            <ul className="list-disc pl-5 text-indigo-700/80 space-y-0.5 mt-1">
              {application.aiReason.map((reason: string, i: number) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 flex gap-2">
        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          Принять
        </Button>
        <Button variant="outline" className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50">
          <PhoneCall className="w-4 h-4 mr-1.5" />
          Связаться
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 ml-1">
          <XCircle className="w-5 h-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
