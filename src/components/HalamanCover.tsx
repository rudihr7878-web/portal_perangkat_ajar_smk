/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AdministrasiTahunState } from "../types";
import { Award, BookOpen, GraduationCap, MapPin, Phone, School, User } from "lucide-react";

interface Props {
  state: AdministrasiTahunState;
  onChange: (updater: (s: AdministrasiTahunState) => AdministrasiTahunState) => void;
}

export default function HalamanCover({ state, onChange }: Props) {
  const { identitas } = state;

  const handleFieldChange = (field: keyof typeof identitas, value: string) => {
    onChange((prev) => ({
      ...prev,
      identitas: {
        ...prev.identitas,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-12">
      {/* Interactive Editor Panel (Hidden in Print) */}
      <div className="bg-warm-card p-6 rounded-2xl shadow-sm border border-warm-border print:hidden">
        <h3 className="text-lg font-semibold text-warm-text mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-forest" aria-hidden="true" />
          Pengeditan Identitas Administrasi Guru (Sinkronisasi Otomatis)
        </h3>
        <p className="text-sm text-warm-secondary mb-6 leading-relaxed">
          Ubah isian di bawah ini untuk memperbarui seluruh 19 dokumen administrasi secara serentak. 
          Format dokumen siap cetak (A4) yang disesuaikan dengan standar supervisi kepala sekolah dan akreditasi BAN-PDM.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label htmlFor="namaGuru" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">Nama Guru & Gelar</label>
            <input
              id="namaGuru"
              type="text"
              value={identitas.namaGuru}
              onChange={(e) => handleFieldChange("namaGuru", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. Bagus Wicaksono, S.Pd., M.T."
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="nipGuru" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">NIP Guru</label>
            <input
              id="nipGuru"
              type="text"
              value={identitas.nipGuru}
              onChange={(e) => handleFieldChange("nipGuru", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. 19881024 201503 1 002"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="nuptkGuru" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">NUPTK Guru</label>
            <input
              id="nuptkGuru"
              type="text"
              value={identitas.nuptkGuru}
              onChange={(e) => handleFieldChange("nuptkGuru", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. 8435766668130112"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="namaSekolah" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">Nama Sekolah</label>
            <input
              id="namaSekolah"
              type="text"
              value={identitas.namaSekolah}
              onChange={(e) => handleFieldChange("namaSekolah", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. SMAN 1 Kota Bandung"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="alamatSekolah" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">Alamat Satuan Pendidikan</label>
            <input
              id="alamatSekolah"
              type="text"
              value={identitas.alamatSekolah}
              onChange={(e) => handleFieldChange("alamatSekolah", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. Jl. Merdeka No. 1, Kota Bandung"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="mapel" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">Mata Pelajaran (Mapel)</label>
            <input
              id="mapel"
              type="text"
              value={identitas.mapel}
              onChange={(e) => handleFieldChange("mapel", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. Informatika"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="kelas" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">Kelas & Fase</label>
            <input
              id="kelas"
              type="text"
              value={identitas.kelas}
              onChange={(e) => handleFieldChange("kelas", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. X-A (Fase E)"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="tahunAjaran" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">Tahun Ajaran</label>
            <input
              id="tahunAjaran"
              type="text"
              value={identitas.tahunAjaran}
              onChange={(e) => handleFieldChange("tahunAjaran", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. 2026/2027"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="namaKepsek" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">Kepala Sekolah</label>
            <input
              id="namaKepsek"
              type="text"
              value={identitas.namaKepsek}
              onChange={(e) => handleFieldChange("namaKepsek", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. Dr. Hj. Sri Wahyuni, M.Pd."
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="nipKepsek" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">NIP Kepala Sekolah</label>
            <input
              id="nipKepsek"
              type="text"
              value={identitas.nipKepsek}
              onChange={(e) => handleFieldChange("nipKepsek", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. 19710412 199602 2 001"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="jabatanGuru" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">Jabatan Guru</label>
            <input
              id="jabatanGuru"
              type="text"
              value={identitas.jabatanGuru}
              onChange={(e) => handleFieldChange("jabatanGuru", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. Guru Ahli Muda / Pembina"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="waliKelasDi" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">Wali Kelas di Kelas</label>
            <input
              id="waliKelasDi"
              type="text"
              value={identitas.waliKelasDi}
              onChange={(e) => handleFieldChange("waliKelasDi", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. X-A (Ketik 'Tidak Ada' jika bukan walikelas)"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="teleponGuru" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">Telfon / Kontak</label>
            <input
              id="teleponGuru"
              type="text"
              value={identitas.teleponGuru}
              onChange={(e) => handleFieldChange("teleponGuru", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. 0812-3456-7890"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="kota" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide">Kota / Kabupaten</label>
            <input
              id="kota"
              type="text"
              value={identitas.kota}
              onChange={(e) => handleFieldChange("kota", e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest text-sm"
              placeholder="e.g. Bandung"
            />
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-warm-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-warm-muted/40 flex items-center justify-center overflow-hidden shrink-0 bg-warm-bg">
              {identitas.logoUrl ? (
                <img src={identitas.logoUrl} alt="Logo Sekolah" className="w-full h-full object-contain" />
              ) : (
                <School className="h-6 w-6 text-warm-muted/50" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="logoUpload" className="text-xs font-semibold text-warm-secondary uppercase tracking-wide block">Logo Sekolah</label>
              <input
                id="logoUpload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      onChange((prev) => ({
                        ...prev,
                        identitas: { ...prev.identitas, logoUrl: dataUrl }
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs text-warm-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-warm-border file:text-xs file:font-semibold file:bg-warm-card file:text-warm-text hover:file:bg-warm-bg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 1: HALAMAN COVER --- */}
      <section id="doc-cover" className="bg-warm-card p-12 md:p-16 rounded-3xl border border-warm-border shadow-lg relative overflow-hidden print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto flex flex-col aspect-[1/1.41] min-h-[1100px]">
        {/* TOP DECORATION */}
        <div className="absolute top-0 left-0 w-full h-[400px] pointer-events-none z-0 print:hidden" data-purpose="top-decoration">
          <svg className="absolute top-0 right-0 w-[600px] h-[400px]" viewBox="0 0 600 400" preserveAspectRatio="none">
            <polygon points="0,0 600,0 600,400" fill="#232323" />
          </svg>
          <svg className="absolute top-0 right-[40px] w-[500px] h-[300px]" viewBox="0 0 500 300" preserveAspectRatio="none">
            <polygon points="0,0 500,0 500,300" fill="none" stroke="#d4af37" strokeWidth="12" />
          </svg>
          <svg className="absolute top-[50px] right-0 w-[400px] h-[300px]" viewBox="0 0 400 300" preserveAspectRatio="none">
            <polygon points="0,0 400,0 400,300" fill="#232323" />
          </svg>
          <div className="absolute top-[100px] left-[40px] w-[80px] h-[60px]" style={{ backgroundImage: "radial-gradient(circle, #232323 2px, transparent 2px)", backgroundSize: "16px 16px", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
        </div>

        {/* LOGO + YEAR */}
        <div className="relative z-10 pt-[120px] pl-[80px] flex items-start" data-purpose="hexagon-image">
          <div className="w-[250px] h-[250px] flex items-center justify-center overflow-hidden">
            {identitas.logoUrl ? (
              <img src={identitas.logoUrl} alt="Logo Sekolah" className="w-full h-full object-contain" />
            ) : (
              <School className="w-16 h-16 text-[#232323]" aria-hidden="true" />
            )}
          </div>
          <div className="ml-12 mt-32 z-20">
            <h2 className="text-5xl font-bold tracking-wider text-[#232323]">TAHUN PELAJARAN</h2>
            <h2 className="text-6xl font-bold tracking-wider text-[#232323] mt-2">{identitas.tahunAjaran}</h2>
          </div>
        </div>

        {/* MAIN TITLE */}
        <div className="relative z-10 px-[80px] mt-16 flex-grow" data-purpose="main-title">
          <h1 className="text-6xl font-semibold leading-tight text-[#232323] uppercase">
            <span className="block text-4xl font-normal mb-2">PORTOFOLIO</span>
            ADMINISTRASI GURU
          </h1>
          <div className="ml-32 w-[100px] h-[60px] mt-4 print:hidden" style={{ backgroundImage: "radial-gradient(circle, #d4af37 2px, transparent 2px)", backgroundSize: "16px 16px" }} />
        </div>

        {/* BIO DATA */}
        <div className="relative z-20 px-[80px] pb-[100px] flex justify-end mt-8" data-purpose="bio-data">
          <div className="w-2/3 bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100 print:bg-transparent print:backdrop-blur-none print:shadow-none print:border-none">
            <h3 className="text-xl font-semibold border-b-2 border-[#d4af37] pb-2 mb-4 text-[#232323]">Data Guru</h3>
            <table className="w-full text-lg">
              <tbody>
                <tr><td className="py-2 w-1/3 font-medium text-[#232323]">Nama Guru</td><td className="py-2 px-2">:</td><td className="py-2 font-semibold border-b border-gray-300 w-full text-[#232323]">{identitas.namaGuru}</td></tr>
                <tr><td className="py-2 font-medium text-[#232323]">NIP</td><td className="py-2 px-2">:</td><td className="py-2 border-b border-gray-300">{identitas.nipGuru || "-"}</td></tr>
                <tr><td className="py-2 font-medium text-[#232323]">NUPTK</td><td className="py-2 px-2">:</td><td className="py-2 border-b border-gray-300">{identitas.nuptkGuru || "-"}</td></tr>
                <tr><td className="py-2 font-medium text-[#232323]">Mata Pelajaran</td><td className="py-2 px-2">:</td><td className="py-2 border-b border-gray-300">{identitas.mapel}</td></tr>
                <tr><td className="py-2 font-medium text-[#232323]">Kelas / Fase</td><td className="py-2 px-2">:</td><td className="py-2 border-b border-gray-300">{identitas.kelas}</td></tr>
                <tr><td className="py-2 font-medium text-[#232323]">Semester</td><td className="py-2 px-2">:</td><td className="py-2 border-b border-gray-300">{identitas.semester}</td></tr>
              </tbody>
            </table>
            <div className="mt-8 text-right">
              <h4 className="text-xl font-bold uppercase text-[#232323]">SMA {identitas.namaSekolah}</h4>
            </div>
          </div>
        </div>

        {/* BOTTOM DECORATION */}
        <div className="absolute bottom-0 left-0 w-full h-[350px] pointer-events-none z-0 print:hidden" data-purpose="bottom-decoration">
          <svg className="absolute bottom-0 left-0 w-[500px] h-[300px]" viewBox="0 0 500 300" preserveAspectRatio="none">
            <polygon points="0,0 0,300 500,300" fill="#232323" />
          </svg>
          <svg className="absolute bottom-0 left-[20px] w-[400px] h-[250px]" viewBox="0 0 400 250" preserveAspectRatio="none">
            <polygon points="0,0 0,250 400,250" fill="none" stroke="#d4af37" strokeWidth="12" />
          </svg>
          <svg className="absolute bottom-[40px] left-0 w-[300px] h-[200px]" viewBox="0 0 300 200" preserveAspectRatio="none">
            <polygon points="0,0 0,200 300,200" fill="#232323" />
          </svg>
          <svg className="absolute bottom-[180px] right-[40px] w-[80px] h-[80px]" viewBox="0 0 80 80">
            <polygon points="20,0 60,0 80,40 60,80 20,80 0,40" fill="#d4af37" />
          </svg>
          <div className="absolute bottom-[280px] right-0 w-[120px] h-[100px]" style={{ clipPath: "polygon(0 50%, 100% 0, 100% 100%)", backgroundColor: "#d4af37" }} />
          <div className="absolute bottom-[80px] right-[40px] w-[80px] h-[60px]" style={{ backgroundImage: "radial-gradient(circle, #232323 2px, transparent 2px)", backgroundSize: "16px 16px", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", transform: "rotate(180deg)" }} />
          <div className="absolute bottom-0 left-0 w-full h-[20px] bg-[#232323]"></div>
          <div className="absolute bottom-[20px] left-0 w-full h-[4px] bg-[#d4af37]"></div>
        </div>
      </section>

      <div className="print:page-break-after"></div>

      {/* --- SECTION 2: IDENTITAS GURU --- */}
      <section id="doc-identitas" className="bg-warm-card p-12 md:p-16 rounded-3xl border border-warm-border shadow-lg print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto aspect-[1/1.41] min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-border pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <User className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
              IDENTITAS GURU DAN SATUAN PENDIDIKAN
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">Dokumen Lampiran Supervisi Penjaminan Mutu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-warm-text mt-6">
            {/* Bagian A: Data Personal Guru */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest border-b border-forest pb-1 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" aria-hidden="true" />
                A. DATA PERSONAL GURU
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">1. Nama Lengkap (dengan gelar)</label>
                  <p className="text-sm font-semibold text-warm-text mt-0.5">{identitas.namaGuru}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">2. NIP (Nomor Induk Pegawai)</label>
                  <p className="text-sm font-semibold text-warm-text mt-0.5">{identitas.nipGuru || "Tidak Ada NIP / Pegawai Swasta"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">3. NUPTK / PEGID</label>
                  <p className="text-sm font-semibold text-warm-text mt-0.5">{identitas.nuptkGuru || "-"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">4. Jabatan Fungsional / Golongan</label>
                  <p className="text-sm font-semibold text-warm-text mt-0.5">{identitas.jabatanGuru}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">5. Wali Kelas di Kelas</label>
                  <p className="text-sm font-semibold text-warm-text mt-0.5">
                    {identitas.waliKelasDi === "Tidak Ada" || !identitas.waliKelasDi ? "Bukan Wali Kelas" : `Wali Kelas ${identitas.waliKelasDi}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Bagian B: Data Lembaga & Kontak */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest border-b border-forest pb-1 flex items-center gap-1.5">
                <School className="h-3.5 w-3.5" aria-hidden="true" />
                B. DATA SATUAN PENDIDIKAN & KONTAK
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">1. Nama Satuan Pendidikan</label>
                  <p className="text-sm font-semibold text-warm-text mt-0.5">{identitas.namaSekolah}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">2. Alamat Lembaga</label>
                  <p className="text-sm font-semibold text-warm-text mt-0.5">{identitas.alamatSekolah}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">3. Alamat E-Mail Resmi</label>
                  <p className="text-sm font-semibold text-forest mt-0.5">{identitas.emailGuru || "admin@sekolah.sch.id"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">4. No. Telepon Seluler</label>
                  <p className="text-sm font-semibold text-warm-text mt-0.5">{identitas.teleponGuru || "-"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-warm-muted uppercase tracking-wider block">5. Beban Mengajar / Tugas Tambahan</label>
                  <p className="text-sm font-semibold text-warm-text mt-0.5">24 Jam Tatap Muka / Koordinator TIM IT Kurikulum Merdeka</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legalitas Pernyataan Keaslian */}
          <div className="bg-warm-bg p-6 rounded-2xl border border-warm-border mt-12 text-warm-secondary leading-relaxed text-sm">
            <h5 className="font-bold text-warm-text uppercase tracking-wider text-xs mb-2 flex items-center gap-1">
              <Award className="h-4 w-4 text-forest" aria-hidden="true" />
              KOMITMEN PENYUSUNAN ADMINISTRASI profesional
            </h5>
            Seluruh data identitas, agenda pembelajaran, rumusan alur tujuan, rencana modul, dan instrumen asesmen yang tersusun dalam dokumen tahunan ini dibuat dengan komitmen profesionalisme pendidik, berbasis kondisi sosial riil siswa, serta mengedepankan pendekatan **Deep Learning** guna menstimulasi kecakapan intelektual dan karakter luhur sesuai 8 Dimensi Profil Lulusan.
          </div>
        </div>

        {/* Tanda Tangan Ringkas */}
        <div className="grid grid-cols-2 gap-0 pt-8 mt-12 border-t border-warm-border text-center text-sm text-warm-text">
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest">Mengetahui,</p>
              <p className="font-bold text-warm-text text-xs mt-1">Kepala {identitas.namaSekolah}</p>
            </div>
            <div className="space-y-1 pt-8">
              <p className="font-bold text-warm-text underline text-xs">{identitas.namaKepsek}</p>
              <p className="text-[10px] text-warm-muted">NIP. {identitas.nipKepsek}</p>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest">{identitas.kota || "Bandung"}, Juni 2026</p>
              <p className="font-bold text-warm-text text-xs mt-1">Guru Mata Pelajaran</p>
            </div>
            <div className="space-y-1 pt-8">
              <p className="font-bold text-warm-text underline text-xs">{identitas.namaGuru}</p>
              <p className="text-[10px] text-warm-muted">NIP. {identitas.nipGuru || "-"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
