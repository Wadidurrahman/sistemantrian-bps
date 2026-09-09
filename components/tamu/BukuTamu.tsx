'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { User, Building2, MapPin, FileText, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function BukuTamu({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({
    nama: '',
    instansi: '',
    tujuan: '',
    keperluan: '',
    kontak: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('buku_tamu')
        .insert([
          {
            nama: formData.nama,
            instansi: formData.instansi,
            tujuan: formData.tujuan,
            keperluan: formData.keperluan,
            kontak: formData.kontak
          }
        ]);

      if (error) throw error;

      setSuccess(true);
      
      setTimeout(() => {
        onBack();
      }, 2500);
      
    } catch (err: any) {
      console.error('Error submitting buku tamu:', err);
      alert(`Gagal menyimpan: ${err.message || 'Periksa koneksi atau database Anda'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center justify-center relative font-sans px-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full transform transition-all animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Berhasil!</h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Data kunjungan Anda telah tersimpan di sistem kami. Terima kasih atas kunjungannya.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center relative overflow-x-hidden font-sans sm:justify-center">
      <div className="w-full max-w-md px-6 pt-10 pb-20 relative z-10 text-left">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white font-bold text-sm uppercase tracking-widest mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Kembali
        </button>
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">Buku Tamu</h1>
        <p className="text-orange-50 text-xs font-medium leading-relaxed opacity-90">
          Silakan lengkapi data diri Anda sebagai catatan kunjungan resmi di PST BPS Kota Probolinggo.
        </p>
      </div>

      <div className="w-full max-w-md bg-white sm:rounded-[2rem] rounded-t-[2rem] px-6 pt-8 pb-10 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.4)] relative z-20 flex-1 sm:flex-none sm:mb-8 -mt-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
              <input 
                required
                type="text" 
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Instansi / Asal</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building2 size={16} />
              </div>
              <input 
                required
                type="text" 
                name="instansi"
                value={formData.instansi}
                onChange={handleChange}
                placeholder="Contoh: Universitas Brawijaya / Umum" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tujuan Kunjungan</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin size={16} />
              </div>
              <input 
                required
                type="text" 
                name="tujuan"
                value={formData.tujuan}
                onChange={handleChange}
                placeholder="Contoh: Ruang PST / Ruang Kepala" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Keperluan</label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-3 pointer-events-none text-slate-400">
                <FileText size={16} />
              </div>
              <textarea 
                required
                name="keperluan"
                value={formData.keperluan}
                onChange={handleChange}
                placeholder="Jelaskan keperluan Anda secara singkat" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-400 placeholder:font-normal resize-none h-24 custom-scrollbar"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">No. HP / WhatsApp</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone size={16} />
              </div>
              <input 
                required
                type="tel" 
                name="kontak"
                value={formData.kontak}
                onChange={handleChange}
                placeholder="081234567890" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full mt-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-orange-600/30 transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Kirim Data Kunjungan'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}