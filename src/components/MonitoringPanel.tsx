import React, { useState, useEffect } from "react";
import { AdminMasterConfig, loadTeacherPortfolio } from "../utils";
import { AdministrasiTahunState } from "../types";
import {
  Activity,
  TrendingUp,
  Send,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Users,
  Printer,
  Download,
  Smartphone,
  Search,
  ChevronRight,
  Sparkles,
  Edit3,
  Loader,
  Clock,
  Power,
  PowerOff,
  Trash2,
  RefreshCw,
  Plus
} from "lucide-react";

interface Props {
  config: AdminMasterConfig;
}

interface TeacherProgress {
  id: string;
  nama: string;
  mapel: string;
  cover: number;
  kalender: number;
  kurikulum: number;
  modul: number;
  jurnal: number;
  presensi: number;
  analisis: number;
  walikelas: number;
  refleksi: number;
  avg: number;
}

function calcCover(state: AdministrasiTahunState): number {
  const id = state.identitas;
  if (!id) return 0;
  let s = 0;
  if (id.namaSekolah) s += 10;
  if (id.namaGuru) s += 15;
  if (id.nipGuru) s += 10;
  if (id.nuptkGuru) s += 10;
  if (id.mapel) s += 10;
  if (id.kelas) s += 10;
  if (id.semester) s += 15;
  if (id.tahunAjaran) s += 10;
  if (id.namaKepsek) s += 10;
  return Math.min(100, s);
}

function calcKalender(state: AdministrasiTahunState): number {
  const agendaScore = Math.min(50, (state.kalender?.agenda?.length || 0) * 10);
  const scheduleScore = Math.min(50, (state.jadwal?.length || 0) * 12.5);
  return agendaScore + scheduleScore;
}

function calcKurikulum(state: AdministrasiTahunState): number {
  const p = Math.min(35, (state.prota?.items?.length || 0) * 12);
  const pr = Math.min(35, (state.promes?.items?.length || 0) * 12);
  const a = Math.min(30, (state.atp?.length || 0) * 10);
  return p + pr + a;
}

function calcModul(state: AdministrasiTahunState): number {
  const list = state.modul;
  if (!list || !list.length) return 0;
  let total = 0;
  for (const m of list) {
    let s = 0;
    if (m.temaModul) s += 15;
    if (m.tujuanPembelajaran) s += 15;
    const dl = m.kegiatanPembelajaran?.intiDeepLearning;
    if (dl) {
      if (dl.mindfulEngagement?.length >= 2) s += 20;
      if (dl.deepProcessing?.length >= 2) s += 15;
      if (dl.transferOfLearning?.length >= 2) s += 15;
    }
    if (m.diferensiasi?.konten) s += 20;
    total += Math.min(100, s);
  }
  return Math.round(total / list.length);
}

function calcJurnal(state: AdministrasiTahunState): number {
  return Math.min(100, (state.jurnal?.length || 0) * 20);
}

function calcPresensi(state: AdministrasiTahunState): number {
  const siswaScore = Math.min(50, (state.siswaList?.length || 0) * 10);
  const asesmenScore = Math.min(50, (state.asesmenList?.length || 0) * 25);
  return siswaScore + asesmenScore;
}

function calcAnalisis(state: AdministrasiTahunState): number {
  const n = Math.min(40, (state.nilaiSiswaList?.length || 0) * 8);
  const r = Math.min(30, (state.remedialLogs?.length || 0) * 15);
  const b = Math.min(30, (state.bkLogs?.length || 0) * 30);
  return n + r + b;
}

function calcWalikelas(state: AdministrasiTahunState): number {
  let s = 0;
  if (state.strukturKelas?.ketua) s += 25;
  if ((state.jadwalPiket?.length || 0) >= 3) s += 25;
  if ((state.proyekKokurikuler?.length || 0) >= 1) s += 25;
  if ((state.portofolio?.length || 0) >= 2) s += 25;
  return s;
}

function calcRefleksi(state: AdministrasiTahunState): number {
  const ref = state.refleksiTahunan;
  if (!ref) return 0;
  let s = 0;
  if (ref.keberhasilan) s += 20;
  if (ref.tantangan) s += 20;
  if (ref.kendalaUtama) s += 20;
  if (ref.hasilEvaluasi) s += 20;
  if (ref.rencanaPerbaikan) s += 20;
  return s;
}

