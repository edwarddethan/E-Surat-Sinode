import React, { useState, useRef } from 'react';
import { SuratMasuk, SifatSurat, User, Disposisi, STAFF_LIST } from '../types';
import { 
  Inbox, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  Calendar, 
  Building2, 
  Download, 
  UploadCloud, 
  X, 
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Check,
  Printer,
  ZoomIn,
  ZoomOut,
  Edit3
} from 'lucide-react';

interface SuratMasukListProps {
  suratMasukList: SuratMasuk[];
  currentUser: User;
  onAddSuratMasuk: (newSurat: SuratMasuk) => void;
  onUpdateSuratMasuk?: (updatedSurat: SuratMasuk) => void;
  onAddDisposisi: (suratId: string, disposisi: Disposisi) => void;
  onDeleteSuratMasuk?: (id: string) => void;
  selectLetterForDisposisi: SuratMasuk | null;
  clearSelectedLetterForDisposisi: () => void;
  users?: User[];
  onAddUser?: (user: User) => void;
}

export default function SuratMasukList({
  suratMasukList,
  currentUser,
  onAddSuratMasuk,
  onUpdateSuratMasuk,
  onAddDisposisi,
  onDeleteSuratMasuk,
  selectLetterForDisposisi,
  clearSelectedLetterForDisposisi,
  users = STAFF_LIST,
  onAddUser
}: SuratMasukListProps) {
  
  // UI States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<SuratMasuk | null>(null);
  const [letterToDelete, setLetterToDelete] = useState<SuratMasuk | null>(null);
  const [fileToPreview, setFileToPreview] = useState<SuratMasuk | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [previewMode, setPreviewMode] = useState<'UPLOADED' | 'SYSTEM'>('SYSTEM');
  const [safeBlobUrl, setSafeBlobUrl] = useState<string | null>(null);
  const [viewMethod, setViewMethod] = useState<'VISUAL' | 'IFRAME'>('VISUAL');

  // Edit Modal & Toast States
  const [letterToEdit, setLetterToEdit] = useState<SuratMasuk | null>(null);
  const [editNoAgenda, setEditNoAgenda] = useState('');
  const [editNoSurat, setEditNoSurat] = useState('');
  const [editAsalSurat, setEditAsalSurat] = useState('');
  const [editPenerima, setEditPenerima] = useState('');
  const [editPerihal, setEditPerihal] = useState('');
  const [editRingkasan, setEditRingkasan] = useState('');
  const [editSifat, setEditSifat] = useState<SifatSurat>('BIASA');
  const [editTanggalSurat, setEditTanggalSurat] = useState('');
  const [editTanggalDiterima, setEditTanggalDiterima] = useState('');
  const [editAllowedRecipients, setEditAllowedRecipients] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const openEditModal = (sm: SuratMasuk) => {
    setLetterToEdit(sm);
    setEditNoAgenda(sm.noAgenda || '');
    setEditNoSurat(sm.noSurat);
    setEditAsalSurat(sm.asalSurat);
    setEditPenerima(sm.penerima || '');
    setEditPerihal(sm.perihal);
    setEditRingkasan(sm.ringkasan);
    setEditSifat(sm.sifat);
    setEditTanggalSurat(sm.tanggalSurat);
    setEditTanggalDiterima(sm.tanggalDiterima);
    setEditAllowedRecipients(sm.allowedRecipients || ['Ketua', 'Wakil Ketua', 'Sekretaris', 'Wakil Sekretaris', 'Bendahara']);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterToEdit || !onUpdateSuratMasuk) return;
    const updated: SuratMasuk = {
      ...letterToEdit,
      noAgenda: editNoAgenda.trim() || undefined,
      noSurat: editNoSurat.trim(),
      asalSurat: editAsalSurat.trim(),
      penerima: editPenerima.trim(),
      perihal: editPerihal.trim(),
      ringkasan: editRingkasan.trim(),
      sifat: editSifat,
      tanggalSurat: editTanggalSurat,
      tanggalDiterima: editTanggalDiterima,
      allowedRecipients: editSifat === 'BIASA' ? undefined : editAllowedRecipients,
    };
    onUpdateSuratMasuk(updated);
    setLetterToEdit(null);
    showToast(`Perubahan Surat Masuk "${updated.noSurat}" berhasil disimpan secara permanen!`);
  };

  // Reset viewMethod when preview letter changes
  React.useEffect(() => {
    setViewMethod('VISUAL');
  }, [fileToPreview?.id]);

  // Convert base64 data URL to local object URL for safe iframe/image viewing
  React.useEffect(() => {
    if (!fileToPreview?.fileUrl) {
      setSafeBlobUrl(null);
      return;
    }

    if (!fileToPreview.fileUrl.startsWith('data:')) {
      setSafeBlobUrl(fileToPreview.fileUrl);
      return;
    }

    try {
      const parts = fileToPreview.fileUrl.split(',');
      if (parts.length < 2) {
        setSafeBlobUrl(fileToPreview.fileUrl);
        return;
      }
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (!mimeMatch) {
        setSafeBlobUrl(fileToPreview.fileUrl);
        return;
      }
      const mime = mimeMatch[1];
      const binary = atob(parts[1]);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      const blob = new Blob([new Uint8Array(array)], { type: mime });
      const objectUrl = URL.createObjectURL(blob);
      setSafeBlobUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } catch (err) {
      console.error('Error converting data URI to blob:', err);
      setSafeBlobUrl(fileToPreview.fileUrl);
    }
  }, [fileToPreview?.fileUrl]);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSifat, setFilterSifat] = useState<string>('SEMUA');
  const [filterDisposisi, setFilterDisposisi] = useState<string>('SEMUA'); // SEMUA, BELUM, SUDAH

  // New Letter Form States
  const [newNoAgenda, setNewNoAgenda] = useState('');
  const [newNoSurat, setNewNoSurat] = useState('');
  const [newAsalSurat, setNewAsalSurat] = useState('');
  const [newPenerima, setNewPenerima] = useState('');
  const [newPerihal, setNewPerihal] = useState('');
  const [newTanggalSurat, setNewTanggalSurat] = useState(new Date().toISOString().split('T')[0]);
  const [newTanggalDiterima, setNewTanggalDiterima] = useState(new Date().toISOString().split('T')[0]);
  const [newSifat, setNewSifat] = useState<SifatSurat>('BIASA');
  const [newAllowedRecipients, setNewAllowedRecipients] = useState<string[]>([
    'Ketua', 'Wakil Ketua', 'Sekretaris', 'Wakil Sekretaris', 'Bendahara'
  ]);
  const [newRingkasan, setNewRingkasan] = useState('');
  
  // File upload simulation state
  const [attachedFile, setAttachedFile] = useState<{name: string, size: string, url?: string} | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Disposition Form States (inside detail modal)
  const [dispPenerimaId, setDispPenerimaId] = useState('');
  const [dispInstruksiText, setDispInstruksiText] = useState('');
  const [dispInstruksiTemplate, setDispInstruksiTemplate] = useState('');
  const [dispBatasWaktu, setDispBatasWaktu] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5); // Default 5 days from now
    return d.toISOString().split('T')[0];
  });

  // Custom Staf Pelaksana Form States
  const [isCustomStafFormActive, setIsCustomStafFormActive] = useState(false);
  const [newCustomStafName, setNewCustomStafName] = useState('');
  const [newCustomStafTitle, setNewCustomStafTitle] = useState('Staf Pelaksana');

  const TEMPLATE_INSTRUKSI = [
    'Mohon tindak lanjuti sesuai dengan regulasi yang berlaku.',
    'Harap koordinasikan dengan divisi terkait dan persiapkan laporannya.',
    'Hadiri undangan rapat mewakili Kepala Dinas dan sampaikan poin penting.',
    'Arsipkan dokumen ini dan jadwalkan ke agenda pimpinan.',
    'Siapkan draf balasan surat resmi dalam waktu 3 hari kerja.',
    'Segera pelajari materi ini untuk bahan rapat internal besok.'
  ];

  // If there's an external trigger to write a disposition, open the detail modal and set action
  React.useEffect(() => {
    if (selectLetterForDisposisi) {
      setSelectedLetter(selectLetterForDisposisi);
      // Pre-fill first staff candidate
      const potentialRecipients = users.filter(s => s.role === 'STAF');
      if (potentialRecipients.length > 0) {
        setDispPenerimaId(potentialRecipients[0].id);
      }
    }
  }, [selectLetterForDisposisi, users]);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeKB = Math.round(file.size / 1024);
      const sizeStr = sizeKB > 1024 
        ? `${(sizeKB / 1024).toFixed(1)} MB` 
        : `${sizeKB} KB`;
      
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFile({ 
          name: file.name, 
          size: sizeStr, 
          url: reader.result as string 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeKB = Math.round(file.size / 1024);
      const sizeStr = sizeKB > 1024 
        ? `${(sizeKB / 1024).toFixed(1)} MB` 
        : `${sizeKB} KB`;
      
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFile({ 
          name: file.name, 
          size: sizeStr, 
          url: reader.result as string 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectTemplate = (tmpl: string) => {
    setDispInstruksiTemplate(tmpl);
    setDispInstruksiText(tmpl);
  };

  // Create Letter Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoSurat || !newAsalSurat || !newPerihal || !newRingkasan) {
      alert('Mohon lengkapi semua kolom wajib!');
      return;
    }

    const newLetter: SuratMasuk = {
      id: `sm-${Date.now()}`,
      noAgenda: newNoAgenda.trim() || undefined,
      noSurat: newNoSurat,
      asalSurat: newAsalSurat,
      penerima: newPenerima,
      perihal: newPerihal,
      tanggalSurat: newTanggalSurat,
      tanggalDiterima: newTanggalDiterima,
      sifat: newSifat,
      ringkasan: newRingkasan,
      fileName: attachedFile ? attachedFile.name : 'berkas_surat_terpindai.pdf',
      fileSize: attachedFile ? attachedFile.size : '1.4 MB',
      fileUrl: attachedFile ? attachedFile.url : undefined,
      disposisi: [],
      allowedRecipients: (newSifat === 'RAHASIA' || newSifat === 'SANGAT_RAHASIA') 
        ? (newAllowedRecipients.length > 0 ? newAllowedRecipients : ['Ketua', 'Wakil Ketua', 'Sekretaris', 'Wakil Sekretaris', 'Bendahara'])
        : undefined,
    };

    onAddSuratMasuk(newLetter);
    showToast(`Surat Masuk baru No. "${newLetter.noSurat}" ${newLetter.noAgenda ? `(No. Agenda: ${newLetter.noAgenda})` : ''} berhasil disimpan secara permanen!`);
    
    // Reset Form
    setNewNoAgenda('');
    setNewNoSurat('');
    setNewAsalSurat('');
    setNewPenerima('Kepala Dinas');
    setNewPerihal('');
    setNewRingkasan('');
    setNewSifat('BIASA');
    setNewAllowedRecipients(['Ketua', 'Wakil Ketua', 'Sekretaris', 'Wakil Sekretaris', 'Bendahara']);
    setAttachedFile(null);
    setIsCreateModalOpen(false);
  };

  // Create Disposition Submit
  const handleDisposisiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLetter) return;

    let targetPenerimaId = dispPenerimaId;

    if (isCustomStafFormActive) {
      if (!newCustomStafName.trim()) {
        alert('Silakan isi nama staf pelaksana baru!');
        return;
      }
      if (!newCustomStafTitle.trim()) {
        alert('Silakan isi jabatan/posisi staf pelaksana baru!');
        return;
      }

      // Generate a new user ID
      const newUserId = `u-${Date.now()}`;
      const newCustomUser: User = {
        id: newUserId,
        name: newCustomStafName.trim(),
        role: 'STAF',
        title: newCustomStafTitle.trim(),
        nip: '-',
        status: 'AKTIF',
        password: 'password123'
      };

      if (onAddUser) {
        onAddUser(newCustomUser);
      }
      targetPenerimaId = newUserId;
    } else {
      if (!targetPenerimaId) {
        alert('Silakan pilih pejabat/staf tujuan disposisi!');
        return;
      }
    }

    if (!dispInstruksiText.trim()) {
      alert('Silakan isi instruksi disposisi!');
      return;
    }

    const newDisp: Disposisi = {
      id: `d-${Date.now()}`,
      suratMasukId: selectedLetter.id,
      tanggalDisposisi: new Date().toISOString().split('T')[0],
      pengirimId: currentUser.id,
      penerimaId: targetPenerimaId,
      instruksi: dispInstruksiText,
      batasWaktu: dispBatasWaktu,
      status: 'BELUM_DIPROSES',
    };

    onAddDisposisi(selectedLetter.id, newDisp);

    // Update locally displayed letter object to show the updated disposition list
    const updatedLetter = {
      ...selectedLetter,
      disposisi: [...(selectedLetter.disposisi || []), newDisp]
    };
    setSelectedLetter(updatedLetter);

    // Reset Form State
    setDispInstruksiText('');
    setDispInstruksiTemplate('');
    setIsCustomStafFormActive(false);
    setNewCustomStafName('');
    setNewCustomStafTitle('Staf Pelaksana');
    setDispPenerimaId('');
    alert('Disposisi berhasil dikirimkan!');
  };

  // Export Filtered letters to CSV
  const handleExportCSV = () => {
    // Column Headers
    const headers = ['No', 'No Agenda', 'Nomor Surat', 'Asal Surat', 'Perihal', 'Tanggal Surat', 'Tanggal Diterima', 'Sifat', 'Status Disposisi'];
    
    // Process rows
    const rows = filteredSurat.map((sm, idx) => {
      const hasDisposisi = sm.disposisi && sm.disposisi.length > 0;
      const dispStatus = hasDisposisi 
        ? `Sudah Didisposisi (${sm.disposisi!.length} tujuan)` 
        : 'Belum Didisposisi';
      
      return [
        idx + 1,
        `"${(sm.noAgenda || '-').replace(/"/g, '""')}"`,
        `"${sm.noSurat.replace(/"/g, '""')}"`,
        `"${sm.asalSurat.replace(/"/g, '""')}"`,
        `"${sm.perihal.replace(/"/g, '""')}"`,
        sm.tanggalSurat,
        sm.tanggalDiterima,
        sm.sifat,
        dispStatus
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekapan_Surat_Masuk_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter letters based on search and selected options
  const filteredSurat = suratMasukList.filter(sm => {
    const matchesSearch = 
      (sm.noAgenda && sm.noAgenda.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sm.noSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sm.asalSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sm.penerima && sm.penerima.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sm.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sm.ringkasan.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSifat = filterSifat === 'SEMUA' || sm.sifat === filterSifat;
    
    const hasDisposisi = sm.disposisi && sm.disposisi.length > 0;
    const matchesDisposisi = 
      filterDisposisi === 'SEMUA' ||
      (filterDisposisi === 'BELUM' && !hasDisposisi) ||
      (filterDisposisi === 'SUDAH' && hasDisposisi);

    return matchesSearch && matchesSifat && matchesDisposisi;
  });

  // Count helper statistics
  const totalInFilter = filteredSurat.length;
  const totalSangatRahasia = filteredSurat.filter(s => s.sifat === 'SANGAT_RAHASIA').length;
  const totalPenting = filteredSurat.filter(s => s.sifat === 'PENTING').length;
  const totalBelumDisposisi = filteredSurat.filter(s => !s.disposisi || s.disposisi.length === 0).length;

  const getSifatColor = (sifat: SifatSurat) => {
    switch(sifat) {
      case 'SANGAT_RAHASIA': return 'bg-red-100 text-red-800 border-red-200';
      case 'RAHASIA': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PENTING': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and top tools */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-heading flex items-center gap-2">
            <Inbox className="h-5 w-5 text-indigo-600" /> Rekapan Surat Masuk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen arsip surat masuk dinas, pendaftaran nomor kendali, dan pencetakan lembar disposisi pimpinan.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 smooth-transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Unduh CSV (.csv)
          </button>
          
          {(currentUser.role === 'ADMIN' || currentUser.role === 'STAF' || currentUser.role === 'PIMPINAN') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm smooth-transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Catat Surat Masuk
            </button>
          )}
        </div>
      </div>

      {/* Quick filters statistic counters banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
        <div className="text-center sm:border-r border-slate-200 pb-2 sm:pb-0">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Terfilter</span>
          <p className="text-xl font-bold text-slate-800 mt-1">{totalInFilter} Surat</p>
        </div>
        <div className="text-center sm:border-r border-slate-200 pb-2 sm:pb-0">
          <span className="text-[10px] text-red-500 uppercase font-bold tracking-wider">Sangat Rahasia</span>
          <p className="text-xl font-bold text-red-700 mt-1">{totalSangatRahasia} Surat</p>
        </div>
        <div className="text-center sm:border-r border-slate-200">
          <span className="text-[10px] text-amber-500 uppercase font-bold tracking-wider">Penting</span>
          <p className="text-xl font-bold text-amber-700 mt-1">{totalPenting} Surat</p>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">Belum Disposisi</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{totalBelumDisposisi} Surat</p>
        </div>
      </div>

      {/* Advanced Filtering & Search Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" /> Cari Kata Kunci
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nomor surat, asal pengirim, perihal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Filter Sifat */}
        <div className="w-full md:w-48 space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" /> Sifat Surat
          </label>
          <select
            value={filterSifat}
            onChange={(e) => setFilterSifat(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
          >
            <option value="SEMUA">Semua Sifat</option>
            <option value="SANGAT_RAHASIA">Sangat Rahasia</option>
            <option value="RAHASIA">Rahasia</option>
            <option value="PENTING">Penting</option>
            <option value="BIASA">Biasa</option>
          </select>
        </div>

        {/* Filter Disposisi */}
        <div className="w-full md:w-48 space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" /> Status Disposisi
          </label>
          <select
            value={filterDisposisi}
            onChange={(e) => setFilterDisposisi(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="SUDAH">Sudah Didisposisi</option>
            <option value="BELUM">Belum Didisposisi</option>
          </select>
        </div>
      </div>

      {/* Main Letters Grid/List */}
      {filteredSurat.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-12 text-center text-slate-500">
          <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Tidak ada Surat Masuk</p>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Detail Pengirim & No Surat</th>
                  <th className="py-3 px-4">Perihal / Ringkasan</th>
                  <th className="py-3 px-4">Sifat & Tanggal</th>
                  <th className="py-3 px-4">Aliran Disposisi</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSurat.map((sm) => {
                  const hasDisposisi = sm.disposisi && sm.disposisi.length > 0;
                  return (
                    <tr key={sm.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Column 1: Asal & No Surat */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block line-clamp-2">{sm.asalSurat}</span>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {sm.noAgenda && (
                                <span className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md font-mono" title="Nomor Agenda / Kendali">
                                  Agenda: {sm.noAgenda}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 font-mono block">{sm.noSurat}</span>
                              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded-md">Untuk: {sm.penerima || 'Wakil Sekrtaris Majelis Sinode GMIT'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Column 2: Perihal */}
                      <td className="py-3.5 px-4 max-w-[320px]">
                        <div className="space-y-1.5">
                          <div>
                            <span className="font-bold text-slate-800 block line-clamp-2">{sm.perihal}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5 block line-clamp-1 italic">{sm.ringkasan}</span>
                          </div>
                          
                          {/* File Indicator */}
                          {sm.fileName ? (
                            <button
                              type="button"
                              onClick={() => {
                                setFileToPreview(sm);
                                setZoomLevel(100);
                                setPreviewMode(sm.fileUrl ? 'UPLOADED' : 'SYSTEM');
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:text-indigo-800 text-indigo-700 rounded-lg text-[10px] font-bold cursor-pointer transition-all duration-150 active:scale-95"
                              title="Klik untuk pratinjau berkas lampiran"
                            >
                              <FileText className="h-3 w-3 shrink-0 text-indigo-500 animate-pulse" />
                              <span className="truncate max-w-[130px] font-sans font-semibold" title={sm.fileName}>{sm.fileName}</span>
                              <span className="text-slate-400 font-normal text-[9px]">({sm.fileSize})</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setFileToPreview(sm);
                                setZoomLevel(100);
                                setPreviewMode(sm.fileUrl ? 'UPLOADED' : 'SYSTEM');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 hover:bg-slate-100/80 text-slate-500 rounded-lg text-[10px] font-bold cursor-pointer transition-all duration-150 active:scale-95"
                              title="Lihat draf digital berkas surat"
                            >
                              <AlertCircle className="h-3 w-3 shrink-0 text-slate-400" />
                              <span>Lihat Draf</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Sifat & Tanggal */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <span className={`inline-block text-[9px] font-extrabold border px-2 py-0.5 rounded-md ${getSifatColor(sm.sifat)}`}>
                            {sm.sifat}
                          </span>
                          {(sm.sifat === 'RAHASIA' || sm.sifat === 'SANGAT_RAHASIA') && (
                            <div className="text-[9px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md max-w-[150px]">
                              <span className="text-amber-700 block text-[8px] uppercase tracking-wider">Akses Penerima:</span>
                              <span className="truncate block font-extrabold" title={sm.allowedRecipients?.join(', ') || 'Ketua, Wakil Ketua, Sekretaris, Wakil Sekretaris, Bendahara'}>
                                {sm.allowedRecipients?.length ? sm.allowedRecipients.join(', ') : 'Ketua, Wakil Ketua, Sekretaris, Wakil Sekretaris, Bendahara'}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" /> {sm.tanggalDiterima} (Diterima)
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Disposisi status */}
                      <td className="py-3.5 px-4">
                        {hasDisposisi ? (
                          <div className="space-y-1">
                            {sm.disposisi!.map((disp, idx) => {
                              const receiver = users.find(s => s.id === disp.penerimaId);
                              return (
                                <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                                  <span className={`h-1.5 w-1.5 rounded-full ${
                                    disp.status === 'SELESAI' 
                                      ? 'bg-emerald-500' 
                                      : disp.status === 'SEDANG_DIPROSES' 
                                      ? 'bg-amber-500' 
                                      : 'bg-red-500'
                                  }`} />
                                  <span className="font-semibold text-slate-700">{receiver?.title.replace('Kepala Bidang ', 'Kabid ')}</span>
                                  <span className="text-slate-400">({disp.status.replace('_', ' ')})</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                            <AlertCircle className="h-3.5 w-3.5 text-slate-400" /> Belum ada disposisi
                          </div>
                        )}
                      </td>

                      {/* Column 5: Action */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedLetter(sm);
                              // Set default recipient to Kabid IT
                              const target = STAFF_LIST.find(s => s.role === 'STAF');
                              if (target) setDispPenerimaId(target.id);
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg smooth-transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" /> Detail
                          </button>

                          <button
                            onClick={() => {
                              setFileToPreview(sm);
                              setZoomLevel(100);
                              setPreviewMode(sm.fileUrl ? 'UPLOADED' : 'SYSTEM');
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 rounded-lg smooth-transition cursor-pointer active:scale-95"
                            title="Pratinjau berkas lampiran resmi"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0" /> Lihat File
                          </button>

                          {(currentUser.role === 'ADMIN' || currentUser.role === 'STAF' || currentUser.role === 'PIMPINAN') && (
                            <>
                              <button
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = '.pdf,.jpg,.jpeg,.png,.docx,.xlsx';
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file && onUpdateSuratMasuk) {
                                      const sizeKB = Math.round(file.size / 1024);
                                      const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        onUpdateSuratMasuk({
                                          ...sm,
                                          fileName: file.name,
                                          fileSize: sizeStr,
                                          fileUrl: reader.result as string
                                        });
                                        alert(`Berkas "${file.name}" berhasil diunggah untuk Surat No: ${sm.noSurat}`);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  };
                                  input.click();
                                }}
                                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border smooth-transition cursor-pointer ${
                                  sm.fileName 
                                    ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' 
                                    : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'
                                }`}
                                title={sm.fileName ? 'Ganti berkas lampiran' : 'Unggah berkas lampiran'}
                              >
                                <UploadCloud className="h-3.5 w-3.5 shrink-0" />
                                <span>{sm.fileName ? 'Ganti File' : 'Tambah File'}</span>
                              </button>

                              <button
                                onClick={() => openEditModal(sm)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg smooth-transition cursor-pointer"
                                title="Ubah data surat masuk ini"
                              >
                                <Edit3 className="h-3.5 w-3.5 shrink-0" />
                                <span>Ubah</span>
                              </button>

                              <button
                                onClick={() => setLetterToDelete(sm)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg smooth-transition cursor-pointer"
                                title="Hapus surat masuk"
                              >
                                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                <span>Hapus</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE INCOMING LETTER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Inbox className="h-5 w-5 text-indigo-600" />
                <h3 className="font-heading font-bold text-slate-800 text-base">Catat Surat Masuk Baru</h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Nomor Agenda / Kendali</label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextNum = (suratMasukList.length + 1).toString().padStart(3, '0');
                        setNewNoAgenda(`${nextNum}/AG/${new Date().getFullYear()}`);
                      }}
                      className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      + Otomatis
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: 006/AG/2026 atau 045"
                    value={newNoAgenda}
                    onChange={(e) => setNewNoAgenda(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nomor Surat <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 005/124/DISKOMINFO/2026"
                    value={newNoSurat}
                    onChange={(e) => setNewNoSurat(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Pengirim <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Klasis Kota Kupang"
                    value={newAsalSurat}
                    onChange={(e) => setNewAsalSurat(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Penerima Disposisi <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Wakil Sekrtaris Majelis Sinode GMIT"
                    value={newPenerima}
                    onChange={(e) => setNewPenerima(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Perihal / Judul Surat <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Permohonan Delegasi Peserta Bimtek Teknis"
                  value={newPerihal}
                  onChange={(e) => setNewPerihal(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Tanggal Surat</label>
                  <input
                    type="date"
                    required
                    value={newTanggalSurat}
                    onChange={(e) => setNewTanggalSurat(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Tanggal Diterima</label>
                  <input
                    type="date"
                    required
                    value={newTanggalDiterima}
                    onChange={(e) => setNewTanggalDiterima(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Kategori / Sifat Surat</label>
                  <select
                    value={newSifat}
                    onChange={(e) => setNewSifat(e.target.value as SifatSurat)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="BIASA">Biasa</option>
                    <option value="PENTING">Penting</option>
                    <option value="RAHASIA">Rahasia</option>
                    <option value="SANGAT_RAHASIA">Sangat Rahasia</option>
                  </select>
                </div>
              </div>

              {/* Selection for Secret Letter Recipients when Sifat is RAHASIA or SANGAT_RAHASIA */}
              {(newSifat === 'RAHASIA' || newSifat === 'SANGAT_RAHASIA') && (
                <div className="space-y-2.5 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl animate-slide-down">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span className="p-1 bg-amber-100 text-amber-800 rounded-lg">🔒</span>
                      <span>Pilihan Penerima Yang Boleh Melihat Surat Rahasia Ini:</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (newAllowedRecipients.length === 5) {
                          setNewAllowedRecipients([]);
                        } else {
                          setNewAllowedRecipients(['Ketua', 'Wakil Ketua', 'Sekretaris', 'Wakil Sekretaris', 'Bendahara']);
                        }
                      }}
                      className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                    >
                      {newAllowedRecipients.length === 5 ? 'Batalkan Semua' : 'Pilih Semua (5 Jabatan)'}
                    </button>
                  </div>
                  
                  <p className="text-[11px] text-amber-800/90 leading-tight">
                    Tentukan pejabat/pimpinan yang berhak mengakses dan membaca berkas dokumen surat kategori rahasia ini:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {['Ketua', 'Wakil Ketua', 'Sekretaris', 'Wakil Sekretaris', 'Bendahara'].map((roleName) => {
                      const isChecked = newAllowedRecipients.includes(roleName);
                      return (
                        <label 
                          key={roleName} 
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold shadow-2xs' 
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAllowedRecipients([...newAllowedRecipients, roleName]);
                              } else {
                                setNewAllowedRecipients(newAllowedRecipients.filter(r => r !== roleName));
                              }
                            }}
                            className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                          />
                          <span>{roleName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Ringkasan Pendek Isi Surat <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  placeholder="Isi ringkasan penting atau poin pokok dari surat yang diterima agar memudahkan pimpinan saat disposisi..."
                  value={newRingkasan}
                  onChange={(e) => setNewRingkasan(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Drag and Drop File Upload Simulation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Lampiran Berkas Terpindai (PDF / Gambar)</label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                    dragActive 
                      ? 'border-indigo-500 bg-indigo-50/30' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
                  />
                  
                  {attachedFile ? (
                    <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-lg p-2.5 text-left text-xs max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate">{attachedFile.name}</p>
                          <p className="text-[10px] text-slate-500">{attachedFile.size}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="h-8 w-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">Seret & lepas berkas surat di sini, atau <span className="text-indigo-600 hover:underline">pilih file</span></p>
                      <p className="text-[10px] text-slate-400">PDF, PNG, JPG atau DOCX hingga 10MB (Akan disimulasikan)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 cursor-pointer"
                >
                  Simpan & Daftarkan Surat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAIL SURAT MASUK & DISPOSISI CONTROL */}
      {selectedLetter && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl border border-slate-200 overflow-hidden shadow-2xl my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div>
                <span className={`inline-block text-[9px] font-bold border px-2 py-0.5 rounded-md mb-1 ${getSifatColor(selectedLetter.sifat)}`}>
                  Sifat: {selectedLetter.sifat}
                </span>
                <h3 className="font-heading font-bold text-slate-800 text-base">Lembar Detail & Disposisi Surat Masuk</h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedLetter(null);
                  clearSelectedLetterForDisposisi();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Split layout: Detail (Left) and Dispositions history + action (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 max-h-[70vh] overflow-y-auto">
              
              {/* Left Panel: Letter Metadata (Col span 2) */}
              <div className="p-6 space-y-4 lg:col-span-2 bg-slate-50/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Pengirim (Asal Surat)</span>
                    <div className="text-xs font-bold text-slate-800">{selectedLetter.asalSurat}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide">Penerima (Ditujukan Kepada)</span>
                    <div className="text-xs font-bold text-indigo-700 bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100/40">{selectedLetter.penerima || 'Wakil Sekrtaris Majelis Sinode GMIT'}</div>
                  </div>
                </div>

                {/* Secret letter authorized recipients banner */}
                {(selectedLetter.sifat === 'RAHASIA' || selectedLetter.sifat === 'SANGAT_RAHASIA') && (
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                      <span>🔒</span> Akses Penerima Rahasia:
                    </span>
                    <div className="text-xs font-bold text-amber-900 leading-snug">
                      {selectedLetter.allowedRecipients?.length 
                        ? selectedLetter.allowedRecipients.join(', ') 
                        : 'Ketua, Wakil Ketua, Sekretaris, Wakil Sekretaris, Bendahara'}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Perihal Surat</span>
                  <div className="text-xs font-semibold text-slate-800 leading-relaxed">{selectedLetter.perihal}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedLetter.noAgenda && (
                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">Nomor Agenda / Kendali Surat</span>
                      <div className="text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200/80 p-2 rounded-lg">
                        {selectedLetter.noAgenda}
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Nomor Surat</span>
                    <div className="text-xs font-mono font-semibold text-slate-700 bg-white border border-slate-100 p-2 rounded-lg truncate">
                      {selectedLetter.noSurat}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Tanggal Diterima</span>
                    <div className="text-xs text-slate-700 bg-white border border-slate-100 p-2 rounded-lg">
                      {selectedLetter.tanggalDiterima}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Tanggal Dokumen Surat</span>
                  <div className="text-xs text-slate-700">{selectedLetter.tanggalSurat}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Ringkasan Pokok Surat</span>
                  <div className="text-xs text-slate-600 bg-white border border-slate-100 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                    {selectedLetter.ringkasan}
                  </div>
                </div>

                {/* Checklist Jabatan Pimpinan */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <ClipboardList className="h-4 w-4 text-indigo-600" />
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Lembar Disposisi: Checklist Jabatan Pimpinan</span>
                  </div>
                  
                  <div className="space-y-3">
                    {(() => {
                      // Filter users to only those with leadership/pimpinan positions
                      const pimpinanUsers = users.filter(u => 
                        u.role === 'PIMPINAN' || 
                        u.role === 'ADMIN' ||
                        u.title.toLowerCase().includes('kepala') ||
                        u.title.toLowerCase().includes('sekretaris') ||
                        u.title.toLowerCase().includes('kabid') ||
                        u.title.toLowerCase().includes('kasi') ||
                        u.title.toLowerCase().includes('pimpinan') ||
                        u.title.toLowerCase().includes('ketua')
                      );

                      return pimpinanUsers.map((leader) => {
                        const isAssigned = selectedLetter.disposisi?.some(d => d.penerimaId === leader.id);
                        const assignmentInfo = selectedLetter.disposisi?.find(d => d.penerimaId === leader.id);

                        return (
                          <div key={leader.id} className="flex items-start gap-2.5 text-xs">
                            <div className="mt-0.5 shrink-0">
                              {isAssigned ? (
                                <div className="h-4 w-4 rounded-md bg-emerald-500 flex items-center justify-center text-white">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="h-4 w-4 rounded-md border border-slate-300 bg-slate-50" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 leading-normal">
                              <p className={`font-semibold ${isAssigned ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                                {leader.title}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {leader.name}
                              </p>
                              {isAssigned && assignmentInfo && (
                                <span className="inline-block mt-1 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-sm">
                                  Status: {assignmentInfo.status.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* File Attachment simulation */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Berkas Lampiran Surat</span>
                  {selectedLetter.fileName ? (
                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-5 w-5 text-indigo-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate" title={selectedLetter.fileName}>{selectedLetter.fileName}</p>
                          <p className="text-[10px] text-slate-500">{selectedLetter.fileSize || '1.2 MB'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => alert(`Mengunduh berkas: ${selectedLetter.fileName}`)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100/50 rounded-lg cursor-pointer"
                          title="Simulasi download file"
                        >
                          <Download className="h-4.5 w-4.5" />
                        </button>
                        {(currentUser.role === 'ADMIN' || currentUser.role === 'STAF' || currentUser.role === 'PIMPINAN') && (
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.pdf,.jpg,.jpeg,.png,.docx,.xlsx';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file && onUpdateSuratMasuk) {
                                  const sizeKB = Math.round(file.size / 1024);
                                  const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
                                  const updated = {
                                    ...selectedLetter,
                                    fileName: file.name,
                                    fileSize: sizeStr
                                  };
                                  onUpdateSuratMasuk(updated);
                                  setSelectedLetter(updated);
                                  alert('Berkas lampiran surat berhasil diperbarui!');
                                }
                              };
                              input.click();
                            }}
                            className="px-2 py-1 text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer"
                            title="Ganti berkas"
                          >
                            Ganti Berkas
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs bg-white">
                      <AlertCircle className="h-5 w-5 text-slate-300 mx-auto mb-1.5" />
                      <p className="font-semibold text-slate-700">Belum ada berkas lampiran</p>
                      {(currentUser.role === 'ADMIN' || currentUser.role === 'STAF' || currentUser.role === 'PIMPINAN') ? (
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.pdf,.jpg,.jpeg,.png,.docx,.xlsx';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file && onUpdateSuratMasuk) {
                                const sizeKB = Math.round(file.size / 1024);
                                const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
                                const updated = {
                                  ...selectedLetter,
                                  fileName: file.name,
                                  fileSize: sizeStr
                                };
                                onUpdateSuratMasuk(updated);
                                setSelectedLetter(updated);
                                alert('Berkas lampiran surat berhasil ditambahkan!');
                              }
                            };
                            input.click();
                          }}
                          className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg smooth-transition cursor-pointer"
                        >
                          <UploadCloud className="h-3.5 w-3.5" /> Unggah Berkas
                        </button>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-1">Silakan minta Admin/Sekretaris atau Staf untuk mengunggah berkas.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Dispositions Feed and Form (Col span 3) */}
              <div className="p-6 space-y-6 lg:col-span-3">
                
                {/* 1. Existing Dispositions Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ClipboardList className="h-4 w-4 text-indigo-600" /> Riwayat Instruksi Disposisi ({selectedLetter.disposisi?.length || 0})
                  </h4>

                  {!selectedLetter.disposisi || selectedLetter.disposisi.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                      <AlertCircle className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                      Belum ada disposisi pimpinan untuk surat ini.
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                      {selectedLetter.disposisi.map((disp, idx) => {
                        const sender = users.find(s => s.id === disp.pengirimId);
                        const receiver = users.find(s => s.id === disp.penerimaId);
                        return (
                          <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-slate-700">{sender?.name.split(',')[0]}</span>
                                <ArrowRight className="h-3 w-3 text-slate-400" />
                                <span className="font-bold text-indigo-700">{receiver?.title}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-md font-bold border ${
                                disp.status === 'SELESAI' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                  : disp.status === 'SEDANG_DIPROSES' 
                                  ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                  : 'bg-red-50 text-red-700 border-red-100'
                              }`}>
                                {disp.status.replace('_', ' ')}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 bg-white p-2 border border-slate-100 rounded-lg italic">
                              "{disp.instruksi}"
                            </p>

                            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5">
                              <span>Tgl Disposisi: {disp.tanggalDisposisi}</span>
                              <span className="text-red-600 font-semibold">Tenggat Tindak Lanjut: {disp.batasWaktu}</span>
                            </div>

                            {disp.catatanTindakLanjut && (
                              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-2 text-[11px]">
                                <strong className="text-emerald-800">Umpan Balik Tindak Lanjut:</strong>
                                <p className="text-slate-600 mt-0.5">{disp.catatanTindakLanjut}</p>
                                {disp.tanggalSelesai && <span className="text-[9px] text-emerald-600 mt-1 block">Selesai pada: {disp.tanggalSelesai}</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Write New Disposition Form (PIMPINAN ONLY) */}
                {currentUser.role === 'PIMPINAN' && (
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3 text-xs">
                      <h5 className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                        <Clock className="h-4 w-4 text-amber-700" /> Hak Khusus Pimpinan: Tambah Disposisi
                      </h5>
                      <p className="text-amber-700 text-[11px]">
                        Isi formulir di bawah untuk mendelegasikan surat ini ke pejabat/staf pelaksana dengan disposisi tertulis.
                      </p>
                    </div>

                    <form onSubmit={handleDisposisiSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Target Staf */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-600 uppercase">Diteruskan Kepada (Staf Pelaksana)</label>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomStafFormActive(!isCustomStafFormActive);
                                setDispPenerimaId('');
                              }}
                              className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                            >
                              {isCustomStafFormActive ? '← Pilih dari Daftar' : '+ Tambah Staf Baru'}
                            </button>
                          </div>

                          {isCustomStafFormActive ? (
                            <div className="space-y-2 p-2 border border-indigo-100 rounded-lg bg-indigo-50/20">
                              <input
                                type="text"
                                placeholder="Nama Lengkap Staf Pelaksana"
                                required={isCustomStafFormActive}
                                value={newCustomStafName}
                                onChange={(e) => setNewCustomStafName(e.target.value)}
                                className="w-full text-xs border border-slate-200 rounded-md p-1.5 bg-white focus:ring-1 focus:ring-indigo-300 focus:outline-hidden"
                              />
                              <input
                                type="text"
                                placeholder="Jabatan / Posisi (e.g. Staf Pelaksana)"
                                required={isCustomStafFormActive}
                                value={newCustomStafTitle}
                                onChange={(e) => setNewCustomStafTitle(e.target.value)}
                                className="w-full text-xs border border-slate-200 rounded-md p-1.5 bg-white focus:ring-1 focus:ring-indigo-300 focus:outline-hidden"
                              />
                            </div>
                          ) : (
                            <select
                              required={!isCustomStafFormActive}
                              value={dispPenerimaId}
                              onChange={(e) => setDispPenerimaId(e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                            >
                              <option value="">-- Pilih Pejabat / Staf --</option>
                              {users.filter(s => s.id !== currentUser.id).map(s => (
                                <option key={s.id} value={s.id}>{s.title} ({s.name.split(',')[0]})</option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Deadline */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase">Tenggat Waktu Selesai</label>
                          <input
                            type="date"
                            required
                            value={dispBatasWaktu}
                            onChange={(e) => setDispBatasWaktu(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                          />
                        </div>
                      </div>

                      {/* Templates list */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Pilihan Cepat Instruksi Standar</label>
                        <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto p-1 border border-slate-100 rounded-lg">
                          {TEMPLATE_INSTRUKSI.map((tmpl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectTemplate(tmpl)}
                              className={`text-[9px] px-2 py-1 rounded-md border text-left truncate max-w-[200px] hover:bg-slate-50 cursor-pointer ${
                                dispInstruksiTemplate === tmpl ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium' : 'bg-white text-slate-600 border-slate-200'
                              }`}
                              title={tmpl}
                            >
                              {tmpl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Instruction text area */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Instruksi / Catatan Tambahan</label>
                        <textarea
                          required
                          rows={2.5}
                          placeholder="Ketik instruksi pimpinan secara mendetail di sini..."
                          value={dispInstruksiText}
                          onChange={(e) => {
                            setDispInstruksiText(e.target.value);
                            setDispInstruksiTemplate('');
                          }}
                          className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Kirim Lembar Disposisi <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Staf notification when viewing */}
                {currentUser.role === 'STAF' && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-500">
                    <p>
                      💡 <strong>Petunjuk Tindak Lanjut:</strong> Jika salah satu disposisi di atas ditujukan untuk Anda, silakan beralih ke halaman <strong>"Kotak Disposisi"</strong> di navigasi samping untuk melaporkan kemajuan pengerjaan surat ini.
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedLetter(null);
                  clearSelectedLetterForDisposisi();
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2.5: EDIT SURAT MASUK MODAL */}
      {letterToEdit && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 overflow-hidden shadow-2xl my-8 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 bg-amber-50 border-b border-amber-100">
              <div className="flex items-center gap-2 text-amber-800">
                <Edit3 className="h-5 w-5 text-amber-600" />
                <h3 className="font-heading font-bold text-base">Ubah Data Surat Masuk</h3>
              </div>
              <button 
                type="button"
                onClick={() => setLetterToEdit(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Setiap perubahan yang Anda simpan akan secara langsung tersimpan permanen di dalam sistem kearsipan.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nomor Agenda</label>
                  <input
                    type="text"
                    value={editNoAgenda}
                    onChange={(e) => setEditNoAgenda(e.target.value)}
                    placeholder="Contoh: 001/AG/2026"
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nomor Surat <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editNoSurat}
                    onChange={(e) => setEditNoSurat(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Sifat Surat <span className="text-rose-500">*</span></label>
                  <select
                    value={editSifat}
                    onChange={(e) => setEditSifat(e.target.value as SifatSurat)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 font-semibold"
                  >
                    <option value="BIASA">BIASA (Umum)</option>
                    <option value="PENTING">PENTING</option>
                    <option value="RAHASIA">RAHASIA</option>
                    <option value="SANGAT_RAHASIA">SANGAT RAHASIA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Asal Pengirim <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editAsalSurat}
                    onChange={(e) => setEditAsalSurat(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Penerima Ditujukan</label>
                  <input
                    type="text"
                    value={editPenerima}
                    onChange={(e) => setEditPenerima(e.target.value)}
                    placeholder="Ketua / Sekretaris / Majelis Sinode"
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Tanggal Surat <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={editTanggalSurat}
                    onChange={(e) => setEditTanggalSurat(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Tanggal Diterima <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={editTanggalDiterima}
                    onChange={(e) => setEditTanggalDiterima(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Perihal Surat <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editPerihal}
                  onChange={(e) => setEditPerihal(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Ringkasan / Isi Pokok <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={editRingkasan}
                  onChange={(e) => setEditRingkasan(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLetterToEdit(null)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="h-4 w-4" /> Simpan Perubahan Permanen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {letterToDelete && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 overflow-hidden shadow-2xl my-8 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 bg-rose-50 border-b border-rose-100">
              <div className="flex items-center gap-2 text-rose-700">
                <Trash2 className="h-5 w-5" />
                <h3 className="font-heading font-bold text-base">Konfirmasi Hapus Surat</h3>
              </div>
              <button 
                onClick={() => setLetterToDelete(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus data surat masuk berikut secara permanen? Perubahan ini akan langsung disimpan dan tidak dapat dibatalkan.
              </p>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Nomor Surat</span>
                  <span className="font-semibold text-slate-800 font-mono">{letterToDelete.noSurat}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Asal Pengirim</span>
                  <span className="font-semibold text-slate-800">{letterToDelete.asalSurat}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Perihal</span>
                  <span className="font-semibold text-slate-800 line-clamp-2">{letterToDelete.perihal}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLetterToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteSuratMasuk) {
                    const deletedNo = letterToDelete.noSurat;
                    onDeleteSuratMasuk(letterToDelete.id);
                    showToast(`Data Surat Masuk No. "${deletedNo}" berhasil dihapus secara permanen!`);
                  }
                  setLetterToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" /> Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING PERMANENT SAVE TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-100">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* MODAL: HIGH FIDELITY DOCUMENT PREVIEW */}
      {fileToPreview && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col justify-between p-0 z-50 overflow-hidden animate-fade-in">
          
          {/* Top Control Header Bar */}
          <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold font-heading text-slate-100 truncate flex items-center gap-2">
                  <span>Pratinjau Berkas Kearsipan Digital</span>
                  <span className="text-[9px] bg-indigo-500/35 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full border border-indigo-400/20 uppercase tracking-wider">
                    {fileToPreview.fileName ? 'Lampiran Dokumen' : 'Draf Kearsipan'}
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  No: {fileToPreview.noSurat} | Dari: {fileToPreview.asalSurat}
                </p>
              </div>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Document Source Toggle */}
              {fileToPreview.fileUrl && (
                <div className="flex items-center bg-slate-800 border border-slate-700 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('UPLOADED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      previewMode === 'UPLOADED'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    <UploadCloud className="h-3.5 w-3.5" /> File Terupload
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('SYSTEM')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      previewMode === 'SYSTEM'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" /> Kop Surat Sistem
                  </button>
                </div>
              )}

              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-800 border border-slate-700 p-1 rounded-xl">
                <button
                  type="button"
                  disabled={zoomLevel <= 50}
                  onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"
                  title="Perkecil Pratinjau"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-300 w-10 text-center select-none">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  disabled={zoomLevel >= 150}
                  onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"
                  title="Perbesar Pratinjau"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl transition cursor-pointer"
                title="Cetak Berkas"
              >
                <Printer className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => {
                  alert(`Mengunduh berkas arsip: ${fileToPreview.fileName || `${fileToPreview.id}.pdf`}`);
                }}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition cursor-pointer shadow-sm"
                title="Unduh Berkas PDF"
              >
                <Download className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setFileToPreview(null)}
                className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition cursor-pointer shadow-sm ml-2.5"
                title="Tutup Pratinjau"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Central Workspace for document viewing */}
          <div className="flex-1 overflow-y-auto bg-slate-900/90 p-4 sm:p-10 flex justify-center items-start">
            
            {previewMode === 'UPLOADED' && fileToPreview.fileUrl ? (
              <div 
                style={{ width: `${zoomLevel}%`, maxWidth: '850px' }}
                className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-6 text-slate-800 transition-all duration-200 flex flex-col items-center justify-center animate-scale-up w-full"
              >
                {fileToPreview.fileUrl.startsWith('data:image/') || (safeBlobUrl && safeBlobUrl.startsWith('blob:') && fileToPreview.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                  <img 
                    src={safeBlobUrl || fileToPreview.fileUrl} 
                    alt={fileToPreview.fileName} 
                    className="max-w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-xs border border-slate-100" 
                  />
                ) : (
                  <div className="w-full h-[75vh] relative flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden font-sans">
                    {/* Top alert inside PDF frame to guide user */}
                    <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2.5 flex items-center justify-between text-[11px] text-indigo-800">
                      <div className="flex items-center gap-1.5 font-sans font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                        <span>Pratinjau Berkas Unggahan Resmi ({fileToPreview.fileName}). Jika pratinjau tidak muncul di browser Anda, gunakan tombol di bawah.</span>
                      </div>
                    </div>
                    <iframe 
                      src={safeBlobUrl || fileToPreview.fileUrl} 
                      className="w-full flex-1 border-0 bg-white" 
                      title={fileToPreview.fileName} 
                    />
                  </div>
                )}
                
                <div className="mt-4 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl font-sans">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <FileText className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    <span>Berkas Lampiran Hasil Upload: <strong className="font-semibold text-slate-950">{fileToPreview.fileName}</strong> ({fileToPreview.fileSize})</span>
                  </div>
                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0">
                    <a
                      href={safeBlobUrl || fileToPreview.fileUrl}
                      download={fileToPreview.fileName}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 text-center justify-center"
                    >
                      <Download className="h-3.5 w-3.5" /> Unduh Berkas
                    </a>
                    <a
                      href={safeBlobUrl || fileToPreview.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 text-center justify-center"
                    >
                      <Eye className="h-3.5 w-3.5" /> Buka di Tab Baru
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* The A4 Sheet */
              <div 
                style={{ width: `${zoomLevel}%`, maxWidth: '780px' }}
                className="bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden px-6 sm:px-14 py-8 sm:py-16 text-slate-800 transition-all duration-200 min-h-[960px] relative animate-scale-up"
                id="printed-document-sheet"
              >
              
              {/* WATERMARK BACKGROUND FOR SYSTEM DRAFT */}
              {!fileToPreview.fileName && (
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                  <div className="text-slate-800 border-[10px] border-slate-800 font-sans font-extrabold text-[4.5rem] tracking-wider uppercase rotate-[-35deg] px-12 py-6 rounded-3xl border-dashed">
                    ARSIP SISTEM
                  </div>
                </div>
              )}

              {/* 1. KOP SURAT (LETTERHEAD) */}
              {(() => {
                const isSynode = fileToPreview.asalSurat.toLowerCase().includes('majelis') || fileToPreview.asalSurat.toLowerCase().includes('gmit') || fileToPreview.asalSurat.toLowerCase().includes('sinode');
                const isGov = fileToPreview.asalSurat.toLowerCase().includes('dinas') || fileToPreview.asalSurat.toLowerCase().includes('kota') || fileToPreview.asalSurat.toLowerCase().includes('pemerintah') || fileToPreview.asalSurat.toLowerCase().includes('kementerian');
                
                if (isSynode) {
                  return (
                    <div className="text-center space-y-1 pb-4 border-b-4 border-double border-slate-800 relative z-10">
                      <p className="text-xs font-semibold tracking-wide font-sans text-slate-500">GEREJA MASEHI INJILI DI TIMOR</p>
                      <h2 className="text-base sm:text-lg font-extrabold tracking-tight font-heading text-slate-900 leading-tight">MAJELIS SINODE GMIT</h2>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Jl. Upah-upah No. 128, Kupang, Nusa Tenggara Timur, Indonesia
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono">
                        Telp: (0380) 881234 | Fax: (0380) 881235 | Email: info@sinodegmit.or.id | Website: gmit.or.id
                      </p>
                    </div>
                  );
                } else if (isGov) {
                  return (
                    <div className="text-center space-y-1 pb-4 border-b-4 border-double border-slate-800 relative z-10">
                      <p className="text-xs font-bold tracking-wide font-sans text-slate-700">PEMERINTAH PROVINSI NUSA TENGGARA TIMUR</p>
                      <h2 className="text-base sm:text-lg font-extrabold tracking-tight font-heading text-slate-900 leading-tight">
                        {fileToPreview.asalSurat.toUpperCase()}
                      </h2>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Jl. El Tari No. 52, Kel. Oebobo, Kota Kupang, Nusa Tenggara Timur
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono">
                        Telp: (0380) 855421 | Email: sekretariat@nttprov.go.id | Website: nttprov.go.id
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center space-y-1 pb-4 border-b-4 border-double border-slate-800 relative z-10">
                      <h2 className="text-base sm:text-lg font-extrabold tracking-tight font-heading text-slate-900 leading-tight">
                        {fileToPreview.asalSurat.toUpperCase()}
                      </h2>
                      <p className="text-xs font-semibold tracking-wide font-sans text-slate-500">ADMINISTRASI KEARSIPAN RESMI</p>
                      <p className="text-[10px] text-slate-400">
                        Dokumen Terintegrasi Sistem Lembar Disposisi Elektronik (E-Disposisi)
                      </p>
                    </div>
                  );
                }
              })()}

              {/* 2. DATE & METADATA SECTION */}
              <div className="mt-8 grid grid-cols-2 gap-4 text-xs font-sans relative z-10">
                <div className="space-y-1.5">
                  {fileToPreview.noAgenda && (
                    <div className="flex gap-2">
                      <span className="w-20 font-semibold text-slate-500">No. Agenda</span>
                      <span className="text-amber-900 font-bold font-mono">: {fileToPreview.noAgenda}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="w-20 font-semibold text-slate-500">Nomor</span>
                    <span className="text-slate-800 font-semibold font-mono">: {fileToPreview.noSurat}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 font-semibold text-slate-500">Sifat</span>
                    <span className="text-slate-800 font-semibold">: {fileToPreview.sifat}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 font-semibold text-slate-500">Lampiran</span>
                    <span className="text-slate-800">: 1 (satu) Lembar</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 font-semibold text-slate-500">Hal</span>
                    <span className="text-slate-800 font-extrabold">: {fileToPreview.perihal}</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <p className="font-semibold text-slate-700">Kupang, {fileToPreview.tanggalSurat}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Diterima: {fileToPreview.tanggalDiterima}</p>
                </div>
              </div>

              {/* 3. RECIPIENT */}
              <div className="mt-8 text-xs font-sans space-y-1 relative z-10">
                <p className="font-semibold text-slate-500">Kepada Yang Terhormat,</p>
                <p className="font-extrabold text-slate-900 text-sm">{fileToPreview.penerima || 'Wakil Sekrtaris Majelis Sinode GMIT'}</p>
                <p className="text-slate-500 text-xs">di -</p>
                <p className="font-bold text-slate-700 pl-4 text-xs">Kupang</p>
              </div>

              {/* 4. LETTER BODY */}
              <div className="mt-10 text-xs leading-relaxed font-sans space-y-4 text-justify relative z-10">
                <p className="indent-8 text-slate-800">
                  Dengan hormat, sehubungan dengan koordinasi kedinasan, administrasi surat menyurat, serta efektivitas pelaksanaan tugas pokok kearsipan di lingkungan kerja kami, dengan ini disampaikan permohonan koordinasi serta tindak lanjut terkait agenda <strong>"{fileToPreview.perihal}"</strong>.
                </p>

                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 my-6 space-y-2.5">
                  <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block">Ringkasan Pokok Isi Dokumen:</span>
                  <p className="text-slate-600 font-medium italic leading-relaxed text-xs">
                    "{fileToPreview.ringkasan}"
                  </p>
                </div>

                <p className="indent-8 text-slate-800">
                  Kiranya dokumen kearsipan ini dapat dipelajari, didisposisikan, serta dikoordinasikan secara internal bersama dengan segenap staf pelaksana terkait. Kami berharap proses tindak lanjut dapat dilakukan dengan penuh tanggung jawab demi kelancaran tugas pelayanan administratif kita bersama.
                </p>

                <p className="indent-8 text-slate-800">
                  Demikian surat penyampaian koordinasi ini kami buat untuk dapat dipergunakan sebagaimana mestinya. Atas perhatian, arahan, kearifan, serta kerja sama yang baik dari Bapak/Ibu Pimpinan, kami mengucapkan limpah terima kasih.
                </p>
              </div>

              {/* 5. SIGNATURE & CAP BLOCK */}
              <div className="mt-14 flex justify-end relative z-10">
                <div className="w-56 text-center text-xs space-y-1 font-sans relative">
                  <p className="text-slate-600">Hormat Kami,</p>
                  <p className="font-bold text-slate-900">{fileToPreview.asalSurat}</p>
                  
                  {/* Visual Stamp Seal & Sign simulation */}
                  <div className="relative h-24 flex items-center justify-center select-none py-1.5">
                    {/* Fake blue scribble pen signature line */}
                    <div className="absolute text-indigo-800/20 text-4xl font-serif tracking-widest font-bold italic rotate-[-12deg]">
                      _Detha_n_
                    </div>

                    {/* Official Blue ink Round Seal */}
                    <div className="absolute h-20 w-20 rounded-full border-4 border-indigo-600/30 flex flex-col items-center justify-center text-center rotate-[-15deg] p-1 bg-white/20 backdrop-blur-3xs">
                      <div className="text-[7px] text-indigo-600 font-extrabold uppercase leading-none tracking-widest">
                        TERVERIFIKASI
                      </div>
                      <div className="h-1 w-12 bg-indigo-600/30 my-0.5" />
                      <div className="text-[5px] text-indigo-500 font-mono tracking-tight leading-none">
                        E-DISPOSISI<br />SINO-GMIT
                      </div>
                    </div>
                  </div>

                  <p className="font-bold text-slate-800 border-b border-slate-300 pb-1 uppercase">
                    PIMPINAN INSTANSI
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    NIP / ID. {fileToPreview.id.replace('sm-', '2026') || '20261307001'}
                  </p>
                </div>
              </div>

            </div>
          )}

          </div>

          {/* Bottom Help Notice */}
          <div className="bg-slate-900 text-slate-400 text-center py-2.5 text-[10px] font-medium border-t border-slate-800">
            Arsip Digital Tersertifikasi • Cetak dengan tombol pencetak di atas atau klik unduh untuk file .pdf asli
          </div>

        </div>
      )}

    </div>
  );
}
