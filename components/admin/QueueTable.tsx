import { Megaphone, Volume2, CheckCircle } from 'lucide-react';

export default function QueueTable({ loading, queues, handlePanggil, handlePanggilUlang, handleSelesai }: any) {
  return (
    <div className="flex-1 bg-white border-2 border-slate-100 rounded-[1.5rem] shadow-sm flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b-2 border-slate-100 flex items-center justify-between bg-white shrink-0">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Daftar Antrean</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md border-b-2 border-slate-100">
            <tr>
              <th className="px-6 py-4 w-24 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">No</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Identitas</th>
              <th className="px-6 py-4 w-32 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-6 py-4 w-[280px] text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat...</td></tr>
            ) : queues.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Kosong</td></tr>
            ) : (
              queues.map((q: any) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <span className="text-xl font-black text-slate-800">{q.queue_number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-extrabold text-slate-800 uppercase tracking-wide truncate">{q.guest_name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mt-0.5">{q.service_type}</p>
                  </td>
                  <td className="px-6 py-4">
                    {q.status === 'Selesai' ? (
                      <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">Selesai</span>
                    ) : q.status === 'Dipanggil' ? (
                      <span className="text-blue-500 font-bold text-[10px] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">Dipanggil</span>
                    ) : (
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">Menunggu</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end items-center gap-2">
                      {q.status !== 'Selesai' && (
                        <>
                          {q.status === 'Dipanggil' ? (
                            <button onClick={() => handlePanggilUlang(q)} className="h-9 px-4 rounded-xl border-2 border-blue-100 bg-white hover:bg-blue-50 text-blue-600 flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest transition-all">
                              <Megaphone size={12} /> Ulangi
                            </button>
                          ) : (
                            <button onClick={() => handlePanggil(q)} className="h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest transition-all shadow-md shadow-orange-500/20">
                              <Volume2 size={12} /> Panggil
                            </button>
                          )}
                          <button onClick={() => handleSelesai(q.id)} className="h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest transition-all shadow-md shadow-slate-800/20">
                            <CheckCircle size={12} /> Selesai
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