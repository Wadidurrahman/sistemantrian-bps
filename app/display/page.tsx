'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Maximize, Minimize } from 'lucide-react';

export default function DisplayTV() {
  const [queues, setQueues] = useState<any[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [waktu, setWaktu] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const fetchData = async () => {
    try {
      const { data: settings } = await supabase.from('app_settings').select('last_reset_timestamp').eq('id', 1).single();
      const minTime = settings?.last_reset_timestamp || '1970-01-01';

      const { data: qData } = await supabase
        .from('queues')
        .select('*')
        .gte('created_at', minTime)
        .order('updated_at', { ascending: false });
      
      if (qData) setQueues(qData);

      const { data: mData } = await supabase
        .from('display_media')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
        
      if (mData) {
        setMediaList(mData);
        setCurrentMediaIndex(prev => prev >= mData.length ? 0 : prev);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=1&data=${encodeURIComponent('https://sistemantrian-bps.vercel.app/')}`);
    }

    fetchData();

    const channelQ = supabase.channel('tv-queues')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, () => fetchData())
      .subscribe();

    const channelM = supabase.channel('tv-media')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'display_media' }, () => fetchData())
      .subscribe();

    const timer = setInterval(() => {
      const now = new Date();
      setWaktu(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'));
    }, 1000);

    const fallbackPoll = setInterval(fetchData, 10000);

    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);

    return () => {
      supabase.removeChannel(channelQ);
      supabase.removeChannel(channelM);
      clearInterval(timer);
      clearInterval(fallbackPoll);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  useEffect(() => {
    if (mediaList.length <= 1) return;
    const currentMedia = mediaList[currentMediaIndex];
    if (currentMedia?.media_type === 'video') return;

    const slideTimer = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
    }, 10000);

    return () => clearInterval(slideTimer);
  }, [currentMediaIndex, mediaList]);

  const handleVideoEnded = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const aktifM1 = queues.find(q => q.service_type === 'Konsultasi Statistik' && q.status === 'Dipanggil') || queues.find(q => q.service_type === 'Konsultasi Statistik' && q.status === 'Menunggu');
  const aktifM2 = queues.find(q => q.service_type === 'Pelayanan Pengaduan' && q.status === 'Dipanggil') || queues.find(q => q.service_type === 'Pelayanan Pengaduan' && q.status === 'Menunggu');
  const daftarMenunggu = queues.filter(q => q.status === 'Menunggu').sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="h-dvh w-full bg-slate-900 flex flex-col overflow-hidden font-sans">
      
      <main className="flex-1 flex w-full overflow-hidden">
        
        <section className="w-[45%] h-full flex flex-col bg-slate-50 border-r border-slate-300 z-20 overflow-hidden">
          
          <div className="shrink-0 h-[10vh] min-h-[70px] flex items-center justify-between px-4 lg:px-6 border-b-[5px] border-orange-500 bg-white shadow-sm z-10">
            <div className="flex items-center gap-3 lg:gap-4">
              <img src="/logoBPS.jpg" alt="Logo" className="h-10 lg:h-12 w-auto object-contain" />
              <div className="flex flex-col justify-center">
                <h1 className="text-[clamp(10px,1.2vw,16px)] font-black text-slate-700 tracking-widest uppercase leading-tight">Badan Pusat Statistik</h1>
                <h2 className="text-[clamp(10px,1.2vw,16px)] font-black text-slate-700 tracking-widest uppercase leading-tight">Kota Probolinggo</h2>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-blue-50 px-3 py-1.5 lg:px-4 lg:py-2 border border-blue-200 rounded-lg shadow-inner">
                <span className="text-[clamp(16px,2vw,30px)] font-black text-blue-900 font-mono tracking-wider">{waktu || '00:00:00'}</span>
              </div>
            </div>
          </div>

          <div className="flex-[2] min-h-0 flex flex-col items-center justify-center p-4 border-b border-slate-200 relative bg-gradient-to-b from-blue-50/80 to-white">
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <h3 className="text-[clamp(12px,1.5vw,20px)] font-black text-slate-700 tracking-[0.15em] uppercase text-center">MEJA 1 : KONSULTASI STATISTIK</h3>
            </div>
            
            <p className="text-[clamp(10px,1vw,14px)] font-bold text-slate-400 uppercase tracking-widest shrink-0">
              {aktifM1 ? 'SEDANG MELAYANI' : 'TIDAK ADA ANTREAN'}
            </p>

            <div className="flex-1 flex items-center justify-center w-full min-h-0 my-2">
              <span className="text-[clamp(60px,12vw,160px)] font-black text-blue-900 tracking-tighter leading-none drop-shadow-sm">
                {aktifM1?.queue_number?.split('-')[1] || '--'}
              </span>
            </div>

            <p className="text-[clamp(14px,1.5vw,24px)] font-bold text-slate-700 uppercase truncate max-w-full px-4 shrink-0">
              {aktifM1 ? `Atas Nama: ` : ''}<span className="text-blue-900">{aktifM1?.guest_name || ''}</span>
            </p>
            
            <div className="h-6 mt-2 shrink-0">
              <p className="text-[clamp(10px,1.2vw,16px)] font-bold text-emerald-600 uppercase tracking-widest flex items-center justify-center">
                {aktifM1 ? `STATUS: ${aktifM1.status === 'Dipanggil' ? 'DALAM PELAYANAN' : 'DALAM ANTREAN'}` : ''}
              </p>
            </div>
          </div>

          <div className="flex-[2] min-h-0 flex flex-col items-center justify-center p-4 border-b border-slate-200 relative bg-gradient-to-b from-orange-50/80 to-white">
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></div>
              <h3 className="text-[clamp(12px,1.5vw,20px)] font-black text-slate-700 tracking-[0.15em] uppercase text-center">MEJA 2 : PELAYANAN PENGADUAN</h3>
            </div>
            
            <p className="text-[clamp(10px,1vw,14px)] font-bold text-slate-400 uppercase tracking-widest shrink-0">
              {aktifM2 ? 'SEDANG MELAYANI' : 'TIDAK ADA ANTREAN'}
            </p>

            <div className="flex-1 flex items-center justify-center w-full min-h-0 my-2">
              <span className="text-[clamp(60px,12vw,160px)] font-black text-orange-600 tracking-tighter leading-none drop-shadow-sm">
                {aktifM2?.queue_number?.split('-')[1] || '--'}
              </span>
            </div>

            <p className="text-[clamp(14px,1.5vw,24px)] font-bold text-slate-700 uppercase truncate max-w-full px-4 shrink-0">
              {aktifM2 ? `Atas Nama: ` : ''}<span className="text-orange-600">{aktifM2?.guest_name || ''}</span>
            </p>
            
            <div className="h-6 mt-2 shrink-0">
              <p className="text-[clamp(10px,1.2vw,16px)] font-bold text-orange-600 uppercase tracking-widest flex items-center justify-center">
                {aktifM2 ? `STATUS: ${aktifM2.status === 'Dipanggil' ? 'DALAM PELAYANAN' : 'DALAM ANTREAN'}` : ''}
              </p>
            </div>
          </div>

          <div className="flex-[1.5] min-h-0 flex flex-col bg-slate-50 p-4 lg:p-6 shadow-inner shrink-0">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <h3 className="text-[clamp(11px,1.2vw,16px)] font-black text-blue-900 tracking-widest uppercase">Antrean Berikutnya</h3>
              <span className="bg-blue-600 text-white text-[clamp(9px,1vw,12px)] font-bold px-3 py-1 rounded-full shadow-sm">{daftarMenunggu.length} Menunggu</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 min-h-0">
              {daftarMenunggu.slice(0, 3).map((q) => (
                <div key={q.id} className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs lg:text-sm shadow-sm shrink-0">
                      {q.guest_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm lg:text-base font-black text-slate-800 leading-none">{q.queue_number?.split('-')[1]}</p>
                      <p className="text-[10px] lg:text-[11px] font-bold text-slate-500 uppercase truncate max-w-[150px]">{q.guest_name}</p>
                    </div>
                  </div>
                  <span className="text-[10px] lg:text-[11px] font-bold text-slate-600 bg-slate-200 border border-slate-300 px-2.5 py-0.5 rounded shadow-sm shrink-0">
                    {q.service_type === 'Konsultasi Statistik' ? 'M1' : 'M2'}
                  </span>
                </div>
              ))}
              {daftarMenunggu.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum Ada Antrean</p>
                </div>
              )}
            </div>
          </div>

        </section>

        <section className="w-[55%] h-full flex flex-col relative overflow-hidden bg-slate-900">
          
          {!isFullscreen && (
            <button 
              onClick={toggleFullScreen} 
              className="absolute top-4 right-4 lg:top-6 lg:right-6 z-50 p-2.5 bg-black/50 text-white/70 hover:text-white hover:bg-black/70 rounded-lg border border-white/20 backdrop-blur-sm transition-all shadow-lg flex items-center justify-center"
            >
              <Maximize size={20} />
            </button>
          )}

          {isFullscreen && (
            <button 
              onClick={toggleFullScreen} 
              className="absolute top-4 right-4 lg:top-6 lg:right-6 z-50 p-2.5 bg-black/50 text-white/70 hover:text-white hover:bg-black/70 rounded-lg border border-white/20 backdrop-blur-sm transition-all shadow-lg flex items-center justify-center"
            >
              <Minimize size={20} />
            </button>
          )}

          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black min-h-0">
            {mediaList.length > 0 ? (
              mediaList.map((media, index) => (
                <div 
                  key={media.id} 
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentMediaIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                >
                  {media.media_type === 'video' ? (
                    <video 
                      src={media.url} 
                      className="w-full h-full object-cover"
                      autoPlay={index === currentMediaIndex} 
                      muted 
                      playsInline
                      onEnded={handleVideoEnded}
                      style={{ display: index === currentMediaIndex ? 'block' : 'none' }}
                    />
                  ) : (
                    <img src={media.url} alt="Slideshow" className="w-full h-full object-cover" />
                  )}
                </div>
              ))
            ) : (
              <div className="text-slate-500 flex flex-col items-center z-10 text-center px-4">
                <span className="text-lg lg:text-2xl font-bold uppercase tracking-widest mb-2">SLIDESHOW BANNER INFORMASI BPS</span>
                <span className="text-xs">Gambar aktif slide ke-1</span>
              </div>
            )}

            <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 z-30 bg-[#fff5eb] border-2 border-orange-200 p-3 lg:p-4 rounded-xl lg:rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col items-center origin-bottom-right">
              <div className="flex items-center gap-2 mb-2 lg:mb-3">
                <span className="text-orange-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect width="5" height="5" x="7" y="7" rx="1"></rect><rect width="5" height="5" x="12" y="12" rx="1"></rect></svg>
                </span>
                <span className="text-[10px] lg:text-xs font-black text-slate-800 tracking-widest uppercase">SCAN DISINI</span>
              </div>
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white p-2 rounded-lg lg:rounded-xl shadow-inner border border-slate-200 flex items-center justify-center">
                 {qrCodeUrl ? (
                   <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                 ) : (
                   <div className="w-full h-full bg-slate-200 animate-pulse rounded-lg"></div>
                 )}
              </div>
              <p className="text-[8px] lg:text-[10px] font-bold text-orange-600 tracking-widest uppercase mt-2 lg:mt-3">SCAN VIA HP</p>
            </div>
          </div>
          
          <footer className="h-[8vh] min-h-[60px] max-h-[80px] w-full bg-gradient-to-r from-[#003366] to-[#b35900] flex items-center overflow-hidden shrink-0 z-30 shadow-2xl border-t-[3px] border-yellow-500">
            <div className="bg-yellow-500 text-slate-900 h-full flex items-center px-6 lg:px-8 font-black uppercase tracking-widest text-sm lg:text-base z-10 shrink-0 border-r border-yellow-600">
              INFO
            </div>
            <div className="flex-1 whitespace-nowrap overflow-hidden relative h-full flex items-center min-w-0">
              <div className="animate-[marquee_25s_linear_infinite] inline-block">
                <span className="text-[clamp(14px,1.5vw,22px)] font-bold text-white tracking-wider mx-6 lg:mx-8">
                  Selamat Datang di Pelayanan Statistik Terpadu (PST) Badan Pusat Statistik Kota Probolinggo. Siap Melayani dengan Cepat dan Tepat.
                </span>
                <span className="text-[clamp(14px,1.5vw,22px)] font-black text-yellow-400 mx-2 lg:mx-4">
                  •
                </span>
                <span className="text-[clamp(14px,1.5vw,22px)] font-bold text-white tracking-wider mx-6 lg:mx-8">
                  Silakan scan QR Code di layar untuk mengambil nomor antrean melalui HP Anda.
                </span>
              </div>
            </div>
          </footer>

        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
}