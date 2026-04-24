"use client";

import { mockCandidates } from "@/lib/mock-data";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CandidateProfilePage() {
  const candidate = mockCandidates[0];

  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-center space-y-4">
        <Users className="w-16 h-16 mx-auto text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Профиль не заполнен</h2>
        <p className="text-slate-500 max-w-sm mx-auto">
          Войдите в систему и заполните навыки и локацию, чтобы бот начал присылать подходящие вакансии.
        </p>
        <Button className="mt-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full">
          Авторизоваться через Telegram
        </Button>
      </div>
    );
  }

  return null; // unreachable due to zero mock-data policy
}
