import { SuratMasuk, SuratKeluar, Disposisi, MenuPermission } from './types';

// Let's seed initial dispositions
const initialDisposisi1: Disposisi = {
  id: 'd1',
  suratMasukId: 'sm1',
  tanggalDisposisi: '2026-07-02',
  pengirimId: 'u1', // Dr. H. Ahmad Fauzi
  penerimaId: 'u3', // Budi Santoso (Kabid IT)
  instruksi: 'Harap hadir mewakili saya, koordinasikan dengan tim IT, dan buat laporan hasil rapat setelah selesai.',
  batasWaktu: '2026-07-10',
  status: 'SEDANG_DIPROSES',
  catatanTindakLanjut: 'Konfirmasi kehadiran sudah dikirim ke panitia provinsi. Materi presentasi sedang dipersiapkan oleh tim IT.',
};

const initialDisposisi2: Disposisi = {
  id: 'd2',
  suratMasukId: 'sm4',
  tanggalDisposisi: '2026-07-05',
  pengirimId: 'u1', // Dr. H. Ahmad Fauzi
  penerimaId: 'u4', // Indah Lestari (Kabid Umum)
  instruksi: 'Segera lakukan pencatatan aset inventaris dan laporkan datanya sebelum pertengahan bulan.',
  batasWaktu: '2026-07-15',
  status: 'BELUM_DIPROSES',
};

const initialDisposisi3: Disposisi = {
  id: 'd3',
  suratMasukId: 'sm3',
  tanggalDisposisi: '2026-07-01',
  pengirimId: 'u1', // Dr. H. Ahmad Fauzi
  penerimaId: 'u4', // Indah Lestari (Kabid Umum)
  instruksi: 'Verifikasi kelengkapan berkas administratif. Jika memenuhi syarat, koordinasikan dengan BKD.',
  batasWaktu: '2026-07-08',
  status: 'SELESAI',
  catatanTindakLanjut: 'Berkas telah diverifikasi lengkap dan dinyatakan memenuhi syarat. Surat rekomendasi pengantar telah dikirim ke BKD.',
  tanggalSelesai: '2026-07-06',
};

