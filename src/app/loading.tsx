import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 rounded-full animate-pulse" />
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin absolute inset-0" />
      </div>
      <p className="mt-6 text-lg font-bold text-slate-900">Загрузка данных...</p>
      <p className="text-sm text-slate-500 mt-2">Пожалуйста, подождите, мы готовим страницу</p>
    </div>
  );
}
