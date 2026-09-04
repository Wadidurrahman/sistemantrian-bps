'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { User, ClipboardList, AlertCircle, Loader2 } from 'lucide-react';

export default function PendaftaranTamu() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [layanan, setLayanan] = useState('Statistik');
  const [isPrioritas, setIsPrioritas] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Ambil waktu reset terakhir
      const { data: settings, error: settingsError } = await supabase
        .from('app_settings')
        .select('last_reset_timestamp')
        .eq('id', 1)
        .single();

      if (settingsError) throw settingsError;

      // 2. Hitung jumlah antrian setelah waktu reset terakhir
      const { count, error: countError } = await supabase
        .from('queues')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', settings.last_reset_timestamp);

      if (countError) throw countError;

      // 3. Generate nomor urut 2 digit (01, 02, dst)
      const nextNumber = String((count || 0) + 1).padStart(2, '0');

      // 4. Simpan ke database
      const { data: newQueue, error: insertError } = await supabase
        .from('queues')
        .insert([
          {
            queue_number: nextNumber,
            guest_name: nama,
            service_type: layanan,
            is_priority: isPrioritas,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // 5. Arahkan ke halaman Live Tracking
      router.push(`/status/${newQueue.id}`);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mendaftar.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Antrian BPS</h1>
          <p className="text-sm text-gray-500 mt-1">Kota Probolinggo</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="pl-10 w-full rounded-lg border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama Anda"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Layanan</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ClipboardList size={18} className="text-gray-400" />
              </div>
              <select
                value={layanan}
                onChange={(e) => setLayanan(e.target.value)}
                className="pl-10 w-full rounded-lg border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="Statistik">Pelayanan Statistik</option>
                <option value="Pengaduan">Pelayanan Pengaduan</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={isPrioritas}
              onChange={(e) => setIsPrioritas(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="block text-sm font-medium text-gray-800">Layanan Prioritas</span>
              <span className="block text-xs text-gray-500">Lansia, Disabilitas, atau Ibu Hamil</span>
            </div>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Ambil Nomor Antrian'}
          </button>
        </form>
      </div>
    </main>
  );
}