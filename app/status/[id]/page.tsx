'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Loader2, User, CheckCircle2, Clock, Volume2, XCircle } from 'lucide-react';
import Image from 'next/image';

export default function StatusAntrian() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const ratingSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (id) {
      localStorage.setItem('bps_active_queue_id', id);
    }

    const fetchQueue = async () => {
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setQueue(data);
      }
      setLoading(false);
    };

    fetchQueue();

    const channel = supabase
      .channel(`queue-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'queues', filter: `id=eq.${id}` },
        (payload) => {
          const updated = payload.new;
          setQueue(updated);

          // Jika status berubah jadi Selesai, auto scroll ke tombol SKD
          if (updated.status === 'Selesai') {
            setTimeout(() => {
              ratingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
          }

          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            if (updated.status === 'Dipanggil') {
              navigator.vibrate([400, 200, 400]);
            } else if (updated.status === 'Selesai') {
              navigator.vibrate([800]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleBatalkanAntrean = async () => {
    const confirm = window.confirm('Apakah Anda yakin ingin membatalkan antrean ini?');
    if (!confirm) return;

    try {
      await supabase.from('queues').delete().eq('id', id);
      localStorage.removeItem('bps_active_queue_id');
      localStorage.removeItem('bps_active_queue');
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeluarSelesai = () => {
    localStorage.removeItem('bps_active_queue_id');
    localStorage.removeItem('bps_active_queue');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-500 to-orange-700 flex justify-center items-center font-sans">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col justify-center items-center font-sans px-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-slate-200 max-w-sm w-full">
          <p className="text-red-500 font-bold text-xs uppercase tracking-widest mb-4">Data antrean tidak ditemukan atau sudah dibatalkan.</p>
          <button 
            onClick={handleKeluarSelesai}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center relative overflow-x-hidden font-sans sm:justify-center">
      <div className={`w-full max-w-md px-6 pt-10 pb-24 relative z-10 text-center transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">Status Antrean</h1>
        <p className="text-orange-50 text-xs font-medium leading-relaxed opacity-90 max-w-[280px] mx-auto">
          Sistem Pelayanan Statistik Terpadu (PST) BPS Kota Probolinggo.
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

      <div className={`w-full max-w-md bg-white sm:rounded-[2rem] rounded-t-[2.5rem] px-6 pt-16 pb-10 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.4)] relative z-20 flex-1 sm:flex-none sm:mb-8 -mt-16 transition-all duration-700 delay-150 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
        
        <div className="text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nomor Antrean Anda</p>
          <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter">
            {queue.queue_number}
          </h1>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100 flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-2 mb-2 border-b border-slate-200/60 pb-3 w-full">
              <User size={16} className="text-orange-500" />
              <span className="font-black text-slate-800 text-sm uppercase tracking-wide">{queue.guest_name}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1 w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Layanan & Meja</span>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                {queue.service_type}
              </p>
              <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider bg-slate-200/60 px-3 py-1 rounded-full mt-1">
                {queue.service_type === 'Konsultasi Statistik' ? 'Meja 1 (Konsultasi)' : 'Meja 2 (Pengaduan)'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">Status Saat Ini</p>
            
            {queue.status === 'Menunggu' && (
              <div className="inline-flex items-center justify-center gap-2 bg-amber-50 text-amber-800 px-6 py-3 rounded-xl font-bold border border-amber-200 uppercase tracking-widest text-xs shadow-sm w-full">
                <Clock size={16} /> Menunggu Giliran
              </div>
            )}
            {queue.status === 'Dipanggil' && (
              <div className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-800 px-6 py-3 rounded-xl font-bold border border-blue-200 uppercase tracking-widest text-xs shadow-sm w-full animate-bounce">
                <Volume2 size={16} /> Silakan Menuju Meja!
              </div>
            )}
            {queue.status === 'Selesai' && (
              <div className="inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl font-bold border border-emerald-200 uppercase tracking-widest text-xs shadow-sm w-full">
                <CheckCircle2 size={16} /> Pelayanan Selesai
              </div>
            )}
          </div>

          {/* Bagian Tautan SKD - Mode Wajib Isi */}
          <div ref={ratingSectionRef}>
            {queue.status === 'Selesai' && (
              <div className="mt-6 pt-5 border-t-2 border-orange-200 bg-orange-50/50 p-4 rounded-2xl text-center flex flex-col gap-4">
                <div className="flex flex-col items-center gap-1 text-slate-800 bg-white p-4 rounded-xl w-full border border-slate-200 shadow-sm">
                  <p className="font-bold text-xs uppercase tracking-widest text-orange-600 mb-1">WAJIB DIISI</p>
                  <p className="font-medium text-[10px] text-slate-500 mb-4 px-2">Untuk menyelesaikan pelayanan, silakan berikan penilaian Anda melalui tautan berikut.</p>
                  
                  <a 
                    href="https://s.bps.go.id/SKD-3574"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      // Hapus data sesi antrean agar aplikasi reset
                      localStorage.removeItem('bps_active_queue_id');
                      localStorage.removeItem('bps_active_queue');
                      // Beri sedikit jeda agar tab SKD terbuka dulu, lalu redirect tab ini ke Beranda
                      setTimeout(() => {
                        router.push('/');
                      }, 500);
                    }}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center justify-center animate-pulse hover:animate-none"
                  >
                    Berikan Penilaian Pelayanan
                  </a>
                </div>
              </div>
            )}
          </div>

          {queue.status !== 'Selesai' && (
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center items-center">
              <button
                onClick={handleBatalkanAntrean}
                className="text-[10px] font-bold text-slate-400 hover:text-red-600 flex items-center gap-1.5 transition-colors"
              >
                <XCircle size={14} /> Batalkan Antrean Ini
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}