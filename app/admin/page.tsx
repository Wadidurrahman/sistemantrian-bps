'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import {
  Volume2,
  CheckCircle,
  RotateCcw,
  Building2,
  Users,
  Clock3,
  Megaphone,
  KeyRound,
  ExternalLink,
  Maximize,
  Minimize
} from 'lucide-react';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');

  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, waiting: 0, finished: 0 });
  const [waktu, setWaktu] = useState<string>('00:00:00');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const CORRECT_PIN = '123456';
  const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('PIN tidak valid.');
    }
  };

  const fetchQueues = async () => {
    const { data: settings } = await supabase
      .from('app_settings')
      .select('last_reset_timestamp')
      .eq('id', 1)
      .single();

    if (settings) {
      const { data } = await supabase
        .from('queues')
        .select('*')
        .gte('created_at', settings.last_reset_timestamp)
        .order('created_at', { ascending: false });

      if (data) {
        setQueues(data);
        setStats({
          total: data.length,
          waiting: data.filter(q => q.status === null || q.status === 'Menunggu').length,
          finished: data.filter(q => q.status === 'Selesai').length
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    // Jam Realtime
    const timer = setInterval(() => {
      setWaktu(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    // Fullscreen Listener
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchQueues();

    const channel = supabase
      .channel('admin-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queues' },
        () => fetchQueues()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn]);

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

  const putarAudioPanggilan = (antrian: any) => {
    const bacaTeks = () => {
      const teks = `Nomor antrian, ${antrian.queue_number}. Atas nama, ${antrian.guest_name}. Menuju loket, ${antrian.service_type}. Terima kasih.`;
      const speech = new SpeechSynthesisUtterance(teks);
      speech.lang = 'id-ID';
      speech.rate = 0.85;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
    };

    const chime = new Audio('/chime.mp3');
    chime.play()
      .then(() => {
        chime.onended = () => bacaTeks();
      })
      .catch((err) => {
        console.warn('Audio diblokir atau tidak ditemukan, memutar suara AI:', err);
        bacaTeks();
      });
  };

  const handlePanggil = async (antrian: any) => {
    await supabase.from('queues').update({ status: 'Dipanggil', called_at: new Date() }).eq('id', antrian.id);
    putarAudioPanggilan(antrian);
  };

  const handlePanggilUlang = (antrian: any) => {
    putarAudioPanggilan(antrian);
  };

  const handleSelesai = async (id: string) => {
    await supabase.from('queues').update({ status: 'Selesai', finished_at: new Date() }).eq('id', id);
  };

  const handleReset = async () => {
    if (confirm('PERINGATAN: Antrian akan kembali ke 01 dan data hari ini direset. Lanjutkan?')) {
      await supabase.from('app_settings').update({ last_reset_timestamp: new Date() }).eq('id', 1);
      fetchQueues();
    }
  };

  const getCurrentDate = () => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    }).format(new Date());
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center justify-center relative overflow-hidden font-sans p-4">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px] pointer-events-none"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

        <div className="w-full max-w-sm px-6 mb-8 relative z-10 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Admin PST</h1>
          <p className="text-orange-50 text-sm font-medium drop-shadow-md">
            Sistem Antrian Pelayanan Statistik Terpadu
          </p>
        </div>

        <div className="w-full max-w-sm bg-[#fdfdfd] rounded-[2rem] px-6 pt-10 pb-8 shadow-[0_15px_40px_rgba(0,0,0,0.4)] relative z-20">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full p-1.5 shadow-[0_8px_20px_rgba(249,115,22,0.15)] border border-orange-50">
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center">
              <KeyRound size={32} className="text-orange-500" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 flex flex-col mt-4">
            <div className="relative group">
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => { setPin(e.target.value); setLoginError(''); }}
                className="w-full rounded-xl border-2 border-slate-100 py-4 px-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 bg-white text-center tracking-[1em] font-mono text-2xl font-bold text-slate-800 transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-sm"
                placeholder="Masukkan PIN"
                maxLength={6}
                autoFocus
              />
              {loginError && <p className="text-red-600 text-xs font-bold mt-2 text-center">{loginError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold py-4 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(249,115,22,0.7)] hover:-translate-y-0.5 active:scale-95 transition-all text-sm tracking-widest uppercase mt-4"
            >
              Masuk
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-full bg-slate-50 font-sans flex flex-col overflow-hidden relative">
      <header className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        <div className="max-w-[1600px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                Panel Operator PST
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                BPS Kota Probolinggo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 border-r border-slate-200 pr-4 mr-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {getCurrentDate()}
              </p>
              <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-black font-mono tracking-widest border border-slate-200">
                {waktu}
              </div>
            </div>
            
            <button
              onClick={toggleFullScreen}
              className="h-10 w-10 flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition-all"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>

            <button
              onClick={handleReset}
              className="h-10 px-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 flex items-center gap-2 font-bold text-[11px] uppercase tracking-widest transition-all"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <a
              href={GOOGLE_SHEETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex items-center gap-2 font-bold text-[11px] uppercase tracking-widest transition-all shadow-[0_4px_14px_rgba(249,115,22,0.4)]"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Buka Sheets</span>
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-6 overflow-hidden max-w-[1600px] w-full mx-auto gap-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="bg-white border-2 border-slate-100 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Tamu</p>
              <p className="text-3xl font-black text-slate-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users size={24} className="text-blue-500" />
            </div>
          </div>

          <div className="bg-white border-2 border-slate-100 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Menunggu</p>
              <p className="text-3xl font-black text-orange-500">{stats.waiting}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <Clock3 size={24} className="text-orange-500" />
            </div>
          </div>

          <div className="bg-white border-2 border-slate-100 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Selesai</p>
              <p className="text-3xl font-black text-emerald-500">{stats.finished}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white border-2 border-slate-100 rounded-[1.5rem] shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Daftar Antrean</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Live</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md border-b-2 border-slate-100">
                <tr>
                  <th className="px-6 py-4 w-24 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">No</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Identitas</th>
                  <th className="px-6 py-4 w-32 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 w-[280px] text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat...</td>
                  </tr>
                ) : queues.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Kosong</td>
                  </tr>
                ) : (
                  queues.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <span className="text-xl font-black text-slate-800">{q.queue_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-extrabold text-slate-800 uppercase tracking-wide truncate">{q.guest_name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mt-0.5">{q.service_type}</p>
                      </td>
                      <td className="px-6 py-4">
                        {q.status === 'Selesai' ? (
                          <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">Selesai</span>
                        ) : q.status === 'Dipanggil' ? (
                          <span className="text-blue-500 font-bold text-[10px] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">Dipanggil</span>
                        ) : (
                          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">Menunggu</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-2">
                          {q.status !== 'Selesai' && (
                            <>
                              {q.status === 'Dipanggil' ? (
                                <button
                                  onClick={() => handlePanggilUlang(q)}
                                  className="h-9 px-4 rounded-xl border-2 border-blue-100 bg-white hover:bg-blue-50 text-blue-600 flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest transition-all"
                                >
                                  <Megaphone size={12} /> Ulangi
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePanggil(q)}
                                  className="h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest transition-all shadow-md shadow-orange-500/20"
                                >
                                  <Volume2 size={12} /> Panggil
                                </button>
                              )}
                              <button
                                onClick={() => handleSelesai(q.id)}
                                className="h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest transition-all shadow-md shadow-slate-800/20"
                              >
                                <CheckCircle size={12} /> Selesai
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}