export const INITIAL_SURAT_MASUK: SuratMasuk[] = [
  {
    id: 'sm1',
    noAgenda: '001/AG/2026',
    noSurat: '005/321/DISKOMINFO-PROV/VI/2026',
    asalSurat: 'Dinas Komunikasi & Informatika Provinsi Jawa Barat',
    penerima: 'Kepala Dinas',
    perihal: 'Undangan Rapat Koordinasi Sinergitas Program Satu Data Nasional 2026',
    tanggalSurat: '2026-06-28',
    tanggalDiterima: '2026-07-01',
    sifat: 'PENTING',
    ringkasan: 'Undangan rapat tatap muka koordinasi sinergitas program Satu Data tingkat daerah yang akan dilaksanakan pada tanggal 11 Juli 2026 bertempat di Gedung Sate, Bandung.',
    fileName: 'Undangan_Rakor_Satu_Data_2026.pdf',
    fileSize: '1.2 MB',
    disposisi: [initialDisposisi1],
  },
  {
    id: 'sm2',
    noAgenda: '002/AG/2026',
    noSurat: '110/PTIS/PROP-DEV/VII/2026',
    asalSurat: 'PT Inovasi Solusindo Persada',
    penerima: 'Kepala Dinas',
    perihal: 'Proposal Kerjasama Pengolahan Data & Pengembangan Portal Desa Digital',
    tanggalSurat: '2026-07-03',
    tanggalDiterima: '2026-07-05',
    sifat: 'BIASA',
    ringkasan: 'Penawaran kemitraan strategis tanpa biaya APBD untuk implementasi sistem administrasi desa digital, pengelolaan persuratan mandiri tingkat RW, dan sistem e-kiosk pelayanan publik di 15 desa binaan.',
    fileName: 'Proposal_Kemitraan_Desa_Digital.pdf',
    fileSize: '4.8 MB',
    disposisi: [], // Belum didisposisikan (BUTUH DISPOSISI!)
  },
  {
    id: 'sm3',
    noAgenda: '003/AG/2026',
    noSurat: '800/145/PEG-KAB/VI/2026',
    asalSurat: 'Kementerian Dalam Negeri - Biro Kepegawaian',
    penerima: 'Sekretaris Dinas',
    perihal: 'Pemberitahuan Program Beasiswa S2 Tugas Belajar Dalam & Luar Negeri TA 2026/2027',
    tanggalSurat: '2026-06-25',
    tanggalDiterima: '2026-06-29',
    sifat: 'BIASA',
    ringkasan: 'Informasi pembukaan seleksi program beasiswa pendidikan tingkat master (S2) bagi Aparatur Sipil Negara (PNS) daerah dengan kuota kerjasama universitas nasional unggulan maupun luar negeri.',
    fileName: 'Brosur_Beasiswa_S2_Kemendagri.pdf',
    fileSize: '2.5 MB',
    disposisi: [initialDisposisi3],
  },
  {
    id: 'sm4',
    noAgenda: '004/AG/2026',
    noSurat: '090/512/BPKAD-ASET/VII/2026',
    asalSurat: 'Badan Pengelola Keuangan dan Aset Daerah (BPKAD)',
    penerima: 'Kepala Bidang Umum',
    perihal: 'Surat Edaran Inventarisasi dan Rekonsiliasi Aset Milik Daerah Semester I',
    tanggalSurat: '2026-07-01',
    tanggalDiterima: '2026-07-04',
    sifat: 'RAHASIA',
    ringkasan: 'Instruksi pelaksanaan sensus inventarisasi fisik barang milik daerah, pencocokan nomor registrasi sarana transportasi dinas, serta pelaporan sisa nilai depresiasi komputer operasional dinas.',
    fileName: 'SE_BPKAD_Rekonsiliasi_Aset_S1.pdf',
    fileSize: '850 KB',
    disposisi: [initialDisposisi2],
    allowedRecipients: ['Ketua', 'Wakil Ketua', 'Sekretaris', 'Wakil Sekretaris', 'Bendahara'],
  },
  {
    id: 'sm5',
    noAgenda: '005/AG/2026',
    noSurat: '411.2/094/DPMD/VII/2026',
    asalSurat: 'Dinas Pemberdayaan Masyarakat dan Desa Provinsi',
    penerima: 'Kepala Dinas',
    perihal: 'Permohonan Data Evaluasi Perkembangan Status Indeks Desa Membangun (IDM)',
    tanggalSurat: '2026-07-05',
    tanggalDiterima: '2026-07-07',
    sifat: 'BIASA',
    ringkasan: 'Permohonan pengisian borang data indikator penunjang indeks ketahanan sosial dan ketahanan ekonomi desa tahun buku 2025 guna penilaian klasifikasi desa mandiri terupdate.',
    fileName: 'Format_Form_IDM_2026.xlsx',
    fileSize: '410 KB',
    disposisi: [], // Belum didisposisikan (BUTUH DISPOSISI!)
  },
];

