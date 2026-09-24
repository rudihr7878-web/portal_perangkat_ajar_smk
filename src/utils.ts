/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdministrasiTahunState, Siswa } from "./types";

export const DIMENSI_PROFIL_LULUSAN = [
  "Keimanan dan Ketakwaan",
  "Kewargaan",
  "Penalaran Kritis",
  "Kreativitas",
  "Kolaborasi",
  "Kemandirian",
  "Kesehatan",
  "Komunikasi",
];

export const BULAN_KOLOM_PRESET = [
  "Jul-1", "Jul-2", "Jul-3", "Jul-4",
  "Agu-1", "Agu-2", "Agu-3", "Agu-4",
  "Sep-1", "Sep-2", "Sep-3", "Sep-4", "Sep-5",
  "Okt-1", "Okt-2", "Okt-3", "Okt-4",
  "Nov-1", "Nov-2", "Nov-3", "Nov-4",
  "Des-1", "Des-2", "Des-3", "Des-4"
];

export const BULAN_KOLOM_PRESET_GENAP = [
  "Jan-1", "Jan-2", "Jan-3", "Jan-4",
  "Feb-1", "Feb-2", "Feb-3", "Feb-4",
  "Mar-1", "Mar-2", "Mar-3", "Mar-4", "Mar-5",
  "Apr-1", "Apr-2", "Apr-3", "Apr-4",
  "Mei-1", "Mei-2", "Mei-3", "Mei-4",
  "Jun-1", "Jun-2", "Jun-3", "Jun-4"
];

export const SISWA_PRESET: Siswa[] = [
  { id: "s1", noAbsen: 1, nis: "26001", nisn: "0098273641", nama: "Ahmad Fauzi", jenisKelamin: "L", namaOrangTua: "Heri Susanto", alamat: "Jl. Merdeka No. 45, Bandung", teleponOrangTua: "081234567890" },
  { id: "s2", noAbsen: 2, nis: "26002", nisn: "0097123456", nama: "Anissa Putri", jenisKelamin: "P", namaOrangTua: "Dedi Wijaya", alamat: "Perum Graha Indah Blok C3, Bandung", teleponOrangTua: "081398765432" },
  { id: "s3", noAbsen: 3, nis: "26003", nisn: "0096541278", nama: "Budi Pratama", jenisKelamin: "L", namaOrangTua: "Agus Pratama", alamat: "Kp. Kamandoran RT 02/RW 04, Bandung", teleponOrangTua: "085211223344" },
  { id: "s4", noAbsen: 4, nis: "26004", nisn: "0095431872", nama: "Citra Lestari", jenisKelamin: "P", namaOrangTua: "Iwan Lesmana", alamat: "Jl. Dago No. 112, Bandung", teleponOrangTua: "089988776655" },
  { id: "s5", noAbsen: 5, nis: "26005", nisn: "0091122334", nama: "Dewi Kartika", jenisKelamin: "P", namaOrangTua: "Suryana", alamat: "Gg. H. Samsudin No. 8, Bandung", teleponOrangTua: "085644556677" },
  { id: "s6", noAbsen: 6, nis: "26006", nisn: "0094433221", nama: "Eko Prasetyo", jenisKelamin: "L", namaOrangTua: "Wawan", alamat: "Jl. Lodaya Gg. 1 No. 5, Bandung", teleponOrangTua: "081277332211" },
  { id: "s7", noAbsen: 7, nis: "26007", nisn: "0097788990", nama: "Farhan Mahendra", jenisKelamin: "L", namaOrangTua: "Budi Mahendra", alamat: "Jl. Buah Batu No. 204, Bandung", teleponOrangTua: "087711224455" },
  { id: "s8", noAbsen: 8, nis: "26008", nisn: "0098866554", nama: "Gita Safitri", jenisKelamin: "P", namaOrangTua: "Asep Safitri", alamat: "Jl. Cihampelas No. 12, Bandung", teleponOrangTua: "081322446688" },
  { id: "s9", noAbsen: 9, nis: "26009", nisn: "0099900112", nama: "Heri Setiawan", jenisKelamin: "L", namaOrangTua: "Agustinus", alamat: "Komp. Kopo Permai Blok B2, Bandung", teleponOrangTua: "081122339900" },
  { id: "s10", noAbsen: 10, nis: "26010", nisn: "0092233445", nama: "Indah Lestari", jenisKelamin: "P", namaOrangTua: "Dadang", alamat: "Jl. Pasir Kaliki No. 89, Bandung", teleponOrangTua: "082155667788" },
  { id: "s11", noAbsen: 11, nis: "26011", nisn: "0093344556", nama: "Kartika Sari", jenisKelamin: "P", namaOrangTua: "Mulyadi", alamat: "Gg. Masjid Cikutra No. 12, Bandung", teleponOrangTua: "085344332211" },
  { id: "s12", noAbsen: 12, nis: "26012", nisn: "0094455667", nama: "Muhammad Ridho", jenisKelamin: "L", namaOrangTua: "Zulkifli", alamat: "Jl. Antapani Raya No. 41, Bandung", teleponOrangTua: "087811992200" },
  { id: "s13", noAbsen: 13, nis: "26013", nisn: "0095566778", nama: "Nabila Syahira", jenisKelamin: "P", namaOrangTua: "Syakir", alamat: "Kp. Bojongsoang Desa No. 34, Bandung", teleponOrangTua: "081922334455" },
  { id: "s14", noAbsen: 14, nis: "26014", nisn: "0096677889", nama: "Putri Rahmawati", jenisKelamin: "P", namaOrangTua: "Saman", alamat: "Perum Antapani Blok S-7, Bandung", teleponOrangTua: "081244889911" },
  { id: "s15", noAbsen: 15, nis: "26015", nisn: "0097788991", nama: "Rian Hidayat", jenisKelamin: "L", namaOrangTua: "Engkos Hidayat", alamat: "Kp. Sukajadi RT 01/RW 03, Bandung", teleponOrangTua: "085299881122" }
];

