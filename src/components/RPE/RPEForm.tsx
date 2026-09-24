import React, { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Wand2, Download, Printer, Upload, FileSpreadsheet, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { RPERecord, RPEDetailBulan, RPEKegiatan, calculateTotals, useAutoSave, exportRPEToExcel, exportRPEToPrint, importRPEFromExcel } from "./RPEUtils";
import { apiFetch } from "../../api";

interface Props {
  rpe: RPERecord;
  onChange: (rpe: RPERecord) => void;
  onSave: (rpe: RPERecord) => void;
  guruOptions: { id: string; nama: string }[];
}

export default function RPEForm({ rpe, onChange, onSave, guruOptions }: Props) {
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAILoading] = useState(false);
  const [aiMessage, setAIMessage] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    info: true, pekan: true, kegiatan: true, hitung: true
  });
  const [importing, setImporting] = useState(false);

  useAutoSave(rpe, onSave, 1500);

  const totals = useMemo(() => calculateTotals(rpe.detailBulan, rpe.kegiatanTidakEfektif, rpe.jpPerMinggu), [rpe]);

  const updateField = useCallback(<K extends keyof RPERecord>(key: K, value: RPERecord[K]) => {
    onChange({ ...rpe, [key]: value, updatedAt: new Date().toISOString(), version: rpe.version + 1 });
  }, [rpe, onChange]);

  const updateBulan = useCallback((idx: number, val: number) => {
    const detail = [...rpe.detailBulan];
    detail[idx] = { ...detail[idx], jumlahPekan: Math.max(0, val) };
    onChange({ ...rpe, detailBulan: detail, updatedAt: new Date().toISOString(), version: rpe.version + 1 });
  }, [rpe, onChange]);

  const addKegiatan = useCallback(() => {
    const kegiatan = [...rpe.kegiatanTidakEfektif, {
      id: "kgt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      nama: "",
      jumlahPekan: 1,
    }];
    onChange({ ...rpe, kegiatanTidakEfektif: kegiatan, updatedAt: new Date().toISOString(), version: rpe.version + 1 });
  }, [rpe, onChange]);

  const updateKegiatan = useCallback((idx: number, field: "nama" | "jumlahPekan", value: string | number) => {
    const kegiatan = [...rpe.kegiatanTidakEfektif];
    (kegiatan[idx] as any)[field] = field === "jumlahPekan" ? Math.max(0, Number(value)) : value;
    onChange({ ...rpe, kegiatanTidakEfektif: kegiatan, updatedAt: new Date().toISOString(), version: rpe.version + 1 });
  }, [rpe, onChange]);

  const deleteKegiatan = useCallback((idx: number) => {
    const kegiatan = rpe.kegiatanTidakEfektif.filter((_, i) => i !== idx);
    onChange({ ...rpe, kegiatanTidakEfektif: kegiatan, updatedAt: new Date().toISOString(), version: rpe.version + 1 });
  }, [rpe, onChange]);

  const handleAIRecommend = async () => {
    setAILoading(true);
    setShowAI(true);
    try {
      const res = await apiFetch("/api/gemini/generate-rpe-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPekan: totals.totalPekan,
          totalTidakEfektif: totals.totalTidakEfektif,
          jpPerMinggu: rpe.jpPerMinggu,
          jamEfektif: totals.jamEfektif,
        }),
      });
      const data = await res.json();
      setAIMessage(data.recommendation || "Tidak ada rekomendasi.");
    } catch {
      setAIMessage("Gagal menghubungi AI. Coba lagi nanti.");
    } finally { setAILoading(false); }
  };

  const handleExportPrint = () => {
    const html = exportRPEToPrint(rpe, totals);
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const data = await importRPEFromExcel(file);
      const updated = { ...rpe };
      if (data.tahunAjaran) updated.tahunAjaran = data.tahunAjaran;
      if (data.kelas) updated.kelas = data.kelas;
      if (data.mataPelajaran) updated.mataPelajaran = data.mataPelajaran;
      if (data.guruNama) updated.guruNama = data.guruNama;
      if (data.semester) updated.semester = data.semester;
      if (data.detailBulan) updated.detailBulan = data.detailBulan;
      if (data.kegiatanTidakEfektif) updated.kegiatanTidakEfektif = data.kegiatanTidakEfektif;
      updated.updatedAt = new Date().toISOString();
      updated.version = rpe.version + 1;
      onChange(updated);
    } catch (err) { alert("Gagal import Excel: " + (err as Error).message); }
    finally { setImporting(false); e.target.value = ""; }
  };

  const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-5">
      {/* ─── TOOLBAR ─── */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <button onClick={handleExportPrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-forest text-white text-[10px] font-bold rounded-xl hover:brightness-110 transition-all cursor-pointer"><Printer className="h-3.5 w-3.5" /> Print</button>
        <button onClick={() => exportRPEToExcel(rpe, totals)} className="flex items-center gap-1.5 px-3 py-1.5 bg-forest text-white text-[10px] font-bold rounded-xl hover:brightness-110 transition-all cursor-pointer"><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</button>
        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-card border border-warm-border text-warm-secondary hover:bg-warm-bg text-[10px] font-bold rounded-xl transition-all cursor-pointer">
          <Upload className="h-3.5 w-3.5" /> Import Excel
          <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" disabled={importing} />
        </label>
        {importing && <span className="text-[10px] text-forest font-bold">Importing...</span>}
      </div>

      {/* ─── INFORMASI SEKOLAH ─── */}
      <div className="bg-warm-card border border-warm-border rounded-2xl shadow-sm overflow-hidden">
        <button onClick={() => toggleSection("info")} className="w-full flex items-center justify-between p-4 hover:bg-warm-bg/50 transition-colors cursor-pointer">
          <h3 className="text-sm font-bold text-warm-text">Informasi Sekolah</h3>
          {expandedSections.info ? <ChevronUp className="h-4 w-4 text-warm-secondary" /> : <ChevronDown className="h-4 w-4 text-warm-secondary" />}
        </button>
        {expandedSections.info && (
          <div className="px-4 pb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <label className="text-[10px] font-bold text-warm-secondary uppercase tracking-wider mb-1 block">Tahun Pelajaran</label>
              <input value={rpe.tahunAjaran} onChange={e => updateField("tahunAjaran", e.target.value)} placeholder="2026/2027" className="w-full px-3 py-2.5 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
            </div>
            <div className="relative">
              <label className="text-[10px] font-bold text-warm-secondary uppercase tracking-wider mb-1 block">Semester</label>
              <select value={rpe.semester} onChange={e => updateField("semester", e.target.value as any)} className="w-full px-3 py-2.5 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all">
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
            <div className="relative">
              <label className="text-[10px] font-bold text-warm-secondary uppercase tracking-wider mb-1 block">Kelas</label>
              <input value={rpe.kelas} onChange={e => updateField("kelas", e.target.value)} placeholder="VII-A" className="w-full px-3 py-2.5 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
            </div>
            <div className="relative">
              <label className="text-[10px] font-bold text-warm-secondary uppercase tracking-wider mb-1 block">Mata Pelajaran</label>
              <input value={rpe.mataPelajaran} onChange={e => updateField("mataPelajaran", e.target.value)} placeholder="Matematika" className="w-full px-3 py-2.5 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
            </div>
            <div className="relative">
              <label className="text-[10px] font-bold text-warm-secondary uppercase tracking-wider mb-1 block">Guru</label>
              <select value={rpe.guruNama} onChange={e => {
                const g = guruOptions.find(g => g.nama === e.target.value);
                updateField("guruNama", e.target.value);
                if (g) updateField("guruId", g.id);
              }} className="w-full px-3 py-2.5 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all">
                <option value="">Pilih Guru</option>
                {guruOptions.map(g => <option key={g.id} value={g.nama}>{g.nama}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ─── STATS CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Total Pekan</p>
          <p className="text-3xl font-bold mt-1">{totals.totalPekan}</p>
          <p className="text-[10px] mt-1 opacity-70">Pekan Semester</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Tidak Efektif</p>
          <p className="text-3xl font-bold mt-1">{totals.totalTidakEfektif}</p>
          <p className="text-[10px] mt-1 opacity-70">Pekan Tidak Efektif</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Pekan Efektif</p>
          <p className="text-3xl font-bold mt-1">{totals.totalEfektif}</p>
          <p className="text-[10px] mt-1 opacity-70">Pekan Efektif</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-4 text-white shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Jam Efektif</p>
          <p className="text-3xl font-bold mt-1">{totals.jamEfektif}</p>
          <p className="text-[10px] mt-1 opacity-70">JP × Pekan Efektif</p>
        </div>
      </div>

      {/* ─── BAGIAN 1: BANYAKNYA PEKAN ─── */}
      <div className="bg-warm-card border border-warm-border rounded-2xl shadow-sm overflow-hidden">
        <button onClick={() => toggleSection("pekan")} className="w-full flex items-center justify-between p-4 hover:bg-warm-bg/50 transition-colors cursor-pointer">
          <h3 className="text-sm font-bold text-warm-text">A. Banyaknya Pekan Semester</h3>
          {expandedSections.pekan ? <ChevronUp className="h-4 w-4 text-warm-secondary" /> : <ChevronDown className="h-4 w-4 text-warm-secondary" />}
        </button>
        {expandedSections.pekan && (
          <div className="px-4 pb-5">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-warm-border">
                    <th className="text-left py-2.5 px-3 font-bold text-warm-text w-12">No</th>
                    <th className="text-left py-2.5 px-3 font-bold text-warm-text">Bulan</th>
                    <th className="text-right py-2.5 px-3 font-bold text-warm-text w-32">Jumlah Pekan</th>
                  </tr>
                </thead>
                <tbody>
                  {rpe.detailBulan.map((b, i) => (
                    <tr key={b.bulan} className="border-b border-warm-border/50 hover:bg-warm-bg/30 transition-colors">
                      <td className="py-2 px-3 text-warm-secondary font-medium">{i + 1}</td>
                      <td className="py-2 px-3 font-medium text-warm-text">{b.bulan}</td>
                      <td className="py-2 px-3 text-right">
                        <input type="number" min={0} max={6} value={b.jumlahPekan}
                          onChange={e => updateBulan(i, Number(e.target.value))}
                          className="w-20 px-3 py-1.5 border border-warm-border rounded-lg bg-warm-bg text-sm text-right focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-forest/5 font-bold">
                    <td colSpan={2} className="py-2.5 px-3 text-warm-text">TOTAL</td>
                    <td className="py-2.5 px-3 text-right text-forest text-sm">{totals.totalPekan}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── BAGIAN 2: PEKAN TIDAK EFEKTIF ─── */}
      <div className="bg-warm-card border border-warm-border rounded-2xl shadow-sm overflow-hidden">
        <button onClick={() => toggleSection("kegiatan")} className="w-full flex items-center justify-between p-4 hover:bg-warm-bg/50 transition-colors cursor-pointer">
          <h3 className="text-sm font-bold text-warm-text">B. Pekan Tidak Efektif</h3>
          {expandedSections.kegiatan ? <ChevronUp className="h-4 w-4 text-warm-secondary" /> : <ChevronDown className="h-4 w-4 text-warm-secondary" />}
        </button>
        {expandedSections.kegiatan && (
          <div className="px-4 pb-5">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={addKegiatan} className="flex items-center gap-1.5 px-3 py-1.5 bg-forest hover:bg-forest-dark text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer"><Plus className="h-3.5 w-3.5" /> Tambah Kegiatan</button>
              <button onClick={handleAIRecommend} disabled={aiLoading} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50">
                <Wand2 className="h-3.5 w-3.5" /> {aiLoading ? "Memproses..." : "✨ Hitung Otomatis"}
              </button>
            </div>
            {showAI && aiMessage && (
              <div className="flex items-start gap-2 p-3 mb-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800">
                <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-purple-500" />
                <span>{aiMessage}</span>
                <button onClick={() => setShowAI(false)} className="ml-auto text-purple-400 hover:text-purple-600 cursor-pointer">&times;</button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-warm-border">
                    <th className="text-left py-2.5 px-3 font-bold text-warm-text w-12">No</th>
                    <th className="text-left py-2.5 px-3 font-bold text-warm-text">Nama Kegiatan</th>
                    <th className="text-right py-2.5 px-3 font-bold text-warm-text w-32">Jumlah Pekan</th>
                    <th className="text-center py-2.5 px-3 font-bold text-warm-text w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rpe.kegiatanTidakEfektif.map((k, i) => (
                    <tr key={k.id} className="border-b border-warm-border/50 hover:bg-warm-bg/30 transition-colors">
                      <td className="py-2 px-3 text-warm-secondary font-medium">{i + 1}</td>
                      <td className="py-2 px-3">
                        <input value={k.nama} onChange={e => updateKegiatan(i, "nama", e.target.value)}
                          placeholder="Nama kegiatan..." className="w-full px-2 py-1.5 border border-warm-border rounded-lg bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input type="number" min={0} max={12} value={k.jumlahPekan}
                          onChange={e => updateKegiatan(i, "jumlahPekan", Number(e.target.value))}
                          className="w-20 px-3 py-1.5 border border-warm-border rounded-lg bg-warm-bg text-sm text-right focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button onClick={() => deleteKegiatan(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="Hapus">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-red-50 font-bold">
                    <td colSpan={2} className="py-2.5 px-3 text-red-700">TOTAL</td>
                    <td className="py-2.5 px-3 text-right text-red-700 text-sm">{totals.totalTidakEfektif}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {totals.totalTidakEfektif > totals.totalPekan && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Pekan tidak efektif melebihi total pekan semester!
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── BAGIAN 3 & 4: PERHITUNGAN ─── */}
      <div className="bg-warm-card border border-warm-border rounded-2xl shadow-sm overflow-hidden">
        <button onClick={() => toggleSection("hitung")} className="w-full flex items-center justify-between p-4 hover:bg-warm-bg/50 transition-colors cursor-pointer">
          <h3 className="text-sm font-bold text-warm-text">C. Perhitungan Pekan & Jam Efektif</h3>
          {expandedSections.hitung ? <ChevronUp className="h-4 w-4 text-warm-secondary" /> : <ChevronDown className="h-4 w-4 text-warm-secondary" />}
        </button>
        {expandedSections.hitung && (
          <div className="px-4 pb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-xs font-semibold text-blue-700">Total Pekan Semester</span>
                  <span className="text-sm font-bold text-blue-800">{totals.totalPekan} pekan</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-xs font-semibold text-amber-700">Total Pekan Tidak Efektif</span>
                  <span className="text-sm font-bold text-amber-800">{totals.totalTidakEfektif} pekan</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs font-semibold text-emerald-700">Pekan Efektif</span>
                  <span className="text-base font-bold text-emerald-800">{totals.totalEfektif} pekan</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-warm-bg border border-warm-border rounded-xl">
                  <label className="text-[10px] font-bold text-warm-secondary uppercase tracking-wider block mb-1">JP per Minggu</label>
                  <input type="number" min={0} max={40} value={rpe.jpPerMinggu || ""}
                    onChange={e => updateField("jpPerMinggu", Math.max(0, Number(e.target.value)))}
                    placeholder="6" className="w-full px-3 py-2 border border-warm-border rounded-lg bg-white text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                </div>
                <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl border border-violet-100">
                  <span className="text-xs font-semibold text-violet-700">Jam Efektif</span>
                  <span className="text-base font-bold text-violet-800">{totals.jamEfektif} JP</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
