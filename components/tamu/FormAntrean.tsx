'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { User, Loader2, MessageSquare, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function FormAntrean({ onBack }: { onBack: () => void }) {
  const [nama, setNama] = useState('');
  const [layanan, setLayanan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<'form' | 'success'>('form');
  const [nomorAntrean, setNomorAntrean] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const services = [
    { id: 'Konsultasi Statistik', icon: MessageSquare },
    { id: 'Pelayanan Pengaduan', icon: AlertTriangle }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!layanan) { setError('Silakan pilih layanan terlebih dahulu.'); return; }
    setIsLoading(true); setError('');

    try {
      const { data: settings } = await supabase.from('app_settings').select('last_reset_timestamp').eq('id', 1).single();
      const { data: queues } = await supabase.from('queues').select('queue_number').gte('created_at', settings?.last_reset_timestamp).order('created_at', { ascending: false }).limit(1);

      let nextNumber = 1;
      if (queues && queues.length > 0) nextNumber = parseInt(queues[0].queue_number) + 1;
      const numStr = nextNumber.toString().padStart(2, '0');

      const { error: insertError } = await supabase.from('queues').insert([{ queue_number: numStr, guest_name: nama, service_type: layanan }]);
      if (insertError) throw insertError;
      
      setNomorAntrean(numStr);
      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center relative overflow-x-hidden font-sans sm:justify-center">
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

      <div className={`w-full max-w-sm px-6 pt-12 pb-24 relative z-10 text-left transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
        <button onClick={onBack} className="flex items-center gap-2 text-white/90 hover:text-white font-bold text-sm mb-4">
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Welcome!</h1>
        <p className="text-orange-50 text-sm font-medium leading-relaxed drop-shadow-md">
          Sistem Antrian Pelayanan Statistik Terpadu (PST) BPS Kota Probolinggo.
        </p>
      </div>

      <div className={`w-full max-w-sm bg-[#fdfdfd] sm:rounded-[2rem] rounded-t-[2rem] px-6 pt-14 pb-8 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.4)] relative z-20 flex-1 sm:flex-none sm:mb-8 -mt-16 transition-all duration-700 delay-150 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full p-1.5 shadow-[0_8px_20px_rgba(249,115,22,0.15)] border border-orange-50">
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/logoBPS.jpg" alt="Logo" className="h-10 w-auto object-contain" />
          </div>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center h-full pt-4 space-y-6">
            <CheckCircle2 size={70} className="text-orange-500" />
            <div className="text-center">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nomor Antrean Anda</h2>
              <div className="text-7xl font-black text-slate-800">{nomorAntrean}</div>
            </div>
            <button onClick={onBack} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl mt-4 text-sm tracking-widest uppercase shadow-lg">Selesai</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col h-full mt-2">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-xs font-bold border border-red-100 animate-pulse">
                <AlertTriangle size={16} className="shrink-0" /> <p>{error}</p>
              </div>
            )}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                <User size={18} className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} className="pl-11 w-full rounded-xl border-2 border-slate-100 py-3.5 px-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 bg-white font-bold text-slate-800 text-sm placeholder:font-medium placeholder:text-slate-400" placeholder="Masukkan Nama Anda" />
            </div>
            
            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-2 text-left">SILAKAN PILIH LAYANAN</label>
              <div className="flex flex-col gap-2.5">
                {services.map((item) => (
                  <button key={item.id} type="button" onClick={() => setLayanan(item.id)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 ${layanan === item.id ? 'border-orange-500 bg-orange-50/80 text-orange-700 shadow-sm transform scale-[1.01]' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'}`}>
                    <div className={`p-2 rounded-lg transition-colors ${layanan === item.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}><item.icon size={16} /></div>
                    <span className={`font-bold text-sm ${layanan === item.id ? 'text-orange-700' : 'text-slate-600'}`}>{item.id}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-6 mt-auto sm:mt-4">
              <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(249,115,22,0.7)] flex items-center justify-center gap-2 disabled:opacity-70 text-sm tracking-widest uppercase">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'AMBIL ANTRIAN'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}