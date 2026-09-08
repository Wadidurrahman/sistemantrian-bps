'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { QrCode, Maximize, Minimize, Image as ImageIcon } from 'lucide-react';

export default function DisplayTV() {
  const [currentCallKS, setCurrentCallKS] = useState<any>(null);
  const [currentCallPG, setCurrentCallPG] = useState<any>(null);
  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [waktu, setWaktu] = useState<string>('00:00:00');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrLink, setQrLink] = useState<string>('');

  const [slides, setSlides] = useState<string[]>([
    '/banner1.jpg',
    '/banner2.jpg',
    '/banner3.jpg'
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setQrLink(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);

  const fetchDisplayData = async () => {
    const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).single();
    if (!settings) return;

    if (settings.slideshow_urls && settings.slideshow_urls.length > 0) {
      setSlides(settings.slideshow_urls);
    }

    const { data: activeKS } = await supabase
      .from('queues')
      .select('*')
      .gte('created_at', settings.last_reset_timestamp)
      .eq('service_type', 'Konsultasi Statistik')
      .eq('status', 'Dipanggil')
      .order('called_at', { ascending: false })
      .limit(1)
      .single();

    const { data: activePG } = await supabase
      .from('queues')
      .select('*')
      .gte('created_at', settings.last_reset_timestamp)
      .eq('service_type', 'Pelayanan Pengaduan')
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

    setCurrentCallKS(activeKS || null);
    setCurrentCallPG(activePG || null);
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

    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
      clearInterval(slideTimer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [slides.length]);

  return (
    <main className="h-[100dvh] w-screen bg-slate-900 flex overflow-hidden font-sans select-none relative">
      <button
        onClick={toggleFullScreen}
        className="absolute top-6 right-6 z-50 bg-black/30 hover:bg-orange-500 backdrop-blur-md p-3 rounded-xl text-white transition-all duration-300 border border-white/20 shadow-xl"
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      <div className="w-[42%] bg-gradient-to-b from-[#e3f0fb] via-white to-[#daecf9] text-slate-800 flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.3)] z-10 relative border-r border-slate-200">
        <div className="bg-white px-5 py-4 flex items-center gap-3 border-b-[5px] border-orange-500 shrink-0 shadow-sm relative z-20">
          <div className="flex-shrink-0 bg-slate-50 p-1 rounded-sm border border-slate-100">
            <img src="/logoBPS.jpg" alt="Logo BPS" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex-1">
            <h1 className="text-xs font-black tracking-wider uppercase leading-tight text-blue-900">Badan Pusat Statistik</h1>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.15em] uppercase">Kota Probolinggo</p>
          </div>
          <div className="text-lg font-black text-blue-900 font-mono tracking-widest bg-slate-100 border border-slate-200 px-3 py-1 rounded-sm shadow-inner">
            {waktu}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between p-6 text-center">
          <div className="flex-1 flex flex-col justify-center items-center border-b border-blue-200/60 pb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-800">Meja 1 : Konsultasi Statistik</h2>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Sedang Dilayani</p>
            <div className="text-7xl font-black text-blue-900 font-mono tracking-tighter mb-2">
              {currentCallKS ? currentCallKS.queue_number : '---'}
            </div>
            <div className="space-y-0.5 font-medium text-slate-700 text-sm">
              <p><span className="text-slate-400">Atas Nama:</span> <span className="font-bold text-slate-900 uppercase">{currentCallKS ? currentCallKS.guest_name : 'Belum Ada'}</span></p>
              <p><span className="text-slate-400">Status:</span> <span className="font-bold text-emerald-600 uppercase">{currentCallKS ? 'Dipanggil ke Meja 1' : 'Menunggu / Siap'}</span></p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center pt-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Meja 2 : Pelayanan Pengaduan</h2>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-1">Sedang Dilayani</p>
            <div className="text-7xl font-black text-orange-600 font-mono tracking-tighter mb-2">
              {currentCallPG ? currentCallPG.queue_number : '---'}
            </div>
            <div className="space-y-0.5 font-medium text-slate-700 text-sm">
              <p><span className="text-slate-400">Atas Nama:</span> <span className="font-bold text-slate-900 uppercase">{currentCallPG ? currentCallPG.guest_name : 'Belum Ada'}</span></p>
              <p><span className="text-slate-400">Status:</span> <span className="font-bold text-blue-600 uppercase">{currentCallPG ? 'Dipanggil ke Meja 2' : 'Menunggu / Siap'}</span></p>
            </div>
          </div>
        </div>

        <div className="h-[26%] bg-white/70 backdrop-blur-sm border-t border-blue-200 flex flex-col shadow-inner relative z-10">
          <div className="px-5 py-2.5 border-b border-blue-100 flex justify-between items-center shrink-0 bg-blue-50/50">
            <h3 className="font-bold text-blue-900 text-[11px] uppercase tracking-widest">Antrian Berikutnya</h3>
            <span className="bg-blue-900 text-white px-2.5 py-0.5 rounded font-bold text-[10px] tracking-wide shadow-sm">
              {waitingList.length} Menunggu
            </span>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col justify-center px-5 gap-1.5">
            {waitingList.length > 0 ? (
              waitingList.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-200 pb-1 last:border-0">
                  <span className="font-mono font-black text-blue-900 text-sm">{q.queue_number}</span>
                  <span className="font-bold text-slate-800 uppercase truncate max-w-[150px]">{q.guest_name}</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">{q.service_type === 'Konsultasi Statistik' ? 'M1' : 'M2'}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 text-xs font-medium uppercase tracking-wide">
                Belum ada antrean
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-[58%] bg-slate-900 relative flex flex-col overflow-hidden items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-transparent z-10 pointer-events-none"></div>
            {slides.length > 0 && slides[currentSlide] ? (
              <img 
                src={slides[currentSlide]} 
                alt="Slideshow Banner" 
                className="w-full h-full object-cover transition-all duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                <div className="text-center">
                  <ImageIcon size={64} className="mx-auto mb-3 opacity-40 animate-pulse" />
                  <p className="text-sm font-bold uppercase tracking-widest">Slideshow Banner Informasi BPS</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-20 right-8 bg-white p-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center border-[4px] border-orange-500 z-30">
          <div className="flex items-center gap-1.5 mb-2 text-blue-900">
            <QrCode size={18} className="text-orange-600" />
            <span className="font-black text-sm tracking-tight uppercase">Scan Disini</span>
          </div>
          <div className="bg-white p-1.5 rounded-lg border-2 border-slate-100">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrLink)}&color=1e3a8a`} 
              alt="Scan QR" 
              className="w-28 h-28 object-contain"
            />
          </div>
          <div className="mt-2 bg-blue-50 w-full rounded py-1 border border-blue-100">
            <p className="text-blue-800 text-[9px] font-bold text-center tracking-widest uppercase">
              Scan Via HP
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-14 bg-blue-900 border-t-4 border-orange-500 flex items-center overflow-hidden z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="bg-orange-500 text-white font-black text-base h-full px-6 flex items-center z-10 shadow-[10px_0_20px_rgba(0,0,0,0.5)] tracking-widest">
            INFO
          </div>
          <div className="flex-1 whitespace-nowrap overflow-hidden flex items-center h-full border-l border-blue-900">
            <div className="animate-[marquee_25s_linear_infinite] inline-block text-white font-semibold text-lg tracking-wide pl-[100%] pt-1">
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