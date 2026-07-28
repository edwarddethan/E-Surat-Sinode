import React, { useState, useRef } from 'react';
import { SuratKeluar, SifatSurat, StatusSuratKeluar, User } from '../types';
import GmitLogo from './GmitLogo';
import { 
  Send, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  Calendar, 
  UserCheck, 
  Download, 
  UploadCloud, 
  X, 
  ArrowRight,
  Sparkles,
  CheckCircle,
  FileEdit,
  Trash2
} from 'lucide-react';

export interface LetterTemplate {
  id: string;
  name: string;
  code: string;
  penerima: string;
  perihal: string;
  sifat: SifatSurat;
  ringkasan: string;
  placeholderTips: string;
  isStandard?: boolean;
}

export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: 'tmpl-gmit-resmi',
    name: '1. Template Surat Dinas Resmi GMIT (Standar)',
    code: '[INDEX]/GMIT/I/E/Jan/2026',
    penerima: 'Pimpinan / Majelis Jemaat GMIT (Masing - masing)',
    perihal: 'Undangan / Pemberitahuan Dinas Resmi',
    sifat: 'BIASA',
    isStandard: true,
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Sehubungan dengan agenda kegiatan pelayanan dinas gerejawi Majelis Sinode GMIT, dengan ini kami mengundang / memberitahukan pelaksanaan kegiatan yang akan dilaksanakan pada:

