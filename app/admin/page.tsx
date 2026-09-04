'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Volume2, CheckCircle, RotateCcw, FileSpreadsheet, Star } from 'lucide-react';

export default function AdminDashboard() {
  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueues = async () => {
    // Ambil waktu reset terakhir
    const { data: settings } = await supabase.from('app_settings').select('last_reset_timestamp').eq('id', 1).single();
    
    // Ambil data antrian yang belum selesai sejak reset terakhir
    if (settings) {
      const { data } = await supabase
        .from('queues')
        .select('*')
        .gte('created_at', settings.last_reset_timestamp)
        .neq('status', 'Selesai')
        .order('is_priority', { ascending: false })
        .order('created_at', { ascending: true });
      
      setQueues(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueues();

    // Berlangganan Real-time agar otomatis update jika ada tamu daftar
    const channel = supabase
      .channel('admin-queues')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, () => {
        fetchQueues(); // Refresh data setiap ada perubahan
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePanggil = async (antrian: any) => {
    // 1. Update status ke database
    await supabase.from('queues').update({ status: 'Dipanggil', called_at: new Date() }).eq('id', antrian.id);

    // 2. Mainkan Suara (Web Speech API)
    const teks = `Nomor antrian, ${antrian.queue_number}. Atas nama, ${antrian.guest_name}. Menuju loket pelayanan, ${antrian.service_type}.`;
    const speech = new SpeechSynthesisUtterance(teks);
    speech.lang = 'id-ID';
    speech.rate = 0.85; // Diperlambat sedikit agar jelas
    window.speechSynthesis.speak(speech);
  };

  const handleSelesai = async (id: string) => {
    await supabase.from('queues').update({ status: 'Selesai', finished_at: new Date() }).eq('id', id);
  };

  const handleReset = async () => {
    if (confirm('Yakin ingin mereset hitungan antrian kembali ke 01?')) {
      await supabase.from('app_settings').update({ last_reset_timestamp: new Date() }).eq('id', 1);
      fetchQueues();
      alert('Antrian berhasil direset!');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Sistem Antrian BPS Kota Probolinggo</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition"
            >
              <RotateCcw size={18} /> Reset Antrian
            </button>
            <a
              href="https://docs.google.com/spreadsheets" // Nanti ganti dengan URL Spreadsheet Anda
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition"
            >
              <FileSpreadsheet size={18} /> Buka History
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-4 font-semibold">No. Antrian</th>
                <th className="p-4 font-semibold">Nama Tamu</th>
                <th className="p-4 font-semibold">Layanan</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">Memuat data...</td>
                </tr>
              ) : queues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">Belum ada antrian aktif saat ini.</td>
                </tr>
              ) : (
                queues.map((q) => (
                  <tr key={q.id} className={`border-b border-gray-100 hover:bg-gray-50 ${q.is_priority ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                    <td className="p-4">
                      <span className={`font-bold text-xl ${q.is_priority ? 'text-red-600' : 'text-blue-600'}`}>
                        {q.queue_number}
                      </span>
                      {q.is_priority && <span className="ml-2 text-xs bg-red-200 text-red-800 px-2 py-1 rounded font-semibold">Prioritas</span>}
                    </td>
                    <td className="p-4 font-medium text-gray-800">{q.guest_name}</td>
                    <td className="p-4 text-gray-600">{q.service_type}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${q.status === 'Dipanggil' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button
                        onClick={() => handlePanggil(q)}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm"
                      >
                        <Volume2 size={16} /> Panggil
                      </button>
                      <button
                        onClick={() => handleSelesai(q.id)}
                        className="flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 transition shadow-sm text-sm"
                      >
                        <CheckCircle size={16} /> Selesai
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}