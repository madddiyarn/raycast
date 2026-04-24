import { Navbar } from "@/components/layout/Navbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fc]">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-100 bg-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-xs">R</div>
            <span className="font-semibold text-slate-600">Raycast</span>
            <span>·</span>
            <span>Mangystau, Kazakhstan</span>
          </div>
          <p>© 2024 Raycast. AI-First Employment Platform.</p>
        </div>
      </footer>
    </div>
  );
}
