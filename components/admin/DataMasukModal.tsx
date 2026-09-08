'use client';

import { useState } from 'react';
import { X, Copy, CheckSquare, ChevronRight, ArrowLeft } from 'lucide-react';

export default function DataMasukModal({ isOpen, onClose, registrations, onKonfirmasi }: any) {
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySingle = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAll = () => {
    const textToCopy = Object.entries(selectedReg.payload || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey('all');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSelesai = async () => {
    await onKonfirmasi(selectedReg.id);
    setSelectedReg(null);
  };

  const handleClose = () => {
    setSelectedReg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-sm max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-blue-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            {selectedReg && (
              <button onClick={() => setSelectedReg(null)} className="hover:bg-white/20 p-1 rounded transition-colors">
                <ArrowLeft size={18} />
              </button>
            )}
            <h3 className="text-sm font-black uppercase tracking-widest">
              {selectedReg ? 'Detail Data Tamu' : 'Daftar Data Masuk'}
            </h3>
          </div>
          <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
          {!selectedReg ? (
            registrations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4"><CheckSquare size={32} className="text-slate-400" /></div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tidak ada pengajuan baru</p>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg: any) => (
                  <div key={reg.id} className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center justify-between group hover:border-blue-900 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase tracking-wider">{reg.form_type}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(reg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 uppercase">
                        {reg.payload['Nama'] || reg.payload['Nama Lengkap'] || reg.payload['Nama Ketua Group'] || 'Tamu Anonim'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[300px]">
                        Instansi: {reg.payload['Asal Instansi'] || reg.payload['Nama Instansi'] || reg.payload['Kategori Institusi'] || '-'}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedReg(reg)}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-3 py-2 rounded hover:bg-blue-100 transition-colors"
                    >
                      Detail <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                {Object.entries(selectedReg.payload || {}).map(([k, v]: [string, any], idx) => (
                  <div key={k} className={`flex items-center justify-between p-3 ${idx !== 0 ? 'border-t border-slate-100' : ''} hover:bg-slate-50 transition-colors`}>
                    <div className="pr-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{k}</p>
                      <p className="text-xs font-bold text-slate-800">{v || '-'}</p>
                    </div>
                    <button 
                      onClick={() => handleCopySingle(k, v)}
                      className={`shrink-0 p-2 rounded transition-colors ${copiedKey === k ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-900'}`}
                    >
                      {copiedKey === k ? <CheckSquare size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200 mt-6">
                <button 
                  onClick={handleCopyAll}
                  className={`w-full sm:w-auto px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${copiedKey === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}
                >
                  {copiedKey === 'all' ? <CheckSquare size={16} /> : <Copy size={16} />} 
                  {copiedKey === 'all' ? 'Tersalin!' : 'Salin Semua'}
                </button>
                
                <button 
                  onClick={handleSelesai}
                  className="w-full sm:flex-1 px-6 py-3 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <CheckSquare size={16} /> Konfirmasi & Tandai Selesai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}