'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { User, Settings, ArrowLeft } from 'lucide-react';

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
    <main className="min-h-[100dvh] bg-gradient-to-b from-blue-600 to-blue-900 flex flex-col items-center relative overflow-x-hidden font-sans sm:justify-center">
      <div className="w-full max-w-md px-6 pt-10 pb-20 relative z-10 text-left">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white font-bold text-sm uppercase tracking-widest mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Kembali
        </button>
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">Ambil Antrean</h1>
        <p className="text-blue-100 text-xs font-medium leading-relaxed opacity-90">
          Silakan isi nama dan pilih layanan untuk mendapatkan nomor antrean.
        </p>
      </div>

      <div className="w-full max-w-md bg-white sm:rounded-[2rem] rounded-t-[2rem] px-6 pt-8 pb-10 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.4)] relative z-20 flex-1 sm:flex-none sm:mb-8 -mt-8">
        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Pilih Layanan</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Settings size={16} />
              </div>
              <select 
                required
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="Konsultasi Statistik">Konsultasi Statistik</option>
                <option value="Pelayanan Pengaduan">Pelayanan Pengaduan</option>
              </select>
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full mt-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Ambil Nomor Antrean'}
          </button>
        </form>
      </div>
    </main>
  );
}