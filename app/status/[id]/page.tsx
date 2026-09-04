'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Loader2, User, Star } from 'lucide-react';

export default function StatusAntrian() {
  const params = useParams();
  const id = params.id as string;
  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [skmSubmitted, setSkmSubmitted] = useState(false);

  useEffect(() => {
    // 1. Ambil data awal
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

    // 2. Berlangganan perubahan Real-time (Socket)
    const channel = supabase
      .channel(`queue-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'queues', filter: `id=eq.${id}` },
        (payload) => {
          setQueue(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const submitSKM = async (score: number) => {
    setRating(score);
    await supabase.from('queues').update({ skm_score: score }).eq('id', id);
    setSkmSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!queue) {
    return <div className="text-center mt-20 text-red-500">Data antrian tidak ditemukan.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
        <p className="text-sm font-medium text-gray-500 mb-2">Nomor Antrian Anda</p>
        <h1 className="text-6xl font-black text-blue-600 mb-6 tracking-tighter">
          {queue.queue_number}
        </h1>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 text-left">
          <div className="flex items-center gap-3 mb-2">
            <User size={18} className="text-gray-400" />
            <span className="font-semibold text-gray-700">{queue.guest_name}</span>
          </div>
          <p className="text-sm text-gray-500 pl-7">Layanan: <span className="font-medium text-gray-800">{queue.service_type}</span></p>
        </div>

        {/* Indikator Status */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Status Saat Ini</p>
          {queue.status === 'Menunggu' && (
            <div className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold animate-pulse">
              Sedang Menunggu...
            </div>
          )}
          {queue.status === 'Dipanggil' && (
            <div className="inline-block bg-green-100 text-green-700 px-6 py-3 rounded-full font-bold text-lg shadow-sm border border-green-200">
              Silakan Menuju Loket!
            </div>
          )}
          {queue.status === 'Selesai' && (
            <div className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-bold">
              Pelayanan Selesai
            </div>
          )}
        </div>

        {/* Form SKM (Hanya muncul jika status Selesai) */}
        {queue.status === 'Selesai' && !skmSubmitted && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="font-bold text-gray-800 mb-1">Bagaimana pelayanan kami?</h3>
            <p className="text-xs text-gray-500 mb-4">Berikan penilaian Anda</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => submitSKM(star)}
                  className="hover:scale-110 transition-transform"
                >
                  <Star
                    size={32}
                    className={rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {skmSubmitted && (
          <div className="mt-8 pt-6 border-t border-gray-100 text-green-600 font-medium text-sm">
            Terima kasih atas penilaian Anda!
          </div>
        )}
      </div>
    </main>
  );
}