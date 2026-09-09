import { Megaphone, Volume2, CheckSquare } from 'lucide-react';
import { toTitleCase } from '@/utils/formatText';

const panggilAntrean = (nama: string, nomor: string, meja: string) => {
  const namaTitleCase = toTitleCase(nama);
  const teksPanggilan = `Nomor antrean, ${nomor}, atas nama, ${namaTitleCase}, silakan menuju ke ${meja}`;
  const utterance = new SpeechSynthesisUtterance(teksPanggilan);
  utterance.lang = 'id-ID';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
};

export default function QueueTable({ loading, queues, handlePanggil, handlePanggilUlang, handleSelesai }: any) {
  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col overflow-hidden relative">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Daftar Antrean</h3>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-emerald-100 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100 border-b-2 border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 w-16 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 border-r border-slate-200 whitespace-nowrap">No</th>
              <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 border-r border-slate-200">Nama Tamu</th>
              <th className="px-4 py-2 w-48 text-[10px] font-bold uppercase tracking-widest text-slate-600 border-r border-slate-200">Layanan</th>
              <th className="px-3 py-2 w-16 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 border-r border-slate-200 whitespace-nowrap">Meja</th>
              <th className="px-3 py-2 w-24 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 border-r border-slate-200 whitespace-nowrap">Status</th>
              <th className="px-3 py-2 w-40 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-xs font-bold text-slate-400 uppercase">Memuat...</td></tr>
            ) : queues.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-xs font-bold text-slate-400 uppercase">Belum ada antrean</td></tr>
            ) : (
              queues.map((q: any) => (
                <tr key={q.id} className="odd:bg-white even:bg-[#f8fafc] hover:bg-blue-50/50 transition-colors">
                  <td className="px-3 py-2 text-center border-r border-slate-100 whitespace-nowrap">
                    <span className="text-sm font-black text-slate-800">{q.queue_number}</span>
                  </td>
                  <td className="px-4 py-2 border-r border-slate-100">
                    <span className="text-xs font-bold text-slate-800 uppercase truncate block">{q.guest_name}</span>
                  </td>
                  <td className="px-4 py-2 border-r border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{q.service_type}</span>
                  </td>
                  <td className="px-3 py-2 text-center border-r border-slate-100 whitespace-nowrap">
                    <span className="font-bold text-[10px] text-slate-700 bg-slate-200/50 px-2 py-1 rounded-sm border border-slate-200">
                      {q.service_type === 'Konsultasi Statistik' ? 'M1' : 'M2'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center border-r border-slate-100 whitespace-nowrap">
                    {q.status === 'Selesai' ? (
                      <span className="text-[#00a65a] font-bold text-[9px] uppercase tracking-widest">Selesai</span>
                    ) : q.status === 'Dipanggil' ? (
                      <span className="text-[#0073b7] font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-1"><span className="w-1.5 h-1.5 bg-[#0073b7] rounded-full animate-pulse"></span> Dipanggil</span>
                    ) : (
                      <span className="text-[#f39c12] font-bold text-[9px] uppercase tracking-widest">Menunggu</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex justify-center items-center gap-1.5">
                      {q.status !== 'Selesai' && (
                        <>
                          {q.status === 'Dipanggil' ? (
                            <button onClick={() => { panggilAntrean(q.guest_name, q.queue_number, q.service_type === 'Konsultasi Statistik' ? 'M1' : 'M2'); handlePanggilUlang(q); }} className="h-6 px-2 rounded-sm bg-[#0073b7] hover:bg-blue-700 text-white flex items-center gap-1 font-bold text-[9px] uppercase tracking-widest shadow-sm transition-colors">
                              <Megaphone size={10} /> Ulangi
                            </button>
                          ) : (
                            <button onClick={() => { panggilAntrean(q.guest_name, q.queue_number, q.service_type === 'Konsultasi Statistik' ? 'M1' : 'M2'); handlePanggil(q); }} className="h-6 px-2 rounded-sm bg-[#0073b7] hover:bg-blue-700 text-white flex items-center gap-1 font-bold text-[9px] uppercase tracking-widest shadow-sm transition-colors">
                              <Volume2 size={10} /> Panggil
                            </button>
                          )}
                          <button onClick={() => handleSelesai(q.id)} className="h-6 px-2 rounded-sm bg-[#00a65a] hover:bg-green-600 text-white flex items-center gap-1 font-bold text-[9px] uppercase tracking-widest shadow-sm transition-colors">
                            <CheckSquare size={10} /> Selesai
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
  );
}