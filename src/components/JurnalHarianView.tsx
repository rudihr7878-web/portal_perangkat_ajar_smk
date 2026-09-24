/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { JurnalHarianEntry, AdministrasiTahunState } from "../types";
import { BookOpen, Plus, Trash2, ClipboardList, PenTool } from "lucide-react";

interface Props {
  state: AdministrasiTahunState;
  onChange: (updater: (s: AdministrasiTahunState) => AdministrasiTahunState) => void;
}

export default function JurnalHarianView({ state, onChange }: Props) {
  const { jurnal, identitas } = state;
  const [newEntry, setNewEntry] = useState({
    hariTanggal: "",
    kelas: "X-A",
    jamKe: "I-II (07:00 - 08:30)",
    materiPokok: "",
    indikatorKetercapaian: "",
    kehadiranSiswa: { hadir: 36, sakit: [] as string[], izin: [] as string[], alfa: [] as string[] },
    kendala: "",
    tindakLanjut: ""
  });

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.hariTanggal || !newEntry.materiPokok) return;

    onChange((prev) => ({
      ...prev,
      jurnal: [
        ...prev.jurnal,
        { id: "jr_" + Date.now(), ...newEntry }
      ].sort((a, b) => b.hariTanggal.localeCompare(a.hariTanggal))
    }));

    setNewEntry({
      hariTanggal: "",
      kelas: "X-A",
      jamKe: "I-II (07:00 - 08:30)",
      materiPokok: "",
      indikatorKetercapaian: "",
      kehadiranSiswa: { hadir: 36, sakit: [], izin: [], alfa: [] },
      kendala: "",
      tindakLanjut: ""
    });
  };

  const handleRemoveEntry = (id: string) => {
    onChange((prev) => ({
      ...prev,
      jurnal: prev.jurnal.filter((j) => j.id !== id)
    }));
  };

  const updateEntryField = (id: string, field: keyof JurnalHarianEntry, val: any) => {
    onChange((prev) => ({
      ...prev,
      jurnal: prev.jurnal.map((entry) => {
        if (entry.id === id) {
          return { ...entry, [field]: val };
        }
        return entry;
      })
    }));
  };

  return (
    <div className="space-y-12">
      {/* --- SECTION 8: JURNAL HARIAN GURU --- */}
      <section id="doc-jurnal" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border shadow-lg print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
              JURNAL HARIAN AGENDA MENGAJAR GURU
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              REKAMAN AKTIVITAS REALISTIS PENYELENGGARAAN KELAS KORIDOR DEEP LEARNING - TAHUN AJARAN {identitas.tahunAjaran}
            </p>
          </div>

          <p className="text-xs text-warm-secondary leading-relaxed -mt-4 italic">
            Dokumen ini diisi secara konsisten oleh guru pembina sehabis tatap muka selesai, memuat catatan hambatan belajar anak serta rencana restorasi penyederhanaan logika kelas di sesi tindak lanjut.
          </p>

          <div className="space-y-6">
            {jurnal.map((entry) => (
              <div key={entry.id} className="border border-warm-border rounded-3xl p-6 bg-warm-card space-y-4 shadow-sm relative hover:border-forest/20 transition-all">
                {/* Delete button top right */}
                <button
                  onClick={() => handleRemoveEntry(entry.id)}
                  className="absolute top-6 right-6 p-1 hover:text-red-500 text-warm-muted transition-colors print:hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent"
                  title="Hapus Catatan Jurnal"
                  aria-label="Hapus catatan jurnal"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>

                <div className="flex justify-between items-center border-b border-warm-bg pb-3 flex-wrap gap-4">
                  <span className="font-mono font-bold text-forest bg-forest/10 px-3 py-1 rounded text-xs">
                    {entry.hariTanggal} • Kelas: {entry.kelas} • Jam Ke: {entry.jamKe}
                  </span>
                  <span className="text-[10px] font-bold text-warm-secondary bg-warm-bg border border-warm-border px-2 py-0.5 rounded">
                    Kehadiran: Hadir ({entry.kehadiranSiswa.hadir}), Sakit ({entry.kehadiranSiswa.sakit.length}), Izin ({entry.kehadiranSiswa.izin.length}), Alfa ({entry.kehadiranSiswa.alfa.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-warm-text">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] font-bold text-warm-muted uppercase tracking-wider block">Materi Pokok Pembahasan</span>
                      <input
                        type="text"
                        value={entry.materiPokok}
                        onChange={(e) => updateEntryField(entry.id, "materiPokok", e.target.value)}
                        className="w-full bg-transparent font-bold text-warm-text border-b border-transparent hover:border-warm-border focus:border-forest focus:outline-none mt-0.5 py-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-warm-muted uppercase tracking-wider block">Indikator Ketercapaian TP</span>
                      <input
                        type="text"
                        value={entry.indikatorKetercapaian}
                        onChange={(e) => updateEntryField(entry.id, "indikatorKetercapaian", e.target.value)}
                        className="w-full bg-transparent font-medium text-warm-text border-b border-transparent hover:border-warm-border focus:border-forest focus:outline-none mt-0.5 py-0.5"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] font-bold text-warm-muted uppercase tracking-wider block">Kendala / Hambatan Belajar Siswa</span>
                      <input
                        type="text"
                        value={entry.kendala}
                        onChange={(e) => updateEntryField(entry.id, "kendala", e.target.value)}
                        className="w-full bg-transparent font-semibold text-red-700 border-b border-transparent hover:border-red-200 focus:border-red-500 focus:outline-none mt-0.5 py-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-warm-muted uppercase tracking-wider block">Rencana Tindak Lanjut (Restoratif)</span>
                      <input
                        type="text"
                        value={entry.tindakLanjut}
                        onChange={(e) => updateEntryField(entry.id, "tindakLanjut", e.target.value)}
                        className="w-full bg-transparent font-bold text-emerald-800 border-b border-transparent hover:border-emerald-200 focus:border-emerald-500 focus:outline-none mt-0.5 py-0.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Jurnal Entry Baru (Hidden in Print) */}
          <form onSubmit={handleAddEntry} className="bg-warm-bg p-6 rounded-3xl border border-warm-border flex flex-col gap-4 text-xs text-warm-text print:hidden mt-6">
            <h4 className="font-bold text-warm-text uppercase flex items-center gap-1">
              <PenTool className="h-4 w-4 text-forest" aria-hidden="true" /> Tambah Catatan Harian Guru Baru
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label htmlFor="new-hariTanggal" className="font-semibold text-warm-secondary">Tanggal Sesi</label>
                <input
                  id="new-hariTanggal"
                  type="date"
                  required
                  value={newEntry.hariTanggal}
                  onChange={(e) => setNewEntry({ ...newEntry, hariTanggal: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="new-kelas" className="font-semibold text-warm-secondary">Kelas</label>
                <input
                  id="new-kelas"
                  type="text"
                  value={newEntry.kelas}
                  onChange={(e) => setNewEntry({ ...newEntry, kelas: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="new-jamKe" className="font-semibold text-warm-secondary">Jam Mengajar</label>
                <input
                  id="new-jamKe"
                  type="text"
                  value={newEntry.jamKe}
                  onChange={(e) => setNewEntry({ ...newEntry, jamKe: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="new-materiPokok" className="font-semibold text-warm-secondary">Materi Pokok Pembahasan</label>
                <input
                  id="new-materiPokok"
                  type="text"
                  required
                  placeholder="e.g. Kondisional IF Bersarang (Nested IF)"
                  value={newEntry.materiPokok}
                  onChange={(e) => setNewEntry({ ...newEntry, materiPokok: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="new-indikator" className="font-semibold text-warm-secondary">Indikator Pemfokusan TP</label>
                <input
                  id="new-indikator"
                  type="text"
                  placeholder="e.g. 90% siswa tuntas menguji eror logika kelistrikan kalkulator..."
                  value={newEntry.indikatorKetercapaian}
                  onChange={(e) => setNewEntry({ ...newEntry, indikatorKetercapaian: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="new-kendala" className="font-semibold text-warm-secondary text-red-600">Kendala Belajar</label>
                <input
                  id="new-kendala"
                  type="text"
                  placeholder="e.g. 5 siswa kesulitan mengurut percabangan bertingkat."
                  value={newEntry.kendala}
                  onChange={(e) => setNewEntry({ ...newEntry, kendala: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="new-tindakLanjut" className="font-semibold text-warm-secondary text-emerald-700">Rencana Tindak Lanjut</label>
                <input
                  id="new-tindakLanjut"
                  type="text"
                  placeholder="e.g. Memberikan pendampingan tambahan (scaffolding) luring."
                  value={newEntry.tindakLanjut}
                  onChange={(e) => setNewEntry({ ...newEntry, tindakLanjut: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <button type="submit" className="self-end px-5 py-2 bg-forest hover:bg-forest/90 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent">
              <Plus className="h-4 w-4" aria-hidden="true" /> Daftarkan Hari Ini
            </button>
          </form>
        </div>

        {/* Footnotes */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-bg text-center text-xs text-warm-text">
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
    </div>
  );
}
