'use client';

import { BellRing } from 'lucide-react';

export default function DataMasukCard({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="relative bg-gradient-to-br from-indigo-600 to-blue-800 rounded-sm shadow-sm p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all active:scale-95 group overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
        <BellRing size={100} />
      </div>

      {count > 0 && (
        <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-bounce border-2 border-white z-10">
          {count}
        </div>
      )}

      <div>
        <h3 className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-1">Data Masuk (Bridge)</h3>
        <div className="flex items-end gap-2 relative z-10">
          <span className="text-4xl font-black text-white leading-none">{count}</span>
          <span className="text-[10px] text-indigo-200 font-medium mb-1">Menunggu</span>
        </div>
      </div>
      
      <p className="text-[9px] text-indigo-200 mt-4 uppercase tracking-widest font-bold">
        Klik untuk melihat detail →
      </p>
    </div>
  );
}