export const INITIAL_STATE: AdministrasiTahunState = {
  identitas: {
    namaSekolah: "SMA Negeri 1 Kota Bandung",
    alamatSekolah: "Jl. Belitung No. 8, Sumur Bandung, Kota Bandung, Jawa Barat 40113",
    namaGuru: "Bagus Wicaksono, S.Pd., M.T.",
    nipGuru: "19881024 201503 1 002",
    nuptkGuru: "8435766668130112",
    mapel: "Informatika (Kurikulum Merdeka)",
    kelas: "X-A (Fase E)",
    fase: "E",
    semester: "Ganjil & Genap",
    tahunAjaran: "2026/2027",
    namaKepsek: "Dr. Hj. Sri Wahyuni, M.Pd.",
    nipKepsek: "19710412 199602 2 001",
    jabatanGuru: "Guru Ahli Muda / Pembina",
    waliKelasDi: "X-A",
    emailGuru: "bagus.wicaksono@smai.sch.id",
    teleponGuru: "0812-7000-8890",
    kota: "Bandung"
  },
  kalender: {
    hariEfektifGanjil: 112,
    mingguEfektifGanjil: 19,
    hariEfektifGenap: 104,
    mingguEfektifGenap: 18,
    agenda: [
      { id: "a1", tanggal: "2026-07-13", kegiatan: "Hari Pertama Masuk Sekolah (MPLS)", kategori: "akademik" },
      { id: "a2", tanggal: "2026-08-17", kegiatan: "Upacara HUT RI ke-81", kategori: "sekolah" },
      { id: "a3", tanggal: "2026-09-14", kegiatan: "Asesmen Nasional Berbasis Komputer (ANBK)", kategori: "asesmen" },
      { id: "a4", tanggal: "2026-09-28", kegiatan: "Sumatif Tengah Semester (STS) Ganjil", kategori: "asesmen" },
      { id: "a5", tanggal: "2026-11-30", kegiatan: "Sumatif Akhir Semester (SAS) Ganjil", kategori: "asesmen" },
      { id: "a6", tanggal: "2026-12-18", kegiatan: "Pembagian Rapor Semester Ganjil", kategori: "akademik" },
      { id: "a7", tanggal: "2026-12-21", kegiatan: "Libur Semester Ganjil (21 Des - 3 Jan)", kategori: "libur" },
      { id: "a8", tanggal: "2027-01-04", kegiatan: "Hari Pertama Masuk Semester Genap", kategori: "akademik" },
      { id: "a9", tanggal: "2027-03-08", kegiatan: "Sumatif Tengah Semester (STS) Genap", kategori: "asesmen" },
      { id: "a10", tanggal: "2027-05-24", kegiatan: "Sumatif Akhir Jenjang (Kelas XII) / PAT", kategori: "asesmen" },
      { id: "a11", tanggal: "2027-06-18", kegiatan: "Pembagian Rapor Semester Genap / Kenaikan Kelas", kategori: "akademik" }
    ]
  },
  prota: {
    targetTahunan: "Peserta didik mampu memahami konsep berpikir komputasional, memetakan alur logika algoritma tingkat lanjut, merancang pemrograman terstruktur sederhana menggunakan Python, menganalisis jaringan komputer dasar, mengelola basis data, dan merealisasikan projek lintas bidang berbasis Deep Learning.",
    items: [
      { id: "p1", no: 1, tujuanPembelajaran: "Menerapkan strategi berpikir komputasional untuk memecahkan persoalan yang kompleks (dekomposisi, pengenalan pola, abstraksi, algoritmik)", materiPokok: "Berpikir Komputasional (BK)", alokasiWaktu: 12, semester: "1", targetCapaian: "Siswa sanggup menstrukturkan masalah rumit secara algoritmik." },
      { id: "p2", no: 2, tujuanPembelajaran: "Merancang algoritma pemrograman dalam bentuk flowchart dan pseudocode untuk menyelesaikan problem logika matematika dan sains", materiPokok: "Algoritma & Flowchart", alokasiWaktu: 12, semester: "1", targetCapaian: "Alur logika siswa terstruktur menggunakan bagan alir terstandar." },
      { id: "p3", no: 3, tujuanPembelajaran: "Mengimplementasikan dasar coding terstruktur meliputi variabel, tipe data, perulangan, kondisional, fungsi, dan list dalam bahasa Python", materiPokok: "Pemrograman Dasar Python", alokasiWaktu: 18, semester: "1", targetCapaian: "Siswa mahir membuat software mini berorientasi solusi." },
      { id: "p4", no: 4, tujuanPembelajaran: "Menganalisis prinsip kerja topologi jaringan komputer, routing, media transmisi nirkabel, dan konfigurasi IP Address sederhana", materiPokok: "Jaringan Komputer & Internet (JKI)", alokasiWaktu: 12, semester: "2", targetCapaian: "Siswa paham arsitektur transmisi data lokal dan cloud." },
      { id: "p5", no: 5, tujuanPembelajaran: "Mengidentifikasi ancaman keamanan informasi (malware, phishing, hacking) serta menerapkan perlindungan enkripsi kunci publik-privat", materiPokok: "Keamanan Informasi & Kriptografi", alokasiWaktu: 8, semester: "2", targetCapaian: "Aktivitas digital siswa aman dan beretika." },
      { id: "p6", no: 6, tujuanPembelajaran: "Merekayasa sistem basis data relasional (RDBMS) sederhana meliputi pemodelan ERD dan query SQL dasar (SELECT, JOIN, WHERE)", materiPokok: "Sistem Basis Data Dasar", alokasiWaktu: 12, semester: "2", targetCapaian: "Siswa terampil membuat penyimpanan data struktural terintegrasi." },
      { id: "p7", no: 7, tujuanPembelajaran: "Berkolaborasi merancang dan mengeksekusi projek kelompok computational artifact terintegrasi untuk solusi lokal kemasyarakatan", materiPokok: "Projek Lintas Bidang (PLB)", alokasiWaktu: 12, semester: "2", targetCapaian: "Siswa berjiwa solutif tinggi, terampil bekerjasama." }
    ]
  },
  promes: {
    bulanKolom: BULAN_KOLOM_PRESET,
    items: [
      { id: "pr1", no: 1, semester: "1", materiPokok: "Berpikir Komputasional (BK)", alokasiWaktu: 12, mingguEfektif: { "Jul-3": 4, "Jul-4": 4, "Agu-1": 4 }, jadwalAsesmen: "Formatif Aspek Logika" },
      { id: "pr2", no: 2, semester: "1", materiPokok: "Algoritma & Flowchart", alokasiWaktu: 12, mingguEfektif: { "Agu-2": 4, "Agu-3": 4, "Agu-4": 4 }, jadwalAsesmen: "Formatif Desain Alir" },
      { id: "pr3", no: 3, semester: "1", materiPokok: "Pemrograman Dasar Python", alokasiWaktu: 18, mingguEfektif: { "Sep-1": 4, "Sep-2": 4, "Sep-3": 4, "Okt-1": 3, "Okt-2": 3 }, jadwalAsesmen: "STS Ganjil & Praktik Python" },
      { id: "pr4", no: 4, semester: "1", materiPokok: "Jaringan Komputer & Internet (JKI)", alokasiWaktu: 12, mingguEfektif: { "Okt-3": 4, "Okt-4": 4, "Nov-1": 4 }, jadwalAsesmen: "Sumatif Hub Transmisi" },
      { id: "pr5", no: 5, semester: "1", materiPokok: "Keamanan Informasi & Kriptografi", alokasiWaktu: 8, mingguEfektif: { "Nov-2": 4, "Nov-3": 4 }, jadwalAsesmen: "Formatif Enkripsi" },
      { id: "pr6", no: 6, semester: "1", materiPokok: "Sistem Basis Data Dasar & Projek PLB", alokasiWaktu: 24, mingguEfektif: { "Nov-4": 4, "Des-1": 4, "Des-2": 4, "Des-3": 4, "Des-4": 4 }, jadwalAsesmen: "Sumatif Akhir Semester (SAS)" },
      { id: "pr7", no: 1, semester: "2", materiPokok: "Pemrograman Lanjutan (Struktur Data)", alokasiWaktu: 16, mingguEfektif: { "Jan-2": 4, "Jan-3": 4, "Jan-4": 4, "Feb-1": 4 }, jadwalAsesmen: "Formatif Struktur Data" },
      { id: "pr8", no: 2, semester: "2", materiPokok: "Jaringan Nirkabel & Keamanan", alokasiWaktu: 14, mingguEfektif: { "Feb-2": 4, "Feb-3": 4, "Feb-4": 4, "Mar-1": 2 }, jadwalAsesmen: "Formatif Jaringan" },
      { id: "pr9", no: 3, semester: "2", materiPokok: "Basis Data Relasional & SQL", alokasiWaktu: 16, mingguEfektif: { "Mar-1": 2, "Mar-2": 4, "Mar-3": 4, "Mar-4": 4, "Mar-5": 2 }, jadwalAsesmen: "STS Genap & Praktik SQL" },
      { id: "pr10", no: 4, semester: "2", materiPokok: "Projek Lintas Bidang (PLB)", alokasiWaktu: 20, mingguEfektif: { "Apr-1": 4, "Apr-2": 4, "Apr-3": 4, "Apr-4": 4, "Mei-1": 4 }, jadwalAsesmen: "Sumatif Projek" },
      { id: "pr11", no: 5, semester: "2", materiPokok: "Umpan Balik & Refleksi Akhir", alokasiWaktu: 8, mingguEfektif: { "Mei-2": 4, "Mei-3": 4 }, jadwalAsesmen: "SAS Genap" }
    ]
  },
  atp: [
    {
      id: "atp1",
      kode: "TP-BK-E.1",
      elemen: "Berpikir Komputasional (BK)",
      capaianPembelajaran: "Pada akhir fase E, peserta didik mampu menerapkan strategi algoritmik standar untuk menghasilkan beberapa solusi pada persoalan dengan data diskrit bervolume besar.",
      tujuanPembelajaran: "Peserta didik mampu menerapkan teknik dekomposisi untuk memilah persoalan optimalisasi jaringan kompleks menjadi sub-masalah kecil secara sistematis.",
      materiPokok: "Penerapan BK dalam Kehidupan Nyata",
      profilPelajarPancasila: ["Bernalar Kritis", "Mandiri"],
      alokasiWaktu: 6,
      glosarium: "Dekomposisi: Teknik memecah komponen besar menjadi bagian-bagian terkontrol."
    },
    {
      id: "atp2",
      kode: "TP-AP-E.1",
      elemen: "Algoritma dan Pemrograman (AP)",
      capaianPembelajaran: "Pada akhir fase E, peserta didik mampu merancang dan mengimplementasikan program komputer sederhana dengan menyusun skema modular.",
      tujuanPembelajaran: "Mengembangkan algoritma penyelesaian persamaan matematika menggunakan struktur penyeleksian kondisi (if-else) dan perulangan (while, for) secara logika runtut.",
      materiPokok: "Conditional & Looping Logic",
      profilPelajarPancasila: ["Bernalar Kritis", "Kreatif"],
      alokasiWaktu: 12,
      glosarium: "Pseudocode: Representasi kode program menggunakan bahasa kasual formal."
    },
    {
      id: "atp3",
      kode: "TP-PLB-E.1",
      elemen: "Praktik Lintas Bidang (PLB)",
      capaianPembelajaran: "Pada akhir fase E, peserta didik mampu mengintegrasikan beberapa elemen informatika untuk menghasilkan artefak komputasional yang bermanfaat secara luas.",
      tujuanPembelajaran: "Berkolaborasi dalam kerja kelompok mempraktikkan siklus hidup pengembangan sistem (SDLC) sederhana guna merancang dashboard pantauan kualitas udara.",
      materiPokok: "Software Development Cycle & Collaborations",
      profilPelajarPancasila: ["Gotong Royong", "Kreatif"],
      alokasiWaktu: 12,
      glosarium: "Computational Artifact: Produk teknologi seperti aplikasi, game, web hasil rancangan logika digital."
    }
  ],
  modul: [{
    id: "m1",
    temaModul: "Pemrograman Dasar Phyton Menggunakan Pendekatan Deep Learning",
    temuKe: "Pertemuan ke-5 s.d 8",
    alokasiWaktu: "8 JP (4 x 45 Menit)",
    kompetensiAwal: "Siswa telah memahami logika flowchart, penulisan pseudocode ringkas, dan konsep variabel matematika standar.",
    profilPancasila: ["Penalaran Kritis - Mampu mengevaluasi kesalahan logika coding secara objektif.", "Kreativitas - Merancang variasi pemecahan masalah fungsional.", "Kolaborasi - Berbagi penanganan eror dalam praktik laboratorium."],
    saranaPrasarana: "Lab Komputer, Proyektor, Google Colab / VS Code, Koneksi Internet, Modul Pembelajaran PDF.",
    targetPesertaDidik: "Siswa reguler/umum (36 siswa) dengan keragaman pemahaman, termasuk siswa visual maupun taktil.",
    modelPembelajaran: "Deep Learning - Contextual Problem Based Learning dengan Berpikir Reflektif",
    tujuanPembelajaran: "Melalui studi kasus nyata di masyarakat, peserta didik dapat mengaplikasikan kode kondisional majemuk (Nested IF) Python untuk memprogram kalkulator otomatis indeks gizi sehat, menunjukkan akurasi logika minimal 85% dan mengaitkan relevansi kodifikasinya bagi bidang kesehatan masyarakat.",
    pemahamanBermakna: "Bahasa komputer bukan sekadar instruksi mati, melainkan jembatan logika dinamis untuk mengotomatisasi solusi sosial, memudahkan perhitungan berulang dalam kehidupan manusia nyata.",
    pertanyaanPemantik: "Bagaimana sistem cerdas seperti kasir bioskop tahu secara otomatis kapan harus memberikan potongan harga anak-anak dan kapan mengenakan tarif dewasa?",
    kegiatanPembelajaran: {
      pendahuluan: [
        "Guru mengkondisikan kelas dengan sapaan hangat, doa bersama, dan presensi berbasis emosi siswa.",
        "Apersepsi visual: Menayangkan simulasi singkat antarmuka aplikasi ojek online saat menentukan diskon jam sibuk.",
        "Motivasi: Menyampaikan manfaat keterampilan coding di era industri modern dan kaitannya dengan karir bernilai tinggi."
      ],
      intiDeepLearning: {
        mindfulEngagement: [
          "Fokus Terarah: Guru memberikan permasalahan kontradiktif: 'Mengapa klasifikasi gizi manual sering salah sasaran?' Siswa mengamati data riil tanpa intervensi langsung.",
          "Koneksi Personal: Siswa diajak beralih membayangkan jika keluarga mereka kesulitan mengonsultasikan asupan gizi. Muncul empati kepedulian sosial.",
          "Curiosity Trigger: Demonstrasi software Python gizi buatan guru yang merespons masukan siswa secara instan, memicu rasa penasaran cara kerja kode di belakang layar."
        ],
        deepProcessing: [
          "Membaca Kritis: Siswa menelaah blok sintaks sintaks kode kondisional IF-ELIF-ELSE secara mandiri dari modul e-reader.",
          "Refleksi Logika: Siswa mengerjakan latihan 'Logic Debugging' di lembar kerja terstruktur: menemukenali mengapa sebuah kondisi tidak pernah dieksekusi.",
          "Diskusi Berpasangan (Think-Pair-Share): Memperdebatkan alur redundansi kode terbaik dengan rekan sebangku, menstimulasi rekonstruksi kognitif yang kokoh."
        ],
        transferOfLearning: [
          "Aplikasi Riil: Kelompok siswa merancang modul Python kalkulator gizi khusus kriteria Posyandu setempat berdasarkan rentang berat badan.",
          "Karya Otentik: Setiap kelompok menguji program mereka dengan data hipotetis 15 bayi, menyajikan hasil validitas keluaran di hadapan kelas.",
          "Umpan Balik Rekan: Kelompok lain melakukan 'Stress-Testing' menginput angka negatif atau huruf pada nilai dan mendiskusikan penanganan eror (Exception Handling)."
        ]
      },
      penutup: [
        "Siswa merangkum prinsip utama Nested IF dalam satu kalimat metafora bermakna.",
        "Refleksi metakognitif: 'Bagian logika mana yang paling menantang otak saya hari ini? Mengapa saya bisa menyelesaikannya?'",
        "Guru memberikan penguatan materi, mengapresiasi keaktifan, mengumumkan materi berikutnya (Perulangan Looping), dan berdoa penutup."
      ]
    },
    aksesmen: {
      diagnostik: "Tes Kognitif Singkat (Kuis Benar/Salah via Mentimeter tentang logika gerbang AND-OR-NOT) & Tes Non-kognitif (Pilihan gaya belajar sensorik visual/praktik).",
      formatif: "Lembar debugging kelompok 'Save the Code', observasi profil bernalar kritis selama pemecahan kode, dan penilaian harian pengerjaan tantangan di Google Colab.",
      sumatif: "Projek mini kelompok merancang sistem penentu kelulusan administrasi beasiswa otomatis, dilengkapi laporan analisis alur data (dikumpulkan dalam repositori GitHub/Google Drive)."
    },
    diferensiasi: {
      konten: "Menyediakan tutorial video (visual-auditori), modul interaktif di Google Colab (taktil/kinestetik), dan lembar cheat-sheet sintaksis cetak (baca-tulis).",
      proses: "Siswa berkemampuan logika tinggi diberikan tantangan pengayaan penanganan data masukan (try-except), siswa berkemampuan sedang diarahkan pada logika terstruktur standar, siswa yang butuh bimbingan didampingi intensif melalui Scaffolding terarah.",
      produk: "Memberikan kebebasan bentuk artefak komputasional: program berbasis konsol teks Python murni, atau program dengan visualisasi bagan alir interaktif, asalkan struktur kondisinya terwujud akurat."
    },
    refleksiGuru: "Apakah skenario Deep Processing berhasil mendorong siswa mendeteksi logika eror secara mandiri, ataukah instruksi verbal guru masih terlalu mendominasi proses berpikir siswa? Alokasi waktu pada tahap Coding Lab perlu didesain lebih longgar.",
    refleksiSiswa: "Awalnya saya mengira coding Python sangat membingungkan, namun setelah menyusun logika POSYANDU, saya menyadari baris sintaks itu hanyalah terjemahan bahasa sehari-hari dari langkah bantuan yang ingin saya berikan."
  }],
  jurnal: [
    {
      id: "j1",
      hariTanggal: "2026-07-20",
      kelas: "X-A",
      jamKe: "3 - 4 (08:30 - 10:00)",
      materiPokok: "Penulisan Notasi Algoritma Pseudocode",
      indikatorKetercapaian: "Siswa terampil merumuskan minimal 3 contoh instruksi pseudocode urutan beruntun dengan kaidah standarisasi yang baik.",
      kehadiranSiswa: { hadir: 34, sakit: ["Dewi Kartika"], izin: ["Ahmad Fauzi"], alfa: [] },
      kendala: "Sebagian siswa masih bingung membedakan simbol penugasan '=' dengan operator kesetaraan '==' dalam perumusan pseudocode.",
      tindakLanjut: "Penekanan visual menggunakan representasi kotak penyimpanan (untuk penugasan) vs timbangan berimbang (untuk komparasi) di papan tulis pada sesi berikutnya."
    },
    {
      id: "j2",
      hariTanggal: "2026-07-27",
      kelas: "X-A",
      jamKe: "3 - 4 (08:30 - 10:00)",
      materiPokok: "Modul Praktik Pertama Python Lab",
      indikatorKetercapaian: "Siswa berhasil mendeploy skrip Python pertama 'Hello World' dan memanipulasi 2 jenis variabel string/integer di Google Colab.",
      kehadiranSiswa: { hadir: 36, sakit: [], izin: [], alfa: [] },
      kendala: "Kendala teknis jaringan internet lambat saat pertama kali me-load virtual machine Google Colab, menyita waktu pengerjaan sekitar 15 menit.",
      tindakLanjut: "Membuat cadangan modul berupa lingkungan luring Jupyter Notebook di komputer lokal lab sekolah untuk antisipasi bandwidth drop."
    }
  ],
  jadwal: [
    { id: "jw1", hari: "Senin", jamKe: "III-IV (08.30 - 10.00)", kelas: "X-A", mapel: "Informatika", alokasiWaktu: 2 },
    { id: "jw2", hari: "Selasa", jamKe: "I-II (07.00 - 08.30)", kelas: "X-B", mapel: "Informatika", alokasiWaktu: 2 },
    { id: "jw3", hari: "Selasa", jamKe: "V-VI (10.15 - 11.45)", kelas: "X-C", mapel: "Informatika", alokasiWaktu: 2 },
    { id: "jw4", hari: "Kamis", jamKe: "III-IV (08.30 - 10.00)", kelas: "X-A", mapel: "Informatika", alokasiWaktu: 2 },
    { id: "jw5", hari: "Jumat", jamKe: "II-III (07.45 - 09.15)", kelas: "X-D", mapel: "Informatika", alokasiWaktu: 2 }
  ],
  siswaList: SISWA_PRESET,
  kehadiranMap: {
    "Juli": SISWA_PRESET.map(s => ({
      siswaId: s.id,
      hadir: [1, 1, 1, 1], // representative of 4 weeks
      sakit: s.id === "s5" ? 1 : 0,
      izin: s.id === "s1" ? 1 : 0,
      alfa: 0
    })),
    "Agustus": SISWA_PRESET.map(s => ({
      siswaId: s.id,
      hadir: [1, 1, 1, 1, 1],
      sakit: 0,
      izin: 0,
      alfa: 0
    }))
  },
  asesmenList: [
    {
      id: "as_diag",
      jenis: "Diagnostik",
      namaAsesmen: "Asesmen Diagnostik Kemampuan Bernalar Logika Informatika (Kognitif)",
      kisiKisi: "1. Pemahaman pola angka berulang. 2. Identifikasi aturan kondisional sederhana dalam skenario rute lalu lintas. 3. Kemampuan memilah urutan instruksi yang tepat.",
      soalHotsSample: "Diberikan sekumpulan aturan: Jika hari hujan, Anton naik mobil. Jika Anton naik mobil, ia memakai ikat pinggang. Hari ini Anton tidak memakai ikat pinggang. Tentukan kesimpulan logis dari kondisi di atas dan deskripsikan argumen abstraksi Anda yang memperkuat bukti tersebut!",
      rubrikPenilaian: [
        { kriteria: "Ketajaman Abstraksi Logis", skor4: "Mampu menyimpulkan secara tepat dengan menyertakan dalil logika Modus Tollens yang lengkap dan terstruktur.", skor3: "Menyimpulkan dengan benar namun bahasa penjelasannya bersifat deskriptif tanpa mengaitkan prinsip logika formal.", skor2: "Kesimpulan benar namun salah dalam memberikan penjelasan argumentasinya.", skor1: "Gagal menarik kesimpulan yang valid." }
      ]
    },
    {
      id: "as_form1",
      jenis: "Formatif",
      namaAsesmen: "Tantangan Desain Alur Algoritma POSYANDU Luring",
      kisiKisi: "Mengevaluasi kesiapan mahasiswa dalam menerjemahkan aturan kualitatif Posyandu (IMT, Balita gizi kurang/lebih) ke dalam bagan alir flowchart standar dan terbebas dari kebuntuan logika (Infinite Loop).",
      soalHotsSample: "Buatlah desing flowchart untuk menyeleksi 4 kategori status gizi anak secara otomatis berdasarkan parameter masukan umur, berat badan, dan tinggi badan. Pastikan diagram alir Anda menangani kemungkinan nilai masukan yang mustahil (seperti tinggi badan nol) dengan menampilkan pesan peringatan preventif!",
      rubrikPenilaian: [
        { kriteria: "Akurasi Logika Kontrol", skor4: "Semua percabangan terintegrasi penuh, bebas eror buntu, dan terdapat penanganan masukan tidak valid.", skor3: "Struktur percabangan benar tetapi belum mengakomodasi proteksi masukan tidak valid.", skor2: "Beberapa kondisi tumpang tindih sehingga menghasilkan klasifikasi yang keliru pada sebagian kecil rentang umur.", skor1: "Flowchart mengalami logical deadlock (buntu)." }
      ]
    },
    {
      id: "as_sum1",
      jenis: "Sumatif",
      namaAsesmen: "Asesmen Sumatif Akhir Bab - Logika Percabangan Python",
      kisiKisi: "Siswa diuji kemampuannya menyelesaikan masalah pengkodean Python nyata (Nested IF tingkat kompleks), penulisan gaya sintaksis yang bersih (Clean Code), penanganan eror masukan, dan pengujian program menggunakan Unit Test sederhana.",
      soalHotsSample: "Tuliskan program Python modular utuh untuk menentukan kelayakan pembiayaan energi hijau panel surya ramah lingkungan di pemukiman kumuh. Aturan didasarkan pada pendapatan bulanan, skor indeks terik matahari geolokasi, dan luas atap rumah. Program wajib divalidasi dengan struktur Exception Handling 'try-except'!",
      rubrikPenilaian: [
        { kriteria: "Robustness & Exception Handling", skor4: "Skrip berjalan mulus, kesalahan input dihandle tanpa crash, disertai penjelasan komentar komprehensif.", skor3: "Sintaksis program benar, tetapi penanganan kekeliruan masukan masih standar biasa.", skor2: "Kondisi nested IF bekerja, namun tidak ada proteksi kesalahan input, program crash saat dimasuki data salah tipe.", skor1: "Sintaks mengalami kekeliruan fatal (SyntaxError)." }
      ]
    }
  ],
  nilaiSiswaList: [
    { siswaId: "s1", namaSiswa: "Ahmad Fauzi", nilaiFormatif1: 85, nilaiFormatif2: 80, nilaiSumatifTengah: 78, nilaiSumatifAkhir: 82, nilaiRapor: 81, isTuntas: true, rekomendasi: "Tuntas" },
    { siswaId: "s2", namaSiswa: "Anissa Putri", nilaiFormatif1: 92, nilaiFormatif2: 95, nilaiSumatifTengah: 88, nilaiSumatifAkhir: 94, nilaiRapor: 92, isTuntas: true, rekomendasi: "Pengayaan" },
    { siswaId: "s3", namaSiswa: "Budi Pratama", nilaiFormatif1: 65, nilaiFormatif2: 60, nilaiSumatifTengah: 58, nilaiSumatifAkhir: 62, nilaiRapor: 61, isTuntas: false, rekomendasi: "Remedial" },
    { siswaId: "s4", namaSiswa: "Citra Lestari", nilaiFormatif1: 80, nilaiFormatif2: 88, nilaiSumatifTengah: 82, nilaiSumatifAkhir: 85, nilaiRapor: 84, isTuntas: true, rekomendasi: "Tuntas" },
    { siswaId: "s5", namaSiswa: "Dewi Kartika", nilaiFormatif1: 68, nilaiFormatif2: 62, nilaiSumatifTengah: 70, nilaiSumatifAkhir: 65, nilaiRapor: 66, isTuntas: false, rekomendasi: "Remedial" },
    { siswaId: "s6", namaSiswa: "Eko Prasetyo", nilaiFormatif1: 84, nilaiFormatif2: 82, nilaiSumatifTengah: 80, nilaiSumatifAkhir: 81, nilaiRapor: 81, isTuntas: true, rekomendasi: "Tuntas" },
    { siswaId: "s7", namaSiswa: "Farhan Mahendra", nilaiFormatif1: 78, nilaiFormatif2: 74, nilaiSumatifTengah: 75, nilaiSumatifAkhir: 76, nilaiRapor: 76, isTuntas: true, rekomendasi: "Tuntas" },
    { siswaId: "s8", namaSiswa: "Gita Safitri", nilaiFormatif1: 90, nilaiFormatif2: 92, nilaiSumatifTengah: 95, nilaiSumatifAkhir: 91, nilaiRapor: 92, isTuntas: true, rekomendasi: "Pengayaan" },
    { siswaId: "s9", namaSiswa: "Heri Setiawan", nilaiFormatif1: 82, nilaiFormatif2: 84, nilaiSumatifTengah: 83, nilaiSumatifAkhir: 85, nilaiRapor: 84, isTuntas: true, rekomendasi: "Tuntas" },
    { siswaId: "s10", namaSiswa: "Indah Lestari", nilaiFormatif1: 75, nilaiFormatif2: 78, nilaiSumatifTengah: 75, nilaiSumatifAkhir: 77, nilaiRapor: 76, isTuntas: true, rekomendasi: "Tuntas" },
    { siswaId: "s11", namaSiswa: "Kartika Sari", nilaiFormatif1: 88, nilaiFormatif2: 85, nilaiSumatifTengah: 90, nilaiSumatifAkhir: 86, nilaiRapor: 87, isTuntas: true, rekomendasi: "Tuntas" },
    { siswaId: "s12", namaSiswa: "Muhammad Ridho", nilaiFormatif1: 72, nilaiFormatif2: 70, nilaiSumatifTengah: 73, nilaiSumatifAkhir: 71, nilaiRapor: 71, isTuntas: false, rekomendasi: "Remedial" },
    { siswaId: "s13", namaSiswa: "Nabila Syahira", nilaiFormatif1: 86, nilaiFormatif2: 88, nilaiSumatifTengah: 85, nilaiSumatifAkhir: 87, nilaiRapor: 86, isTuntas: true, rekomendasi: "Tuntas" },
    { siswaId: "s14", namaSiswa: "Putri Rahmawati", nilaiFormatif1: 95, nilaiFormatif2: 98, nilaiSumatifTengah: 94, nilaiSumatifAkhir: 96, nilaiRapor: 96, isTuntas: true, rekomendasi: "Pengayaan" },
    { siswaId: "s15", namaSiswa: "Rian Hidayat", nilaiFormatif1: 80, nilaiFormatif2: 82, nilaiSumatifTengah: 81, nilaiSumatifAkhir: 83, nilaiRapor: 82, isTuntas: true, rekomendasi: "Tuntas" }
  ],
  remedialLogs: [
    { id: "rem1", namaSiswa: "Budi Pratama", materiPokok: "Logika Percabangan Python", nilaiAwal: 61, nilaiAkhir: 80, tanggalKegiatan: "2026-10-12", bentukBimbingan: "Bimbingan tutor sebaya bertema logika alur terarah dan pengerjaan kuis adaptif remedi.", status: "Tuntas" },
    { id: "rem2", namaSiswa: "Dewi Kartika", materiPokok: "Logika Percabangan Python", nilaiAwal: 66, nilaiAkhir: 78, tanggalKegiatan: "2026-10-12", bentukBimbingan: "Diberikan modul khusus dengan representasi flowchart berwarna dan penugasan coding lab mandiri.", status: "Tuntas" }
  ],
  bkLogs: [
    {
      id: "bk1",
      tanggal: "2026-08-04",
      namaSiswa: "Budi Pratama",
      kelas: "X-A",
      catatanPerilaku: "Budi kerap terlihat mengantuk di 45 menit pertama pelajaran kejuruan praktikum komputer, sehingga tugas pengkodean dasarnya tertinggal.",
      tindakanBK: "Melakukan bimbingan dialog personal empatik (coaching). Menemukan bahwa Budi sering begadang membantu usaha warung makan malam milik kerabatnya.",
      statusKomunikasiOrtu: "Sudah",
      solusiTindakLanjut: "Berdiskusi dengan wali siswa/orang tua untuk mendelegasikan jam tidur Budi yang sehat sebelum jam 22.00, serta memberikan kelonggaran bimbingan tambahan baginya di pagi hari."
    },
    {
      id: "bk2",
      tanggal: "2026-08-25",
      namaSiswa: "Eko Prasetyo",
      kelas: "X-A",
      catatanPerilaku: "Menunjukkan perilaku prososial luar biasa dengan sukarela berpindah perangkat komputer demi membantu 3 rekan yang mengalami galat instalasi Python.",
      tindakanBK: "Memberikan apresiasi lisan resmi di hadapan kelas dan mencatat dedikasi sosialnya dalam jurnal profil perkembangan afektif Pancasila akademis.",
      statusKomunikasiOrtu: "Belum",
      solusiTindakLanjut: "Menunjuk Eko secara resmi sebagai koordinator asisten laboratorium komputer (tutor teman sebaya) untuk meningkatkan jiwa kepemimpinannya."
    }
  ],
  strukturKelas: {
    ketua: "Farhan Mahendra",
    wakil: "Muhammad Ridho",
    sekretaris: "Anissa Putri",
    bendahara: "Dewi Kartika"
  },
  jadwalPiket: [
    { hari: "Senin", siswaIds: ["s1", "s2", "s3"] },
    { hari: "Selasa", siswaIds: ["s4", "s5", "s6"] },
    { hari: "Rabu", siswaIds: ["s7", "s8", "s9"] },
    { hari: "Kamis", siswaIds: ["s10", "s11", "s12"] },
    { hari: "Jumat", siswaIds: ["s13", "s14", "s15"] }
  ],
  tataTertib: [
    "1. Siswa wajib hadir di ruang laboratorium komputer selambat-lambatnya 5 menit sebelum bel jam pelajaran berbunyi.",
    "2. Siswa dilarang membawa makanan berat atau minuman berwarna mendekati meja perangkat komputer pengujian laboratorium.",
    "3. Siswa wajib melapor apabila menemukan kerusakan fisik atau malfungsi perangkat periferal komputer sebelum praktikum dimulai.",
    "4. Aktivitas berselancar internet di luar modul materi pembelajaran Informatika (seperti memainkan game luring/daring) selama sesi pembelajaran dilarang keras.",
    "5. Menjaga kerapian ruang komputer dengan mematikan perangkat (Shutdown) secara prosedural dan merapikan kembali kursi laboratorium seusai digunakan."
  ],
  kontrakBelajar: [
    "Komitmen Siswa: Kami berkomitmen penuh mengasah pemikiran kritis, berpartisipasi proaktif dalam diskusi kelompok, menjaga orisinalitas dalam pengerjaan pengkodean tanpa plagiarisme, serta saling mendukung demi kesuksesan bersama seluruh anggota kelas.",
    "Komitmen Guru: Saya memandu proses belajar berbasis student-centered dengan ramah, memberikan umpan balik penilaian objektif maksimal 3 hari kerja, memfasilitasi kebutuhan diferensiasi gaya belajar, serta bersedia memberikan sesi konsultasi bimbingan di luar jam kelas.",
    "Kesepakatan Sanksi: Keterlambatan batas pengumpulan tugas tanpa alasan darurat didenda pemotongan nilai 10% per hari keterlambatan."
  ],
  proyekKokurikuler: [
    {
      id: "kok_1",
      judul: "Inovasi Olahan Sampah Plastik menjadi Produk Ekonomis Kreatif",
      tema: "Gaya Hidup Berkelanjutan",
      tujuan: "Membangun kesadaran ekologis dan jiwa kewirausahaan peserta didik melalui daur ulang sampah plastik menjadi produk bernilai jual tinggi.",
      dimensi: [
        { id: "d1", nama: "Keimanan dan Ketakwaan" },
        { id: "d2", nama: "Kreativitas" },
        { id: "d3", nama: "Kolaborasi" }
      ],
      timeline: [
        { id: "tl1", minggu: "1-2", aktivitas: "Observasi dan riset jenis sampah plastik di lingkungan sekolah" },
        { id: "tl2", minggu: "3-4", aktivitas: "Eksplorasi teknik daur ulang dan desain produk" },
        { id: "tl3", minggu: "5-6", aktivitas: "Produksi dan perakitan produk daur ulang" },
        { id: "tl4", minggu: "7-8", aktivitas: "Pemasaran dan pameran karya" }
      ],
      asesmen: {
        awal: "Pretest pengetahuan daur ulang dan wawancara minat kewirausahaan",
        proses: "Observasi kolaborasi tim, jurnal refleksi mingguan, ceklis capaian proyek",
        akhir: "Presentasi produk final dan laporan tertulis",
        rubrik: "Rubrik penilaian meliputi: orisinalitas ide (25%), kualitas produk (25%), kerjasama tim (25%), dan presentasi (25%)",
        narasiRapor: "Peserta didik mampu mengidentifikasi masalah lingkungan plastik di sekolah dan menciptakan solusi kreatif berbasis daur ulang dengan hasil produk bernilai ekonomis."
      }
    }
  ],
  portofolio: [
    {
      id: "port1",
      namaSiswa: "Anissa Putri",
      namaKarya: "InnoFit: Purwarupa Program Estimator Berat Badan Ideal POSYANDU Mandiri",
      deskripsiKarya: "Aplikasi kecil berbasis instruksi Python dengan penanganan kelola masukan, seleksi multidimensi gizi, dan kalkulasi otomatis yang akurat.",
      tanggalKarya: "2026-10-15",
      predikat: "Sangat Baik",
      refleksiSingkat: "Anissa berhasil menggabungkan materi kalkulator gizi dengan visualisasi ringkas diagram status gizi, menunjukkan orisinalitas tinggi dalam berpikir kritis menyolusi masalah bidan desa."
    }
  ],
  refleksiTahunan: {
    keberhasilan: "Sekitar 86.6% siswa (13 dari 15) berhasil mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) target tahunan dengan nilai rapor di atas 75. Metode Deep Learning (Mindful Engagement & Deep Processing) terbukti sukses meningkatkan kepercayaan diri siswa dalam melakukan debugging/troubleshooting logika pemrograman mandiri dari yang semula selalu meminta bantuan langsung guru.",
    tantangan: "1. Keterbatasan komputer lab sekolah yang sering mengalami lag di bagian browser saat mengeksekusi VM Python di platform Google Colab. 2. Keragaman bekal keterampilan TI bawaan (Prior Knowledge) siswa dari jenjang SMP yang sangat timpang: sebagian belum lancar mengetik cepat, sebagian sudah mengerti logika dasar komputer.",
    kendalaUtama: "Alokasi jam pelajaran mingguan yang terbatas sering kali terpotong akibat berbagai agenda seremoni hari besar nasional serta kegiatan kondisinal sekolah, berakibat pada percepatan penjelasan materi basis data relasional RDBMS di semester genap.",
    hasilEvaluasi: "Penilaian psikomotorik coding dinilai jauh lebih memotivasi peserta didik daripada tes pilihan ganda teoritis murni. Namun demikian, penyusunan scaffolding (panduan bertingkat) bagi kelompok siswa berkemampuan belajar lambat perlu diatur lebih matang dan ramah psikis.",
    rencanaPerbaikan: "1. Menyusun pre-test kognitif di awal tahun ajaran untuk memetakan kelompok belajar dengan formasi heterogen seimbang sejak pekan ke-1. 2. Menyediakan modul luring (Offline Editor) yang terinstall langsung di PC Lab supaya tidak bergantung pada kestabilan internet cloud. 3. Memanfaatkan asisten laboratorium (tutor sebaya) secara lebih terstruktur formal."
  }
};

