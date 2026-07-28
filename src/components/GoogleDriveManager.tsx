import React, { useState, useEffect } from 'react';
import { 
  googleSignIn, 
  googleLogout, 
  initAuth, 
  uploadBackupToDrive, 
  listDriveArchives, 
  deleteDriveFile, 
  DriveFileItem 
} from '../lib/googleDriveAuth';
import { SuratMasuk, SuratKeluar } from '../types';
import { 
  HardDrive, 
  CloudUpload, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  LogOut, 
  ShieldCheck, 
  Database,
  Lock,
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface GoogleDriveManagerProps {
  suratMasukList: SuratMasuk[];
  suratKeluarList: SuratKeluar[];
}

export default function GoogleDriveManager({ suratMasukList, suratKeluarList }: GoogleDriveManagerProps) {
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isFetchingFiles, setIsFetchingFiles] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        fetchFiles(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setAccessToken(result.accessToken);
        showToast(`Berhasil terhubung dengan Google Drive (${result.user.email})`);
        fetchFiles(result.accessToken);
      }
    } catch (err: any) {
      alert(`Gagal menghubungkan Google Drive: ${err.message || 'Terjadi kesalahan login'}`);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setGoogleUser(null);
    setAccessToken(null);
    setDriveFiles([]);
    showToast('Terputus dari koneksi Google Drive.');
  };

  const fetchFiles = async (token?: string) => {
    const activeToken = token || accessToken;
    if (!activeToken) return;
    setIsFetchingFiles(true);
    try {
      const files = await listDriveArchives(activeToken);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Error fetching drive files:', err);
    } finally {
      setIsFetchingFiles(false);
    }
  };

  const handleBackupNow = async () => {
    if (!accessToken) return;
    setIsBackingUp(true);
    try {
      const backupData = {
        app: 'E-Surat Digital GMIT',
        timestamp: new Date().toISOString(),
        totalSuratMasuk: suratMasukList.length,
        totalSuratKeluar: suratKeluarList.length,
        suratMasuk: suratMasukList,
        suratKeluar: suratKeluarList
      };

      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `Backup_E-Surat_Digital_${dateStr}_${timeStr}.json`;

      const uploaded = await uploadBackupToDrive(
        fileName, 
        JSON.stringify(backupData, null, 2), 
        'application/json', 
        accessToken
      );

      showToast(`Cadangan "${uploaded.name}" berhasil diunggah ke Google Drive!`);
      await fetchFiles(accessToken);
    } catch (err: any) {
      alert(`Gagal mencadangkan data ke Google Drive: ${err.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!accessToken) return;
    try {
      const deleted = await deleteDriveFile(fileId, fileName, accessToken);
      if (deleted) {
        showToast(`File "${fileName}" berhasil dihapus dari Google Drive.`);
        fetchFiles(accessToken);
      }
    } catch (err: any) {
      alert(`Gagal menghapus file: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <HardDrive className="h-3.5 w-3.5" />
              <span>Integrasi Google Drive Workspace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
              Penyimpanan & Pencadangan Google Drive
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Hubungkan akun Google Drive Anda untuk mencadangkan seluruh data arsip Surat Masuk, Surat Keluar, dan lampiran secara aman dan permanen ke cloud storage lembaga.
            </p>
          </div>

          <div>
            {!googleUser ? (
              <button
                onClick={handleSignIn}
                disabled={isLoadingAuth}
                className="gsi-material-button w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 px-5 py-3 rounded-2xl shadow-lg font-bold text-xs transition duration-200 cursor-pointer border border-slate-200"
              >
                <div className="gsi-material-button-icon shrink-0">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span>{isLoadingAuth ? 'Menghubungkan...' : 'Hubungkan Google Drive'}</span>
              </button>
            ) : (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img src={googleUser.photoURL} alt="Profile" className="w-9 h-9 rounded-full border border-white/40" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-xs">
                      {googleUser.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-xs">
                    <p className="font-bold text-white truncate max-w-[180px]">{googleUser.displayName || googleUser.email}</p>
                    <p className="text-[10px] text-slate-300 font-mono truncate max-w-[180px]">{googleUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-xl transition cursor-pointer"
                  title="Putuskan Koneksi"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTION PANELS & DRIVE STATUS */}
      {!googleUser ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-100">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-slate-800 text-lg">Google Drive Belum Terhubung</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Silakan klik tombol <strong>"Hubungkan Google Drive"</strong> di atas untuk mengaktifkan akses otomatis ke folder pencadangan arsip surat.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* BACKUP NOW CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
                <CloudUpload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Cadangkan Data Sekarang</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Unggah salinan lengkap seluruh data <strong>{suratMasukList.length} Surat Masuk</strong> dan <strong>{suratKeluarList.length} Surat Keluar</strong> ke Google Drive.
                </p>
              </div>
            </div>

            <button
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Mengunggah Cadangan...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="h-4 w-4" />
                  <span>Cadangkan ke Drive</span>
                </>
              )}
            </button>
          </div>

          {/* FOLDER INFO CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Folder Destinasi Otomatis</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Semua berkas akan tersimpan secara terstruktur di dalam folder khusus <strong>"Arsip E-Surat Digital"</strong> di Google Drive Anda.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[11px] text-slate-600 font-mono flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">/Arsip E-Surat Digital/</span>
            </div>
          </div>

          {/* TOTAL ARCHIVES CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Berkas Cadangan Tersimpan</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Terdapat <strong>{driveFiles.length} berkas cadangan</strong> yang tersimpan dan siap dipulihkan kapan saja.
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchFiles()}
              disabled={isFetchingFiles}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetchingFiles ? 'animate-spin' : ''}`} />
              <span>Segarkan Daftar Berkas</span>
            </button>
          </div>
        </div>
      )}

      {/* DRIVE ARCHIVES LIST TABLE */}
      {googleUser && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-indigo-600" />
              <h3 className="font-heading font-bold text-slate-800 text-sm">Daftar Cadangan di Google Drive</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">{driveFiles.length} File Ditemukan</span>
          </div>

          {isFetchingFiles ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
              <span>Mengambil daftar file dari Google Drive...</span>
            </div>
          ) : driveFiles.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <AlertCircle className="h-8 w-8 mx-auto text-slate-300" />
              <p>Belum ada berkas cadangan yang tersimpan di Google Drive.</p>
              <p className="text-[11px] text-slate-400">Klik "Cadangkan ke Drive" di atas untuk membuat cadangan pertama Anda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-6">Nama Berkas</th>
                    <th className="py-3 px-4">Waktu Dibuat</th>
                    <th className="py-3 px-4">Tipe File</th>
                    <th className="py-3 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {driveFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-indigo-50/30 transition">
                      <td className="py-3.5 px-6 font-semibold text-slate-800 flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="truncate max-w-md font-mono text-[11px]">{file.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {file.createdTime ? new Date(file.createdTime).toLocaleString('id-ID') : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono font-semibold text-slate-600">
                          {file.mimeType.includes('json') ? 'JSON Backup' : 'Document'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
                          >
                            <ExternalLink className="h-3 w-3" /> Buka
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(file.id, file.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FLOATING TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-100">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
