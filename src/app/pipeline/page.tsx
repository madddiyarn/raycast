import { AnimatedPipeline } from "@/components/pipeline/AnimatedPipeline";

export default function PipelineDemoPage() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="bg-white rounded-3xl p-8 border shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Интеллектуальная обработка вакансий</h1>
          <p className="text-lg text-slate-500 mt-2 max-w-2xl mx-auto">
            Смотрите, как хаотичные сообщения из Telegram-групп автоматически превращаются в структурированные объявления. Нажмите «Запустить демо-пайплайн».
          </p>
        </div>
        <AnimatedPipeline autoRun={true} />
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-indigo-900 mb-4">1. Сквозная фильтрация мата и скама</h3>
          <p className="text-indigo-800 mb-4">
            AI автоматически отбрасывает спам, сетевой маркетинг и подозрительные вакансии с завышенной ЗП до того, как они попадут на сайт.
          </p>
          <div className="bg-white p-4 rounded-xl shadow-sm text-sm border-l-4 border-red-500 flex gap-3 opacity-70">
            <span>❌</span>
            <p>"СРОЧНО ИЩЕМ МОТИВИРОВАННЫХ! доход 1000$ в день, писать в лс"</p>
          </div>
          <p className="text-xs text-indigo-500 mt-2 font-medium uppercase font-mono tracking-widest pl-9">REJECTED BY SAFETY GUARD</p>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-emerald-900 mb-4">2. Zero-form: Боту нужен только текст</h3>
          <p className="text-emerald-800 mb-4">
            Работодатель пишет в привычной форме. Бот через <code>/job</code> захватывает сообщение и сам разбирает его на нужные поля (график, зп, район).
          </p>
          <div className="bg-white p-4 rounded-xl shadow-sm text-sm border-l-4 border-emerald-500 flex gap-3">
            <span>✅</span>
            <p>"/job Бариста срочно, 15 мкр, 180к на руки, 2/2, @contact"</p>
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium uppercase font-mono tracking-widest pl-9 line-clamp-1">
            parsed: {"{"} "title": "Бариста", "district": "15 мкр" {"}"}
          </p>
        </div>
      </div>
    </div>
  );
}
