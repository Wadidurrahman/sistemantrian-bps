'use client';

import { useState } from 'react';
import { X, Search, Star, MessageSquare } from 'lucide-react';

export default function HistoryAntreanModal({ isOpen, onClose, queues }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const safeData = Array.isArray(queues) ? queues : [];

  const filteredData = safeData.filter((item: any) => {
    const query = searchQuery.toLowerCase();
    const nama = (item?.guest_name || '').toLowerCase();
    const no = (item?.queue_number || '').toLowerCase();
    const layanan = (item?.service_type || '').toLowerCase();
    return nama.includes(query) || no.includes(query) || layanan.includes(query);
  });

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-sm max-w-6xl w-full shadow-2xl border border-slate-200 flex flex-col h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-blue-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">
              History & Penilaian Antrean ({safeData.length})
            </h3>
            <p className="text-[10px] text-blue-200 font-medium">Rekapitulasi riwayat tamu, rating bintang, dan saran.</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 bg-slate-100 border-b border-slate-200 shrink-0 flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama tamu, nomor antrean, atau layanan..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-900 transition-colors"
            />
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-wider rounded-sm transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto bg-white custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
                <th className="p-3 text-center border-r border-slate-200">No</th>
                <th className="p-3 border-r border-slate-200">Antrean</th>
                <th className="p-3 border-r border-slate-200">Waktu</th>
                <th className="p-3 border-r border-slate-200">Nama Tamu</th>
                <th className="p-3 border-r border-slate-200">Layanan</th>
                <th className="p-3 border-r border-slate-200 text-center">Status</th>
                <th className="p-3 border-r border-slate-200 text-center">Penilaian</th>
                <th className="p-3">Kritik & Saran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs">
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((q: any, index: number) => (
                  <tr key={q?.id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center font-bold text-slate-400 border-r border-slate-200">{index + 1}</td>
                    <td className="p-3 font-black text-blue-900 border-r border-slate-200">{q?.queue_number || '-'}</td>
                    <td className="p-3 font-medium text-slate-500 border-r border-slate-200 whitespace-nowrap">
                      {q?.created_at ? new Date(q.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="p-3 font-bold text-slate-900 uppercase border-r border-slate-200">{q?.guest_name || '-'}</td>
                    <td className="p-3 font-medium text-slate-800 border-r border-slate-200">{q?.service_type || '-'}</td>
                    <td className="p-3 text-center border-r border-slate-200">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        q?.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {q?.status || '-'}
                      </span>
                    </td>
                    <td className="p-3 text-center border-r border-slate-200">
                      {q?.rating ? (
                        <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-sm">
                          <Star size={14} className="fill-amber-500" /> {q.rating}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold">-</span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-slate-600 max-w-xs truncate" title={q?.feedback || ''}>
                      {q?.feedback ? (
                        <div className="flex items-center gap-1.5">
                          <MessageSquare size={12} className="text-blue-500 shrink-0" />
                          <span className="truncate">{q.feedback}</span>
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}