import { LogOut, RotateCcw, Download, Maximize, Minimize, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function AdminHeader({ waktu, isFullscreen, toggleFullScreen, handleReset, handleExportCSV, getCurrentDate, onOpenSettings, onLogout }: any) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          <div className="relative ml-2" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              className="h-8 w-8 flex items-center justify-center rounded-sm border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
              title="Pengaturan & Akun"
            >
              <Settings size={15} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-sm shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={() => { setShowDropdown(false); onOpenSettings(); }}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 uppercase tracking-wider"
                >
                  <Settings size={14} className="text-blue-900" /> Upload Gambar Display
                </button>
                <div className="h-px bg-slate-100 my-1"></div>
                <button 
                  onClick={() => { setShowDropdown(false); onLogout(); }}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 uppercase tracking-wider"
                >
                  <LogOut size={14} /> Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}