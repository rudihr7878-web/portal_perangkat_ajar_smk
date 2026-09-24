/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AdministrasiTahunState, AgendaSekolah, JadwalEntry } from "../types";
import { Calendar, Clock, Plus, Trash2, CalendarDays, ClipboardCheck } from "lucide-react";

interface Props {
  state: AdministrasiTahunState;
  onChange: (updater: (s: AdministrasiTahunState) => AdministrasiTahunState) => void;
}

export default function KalenderAkademikView({ state, onChange }: Props) {
  const { kalender, jadwal, identitas } = state;
  const [newAgenda, setNewAgenda] = useState({ tanggal: "", kegiatan: "", kategori: "akademik" as const });
  const [newJadwal, setNewJadwal] = useState({
    hari: "Senin" as const,
    jamKe: "I-II (07:00 - 08:30)",
    kelas: "X-A",
    mapel: identitas.mapel,
    alokasiWaktu: 2
  });

  const handleAddAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgenda.tanggal || !newAgenda.kegiatan) return;

    onChange((prev) => ({
      ...prev,
      kalender: {
        ...prev.kalender,
        agenda: [
          ...prev.kalender.agenda,
          { id: "ag_" + Date.now(), ...newAgenda }
        ].sort((a, b) => a.tanggal.localeCompare(b.tanggal))
      }
    }));
    setNewAgenda({ tanggal: "", kegiatan: "", kategori: "akademik" });
  };

  const handleRemoveAgenda = (id: string) => {
    onChange((prev) => ({
      ...prev,
      kalender: {
        ...prev.kalender,
        agenda: prev.kalender.agenda.filter((a) => a.id !== id)
      }
    }));
  };

  const handleAddJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    onChange((prev) => ({
      ...prev,
      jadwal: [
        ...prev.jadwal,
        { id: "jw_" + Date.now(), ...newJadwal }
      ]
    }));
  };

  const handleRemoveJadwal = (id: string) => {
    onChange((prev) => ({
      ...prev,
      jadwal: prev.jadwal.filter((j) => j.id !== id)
    }));
  };

  const updateEffectiveValues = (field: "hariEfektifGanjil" | "mingguEfektifGanjil" | "hariEfektifGenap" | "mingguEfektifGenap", value: number) => {
    onChange((prev) => ({
      ...prev,
      kalender: {
        ...prev.kalender,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-12">
      {/* --- SECTION 3: KALENDER PENDIDIKAN --- */}
      <section id="doc-kalender" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border shadow-lg print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-border pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <Calendar className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
              KALENDER PENDIDIKAN & RINCIAN PEKAN EFEKTIF
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              HARI EFEKTIF BELAJAR (HEB) DAN MINGGU EFEKTIF AJAR (MEA) TAHUN AJARAN {identitas.tahunAjaran}
            </p>
          </div>

          {/* Interactive HEB & MEA Cards (Printable) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-warm-bg p-6 rounded-2xl border border-warm-border text-warm-text">
              <h3 className="text-sm font-bold uppercase tracking-wider text-forest-dark mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                SEMESTER GANJIL (SEMESTER 1)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="hariEfektifGanjil" className="text-[10px] font-bold text-warm-secondary uppercase">Hari Efektif Belajar (HEB)</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="hariEfektifGanjil"
                      type="number"
                      value={kalender.hariEfektifGanjil}
                      onChange={(e) => updateEffectiveValues("hariEfektifGanjil", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-warm-card border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest text-sm font-bold print:border-none print:bg-transparent"
                    />
                    <span className="text-xs font-semibold text-warm-secondary">Hari</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="mingguEfektifGanjil" className="text-[10px] font-bold text-warm-secondary uppercase">Minggu Efektif Ajar (MEA)</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="mingguEfektifGanjil"
                      type="number"
                      value={kalender.mingguEfektifGanjil}
                      onChange={(e) => updateEffectiveValues("mingguEfektifGanjil", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-warm-card border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest text-sm font-bold print:border-none print:bg-transparent"
                    />
                    <span className="text-xs font-semibold text-warm-secondary">Minggu</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-warm-bg p-6 rounded-2xl border border-warm-border text-warm-text">
              <h3 className="text-sm font-bold uppercase tracking-wider text-forest-dark mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                SEMESTER GENAP (SEMESTER 2)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="hariEfektifGenap" className="text-[10px] font-bold text-warm-secondary uppercase">Hari Efektif Belajar (HEB)</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="hariEfektifGenap"
                      type="number"
                      value={kalender.hariEfektifGenap}
                      onChange={(e) => updateEffectiveValues("hariEfektifGenap", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-warm-card border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest text-sm font-bold print:border-none print:bg-transparent"
                    />
                    <span className="text-xs font-semibold text-warm-secondary">Hari</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="mingguEfektifGenap" className="text-[10px] font-bold text-warm-secondary uppercase">Minggu Efektif Ajar (MEA)</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="mingguEfektifGenap"
                      type="number"
                      value={kalender.mingguEfektifGenap}
                      onChange={(e) => updateEffectiveValues("mingguEfektifGenap", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-warm-card border border-warm-border rounded focus:outline-none focus:ring-1 focus:ring-forest text-sm font-bold print:border-none print:bg-transparent"
                    />
                    <span className="text-xs font-semibold text-warm-secondary">Minggu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agenda & Milestones Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-warm-secondary flex items-center gap-1.5">
                <ClipboardCheck className="h-4 w-4 text-warm-secondary" aria-hidden="true" />
                Daftar Milestones Belajar & Agenda Nasional
              </h3>
              <span className="text-xs text-warm-muted print:hidden">Urut berdasarkan tanggal</span>
            </div>

            <div className="overflow-x-auto border border-warm-border rounded-2xl">
              <table className="w-full text-left text-xs text-warm-text">
                <thead className="bg-warm-bg text-[10px] font-bold uppercase tracking-wider text-warm-secondary border-b border-warm-border">
                  <tr>
                    <th className="px-4 py-3 w-1/4">Tanggal</th>
                    <th className="px-4 py-3 w-7/12">Agenda / Kegiatan Sekolah</th>
                    <th className="px-4 py-3 w-2/12">Kategori</th>
                    <th className="px-4 py-3 w-1/12 text-center print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border">
                  {kalender.agenda.map((ag) => (
                    <tr key={ag.id} className="hover:bg-warm-bg/55 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-warm-text">{ag.tanggal}</td>
                      <td className="px-4 py-3 font-medium text-warm-text">{ag.kegiatan}</td>
                      <td className="px-4 py-3 capitalize">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          ag.kategori === "libur" ? "bg-red-50 text-red-700 border border-red-100" :
                          ag.kategori === "asesmen" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          ag.kategori === "akademik" ? "bg-forest/10 text-forest border border-forest/20" :
                          "bg-warm-bg text-warm-text border border-warm-border"
                        }`}>
                          {ag.kategori}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center print:hidden">
                        <button
                          onClick={() => handleRemoveAgenda(ag.id)}
                          className="p-1 hover:text-red-500 text-warm-secondary transition-colors focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer"
                          title="Hapus Agenda"
                          aria-label="Hapus agenda"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Form Agenda Baru (Hidden in Print) */}
            <form onSubmit={handleAddAgenda} className="bg-warm-bg/50 p-4 rounded-xl border border-warm-border flex flex-wrap gap-4 items-end text-xs text-warm-text print:hidden">
              <div className="flex-1 min-w-[140px] space-y-1">
                <label htmlFor="tanggalAgenda" className="font-semibold block text-warm-secondary">Tanggal</label>
                <input
                  id="tanggalAgenda"
                  type="date"
                  value={newAgenda.tanggal}
                  onChange={(e) => setNewAgenda({ ...newAgenda, tanggal: e.target.value })}
                  className="w-full px-3 py-1.5 bg-warm-card border border-warm-border rounded focus:outline-none"
                />
              </div>
              <div className="flex-[2] min-w-[200px] space-y-1">
                <label htmlFor="kegiatanAgenda" className="font-semibold block text-warm-secondary">Agenda / Kegiatan</label>
                <input
                  id="kegiatanAgenda"
                  type="text"
                  placeholder="e.g. Pembagian Raport Semester 1"
                  value={newAgenda.kegiatan}
                  onChange={(e) => setNewAgenda({ ...newAgenda, kegiatan: e.target.value })}
                  className="w-full px-3 py-1.5 bg-warm-card border border-warm-border rounded focus:outline-none"
                />
              </div>
              <div className="flex-1 min-w-[120px] space-y-1">
                <label htmlFor="kategoriAgenda" className="font-semibold block text-warm-secondary">Kategori</label>
                <select
                  id="kategoriAgenda"
                  value={newAgenda.kategori}
                  onChange={(e) => setNewAgenda({ ...newAgenda, kategori: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-warm-card border border-warm-border rounded focus:outline-none"
                >
                  <option value="akademik">Akademik</option>
                  <option value="libur">Libur Nasional</option>
                  <option value="asesmen">Asesmen/Ujian</option>
                  <option value="sekolah">Agenda Sekolah</option>
                </select>
              </div>
              <button type="submit" className="px-4 py-1.5 bg-forest-dark text-white rounded font-semibold hover:bg-forest-dark transition-colors flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer">
                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Tambah
              </button>
            </form>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-border text-center text-[11px] text-warm-secondary">
          <div>
            <p className="font-mono">SUPERVISI KEPALA SEKOLAH</p>
            <p className="mt-1">Dinyatakan layak supervisi secara akademik & terlegalisasi administrasi.</p>
          </div>
          <div>
            <p className="font-mono">VALIDASI ASESOR AKREDITASI</p>
            <p className="mt-1">Telah disesuaikan dengan Standar Pengelolaan Pendidikan nasional.</p>
          </div>
        </div>
      </section>

      <div className="print:page-break-after"></div>

      {/* --- SECTION 9: JADWAL MENGAJAR --- */}
      <section id="doc-jadwal" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border shadow-lg print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-border pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <Clock className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
              JADWAL MENGAJAR GURU (DISTRIBUSI JAM)
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              JADWAL MENGAJAR PER MINGGU GURU MATA PELAJARAN {identitas.mapel}
            </p>
          </div>

          <p className="text-xs text-warm-secondary leading-relaxed -mt-4 italic">
            Distribusi jam tatap muka disusun berpedoman pada struktur alokasi kurikulum Merdeka untuk menyokong sinkronisasi beban tugas minimal 24 JP per minggu.
          </p>

          <div className="overflow-x-auto border border-warm-border rounded-3xl mt-4">
            <table className="w-full text-left text-xs text-warm-text">
              <thead className="bg-warm-bg text-[10px] font-bold uppercase tracking-wider text-warm-secondary border-b border-warm-border">
                <tr>
                  <th className="px-6 py-3.5">Hari</th>
                  <th className="px-6 py-3.5">Interval Pembingkaian Jam</th>
                  <th className="px-6 py-3.5">Kelas</th>
                  <th className="px-6 py-3.5">Mata Pelajaran</th>
                  <th className="px-6 py-3.5 text-center">Durasi (JP)</th>
                  <th className="px-6 py-3.5 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {jadwal.map((jw) => (
                  <tr key={jw.id} className="hover:bg-warm-bg/55 transition-colors font-medium">
                    <td className="px-6 py-3.5 text-warm-text font-bold">{jw.hari}</td>
                    <td className="px-6 py-3.5 font-mono text-warm-secondary">{jw.jamKe}</td>
                    <td className="px-6 py-3.5 font-bold text-forest">{jw.kelas}</td>
                    <td className="px-6 py-3.5 text-warm-text">{jw.mapel}</td>
                    <td className="px-6 py-3.5 text-center text-warm-text font-bold bg-warm-bg/40">{jw.alokasiWaktu} JP</td>
                    <td className="px-6 py-3.5 text-center print:hidden">
                      <button
                        onClick={() => handleRemoveJadwal(jw.id)}
                        className="p-1 hover:text-red-500 text-warm-secondary transition-colors focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer"
                        title="Hapus Jadwal"
                        aria-label="Hapus jadwal"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form Create Jadwal Baru (Hidden in Print) */}
          <form onSubmit={handleAddJadwal} className="bg-warm-bg/50 p-5 rounded-2xl border border-warm-border flex flex-wrap gap-4 items-end text-xs text-warm-text print:hidden">
            <div className="flex-1 min-w-[110px] space-y-1">
              <label htmlFor="hariJadwal" className="font-semibold block text-warm-secondary">Hari</label>
              <select
                id="hariJadwal"
                value={newJadwal.hari}
                onChange={(e) => setNewJadwal({ ...newJadwal, hari: e.target.value as any })}
                className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
              >
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
              </select>
            </div>
            <div className="flex-2 min-w-[150px] space-y-1">
              <label htmlFor="jamKeJadwal" className="font-semibold block text-warm-secondary">Jam Ke / Waktu</label>
              <input
                id="jamKeJadwal"
                type="text"
                placeholder="e.g. III-IV (08.30 - 10.00)"
                value={newJadwal.jamKe}
                onChange={(e) => setNewJadwal({ ...newJadwal, jamKe: e.target.value })}
                className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
              />
            </div>
            <div className="flex-1 min-w-[90px] space-y-1">
              <label htmlFor="kelasJadwal" className="font-semibold block text-warm-secondary">Kelas</label>
              <input
                id="kelasJadwal"
                type="text"
                placeholder="e.g. X-A"
                value={newJadwal.kelas}
                onChange={(e) => setNewJadwal({ ...newJadwal, kelas: e.target.value })}
                className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
              />
            </div>
            <div className="flex-2 min-w-[150px] space-y-1">
              <label htmlFor="mapelJadwal" className="font-semibold block text-warm-secondary">Mata Pelajaran</label>
              <input
                id="mapelJadwal"
                type="text"
                value={newJadwal.mapel}
                onChange={(e) => setNewJadwal({ ...newJadwal, mapel: e.target.value })}
                className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
              />
            </div>
            <div className="flex-1 min-w-[80px] space-y-1">
              <label htmlFor="alokasiJadwal" className="font-semibold block text-warm-secondary">Alokasi JP</label>
              <input
                id="alokasiJadwal"
                type="number"
                value={newJadwal.alokasiWaktu}
                onChange={(e) => setNewJadwal({ ...newJadwal, alokasiWaktu: parseInt(e.target.value) || 2 })}
                className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg focus:outline-none"
              />
            </div>
            <button type="submit" className="px-5 py-2 bg-forest hover:bg-forest-dark text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer">
              <Plus className="h-4 w-4" aria-hidden="true" /> Pasang Jadwal
            </button>
          </form>
        </div>

        {/* Tanda Tangan Pengesahan (Printable) */}
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-border text-center text-xs text-warm-text">
          <div className="space-y-12">
            <div>
              <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest">Mengesahkan,</p>
              <p className="font-bold text-warm-text text-xs">Wakasek Kurikulum</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-warm-text underline text-xs">Ahmad Subardjo, M.Pd.</p>
              <p className="text-[10px] text-warm-muted">NIP. 19780521 200203 1 004</p>
            </div>
          </div>
          <div className="space-y-12">
            <div>
              <p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest">Petugas Pembuat Jadwal,</p>
              <p className="font-bold text-warm-text text-xs">Staff Kurikulum / Operator</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-warm-text underline text-xs">Siti Khadijah, S.Kom.</p>
              <p className="text-[10px] text-warm-muted">NUPTK. 405625110190</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
