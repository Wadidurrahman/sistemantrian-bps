'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MenuUtama from '@/components/tamu/MenuUtama';
import FormAntrean from '@/components/tamu/FormAntrean';
import BukuTamu from '@/components/tamu/BukuTamu';

type ViewState = 'menu' | 'antrean' | 'registrasi' | 'bukutamu';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>('menu');
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);

  useEffect(() => {
    const savedQueue = localStorage.getItem('bps_active_queue');
    if (savedQueue) {
      setActiveQueueId(savedQueue);
    }
  }, []);

  if (view === 'antrean') {
    return <FormAntrean onBack={() => setView('menu')} />;
  }

  if (view === 'bukutamu') {
    return <BukuTamu onBack={() => setView('menu')} />;
  }

  return (
    <>
      <MenuUtama onNavigate={(selectedView) => setView(selectedView as ViewState)} />
      
      {activeQueueId && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button 
            onClick={() => router.push(`/status/${activeQueueId}`)}
            className="bg-blue-900 text-white shadow-xl px-5 py-3 rounded-full font-bold text-xs tracking-widest uppercase flex items-center gap-2 hover:bg-blue-800 transition-transform active:scale-95 border-2 border-white"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            Lacak Status Saya
          </button>
        </div>
      )}
    </>
  );
}