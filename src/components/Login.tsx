import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Key,
  ShieldCheck
} from 'lucide-react';
import { User, STAFF_LIST } from '../types';
import GmitLogo from './GmitLogo';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
}

export default function Login({ onLoginSuccess, users = STAFF_LIST }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active users list
  const activeUsers = users.filter(u => (u.status || 'AKTIF') === 'AKTIF');

  useEffect(() => {
    // Check URL parameters for direct link access (e.g., ?role=admin or ?user=edward or ?admin=true)
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    const userParam = params.get('user');
    const adminParam = params.get('admin');

    if (roleParam === 'admin' || adminParam === 'true' || userParam === 'edward') {
      const adminUser = activeUsers.find(u => u.role === 'ADMIN' || u.username === 'edward');
      if (adminUser) {
        setUsername(adminUser.username || 'edward');
        setPassword(adminUser.password || 'password123');
      }
    }
  }, [users]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const inputClean = username.trim();
    const passClean = password.trim();

    if (!inputClean || !passClean) {
      setError('Silakan isi username dan password Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const normalizedInput = inputClean.toLowerCase();

      // Flexible account resolution logic (matches username, NIP, ID, or Name)
      let staffMember = activeUsers.find(u => {
        const uUsername = (u.username || '').trim().toLowerCase();
        const uNip = (u.nip || '').trim().toLowerCase();
        const uId = (u.id || '').trim().toLowerCase();
        const uName = (u.name || '').trim().toLowerCase();

        return (
          (uUsername && uUsername === normalizedInput) ||
          (uNip && uNip === normalizedInput) ||
          (uId && uId === normalizedInput) ||
          uName === normalizedInput ||
          uName.includes(normalizedInput)
        );
      });

      // Shortcut fallbacks for login (e.g., typing "edward", "admin", "ketua", "pimpinan")
      if (!staffMember) {
        if (['edward', 'admin', 'ketua', 'ketua sinode', 'pimpinan', 'edward dethan'].includes(normalizedInput)) {
          staffMember = activeUsers.find(u => u.username === 'edward' || u.id === 'u1') || activeUsers[0];
        }
      }

      if (staffMember) {
        if ((staffMember.status || 'AKTIF') === 'NON_AKTIF') {
          setError('Akun Anda dinonaktifkan. Silakan hubungi Sekretaris.');
        } else if (passClean === (staffMember.password || 'password123')) {
          onLoginSuccess(staffMember);
        } else {
          setError('Password salah. Silakan periksa kembali password Anda.');
        }
      } else {
        setError('Username, NIP, atau Nama tidak terdaftar dalam sistem.');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between antialiased font-sans select-none">
      {/* Top bar branding */}
      <header className="px-4 sm:px-6 py-3 bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <GmitLogo className="h-7 w-7" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900 leading-none">
                E-Surat Sinode GMIT
              </span>
              <span className="text-[9px] text-slate-500 hidden sm:inline-block">
                Gereja Masehi Injili di Timor
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-700">
            <ShieldCheck className="h-3 w-3" />
            <span>Sistem Resmi</span>
          </div>
        </div>
      </header>

      {/* Main card panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-5 sm:p-8 space-y-5">
          
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="h-16 w-16 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-300">
                <GmitLogo className="h-full w-full object-contain" />
              </div>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
              Login E-Surat Sinode GMIT
            </h1>
            <p className="text-[11px] text-slate-500 leading-tight max-w-xs mx-auto">
              Sistem Tata Kelola Surat, Disposisi, dan Arsip Digital Kantor Sinode GMIT
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 leading-tight font-medium">{error}</div>
            </div>
          )}

          {/* Manual Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username / NIP Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Username / NIP / Nama
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Masukkan username atau NIP Anda"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="username"
                  inputMode="text"
                  className="w-full text-base sm:text-xs border border-slate-300 rounded-xl pl-10 pr-4 py-3 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  required
                />
                <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 block">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Masukkan password Anda"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="current-password"
                  className="w-full text-base sm:text-xs border border-slate-300 rounded-xl pl-10 pr-12 py-3 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  required
                />
                <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1 bottom-1 px-3 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer focus:outline-none"
                  title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                isLoading ? 'opacity-85 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Memverifikasi Kredensial...</span>
                </>
              ) : (
                <span>Masuk Ke Aplikasi</span>
              )}
            </button>
          </form>

          {/* Quick Account Selector / Petunjuk Akun Login Publik */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                Akun Terdaftar ({users.length}):
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                {activeUsers.length} Aktif
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-left">
              {users.map((u) => {
                const userStatus = u.status || 'AKTIF';
                const roleBadgeClass = 
                  u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                  u.role === 'PIMPINAN' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-indigo-100 text-indigo-800 border-indigo-200';

                const statusBadgeClass =
                  userStatus === 'AKTIF'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUsername(u.username || u.name);
                      setPassword(u.password || 'password123');
                      if (userStatus === 'NON_AKTIF') {
                        setError(`Akun "${u.name}" berstatus NON-AKTIF. Silakan hubungi Administrator untuk mengaktifkannya.`);
                      } else {
                        setError('');
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition group cursor-pointer flex items-center justify-between gap-2 ${
                      userStatus === 'AKTIF'
                        ? 'border-slate-200 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-300'
                        : 'border-rose-100 bg-rose-50/30 hover:bg-rose-50/70 hover:border-rose-300 opacity-80'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-700 transition">
                          {u.name}
                        </span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${roleBadgeClass}`}>
                          {u.role}
                        </span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${statusBadgeClass}`}>
                          {userStatus}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium truncate">
                        {u.title}
                      </div>
                      <div className="text-[10px] font-mono text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                        <span>User: <strong className="text-slate-900">{u.username || '-'}</strong></span>
                        <span>•</span>
                        <span>Pass: <strong className="text-slate-900">{u.password || 'password123'}</strong></span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg transition shrink-0 ${
                      userStatus === 'AKTIF'
                        ? 'text-indigo-600 bg-white border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white'
                        : 'text-rose-600 bg-white border border-rose-200 group-hover:bg-rose-600 group-hover:text-white'
                    }`}>
                      {userStatus === 'AKTIF' ? 'Gunakan' : 'Pilih'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-[10px] text-slate-500 border-t border-slate-200/80 bg-white px-4">
        <p>© 2026 Kantor Sinode GMIT (Gereja Masehi Injili di Timor). Seluruh Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
}

