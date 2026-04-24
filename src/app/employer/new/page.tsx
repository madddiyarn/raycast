"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, CheckCircle, MapPin, Globe } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ALL_AKTAU_DISTRICTS, DISTRICT_COORDS } from "@/components/map/districts";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), { ssr: false, loading: () => <div className="h-60 bg-slate-100 rounded-2xl animate-pulse" /> });

const CATEGORIES = ["HoReCa","Retail","Service","IT","Beauty","Доставка","Строительство","Медицина","Образование","Охрана","Events","Другое"];
const SCHEDULES = ["5/2","2/2","6/1","Гибкий","Посменный","Удаленно","Вечерние","Выходные"];

export default function NewVacancyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", description: "", category: "Другое", district: "12 мкр",
    salaryMin: "", salaryMax: "", salaryText: "", schedule: "5/2",
    employmentType: "Полная занятость", contact: "",
    studentFriendly: false, experienceRequired: false,
    address: "", lat: 0, lng: 0,
    trialShiftAvailable: false, trialShiftPaid: false, trialShiftDuration: "",
    requiredLanguages: [] as string[],
  });

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));
  const toggleLang = (lang: string) => set("requiredLanguages", form.requiredLanguages.includes(lang) ? form.requiredLanguages.filter(l => l !== lang) : [...form.requiredLanguages, lang]);

  const handleMapClick = (lat: number, lng: number) => {
    set("lat", lat);
    set("lng", lng);
  };

  const handleDistrictChange = (district: string) => {
    set("district", district);
    const coords = DISTRICT_COORDS[district];
    if (coords) { set("lat", coords[0]); set("lng", coords[1]); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Ошибка"); }
      setDone(true);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-emerald-500" /></div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Вакансия опубликована!</h1>
        <p className="text-slate-500 mb-8">Она уже доступна соискателям на сайте.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push("/employer")} variant="outline" className="rounded-xl font-semibold">Вернуться в кабинет</Button>
          <Button onClick={() => { setDone(false); setForm({ ...form, title: "", description: "" }); }} className="rounded-xl bg-slate-900 text-white font-semibold">Добавить ещё</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/employer" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Кабинет работодателя</Link>
        <h1 className="text-2xl font-bold text-slate-900">Новая вакансия</h1>
        <p className="text-slate-500 text-sm mt-1">Заполните форму — вакансия сразу появится на сайте и карте</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Должность *</label>
          <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Бариста, Кассир, SMM-менеджер" required className="h-11 rounded-xl" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Описание *</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Обязанности, требования, условия работы..." required rows={4} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>

        {/* Category + District */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Сфера</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm focus:ring-2 focus:ring-indigo-500 bg-white">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Микрорайон *</label>
            <select value={form.district} onChange={e => handleDistrictChange(e.target.value)} className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm focus:ring-2 focus:ring-indigo-500 bg-white">{ALL_AKTAU_DISTRICTS.map(d => <option key={d}>{d}</option>)}</select>
          </div>
        </div>

        {/* Address + Map */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-600" /> Адрес и местоположение</label>
          <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="ул. Примерная 12, здание напротив..." className="h-11 rounded-xl mb-3" />
          <div className="h-60 rounded-2xl overflow-hidden border border-slate-200">
            <MapPicker lat={form.lat || DISTRICT_COORDS[form.district]?.[0] || 43.645} lng={form.lng || DISTRICT_COORDS[form.district]?.[1] || 51.145} onSelect={handleMapClick} />
          </div>
          {form.lat > 0 && <p className="text-xs text-slate-400 mt-2 font-medium">📍 {form.lat.toFixed(4)}, {form.lng.toFixed(4)}</p>}
        </div>

        {/* Salary */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Зарплата</label>
          <div className="grid grid-cols-3 gap-3">
            <Input value={form.salaryMin} onChange={e => set("salaryMin", e.target.value)} placeholder="От (₸)" type="number" className="h-11 rounded-xl" />
            <Input value={form.salaryMax} onChange={e => set("salaryMax", e.target.value)} placeholder="До (₸)" type="number" className="h-11 rounded-xl" />
            <Input value={form.salaryText} onChange={e => set("salaryText", e.target.value)} placeholder='Или: "300к+"' className="h-11 rounded-xl" />
          </div>
        </div>

        {/* Schedule + Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">График</label>
            <select value={form.schedule} onChange={e => set("schedule", e.target.value)} className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm focus:ring-2 focus:ring-indigo-500 bg-white">{SCHEDULES.map(s => <option key={s}>{s}</option>)}</select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Тип занятости</label>
            <select value={form.employmentType} onChange={e => set("employmentType", e.target.value)} className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm focus:ring-2 focus:ring-indigo-500 bg-white">{["Полная занятость","Частичная занятость","Подработка","Проектная"].map(t => <option key={t}>{t}</option>)}</select>
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-600" /> Требуемые языки</label>
          <div className="flex gap-2 flex-wrap">
            {["Казахский","Русский","English"].map(l => (
              <button key={l} type="button" onClick={() => toggleLang(l)} className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${form.requiredLanguages.includes(l) ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Контакт (Telegram)</label>
          <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span><Input value={form.contact} onChange={e => set("contact", e.target.value.replace("@",""))} placeholder="username" className="h-11 rounded-xl pl-7" /></div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-200 transition-colors">
            <input type="checkbox" checked={form.studentFriendly} onChange={e => set("studentFriendly", e.target.checked)} className="w-5 h-5 rounded text-indigo-600" />
            <div><p className="text-sm font-bold text-slate-700">Подходит студентам</p><p className="text-[10px] text-slate-400">Гибкий график</p></div>
          </label>
          <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-200 transition-colors">
            <input type="checkbox" checked={!form.experienceRequired} onChange={e => set("experienceRequired", !e.target.checked)} className="w-5 h-5 rounded text-indigo-600" />
            <div><p className="text-sm font-bold text-slate-700">Без опыта</p><p className="text-[10px] text-slate-400">Первая работа ОК</p></div>
          </label>
        </div>

        {/* Trial shift */}
        <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.trialShiftAvailable} onChange={e => set("trialShiftAvailable", e.target.checked)} className="w-5 h-5 rounded text-indigo-600" />
            <span className="text-sm font-bold text-slate-700">Пробная смена</span>
          </label>
          {form.trialShiftAvailable && (
            <div className="flex gap-3 items-center pl-8">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.trialShiftPaid} onChange={e => set("trialShiftPaid", e.target.checked)} className="w-4 h-4 rounded text-emerald-600" /><span className="text-xs font-bold text-slate-600">Оплачиваемая</span></label>
              <Input value={form.trialShiftDuration} onChange={e => set("trialShiftDuration", e.target.value)} placeholder="Длительность (напр: 4 часа)" className="h-9 rounded-lg text-xs w-44" />
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-base">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Опубликовать вакансию"}
        </Button>
      </form>
    </div>
  );
}
