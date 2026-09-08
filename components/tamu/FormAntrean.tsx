'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { User, ClipboardList, AlertCircle, Loader2 } from 'lucide-react';

export default function FormAntrean({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [layanan, setLayanan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!layanan) {
      setError('Silakan pilih layanan terlebih dahulu.');
      return;
    }
    if (!nama.trim()) {
      setError('Silakan masukkan nama Anda.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const { data: settings } = await supabase.from('app_settings').select('last_reset_timestamp').eq('id', 1).single();
      const minTime = settings?.last_reset_timestamp || '1970-01-01';

      const { data: existingQueues } = await supabase
        .from('queues')
        .select('queue_number')
        .eq('service_type', layanan)
        .gte('created_at', minTime)
        .order('created_at', { ascending: false });

      const prefix = layanan === 'Konsultasi Statistik' ? 'KS' : 'PG';
      let nextNumber = 1;

      if (existingQueues && existingQueues.length > 0) {
        const lastNumStr = existingQueues[0].queue_number; 
        const parts = lastNumStr.split('-');
        if (parts.length === 2) {
          nextNumber = parseInt(parts[1], 10) + 1;
        }
      }

      const queueNumber = `${prefix}-${String(nextNumber).padStart(2, '0')}`;

      const { data: newQueue, error: insertError } = await supabase
        .from('queues')
        .insert([{ queue_number: queueNumber, guest_name: nama.toUpperCase(), service_type: layanan, status: 'Menunggu' }])
        .select().single();

      if (insertError) throw insertError;
      router.push(`/status/${newQueue.id}`);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengambil antrean.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-[#ea580c] to-[#c2410c] flex flex-col items-center relative overflow-x-hidden font-sans sm:justify-center">
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px] pointer-events-none"></div>

      <div className={`w-full max-w-sm px-6 pt-12 pb-24 relative z-10 text-left transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Welcome!</h1>
        <p className="text-orange-50 text-sm font-medium leading-relaxed drop-shadow-md">
          Sistem Antrian Pelayanan Statistik Terpadu (PST) BPS Kota Probolinggo.
        </p>
      </div>

      <div className={`w-full max-w-sm bg-white sm:rounded-[2rem] rounded-t-[2rem] px-6 pt-14 pb-8 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.4)] relative z-20 flex-1 sm:flex-none sm:mb-8 -mt-16 transition-all duration-700 delay-150 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
        
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full p-1.5 shadow-[0_8px_20px_rgba(249,115,22,0.15)] border border-orange-50">
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/logoBPS.jpg" alt="Logo BPS" className="h-10 w-auto object-contain" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-xs font-bold border border-red-100">
              <AlertCircle size={16} className="shrink-0" /> 
              <p>{error}</p>
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User size={18} className="text-slate-400 group-focus-within:text-[#ea580c] transition-colors" />
            </div>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="pl-11 w-full rounded-xl border-2 border-slate-100 py-3.5 px-4 focus:outline-none focus:border-[#ea580c] bg-white font-bold text-slate-800 text-sm transition-colors placeholder:font-medium placeholder:text-slate-400"
              placeholder="Masukkan Nama Anda"
            />
          </div>

          <div className="space-y-2 pt-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-2 text-left">
              SILAKAN PILIH LAYANAN
            </label>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setLayanan('Konsultasi Statistik')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  layanan === 'Konsultasi Statistik' 
                    ? 'border-[#ea580c] bg-orange-50/50 shadow-sm' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className={`p-2.5 rounded-lg transition-colors ${layanan === 'Konsultasi Statistik' ? 'bg-[#ea580c] text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <ClipboardList size={18} />
                </div>
                <span className={`font-bold text-sm ${layanan === 'Konsultasi Statistik' ? 'text-[#ea580c]' : 'text-slate-600'}`}>
                  Konsultasi Statistik
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLayanan('Pelayanan Pengaduan')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  layanan === 'Pelayanan Pengaduan' 
                    ? 'border-[#ea580c] bg-orange-50/50 shadow-sm' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className={`p-2.5 rounded-lg transition-colors ${layanan === 'Pelayanan Pengaduan' ? 'bg-[#ea580c] text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <User size={18} />
                </div>
                <span className={`font-bold text-sm ${layanan === 'Pelayanan Pengaduan' ? 'text-[#ea580c]' : 'text-slate-600'}`}>
                  Pelayanan Pengaduan
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ea580c] text-white font-extrabold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(234,88,12,0.6)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 text-sm tracking-widest uppercase"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'AMBIL ANTRIAN'}
            </button>
            
            <button 
              type="button"
              onClick={onBack} 
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-95 text-sm tracking-widest uppercase"
            >
              KEMBALI
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}