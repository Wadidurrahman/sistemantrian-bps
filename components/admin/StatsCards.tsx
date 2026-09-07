import { Users, Clock3, CheckCircle } from 'lucide-react';

export default function StatsCards({ stats }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
      <div className="bg-white border-2 border-slate-100 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Tamu</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          <Users size={24} className="text-blue-500" />
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Menunggu</p>
          <p className="text-3xl font-black text-orange-500">{stats.waiting}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
          <Clock3 size={24} className="text-orange-500" />
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Selesai</p>
          <p className="text-3xl font-black text-emerald-500">{stats.finished}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
          <CheckCircle size={24} className="text-emerald-500" />
        </div>
      </div>
    </div>
  );
}