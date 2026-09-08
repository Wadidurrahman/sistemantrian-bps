import { LogOut, RotateCcw, Download, Maximize, Minimize } from 'lucide-react';

export default function AdminHeader({ waktu, isFullscreen, toggleFullScreen, handleReset, handleExportCSV, getCurrentDate, onLogout }: any) {
  return (
    <header className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
      <div className="max-w-[1600px] mx-auto px-6 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 w-auto flex items-center justify-center">
            <img src="/logoBPS.jpg" alt="Logo BPS" className="h-full w-auto object-contain" />
          </div>
          <div className="border-l-2 border-slate-200 pl-4">
            <h1 className="text-sm font-black tracking-widest text-blue-900 uppercase">Panel Operator PST</h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">BPS Kota Probolinggo</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3 border-r border-slate-200 pr-4 mr-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getCurrentDate()}</p>
            <div className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-sm text-xs font-black font-mono tracking-widest border border-slate-200">
              {waktu || '00:00:00'}
            </div>
          </div>
          
          <button onClick={toggleFullScreen} className="h-8 w-8 flex items-center justify-center rounded-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors" title="Toggle Fullscreen">
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
          <button onClick={handleReset} className="h-8 px-3 rounded-sm border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest transition-colors">
            <RotateCcw size={12} /> <span className="hidden sm:inline">Reset</span>
          </button>
          <button onClick={handleExportCSV} className="h-8 px-3 rounded-sm bg-blue-900 hover:bg-blue-800 text-white flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest transition-colors shadow-sm">
            <Download size={12} /> <span className="hidden sm:inline">Export Excel</span>
          </button>
          <button onClick={onLogout} className="h-8 px-3 rounded-sm border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest transition-colors ml-2">
            <LogOut size={12} /> Keluar
          </button>
        </div>
      </div>
    </header>
  );
}