Hari, Tanggal : Senin, 26 Januari 2026
Waktu         : 09.00 WITA - Selesai
Tempat        : Ruang Rapat Majelis Sinode GMIT

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Template standar resmi GMIT sesuai format fisik. Sesuaikan nomor surat, penerima, perihal, serta jadwal kegiatan.',
  },
  {
    id: 'tmpl-pelimpahan-wewenang',
    name: '2. Surat Pelimpahan Wewenang',
    code: '090/[INDEX]/GMIT/VII/2026',
    penerima: 'Sekretaris Majelis Sinode GMIT',
    perihal: 'Pelimpahan Wewenang Penandatanganan Surat Administrasi Umum',
    sifat: 'PENTING',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Sehubungan dengan agenda perjalanan dinas luar daerah Ketua Majelis Sinode GMIT ke Wilayah Klasis Flores Timur sejak tanggal 16 hingga 22 Juli 2026, maka dengan ini melimpahkan wewenang penandatanganan surat-surat administratif yang bersifat rutin dan pelayanan umum kepada Sekretaris Majelis Sinode.

Pelaksana tugas wajib berkoordinasi dan melaporkan setiap berkas yang ditandatangani segera setelah pimpinan kembali dari tugas.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah identitas penerima wewenang, rentang tanggal perjalanan dinas pimpinan, serta rincian batas wewenang yang dilimpahkan.',
  },
  {
    id: 'tmpl-kuasa',
    name: '3. Surat Kuasa',
    code: '094/[INDEX]/GMIT/VII/2026',
    penerima: 'Pimpinan Bank Pembangunan Daerah (BPD) NTT Cabang Utama Kupang',
    perihal: 'Pemberian Kuasa Pengurusan Rekening Bank Operasional Sinode',
    sifat: 'BIASA',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Memberikan kuasa penuh kepada Budi Santoso, S.Kom. (Kepala Bidang IT & Komunikasi) untuk melakukan pengurusan administrasi pembukaan rekening operasional baru, pembaruan data spesimen tanda tangan, serta pengambilan buku tabungan dan token internet banking pada Bank Pembangunan Daerah (BPD) NTT Cabang Utama Kupang.

Segala akibat hukum yang timbul dari tindakan pengurusan ini sepenuhnya menjadi tanggung jawab Pemberi Kuasa.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah identitas penerima kuasa, bank tujuan, dan rincian wewenang transaksi atau pengurusan.',
  },
  {
    id: 'tmpl-keterangan',
    name: '4. Surat Keterangan',
    code: '800/[INDEX]/GMIT/VII/2026',
    penerima: 'Kepada Pihak yang Berkepentingan',
    perihal: 'Surat Keterangan Kinerja dan Loyalitas Pelayanan Pegawai',
    sifat: 'BIASA',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Menerangkan dengan sesungguhnya bahwa Saudari Indah Lestari, M.Pd. adalah benar pegawai aktif di lingkungan Kantor Sinode GMIT yang menjabat sebagai Kepala Bidang Umum & Kepegawaian sejak tahun 2018 sampai dengan sekarang.

Selama bekerja, yang bersangkutan menunjukkan kinerja yang sangat baik, loyalitas tinggi, dan dedikasi penuh terhadap pelayanan gereja. Surat keterangan ini dikeluarkan untuk memenuhi persyaratan administrasi pengajuan beasiswa pendidikan lanjutan.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah identitas pegawai, jabatan, masa kerja, serta tujuan pembuatan surat keterangan.',
  },
  {
    id: 'tmpl-pemberitahuan',
    name: '5. Surat Pemberitahuan',
    code: '005/[INDEX]/GMIT/VII/2026',
    penerima: 'Segenap Ketua Majelis Klasis se-Sinode GMIT',
    perihal: 'Pemberitahuan Pelaksanaan Sensus Data Jemaat dan Inventarisasi Aset Sinode',
    sifat: 'BIASA',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Diberitahukan dengan hormat bahwa Majelis Sinode GMIT akan menyelenggarakan kegiatan Sensus Data Jemaat Terintegrasi dan Inventarisasi Aset Fisik Klasis mulai tanggal 1 Agustus hingga 30 September 2026.

Sehubungan dengan hal tersebut, dimohon agar seluruh Ketua Majelis Klasis dapat menginstruksikan kepada para Majelis Jemaat untuk mempersiapkan instrumen data yang telah dikirimkan serta berkoordinasi dengan tim verifikasi lapangan.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah target pengumuman, tanggal pelaksanaan program, serta dokumen pendukung yang perlu dipersiapkan.',
  },
  {
    id: 'tmpl-permohonan',
    name: '6. Surat Permohonan',
    code: '020/[INDEX]/GMIT/VII/2026',
    penerima: 'Kepala Dinas Pendidikan dan Kebudayaan Provinsi NTT',
    perihal: 'Permohonan Izin Penggunaan Gedung Serbaguna untuk Pembukaan Sidang Klasis',
    sifat: 'BIASA',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Dalam rangka menyelenggarakan Sidang Klasis Kupang Tengah yang ke-XV, kami memohon kesediaan Bapak/Ibu untuk mengizinkan penggunaan Gedung Serbaguna Dinas Pendidikan Provinsi NTT sebagai lokasi ibadah pembukaan dan sidang pleno yang akan dilaksanakan pada:

Hari, Tanggal : Kamis s.d. Sabtu, 20 - 22 Agustus 2026
Waktu         : 08.00 WITA - Selesai
Tempat        : Gedung Serbaguna Dinas Pendidikan Prov. NTT

Seluruh biaya kebersihan dan penggunaan listrik selama kegiatan akan sepenuhnya ditanggung oleh panitia pelaksana.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah instansi yang dituju, nama fasilitas yang dipinjam, serta detail waktu dan tanggung jawab operasional.',
  },
  {
    id: 'tmpl-tugas',
    name: '7. Surat Tugas',
    code: '820/[INDEX]/GMIT/VII/2026',
    penerima: 'Rian Hidayat, S.H. (Kepala Seksi Hukum & Humas)',
    perihal: 'Surat Tugas Pendampingan Hukum Kasus Sengketa Tanah Wakaf Jemaat',
    sifat: 'PENTING',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Ditugaskan kepada Rian Hidayat, S.H. untuk bertindak sebagai kuasa hukum perwakilan Kantor Sinode GMIT guna menghadiri persidangan mediasi sengketa batas tanah pelayanan jemaat di Pengadilan Negeri Kupang pada tanggal 23 Juli 2026.

Penerima tugas diwajibkan untuk menjaga kepentingan hukum Sinode, berkoordinasi dengan pengurus jemaat setempat, serta menyampaikan laporan hasil sidang kepada Majelis Sinode Harian.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah nama petugas, rincian perkara hukum atau kegiatan pendampingan, lokasi, dan tanggal tugas.',
  },
  {
    id: 'tmpl-rekomendasi',
    name: '8. Surat Rekomendasi',
    code: '[INDEX]/SRK/GMIT/VII/2026',
    penerima: 'Christian Ndun (Jemaat GMIT Bethania Alakaman)',
    perihal: 'Rekomendasi Melanjutkan Studi di STFT INTIM Makassar',
    sifat: 'BIASA',
    ringkasan: `Dari : Majelis Sinode GMIT, di Kupang.
Diberikan kepada : Christian Ndun (Jemaat GMIT Bethania Alakaman)
Untuk Keperluan : Melanjutkan studi di Fakultas Teologi di STFT INTIM Makassar.

Keterangan :
1. Rekomendasi ini diberikan berdasarkan Surat Rekomendasi dari Majelis Klasis Alor Tengah Selatan.
2. Semua biaya studi ditanggung oleh yang bersangkutan.

Tembusan :
1. Majelis Klasis Harian Alor Tengah Selatan;
2. Majelis Jemaat Harian GMIT Bethania Alakaman.`,
    placeholderTips: 'Ubah nama jemaat penerima, kampus tujuan studi, dasar surat dari klasis asal, serta daftar tembusannya.',
  },
  {
    id: 'tmpl-kredensi',
    name: '9. Kredensi',
    code: '070/[INDEX]/GMIT/VII/2026',
    penerima: 'Panitia Sidang Dewan Gereja Dunia (WCC) Assembly',
    perihal: 'Surat Kredensi Delegasi Sinode GMIT untuk Pertemuan Ekumenis',
    sifat: 'PENTING',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Dengan ini menerangkan bahwa Pdt. Semuel B. Pandie, S.Th (Ketua Majelis Sinode GMIT) dan Pdt. Lay Abdi Karya Wenyi, M.Si (Sekretaris Majelis Sinode GMIT) ditunjuk sebagai utusan/delegasi resmi yang mewakili Gereja Masehi Injili di Timor (GMIT) untuk menghadiri Sidang Raya Dewan Gereja-Gereja Dunia (WCC) di Karlsruhe, Jerman.

Para utusan memiliki mandat penuh untuk memberikan suara, berpartisipasi dalam pleno komisi, dan menandatangani deklarasi bersama atas nama Sinode GMIT.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah nama-nama delegasi resmi gereja, nama forum ekumenis internasional, kota tujuan, serta hak mandat utusan.',
  },
  {
    id: 'tmpl-ijin',
    name: '10. Surat Izin',
    code: '510/[INDEX]/GMIT/VII/2026',
    penerima: 'Para Pengurus Pemuda Klasis Kupang Barat',
    perihal: 'Izin Penyelenggaraan Perkemahan Pemuda Kristen se-Kabupaten Kupang',
    sifat: 'BIASA',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Majelis Sinode GMIT memberikan izin prinsip dan persetujuan pelaksanaan Kegiatan Perkemahan Bakti Pemuda Kristen yang akan dilaksanakan pada:

Hari, Tanggal : Selasa - Jumat, 25 - 28 Agustus 2026
Tempat        : Bumi Perkemahan Oenesu, Kabupaten Kupang

Panitia wajib berkoordinasi dengan kepolisian sektor setempat mengenai pengamanan, menjaga ketertiban dan kebersihan lokasi perkemahan, serta memastikan seluruh peserta mematuhi norma dan tata tertib yang berlaku.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah nama organisasi panitia, bentuk kegiatan sosial/ibadah, lokasi kegiatan, serta persyaratan izin.',
  },
  {
    id: 'tmpl-kitas',
    name: '11. Perpanjangan Kitas',
    code: '800/[INDEX]/GMIT/VII/2026',
    penerima: 'Kepala Kantor Imigrasi Kelas I TPI Kupang',
    perihal: 'Permohonan Sponsor & Perpanjangan Kartu Izin Tinggal Terbatas (KITAS) Volunteer',
    sifat: 'BIASA',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Majelis Sinode GMIT bertindak selaku penjamin/sponsor mengajukan permohonan perpanjangan Kartu Izin Tinggal Terbatas (KITAS) atas nama Rev. John Albert Miller (Kebangsaan Amerika Serikat, No. Paspor: 504938210) yang bertugas sebagai tenaga sukarelawan (volunteer) pengajar bahasa Inggris dan pendamping kemanusiaan pada Unit Pelayanan Difabel Sinode GMIT Kupang.

Masa penugasan sukarela yang bersangkutan direncanakan diperpanjang untuk jangka waktu 1 (satu) tahun ke depan.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah identitas warga negara asing (WNA), nomor paspor, kebangsaan, dan bidang tugas pelayanan kerelawanan.',
  },
  {
    id: 'tmpl-pengantar',
    name: '12. Surat Pengantar',
    code: '040/[INDEX]/GMIT/VII/2026',
    penerima: 'Ketua Badan Pemeriksa Keuangan Perwakilan Provinsi NTT',
    perihal: 'Pengantar Penyampaian Laporan Keuangan Audited Yayasan Pendidikan Kristen',
    sifat: 'BIASA',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Bersama ini kami kirimkan dengan hormat Berkas Dokumen Laporan Hasil Audit Akuntan Publik Pendeta atas Laporan Keuangan Yayasan Pendidikan Kristen di lingkungan Sinode GMIT untuk Tahun Buku 2025.

Dokumen tersebut dilampirkan dalam 1 (satu) bundel laporan lengkap guna melengkapi pertanggungjawaban hibah pembangunan sekolah Kristen.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah instansi penerima laporan, nama dokumen laporan keuangan/fisik yang dikirimkan, serta lampiran.',
  },
  {
    id: 'tmpl-panggilan',
    name: '13. Surat Panggilan',
    code: '800/[INDEX]/GMIT/VII/2026',
    penerima: 'Sdr. Albertus G. Manafe (Staf Administrasi Keuangan Klasis)',
    perihal: 'Surat Panggilan Klarifikasi Keterlambatan Laporan Setoran Sinode',
    sifat: 'PENTING',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Diminta kehadiran Saudara di Ruang Rapat Wakil Ketua Majelis Sinode GMIT pada:

Hari, Tanggal : Jumat, 24 Juli 2026
Waktu         : 10.00 WITA - Selesai
Tempat        : Ruang Rapat Majelis Sinode GMIT

Guna memberikan keterangan, penjelasan, dan klarifikasi yang objektif terkait adanya laporan keterlambatan penyetoran iuran kas Sinode dari wilayah Klasis Kupang Barat. Saudara wajib membawa bukti-bukti transaksi bank dan laporan pembukuan terkait.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah identitas pegawai yang dipanggil, waktu pertemuan, serta topik atau masalah klarifikasi.',
  },
  {
    id: 'tmpl-undangan',
    name: '14. Surat Undangan',
    code: '005/[INDEX]/GMIT/VII/2026',
    penerima: 'Para Pimpinan Denominasi Gereja Anggota PGI Wilayah NTT',
    perihal: 'Undangan Menghadiri Ibadah Syukur HUT Pekabaran Injil ke-180',
    sifat: 'BIASA',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Mengharapkan kehadiran Bapak/Ibu pimpinan denominasi gereja pada ibadah syukur HUT Pekabaran Injil di tanah Timor ke-180 yang akan dilaksanakan pada:

Hari, Tanggal : Senin, 27 Juli 2026
Waktu         : 16.00 WITA s.d Selesai
Tempat        : Gereja GMIT Jemaat Kota Kupang

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah sasaran undangan, perayaan atau acara ibadah, detail tanggal, dan pelayan firman.',
  },
  {
    id: 'tmpl-himbauan',
    name: '15. Surat Himbauan',
    code: '012/[INDEX]/GMIT/VII/2026',
    penerima: 'Seluruh Jemaat di Lingkungan Pelayanan GMIT',
    perihal: 'Himbauan Antisipasi Cuaca Ekstrem dan Partisipasi Solidaritas Bencana',
    sifat: 'BIASA',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Mencermati peringatan dini BMKG mengenai potensi cuaca ekstrem angin kencang dan gelombang pasang, Majelis Sinode menghimbau seluruh jemaat agar tetap waspada, mengamankan sarana pelayanan gereja, serta menghindari aktivitas melaut bagi warga pesisir.

Selain itu, dihimbau kepada jemaat yang berkecukupan untuk memberikan donasi sukarela berupa bahan makanan pokok guna disalurkan ke posko bantuan bencana alam Sinode.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah himbauan pencegahan/aktivitas sosial jemaat, perihal bencana alam/kegiatan gerejawi.',
  },
  {
    id: 'tmpl-edaran',
    name: '16. Surat Edaran',
    code: '001/[INDEX]/GMIT/VII/2026',
    penerima: 'Para Pelayan Jemaat dan Presbiter se-Sinode GMIT',
    perihal: 'Surat Edaran Tata Cara Liturgi Khusus Bulan Pelayanan Keluarga 2026',
    sifat: 'BIASA',
    ringkasan: `Salam damai dalam Kasih Yesus Kristus,
Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.

Disampaikan kepada seluruh pendeta, penatua, dan diaken se-Sinode GMIT bahwa dalam rangka Bulan Pelayanan Keluarga bulan Oktober 2026, seluruh ibadah minggu wajib menggunakan panduan liturgi terpadu yang telah ditetapkan oleh Komisi Teologi Sinode GMIT.

Buku liturgi dan materi khotbah keluarga dapat diunduh melalui portal resmi sinode-gmit.org atau diambil langsung di kantor klasis terdekat.

Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.`,
    placeholderTips: 'Ubah target sasaran edaran, tema bulan ibadah khusus, serta instruksi atau lampiran tata cara liturgi.',
  },
];

