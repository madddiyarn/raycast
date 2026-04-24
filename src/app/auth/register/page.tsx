"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser } from "@/lib/auth";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, User, Loader2, ArrowRight, CheckCircle2, ChevronLeft, Bot, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "form">("role");
  const [role, setRole] = useState<UserRole>("candidate");
  const [loading, setLoading] = useState(false);
  
  // Data
  const [fullName, setFullName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [phone, setPhone] = useState("");

  const handleRoleSelect = (selected: UserRole) => {
    setRole(selected);
    setTimeout(() => setStep("form"), 300);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser({ fullName, telegramUsername, phone, role });
      router.push("/onboarding");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Visual Pane (Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between relative overflow-hidden p-16">
        {/* Animated Background Blobs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-indigo-600/30 blur-[100px] rounded-full"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-600/20 blur-[120px] rounded-full"
        />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 text-white w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 font-black">
              R
            </div>
            <span className="font-extrabold text-2xl tracking-tight">Raycast</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Работай. Нанимай.<br />
            Всё через любимый мессенджер.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-12">
            Искусственный интеллект автоматически собирает вакансии из Telegram-чатов и помогает найти идеальных сотрудников или вашу лучшую работу в Мангистау.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Умный поиск</p>
                <p className="text-sm text-slate-400">Нейросеть мэтчит кандидатов</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Мгновенный результат</p>
                <p className="text-sm text-slate-400">Публикация вакансии за секунды</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-10 w-fit">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-sm">
              R
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Raycast</span>
          </div>

          <AnimatePresence mode="wait">
            {step === "role" && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Начнём с основы</h1>
                  <p className="text-slate-500 leading-relaxed">
                    Выберите, как вы будете использовать Jumys Relay. Это поможет настроить интерфейс для вас.
                  </p>
                </div>

                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect("candidate")}
                    className="w-full group flex items-start gap-5 p-6 rounded-3xl border-2 border-slate-100 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300 text-left cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 transition-colors">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">Ищу работу</p>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        Получайте подходящие вакансии рядом, откликайтесь в один клик и собирайте опыт.
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect("employer")}
                    className="w-full group flex items-start gap-5 p-6 rounded-3xl border-2 border-slate-100 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-300 text-left cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 transition-colors">
                      <Briefcase className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">Ищу сотрудников</p>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        Публикуйте вакансии через Telegram, получайте отклики и закрывайте смены быстрее.
                      </p>
                    </div>
                  </motion.button>
                </div>

                <p className="text-center mt-10 text-sm text-slate-500 font-medium">
                  Уже есть аккаунт?{" "}
                  <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline underline-offset-4">
                    Войти
                  </Link>
                </p>
              </motion.div>
            )}

            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <button onClick={() => setStep("role")} className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-900 mb-6 transition-colors w-fit">
                    <ChevronLeft className="w-4 h-4" /> Выбор роли
                  </button>
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Создать профиль</h1>
                  <p className="text-slate-500 font-medium flex items-center gap-2">
                    Роль: <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{role === "candidate" ? "Соискатель" : "Работодатель"}</span>
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Имя и Фамилия</label>
                    <Input 
                      value={fullName} onChange={(e) => setFullName(e.target.value)} 
                      placeholder="Иван Иванов" required 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/50 shadow-sm focus-visible:ring-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Номер телефона</label>
                    <Input 
                      type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} 
                      placeholder="+7 (700) 000-00-00" required 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/50 shadow-sm focus-visible:ring-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Telegram username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">@</span>
                      <Input 
                        value={telegramUsername} onChange={(e) => setTelegramUsername(e.target.value.replace("@", ""))} 
                        placeholder="username" required 
                        className="h-12 rounded-xl border-slate-200 bg-slate-50/50 shadow-sm pl-8 focus-visible:ring-indigo-500" 
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Обязательно для уведомлений об откликах или новых вакансиях</p>
                  </div>

                  <label className="flex items-start gap-3 mt-6 cursor-pointer group">
                    <input type="checkbox" required className="mt-1 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                    <span className="text-sm font-medium text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                      Я согласен на обработку данных и получение уведомлений о вакансиях в Telegram
                    </span>
                  </label>

                  <Button 
                    type="submit" disabled={loading} 
                    className="w-full h-12 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-base transition-all duration-300 shadow-lg shadow-slate-200/50 hover:shadow-indigo-200 mt-4 group"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Продолжить <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>}
                  </Button>
                </form>

                <p className="text-center mt-6 text-sm text-slate-400 font-medium">
                  Пароль сейчас не нужен. Мы будем авторизовать вас через Telegram.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
