export default function AdminFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="text-center py-3.5 bg-white border-t border-slate-200 shrink-0">
      <p className="text-[11px] font-medium text-slate-500">
        &copy; {currentYear} Badan Pusat Statistik Kota Probolinggo 
        <span className="mx-2 text-slate-300">|</span> 
        v1.0.0 
        <span className="mx-2 text-slate-300">|</span> 
        Developed by <span className="font-semibold text-slate-600">Wadidurrahman</span>
      </p>
    </div>
  );
}