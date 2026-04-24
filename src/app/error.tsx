"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Next.js Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-900 mb-3">Произошла ошибка</h1>
      <p className="text-slate-600 max-w-md mb-8 leading-relaxed">
        Похоже, возникла временная проблема с загрузкой страницы. Мы уже знаем об этом и исправляем.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => reset()} 
          className="bg-slate-900 hover:bg-indigo-600 text-white px-8 h-12 rounded-xl text-lg font-bold transition-all flex items-center gap-2"
        >
          <RefreshCcw className="w-5 h-5" /> Попробовать снова
        </Button>
        <Link href="/">
          <Button variant="outline" className="px-8 h-12 rounded-xl text-lg font-bold border-slate-200 transition-all flex items-center gap-2">
            <Home className="w-5 h-5" /> На главную
          </Button>
        </Link>
      </div>

      <div className="mt-12 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-xl">
        <p className="text-xs text-slate-400 font-mono break-all font-medium">
          Error Detail: {error.message || "Unknown error"}
          {error.digest && <span className="block mt-1">ID: {error.digest}</span>}
        </p>
      </div>
    </div>
  );
}
