'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, BookOpen, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MenuUtama({ onNavigate }: { onNavigate: (view: 'antrean' | 'bukutamu') => void }) {
  const [mounted, setMounted] = useState(false);
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedQueueId = localStorage.getItem('bps_active_queue_id');
    if (savedQueueId) {
      setActiveQueueId(savedQueueId);
    }
  }, []);

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center relative overflow-x-hidden font-sans sm:justify-center">
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

      <div className={`w-full max-w-sm px-6 pt-12 pb-24 relative z-10 text-left transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Welcome!</h1>
        <p className="text-orange-50 text-sm font-medium leading-relaxed drop-shadow-md">
          Portal Pelayanan Statistik Terpadu (PST) BPS Kota Probolinggo.
        </p>
      </div>

      <div className={`w-full max-w-sm bg-[#fdfdfd] sm:rounded-[2rem] rounded-t-[2rem] px-6 pt-14 pb-8 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.4)] relative z-20 flex-1 sm:flex-none sm:mb-8 -mt-16 transition-all duration-700 delay-150 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
        
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full p-1.5 shadow-[0_8px_20px_rgba(249,115,22,0.15)] border border-orange-50">
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/logoBPS.jpg" alt="Logo" className="h-10 w-auto object-contain" />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-3 text-left">
            PILIH MENU LAYANAN
          </label>
          <div className="flex flex-col gap-3">
            
            {activeQueueId ? (
              <button 
                onClick={() => router.push(`/status/${activeQueueId}`)} 
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-orange-500 text-white"><ClipboardList size={18} /></div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-slate-900">Antrian Saya</p>
                    <p className="text-[10px] text-orange-600 font-semibold">Kembali ke status antrian aktif</p>
                  </div>
                </div>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button onClick={() => onNavigate('antrean')} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 bg-white text-slate-600 hover:border-orange-500 hover:bg-orange-50/50 transition-all shadow-sm">
                <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600"><ClipboardList size={18} /></div>
                <div className="text-left"><p className="font-bold text-sm text-slate-800">Ambil Antrean</p><p className="text-[10px] text-slate-500">Dapatkan nomor antrean.</p></div>
              </button>
            )}

            <button onClick={() => onNavigate('bukutamu')} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 bg-white text-slate-600 hover:border-orange-500 hover:bg-orange-50/50 transition-all shadow-sm">
              <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600"><BookOpen size={18} /></div>
              <div className="text-left"><p className="font-bold text-sm text-slate-800">Isi Buku Tamu</p><p className="text-[10px] text-slate-500">Catat kunjungan resmi Anda.</p></div>
            </button>
            
          </div>
        </div>
      </div>
    </main>
  );
}