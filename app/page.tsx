'use client';

import { useState } from 'react';
import MenuUtama from '@/components/tamu/MenuUtama';
import FormAntrean from '@/components/tamu/FormAntrean';

type ViewState = 'menu' | 'antrean' | 'Konsultasi Statistik' | 'Pelayanan Pengaduan' | 'registrasi' | 'bukutamu';

export default function Home() {
  const [view, setView] = useState<ViewState>('menu');

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center sm:justify-center p-4 font-sans relative overflow-x-hidden">
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-white rounded-full p-1.5 shadow-lg mb-6 border border-orange-100 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center">
            <img src="/logoBPS.jpg" alt="Logo BPS" className="h-10 w-auto object-contain" />
          </div>
        </div>

        {/* Tampilan Menu Utama */}
        {view === 'menu' && (
          <MenuUtama onNavigate={(selectedView) => setView(selectedView)} />
        )}

        {/* Pemilihan Jenis Antrean (Pemisahan 2 Loket) */}
        {view === 'antrean' && (
          <div className="w-full max-w-sm bg-white rounded-sm p-6 shadow-xl border border-orange-200">
            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 text-center">Pilih Layanan</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setView('Konsultasi Statistik')}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3.5 rounded-sm text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                1. Konsultasi Statistik
              </button>
              <button 
                onClick={() => setView('Pelayanan Pengaduan')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-sm text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                2. Pelayanan Pengaduan
              </button>
              <button 
                onClick={() => setView('menu')}
                className="w-full mt-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
              >
                Kembali
              </button>
            </div>
          </div>
        )}

        {/* Form Pendaftaran Masing-Masing Layanan */}
        {view === 'Konsultasi Statistik' && (
          <FormAntrean serviceType="Konsultasi Statistik" onBack={() => setView('antrean')} />
        )}

        {view === 'Pelayanan Pengaduan' && (
          <FormAntrean serviceType="Pelayanan Pengaduan" onBack={() => setView('antrean')} />
        )}

        {/* Fallback untuk menu lain yang belum digabungkan di sesi ini */}
        {(view === 'registrasi' || view === 'bukutamu') && (
          <div className="w-full max-w-sm bg-white rounded-sm p-6 shadow-xl border border-orange-200 text-center">
            <p className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Fitur {view} Sedang Diperbarui</p>
            <button 
              onClick={() => setView('menu')}
              className="bg-blue-900 text-white font-bold px-6 py-2.5 rounded-sm text-xs uppercase transition-colors"
            >
              Kembali
            </button>
          </div>
        )}
      </div>
    </main>
  );
}