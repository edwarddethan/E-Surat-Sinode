import React, { useState, useEffect } from 'react';
import { SuratMasuk, SuratKeluar, User, SifatSurat, STAFF_LIST, StaffMemo } from '../types';
import { 
  Inbox, 
  Send, 
  FileCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Building2, 
  FileText,
  UserCheck,
  Megaphone,
  Trash2
} from 'lucide-react';

interface DashboardProps {
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  currentUser: User;
  onNavigate: (tab: string) => void;
  onSelectLetterForDisposisi?: (letter: SuratMasuk) => void;
}

export default function Dashboard({ 
  suratMasuk, 
  suratKeluar, 
  currentUser, 
  onNavigate,
  onSelectLetterForDisposisi 
}: DashboardProps) {
  
  // Custom states for staff memos / internal broadcast notifications
  const [memos, setMemos] = useState<StaffMemo[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [memoTitle, setMemoTitle] = useState('');
  const [memoMessage, setMemoMessage] = useState('');
  const [memoRecipient, setMemoRecipient] = useState('ALL');
  const [memoPriority, setMemoPriority] = useState<'BIASA' | 'PENTING' | 'URGENT'>('BIASA');

  const loadMemos = () => {
    const saved = localStorage.getItem('esurat_staff_memos');
    if (saved) {
      try {
        setMemos(JSON.parse(saved));
      } catch (e) {
        setMemos([]);
      }
    } else {
      setMemos([]);
    }
  };

  useEffect(() => {
    loadMemos();
    const handleUpdate = () => loadMemos();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('staff_memos_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('staff_memos_updated', handleUpdate);
    };
  }, []);

  const handleSendMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoTitle.trim() || !memoMessage.trim()) {
      alert('Judul dan isi memo tidak boleh kosong!');
      return;
    }

    const targetStaff = STAFF_LIST.find(u => u.id === memoRecipient);
    const recipientName = memoRecipient === 'ALL' ? 'Semua Staf' : (targetStaff?.name || 'Staf');

    const newMemo: StaffMemo = {
      id: `memo-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderTitle: currentUser.title || 'Pimpinan',
      recipientId: memoRecipient,
      recipientName: recipientName,
      title: memoTitle,
      message: memoMessage,
      priority: memoPriority,
      timestamp: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5),
      isReadBy: []
    };

    const updated = [newMemo, ...memos];
    setMemos(updated);
    localStorage.setItem('esurat_staff_memos', JSON.stringify(updated));
    window.dispatchEvent(new Event('staff_memos_updated'));

    setMemoTitle('');
    setMemoMessage('');
    setMemoRecipient('ALL');
    setMemoPriority('BIASA');
    setShowAddForm(false);
    alert('Memo / Notifikasi staf berhasil dikirim & disebarkan!');
  };

  const handleDeleteMemo = (memoId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus memo ini?')) {
      const updated = memos.filter(m => m.id !== memoId);
      setMemos(updated);
      localStorage.setItem('esurat_staff_memos', JSON.stringify(updated));
      window.dispatchEvent(new Event('staff_memos_updated'));
    }
  };

  const handleMarkMemoAsRead = (memoId: string) => {
    const updated = memos.map(m => {
      if (m.id === memoId) {
        const reads = m.isReadBy || [];
        if (!reads.includes(currentUser.id)) {
          return { ...m, isReadBy: [...reads, currentUser.id] };
        }
      }
      return m;
    });
    setMemos(updated);
    localStorage.setItem('esurat_staff_memos', JSON.stringify(updated));
    window.dispatchEvent(new Event('staff_memos_updated'));
  };
  
  // Calculate statistics
  const totalMasuk = suratMasuk.length;
  const totalKeluar = suratKeluar.length;
  
  // Extract all dispositions
  const allDisposisi = suratMasuk.flatMap(sm => sm.disposisi || []);
  const pendingDisposisi = allDisposisi.filter(d => d.status === 'BELUM_DIPROSES');
  const onProgressDisposisi = allDisposisi.filter(d => d.status === 'SEDANG_DIPROSES');
  const completedDisposisi = allDisposisi.filter(d => d.status === 'SELESAI');

  // Letters needing disposition (no disposition objects exists yet)
  const needingDisposisi = suratMasuk.filter(sm => !sm.disposisi || sm.disposisi.length === 0);

  // Filter dispositions relevant to current logged in staff
  const myDisposisiList = allDisposisi.filter(d => d.penerimaId === currentUser.id);
  const myPendingDisposisi = myDisposisiList.filter(d => d.status !== 'SELESAI');

  // Helper to get letter metadata for a disposition
  const getLetterForDisposisi = (suratMasukId: string) => {
    return suratMasuk.find(sm => sm.id === suratMasukId);
  };

  // Sifat badge styling helper
  const getSifatColor = (sifat: SifatSurat) => {
    switch(sifat) {
      case 'SANGAT_RAHASIA': return 'bg-red-50 text-red-700 border-red-200';
      case 'RAHASIA': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'PENTING': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // State for active month selection in chart
  const [selectedChartMonth, setSelectedChartMonth] = useState<string>('07');

  // Dynamic monthly calculation for Year 2026 (All 12 Months)
  const getMonthlyData = () => {
    const monthConfigs = [
      { name: 'Jan', code: '01', baseMasuk: 12, baseKeluar: 8 },
      { name: 'Feb', code: '02', baseMasuk: 19, baseKeluar: 15 },
      { name: 'Mar', code: '03', baseMasuk: 25, baseKeluar: 18 },
      { name: 'Apr', code: '04', baseMasuk: 14, baseKeluar: 20 },
      { name: 'Mei', code: '05', baseMasuk: 30, baseKeluar: 22 },
      { name: 'Jun', code: '06', baseMasuk: 21, baseKeluar: 17 },
      { name: 'Jul', code: '07', baseMasuk: 0, baseKeluar: 0 },
      { name: 'Agt', code: '08', baseMasuk: 0, baseKeluar: 0 },
      { name: 'Sep', code: '09', baseMasuk: 0, baseKeluar: 0 },
      { name: 'Okt', code: '10', baseMasuk: 0, baseKeluar: 0 },
      { name: 'Nov', code: '11', baseMasuk: 0, baseKeluar: 0 },
      { name: 'Des', code: '12', baseMasuk: 0, baseKeluar: 0 },
    ];

    return monthConfigs.map(m => {
      // Filter letters for this specific month in 2026
      const countMasuk = suratMasuk.filter(sm => {
        const date = sm.tanggalDiterima || sm.tanggalSurat;
        return date && date.startsWith(`2026-${m.code}`);
      }).length;

      const countKeluar = suratKeluar.filter(sk => {
        const date = sk.tanggalDikirim || sk.tanggalSurat;
        return date && date.startsWith(`2026-${m.code}`);
      }).length;

      return {
        name: m.name,
        code: m.code,
        masuk: m.baseMasuk + countMasuk,
        keluar: m.baseKeluar + countKeluar,
        current: m.code === '07'
      };
    });
  };

  const monthlyData = getMonthlyData();
  const maxVal = Math.max(...monthlyData.map(m => Math.max(m.masuk, m.keluar, 10)), 32);
  const activeMonthData = monthlyData.find(m => m.code === selectedChartMonth) || monthlyData[6];

  return (
    <div className="space-y-6">
      {/* Welcome & High-level Statistics Grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-heading">
            Selamat Datang, {currentUser.name}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Berikut adalah rekapan persuratan dan disposisi aktif per hari ini, {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Surat Masuk */}
        <div 
          onClick={() => onNavigate('surat-masuk')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 flex items-start justify-between"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Surat Masuk</span>
            <div className="text-3xl font-bold text-slate-900">{totalMasuk}</div>
            <div className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="font-semibold">{needingDisposisi.length}</span> belum didisposisi
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Inbox className="h-6 w-6" />
          </div>
        </div>

        {/* Total Surat Keluar */}
        <div 
          onClick={() => onNavigate('surat-keluar')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 flex items-start justify-between"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Surat Keluar</span>
            <div className="text-3xl font-bold text-slate-900">{totalKeluar}</div>
            <div className="text-xs text-slate-500">
              {suratKeluar.filter(sk => sk.status === 'DRAFT').length} Draft · {suratKeluar.filter(sk => sk.status === 'DIKIRIM').length} Terkirim
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Send className="h-6 w-6" />
          </div>
        </div>

        {/* Disposisi Aktif */}
        <div 
          onClick={() => onNavigate('disposisi')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 flex items-start justify-between"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disposisi Aktif</span>
            <div className="text-3xl font-bold text-slate-900">
              {pendingDisposisi.length + onProgressDisposisi.length}
            </div>
            <div className="text-xs text-amber-600 flex items-center gap-1">
              <span className="font-semibold">{pendingDisposisi.length}</span> baru · <span className="font-semibold">{onProgressDisposisi.length}</span> diproses
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Disposisi Selesai */}
        <div 
          onClick={() => onNavigate('disposisi')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 flex items-start justify-between"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selesai Tindak Lanjut</span>
            <div className="text-3xl font-bold text-slate-900">{completedDisposisi.length}</div>
            <div className="text-xs text-slate-500">
              {allDisposisi.length > 0 
                ? `${Math.round((completedDisposisi.length / allDisposisi.length) * 100)}% penyelesaian` 
                : 'Belum ada disposisi'}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Content Dashboard Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Trend Chart Card (Left 2 columns) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-bold text-slate-800 text-base flex items-center gap-2">
                <span>Grafik Aliran Surat Masuk & Keluar</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">2026 Aktif</span>
              </h3>
              <p className="text-xs text-slate-500">Statistik rekapitulasi volume aliran surat per bulan. Klik batang bulan untuk melihat rincian.</p>
            </div>
            
            {/* Legend indicators */}
            <div className="flex items-center gap-3 text-xs font-medium bg-slate-50 p-2 rounded-xl border border-slate-150">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-indigo-600 rounded-xs inline-block shadow-2xs" />
                <span className="text-slate-700 font-semibold">Surat Masuk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-amber-500 rounded-xs inline-block shadow-2xs" />
                <span className="text-slate-700 font-semibold">Surat Keluar</span>
              </div>
            </div>
          </div>

          {/* Interactive Responsive Custom SVG Chart */}
          <div className="flex flex-col justify-end pt-2">
            <div className="h-60 flex items-end justify-between px-1 gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 relative overflow-x-auto">
              {/* Horizontal Grid lines */}
              <div className="absolute left-0 right-0 top-0 border-t border-dashed border-slate-100 text-[9px] text-slate-300 pointer-events-none" />
              <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-slate-100 text-[9px] text-slate-300 pointer-events-none" />
              <div className="absolute left-0 right-0 top-2/4 border-t border-dashed border-slate-100 text-[9px] text-slate-300 pointer-events-none" />
              <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-slate-100 text-[9px] text-slate-300 pointer-events-none" />

              {/* Month Data Columns */}
              {monthlyData.map((m, index) => {
                const percentMasuk = Math.max((m.masuk / maxVal) * 100, 4);
                const percentKeluar = Math.max((m.keluar / maxVal) * 100, 4);
                const isSelected = selectedChartMonth === m.code;

                return (
                  <div 
                    key={index} 
                    onClick={() => setSelectedChartMonth(m.code)}
                    className={`flex-1 min-w-[28px] flex flex-col items-center h-full justify-end z-10 group relative cursor-pointer p-1 rounded-xl transition-all ${
                      isSelected ? 'bg-indigo-50/70 ring-2 ring-indigo-400' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Hover Card */}
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] rounded-lg p-2 shadow-xl hidden group-hover:block pointer-events-none min-w-[90px] z-30">
                      <div className="font-bold text-center mb-1 text-indigo-300 border-b border-slate-700 pb-0.5">{m.name} 2026</div>
                      <div className="flex justify-between gap-2"><span className="text-indigo-300">Masuk:</span> <strong>{m.masuk}</strong></div>
                      <div className="flex justify-between gap-2"><span className="text-amber-300">Keluar:</span> <strong>{m.keluar}</strong></div>
                    </div>

                    {/* Numeric Count Indicator above bar if non-zero */}
                    <div className="text-[9px] font-bold text-slate-500 mb-1 flex gap-0.5 opacity-80 group-hover:opacity-100">
                      {m.masuk + m.keluar > 0 ? (m.masuk + m.keluar) : 0}
                    </div>

                    <div className="flex items-end gap-1 w-full justify-center">
                      {/* Surat Masuk Bar */}
                      <div 
                        style={{ height: `${percentMasuk}%` }}
                        className={`w-2.5 sm:w-3.5 rounded-t-sm transition-all duration-300 ${
                          isSelected ? 'bg-indigo-600 ring-1 ring-indigo-300' : m.current ? 'bg-indigo-500' : 'bg-indigo-400/80 group-hover:bg-indigo-600'
                        }`}
                        title={`Surat Masuk (${m.name}): ${m.masuk}`}
                      />
                      {/* Surat Keluar Bar */}
                      <div 
                        style={{ height: `${percentKeluar}%` }}
                        className={`w-2.5 sm:w-3.5 rounded-t-sm transition-all duration-300 ${
                          isSelected ? 'bg-amber-500 ring-1 ring-amber-300' : m.current ? 'bg-amber-400' : 'bg-amber-300 group-hover:bg-amber-500'
                        }`}
                        title={`Surat Keluar (${m.name}): ${m.keluar}`}
                      />
                    </div>
                    {/* Month Label */}
                    <span className={`text-[10px] mt-2 font-semibold ${isSelected ? 'text-indigo-700 font-extrabold underline' : m.current ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                      {m.name}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Active Month Detail Bar */}
            {activeMonthData && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="font-bold text-slate-800">
                    Bulan Terpilih: <span className="text-indigo-700 font-extrabold">{activeMonthData.name} 2026</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold">
                      Masuk: {activeMonthData.masuk}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                      Keluar: {activeMonthData.keluar}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onNavigate('surat-masuk')}
                    className="flex-1 sm:flex-none px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition-all"
                  >
                    Buka Surat Masuk
                  </button>
                  <button
                    onClick={() => onNavigate('surat-keluar')}
                    className="flex-1 sm:flex-none px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer transition-all"
                  >
                    Buka Surat Keluar
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 px-1">
              <span>* Data dapat difilter dan diklik langsung untuk membuka arsip terkait</span>
              <span className="font-semibold text-slate-600">Total Akumulasi: {totalMasuk + totalKeluar} Surat</span>
            </div>
          </div>
        </div>

        {/* Pusat Pengumuman & Memo Staf */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg animate-pulse">
                <Megaphone className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-800 text-base">Papan Pengumuman & Memo Staf</h3>
                <p className="text-xs text-slate-500">Komunikasi internal real-time antar pimpinan, sekretariat, dan staf</p>
              </div>
            </div>
            
            {/* Create Memo button for Pimpinan & Admin */}
            {(currentUser.role === 'PIMPINAN' || currentUser.role === 'ADMIN') && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {showAddForm ? 'Tutup Form' : 'Kirim Memo Baru'}
              </button>
            )}
          </div>

          {/* Form to Create New Memo */}
          {showAddForm && (
            <form onSubmit={handleSendMemo} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 animate-slide-down">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kirim Memo / Pengumuman Baru</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Recipient */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 block">Penerima Memo / Notifikasi</label>
                  <select
                    value={memoRecipient}
                    onChange={(e) => setMemoRecipient(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white font-medium"
                  >
                    <option value="ALL">Semua Staf / Pegawai (Siaran Broadcast)</option>
                    {STAFF_LIST.filter(u => u.id !== currentUser.id).map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.title})</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 block">Tingkat Urgensi</label>
                  <select
                    value={memoPriority}
                    onChange={(e) => setMemoPriority(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white font-medium"
                  >
                    <option value="BIASA">🟢 BIASA (Standard / Info Rutin)</option>
                    <option value="PENTING">🟡 PENTING (Harap Segera Dibaca)</option>
                    <option value="URGENT">🔴 URGENT / DARURAT (Butuh Tindakan Cepat)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 block">Judul Memo</label>
                <input
                  type="text"
                  required
                  value={memoTitle}
                  onChange={(e) => setMemoTitle(e.target.value)}
                  placeholder="Contoh: Rapat Evaluasi Kinerja Triwulan II / Penyerahan Dokumen Laporan"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 block">Isi Memo / Pesan</label>
                <textarea
                  required
                  rows={3}
                  value={memoMessage}
                  onChange={(e) => setMemoMessage(e.target.value)}
                  placeholder="Tulis pesan atau instruksi yang jelas kepada staf penerima di sini..."
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Kirim Sekarang
                </button>
              </div>
            </form>
          )}

          {/* List of Memos */}
          <div className="space-y-3">
            {/* Filter memos for the current user */}
            {(() => {
              const myMemos = memos.filter(m => {
                // Anyone can see broadcasts ("ALL")
                // Or if the current user is the specific recipient
                // Or if the current user is the sender (they can view sent memos)
                return m.recipientId === 'ALL' || m.recipientId === currentUser.id || m.senderId === currentUser.id;
              });

              if (myMemos.length === 0) {
                return (
                  <div className="text-center py-8 text-slate-400 border border-dashed border-slate-100 rounded-xl">
                    <p className="text-xs font-semibold text-slate-600">Belum ada memo atau pengumuman aktif</p>
                    <p className="text-[10px] mt-0.5">Semua pesan internal akan ditampilkan di papan ini.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {myMemos.map((memo) => {
                    const isSender = memo.senderId === currentUser.id;
                    const isRead = memo.isReadBy?.includes(currentUser.id);
                    const readCount = memo.isReadBy?.length || 0;

                    let priorityColor = 'border-l-indigo-500 bg-indigo-50/10';
                    let badgeColor = 'bg-indigo-50 text-indigo-700';
                    if (memo.priority === 'PENTING') {
                      priorityColor = 'border-l-amber-500 bg-amber-50/10';
                      badgeColor = 'bg-amber-50 text-amber-700';
                    } else if (memo.priority === 'URGENT') {
                      priorityColor = 'border-l-red-500 bg-red-50/10';
                      badgeColor = 'bg-red-50 text-red-700';
                    }

                    return (
                      <div
                        key={memo.id}
                        className={`p-4 border border-slate-100 rounded-xl border-l-4 ${priorityColor} transition-all relative group flex flex-col md:flex-row gap-4 items-start md:items-center justify-between`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${badgeColor}`}>
                              {memo.priority}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold font-mono">
                              {memo.timestamp}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Kepada: <strong className="text-slate-700">{memo.recipientName}</strong>
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{memo.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{memo.message}</p>
                          
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <span>Oleh: <strong>{memo.senderName} ({memo.senderTitle})</strong></span>
                            {isSender && (
                              <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">
                                Dibaca oleh {readCount} orang
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          {/* Mark as read for recipients */}
                          {!isSender && !isRead && (
                            <button
                              onClick={() => handleMarkMemoAsRead(memo.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                            >
                              Tandai Dibaca
                            </button>
                          )}
                          {!isSender && isRead && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                              ✓ Sudah Dibaca
                            </span>
                          )}

                          {/* Delete option for the sender or admins */}
                          {(isSender || currentUser.role === 'ADMIN') && (
                            <button
                              onClick={() => handleDeleteMemo(memo.id)}
                              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Memo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Section Context Tasks (1 Column) */}
        <div className="space-y-6">
          
          {/* Action Item: Pimpinan view (Urgent letters to dispose) */}
          {currentUser.role === 'PIMPINAN' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <h4 className="font-heading font-bold text-slate-800 text-sm">Butuh Disposisi</h4>
                </div>
                <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {needingDisposisi.length} Surat
                </span>
              </div>
              
              {needingDisposisi.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Semua surat telah didisposisi!</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Kerja luar biasa hari ini.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {needingDisposisi.map((sm) => (
                    <div 
                      key={sm.id} 
                      className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md ${getSifatColor(sm.sifat)}`}>
                          {sm.sifat}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{sm.tanggalDiterima}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-800 mt-1.5 line-clamp-1">{sm.perihal}</h5>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 font-semibold">{sm.asalSurat}</p>
                      
                      <button
                        onClick={() => onSelectLetterForDisposisi && onSelectLetterForDisposisi(sm)}
                        className="mt-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors w-full justify-end cursor-pointer"
                      >
                        Tulis Disposisi <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Item: Staf view (My Pending Tasks) */}
          {currentUser.role === 'STAF' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                    <Clock className="h-4 w-4" />
                  </div>
                  <h4 className="font-heading font-bold text-slate-800 text-sm">Tugas Disposisi Anda</h4>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {myPendingDisposisi.length} Pending
                </span>
              </div>
              
              {myPendingDisposisi.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Tidak ada tugas tertunda!</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Semua disposisi Anda telah selesai ditindaklanjuti.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {myPendingDisposisi.map((disp) => {
                    const sm = getLetterForDisposisi(disp.suratMasukId);
                    return (
                      <div 
                        key={disp.id} 
                        className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => onNavigate('disposisi')}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            disp.status === 'BELUM_DIPROSES' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {disp.status === 'BELUM_DIPROSES' ? 'BELUM MULAI' : 'SEDANG DIPROSES'}
                          </span>
                          <span className="text-[9px] text-red-500 font-semibold flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> DL: {disp.batasWaktu}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-800 mt-1.5 line-clamp-1">
                          {sm?.perihal || 'Perihal tidak ditemukan'}
                        </h5>
                        <p className="text-[10px] text-slate-600 bg-slate-50 border border-slate-100 p-1.5 rounded-md mt-1.5 italic line-clamp-2">
                          "{disp.instruksi}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* General Information Panel */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
              <FileText className="h-44 w-44" />
            </div>
            
            <h4 className="font-heading font-bold text-slate-100 text-sm mb-2 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-indigo-400" /> Profil 
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Lembaga:</span>
                <strong className="text-white">Sinode GMIT</strong>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Sistem:</span>
                <strong className="text-white">E-Surat v1.2.0</strong>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>IP / Host:</span>
                <strong className="text-slate-400 font-mono">Local-Sandboxed</strong>
              </div>
              <div className="flex justify-between">
                <span>Tindak Lanjut Hari Ini:</span>
                <strong className="text-amber-400 font-semibold">{pendingDisposisi.length + onProgressDisposisi.length} Surat</strong>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
