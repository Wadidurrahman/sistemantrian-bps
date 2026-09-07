import { KeyRound } from 'lucide-react';

export default function LoginScreen({ pin, setPin, loginError, setLoginError, handleLogin }: any) {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center justify-center relative overflow-hidden font-sans p-4">
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

      <div className="w-full max-w-md px-6 mb-8 relative z-10 text-center">
  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
    Badan Pusat Statistik
  </h1>
  <h2 className="mt-1 text-lg sm:text-xl font-semibold text-white/90 tracking-wide">
    Kota Probolinggo
  </h2>
  <div className="mx-auto mt-4 w-12 h-1 rounded-full bg-orange-500" />
</div>


      <div className="w-full max-w-sm bg-[#fdfdfd] rounded-[2rem] px-6 pt-10 pb-8 shadow-[0_15px_40px_rgba(0,0,0,0.4)] relative z-20">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full p-1.5 shadow-[0_8px_20px_rgba(249,115,22,0.15)] border border-orange-50">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img src="/logoBPS.jpg" alt="Logo BPS" className="h-10 w-auto object-contain" />
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 flex flex-col mt-4">
          <div className="relative group">
            <input
              type="password"
              required
              value={pin}
              onChange={(e) => { setPin(e.target.value); setLoginError(''); }}
              className="w-full rounded-xl border-2 border-slate-100 py-4 px-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 bg-white text-center tracking-[1em] font-mono text-2xl font-bold text-slate-800 transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-sm"
              placeholder="Masukkan PIN"
              maxLength={6}
              autoFocus
            />
            {loginError && <p className="text-red-600 text-xs font-bold mt-2 text-center">{loginError}</p>}
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold py-4 rounded-xl shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(249,115,22,0.7)] hover:-translate-y-0.5 active:scale-95 transition-all text-sm tracking-widest uppercase mt-4">
            Masuk
          </button>
        </form>
      </div>
    </main>
  );
}