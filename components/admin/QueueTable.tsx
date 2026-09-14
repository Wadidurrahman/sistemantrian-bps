'use client';

import { Play, RotateCcw, CheckCircle2, History, CircleDot } from 'lucide-react';

export default function QueueTable({ queues, loading, handlePanggil, handlePanggilUlang, handleSelesai, onOpenHistory }: any) {
  const activeQueues = queues.filter((q: any) => q.status !== 'Selesai');

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Antrean Aktif</h3>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-100">
            <CircleDot size={10} className="text-red-500 animate-pulse" />
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Live</span>
          </div>
        </div>
        
        {onOpenHistory && (
          <button 
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm"
          >
            <History size={12} /> History & Penilaian
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
              <th className="p-3 text-center border-r border-slate-200 w-24">No. Antrean</th>
              <th className="p-3 border-r border-slate-200">Waktu</th>
              <th className="p-3 border-r border-slate-200">Nama Tamu</th>
              <th className="p-3 border-r border-slate-200">Layanan</th>
              <th className="p-3 border-r border-slate-200 text-center">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {activeQueues.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  Belum ada antrean aktif
                </td>
              </tr>
            ) : (
              activeQueues.map((q: any) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-center font-black text-blue-900 border-r border-slate-200">{q.queue_number}</td>
                  <td className="p-3 text-slate-500 font-medium border-r border-slate-200 whitespace-nowrap">
                    {new Date(q.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 font-bold text-slate-800 border-r border-slate-200 uppercase">{q.guest_name}</td>
                  <td className="p-3 text-slate-600 font-medium border-r border-slate-200">{q.service_type}</td>
                  <td className="p-3 text-center border-r border-slate-200">
                    <span className={`inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                      q.status === 'Dipanggil' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      {q.status === 'Menunggu' ? (
                        <button 
                          onClick={() => handlePanggil(q)}
                          className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded transition-colors"
                          title="Panggil"
                        >
                          <Play size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handlePanggilUlang(q)}
                          className="p-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded transition-colors"
                          title="Panggil Ulang"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleSelesai(q.id)}
                        className="p-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                        title="Tandai Selesai"
                      >
                        <CheckCircle2 size={16} />
                      </button>
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