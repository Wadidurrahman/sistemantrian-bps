'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { QrCode, Maximize, Minimize } from 'lucide-react';

export default function DisplayTV() {
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [waktu, setWaktu] = useState<string>('00:00:00');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrLink, setQrLink] = useState<string>('');

useEffect(() => {
  if (typeof window !== 'undefined') {
    setQrLink(`${window.location.protocol}//${window.location.host}`);
  }
}, []);
  const videoStorageUrl = "https://ffljuwtbdszmarcokmvh.supabase.co/storage/v1/object/public/display-media/video-bps.mov";

  const fetchDisplayData = async () => {
    const { data: settings } = await supabase.from('app_settings').select('last_reset_timestamp').eq('id', 1).single();
    if (!settings) return;

    const { data: active } = await supabase
      .from('queues')
      .select('*')
      .gte('created_at', settings.last_reset_timestamp)
      .eq('status', 'Dipanggil')
      .order('called_at', { ascending: false })
      .limit(1)
      .single();

    const { data: waiting } = await supabase
      .from('queues')
      .select('*')
      .gte('created_at', settings.last_reset_timestamp)
      .or('status.is.null,status.eq.Menunggu')
      .order('created_at', { ascending: true })
      .limit(3);

    setCurrentCall(active || null);
    setWaitingList(waiting || []);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    fetchDisplayData();

    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Autoplay dicegah browser:", err);
      });
    }

    const channel = supabase
      .channel('tv-display')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, () => {
        fetchDisplayData();
      })
      .subscribe();

    const timer = setInterval(() => {
      const now = new Date();
      setWaktu(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <main className="h-[100dvh] w-screen bg-slate-900 flex overflow-hidden font-sans select-none relative">
      <button
        onClick={toggleFullScreen}
        className="absolute top-6 right-6 z-50 bg-black/30 hover:bg-orange-500 backdrop-blur-md p-3 rounded-xl text-white transition-all duration-300 border border-white/20 shadow-xl"
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      <div className="w-[40%] bg-gradient-to-b from-[#e3f0fb] via-white to-[#daecf9] flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.3)] z-10 relative border-r border-slate-200">
        <div className="bg-white px-6 py-5 flex items-center gap-4 border-b-[6px] border-orange-500 shrink-0 shadow-sm relative z-20">
          <div className="flex-shrink-0">
            <img src="/logoBPS.jpg" alt="Logo BPS" className="h-12 w-auto object-contain" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-black text-blue-900 tracking-wide uppercase leading-tight">Badan Pusat Statistik</h1>
            <p className="text-slate-500 text-[11px] font-bold tracking-[0.15em] uppercase">Kota Probolinggo</p>
          </div>
          <div className="text-2xl font-black text-blue-900 font-mono tracking-widest bg-blue-50/50 border border-blue-100 px-3 py-1.5 rounded-md shadow-sm">
            {waktu}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-transparent">
          <h2 className="text-lg font-black text-blue-500 uppercase tracking-[0.2em] mb-2 relative z-10">
            Sedang Dilayani
          </h2>
          
          <span className="text-[11rem] leading-[0.9] font-black text-blue-900 tracking-tighter relative z-10 drop-shadow-sm">
            {currentCall ? currentCall.queue_number : '--'}
          </span>
          
          {currentCall && (
            <div className="mt-8 flex flex-col items-center gap-3 relative z-10 w-full px-8">
              <span className="text-3xl font-black text-slate-800 uppercase tracking-wide text-center truncate w-full">
                {currentCall.guest_name}
              </span>
              <span className="bg-orange-500 text-white px-8 py-2.5 rounded font-bold text-lg tracking-widest uppercase shadow-md">
                {currentCall.service_type}
              </span>
            </div>
          )}
        </div>

        <div className="h-[35%] bg-white/40 backdrop-blur-sm border-t-2 border-blue-100 flex flex-col shadow-[0_-10px_20px_rgba(0,0,0,0.02)] relative z-10">
          <div className="bg-blue-100/50 px-6 py-3.5 border-b border-blue-100 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-blue-900 text-xs uppercase tracking-widest">Antrian Berikutnya</h3>
            <span className="bg-blue-900 text-white px-3 py-1 rounded font-bold text-xs tracking-wide shadow-sm">
              {waitingList.length} Menunggu
            </span>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {waitingList.length > 0 ? (
              waitingList.map((q, idx) => (
                <div key={idx} className="flex items-center px-6 py-4 bg-white/60 border-b border-blue-50/50 last:border-0 backdrop-blur-md">
                  <div className="text-3xl font-black text-blue-900 w-20 shrink-0">
                    {q.queue_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 uppercase text-lg truncate">{q.guest_name}</h4>
                    <p className="text-orange-600 text-xs font-bold uppercase tracking-wide truncate mt-0.5">{q.service_type}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <p className="font-semibold text-sm tracking-wide uppercase">Belum ada antrean</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-[60%] bg-slate-950 relative flex flex-col overflow-hidden items-center justify-center">
        {!videoError ? (
          <>
            {/* Latar Belakang Blur Adaptif untuk mengisi sisi kiri-kanan */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-40 scale-125 pointer-events-none"
            >
              <source src={videoStorageUrl} type="video/quicktime" />
              <source src={videoStorageUrl} type="video/mp4" />
            </video>

            {/* Video Utama di Tengah (Tampil proporsional) */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
              <video 
                ref={videoRef}
                autoPlay 
                loop 
                muted 
                playsInline
                preload="auto"
                onError={() => setVideoError(true)}
                className="w-full h-full max-h-[calc(100vh-100px)] object-contain rounded-lg shadow-2xl"
              >
                <source src={videoStorageUrl} type="video/quicktime" />
                <source src={videoStorageUrl} type="video/mp4" />
                Browser Anda tidak mendukung pemutar video.
              </video>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-white/50 text-xs">
            Gagal memuat video background
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-transparent pointer-events-none z-20"></div>

        <div className="absolute bottom-24 right-10 bg-white p-5 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center border-[4px] border-orange-500 z-30">
          <div className="flex items-center gap-2 mb-3 text-blue-900">
            <QrCode size={22} className="text-orange-600" />
            <span className="font-black text-base tracking-tight uppercase">Scan Disini</span>
          </div>
          <div className="bg-white p-2 rounded-lg border-2 border-slate-100">
            <img 
  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrLink)}&color=1e3a8a`} 
  alt="Scan QR" 
  className="w-32 h-32 object-contain"
/>
          </div>
          <div className="mt-3 bg-blue-50 w-full rounded py-1.5 border border-blue-100">
            <p className="text-blue-800 text-[10px] font-bold text-center tracking-widest uppercase">
              Scan Via HP
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-16 bg-blue-900 border-t-4 border-orange-500 flex items-center overflow-hidden z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="bg-orange-500 text-white font-black text-lg h-full px-8 flex items-center z-10 shadow-[10px_0_20px_rgba(0,0,0,0.5)] tracking-widest">
            INFO
          </div>
          <div className="flex-1 whitespace-nowrap overflow-hidden flex items-center h-full border-l border-blue-900">
            <div className="animate-[marquee_25s_linear_infinite] inline-block text-white font-semibold text-xl tracking-wide pl-[100%] pt-1">
              Selamat Datang di Pelayanan Statistik Terpadu (PST) Badan Pusat Statistik Kota Probolinggo. Siap Melayani dengan Cepat, Tepat, dan Akurat. Silakan siapkan identitas Anda saat menuju loket.
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </main>
  );
}