export const INITIAL_SURAT_KELUAR: SuratKeluar[] = [
  {
    id: 'sk1',
    noSurat: '005/0142/SEKR-UM/VII/2026',
    penerima: 'Kepala Dinas Komunikasi & Informatika Provinsi Jawa Barat',
    perihal: 'Surat Konfirmasi Kehadiran Rapat Koordinasi Sinergitas Program Satu Data',
    tanggalSurat: '2026-07-03',
    tanggalDikirim: '2026-07-03',
    sifat: 'PENTING',
    ringkasan: 'Menyampaikan konfirmasi kesediaan untuk menghadiri Rapat Koordinasi Satu Data Nasional di Bandung, yang akan diwakili oleh Kepala Bidang IT & Komunikasi (Budi Santoso, S.Kom.).',
    status: 'DIKIRIM',
    fileName: 'Surat_Balasan_Rakor_SatuData.pdf',
    fileSize: '420 KB',
  },
  {
    id: 'sk2',
    noSurat: '800/0150/SK-TUGAS/VII/2026',
    penerima: 'Budi Santoso, S.Kom. (NIP. 19850312 201101 1 003)',
    perihal: 'Surat Perintah Tugas (SPT) Menghadiri Bimtek Penyelenggaraan Cyber Security Daerah',
    tanggalSurat: '2026-07-05',
    tanggalDikirim: '2026-07-06',
    sifat: 'BIASA',
    ringkasan: 'Menugaskan pegawai yang bersangkutan untuk mengikuti Pelatihan Teknis Penanganan Insiden Kritis Siber Daerah yang diadakan oleh BSSN di Jakarta pada tanggal 15-18 Juli 2026.',
    status: 'DIKIRIM',
    fileName: 'SPT_Bimtek_BSSN_Budi_Santoso.pdf',
    fileSize: '512 KB',
  },
  {
    id: 'sk3',
    noSurat: '045/0162/UMUM-ASET/VII/2026',
    penerima: 'Kepala Kantor Wilayah BPN Provinsi',
    perihal: 'Draft Permohonan Sertifikasi Hak Pakai Lahan Gedung Kantor Unit Pelaksana Teknis',
    tanggalSurat: '2026-07-07',
    tanggalDikirim: '2026-07-07',
    sifat: 'BIASA',
    ringkasan: 'Pengajuan kelengkapan berkas fisik berupa peta bidang tanah dan surat pernyataan pelepasan hak bekas tanah adat guna pensertifikatan sertifikat hak pakai atas nama Pemerintah Daerah.',
    status: 'DRAFT',
  },
];

export const INITIAL_MENU_PERMISSIONS: MenuPermission[] = [
  { 
    menuId: 'dashboard', 
    label: 'Dashboard Utama', 
    description: 'Akses ke rangkuman statistik surat, jalan pintas disposisi, dan grafik visualisasi volume surat.', 
    roles: ['ADMIN', 'PIMPINAN', 'STAF'] 
  },
  { 
    menuId: 'surat-masuk', 
    label: 'Surat Masuk', 
    description: 'Melihat daftar surat masuk, mengunggah berkas surat, mencetak lembar disposisi, dan memberikan instruksi disposisi.', 
    roles: ['ADMIN', 'PIMPINAN', 'STAF'] 
  },
  { 
    menuId: 'surat-keluar', 
    label: 'Surat Keluar', 
    description: 'Membuat konsep surat keluar (draft), mendaftarkan nomor surat keluar resmi, and melacak status pengiriman surat.', 
    roles: ['ADMIN', 'PIMPINAN', 'STAF'] 
  },
  { 
    menuId: 'disposisi', 
    label: 'Kotak & Oversight Disposisi', 
    description: 'Memantau dan menindaklanjuti instruksi disposisi dari pimpinan (untuk staf) atau mengawasi seluruh progres (untuk pimpinan/admin).', 
    roles: ['ADMIN', 'PIMPINAN', 'STAF'] 
  },
  { 
    menuId: 'users', 
    label: 'Data User / Pegawai', 
    description: 'Mengelola biodata pegawai, NIP, peran (role), kata sandi akun, status aktif, dan konfigurasi hak akses menu ini.', 
    roles: ['ADMIN', 'PIMPINAN'] 
  },
  {
    menuId: 'google-drive',
    label: 'Cadangan Google Drive',
    description: 'Hubungkan akun Google Drive untuk mencadangkan seluruh data arsip Surat Masuk & Surat Keluar ke cloud.',
    roles: ['ADMIN', 'PIMPINAN', 'STAF']
  },
  {
    menuId: 'save-changes',
    label: 'Simpan Perubahan Permanen',
    description: 'Akses ke tombol Simpan Perubahan untuk menyinkronkan seluruh data surat, akun, dan hak akses ke penyimpanan permanen.',
    roles: ['ADMIN', 'PIMPINAN', 'STAF']
  }
];
