import React, { useState, useEffect, useCallback } from "react";
import {
  loadAdminMasterConfig,
  saveAdminMasterConfig,
  loadTeacherPortfolio,
  saveTeacherPortfolio,
  AdminMasterConfig,
  INITIAL_STATE
} from "./utils";
import { AdministrasiTahunState } from "./types";
import { generateExportHtml, generateExportHtmlForTab, TAB_FILENAMES } from "./exportHtml";
import { cloudGet, apiFetch, CLOUD_KEYS } from "./api";

import HalamanCover from "./components/HalamanCover";
import KalenderAkademikView from "./components/KalenderAkademikView";
import ProgramKurikulum from "./components/ProgramKurikulum";
import ModulAjarView from "./components/ModulAjarView";
import JurnalHarianView from "./components/JurnalHarianView";
import KehadiranPembelajaran from "./components/KehadiranPembelajaran";
import AnalisisAkademik from "./components/AnalisisAkademik";
import AdministrasiKelasKokurikuler from "./components/AdministrasiKelasKokurikuler";
import RefleksiPenutup from "./components/RefleksiPenutup";
import DashboardKesiapan from "./components/DashboardKesiapan";

import AdminPanel from "./components/AdminPanel";
import MonitoringPanel from "./components/MonitoringPanel";
import LoginScreen from "./components/LoginScreen";

import {
  FileText,
  Calendar,
  BookOpen,
  Sparkles,
  ClipboardList,
  Users,
  TrendingUp,
  School,
  Heart,
  Printer,
  Download,
  RefreshCw,
  CheckCircle2,
  Folders,
  GraduationCap,
  Activity,
  LogOut,
  Settings,
  Database,
  AlertTriangle,
  X,
  Save
} from "lucide-react";

