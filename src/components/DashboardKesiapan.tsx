import React from "react";
import { AdministrasiTahunState } from "../types";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Check,
  AlertCircle,
  Clock,
  ChevronRight
} from "lucide-react";

interface Props {
  state: AdministrasiTahunState;
  onNavigate: (tabId: string) => void;
}

function ProgressBar({ value, label, size = "sm" }: { value: number; label: string; size?: "sm" | "md" | "lg" }) {
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
  let colorClass = "bg-red-500";
  if (value >= 90) colorClass = "bg-forest";
  else if (value >= 60) colorClass = "bg-trust";
  else if (value >= 30) colorClass = "bg-amber-accent";
  else colorClass = "bg-red-500";

  return (
    <div className="w-full">
      <div className={`w-full bg-stone-200 ${heights[size]} rounded-full overflow-hidden`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`${colorClass} ${heights[size]} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Badge({ value, children }: { value: number; children: React.ReactNode }) {
  let badgeClass = "text-red-700 bg-red-50 border-red-200";
  if (value >= 90) badgeClass = "text-forest-dark bg-forest-light border-forest-light";
  else if (value >= 60) badgeClass = "text-trust bg-sky-50 border-sky-200";
  else if (value >= 30) badgeClass = "text-amber-dark bg-amber-light border-amber-200";
  else badgeClass = "text-red-700 bg-red-50 border-red-200";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border leading-none flex items-center gap-1 shrink-0 ${badgeClass}`}>
      {children}
    </span>
  );
}

