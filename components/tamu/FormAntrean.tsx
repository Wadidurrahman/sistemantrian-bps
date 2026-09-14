'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { User, ArrowLeft, Briefcase, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function FormAntrean({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    guest_name: '',
    service_type: 'Konsultasi Statistik'
  });
  const [loading, setLoading] = useState(false);

  const generateQueueNumber = async (serviceType: string) => {
    const today = new Date().toISOString().split('T')[0];
    const prefix = serviceType === 'Konsultasi Statistik' ? 'A' : 'B';
    
    const { count } = await supabase
      .from('queues')
      .select('*', { count: 'exact', head: true })
      .eq('service_type', serviceType)
      .gte('created_at', `${today}T00:00:00.000Z`);

    const nextNumber = (count || 0) + 1;
    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.guest_name.trim()) return alert('Nama lengkap wajib diisi');
    setLoading(true);

    try {
      const queueNumber = await generateQueueNumber(formData.service_type);

      const { data, error } = await supabase
        .from('queues')
        .insert([
          {
            guest_name: formData.guest_name,
            service_type: formData.service_type,
            queue_number: queueNumber,
            status: 'Menunggu'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        localStorage.setItem('bps_active_queue', data.id);
        router.push(`/status/${data.id}`);
      }
    } catch (err: any) {
      alert(`Gagal mengambil antrean: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center relative overflow-x-hidden font-sans sm:justify-center">
      <div className="w-full max-w-md px-6 pt-10 pb-24 relative z-10 text-left">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white font-bold text-sm uppercase tracking-widest mb-4 transition-colors"
        >
          <ArrowLeft size={18} /> Kembali
        </button>
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">Ambil Antrean</h1>
        <p className="text-orange-50 text-xs font-medium leading-relaxed opacity-90">
          Silakan masukkan nama Anda dan pilih jenis layanan.
        </p>
      </div>

      <div className="absolute top-[140px] sm:top-[auto] sm:-mt-[390px] z-30 w-20 h-20 bg-white rounded-full p-1.5 shadow-xl flex items-center justify-center border-4 border-orange-50">
        <Image 
          src="/logoBPS.jpg" 
          alt="Logo BPS" 
          width={64} 
          height={64} 
          className="object-contain rounded-full"
        />
      </div>

      <div className="w-full max-w-md bg-white sm:rounded-[2rem] rounded-t-[2.5rem] px-6 pt-16 pb-10 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.4)] relative z-20 flex-1 sm:flex-none sm:mb-8 -mt-16">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
              <input 
                required
                type="text" 
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                placeholder="Masukkan nama Anda" 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Pilih Jenis Layanan</label>
            <div className="grid grid-cols-1 gap-3">
              
              <div
                onClick={() => setFormData({ ...formData, service_type: 'Konsultasi Statistik' })}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-4 transition-all ${
                  formData.service_type === 'Konsultasi Statistik'
                    ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500 shadow-md shadow-orange-500/10'
                    : 'bg-white border-slate-200 hover:border-orange-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  formData.service_type === 'Konsultasi Statistik' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Briefcase size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Konsultasi Statistik</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Layanan konsultasi data dan publikasi</p>
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, service_type: 'Pelayanan Pengaduan' })}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-4 transition-all ${
                  formData.service_type === 'Pelayanan Pengaduan'
                    ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500 shadow-md shadow-orange-500/10'
                    : 'bg-white border-slate-200 hover:border-orange-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  formData.service_type === 'Pelayanan Pengaduan' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Pelayanan Pengaduan</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Layanan informasi dan pengaduan data</p>
                </div>
              </div>

            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-orange-600/30 transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Ambil Nomor Antrean'}
          </button>
        </form>
      </div>
    </main>
  );
}