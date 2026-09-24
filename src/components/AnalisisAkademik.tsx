/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { NilaiSiswa, RemedialLog, BKEntry, AdministrasiTahunState } from "../types";
import { Award, ShieldAlert, Sparkles, Plus, Trash2, Check, UserPlus, FileSpreadsheet } from "lucide-react";

interface Props {
  state: AdministrasiTahunState;
  onChange: (updater: (s: AdministrasiTahunState) => AdministrasiTahunState) => void;
}

export default function AnalisisAkademik({ state, onChange }: Props) {
  const { nilaiSiswaList, remedialLogs, bkLogs, identitas } = state;
  const [newRemedial, setNewRemedial] = useState({ namaSiswa: "Ahmad Fauzi", materiPokok: "", nilaiAwal: 60, nilaiAkhir: 80, tanggalKegiatan: "", bentukBimbingan: "", status: "Tuntas" as const });
  const [newBk, setNewBk] = useState({ namaSiswa: "Ahmad Fauzi", kelas: identitas.kelas, catatanPerilaku: "", tindakanBK: "", statusKomunikasiOrtu: "Belum" as const, solusiTindakLanjut: "" });

  const kkptThreshold = 75;

  // Grade adjustment recalculates Rapor Score and Tuntas status
  const handleGradeChange = (siswaId: string, field: "nilaiFormatif1" | "nilaiFormatif2" | "nilaiSumatifTengah" | "nilaiSumatifAkhir", value: number) => {
    onChange((prev) => {
      const updatedList = prev.nilaiSiswaList.map((n) => {
        if (n.siswaId === siswaId) {
          const nextGrades = { ...n, [field]: value };
          // Custom Indonesia Curriculum Rapor formula: F_Avg (30%) + STS (30%) + SAS (40%)
          const fAvg = (nextGrades.nilaiFormatif1 + nextGrades.nilaiFormatif2) / 2;
          const finalScore = Math.round((fAvg * 0.3) + (nextGrades.nilaiSumatifTengah * 0.3) + (nextGrades.nilaiSumatifAkhir * 0.4));
          const tuntas = finalScore >= kkptThreshold;

          return {
            ...nextGrades,
            nilaiRapor: finalScore,
            isTuntas: tuntas,
            rekomendasi: (finalScore >= 90 ? "Pengayaan" : tuntas ? "Tuntas" : "Remedial") as "Tuntas" | "Remedial" | "Pengayaan"
          };
        }
        return n;
      });

      // Synchronize to Remedial Logs if a student is flagged as remedial and doesn't exist yet
      let nextRemedial = [...prev.remedialLogs];
      updatedList.forEach((n) => {
        if (!n.isTuntas && !nextRemedial.some((r) => r.namaSiswa === n.namaSiswa)) {
          nextRemedial.push({
            id: "rem_" + Date.now() + Math.random().toString(36).substr(2, 4),
            namaSiswa: n.namaSiswa,
            materiPokok: "Logika Algoritma Dasar",
            nilaiAwal: n.nilaiRapor,
            nilaiAkhir: 75,
            tanggalKegiatan: new Date().toISOString().split("T")[0],
            bentukBimbingan: "Bimbingan terstruktur mandiri",
            status: "Belum Tuntas"
          });
        }
      });

      return {
        ...prev,
        nilaiSiswaList: updatedList,
        remedialLogs: nextRemedial
      };
    });
  };

  // Remedial Handlers
  const handleAddRemedial = (e: React.FormEvent) => {
    e.preventDefault();
    onChange((prev) => ({
      ...prev,
      remedialLogs: [
        ...prev.remedialLogs,
        { id: "rem_" + Date.now(), ...newRemedial }
      ]
    }));
    setNewRemedial({ namaSiswa: "Ahmad Fauzi", materiPokok: "", nilaiAwal: 60, nilaiAkhir: 80, tanggalKegiatan: "", bentukBimbingan: "", status: "Tuntas" });
  };

  const handleRemoveRemedial = (id: string) => {
    onChange((prev) => ({
      ...prev,
      remedialLogs: prev.remedialLogs.filter((r) => r.id !== id)
    }));
  };

  // BK Handlers
  const handleAddBk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBk.catatanPerilaku) return;

    onChange((prev) => ({
      ...prev,
      bkLogs: [
        ...prev.bkLogs,
        { id: "bk_" + Date.now(), ...newBk, tanggal: new Date().toISOString().split("T")[0] }
      ]
    }));
    setNewBk({ namaSiswa: "Ahmad Fauzi", kelas: identitas.kelas, catatanPerilaku: "", tindakanBK: "", statusKomunikasiOrtu: "Belum", solusiTindakLanjut: "" });
  };

  const handleRemoveBk = (id: string) => {
    onChange((prev) => ({
      ...prev,
      bkLogs: prev.bkLogs.filter((b) => b.id !== id)
    }));
  };

  // Grade analytics
  const rosterCount = nilaiSiswaList.length;
  const averageRapor = rosterCount > 0 ? Math.round(nilaiSiswaList.reduce((sum, s) => sum + s.nilaiRapor, 0) / rosterCount) : 0;
  const countTuntas = nilaiSiswaList.filter((s) => s.isTuntas).length;
  const ketuntasanPersen = rosterCount > 0 ? Math.round((countTuntas / rosterCount) * 100) : 100;

  return (
    <div className="space-y-12">
      {/* --- SECTION 12: ANALISIS HASIL BELAJAR --- */}
      <section id="doc-analisis" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <FileSpreadsheet aria-hidden="true" className="h-6 w-6 text-forest print:hidden" />
              ANALISIS HASIL BELAJAR & SPREADSHEET RAPOR
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              KETUNTASAN KELAS BERBASIS KKTP (KRITERIA KETUNTASAN MINIMAL: {kkptThreshold} JP)
            </p>
          </div>

          {/* Aggregate Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-warm-bg/50 p-6 rounded-2xl border border-warm-border text-warm-text text-center">
              <span className="text-[10px] font-bold text-warm-muted block uppercase">Rata-Rata Rapor Kelas</span>
              <span className="text-3xl font-extrabold text-forest block mt-1">{averageRapor}</span>
              <span className="text-[10px] text-warm-muted block mt-1">Skala Kompetensi 0-100</span>
            </div>
            <div className="bg-warm-bg/50 p-6 rounded-2xl border border-warm-border text-warm-text text-center">
              <span className="text-[10px] font-bold text-warm-muted block uppercase">Persentase Ketuntasan</span>
              <span className="text-3xl font-extrabold text-emerald-600 block mt-1">{ketuntasanPersen}%</span>
              <span className="text-[10px] text-warm-muted block mt-1">Siswa di atas threshold KKTP</span>
            </div>
            <div className="bg-warm-bg/50 p-6 rounded-2xl border border-warm-border text-warm-text text-center">
              <span className="text-[10px] font-bold text-warm-muted block uppercase">Jumlah Siswa Remidial</span>
              <span className="text-3xl font-extrabold text-red-500 block mt-1">{rosterCount - countTuntas}</span>
              <span className="text-[10px] text-warm-muted block mt-1">Siswa direkomendasikan pendampingan</span>
            </div>
          </div>

          {/* Interactive Grade Spreadsheet */}
          <div className="overflow-x-auto border border-warm-border rounded-2xl">
            <table className="w-full text-left text-xs text-warm-text">
              <thead className="bg-warm-bg text-[10px] font-bold uppercase tracking-wider text-warm-secondary border-b border-warm-border">
                <tr>
                  <th className="px-4 py-3 text-center w-[6%]">No</th>
                  <th className="px-4 py-3 w-[26%]">Nama Lengkap Siswa</th>
                  <th className="px-3 py-3 text-center w-[11%]">Formatif 1</th>
                  <th className="px-3 py-3 text-center w-[11%]">Formatif 2</th>
                  <th className="px-3 py-3 text-center w-[11%]">Sumatif Tengah</th>
                  <th className="px-3 py-3 text-center w-[11%]">Sumatif Akhir</th>
                  <th className="px-4 py-3 text-center w-[12%] bg-forest/10">Nilai Rapor</th>
                  <th className="px-4 py-3 text-center w-[12%]">Ketuntasan (KKTP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border font-medium text-warm-text">
                {nilaiSiswaList.map((s, idx) => (
                  <tr key={s.siswaId} className="hover:bg-warm-bg/55 transition-colors">
                    <td className="px-4 py-3 text-center text-warm-muted">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-warm-text">{s.namaSiswa}</td>
                    {/* Test Scores fields (dynamik recalculations) */}
                    <td className="px-3 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={s.nilaiFormatif1}
                        onChange={(e) => handleGradeChange(s.siswaId, "nilaiFormatif1", parseInt(e.target.value) || 0)}
                        className="w-10 text-center bg-transparent focus:bg-white border border-transparent border-b-warm-border font-mono text-[11px]"
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={s.nilaiFormatif2}
                        onChange={(e) => handleGradeChange(s.siswaId, "nilaiFormatif2", parseInt(e.target.value) || 0)}
                        className="w-10 text-center bg-transparent focus:bg-white border border-transparent border-b-warm-border font-mono text-[11px]"
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={s.nilaiSumatifTengah}
                        onChange={(e) => handleGradeChange(s.siswaId, "nilaiSumatifTengah", parseInt(e.target.value) || 0)}
                        className="w-10 text-center bg-transparent focus:bg-white border border-transparent border-b-warm-border font-mono text-[11px]"
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={s.nilaiSumatifAkhir}
                        onChange={(e) => handleGradeChange(s.siswaId, "nilaiSumatifAkhir", parseInt(e.target.value) || 0)}
                        className="w-10 text-center bg-transparent focus:bg-white border border-transparent border-b-warm-border font-mono text-[11px]"
                      />
                    </td>
                    <td className="px-4 py-3 text-center font-extrabold text-forest bg-forest/10 text-sm">
                      {s.nilaiRapor}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.isTuntas
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}>
                        {s.isTuntas ? "TUNTAS (K)" : "REMEDI"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-border text-center text-xs text-warm-text">
          <div>
            <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Mengetahui,</p>
            <p className="font-bold text-warm-text underline text-xs">{identitas.namaKepsek}</p>
            <p className="text-[10px] text-warm-muted">NIP. {identitas.nipKepsek}</p>
          </div>
          <div>
            <p className="font-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">{identitas.kota || "Bandung"}, Juni 2026</p>
            <p className="font-bold text-warm-text underline text-xs">{identitas.namaGuru}</p>
            <p className="text-[10px] text-warm-muted">NIP. {identitas.nipGuru || "-"}</p>
          </div>
        </div>
      </section>

      <div className="print:page-break-after"></div>

      {/* --- SECTION 13: PROGRAM REMEDIAL DAN PENGAYAAN --- */}
      <section id="doc-remedial" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <Award aria-hidden="true" className="h-6 w-6 text-forest print:hidden" />
              PROGRAM REMEDIAL DAN PENGAYAAN
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              LOGBOOK BUKTI PELAKSANAAN AKADEMIK ASESMEN SUSULAN & TANTANGAN PRIBADI
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-warm-secondary">A. Register Pembinaan Remedial Khusus Sesi Ini</h3>
            <div className="overflow-x-auto border border-warm-border rounded-2xl">
              <table className="w-full text-left text-xs text-warm-text">
                <thead className="bg-warm-bg text-[10px] font-bold uppercase tracking-wider text-warm-secondary border-b border-warm-border">
                  <tr>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Pembahasan Bahasan</th>
                    <th className="px-3 py-3 text-center">Nilai Awal</th>
                    <th className="px-3 py-3 text-center">Nilai Akhir</th>
                    <th className="px-4 py-3">Bentuk Intervensi Bimbingan</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center print:hidden">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border font-medium text-warm-text">
                  {remedialLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-warm-bg/55 transition-colors">
                      <td className="px-4 py-3 font-bold text-warm-text">{log.namaSiswa}</td>
                      <td className="px-4 py-3 text-warm-secondary">{log.materiPokok}</td>
                      <td className="px-3 py-3 text-center font-mono text-warm-muted">{log.nilaiAwal}</td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-forest">{log.nilaiAkhir}</td>
                      <td className="px-4 py-3 text-warm-secondary leading-normal text-[11px]">{log.bentukBimbingan}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          log.status === "Tuntas" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center print:hidden">
                        <button
                          onClick={() => handleRemoveRemedial(log.id)}
                          aria-label="Hapus entri remedial"
                          className="text-warm-muted hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer"
                        >
                          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {remedialLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-warm-muted italic">Luar biasa! Seluruh roster siswa lulus tuntas KKTP (tiada kasus remidial)</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Form Add Remedial Log (Hidden in Print) */}
            <form onSubmit={handleAddRemedial} className="bg-warm-bg/50 p-5 rounded-2xl border border-warm-border flex flex-wrap gap-4 items-end text-xs text-warm-text print:hidden mt-4">
              <h4 className="w-full font-bold text-warm-text uppercase flex items-center gap-1.5 border-b border-warm-border pb-2">
                <Plus aria-hidden="true" className="h-4 w-4 text-forest" /> Log Manual Sesi Remedial Baru
              </h4>
              <div className="flex-1 min-w-[150px] space-y-1">
                <label htmlFor="rem-nama-siswa" className="font-semibold block text-warm-secondary">Nama Siswa</label>
                <select
                  id="rem-nama-siswa"
                  value={newRemedial.namaSiswa}
                  onChange={(e) => setNewRemedial({ ...newRemedial, namaSiswa: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                >
                  {nilaiSiswaList.map((s) => (
                    <option key={s.siswaId} value={s.namaSiswa}>{s.namaSiswa}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[150px] space-y-1">
                <label htmlFor="rem-materi" className="font-semibold block text-warm-secondary">Materi Pokok Remedial</label>
                <input
                  id="rem-materi"
                  type="text"
                  placeholder="e.g. nested conditional loops"
                  value={newRemedial.materiPokok}
                  onChange={(e) => setNewRemedial({ ...newRemedial, materiPokok: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
              <div className="w-16 space-y-1">
                <label htmlFor="rem-nilai-awal" className="font-semibold block text-warm-secondary">Nilai Awal</label>
                <input
                  id="rem-nilai-awal"
                  type="number"
                  value={newRemedial.nilaiAwal}
                  onChange={(e) => setNewRemedial({ ...newRemedial, nilaiAwal: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
              <div className="w-16 space-y-1">
                <label htmlFor="rem-nilai-akhir" className="font-semibold block text-warm-secondary">Nilai Akhir</label>
                <input
                  id="rem-nilai-akhir"
                  type="number"
                  value={newRemedial.nilaiAkhir}
                  onChange={(e) => setNewRemedial({ ...newRemedial, nilaiAkhir: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex-[2] min-w-[180px] space-y-1">
                <label htmlFor="rem-bentuk" className="font-semibold block text-warm-secondary">Bentuk Pendampingan</label>
                <input
                  id="rem-bentuk"
                  type="text"
                  placeholder="e.g. Penjelasan ulang logika flowchart..."
                  value={newRemedial.bentukBimbingan}
                  onChange={(e) => setNewRemedial({ ...newRemedial, bentukBimbingan: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
              <button type="submit" className="px-5 py-2 bg-forest hover:bg-forest-dark text-white rounded-lg font-bold shadow transition-colors focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer">
                Simpan Log
              </button>
            </form>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-border text-center text-xs text-warm-text">
          <div>
            <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Mengetahui,</p>
            <p className="font-bold text-warm-text underline text-xs">{identitas.namaKepsek}</p>
            <p className="text-[10px] text-warm-muted">NIP. {identitas.nipKepsek}</p>
          </div>
          <div>
            <p className="font-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">{identitas.kota || "Bandung"}, Juni 2026</p>
            <p className="font-bold text-warm-text underline text-xs">{identitas.namaGuru}</p>
            <p className="text-[10px] text-warm-muted">NIP. {identitas.nipGuru || "-"}</p>
          </div>
        </div>
      </section>

      <div className="print:page-break-after"></div>

      {/* --- SECTION 14: BIMBINGAN DAN KONSELING SEDERHANA --- */}
      <section id="doc-bk" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <ShieldAlert aria-hidden="true" className="h-6 w-6 text-forest print:hidden" />
              SISTEM BIMBINGAN KONSELING SEDERHANA (BK)
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              BUKU UTAMA CATATAN REHABILITASI PERILAKU SISWA DAN RESTORASI MOTIVASI
            </p>
          </div>

          <div className="space-y-6">
            {bkLogs.map((bk) => (
               <div key={bk.id} className="border border-warm-border rounded-2xl p-5 bg-warm-card space-y-4 shadow hover:border-warm-muted transition-colors relative">
                <button
                  onClick={() => handleRemoveBk(bk.id)}
                  aria-label="Hapus entri BK"
                  className="absolute top-5 right-5 text-warm-muted hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer print:hidden"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </button>

                <div className="flex justify-between items-center border-b border-warm-border pb-2.5">
                  <span className="font-mono font-bold text-forest bg-forest/20 px-2.5 py-0.5 rounded text-xs">
                    {bk.tanggal} • Kasus: {bk.namaSiswa} ({bk.kelas})
                  </span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded capitalize ${
                    bk.statusKomunikasiOrtu === "Sudah" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}>
                    Hubungan Ortu: {bk.statusKomunikasiOrtu}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-warm-text">
                  <div>
                    <span className="text-[9px] font-bold text-warm-muted uppercase tracking-wider block">1. Diagnosa Perilaku / Gejala Konflik</span>
                    <p className="text-warm-text font-medium leading-relaxed mt-1">{bk.catatanPerilaku}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-warm-muted uppercase tracking-wider block">2. Tindakan Dialog / Coaching Konselor</span>
                    <p className="text-warm-text font-medium leading-relaxed mt-1">{bk.tindakanBK}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2 pt-2 border-t border-warm-border">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">3. Solusi Bersama & Komitmen Hasil</span>
                    <p className="text-emerald-900 font-bold leading-relaxed mt-1">{bk.solusiTindakLanjut}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Add BK Log (Hidden in Print) */}
          <form onSubmit={handleAddBk} className="bg-warm-bg/50 p-6 rounded-3xl border border-warm-border flex flex-col gap-4 text-xs text-warm-text print:hidden mt-6">
            <h4 className="font-bold text-warm-text uppercase flex items-center gap-1 border-b border-warm-border pb-2">
              <Plus aria-hidden="true" className="h-4 w-4 text-forest" /> Catat Kasus Perkembangan Siswa Baru
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label htmlFor="bk-nama-siswa" className="font-semibold block text-warm-secondary">Nama Siswa</label>
                <select
                  id="bk-nama-siswa"
                  value={newBk.namaSiswa}
                  onChange={(e) => setNewBk({ ...newBk, namaSiswa: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                >
                  {nilaiSiswaList.map((s) => (
                    <option key={s.siswaId} value={s.namaSiswa}>{s.namaSiswa}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="bk-kelas" className="font-semibold block text-warm-secondary">Keterpautan Kelas</label>
                <input
                  id="bk-kelas"
                  type="text"
                  value={newBk.kelas}
                  onChange={(e) => setNewBk({ ...newBk, kelas: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="bk-komunikasi" className="font-semibold block text-warm-secondary">Komunikasi Orang Tua</label>
                <select
                  id="bk-komunikasi"
                  value={newBk.statusKomunikasiOrtu}
                  onChange={(e) => setNewBk({ ...newBk, statusKomunikasiOrtu: e.target.value as any })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                >
                  <option value="Belum">Belum Dikontak</option>
                  <option value="Sudah">Sudah Diklarifikasi</option>
                  <option value="Pemanggilan">Pemanggilan Orang Tua Ke Sekolah</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="bk-catatan" className="font-semibold block text-warm-secondary">Catatan Perilaku / Gejala</label>
                <textarea
                  id="bk-catatan"
                  rows={2}
                  placeholder="e.g. Terlambat 3 kali beruntun, terlihat lesu..."
                  value={newBk.catatanPerilaku}
                  onChange={(e) => setNewBk({ ...newBk, catatanPerilaku: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="bk-tindakan" className="font-semibold block text-warm-secondary">Langkah Percakapan (Tindakan Guru)</label>
                <textarea
                  id="bk-tindakan"
                  rows={2}
                  placeholder="e.g. Dialog personal 4 mata empatik..."
                  value={newBk.tindakanBK}
                  onChange={(e) => setNewBk({ ...newBk, tindakanBK: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
                <label htmlFor="bk-solusi" className="font-semibold block text-warm-secondary">Kesimpulan Solusi Restoratif</label>
                <input
                  id="bk-solusi"
                  type="text"
                  placeholder="e.g. Penambahan jam latihan di rumah dibantu orang tua..."
                  value={newBk.solusiTindakLanjut}
                  onChange={(e) => setNewBk({ ...newBk, solusiTindakLanjut: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
            </div>

            <button type="submit" className="self-end px-5 py-2 bg-forest hover:bg-forest-dark text-white rounded-lg font-bold shadow transition-colors focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer flex items-center gap-1">
              <Plus aria-hidden="true" className="h-4 w-4" /> Simpan BK Sesi Ini
            </button>
          </form>
        </div>

        {/* Footers */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-border text-center text-xs text-warm-text">
          <div>
            <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Mengetahui,</p>
            <p className="font-bold text-warm-text underline text-xs">{identitas.namaKepsek}</p>
            <p className="text-[10px] text-warm-muted">NIP. {identitas.nipKepsek}</p>
          </div>
          <div>
            <p className="font-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Guru Mapel / Wali Kelas,</p>
            <p className="font-bold text-warm-text underline text-xs">{identitas.namaGuru}</p>
            <p className="text-[10px] text-warm-muted">NIP. {identitas.nipGuru || "-"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
