"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/lib/auth";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // In our mock auth, we accept any credentials for demo
      // but let's make it look professional
      const res = await loginUser({ email, password });
      
      if (res.user) {
        // Successful login
        if (res.user.onboardingCompleted) {
          router.push(res.user.role === "employer" ? "/employer" : "/search");
        } else {
          router.push("/onboarding");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Ошибка входа. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-2xl mx-auto mb-4">
          R
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">С возвращением</h1>
        <p className="text-sm text-slate-500 mt-1">Войдите в аккаунт Raycast</p>
      </div>

      {verified && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">
          Email успешно подтвержден. Теперь вы можете войти.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email / Телефон</label>
          <Input 
            type="text" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required 
            className="h-11 rounded-xl bg-slate-50 border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700">Пароль</label>
          </div>
          <Input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            placeholder="••••••••"
            className="h-11 rounded-xl bg-slate-50 border-slate-200"
          />
          <p className="text-[10px] text-slate-400">Для демо-версии можно использовать любой пароль</p>
        </div>
        <Button 
          type="submit" 
          className="w-full h-11 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold transition-all" 
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Войти"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 font-medium">
        Нет аккаунта?{" "}
        <Link href="/auth/register" className="font-bold text-indigo-600 hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      <div className="absolute top-1/4 max-w-lg w-full h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-sm relative z-10">
        <Suspense fallback={<div className="py-12 text-center text-slate-500">Загрузка...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
