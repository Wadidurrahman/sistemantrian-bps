'use client';

import { useState } from 'react';
import { X, Search, Clock, User, Building2, Phone, MapPin, FileText } from 'lucide-react';

export default function DataMasukModal({ isOpen, onClose, registrations }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const safeData = Array.isArray(registrations) ? registrations : [];

  const filteredData = safeData.filter((item: any) => {
    const query = searchQuery.toLowerCase();
    const nama = (item?.nama || '').toLowerCase();
    const instansi = (item?.instansi || '').toLowerCase();
    const keperluan = (item?.keperluan || '').toLowerCase();
    const kontak = (item?.kontak || '').toLowerCase();

    return nama.includes(query) || instansi.includes(query) || keperluan.includes(query) || kontak.includes(query);
  });

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-sm max-w-5xl w-full shadow-2xl border border-slate-200 flex flex-col h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-blue-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">
              Data Buku Tamu Pengunjung ({safeData.length})
            </h3>
            <p className="text-[10px] text-blue-200 font-medium">Rekapitulasi kunjungan harian terintegrasi dengan laporan Excel</p>
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
              placeholder="Cari berdasarkan nama tamu, instansi, keperluan, atau no HP..."
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
                <th className="p-3 text-center w-12 border-r border-slate-200">No</th>
                <th className="p-3 border-r border-slate-200">Waktu</th>
                <th className="p-3 border-r border-slate-200">Nama Tamu</th>
                <th className="p-3 border-r border-slate-200">Instansi / Asal</th>
                <th className="p-3 border-r border-slate-200">Kontak</th>
                <th className="p-3 border-r border-slate-200">Tujuan</th>
                <th className="p-3">Keperluan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs">
                    {safeData.length === 0 ? 'Belum ada data buku tamu hari ini.' : 'Data yang dicari tidak ditemukan.'}
                  </td>
                </tr>
              ) : (
                filteredData.map((reg: any, index: number) => (
                  <tr key={reg?.id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center font-bold text-slate-400 border-r border-slate-200">{index + 1}</td>
                    <td className="p-3 font-medium text-slate-500 border-r border-slate-200 whitespace-nowrap">
                      {reg?.created_at ? new Date(reg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="p-3 font-bold text-slate-900 uppercase border-r border-slate-200">
                      {reg?.nama || '-'}
                    </td>
                    <td className="p-3 font-medium text-slate-800 border-r border-slate-200">
                      {reg?.instansi || '-'}
                    </td>
                    <td className="p-3 font-medium text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {reg?.kontak || '-'}
                    </td>
                    <td className="p-3 font-medium text-slate-600 border-r border-slate-200">
                      {reg?.tujuan || '-'}
                    </td>
                    <td className="p-3 font-medium text-slate-600">
                      {reg?.keperluan || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 shrink-0 flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <span>Menampilkan {filteredData.length} dari {safeData.length} data</span>
          <span>Data tersinkronisasi otomatis dengan Excel</span>
        </div>

      </div>
    </div>
  );
}