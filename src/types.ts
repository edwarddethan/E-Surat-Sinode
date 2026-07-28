export type UserRole = 'ADMIN' | 'PIMPINAN' | 'STAF';

export interface User {
  id: string;
  name: string;
  username?: string;
  role: UserRole;
  title: string; // e.g., "Kepala Dinas", "Sekretaris", "Kabid IT"
  avatar?: string;
  nip?: string;
  password?: string;
  status?: 'AKTIF' | 'NON_AKTIF';
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'DISPOSISI_BARU' | 'DISPOSISI_DEADLINE' | 'SURAT_MASUK_BARU' | 'SURAT_KELUAR_BARU' | 'PENGINGAT_MANUAL';
  timestamp: string;
  isRead: boolean;
  linkToTab?: string;
  relatedId?: string;
}

export interface ManualReminder {
  id: string;
  userId: string;
  suratId?: string;
  suratNo?: string;
  suratPerihal?: string;
  note: string;
  reminderDate: string;
  reminderTime?: string;
  createdAt: string;
  isTriggered: boolean;
}

export interface MenuPermission {
  menuId: string;
  label: string;
  description: string;
  roles: UserRole[];
}

export type SifatSurat = 'SANGAT_RAHASIA' | 'RAHASIA' | 'PENTING' | 'BIASA';

export type StatusSuratKeluar = 'DRAFT' | 'DIKIRIM';

export type StatusTindakLanjut = 'BELUM_DIPROSES' | 'DIBACA' | 'SEDANG_DIPROSES' | 'SELESAI';

export interface Disposisi {
  id: string;
  suratMasukId: string;
  tanggalDisposisi: string;
  pengirimId: string; // ID Pimpinan yang memberikan disposisi
  penerimaId: string; // ID Staf/Kabid tujuan disposisi
  instruksi: string; // Catatan instruksi disposisi
  batasWaktu: string; // Batas akhir tindak lanjut (YYYY-MM-DD)
  status: StatusTindakLanjut;
  catatanTindakLanjut?: string; // Feedback dari staf setelah memproses
  tanggalSelesai?: string;
}

export interface SuratMasuk {
  id: string;
  noAgenda?: string; // Nomor Agenda / Kendali Surat Masuk
  noSurat: string;
  asalSurat: string;
  penerima?: string; // Penerima / Ditujukan Kepada (e.g., Ketua Majelis Sinode GMIT)
  perihal: string;
  tanggalSurat: string;
  tanggalDiterima: string;
  sifat: SifatSurat;
  ringkasan: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  disposisi?: Disposisi[]; // Riwayat disposisi untuk surat ini
  allowedRecipients?: string[]; // Pilihan penerima rahasia: ['Ketua', 'Wakil Ketua', 'Sekretaris', 'Wakil Sekretaris', 'Bendahara']
}

export interface SuratKeluar {
  id: string;
  noSurat: string;
  penerima: string;
  perihal: string;
  tanggalSurat: string;
  tanggalDikirim: string;
  sifat: SifatSurat;
  ringkasan: string;
  status: StatusSuratKeluar;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  pembuatId?: string;
  ttdType?: 'WAKIL' | 'UTAMA' | 'KETUA_WAKIL_SEKRETARIS' | 'WAKIL_KETUA_SEKRETARIS' | 'KETUA_TUNGGAL' | 'SEKRETARIS_TUNGGAL' | 'BENDAHARA_TUNGGAL' | 'CUSTOM_DUA';
  customPimpinan1Id?: string;
  customPimpinan2Id?: string;
}

export interface StaffMemo {
  id: string;
  senderId: string;
  senderName: string;
  senderTitle: string;
  recipientId: string;
  recipientName: string;
  title: string;
  message: string;
  priority: 'BIASA' | 'PENTING' | 'URGENT';
  timestamp: string;
  isReadBy?: string[];
}

export const STAFF_LIST: User[] = [
  { id: 'u1', name: 'Pdt. Edward Syistha Dethan, M.Th.', username: 'edward', role: 'ADMIN', title: 'Ketua Sinode GMIT / Administrator Utama', nip: '197801012002121001', password: 'password123', status: 'AKTIF' },
  { id: 'u2', name: 'Pdt. Yusuf Nakmofa, M.Th.', username: 'yusuf', role: 'PIMPINAN', title: 'Sekretaris Sinode GMIT', nip: '198003152005011002', password: 'password123', status: 'AKTIF' },
  { id: 'u3', name: 'Budi Santoso, S.Kom.', username: 'budi', role: 'STAF', title: 'Kabid IT & Komunikasi', nip: '198503122011011003', password: 'password123', status: 'AKTIF' },
  { id: 'u4', name: 'Indah Lestari, S.E.', username: 'indah', role: 'STAF', title: 'Kabid Umum & Aset', nip: '198807242014022004', password: 'password123', status: 'AKTIF' }
];
