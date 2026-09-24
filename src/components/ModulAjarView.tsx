/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ModulAjar, AdministrasiTahunState } from "../types";
import { BookOpen, Sparkles, Wand2, ShieldAlert, Check, HelpCircle, ArrowRight, Save } from "lucide-react";

interface Props {
  state: AdministrasiTahunState;
  onChange: (updater: (s: AdministrasiTahunState) => AdministrasiTahunState) => void;
}

export default function ModulAjarView({ state, onChange }: Props) {
  const [activeModulIndex, setActiveModulIndex] = useState(0);
  const { modul: modulList, identitas } = state;
  const modul = modulList[activeModulIndex] || modulList[0] || null;
  const [isKoreksiLoading, setIsKoreksiLoading] = useState(false);
  const [koreksiSemester, setKoreksiSemester] = useState<"1" | "2">("1");
  const [koreksiResult, setKoreksiResult] = useState<{
    totalModulJP: number; totalPromesJP: number; jpMatch: boolean;
    modulReports: { index: number; tema: string; completeness: number; missingFields: string[]; fieldStatus: Record<string, boolean> }[];
    tpCoverage: { total: number; covered: number; detail: { kode: string; tp: string; covered: boolean }[] };
    summary: string;
  } | null>(null);
  const [canvasStep, setCanvasStep] = useState(0);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>({
    pengetahuan: false, keterampilan: false, sikap: false,
    kolaborasi: false, kreativitas: false, refleksi: false
  });
  const [isRubrikLoading, setIsRubrikLoading] = useState(false);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<{ scores: Record<string, number>; total: number; suggestions: string[] } | null>(null);
  const [showMdPreview, setShowMdPreview] = useState(false);
  const [showAtpPicker, setShowAtpPicker] = useState(false);
  const [experienceContents, setExperienceContents] = useState<Record<string, string>>({});
  const [isGeneratingExp, setIsGeneratingExp] = useState<string | null>(null);
  const [generatedExpToast, setGeneratedExpToast] = useState<string | null>(null);

  const experiences = [
    { id: "observasi", label: "Observasi", desc: "Mengamati fenomena nyata", icon: "🔍" },
    { id: "diskusi", label: "Diskusi", desc: "Dialog kelompok terstruktur", icon: "💬" },
    { id: "praktik", label: "Praktik", desc: "Latihan langsung keterampilan", icon: "🔧" },
    { id: "eksperimen", label: "Eksperimen", desc: "Uji coba dan pembuktian", icon: "🧪" },
    { id: "presentasi", label: "Presentasi", desc: "Paparan hasil kerja", icon: "📢" },
    { id: "proyek", label: "Proyek", desc: "Tugas kompleks terpadu", icon: "📁" },
    { id: "simulasi", label: "Simulasi", desc: "Peran dan skenario tiruan", icon: "🎭" },
  ];

  const EXPERIENCE_MAP: Record<string, { section: "mindfulEngagement" | "deepProcessing" | "transferOfLearning"; text: string }> = {
    observasi: { section: "mindfulEngagement", text: "Observasi fenomena nyata terkait materi" },
    diskusi: { section: "deepProcessing", text: "Diskusi kelompok terstruktur untuk menganalisis topik" },
    praktik: { section: "transferOfLearning", text: "Praktik langsung keterampilan yang dipelajari" },
    eksperimen: { section: "deepProcessing", text: "Eksperimen untuk menguji hipotesis dan menemukan pola" },
    presentasi: { section: "transferOfLearning", text: "Presentasi hasil kerja individu/kelompok" },
    proyek: { section: "deepProcessing", text: "Proyek terpadu untuk mengaplikasikan pemahaman" },
    simulasi: { section: "mindfulEngagement", text: "Simulasi peran untuk memahami konteks nyata" },
  };

  const handleAddModul = () => {
    const emptyModul: ModulAjar = {
      id: "m_" + Date.now(),
      temaModul: "Modul Baru",
      temuKe: "",
      alokasiWaktu: "",
      kompetensiAwal: "",
      profilPancasila: [],
      saranaPrasarana: "",
      targetPesertaDidik: "",
      modelPembelajaran: "",
      tujuanPembelajaran: "",
      pemahamanBermakna: "",
      pertanyaanPemantik: "",
      kegiatanPembelajaran: {
        pendahuluan: ["", "", ""],
        intiDeepLearning: {
          mindfulEngagement: ["", "", ""],
          deepProcessing: ["", "", ""],
          transferOfLearning: ["", "", ""]
        },
        penutup: ["", "", ""]
      },
      aksesmen: { diagnostik: "", formatif: "", sumatif: "" },
      diferensiasi: { konten: "", proses: "", produk: "" },
      refleksiGuru: "",
      refleksiSiswa: ""
    };
    onChange((prev) => ({
      ...prev,
      modul: [...prev.modul, emptyModul]
    }));
    setActiveModulIndex(modulList.length);
  };

  const handleRemoveModul = (idx: number) => {
    if (modulList.length <= 1) return;
    onChange((prev) => ({
      ...prev,
      modul: prev.modul.filter((_, i) => i !== idx)
    }));
    if (activeModulIndex >= idx) {
      setActiveModulIndex(Math.max(0, activeModulIndex - 1));
    }
  };

  const handleUpdateModul = (field: keyof ModulAjar, value: any) => {
    onChange((prev) => ({
      ...prev,
      modul: prev.modul.map((m, i) =>
        i === activeModulIndex ? { ...m, [field]: value } : m
      )
    }));
  };

  const handleUpdateNestedList = (section: "intiDeepLearning" | "pendahuluan" | "penutup", subsect: string | null, index: number, value: string) => {
    onChange((prev) => {
      const targetModul = { ...(prev.modul[activeModulIndex] || prev.modul[0]) };
      if (section === "intiDeepLearning" && subsect) {
        const target = targetModul.kegiatanPembelajaran.intiDeepLearning[subsect as "mindfulEngagement" | "deepProcessing" | "transferOfLearning"];
        const next = [...target];
        next[index] = value;
        targetModul.kegiatanPembelajaran = {
          ...targetModul.kegiatanPembelajaran,
          intiDeepLearning: {
            ...targetModul.kegiatanPembelajaran.intiDeepLearning,
            [subsect]: next
          }
        };
      } else {
        const target = targetModul.kegiatanPembelajaran[section as "pendahuluan" | "penutup"];
        const next = [...target];
        next[index] = value;
        targetModul.kegiatanPembelajaran = {
          ...targetModul.kegiatanPembelajaran,
          [section]: next
        };
      }
      return {
        ...prev,
        modul: prev.modul.map((m, i) => i === activeModulIndex ? targetModul : m)
      };
    });
  };

  const handleKoreksiModul = async () => {
    setIsKoreksiLoading(true);
    setKoreksiResult(null);
    try {
      const res = await fetch("/api/gemini/koreksi-modul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduls: modulList,
          promes: state.promes,
          atp: state.atp,
          mapel: identitas.mapel,
          semester: koreksiSemester,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setKoreksiResult(data.result);
      } else {
        console.error("Koreksi gagal:", data.error);
      }
    } catch (err: any) {
      console.error("Koreksi Modul Error:", err);
    } finally {
      setIsKoreksiLoading(false);
    }
  };

  const handleGenerateOneExperience = async (expId: string) => {
    if (!modul) return;
    setIsGeneratingExp(expId);
    try {
      const res = await fetch("/api/gemini/generate-aktivitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experience: expId, temaModul: modul.temaModul, mapel: identitas.mapel }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        setExperienceContents((prev) => ({ ...prev, [expId]: data.text }));
        setGeneratedExpToast(expId);
        setTimeout(() => setGeneratedExpToast((prev) => prev === expId ? null : prev), 2000);
      }
    } catch (e) {
      console.error("Generate experience error:", e);
    } finally {
      setIsGeneratingExp(null);
    }
  };

  const handleSaveAktivitas = () => {
    if (!modul || selectedExperiences.length === 0) return;
    const newArrays = {
      mindfulEngagement: [...modul.kegiatanPembelajaran.intiDeepLearning.mindfulEngagement],
      deepProcessing: [...modul.kegiatanPembelajaran.intiDeepLearning.deepProcessing],
      transferOfLearning: [...modul.kegiatanPembelajaran.intiDeepLearning.transferOfLearning],
    };
    selectedExperiences.forEach((expId) => {
      const content = experienceContents[expId];
      if (!content || !content.trim()) return;
      const mapping = EXPERIENCE_MAP[expId];
      if (!mapping) return;
      const arr = newArrays[mapping.section];
      const emptyIdx = arr.findIndex((s) => !s.trim());
      if (emptyIdx !== -1) {
        arr[emptyIdx] = content;
      } else {
        arr.push(content);
      }
    });
    onChange((prev) => ({
      ...prev,
      modul: prev.modul.map((m, i) =>
        i === activeModulIndex
          ? {
              ...m,
              kegiatanPembelajaran: {
                ...m.kegiatanPembelajaran,
                intiDeepLearning: {
                  ...m.kegiatanPembelajaran.intiDeepLearning,
                  mindfulEngagement: newArrays.mindfulEngagement,
                  deepProcessing: newArrays.deepProcessing,
                  transferOfLearning: newArrays.transferOfLearning,
                },
              },
            }
          : m
      ),
    }));
    setExperienceContents({});
  };

  const handleGenerateRubrik = async () => {
    if (!modul) return;
    setIsRubrikLoading(true);
    try {
      const res = await fetch("/api/gemini/generate-rubrik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modul, mapel: identitas.mapel }),
      });
      const data = await res.json();
      if (data.success && data.rubrik) {
        onChange((prev) => ({
          ...prev,
          modul: prev.modul.map((m, i) =>
            i === activeModulIndex
              ? {
                  ...m,
                  aksesmen: {
                    diagnostik: data.rubrik.diagnostik || m.aksesmen.diagnostik,
                    formatif: data.rubrik.formatif || m.aksesmen.formatif,
                    sumatif: data.rubrik.sumatif || m.aksesmen.sumatif,
                  },
                }
              : m
          ),
        }));
      }
    } catch (e) {
      console.error("Rubrik error:", e);
    } finally {
      setIsRubrikLoading(false);
    }
  };

  const handleReviewModul = async () => {
    if (!modul) return;
    setIsReviewLoading(true);
    try {
      const res = await fetch("/api/gemini/review-modul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modul, mapel: identitas.mapel }),
      });
      const data = await res.json();
      if (data.success && data.review) {
        setReviewResult(data.review);
      }
    } catch (e) {
      console.error("Review error:", e);
    } finally {
      setIsReviewLoading(false);
    }
  };

  const computeScores = (m: typeof modul): { label: string; score: number; key: string }[] => {
    if (!m) return [];
    return [
      { label: "Identitas & Tujuan", key: "identitas", score: [
        m.temaModul, m.alokasiWaktu, m.targetPesertaDidik, m.modelPembelajaran,
        m.temuKe, m.tujuanPembelajaran
      ].filter(Boolean).length / 6 * 100 },
      { label: "Pemahaman & Pemantik", key: "pemantik", score: [
        m.kompetensiAwal, m.pemahamanBermakna, m.pertanyaanPemantik
      ].filter(Boolean).length / 3 * 100 },
      { label: "Mindful (Fokus)", key: "mindful", score: m.kegiatanPembelajaran.intiDeepLearning.mindfulEngagement.filter(Boolean).length / 3 * 100 },
      { label: "Meaningful (Pemahaman)", key: "meaningful", score: m.kegiatanPembelajaran.intiDeepLearning.deepProcessing.filter(Boolean).length / 3 * 100 },
      { label: "Joyful & Penutup", key: "joyful", score: (m.kegiatanPembelajaran.intiDeepLearning.transferOfLearning.filter(Boolean).length + m.kegiatanPembelajaran.penutup.filter(Boolean).length) / 6 * 100 },
      { label: "Asesmen", key: "asesmen", score: [m.aksesmen.diagnostik, m.aksesmen.formatif, m.aksesmen.sumatif].filter(Boolean).length / 3 * 100 },
      { label: "Diferensiasi", key: "diferensiasi", score: [m.diferensiasi.konten, m.diferensiasi.proses, m.diferensiasi.produk].filter(Boolean).length / 3 * 100 },
    ];
  };

  const renderMarkdown = (text: string): string => {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code class='bg-warm-bg px-1 rounded text-forest'>$1</code>");
    const lines = html.split("\n");
    let result = "", inUl = false, inOl = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const ulMatch = line.match(/^-\s+(.+)/);
      const olMatch = line.match(/^\d+[.)]\s+(.+)/);
      if (ulMatch) {
        if (inOl) { result += "</ol>"; inOl = false; }
        if (!inUl) { result += "<ul class='list-disc pl-4 space-y-0.5'>"; inUl = true; }
        result += `<li>${ulMatch[1]}</li>`;
      } else if (olMatch) {
        if (inUl) { result += "</ul>"; inUl = false; }
        if (!inOl) { result += "<ol class='list-decimal pl-4 space-y-0.5'>"; inOl = true; }
        result += `<li>${olMatch[1]}</li>`;
      } else {
        if (inUl) { result += "</ul>"; inUl = false; }
        if (inOl) { result += "</ol>"; inOl = false; }
        if (line.trim() === "") {
          result += "</p><p>";
        } else {
          result += (i > 0 && lines[i - 1].trim() !== "" && !lines[i - 1].match(/^[-*]\s/) && !lines[i - 1].match(/^\d+[.)]\s/) ? "<br/>" : "") + line;
        }
      }
    }
    if (inUl) result += "</ul>";
    if (inOl) result += "</ol>";
    return `<p>${result}</p>`;
  };

  return (
    <div className="space-y-12">
      {/* AI Assistant: Koreksi Modul Ajar (Hidden in Print) */}
      <div className="bg-warm-bg p-6 rounded-3xl shadow-sm border border-forest/20 print:hidden">
        <h3 className="text-lg font-bold text-warm-text flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-forest animate-pulse" aria-hidden="true" />
          AI Assistant: Koreksi Seluruh Modul Ajar
        </h3>
        <p className="text-xs text-warm-secondary mt-1 max-w-2xl leading-relaxed">
          Koreksi menyeluruh per semester meliputi 3 kriteria: <strong>kelengkapan isian</strong> tiap step Modul Ajar,
          kesesuaian <strong>total Jam Pelajaran (JP)</strong> dengan PROMES, serta memastikan seluruh
          <strong> Tujuan Pembelajaran (TP)</strong> dari ATP sudah terakomodir.
        </p>

        <div className="flex gap-6 mt-4 items-center flex-wrap">
          <div className="flex items-center gap-2 bg-warm-card px-4 py-2 rounded-xl border border-warm-border">
            <span className="text-xs font-bold text-warm-secondary">Semester:</span>
            <select
              value={koreksiSemester}
              onChange={(e) => setKoreksiSemester(e.target.value as "1" | "2")}
              className="text-xs font-bold text-warm-text bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="1">Semester 1 (Ganjil)</option>
              <option value="2">Semester 2 (Genap)</option>
            </select>
          </div>
          <button
            onClick={handleKoreksiModul}
            disabled={isKoreksiLoading}
            className="px-5 py-2 bg-forest hover:bg-forest/90 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-accent"
            aria-label="Koreksi Sekarang"
          >
            <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
            {isKoreksiLoading ? "Mengoreksi..." : "Koreksi Sekarang"}
          </button>
        </div>

        {koreksiResult && (
          <div className="mt-4 space-y-4">
            {/* Ringkasan JP */}
            <div className="flex items-center gap-3 p-3 bg-warm-card rounded-xl border border-warm-border">
              <span className="text-lg" role="img" aria-label="JP">{koreksiResult.jpMatch ? "✅" : "⚠️"}</span>
              <div className="text-xs">
                <span className="font-bold text-warm-text">Total JP Modul: {koreksiResult.totalModulJP} JP</span>
                <span className="text-warm-muted mx-1">vs</span>
                <span className="font-bold text-warm-text">PROMES: {koreksiResult.totalPromesJP} JP</span>
                <span className="ml-2 font-semibold text-warm-text">
                  {koreksiResult.jpMatch
                    ? "✓ Sesuai"
                    : `✗ Tidak sesuai (selisih ${Math.abs(koreksiResult.totalModulJP - koreksiResult.totalPromesJP)} JP)`}
                </span>
              </div>
            </div>

            {/* TP Coverage */}
            <div className="flex items-center gap-3 p-3 bg-warm-card rounded-xl border border-warm-border">
              <span className="text-lg" role="img" aria-label="TP">🎯</span>
              <div className="text-xs flex-1">
                <span className="font-bold text-warm-text">
                  Cakupan TP: {koreksiResult.tpCoverage.covered}/{koreksiResult.tpCoverage.total} ATP terakomodir
                </span>
                {koreksiResult.tpCoverage.detail.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {koreksiResult.tpCoverage.detail.map((td, i) => (
                      <span key={i}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          td.covered ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {td.covered ? "✓" : "✗"} {td.kode || `TP ${i + 1}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Per-Modul Reports */}
            {koreksiResult.modulReports.map((report) => (
              <div key={report.index} className="bg-warm-card rounded-xl border border-warm-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-warm-text flex items-center gap-2">
                    📘 Modul {report.index + 1}: {report.tema}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    report.completeness >= 80
                      ? "bg-emerald-50 text-emerald-700"
                      : report.completeness >= 50
                      ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                  }`}>
                    {report.completeness}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-warm-bg rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      report.completeness >= 80
                        ? "bg-emerald-500"
                        : report.completeness >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${report.completeness}%` }}
                  />
                </div>
                {/* Missing fields badges */}
                {report.missingFields.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="text-[10px] font-semibold text-warm-muted">❌ Belum diisi:</span>
                    {report.missingFields.slice(0, 6).map((f, i) => (
                      <span key={i} className="inline-flex px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold">
                        {f}
                      </span>
                    ))}
                    {report.missingFields.length > 6 && (
                      <span className="text-[10px] text-warm-muted">+{report.missingFields.length - 6} lainnya</span>
                    )}
                  </div>
                )}
                {report.missingFields.length === 0 && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
                    <Check className="h-3 w-3" /> Semua field terisi
                  </div>
                )}
              </div>
            ))}

            {/* AI Summary */}
            <div className="p-4 bg-warm-bg rounded-xl border border-forest/10">
              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-forest mt-0.5 shrink-0" aria-hidden="true" />
                <div className="text-xs text-warm-text leading-relaxed whitespace-pre-wrap">
                  {koreksiResult.summary}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modul Selector + Add/Delete */}
      <div className="flex items-center gap-2 print:hidden flex-wrap">
        <span className="text-xs font-bold text-warm-secondary uppercase tracking-wider mr-1">Modul:</span>
        {modulList.map((m, idx) => (
          <button
            key={idx}
            onClick={() => setActiveModulIndex(idx)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer max-w-[160px] truncate ${
              idx === activeModulIndex
                ? "bg-forest text-white border-forest"
                : "bg-warm-card text-warm-secondary border-warm-border hover:bg-warm-bg"
            }`}
            title={m.temaModul || `Modul ${idx + 1}`}
          >
            {m.temaModul ? m.temaModul.substring(0, 22) : `Modul ${idx + 1}`}
          </button>
        ))}
        <button
          onClick={handleAddModul}
          className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-dashed border-forest/50 text-forest hover:bg-forest/10 transition-colors cursor-pointer"
        >
          + Tambah
        </button>
        {modulList.length > 1 && (
          <button
            onClick={() => handleRemoveModul(activeModulIndex)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            × Hapus
          </button>
        )}
      </div>

      {/* Step Navigator */}
      <div className="flex items-center gap-1 overflow-x-auto print:hidden text-xs pb-1">
        {[
          { step: 0, label: "Info Dasar" },
          { step: 1, label: "Pengalaman" },
          { step: 2, label: "DL Canvas" },
          { step: 3, label: "Timeline" },
          { step: 4, label: "Asesmen" },
          { step: 5, label: "Review" },
          { step: 6, label: "Hasil" },
        ].map((s) => (
          <button key={s.step} onClick={() => setCanvasStep(s.step)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
              canvasStep === s.step
                ? "bg-forest text-white shadow-sm"
                : "bg-warm-card text-warm-secondary hover:bg-warm-bg border border-warm-border/50"
            }`}
          >
            <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${
              canvasStep === s.step ? "bg-white/20" : "bg-warm-bg text-warm-muted"
            }`}>{s.step + 1}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* --- SECTION 7: MODUL AJAR --- */}
      <section id="doc-modul" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border shadow-lg print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        {/* Header - common */}
        <div className="border-b-2 border-warm-text pb-4 mb-6">
          <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
            MODUL AJAR KURIKULUM MERDEKA
          </h2>
          <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
            {modul ? `Modul ${activeModulIndex + 1}: ${modul.temaModul || "(belum diisi)"}` : "Belum ada modul"}
          </p>
        </div>

        {canvasStep === 0 && (
          /* ===== STEP 1: INFO DASAR ===== */
          <div className="space-y-8 flex-1">
            {/* I. IDENTITAS MODUL */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-forest border-b border-forest/10 pb-1 flex items-center gap-1">
                I. IDENTITAS UMUM MODUL
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-warm-text">
                <div className="space-y-2.5 p-4 bg-warm-bg rounded-2xl border border-warm-border">
                  <div>
                    <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px]">1. Tema Utama Modul</span>
                    <input
                      type="text"
                      value={modul.temaModul || ""}
                      onChange={(e) => handleUpdateModul("temaModul", e.target.value)}
                      className="w-full bg-transparent font-bold text-warm-text border-b border-transparent hover:border-warm-border focus:border-forest/100 focus:outline-none mt-0.5 py-0.5"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px]">2. Alokasi Waktu</span>
                    <input
                      type="text"
                      value={modul.alokasiWaktu || ""}
                      onChange={(e) => handleUpdateModul("alokasiWaktu", e.target.value)}
                      className="w-full bg-transparent font-semibold text-warm-text border-b border-transparent hover:border-warm-border focus:border-forest/100 focus:outline-none mt-0.5 py-0.5"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px]">3. Target Peserta Didik</span>
                    <input
                      type="text"
                      value={modul.targetPesertaDidik || ""}
                      onChange={(e) => handleUpdateModul("targetPesertaDidik", e.target.value)}
                      className="w-full bg-transparent font-semibold text-warm-text border-b border-transparent hover:border-warm-border focus:border-forest/100 focus:outline-none mt-0.5 py-0.5"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 p-4 bg-warm-bg rounded-2xl border border-warm-border">
                  <div>
                    <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px]">4. Model Pembelajaran Pilihan</span>
                    <input
                      type="text"
                      value={modul.modelPembelajaran || ""}
                      onChange={(e) => handleUpdateModul("modelPembelajaran", e.target.value)}
                      className="w-full bg-transparent font-bold text-forest border-b border-transparent hover:border-warm-border focus:border-forest/100 focus:outline-none mt-0.5 py-0.5"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px]">5. Sarana & Prasarana Penunjang</span>
                    <input
                      type="text"
                      value={modul.saranaPrasarana || ""}
                      onChange={(e) => handleUpdateModul("saranaPrasarana", e.target.value)}
                      className="w-full bg-transparent font-semibold text-warm-text border-b border-transparent hover:border-warm-border focus:border-forest/100 focus:outline-none mt-0.5 py-0.5"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px]">6. Pertemuan ke- / Frekuensi</span>
                    <input
                      type="text"
                      value={modul.temuKe || ""}
                      onChange={(e) => handleUpdateModul("temuKe", e.target.value)}
                      className="w-full bg-transparent font-semibold text-warm-text border-b border-transparent hover:border-warm-border focus:border-forest/100 focus:outline-none mt-0.5 py-0.5"
                    />
                  </div>
                </div>
              </div>
              <div>
                <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px] mb-1">Mata Rantai Kompetensi Awal Siswa</span>
                <textarea
                  value={modul.kompetensiAwal}
                  onChange={(e) => handleUpdateModul("kompetensiAwal", e.target.value)}
                  rows={2}
                  className="w-full text-xs text-warm-text p-3 bg-warm-bg rounded-[15px] border border-warm-border focus:outline-none focus:ring-1 focus:ring-forest leading-relaxed font-semibold"
                />
              </div>
            </div>

            {/* II. KOMPETENSI INTI */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-forest border-b border-forest/10 pb-1">
                II. KOMPETENSI INTI PEMBELAJARAN
              </h3>
              <div className="grid grid-cols-1 gap-4 text-xs text-warm-text">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-forest uppercase tracking-wider text-[9px]">Tujuan Pembelajaran Khusus (TP)</span>
                    <button onClick={() => setShowMdPreview(!showMdPreview)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        showMdPreview ? "bg-forest text-white border-forest" : "bg-warm-card text-warm-secondary border-warm-border hover:bg-warm-bg"
                      }`}
                    >
                      {showMdPreview ? "Edit" : "Preview"} Markdown
                    </button>
                    {state.atp && state.atp.length > 0 && (
                      <button onClick={() => setShowAtpPicker(true)}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md border border-forest/40 text-forest hover:bg-forest/10 transition-colors cursor-pointer"
                      >
                        + Ambil dari ATP
                      </button>
                    )}
                  </div>
                  {showMdPreview ? (
                    <div
                      className="w-full text-xs text-warm-text border border-warm-border p-3 rounded-2xl bg-warm-bg leading-relaxed font-medium min-h-[48px]"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(modul.tujuanPembelajaran) }}
                    />
                  ) : (
                    <textarea
                      value={modul.tujuanPembelajaran}
                      onChange={(e) => handleUpdateModul("tujuanPembelajaran", e.target.value)}
                      rows={3}
                      className="w-full text-xs text-warm-text border border-warm-border p-3 rounded-2xl bg-warm-card focus:outline-none leading-relaxed font-bold border-l-4 border-l-forest font-mono"
                    />
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px]">Pemahaman Bermakna (Deep Context)</span>
                    <textarea
                      value={modul.pemahamanBermakna}
                      onChange={(e) => handleUpdateModul("pemahamanBermakna", e.target.value)}
                      rows={2}
                      className="w-full text-xs text-warm-text border border-warm-border p-3 rounded-xl bg-warm-bg focus:outline-none leading-relaxed font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px]">Pertanyaan Pemantik (Curiosity Hook)</span>
                    <textarea
                      value={modul.pertanyaanPemantik}
                      onChange={(e) => handleUpdateModul("pertanyaanPemantik", e.target.value)}
                      rows={2}
                      className="w-full text-xs text-warm-text border border-warm-border p-3 rounded-xl bg-warm-bg focus:outline-none leading-relaxed font-semibold italic text-forest"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {canvasStep === 1 && (
          /* ===== STEP 2: PENGALAMAN BELAJAR ===== */
          <div className="space-y-6 flex-1">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-forest border-b border-forest/10 pb-1">
              II. PENGALAMAN BELAJAR
            </h3>
            <p className="text-xs text-warm-secondary">Pilih pengalaman belajar, isi aktivitas secara manual atau generate dengan AI, lalu simpan ke pilar Deep Learning.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {experiences.map((exp) => {
                const selected = selectedExperiences.includes(exp.id);
                return (
                  <div key={exp.id}
                    className={`rounded-2xl border-2 transition-all ${
                      selected
                        ? "border-forest bg-forest/5 shadow-sm"
                        : "border-warm-border bg-warm-card hover:border-warm-muted"
                    }`}
                  >
                    <button onClick={() => {
                      if (selected) {
                        setSelectedExperiences((prev) => prev.filter((id) => id !== exp.id));
                        setExperienceContents((prev) => { const n = { ...prev }; delete n[exp.id]; return n; });
                      } else {
                        setSelectedExperiences((prev) => [...prev, exp.id]);
                      }
                    }}
                      className="w-full p-4 text-left cursor-pointer"
                    >
                      <span className="text-2xl">{exp.icon}</span>
                      <p className="font-bold text-xs mt-2">{exp.label}</p>
                      <p className="text-[10px] text-warm-muted mt-0.5">{exp.desc}</p>
                    </button>
                    {selected && (
                      <div className="px-4 pb-4 space-y-2 border-t border-forest/10 pt-3 mt-1">
                        <textarea
                          value={experienceContents[exp.id] || ""}
                          onChange={(e) => setExperienceContents((prev) => ({ ...prev, [exp.id]: e.target.value }))}
                          placeholder="Tulis aktivitas konkret untuk pengalaman ini..."
                          rows={2}
                          className={`w-full text-xs text-warm-text border p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-forest leading-relaxed transition-colors duration-500 ${
                            generatedExpToast === exp.id
                              ? "border-emerald-400 bg-emerald-50/30"
                              : "border-warm-border bg-warm-card"
                          }`}
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => handleGenerateOneExperience(exp.id)}
                            disabled={isGeneratingExp === exp.id}
                            className="text-[10px] font-bold px-3 py-1.5 bg-forest/10 text-forest rounded-lg hover:bg-forest/20 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isGeneratingExp === exp.id ? "⏳" : "✨"} Generate AI
                          </button>
                          {generatedExpToast === exp.id && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg animate-pulse">
                              ✅ Ter-generate
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSaveAktivitas}
                disabled={selectedExperiences.length === 0 || selectedExperiences.every((id) => !experienceContents[id]?.trim())}
                className="px-5 py-2 bg-forest hover:bg-forest/90 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
              >
                💾 Simpan & Terapkan
              </button>
              <span className="text-[10px] text-warm-muted font-medium">{selectedExperiences.length} dipilih</span>
            </div>
          </div>
        )}

        {canvasStep === 2 && (
          /* ===== STEP 3: DL CANVAS ===== */
          <div className="space-y-8 flex-1">
            <div className="space-y-4">
              <div className="border-b border-warm-border pb-1">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-forest">
                  III. SKENARIO KEGIATAN: DEEP LEARNING CANVAS
                </h3>
                <p className="text-[10px] text-warm-muted font-semibold uppercase mt-0.5">3 Pilar Pembelajaran Mendalam — Mindful · Meaningful · Joyful</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wide block">1. Pembukaan Kondisional (Pendahuluan)</span>
                <div className="space-y-2">
                  {modul.kegiatanPembelajaran.pendahuluan.map((act, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="font-mono text-xs text-warm-muted mt-0.5">•</span>
                      <input
                        type="text"
                        value={act}
                        onChange={(e) => handleUpdateNestedList("pendahuluan", null, i, e.target.value)}
                        className="flex-1 bg-transparent text-xs text-warm-text border-b border-transparent hover:border-warm-border focus:outline-none focus:border-forest/100 font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <span className="text-[10px] font-bold text-warm-secondary uppercase tracking-wide block border-b border-warm-border pb-1">2. Alur Pembelajaran Utama — 3 Pilar Deep Learning</span>

                <div className="rounded-2xl border border-amber-200 overflow-hidden text-xs">
                  <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex items-center gap-3">
                    <span className="text-lg" role="img" aria-label="Mindful">🧠</span>
                    <div>
                      <span className="font-bold text-amber-900 block text-sm">Mindful</span>
                      <span className="text-[10px] text-amber-600 font-medium">Fokus Terarah · Curiosity · Koneksi Personal</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-2 bg-white/50">
                    {modul.kegiatanPembelajaran.intiDeepLearning.mindfulEngagement.map((act, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="font-mono text-[11px] font-bold text-amber-500 mt-0.5">A.{i+1}</span>
                        <input
                          type="text"
                          value={act}
                          onChange={(e) => handleUpdateNestedList("intiDeepLearning", "mindfulEngagement", i, e.target.value)}
                          className="flex-1 bg-transparent text-warm-text border-b border-transparent hover:border-amber-200 focus:outline-none focus:border-amber-500 font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-200 overflow-hidden text-xs">
                  <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex items-center gap-3">
                    <span className="text-lg" role="img" aria-label="Meaningful">🌍</span>
                    <div>
                      <span className="font-bold text-blue-900 block text-sm">Meaningful</span>
                      <span className="text-[10px] text-blue-600 font-medium">Hubungan Nyata · Konteks Lokal · Kontribusi Siswa</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-2 bg-white/50">
                    {modul.kegiatanPembelajaran.intiDeepLearning.deepProcessing.map((act, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="font-mono text-[11px] font-bold text-blue-500 mt-0.5">B.{i+1}</span>
                        <input
                          type="text"
                          value={act}
                          onChange={(e) => handleUpdateNestedList("intiDeepLearning", "deepProcessing", i, e.target.value)}
                          className="flex-1 bg-transparent text-warm-text border-b border-transparent hover:border-blue-200 focus:outline-none focus:border-blue-500 font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 overflow-hidden text-xs">
                  <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100 flex items-center gap-3">
                    <span className="text-lg" role="img" aria-label="Joyful">😊</span>
                    <div>
                      <span className="font-bold text-emerald-900 block text-sm">Joyful</span>
                      <span className="text-[10px] text-emerald-600 font-medium">Game/Video · Outdoor/Quiz · Role Play</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-2 bg-white/50">
                    {modul.kegiatanPembelajaran.intiDeepLearning.transferOfLearning.map((act, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="font-mono text-[11px] font-bold text-emerald-500 mt-0.5">C.{i+1}</span>
                        <input
                          type="text"
                          value={act}
                          onChange={(e) => handleUpdateNestedList("intiDeepLearning", "transferOfLearning", i, e.target.value)}
                          className="flex-1 bg-transparent text-warm-text border-b border-transparent hover:border-emerald-200 focus:outline-none focus:border-emerald-500 font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wide block">3. Evaluasi Metakognisi & Penguatan (Penutup)</span>
                <div className="space-y-2">
                  {modul.kegiatanPembelajaran.penutup.map((act, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="font-mono text-xs text-warm-muted mt-0.5">•</span>
                      <input
                        type="text"
                        value={act}
                        onChange={(e) => handleUpdateNestedList("penutup", null, i, e.target.value)}
                        className="flex-1 bg-transparent text-xs text-warm-text border-b border-transparent hover:border-warm-border focus:outline-none focus:border-forest/100 font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-forest border-b border-forest/10 pb-1">
                IV. STRATEGI PEMBELAJARAN BERDIFERENSIASI
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-warm-text">
                <div className="bg-warm-bg p-4 rounded-2xl border border-warm-border flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-warm-secondary block mb-1">A. Diferensiasi Konten</span>
                    <textarea
                      value={modul.diferensiasi.konten}
                      onChange={(e) => handleUpdateModul("diferensiasi", { ...modul.diferensiasi, konten: e.target.value })}
                      rows={4}
                      className="w-full bg-transparent border-none text-xs text-warm-text leading-relaxed font-medium focus:outline-none"
                    />
                  </div>
                </div>
                <div className="bg-warm-bg p-4 rounded-2xl border border-warm-border flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-warm-secondary block mb-1">B. Diferensiasi Proses</span>
                    <textarea
                      value={modul.diferensiasi.proses}
                      onChange={(e) => handleUpdateModul("diferensiasi", { ...modul.diferensiasi, proses: e.target.value })}
                      rows={4}
                      className="w-full bg-transparent border-none text-xs text-warm-text leading-relaxed font-semibold focus:outline-none"
                    />
                  </div>
                </div>
                <div className="bg-warm-bg p-4 rounded-2xl border border-warm-border flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-warm-secondary block mb-1">C. Diferensiasi Produk</span>
                    <textarea
                      value={modul.diferensiasi.produk}
                      onChange={(e) => handleUpdateModul("diferensiasi", { ...modul.diferensiasi, produk: e.target.value })}
                      rows={4}
                      className="w-full bg-transparent border-none text-xs text-warm-text leading-relaxed font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {canvasStep === 3 && (
          /* ===== STEP 4: TIMELINE BUILDER ===== */
          <div className="space-y-6 flex-1">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-forest border-b border-forest/10 pb-1">
              IV. TIMELINE PEMBELAJARAN
            </h3>
            <p className="text-xs text-warm-secondary">Visualisasi alur kegiatan dari pembukaan hingga penutup. Klik tiap fase untuk mengedit aktivitas langsung di Step sebelumnya.</p>
            <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-stretch md:items-start">
              {[
                { label: "Pendahuluan", bg: "bg-purple-50", border: "border-purple-200", txt: "text-purple-800", txt2: "text-purple-700", empty: "text-purple-400" },
                { label: "Mindful", bg: "bg-amber-50", border: "border-amber-200", txt: "text-amber-800", txt2: "text-amber-700", empty: "text-amber-400" },
                { label: "Meaningful", bg: "bg-blue-50", border: "border-blue-200", txt: "text-blue-800", txt2: "text-blue-700", empty: "text-blue-400" },
                { label: "Joyful", bg: "bg-emerald-50", border: "border-emerald-200", txt: "text-emerald-800", txt2: "text-emerald-700", empty: "text-emerald-400" },
                { label: "Penutup", bg: "bg-purple-50", border: "border-purple-200", txt: "text-purple-800", txt2: "text-purple-700", empty: "text-purple-400" },
              ].map((phase, pi) => (
                <div key={pi} className="flex items-stretch md:items-center">
                  <div className={`flex-1 min-w-[140px] ${phase.bg} rounded-2xl border ${phase.border} p-3`}>
                    <div className={`font-bold ${phase.txt} text-[10px] uppercase tracking-wider mb-1.5`}>
                      {pi === 0 ? "🏁 " : pi === 4 ? "🎯 " : ""}{phase.label}
                    </div>
                    <ul className="space-y-0.5">
                      {(phase.label === "Pendahuluan" ? modul.kegiatanPembelajaran.pendahuluan :
                        phase.label === "Mindful" ? modul.kegiatanPembelajaran.intiDeepLearning.mindfulEngagement :
                        phase.label === "Meaningful" ? modul.kegiatanPembelajaran.intiDeepLearning.deepProcessing :
                        phase.label === "Joyful" ? modul.kegiatanPembelajaran.intiDeepLearning.transferOfLearning :
                        modul.kegiatanPembelajaran.penutup
                      ).filter(Boolean).map((item: string, ii: number) => (
                        <li key={ii} className={`text-[10px] ${phase.txt2} flex items-start gap-1 leading-tight`}>
                          <span>•</span><span className="truncate">{item}</span>
                        </li>
                      ))}
                      {(phase.label === "Pendahuluan" ? modul.kegiatanPembelajaran.pendahuluan :
                        phase.label === "Mindful" ? modul.kegiatanPembelajaran.intiDeepLearning.mindfulEngagement :
                        phase.label === "Meaningful" ? modul.kegiatanPembelajaran.intiDeepLearning.deepProcessing :
                        phase.label === "Joyful" ? modul.kegiatanPembelajaran.intiDeepLearning.transferOfLearning :
                        modul.kegiatanPembelajaran.penutup
                      ).filter(Boolean).length === 0 && (
                        <li className={`text-[9px] ${phase.empty} italic`}>(kosong)</li>
                      )}
                    </ul>
                  </div>
                  {pi < 4 && (
                    <div className="flex items-center justify-center px-2 text-warm-muted text-sm md:rotate-0 -rotate-90 my-1 md:my-0">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 bg-warm-bg rounded-2xl border border-warm-border text-xs text-warm-muted flex items-center gap-2">
              <span>💡</span>
              <span>Edit aktivitas langsung di Step <strong>DL Canvas</strong> untuk mengubah tampilan timeline ini.</span>
            </div>
          </div>
        )}

        {canvasStep === 4 && (
          /* ===== STEP 5: ASESMEN ===== */
          <div className="space-y-6 flex-1">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-forest border-b border-forest/10 pb-1">
              V. ASESMEN &amp; DIFERENSIASI
            </h3>
            <div>
              <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px] mb-2">Jenis Asesmen yang Digunakan</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(checklistItems).map(([key, val]) => (
                  <button key={key} onClick={() => setChecklistItems((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      val ? "bg-forest/5 border-forest text-forest" : "bg-warm-card border-warm-border text-warm-secondary hover:border-warm-muted"
                    }`}
                  >
                    {val ? "✅ " : "☑ "}{key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px]">Asesmen Diagnostik</span>
              <textarea
                value={modul.aksesmen.diagnostik}
                onChange={(e) => handleUpdateModul("aksesmen", { ...modul.aksesmen, diagnostik: e.target.value })}
                rows={2}
                className="w-full text-xs text-warm-text p-3 bg-warm-bg rounded-xl border border-warm-border focus:outline-none focus:ring-1 focus:ring-forest leading-relaxed"
              />
            </div>
            <div className="space-y-3">
              <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px]">Asesmen Formatif</span>
              <textarea
                value={modul.aksesmen.formatif}
                onChange={(e) => handleUpdateModul("aksesmen", { ...modul.aksesmen, formatif: e.target.value })}
                rows={2}
                className="w-full text-xs text-warm-text p-3 bg-warm-bg rounded-xl border border-warm-border focus:outline-none focus:ring-1 focus:ring-forest leading-relaxed"
              />
            </div>
            <div className="space-y-3">
              <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px]">Asesmen Sumatif</span>
              <textarea
                value={modul.aksesmen.sumatif}
                onChange={(e) => handleUpdateModul("aksesmen", { ...modul.aksesmen, sumatif: e.target.value })}
                rows={2}
                className="w-full text-xs text-warm-text p-3 bg-warm-bg rounded-xl border border-warm-border focus:outline-none focus:ring-1 focus:ring-forest leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleGenerateRubrik} disabled={isRubrikLoading}
                className="px-5 py-2 bg-forest hover:bg-forest/90 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
              >
                {isRubrikLoading ? "⏳ Memproses..." : "✨ Buat Rubrik Otomatis"}
              </button>
            </div>

            <div className="space-y-4 pt-4 border-t border-warm-border">
              <span className="font-bold text-warm-muted uppercase tracking-wider block text-[9px]">Diferensiasi</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-warm-bg p-3 rounded-xl border border-warm-border">
                  <span className="font-bold text-warm-secondary text-[10px] block mb-1">Konten</span>
                  <textarea value={modul.diferensiasi.konten} onChange={(e) => handleUpdateModul("diferensiasi", { ...modul.diferensiasi, konten: e.target.value })} rows={3} className="w-full bg-transparent text-xs focus:outline-none leading-relaxed" />
                </div>
                <div className="bg-warm-bg p-3 rounded-xl border border-warm-border">
                  <span className="font-bold text-warm-secondary text-[10px] block mb-1">Proses</span>
                  <textarea value={modul.diferensiasi.proses} onChange={(e) => handleUpdateModul("diferensiasi", { ...modul.diferensiasi, proses: e.target.value })} rows={3} className="w-full bg-transparent text-xs focus:outline-none leading-relaxed" />
                </div>
                <div className="bg-warm-bg p-3 rounded-xl border border-warm-border">
                  <span className="font-bold text-warm-secondary text-[10px] block mb-1">Produk</span>
                  <textarea value={modul.diferensiasi.produk} onChange={(e) => handleUpdateModul("diferensiasi", { ...modul.diferensiasi, produk: e.target.value })} rows={3} className="w-full bg-transparent text-xs focus:outline-none leading-relaxed" />
                </div>
              </div>
            </div>
          </div>
        )}

        {canvasStep === 5 && (
          /* ===== STEP 6: REVIEW ===== */
          <div className="space-y-6 flex-1">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-forest border-b border-forest/10 pb-1">
              VI. REVIEW MODUL
            </h3>
            <div className="space-y-3">
              {computeScores(modul).map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <span className="w-36 text-[10px] font-bold text-warm-text">{item.label}</span>
                  <div className="flex-1 h-3 bg-warm-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.score >= 80 ? "bg-emerald-500" : item.score >= 50 ? "bg-amber-500" : "bg-red-400"
                      }`}
                      style={{ width: `${Math.min(100, item.score)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold w-8 text-right text-warm-text">{Math.round(item.score)}%</span>
                </div>
              ))}
            </div>

            <div className="text-center py-6 bg-warm-bg rounded-2xl border border-warm-border">
              {(() => {
                const scores = computeScores(modul);
                const avg = scores.length > 0 ? scores.reduce((s, x) => s + x.score, 0) / scores.length : 0;
                return (
                  <>
                    <span className="text-5xl font-extrabold text-forest">{Math.round(avg)}<span className="text-2xl">%</span></span>
                    <p className="text-xs text-warm-muted mt-1 font-medium">Skor Kelengkapan Modul</p>
                  </>
                );
              })()}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleReviewModul} disabled={isReviewLoading}
                className="px-5 py-2 bg-amber-accent hover:bg-amber-500 text-warm-text rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
              >
                {isReviewLoading ? "⏳ Menganalisis..." : "⭐ Minta Saran Perbaikan (AI)"}
              </button>
            </div>

            {reviewResult && (
              <div className="space-y-4 p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Hasil Review AI</h4>
                <div className="space-y-2">
                  {Object.entries(reviewResult.scores).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span className="w-24 font-bold text-warm-text capitalize">{key}</span>
                      <div className="flex-1 h-2 bg-warm-bg rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${val >= 80 ? "bg-emerald-500" : val >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                          style={{ width: `${Math.min(100, val)}%` }} />
                      </div>
                      <span className="font-bold w-6 text-right">{val}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-amber-800">{reviewResult.total}</span>
                  <span className="text-xs text-amber-700 font-medium ml-1">/ 100</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-2">Saran Perbaikan</span>
                  <ul className="space-y-1.5">
                    {reviewResult.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-warm-text flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">💡</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {canvasStep === 6 && (
          /* ===== STEP 7: HASIL MODUL ===== */
          <div className="space-y-6 flex-1 print:!block">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-forest border-b border-forest/10 pb-1 print:hidden">
              VII. HASIL MODUL AJAR
            </h3>

            {/* I. Identitas */}
            <div className="p-5 bg-warm-bg rounded-2xl border border-warm-border">
              <h4 className="text-xs font-extrabold text-forest uppercase tracking-wider mb-3">I. Identitas Umum Modul</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                <div><span className="font-bold text-warm-muted">Tema:</span> <span className="text-warm-text">{modul.temaModul || "(belum diisi)"}</span></div>
                <div><span className="font-bold text-warm-muted">Mapel:</span> <span className="text-warm-text">{identitas.mapel || "(belum diisi)"}</span></div>
                <div><span className="font-bold text-warm-muted">Kelas/Fase:</span> <span className="text-warm-text">{identitas.kelas || "(belum diisi)"} / {identitas.fase || "Fase E"}</span></div>
                <div><span className="font-bold text-warm-muted">Pertemuan:</span> <span className="text-warm-text">{modul.temuKe || "(belum diisi)"}</span></div>
                <div><span className="font-bold text-warm-muted">Alokasi Waktu:</span> <span className="text-warm-text">{modul.alokasiWaktu || "(belum diisi)"}</span></div>
                <div><span className="font-bold text-warm-muted">Model Pembelajaran:</span> <span className="text-warm-text">{modul.modelPembelajaran || "(belum diisi)"}</span></div>
                <div><span className="font-bold text-warm-muted">Target Peserta Didik:</span> <span className="text-warm-text">{modul.targetPesertaDidik || "(belum diisi)"}</span></div>
                <div><span className="font-bold text-warm-muted">Sarana Prasarana:</span> <span className="text-warm-text">{modul.saranaPrasarana || "(belum diisi)"}</span></div>
              </div>
              {modul.profilPancasila.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold text-warm-muted">Profil Pancasila:</span>
                  {modul.profilPancasila.map((d, i) => (
                    <span key={i} className="px-2 py-0.5 bg-forest/5 text-forest rounded-full text-[10px] font-bold">{d}</span>
                  ))}
                </div>
              )}
            </div>

            {/* II. Kompetensi & Tujuan */}
            <div className="p-5 bg-warm-bg rounded-2xl border border-warm-border space-y-3">
              <h4 className="text-xs font-extrabold text-forest uppercase tracking-wider">II. Kompetensi &amp; Tujuan Pembelajaran</h4>
              <div className="text-xs space-y-2">
                <div>
                  <span className="font-bold text-warm-muted block text-[10px]">Kompetensi Awal</span>
                  <p className="text-warm-text leading-relaxed">{modul.kompetensiAwal || "(belum diisi)"}</p>
                </div>
                <div>
                  <span className="font-bold text-warm-muted block text-[10px]">Tujuan Pembelajaran</span>
                  <p className="text-warm-text leading-relaxed">{modul.tujuanPembelajaran || "(belum diisi)"}</p>
                </div>
                <div>
                  <span className="font-bold text-warm-muted block text-[10px]">Pemahaman Bermakna</span>
                  <p className="text-warm-text leading-relaxed">{modul.pemahamanBermakna || "(belum diisi)"}</p>
                </div>
                <div>
                  <span className="font-bold text-warm-muted block text-[10px]">Pertanyaan Pemantik</span>
                  <p className="text-warm-text leading-relaxed">{modul.pertanyaanPemantik || "(belum diisi)"}</p>
                </div>
              </div>
            </div>

            {/* III. Kegiatan Pembelajaran */}
            <div className="p-5 bg-warm-bg rounded-2xl border border-warm-border space-y-3">
              <h4 className="text-xs font-extrabold text-forest uppercase tracking-wider">III. Kegiatan Pembelajaran</h4>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-warm-muted block text-[10px] mb-1">🏁 Pendahuluan</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {modul.kegiatanPembelajaran.pendahuluan.map((item, i) => (
                      <li key={i} className="text-warm-text">{item || "(kosong)"}</li>
                    ))}
                  </ul>
                </div>
                <div className="border-l-2 border-amber-200 pl-3">
                  <span className="font-bold text-amber-700 block text-[10px] mb-1">🧠 Mindful Engagement</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {modul.kegiatanPembelajaran.intiDeepLearning.mindfulEngagement.map((item, i) => (
                      <li key={i} className="text-warm-text">{item || "(kosong)"}</li>
                    ))}
                  </ul>
                </div>
                <div className="border-l-2 border-blue-200 pl-3">
                  <span className="font-bold text-blue-700 block text-[10px] mb-1">🌍 Deep Processing</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {modul.kegiatanPembelajaran.intiDeepLearning.deepProcessing.map((item, i) => (
                      <li key={i} className="text-warm-text">{item || "(kosong)"}</li>
                    ))}
                  </ul>
                </div>
                <div className="border-l-2 border-emerald-200 pl-3">
                  <span className="font-bold text-emerald-700 block text-[10px] mb-1">😊 Transfer of Learning</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {modul.kegiatanPembelajaran.intiDeepLearning.transferOfLearning.map((item, i) => (
                      <li key={i} className="text-warm-text">{item || "(kosong)"}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-warm-muted block text-[10px] mb-1">🎯 Penutup</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {modul.kegiatanPembelajaran.penutup.map((item, i) => (
                      <li key={i} className="text-warm-text">{item || "(kosong)"}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* IV. Asesmen */}
            <div className="p-5 bg-warm-bg rounded-2xl border border-warm-border space-y-2">
              <h4 className="text-xs font-extrabold text-forest uppercase tracking-wider">IV. Asesmen</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-warm-card rounded-xl border border-warm-border">
                  <span className="font-bold text-warm-muted block text-[10px] mb-1">Diagnostik</span>
                  <p className="text-warm-text leading-relaxed">{modul.aksesmen.diagnostik || "(belum diisi)"}</p>
                </div>
                <div className="p-3 bg-warm-card rounded-xl border border-warm-border">
                  <span className="font-bold text-warm-muted block text-[10px] mb-1">Formatif</span>
                  <p className="text-warm-text leading-relaxed">{modul.aksesmen.formatif || "(belum diisi)"}</p>
                </div>
                <div className="p-3 bg-warm-card rounded-xl border border-warm-border">
                  <span className="font-bold text-warm-muted block text-[10px] mb-1">Sumatif</span>
                  <p className="text-warm-text leading-relaxed">{modul.aksesmen.sumatif || "(belum diisi)"}</p>
                </div>
              </div>
            </div>

            {/* V. Diferensiasi */}
            <div className="p-5 bg-warm-bg rounded-2xl border border-warm-border space-y-2">
              <h4 className="text-xs font-extrabold text-forest uppercase tracking-wider">V. Diferensiasi</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-warm-card rounded-xl border border-warm-border">
                  <span className="font-bold text-warm-muted block text-[10px] mb-1">Konten</span>
                  <p className="text-warm-text leading-relaxed">{modul.diferensiasi.konten || "(belum diisi)"}</p>
                </div>
                <div className="p-3 bg-warm-card rounded-xl border border-warm-border">
                  <span className="font-bold text-warm-muted block text-[10px] mb-1">Proses</span>
                  <p className="text-warm-text leading-relaxed">{modul.diferensiasi.proses || "(belum diisi)"}</p>
                </div>
                <div className="p-3 bg-warm-card rounded-xl border border-warm-border">
                  <span className="font-bold text-warm-muted block text-[10px] mb-1">Produk</span>
                  <p className="text-warm-text leading-relaxed">{modul.diferensiasi.produk || "(belum diisi)"}</p>
                </div>
              </div>
            </div>

            {/* VI. Refleksi */}
            <div className="p-5 bg-warm-bg rounded-2xl border border-warm-border space-y-2">
              <h4 className="text-xs font-extrabold text-forest uppercase tracking-wider">VI. Refleksi</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-warm-card rounded-xl border border-warm-border">
                  <span className="font-bold text-warm-muted block text-[10px] mb-1">Refleksi Guru</span>
                  <p className="text-warm-text leading-relaxed">{modul.refleksiGuru || "(belum diisi)"}</p>
                </div>
                <div className="p-3 bg-warm-card rounded-xl border border-warm-border">
                  <span className="font-bold text-warm-muted block text-[10px] mb-1">Refleksi Siswa</span>
                  <p className="text-warm-text leading-relaxed">{modul.refleksiSiswa || "(belum diisi)"}</p>
                </div>
              </div>
            </div>

            {/* VII. Tanda Tangan */}
            <div className="grid grid-cols-2 gap-12 pt-8 mt-8 border-t border-warm-border text-center text-xs text-warm-text">
              <div>
                <p className="font-bold text-warm-muted uppercase tracking-widest mb-10 text-[10px]">Menyetujui,</p>
                <p className="font-bold text-warm-text underline">{identitas.namaKepsek || "(belum diisi)"}</p>
                <p className="text-[10px] text-warm-muted">NIP. {identitas.nipKepsek || "-"}</p>
              </div>
              <div>
                <p className="font-bold text-warm-muted uppercase tracking-widest mb-10 text-[10px]">{identitas.kota || "Bandung"}, Juni 2026</p>
                <p className="font-bold text-warm-text underline">{identitas.namaGuru || "(belum diisi)"}</p>
                <p className="text-[10px] text-warm-muted">NIP. {identitas.nipGuru || "-"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tanda Tangan - only in Step 3 (DL Canvas) */}
        {canvasStep === 2 && (
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
        )}
      </section>

      {/* ATP Picker Modal */}
      {showAtpPicker && state.atp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAtpPicker(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-warm-card rounded-3xl shadow-2xl border border-warm-border w-full max-w-lg max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-warm-border">
              <h3 className="text-sm font-bold text-warm-text uppercase tracking-wider">Pilih TP dari ATP</h3>
              <button onClick={() => setShowAtpPicker(false)} className="text-warm-muted hover:text-warm-text text-lg cursor-pointer">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {state.atp.length === 0 && (
                <p className="text-xs text-warm-muted text-center py-8">Belum ada ATP. Isi ATP di menu Program Kurikulum terlebih dahulu.</p>
              )}
              {state.atp.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-warm-border bg-warm-bg hover:border-forest/50 transition-colors">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-[9px] font-bold bg-forest/10 text-forest px-1.5 py-0.5 rounded">{item.kode}</span>
                    <span className="text-[9px] font-medium text-warm-muted">{item.elemen}</span>
                  </div>
                  <p className="text-xs text-warm-text leading-relaxed line-clamp-2 mb-2">{item.tujuanPembelajaran || "(kosong)"}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { handleUpdateModul("tujuanPembelajaran", item.tujuanPembelajaran); setShowAtpPicker(false); }}
                      className="text-[10px] font-bold px-3 py-1 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors cursor-pointer"
                    >
                      Pilih
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
