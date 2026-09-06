'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Megaphone, MonitorPlay, QrCode } from 'lucide-react';

export default function DisplayTV() {
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);

  // Ganti URL ini dengan URL website Anda saat sudah online
  const linkPendaftaran = "https://sistemantrian-bps.vercel.app/"; 

  const fetchDisplayData = async () => {
    const { data: settings } = await supabase.from('app_settings').select('last_reset_timestamp').eq('id', 1).single();

    if (settings) {
      const { data } = await supabase
        .from('queues')
        .select('*')
        .gte('created_at', settings.last_reset_timestamp)
        .eq('status', 'Dipanggil')
        .order('called_at', { ascending: false })
        .limit(4);

      if (data && data.length > 0) {
        setCurrentCall(data[0]); 
        setRecentCalls(data.slice(1)); 
      } else {
        setCurrentCall(null);
        setRecentCalls([]);
      }
    }
  };

  useEffect(() => {
    fetchDisplayData();

    const channel = supabase
      .channel('tv-display')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'queues' }, (payload) => {
        if (payload.new.status === 'Dipanggil' || payload.new.status === 'Selesai') {
          fetchDisplayData();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black flex text-white overflow-hidden font-sans relative">
      
      {/* KIRI: Informasi Antrian (Lebar 40%) */}
      <div className="w-[40%] bg-blue-900 flex flex-col border-r-4 border-orange-500 shadow-2xl z-10">
        
        {/* Area Antrian Utama */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-blue-800 to-blue-950">
          <div className="flex items-center gap-3 mb-4 text-orange-400">
            <Megaphone size={36} className="animate-bounce" />
            <h2 className="text-2xl font-bold uppercase tracking-widest text-white">Nomor Antrian</h2>
          </div>
          
          <div className="bg-white rounded-3xl w-full py-10 shadow-[0_0_40px_rgba(249,115,22,0.3)] mb-6 border-b-8 border-orange-500">
            <span className="text-[12rem] font-black leading-none tracking-tighter text-orange-600">
              {currentCall ? currentCall.queue_number : '--'}
            </span>
          </div>
          
          {currentCall && (
            <div className="bg-orange-500 w-full p-6 rounded-2xl shadow-lg">
              <p className="text-lg text-orange-100 mb-1 font-medium uppercase tracking-wider">Menuju Loket</p>
              <p className="text-4xl font-extrabold text-white">{currentCall.service_type}</p>
            </div>
          )}
        </div>

        {/* History Panggilan */}
        <div className="h-64 bg-slate-900 p-6 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Panggilan Sebelumnya</h3>
          <div className="grid grid-cols-3 gap-4">
            {recentCalls.map((call, index) => (
              <div key={index} className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
                <span className="block text-4xl font-bold text-orange-400">{call.queue_number}</span>
                <span className="block text-xs text-slate-300 mt-1 truncate">{call.service_type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KANAN: Area Video & QR Code (Lebar 60%) */}
      <div className="w-[60%] bg-slate-950 relative flex items-center justify-center">
        
        {/* Placeholder Video */}
        <div className="text-center text-slate-700 flex flex-col items-center">
          <MonitorPlay size={80} className="mb-4 opacity-30" />
          <h2 className="text-2xl font-semibold opacity-50">Area Video Informasi BPS</h2>
        </div>

        {/* Kotak QR Code */}
        <div className="absolute bottom-24 right-10 bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col items-center border-4 border-orange-500 animate-[pulse_3s_ease-in-out_infinite] hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 mb-4 text-orange-600">
            <QrCode size={28} />
            <span className="font-extrabold text-xl tracking-tight">AMBIL ANTRIAN</span>
          </div>
          <div className="bg-white p-2 rounded-xl border-2 border-gray-100">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkPendaftaran)}&color=0f172a`} 
              alt="Scan QR" 
              className="w-40 h-40 object-contain rounded-lg"
            />
          </div>
          <div className="mt-4 bg-orange-100 w-full rounded-lg py-2">
            <p className="text-orange-800 text-xs font-bold text-center">
              SCAN MENGGUNAKAN HP
            </p>
          </div>
        </div>

        {/* Running Text di bagian bawah */}
        <div className="absolute bottom-0 w-full bg-orange-500 text-white p-4 text-2xl font-bold whitespace-nowrap overflow-hidden border-t-4 border-orange-600">
          <div className="animate-[marquee_20s_linear_infinite] inline-block tracking-wide">
            Selamat Datang di Badan Pusat Statistik (BPS) Kota Probolinggo • Melayani dengan Profesional, Integritas, dan Amanah •
          </div>
        </div>
      </div>
      
    </main>
  );
}