/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IdentitasGuru {
  namaSekolah: string;
  alamatSekolah: string;
  namaGuru: string;
  nipGuru: string;
  nuptkGuru: string;
  mapel: string;
  kelas: string;
  fase: string;
  semester: "Ganjil" | "Genap" | "Ganjil & Genap";
  tahunAjaran: string;
  namaKepsek: string;
  nipKepsek: string;
  jabatanGuru: string;
  waliKelasDi: string; // e.g. "X-A" or "None"
  emailGuru: string;
  teleponGuru: string;
  logoUrl?: string;
  kota: string;
}

export type DocumentId =
  | "cover"
  | "identitas"
  | "kalender"
  | "prota"
  | "promes"
  | "atp"
  | "modul"
  | "jurnal"
  | "jadwal"
  | "kehadiran"
  | "asesmen"
  | "analisis"
  | "remedial"
  | "bk"
  | "walikelas"
  | "p5"
  | "portofolio"
  | "refleksi"
  | "penutup";

export interface AgendaSekolah {
  id: string;
  tanggal: string;
  tanggalSelesai?: string;
  kegiatan: string;
  deskripsi?: string;
  kategori: "libur" | "akademik" | "asesmen" | "sekolah";
}

export interface KalenderAkademik {
  hariEfektifGanjil: number;
  mingguEfektifGanjil: number;
  hariEfektifGenap: number;
  mingguEfektifGenap: number;
  agenda: AgendaSekolah[];
}

export interface ProtaItem {
  id: string;
  no: number;
  tujuanPembelajaran: string;
  materiPokok: string;
  alokasiWaktu: number; // JP (Jam Pelajaran)
  semester: "1" | "2";
  targetCapaian: string;
}

export interface PromesItem {
  id: string;
  no: number;
  materiPokok: string;
  alokasiWaktu: number; // JP
  semester: "1" | "2"; // Semester Ganjil atau Genap
  mingguEfektif: { [key: string]: number }; // e.g., { "Jul-1": 2, "Jul-2": 0, etc. }
  libur?: { [key: string]: boolean }; // e.g., { "Jul-1": true } = week libur/ujian
  jadwalAsesmen: string; // e.g., "Formatif 1", "STS", "SAS"
}

export interface AtpItem {
  id: string;
  kode: string;
  elemen: string;
  capaianPembelajaran: string;
  tujuanPembelajaran: string;
  materiPokok: string;
  profilPelajarPancasila: string[];
  alokasiWaktu: number;
  glosarium: string;
}

export interface ModulAjar {
  id: string;
  temaModul: string;
  temuKe: string;
  alokasiWaktu: string;
  kompetensiAwal: string;
  profilPancasila: string[];
  saranaPrasarana: string;
  targetPesertaDidik: string;
  modelPembelajaran: string; // e.g., "Deep Learning - Problem Based"
  tujuanPembelajaran: string;
  pemahamanBermakna: string;
  pertanyaanPemantik: string;
  kegiatanPembelajaran: {
    pendahuluan: string[];
    intiDeepLearning: {
      mindfulEngagement: string[]; // Deep Learning element 1
      deepProcessing: string[];   // Deep Learning element 2
      transferOfLearning: string[]; // Deep Learning element 3
    };
    penutup: string[];
  };
  aksesmen: {
    diagnostik: string;
    formatif: string;
    sumatif: string;
  };
  diferensiasi: {
    konten: string;
    proses: string;
    produk: string;
  };
  refleksiGuru: string;
  refleksiSiswa: string;
}

export interface JurnalHarianEntry {
  id: string;
  hariTanggal: string;
  kelas: string;
  jamKe: string;
  materiPokok: string;
  indikatorKetercapaian: string;
  kehadiranSiswa: {
    hadir: number;
    sakit: string[]; // names or counts
    izin: string[];
    alfa: string[];
  };
  kendala: string;
  tindakLanjut: string;
}

export interface JadwalEntry {
  id: string;
  hari: "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu";
  jamKe: string; // e.g. "I (07:00 - 07:45)"
  kelas: string;
  mapel: string;
  alokasiWaktu: number; // JP
}

export interface Siswa {
  id: string;
  noAbsen: number;
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: "L" | "P";
  namaOrangTua: string;
  alamat: string;
  teleponOrangTua: string;
}

