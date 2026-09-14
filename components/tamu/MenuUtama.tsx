'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { FileText, BookOpen, Clock } from 'lucide-react';
import Image from 'next/image';

export default function MenuUtama({ onSelectForm, onSelectBukuTamu }: { onSelectForm: () => void, onSelectBukuTamu: () => void }) {
  const router = useRouter();
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkActiveQueue = async () => {
      const savedId = localStorage.getItem('bps_active_queue');
      if (savedId) {
        const { data } = await supabase
          .from('queues')
          .select('status')
          .eq('id', savedId)
          .single();

        if (data && data.status !== 'Selesai') {
          setActiveQueueId(savedId);
        } else {
          localStorage.removeItem('bps_active_queue');
          setActiveQueueId(null);
        }
      }
      setLoading(false);
    };
    
    checkActiveQueue();
  }, []);

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center relative overflow-x-hidden font-sans sm:justify-center">
      <div className="w-full max-w-md px-6 pt-10 pb-24 relative z-10 text-left">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">Welcome!</h1>
        <p className="text-orange-50 text-xs font-medium leading-relaxed opacity-90 max-w-[260px]">
          Portal Pelayanan Statistik Terpadu (PST) BPS Kota Probolinggo.
        </p>
      </div>

      <div className="absolute top-[140px] sm:top-[auto] sm:-mt-[390px] z-30 w-20 h-20 bg-white rounded-full p-1.5 shadow-xl flex items-center justify-center border-4 border-orange-50">
        <Image 
          src="/logoBPS.jpg" 
          alt="Logo BPS" 
          width={64} 
          height={64} 
          className="object-contain rounded-full"
          priority
        />
      </div>

      <div className="w-full max-w-md bg-white sm:rounded-[2rem] rounded-t-[2.5rem] px-6 pt-16 pb-10 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.4)] relative z-20 flex-1 sm:flex-none sm:mb-8 -mt-16">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Pilih Menu Layanan</p>

        <div className="space-y-4">
          {!loading && activeQueueId ? (
            <button 
              onClick={() => router.push(`/status/${activeQueueId}`)}
              className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-xs font-black uppercase tracking-wider mb-0.5">Status Antrean Aktif</h2>
                  <p className="text-[10px] text-emerald-100 font-medium">Klik untuk melihat panggilan Anda</p>
                </div>
              </div>
            </button>
          ) : (
            <button 
              onClick={onSelectForm}
              className="w-full p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-xs font-black uppercase tracking-wider mb-0.5">Ambil Antrean</h2>
                  <p className="text-[10px] text-orange-100 font-medium">Layanan Konsultasi & Pengaduan</p>
                </div>
              </div>
            </button>
          )}

          <button 
            onClick={onSelectBukuTamu}
            className="w-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl shadow-sm transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-orange-600" />
              </div>
              <div className="text-left">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-0.5">Isi Buku Tamu</h2>
                <p className="text-[10px] text-slate-500 font-medium">Kunjungan tanpa layanan antrean</p>
              </div>
            </div>
          </button>
        </div>
        
        <footer className="py-10 bg-white border-t border-slate-200 flex flex-col items-center justify-center shrink-0 text-center">
      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider ">
        © 2026 Badan Pusat Statistik Kota Probolinggo
      </span>
      <span className="text-[10px] text-slate-400 font-medium tracking-wide">
        Developed by Wadidurrahman
      </span>
      <span className="text-[9px] text-slate-400 font-medium tracking-widest">
        v1.0.0
      </span>
    </footer>
      </div>
    </main>
  );
}