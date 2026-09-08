'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import LoginScreen from '@/components/admin/LoginScreen';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCards from '@/components/admin/StatsCards';
import QueueTable from '@/components/admin/QueueTable';
import AdminFooter from '@/components/admin/AdminFooter';
import DisplaySettingsModal from '@/components/admin/DisplaySettingsModal';
import { AlertTriangle, X, CheckSquare, Copy, BellRing } from 'lucide-react';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [queues, setQueues] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [waktu, setWaktu] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  const [latestReg, setLatestReg] = useState<any>(null);
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  const [showDisplayModal, setShowDisplayModal] = useState(false);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('bps_admin_auth');
    if (savedAuth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const fetchData = async () => {
    const { data: settings } = await supabase.from('app_settings').select('last_reset_timestamp').eq('id', 1).single();
    const { data: qData } = await supabase.from('queues').select('*').gte('created_at', settings?.last_reset_timestamp || '1970-01-01').order('created_at', { ascending: false });
    if (qData) setQueues(qData);

    const { data: rData } = await supabase.from('registrations').select('*').eq('status', 'Menunggu').order('created_at', { ascending: true });
    if (rData) setRegistrations(rData);
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchData();

    const channelQ = supabase.channel('admin-q').on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, () => fetchData()).subscribe();
    
    const channelR = supabase.channel('admin-r').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'registrations' }, (payload) => {
      fetchData();
      setLatestReg(payload.new);
      setShowNotifPopup(true);
      try {
        const audio = new Audio('/chime.mp3');
        audio.play();
      } catch (e) { console.error(e); }
    }).subscribe();

    const timer = setInterval(() => {
      const now = new Date();
      setWaktu(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);

    return () => { 
      supabase.removeChannel(channelQ); 
      supabase.removeChannel(channelR); 
      clearInterval(timer); 
      document.removeEventListener('fullscreenchange', handleFs);
    };
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '123456') { 
      setIsLoggedIn(true); 
      sessionStorage.setItem('bps_admin_auth', 'true');
      setLoginError(''); 
    } else { 
      setLoginError('PIN yang Anda masukkan salah!'); 
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('bps_admin_auth');
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

    ([...queues]).reverse().forEach((q, index) => {
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

  const copyAllPayload = (payload: any, id: string) => {
    const formattedText = Object.entries(payload || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    
    navigator.clipboard.writeText(formattedText);
    setCopiedStatus(id);
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleKonfirmasiRegistrasi = async (id: string) => {
    await supabase.from('registrations').update({ status: 'Selesai' }).eq('id', id);
    setRegistrations(prev => prev.filter(r => r.id !== id));
    setShowNotifPopup(false);
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
            
          const textToSpeak = `Perhatian kepada Nomor antrean, ${q.queue_number}. Atas nama, ${q.guest_name}. Silakan menuju, ${layananSuara}. Terima kasih.`;
          
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
        onOpenSettings={() => setShowDisplayModal(true)}
        onLogout={handleLogout} 
      />

      <main className="flex-1 w-full px-6 py-4 flex flex-col gap-3 overflow-hidden max-w-[1600px] mx-auto">
        <StatsCards stats={statsObj} />

        {registrations.length > 0 && (
          <div className="bg-white border border-slate-300 rounded-sm shadow-sm shrink-0">
            <div className="bg-blue-900 text-white px-4 py-2 flex items-center justify-between">
              <h2 className="font-bold uppercase text-[11px] tracking-widest flex items-center gap-2">
                <BellRing size={14} className="text-orange-400 animate-bounce" />
                Data Masuk (Data Bridge) - {registrations.length} Pengajuan Menunggu Sinkronisasi
              </h2>
            </div>
            
            <div className="p-3 max-h-36 overflow-y-auto grid gap-2">
              {registrations.map(reg => {
                const isCopied = copiedStatus === reg.id;
                return (
                  <div key={reg.id} className="border border-slate-200 bg-slate-50 px-4 py-2 rounded-sm flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-xs text-blue-900 uppercase mr-3">[{reg.form_type}]</span>
                      <span className="text-xs text-slate-700 font-medium">
                        {Object.entries(reg.payload || {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' | ')} ...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => copyAllPayload(reg.payload, reg.id)}
                        className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ${isCopied ? 'bg-emerald-600 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white'}`}
                      >
                        <Copy size={12} /> {isCopied ? 'Tersalin (Siap Paste)' : 'Salin Sekali Klik'}
                      </button>
                      <button 
                        onClick={() => handleKonfirmasiRegistrasi(reg.id)}
                        className="px-3 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                      >
                        <CheckSquare size={12} /> Selesai
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

      <DisplaySettingsModal 
        isOpen={showDisplayModal} 
        onClose={() => setShowDisplayModal(false)} 
      />

      {showNotifPopup && latestReg && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl border border-slate-300 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 px-5 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                <BellRing size={16} className="text-orange-400 animate-bounce" /> Pengajuan Tamu Baru Masuk!
              </div>
              <button onClick={() => setShowNotifPopup(false)} className="text-white/80 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold text-orange-600 uppercase mb-3">Tipe Form: {latestReg.form_type}</p>
              <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 mb-4 max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs">
                {Object.entries(latestReg.payload || {}).map(([k, v]: [string, any]) => (
                  <div key={k} className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="font-bold text-slate-500">{k}:</span>
                    <span className="text-slate-800 font-semibold">{v || '-'}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mb-6 italic">
                *Klik tombol di bawah untuk menyalin seluruh data secara otomatis. Setelah itu Anda tinggal klik kanan dan Paste (Ctrl+V) ke form web internal BPS.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowNotifPopup(false)}
                  className="px-4 py-2 rounded-sm border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Tutup / Nanti
                </button>
                <button 
                  onClick={() => {
                    copyAllPayload(latestReg.payload, latestReg.id);
                    handleKonfirmasiRegistrasi(latestReg.id);
                  }}
                  className="px-5 py-2 rounded-sm bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Copy size={14} /> Salin Otomatis & Selesaikan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
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
                Yakin ingin mereset antrean hari ini? Data lama tetap aman tersimpan di database dan dapat di-export kapan saja melalui tombol <span className="font-bold text-slate-900">Export Excel</span>.
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