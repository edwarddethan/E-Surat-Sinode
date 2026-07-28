import React, { useState } from 'react';
import { SuratMasuk, Disposisi, User, StatusTindakLanjut, STAFF_LIST, SuratKeluar, SifatSurat, StatusSuratKeluar } from '../types';
import { LETTER_TEMPLATES } from './SuratKeluarList';
import { 
  ClipboardList, 
  Search, 
  Calendar, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  Building2, 
  Briefcase,
  Smile,
  Check,
  ChevronRight,
  Sparkles,
  X,
  Eye,
  Edit2
} from 'lucide-react';

interface DisposisiListProps {
  suratMasukList: SuratMasuk[];
  currentUser: User;
  onUpdateDisposisiStatus: (
    suratId: string, 
    disposisiId: string, 
    status: StatusTindakLanjut, 
    catatan?: string
  ) => void;
  users?: User[];
  onAddSuratKeluar?: (newSurat: SuratKeluar) => void;
}

export default function DisposisiList({
  suratMasukList,
  currentUser,
  onUpdateDisposisiStatus,
  users = STAFF_LIST,
  onAddSuratKeluar
}: DisposisiListProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA'); // SEMUA, BELUM_DIPROSES, DIBACA, SEDANG_DIPROSES, SELESAI
  
  // Modal states
  const [selectedDispForDetails, setSelectedDispForDetails] = useState<{ disp: Disposisi; letter: SuratMasuk } | null>(null);
  const [selectedDispForUpdate, setSelectedDispForUpdate] = useState<{ disp: Disposisi; letter: SuratMasuk } | null>(null);
  
  // Appoint staff state variables
  const [selectedDispForAppoint, setSelectedDispForAppoint] = useState<{ disp: Disposisi; letter: SuratMasuk } | null>(null);
  const [appointStaffId, setAppointStaffId] = useState('');
  const [appointPerihal, setAppointPerihal] = useState('');
  const [appointPenerima, setAppointPenerima] = useState('');
  const [appointSifat, setAppointSifat] = useState<SifatSurat>('BIASA');
  const [appointRingkasan, setAppointRingkasan] = useState('');

  // Staf response form states
  const [progressStatus, setProgressStatus] = useState<StatusTindakLanjut>('SEDANG_DIPROSES');
  const [catatanTindakLanjut, setCatatanTindakLanjut] = useState('');
  
  // Follow-up letter drafting states
  const [shouldCreateFollowUp, setShouldCreateFollowUp] = useState(false);
  const [followUpPenerima, setFollowUpPenerima] = useState('');
  const [followUpPerihal, setFollowUpPerihal] = useState('');
  const [followUpRingkasan, setFollowUpRingkasan] = useState('');

  // Dynamic lookup for selected disposition to reflect status change immediately
  const activeDetailData = selectedDispForDetails ? (() => {
    const foundLetter = suratMasukList.find(sm => sm.id === selectedDispForDetails.letter.id);
    if (!foundLetter) return selectedDispForDetails;
    const foundDisp = foundLetter.disposisi?.find(d => d.id === selectedDispForDetails.disp.id);
    if (!foundDisp) return selectedDispForDetails;
    return { disp: foundDisp, letter: foundLetter };
  })() : null;

  const handleViewDetails = (item: { disp: Disposisi; letter: SuratMasuk }) => {
    setSelectedDispForDetails(item);
    if (item.disp.status === 'BELUM_DIPROSES') {
      onUpdateDisposisiStatus(item.letter.id, item.disp.id, 'DIBACA');
    }
  };

  const handleOpenAppointModal = (item: { disp: Disposisi; letter: SuratMasuk }) => {
    setSelectedDispForAppoint(item);
    
    // Default values based on the incoming letter context
    setAppointPerihal(`Tindak Lanjut: ${item.letter.perihal}`);
    setAppointPenerima(item.letter.asalSurat);
    setAppointSifat(item.letter.sifat);
    
    // Find the recipient of the disposition as default candidate if they are a STAF
    const currentReceiver = users.find(u => u.id === item.disp.penerimaId);
    if (currentReceiver && currentReceiver.role === 'STAF') {
      setAppointStaffId(currentReceiver.id);
    } else {
      // Find first available STAF
      const firstStaf = users.find(u => u.role === 'STAF');
      setAppointStaffId(firstStaf ? firstStaf.id : '');
    }

    setAppointRingkasan(`Menindaklanjuti Lembar Disposisi Surat Masuk No: ${item.letter.noSurat} perihal "${item.letter.perihal}" dari ${item.letter.asalSurat}. Dengan ini ditugaskan untuk menyusun draf surat keluar terkait.`);
  };

  const handleAppointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispForAppoint || !onAddSuratKeluar) return;

    if (!appointStaffId) {
      alert('Silakan pilih staf pelaksana pembuat surat keluar!');
      return;
    }
    if (!appointPerihal.trim()) {
      alert('Silakan isi perihal surat keluar!');
      return;
    }
    if (!appointPenerima.trim()) {
      alert('Silakan isi tujuan/penerima surat keluar!');
      return;
    }

    const assignedStaff = users.find(u => u.id === appointStaffId);
    const assignedStaffName = assignedStaff ? assignedStaff.name.split(',')[0] : 'Staf';

    // Generate a unique sequential letter number draft
    const sequenceNum = String(suratMasukList.length + 128).padStart(4, '0');
    const newNoSurat = `005/${sequenceNum}/UPP-UMUM/VII/2026`;

    const newSurat: SuratKeluar = {
      id: `sk-${Date.now()}`,
      noSurat: newNoSurat,
      penerima: appointPenerima.trim(),
      perihal: appointPerihal.trim(),
      tanggalSurat: new Date().toISOString().split('T')[0],
      tanggalDikirim: '-',
      sifat: appointSifat,
      ringkasan: appointRingkasan.trim(),
      status: 'DRAFT',
      pembuatId: appointStaffId
    };

    onAddSuratKeluar(newSurat);

    alert(`Berhasil menugaskan ${assignedStaffName} untuk membuat draf Surat Keluar!\nDraf surat baru telah dibuat di daftar Surat Keluar.`);
    
    // Reset and close
    setSelectedDispForAppoint(null);
  };

  const canAppointStaff = 
    currentUser.title.toLowerCase().includes('ketua') || 
    currentUser.title.toLowerCase().includes('pimpinan') || 
    currentUser.role === 'PIMPINAN' ||
    currentUser.title.toLowerCase().includes('umum');

  // Collect all dispositions with their parent letters
  const allDisposisiWithLetters = suratMasukList.flatMap(sm => {
    const disposisis = sm.disposisi || [];
    return disposisis.map(d => ({
      disp: d,
      letter: sm
    }));
  });

  // Filter dispositions based on current user role
  const isStaf = currentUser.role === 'STAF';
  const roleFilteredDisposisi = allDisposisiWithLetters.filter(item => {
    if (isStaf) {
      // Staf only see dispositions addressed to them
      return item.disp.penerimaId === currentUser.id;
    }
    // Pimpinan and Admin see all dispositions
    return true;
  });

  // Apply search query and status filters
  const finalFilteredDisposisi = roleFilteredDisposisi.filter(item => {
    const matchesStatus = filterStatus === 'SEMUA' || item.disp.status === filterStatus;
    
    const staffMember = users.find(s => s.id === item.disp.penerimaId);
    const staffName = staffMember ? staffMember.name : '';
    const staffTitle = staffMember ? staffMember.title : '';
    const matchesSearch = 
      item.disp.instruksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.letter.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.letter.noSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.letter.asalSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Calculate stats for overview
  const totalMyDisp = roleFilteredDisposisi.length;
  const totalMyPending = roleFilteredDisposisi.filter(item => item.disp.status === 'BELUM_DIPROSES').length;
  const totalMyProcessing = roleFilteredDisposisi.filter(item => item.disp.status === 'SEDANG_DIPROSES').length;
  const totalMyCompleted = roleFilteredDisposisi.filter(item => item.disp.status === 'SELESAI').length;

  // Workload analysis for Pimpinan / Admin
  const staffStats = users.filter(s => s.role === 'STAF' && (s.status || 'AKTIF') === 'AKTIF').map(staff => {
    const staffDisposisi = allDisposisiWithLetters.filter(item => item.disp.penerimaId === staff.id);
    const completed = staffDisposisi.filter(item => item.disp.status === 'SELESAI').length;
    const active = staffDisposisi.length - completed;
    return {
      ...staff,
      total: staffDisposisi.length,
      completed,
      active,
    };
  });

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispForUpdate) return;

    onUpdateDisposisiStatus(
      selectedDispForUpdate.letter.id,
      selectedDispForUpdate.disp.id,
      progressStatus,
      progressStatus === 'SELESAI' || catatanTindakLanjut ? catatanTindakLanjut : undefined
    );

    // If shouldCreateFollowUp is checked, create a Surat Keluar
    if (shouldCreateFollowUp && onAddSuratKeluar) {
      if (!followUpPenerima.trim() || !followUpPerihal.trim() || !followUpRingkasan.trim()) {
        alert('Mohon lengkapi semua kolom draf surat keluar!');
        return;
      }

      // Generate sequence number
      const sequenceNum = String(Date.now()).slice(-4);
      // Use standard GMIT template by default
      const stdTmpl = LETTER_TEMPLATES.find(t => t.id === 'tmpl-gmit-resmi') || LETTER_TEMPLATES[0];
      let generatedCode = stdTmpl.code;
      if (generatedCode.includes('[INDEX]')) {
        generatedCode = generatedCode.replace('[INDEX]', sequenceNum);
      } else if (generatedCode.startsWith('....')) {
        generatedCode = generatedCode.replace('....', `${sequenceNum}`);
      }

      const newSurat: SuratKeluar = {
        id: `sk-${Date.now()}`,
        noSurat: generatedCode,
        penerima: followUpPenerima.trim(),
        perihal: followUpPerihal.trim(),
        tanggalSurat: new Date().toISOString().split('T')[0],
        tanggalDikirim: '-',
        sifat: stdTmpl.sifat,
        ringkasan: followUpRingkasan.trim(),
        status: 'DRAFT',
        pembuatId: currentUser.id,
        fileName: `${stdTmpl.name.split(' ')[0]}_${sequenceNum}.pdf`,
        fileSize: '420 KB'
      };

      onAddSuratKeluar(newSurat);
      alert(`Laporan tindak lanjut dan Draf Surat Keluar Resmi "${followUpPerihal}" berhasil disimpan secara permanen!\nAnda dapat mencetaknya di menu Rekapan Surat Keluar.`);
    } else {
      alert('Laporan progres tindak lanjut disposisi berhasil disimpan secara permanen!');
    }
    
    // Close modal and reset
    setSelectedDispForUpdate(null);
    setCatatanTindakLanjut('');
    setShouldCreateFollowUp(false);
    setFollowUpPenerima('');
    setFollowUpPerihal('');
    setFollowUpRingkasan('');
  };

  const getStatusBadge = (status: StatusTindakLanjut) => {
    switch (status) {
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-lg">
            <CheckCircle2 className="h-3 w-3 shrink-0" /> Selesai
          </span>
        );
      case 'SEDANG_DIPROSES':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-lg">
            <Clock className="h-3 w-3 shrink-0 text-amber-500 animate-pulse" /> Sedang Diproses
          </span>
        );
      case 'DIBACA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-lg animate-pulse">
            <Eye className="h-3 w-3 shrink-0 text-indigo-500" /> Dibaca
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-lg">
            <AlertCircle className="h-3 w-3 shrink-0" /> Belum Diproses
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h1 className="font-heading font-extrabold text-slate-900 text-xl tracking-tight flex items-center gap-2">
            <ClipboardList className="h-5.5 w-5.5 text-indigo-600" />
            <span>Daftar Disposisi Surat Masuk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isStaf 
              ? 'Tindak lanjuti instruksi pimpinan dan laporkan perkembangan hasil kerja Anda langsung ke sistem.'
              : 'Pantau disposisi, cek status penyelesaian, dan tinjau berkas laporan balik dari staf pelaksana.'}
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      {isStaf ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="space-y-1 text-center sm:text-left sm:border-r border-slate-100 pb-3 sm:pb-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Disposisi</span>
            <div className="text-2xl font-black text-slate-800">{totalMyDisp} <span className="text-xs font-normal text-slate-500">Tugas</span></div>
          </div>
          <div className="space-y-1 text-center sm:text-left sm:border-r border-slate-100 pb-3 sm:pb-0">
            <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Belum Mulai</span>
            <div className="text-2xl font-black text-rose-600">{totalMyPending} <span className="text-xs font-normal text-slate-500">Tugas</span></div>
          </div>
          <div className="space-y-1 text-center sm:text-left sm:border-r border-slate-100">
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Sedang Diproses</span>
            <div className="text-2xl font-black text-amber-600">{totalMyProcessing} <span className="text-xs font-normal text-slate-500">Tugas</span></div>
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Selesai</span>
            <div className="text-2xl font-black text-emerald-600">{totalMyCompleted} <span className="text-xs font-normal text-slate-500">Tugas</span></div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="font-heading font-bold text-xs text-slate-500 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-slate-400" /> Progres Kerja Staf Pelaksana
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {staffStats.map((st) => {
              const completionRate = st.total > 0 ? Math.round((st.completed / st.total) * 100) : 0;
              return (
                <div key={st.id} className="p-3.5 border border-slate-100 bg-slate-50/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{st.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{st.name.split(',')[0]}</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      {st.total} Total
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                      <span>Penyelesaian</span>
                      <span className="font-bold text-slate-600">{completionRate}% ({st.completed}/{st.total})</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${completionRate}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 text-[9px] text-slate-500 pt-1">
                    <span>🔴 {st.active} Aktif</span>
                    <span>🟢 {st.completed} Selesai</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FILTER & SEARCH PANEL */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berdasarkan No Surat, Asal Surat, Perihal, atau Penerima..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '14px' }}
          >
            <option value="SEMUA">Semua Status</option>
            <option value="BELUM_DIPROSES">Belum Diproses</option>
            <option value="SEDANG_DIPROSES">Sedang Diproses</option>
            <option value="SELESAI">Selesai</option>
          </select>
        </div>
      </div>

      {/* TABLE LIST VIEW */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4 w-12 text-center">No.</th>
                <th className="py-3 px-4">No Surat</th>
                <th className="py-3 px-4">Asal Surat</th>
                <th className="py-3 px-4">Perihal</th>
                <th className="py-3 px-4">Tanggal Disposisi</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {finalFilteredDisposisi.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold bg-white">
                    <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Tidak ada data disposisi yang ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter status Anda.</p>
                  </td>
                </tr>
              ) : (
                finalFilteredDisposisi.map((item, idx) => {
                  const isAssignedToMe = item.disp.penerimaId === currentUser.id;
                  const receiver = users.find(s => s.id === item.disp.penerimaId);
                  
                  return (
                    <tr key={item.disp.id} className="hover:bg-slate-50/50 transition duration-150">
                      
                      {/* 1. NO */}
                      <td className="py-4 px-4 text-center font-bold text-slate-400 border-r border-slate-100">
                        {idx + 1}
                      </td>

                      {/* 2. No Surat */}
                      <td className="py-4 px-4 font-mono text-slate-600 font-semibold tracking-tight whitespace-nowrap">
                        {item.letter.noSurat}
                      </td>

                      {/* 3. Asal Surat */}
                      <td className="py-4 px-4 text-slate-700 font-medium max-w-[180px] truncate">
                        {item.letter.asalSurat}
                      </td>

                      {/* 4. Perihal */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5 max-w-[280px]">
                          <span className="font-semibold text-slate-800 line-clamp-2 block leading-snug">
                            {item.letter.perihal}
                          </span>
                          {!isStaf && receiver && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-semibold">
                              Penerima: {receiver.title}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Tanggal Disposisi */}
                      <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>{item.disp.tanggalDisposisi}</span>
                        </div>
                      </td>

                      {/* 6. Status */}
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(item.disp.status)}
                      </td>

                      {/* 7. Aksi */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Detail button */}
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="p-1.5 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg border border-slate-200 hover:border-indigo-100 transition duration-150 cursor-pointer"
                            title="Lihat Rincian Lengkap"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Tunjuk Staf button */}
                          {canAppointStaff && (
                            <button
                              onClick={() => handleOpenAppointModal(item)}
                              className="p-1.5 bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg border border-slate-200 hover:border-emerald-100 transition duration-150 cursor-pointer"
                              title="Tunjuk Staf Pembuat Surat Keluar"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          )}

                          {/* Proses Surat button */}
                          {(isAssignedToMe || !isStaf) && (
                            <button
                              onClick={() => {
                                setSelectedDispForUpdate(item);
                                setProgressStatus(item.disp.status);
                                setCatatanTindakLanjut(item.disp.catatanTindakLanjut || '');
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition duration-150 cursor-pointer ${
                                item.disp.status === 'SELESAI'
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 hover:border-emerald-300'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700 shadow-3xs'
                              }`}
                              title="Proses Surat & Tindak Lanjut"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>Proses Surat</span>
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan <strong>{finalFilteredDisposisi.length}</strong> dari <strong>{allDisposisiWithLetters.length}</strong> disposisi terdaftar.
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedDispForDetails && activeDetailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs" onClick={() => setSelectedDispForDetails(null)} />
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative z-10 animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-indigo-600" />
                <h3 className="font-heading font-extrabold text-slate-800 text-sm">Detail Informasi Disposisi</h3>
              </div>
              <button 
                onClick={() => setSelectedDispForDetails(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer border border-transparent hover:border-slate-200"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              
              {/* 1. RUJUKAN SURAT */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">I. Rujukan Surat Masuk</h4>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-semibold">No. Surat:</span>
                    <span className="col-span-2 font-mono font-semibold text-slate-700">{activeDetailData.letter.noSurat}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-semibold">Asal Surat:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{activeDetailData.letter.asalSurat}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-semibold">Perihal:</span>
                    <span className="col-span-2 text-slate-700 font-bold">{activeDetailData.letter.perihal}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-semibold">Ringkasan Isi:</span>
                    <span className="col-span-2 text-slate-600 italic">"{activeDetailData.letter.ringkasan}"</span>
                  </div>
                </div>
              </div>

              {/* 2. DETAIL INSTRUKSI DISPOSISI */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">II. Instruksi Pimpinan & Penugasan</h4>
                <div className="bg-amber-50/20 border border-amber-200/50 p-4 rounded-xl space-y-2.5 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 font-semibold">Pemberi Disposisi:</span>
                    <span className="col-span-2 font-bold text-slate-800">
                      {users.find(u => u.id === activeDetailData.disp.pengirimId)?.name || 'Pimpinan'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 font-semibold">Tujuan Disposisi:</span>
                    <span className="col-span-2 font-bold text-slate-800">
                      {users.find(u => u.id === activeDetailData.disp.penerimaId)?.name || 'Staf Pelaksana'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 font-semibold">Tanggal Disposisi:</span>
                    <span className="col-span-2 font-semibold text-slate-700">{activeDetailData.disp.tanggalDisposisi}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500 font-semibold">Batas Tindak Lanjut:</span>
                    <span className="col-span-2 text-rose-600 font-extrabold">{activeDetailData.disp.batasWaktu}</span>
                  </div>
                  <div className="pt-2.5 border-t border-amber-200 space-y-1.5">
                    <span className="text-amber-800 font-bold block">Catatan Instruksi Pimpinan:</span>
                    <p className="text-slate-800 italic bg-white p-3.5 rounded-lg border border-amber-200 leading-relaxed font-semibold">
                      "{activeDetailData.disp.instruksi}"
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. HASIL TINDAK LANJUT */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">III. Laporan Hasil Pelaksanaan</h4>
                <div className="bg-emerald-50/20 border border-emerald-200/50 p-4 rounded-xl space-y-2.5 text-xs">
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-slate-500 font-semibold">Status Terakhir:</span>
                    <span className="col-span-2">{getStatusBadge(activeDetailData.disp.status)}</span>
                  </div>
                  {activeDetailData.disp.tanggalSelesai && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500 font-semibold">Tanggal Selesai:</span>
                      <span className="col-span-2 font-bold text-emerald-800">{activeDetailData.disp.tanggalSelesai}</span>
                    </div>
                  )}
                  <div className="pt-2.5 border-t border-emerald-200 space-y-1.5">
                    <span className="text-emerald-800 font-bold block">Laporan / Catatan Staf:</span>
                    <p className="text-slate-800 bg-white p-3.5 rounded-lg border border-emerald-200/50 leading-relaxed font-medium italic">
                      {activeDetailData.disp.catatanTindakLanjut 
                        ? `"${activeDetailData.disp.catatanTindakLanjut}"` 
                        : "Belum ada laporan tindak lanjut yang ditulis oleh staf terkait."}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. KETUA UPP PENUGASAN KHUSUS */}
              {canAppointStaff && (
                <div className="p-4 border border-indigo-100 bg-indigo-50/25 rounded-2xl space-y-3 mt-4">
                  <div className="flex items-start gap-2.5">
                    <UserCheck className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-indigo-900">Penugasan Khusus (Ketua UPP Umum)</h5>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                        Anda dapat secara khusus menunjuk dan memerintahkan staf pelaksana untuk segera menyusun draf surat keluar terkait surat masuk ini.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setSelectedDispForDetails(null);
                        handleOpenAppointModal(activeDetailData);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Tunjuk Pembuat Surat Keluar</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setSelectedDispForDetails(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition duration-150 cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL (PROSES SURAT) */}
      {selectedDispForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs" onClick={() => {
            setSelectedDispForUpdate(null);
            setShouldCreateFollowUp(false);
          }} />
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden relative z-10 animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                <h3 className="font-heading font-extrabold text-slate-800 text-sm">Proses & Tindak Lanjut Surat Masuk</h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedDispForUpdate(null);
                  setShouldCreateFollowUp(false);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer border border-transparent hover:border-slate-200"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Brief context */}
              <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Rujukan Surat & Instruksi</span>
                <p className="font-bold text-slate-800 line-clamp-1">{selectedDispForUpdate.letter.perihal}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Asal: {selectedDispForUpdate.letter.asalSurat} | No: {selectedDispForUpdate.letter.noSurat}</p>
                <p className="text-slate-500 italic mt-1.5 bg-white border border-slate-100 p-2.5 rounded-md font-medium">
                  "{selectedDispForUpdate.disp.instruksi}"
                </p>
              </div>

              {/* Status input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pilih Status Baru</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setProgressStatus('BELUM_DIPROSES')}
                    className={`p-2.5 border rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold smooth-transition cursor-pointer ${
                      progressStatus === 'BELUM_DIPROSES'
                        ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <AlertCircle className="h-4 w-4 text-rose-500" /> 
                    <span>Belum Mulai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProgressStatus('SEDANG_DIPROSES')}
                    className={`p-2.5 border rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold smooth-transition cursor-pointer ${
                      progressStatus === 'SEDANG_DIPROSES'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Diproses</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setProgressStatus('SELESAI')}
                    className={`p-2.5 border rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold smooth-transition cursor-pointer ${
                      progressStatus === 'SELESAI'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Selesai</span>
                  </button>
                </div>
              </div>

              {/* Action Note text box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Laporan Hasil Tindak Lanjut {progressStatus === 'SELESAI' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  required={progressStatus === 'SELESAI'}
                  rows={3}
                  placeholder={
                    progressStatus === 'SELESAI' 
                      ? 'Ketik hasil penyelesaian kerja, koordinasi, atau rincian keputusan di sini (Wajib diisi jika status Selesai)...'
                      : 'Ketik laporan progres pengerjaan saat ini (Opsional untuk status Belum Mulai / Diproses)...'
                  }
                  value={catatanTindakLanjut}
                  onChange={(e) => setCatatanTindakLanjut(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Optional Surat Keluar Draft creation */}
              {onAddSuratKeluar && (
                <div className="border border-indigo-100 bg-indigo-50/20 p-4 rounded-xl space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={shouldCreateFollowUp}
                      onChange={(e) => {
                        setShouldCreateFollowUp(e.target.checked);
                        if (e.target.checked && selectedDispForUpdate) {
                          // Pre-fill with standard template
                          const stdTmpl = LETTER_TEMPLATES.find(t => t.id === 'tmpl-gmit-resmi') || LETTER_TEMPLATES[0];
                          setFollowUpPerihal(stdTmpl.perihal);
                          setFollowUpPenerima(selectedDispForUpdate.letter.asalSurat || 'Masing - masing di - Tempat');
                          setFollowUpRingkasan(stdTmpl.ringkasan);
                        }
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <div className="text-xs font-bold text-slate-800">
                      Buat Draf Surat Keluar Resmi (Balasan / Tindak Lanjut)
                    </div>
                  </label>
                  
                  {shouldCreateFollowUp && (
                    <div className="space-y-3 pt-3 border-t border-indigo-100/50 animate-fade-in text-xs">
                      <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/50 text-[10px] text-indigo-800 font-bold flex items-center gap-1">
                        <span>★</span>
                        <span>Menggunakan Template Standar: <strong>Surat Undangan Resmi Majelis Sinode GMIT</strong></span>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Penerima Tujuan <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required={shouldCreateFollowUp}
                          value={followUpPenerima}
                          onChange={(e) => setFollowUpPenerima(e.target.value)}
                          placeholder="Instansi atau pihak penerima surat..."
                          className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Perihal Surat <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required={shouldCreateFollowUp}
                          value={followUpPerihal}
                          onChange={(e) => setFollowUpPerihal(e.target.value)}
                          placeholder="Sifat perihal surat keluar resmi..."
                          className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Isi / Ringkasan Surat <span className="text-red-500">*</span></label>
                        <textarea
                          required={shouldCreateFollowUp}
                          rows={4}
                          value={followUpRingkasan}
                          onChange={(e) => setFollowUpRingkasan(e.target.value)}
                          placeholder="Ketik rincian agenda, waktu, dan tempat kegiatan..."
                          className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDispForUpdate(null);
                    setShouldCreateFollowUp(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Check className="h-3.5 w-3.5" /> 
                  <span>Simpan & Proses</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PENUNJUKAN STAF PEMBUAT SURAT KELUAR MODAL */}
      {selectedDispForAppoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs" onClick={() => setSelectedDispForAppoint(null)} />
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative z-10 animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-emerald-600" />
                <h3 className="font-heading font-extrabold text-slate-800 text-sm">Tunjuk Staf Pembuat Surat Keluar</h3>
              </div>
              <button 
                onClick={() => setSelectedDispForAppoint(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer border border-transparent hover:border-slate-200"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleAppointSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="bg-emerald-50/30 p-3.5 rounded-xl border border-emerald-100/50 space-y-1">
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Rujukan Surat Masuk</p>
                <p className="text-xs font-bold text-slate-800">{selectedDispForAppoint.letter.perihal}</p>
                <p className="text-[10px] text-slate-500 font-mono">No: {selectedDispForAppoint.letter.noSurat} | Dari: {selectedDispForAppoint.letter.asalSurat}</p>
              </div>

              {/* Pilih Staf Pelaksana */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Pilih Staf Pelaksana <span className="text-rose-500">*</span></label>
                <select
                  value={appointStaffId}
                  onChange={(e) => setAppointStaffId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Pilih Staf --</option>
                  {users.filter(u => u.role === 'STAF').map(u => (
                    <option key={u.id} value={u.id}>{u.name} - {u.title}</option>
                  ))}
                </select>
              </div>

              {/* Perihal Surat Balasan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Perihal Surat Keluar <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={appointPerihal}
                  onChange={(e) => setAppointPerihal(e.target.value)}
                  placeholder="Ketik perihal draf surat keluar..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Tujuan/Penerima Surat Keluar */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Tujuan / Penerima <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={appointPenerima}
                  onChange={(e) => setAppointPenerima(e.target.value)}
                  placeholder="Instansi / Pihak tujuan..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Sifat Surat */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Sifat Surat</label>
                  <select
                    value={appointSifat}
                    onChange={(e) => setAppointSifat(e.target.value as SifatSurat)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="BIASA">Biasa</option>
                    <option value="PENTING">Penting</option>
                    <option value="SANGAT_PENTING">Sangat Penting</option>
                    <option value="RAHASIA">Rahasia</option>
                  </select>
                </div>

                {/* Draft Number Notice */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Status Draf</label>
                  <div className="w-full text-xs border border-dashed border-emerald-200 rounded-xl p-2.5 bg-emerald-50/20 text-emerald-800 font-bold flex items-center justify-center">
                    OTOMATIS (DRAFT)
                  </div>
                </div>
              </div>

              {/* Ringkasan Penugasan & Keterangan Tambahan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Instruksi Penugasan / Ringkasan Isi</label>
                <textarea
                  rows={4}
                  value={appointRingkasan}
                  onChange={(e) => setAppointRingkasan(e.target.value)}
                  placeholder="Ketik catatan tugas atau draf ringkasan isi surat keluar..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDispForAppoint(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5 shadow-sm transition"
                >
                  <Check className="h-4 w-4" /> 
                  <span>Tugaskan Staf</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
