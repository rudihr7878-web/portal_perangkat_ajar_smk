/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Siswa, RencanaAsesmen, AdministrasiTahunState } from "../types";
import { Users, BookOpen, Plus, Trash2, CheckCircle, Award, ListFilter, UserPlus } from "lucide-react";

interface Props {
  state: AdministrasiTahunState;
  onChange: (updater: (s: AdministrasiTahunState) => AdministrasiTahunState) => void;
}

export default function KehadiranPembelajaran({ state, onChange }: Props) {
  const { siswaList, kehadiranMap, asesmenList, identitas } = state;
  const [selectedBulan, setSelectedBulan] = useState("Juli");
  const [newSiswa, setNewSiswa] = useState({ nis: "", nisn: "", nama: "", jenisKelamin: "L" as const });
  const [newAsesmen, setNewAsesmen] = useState({
    jenis: "Formatif" as const,
    namaAsesmen: "",
    kisiKisi: "",
    soalHotsSample: "",
    rubrikPenilaian: [
      { kriteria: "", skor4: "", skor3: "", skor2: "", skor1: "" }
    ]
  });

  // Attendance Toggle
  const handleToggleKehadiran = (siswaId: string, weekIndex: number, currentVal: number) => {
    onChange((prev) => {
      const bulanData = prev.kehadiranMap[selectedBulan] || [];
      const updatedBulan = bulanData.map((k) => {
        if (k.siswaId === siswaId) {
          const nextHadir = [...k.hadir];
          nextHadir[weekIndex] = nextHadir[weekIndex] === 1 ? 0 : 1;

          let iSakit = k.sakit;
          let iAlfa = k.alfa;
          if (nextHadir[weekIndex] === 0) {
            iAlfa += 1;
          } else {
            if (iAlfa > 0) iAlfa -= 1;
          }
          return { ...k, hadir: nextHadir, alfa: iAlfa };
        }
        return k;
      });
      return {
        ...prev,
        kehadiranMap: {
          ...prev.kehadiranMap,
          [selectedBulan]: updatedBulan
        }
      };
    });
  };

  const handleUpdateAbsensiCount = (siswaId: string, type: "sakit" | "izin" | "alfa", val: number) => {
    onChange((prev) => {
      const bulanData = prev.kehadiranMap[selectedBulan] || [];
      const updatedBulan = bulanData.map((k) => {
        if (k.siswaId === siswaId) {
          return { ...k, [type]: val };
        }
        return k;
      });
      return {
        ...prev,
        kehadiranMap: {
          ...prev.kehadiranMap,
          [selectedBulan]: updatedBulan
        }
      };
    });
  };

  // Add Siswa
  const handleAddSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiswa.nama || !newSiswa.nis) return;

    const sId = "s_" + Date.now();
    const newest: Siswa = {
      id: sId,
      noAbsen: siswaList.length + 1,
      nis: newSiswa.nis,
      nisn: newSiswa.nisn || "0000000000",
      nama: newSiswa.nama,
      jenisKelamin: newSiswa.jenisKelamin,
      namaOrangTua: "Orang Tua " + newSiswa.nama,
      alamat: "Bandung, Jawa Barat",
      teleponOrangTua: "0812-0000-0000"
    };

    onChange((prev) => {
      const extraAttendance = { siswaId: sId, hadir: [1, 1, 1, 1], sakit: 0, izin: 0, alfa: 0 };
      const nextKehadiranMap = { ...prev.kehadiranMap };
      Object.keys(nextKehadiranMap).forEach((bln) => {
        nextKehadiranMap[bln] = [...nextKehadiranMap[bln], extraAttendance];
      });

      const extraGrades = { siswaId: sId, namaSiswa: newest.nama, nilaiFormatif1: 80, nilaiFormatif2: 80, nilaiSumatifTengah: 80, nilaiSumatifAkhir: 80, nilaiRapor: 80, isTuntas: true, rekomendasi: "Tuntas" as const };

      return {
        ...prev,
        siswaList: [...prev.siswaList, newest],
        kehadiranMap: nextKehadiranMap,
        nilaiSiswaList: [...prev.nilaiSiswaList, extraGrades]
      };
    });

    setNewSiswa({ nis: "", nisn: "", nama: "", jenisKelamin: "L" });
  };

  const handleRemoveSiswa = (id: string) => {
    onChange((prev) => ({
      ...prev,
      siswaList: prev.siswaList.filter((s) => s.id !== id),
      nilaiSiswaList: prev.nilaiSiswaList.filter((n) => n.siswaId !== id)
    }));
  };

  // Asesmen Handlers
  const handleAddAsesmen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsesmen.namaAsesmen) return;

    onChange((prev) => ({
      ...prev,
      asesmenList: [
        ...prev.asesmenList,
        { id: "as_" + Date.now(), ...newAsesmen }
      ]
    }));

    setNewAsesmen({
      jenis: "Formatif",
      namaAsesmen: "",
      kisiKisi: "",
      soalHotsSample: "",
      rubrikPenilaian: [
        { kriteria: "", skor4: "", skor3: "", skor2: "", skor1: "" }
      ]
    });
  };

  const handleRemoveAsesmen = (id: string) => {
    onChange((prev) => ({
      ...prev,
      asesmenList: prev.asesmenList.filter((a) => a.id !== id)
    }));
  };

  const handleRubrikChange = (idx: number, field: string, value: string) => {
    setNewAsesmen((prev) => {
      const rubrik = [...prev.rubrikPenilaian];
      rubrik[idx] = { ...rubrik[idx], [field]: value };
      return { ...prev, rubrikPenilaian: rubrik };
    });
  };

  const handleAddRubrikRow = () => {
    setNewAsesmen((prev) => ({
      ...prev,
      rubrikPenilaian: [...prev.rubrikPenilaian, { kriteria: "", skor4: "", skor3: "", skor2: "", skor1: "" }]
    }));
  };

  const handleRemoveRubrikRow = (idx: number) => {
    setNewAsesmen((prev) => {
      if (prev.rubrikPenilaian.length <= 1) return prev;
      return { ...prev, rubrikPenilaian: prev.rubrikPenilaian.filter((_, i) => i !== idx) };
    });
  };

  return (
    <div className="space-y-12">
      {/* --- SECTION 10: DAFTAR HADIR SISWA --- */}
      <section id="doc-kehadiran" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border shadow-lg print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <Users className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
              PRESENSI / DAFTAR HADIR SISWA
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              REKAP MODUL REGISTER KEHADIRAN SISWA KELAS {identitas.kelas}
            </p>
          </div>

          {/* Month Selector Filter */}
          <div className="flex justify-between items-center bg-warm-bg p-4 rounded-2xl border border-warm-border print:hidden text-xs">
            <span className="font-bold text-warm-secondary flex items-center gap-1">
              <ListFilter className="h-4 w-4" aria-hidden="true" /> Pilih Rekap Bulan Pengamatan:
            </span>
            <div className="flex gap-2">
              {["Juli", "Agustus"].map((bln) => (
                <button
                  key={bln}
                  onClick={() => setSelectedBulan(bln)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent ${
                    selectedBulan === bln
                      ? "bg-forest text-white shadow-sm"
                      : "bg-warm-card text-warm-secondary border border-warm-border hover:bg-warm-bg"
                  }`}
                >
                  {bln}
                </button>
              ))}
            </div>
          </div>

          {/* Attendance Matrix Table */}
          <div className="overflow-x-auto border border-warm-bg rounded-2xl">
            <table className="w-full text-left text-xs text-warm-text">
              <thead className="bg-warm-bg text-[10px] font-bold uppercase tracking-wider text-warm-secondary border-b border-warm-bg">
                <tr>
                  <th className="px-4 py-3 text-center w-[6%]">No</th>
                  <th className="px-4 py-3 w-[15%] font-mono">NIS/NISN</th>
                  <th className="px-4 py-3 w-[30%]">Nama Siswa</th>
                  <th className="px-4 py-3 text-center w-[8%]">L/P</th>
                  <th className="px-4 py-3 text-center w-[16%]">Presensi Pekanan</th>
                  <th className="px-3 py-3 text-center w-[7%]">S</th>
                  <th className="px-3 py-3 text-center w-[7%]">I</th>
                  <th className="px-3 py-3 text-center w-[7%]">A</th>
                  <th className="px-3 py-3 text-center w-[12%]">Persentase</th>
                  <th className="px-3 py-3 text-center w-[8%] print:hidden">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border font-medium text-warm-text">
                {siswaList.map((siswa, idx) => {
                  const presensi = (kehadiranMap[selectedBulan] || []).find((k) => k.siswaId === siswa.id) || {
                    hadir: [1, 1, 1, 1], sakit: 0, izin: 0, alfa: 0
                  };
                  const totalAbsence = presensi.sakit + presensi.izin + presensi.alfa;
                  const totalDays = presensi.hadir.length + totalAbsence;
                  const percent = totalDays > 0 ? Math.round(((totalDays - totalAbsence) / totalDays) * 100) : 100;

                  return (
                    <tr key={siswa.id} className="hover:bg-warm-bg transition-colors">
                      <td className="px-4 py-3 text-center text-warm-muted">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-warm-secondary text-[11px]">{siswa.nis}/{siswa.nisn}</td>
                      <td className="px-4 py-3 font-bold text-warm-text">{siswa.nama}</td>
                      <td className="px-4 py-3 text-center">{siswa.jenisKelamin}</td>
                      {/* Checkbox columns representing weeks */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-1.5 justify-center">
                          {presensi.hadir.map((status, wIdx) => (
                            <button
                              key={wIdx}
                              onClick={() => handleToggleKehadiran(siswa.id, wIdx, status)}
                              className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent ${
                                status === 1
                                  ? "bg-emerald-500 text-white shadow-sm"
                                  : "bg-red-100 text-red-700 border border-red-200"
                              }`}
                              title={`Pekan ${wIdx + 1}: Klik untuk toggle absensi`}
                            >
                              {status === 1 ? "H" : "A"}
                            </button>
                          ))}
                        </div>
                      </td>
                      {/* Interactive aggregate counters */}
                      <td className="px-3 py-3 text-center">
                        <input
                          type="number"
                          value={presensi.sakit}
                          onChange={(e) => handleUpdateAbsensiCount(siswa.id, "sakit", parseInt(e.target.value) || 0)}
                          className="w-10 text-center bg-transparent focus:bg-warm-bg border border-transparent border-b-warm-border rounded text-xs"
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <input
                          type="number"
                          value={presensi.izin}
                          onChange={(e) => handleUpdateAbsensiCount(siswa.id, "izin", parseInt(e.target.value) || 0)}
                          className="w-10 text-center bg-transparent focus:bg-warm-bg border border-transparent border-b-warm-border rounded text-xs"
                        />
                      </td>
                      <td className="px-3 py-3 text-center text-red-600">
                        <input
                          type="number"
                          value={presensi.alfa}
                          onChange={(e) => handleUpdateAbsensiCount(siswa.id, "alfa", parseInt(e.target.value) || 0)}
                          className="w-10 text-center bg-transparent focus:bg-warm-bg border border-transparent border-b-warm-border rounded font-bold text-xs"
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          percent >= 90 ? "bg-emerald-50 text-emerald-700" :
                          percent >= 75 ? "bg-amber-50 text-amber-700" :
                          "bg-red-50 text-red-700"
                        }`}>
                          {percent}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center print:hidden">
                        <button
                          onClick={() => handleRemoveSiswa(siswa.id)}
                          className="text-warm-muted hover:text-red-500 p-0.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent"
                          title="Hapus Siswa"
                          aria-label="Hapus siswa"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Form Add Siswa Baru (Only visible in Print/Editor tab) */}
          <form onSubmit={handleAddSiswa} className="bg-warm-bg p-5 rounded-2xl border border-warm-border flex flex-wrap gap-4 items-end text-xs text-warm-text print:hidden shadow-sm">
            <h4 className="w-full font-bold text-warm-text uppercase flex items-center gap-1.5 border-b border-warm-border pb-2">
              <UserPlus className="h-4 w-4 text-forest" aria-hidden="true" /> Daftarkan Siswa Baru ke Roster
            </h4>
            <div className="flex-1 min-w-[100px] space-y-1">
              <label htmlFor="new-siswa-nis" className="font-semibold block text-warm-secondary">NIS (Induk)</label>
              <input
                id="new-siswa-nis"
                type="text"
                required
                placeholder="e.g. 26016"
                value={newSiswa.nis}
                onChange={(e) => setNewSiswa({ ...newSiswa, nis: e.target.value })}
                className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
              />
            </div>
            <div className="flex-1 min-w-[100px] space-y-1">
              <label htmlFor="new-siswa-nisn" className="font-semibold block text-warm-secondary">NISN</label>
              <input
                id="new-siswa-nisn"
                type="text"
                placeholder="e.g. 0095561122"
                value={newSiswa.nisn}
                onChange={(e) => setNewSiswa({ ...newSiswa, nisn: e.target.value })}
                className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
              />
            </div>
            <div className="flex-[2] min-w-[180px] space-y-1">
              <label htmlFor="new-siswa-nama" className="font-semibold block text-warm-secondary">Nama Lengkap Siswa</label>
              <input
                id="new-siswa-nama"
                type="text"
                required
                placeholder="e.g. Fariz Aditama"
                value={newSiswa.nama}
                onChange={(e) => setNewSiswa({ ...newSiswa, nama: e.target.value })}
                className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
              />
            </div>
            <div className="flex-1 min-w-[80px] space-y-1">
              <label htmlFor="new-siswa-jk" className="font-semibold block text-warm-secondary">Gander (L/P)</label>
              <select
                id="new-siswa-jk"
                value={newSiswa.jenisKelamin}
                onChange={(e) => setNewSiswa({ ...newSiswa, jenisKelamin: e.target.value as any })}
                className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
              >
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <button type="submit" className="px-5 py-2 bg-forest hover:bg-forest/90 text-white rounded-lg font-bold shadow transition-colors flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent">
              <Plus className="h-4 w-4" aria-hidden="true" /> Tambah Roster
            </button>
          </form>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-bg text-center text-xs text-warm-text">
          <div>
            <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Mengetahui,</p>
            <p className="font-bold text-warm-text underline text-xs">{identitas.namaKepsek}</p>
            <p className="text-[10px] text-warm-muted">NIP. {identitas.nipKepsek}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Disahkan Oleh,</p>
            <p className="font-bold text-warm-text underline text-xs">{identitas.waliKelasDi === "None" ? identitas.namaGuru : `Wali Kelas ${identitas.waliKelasDi}`}</p>
            <p className="text-[10px] text-warm-muted">NIP/NUPTK. {identitas.nipGuru || "-"}</p>
          </div>
        </div>
      </section>

      <div className="print:page-break-after"></div>

      {/* --- SECTION 11: ASESMEN PEMBELAJARAN --- */}
      <section id="doc-asesmen" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border shadow-lg print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
              SISTEM ASESMEN DAN RUBRIK PENILAIAN
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              RANCANGAN DIAGNOSTIK, FORMATIF, DAN SUMATIF KOMPREHENSIF HOTS (HIGH ORDER THINKING)
            </p>
          </div>

          <div className="space-y-8">
            {asesmenList.map((as) => (
              <div key={as.id} className="border border-warm-border rounded-3xl p-6 bg-warm-card space-y-4 shadow-sm hover:border-warm-border transition-all">
                <div className="flex justify-between items-center border-b border-warm-bg pb-3 flex-wrap gap-2">
                  <span className={`font-bold px-3 py-1 rounded text-xs uppercase ${
                    as.jenis === "Diagnostik" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                    as.jenis === "Formatif" ? "bg-blue-50 text-blue-700 border border-blue-105" :
                    "bg-red-50 text-red-700 border border-red-105"
                  }`}>
                    Asesmen {as.jenis}
                  </span>
                  <button
                    onClick={() => handleRemoveAsesmen(as.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 border border-red-100 px-2 py-0.5 rounded-lg hover:bg-red-50 transition-colors print:hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent"
                    aria-label="Hapus rencana asesmen"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Hapus Rencana
                  </button>
                </div>

                <h3 className="font-extrabold text-sm text-warm-text">{as.namaAsesmen}</h3>

                <div className="grid grid-cols-1 gap-4 text-xs text-warm-text text-left leading-relaxed">
                  <div>
                    <span className="text-[10px] font-bold text-warm-muted uppercase tracking-widest block mb-1">Kisi-Kisi Asesmen / Indikator</span>
                    <p className="p-3 bg-warm-bg border border-warm-bg rounded-xl text-warm-secondary leading-relaxed font-semibold">{as.kisiKisi}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">Butir Soal Tantangan HOTS (High-Order Thinking)</span>
                    <p className="p-4 bg-red-50/15 border-l-4 border-red-500 text-warm-text rounded-r-xl font-bold font-mono text-[11px] leading-relaxed whitespace-pre-line">{as.soalHotsSample}</p>
                  </div>

                  {/* High Quality Rubric Descriptor */}
                  <div>
                    <span className="text-[10px] font-bold text-warm-muted uppercase tracking-widest block mb-2">Rubrik Penilaian Deskrpitor Kriteria Berjenjang</span>
                    <div className="overflow-x-auto border border-warm-border rounded-xl">
                      <table className="w-full text-left font-semibold text-warm-text">
                        <thead className="bg-warm-bg text-[9px] font-bold uppercase tracking-wider text-warm-secondary border-b border-warm-border">
                          <tr>
                            <th className="px-4 py-2 w-1/4">Kriteria</th>
                            <th className="px-4 py-2 bg-emerald-50 text-emerald-800 text-center">Sangat Baik (4)</th>
                            <th className="px-4 py-2 bg-blue-50 text-blue-800 text-center">Baik (3)</th>
                            <th className="px-4 py-2 bg-amber-50 text-amber-800 text-center">Cukup (2)</th>
                            <th className="px-4 py-2 bg-red-50 text-red-800 text-center">Kurang (1)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-warm-border text-[11px] text-warm-muted">
                          {as.rubrikPenilaian.map((rub, rIdx) => (
                            <tr key={rIdx}>
                              <td className="px-4 py-3 font-bold text-warm-text border-r border-warm-border">{rub.kriteria}</td>
                              <td className="px-4 py-3 bg-emerald-50/20 md:text-center leading-relaxed h-[80px] border-r border-warm-bg">{rub.skor4}</td>
                              <td className="px-4 py-3 bg-blue-50/20 md:text-center leading-relaxed border-r border-warm-bg">{rub.skor3}</td>
                              <td className="px-4 py-3 bg-amber-50/20 md:text-center leading-relaxed border-r border-warm-bg">{rub.skor2}</td>
                              <td className="px-4 py-3 bg-red-50/20 md:text-center leading-relaxed">{rub.skor1}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Add Asesmen Baru (Hidden in Print) */}
          <form onSubmit={handleAddAsesmen} className="bg-warm-bg p-6 rounded-3xl border border-warm-border flex flex-col gap-4 text-xs text-warm-text print:hidden mt-6">
            <h4 className="font-bold text-warm-text uppercase flex items-center gap-1.5 border-b border-warm-border pb-2">
              <Award className="h-4 w-4 text-forest" aria-hidden="true" /> Desain Rencana Asesmen Hot & Rubrik Baru
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="new-asesmen-jenis" className="font-semibold text-warm-secondary">Kapasitas / Jenis</label>
                <select
                  id="new-asesmen-jenis"
                  value={newAsesmen.jenis}
                  onChange={(e) => setNewAsesmen({ ...newAsesmen, jenis: e.target.value as any })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                >
                  <option value="Diagnostik">Asesmen Diagnostik</option>
                  <option value="Formatif">Asesmen Formatif (Kelas)</option>
                  <option value="Sumatif">Asesmen Sumatif (Bab/SAS)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="new-asesmen-nama" className="font-semibold text-warm-secondary">Nama / Judul Kegiatan Asesmen</label>
                <input
                  id="new-asesmen-nama"
                  type="text"
                  required
                  placeholder="e.g. Ujian Praktikum Analisis Kode Python POSYANDU"
                  value={newAsesmen.namaAsesmen}
                  onChange={(e) => setNewAsesmen({ ...newAsesmen, namaAsesmen: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="new-asesmen-kisi" className="font-semibold text-warm-secondary">Kisi-Kisi / Indikator Penilaian</label>
              <textarea
                id="new-asesmen-kisi"
                rows={2}
                placeholder="Deskripsikan kisi-kisi pengetesannya apa saja..."
                value={newAsesmen.kisiKisi}
                onChange={(e) => setNewAsesmen({ ...newAsesmen, kisiKisi: e.target.value })}
                className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="new-asesmen-soal" className="font-semibold text-warm-muted text-red-500">Pertanyaan/Permasalahan HOTS (Butir Soal)</label>
              <textarea
                id="new-asesmen-soal"
                rows={2}
                placeholder="Rancang instruksi soal bernalar analisis tinggi..."
                value={newAsesmen.soalHotsSample}
                onChange={(e) => setNewAsesmen({ ...newAsesmen, soalHotsSample: e.target.value })}
                className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none font-mono text-[11px]"
              />
            </div>

            {/* Rubrik Penilaian Input */}
            <div className="space-y-2">
              <span className="font-bold text-warm-muted uppercase tracking-wider block text-[10px]">Rubrik Penilaian Deskrpitor Kriteria Berjenjang</span>
              {newAsesmen.rubrikPenilaian.map((rub, rIdx) => (
                <div key={rIdx} className="bg-warm-card border border-warm-border rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      placeholder="Nama Kriteria (e.g. Ketajaman Analisis)"
                      value={rub.kriteria}
                      onChange={(e) => handleRubrikChange(rIdx, "kriteria", e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-warm-bg border border-warm-border rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                    {newAsesmen.rubrikPenilaian.length > 1 && (
                      <button type="button" onClick={() => handleRemoveRubrikRow(rIdx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        aria-label="Hapus baris kriteria"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { key: "skor4", label: "Sangat Baik (4)", bg: "bg-emerald-50" },
                      { key: "skor3", label: "Baik (3)", bg: "bg-blue-50" },
                      { key: "skor2", label: "Cukup (2)", bg: "bg-amber-50" },
                      { key: "skor1", label: "Kurang (1)", bg: "bg-red-50" },
                    ].map((skor) => (
                      <div key={skor.key} className="space-y-0.5">
                        <span className="text-[9px] font-bold text-warm-muted">{skor.label}</span>
                        <textarea
                          rows={2}
                          placeholder={`Deskripsi ${skor.label}`}
                          value={(rub as any)[skor.key]}
                          onChange={(e) => handleRubrikChange(rIdx, skor.key, e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-lg text-[10px] border border-warm-border focus:outline-none focus:ring-1 focus:ring-forest leading-relaxed ${skor.bg} bg-opacity-20`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleAddRubrikRow}
                className="w-full py-2 border-2 border-dashed border-warm-border rounded-xl text-[10px] font-bold text-warm-muted hover:text-forest hover:border-forest transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Tambah Baris Kriteria
              </button>
            </div>

            <button type="submit" className="self-end px-5 py-2 bg-forest hover:bg-forest/90 text-white rounded-lg font-bold shadow transition-colors flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent">
              <Plus className="h-4 w-4" aria-hidden="true" /> Daftarkan Asesmen Baru
            </button>
          </form>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-bg text-center text-xs text-warm-text">
          <div>
            <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Menyetujui,</p>
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
    </div>
  );
}
