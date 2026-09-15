'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import LoginScreen from '@/components/admin/LoginScreen';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCards from '@/components/admin/StatsCards';
import QueueTable from '@/components/admin/QueueTable';
import AdminFooter from '@/components/admin/AdminFooter';
import DisplaySettingsModal from '@/components/admin/DisplaySettingsModal';
import DataMasukModal from '@/components/admin/DataMasukModal';
import HistoryAntreanModal from '@/components/admin/HistoryAntreanModal';
import { AlertTriangle, X, Filter, Calendar, ChevronDown, MoveRight } from 'lucide-react';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [queues, setQueues] = useState<any[]>([]);
  const [bukuTamu, setBukuTamu] = useState<any[]>([]);
  const [waktu, setWaktu] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDisplayModal, setShowDisplayModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [needsBackup, setNeedsBackup] = useState(false);

  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredQueues, setFilteredQueues] = useState<any[]>([]);
  const [filteredBukuTamu, setFilteredBukuTamu] = useState<any[]>([]);

  // State baru untuk alert "Data Masuk"
  const [showNewDataAlert, setShowNewDataAlert] = useState(false);
  const previousBukuTamuLength = useRef(0);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('bps_admin_auth');
    if (savedAuth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const fetchBackupStatus = async () => {
    const { data: settings } = await supabase.from('app_settings').select('last_backup_timestamp').eq('id', 1).single();
    if (settings?.last_backup_timestamp) {
      const backupDate = new Date(settings.last_backup_timestamp);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - backupDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 14) {
        setNeedsBackup(true);
      }
    } else {
      await supabase.from('app_settings').update({ last_backup_timestamp: new Date().toISOString() }).eq('id', 1);
    }
  };

  const fetchData = async (isInitial = false) => {
    const { data: settings } = await supabase.from('app_settings').select('last_reset_timestamp').eq('id', 1).single();
    const minTime = settings?.last_reset_timestamp || '1970-01-01';

    const { data: qData } = await supabase.from('queues').select('*').gte('created_at', minTime).order('created_at', { ascending: false });
    if (qData) setQueues(qData);

    const { data: bData } = await supabase.from('buku_tamu').select('*').gte('created_at', minTime).order('created_at', { ascending: false });
    if (bData) {
      setBukuTamu(bData);
      
      // Deteksi tamu baru setelah load pertama
      if (!isInitial && bData.length > previousBukuTamuLength.current && !showDataModal) {
         setShowNewDataAlert(true);
      }
      previousBukuTamuLength.current = bData.length;
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchData(true);
    fetchBackupStatus();

    const channelQ = supabase.channel('admin-q').on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, () => fetchData()).subscribe();
    const channelB = supabase.channel('admin-buku-tamu').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'buku_tamu' }, () => fetchData()).subscribe();

    const timer = setInterval(() => {
      const now = new Date();
      setWaktu(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);

    return () => { 
      supabase.removeChannel(channelQ); 
      supabase.removeChannel(channelB); 
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
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(() => {}); } 
    else { if (document.exitFullscreen) document.exitFullscreen(); }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const executeReset = async () => {
    const now = new Date().toISOString();
    await supabase.from('app_settings').update({ last_reset_timestamp: now }).eq('id', 1);
    setQueues([]);
    setBukuTamu([]);
    setShowResetModal(false);
  };

  const handleApplyFilter = async () => {
    if (!filterStart || !filterEnd) return alert('Silakan pilih rentang waktu awal dan akhir.');
    setLoadingFilter(true);
    
    const { data: qData } = await supabase.from('queues').select('*').gte('created_at', new Date(filterStart).toISOString()).lte('created_at', new Date(filterEnd).toISOString()).order('created_at', { ascending: false });
    const { data: bData } = await supabase.from('buku_tamu').select('*').gte('created_at', new Date(filterStart).toISOString()).lte('created_at', new Date(filterEnd).toISOString()).order('created_at', { ascending: false });
    
    setFilteredQueues(qData || []);
    setFilteredBukuTamu(bData || []);
    setIsFiltered(true);
    setLoadingFilter(false);
    setShowDatePicker(false);
  };

  const handleResetFilter = () => {
    setIsFiltered(false);
    setFilterStart('');
    setFilterEnd('');
    setShowDatePicker(false);
  };

  const formatRangeDisplay = () => {
    if (!filterStart || !filterEnd || !isFiltered) return 'PILIH RENTANG WAKTU';
    const start = new Date(filterStart).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    const end = new Date(filterEnd).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    return `${start} - ${end}`;
  };

  const handleExportExcel = async (isMandatoryBackup = false) => {
    let exportQueues = [];
    let exportBukuTamu = [];

    if (isMandatoryBackup || !isFiltered) {
      const { data: settings } = await supabase.from('app_settings').select('last_backup_timestamp').eq('id', 1).single();
      const minTime = settings?.last_backup_timestamp || new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

      const { data: q } = await supabase.from('queues').select('*').gte('created_at', minTime).order('created_at', { ascending: false });
      const { data: b } = await supabase.from('buku_tamu').select('*').gte('created_at', minTime).order('created_at', { ascending: false });
      
      exportQueues = q || [];
      exportBukuTamu = b || [];
    } else {
      exportQueues = filteredQueues;
      exportBukuTamu = filteredBukuTamu;
    }

    if (exportQueues.length === 0 && exportBukuTamu.length === 0) {
      alert('Belum ada data untuk di-export.');
      return;
    }

    let table = '<table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">';
    
    // TABEL 1: PST (Tanpa Rating)
    table += '<thead>';
    table += '<tr><th colspan="7" style="font-size: 16px; font-weight: bold; padding: 15px; text-align: center; background-color: #f8f9fa;">LAPORAN PELAYANAN STATISTIK TERPADU (PST) - BPS KOTA PROBOLINGGO</th></tr>';
    table += '<tr style="background-color: #1e3a8a; color: white; font-weight: bold;">';
    ['No', 'Nomor Antrean', 'Nama Tamu', 'Layanan', 'Meja Layanan', 'Status', 'Waktu Masuk'].forEach(h => { 
      table += `<th style="padding: 10px; border: 1px solid #000;">${h}</th>` 
    });
    table += '</tr></thead><tbody>';

    (exportQueues || []).reverse().forEach((q, index) => {
      const meja = q.service_type === 'Konsultasi Statistik' ? 'Meja 1' : 'Meja 2';
      const wMasuk = new Date(q.created_at).toLocaleTimeString('id-ID');
      
      table += '<tr>';
      table += `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${index + 1}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000; text-align: center; font-weight: bold;">${q.queue_number}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000;">${q.guest_name || '-'}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000;">${q.service_type || '-'}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${meja}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${q.status || 'Menunggu'}</td>`;
      table += `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${wMasuk}</td>`;
      table += '</tr>';
    });
    table += '</tbody>';

    // TABEL 2: BUKU TAMU (Dengan Fix Nomor HP)
    table += '<thead><tr><td colspan="7" style="border: none; height: 30px;"></td></tr>';
    table += '<tr><th colspan="7" style="font-size: 14px; font-weight: bold; padding: 12px; text-align: center; background-color: #e2e8f0; border: 1px solid #000;">DATA BUKU TAMU PENGUNJUNG</th></tr>';
    table += '<tr style="background-color: #0f172a; color: white; font-weight: bold;">';
    ['No', 'Nama Tamu', 'Instansi/Asal', 'Tujuan', 'Keperluan', 'Kontak', 'Waktu Kunjungan'].forEach((h) => {
      table += `<th style="padding: 10px; border: 1px solid #000;">${h}</th>`;
    });
    table += '</tr></thead><tbody>';

    if (exportBukuTamu && exportBukuTamu.length > 0) {
      exportBukuTamu.forEach((b, idx) => {
        table += '<tr>';
        table += `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${idx + 1}</td>`;
        table += `<td style="padding: 8px; border: 1px solid #000;">${b.nama || '-'}</td>`;
        table += `<td style="padding: 8px; border: 1px solid #000;">${b.instansi || '-'}</td>`;
        table += `<td style="padding: 8px; border: 1px solid #000;">${b.tujuan || '-'}</td>`;
        table += `<td style="padding: 8px; border: 1px solid #000;">${b.keperluan || '-'}</td>`;
        // FIX NOMOR HP: Ditambah tanda kutip tunggal di awal
        table += `<td style="padding: 8px; border: 1px solid #000; mso-number-format:'\\@';">'${b.kontak || '-'}</td>`;
        table += `<td style="padding: 8px; border: 1px solid #000; text-align: center;">${new Date(b.created_at).toLocaleString('id-ID')}</td>`;
        table += '</tr>';
      });
    } else {
      table += '<tr><td colspan="7" style="padding: 10px; text-align: center; border: 1px solid #000;">Belum ada data buku tamu.</td></tr>';
    }

    table += '</tbody></table>';

    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    const filterTag = isFiltered ? `_Filtered` : '';
    link.setAttribute('download', `Laporan_PST_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}${filterTag}.xls`);
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);

    if (isMandatoryBackup === true) {
      await supabase.from('app_settings').update({ last_backup_timestamp: new Date().toISOString() }).eq('id', 1);
      setNeedsBackup(false);
      alert('Backup berhasil diamankan! Layar operasional telah dibuka kembali.');
    }
  };

  const playAudioAndSpeak = (q: any) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      const audio = new Audio('/chime.mp3');
      audio.volume = 1.0;
      audio.play().catch(() => {});

      audio.onended = () => {
        if ('speechSynthesis' in window) {
          const layananSuara = q.service_type === 'Konsultasi Statistik' ? 'Meja Konsultasi Statistik' : 'Meja Pelayanan Pengaduan';
          const textToSpeak = `Perhatian kepada Nomor antrean, ${q.queue_number}. Atas nama, ${q.guest_name}. Silakan menuju, ${layananSuara}. Terima kasih.`;
          
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = 'id-ID';
          utterance.rate = 0.85;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          window.speechSynthesis.speak(utterance);
        }
      };
    } catch (e) {}
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

  const displayQueues = isFiltered ? filteredQueues : queues;
  const displayBukuTamu = isFiltered ? filteredBukuTamu : bukuTamu;

  const statsObj = {
    total: displayQueues.length,
    waiting: displayQueues.filter(q => q.status !== 'Selesai' && q.status !== 'Dipanggil').length,
    finished: displayQueues.filter(q => q.status === 'Selesai').length,
  };

  const ksCount = displayQueues.filter(q => q.service_type === 'Konsultasi Statistik').length;
  const pgCount = displayQueues.filter(q => q.service_type === 'Pelayanan Pengaduan').length;
  const maxCount = Math.max(ksCount, pgCount, 1);

  return (
    <div className="h-screen flex flex-col bg-[#ecf0f5] font-sans overflow-hidden relative">
      
      {/* OVERLAY SPOTLIGHT: Ditampilkan saat ada data masuk */}
      {showNewDataAlert && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] transition-opacity duration-300"
          onClick={() => setShowNewDataAlert(false)}
        >
           {/* Teks Peringatan Melayang yang menunjuk ke kanan atas */}
           <div className="absolute top-[160px] right-[40px] flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="bg-white px-4 py-2 rounded-lg shadow-xl border-l-4 border-indigo-600 text-slate-800 font-bold text-sm">
                 Ada data tamu baru, <span className="text-indigo-600">mohon dicek!</span>
              </div>
              <MoveRight size={32} className="text-white animate-pulse" />
           </div>
        </div>
      )}

      {needsBackup && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-slate-200 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Wajib Backup Data!</h2>
            <p className="text-sm font-medium text-slate-600 mb-8 leading-relaxed">
              Sudah mencapai batas 14 hari sejak backup terakhir. Untuk mencegah hilangnya history dan penumpukan data, 
              sistem mengunci layar operasional. Anda <span className="font-bold text-red-600">wajib</span> mengunduh laporan Excel sekarang.
            </p>
            <button 
              onClick={() => handleExportExcel(true)}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
            >
              Unduh Backup Excel (2 Minggu)
            </button>
          </div>
        </div>
      )}

      <AdminHeader 
        waktu={waktu} 
        isFullscreen={isFullscreen} 
        toggleFullScreen={toggleFullScreen} 
        handleReset={() => setShowResetModal(true)} 
        handleExportCSV={() => handleExportExcel(false)} 
        getCurrentDate={getCurrentDate} 
        onOpenSettings={() => setShowDisplayModal(true)}
        onLogout={handleLogout} 
      />

      <main className="flex-1 w-full px-6 py-4 flex flex-col gap-3 overflow-hidden max-w-[1600px] mx-auto relative z-10">
        
        <StatsCards 
          stats={statsObj} 
          registrationsCount={displayBukuTamu.length}
          onOpenDataMasuk={() => {
            setShowDataModal(true);
            setShowNewDataAlert(false); // Tutup alert jika modal data dibuka
          }}
          isHighlight={showNewDataAlert} // Mengirim state ke komponen Card
        />

        <div className="flex-1 flex gap-3 overflow-hidden">
          <QueueTable 
            queues={queues} 
            loading={false}
            handlePanggil={handlePanggil}
            handlePanggilUlang={handlePanggilUlang}
            handleSelesai={handleSelesai}
            onOpenHistory={() => setShowHistoryModal(true)}
          />
          
          <div className="w-72 bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0 relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Filter size={12} className="text-blue-600"/> Statistik
                </h3>
                {isFiltered && (
                  <button 
                    onClick={handleResetFilter} 
                    className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider hover:bg-slate-300 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full flex items-center justify-between bg-white border border-slate-300 px-3 py-2 rounded-sm text-[10px] font-bold text-slate-700 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-slate-400" />
                  <span>{formatRangeDisplay()}</span>
                </div>
                <ChevronDown size={12} className="text-slate-400" />
              </button>

              {showDatePicker && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 shadow-xl rounded-sm p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex flex-col gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Waktu Mulai</label>
                      <input 
                        type="datetime-local" 
                        value={filterStart} 
                        onChange={e => setFilterStart(e.target.value)} 
                        className="w-full text-[10px] p-1.5 border border-slate-300 rounded-sm focus:outline-none focus:border-blue-900 mt-1 bg-slate-50" 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Waktu Akhir</label>
                      <input 
                        type="datetime-local" 
                        value={filterEnd} 
                        onChange={e => setFilterEnd(e.target.value)} 
                        className="w-full text-[10px] p-1.5 border border-slate-300 rounded-sm focus:outline-none focus:border-blue-900 mt-1 bg-slate-50" 
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button 
                        onClick={() => setShowDatePicker(false)}
                        className="flex-1 bg-slate-100 text-slate-600 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-slate-200 transition-colors"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={handleApplyFilter} 
                        disabled={loadingFilter} 
                        className="flex-1 bg-blue-900 text-white py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-blue-800 transition-colors disabled:opacity-70"
                      >
                        {loadingFilter ? 'Proses...' : 'Terapkan'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 flex flex-col justify-end gap-4 min-h-0">
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

      <DataMasukModal 
        isOpen={showDataModal} 
        onClose={() => setShowDataModal(false)} 
        registrations={displayBukuTamu} 
      />

      <HistoryAntreanModal 
        isOpen={showHistoryModal} 
        onClose={() => setShowHistoryModal(false)} 
        queues={displayQueues} 
      />

      {showResetModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
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