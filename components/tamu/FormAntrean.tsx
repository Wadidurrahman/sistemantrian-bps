'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function FormAntrean({ serviceType, onBack }: { serviceType: string; onBack: () => void }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return alert('Mohon isi semua data dengan lengkap.');

    setLoading(true);

    try {
      const { data: settings } = await supabase.from('app_settings').select('last_reset_timestamp').eq('id', 1).single();
      const minTime = settings?.last_reset_timestamp || '1970-01-01';

      // Ambil antrean hari ini berdasarkan layanan yang sama
      const { data: existingQueues } = await supabase
        .from('queues')
        .select('queue_number')
        .eq('service_type', serviceType)
        .gte('created_at', minTime)
        .order('created_at', { ascending: false });

      const prefix = serviceType === 'Konsultasi Statistik' ? 'KS' : 'PG';
      let nextNumber = 1;

      if (existingQueues && existingQueues.length > 0) {
        const lastNumStr = existingQueues[0].queue_number; // Format misal: KS-01
        const parts = lastNumStr.split('-');
        if (parts.length === 2) {
          nextNumber = parseInt(parts[1], 10) + 1;
        }
      }

      const queueNumber = `${prefix}-${String(nextNumber).padStart(2, '0')}`;

      // Simpan ke database queues
      const { data: newQueue, error } = await supabase.from('queues').insert([
        {
          queue_number: queueNumber,
          guest_name: name.toUpperCase(),
          phone: phone,
          service_type: serviceType,
          status: 'Menunggu'
        }
      ]).select().single();

      if (error) throw error;

      // Simpan juga ke tabel registrations untuk fitur Data Bridge (opsional jika dibutuhkan sinkronisasi form)
      await supabase.from('registrations').insert([
        {
          form_type: serviceType,
          payload: { 'Nama': name.toUpperCase(), 'No HP': phone, 'Layanan': serviceType },
          status: 'Menunggu'
        }
      ]);

      router.push(`/status/${newQueue.id}`);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengambil antrean.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-sm p-6 shadow-xl border border-orange-200">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-xs font-bold uppercase mb-4">
        <ArrowLeft size={14} /> Kembali
      </button>

      <h2 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-1">Pendaftaran Antrean</h2>
      <p className="text-[11px] text-orange-600 font-bold uppercase mb-4">{serviceType}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap</label>
          <input 
            type="text" 
            required 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Masukkan nama Anda..."
            className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs font-medium uppercase focus:outline-none focus:border-blue-900"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nomor HP / WhatsApp</label>
          <input 
            type="tel" 
            required 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="08123456789"
            className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs font-medium focus:outline-none focus:border-blue-900"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 rounded-sm text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'Ambil Nomor Antrean'}
        </button>
      </form>
    </div>
  );
}