function ConfirmDialog({ open, title, message, onConfirm, onCancel }: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => dialogRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h2 id="confirm-title" className="text-base font-bold text-stone-800">{title}</h2>
            <p className="text-sm text-stone-600 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-forest text-white font-semibold text-sm hover:bg-forest-dark transition-colors focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 cursor-pointer"
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ role: "admin" | "guru"; teacherId?: string } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("sias_session");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading session:", e);
    }
    return null;
  });

  const [adminConfig, setAdminConfig] = useState<AdminMasterConfig>(() => loadAdminMasterConfig());
  const [state, setState] = useState<AdministrasiTahunState | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeAdminTab, setActiveAdminTab] = useState<"database" | "monitoring">("database");
  const [isSavedNotify, setIsSavedNotify] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  // Hydrasi config admin dari cloud (data pusat) saat aplikasi dimuat.
  useEffect(() => {
    let alive = true;
    (async () => {
      const cloud = await cloudGet<AdminMasterConfig>(CLOUD_KEYS.adminMaster);
      if (!alive || !cloud) return;
      setAdminConfig((prev) => ({ ...prev, ...cloud }));
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (currentUser?.role === "guru" && currentUser?.teacherId) {
      const activeProfile = adminConfig.gurus.find((g) => g.id === currentUser.teacherId) || adminConfig.gurus[0];
      let alive = true;
      setActiveTab("dashboard");
      (async () => {
        // Muat cache lokal dulu (responsif), lalu ambil versi cloud (otoritatif).
        const local = loadTeacherPortfolio(currentUser.teacherId!, activeProfile);
        if (alive) setState(local);
        const cloud = await cloudGet<AdministrasiTahunState>(
          `${CLOUD_KEYS.portfolioPrefix}${currentUser.teacherId}`
        );
        if (alive && cloud) {
          const merged: AdministrasiTahunState = {
            ...INITIAL_STATE,
            ...cloud,
            identitas: { ...INITIAL_STATE.identitas, ...activeProfile, ...cloud.identitas },
          };
          if (!Array.isArray(merged.modul)) merged.modul = [merged.modul];
          setState(merged);
        }
      })();
      return () => { alive = false; };
    } else {
      setState(null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (state && currentUser?.role === "guru" && currentUser?.teacherId) {
      saveTeacherPortfolio(currentUser.teacherId, state);
      setIsSavedNotify(true);
      const t = setTimeout(() => setIsSavedNotify(false), 1200);
      return () => clearTimeout(t);
    }
  }, [state, currentUser]);

  const handleUpdateAdminConfig = (newConfig: AdminMasterConfig) => {
    setAdminConfig(newConfig);
    saveAdminMasterConfig(newConfig);
    setIsSavedNotify(true);
    setTimeout(() => setIsSavedNotify(false), 1200);
  };

  const handleLogin = (role: "admin" | "guru", teacherId?: string) => {
    const session = { role, teacherId };
    setCurrentUser(session);
    if (typeof window !== "undefined") {
      localStorage.setItem("sias_session", JSON.stringify(session));
    }
  };

  const handleLogout = useCallback(() => {
    setConfirmAction({
      title: "Keluar dari Portal",
      message: "Apakah Anda yakin ingin keluar dari portal SMAN 1 Kota Bandung?",
      onConfirm: () => {
        setCurrentUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("sias_session");
        }
        setConfirmAction(null);
      }
    });
  }, []);

  const handleResetData = useCallback(() => {
    setConfirmAction({
      title: "Reset Data Administrasi",
      message: "Seluruh berkas administrasi akan dikembalikan ke setelan bawaan. Data catatan harian & evaluasi saat ini akan dihapus. Lanjutkan?",
      onConfirm: () => {
        if (!currentUser?.teacherId) return;
        const activeProfile = adminConfig.gurus.find((g) => g.id === currentUser.teacherId) || adminConfig.gurus[0];
        const cleanState: AdministrasiTahunState = {
          ...INITIAL_STATE,
          identitas: { ...INITIAL_STATE.identitas, ...activeProfile }
        };
        setState(cleanState);
        saveTeacherPortfolio(currentUser.teacherId, cleanState);
        setConfirmAction(null);
      }
    });
  }, [currentUser, adminConfig]);

  const handleStateChange = (updater: (s: AdministrasiTahunState) => AdministrasiTahunState) => {
    setState((prev) => {
      if (!prev) return prev;
      return updater(prev);
    });
  };

  const handleManualSave = () => {
    if (!state || !currentUser?.teacherId) return;
    saveTeacherPortfolio(currentUser.teacherId, state);
    setIsSavedNotify(true);
    setTimeout(() => setIsSavedNotify(false), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDocx = async () => {
    if (!state) return;
    const html = generateExportHtml(state);
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    try {
      const res = await apiFetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, orientation: "portrait" })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Server error (" + res.status + ")");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "portofolio_guru_" + y + "-" + m + "-" + d + ".docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Gagal mengexport DOCX:", e);
      alert("Gagal mengexport dokumen. Pastikan server sedang berjalan.");
    }
  };

  const handleDownloadDocxTab = async (tabId: string, label: string) => {
    if (!state) return;
    const html = generateExportHtmlForTab(state, tabId);
    if (!html) return;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const filename = TAB_FILENAMES[tabId] || tabId;
    try {
      const res = await apiFetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, orientation: tabId === "kurikulum" || tabId === "jurnal" ? "landscape" : "portrait" })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Server error (" + res.status + ")");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "portofolio_" + filename + "_" + y + "-" + m + "-" + d + ".docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Gagal mengexport DOCX:", e);
      alert("Gagal mengexport dokumen. Pastikan server sedang berjalan.");
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard Utama / Kesiapan", icon: Activity, desc: "Evaluasi Audit Kesiapan Akreditasi" },
    { id: "cover", label: "1 & 2. Cover / Identitas", icon: FileText, desc: "Sampul Administrasi Resmi & Biodata" },
    { id: "kalender", label: "3 & 9. Kalender / Mengajar", icon: Calendar, desc: "Minggu Efektif & Timetable Mengajar" },
    { id: "kurikulum", label: "4, 5 & 6. PROTA / PROMES / ATP", icon: BookOpen, desc: "Alokasi Waktu, Distribusi, & Alur" },
    { id: "modul", label: "7. Modul Ajar (Multi)", icon: Sparkles, desc: "Skenario Kelas & Skenario Deep Learning" },
    { id: "jurnal", label: "8. Jurnal Harian Guru", icon: ClipboardList, desc: "Agenda Mengajar Luring & Tindak Lanjut" },
    { id: "presensi", label: "10 & 11. Presensi & Asesmen", icon: Users, desc: "Roster Kelas & Kisi-Kisi Rubrik HOTS" },
    { id: "analisis", label: "12, 13 & 14. Rapor / Remedial / BK", icon: TrendingUp, desc: "Kalkulator Nilai Kelas, Susulan, & BK" },
    { id: "walikelas", label: "15 & 16. Walikelas & Kokurikuler", icon: School, desc: "Struktur Kelas, Piket, Proyek Kokurikuler, & Portofolio" },
    { id: "refleksi", label: "18 & 19. Refleksi & Penutup", icon: Heart, desc: "Self SWOT, Dedikasi & Istirahat" }
  ];

  if (!currentUser) {
    return <LoginScreen config={adminConfig} onLogin={handleLogin} />;
  }

  if (currentUser.role === "admin") {
    return (
      <div id="portal-root-admin" className="min-h-screen bg-dark-bg flex flex-col md:flex-row font-sans text-dark-text antialiased select-none">
        <ConfirmDialog
          open={confirmAction !== null}
          title={confirmAction?.title || ""}
          message={confirmAction?.message || ""}
          onConfirm={confirmAction?.onConfirm || (() => {})}
          onCancel={() => setConfirmAction(null)}
        />
        <aside
          className="w-full md:w-72 bg-dark-surface text-dark-secondary md:h-screen md:sticky md:top-0 shrink-0 flex flex-col justify-between border-r border-dark-border overflow-y-auto"
          aria-label="Panel Navigasi Admin"
        >
          <div>
            <div className="p-6 bg-dark-bg border-b border-dark-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-forest rounded-xl flex items-center justify-center font-bold text-white text-xs">
                  ADM
                </div>
                <div>
                  <h1 className="text-xs font-bold text-dark-text leading-tight tracking-wider uppercase">SMAN 1 SYSTEM</h1>
                  <p className="text-[10px] text-trust font-bold tracking-widest mt-0.5">Control Room</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-[10px] font-bold uppercase text-dark-secondary tracking-widest px-2.5 flex items-center gap-2 mb-2">
                <Database className="h-3.5 w-3.5" aria-hidden="true" /> Main Menu
              </p>
              <nav className="space-y-1.5">
                <button
                  onClick={() => setActiveAdminTab("database")}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-colors duration-150 flex items-start gap-3 border text-xs ${
                    activeAdminTab === "database"
                      ? "bg-forest text-white border-forest font-bold"
                      : "bg-transparent border-transparent text-dark-secondary hover:bg-dark-surface hover:text-dark-text"
                  } focus-visible:outline-2 focus-visible:outline-amber-accent focus-visible:outline-offset-2 cursor-pointer`}
                >
                  <Database className="h-4.5 w-4.5 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="text-left flex-1 min-w-0">
                    <span className="font-bold block tracking-normal">Database Management</span>
                    <span className="text-[10px] block leading-tight mt-0.5 text-dark-secondary">Guru, Siswa, Kelas, Jadwal &amp; Kalender</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveAdminTab("monitoring")}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-colors duration-150 flex items-start gap-3 border text-xs ${
                    activeAdminTab === "monitoring"
                      ? "bg-forest text-white border-forest font-bold"
                      : "bg-transparent border-transparent text-dark-secondary hover:bg-dark-surface hover:text-dark-text"
                  } focus-visible:outline-2 focus-visible:outline-amber-accent focus-visible:outline-offset-2 cursor-pointer`}
                >
                  <Activity className="h-4.5 w-4.5 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="text-left flex-1 min-w-0">
                    <span className="font-bold block tracking-normal">Menu Monitoring</span>
                    <span className="text-[10px] block leading-tight mt-0.5 text-dark-secondary">Progress Guru, WA, Laporan Kepsek</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
          <div className="p-5 border-t border-dark-border bg-dark-bg space-y-3">
            <div className="text-[10px] text-dark-secondary leading-tight space-y-0.5">
              <div>Sesi: System Admin</div>
              <div>Hak Akses: Penuh (RW)</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-dark-surface hover:bg-red-950 hover:text-red-400 text-dark-secondary rounded-xl border border-dark-border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Keluar Sesi
            </button>
          </div>
        </aside>
        <div className="flex-grow flex flex-col md:h-screen md:overflow-hidden bg-dark-bg">
          <header className="h-16 bg-dark-surface/80 border-b border-dark-border px-6 py-3 flex items-center justify-between shadow-sm z-10 shrink-0">
            <div>
              <h2 className="text-sm font-bold text-dark-text tracking-tight">Sistem Akademik Terintegrasi (SIAS)</h2>
              <p className="text-[10px] text-dark-secondary font-bold tracking-wider mt-0.5">Control Room Server SMAN 1 Bandung</p>
            </div>
            <div className="flex items-center gap-4">
              <span
                aria-live="polite"
                className={`text-[10px] font-bold px-3 py-1 rounded transition-opacity duration-300 ${
                  isSavedNotify ? "bg-forest-light/30 text-forest border border-forest-light/50" : "bg-dark-surface text-dark-secondary"
                }`}
              >
                {isSavedNotify ? "Menyimpan Konfigurasi..." : "Sistem Siap"}
              </span>
              <button
                onClick={handleLogout}
                aria-label="Keluar sesi admin"
                className="p-2 text-dark-secondary hover:text-dark-text hover:bg-dark-surface rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-forest cursor-pointer"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </header>
          <main id="main-content" className="flex-grow p-6 md:p-8 bg-dark-bg overflow-y-auto md:max-h-[calc(100vh-64px)]">
            {activeAdminTab === "database" && (
              <AdminPanel config={adminConfig} onUpdateConfig={handleUpdateAdminConfig} />
            )}
            {activeAdminTab === "monitoring" && (
              <MonitoringPanel config={adminConfig} />
            )}
          </main>
        </div>
      </div>
    );
  }

  const activeTeacherProfile = adminConfig.gurus.find((g) => g.id === currentUser.teacherId) || adminConfig.gurus[0];

  return (
    <div id="portal-root-teacher" className="min-h-screen bg-warm-bg flex flex-col md:flex-row font-sans text-warm-text antialiased print:bg-white print:p-0">
      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmAction?.title || ""}
        message={confirmAction?.message || ""}
        onConfirm={confirmAction?.onConfirm || (() => {})}
        onCancel={() => setConfirmAction(null)}
      />
      <aside
        className="w-full md:w-80 bg-dark-bg text-dark-secondary md:h-screen md:sticky md:top-0 shrink-0 flex flex-col justify-between border-r border-dark-border print:hidden shadow-sm overflow-y-auto"
        aria-label="Navigasi Dokumen Guru"
      >
        <div>
          <div className="p-6 bg-dark-bg border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-forest rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden" aria-hidden="true">
                {state?.identitas?.logoUrl ? (
                  <img src={state.identitas.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <School className="h-5 w-5" />
                )}
              </div>
              <div>
                <h1 className="text-xs font-bold text-dark-text leading-tight tracking-wider uppercase">{state?.identitas?.namaSekolah || activeTeacherProfile?.namaSekolah || "SMAN 1 BANDUNG"}</h1>
                <p className="text-[10px] text-trust font-bold tracking-widest uppercase mt-0.5">Kurikulum Merdeka</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-dark-secondary tracking-widest px-3 mb-3.5 flex items-center gap-2">
                <Folders className="h-3.5 w-3.5" aria-hidden="true" /> Dokumen & Perangkat Ajar
              </p>
              <nav className="space-y-1.5" aria-label="Menu dokumen guru">
                {menuItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => setActiveTab(item.id)}
                        aria-current={isActive ? "page" : undefined}
                        className={`w-full text-left px-3.5 py-3 rounded-xl transition-colors duration-150 flex items-start gap-3 border text-xs ${
                          isActive
                            ? "bg-forest text-white border-forest font-bold"
                            : "bg-transparent border-transparent text-dark-secondary hover:bg-dark-surface hover:text-dark-text"
                        } focus-visible:outline-2 focus-visible:outline-amber-accent focus-visible:outline-offset-2 cursor-pointer`}
                      >
                        <IconComp className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${isActive ? "text-white" : "text-dark-secondary"}`} aria-hidden="true" />
                        <div className="text-left flex-1 min-w-0">
                          <span className="font-bold block tracking-normal">{item.label}</span>
                          <span className={`text-[10px] block leading-tight mt-0.5 ${isActive ? "text-amber-light" : "text-dark-secondary"}`}>
                            {item.desc}
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadDocxTab(item.id, item.label);
                        }}
                        title={`Download ${item.label}`}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors duration-150 ${
                          isActive
                            ? "text-white hover:bg-white/20"
                            : "bg-dark-surface/70 text-amber-accent hover:bg-amber-accent hover:text-white"
                        } focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer`}
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-dark-border bg-dark-bg text-xs text-dark-secondary space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0" aria-hidden="true">
              {state?.identitas?.namaGuru ? state.identitas.namaGuru.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "AG"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-dark-text truncate leading-snug">{state?.identitas?.namaGuru || activeTeacherProfile?.namaGuru}</p>
              <p className="text-[10px] text-dark-secondary leading-normal truncate mt-0.5">{state?.identitas?.mapel || activeTeacherProfile?.mapel}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-dark-border">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-dark-surface hover:bg-red-950 hover:text-red-400 text-dark-secondary rounded-xl border border-dark-border text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Keluar Portal
            </button>
          </div>
        </div>
      </aside>
      <div className="flex-grow flex flex-col md:h-screen md:overflow-hidden print:block print:h-auto">
        <header className="h-16 bg-warm-card border-b border-warm-border px-6 py-3 flex items-center justify-between shadow-sm z-10 shrink-0 print:hidden flex-wrap gap-4">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-warm-text tracking-tight">Portofolio Administrasi Guru Profesional</h2>
            <p className="text-[10px] text-warm-secondary font-bold tracking-wider uppercase">
              Tahun Ajaran {activeTeacherProfile?.tahunAjaran || "2026/2027"} &bull; Semester {activeTeacherProfile?.semester}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-warm-text">{activeTeacherProfile?.namaGuru}</p>
              <p className="text-[10px] text-warm-secondary">NIP: {activeTeacherProfile?.nipGuru || "-"}</p>
            </div>
            <button
              onClick={handleManualSave}
              aria-live="polite"
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                isSavedNotify
                  ? "bg-green-100 text-green-700 border-green-300 scale-105"
                  : "bg-forest text-white border-forest hover:bg-forest-dark active:scale-95"
              }`}
            >
              {isSavedNotify ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Data Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Simpan</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadDocx}
              className="bg-warm-card hover:bg-warm-bg text-forest border border-forest font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 active:scale-[0.98] uppercase tracking-wider focus-visible:outline-2 focus-visible:outline-amber-accent focus-visible:outline-offset-2 cursor-pointer"
            >
              <Download className="h-4 w-4" aria-hidden="true" /> DOCX
            </button>
            <button
              onClick={handlePrint}
              className="bg-forest hover:bg-forest-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 active:scale-[0.98] uppercase tracking-wider focus-visible:outline-2 focus-visible:outline-amber-accent focus-visible:outline-offset-2 cursor-pointer"
            >
              <Printer className="h-4 w-4" aria-hidden="true" /> Cetak Buku
            </button>
            <button
              onClick={handleResetData}
              aria-label="Reset ke template default"
              className="p-2 text-warm-secondary hover:text-warm-text hover:bg-warm-bg rounded-xl transition-colors border border-warm-border bg-warm-card focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>
        <main id="main-content" className="flex-grow p-6 md:p-8 bg-warm-bg overflow-y-auto md:max-h-[calc(100vh-64px)] print:p-0 print:overflow-visible print:max-h-full print:bg-white">
          <div className="max-w-7xl mx-auto space-y-6">
            {!state ? (
              <div className="text-center py-12 text-warm-secondary space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-forest" aria-hidden="true" />
                <p className="text-xs font-bold">Mempersiapkan Portofolio Pembelajaran...</p>
              </div>
            ) : (
              <>
                {activeTab === "dashboard" && (
                  <div className="print:hidden">
                    <DashboardKesiapan state={state} onNavigate={(tabId) => setActiveTab(tabId)} />
                  </div>
                )}
                {activeTab === "cover" && <HalamanCover state={state} onChange={handleStateChange} />}
                {activeTab === "kalender" && <KalenderAkademikView state={state} onChange={handleStateChange} />}
                {activeTab === "kurikulum" && <ProgramKurikulum state={state} onChange={handleStateChange} />}
                {activeTab === "modul" && <ModulAjarView state={state} onChange={handleStateChange} />}
                {activeTab === "jurnal" && <JurnalHarianView state={state} onChange={handleStateChange} />}
                {activeTab === "presensi" && <KehadiranPembelajaran state={state} onChange={handleStateChange} />}
                {activeTab === "analisis" && <AnalisisAkademik state={state} onChange={handleStateChange} />}
                {activeTab === "walikelas" && <AdministrasiKelasKokurikuler state={state} onChange={handleStateChange} />}
                {activeTab === "refleksi" && <RefleksiPenutup state={state} onChange={handleStateChange} />}
              </>
            )}
            {/* Tombol Simpan Semua — muncul di setiap panel */}
            {state && currentUser?.role === "guru" && (
              <div className="print:hidden flex justify-end pt-2 pb-4">
                <button
                  onClick={handleManualSave}
                  className={`text-xs font-bold px-5 py-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isSavedNotify
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-forest text-white border-forest hover:bg-forest-dark active:scale-95 shadow-sm"
                  }`}
                >
                  {isSavedNotify ? (
                    <><CheckCircle2 className="h-4 w-4" /> Data Tersimpan!</>
                  ) : (
                    <><Save className="h-4 w-4" /> Simpan Semua Data</>
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
