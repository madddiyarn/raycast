"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { User as UserIcon, LogOut, Briefcase, Calendar, Star, Shield, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Read once on mount
    setUser(getCurrentUser());

    // Listen for cross-tab / same-tab storage changes so auth state stays synced
    const onStorage = () => setUser(getCurrentUser());
    window.addEventListener("storage", onStorage);

    // Custom event fired by loginUser / logoutUser / registerUser
    window.addEventListener("jumys_auth_change", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("jumys_auth_change", onStorage);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    router.push("/");
  };

  if (!isClient) return null;
  if (pathname === "/auth/register" || pathname === "/auth/login" || pathname === "/onboarding") return null;

  // Role-based navigation
  let links: { name: string; href: string }[] = [];

  if (!user) {
    links = [
      { name: "О платформе", href: "/" },
      { name: "Вакансии", href: "/vacancies" },
      { name: "Репутация", href: "/ratings" },
    ];
  } else if (user.role === "candidate") {
    links = [
      { name: "Умный поиск", href: "/search" },
      { name: "Вакансии", href: "/vacancies" },
      { name: "Собеседования", href: "/interviews" },
      { name: "Профиль", href: "/profile" },
    ];
  } else if (user.role === "employer" || user.role === "admin") {
    links = [
      { name: "Кабинет", href: "/employer" },
      { name: "Вакансии", href: "/vacancies" },
      { name: "Опубликовать", href: "/employer/new" },
      { name: "Собеседования", href: "/interviews" },
    ];
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-sm">R</div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">Raycast</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
             <Link 
               key={link.href + link.name} 
               href={link.href}
               className={`text-sm font-bold transition-all ${pathname === link.href ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}
             >
               {link.name}
             </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3 relative">
          {!user ? (
            <>
              <Link href="/auth/login" className="hidden sm:flex text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all">
                Войти
              </Link>
              <Link href="/auth/register" className="bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-slate-200 px-5 py-2.5 transition-all active:scale-95">
                Создать аккаунт
              </Link>
            </>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-indigo-100 outline-none"
               >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.role === "employer" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
                   {user.role === "employer" ? <Briefcase className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                 </div>
                 <span className="text-sm font-bold text-slate-700 max-w-[100px] truncate hidden sm:block">{user.fullName}</span>
               </button>

               <AnimatePresence>
                 {showDropdown && (
                   <>
                     {/* Backdrop for closure */}
                     <div 
                       className="fixed inset-0 z-40 bg-transparent" 
                       onClick={() => setShowDropdown(false)}
                     />
                     <motion.div 
                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
                       transition={{ duration: 0.15 }}
                       className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50"
                      >
                       <div className="px-4 py-3 border-b border-slate-100 mb-1">
                         <p className="text-sm font-extrabold text-slate-900">{user.fullName}</p>
                         <p className="text-xs text-slate-500 font-medium">{user.role === "candidate" ? "Соискатель" : user.role === "employer" ? "Работодатель" : "Администратор"}</p>
                       </div>
                       
                       {user.role === "candidate" ? (
                         <>
                           <Link href="/profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm font-bold text-slate-700"><UserIcon className="w-4 h-4 text-slate-400" /> Мой профиль</Link>
                           <Link href="/interviews" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm font-bold text-slate-700"><Calendar className="w-4 h-4 text-slate-400" /> Собеседования</Link>
                           <Link href="/ratings" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm font-bold text-slate-700"><Star className="w-4 h-4 text-slate-400" /> Work Score</Link>
                         </>
                       ) : (
                         <>
                           <Link href="/employer" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm font-bold text-slate-700"><Briefcase className="w-4 h-4 text-slate-400" /> Кабинет</Link>
                           <Link href="/interviews" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm font-bold text-slate-700"><Calendar className="w-4 h-4 text-slate-400" /> Собеседования</Link>
                           <Link href="/ratings" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm font-bold text-slate-700"><Shield className="w-4 h-4 text-slate-400" /> Trust Score</Link>
                         </>
                       )}
                       
                       <button onClick={() => { setShowDropdown(false); handleLogout(); }} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm font-bold text-red-600 mt-1 border-t border-slate-100 pt-2 transition-colors">
                         <LogOut className="w-4 h-4" /> Выйти
                       </button>
                     </motion.div>
                   </>
                 )}
               </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
