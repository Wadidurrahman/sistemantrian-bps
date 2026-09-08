'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import LoginScreen from '@/components/admin/LoginScreen';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCards from '@/components/admin/StatsCards';
import QueueTable from '@/components/admin/QueueTable';
import AdminFooter from '@/components/admin/AdminFooter';
import { AlertTriangle, X } from 'lucide-react';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [queues, setQueues] = useState<any[]>([]);
  const [waktu, setWaktu] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const fetchData = async () => {
    const { data: settings } = await supabase.from('app_settings').select('last_reset_timestamp').eq('id', 1).single();
    const { data: qData } = await supabase.from('queues').select('*').gte('created_at', settings?.last_reset_timestamp || '1970-01-01').order('created_at', { ascending: false });
    if (qData) setQueues(qData);
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchData();

    const channelQ = supabase.channel('admin-q').on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, () => fetchData()).subscribe();

    const timer = setInterval(() => {
      const now = new Date();
      setWaktu(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);

    return () => { 
      supabase.removeChannel(channelQ); 
      clearInterval(timer); 
      document.removeEventListener('fullscreenchange', handleFs);
    };
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '123456') { setIsLoggedIn(true); setLoginError(''); } 
    else { setLoginError('PIN yang Anda masukkan salah!'); }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(err => console.error(err)); } 
    else { if (document.exitFullscreen) document.exitFullscreen(); }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const executeReset = async () => {
    const now = new Date().toISOString();
    await supabase.from('app_settings').update({ last_reset_timestamp: now }).eq('id', 1);
    setQueues([]);
    setShowResetModal(false);
  };

  const handleExportExcel = () => {
    if (queues.length === 0) return alert('Belum ada data antrean.');
    
    let table = '<table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">';
    table += '<thead>';
    table += '<tr><th colspan="8" style="font-size: 16px; font-weight: bold; padding: 15px; text-align: center; background-color: #f8f9fa;">LAPORAN PELAYANAN STATISTIK TERPADU (PST) - BPS KOTA PROBOLINGGO</th></tr>';
    table += '<tr style="background-color: #1e3a8a; color: white; font-weight: bold;">';
    ['No', 'Nomor Antrean', 'Nama Tamu', 'Layanan', 'Meja Layanan', 'Status', 'Waktu Masuk', 'Bintang Pelayanan'].forEach(h => { 
      table += `<th style="padding: 10px; border: 1px solid #000;">${h}</th>` 
    });
    table += '</tr></thead><tbody>';

    [...queues].reverse().forEach((q, index) => {
      const meja = q.service_type === 'Konsultasi Statistik' ? 'Meja 1' : 'Meja 2';
      const wMasuk = new Date(q.created_at).toLocaleTimeString('id-ID');
      const bintang = q.status === 'Selesai' ? '⭐⭐⭐⭐⭐' : 'Belum Selesai';
      
      table += '<tr>';
      table += `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${index + 1}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000; text-align: center; font-weight: bold;">${q.queue_number}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000;">${q.guest_name}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000;">${q.service_type}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${meja}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${q.status || 'Menunggu'}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${wMasuk}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000; text-align: center; color: #eab308; font-size: 14px;">${bintang}</td>`;
      table += '</tr>';
    });
    
    table += '</tbody></table>';

    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Laporan_PST_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.xls`);
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
  };

  const playAudioAndSpeak = (q: any) => {
    try {
      const audio = new Audio('/chime.mp3');
      audio.play();

      audio.onended = () => {
        if ('speechSynthesis' in window) {
          const layananSuara = q.service_type === 'Konsultasi Statistik' 
            ? 'Meja Konsultasi Statistik' 
            : 'Meja Pelayanan Pengaduan';
            
          const textToSpeak = `Nomor antrean, ${q.queue_number}. Atas nama, ${q.guest_name}. Silakan menuju, ${layananSuara}.`;
          
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = 'id-ID';
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      };
    } catch (e) { 
      console.error("Audio error", e);
    }
  };

  const handlePanggil = async (q: any) => {
    playAudioAndSpeak(q);
    await supabase.from('queues').update({ status: 'Dipanggil', called_at: new Date().toISOString() }).eq('id', q.id);
  };
  
  const handlePanggilUlang = async (q: any) => {
    playAudioAndSpeak(q);
    await supabase.from('queues').update({ called_at: new Date().toISOString() }).eq('id', q.id);
  };
  
  const handleSelesai = async (id: string) => {
    await supabase.from('queues').update({ status: 'Selesai' }).eq('id', id);
  };

  if (!isLoggedIn) {
    return <LoginScreen pin={pin} setPin={setPin} loginError={loginError} setLoginError={setLoginError} handleLogin={handleLogin} />;
  }

  const statsObj = {
    total: queues.length,
    waiting: queues.filter(q => q.status !== 'Selesai' && q.status !== 'Dipanggil').length,
    finished: queues.filter(q => q.status === 'Selesai').length,
  };

  const ksCount = queues.filter(q => q.service_type === 'Konsultasi Statistik').length;
  const pgCount = queues.filter(q => q.service_type === 'Pelayanan Pengaduan').length;
  const maxCount = Math.max(ksCount, pgCount, 1);

  return (
    <div className="h-screen flex flex-col bg-[#ecf0f5] font-sans overflow-hidden relative">
      <AdminHeader 
        waktu={waktu} 
        isFullscreen={isFullscreen} 
        toggleFullScreen={toggleFullScreen} 
        handleReset={() => setShowResetModal(true)} 
        handleExportCSV={handleExportExcel} 
        getCurrentDate={getCurrentDate} 
        onLogout={() => setIsLoggedIn(false)} 
      />

      <main className="flex-1 w-full px-6 py-4 flex flex-col gap-3 overflow-hidden max-w-[1600px] mx-auto">
        <StatsCards stats={statsObj} />

        <div className="flex-1 flex gap-3 overflow-hidden">
          <QueueTable 
            queues={queues} 
            loading={false}
            handlePanggil={handlePanggil}
            handlePanggilUlang={handlePanggilUlang}
            handleSelesai={handleSelesai}
          />
          
          <div className="w-72 bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col shrink-0">
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Statistik Layanan</h3>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-end gap-4">
              <div className="flex flex-col gap-2 h-full justify-end">
                <div className="flex items-end gap-6 h-40 border-b-2 border-l-2 border-slate-200 pl-4 pb-0 relative">
                  <div className="absolute -left-2 top-0 text-[9px] text-slate-400 font-bold">{maxCount}</div>
                  
                  <div className="flex-1 flex flex-col justify-end items-center group">
                    <span className="text-[10px] font-bold text-slate-600 mb-1">{ksCount}</span>
                    <div className="w-full bg-[#0073b7] rounded-t-sm transition-all" style={{ height: `${(ksCount/maxCount)*100}%`, minHeight: '4px' }}></div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-end items-center group">
                    <span className="text-[10px] font-bold text-slate-600 mb-1">{pgCount}</span>
                    <div className="w-full bg-[#f39c12] rounded-t-sm transition-all" style={{ height: `${(pgCount/maxCount)*100}%`, minHeight: '4px' }}></div>
                  </div>
                </div>
                <div className="flex justify-between px-2 text-[9px] font-bold text-slate-500 uppercase text-center gap-2 mt-2">
                  <span className="flex-1">Konsultasi</span>
                  <span className="flex-1">Pengaduan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <AdminFooter />

      {/* MODAL KONFIRMASI KUSTOM (MENGGANTIKAN ALERT/CONFIRM BROWSER) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-amber-500 px-5 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                <AlertTriangle size={16} /> Konfirmasi Reset Antrean
              </div>
              <button onClick={() => setShowResetModal(false)} className="text-white/80 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                Yakin ingin mereset antrean hari ini? Data lama tetap aman tersimpan di database dan dapat di-export kapan saja melalui tombol <span className="font-bold text-slate-900">Export Excel</span>. Layar operator akan dibersihkan untuk memulai sesi baru.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-sm border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={executeReset}
                  className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Ya, Reset Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}