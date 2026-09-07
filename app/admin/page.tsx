'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

import LoginScreen from '@/components/admin/LoginScreen';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCards from '@/components/admin/StatsCards';
import QueueTable from '@/components/admin/QueueTable';
import AdminFooter from '@/components/admin/AdminFooter';

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
    const { data: settings } = await supabase.from('app_settings').select('last_reset_timestamp').eq('id', 1).single();
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
    const timer = setInterval(() => {
      setWaktu(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, () => fetchQueues())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isLoggedIn]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
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

    // Menggunakan URL Supabase Storage untuk chime.mp3
    const chimeUrl = "https://ffljuwtbdszmarcokmvh.supabase.co/storage/v1/object/public/display-media/chime.mp3";
    const chime = new Audio(chimeUrl);
    
    chime.play().then(() => { 
      chime.onended = () => bacaTeks(); 
    }).catch(() => {
      bacaTeks();
    });
  };

  const handlePanggil = async (antrian: any) => {
    await supabase.from('queues').update({ status: 'Dipanggil', called_at: new Date() }).eq('id', antrian.id);
    putarAudioPanggilan(antrian);
  };

  const handlePanggilUlang = (antrian: any) => putarAudioPanggilan(antrian);

  const handleSelesai = async (id: string) => {
    await supabase.from('queues').update({ status: 'Selesai', finished_at: new Date() }).eq('id', id);
  };

  const handleReset = async () => {
    if (confirm('PERINGATAN: Antrian akan kembali ke 01 dan data hari ini direset. Lanjutkan?')) {
      await supabase.from('app_settings').update({ last_reset_timestamp: new Date() }).eq('id', 1);
      fetchQueues();
    }
  };

  const handleExportCSV = () => {
    if (queues.length === 0) return alert('Belum ada data antrean.');
    const separator = ';';
    const headers = ['Nomor Antrian', 'Nama Tamu', 'Layanan', 'Status', 'Waktu Masuk', 'Waktu Selesai'];
    const csvData = queues.map(q => {
      const formatWaktu = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleString('id-ID').replace(/\./g, ':') : '-';
      return [q.queue_number, `"${q.guest_name.replace(/"/g, '""')}"`, `"${q.service_type}"`, q.status || 'Menunggu', `"${formatWaktu(q.created_at)}"`, `"${formatWaktu(q.finished_at)}"`];
    });
    const csvContent = '\uFEFF' + [headers.join(separator), ...csvData.map(row => row.join(separator))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Rekap_Antrean_PST_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCurrentDate = () => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());

  if (!isLoggedIn) {
    return <LoginScreen pin={pin} setPin={setPin} loginError={loginError} setLoginError={setLoginError} handleLogin={handleLogin} />;
  }

  return (
    <main className="h-screen w-full bg-slate-50 font-sans flex flex-col overflow-hidden relative">
      <AdminHeader waktu={waktu} isFullscreen={isFullscreen} toggleFullScreen={toggleFullScreen} handleReset={handleReset} handleExportCSV={handleExportCSV} getCurrentDate={getCurrentDate} />
      
      <div className="flex-1 flex flex-col p-6 overflow-hidden max-w-[1600px] w-full mx-auto gap-6 relative">
        <StatsCards stats={stats} />
        <QueueTable loading={loading} queues={queues} handlePanggil={handlePanggil} handlePanggilUlang={handlePanggilUlang} handleSelesai={handleSelesai} />
      </div>

      <AdminFooter />
    </main>
  );
}