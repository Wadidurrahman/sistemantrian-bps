import { RotateCcw, Download, Maximize, Minimize } from 'lucide-react';

export default function AdminHeader({ waktu, isFullscreen, toggleFullScreen, handleReset, handleExportCSV, getCurrentDate }: any) {
  return (
    <header className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
      <div className="max-w-[1600px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm p-1">
            <img src="/logoBPS.jpg" alt="Logo BPS" className="h-full w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900">Panel Operator PST</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">BPS Kota Probolinggo</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 border-r border-slate-200 pr-4 mr-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{getCurrentDate()}</p>
            <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-black font-mono tracking-widest border border-slate-200">
              {waktu}
            </div>
          </div>
          
          <button onClick={toggleFullScreen} className="h-10 w-10 flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition-all" title="Toggle Fullscreen">
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>

          <button onClick={handleReset} className="h-10 px-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 flex items-center gap-2 font-bold text-[11px] uppercase tracking-widest transition-all">
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>
          
          <button onClick={handleExportCSV} className="h-10 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex items-center gap-2 font-bold text-[11px] uppercase tracking-widest transition-all shadow-[0_4px_14px_rgba(249,115,22,0.4)]">
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
}