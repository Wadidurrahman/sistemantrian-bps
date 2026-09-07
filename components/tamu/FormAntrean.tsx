'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function FormBukuTamu({ onBack }: { onBack: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'form' | 'waiting' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [regId, setRegId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    'Tanggal Kunjungan': new Date().toISOString().split('T')[0],
    'Nama': '',
    'Nomor HP/WA': '',
    'Email': '',
    'Jenis Kelamin': 'Laki - Laki',
    'Asal Instansi': '',
    'Tujuan': ''
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (view === 'waiting' && regId) {
      const channel = supabase.channel('cek-status-bukutamu')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'registrations', filter: `id=eq.${regId}` }, (payload) => {
          if (payload.new.status === 'Selesai') {
            setView('success');
            if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 500]);
          }
        }).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [view, regId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('registrations').insert([{ form_type: 'Buku Tamu', payload: formData }]).select().single();
      if (!error && data) { setRegId(data.id); setView('waiting'); }
    } finally { setIsLoading(false); }
  };

  const handleChange = (e: any) => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center relative overflow-x-hidden font-sans sm:justify-center">
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

      <div className={`w-full max-w-sm px-6 pt-12 pb-24 relative z-10 text-left transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
        <button onClick={view === 'form' ? onBack : () => setView('form')} className="flex items-center gap-2 text-white/90 hover:text-white font-bold text-sm mb-4">
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Buku Tamu</h1>
        <p className="text-orange-50 text-sm font-medium leading-relaxed drop-shadow-md">
          Pencatatan kunjungan BPS Kota Probolinggo.
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
              <p className="text-slate-500 text-sm text-center font-medium">Data masuk ke sistem.<br/>Mohon tunggu sebentar...</p>
            </div>
          )}

          {view === 'success' && (
            <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
              <CheckCircle2 size={70} className="text-orange-500" />
              <h2 className="text-xl font-black text-slate-800">Selesai!</h2>
              <p className="text-slate-500 text-sm text-center font-medium">Buku Tamu berhasil dikonfirmasi.</p>
              <button onClick={onBack} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl mt-4 text-sm tracking-widest uppercase shadow-lg">Kembali ke Beranda</button>
            </div>
          )}

          {view === 'form' && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 pt-2">
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Tanggal Kunjungan</label><input type="date" required name="Tanggal Kunjungan" value={formData['Tanggal Kunjungan']} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Nama Lengkap</label><input type="text" required name="Nama" value={formData['Nama']} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Nomor HP/WA</label><input type="tel" required name="Nomor HP/WA" value={formData['Nomor HP/WA']} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Email</label><input type="email" required name="Email" value={formData['Email']} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Jenis Kelamin</label><select name="Jenis Kelamin" value={formData['Jenis Kelamin']} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800"><option>Laki - Laki</option><option>Perempuan</option></select></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Asal Instansi</label><input type="text" required name="Asal Instansi" value={formData['Asal Instansi']} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              <div><label className="text-[11px] font-bold text-slate-500 uppercase">Tujuan</label><input type="text" required name="Tujuan" value={formData['Tujuan']} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-bold text-slate-800" /></div>
              
              <button type="submit" disabled={isLoading} className="mt-4 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] flex justify-center">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'KIRIM DATA'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}