function ProgressBadge({ value }: { value: number }) {
  let cls = "text-red-700 bg-red-50 border-red-200";
  if (value >= 90) cls = "text-green-700 bg-green-50 border-green-200";
  else if (value >= 60) cls = "text-sky-700 bg-sky-50 border-sky-200";
  else if (value >= 30) cls = "text-amber-700 bg-amber-50 border-amber-200";
  return (
    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>
      {value}%
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  let bg = "bg-red-500";
  if (value >= 90) bg = "bg-green-500";
  else if (value >= 60) bg = "bg-sky-500";
  else if (value >= 30) bg = "bg-amber-500";
  return (
    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
      <div className={`${bg} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function MonitoringPanel({ config }: Props) {
  const [subTab, setSubTab] = useState<"progress" | "reminder" | "broadcast" | "laporan" | "cron">("progress");
  const [progressList, setProgressList] = useState<TeacherProgress[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load all teacher portfolios
  useEffect(() => {
    const list: TeacherProgress[] = config.gurus.map((g) => {
      const portfolio = loadTeacherPortfolio(g.id, g);
      const cover = calcCover(portfolio);
      const kalender = calcKalender(portfolio);
      const kurikulum = calcKurikulum(portfolio);
      const modul = calcModul(portfolio);
      const jurnal = calcJurnal(portfolio);
      const presensi = calcPresensi(portfolio);
      const analisis = calcAnalisis(portfolio);
      const walikelas = calcWalikelas(portfolio);
      const refleksi = calcRefleksi(portfolio);
      const avg = Math.round((cover + kalender + kurikulum + modul + jurnal + presensi + analisis + walikelas + refleksi) / 9);
      return { id: g.id, nama: g.namaGuru, mapel: g.mapel, cover, kalender, kurikulum, modul, jurnal, presensi, analisis, walikelas, refleksi, avg };
    });
    setProgressList(list);
  }, [config]);

  const filteredProgress = progressList.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mapel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reminder / Broadcast state — AI powered
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [aiMessages, setAiMessages] = useState<Record<string, string>>({});
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [waStatus, setWaStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [waMsg, setWaMsg] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Cron job state
  const [cronJobs, setCronJobs] = useState<any[]>([]);
  const [cronName, setCronName] = useState("");
  const [cronTopic, setCronTopic] = useState("");
  const [cronDays, setCronDays] = useState<number[]>([]);
  const [cronTime, setCronTime] = useState("08:00");
  const [cronAllTeachers, setCronAllTeachers] = useState(true);
  const [cronSelectedIds, setCronSelectedIds] = useState<string[]>([]);
  const [cronSaving, setCronSaving] = useState(false);
  const [cronMsg, setCronMsg] = useState("");
  const [cronMsgType, setCronMsgType] = useState<"success" | "error" | "">("");

  const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Load cron jobs
  const loadCronJobs = async () => {
    try {
      const res = await fetch("/api/cron/list");
      const data = await res.json();
      if (data.success) setCronJobs(data.jobs);
    } catch { /* ignore */ }
  };
  useEffect(() => { loadCronJobs(); }, []);

  const toggleCronDay = (d: number) => {
    setCronDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleCreateCron = async () => {
    if (!cronName.trim() || !cronTopic.trim() || cronDays.length === 0) {
      setCronMsg("Isi nama, topik, dan pilih hari."); setCronMsgType("error"); return;
    }
    setCronSaving(true); setCronMsg("");
    const teacherData = progressList.map(p => ({
      nama: p.nama, mapel: p.mapel, telepon: config.gurus.find(g => g.id === p.id)?.teleponGuru || "",
      progressRata: p.avg, kekurangan: getKekurangan(p)
    }));
    const ids = cronAllTeachers ? [] : cronSelectedIds;
    try {
      const res = await fetch("/api/cron/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cronName.trim(), topic: cronTopic.trim(),
          teacherIds: ids, daysOfWeek: cronDays, time: cronTime,
          fonnteToken: config.fonnteToken, teacherData
        })
      });
      const data = await res.json();
      if (data.success) {
        setCronMsg("Cron job berhasil dibuat!"); setCronMsgType("success");
        setCronName(""); setCronTopic(""); setCronDays([]); setCronTime("08:00");
        setCronAllTeachers(true); setCronSelectedIds([]);
        loadCronJobs();
      } else {
        setCronMsg(data.error || "Gagal membuat cron job."); setCronMsgType("error");
      }
    } catch {
      setCronMsg("Gagal terhubung ke server."); setCronMsgType("error");
    }
    setCronSaving(false);
  };

  const handleToggleCron = async (id: string) => {
    try {
      const res = await fetch(`/api/cron/${id}/toggle`, { method: "POST" });
      const data = await res.json();
      if (data.success) loadCronJobs();
    } catch { /* ignore */ }
  };

  const handleDeleteCron = async (id: string) => {
    try {
      const res = await fetch(`/api/cron/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) loadCronJobs();
    } catch { /* ignore */ }
  };

  const handleSyncCron = async (id: string) => {
    const teacherData = progressList.map(p => ({
      nama: p.nama, mapel: p.mapel, telepon: config.gurus.find(g => g.id === p.id)?.teleponGuru || "",
      progressRata: p.avg, kekurangan: getKekurangan(p)
    }));
    try {
      const res = await fetch(`/api/cron/${id}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherData, fonnteToken: config.fonnteToken })
      });
      const data = await res.json();
      if (data.success) {
        setCronMsg("Data progress & token berhasil disinkron!"); setCronMsgType("success");
        loadCronJobs();
      }
    } catch { /* ignore */ }
  };

  const getScheduleLabel = (dow: number[], time: string): string => {
    const days = dow.map(d => DAY_LABELS[d]).filter(Boolean);
    return `${days.join(", ")} pukul ${time}`;
  };

  const getNextRunDate = (dow: number[], time: string): string => {
    if (!dow.length) return "-";
    const [h, m] = time.split(":").map(Number);
    const now = new Date();
    const todayDow = now.getDay();
    for (let i = 0; i < 7; i++) {
      const checkDow = (todayDow + i) % 7;
      if (dow.includes(checkDow)) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        d.setHours(h, m, 0, 0);
        if (d <= now) continue;
        return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      }
    }
    return "-";
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const getKekurangan = (p: TeacherProgress): string => {
    const items = [
      { k: "cover", label: "Cover/Identitas", v: p.cover },
      { k: "kalender", label: "Kalender Akademik", v: p.kalender },
      { k: "kurikulum", label: "PROTA/PROMES/ATP", v: p.kurikulum },
      { k: "modul", label: "Modul Ajar", v: p.modul },
      { k: "jurnal", label: "Jurnal Harian", v: p.jurnal },
      { k: "presensi", label: "Presensi & Asesmen", v: p.presensi },
      { k: "analisis", label: "Analisis & Remedial", v: p.analisis },
      { k: "walikelas", label: "Walikelas & Kokurikuler", v: p.walikelas },
      { k: "refleksi", label: "Refleksi & Penutup", v: p.refleksi }
    ].sort((a, b) => a.v - b.v).slice(0, 3);
    return items.map((i) => `${i.label} (${i.v}%)`).join(", ");
  };

  const generateAiReminders = async (targetIds: string[]) => {
    if (!topic.trim()) {
      setWaMsg("Isi topik/prompt pesan terlebih dahulu.");
      setWaStatus("error");
      return;
    }
    if (targetIds.length === 0) {
      setWaMsg("Pilih minimal satu guru penerima.");
      setWaStatus("error");
      return;
    }
    setIsGenerating(true);
    setWaMsg("AI sedang membuat variasi pesan untuk setiap guru...");
    setWaStatus("idle");
    try {
      const teachers = targetIds.map((id) => {
        const p = progressList.find((x) => x.id === id);
        return p ? { nama: p.nama, mapel: p.mapel, progressRata: p.avg, kekurangan: getKekurangan(p) } : null;
      }).filter(Boolean);
      const res = await fetch("/api/gemini/generate-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, teachers })
      });
      const data = await res.json();
      if (data.success && data.reminders) {
        const msgs: Record<string, string> = {};
        data.reminders.forEach((r: any) => {
          const id = targetIds[r.teacherIndex];
          if (id) msgs[id] = r.message;
        });
        setAiMessages(msgs);
        setWaStatus("done");
        setWaMsg(`Berhasil generate ${Object.keys(msgs).length} pesan variatif! Silakan review sebelum kirim.`);
      } else {
        setWaStatus("error");
        setWaMsg(data.error || "Gagal generate pesan.");
      }
    } catch (err: any) {
      setWaStatus("error");
      setWaMsg("Gagal terhubung ke server.");
    }
    setIsGenerating(false);
  };

  const startEdit = (id: string) => {
    setEditingTeacherId(id);
    setEditText(aiMessages[id] || "");
  };

  const saveEdit = (id: string) => {
    setAiMessages((prev) => ({ ...prev, [id]: editText }));
    setEditingTeacherId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingTeacherId(null);
    setEditText("");
  };

  const handleSendUniqueWA = async (targetIds: string[]) => {
    if (!config.fonnteToken) {
      setWaMsg("Token Fonnte belum dikonfigurasi. Isi di menu Akun Admin.");
      setWaStatus("error");
      return;
    }
    if (targetIds.length === 0) {
      setWaMsg("Pilih minimal satu guru penerima.");
      setWaStatus("error");
      return;
    }
    setWaStatus("sending");
    let sent = 0;
    let failed = 0;
    for (const id of targetIds) {
      const msg = aiMessages[id];
      if (!msg) { failed++; continue; }
      const phone = config.gurus.find((g) => g.id === id)?.teleponGuru;
      if (!phone) { failed++; continue; }
      try {
        const res = await fetch("/api/send-wa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: config.fonnteToken, targets: [phone], message: msg })
        });
        const data = await res.json();
        if (data.success) sent++;
        else failed++;
      } catch {
        failed++;
      }
    }
    setWaStatus("done");
    setWaMsg(`Selesai! Terkirim: ${sent}, Gagal: ${failed}`);
  };

  const handleLaporanPrint = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    const totalGuru = progressList.length;
    const avgAll = totalGuru > 0 ? Math.round(progressList.reduce((a, p) => a + p.avg, 0) / totalGuru) : 0;
    const rows = progressList.map((p) => `<tr>
      <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px">${p.nama}</td>
      <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px">${p.mapel}</td>
      <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:center">${p.cover}%</td>
      <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:center">${p.kalender}%</td>
      <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:center">${p.kurikulum}%</td>
      <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:center">${p.modul}%</td>
      <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:center">${p.jurnal}%</td>
      <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:center">${p.presensi}%</td>
      <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:center">${p.analisis}%</td>
      <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:center">${p.walikelas}%</td>
      <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:center">${p.refleksi}%</td>
      <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:center;font-weight:bold">${p.avg}%</td>
    </tr>`).join("");
    printWin.document.write(`<html><head><title>Laporan Monitoring Progress Guru</title><style>
      body{font-family:'Times New Roman',serif;padding:30px}h1{font-size:18px;text-align:center;margin-bottom:4px}
      .sub{text-align:center;font-size:13px;color:#555;margin-bottom:20px}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th{background:#eee;padding:8px;border:1px solid #ccc;font-size:11px;text-align:center}
      .avg-row{font-weight:bold;background:#f5f5f5}
      .footer{text-align:center;margin-top:30px;font-size:12px;color:#555}
    </style></head><body>
    <h1>LAPORAN MONITORING PROGRESS GURU</h1>
    <div class="sub">SMAN 1 Kota Bandung &bull; Tahun Ajaran ${config.gurus[0]?.tahunAjaran || "2026/2027"} &bull; Rata-rata: ${avgAll}%</div>
    <table><thead><tr><th>Nama Guru</th><th>Mapel</th><th>Cover</th><th>Kalender</th><th>Kurikulum</th><th>Modul</th><th>Jurnal</th><th>Presensi</th><th>Analisis</th><th>Walikelas</th><th>Refleksi</th><th>Rata</th></tr></thead><tbody>${rows}<tr class="avg-row"><td colspan="2" style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:right">Rata-rata</td>
        ${["cover","kalender","kurikulum","modul","jurnal","presensi","analisis","walikelas","refleksi"].map((k) => {
          const avg = totalGuru > 0 ? Math.round(progressList.reduce((a, p) => a + (p as any)[k], 0) / totalGuru) : 0;
          return `<td style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:center">${avg}%</td>`;
        }).join("")}
        <td style="padding:6px 8px;border:1px solid #ccc;font-size:12px;text-align:center;font-weight:bold">${avgAll}%</td>
      </tr></tbody></table>
    <div class="footer">Dicetak dari Sistem Informasi Administrasi Sekolah (SIAS) &bull; ${new Date().toLocaleDateString("id-ID")}</div>
    </body></html>`);
    printWin.document.close();
    setTimeout(() => printWin.print(), 500);
  };

  const handleLaporanDocx = async () => {
    const totalGuru = progressList.length;
    const avgAll = totalGuru > 0 ? Math.round(progressList.reduce((a, p) => a + p.avg, 0) / totalGuru) : 0;
    const rows = progressList.map((p) => `<tr>
      <td style="padding:4px 6px;border:1px solid #000;font-size:10pt">${p.nama}</td>
      <td style="padding:4px 6px;border:1px solid #000;font-size:10pt;text-align:center">${p.avg}%</td>
      <td style="padding:4px 6px;border:1px solid #000;font-size:10pt;text-align:center">${p.cover}%</td>
      <td style="padding:4px 6px;border:1px solid #000;font-size:10pt;text-align:center">${p.kalender}%</td>
      <td style="padding:4px 6px;border:1px solid #000;font-size:10pt;text-align:center">${p.walikelas}%</td>
    </tr>`).join("");
    const html = `<h2 style="text-align:center;font-family:'Times New Roman',serif">LAPORAN MONITORING PROGRESS GURU</h2>
    <p style="text-align:center;font-size:11pt;font-family:'Times New Roman',serif">SMAN 1 Kota Bandung &bull; Rata-rata: ${avgAll}%</p>
    <table style="width:100%;border-collapse:collapse;font-family:'Times New Roman',serif">
      <thead><tr style="background:#ddd"><th style="padding:4px 6px;border:1px solid #000;font-size:10pt">Nama Guru</th><th style="padding:4px 6px;border:1px solid #000;font-size:10pt">Rata</th><th style="padding:4px 6px;border:1px solid #000;font-size:10pt">Cover</th><th style="padding:4px 6px;border:1px solid #000;font-size:10pt">Kalender</th><th style="padding:4px 6px;border:1px solid #000;font-size:10pt">Walikelas</th></tr></thead>
      <tbody>${rows}</tbody></table>`;
    try {
      const res = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, orientation: "landscape" })
      });
      if (!res.ok) throw new Error("Server error");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan_monitoring_guru_${new Date().toISOString().slice(0, 10)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal export DOCX. Pastikan server berjalan.");
    }
  };

  const subTabs = [
    { id: "progress", label: "Progress Guru", icon: Activity },
    { id: "reminder", label: "Reminder WA", icon: Send },
    { id: "broadcast", label: "Broadcast WA", icon: MessageSquare },
    { id: "cron", label: "Cron Job", icon: Clock },
    { id: "laporan", label: "Laporan Kepala Sekolah", icon: FileText }
  ] as const;

  return (
    <div id="monitoring-panel" className="bg-warm-card border border-warm-border rounded-xl p-6 max-w-7xl mx-auto text-warm-text">
      <div className="flex items-center gap-4 border-b border-warm-border pb-5 mb-6">
        <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-bold tracking-tight">Menu Monitoring</h2>
          <p className="text-xs text-warm-secondary">Pantau progress, kirim pengingat, broadcast, dan cetak laporan kepala sekolah.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-warm-border pb-3 mb-6">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setSubTab(tab.id); setWaStatus("idle"); setWaMsg(""); setAiMessages({}); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2 cursor-pointer ${
                isActive
                  ? "bg-forest text-white border-forest"
                  : "bg-warm-card text-warm-secondary border-warm-border hover:bg-warm-bg"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── PROGRESS GURU ─── */}
      {subTab === "progress" && (
        <div className="space-y-4">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-muted"><Search className="h-4 w-4" /></span>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-1.5 border border-warm-border rounded-lg text-xs bg-warm-card" placeholder="Cari guru..." />
          </div>
          <div className="overflow-x-auto border border-warm-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-warm-bg border-b border-warm-border text-[10px] font-bold uppercase text-warm-text tracking-wider">
                  <th className="px-3 py-2.5">Nama Guru</th>
                  <th className="px-3 py-2.5">Mapel</th>
                  <th className="px-3 py-2.5 text-center">Cover</th>
                  <th className="px-3 py-2.5 text-center">Kalender</th>
                  <th className="px-3 py-2.5 text-center">Kurikulum</th>
                  <th className="px-3 py-2.5 text-center">Modul</th>
                  <th className="px-3 py-2.5 text-center">Jurnal</th>
                  <th className="px-3 py-2.5 text-center">Presensi</th>
                  <th className="px-3 py-2.5 text-center">Analisis</th>
                  <th className="px-3 py-2.5 text-center">Walikelas</th>
                  <th className="px-3 py-2.5 text-center">Refleksi</th>
                  <th className="px-3 py-2.5 text-center">Rata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {filteredProgress.map((p) => (
                  <tr key={p.id} className="hover:bg-warm-bg/50">
                    <td className="px-3 py-2.5 font-bold">{p.nama}</td>
                    <td className="px-3 py-2.5 text-warm-secondary">{p.mapel.split(" ")[0]}</td>
                    <td className="px-3 py-2.5 text-center"><ProgressBadge value={p.cover} /></td>
                    <td className="px-3 py-2.5"><ProgressBar value={p.kalender} /></td>
                    <td className="px-3 py-2.5"><ProgressBar value={p.kurikulum} /></td>
                    <td className="px-3 py-2.5"><ProgressBar value={p.modul} /></td>
                    <td className="px-3 py-2.5"><ProgressBar value={p.jurnal} /></td>
                    <td className="px-3 py-2.5"><ProgressBar value={p.presensi} /></td>
                    <td className="px-3 py-2.5"><ProgressBar value={p.analisis} /></td>
                    <td className="px-3 py-2.5"><ProgressBar value={p.walikelas} /></td>
                    <td className="px-3 py-2.5"><ProgressBar value={p.refleksi} /></td>
                    <td className="px-3 py-2.5 text-center font-bold"><ProgressBadge value={p.avg} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── REMINDER WA (AI Generated) ─── */}
      {subTab === "reminder" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-warm-bg p-4 rounded-xl border border-warm-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Users className="h-4 w-4 text-forest" /> Pilih Penerima
              </h4>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {config.gurus.map((g) => {
                  const p = progressList.find((x) => x.id === g.id);
                  return (
                    <label key={g.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-warm-card cursor-pointer text-xs">
                      <input type="checkbox" checked={selectedIds.includes(g.id)} onChange={() => toggleSelect(g.id)} className="accent-forest" />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold block truncate">{g.namaGuru}</span>
                        <span className="text-warm-secondary text-[10px]">
                          {g.teleponGuru ? `${g.teleponGuru} · ${p?.avg || 0}%` : "No HP tidak tersedia"}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-warm-bg p-4 rounded-xl border border-warm-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-forest" /> AI Generate Pesan Variatif
              </h4>
              <p className="text-[10px] text-warm-secondary leading-relaxed">
                AI akan membuat pesan WA unik per guru — berisi progress &amp; kekurangan masing-masing, dengan gaya bahasa variatif.
              </p>
              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">Topik / Prompt Pesan</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card text-xs"
                  placeholder="Misal: Mengingatkan untuk melengkapi administrasi pembelajaran"
                />
              </div>
              <button
                onClick={() => generateAiReminders(selectedIds)}
                disabled={isGenerating}
                className="w-full py-2 bg-forest hover:bg-forest-dark disabled:bg-stone-300 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isGenerating ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? "Memproses AI..." : "Generate AI Reminders"}
              </button>
            </div>

            {/* Preview hasil AI */}
            {Object.keys(aiMessages).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 px-1">
                  <Send className="h-4 w-4 text-forest" /> Preview Pesan per Guru
                </h4>
                {Object.entries(aiMessages).map(([tid, msg]) => {
                  const g = config.gurus.find((x) => x.id === tid);
                  const p = progressList.find((x) => x.id === tid);
                  const isEditing = editingTeacherId === tid;
                  return (
                    <div key={tid} className="bg-warm-bg rounded-xl border border-warm-border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{g?.namaGuru || tid}</span>
                          <ProgressBadge value={p?.avg || 0} />
                        </div>
                        {isEditing ? (
                          <div className="flex gap-1">
                            <button onClick={() => saveEdit(tid)} className="text-[10px] font-bold px-2 py-1 bg-forest text-white rounded cursor-pointer">Simpan</button>
                            <button onClick={cancelEdit} className="text-[10px] font-bold px-2 py-1 border border-warm-border rounded text-warm-secondary cursor-pointer">Batal</button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(tid)} className="text-warm-muted hover:text-warm-text transition-colors cursor-pointer p-1">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      {p && (
                        <div className="text-[10px] text-warm-secondary">Kekurangan: {getKekurangan(p)}</div>
                      )}
                      {isEditing ? (
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-warm-border rounded-lg bg-warm-card text-xs resize-none"
                        />
                      ) : (
                        <div className="text-xs text-warm-text bg-warm-card rounded-lg p-3 border border-warm-border leading-relaxed whitespace-pre-wrap">
                          {msg}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleSendUniqueWA(Object.keys(aiMessages))}
                    disabled={waStatus === "sending"}
                    className="px-5 py-2 bg-forest hover:bg-forest-dark disabled:bg-stone-300 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {waStatus === "sending" ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {waStatus === "sending" ? "Mengirim..." : `Kirim ke ${Object.keys(aiMessages).length} Guru`}
                  </button>
                </div>
              </div>
            )}

            {/* Status messages */}
            {waMsg && (
              <div className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                waStatus === "done" ? "bg-green-50 text-green-700 border border-green-200" :
                waStatus === "error" ? "bg-red-50 text-red-700 border border-red-200" :
                "bg-sky-50 text-sky-700 border border-sky-200"
              }`}>
                {waStatus === "done" ? <CheckCircle2 className="h-4 w-4" /> : waStatus === "error" ? <AlertTriangle className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                {waMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── BROADCAST WA (AI Generated) ─── */}
      {subTab === "broadcast" && (
        <div className="space-y-4">
          <div className="bg-warm-bg p-4 rounded-xl border border-warm-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-forest" /> Broadcast AI ke Semua Guru
            </h4>
            <p className="text-[10px] text-warm-secondary leading-relaxed">
              Broadcast akan dikirim ke <strong>{config.gurus.length} guru</strong>. AI akan membuat pesan unik per guru berisi progress &amp; kekurangan masing-masing dengan gaya bahasa variatif.
            </p>
            <div>
              <label className="block text-xs font-bold text-warm-text mb-1">Topik / Prompt Pesan</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card text-xs"
                placeholder="Misal: Pemberitahuan libur nasional &amp; pengisian administrasi"
              />
            </div>
            <button
              onClick={() => generateAiReminders(config.gurus.map((g) => g.id))}
              disabled={isGenerating}
              className="px-5 py-2 bg-forest hover:bg-forest-dark disabled:bg-stone-300 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isGenerating ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? "Memproses AI..." : "Generate AI Broadcast"}
            </button>
          </div>

          {/* Preview hasil AI */}
          {Object.keys(aiMessages).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 px-1">
                <MessageSquare className="h-4 w-4 text-forest" /> Preview Broadcast per Guru
              </h4>
              {Object.entries(aiMessages).map(([tid, msg]) => {
                const g = config.gurus.find((x) => x.id === tid);
                const p = progressList.find((x) => x.id === tid);
                const isEditing = editingTeacherId === tid;
                return (
                  <div key={tid} className="bg-warm-bg rounded-xl border border-warm-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{g?.namaGuru || tid}</span>
                        <ProgressBadge value={p?.avg || 0} />
                      </div>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <button onClick={() => saveEdit(tid)} className="text-[10px] font-bold px-2 py-1 bg-forest text-white rounded cursor-pointer">Simpan</button>
                          <button onClick={cancelEdit} className="text-[10px] font-bold px-2 py-1 border border-warm-border rounded text-warm-secondary cursor-pointer">Batal</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(tid)} className="text-warm-muted hover:text-warm-text transition-colors cursor-pointer p-1">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {p && (
                      <div className="text-[10px] text-warm-secondary">Kekurangan: {getKekurangan(p)}</div>
                    )}
                    {isEditing ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-warm-border rounded-lg bg-warm-card text-xs resize-none"
                      />
                    ) : (
                      <div className="text-xs text-warm-text bg-warm-card rounded-lg p-3 border border-warm-border leading-relaxed whitespace-pre-wrap">
                        {msg}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleSendUniqueWA(Object.keys(aiMessages))}
                  disabled={waStatus === "sending"}
                  className="px-5 py-2 bg-forest hover:bg-forest-dark disabled:bg-stone-300 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {waStatus === "sending" ? <Loader className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                  {waStatus === "sending" ? "Menyiarkan..." : `Siarkan ke ${Object.keys(aiMessages).length} Guru`}
                </button>
              </div>
            </div>
          )}

          {waMsg && (
            <div className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
              waStatus === "done" ? "bg-green-50 text-green-700 border border-green-200" :
              waStatus === "error" ? "bg-red-50 text-red-700 border border-red-200" :
              "bg-sky-50 text-sky-700 border border-sky-200"
            }`}>
              {waStatus === "done" ? <CheckCircle2 className="h-4 w-4" /> : waStatus === "error" ? <AlertTriangle className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
              {waMsg}
            </div>
          )}
        </div>
      )}

      {/* ─── CRON JOB ─── */}
      {subTab === "cron" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form buat cron job */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-warm-bg p-4 rounded-xl border border-warm-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-forest" /> Buat Jadwal Reminder Otomatis
              </h4>
              <p className="text-[10px] text-warm-secondary leading-relaxed">
                Server akan mengirim reminder WA otomatis ke guru sesuai jadwal (menggunakan AI).
              </p>
              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">Nama Jadwal</label>
                <input type="text" value={cronName} onChange={e => setCronName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card text-xs"
                  placeholder="Misal: Pengingat Mingguan" />
              </div>
              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">Topik / Prompt Pesan</label>
                <input type="text" value={cronTopic} onChange={e => setCronTopic(e.target.value)}
                  className="w-full px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card text-xs"
                  placeholder="Misal: Mengingatkan isi administrasi" />
              </div>
              <div>
                <label className="block text-xs font-bold text-warm-text mb-2">Hari</label>
                <div className="flex flex-wrap gap-1.5">
                  {DAY_LABELS.map((label, d) => (
                    <button key={d} onClick={() => toggleCronDay(d)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        cronDays.includes(d)
                          ? "bg-forest text-white border-forest"
                          : "bg-warm-card text-warm-secondary border-warm-border hover:bg-warm-bg"
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-warm-text mb-1">Jam</label>
                <input type="time" value={cronTime} onChange={e => setCronTime(e.target.value)}
                  className="w-32 px-3 py-1.5 border border-warm-border rounded-lg bg-warm-card text-xs" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={cronAllTeachers} onChange={() => setCronAllTeachers(!cronAllTeachers)}
                    className="accent-forest" />
                  <span className="font-bold">Semua Guru</span>
                </label>
                {!cronAllTeachers && (
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto pl-5">
                    {config.gurus.map(g => (
                      <label key={g.id} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input type="checkbox" checked={cronSelectedIds.includes(g.id)}
                          onChange={() => setCronSelectedIds(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                          className="accent-forest" />
                        <span>{g.namaGuru}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleCreateCron} disabled={cronSaving}
                className="w-full py-2 bg-forest hover:bg-forest-dark disabled:bg-stone-300 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                {cronSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {cronSaving ? "Menyimpan..." : "Buat Jadwal"}
              </button>
              {cronMsg && (
                <div className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                  cronMsgType === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {cronMsgType === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {cronMsg}
                </div>
              )}
            </div>
          </div>
          {/* Daftar cron job */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-warm-bg p-4 rounded-xl border border-warm-border">
              <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 mb-3">
                <RefreshCw className="h-4 w-4 text-forest" /> Jadwal Tersimpan
              </h4>
              {cronJobs.length === 0 ? (
                <p className="text-xs text-warm-secondary text-center py-8">Belum ada jadwal cron job.</p>
              ) : (
                <div className="space-y-2">
                  {cronJobs.map(job => (
                    <div key={job.id} className="border border-warm-border rounded-lg p-3 space-y-2 bg-warm-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${job.enabled ? "bg-green-500" : "bg-stone-300"}`} />
                          <span className="font-bold text-xs">{job.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleSyncCron(job.id)}
                            title="Sinkron progress & token"
                            className="p-1.5 text-warm-muted hover:text-warm-text transition-colors cursor-pointer rounded">
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleToggleCron(job.id)}
                            title={job.enabled ? "Nonaktifkan" : "Aktifkan"}
                            className={`p-1.5 transition-colors cursor-pointer rounded ${
                              job.enabled ? "text-green-600 hover:text-green-800" : "text-stone-400 hover:text-stone-600"
                            }`}>
                            {job.enabled ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => handleDeleteCron(job.id)}
                            title="Hapus"
                            className="p-1.5 text-red-400 hover:text-red-600 transition-colors cursor-pointer rounded">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] text-warm-secondary space-y-0.5">
                        <div>Topik: {job.topic}</div>
                        <div>Jadwal: {getScheduleLabel(job.daysOfWeek, job.time)}</div>
                        {job.enabled && <div>Eksekusi berikut: {getNextRunDate(job.daysOfWeek, job.time)}</div>}
                        {job.lastRunAt && (
                          <div>Terakhir: {new Date(job.lastRunAt).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            {job.lastStatus === "success" ? " ✅" : job.lastStatus === "error" ? " ❌" : ""} — {job.lastMessage || ""}
                          </div>
                        )}
                        {!job.lastRunAt && <div className="text-warm-muted italic">Belum pernah dijalankan</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── LAPORAN KEPALA SEKOLAH ─── */}
      {subTab === "laporan" && (
        <div className="space-y-6">
          <div className="bg-warm-bg p-5 rounded-xl border border-warm-border space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-forest" /> Ringkasan Progress Guru
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-warm-card rounded-xl border border-warm-border p-4 text-center">
                <div className="text-2xl font-bold text-forest">{progressList.length}</div>
                <div className="text-[10px] text-warm-secondary font-bold uppercase mt-1">Total Guru</div>
              </div>
              <div className="bg-warm-card rounded-xl border border-warm-border p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: (() => {
                  const avg = progressList.length > 0 ? Math.round(progressList.reduce((a, p) => a + p.avg, 0) / progressList.length) : 0;
                  return avg >= 90 ? "#16a34a" : avg >= 60 ? "#0284c7" : avg >= 30 ? "#d97706" : "#dc2626";
                })() }}>
                  {progressList.length > 0 ? Math.round(progressList.reduce((a, p) => a + p.avg, 0) / progressList.length) : 0}%
                </div>
                <div className="text-[10px] text-warm-secondary font-bold uppercase mt-1">Rata-rata</div>
              </div>
              <div className="bg-warm-card rounded-xl border border-warm-border p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{progressList.filter((p) => p.avg >= 90).length}</div>
                <div className="text-[10px] text-warm-secondary font-bold uppercase mt-1">Siap Akreditasi</div>
              </div>
              <div className="bg-warm-card rounded-xl border border-warm-border p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{progressList.filter((p) => p.avg < 60).length}</div>
                <div className="text-[10px] text-warm-secondary font-bold uppercase mt-1">Perlu Bimbingan</div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleLaporanPrint} className="px-4 py-2 bg-forest hover:bg-forest-dark text-white text-[11px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer">
              <Printer className="h-4 w-4" /> Cetak Laporan
            </button>
            <button onClick={handleLaporanDocx} className="px-4 py-2 border border-forest text-forest hover:bg-forest hover:text-white text-[11px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer">
              <Download className="h-4 w-4" /> Export DOCX
            </button>
          </div>
          <div className="overflow-x-auto border border-warm-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-warm-bg border-b border-warm-border text-[10px] font-bold uppercase text-warm-text tracking-wider">
                  <th className="px-3 py-2.5">Nama Guru</th>
                  <th className="px-3 py-2.5">Mapel</th>
                  <th className="px-3 py-2.5 text-center">Cover</th>
                  <th className="px-3 py-2.5 text-center">Kalender</th>
                  <th className="px-3 py-2.5 text-center">Kurikulum</th>
                  <th className="px-3 py-2.5 text-center">Modul</th>
                  <th className="px-3 py-2.5 text-center">Jurnal</th>
                  <th className="px-3 py-2.5 text-center">Presensi</th>
                  <th className="px-3 py-2.5 text-center">Analisis</th>
                  <th className="px-3 py-2.5 text-center">Walikelas</th>
                  <th className="px-3 py-2.5 text-center">Refleksi</th>
                  <th className="px-3 py-2.5 text-center">Rata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {progressList.map((p) => (
                  <tr key={p.id} className="hover:bg-warm-bg/50">
                    <td className="px-3 py-2.5 font-bold">{p.nama}</td>
                    <td className="px-3 py-2.5 text-warm-secondary">{p.mapel.split(" ")[0]}</td>
                    <td className="px-3 py-2.5 text-center">{p.cover}%</td>
                    <td className="px-3 py-2.5 text-center">{p.kalender}%</td>
                    <td className="px-3 py-2.5 text-center">{p.kurikulum}%</td>
                    <td className="px-3 py-2.5 text-center">{p.modul}%</td>
                    <td className="px-3 py-2.5 text-center">{p.jurnal}%</td>
                    <td className="px-3 py-2.5 text-center">{p.presensi}%</td>
                    <td className="px-3 py-2.5 text-center">{p.analisis}%</td>
                    <td className="px-3 py-2.5 text-center">{p.walikelas}%</td>
                    <td className="px-3 py-2.5 text-center">{p.refleksi}%</td>
                    <td className="px-3 py-2.5 text-center font-bold">{p.avg}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
