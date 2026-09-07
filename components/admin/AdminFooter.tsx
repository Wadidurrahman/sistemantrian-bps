export default function AdminFooter() {
const currentYear = new Date().getFullYear();

return ( <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-3"> <p className="text-center text-[11px] font-medium tracking-wide text-slate-500">
© {currentYear} Badan Pusat Statistik Kota Probolinggo <span className="mx-2 text-slate-300">•</span> <span className="text-slate-400">v1.0.0</span> <span className="mx-2 text-slate-300">•</span>
Developed by{" "} <span className="font-semibold text-slate-700">
Wadidurrahman </span> </p> </footer>
);
}
