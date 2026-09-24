/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { AdminMasterConfig } from "../utils";
import { Siswa } from "../types";
import * as XLSX from "xlsx";
import { apiFetch } from "../api";
import OfficialKaldikView from "./OfficialKaldikView";
import {
  Users,
  GraduationCap,
  Layout,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  BookOpen,
  School,
  IdCard,
  UserCheck,
  Shield,
  KeyRound,
  Lock,
  User,
  Smartphone,
  Eye,
  EyeOff,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Save,
  Info,
  ArrowRight,
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";
import RPEPanel from "./RPE/RPEPanel";

interface Props {
  config: AdminMasterConfig;
  onUpdateConfig: (newConfig: AdminMasterConfig) => void;
}

export default function AdminPanel({ config, onUpdateConfig }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<"guru" | "siswa" | "kelas-mapel" | "jadwal" | "kalender" | "akun" | "rpe">("guru");
  
  // Search states
  const [guruSearch, setGuruSearch] = useState("");
  const [siswaSearch, setSiswaSearch] = useState("");

  // Editing / Adding state for Guru
  const [isEditingGuru, setIsEditingGuru] = useState<string | null>(null); // "new" or NIP/id
  const [guruForm, setGuruForm] = useState({
    id: "",
    namaGuru: "",
    nipGuru: "",
    nuptkGuru: "",
    mapel: "Informatika (Kurikulum Merdeka)",
    kelas: "X-A (Fase E)",
    fase: "E",
    semester: "Ganjil & Genap" as "Ganjil" | "Genap" | "Ganjil & Genap",
    tahunAjaran: "2026/2027",
    namaSekolah: "SMA Negeri 1 Kota Bandung",
    namaKepsek: "Dr. Hj. Sri Wahyuni, M.Pd.",
    nipKepsek: "19710412 199602 2 001",
    jabatanGuru: "Guru Ahli Pertama",
    waliKelasDi: "None",
    emailGuru: "",
    teleponGuru: ""
  });

  // Editing / Adding Siswa
  const [isEditingSiswa, setIsEditingSiswa] = useState<string | null>(null); // "new" or id
  const [siswaForm, setSiswaForm] = useState<Siswa>({
    id: "",
    noAbsen: 1,
    nis: "",
    nisn: "",
    nama: "",
    jenisKelamin: "L",
    namaOrangTua: "",
    alamat: "",
    teleponOrangTua: ""
  });

  // Adding single Kelas / Mapel items
  const [newKelasName, setNewKelasName] = useState("");
  const [newMapelName, setNewMapelName] = useState("");

  // Adding Schedule item
  const [schedForm, setSchedForm] = useState({
    hari: "Senin" as "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu",
    jamKe: "I (07:00 - 07:45)",
    kelas: "X-A",
    mapel: "Informatika",
    alokasiWaktu: 2
  });

  // Adding Academic Calendar agenda
  const [agendaForm, setAgendaForm] = useState({
    tanggal: "",
    tanggalSelesai: "",
    kegiatan: "",
    deskripsi: "",
    kategori: "akademik" as "libur" | "akademik" | "asesmen" | "sekolah"
  });

  // Calendar details
  const [hariGanjil, setHariGanjil] = useState(config.kalender.hariEfektifGanjil);
  const [mingguGanjil, setMingguGanjil] = useState(config.kalender.mingguEfektifGanjil);
  const [hariGenap, setHariGenap] = useState(config.kalender.hariEfektifGenap);
  const [mingguGenap, setMingguGenap] = useState(config.kalender.mingguEfektifGenap);

  // Kalender search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [kalenderViewMode, setKalenderViewMode] = useState<"calendar" | "official">("calendar");

  // PDF Import state
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [importModal, setImportModal] = useState<{
    open: boolean;
    loading: boolean;
    agenda: any[];
    selected: Set<number>;
  }>({ open: false, loading: false, agenda: [], selected: new Set() });

  // GURU CRUDS
  const handleAddGuruInit = () => {
    setGuruForm({
      id: "g_" + Date.now(),
      namaGuru: "",
      nipGuru: "",
      nuptkGuru: "",
      mapel: config.mapels[0] || "Informatika",
      kelas: (config.kelas[0] || "X-A") + " (Fase E)",
      fase: "E",
      semester: "Ganjil & Genap",
      tahunAjaran: "2026/2027",
      namaSekolah: "SMA Negeri 1 Kota Bandung",
      namaKepsek: "Dr. Hj. Sri Wahyuni, M.Pd.",
      nipKepsek: "19710412 199602 2 001",
      jabatanGuru: "Guru Ahli Pertama",
      waliKelasDi: "None",
      emailGuru: "",
      teleponGuru: ""
    });
    setIsEditingGuru("new");
  };

  const handleEditGuruInit = (guru: any) => {
    setGuruForm({ ...guru });
    setIsEditingGuru(guru.id);
  };

  const handleSaveGuru = () => {
    if (!guruForm.namaGuru || !guruForm.nipGuru) {
      alert("Nama Guru dan NIP wajib diisi!");
      return;
    }
    let updatedGurus = [...config.gurus];
    if (isEditingGuru === "new") {
      updatedGurus.push(guruForm);
    } else {
      updatedGurus = updatedGurus.map((g) => (g.id === guruForm.id ? guruForm : g));
    }
    onUpdateConfig({ ...config, gurus: updatedGurus });
    setIsEditingGuru(null);
  };

  const handleDeleteGuru = (id: string) => {
    if (confirm("Hapus akun guru ini dari sistem sekolah?")) {
      const updated = config.gurus.filter((g) => g.id !== id);
      onUpdateConfig({ ...config, gurus: updated });
    }
  };

  // SISWA CRUDS
  const handleAddSiswaInit = () => {
    setSiswaForm({
      id: "s_" + Date.now(),
      noAbsen: config.siswaList.length + 1,
      nis: "",
      nisn: "",
      nama: "",
      jenisKelamin: "L",
      namaOrangTua: "",
      alamat: "",
      teleponOrangTua: ""
    });
    setIsEditingSiswa("new");
  };

  const handleEditSiswaInit = (siswa: Siswa) => {
    setSiswaForm({ ...siswa });
    setIsEditingSiswa(siswa.id);
  };

  const handleSaveSiswa = () => {
    if (!siswaForm.nama || !siswaForm.nis) {
      alert("Nama dan NIS wajib diisi!");
      return;
    }
    let updatedSiswas = [...config.siswaList];
    if (isEditingSiswa === "new") {
      updatedSiswas.push(siswaForm);
    } else {
      updatedSiswas = updatedSiswas.map((s) => (s.id === siswaForm.id ? siswaForm : s));
    }
    onUpdateConfig({ ...config, siswaList: updatedSiswas });
    setIsEditingSiswa(null);
  };

  const handleDeleteSiswa = (id: string) => {
    if (confirm("Hapus siswa ini dari database?")) {
      const updated = config.siswaList.filter((s) => s.id !== id);
      onUpdateConfig({ ...config, siswaList: updated });
    }
  };

  // XLSX Template & Upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const templateData = [
      ["No Absen", "NIS", "NISN", "Nama Lengkap", "L/P", "Nama Orang Tua", "Alamat", "Telepon"],
      [1, "26001", "0098273641", "Ahmad Fauzi", "L", "Heri Susanto", "Jl. Merdeka No. 45, Bandung", "081234567890"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws["!cols"] = [{ wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 24 }, { wch: 6 }, { wch: 18 }, { wch: 28 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Siswa");
    XLSX.writeFile(wb, "template_siswa.xlsx");
  };

  const handleUploadXLSX = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const [header, ...dataRows] = rows;
        if (!header || (header as string[])[0] !== "No Absen") {
          alert("Format template tidak valid. Pastikan menggunakan template yang didownload.");
          return;
        }
        const newSiswas: Siswa[] = [];
        for (const row of dataRows) {
          if (!row || (row as any[]).length < 2) continue;
          const [noAbsen, nis, nisn, nama, jk, ortu, alamat, telp] = row as any[];
          if (!nama || !nis) continue;
          newSiswas.push({
            id: "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
            noAbsen: Number(noAbsen) || newSiswas.length + 1,
            nis: String(nis).trim(),
            nisn: nisn ? String(nisn).trim() : "",
            nama: String(nama).trim(),
            jenisKelamin: String(jk || "L").trim().toUpperCase() === "P" ? "P" : "L",
            namaOrangTua: ortu ? String(ortu).trim() : "",
            alamat: alamat ? String(alamat).trim() : "",
            teleponOrangTua: telp ? String(telp).trim() : ""
          });
        }
        if (newSiswas.length === 0) {
          alert("Tidak ada data siswa valid yang ditemukan di file.");
          return;
        }
        const confirmMsg = `Ditemukan ${newSiswas.length} data siswa. Lanjutkan import?\n(Catatan: data lama tidak akan dihapus, data baru akan ditambahkan.)`;
        if (window.confirm(confirmMsg)) {
          const existingIds = new Set(config.siswaList.map((s) => s.nis));
          const trulyNew = newSiswas.filter((s) => !existingIds.has(s.nis));
          onUpdateConfig({ ...config, siswaList: [...config.siswaList, ...trulyNew] });
          alert(`Berhasil mengimport ${trulyNew.length} data siswa baru!${trulyNew.length < newSiswas.length ? ` (${newSiswas.length - trulyNew.length} duplikat NIS dilewati)` : ""}`);
        }
      } catch (err) {
        console.error("XLSX parse error:", err);
        alert("Gagal membaca file. Pastikan format .xlsx valid.");
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // KELAS & MAPEL CRUDS
  const handleAddKelas = () => {
    if (!newKelasName.trim()) return;
    if (config.kelas.includes(newKelasName.trim())) {
      alert("Kelas sudah terdaftar!");
      return;
    }
    onUpdateConfig({ ...config, kelas: [...config.kelas, newKelasName.trim()] });
    setNewKelasName("");
  };

  const handleDeleteKelas = (kls: string) => {
    if (confirm(`Hapus kelas ${kls}?`)) {
      onUpdateConfig({ ...config, kelas: config.kelas.filter((k) => k !== kls) });
    }
  };

  const handleAddMapel = () => {
    if (!newMapelName.trim()) return;
    if (config.mapels.includes(newMapelName.trim())) {
      alert("Mata Pelajaran sudah terdaftar!");
      return;
    }
    onUpdateConfig({ ...config, mapels: [...config.mapels, newMapelName.trim()] });
    setNewMapelName("");
  };

  const handleDeleteMapel = (mpl: string) => {
    if (confirm(`Hapus mapel ${mpl}?`)) {
      onUpdateConfig({ ...config, mapels: config.mapels.filter((m) => m !== mpl) });
    }
  };

  // JADWAL CRUDS
  const handleAddSchedule = () => {
    const newEntry = {
      id: "jw_" + Date.now(),
      ...schedForm
    };
    onUpdateConfig({ ...config, jadwal: [...config.jadwal, newEntry] });
  };

  const handleDeleteSchedule = (id: string) => {
    onUpdateConfig({ ...config, jadwal: config.jadwal.filter((j) => j.id !== id) });
  };

  // CALENDAR CRUDS
  const handleSaveCalendarSettings = () => {
    onUpdateConfig({
      ...config,
      kalender: {
        ...config.kalender,
        hariEfektifGanjil: Number(hariGanjil),
        mingguEfektifGanjil: Number(mingguGanjil),
        hariEfektifGenap: Number(hariGenap),
        mingguEfektifGenap: Number(mingguGenap)
      }
    });
    alert("Setelan alokasi efektif kalender akademik berhasil diperbarui!");
  };

  const handleAddAgenda = () => {
    if (!agendaForm.tanggal || !agendaForm.kegiatan) {
      alert("Tanggal dan Kegiatan agenda wajib diisi!");
      return;
    }
    const newAgenda: any = {
      id: "a_" + Date.now(),
      tanggal: agendaForm.tanggal,
      kegiatan: agendaForm.kegiatan,
      kategori: agendaForm.kategori,
      ...(agendaForm.tanggalSelesai ? { tanggalSelesai: agendaForm.tanggalSelesai } : {}),
      ...(agendaForm.deskripsi ? { deskripsi: agendaForm.deskripsi } : {})
    };
    const updatedAgenda = [...(config.kalender.agenda || []), newAgenda];
    onUpdateConfig({
      ...config,
      kalender: {
        ...config.kalender,
        agenda: updatedAgenda
      }
    });
    setAgendaForm({ tanggal: "", tanggalSelesai: "", kegiatan: "", deskripsi: "", kategori: "akademik" });
  };

  const handleDeleteAgenda = (id: string) => {
    const updatedAgenda = (config.kalender.agenda || []).filter((a: any) => a.id !== id);
    onUpdateConfig({
      ...config,
      kalender: {
        ...config.kalender,
        agenda: updatedAgenda
      }
    });
  };

  // PDF Import handlers
  const handleImportPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportModal({ open: true, loading: true, agenda: [], selected: new Set() });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiFetch("/api/gemini/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && Array.isArray(data.agenda)) {
        const allSelected = new Set(data.agenda.map((_: any, i: number) => i));
        setImportModal({ open: true, loading: false, agenda: data.agenda, selected: allSelected });
      } else {
        alert("Gagal parsing PDF: " + (data.error || "unknown error"));
        setImportModal({ open: false, loading: false, agenda: [], selected: new Set() });
      }
    } catch (err) {
      alert("Gagal upload PDF. Pastikan server aktif.");
      setImportModal({ open: false, loading: false, agenda: [], selected: new Set() });
    }

    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const handleConfirmImport = () => {
    const selectedAgenda = importModal.agenda.filter((_, i) => importModal.selected.has(i));
    const existingKeys = new Set((config.kalender.agenda || []).map((a: any) => (a.kegiatan || "").toLowerCase() + "|" + a.tanggal));
    const trulyNew = selectedAgenda.filter((a: any) => !existingKeys.has((a.kegiatan || "").toLowerCase() + "|" + a.tanggal));

    onUpdateConfig({
      ...config,
      kalender: {
        ...config.kalender,
        agenda: [...(config.kalender.agenda || []), ...trulyNew]
      }
    });

    const msg = `Berhasil import ${trulyNew.length} agenda${trulyNew.length < selectedAgenda.length ? ` (${selectedAgenda.length - trulyNew.length} duplikat dilewati)` : ""}!`;
    alert(msg);
    setImportModal({ open: false, loading: false, agenda: [], selected: new Set() });
  };

  // Kalender filter, pagination & helpers
  const agendaList = config.kalender.agenda || [];
  const filteredAgenda = agendaList.filter((a: any) => {
    const matchSearch = !searchQuery ||
      a.kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.deskripsi || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "all" || a.kategori === categoryFilter;
    return matchSearch && matchCategory;
  });
  const totalPages = Math.max(1, Math.ceil(filteredAgenda.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedAgenda = filteredAgenda.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const nextAgenda = agendaList
    .filter((a: any) => a.tanggal >= todayStr)
    .sort((a: any, b: any) => a.tanggal.localeCompare(b.tanggal))[0] || null;

  const remainingCount = agendaList.filter((a: any) => a.tanggal >= todayStr).length;

  const formatDate = (d: string) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${day} ${months[parseInt(m, 10) - 1]} ${y}`;
  };

  const kategoriColors: Record<string, string> = {
    akademik: "bg-forest/10 text-forest border-forest/20",
    asesmen: "bg-amber-50 text-amber-800 border-amber-200",
    libur: "bg-red-50 text-red-700 border-red-200",
    sekolah: "bg-sky-50 text-sky-700 border-sky-200"
  };
  const kategoriLabels: Record<string, string> = {
    akademik: "Akademik",
    asesmen: "Asesmen",
    libur: "Libur",
    sekolah: "Sekolah"
  };

  // Filter systems
  const filteredGurus = config.gurus.filter(
    (g) =>
      g.namaGuru.toLowerCase().includes(guruSearch.toLowerCase()) ||
      g.nipGuru.includes(guruSearch) ||
      g.mapel.toLowerCase().includes(guruSearch.toLowerCase())
  );

  const filteredSiswas = config.siswaList.filter(
    (s) =>
      s.nama.toLowerCase().includes(siswaSearch.toLowerCase()) ||
      s.nis.includes(siswaSearch) ||
      s.alamat.toLowerCase().includes(siswaSearch.toLowerCase())
  );

  return (
    <div id="admin-panel-container" className="bg-warm-card border border-warm-border rounded-xl p-6 max-w-7xl mx-auto text-warm-text">
      {/* Admin Title Heading */}
      <div className="flex items-center gap-4 border-b border-warm-border pb-5 mb-6">
        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
          <School className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-bold text-warm-text tracking-tight">SIAS Admin &bull; Panel Kontrol Kurikulum & Sekolah</h2>
          <p className="text-xs text-warm-secondary leading-relaxed">
            Pusat manajemen master data Sekolah Menengah Atas Negeri 1. Lakukan penambahan atau perubahan guru, jadwal, kalender pendidikan, kelas, mata pelajaran, serta database siswa.
          </p>
        </div>
      </div>

      {/* Sub menu controls */}
      <div className="flex flex-wrap gap-2 border-b border-warm-border pb-3 mb-6">
        {[
          { id: "guru", label: "Kelola Guru", icon: UserCheck },
          { id: "siswa", label: "Database Siswa", icon: Users },
          { id: "kelas-mapel", label: "Kelas & Mata Pelajaran", icon: Layout },
          { id: "jadwal", label: "Jadwal Mengajar", icon: Clock },
          { id: "kalender", label: "Kalender Pendidikan", icon: Calendar },
          { id: "rpe", label: "Rencana Pekan Efektif", icon: FileSpreadsheet },
          { id: "akun", label: "Akun Admin", icon: Shield }
        ].map((btn) => {
          const Icon = btn.icon;
          const isActive = activeSubTab === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => {
                setActiveSubTab(btn.id as any);
                setIsEditingGuru(null);
                setIsEditingSiswa(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 cursor-pointer ${
                isActive
                  ? "bg-forest text-white border-forest"
                  : "bg-warm-card text-warm-secondary border-warm-border hover:bg-warm-bg"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: KELOLA GURU */}
      {activeSubTab === "guru" && (
        <div className="space-y-6">
          {isEditingGuru ? (
            <div className="bg-warm-bg p-5 rounded-xl border border-warm-border space-y-4">
              <div className="flex justify-between items-center border-b border-warm-border pb-3">
                <span className="text-xs font-bold uppercase text-warm-text flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-forest" aria-hidden="true" />
                  {isEditingGuru === "new" ? "Tambah Guru & NIP Baru" : "Edit Parameter Akreditasi Guru"}
                </span>
                <button
                  onClick={() => setIsEditingGuru(null)}
                  aria-label="Tutup form"
                  className="p-1 text-warm-secondary hover:text-warm-text transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-forest"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label htmlFor="guru-nama" className="block font-bold text-warm-text mb-1">Gelarnya & Nama Guru *</label>
                  <input id="guru-nama" type="text" value={guruForm.namaGuru} onChange={(e) => setGuruForm({ ...guruForm, namaGuru: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="e.g. Bagus Wicaksono, S.Pd., M.T." autoComplete="name" />
                </div>
                <div>
                  <label htmlFor="guru-nip" className="block font-bold text-warm-text mb-1">Nomor Induk Pegawai (NIP) *</label>
                  <input id="guru-nip" type="text" value={guruForm.nipGuru} onChange={(e) => setGuruForm({ ...guruForm, nipGuru: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="e.g. 19881024 201503 1 002" />
                </div>
                <div>
                  <label htmlFor="guru-nuptk" className="block font-bold text-warm-text mb-1">NUPTK Guru</label>
                  <input id="guru-nuptk" type="text" value={guruForm.nuptkGuru} onChange={(e) => setGuruForm({ ...guruForm, nuptkGuru: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="e.g. 8435766668130112" />
                </div>
                <div>
                  <label htmlFor="guru-mapel" className="block font-bold text-warm-text mb-1">Spesialisasi Mapel Ajar</label>
                  <select id="guru-mapel" value={guruForm.mapel} onChange={(e) => setGuruForm({ ...guruForm, mapel: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card">{config.mapels.map((m) => (<option key={m} value={m}>{m}</option>))}</select>
                </div>
                <div>
                  <label htmlFor="guru-kelas" className="block font-bold text-warm-text mb-1">Kelas Mengajar utama</label>
                  <select id="guru-kelas" value={guruForm.kelas.split(" ")[0]} onChange={(e) => { const base = e.target.value; const phase = base.startsWith("X") ? "E" : "F"; setGuruForm({ ...guruForm, kelas: `${base} (Fase ${phase})`, fase: phase }); }} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card">{config.kelas.map((k) => (<option key={k} value={k}>{k}</option>))}</select>
                </div>
                <div>
                  <label htmlFor="guru-fase" className="block font-bold text-warm-text mb-1">Fase Tingkat</label>
                  <select id="guru-fase" value={guruForm.fase} onChange={(e) => setGuruForm({ ...guruForm, fase: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card"><option value="E">E (Kelas 10)</option><option value="F">F (Kelas 11 & 12)</option></select>
                </div>
                <div>
                  <label htmlFor="guru-jabatan" className="block font-bold text-warm-text mb-1">Jabatan Fungsional</label>
                  <input id="guru-jabatan" type="text" value={guruForm.jabatanGuru} onChange={(e) => setGuruForm({ ...guruForm, jabatanGuru: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="e.g. Guru Ahli Pertama" />
                </div>
                <div>
                  <label htmlFor="guru-wali" className="block font-bold text-warm-text mb-1">Wali Kelas Di</label>
                  <select id="guru-wali" value={guruForm.waliKelasDi} onChange={(e) => setGuruForm({ ...guruForm, waliKelasDi: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card"><option value="None">Tidak Menjabat Wali Kelas</option>{config.kelas.map((k) => (<option key={k} value={k}>{k}</option>))}</select>
                </div>
                <div>
                  <label htmlFor="guru-email" className="block font-bold text-warm-text mb-1">Email Sekolah / Guru</label>
                  <input id="guru-email" type="email" value={guruForm.emailGuru} onChange={(e) => setGuruForm({ ...guruForm, emailGuru: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="e.g. joni@smai.sch.id" autoComplete="email" />
                </div>
                <div>
                  <label htmlFor="guru-telepon" className="block font-bold text-warm-text mb-1">Telepon Guru</label>
                  <input id="guru-telepon" type="text" value={guruForm.teleponGuru} onChange={(e) => setGuruForm({ ...guruForm, teleponGuru: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="e.g. 0812-321-123" autoComplete="tel" />
                </div>
                <div>
                  <label htmlFor="guru-kepsek" className="block font-bold text-warm-text mb-1">Nama Kepala Sekolah</label>
                  <input id="guru-kepsek" type="text" value={guruForm.namaKepsek} onChange={(e) => setGuruForm({ ...guruForm, namaKepsek: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" />
                </div>
                <div>
                  <label htmlFor="guru-nipkepsek" className="block font-bold text-warm-text mb-1">NIP Kepala Sekolah</label>
                  <input id="guru-nipkepsek" type="text" value={guruForm.nipKepsek} onChange={(e) => setGuruForm({ ...guruForm, nipKepsek: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsEditingGuru(null)} className="px-4 py-1.5 border border-warm-border rounded-lg text-warm-secondary text-[11px] font-bold uppercase transition-colors hover:bg-warm-bg focus-visible:outline-2 focus-visible:outline-forest cursor-pointer">Batal</button>
                <button type="button" onClick={handleSaveGuru} className="px-4 py-1.5 bg-forest text-white rounded-lg text-[11px] font-bold uppercase hover:bg-forest-dark transition-colors flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer"><Check className="h-3.5 w-3.5" aria-hidden="true" /> Simpan Data Guru</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-muted"><Search className="h-4 w-4" aria-hidden="true" /></span>
                  <input type="text" value={guruSearch} onChange={(e) => setGuruSearch(e.target.value)} className="w-full pl-9 pr-3 py-1.5 border border-warm-border rounded-lg text-xs bg-warm-card" placeholder="Cari guru berdasarkan nama, NIP, mapel..." />
                </div>
                <button onClick={handleAddGuruInit} className="px-4 py-1.5 bg-forest hover:bg-forest-dark text-white text-[11px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-center focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer"><Plus className="h-4 w-4" aria-hidden="true" /> Tambah Guru Baru</button>
              </div>
              <div className="overflow-x-auto border border-warm-border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead><tr className="bg-warm-bg border-b border-warm-border text-[10px] font-bold uppercase text-warm-text tracking-wider"><th className="px-4 py-3">Nama Lengkap & NIP</th><th className="px-4 py-3">Mata Pelajaran</th><th className="px-4 py-3">Kelas & Jabatan</th><th className="px-4 py-3">Kontak & NUPTK</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
                  <tbody className="divide-y divide-warm-border">
                    {filteredGurus.map((g) => (
                      <tr key={g.id} className="hover:bg-warm-bg/50 transition-colors">
                        <td className="px-4 py-3"><span className="font-bold text-warm-text block text-xs">{g.namaGuru}</span><span className="text-[10px] text-warm-secondary font-mono block">NIP: {g.nipGuru}</span></td>
                        <td className="px-4 py-3"><span className="font-semibold text-forest bg-forest/10 border border-forest/20 rounded px-2 py-0.5 text-[10px] uppercase">{g.mapel}</span></td>
                        <td className="px-4 py-3"><span className="font-bold text-warm-text block uppercase">{g.kelas}</span><span className="text-[10px] text-warm-secondary block">{g.jabatanGuru}</span></td>
                        <td className="px-4 py-3 text-[10px] font-mono whitespace-nowrap text-warm-secondary"><div>Telp: {g.teleponGuru || "-"}</div><div>NUPTK: {g.nuptkGuru || "-"}</div></td>
                        <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditGuruInit(g)} className="p-1 px-2 border border-warm-border bg-warm-card hover:bg-warm-bg rounded text-[10px] font-bold uppercase tracking-wide text-warm-secondary flex items-center gap-1 transition-colors focus-visible:outline-2 focus-visible:outline-forest cursor-pointer"><Edit2 className="h-3 w-3" aria-hidden="true" /> Edit</button>
                          <button onClick={() => handleDeleteGuru(g.id)} className="p-1 px-2 border border-red-200 bg-warm-card hover:bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 transition-colors focus-visible:outline-2 focus-visible:outline-forest cursor-pointer"><Trash2 className="h-3 w-3" aria-hidden="true" /> Hapus</button>
                        </div></td>
                      </tr>
                    ))}
                    {filteredGurus.length === 0 && (<tr><td colSpan={5} className="text-center py-6 text-warm-muted">Tidak ditemukan akun guru yang cocok dengan pencarian Anda.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DATABASE SISWA */}
      {activeSubTab === "siswa" && (
        <div className="space-y-6">
          {isEditingSiswa ? (
            <div className="bg-warm-bg p-5 rounded-xl border border-warm-border space-y-4">
              <div className="flex justify-between items-center border-b border-warm-border pb-3">
                <span className="text-xs font-bold uppercase text-warm-text flex items-center gap-2">
                  <Users className="h-4 w-4 text-forest" aria-hidden="true" />
                  {isEditingSiswa === "new" ? "Tambah Siswa Baru ke Sekolah" : "Edit Parameter Siswa"}
                </span>
                <button onClick={() => setIsEditingSiswa(null)} aria-label="Tutup form" className="p-1 text-warm-secondary hover:text-warm-text transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-forest"><X className="h-4 w-4" aria-hidden="true" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div><label htmlFor="siswa-nama" className="block font-bold text-warm-text mb-1">Nama Lengkap Siswa *</label><input id="siswa-nama" type="text" value={siswaForm.nama} onChange={(e) => setSiswaForm({ ...siswaForm, nama: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="e.g. Ahmad Fauzi" autoComplete="name" /></div>
                <div><label htmlFor="siswa-nis" className="block font-bold text-warm-text mb-1">Nomor Induk Siswa (NIS) *</label><input id="siswa-nis" type="text" value={siswaForm.nis} onChange={(e) => setSiswaForm({ ...siswaForm, nis: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="e.g. 26001" /></div>
                <div><label htmlFor="siswa-nisn" className="block font-bold text-warm-text mb-1">NISN Nasional</label><input id="siswa-nisn" type="text" value={siswaForm.nisn} onChange={(e) => setSiswaForm({ ...siswaForm, nisn: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="e.g. 0098273641" /></div>
                <div><label htmlFor="siswa-absen" className="block font-bold text-warm-text mb-1">No Absen</label><input id="siswa-absen" type="number" value={siswaForm.noAbsen} onChange={(e) => setSiswaForm({ ...siswaForm, noAbsen: Number(e.target.value) })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="e.g. 1" /></div>
                <div><label htmlFor="siswa-jk" className="block font-bold text-warm-text mb-1">Jenis Kelamin</label><select id="siswa-jk" value={siswaForm.jenisKelamin} onChange={(e) => setSiswaForm({ ...siswaForm, jenisKelamin: e.target.value as any })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card"><option value="L">Laki-Laki (L)</option><option value="P">Perempuan (P)</option></select></div>
                <div><label htmlFor="siswa-ortu" className="block font-bold text-warm-text mb-1">Nama Orang Tua / Wali</label><input id="siswa-ortu" type="text" value={siswaForm.namaOrangTua} onChange={(e) => setSiswaForm({ ...siswaForm, namaOrangTua: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="e.g. Heri Susanto" autoComplete="parent" /></div>
                <div className="md:col-span-2"><label htmlFor="siswa-alamat" className="block font-bold text-warm-text mb-1">Alamat Lengkap Rumah</label><input id="siswa-alamat" type="text" value={siswaForm.alamat} onChange={(e) => setSiswaForm({ ...siswaForm, alamat: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="Jl. Merdeka No. 45, Bandung" autoComplete="street-address" /></div>
                <div><label htmlFor="siswa-telp" className="block font-bold text-warm-text mb-1">Telepon Wali</label><input id="siswa-telp" type="text" value={siswaForm.teleponOrangTua} onChange={(e) => setSiswaForm({ ...siswaForm, teleponOrangTua: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="081234567890" autoComplete="tel" /></div>
              </div>
              <div className="pt-3 flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsEditingSiswa(null)} className="px-4 py-1.5 border border-warm-border rounded-lg text-warm-secondary text-[11px] font-bold uppercase transition-colors hover:bg-warm-bg focus-visible:outline-2 focus-visible:outline-forest cursor-pointer">Batal</button>
                <button type="button" onClick={handleSaveSiswa} className="px-4 py-1.5 bg-forest text-white rounded-lg text-[11px] font-bold uppercase hover:bg-forest-dark transition-colors flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer"><Check className="h-3.5 w-3.5" aria-hidden="true" /> Simpan Data Siswa</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-muted"><Search className="h-4 w-4" aria-hidden="true" /></span>
                  <input type="text" value={siswaSearch} onChange={(e) => setSiswaSearch(e.target.value)} className="w-full pl-9 pr-3 py-1.5 border border-warm-border rounded-lg text-xs bg-warm-card" placeholder="Cari siswa berdasarkan nama, NIS, alamat..." />
                </div>
                <div className="flex gap-2 self-start sm:self-center">
                  <button onClick={handleDownloadTemplate} className="px-3 py-1.5 border border-warm-border bg-warm-card hover:bg-warm-bg text-warm-text text-[11px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-forest cursor-pointer"><Download className="h-4 w-4" /> Template</button>
                  <label className="px-3 py-1.5 border border-warm-border bg-warm-card hover:bg-warm-bg text-warm-text text-[11px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-forest cursor-pointer">
                    <Upload className="h-4 w-4" /> Upload Excel
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleUploadXLSX} className="hidden" />
                  </label>
                  <button onClick={handleAddSiswaInit} className="px-4 py-1.5 bg-forest hover:bg-forest-dark text-white text-[11px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer"><Plus className="h-4 w-4" /> Tambah</button>
                </div>
              </div>
              <div className="overflow-x-auto border border-warm-border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead><tr className="bg-warm-bg border-b border-warm-border text-[10px] font-bold uppercase text-warm-text tracking-wider"><th className="px-4 py-3">Absen / NIS / NISN</th><th className="px-4 py-3">Nama Lengkap</th><th className="px-4 py-3">JK</th><th className="px-4 py-3">Orang Tua / Wali</th><th className="px-4 py-3">Alamat Rumah</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
                  <tbody className="divide-y divide-warm-border">
                    {filteredSiswas.map((s) => (
                      <tr key={s.id} className="hover:bg-warm-bg/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-[10px] text-warm-muted whitespace-nowrap"><div>Abs: {s.noAbsen}</div><div>NIS: {s.nis}</div><div>NISN: {s.nisn || "-"}</div></td>
                        <td className="px-4 py-3 font-bold text-warm-text">{s.nama}</td>
                        <td className="px-4 py-3"><span className={`px-1.5 py-0.5 font-bold text-[9px] rounded ${s.jenisKelamin === "L" ? "bg-sky-50 text-sky-700 border border-sky-200" : "bg-amber-light text-amber-dark border border-amber-200"}`}>{s.jenisKelamin}</span></td>
                        <td className="px-4 py-3"><span className="font-semibold block">{s.namaOrangTua || "-"}</span><span className="text-[10px] font-mono text-warm-secondary">{s.teleponOrangTua || "-"}</span></td>
                        <td className="px-4 py-3 text-warm-muted max-w-xs truncate">{s.alamat || "-"}</td>
                        <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditSiswaInit(s)} className="p-1 px-1.5 border border-warm-border bg-warm-card hover:bg-warm-bg rounded text-[10px] font-bold uppercase text-warm-secondary transition-colors focus-visible:outline-2 focus-visible:outline-forest cursor-pointer">Edit</button>
                          <button onClick={() => handleDeleteSiswa(s.id)} className="p-1 px-1.5 border border-red-200 bg-warm-card hover:bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-forest cursor-pointer">Hapus</button>
                        </div></td>
                      </tr>
                    ))}
                    {filteredSiswas.length === 0 && (<tr><td colSpan={6} className="text-center py-6 text-warm-muted">Tidak ditemukan siswa yang cocok dengan kriteria filter.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KELAS & MATA PELAJARAN */}
      {activeSubTab === "kelas-mapel" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-warm-bg p-5 rounded-xl border border-warm-border space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-warm-text flex items-center gap-1.5">
              <Layout className="h-4 w-4 text-forest" aria-hidden="true" />
              Kelola Daftar Kelas Aktif
            </h4>
            <div className="flex gap-2">
              <input type="text" value={newKelasName} onChange={(e) => setNewKelasName(e.target.value)} className="flex-1 px-3 py-1.5 border border-warm-border bg-warm-card rounded-lg text-xs" placeholder="e.g. Kelas XII-IPA-3" />
              <button onClick={handleAddKelas} className="px-4 py-1.5 bg-forest text-white font-bold text-xs rounded-lg uppercase flex items-center gap-1 hover:bg-forest-dark transition-colors focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer"><Plus className="h-3.5 w-3.5" aria-hidden="true" /> Tambah</button>
            </div>
            <div className="divide-y divide-warm-border border border-warm-border bg-warm-card rounded-lg max-h-72 overflow-y-auto">
              {config.kelas.map((k) => (
                <div key={k} className="flex justify-between items-center p-3 text-xs font-bold text-warm-text">
                  <span>{k}</span>
                  <button onClick={() => handleDeleteKelas(k)} aria-label={`Hapus kelas ${k}`} className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors focus-visible:outline-2 focus-visible:outline-forest cursor-pointer"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              ))}
              {config.kelas.length === 0 && (<div className="text-center py-6 text-warm-muted text-xs">Belum ada daftar kelas.</div>)}
            </div>
          </div>
          <div className="bg-warm-bg p-5 rounded-xl border border-warm-border space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-warm-text flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-forest" aria-hidden="true" />
              Kelola Kurikulum Mata Pelajaran
            </h4>
            <div className="flex gap-2">
              <input type="text" value={newMapelName} onChange={(e) => setNewMapelName(e.target.value)} className="flex-1 px-3 py-1.5 border border-warm-border bg-warm-card rounded-lg text-xs" placeholder="e.g. Kimia Analitik" />
              <button onClick={handleAddMapel} className="px-4 py-1.5 bg-forest text-white font-bold text-xs rounded-lg uppercase flex items-center gap-1 hover:bg-forest-dark transition-colors focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer"><Plus className="h-3.5 w-3.5" aria-hidden="true" /> Tambah</button>
            </div>
            <div className="divide-y divide-warm-border border border-warm-border bg-warm-card rounded-lg max-h-72 overflow-y-auto">
              {config.mapels.map((m) => (
                <div key={m} className="flex justify-between items-center p-3 text-xs font-semibold text-warm-text">
                  <span className="truncate pr-4">{m}</span>
                  <button onClick={() => handleDeleteMapel(m)} aria-label={`Hapus mapel ${m}`} className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-forest cursor-pointer"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              ))}
              {config.mapels.length === 0 && (<div className="text-center py-6 text-warm-muted text-xs">Belum ada mata pelajaran.</div>)}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: JADWAL MENGAJAR */}
      {activeSubTab === "jadwal" && (
        <div className="space-y-6">
          <div className="bg-warm-bg p-5 rounded-xl border border-warm-border">
            <h4 className="text-xs font-bold uppercase tracking-wide text-warm-text flex items-center gap-1.5 mb-4">
              <Clock className="h-4 w-4 text-forest" aria-hidden="true" />
              Rancang Alokasi Timetable Sekolah Ganjil/Genap
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs items-end">
              <div><label htmlFor="sched-hari" className="block font-bold text-warm-text mb-1">Hari</label><select id="sched-hari" value={schedForm.hari} onChange={(e) => setSchedForm({ ...schedForm, hari: e.target.value as any })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card">{[ "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((d) => (<option key={d} value={d}>{d}</option>))}</select></div>
              <div><label htmlFor="sched-jam" className="block font-bold text-warm-text mb-1">Jam Pelajaran Ke</label><input id="sched-jam" type="text" value={schedForm.jamKe} onChange={(e) => setSchedForm({ ...schedForm, jamKe: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="e.g. III-IV (08:30 - 10:00)" /></div>
              <div><label htmlFor="sched-kelas" className="block font-bold text-warm-text mb-1">Kelas Target</label><select id="sched-kelas" value={schedForm.kelas} onChange={(e) => setSchedForm({ ...schedForm, kelas: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card">{config.kelas.map((kls) => (<option key={kls} value={kls}>{kls}</option>))}</select></div>
              <div><label htmlFor="sched-mapel" className="block font-bold text-warm-text mb-1">Mata Pelajaran</label><select id="sched-mapel" value={schedForm.mapel} onChange={(e) => setSchedForm({ ...schedForm, mapel: e.target.value })} className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card">{config.mapels.map((m) => (<option key={m} value={m}>{m}</option>))}</select></div>
              <button onClick={handleAddSchedule} className="w-full py-2 bg-forest hover:bg-forest-dark text-white text-[11px] font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 transition-colors focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer"><Plus className="h-4 w-4" aria-hidden="true" /> Tambah Jadwal</button>
            </div>
          </div>
          <div className="border border-warm-border rounded-xl overflow-hidden bg-warm-card">
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-warm-bg border-b border-warm-border text-[10px] font-bold uppercase text-warm-text tracking-wider"><th className="px-4 py-3">Hari</th><th className="px-4 py-3">Jam Ke (Rentang Waktu)</th><th className="px-4 py-3">Kelas</th><th className="px-4 py-3">Mata Pelajaran</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
              <tbody className="divide-y divide-warm-border">
                {config.jadwal.map((jw) => (
                  <tr key={jw.id} className="hover:bg-warm-bg/40">
                    <td className="px-4 py-3 font-bold text-warm-text">{jw.hari}</td>
                    <td className="px-4 py-3 text-warm-secondary font-mono text-[11px]">{jw.jamKe}</td>
                    <td className="px-4 py-3 font-bold text-forest">{jw.kelas}</td>
                    <td className="px-4 py-3 text-warm-secondary">{jw.mapel}</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => handleDeleteSchedule(jw.id)} aria-label="Hapus jadwal" className="p-1 rounded hover:bg-red-50 text-red-600 transition-colors focus-visible:outline-2 focus-visible:outline-forest cursor-pointer"><Trash2 className="h-4 w-4" aria-hidden="true" /></button></td>
                  </tr>
                ))}
                {config.jadwal.length === 0 && (<tr><td colSpan={5} className="text-center py-6 text-warm-muted">Belum ada rancangan jadwal mengajar yang dimuat.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: KALENDER PENDIDIKAN (EduSched-style) */}
      {activeSubTab === "kalender" && (
        <div className="space-y-6">
          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h3 className="text-lg font-bold text-warm-text tracking-tight">Kalender Pendidikan</h3>
              <p className="text-sm text-warm-secondary mt-0.5">Atur dan kelola agenda akademik, hari efektif, dan minggu ajar sekolah.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handleImportPDF} className="hidden" />
              <button onClick={() => pdfInputRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2 bg-warm-card border border-warm-border text-warm-secondary font-bold rounded-xl hover:bg-warm-bg transition-all text-[11px] uppercase tracking-wider focus-visible:outline-2 focus-visible:outline-forest cursor-pointer">
                <Upload className="h-4 w-4" /> Import PDF
              </button>
              <div className="flex items-center gap-0.5 bg-warm-bg rounded-xl border border-warm-border p-0.5">
                <button onClick={() => setKalenderViewMode("calendar")} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${kalenderViewMode === "calendar" ? "bg-forest text-white shadow-sm" : "text-warm-secondary hover:text-warm-text"}`}>Calendar</button>
                <button onClick={() => setKalenderViewMode("official")} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${kalenderViewMode === "official" ? "bg-forest text-white shadow-sm" : "text-warm-secondary hover:text-warm-text"}`}>Official Kaldik</button>
              </div>
              {kalenderViewMode === "calendar" ? (
                <button onClick={() => document.getElementById("agenda-kegiatan")?.focus()} className="flex items-center gap-1.5 px-4 py-2 bg-forest hover:bg-forest-dark text-white font-bold rounded-xl transition-all text-[11px] uppercase tracking-wider active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer">
                  <Plus className="h-4 w-4" /> Tambah Agenda
                </button>
              ) : null}
            </div>
          </div>

          {/* ── Conditional: Calendar View vs Official Kaldik View ── */}
          {kalenderViewMode === "calendar" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ═══ LEFT COLUMN (4/12) ═══ */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card: Atur Hari & Minggu Efektif */}
              <div className="bg-warm-card border border-warm-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-forest" />
                  <h4 className="text-sm font-bold text-warm-text">Atur Hari & Minggu Efektif</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-warm-text mb-1">Hari Efektif Ganjil</label>
                    <input type="number" value={hariGanjil} onChange={(e) => setHariGanjil(Number(e.target.value))} className="w-full px-3 py-2 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block font-bold text-warm-text mb-1">Minggu Efektif Ganjil</label>
                    <input type="number" value={mingguGanjil} onChange={(e) => setMingguGanjil(Number(e.target.value))} className="w-full px-3 py-2 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block font-bold text-warm-text mb-1">Hari Efektif Genap</label>
                    <input type="number" value={hariGenap} onChange={(e) => setHariGenap(Number(e.target.value))} className="w-full px-3 py-2 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block font-bold text-warm-text mb-1">Minggu Efektif Genap</label>
                    <input type="number" value={mingguGenap} onChange={(e) => setMingguGenap(Number(e.target.value))} className="w-full px-3 py-2 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                  </div>
                </div>
                <button onClick={handleSaveCalendarSettings} className="mt-4 w-full py-2.5 bg-forest hover:bg-forest-dark text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer">
                  <Save className="h-4 w-4" /> Simpan Alokasi Efektif
                </button>
              </div>

              {/* Card: Tambah Agenda */}
              <div className="bg-warm-card border border-warm-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-forest text-xl">edit_calendar</span>
                  <h4 className="text-sm font-bold text-warm-text">Tambah Agenda</h4>
                </div>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-warm-text mb-1">Nama Kegiatan</label>
                    <input id="agenda-kegiatan" type="text" value={agendaForm.kegiatan} onChange={(e) => setAgendaForm({ ...agendaForm, kegiatan: e.target.value })} className="w-full px-3 py-2 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" placeholder="e.g. Pembagian Rapor Semester Ganjil" />
                  </div>
                  <div>
                    <label className="block font-bold text-warm-text mb-1">Kategori</label>
                    <select value={agendaForm.kategori} onChange={(e) => setAgendaForm({ ...agendaForm, kategori: e.target.value as any })} className="w-full px-3 py-2 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all">
                      <option value="akademik">Akademik</option>
                      <option value="asesmen">Asesmen / Penilaian</option>
                      <option value="libur">Libur Sekolah / Nasional</option>
                      <option value="sekolah">Seremoni Sekolah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-warm-text mb-1.5">Warna Tag</label>
                    <div className="flex items-center gap-2">
                      {[
                        { key: "akademik", color: "bg-[#2D6A4F]" },
                        { key: "asesmen", color: "bg-[#D97706]" },
                        { key: "libur", color: "bg-[#EF4444]" },
                        { key: "sekolah", color: "bg-[#0096C7]" }
                      ].map((c) => (
                        <button key={c.key} type="button" onClick={() => setAgendaForm({ ...agendaForm, kategori: c.key as any })} className={`w-7 h-7 rounded-full ${c.color} transition-all cursor-pointer ${agendaForm.kategori === c.key ? "ring-2 ring-offset-2 ring-forest" : "ring-1 ring-offset-1 ring-transparent hover:ring-warm-border"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-warm-text mb-1">Tanggal Mulai</label>
                      <input type="date" value={agendaForm.tanggal} onChange={(e) => setAgendaForm({ ...agendaForm, tanggal: e.target.value })} className="w-full px-3 py-2 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block font-bold text-warm-text mb-1">Tanggal Selesai</label>
                      <input type="date" value={agendaForm.tanggalSelesai} onChange={(e) => setAgendaForm({ ...agendaForm, tanggalSelesai: e.target.value })} className="w-full px-3 py-2 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-warm-text mb-1">Deskripsi</label>
                    <textarea value={agendaForm.deskripsi} onChange={(e) => setAgendaForm({ ...agendaForm, deskripsi: e.target.value })} className="w-full px-3 py-2 border border-warm-border rounded-xl bg-warm-bg text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all resize-none" rows={3} placeholder="Penjelasan singkat tentang kegiatan..." />
                  </div>
                  <button onClick={handleAddAgenda} className="w-full py-2.5 bg-forest hover:bg-forest-dark text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer">
                    <Save className="h-4 w-4" /> Jadwalkan Agenda
                  </button>
                  <button onClick={() => setAgendaForm({ tanggal: "", tanggalSelesai: "", kegiatan: "", deskripsi: "", kategori: "akademik" })} className="w-full py-2 text-warm-secondary font-medium rounded-xl hover:bg-warm-bg transition-all text-xs cursor-pointer">
                    Hapus Draf
                  </button>
                </div>
              </div>

              {/* Card: Quick Stats */}
              <div className="bg-gradient-to-br from-forest to-forest-dark rounded-2xl p-5 text-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-80">Sisa Agenda</p>
                    <h5 className="text-3xl font-bold mt-1">{remainingCount} Item</h5>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>{nextAgenda ? `Selanjutnya: ${nextAgenda.kegiatan} (${formatDate(nextAgenda.tanggal)})` : "Tidak ada agenda mendatang"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ RIGHT COLUMN (8/12) ═══ */}
            <div className="lg:col-span-8 space-y-4">
              {/* Filter Bar */}
              <div className="bg-warm-card border border-warm-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center shadow-sm">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-muted" />
                  <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full bg-warm-bg border border-warm-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" placeholder="Cari agenda berdasarkan nama atau deskripsi..." />
                </div>
                <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="bg-warm-bg border border-warm-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all w-full sm:w-auto">
                  <option value="all">Semua Kategori</option>
                  <option value="akademik">Akademik</option>
                  <option value="asesmen">Asesmen</option>
                  <option value="libur">Libur</option>
                  <option value="sekolah">Sekolah</option>
                </select>
              </div>

              {/* Table */}
              <div className="bg-warm-card border border-warm-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-warm-bg border-b border-warm-border">
                      <tr>
                        <th className="px-5 py-3.5 text-[10px] font-bold uppercase text-warm-secondary tracking-wider">Detail Kegiatan</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold uppercase text-warm-secondary tracking-wider">Kategori</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold uppercase text-warm-secondary tracking-wider">Jadwal</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold uppercase text-warm-secondary tracking-wider text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-border">
                      {paginatedAgenda.length > 0 ? paginatedAgenda.map((ag: any) => {
                        const isUpcoming = ag.tanggal >= todayStr;
                        return (
                          <tr key={ag.id} className={`hover:bg-warm-bg/30 transition-colors group ${isUpcoming ? "bg-forest/[0.02]" : ""}`}>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-10 rounded-full shrink-0 ${ag.kategori === "akademik" ? "bg-[#2D6A4F]" : ag.kategori === "asesmen" ? "bg-[#D97706]" : ag.kategori === "libur" ? "bg-[#EF4444]" : "bg-[#0096C7]"}`} />
                                <div className="min-w-0">
                                  <p className={`font-bold text-sm ${isUpcoming ? "text-forest" : "text-warm-text"}`}>{ag.kegiatan}</p>
                                  {ag.deskripsi && <p className="text-xs text-warm-muted truncate max-w-[220px] mt-0.5">{ag.deskripsi}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${kategoriColors[ag.kategori] || "bg-warm-bg text-warm-secondary border-warm-border"}`}>
                                {kategoriLabels[ag.kategori] || ag.kategori}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="text-sm text-warm-secondary">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-warm-muted" />
                                  <span className="font-medium text-warm-text">{formatDate(ag.tanggal)}</span>
                                </div>
                                {ag.tanggalSelesai && (
                                  <div className="flex items-center gap-1.5 mt-0.5 text-xs opacity-70">
                                    <ArrowRight className="h-3 w-3" />
                                    <span>{formatDate(ag.tanggalSelesai)}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 text-warm-muted hover:text-forest hover:bg-forest/10 rounded-lg transition-all cursor-pointer" title="Edit">
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDeleteAgenda(ag.id)} className="p-1.5 text-warm-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="Hapus">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-warm-muted text-sm">
                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            {searchQuery || categoryFilter !== "all" ? "Tidak ada agenda yang cocok dengan filter." : "Belum ada agenda akademik yang ditambahkan."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-5 py-3.5 bg-warm-bg border-t border-warm-border flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-warm-muted">Menampilkan <span className="font-bold text-warm-text">{(safePage - 1) * itemsPerPage + 1}-{Math.min(safePage * itemsPerPage, filteredAgenda.length)}</span> dari <span className="font-bold text-warm-text">{filteredAgenda.length}</span> agenda</p>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setCurrentPage(Math.max(1, safePage - 1))} disabled={safePage <= 1} className="p-1.5 border border-warm-border rounded-lg text-warm-muted hover:bg-warm-card transition-colors disabled:opacity-40 cursor-pointer">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (safePage <= 3) {
                        pageNum = i + 1;
                      } else if (safePage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = safePage - 2 + i;
                      }
                      return (
                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${safePage === pageNum ? "bg-forest text-white" : "hover:bg-warm-card text-warm-secondary"}`}>
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && safePage < totalPages - 2 && (
                      <>
                        <span className="px-0.5 text-warm-muted text-xs">...</span>
                        <button onClick={() => setCurrentPage(totalPages)} className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold hover:bg-warm-card text-warm-secondary cursor-pointer">{totalPages}</button>
                      </>
                    )}
                    <button onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))} disabled={safePage >= totalPages} className="p-1.5 border border-warm-border rounded-lg text-warm-muted hover:bg-warm-card transition-colors disabled:opacity-40 cursor-pointer">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Alert: Konflik */}
              {agendaList.length > 5 && (
                <div className="bg-amber-50 text-amber-900 p-4 rounded-2xl flex gap-3 items-start border border-amber-200">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h6 className="font-bold text-sm">Perhatian: Potensi Jadwal Tumpang Tindih</h6>
                    <p className="text-xs mt-0.5 opacity-80">Terdapat lebih dari 5 agenda dalam kalender. Harap periksa kembali tanggal untuk menghindari bentrok jadwal kegiatan sekolah.</p>
                    <button className="mt-2 px-3 py-1 bg-amber-600 text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all cursor-pointer">Tinjau Jadwal</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          ) : (
          <OfficialKaldikView config={config} />
          )}

          {importModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setImportModal({ ...importModal, open: false })}>
            <div className="bg-warm-card rounded-2xl shadow-xl border border-warm-border w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-warm-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-forest" />
                  <h4 className="font-bold text-warm-text">Import Kalender dari PDF</h4>
                </div>
                <button onClick={() => setImportModal({ ...importModal, open: false })} className="p-1.5 hover:bg-warm-bg rounded-lg transition-colors cursor-pointer" title="Tutup">
                  <X className="h-5 w-5 text-warm-secondary" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {importModal.loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-10 h-10 border-3 border-forest border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-warm-secondary">AI sedang membaca dan mengekstrak kalender dari PDF...</p>
                    <p className="text-xs text-warm-muted">Proses ini memakan waktu beberapa detik</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-warm-muted mb-4">
                      Ditemukan <span className="font-bold text-warm-text">{importModal.agenda.length}</span> agenda. Centang yang ingin diimport ke kalender sekolah.
                      {importModal.agenda.length > 0 && (
                        <span className="ml-2">
                          <button onClick={() => {
                            const all = new Set(importModal.agenda.map((_: any, i: number) => i));
                            setImportModal({ ...importModal, selected: all.size === importModal.selected.size ? new Set() : all });
                          }} className="text-forest hover:underline text-xs font-bold cursor-pointer">
                            {importModal.selected.size === importModal.agenda.length ? "Hapus semua" : "Pilih semua"}
                          </button>
                        </span>
                      )}
                    </p>
                    {importModal.agenda.length === 0 ? (
                      <div className="text-center py-10 text-warm-muted text-sm">
                        <p>Tidak ada agenda yang dapat diekstrak dari PDF ini.</p>
                        <p className="text-xs mt-1">Pastikan file berisi teks kalender pendidikan (bukan hasil scan/gambar).</p>
                      </div>
                    ) : importModal.agenda.map((ag: any, i: number) => (
                      <label key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer ${importModal.selected.has(i) ? "border-forest/40 bg-forest/[0.03]" : "border-warm-border hover:bg-warm-bg"}`}>
                        <input type="checkbox" checked={importModal.selected.has(i)} onChange={() => {
                          const newSet = new Set(importModal.selected);
                          newSet.has(i) ? newSet.delete(i) : newSet.add(i);
                          setImportModal({ ...importModal, selected: newSet });
                        }} className="mt-0.5 accent-forest shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-warm-text">{ag.kegiatan}</p>
                            <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${kategoriColors[ag.kategori] || "bg-warm-bg text-warm-secondary border-warm-border"}`}>
                              {kategoriLabels[ag.kategori] || ag.kategori}
                            </span>
                          </div>
                          <p className="text-xs text-warm-secondary mt-0.5">
                            {ag.tanggal && formatDate(ag.tanggal)}{ag.tanggalSelesai ? ` — ${formatDate(ag.tanggalSelesai)}` : ""}
                          </p>
                          {ag.deskripsi && <p className="text-xs text-warm-muted mt-1">{ag.deskripsi}</p>}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-warm-border flex items-center justify-between shrink-0">
                <button onClick={() => setImportModal({ ...importModal, open: false })} className="px-4 py-2 border border-warm-border rounded-xl text-sm font-bold text-warm-secondary hover:bg-warm-bg transition-all cursor-pointer">
                  Batal
                </button>
                <button onClick={handleConfirmImport} disabled={importModal.loading || importModal.selected.size === 0}
                  className="px-5 py-2 bg-forest hover:bg-forest-dark disabled:bg-warm-muted text-white rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed cursor-pointer flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Import {importModal.selected.size} Agenda
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      )}

      {/* TAB RPE */}
      {activeSubTab === "rpe" && (
        <RPEPanel config={config} onUpdateConfig={onUpdateConfig} />
      )}

      {/* TAB 6: AKUN ADMIN */}
      {activeSubTab === "akun" && (
        <AkunAdminForm config={config} onUpdateConfig={onUpdateConfig} />
      )}
    </div>
  );
}

// ─── Akun Admin Sub-Component ───────────────────────────────────────
function AkunAdminForm({ config, onUpdateConfig }: Props) {
  const [newUsername, setNewUsername] = useState(config.adminUsername || "admin");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fonnteToken, setFonnteToken] = useState(config.fonnteToken || "");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) {
      setMsg({ type: "err", text: "Konfirmasi password tidak cocok!" });
      return;
    }
    onUpdateConfig({
      ...config,
      adminUsername: newUsername,
      adminPassword: newPassword || config.adminPassword,
      fonnteToken
    });
    setNewPassword("");
    setConfirmPassword("");
    setMsg({ type: "ok", text: "Konfigurasi akun admin berhasil disimpan!" });
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-warm-bg p-5 rounded-xl border border-warm-border space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wide text-warm-text flex items-center gap-1.5">
          <KeyRound className="h-4 w-4 text-forest" aria-hidden="true" />
          Ubah Kredensial Administrator
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-warm-text mb-1">Username Baru</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-warm-muted pointer-events-none"><User className="h-4 w-4" /></span>
              <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full pl-9 pr-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="admin" />
            </div>
          </div>
          <div>
            <label className="block font-bold text-warm-text mb-1">Token API Fonnte (WA Gateway)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-warm-muted pointer-events-none"><Smartphone className="h-4 w-4" /></span>
              <input type="text" value={fonnteToken} onChange={(e) => setFonnteToken(e.target.value)} className="w-full pl-9 pr-3 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="Isi token dari fonnte.com" />
            </div>
            <p className="text-[10px] text-warm-secondary mt-1">Dapatkan token di <span className="font-mono">fonnte.com</span> &rarr; Settings &rarr; Token</p>
          </div>
          <div>
            <label className="block font-bold text-warm-text mb-1">Password Baru (kosongkan jika tidak diubah)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-warm-muted pointer-events-none"><Lock className="h-4 w-4" /></span>
              <input type={showPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-9 pr-10 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="Biarkan kosong jika tidak ganti" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-warm-muted hover:text-warm-text transition-colors cursor-pointer">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <div>
            <label className="block font-bold text-warm-text mb-1">Konfirmasi Password Baru</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-warm-muted pointer-events-none"><KeyRound className="h-4 w-4" /></span>
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-9 pr-10 py-1.5 border border-warm-border rounded-lg bg-warm-card" placeholder="Ulangi password baru" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-warm-muted hover:text-warm-text transition-colors cursor-pointer">{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
        </div>
        {msg && (
          <div className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${msg.type === "ok" ? "bg-forest/10 text-forest border border-forest/20" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {msg.type === "ok" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {msg.text}
          </div>
        )}
        <div className="flex justify-end pt-2">
          <button onClick={handleSave} className="px-5 py-2 bg-forest hover:bg-forest-dark text-white text-[11px] font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer">
            <Check className="h-3.5 w-3.5" /> Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