export const MAJELIS_SINODE_LEADERS = [
  { id: 'm1', name: 'Pdt. Semuel B. Pandie, S.Th', title: 'Ketua' },
  { id: 'm2', name: 'Pdt. Saneb Y. Ena Blegur, S.Th', title: 'Wakil Ketua' },
  { id: 'm3', name: 'Pdt. Lay Abdi Karya Wenyi, M.Si', title: 'Sekretaris' },
  { id: 'm4', name: 'Pdt. Zimrat M. S. Karmany, M.Th', title: 'Wakil Sekretaris' },
  { id: 'm5', name: 'Pnt. Yefta Sanam SE, MM', title: 'Bendahara' }
];

const formatIndonesianDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${day} ${months[monthIdx]} ${year}`;
};

const parseRekomendasiText = (text: string, defaultPenerima: string) => {
  let dari = "Majelis Sinode GMIT, di Kupang.";
  let diberikanKepada = defaultPenerima;
  let keperluan = "Melanjutkan studi di Fakultas Teologi di STFT INTIM Makasar.";
  let keteranganLines = [
    "Rekomendasi ini diberikan berdasarkan Surat Rekomendasi dari Majelis Klasis Alor Tengah Selatan.",
    "Semua biaya studi ditanggung oleh yang bersangkutan."
  ];
  let tembusanLines = [
    "Majelis Klasis Harian Alor Tengah Selatan;",
    "Majelis Jemaat Harian GMIT Bethania Alakaman."
  ];

  if (!text) {
    return { dari, diberikanKepada, keperluan, keteranganLines, tembusanLines };
  }

  const lines = text.split('\n');
  let currentSection = '';
  let customKeterangan: string[] = [];
  let customTembusan: string[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase().startsWith('dari :') || trimmed.toLowerCase().startsWith('dari:')) {
      dari = trimmed.substring(trimmed.indexOf(':') + 1).trim();
    } else if (trimmed.toLowerCase().startsWith('untuk keperluan :') || trimmed.toLowerCase().startsWith('untuk keperluan:')) {
      keperluan = trimmed.substring(trimmed.indexOf(':') + 1).trim();
    } else if (trimmed.toLowerCase().startsWith('diberikan kepada :') || trimmed.toLowerCase().startsWith('diberikan kepada:')) {
      diberikanKepada = trimmed.substring(trimmed.indexOf(':') + 1).trim();
    } else if (trimmed.toLowerCase().startsWith('keterangan :') || trimmed.toLowerCase().startsWith('keterangan:')) {
      currentSection = 'keterangan';
      const initialVal = trimmed.substring(trimmed.indexOf(':') + 1).trim();
      if (initialVal && !initialVal.toLowerCase().includes('1.')) {
        customKeterangan.push(initialVal);
      }
    } else if (trimmed.toLowerCase().startsWith('tembusan :') || trimmed.toLowerCase().startsWith('tembusan:')) {
      currentSection = 'tembusan';
      const initialVal = trimmed.substring(trimmed.indexOf(':') + 1).trim();
      if (initialVal) {
        // Strip numbering if present
        const cleanVal = initialVal.replace(/^\d+[\.\s\-]+/g, '').trim();
        if (cleanVal) customTembusan.push(cleanVal);
      }
    } else {
      if (currentSection === 'keterangan') {
        const cleanLine = line.trim().replace(/^\d+[\.\s\-]+/g, '').trim();
        if (cleanLine) customKeterangan.push(cleanLine);
      } else if (currentSection === 'tembusan') {
        const cleanLine = line.trim().replace(/^\d+[\.\s\-]+/g, '').trim();
        if (cleanLine) customTembusan.push(cleanLine);
      }
    }
  });

  if (customKeterangan.length > 0) keteranganLines = customKeterangan;
  if (customTembusan.length > 0) tembusanLines = customTembusan;

  return { dari, diberikanKepada, keperluan, keteranganLines, tembusanLines };
};

interface SuratKeluarListProps {
  suratKeluarList: SuratKeluar[];
  currentUser: User;
  onAddSuratKeluar: (newSurat: SuratKeluar) => void;
  onUpdateSuratKeluar?: (updatedSurat: SuratKeluar) => void;
  onUpdateStatusSuratKeluar: (suratId: string, status: StatusSuratKeluar) => void;
  onDeleteSuratKeluar?: (id: string) => void;
  users?: User[];
}

export default function SuratKeluarList({
  suratKeluarList,
  currentUser,
  onAddSuratKeluar,
  onUpdateSuratKeluar,
  onUpdateStatusSuratKeluar,
  onDeleteSuratKeluar,
  users
}: SuratKeluarListProps) {
  
  // UI States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<SuratKeluar | null>(null);
  const [letterToDelete, setLetterToDelete] = useState<SuratKeluar | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'detail' | 'preview'>('detail');
  const [printColored, setPrintColored] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const isRekomendasi = selectedLetter ? (selectedLetter.noSurat.includes('/SRK/') || selectedLetter.perihal.toLowerCase().includes('rekomendasi')) : false;
  const parsedRekomendasi = selectedLetter && isRekomendasi ? parseRekomendasiText(selectedLetter.ringkasan, selectedLetter.penerima) : null;

  const renderSignatures = (ttdType: string = 'WAKIL') => {
    switch (ttdType) {
      case 'UTAMA':
        return (
          <div className="text-center">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Majelis Sinode Harian</p>
            <div className="grid grid-cols-2 gap-10 mt-3 text-[9px]">
              <div>
                <p className="font-bold text-slate-800">Ketua,</p>
                <div className="h-12 flex items-end justify-center">
                  <span className="text-[8px] text-slate-300 italic select-none">[]</span>
                </div>
                <p className="font-extrabold text-slate-950 mt-1 underline uppercase">Pdt. SEMUEL B. PANDIE, S.Th</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">Sekretaris,</p>
                <div className="h-12 flex items-end justify-center">
                  <span className="text-[8px] text-slate-300 italic select-none">[]</span>
                </div>
                <p className="font-extrabold text-slate-950 mt-1 underline uppercase">Pdt. LAY ABDI KARYA WENYI, M.Si</p>
              </div>
            </div>
          </div>
        );
      case 'KETUA_WAKIL_SEKRETARIS':
        return (
          <div className="text-center">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Majelis Sinode Harian</p>
            <div className="grid grid-cols-2 gap-10 mt-3 text-[9px]">
              <div>
                <p className="font-bold text-slate-800">Ketua,</p>
                <div className="h-12 flex items-end justify-center">
                  <span className="text-[8px] text-slate-300 italic select-none">[]</span>
                </div>
                <p className="font-extrabold text-slate-950 mt-1 underline uppercase">Pdt. SEMUEL B. PANDIE, S.Th</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">Wakil Sekretaris,</p>
                <div className="h-12 flex items-end justify-center">
                  <span className="text-[8px] text-slate-300 italic select-none">[]</span>
                </div>
                <p className="font-extrabold text-slate-950 mt-1 underline uppercase">Pdt. ZIMRAT M. S. KARMANY, M.Th</p>
              </div>
            </div>
          </div>
        );
      case 'WAKIL_KETUA_SEKRETARIS':
        return (
          <div className="text-center">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Majelis Sinode Harian</p>
            <div className="grid grid-cols-2 gap-10 mt-3 text-[9px]">
              <div>
                <p className="font-bold text-slate-800">Wakil Ketua,</p>
                <div className="h-12 flex items-end justify-center">
                  <span className="text-[8px] text-slate-300 italic select-none">[]</span>
                </div>
                <p className="font-extrabold text-slate-950 mt-1 underline uppercase">Pdt. SANEB Y. ENA BLEGUR, S.Th</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">Sekretaris,</p>
                <div className="h-12 flex items-end justify-center">
                  <span className="text-[8px] text-slate-300 italic select-none">[]</span>
                </div>
                <p className="font-extrabold text-slate-950 mt-1 underline uppercase">Pdt. LAY ABDI KARYA WENYI, M.Si</p>
              </div>
            </div>
          </div>
        );
      case 'KETUA_TUNGGAL':
        return (
          <div className="text-center flex flex-col items-center">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Majelis Sinode Harian</p>
            <div className="mt-3 text-[9px] w-48">
              <p className="font-bold text-slate-800">Ketua,</p>
              <div className="h-12 flex items-end justify-center">
                <span className="text-[8px] text-slate-300 italic select-none">[]</span>
              </div>
              <p className="font-extrabold text-slate-950 mt-1 underline uppercase">Pdt. SEMUEL B. PANDIE, S.Th</p>
            </div>
          </div>
        );
      case 'SEKRETARIS_TUNGGAL':
        return (
          <div className="text-center flex flex-col items-center">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Majelis Sinode Harian</p>
            <div className="mt-3 text-[9px] w-48">
              <p className="font-bold text-slate-800">Sekretaris,</p>
              <div className="h-12 flex items-end justify-center">
                <span className="text-[8px] text-slate-300 italic select-none">[]</span>
              </div>
              <p className="font-extrabold text-slate-950 mt-1 underline uppercase">Pdt. LAY ABDI KARYA WENYI, M.Si</p>
            </div>
          </div>
        );
      case 'BENDAHARA_TUNGGAL':
        return (
          <div className="text-center flex flex-col items-center">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Majelis Sinode Harian</p>
            <div className="mt-3 text-[9px] w-48">
              <p className="font-bold text-slate-800">Bendahara,</p>
              <div className="h-12 flex items-end justify-center">
                <span className="text-[8px] text-slate-300 italic select-none">[]</span>
              </div>
              <p className="font-extrabold text-slate-950 mt-1 underline uppercase">Pnt. YEFTA SANAM SE, MM</p>
            </div>
          </div>
        );
      case 'WAKIL':
      default:
        return (
          <div className="text-center">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Majelis Sinode Harian</p>
            <div className="grid grid-cols-2 gap-10 mt-3 text-[9px]">
              <div>
                <p className="font-bold text-slate-800">Wakil Ketua,</p>
                <div className="h-12 flex items-end justify-center">
                  <span className="text-[8px] text-slate-300 italic select-none">[]</span>
                </div>
                <p className="font-extrabold text-slate-950 mt-1 underline uppercase">Pdt. SANEB Y. ENA BLEGUR, S.Th</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">Wakil Sekretaris,</p>
                <div className="h-12 flex items-end justify-center">
                  <span className="text-[8px] text-slate-300 italic select-none">[]</span>
                </div>
                <p className="font-extrabold text-slate-950 mt-1 underline uppercase">Pdt. ZIMRAT M. S. KARMANY, M.Th</p>
              </div>
            </div>
          </div>
        );
    }
  };
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSifat, setFilterSifat] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA'); // SEMUA, DRAFT, DIKIRIM

  // New Letter Form States
  const [newNoSurat, setNewNoSurat] = useState('');
  const [newPenerima, setNewPenerima] = useState('');
  const [newPerihal, setNewPerihal] = useState('');
  const [newTanggalSurat, setNewTanggalSurat] = useState(new Date().toISOString().split('T')[0]);
  const [newTanggalDikirim, setNewTanggalDikirim] = useState(new Date().toISOString().split('T')[0]);
  const [newSifat, setNewSifat] = useState<SifatSurat>('BIASA');
  const [newRingkasan, setNewRingkasan] = useState('');
  const [newStatus, setNewStatus] = useState<StatusSuratKeluar>('DIKIRIM');
  const [newTtdType, setNewTtdType] = useState<'WAKIL' | 'UTAMA' | 'KETUA_TUNGGAL' | 'SEKRETARIS_TUNGGAL' | 'BENDAHARA_TUNGGAL'>('WAKIL');
  
  // File upload simulation state
  const [attachedFile, setAttachedFile] = useState<{name: string, size: string, url?: string} | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

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

  // Submit Create
  const handleApplyTemplate = (tmpl: LetterTemplate) => {
    // Generate sequential-looking sequence index
    const sequenceNum = String(suratKeluarList.length + 142).padStart(4, '0');
    let generatedCode = tmpl.code;
    if (generatedCode.includes('[INDEX]')) {
      generatedCode = generatedCode.replace('[INDEX]', sequenceNum);
    } else if (generatedCode.startsWith('....')) {
      generatedCode = generatedCode.replace('....', `${sequenceNum}`);
    }
    setNewNoSurat(generatedCode);
    setNewPenerima(tmpl.penerima);
    setNewPerihal(tmpl.perihal);
    setNewSifat(tmpl.sifat);
    setNewRingkasan(tmpl.ringkasan);
    setNewStatus('DRAFT'); // Default as draft so they can customize
    setNewTtdType(tmpl.id === 'tmpl-rekomendasi' ? 'UTAMA' : 'WAKIL');
    const shortName = tmpl.name.split(' ')[0] + '_' + sequenceNum + '.pdf';
    setAttachedFile({ name: shortName, size: '420 KB' });
    setIsCreateModalOpen(true);
  };

  const [editingLetter, setEditingLetter] = useState<SuratKeluar | null>(null);

  const handleStartEdit = (letter: SuratKeluar) => {
    setEditingLetter(letter);
    setNewNoSurat(letter.noSurat);
    setNewPenerima(letter.penerima);
    setNewPerihal(letter.perihal);
    setNewTanggalSurat(letter.tanggalSurat);
    setNewTanggalDikirim(letter.tanggalDikirim);
    setNewSifat(letter.sifat);
    setNewRingkasan(letter.ringkasan);
    setNewStatus(letter.status);
    setNewTtdType(letter.ttdType || 'WAKIL');
    if (letter.fileName) {
      setAttachedFile({
        name: letter.fileName,
        size: letter.fileSize || '820 KB',
        url: letter.fileUrl
      });
    } else {
      setAttachedFile(null);
    }
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoSurat || !newPenerima || !newPerihal || !newRingkasan) {
      alert('Mohon isi semua kolom wajib!');
      return;
    }

    if (editingLetter) {
      const updatedLetter: SuratKeluar = {
        ...editingLetter,
        noSurat: newNoSurat,
        penerima: newPenerima,
        perihal: newPerihal,
        tanggalSurat: newTanggalSurat,
        tanggalDikirim: newTanggalDikirim,
        sifat: newSifat,
        ringkasan: newRingkasan,
        status: newStatus,
        fileName: attachedFile ? attachedFile.name : undefined,
        fileSize: attachedFile ? attachedFile.size : undefined,
        fileUrl: attachedFile ? attachedFile.url : undefined,
        ttdType: newTtdType,
      };

      if (onUpdateSuratKeluar) {
        onUpdateSuratKeluar(updatedLetter);
      }

      if (selectedLetter && selectedLetter.id === editingLetter.id) {
        setSelectedLetter(updatedLetter);
      }

      showToast(`Perubahan Surat Keluar "${updatedLetter.noSurat}" berhasil disimpan secara permanen!`);
    } else {
      const newLetter: SuratKeluar = {
        id: `sk-${Date.now()}`,
        noSurat: newNoSurat,
        penerima: newPenerima,
        perihal: newPerihal,
        tanggalSurat: newTanggalSurat,
        tanggalDikirim: newTanggalDikirim,
        sifat: newSifat,
        ringkasan: newRingkasan,
        status: newStatus,
        fileName: attachedFile ? attachedFile.name : 'arsip_surat_keluar_tertanda.pdf',
        fileSize: attachedFile ? attachedFile.size : '820 KB',
        fileUrl: attachedFile ? attachedFile.url : undefined,
        ttdType: newTtdType,
      };

      onAddSuratKeluar(newLetter);
      showToast(`Surat Keluar baru "${newLetter.noSurat}" berhasil disimpan secara permanen!`);
    }

    // Reset fields
    setNewNoSurat('');
    setNewPenerima('');
    setNewPerihal('');
    setNewRingkasan('');
    setNewSifat('BIASA');
    setNewStatus('DIKIRIM');
    setNewTtdType('WAKIL');
    setAttachedFile(null);
    setEditingLetter(null);
    setIsCreateModalOpen(false);
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
    setEditingLetter(null);
    setNewNoSurat('');
    setNewPenerima('');
    setNewPerihal('');
    setNewRingkasan('');
    setNewSifat('BIASA');
    setNewStatus('DIKIRIM');
    setNewTtdType('WAKIL');
    setAttachedFile(null);
  };

  // Handle Mark as Sent
  const handleMarkAsSent = (letterId: string) => {
    onUpdateStatusSuratKeluar(letterId, 'DIKIRIM');
    
    // Update locally selected letter state if open
    if (selectedLetter && selectedLetter.id === letterId) {
      setSelectedLetter({
        ...selectedLetter,
        status: 'DIKIRIM',
        tanggalDikirim: new Date().toISOString().split('T')[0]
      });
    }
    alert('Status surat keluar diperbarui menjadi "DIKIRIM"!');
  };

  // Export Filtered letters to CSV
  const handleExportCSV = () => {
    const headers = ['No', 'Nomor Surat', 'Tujuan Penerima', 'Perihal', 'Tanggal Surat', 'Tanggal Dikirim', 'Sifat', 'Status'];
    
    const rows = filteredSurat.map((sk, idx) => [
      idx + 1,
      `"${sk.noSurat.replace(/"/g, '""')}"`,
      `"${sk.penerima.replace(/"/g, '""')}"`,
      `"${sk.perihal.replace(/"/g, '""')}"`,
      sk.tanggalSurat,
      sk.status === 'DIKIRIM' ? sk.tanggalDikirim : '-',
      sk.sifat,
      sk.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekapan_Surat_Keluar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter letters based on inputs
  const filteredSurat = suratKeluarList.filter(sk => {
    const matchesSearch = 
      sk.noSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sk.penerima.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sk.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sk.ringkasan.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSifat = filterSifat === 'SEMUA' || sk.sifat === filterSifat;
    const matchesStatus = filterStatus === 'SEMUA' || sk.status === filterStatus;

    return matchesSearch && matchesSifat && matchesStatus;
  });

  const totalInFilter = filteredSurat.length;
  const totalTerkirim = filteredSurat.filter(sk => sk.status === 'DIKIRIM').length;
  const totalDraft = filteredSurat.filter(sk => sk.status === 'DRAFT').length;

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
      
      {/* Header and top buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-heading flex items-center gap-2">
            <Send className="h-5 w-5 text-indigo-600" /> Rekapan Surat Keluar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen draf surat dinas yang akan diterbitkan, pencatatan nomor agenda surat keluar, dan pelacakan status pengiriman berkas.
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
              onClick={() => {
                const stdTmpl = LETTER_TEMPLATES.find(t => t.id === 'tmpl-gmit-resmi') || LETTER_TEMPLATES[0];
                handleApplyTemplate(stdTmpl);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm smooth-transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Buat Surat Keluar
            </button>
          )}
        </div>
      </div>

      {/* Summary Stat counters */}
      <div className="grid grid-cols-3 gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
        <div className="text-center border-r border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Terfilter</span>
          <p className="text-xl font-bold text-slate-800 mt-1">{totalInFilter} Surat</p>
        </div>
        <div className="text-center border-r border-slate-200">
          <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">Terkirim</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{totalTerkirim} Surat</p>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-amber-500 uppercase font-bold tracking-wider">Konsep / Draft</span>
          <p className="text-xl font-bold text-amber-700 mt-1">{totalDraft} Draft</p>
        </div>
      </div>

      {/* CATALOG TEMPLATE SURAT SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <button
          onClick={() => setIsCatalogOpen(!isCatalogOpen)}
          className="w-full flex items-center justify-between font-heading font-bold text-xs text-slate-800 focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
            <span>Katalog Template Surat Dinas Resmi</span>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
              {LETTER_TEMPLATES.length} Template Tersedia
            </span>
          </div>
          <span className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
            {isCatalogOpen ? 'Sembunyikan Katalog' : 'Lihat Katalog'}
          </span>
        </button>

        {isCatalogOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            {LETTER_TEMPLATES.map((tmpl) => (
              <div 
                key={tmpl.id} 
                className={`border rounded-xl p-4 transition-all flex flex-col justify-between space-y-3 ${
                  tmpl.isStandard 
                    ? 'border-indigo-300 bg-indigo-50/10 hover:bg-white hover:border-indigo-400 hover:shadow-xs ring-1 ring-indigo-50' 
                    : 'border-slate-150 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-heading font-extrabold text-xs text-slate-800">{tmpl.name}</h3>
                        {tmpl.isStandard && (
                          <span className="text-[8px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-3xs">
                            ★ Standar
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono font-bold text-indigo-600 mt-0.5 block">{tmpl.code.replace('[INDEX]', 'XXXX')}</span>
                    </div>
                    <span className="text-[9px] uppercase font-extrabold bg-slate-150 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                      {tmpl.sifat}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 line-clamp-3 italic leading-relaxed">
                    "{tmpl.ringkasan}"
                  </p>
                  <div className="text-[9px] text-indigo-700 bg-indigo-50/50 p-2 rounded-lg mt-2 font-medium">
                    💡 <strong>Tips:</strong> {tmpl.placeholderTips}
                  </div>
                </div>
                <button
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg smooth-transition cursor-pointer shadow-xs"
                >
                  <FileEdit className="h-3.5 w-3.5" /> Gunakan Template Ini
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filtering & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" /> Cari Kata Kunci
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nomor surat, penerima, perihal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-hidden"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Sifat filter */}
        <div className="w-full md:w-48 space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" /> Sifat Surat
          </label>
          <select
            value={filterSifat}
            onChange={(e) => setFilterSifat(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white"
          >
            <option value="SEMUA">Semua Sifat</option>
            <option value="SANGAT_RAHASIA">Sangat Rahasia</option>
            <option value="RAHASIA">Rahasia</option>
            <option value="PENTING">Penting</option>
            <option value="BIASA">Biasa</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="w-full md:w-48 space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Status Surat
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="DIKIRIM">Dikirim / Terkirim</option>
            <option value="DRAFT">Draft / Konsep</option>
          </select>
        </div>
      </div>

      {/* Main Outgoing Letters List */}
      {filteredSurat.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-12 text-center text-slate-500">
          <Send className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Tidak ada Surat Keluar</p>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Tujuan Penerima & No Surat</th>
                  <th className="py-3 px-4">Perihal / Ringkasan</th>
                  <th className="py-3 px-4">Sifat & Tanggal</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSurat.map((sk) => {
                  const creator = users ? users.find(u => u.id === sk.pembuatId) : null;
                  return (
                    <tr key={sk.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Column 1: Penerima & No */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block line-clamp-2">{sk.penerima}</span>
                            <span className="text-[10px] text-slate-500 font-mono mt-1 block">{sk.noSurat}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Perihal */}
                      <td className="py-3.5 px-4 max-w-[320px]">
                        <div className="space-y-1.5">
                          <span className="font-bold text-slate-800 block line-clamp-2">{sk.perihal}</span>
                          <span className="text-[10px] text-slate-500 block line-clamp-1 italic">{sk.ringkasan}</span>
                          {creator && (
                            <span className="inline-flex items-center gap-1 text-[9px] text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-md font-semibold font-sans mt-1">
                              Pelaksana: {creator.name.split(',')[0]} ({creator.title})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Sifat & Tanggal */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <span className={`inline-block text-[9px] font-extrabold border px-2 py-0.5 rounded-md ${getSifatColor(sk.sifat)}`}>
                            {sk.sifat}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" /> {sk.tanggalSurat}
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-full ${
                          sk.status === 'DIKIRIM' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sk.status === 'DIKIRIM' ? 'TERKIRIM' : 'DRAFT'}
                        </span>
                      </td>

                      {/* Column 5: Action */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedLetter(sk);
                              setActiveDetailTab('detail');
                            }}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg smooth-transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" /> Detail
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLetter(sk);
                              setActiveDetailTab('preview');
                            }}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg smooth-transition cursor-pointer"
                            title="Pratinjau Cetak Surat Resmi Kop GMIT"
                          >
                            <FileText className="h-3.5 w-3.5" /> Cetak
                          </button>
                           {(currentUser.role === 'ADMIN' || currentUser.role === 'STAF' || currentUser.role === 'PIMPINAN') && (
                            <>
                              <button
                                onClick={() => handleStartEdit(sk)}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-lg smooth-transition cursor-pointer"
                                title="Ubah / Edit surat keluar"
                              >
                                <FileEdit className="h-3.5 w-3.5" /> Ubah
                              </button>
                              <button
                                onClick={() => setLetterToDelete(sk)}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg smooth-transition cursor-pointer"
                                title="Hapus surat keluar"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Hapus
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

      {/* MODAL 1: CREATE OUTGOING LETTER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-indigo-600" />
                <h3 className="font-heading font-bold text-slate-800 text-base">
                  {editingLetter ? 'Ubah / Edit Surat Keluar' : 'Buat Surat Keluar Baru'}
                </h3>
              </div>
              <button 
                onClick={handleCancelCreate}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {/* Quick Template Picker inside Modal */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" /> Muat Template Resmi (Klik untuk mengisi form otomatis)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LETTER_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        const sequenceNum = String(suratKeluarList.length + 142).padStart(4, '0');
                        setNewNoSurat(tmpl.code.replace('[INDEX]', sequenceNum));
                        setNewPenerima(tmpl.penerima);
                        setNewPerihal(tmpl.perihal);
                        setNewSifat(tmpl.sifat);
                        setNewRingkasan(tmpl.ringkasan);
                        setNewStatus('DRAFT');
                        const shortName = tmpl.name.split(' ')[0] + '_' + sequenceNum + '.pdf';
                        setAttachedFile({ name: shortName, size: '420 KB' });
                      }}
                      className="text-left p-2 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-200 transition-all cursor-pointer group"
                    >
                      <p className="text-[9px] font-bold text-slate-800 truncate group-hover:text-indigo-700">{tmpl.name}</p>
                      <span className="text-[8px] text-slate-400 font-mono block truncate mt-0.5">{tmpl.code.replace('[INDEX]', 'XXXX')}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nomor Surat <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 045/012/UMUM-ASET/2026"
                    value={newNoSurat}
                    onChange={(e) => setNewNoSurat(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Tujuan Penerima <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ke"
                    value={newPenerima}
                    onChange={(e) => setNewPenerima(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Perihal / Judul Surat Keluar <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Permohonan Sertifikasi Hak Pakai Atas Tanah Kantor"
                  value={newPerihal}
                  onChange={(e) => setNewPerihal(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Tanggal Pembuatan</label>
                  <input
                    type="date"
                    required
                    value={newTanggalSurat}
                    onChange={(e) => setNewTanggalSurat(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Rencana Pengiriman</label>
                  <input
                    type="date"
                    required
                    value={newTanggalDikirim}
                    onChange={(e) => setNewTanggalDikirim(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Kategori Sifat Surat</label>
                  <select
                    value={newSifat}
                    onChange={(e) => setNewSifat(e.target.value as SifatSurat)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white"
                  >
                    <option value="BIASA">Biasa</option>
                    <option value="PENTING">Penting</option>
                    <option value="RAHASIA">Rahasia</option>
                    <option value="SANGAT_RAHASIA">Sangat Rahasia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Status Awal Surat</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as StatusSuratKeluar)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white"
                  >
                    <option value="DIKIRIM">Terkirim / Langsung Dikirim</option>
                    <option value="DRAFT">Konsep / Masih Draft</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <span>Penandatangan Surat (Pimpinan)</span>
                  </label>
                  <select
                    value={newTtdType}
                    onChange={(e) => setNewTtdType(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="WAKIL">Wakil Ketua & Wakil Sekretaris (Standard)</option>
                    <option value="UTAMA">Ketua & Sekretaris Majelis Sinode</option>
                    <option value="KETUA_WAKIL_SEKRETARIS">Ketua & Wakil Sekretaris</option>
                    <option value="WAKIL_KETUA_SEKRETARIS">Wakil Ketua & Sekretaris</option>
                    <option value="KETUA_TUNGGAL">Pdt. Semuel B. Pandie, S.Th (Ketua)</option>
                    <option value="SEKRETARIS_TUNGGAL">Pdt. Lay Abdi Karya Wenyi, M.Si (Sekretaris)</option>
                    <option value="BENDAHARA_TUNGGAL">Pnt. Yefta Sanam SE, MM (Bendahara)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Isi Ringkas / Deskripsi Dokumen <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ketik ringkasan pokok draf surat keluar di sini..."
                  value={newRingkasan}
                  onChange={(e) => setNewRingkasan(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 focus:bg-white"
                />
              </div>

              {/* File Attachment Drag & Drop Simulation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Unggah Berkas Final Tertandatangani (Scan PDF)</label>
                
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
                    accept=".pdf,.png,.jpg,.jpeg,.docx"
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
                      <p className="text-xs font-semibold text-slate-600">Seret & lepas dokumen di sini, atau <span className="text-indigo-600 hover:underline">pilih file</span></p>
                      <p className="text-[10px] text-slate-400">PDF atau Word hingga 10MB (Akan diarsip secara digital)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancelCreate}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 cursor-pointer"
                >
                  {editingLetter ? 'Simpan Perubahan' : 'Daftarkan & Kirim Surat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAIL SURAT KELUAR */}
      {selectedLetter && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`bg-white rounded-2xl w-full ${activeDetailTab === 'preview' ? 'max-w-4xl' : 'max-w-lg'} border border-slate-200 overflow-hidden shadow-2xl my-8 transition-all duration-300`}>
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div>
                <span className={`inline-block text-[9px] font-bold border px-2 py-0.5 rounded-md mb-1 ${getSifatColor(selectedLetter.sifat)}`}>
                  Sifat: {selectedLetter.sifat}
                </span>
                <h3 className="font-heading font-bold text-slate-800 text-base">Detail Surat Keluar</h3>
              </div>
              <button 
                onClick={() => setSelectedLetter(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Swapper Header */}
            <div className="flex border-b border-slate-200 bg-slate-50/50">
              <button
                onClick={() => setActiveDetailTab('detail')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all ${
                  activeDetailTab === 'detail'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                Informasi & Log Surat
              </button>
              <button
                onClick={() => setActiveDetailTab('preview')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeDetailTab === 'preview'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                📄 Pratinjau Kertas Kop Surat Resmi
              </button>
            </div>

            {activeDetailTab === 'detail' ? (
              <div className="p-6 space-y-4">
                {(currentUser.role === 'ADMIN' || currentUser.role === 'STAF' || currentUser.role === 'PIMPINAN') && (
                  <div className="flex items-center justify-between bg-amber-50/60 border border-amber-200/80 p-3 rounded-xl mb-2">
                    <div>
                      <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wide block">Pengelolaan Surat</span>
                      <p className="text-xs text-amber-900 font-medium">Ubah rincian, nomor, penerima, atau berkas surat ini</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const letter = selectedLetter;
                        setSelectedLetter(null);
                        handleStartEdit(letter);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-all cursor-pointer shrink-0"
                      title="Ubah data surat keluar"
                    >
                      <FileEdit className="h-3.5 w-3.5" /> Ubah Data
                    </button>
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Penerima Tujuan</span>
                  <div className="text-xs font-bold text-slate-800">{selectedLetter.penerima}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Perihal Surat</span>
                  <div className="text-xs font-semibold text-slate-800 leading-relaxed">{selectedLetter.perihal}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Nomor Surat</span>
                    <div className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 p-2 rounded-lg truncate">
                      {selectedLetter.noSurat}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Status Pengiriman</span>
                    <div className="mt-1">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        selectedLetter.status === 'DIKIRIM' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedLetter.status === 'DIKIRIM' ? 'DIKIRIM / TERBIT' : 'KONSEP / DRAFT'}
                      </span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const creator = users ? users.find(u => u.id === selectedLetter.pembuatId) : null;
                  if (!creator) return null;
                  return (
                    <div className="space-y-1 bg-emerald-50/20 border border-emerald-100/30 p-3.5 rounded-xl">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wide block mb-1">Staf Pelaksana Pembuat Draf</span>
                      <div className="flex items-start gap-2 text-xs">
                        <UserCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-slate-800">{creator.name}</div>
                          <div className="text-[10px] text-slate-500">{creator.title}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Tanggal Surat</span>
                    <span className="text-slate-700 font-medium">{selectedLetter.tanggalSurat}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Tanggal Kirim / Rilis</span>
                    <span className="text-slate-700 font-medium">
                      {selectedLetter.status === 'DIKIRIM' ? selectedLetter.tanggalDikirim : 'Belum dirilis'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Ringkasan Deskripsi</span>
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg leading-relaxed max-h-32 overflow-y-auto">
                    {selectedLetter.ringkasan}
                  </div>
                </div>

                {selectedLetter.fileName && (
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{selectedLetter.fileName}</p>
                        <p className="text-[10px] text-slate-500">{selectedLetter.fileSize || '850 KB'}</p>
                      </div>
                    </div>
                    {selectedLetter.fileUrl ? (
                      <div className="flex items-center gap-1">
                        <a
                          href={selectedLetter.fileUrl}
                          download={selectedLetter.fileName}
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100/50 rounded-lg shrink-0 cursor-pointer"
                          title="Unduh berkas lampiran"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert('Mensimulasikan unduhan file draft/arsip surat keluar.')}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100/50 rounded-lg shrink-0 cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Render Send button for draft letters (ADMIN only) */}
                {selectedLetter.status === 'DRAFT' && currentUser.role === 'ADMIN' && (
                  <div className="border-t border-slate-100 pt-4 bg-amber-50/30 p-3 rounded-xl border border-amber-100/50">
                    <p className="text-xs text-amber-800 mb-2 font-medium">
                      Surat ini masih berstatus <strong>Draft</strong>. Rilis dan kirim surat ini agar nomor terdaftar resmi di buku agenda luar.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleMarkAsSent(selectedLetter.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle className="h-4 w-4" /> Tandai Terkirim Sekarang
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* PREVIEW TAB CONTENT - REAL-TIME PAPERSHEET MOCKUP */
              <div className="p-6 bg-slate-100 overflow-y-auto max-h-[70vh] space-y-4">
                {/* Visual Options Toolbar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs sticky top-0 z-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Kop Warna:</span>
                      <button
                        type="button"
                        onClick={() => setPrintColored(true)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${
                          printColored 
                            ? 'bg-[#FF00FF] border-pink-600 text-white shadow-2xs font-black' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Warna (#FF00FF)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintColored(false)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${
                          !printColored 
                            ? 'bg-slate-800 border-slate-800 text-white shadow-2xs' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Grayscale
                      </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide shrink-0">Tanda Tangan:</span>
                      <select
                        value={selectedLetter.ttdType || 'WAKIL'}
                        onChange={(e) => {
                          setSelectedLetter({
                            ...selectedLetter,
                            ttdType: e.target.value as any
                          });
                        }}
                        className="text-[10px] font-bold border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-hidden text-slate-700 focus:ring-1 focus:ring-indigo-500 flex-1 sm:flex-initial"
                      >
                        <option value="WAKIL">Wakil Ketua & Wakil Sekretaris</option>
                        <option value="UTAMA">Ketua & Sekretaris Majelis Sinode</option>
                        <option value="KETUA_TUNGGAL">Pdt. Semuel B. Pandie, S.Th (Ketua)</option>
                        <option value="SEKRETARIS_TUNGGAL">Pdt. Lay Abdi Karya Wenyi, M.Si (Sekretaris)</option>
                        <option value="BENDAHARA_TUNGGAL">Pnt. Yefta Sanam SE, MM (Bendahara)</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const printContent = document.getElementById('gmit-print-sheet');
                      if (!printContent) return;
                      
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        const logoSvg = document.getElementById('gmit-logo-svg-wrapper')?.innerHTML || '';
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Cetak Surat Keluar GMIT - ${selectedLetter.noSurat}</title>
                              <script src="https://cdn.tailwindcss.com"></script>
                              <style>
                                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                                body {
                                  font-family: 'Inter', sans-serif;
                                  padding: 40px;
                                  -webkit-print-color-adjust: exact;
                                  print-color-adjust: exact;
                                }
                                @media print {
                                  body { padding: 0; }
                                  .no-print { display: none; }
                                }
                              </style>
                            </head>
                            <body class="bg-white">
                              <div class="max-w-[750px] mx-auto text-xs">
                                ${printContent.outerHTML}
                              </div>
                              <script>
                                window.onload = function() {
                                  setTimeout(function() {
                                    window.print();
                                    window.close();
                                  }, 600);
                                };
                              </script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      } else {
                        alert('Gagal membuka jendela cetak. Pastikan pop-up diperbolehkan di browser Anda.');
                      }
                    }}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <Download className="h-4 w-4" /> Cetak Lembaran Resmi (PDF)
                  </button>
                </div>

                {/* A4 Paper replica container */}
                <div 
                  id="gmit-print-sheet" 
                  className="bg-white shadow-md p-6 sm:p-10 border border-slate-300 rounded-lg mx-auto w-full max-w-[720px] text-slate-800 text-[10px] leading-relaxed relative flex flex-col justify-between min-h-[920px] select-text"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <div>
                    {/* Official Kop Surat Box */}
                    <div 
                      className={`border border-black p-3 flex items-center gap-3 text-center ${
                        printColored 
                          ? 'border-black' 
                          : 'bg-slate-50 border-slate-400'
                      }`}
                      style={printColored ? { backgroundColor: '#FF00FF' } : undefined}
                      id="gmit-kop-header-container"
                    >
                      <div className="shrink-0 flex items-center justify-center" id="gmit-logo-svg-wrapper" style={{ width: '2.01cm', height: '2.81cm' }}>
                        <GmitLogo style={{ width: '2.01cm', height: '2.81cm' }} className="object-contain" />
                      </div>
                      
                      <div className="flex-1">
                        <h1 className="text-[12px] font-black tracking-wide text-slate-900 uppercase">GEREJA MASEHI INJILI DI TIMOR</h1>
                        <h2 className="text-[8px] font-bold text-slate-800 tracking-wide mt-0.5 uppercase">(GBM GPI dan Anggota PGI)</h2>
                        <h3 className="text-sm font-black text-slate-900 tracking-wider mt-0.5 uppercase">MAJELIS SINODE</h3>
                        <p className="text-[8px] text-slate-600 font-medium mt-0.5">Jln. S. K. Lerik Kota Baru Telp. (0380) 8438423, Fax. 831182,</p>
                        <p className="text-[8px] text-blue-700 font-bold mt-0.5">
                          E-mail: <span className="underline">infokom.gmit@yahoo.com</span>, <span className="underline">sinodegmitkupang@gmail.com</span>, Website: <span className="underline">www.sinodegmit.or.id</span>
                        </p>
                      </div>
                    </div>

                    {isRekomendasi && parsedRekomendasi ? (
                      <div>
                        {/* 1. Title */}
                        <div className="text-center mt-6 mb-5">
                          <h2 className="text-[14px] font-black tracking-widest text-slate-900 underline uppercase">REKOMENDASI</h2>
                          <p className="text-[9px] font-bold text-slate-800 mt-1">Nomor: {selectedLetter.noSurat}</p>
                          <p className="text-[9px] font-bold text-slate-800">Tanggal: {formatIndonesianDate(selectedLetter.tanggalSurat)}</p>
                        </div>

                        {/* 2. Structured Fields */}
                        <div className="mt-6 space-y-4 text-[10px] text-slate-900 font-medium">
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-3 font-bold text-slate-800">Dari</span>
                            <span className="col-span-1 text-center">:</span>
                            <span className="col-span-8 font-extrabold text-slate-950">{parsedRekomendasi.dari}</span>
                          </div>
                          
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-3 font-bold text-slate-800">Diberikan kepada</span>
                            <span className="col-span-1 text-center">:</span>
                            <span className="col-span-8 font-extrabold text-slate-950">{parsedRekomendasi.diberikanKepada}</span>
                          </div>

                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-3 font-bold text-slate-800">Untuk Keperluan</span>
                            <span className="col-span-1 text-center">:</span>
                            <span className="col-span-8 text-slate-900 leading-relaxed">{parsedRekomendasi.keperluan}</span>
                          </div>

                          <div className="grid grid-cols-12 gap-1 items-start">
                            <span className="col-span-3 font-bold text-slate-800">Keterangan</span>
                            <span className="col-span-1 text-center">:</span>
                            <div className="col-span-8 space-y-1.5 text-slate-900">
                              {parsedRekomendasi.keteranganLines.map((line, idx) => (
                                <div key={idx} className="flex items-start gap-1.5">
                                  <span className="font-bold shrink-0">{idx + 1}.</span>
                                  <span className="leading-relaxed">{line}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* 3. Closing text */}
                        <p className="mt-8 mb-6 text-[10px] text-justify text-slate-900 leading-relaxed font-semibold">
                          Demikian Rekomendasi ini dibuat dan diberikan kepada yang bersangkutan untuk dipergunakan sebagaimana mestinya.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Metadata line block */}
                        <div className="grid grid-cols-12 gap-1 mt-4 text-[10px]">
                          <div className="col-span-7 space-y-1">
                            <div className="flex">
                              <span className="w-16 font-semibold text-slate-500">Nomor</span>
                              <span className="mr-1.5">:</span>
                              <span className="font-mono font-bold text-slate-950">{selectedLetter.noSurat}</span>
                            </div>
                            <div className="flex">
                              <span className="w-16 font-semibold text-slate-500">Lampiran</span>
                              <span className="mr-1.5">:</span>
                              <span className="text-slate-800">-</span>
                            </div>
                            <div className="flex">
                              <span className="w-16 font-semibold text-slate-500">Hal</span>
                              <span className="mr-1.5">:</span>
                              <span className="font-bold text-slate-900 underline">{selectedLetter.perihal}</span>
                            </div>
                          </div>

                          <div className="col-span-5 text-right font-bold text-slate-900">
                            Kupang, {formatIndonesianDate(selectedLetter.tanggalSurat)}
                          </div>
                        </div>

                        {/* Recipient area */}
                        <div className="mt-5 space-y-0.5 text-[10px]">
                          <p className="font-bold text-slate-900">Kepada : Yang Terhormat</p>
                          <div className="pl-4 font-bold text-slate-950 whitespace-pre-line">{selectedLetter.penerima}</div>
                          {!selectedLetter.penerima.toLowerCase().includes('masing') && (
                            <p className="pl-4 text-slate-700 font-medium">Masing - masing</p>
                          )}
                          <p className="pl-4 text-slate-600">di -</p>
                          <p className="pl-10 font-bold text-slate-950">Tempat</p>
                        </div>

                        {/* Verse block (Mikha 6:8) */}
                        <div className="my-5 text-center italic text-slate-800 font-semibold tracking-wide text-[10px]">
                          Lakukan Keadilan, Cintai Kesetiaan dan Hidup Rendah Hati di Hadapan Allah (Mikha 6:8)
                        </div>

                        {/* Body content */}
                        <div className="space-y-3 text-justify text-[10px] text-slate-900 leading-relaxed font-medium">
                          {selectedLetter.ringkasan.includes('Salam damai') ? (
                            <div className="whitespace-pre-line leading-relaxed">{selectedLetter.ringkasan}</div>
                          ) : (
                            <div className="space-y-2">
                              <p>Salam damai dalam Kasih Yesus Kristus,</p>
                              <p>Semoga kami menjumpai Bapak/Ibu dalam keadaan damai sejahtera.</p>
                              <div className="whitespace-pre-line py-2 leading-relaxed">
                                {selectedLetter.ringkasan}
                              </div>
                              <p>Demikian penyampaian kami, atas perhatian dan kerja samanya, kami ucapkan terima kasih. Tuhan Yesus memberkati.</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Signatures & bottom list block */}
                  <div className="mt-8 space-y-6">
                    {/* Signature block */}
                    {renderSignatures(selectedLetter.ttdType)}

                    {/* Tembusan for Rekomendasi */}
                    {isRekomendasi && parsedRekomendasi && (
                      <div className="text-[9px] text-slate-800 space-y-0.5 border-t border-slate-100 pt-2 text-left max-w-md">
                        <p className="font-bold text-slate-900 underline uppercase tracking-wider text-[8px]">Tembusan disampaikan dengan hormat kepada:</p>
                        <div className="pl-3 space-y-0.5 font-medium">
                          {parsedRekomendasi.tembusanLines.map((line, idx) => (
                            <p key={idx}>{idx + 1}. {line}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dynamic bottom board member banner */}
                    <div 
                      className={`border p-2.5 rounded-lg text-[8px] text-slate-800 text-center leading-relaxed ${
                        printColored 
                          ? 'border-black' 
                          : 'bg-slate-50 border-slate-300'
                      }`}
                      style={printColored ? { backgroundColor: '#FF00FF' } : undefined}
                      id="gmit-board-footer-box"
                    >
                      <p className="font-extrabold text-slate-950 uppercase tracking-wider border-b border-black/10 pb-0.5 mb-1">
                        Susunan Majelis Sinode GMIT Periode 2024 – 2027 :
                      </p>
                      <p className="font-bold text-slate-900">
                        <strong>Ketua:</strong> Pdt. Semuel B. Pandie, S.Th · <strong>Wakil Ketua:</strong> Pdt. Saneb Y. Ena Blegur, S.Th · <strong>Sekretaris:</strong> Pdt. Lay Abdi Karya Wenyi, M.Si · <strong>Wakil Sekretaris:</strong> Pdt. Zimrat M. S. Karmany, M.Th · <strong>Bendahara:</strong> Pnt. Yefta Sanam SE, MM
                      </p>
                      <p className="font-semibold text-slate-700 mt-0.5 italic">
                        <strong>Anggota-Anggota:</strong> Pnt. Ir. Emelia J. Nomleni · Pnt. Dr. Fredrik A. Kande · Pnt. Dorce W. Bolla, SH · Pnt. Dr. Rolland Fanggidae, S.Si Teol, MM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

             <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
              <div>
                {(currentUser.role === 'ADMIN' || currentUser.role === 'STAF' || currentUser.role === 'PIMPINAN') && (
                  <button
                    onClick={() => {
                      const letter = selectedLetter;
                      setSelectedLetter(null);
                      handleStartEdit(letter);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all cursor-pointer"
                    title="Ubah data surat keluar ini"
                  >
                    <FileEdit className="h-4 w-4" /> Ubah Data Surat
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedLetter(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
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
                <h3 className="font-heading font-bold text-base">Konfirmasi Hapus Surat Keluar</h3>
              </div>
              <button 
                onClick={() => setLetterToDelete(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg animate-fade-in"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus data surat keluar berikut secara permanen? Perubahan ini akan langsung disimpan dan tidak dapat dibatalkan.
              </p>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Nomor Surat</span>
                  <span className="font-semibold text-slate-800 font-mono">{letterToDelete.noSurat}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Penerima</span>
                  <span className="font-semibold text-slate-800">{letterToDelete.penerima}</span>
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
                  if (onDeleteSuratKeluar) {
                    const deletedNo = letterToDelete.noSurat;
                    onDeleteSuratKeluar(letterToDelete.id);
                    showToast(`Data Surat Keluar No. "${deletedNo}" berhasil dihapus secara permanen!`);
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
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-100">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

    </div>
  );
}
