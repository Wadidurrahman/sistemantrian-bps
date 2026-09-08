export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-slate-200 bg-white">
      <div className="mx-auto flex min-h-[48px] w-full max-w-[1500px] items-center justify-center px-6">
        <p className="text-center text-[10px] font-medium tracking-wide text-slate-400">
          © {currentYear} Badan Pusat Statistik Kota Probolinggo
          <span className="mx-2 text-slate-300">•</span>
          <span className="font-semibold text-slate-500">v1.0.0</span>
          <span className="mx-2 text-slate-300">•</span>
          Developed by{' '}
          <span className="font-semibold text-slate-700">
            Wadidurrahman
          </span>
        </p>
      </div>
    </footer>
  );
}