export function loadSavedState(): AdministrasiTahunState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const data = localStorage.getItem("sim_guru_state_v1");
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading from localStorage:", e);
  }
  return INITIAL_STATE;
}

export function saveState(state: AdministrasiTahunState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sim_guru_state_v1", JSON.stringify(state));
  } catch (e) {
    console.error("Error writing to localStorage:", e);
  }
}

export interface AdminMasterConfig {
  adminUsername: string;
  adminPassword: string;
  fonnteToken: string;
  gurus: {
    id: string;
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
    waliKelasDi: string;
    emailGuru: string;
    teleponGuru: string;
    logoUrl?: string;
    kota: string;
  }[];
  siswaList: Siswa[];
  kelas: string[];
  mapels: string[];
  jadwal: any[];
  kalender: any;
}

export function loadAdminMasterConfig(): AdminMasterConfig {
  const defaultAdminConfig: AdminMasterConfig = {
    adminUsername: "admin",
    adminPassword: "superadmin123",
    fonnteToken: "",
    gurus: [
      {
        id: "g1",
        namaSekolah: "SMA Negeri 1 Kota Bandung",
        alamatSekolah: "Jl. Belitung No. 8, Sumur Bandung, Kota Bandung, Jawa Barat 40113",
        namaGuru: "Bagus Wicaksono, S.Pd., M.T.",
        nipGuru: "19881024 201503 1 002",
        nuptkGuru: "8435766668130112",
        mapel: "Informatika (Kurikulum Merdeka)",
        kelas: "X-A (Fase E)",
        fase: "E",
        semester: "Ganjil & Genap",
        tahunAjaran: "2026/2027",
        namaKepsek: "Dr. Hj. Sri Wahyuni, M.Pd.",
        nipKepsek: "19710412 199602 2 001",
        jabatanGuru: "Guru Ahli Muda / Pembina",
        waliKelasDi: "X-A",
        emailGuru: "bagus.wicaksono@smai.sch.id",
        teleponGuru: "0812-7000-8890",
        kota: "Bandung"
      },
      {
        id: "g2",
        namaSekolah: "SMA Negeri 1 Kota Bandung",
        alamatSekolah: "Jl. Belitung No. 8, Sumur Bandung, Kota Bandung, Jawa Barat 40113",
        namaGuru: "Siti Rahmawati, S.Pd.",
        nipGuru: "19940510 202008 2 004",
        nuptkGuru: "4622766668130117",
        mapel: "Matematika",
        kelas: "XI-IPA-1 (Fase F)",
        fase: "F",
        semester: "Ganjil",
        tahunAjaran: "2026/2027",
        namaKepsek: "Dr. Hj. Sri Wahyuni, M.Pd.",
        nipKepsek: "19710412 199602 2 001",
        jabatanGuru: "Guru Ahli Pertama",
        waliKelasDi: "XI-IPA-1",
        emailGuru: "siti.rahmawati@smai.sch.id",
        teleponGuru: "0813-8888-9900",
        kota: "Bandung"
      }
    ],
    siswaList: SISWA_PRESET,
    kelas: ["X-A", "X-B", "X-C", "X-D", "XI-IPA-1", "XI-IPS-2"],
    mapels: ["Informatika (Kurikulum Merdeka)", "Matematika", "Fisika", "Kimia", "Biologi", "Bahasa Indonesia", "Bahasa Inggris"],
    jadwal: INITIAL_STATE.jadwal,
    kalender: INITIAL_STATE.kalender
  };

  if (typeof window === "undefined") return defaultAdminConfig;
  try {
    const data = localStorage.getItem("sim_guru_admin_master");
    if (data) {
      const parsed = JSON.parse(data);
      return { ...defaultAdminConfig, ...parsed };
    }
  } catch (e) {
    console.error("Error reading admin config:", e);
  }
  return defaultAdminConfig;
}

