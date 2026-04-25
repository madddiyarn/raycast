'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    
    console.error('GLOBAL ERROR:', error);
  }, [error]);

  return (
    <html>
      <body className="bg-[#f8f9fc] flex items-center justify-center min-h-screen p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertCircle size={32} />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 mb-2">Критическая ошибка</h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Произошло серьезное нарушение в работе приложения. Мы уже уведомлены и работаем над исправлением.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => reset()}
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold gap-2 transition-all"
            >
              <RefreshCw size={18} /> Попробовать снова
            </Button>
            
            <Link href="/" className="block">
              <Button 
                variant="outline"
                className="w-full h-12 rounded-xl border-slate-200 text-slate-600 font-bold gap-2 hover:bg-slate-50"
              >
                <Home size={18} /> Вернуться на главную
              </Button>
            </Link>
          </div>
          
          {error.digest && (
            <p className="mt-8 text-[10px] font-mono text-slate-400">
              ID ошибки: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
