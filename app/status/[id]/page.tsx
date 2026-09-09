'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Loader2, User, Star, CheckCircle2, Clock, Volume2, MessageSquarePlus, RotateCcw } from 'lucide-react';

export default function StatusAntrian() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [skmSubmitted, setSkmSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

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
      
      if (!error && data) setQueue(data);
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

  const submitSKM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert('Silakan pilih rating bintang terlebih dahulu.');
    
    await supabase.from('queues').update({ rating: rating, feedback: feedback }).eq('id', id);
    setSkmSubmitted(true);
  };

  const handleKeluarAntrean = () => {
    localStorage.removeItem('bps_active_queue_id');
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
      <div className="min-h-screen bg-gradient-to-b from-orange-500 to-orange-700 flex justify-center items-center font-sans">
        <div className="bg-white p-8 rounded-sm shadow-xl text-center border border-slate-200">
          <p className="text-red-500 font-bold text-sm uppercase tracking-widest">Data antrian tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center relative overflow-x-hidden font-sans sm:justify-center">
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

      <div className={`w-full max-w-sm px-6 pt-12 pb-24 relative z-10 text-center transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Status Antrian</h1>
        <p className="text-orange-50 text-sm font-medium leading-relaxed drop-shadow-md">
          Sistem Antrian Pelayanan Statistik Terpadu (PST) BPS Kota Probolinggo.
        </p>
      </div>

      <div className={`w-full max-w-sm bg-[#fdfdfd] sm:rounded-sm rounded-t-sm px-6 pt-14 pb-8 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.4)] relative z-20 flex-1 sm:flex-none sm:mb-8 -mt-16 transition-all duration-700 delay-150 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
        
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full p-1.5 shadow-[0_8px_20px_rgba(249,115,22,0.15)] border border-orange-50">
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/logoBPS.jpg" alt="Logo BPS" className="h-10 w-auto object-contain" />
          </div>
        </div>

        <div className="text-center mt-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nomor Antrian Anda</p>
          <h1 className="text-7xl font-black text-[#0f172a] mb-6 tracking-tighter">
            {queue.queue_number}
          </h1>

          <div className="bg-slate-50 rounded-sm p-5 mb-6 border border-slate-200 text-left">
            <div className="flex items-center gap-3 mb-2 border-b border-slate-200 pb-2">
              <User size={18} className="text-slate-400" />
              <span className="font-bold text-slate-800 text-base uppercase">{queue.guest_name}</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2 pl-7">
              Layanan: <span className="text-orange-600">{queue.service_type}</span>
            </p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1 pl-7">
              Meja: <span className="text-slate-800">{queue.service_type === 'Konsultasi Statistik' ? 'MEJA 1' : 'MEJA 2'}</span>
            </p>
          </div>

          <div className="mb-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-bold">Status Saat Ini</p>
            {queue.status === 'Menunggu' && (
              <div className="inline-block bg-amber-50 text-amber-800 px-6 py-3 rounded-sm font-bold border border-amber-200 uppercase tracking-widest text-sm shadow-sm">
                <Clock size={16} className="inline mr-2" /> Menunggu Giliran
              </div>
            )}
            {queue.status === 'Dipanggil' && (
              <div className="inline-block bg-blue-50 text-blue-800 px-6 py-3 rounded-sm font-bold border border-blue-200 uppercase tracking-widest text-sm shadow-sm animate-bounce">
                <Volume2 size={16} className="inline mr-2" /> Silakan Menuju Meja!
              </div>
            )}
            {queue.status === 'Selesai' && (
              <div className="inline-block bg-emerald-50 text-emerald-700 px-6 py-3 rounded-sm font-bold border border-emerald-200 uppercase tracking-widest text-sm shadow-sm">
                <CheckCircle2 size={16} className="inline mr-2" /> Pelayanan Selesai
              </div>
            )}
          </div>

          {queue.status === 'Selesai' && !skmSubmitted && (
            <form onSubmit={submitSKM} className="mt-6 pt-5 border-t border-slate-200 text-left">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-1 text-center">Survei Kepuasan & Masukan</h3>
              <p className="text-[10px] text-slate-500 mb-3 font-semibold uppercase tracking-widest text-center">Berikan Penilaian Anda</p>
              
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={`transition-colors ${rating >= star ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'text-slate-200 fill-slate-50'}`}
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-1 mb-4">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Kritik & Saran (Opsional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tuliskan masukan untuk pelayanan kami..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 resize-none h-20 bg-slate-50"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-sm transition-all"
              >
                Kirim Penilaian
              </button>
            </form>
          )}

          {skmSubmitted && (
            <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-widest">
              <Star size={22} className="fill-emerald-600" />
              Terima Kasih Atas Penilaian Anda!
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={handleKeluarAntrean}
              className="text-[11px] font-bold text-slate-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} /> Ambil Antrean Baru
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}