export function saveAdminMasterConfig(config: AdminMasterConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sim_guru_admin_master", JSON.stringify(config));
  } catch (e) {
    console.error("Error writing admin config:", e);
  }
}

export function loadTeacherPortfolio(teacherId: string, profile: any): AdministrasiTahunState {
  if (typeof window === "undefined") return { ...INITIAL_STATE, identitas: profile };
  try {
    const key = `sim_guru_portfolio_${teacherId}`;
    const data = localStorage.getItem(key);
    if (data) {
      const portfolioState = JSON.parse(data);
      const merged = { ...INITIAL_STATE, ...portfolioState, identitas: { ...INITIAL_STATE.identitas, ...profile, ...portfolioState.identitas } };
      // Migrate modul from single object to array (old localStorage format)
      if (!Array.isArray(merged.modul)) merged.modul = [merged.modul];
      return merged;
    }
  } catch (e) {
    console.error("Error reading teacher portfolio:", e);
  }
  // If first time, return default structure prefilled with this teacher's details
  return {
    ...INITIAL_STATE,
    identitas: {
      ...INITIAL_STATE.identitas,
      ...profile
    }
  };
}

export function saveTeacherPortfolio(teacherId: string, state: AdministrasiTahunState) {
  if (typeof window === "undefined") return;
  try {
    const key = `sim_guru_portfolio_${teacherId}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error("Error writing teacher portfolio:", e);
  }
}
