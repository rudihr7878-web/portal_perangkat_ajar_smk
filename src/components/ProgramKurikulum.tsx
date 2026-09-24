/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AtpItem, PromesItem, ProtaItem, AdministrasiTahunState } from "../types";
import { BookOpen, CalendarRange, Map, Plus, Trash2, Milestone, Edit, Check } from "lucide-react";
import { BULAN_KOLOM_PRESET, BULAN_KOLOM_PRESET_GENAP, DIMENSI_PROFIL_LULUSAN } from "../utils";

interface Props {
  state: AdministrasiTahunState;
  onChange: (updater: (s: AdministrasiTahunState) => AdministrasiTahunState) => void;
}

export default function ProgramKurikulum({ state, onChange }: Props) {
  const { prota, promes, atp, identitas } = state;

  const [protaEditId, setProtaEditId] = useState<string | null>(null);
  const [newProta, setNewProta] = useState<Omit<ProtaItem, "id">>({
    no: prota.items.length + 1,
    tujuanPembelajaran: "",
    materiPokok: "",
    alokasiWaktu: 6,
    semester: "1",
    targetCapaian: ""
  });

  const [atpEditId, setAtpEditId] = useState<string | null>(null);
  const [newAtp, setNewAtp] = useState<Omit<AtpItem, "id">>({
    kode: "TP-AP-E.2",
    elemen: "Algoritma dan Pemrograman (AP)",
    capaianPembelajaran: "",
    tujuanPembelajaran: "",
    materiPokok: "",
    profilPelajarPancasila: ["Bernalar Kritis"],
    alokasiWaktu: 6,
    glosarium: ""
  });

  // PROTA Handlers
  const handleAddProta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProta.tujuanPembelajaran || !newProta.materiPokok) return;

    onChange((prev) => ({
      ...prev,
      prota: {
        ...prev.prota,
        items: [
          ...prev.prota.items,
          { id: "prt_" + Date.now(), ...newProta }
        ]
      }
    }));
    setNewProta({
      no: prota.items.length + 2,
      tujuanPembelajaran: "",
      materiPokok: "",
      alokasiWaktu: 6,
      semester: "1",
      targetCapaian: ""
    });
  };

  const handleRemoveProta = (id: string) => {
    onChange((prev) => ({
      ...prev,
      prota: {
        ...prev.prota,
        items: prev.prota.items.filter((item) => item.id !== id)
      }
    }));
  };

  const handleUpdateProtaTarget = (text: string) => {
    onChange((prev) => ({
      ...prev,
      prota: {
        ...prev.prota,
        targetTahunan: text
      }
    }));
  };

  // PROMES Matrix Toggle/Change Number
  const handlePromesValChange = (itemId: string, weekCol: string, val: number) => {
    onChange((prev) => ({
      ...prev,
      promes: {
        ...prev.promes,
        items: prev.promes.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              mingguEfektif: {
                ...item.mingguEfektif,
                [weekCol]: val
              }
            };
          }
          return item;
        })
      }
    }));
  };

  // PROMES Add / Remove / Holiday Toggle
  const handleAddPromesItem = () => {
    const currentMaxNo = filteredPromesItems.reduce((max, it) => Math.max(max, it.no), 0);
    onChange((prev) => ({
      ...prev,
      promes: {
        ...prev.promes,
        items: [
          ...prev.promes.items,
          {
            id: "prm_" + Date.now(),
            no: currentMaxNo + 1,
            materiPokok: "Materi Baru",
            alokasiWaktu: 0,
            semester: semesterFilter,
            mingguEfektif: {},
            jadwalAsesmen: ""
          }
        ]
      }
    }));
  };

  const handleRemovePromesItem = (id: string) => {
    onChange((prev) => ({
      ...prev,
      promes: {
        ...prev.promes,
        items: prev.promes.items.filter((item) => item.id !== id)
      }
    }));
  };

  const handlePromesHolidayToggle = (itemId: string, weekCol: string) => {
    onChange((prev) => ({
      ...prev,
      promes: {
        ...prev.promes,
        items: prev.promes.items.map((item) => {
          if (item.id === itemId) {
            const libur = { ...(item.libur || {}) };
            if (libur[weekCol]) {
              delete libur[weekCol];
            } else {
              libur[weekCol] = true;
            }
            return { ...item, libur };
          }
          return item;
        })
      }
    }));
  };

  // PROMES inline edit handlers
  const handlePromesMateriChange = (itemId: string, value: string) => {
    onChange((prev) => ({
      ...prev,
      promes: {
        ...prev.promes,
        items: prev.promes.items.map((item) =>
          item.id === itemId ? { ...item, materiPokok: value } : item
        )
      }
    }));
  };

  const handlePromesJPChange = (itemId: string, value: number) => {
    onChange((prev) => ({
      ...prev,
      promes: {
        ...prev.promes,
        items: prev.promes.items.map((item) =>
          item.id === itemId ? { ...item, alokasiWaktu: Math.max(0, value) } : item
        )
      }
    }));
  };

  // ATP Handlers
  const handleAddAtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAtp.tujuanPembelajaran || !newAtp.kode) return;

    onChange((prev) => ({
      ...prev,
      atp: [
        ...prev.atp,
        { id: "atp_" + Date.now(), ...newAtp }
      ]
    }));
    setNewAtp({
      kode: "TP-AP-E." + (atp.length + 2),
      elemen: "Algoritma dan Pemrograman (AP)",
      capaianPembelajaran: "",
      tujuanPembelajaran: "",
      materiPokok: "",
      profilPelajarPancasila: ["Bernalar Kritis"],
      alokasiWaktu: 6,
      glosarium: ""
    });
  };

  const handleRemoveAtp = (id: string) => {
    onChange((prev) => ({
      ...prev,
      atp: prev.atp.filter((a) => a.id !== id)
    }));
  };

  // Total JP helpers
  const totalProtaJP = prota.items.reduce((sum, item) => sum + item.alokasiWaktu, 0);
  const totalPromesJP = promes.items.reduce((sum, item) => sum + item.alokasiWaktu, 0);

  // Semester filter state for PROMES
  const [semesterFilter, setSemesterFilter] = useState<"1" | "2">("1");
  const filteredPromesItems = promes.items.filter((item) => item.semester === semesterFilter);
  const activePreset = semesterFilter === "1" ? BULAN_KOLOM_PRESET : BULAN_KOLOM_PRESET_GENAP;

  return (
    <div className="space-y-12">
      {/* --- SECTION 4: PROGRAM TAHUNAN (PROTA) --- */}
      <section id="doc-prota" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border shadow-lg print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
              PROGRAM TAHUNAN (PROTA)
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              TARGET CAPAIAN TAHUNAN MODEL KURIKULUM MERDEKA - MAPEL {identitas.mapel.toUpperCase()}
            </p>
          </div>

          {/* Editable Target Capaian Tahunan */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1">
              <Milestone className="h-4 w-4" aria-hidden="true" />
              Capaian Pembelajaran
            </label>
            <textarea
              value={prota.targetTahunan}
              onChange={(e) => handleUpdateProtaTarget(e.target.value)}
              rows={3}
              className="w-full text-sm text-warm-text border border-warm-border p-4 rounded-2xl bg-warm-bg/40 focus:outline-none focus:ring-2 focus:ring-forest font-medium leading-relaxed"
              placeholder="Deklarasikan target akhir belajar siswa selama setahun penuh..."
            />
          </div>

          {/* Prota Spreadsheet */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-warm-secondary uppercase">Daftar Distribusi Alokasi Waktu per TP</span>
              <span className="font-mono text-forest font-bold bg-forest/10 px-2 py-0.5 rounded border border-forest/20">
                Total Alokasi Setahun: {totalProtaJP} JP (Jam Pelajaran)
              </span>
            </div>

            <div className="overflow-x-auto border border-warm-border rounded-3xl">
              <table className="w-full text-left text-xs text-warm-text table-fixed">
                <thead className="bg-warm-bg text-[10px] font-bold uppercase tracking-wider text-warm-secondary border-b border-warm-border">
                  <tr>
                    <th className="px-3 py-3 w-[6%] text-center">No</th>
                    <th className="px-4 py-3 w-[15%]">Materi Pokok</th>
                    <th className="px-4 py-3 w-[44%]">Tujuan Pembelajaran (TP)</th>
                    <th className="px-4 py-3 w-[12%] text-center">Semester</th>
                    <th className="px-4 py-3 w-[13%] text-center">Durasi (JP)</th>
                    <th className="px-3 py-3 w-[10%] text-center print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border font-medium text-warm-text">
                  {prota.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-warm-bg/50 transition-colors">
                      <td className="px-3 py-3 text-center">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-warm-text">{item.materiPokok}</td>
                      <td className="px-4 py-3 text-warm-secondary leading-relaxed leading-[1.4]">{item.tujuanPembelajaran}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-warm-bg text-warm-text px-1.5 py-0.5 rounded text-[10px] font-bold">
                          SMT {item.semester}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-warm-text">{item.alokasiWaktu} JP</td>
                      <td className="px-3 py-3 text-center print:hidden">
                        <button
                          onClick={() => handleRemoveProta(item.id)}
                          className="p-1 hover:text-red-500 text-warm-muted transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent"
                          title="Hapus TP"
                          aria-label="Hapus TP"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Form Add Prota Item (Hidden in Print) */}
            <form onSubmit={handleAddProta} className="bg-warm-bg/50 p-5 rounded-2xl border border-warm-border flex flex-col gap-4 text-xs text-warm-text print:hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="prota-materi" className="font-semibold text-warm-secondary">Materi Pokok</label>
                  <input
                    id="prota-materi"
                    type="text"
                    required
                    placeholder="e.g. Berpikir Komputasional"
                    value={newProta.materiPokok}
                    onChange={(e) => setNewProta({ ...newProta, materiPokok: e.target.value })}
                    className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="prota-semester" className="font-semibold text-warm-secondary">Semester</label>
                  <select
                    id="prota-semester"
                    value={newProta.semester}
                    onChange={(e) => setNewProta({ ...newProta, semester: e.target.value as any })}
                    className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                  >
                    <option value="1">Semester 1 (Ganjil)</option>
                    <option value="2">Semester 2 (Genap)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="prota-alokasi" className="font-semibold text-warm-secondary">Alokasi Waktu (JP)</label>
                  <input
                    id="prota-alokasi"
                    type="number"
                    value={newProta.alokasiWaktu}
                    onChange={(e) => setNewProta({ ...newProta, alokasiWaktu: parseInt(e.target.value) || 2 })}
                    className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="prota-tujuan" className="font-semibold text-warm-secondary">Tujuan Pembelajaran (CP yang diturunkan)</label>
                <input
                  id="prota-tujuan"
                  type="text"
                  required
                  placeholder="e.g. Menerapkan strategi berpikir komputasional dekomposisi untuk memilah problem..."
                  value={newProta.tujuanPembelajaran}
                  onChange={(e) => setNewProta({ ...newProta, tujuanPembelajaran: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
              <button type="submit" className="self-end px-5 py-2 bg-forest hover:bg-forest/90 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent">
                <Plus className="h-4 w-4" aria-hidden="true" /> Daftarkan TP ke Prota
              </button>
            </form>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-border text-center text-xs text-warm-text">
          <div>
            <p className="font-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Menyetujui,</p>
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

      {/* --- SECTION 5: PROGRAM SEMESTER (PROMES) --- */}
      <section id="doc-promes" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border shadow-lg print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <CalendarRange className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
              PROGRAM SEMESTER (PROMES)
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              RINCIAN DISTRIBUSI BULAN DAN MINGGU EFEKTIF SEMESTER {semesterFilter === "1" ? "GANJIL" : "GENAP"}
            </p>
          </div>

          <p className="text-xs text-warm-secondary leading-relaxed">
            Masukkan porsi alokasi JP mengajar ke dalam kolom minggu bulan yang relevan di bawah ini. Total alokasi tiap materi akan divalidasi keakuratan distribusinya.
          </p>

          {/* Toggle Semester */}
          <div className="flex gap-2 print:hidden mb-4">
            <button onClick={() => setSemesterFilter("1")}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                semesterFilter === "1" ? "bg-forest text-white border-forest" : "bg-warm-card text-warm-secondary border-warm-border hover:bg-warm-bg"
              }`}>Semester Ganjil</button>
            <button onClick={() => setSemesterFilter("2")}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                semesterFilter === "2" ? "bg-forest text-white border-forest" : "bg-warm-card text-warm-secondary border-warm-border hover:bg-warm-bg"
              }`}>Semester Genap</button>
          </div>

          {/* Toolbar: Add + stats */}
          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handleAddPromesItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest hover:bg-forest/90 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Tambah Materi
            </button>
            <span className="text-xs text-warm-secondary font-medium">
              {filteredPromesItems.length} materi · Total <strong>{totalPromesJP}</strong> JP
            </span>
            {filteredPromesItems.length > 0 && (
              <span className="text-[10px] text-warm-muted ml-auto">
                ⚡ Klik <span className="text-red-400">⚪</span> pada sel minggu untuk tandai <strong>Libur / Ujian</strong>
              </span>
            )}
          </div>

          {/* Promes Spreadsheet Matrix */}
          <div className="overflow-x-auto overflow-y-auto max-h-[620px] border border-warm-border rounded-2xl">
            <table className="w-full text-left text-xs text-warm-text border-collapse table-fixed min-w-[1800px]">
              <thead className="sticky top-0 z-10">
                {/* Month header row */}
                <tr className="bg-warm-bg text-[9px] font-bold uppercase tracking-wider text-warm-secondary border-b border-warm-border">
                  <th className="px-3 py-3 w-10 text-center" rowSpan={2}>No</th>
                  <th className="px-4 py-3 w-[240px]" rowSpan={2}>Materi Pokok / Bahasan</th>
                  <th className="px-4 py-3 w-14 text-center" rowSpan={2}>JP</th>
                  {(() => {
                    const monthMap: Record<string, number> = {};
                    activePreset.forEach((col) => {
                      const m = col.split("-")[0];
                      monthMap[m] = (monthMap[m] || 0) + 1;
                    });
                    const monthLabels: Record<string, string> = {
                      Jul: "Juli", Agu: "Agustus", Sep: "September", Okt: "Oktober", Nov: "November", Des: "Desember",
                      Jan: "Januari", Feb: "Februari", Mar: "Maret", Apr: "April", Mei: "Mei", Jun: "Juni"
                    };
                    return Object.entries(monthMap).map(([m, count]) => (
                      <th key={m} className="px-2 py-2 text-center border-b border-warm-border" colSpan={count}>
                        {monthLabels[m] || m}
                        <span className="inline-block bg-forest text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1 align-middle">
                          {count} mg
                        </span>
                      </th>
                    ));
                  })()}
                  <th className="px-2 py-3 w-14 text-center border-b border-warm-border" rowSpan={2}>Status</th>
                </tr>
                {/* Week header row */}
                <tr className="bg-warm-bg text-[8px] text-warm-muted font-bold text-center border-b border-warm-border">
                  {activePreset.map((col, idx) => (
                    <th key={idx} className="p-1.5 border-r border-warm-border last:border-none min-w-[44px]">
                      {col.split("-")[1]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border font-medium text-warm-text">
                {filteredPromesItems.length === 0 ? (
                  <tr>
                    <td colSpan={3 + activePreset.length + 1} className="px-6 py-16 text-center text-warm-muted">
                      <div className="text-4xl mb-3">📂</div>
                      <p className="text-sm font-medium">Belum ada materi.</p>
                      <p className="text-xs mt-1">Klik <strong>"Tambah Materi"</strong> untuk mulai menyusun program semester.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPromesItems.map((item, idx) => {
                    const distributed = activePreset.reduce((sum, col) => sum + (item.mingguEfektif[col] || 0), 0);
                    const isOk = item.alokasiWaktu > 0 && distributed === item.alokasiWaktu;
                    const isPending = item.alokasiWaktu === 0 && distributed === 0;
                    let statusIcon = "⏳";
                    let statusClass = "text-yellow-500";
                    if (item.alokasiWaktu > 0) {
                      if (distributed === item.alokasiWaktu) {
                        statusIcon = "✓";
                        statusClass = "text-green-600";
                      } else {
                        statusIcon = "✗";
                        statusClass = "text-red-500";
                      }
                    }
                    return (
                      <tr key={item.id} className="hover:bg-warm-bg/50 transition-colors">
                        <td className="px-3 py-3 text-center text-warm-muted text-xs">{idx + 1}</td>
                        <td className="px-2 py-3 font-bold text-warm-text border-r border-warm-border relative group">
                          <input
                            type="text"
                            value={item.materiPokok}
                            onChange={(e) => handlePromesMateriChange(item.id, e.target.value)}
                            className="w-full bg-transparent font-bold text-warm-text text-xs focus:outline-none focus:bg-warm-bg px-2 py-1 rounded border border-transparent focus:border-forest/40 transition-all"
                          />
                          <button
                            onClick={() => handleRemovePromesItem(item.id)}
                            className="ml-2 p-0.5 text-warm-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all print:hidden cursor-pointer"
                            title="Hapus materi"
                          >
                            <Trash2 className="h-3 w-3 inline" />
                          </button>
                        </td>
                        <td className="px-2 py-3 text-center border-r border-warm-border bg-forest/10 font-extrabold text-forest">
                          <input
                            type="number"
                            min="0"
                            max="72"
                            value={item.alokasiWaktu}
                            onChange={(e) => handlePromesJPChange(item.id, parseInt(e.target.value) || 0)}
                            className="w-full text-center bg-transparent font-extrabold text-forest text-sm focus:outline-none focus:bg-white/50 rounded border border-transparent focus:border-forest/40 transition-all"
                          />
                        </td>
                        {activePreset.map((col, uIdx) => {
                          const curVal = item.mingguEfektif[col] || 0;
                          const isLibur = item.libur?.[col] === true;
                          return (
                            <td key={uIdx} className="relative p-1 text-center border-r border-warm-border last:border-none">
                              <input
                                type="number"
                                min="0"
                                max="8"
                                value={isLibur ? "" : (curVal || "")}
                                disabled={isLibur}
                                onChange={(e) => handlePromesValChange(item.id, col, parseInt(e.target.value) || 0)}
                                className={`w-10 h-9 text-center font-mono font-bold rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-forest/40 ${
                                  isLibur
                                    ? "bg-red-100 border-red-200 text-red-400 cursor-not-allowed"
                                    : curVal > 0
                                      ? "text-forest bg-forest/10 border-transparent"
                                      : "text-warm-muted bg-warm-bg border-warm-border"
                                }`}
                                placeholder={isLibur ? "✗" : "-"}
                              />
                              <button
                                onClick={() => handlePromesHolidayToggle(item.id, col)}
                                className={`absolute -top-0.5 -right-0.5 text-[10px] cursor-pointer transition-all print:hidden hover:scale-125 z-[1] ${
                                  isLibur
                                    ? "opacity-100 drop-shadow-md"
                                    : "opacity-80 hover:opacity-100 bg-white/70 rounded-full shadow-sm px-0.5"
                                }`}
                                title={isLibur ? "Hapus tanda libur" : "Tandai libur/ujian"}
                              >
                                {isLibur ? "🔴" : "⚪"}
                              </button>
                            </td>
                          );
                        })}
                        <td className="px-2 py-3 text-center text-lg font-bold">
                          <span className={statusClass}>{statusIcon}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredPromesItems.length > 0 && (
                <tfoot>
                  <tr className="bg-warm-bg font-bold text-xs text-warm-text border-t-2 border-warm-border">
                    <td className="px-3 py-2.5 text-center text-warm-muted"></td>
                    <td className="px-4 py-2.5 text-right text-warm-secondary pr-4">TOTAL</td>
                    <td className="px-4 py-2.5 text-center bg-forest/10 text-forest text-sm">
                      {filteredPromesItems.reduce((s, it) => s + it.alokasiWaktu, 0)}
                    </td>
                    {(() => {
                      const weekTotals = activePreset.map(col =>
                        filteredPromesItems.reduce((sum, item) => sum + (item.mingguEfektif[col] || 0), 0)
                      );
                      return weekTotals.map((total, uIdx) => (
                        <td key={uIdx} className="px-1 py-2.5 text-center border-r border-warm-border last:border-none">
                          <span className="text-warm-text font-bold">{total}</span>
                        </td>
                      ));
                    })()}
                    <td className="px-2 py-2.5 text-center"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Keterangan */}
          <div className="flex justify-between items-center bg-warm-bg p-4 rounded-xl border border-warm-border text-xs">
            <span className="font-semibold text-warm-secondary">Keterangan Pengisian:</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-warm-secondary"><span className="w-3 h-3 bg-forest/10 rounded border border-forest/20 inline-block"></span> Angka = JP pekan itu</span>
              <span className="flex items-center gap-1 text-warm-secondary"><span className="w-3 h-3 bg-red-100 rounded border border-red-200 inline-block"></span> 🔴 = Minggu Libur/Ujian</span>
              <span className="flex items-center gap-1 text-green-600">✓ = Distribusi pas</span>
              <span className="flex items-center gap-1 text-red-500">✗ = Distribusi belum pas</span>
            </div>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-border text-center text-xs text-warm-text">
          <div>
            <p className="font-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Mengetahui,</p>
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

      {/* --- SECTION 6: ALUR TUJUAN PEMBELAJARAN (ATP) --- */}
      <section id="doc-atp" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border shadow-lg print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <Map className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
              ALUR TUJUAN PEMBELAJARAN (ATP)
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              RUNTUTAN LOGIS DAN LOGIKA CAPAIAN PEMBELAJARAN PER ELEMEN FASE {identitas.fase}
            </p>
          </div>

          {/* Visual Flow diagram representation for Assessment/Review */}
          <div className="bg-warm-bg p-6 rounded-2xl border border-warm-border print:bg-transparent">
            <h3 className="text-xs font-bold uppercase tracking-widest text-warm-secondary mb-4 flex items-center gap-1.5">
              <Milestone className="h-4 w-4 text-warm-muted" aria-hidden="true" />
              PETA LOGIKA ALUR PEMBELAJARAN (ALUR BERTAHAP)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {atp.map((item, idx) => (
                <div key={item.id} className="bg-warm-card p-4 rounded-xl border border-warm-border shadow-sm relative text-center">
                  <div className="absolute -top-3 left-4 bg-forest text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow">
                    {item.kode}
                  </div>
                  <h4 className="font-bold text-xs text-warm-text mt-2 block truncate">{item.elemen}</h4>
                  <p className="text-[11px] text-warm-secondary line-clamp-2 mt-2 leading-relaxed font-semibold">
                    {item.tujuanPembelajaran}
                  </p>
                  {idx < atp.length - 1 && (
                    <div className="hidden md:block absolute top-[50%] -right-3.5 bg-warm-border h-0.5 w-3.5 z-10"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Master ATP Table Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-warm-secondary">Integrasi ATP Spesifik Kurikulum Merdeka</h3>
            <div className="space-y-6">
              {atp.map((item) => (
                <div key={item.id} className="border border-warm-border rounded-3xl p-6 bg-warm-card space-y-4 shadow-sm hover:border-warm-border transition-all">
                  <div className="flex justify-between items-center border-b border-warm-border pb-3 flex-wrap gap-2">
                    <span className="font-mono font-bold text-forest bg-forest/10 px-3 py-1 rounded text-xs">
                      {item.kode} - Elemen: {item.elemen}
                    </span>
                    <span className="text-xs font-bold font-mono text-warm-secondary bg-warm-bg px-2 py-0.5 rounded border border-warm-border">
                      Alokasi: {item.alokasiWaktu} JP
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-warm-text text-xs text-left leading-relaxed">
                    <div>
                      <span className="text-[10px] font-bold text-warm-muted uppercase tracking-widest block mb-1">Capaian Pembelajaran (CP) Elemen</span>
                      <p className="p-3 bg-warm-bg/30 rounded-xl text-warm-secondary leading-relaxed font-medium">{item.capaianPembelajaran || "Terintregasi di kurikulum fase ini."}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-warm-muted uppercase tracking-widest block mb-1 font-semibold text-forest">Tujuan Pembelajaran (TP) Diturunkan</span>
                      <p className="font-bold text-warm-text leading-[1.4] text-sm">{item.tujuanPembelajaran}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-warm-muted uppercase tracking-widest block mb-1">Materi Pokok</span>
                        <p className="font-semibold text-warm-text">{item.materiPokok}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-warm-muted uppercase tracking-widest block mb-1">8 Dimensi Profil Lulusan</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.profilPelajarPancasila.map((pref, i) => (
                            <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded">
                              {pref}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {item.glosarium && (
                      <div className="pt-2 border-t border-warm-border">
                        <span className="text-[10px] font-bold text-warm-muted uppercase tracking-widest block mb-1">Glosarium Khusus</span>
                        <p className="text-warm-secondary italic text-[11px]">{item.glosarium}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end print:hidden">
                    <button
                      onClick={() => handleRemoveAtp(item.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold border border-red-200 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent"
                      aria-label="Hapus Alur TP"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Hapus Alur TP
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Add ATP Item (Hidden in Print) */}
            <form onSubmit={handleAddAtp} className="bg-warm-bg/50 p-6 rounded-3xl border border-warm-border flex flex-col gap-4 text-xs text-warm-text print:hidden mt-6">
              <h4 className="font-bold text-warm-text uppercase flex items-center gap-1">
                <Plus className="h-4 w-4 text-forest" aria-hidden="true" /> Daftarkan Alur Tujuan Baru (ATP)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="atp-kode" className="font-semibold text-warm-secondary">Kode Tujuan</label>
                  <input
                    id="atp-kode"
                    type="text"
                    required
                    placeholder="e.g. TP-BK-E.3"
                    value={newAtp.kode}
                    onChange={(e) => setNewAtp({ ...newAtp, kode: e.target.value })}
                    className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="atp-elemen" className="font-semibold text-warm-secondary">Elemen</label>
                  <input
                    type="text"
                    id="atp-elemen"
                    value={newAtp.elemen}
                    onChange={(e) => setNewAtp({ ...newAtp, elemen: e.target.value })}
                    placeholder="e.g. Berpikir Komputasional (BK)"
                    className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="atp-alokasi" className="font-semibold text-warm-secondary">Alokasi Waktu (JP)</label>
                  <input
                    id="atp-alokasi"
                    type="number"
                    value={newAtp.alokasiWaktu}
                    onChange={(e) => setNewAtp({ ...newAtp, alokasiWaktu: parseInt(e.target.value) || 2 })}
                    className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* 8 Dimensi Profil Lulusan - multi select */}
              <div className="space-y-2">
                <label className="font-semibold text-warm-secondary text-xs">8 Dimensi Profil Lulusan</label>
                <div className="flex flex-wrap gap-1.5">
                  {DIMENSI_PROFIL_LULUSAN.map((d) => {
                    const selected = newAtp.profilPelajarPancasila.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setNewAtp({
                            ...newAtp,
                            profilPelajarPancasila: selected
                              ? newAtp.profilPelajarPancasila.filter((p) => p !== d)
                              : [...newAtp.profilPelajarPancasila, d]
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          selected
                            ? "bg-forest text-white border-forest shadow-sm"
                            : "bg-warm-card text-warm-secondary border-warm-border hover:bg-warm-bg"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="atp-cp" className="font-semibold text-warm-secondary">Capaian Pembelajaran (CP) Elemen</label>
                  <textarea
                    id="atp-cp"
                    rows={2}
                    placeholder="Masukkan CP asal elemen..."
                    value={newAtp.capaianPembelajaran}
                    onChange={(e) => setNewAtp({ ...newAtp, capaianPembelajaran: e.target.value })}
                    className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="atp-tujuan" className="font-semibold text-warm-secondary">Tujuan Pembelajaran (TP) Hasil Analisis</label>
                  <textarea
                    id="atp-tujuan"
                    rows={2}
                    required
                    placeholder="Tuliskan tujuan instruksional spesifik yang ditargetkan..."
                    value={newAtp.tujuanPembelajaran}
                    onChange={(e) => setNewAtp({ ...newAtp, tujuanPembelajaran: e.target.value })}
                    className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="atp-materi" className="font-semibold text-warm-secondary">Materi Pokok</label>
                  <input
                    id="atp-materi"
                    type="text"
                    placeholder="e.g. Nesting IF - Else Code"
                    value={newAtp.materiPokok}
                    onChange={(e) => setNewAtp({ ...newAtp, materiPokok: e.target.value })}
                    className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="atp-glosarium" className="font-semibold text-warm-secondary">Glosarium Ringkas</label>
                  <input
                    id="atp-glosarium"
                    type="text"
                    placeholder="e.g. nested: struktur kondisi bersarang..."
                    value={newAtp.glosarium}
                    onChange={(e) => setNewAtp({ ...newAtp, glosarium: e.target.value })}
                    className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="self-end px-5 py-2 bg-forest hover:bg-forest/90 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent">
                <Plus className="h-4 w-4" aria-hidden="true" /> Daftarkan Alur TP
              </button>
            </form>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-border text-center text-xs text-warm-text">
          <div>
            <p className="font-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Menyetujui,</p>
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
