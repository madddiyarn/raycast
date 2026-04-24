import DemoFlowClient from "./DemoFlowClient";

export const metadata = {
  title: 'End-to-End Flow Demo - Jumys Relay',
  description: 'Visual demonstration of the Jumys Relay platform flow.',
};

export default function DemoFlowPage() {
  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden text-white flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 shadow-indigo-500/20 drop-shadow-lg">
            AI Employment Operating System
          </h1>
          <p className="text-indigo-200/80 font-medium max-w-2xl mx-auto">
            От хаоса в Telegram чатах до структурированной аналитики и идеального мэтча за секунды.
          </p>
        </div>
        
        <div className="flex-1 min-h-[600px] w-full max-w-7xl mx-auto border border-white/10 rounded-3xl bg-slate-900/50 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
          <DemoFlowClient />
        </div>
      </div>
    </div>
  );
}
