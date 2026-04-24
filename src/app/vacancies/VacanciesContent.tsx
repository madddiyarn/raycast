"use client";

import { useState } from "react";
import { VacancyCard } from "@/components/cards/VacancyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X, Map, List } from "lucide-react";
import dynamic from "next/dynamic";
import { calculateMatchScore } from "@/lib/matching";
import { MOCK_CANDIDATES } from "@/lib/mock-candidates";

const JobsMap = dynamic(() => import("@/components/map/JobsMap"), { ssr: false });

const AKTAU_DISTRICTS = [
  "1 мкр","2 мкр","3 мкр","4 мкр","5 мкр","6 мкр","7 мкр","8 мкр","9 мкр","10 мкр",
  "11 мкр","12 мкр","13 мкр","14 мкр","15 мкр","16 мкр","17 мкр","18 мкр","19 мкр","20 мкр",
  "21 мкр","22 мкр","23 мкр","24 мкр","25 мкр","26 мкр","27 мкр","28 мкр","29 мкр","30 мкр",
  "31 мкр","32 мкр","33 мкр","34 мкр",
  "Самал","Болашак","Нурсат","Асем","Достык",
  "Центр","Мангышлак","Береке","Дача",
];

const CATEGORIES = ["HoReCa","Retail","Service","IT","Beauty","Доставка","Строительство","Медицина","Образование","Другое"];
const SCHEDULES = ["5/2","2/2","6/1","Гибкий","Удаленно"];
const EMPLOYMENT = ["Полная занятость","Частичная занятость","Подработка","Проектная"];

export default function VacanciesContent({ initialJobs }: { initialJobs: any[] }) {
  const [search, setSearch] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [schedule, setSchedule] = useState("");
  const [employment, setEmployment] = useState("");
  const [studentOnly, setStudentOnly] = useState(false);
  const [noExperience, setNoExperience] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Find demo user Aliya
  const demoUser = MOCK_CANDIDATES.find(c => c.name === "Алия") || MOCK_CANDIDATES[0];

  const toggleDistrict = (d: string) =>
    setSelectedDistricts((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  const toggleCategory = (c: string) =>
    setSelectedCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const clearAll = () => {
    setSearch(""); setSelectedDistricts([]); setSelectedCategories([]);
    setSchedule(""); setEmployment(""); setStudentOnly(false); setNoExperience(false);
  };

  const filtered = initialJobs.filter((job) => {
    if (search && !job.title.toLowerCase().includes(search.toLowerCase()) && !job.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedDistricts.length && !selectedDistricts.includes(job.district)) return false;
    if (selectedCategories.length && !selectedCategories.includes(job.category)) return false;
    if (schedule && job.schedule !== schedule) return false;
    if (employment && job.employmentType !== employment) return false;
    if (studentOnly && !job.studentFriendly) return false;
    if (noExperience && job.experienceRequired) return false;
    return true;
  });

  const activeFilters = selectedDistricts.length + selectedCategories.length + (schedule ? 1 : 0) + (employment ? 1 : 0) + (studentOnly ? 1 : 0) + (noExperience ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по должности..." className="h-11 pl-9 rounded-xl text-sm" />
        </div>
        <Button
          variant="outline"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`h-11 rounded-xl font-semibold gap-2 ${activeFilters > 0 ? "border-indigo-400 text-indigo-700 bg-indigo-50" : ""}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Фильтры {activeFilters > 0 && <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilters}</span>}
        </Button>
        <div className="flex border border-slate-200 rounded-xl overflow-hidden h-11">
          <button onClick={() => setViewMode("list")} className={`px-4 flex items-center gap-1.5 text-sm font-semibold transition-colors ${viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
            <List className="w-4 h-4" /> Список
          </button>
          <button onClick={() => setViewMode("map")} className={`px-4 flex items-center gap-1.5 text-sm font-semibold transition-colors ${viewMode === "map" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
            <Map className="w-4 h-4" /> Карта
          </button>
        </div>
        <p className="text-sm text-slate-500 font-medium ml-auto">
          Найдено: <span className="font-bold text-slate-900">{filtered.length}</span>
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        {sidebarOpen && (
          <aside className="w-72 shrink-0 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-6">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900">Фильтры</p>
                {activeFilters > 0 && (
                  <button onClick={clearAll} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <X className="w-3 h-3" /> Сбросить
                  </button>
                )}
              </div>

              {/* Districts */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Микрорайон</p>
                <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto pr-1">
                  {AKTAU_DISTRICTS.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleDistrict(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        selectedDistricts.includes(d)
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Сфера</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCategory(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        selectedCategories.includes(c)
                          ? "bg-violet-600 text-white border-violet-600"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">График</p>
                <div className="flex flex-wrap gap-1.5">
                  {SCHEDULES.map((s) => (
                    <button key={s} onClick={() => setSchedule(schedule === s ? "" : s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${schedule === s ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300"}`}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {/* Employment */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Тип занятости</p>
                <div className="space-y-2">
                  {EMPLOYMENT.map((t) => (
                    <label key={t} className="flex items-center gap-2.5 cursor-pointer">
                      <input type="radio" name="employment" checked={employment === t} onChange={() => setEmployment(employment === t ? "" : t)} className="w-4 h-4 accent-indigo-600" />
                      <span className="text-sm text-slate-700">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-700">Можно студентам</span>
                  <button
                    onClick={() => setStudentOnly(!studentOnly)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${studentOnly ? "bg-indigo-600" : "bg-slate-200"}`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${studentOnly ? "translate-x-5" : "translate-x-1"}`} />
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-700">Без опыта</span>
                  <button
                    onClick={() => setNoExperience(!noExperience)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${noExperience ? "bg-indigo-600" : "bg-slate-200"}`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${noExperience ? "translate-x-5" : "translate-x-1"}`} />
                  </button>
                </label>
              </div>
            </div>
          </aside>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {viewMode === "map" ? (
            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ height: "65vh" }}>
              <JobsMap jobs={filtered} />
            </div>
          ) : (
            <>
              {filtered.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-4">
                  {filtered.map((job) => (
                    <VacancyCard 
                      key={job.id} 
                      job={job} 
                      matchScore={calculateMatchScore(demoUser, job)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
                  <Search className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                  <p className="text-xl font-bold text-slate-800">Вакансий не найдено</p>
                  <p className="text-slate-500 text-sm mt-2">Попробуйте изменить фильтры</p>
                  <Button onClick={clearAll} variant="outline" className="mt-6 rounded-xl font-semibold">Сбросить фильтры</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