export interface KehadiranBulanan {
  siswaId: string;
  hadir: number[]; // 1 for present, 0 for off, or specific counts
  sakit: number;
  izin: number;
  alfa: number;
}

export interface RencanaAsesmen {
  id: string;
  jenis: "Diagnostik" | "Formatif" | "Sumatif";
  namaAsesmen: string;
  kisiKisi: string;
  soalHotsSample: string;
  rubrikPenilaian: {
    kriteria: string;
    skor4: string; // Sangat Baik
    skor3: string; // Baik
    skor2: string; // Cukup
    skor1: string; // Perlu Bimbingan
  }[];
}

export interface NilaiSiswa {
  siswaId: string;
  namaSiswa: string;
  nilaiFormatif1: number;
  nilaiFormatif2: number;
  nilaiSumatifTengah: number;
  nilaiSumatifAkhir: number;
  nilaiRapor: number;
  isTuntas: boolean;
  rekomendasi: "Tuntas" | "Remedial" | "Pengayaan";
}

export interface BKEntry {
  id: string;
  tanggal: string;
  namaSiswa: string;
  kelas: string;
  catatanPerilaku: string;
  tindakanBK: string;
  statusKomunikasiOrtu: "Belum" | "Sudah" | "Pemanggilan";
  solusiTindakLanjut: string;
}

export interface PiketEntry {
  hari: "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat";
  siswaIds: string[];
}

export interface DimensiKokurikuler {
  id: string;
  nama: string;
}

export interface TimelineKokurikuler {
  id: string;
  minggu: string;
  aktivitas: string;
}

export interface AsesmenKokurikuler {
  awal: string;
  proses: string;
  akhir: string;
  rubrik: string;
  narasiRapor: string;
}

export interface ProyekKokurikuler {
  id: string;
  judul: string;
  tema: string;
  tujuan: string;
  dimensi: DimensiKokurikuler[];
  timeline: TimelineKokurikuler[];
  asesmen: AsesmenKokurikuler;
}

export interface PortofolioItem {
  id: string;
  namaSiswa: string;
  namaKarya: string;
  deskripsiKarya: string;
  tanggalKarya: string;
  predikat: "Sangat Baik" | "Baik" | "Cukup" | "Kurang";
  refleksiSingkat: string;
}

// Master state storing everything in localStorage
export interface AdministrasiTahunState {
  identitas: IdentitasGuru;
  kalender: KalenderAkademik;
  prota: ProtaItemsWrapper;
  promes: PromesItemsWrapper;
  atp: AtpItem[];
  modul: ModulAjar[];
  jurnal: JurnalHarianEntry[];
  jadwal: JadwalEntry[];
  siswaList: Siswa[];
  kehadiranMap: { [bulan: string]: KehadiranBulanan[] }; // bulan: e.g. "Juli", "Agustus"
  asesmenList: RencanaAsesmen[];
  nilaiSiswaList: NilaiSiswa[];
  remedialLogs: RemedialLog[];
  bkLogs: BKEntry[];
  strukturKelas: {
    ketua: string;
    wakil: string;
    sekretaris: string;
    bendahara: string;
  };
  jadwalPiket: PiketEntry[];
  tataTertib: string[];
  kontrakBelajar: string[];
  proyekKokurikuler: ProyekKokurikuler[];
  portofolio: PortofolioItem[];
  refleksiTahunan: {
    keberhasilan: string;
    tantangan: string;
    kendalaUtama: string;
    hasilEvaluasi: string;
    rencanaPerbaikan: string;
  };
  stampUrl?: string;
  signatureUrl?: string;
}

export interface ProtaItemsWrapper {
  targetTahunan: string;
  items: ProtaItem[];
}

export interface PromesItemsWrapper {
  bulanKolom: string[]; // e.g. ["Jul 1", "Jul 2", "Jul 3", "Jul 4", "Agu 1", ...]
  items: PromesItem[];
}

export interface RemedialLog {
  id: string;
  namaSiswa: string;
  materiPokok: string;
  nilaiAwal: number;
  nilaiAkhir: number;
  tanggalKegiatan: string;
  bentukBimbingan: string;
  status: "Belum Tuntas" | "Tuntas";
}
