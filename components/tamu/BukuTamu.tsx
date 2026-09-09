'use client';

import { X, Clock } from 'lucide-react';

export default function DataMasukModal({
  isOpen,
  onClose,
  registrations,
}: any) {
  if (!isOpen) return null;

  const safeData = Array.isArray(registrations) ? registrations : [];

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200">
        
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
            Data Buku Tamu Hari Ini ({safeData.length})
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 custom-scrollbar">
          <div className="space-y-4">
            {safeData.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Belum ada data buku tamu
                </p>
              </div>
            ) : (
              safeData.map((item: any, index: number) => {
                const payload =
                  item?.payload && typeof item.payload === 'object'
                    ? item.payload
                    : {};

                const nama =
                  item?.nama ||
                  item?.Nama ||
                  payload?.nama ||
                  payload?.Nama ||
                  payload?.['Nama Lengkap'] ||
                  payload?.['Nama Ketua Group'] ||
                  'Tamu Anonim';

                const instansi =
                  item?.instansi ||
                  item?.Instansi ||
                  payload?.instansi ||
                  payload?.Instansi ||
                  payload?.['Asal Instansi'] ||
                  payload?.['Nama Instansi'] ||
                  payload?.['Kategori Institusi'] ||
                  '-';

                const kontak =
                  item?.kontak ||
                  item?.Kontak ||
                  payload?.kontak ||
                  payload?.Kontak ||
                  payload?.['Nomor Telepon'] ||
                  payload?.['No. HP'] ||
                  payload?.['Nomor HP'] ||
                  '-';

                const tujuan =
                  item?.tujuan ||
                  item?.Tujuan ||
                  payload?.tujuan ||
                  payload?.Tujuan ||
                  payload?.['Tujuan Kunjungan'] ||
                  '-';

                const keperluan =
                  item?.keperluan ||
                  item?.Keperluan ||
                  payload?.keperluan ||
                  payload?.Keperluan ||
                  payload?.['Keperluan'] ||
                  '-';

                const createdAt =
                  item?.created_at ||
                  item?.createdAt ||
                  payload?.created_at ||
                  payload?.createdAt;

                return (
                  <div
                    key={item?.id || index}
                    className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-blue-900 uppercase text-sm">
                            {nama}
                          </h3>

                          <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                            {instansi}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mt-2">
                          <p className="text-xs text-slate-700 font-medium">
                            <span className="text-slate-400">Kontak:</span>{' '}
                            {kontak}
                          </p>

                          <p className="text-xs text-slate-700 font-medium">
                            <span className="text-slate-400">Tujuan:</span>{' '}
                            {tujuan}
                          </p>

                          <p className="text-xs text-slate-700 font-medium sm:col-span-2">
                            <span className="text-slate-400">Keperluan:</span>{' '}
                            {keperluan}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-start justify-end text-[10px] text-slate-400 font-bold uppercase tracking-widest gap-1">
                        <Clock size={12} />

                        {createdAt
                          ? new Date(createdAt).toLocaleTimeString('id-ID')
                          : '-'}
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}