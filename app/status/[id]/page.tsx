'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Loader2, User, Star, CheckCircle2, Clock, Volume2, RotateCcw, XCircle } from 'lucide-react';
import Image from 'next/image';

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
        if (data.status === 'Selesai' && data.rating) {
          setSkmSubmitted(true);
          setRating(data.rating);
          setFeedback(data.feedback || '');
        }
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

          // Jika status berubah jadi Selesai, auto scroll ke form penilaian agar tamu langsung lihat
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

  const submitSKM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert('Silakan pilih rating bintang terlebih dahulu.');
    
    const { error } = await supabase
      .from('queues')
      .update({ 
        rating: rating, 
        feedback: feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      alert('Gagal mengirim penilaian: ' + error.message);
      return;
    }

    setSkmSubmitted(true);
    alert('Terima kasih! Penilaian dan saran Anda berhasil disimpan.');
  };

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

          {/* Bagian Form Penilaian yang otomatis difokuskan saat Selesai */}
          <div ref={ratingSectionRef}>
            {queue.status === 'Selesai' && !skmSubmitted && (
              <form onSubmit={submitSKM} className="mt-6 pt-5 border-t-2 border-orange-200 bg-orange-50/50 p-4 rounded-2xl text-left">
                <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-1 text-center">Survei Kepuasan & Masukan</h3>
                <p className="text-[10px] text-orange-600 mb-3 font-bold uppercase tracking-widest text-center">Silakan Berikan Penilaian Anda</p>
                
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        size={36}
                        className={`transition-colors ${rating >= star ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'text-slate-200 fill-white'}`}
                      />
                    </button>
                  ))}
                </div>

                <div className="space-y-1 mb-4">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider ml-1">
                    Kritik & Saran / Masukan
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tuliskan masukan untuk pelayanan kami..."
                    className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500 resize-none h-20 bg-white"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-orange-600/30 transition-all"
                >
                  Kirim Penilaian
                </button>
              </form>
            )}

            {queue.status === 'Selesai' && skmSubmitted && (
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-50 p-4 rounded-2xl w-full border border-emerald-100">
                  <Star size={24} className="fill-emerald-600 mb-1" />
                  Terima Kasih Atas Penilaian Anda!
                </div>
                <button
                  onClick={handleKeluarSelesai}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <RotateCcw size={16} /> Selesai & Kembali ke Menu Utama
                </button>
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