import { Users, Clock3, CheckCircle } from 'lucide-react';

export default function StatsCards({ stats }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
      <div className="bg-[#0073b7] rounded-sm p-4 flex items-center justify-between text-white shadow-sm">
        <div>
          <p className="text-3xl font-bold mb-0">{stats?.total || 0}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Total Antrean Hari Ini</p>
        </div>
        <Users size={40} className="text-white/20" />
      </div>

      <div className="bg-[#f39c12] rounded-sm p-4 flex items-center justify-between text-white shadow-sm">
        <div>
          <p className="text-3xl font-bold mb-0">{stats?.waiting || 0}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Sedang Menunggu</p>
        </div>
        <Clock3 size={40} className="text-white/20" />
      </div>

      <div className="bg-[#00a65a] rounded-sm p-4 flex items-center justify-between text-white shadow-sm">
        <div>
          <p className="text-3xl font-bold mb-0">{stats?.finished || 0}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Antrean Selesai</p>
        </div>
        <CheckCircle size={40} className="text-white/20" />
      </div>
    </div>
  );
}