'use client';

import { Users, Clock, CheckCircle2, BellRing } from 'lucide-react';

export default function StatsCards({ stats, registrationsCount, onOpenDataMasuk }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
      <div className="bg-[#0073b7] rounded-sm shadow-sm p-4 flex flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute -right-4 -top-4 opacity-20"><Users size={100} /></div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1">Total Antrean Hari Ini</h3>
          <span className="text-4xl font-black leading-none">{stats.total}</span>
        </div>
      </div>
      
      <div className="bg-[#f39c12] rounded-sm shadow-sm p-4 flex flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute -right-4 -top-4 opacity-20"><Clock size={100} /></div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1">Sedang Menunggu</h3>
          <span className="text-4xl font-black leading-none">{stats.waiting}</span>
        </div>
      </div>
      
      <div className="bg-[#00a65a] rounded-sm shadow-sm p-4 flex flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute -right-4 -top-4 opacity-20"><CheckCircle2 size={100} /></div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1">Antrean Selesai</h3>
          <span className="text-4xl font-black leading-none">{stats.finished}</span>
        </div>
      </div>
      
      <div 
        onClick={onOpenDataMasuk} 
        className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-sm shadow-sm p-4 flex flex-col justify-between relative overflow-hidden text-white cursor-pointer hover:shadow-lg transition-all active:scale-95 group"
      >
        <div className="absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
          <BellRing size={100} />
        </div>
        
        {registrationsCount > 0 && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(220,38,38,1)] animate-bounce border-2 border-white z-10">
            {registrationsCount}
          </div>
        )}
        
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1">Data Masuk (Bridge)</h3>
          <span className="text-4xl font-black leading-none">{registrationsCount}</span>
        </div>
      </div>
    </div>
  );
}