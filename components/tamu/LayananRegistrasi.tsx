'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { ArrowLeft, User, Users, Briefcase, Loader2, CheckCircle2 } from 'lucide-react';

export default function LayananRegistrasi({ onBack }: { onBack: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'pilih' | 'individu' | 'group' | 'lainnya' | 'waiting' | 'success'>('pilih');
  const [isLoading, setIsLoading] = useState(false);
  const [regId, setRegId] = useState<string | null>(null);

  const [indData, setIndData] = useState({
    'Nama Lengkap': '', 'Email': '', 'No Telepon': '+62', 'Jenis Kelamin': 'Laki-laki',
    'Tahun Lahir': '', 'Provinsi': '', 'Kabupaten/Kota': '', 'Pekerjaan': '',
    'Pendidikan Tertinggi': '', 'Kategori Institusi': '', 'Disabilitas': 'Tidak', 'Password Akun': ''
  });

  const [grpData, setGrpData] = useState({
    'Nama Ketua Group': '', 'Email': '', 'Kategori Instansi': 'Pemerintah Daerah',
    'Nama Instansi': '', 'Jumlah Orang': ''
  });

  const [lainData, setLainData] = useState({
    'Nama Lengkap': '', 'Keperluan Khusus': '', 'Keterangan Tambahan': ''
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (view === 'waiting' && regId) {
      const channel = supabase.channel('cek-status-registrasi')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'registrations', filter: `id=eq.${regId}` }, (payload) => {
          if (payload.new.status === 'Selesai') {
            setView('success');
            if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 500]);
          }
        }).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [view, regId]);

  const handleSubmit = async (e: React.FormEvent, type: 'Individu' | 'Group' | 'Layanan Lain') => {
    e.preventDefault();
    setIsLoading(true);
    let payload = indData;
    if (type === 'Group') payload = grpData;
    if (type === 'Layanan Lain') payload = lainData;

    try {
      const { data, error } = await supabase.from('registrations').insert([{ form_type: type, payload: payload }]).select().single();
      if (!error && data) { setRegId(data.id); setView('waiting'); }
    } finally { setIsLoading(false); }
  };

  const getTitle = () => {
    if (view === 'individu') return 'Sahabat Data';
    if (view === 'group') return 'Group';
    if (view === 'lainnya') return 'Layanan Lain';
    if (view === 'waiting' || view === 'success') return 'Status';
    return 'Registrasi';
  };

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center relative overflow-x-hidden font-sans sm:justify-center">
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

      <div className={`w-full max-w-sm px-6 pt-12 pb-24 relative z-10 text-left transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
        <button onClick={view === 'pilih' || view === 'waiting' || view === 'success' ? onBack : () => setView('pilih')} className="flex items-center gap-2 text-white/90 hover:text-white font-bold text-sm mb-4">
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">{getTitle()}</h1>
        <p className="text-orange-50 text-sm font-medium leading-relaxed drop-shadow-md">
          Pendaftaran layanan dan kunjungan BPS.
        </p>
      </div>

      <div className={`w-full max-w-sm bg-[#fdfdfd] sm:rounded-[2rem] rounded-t-[2rem] px-6 pt-14 pb-8 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.4)] relative z-20 flex-1 sm:flex-none sm:mb-8 -mt-16 transition-all duration-700 delay-150 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full p-1.5 shadow-[0_8px_20px_rgba(249,115,22,0.15)] border border-orange-50">
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/logoBPS.jpg" alt="Logo" className="h-10 w-auto object-contain" />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[65vh] pb-4 px-1 custom-scrollbar">
          {view === 'waiting' && (
            <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
              <Loader2 size={60} className="text-orange-500 animate-spin" />
              <h2 className="text-xl font-black text-slate-800">Sedang Diproses</h2>
              <p className="text-slate-500 text-sm text-center font-medium">Petugas sedang menyalin data Anda.<br/>Mohon tunggu sebentar...</p>
            </div>
          )}

          {view === 'success' && (
            <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
              <CheckCircle2 size={70} className="text-orange-500" />
              <h2 className="text-xl font-black text-slate-800">Selesai!</h2>
              <p className="text-slate-500 text-sm text-center font-medium">Petugas telah memproses data Anda.</p>
              <button onClick={onBack} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl mt-4 text-sm tracking-widest uppercase shadow-lg">Kembali ke Beranda</button>
            </div>
          )}

          {view === 'pilih' && (
            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">PILIH KATEGORI</label>
              <div className="flex flex-col gap-3">
                <button onClick={() => setView('individu')} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 bg-white text-slate-600 hover:border-orange-500 hover:bg-orange-50/50 shadow-sm text-left">
                  <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600"><User size={18} /></div>
                  <div><p className="font-bold text-sm text-slate-800">Individu</p><p className="text-[10px] text-slate-500">Akun SSO personal.</p></div>
                </button>
                <button onClick={() => setView('group')} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 bg-white text-slate-600 hover:border-orange-500 hover:bg-orange-50/50 shadow-sm text-left">
                  <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600"><Users size={18} /></div>
                  <div><p className="font-bold text-sm text-slate-800">Group</p><p className="text-[10px] text-slate-500">Rombongan/Instansi.</p></div>
                </button>
                <button onClick={() => setView('lainnya')} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 bg-white text-slate-600 hover:border-orange-500 hover:bg-orange-50/50 shadow-sm text-left">
                  <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600"><Briefcase size={18} /></div>
                  <div><p className="font-bold text-sm text-slate-800">Layanan Ke-3</p><p className="text-[10px] text-slate-500">Form lainnya.</p></div>
                </button>
              </div>
            </div>
          )}

          {view === 'individu' && (
            <form onSubmit={(e) => handleSubmit(e, 'Individu')} className="grid grid-cols-1 gap-3 pt-2">
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Nama Lengkap</label><input required name="Nama Lengkap" onChange={(e) => setIndData({...indData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Email</label><input type="email" required name="Email" onChange={(e) => setIndData({...indData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] font-bold text-slate-500 uppercase">No Telepon</label><input required name="No Telepon" value={indData['No Telepon']} onChange={(e) => setIndData({...indData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
                <div><label className="text-[11px] font-bold text-slate-500 uppercase">Tahun Lahir</label><input required name="Tahun Lahir" type="number" onChange={(e) => setIndData({...indData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] font-bold text-slate-500 uppercase">Gender</label><select name="Jenis Kelamin" onChange={(e) => setIndData({...indData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800"><option>Laki-laki</option><option>Perempuan</option></select></div>
                <div><label className="text-[11px] font-bold text-slate-500 uppercase">Disabilitas</label><select name="Disabilitas" onChange={(e) => setIndData({...indData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800"><option>Tidak</option><option>Ya</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] font-bold text-slate-500 uppercase">Provinsi</label><input required name="Provinsi" onChange={(e) => setIndData({...indData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
                <div><label className="text-[11px] font-bold text-slate-500 uppercase">Kab/Kota</label><input required name="Kabupaten/Kota" onChange={(e) => setIndData({...indData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] font-bold text-slate-500 uppercase">Pekerjaan</label><input required name="Pekerjaan" onChange={(e) => setIndData({...indData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
                <div><label className="text-[11px] font-bold text-slate-500 uppercase">Pendidikan</label><input required name="Pendidikan Tertinggi" onChange={(e) => setIndData({...indData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              </div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Instansi</label><input required name="Kategori Institusi" onChange={(e) => setIndData({...indData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Password</label><input type="text" required name="Password Akun" onChange={(e) => setIndData({...indData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <button type="submit" disabled={isLoading} className="mt-4 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] flex justify-center">{isLoading ? <Loader2 size={20} className="animate-spin" /> : 'KIRIM DATA'}</button>
            </form>
          )}

          {view === 'group' && (
            <form onSubmit={(e) => handleSubmit(e, 'Group')} className="grid grid-cols-1 gap-3 pt-2">
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Nama Ketua</label><input required name="Nama Ketua Group" onChange={(e) => setGrpData({...grpData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Email</label><input type="email" required name="Email" onChange={(e) => setGrpData({...grpData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Kategori</label><select name="Kategori Instansi" onChange={(e) => setGrpData({...grpData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800"><option>Lembaga Pendidikan & Penelitian</option><option>Kementerian & Pemerintah</option><option value="Pemerintah Daerah">Pemerintah Daerah</option><option>Lainnya</option></select></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Instansi</label><input required name="Nama Instansi" onChange={(e) => setGrpData({...grpData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Jumlah Orang</label><input type="number" required name="Jumlah Orang" onChange={(e) => setGrpData({...grpData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <button type="submit" disabled={isLoading} className="mt-4 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] flex justify-center">{isLoading ? <Loader2 size={20} className="animate-spin" /> : 'KIRIM DATA'}</button>
            </form>
          )}

          {view === 'lainnya' && (
            <form onSubmit={(e) => handleSubmit(e, 'Layanan Lain')} className="grid grid-cols-1 gap-3 pt-2">
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Nama Lengkap</label><input required name="Nama Lengkap" onChange={(e) => setLainData({...lainData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Keperluan</label><input required name="Keperluan Khusus" onChange={(e) => setLainData({...lainData, [e.target.name]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <button type="submit" disabled={isLoading} className="mt-4 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] flex justify-center">{isLoading ? <Loader2 size={20} className="animate-spin" /> : 'KIRIM DATA'}</button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}