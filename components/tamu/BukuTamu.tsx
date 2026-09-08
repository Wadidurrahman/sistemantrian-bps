'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { User, Phone, Mail, Building, Target, Calendar, CheckCircle2, Loader2 } from 'lucide-react';

export default function BukuTamu({ onBack }: { onBack: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nama: '',
    hp: '',
    email: '',
    jk: 'Laki - Laki',
    instansi: '',
    tujuan: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.from('registrations').insert([
        {
          form_type: 'Buku Tamu',
          payload: {
            'Tanggal Kunjungan': formData.tanggal,
            'Nama': formData.nama.toUpperCase(),
            'Nomor HP/WA': formData.hp,
            'Email': formData.email,
            'Jenis Kelamin': formData.jk,
            'Asal Instansi': formData.instansi,
            'Tujuan': formData.tujuan
          },
          status: 'Menunggu'
        }
      ]);

      if (error) throw error;
      
      setIsSuccess(true);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (err: any) {
      alert('Gagal menyimpan data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isSuccess) {
    return (
      <main className="min-h-[100dvh] bg-gradient-to-b from-[#ea580c] to-[#c2410c] flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
          <CheckCircle2 size={80} className="mx-auto text-emerald-500 mb-4" />
          <h2 className="text-xl font-black text-slate-800 mb-2">Terima Kasih!</h2>
          <p className="text-sm text-slate-500 mb-6 font-medium">
            Data kunjungan Anda telah berhasil dicatat dalam Buku Tamu BPS Kota Probolinggo.
          </p>
          <button 
            onClick={onBack}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-sm tracking-widest uppercase shadow-lg transition-transform active:scale-95"
          >
            Kembali ke Beranda
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-[#ea580c] to-[#c2410c] flex flex-col items-center relative overflow-x-hidden font-sans sm:justify-center">
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px] pointer-events-none"></div>

      <div className={`w-full max-w-sm px-6 pt-12 pb-24 relative z-10 text-left transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Buku Tamu</h1>
        <p className="text-orange-50 text-sm font-medium leading-relaxed drop-shadow-md">
          Catat data kunjungan Anda di BPS Kota Probolinggo.
        </p>
      </div>

      <div className={`w-full max-w-sm bg-white sm:rounded-[2rem] rounded-t-[2rem] px-6 pt-14 pb-8 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.4)] relative z-20 flex-1 sm:flex-none sm:mb-8 -mt-16 transition-all duration-700 delay-150 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
        
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full p-1.5 shadow-[0_8px_20px_rgba(249,115,22,0.15)] border border-orange-50">
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/logoBPS.jpg" alt="Logo BPS" className="h-10 w-auto object-contain" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-1">Tanggal Kunjungan *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar size={16} className="text-slate-400" /></div>
              <input type="date" required name="tanggal" value={formData.tanggal} onChange={handleChange} className="pl-11 w-full rounded-xl border-2 border-slate-100 py-3 px-4 focus:outline-none focus:border-[#ea580c] bg-white font-semibold text-slate-800 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-1">Nama Lengkap *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User size={16} className="text-slate-400" /></div>
              <input type="text" required name="nama" value={formData.nama} onChange={handleChange} placeholder="Masukkan nama Anda" className="pl-11 w-full rounded-xl border-2 border-slate-100 py-3 px-4 focus:outline-none focus:border-[#ea580c] bg-white font-semibold text-slate-800 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-1">No HP/WA *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone size={14} className="text-slate-400" /></div>
                <input type="tel" required name="hp" value={formData.hp} onChange={handleChange} placeholder="0812..." className="pl-9 w-full rounded-xl border-2 border-slate-100 py-3 px-3 focus:outline-none focus:border-[#ea580c] bg-white font-semibold text-slate-800 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-1">Gender *</label>
              <select name="jk" value={formData.jk} onChange={handleChange} className="w-full rounded-xl border-2 border-slate-100 py-3 px-3 focus:outline-none focus:border-[#ea580c] bg-white font-semibold text-slate-800 text-sm appearance-none">
                <option value="Laki - Laki">Laki - Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-1">Email *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={16} className="text-slate-400" /></div>
              <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="email@contoh.com" className="pl-11 w-full rounded-xl border-2 border-slate-100 py-3 px-4 focus:outline-none focus:border-[#ea580c] bg-white font-semibold text-slate-800 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-1">Asal Instansi *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Building size={16} className="text-slate-400" /></div>
              <input type="text" required name="instansi" value={formData.instansi} onChange={handleChange} placeholder="Universitas / Perusahaan / Umum" className="pl-11 w-full rounded-xl border-2 border-slate-100 py-3 px-4 focus:outline-none focus:border-[#ea580c] bg-white font-semibold text-slate-800 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-1">Tujuan *</label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-4 pointer-events-none"><Target size={16} className="text-slate-400" /></div>
              <textarea required name="tujuan" value={formData.tujuan} onChange={handleChange} rows={2} placeholder="Tujuan kunjungan Anda..." className="pl-11 w-full rounded-xl border-2 border-slate-100 py-3 px-4 focus:outline-none focus:border-[#ea580c] bg-white font-semibold text-slate-800 text-sm resize-none" />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1e3a8a] text-white font-extrabold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(30,58,138,0.6)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 text-sm tracking-widest uppercase"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'SIMPAN DATA KUNJUNGAN'}
            </button>
            <button 
              type="button"
              onClick={onBack} 
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-95 text-sm tracking-widest uppercase"
            >
              KEMBALI
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}