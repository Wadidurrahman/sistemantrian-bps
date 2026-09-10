'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Ticket, BookOpen, Clock } from 'lucide-react';
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
    <main className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-900 rounded-b-[3rem] shadow-xl"></div>
      
      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 inline-block">
          <Image src="/logoBPS.jpg" alt="Logo BPS" width={180} height={60} className="h-auto w-40 object-contain" priority />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Selamat Datang</h1>
          <p className="text-blue-100 text-sm font-medium">Pelayanan Statistik Terpadu (PST)<br/>BPS Kota Probolinggo</p>
        </div>

        <div className="w-full space-y-4">
          {!loading && activeQueueId ? (
            <button 
              onClick={() => router.push(`/status/${activeQueueId}`)}
              className="w-full p-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-[0_10px_20px_-10px_rgba(5,150,105,0.5)] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Clock size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-1">Status Antrean</h2>
                  <p className="text-[10px] text-emerald-100 font-medium">Lihat panggilan antrean Anda</p>
                </div>
              </div>
            </button>
          ) : (
            <button 
              onClick={onSelectForm}
              className="w-full p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Ticket size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-1">Ambil Antrean</h2>
                  <p className="text-[10px] text-blue-100 font-medium">Layanan Konsultasi & Pengaduan</p>
                </div>
              </div>
            </button>
          )}

          <button 
            onClick={onSelectBukuTamu}
            className="w-full p-5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl shadow-sm transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <BookOpen size={24} className="text-orange-600" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-1">Isi Buku Tamu</h2>
                <p className="text-[10px] text-slate-500 font-medium">Kunjungan tanpa layanan antrean</p>
              </div>
            </div>
          </button>
        </div>
        
        <p className="mt-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} BPS Kota Probolinggo
        </p>
      </div>
    </main>
  );
}