export default function DashboardKesiapan({ state, onNavigate }: Props) {
  const getCoverProgress = () => {
    const id = state.identitas;
    if (!id) return 0;
    let score = 0;
    if (id.namaSekolah) score += 10;
    if (id.namaGuru) score += 15;
    if (id.nipGuru) score += 10;
    if (id.nuptkGuru) score += 10;
    if (id.mapel) score += 10;
    if (id.kelas) score += 10;
    if (id.semester) score += 15;
    if (id.tahunAjaran) score += 10;
    if (id.namaKepsek) score += 10;
    return Math.min(100, score);
  };

  const getKalenderProgress = () => {
    const agendas = state.kalender?.agenda?.length || 0;
    const agendaScore = Math.min(50, agendas * 10);
    const schedules = state.jadwal?.length || 0;
    const scheduleScore = Math.min(50, schedules * 12.5);
    return agendaScore + scheduleScore;
  };

  const getKurikulumProgress = () => {
    const pItems = state.prota?.items?.length || 0;
    const protaScore = Math.min(35, pItems * 12);
    const prItems = state.promes?.items?.length || 0;
    const promesScore = Math.min(35, prItems * 12);
    const atpItems = state.atp?.length || 0;
    const atpScore = Math.min(30, atpItems * 10);
    return protaScore + promesScore + atpScore;
  };

  const getModulProgress = () => {
    const list = state.modul;
    if (!list || !list.length) return 0;
    let total = 0;
    for (const m of list) {
      let score = 0;
      if (m.temaModul) score += 15;
      if (m.tujuanPembelajaran) score += 15;
      const dl = m.kegiatanPembelajaran?.intiDeepLearning;
      if (dl) {
        if (dl.mindfulEngagement && dl.mindfulEngagement.length >= 2) score += 20;
        if (dl.deepProcessing && dl.deepProcessing.length >= 2) score += 15;
        if (dl.transferOfLearning && dl.transferOfLearning.length >= 2) score += 15;
      }
      if (m.diferensiasi?.konten) score += 20;
      total += Math.min(100, score);
    }
    return Math.round(total / list.length);
  };

  const getJurnalProgress = () => {
    const jCount = state.jurnal?.length || 0;
    return Math.min(100, jCount * 20);
  };

  const getPresensiProgress = () => {
    const sCount = state.siswaList?.length || 0;
    const siswaScore = Math.min(50, sCount * 10);
    const aCount = state.asesmenList?.length || 0;
    const asesmenScore = Math.min(50, aCount * 25);
    return siswaScore + asesmenScore;
  };

  const getAnalisisProgress = () => {
    const nCount = state.nilaiSiswaList?.length || 0;
    const nilaiScore = Math.min(40, nCount * 8);
    const remCount = state.remedialLogs?.length || 0;
    const remScore = Math.min(30, remCount * 15);
    const bkCount = state.bkLogs?.length || 0;
    const bkScore = Math.min(30, bkCount * 30);
    return nilaiScore + remScore + bkScore;
  };

  const getWaliKelasProgress = () => {
    let score = 0;
    if (state.strukturKelas?.ketua) score += 25;
    if (state.jadwalPiket && state.jadwalPiket.length >= 3) score += 25;
    if (state.proyekKokurikuler && state.proyekKokurikuler.length >= 1) score += 25;
    if (state.portofolio && state.portofolio.length >= 2) score += 25;
    return score;
  };

  const getRefleksiProgress = () => {
    const ref = state.refleksiTahunan;
    if (!ref) return 0;
    let score = 0;
    if (ref.keberhasilan) score += 20;
    if (ref.tantangan) score += 20;
    if (ref.kendalaUtama) score += 20;
    if (ref.hasilEvaluasi) score += 20;
    if (ref.rencanaPerbaikan) score += 20;
    return score;
  };

  const sections = [
    { id: "cover", name: "1 & 2. Cover / Identitas", progress: getCoverProgress(), desc: "Profil Sekolah, Guru, Capaian & Lembar Pengesahan", actionLabel: "Perbarui Biodata" },
    { id: "kalender", name: "3 & 9. Kalender / Mengajar", progress: getKalenderProgress(), desc: "Minggu Efektif, Agenda Akademik, dan Jam Alokasi Mengajar", actionLabel: "Atur Kalender & Jadwal" },
    { id: "kurikulum", name: "4, 5 & 6. PROTA / PROMES / ATP", progress: getKurikulumProgress(), desc: "Alokasi Waktu Tahunan, Distribusi Semester, dan Alur Capaian (ATP)", actionLabel: "Sesuaikan Rencana Kurikulum" },
    { id: "modul", name: "7. Modul Ajar (AI-Enabled)", progress: getModulProgress(), desc: "Skenario Pembelajaran Berbasis Pendekatan Tiga Pilar Deep Learning", actionLabel: "Kelola / Rancang Modul" },
    { id: "jurnal", name: "8. Jurnal Harian Guru", progress: getJurnalProgress(), desc: "Logbook Aktivitas Hari Mengajar, Evaluasi Luring & Catatan Kejadian", actionLabel: "Tulis Jurnal Mengajar" },
    { id: "presensi", name: "10 & 11. Presensi & Asesmen", progress: getPresensiProgress(), desc: "Absensi Bulanan Siswa & Kisi-Kisi Rubrik Asesmen Diferensiasi HOTS", actionLabel: "Isi Presensi / Kisi-Kisi" },
    { id: "analisis", name: "12, 13 & 14. Rapor / Remedial / BK", progress: getAnalisisProgress(), desc: "Kalkulator Nilai Rapor Kelas, Log Remedial, & Logbook Konseling BK", actionLabel: "Kelola Nilai & BK" },
    { id: "walikelas", name: "15 & 16. Wali Kelas & Kokurikuler", progress: getWaliKelasProgress(), desc: "Struktur Organisasi Kelas, Tata Tertib, Proyek Kokurikuler & Portofolio Siswa", actionLabel: "Kelola Organisasi / Kokurikuler" },
    { id: "refleksi", name: "18 & 19. Refleksi & Penutup", progress: getRefleksiProgress(), desc: "SWOT Analisis Diri Guru, Evaluasi Tahunan & Rencana Tindak Lanjut", actionLabel: "Tulis SWOT Refleksi" }
  ];

  const totalSum = sections.reduce((acc, curr) => acc + curr.progress, 0);
  const overallAverage = Math.round(totalSum / sections.length);

  let ratingText = "Kurang Siap";
  let ratingDesc = "Administrasi masih di bawah standar minimal pengisian supervisi akademik.";
  let ratingClass = "text-red-700 bg-red-50 border-red-200";
  let RatingIcon = AlertCircle;

  if (overallAverage >= 90) {
    ratingText = "Siap Akreditasi A (Paripurna)";
    ratingDesc = "Seluruh modul administrasi telah terisi lengkap, rapi & memenuhi standar audit akreditasi nasional.";
    ratingClass = "text-forest-dark bg-forest-light border-forest-light";
    RatingIcon = CheckCircle2;
  } else if (overallAverage >= 70) {
    ratingText = "Siap Supervisi (Baik)";
    ratingDesc = "Telah memenuhi standar kelayakan administrasi untuk supervisi akademik kepala sekolah.";
    ratingClass = "text-trust bg-sky-50 border-sky-200";
    RatingIcon = CheckCircle2;
  } else if (overallAverage >= 40) {
    ratingText = "Cukup (Alerta Kesiapan)";
    ratingDesc = "Beberapa instrumen wajib masih kosong. Harap selesaikan sebelum jadwal supervisi.";
    ratingClass = "text-amber-dark bg-amber-light border-amber-200";
    RatingIcon = AlertTriangle;
  }

  const getActionRecommendations = () => {
    const list: { text: string; tab: string }[] = [];
    if (getCoverProgress() < 90) list.push({ text: "Lengkapi data identitas guru dan kepala sekolah di lembar cover.", tab: "cover" });
    if (getKalenderProgress() < 80) list.push({ text: "Tambahkan minimal 5 agenda sekolah dan buat jadwal mengajar harian.", tab: "kalender" });
    if (getKurikulumProgress() < 80) list.push({ text: "Atur alokasi waktu tahunan PROTA, PROMES, dan list tujuan pembelajaran ATP.", tab: "kurikulum" });
    if (getModulProgress() < 90) list.push({ text: "Gunakan fitur AI Asisten di modul ajar untuk merancang skenario 3 Pilar Deep Learning.", tab: "modul" });
    if (getJurnalProgress() < 60) list.push({ text: "Tulis beberapa jurnal mengajar harian luring sebagai bukti tindak lanjut.", tab: "jurnal" });
    if (getPresensiProgress() < 80) list.push({ text: "Masukkan data siswa pendukung dan buat rancangan kisi-kisi asesmen HOTS.", tab: "presensi" });
    if (getAnalisisProgress() < 80) list.push({ text: "Hitung rata-rata nilai kelas dan isi logbook pembinaan bimbingan konseling (BK).", tab: "analisis" });
    if (getWaliKelasProgress() < 80) list.push({ text: "Konfigurasi pengurus kelas, jadwal piket siswa, dan proyek kokurikuler.", tab: "walikelas" });
    if (getRefleksiProgress() < 90) list.push({ text: "Selesaikan 4 kuadran analisis SWOT diri Guru pada instrumen evaluasi penutup.", tab: "refleksi" });
    return list.slice(0, 4);
  };

  const recommendations = getActionRecommendations();
  const totalCompleted = sections.filter(s => s.progress >= 90).length;
  const totalInProgress = sections.filter(s => s.progress >= 40 && s.progress < 90).length;
  const totalPending = sections.filter(s => s.progress < 40).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-warm-card border border-warm-border rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-warm-text tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-forest" aria-hidden="true" />
            Panel Pemantauan Kesiapan Akreditasi
          </h2>
          <p className="text-xs text-warm-secondary max-w-2xl">
            Sistem kepatuhan administrasi mengajar tahunan berdasarkan standar nasional Kementerian Pendidikan. Pastikan seluruh berkas siap audit.
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl border text-xs font-bold ${ratingClass} flex items-center gap-2 self-start md:self-center`}>
          <RatingIcon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          <span className="tracking-wide uppercase">{ratingText}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-4 bg-warm-card border border-warm-border rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <div
              className="w-full h-full rounded-full"
              role="progressbar"
              aria-valuenow={overallAverage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Kesiapan dokumen keseluruhan"
            >
              <svg className="w-full h-full" viewBox="0 0 144 144" aria-hidden="true">
                <circle cx="72" cy="72" r="60" fill="none" stroke="#E7E5E4" strokeWidth="10" />
                <circle
                  cx="72" cy="72" r="60" fill="none"
                  stroke={overallAverage >= 90 ? "#2D6A4F" : overallAverage >= 60 ? "#0096C7" : overallAverage >= 30 ? "#D97706" : "#DC2626"}
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - overallAverage / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 72 72)"
                  className="transition-all duration-700"
                />
              </svg>
            </div>
            <div className="absolute text-center">
              <span className="text-4xl font-bold text-warm-text block tracking-tighter" aria-hidden="true">{overallAverage}%</span>
              <span className="text-[9px] text-warm-muted font-bold uppercase tracking-widest block mt-0.5">Kepatuhan</span>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-xs font-bold text-warm-text tracking-tight">Kesiapan Dokumen</h3>
            <p className="text-[10.5px] text-warm-secondary leading-relaxed max-w-[220px] mx-auto">{ratingDesc}</p>
          </div>
          <div className="mt-4 w-full space-y-2">
            <p className="text-[10px] text-warm-muted text-center font-bold uppercase tracking-wider">Rincian Kepatuhan</p>
            <ProgressBar value={overallAverage} label="Kepatuhan keseluruhan" size="md" />
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 justify-between">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-forest-light/50 border border-forest-light rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-dark">Lengkap</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-bold text-forest-dark leading-none">{totalCompleted}</span>
                <span className="text-[10px] text-forest font-bold">Modul</span>
              </div>
            </div>
            <div className="bg-amber-light/50 border border-amber-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-dark">Dalam Proses</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-bold text-amber-dark leading-none">{totalInProgress}</span>
                <span className="text-[10px] text-amber-accent font-bold">Modul</span>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">Belum Mulai</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-bold text-red-700 leading-none">{totalPending}</span>
                <span className="text-[10px] text-red-600 font-bold">Modul</span>
              </div>
            </div>
          </div>

          <div className="bg-warm-card border border-warm-border rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-warm-border pb-3">
                <Zap className="h-4.5 w-4.5 text-amber-accent" aria-hidden="true" />
                <h3 className="text-xs font-bold text-warm-text uppercase tracking-wider">Prioritas Pengisian Terdekat</h3>
              </div>
              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendations.map((rec, idx) => (
                    <button
                      key={idx}
                      onClick={() => onNavigate(rec.tab)}
                      className="group flex items-start gap-3 p-3 bg-warm-bg hover:bg-forest-light/30 border border-warm-border hover:border-forest-light rounded-xl transition-colors text-xs text-left focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 cursor-pointer"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-light text-amber-dark flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 group-hover:bg-forest-light group-hover:text-forest-dark transition-colors" aria-hidden="true">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-1">
                        <p className="text-warm-text font-semibold leading-relaxed">{rec.text}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-warm-muted group-hover:text-forest transition-colors mt-0.5 shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-forest-light/50 border border-forest-light p-5 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-forest mx-auto" aria-hidden="true" />
                  <h4 className="text-sm font-bold text-forest-dark">Berkas Siap Akreditasi</h4>
                  <p className="text-xs text-forest max-w-md mx-auto leading-relaxed">
                    Luar biasa! Seluruh perangkat administrasi wajib Anda telah terisi dengan sangat lengkap.
                  </p>
                </div>
              )}
            </div>
            <div className="text-[10px] text-warm-muted mt-4 pt-3 border-t border-warm-border flex items-center justify-between">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" /> Rekomendasi diupdate real-time</span>
              <span>SMAN 1 Bandung</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-warm-card border border-warm-border rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-warm-border pb-4">
          <FolderOpen className="h-5 w-5 text-warm-secondary" aria-hidden="true" />
          <h3 className="text-xs font-bold text-warm-text uppercase tracking-wider">Rincian Buku Administrasi Pembelajaran (19 Buku Kurikulum)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((sec) => {
            let StatusIcon = AlertCircle;
            if (sec.progress >= 90) StatusIcon = Check;
            else if (sec.progress >= 60) StatusIcon = CheckCircle2;
            else if (sec.progress >= 30) StatusIcon = Clock;

            return (
              <button
                key={sec.id}
                onClick={() => onNavigate(sec.id)}
                className="group bg-warm-bg hover:bg-warm-card hover:border-forest-light border border-warm-border rounded-2xl p-5 transition-colors flex flex-col justify-between h-full text-left focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start gap-2.5 mb-2">
                    <h4 className="text-xs font-bold text-warm-text group-hover:text-forest transition-colors leading-tight">{sec.name}</h4>
                    <Badge value={sec.progress}>
                      <StatusIcon className="h-2.5 w-2.5" aria-hidden="true" />
                      {sec.progress}%
                    </Badge>
                  </div>
                  <p className="text-[11px] text-warm-secondary leading-relaxed mb-4 line-clamp-2">{sec.desc}</p>
                </div>
                <div className="space-y-3 pt-2">
                  <ProgressBar value={sec.progress} label={`Kemajuan ${sec.name}`} />
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-warm-muted group-hover:text-forest transition-colors">
                    <span>{sec.actionLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
