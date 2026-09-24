import React, { useState } from "react";
import { ProyekKokurikuler, PortofolioItem, AdministrasiTahunState } from "../types";
import { DIMENSI_PROFIL_LULUSAN } from "../utils";
import { School, Layers, Image, Plus, Trash2, Award, ClipboardCheck, Users, HelpCircle, Sparkles, Printer } from "lucide-react";

interface Props {
  state: AdministrasiTahunState;
  onChange: (updater: (s: AdministrasiTahunState) => AdministrasiTahunState) => void;
}

function generateId(prefix: string): string {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
}

function ProyekCard({ proyek, onRemove, onCetak }: { proyek: ProyekKokurikuler; onRemove: (id: string) => void; onCetak: (p: ProyekKokurikuler) => void }) {
  return (
    <div key={proyek.id} className="border border-warm-border rounded-3xl p-6 bg-warm-bg/20 relative space-y-4">
      <button onClick={() => onRemove(proyek.id)} aria-label="Hapus Proyek" className="absolute top-6 right-6 text-warm-muted hover:text-red-500 transition-colors print:hidden focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
      <div className="border-b border-warm-bg pb-3 flex justify-between items-center flex-wrap gap-2">
        <span className="font-extrabold text-[13px] text-forest">Tema: {proyek.tema}</span>
      </div>
      <div className="space-y-3">
        <div><span className="text-[10px] font-bold text-warm-muted block uppercase">Judul Proyek Kokurikuler</span><h3 className="font-bold text-sm text-warm-text mt-0.5">{proyek.judul}</h3></div>
        <div><span className="text-[10px] font-bold text-warm-muted block uppercase">Tujuan</span><p className="text-warm-text leading-normal mt-0.5 font-medium">{proyek.tujuan}</p></div>
        <div><span className="text-[10px] font-bold text-warm-muted block uppercase">Dimensi Profil Lulusan</span><div className="flex flex-wrap gap-1.5 mt-1">{proyek.dimensi.map((d) => (<span key={d.id} className="bg-emerald-50 text-emerald-800 border border-emerald-150 font-bold px-2.5 py-0.5 rounded text-[10px]">{d.nama}</span>))}</div></div>
        <div><span className="text-[10px] font-bold text-warm-muted block uppercase mb-1">Timeline Kegiatan</span><div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">{proyek.timeline.map((tl) => (<div key={tl.id} className="p-3 bg-warm-card border border-warm-border rounded-xl font-medium"><span className="font-bold text-forest block text-[10px]">Minggu ke-{tl.minggu}</span><p className="mt-0.5 text-warm-text text-[11px] leading-relaxed">{tl.aktivitas}</p></div>))}</div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div><span className="text-[10px] font-bold text-warm-muted block uppercase mb-1">Asesmen Awal</span><p className="p-2 bg-warm-card border border-warm-border rounded-xl text-[11px]">{proyek.asesmen.awal || "-"}</p></div>
          <div><span className="text-[10px] font-bold text-warm-muted block uppercase mb-1">Asesmen Proses</span><p className="p-2 bg-warm-card border border-warm-border rounded-xl text-[11px]">{proyek.asesmen.proses || "-"}</p></div>
          <div><span className="text-[10px] font-bold text-warm-muted block uppercase mb-1">Asesmen Akhir</span><p className="p-2 bg-warm-card border border-warm-border rounded-xl text-[11px]">{proyek.asesmen.akhir || "-"}</p></div>
          <div><span className="text-[10px] font-bold text-warm-muted block uppercase mb-1">Rubrik Asesmen</span><p className="p-2 bg-warm-card border border-warm-border rounded-xl text-[11px]">{proyek.asesmen.rubrik || "-"}</p></div>
        </div>
        <div><span className="text-[10px] font-bold text-warm-muted block uppercase mb-1">Narasi Rapor</span><p className="p-3 bg-emerald-50/15 border-l-2 border-emerald-500 rounded-r-xl text-warm-text text-[11px] font-semibold">{proyek.asesmen.narasiRapor || "-"}</p></div>
      </div>
      <button onClick={() => onCetak(proyek)} className="mt-3 px-4 py-2 bg-forest hover:bg-forest-dark text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 print:hidden focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer">
        <Printer className="h-3.5 w-3.5" /> Cetak Halaman Ini
      </button>
    </div>
  );
}

export default function AdministrasiKelasKokurikuler({ state, onChange }: Props) {
  const { strukturKelas, jadwalPiket, tataTertib, kontrakBelajar, proyekKokurikuler, portofolio, siswaList, identitas } = state;

  const [newPiket, setNewPiket] = useState({ hari: "Senin" as const, siswaId: "s1" });
  const [newProyek, setNewProyek] = useState<Omit<ProyekKokurikuler, "id">>({
    judul: "",
    tema: "Kewirausahaan",
    tujuan: "",
    dimensi: [{ id: generateId("d"), nama: "Kreativitas" }],
    timeline: [{ id: generateId("tl"), minggu: "1", aktivitas: "" }],
    asesmen: { awal: "", proses: "", akhir: "", rubrik: "", narasiRapor: "" },
  });
  const [newPort, setNewPort] = useState({ namaSiswa: "Ahmad Fauzi", namaKarya: "", deskripsiKarya: "", predikat: "Sangat Baik" as const, refleksiSingkat: "" });

  // AI generate state
  const [aiTema, setAiTema] = useState("");
  const [aiJenjang, setAiJenjang] = useState<"SMA" | "SMK" | "MA">("SMA");
  const [aiJurusan, setAiJurusan] = useState("");
  const [aiJumlahMinggu, setAiJumlahMinggu] = useState(8);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleUpdateStruktur = (field: keyof typeof strukturKelas, value: string) => {
    onChange((prev) => ({
      ...prev,
      strukturKelas: { ...prev.strukturKelas, [field]: value }
    }));
  };

  const handleAddPiket = (e: React.FormEvent) => {
    e.preventDefault();
    onChange((prev) => ({
      ...prev,
      jadwalPiket: prev.jadwalPiket.map((p) => {
        if (p.hari === newPiket.hari && !p.siswaIds.includes(newPiket.siswaId)) {
          return { ...p, siswaIds: [...p.siswaIds, newPiket.siswaId] };
        }
        return p;
      })
    }));
  };

  const handleRemovePiket = (hari: string, sId: string) => {
    onChange((prev) => ({
      ...prev,
      jadwalPiket: prev.jadwalPiket.map((p) => {
        if (p.hari === hari) {
          return { ...p, siswaIds: p.siswaIds.filter((id) => id !== sId) };
        }
        return p;
      })
    }));
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTema) { setAiError("Silakan isi tema proyek"); return; }
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/gemini/generate-kokurikuler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: aiTema, jenjang: aiJenjang, jurusan: aiJurusan, jumlahMinggu: aiJumlahMinggu })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Gagal generate");
      const result = data.proyek;
      setNewProyek({
        judul: result.judulProyek || "",
        tema: aiTema,
        tujuan: result.tujuan || "",
        dimensi: (result.dimensi || []).map((nama: string) => ({ id: generateId("d"), nama })),
        timeline: (result.timeline || []).map((tl: any) => ({ id: generateId("tl"), minggu: String(tl.minggu), aktivitas: tl.aktivitas })),
        asesmen: {
          awal: result.asesmenAwal || "",
          proses: result.asesmenProses || "",
          akhir: result.asesmenAkhir || "",
          rubrik: result.rubrikAsesmen || "",
          narasiRapor: result.narasiRapor || "",
        },
      });
    } catch (err: any) {
      setAiError(err.message || "Gagal terhubung ke AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddProyek = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProyek.judul) return;
    onChange((prev) => ({
      ...prev,
      proyekKokurikuler: [
        ...prev.proyekKokurikuler,
        { id: generateId("kok"), ...newProyek }
      ]
    }));
    setNewProyek({
      judul: "", tema: "Kewirausahaan", tujuan: "",
      dimensi: [{ id: generateId("d"), nama: "Kreativitas" }],
      timeline: [{ id: generateId("tl"), minggu: "1", aktivitas: "" }],
      asesmen: { awal: "", proses: "", akhir: "", rubrik: "", narasiRapor: "" },
    });
  };

  const handleRemoveProyek = (id: string) => {
    onChange((prev) => ({
      ...prev,
      proyekKokurikuler: prev.proyekKokurikuler.filter((p) => p.id !== id)
    }));
  };

  const handleCetakProyek = (proyek: ProyekKokurikuler) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const dim = proyek.dimensi.map((d) => `<span style="display:inline-block;background:#d1fae5;color:#065f46;border:1px solid #a7f3d0;font-weight:bold;padding:2px 8px;border-radius:4px;font-size:10px;margin:2px;">${d.nama}</span>`).join("");
    const tl = proyek.timeline.map((t) => `<div style="margin-bottom:8px;"><strong style="color:#232323;">Minggu ke-${t.minggu}:</strong> ${t.aktivitas}</div>`).join("");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cetak Proyek - ${proyek.judul}</title><style>
      * { font-family: 'Times New Roman', Times, serif; }
      body { padding: 40px; color: #232323; font-size: 12pt; line-height: 1.5; }
      h1 { text-align: center; font-size: 18pt; border-bottom: 2px solid #d4af37; padding-bottom: 8px; }
      h2 { font-size: 14pt; color: #232323; }
      .label { font-size: 10pt; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; display: block; margin-top: 12px; }
      .section { margin-bottom: 16px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .signature { margin-top: 48px; display: flex; justify-content: space-between; text-align: center; }
      .signature div { width: 45%; }
      @media print { body { padding: 0; } }
    </style></head><body>
      <h1>PROYEK KOKURIKULER</h1>
      <div class="section"><span class="label">Judul Proyek</span><p style="font-weight:bold;font-size:14pt;">${proyek.judul}</p></div>
      <div class="section"><span class="label">Tema</span><p>${proyek.tema}</p></div>
      <div class="section"><span class="label">Tujuan</span><p>${proyek.tujuan}</p></div>
      <div class="section"><span class="label">Dimensi Profil Lulusan</span><p>${dim}</p></div>
      <div class="section"><span class="label">Timeline Kegiatan</span><div>${tl}</div></div>
      <div class="grid section">
        <div><span class="label">Asesmen Awal</span><p>${proyek.asesmen.awal || "-"}</p></div>
        <div><span class="label">Asesmen Proses</span><p>${proyek.asesmen.proses || "-"}</p></div>
        <div><span class="label">Asesmen Akhir</span><p>${proyek.asesmen.akhir || "-"}</p></div>
        <div><span class="label">Rubrik Asesmen</span><p>${proyek.asesmen.rubrik || "-"}</p></div>
      </div>
      <div class="section"><span class="label">Narasi Rapor</span><p style="background:#f0fdf4;padding:8px;border-left:4px solid #2d6a4f;">${proyek.asesmen.narasiRapor || "-"}</p></div>
      <div class="signature">
        <div><p style="font-size:10pt;font-weight:bold;letter-spacing:1px;">Mengetahui,</p><p style="font-weight:bold;">Kepala ${identitas.namaSekolah}</p><br><br><br><p style="text-decoration:underline;font-weight:bold;">${identitas.namaKepsek}</p><p>NIP. ${identitas.nipKepsek}</p></div>
        <div><p style="font-size:10pt;font-weight:bold;letter-spacing:1px;">${identitas.kota || "Bandung"}, Juni 2026</p><p style="font-weight:bold;">Fasilitator Kelas ${identitas.kelas}</p><br><br><br><p style="text-decoration:underline;font-weight:bold;">${identitas.namaGuru}</p><p>NIP. ${identitas.nipGuru || "-"}</p></div>
      </div>
    </body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  const handleAddPort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPort.namaKarya) return;
    onChange((prev) => ({
      ...prev,
      portofolio: [
        ...prev.portofolio,
        {
          id: "port_" + Date.now(),
          ...newPort,
          tanggalKarya: new Date().toISOString().split("T")[0]
        }
      ]
    }));
    setNewPort({ namaSiswa: "Ahmad Fauzi", namaKarya: "", deskripsiKarya: "", predikat: "Sangat Baik", refleksiSingkat: "" });
  };

  const handleRemovePort = (id: string) => {
    onChange((prev) => ({
      ...prev,
      portofolio: prev.portofolio.filter((p) => p.id !== id)
    }));
  };

  const handleAddDimensi = () => {
    setNewProyek((prev) => ({
      ...prev,
      dimensi: [...prev.dimensi, { id: generateId("d"), nama: DIMENSI_PROFIL_LULUSAN[0] }]
    }));
  };

  const handleRemoveDimensi = (id: string) => {
    setNewProyek((prev) => ({
      ...prev,
      dimensi: prev.dimensi.filter((d) => d.id !== id)
    }));
  };

  const handleAddTimeline = () => {
    const nextMinggu = newProyek.timeline.length + 1;
    setNewProyek((prev) => ({
      ...prev,
      timeline: [...prev.timeline, { id: generateId("tl"), minggu: String(nextMinggu), aktivitas: "" }]
    }));
  };

  const handleRemoveTimeline = (id: string) => {
    setNewProyek((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((t) => t.id !== id)
    }));
  };

  return (
    <div className="space-y-12">
      {/* --- SECTION WALIKELAS --- */}
      <section id="doc-walikelas" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between animate-fadeIn">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <School className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
              ADMINISTRASI WALI KELAS KELAS {identitas.kelas}
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              ORGANISASI KELAS, JADWAL PIKET HARIAN, TATA TERTIB, DAN KONTRAK BELAJAR KONSENSUS
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 p-6 bg-warm-bg/50 rounded-2xl border border-warm-bg">
              <h4 className="text-xs font-bold uppercase tracking-wider text-warm-secondary border-b border-warm-border pb-1 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                1. Struktur Pengurus Kelas
              </h4>
              <div className="space-y-3 text-xs text-warm-text">
                <div className="flex gap-2 items-center">
                  <span className="w-24 font-semibold text-warm-secondary">Ketua Kelas</span>
                  <span className="text-warm-muted">:</span>
                  <input type="text" value={strukturKelas.ketua} onChange={(e) => handleUpdateStruktur("ketua", e.target.value)} className="flex-1 bg-warm-card border border-warm-border px-2 py-1 rounded" />
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-24 font-semibold text-warm-secondary">Wakil Ketua</span>
                  <span className="text-warm-muted">:</span>
                  <input type="text" value={strukturKelas.wakil} onChange={(e) => handleUpdateStruktur("wakil", e.target.value)} className="flex-1 bg-warm-card border border-warm-border px-2 py-1 rounded" />
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-24 font-semibold text-warm-secondary">Sekretaris</span>
                  <span className="text-warm-muted">:</span>
                  <input type="text" value={strukturKelas.sekretaris} onChange={(e) => handleUpdateStruktur("sekretaris", e.target.value)} className="flex-1 bg-warm-card border border-warm-border px-2 py-1 rounded" />
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-24 font-semibold text-warm-secondary">Bendahara</span>
                  <span className="text-warm-muted">:</span>
                  <input type="text" value={strukturKelas.bendahara} onChange={(e) => handleUpdateStruktur("bendahara", e.target.value)} className="flex-1 bg-warm-card border border-warm-border px-2 py-1 rounded" />
                </div>
              </div>
            </div>
            <div className="space-y-4 p-6 bg-warm-bg/50 rounded-2xl border border-warm-bg">
              <h4 className="text-xs font-bold uppercase tracking-wider text-warm-secondary border-b border-warm-border pb-1 flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                2. Jadwal Piket Harian (Senin - Jumat)
              </h4>
              <div className="space-y-2 text-xs text-warm-text leading-normal">
                {jadwalPiket.map((pik) => (
                  <div key={pik.hari} className="flex gap-4 border-b border-warm-bg pb-1.5 last:border-none">
                    <span className="w-16 font-bold text-forest">{pik.hari}</span>
                    <div className="flex-1 flex flex-wrap gap-1">
                      {pik.siswaIds.map((sId) => {
                        const sDetails = siswaList.find((s) => s.id === sId);
                        return (
                          <span key={sId} className="bg-warm-card border border-warm-border px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                            {sDetails?.nama || "Siswa"}
                            <button onClick={() => handleRemovePiket(pik.hari, sId)} aria-label="Hapus piket" className="text-red-400 hover:text-red-600 font-bold ml-1 print:hidden cursor-pointer">×</button>
                          </span>
                        );
                      })}
                      {pik.siswaIds.length === 0 && <span className="text-warm-muted italic">Belum ada penugasan piket</span>}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddPiket} className="flex gap-3 text-xs pt-2 print:hidden items-center">
                <select value={newPiket.hari} onChange={(e) => setNewPiket({ ...newPiket, hari: e.target.value as any })} className="bg-warm-card border border-warm-border px-2 py-1 rounded"><option value="Senin">Senin</option><option value="Selasa">Selasa</option><option value="Rabu">Rabu</option><option value="Kamis">Kamis</option><option value="Jumat">Jumat</option></select>
                <select value={newPiket.siswaId} onChange={(e) => setNewPiket({ ...newPiket, siswaId: e.target.value })} className="bg-warm-card border border-warm-border px-2 py-1 rounded flex-1">{siswaList.map((s) => (<option key={s.id} value={s.id}>{s.nama}</option>))}</select>
                <button type="submit" className="bg-forest-dark text-white rounded px-3 py-1 font-bold hover:bg-forest transition-colors focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer">+ Piket</button>
              </form>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-warm-secondary flex items-center gap-1.5">
                3. Regulasi & Tata Tertib Kelas Kontemporer
                <button onClick={() => onChange((prev) => ({ ...prev, tataTertib: [...prev.tataTertib, ""] }))} className="ml-auto w-8 h-8 flex items-center justify-center bg-forest text-white font-bold text-lg rounded-xl hover:bg-forest-dark transition-colors print:hidden focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer shadow-sm" title="Tambah aturan">+</button>
              </h4>
              <ul className="space-y-1.5 text-xs text-warm-text list-none leading-relaxed font-semibold">
                {tataTertib.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 group">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => {
                        const next = [...tataTertib];
                        next[idx] = e.target.value;
                        onChange((prev) => ({ ...prev, tataTertib: next }));
                      }}
                      className="flex-1 p-3 bg-warm-bg/30 border border-warm-bg rounded-xl focus:bg-white focus:border-forest focus:outline-none print:bg-transparent print:border-none print:p-0"
                    />
                    <button onClick={() => onChange((prev) => ({ ...prev, tataTertib: prev.tataTertib.filter((_, i) => i !== idx) }))} className="w-8 h-8 flex items-center justify-center bg-red-500 text-white font-bold text-lg rounded-xl hover:bg-red-600 transition-colors mt-2 print:hidden opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer shadow-sm" title="Hapus aturan">&times;</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-warm-secondary flex items-center gap-1.5">
                4. Perjanjian / Kontrak Belajar Konsensus
                <button onClick={() => onChange((prev) => ({ ...prev, kontrakBelajar: [...prev.kontrakBelajar, ""] }))} className="ml-auto w-8 h-8 flex items-center justify-center bg-forest text-white font-bold text-lg rounded-xl hover:bg-forest-dark transition-colors print:hidden focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer shadow-sm" title="Tambah kontrak">+</button>
              </h4>
              <ul className="space-y-1.5 text-xs text-warm-text list-none leading-relaxed font-semibold">
                {kontrakBelajar.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 group">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const next = [...kontrakBelajar];
                        next[idx] = e.target.value;
                        onChange((prev) => ({ ...prev, kontrakBelajar: next }));
                      }}
                      className="flex-1 p-3 bg-forest/10 border-l-4 border-forest rounded-r-xl focus:bg-white focus:border-forest focus:outline-none print:bg-transparent print:border-none print:p-0 print:border-l-4 print:border-forest"
                    />
                    <button onClick={() => onChange((prev) => ({ ...prev, kontrakBelajar: prev.kontrakBelajar.filter((_, i) => i !== idx) }))} className="w-8 h-8 flex items-center justify-center bg-red-500 text-white font-bold text-lg rounded-xl hover:bg-red-600 transition-colors mt-2 print:hidden opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer shadow-sm" title="Hapus kontrak">&times;</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-bg text-center text-xs text-warm-text">
          <div><p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Mengetahui,</p><p className="font-bold text-warm-text underline text-xs">{identitas.namaKepsek}</p><p className="text-[10px] text-warm-muted">NIP. {identitas.nipKepsek}</p></div>
          <div><p className="font-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">{identitas.kota || "Bandung"}, Juni 2026</p><p className="font-bold text-warm-text underline text-xs">Wali Kelas {identitas.waliKelasDi}</p><p className="text-[10px] text-warm-muted">NIP. {identitas.nipGuru || "-"}</p></div>
        </div>
      </section>

      <div className="print:page-break-after"></div>

      {/* --- SECTION KOKURIKULER --- */}
      <section id="doc-kokurikuler" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <Layers className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
              PROYEK KOKURIKULER
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              PERENCANAAN PROYEK & PENGUATAN 8 DIMENSI PROFIL LULUSAN KELAS {identitas.kelas}
            </p>
          </div>

          {/* AI Generate Form */}
          <div className="bg-warm-bg/50 p-6 rounded-3xl border border-warm-border text-xs text-warm-text print:hidden">
            <h4 className="font-bold text-warm-text uppercase flex items-center gap-1 mb-4">
              <Sparkles className="h-4 w-4 text-forest" aria-hidden="true" /> Generate Rancangan Proyek dengan AI
            </h4>
            <form onSubmit={handleGenerateAI} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold block text-warm-secondary">Tema Proyek</label>
                  <input type="text" required placeholder="e.g. Gaya Hidup Berkelanjutan" value={aiTema} onChange={(e) => setAiTema(e.target.value)} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold block text-warm-secondary">Jenjang</label>
                  <select value={aiJenjang} onChange={(e) => setAiJenjang(e.target.value as any)} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg">
                    <option value="SMA">SMA</option><option value="SMK">SMK</option><option value="MA">MA</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold block text-warm-secondary">Jurusan (opsional)</label>
                  <input type="text" placeholder="e.g. RPL, AKL" value={aiJurusan} onChange={(e) => setAiJurusan(e.target.value)} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold block text-warm-secondary">Jumlah Minggu</label>
                  <input type="number" min={2} max={16} value={aiJumlahMinggu} onChange={(e) => setAiJumlahMinggu(Number(e.target.value))} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" />
                </div>
              </div>
              {aiError && <p className="text-red-600 font-semibold text-xs">{aiError}</p>}
              <button type="submit" disabled={aiLoading} className="px-5 py-2 bg-gradient-to-r from-forest to-emerald-600 hover:from-forest-dark hover:to-emerald-800 text-white rounded-lg font-bold transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer disabled:opacity-50">
                <Sparkles className="h-4 w-4" /> {aiLoading ? "Menghasilkan..." : "✨ Generate dengan AI"}
              </button>
            </form>
          </div>

          {/* Proyek List */}
          <div className="space-y-8 text-xs text-warm-text leading-relaxed text-left">
            {proyekKokurikuler?.map((proyek) => (
              <ProyekCard key={proyek.id} proyek={proyek} onRemove={handleRemoveProyek} onCetak={handleCetakProyek} />
            ))}
          </div>

          {/* Add Proyek Form */}
          <form onSubmit={handleAddProyek} className="bg-warm-bg/50 p-6 rounded-3xl border border-warm-border flex flex-col gap-4 text-xs text-warm-text print:hidden mt-6">
            <h4 className="font-bold text-warm-text uppercase flex items-center gap-1"><Plus className="h-4 w-4 text-forest" aria-hidden="true" /> Tambah Proyek Kokurikuler Baru</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold block text-warm-secondary">Tema</label>
                <select value={newProyek.tema} onChange={(e) => setNewProyek({ ...newProyek, tema: e.target.value })} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg">
                  <option value="Gaya Hidup Berkelanjutan">Gaya Hidup Berkelanjutan</option>
                  <option value="Kearifan Lokal">Kearifan Lokal</option>
                  <option value="Bhinneka Tunggal Ika">Bhinneka Tunggal Ika</option>
                  <option value="Bangunlah Jiwa dan Raganya">Bangunlah Jiwa dan Raganya</option>
                  <option value="Suara Demokrasi">Suara Demokrasi</option>
                  <option value="Rekayasa dan Teknologi">Rekayasa dan Teknologi</option>
                  <option value="Kewirausahaan">Kewirausahaan</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold block text-warm-secondary">Judul Proyek</label>
                <input type="text" required placeholder="e.g. Inovasi Olahan Sampah Plastik" value={newProyek.judul} onChange={(e) => setNewProyek({ ...newProyek, judul: e.target.value })} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold block text-warm-secondary">Tujuan Proyek</label>
              <textarea rows={2} placeholder="Deskripsi tujuan proyek..." value={newProyek.tujuan} onChange={(e) => setNewProyek({ ...newProyek, tujuan: e.target.value })} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-warm-secondary">Dimensi Profil Lulusan</label>
                <button type="button" onClick={handleAddDimensi} className="w-6 h-6 flex items-center justify-center bg-forest text-white font-bold text-xs rounded hover:bg-forest-dark cursor-pointer">+</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newProyek.dimensi.map((d) => (
                  <div key={d.id} className="flex items-center gap-1 bg-warm-card border border-warm-border px-2 py-1 rounded">
                    <select value={d.nama} onChange={(e) => setNewProyek((prev) => ({ ...prev, dimensi: prev.dimensi.map((dd) => dd.id === d.id ? { ...dd, nama: e.target.value } : dd) }))} className="bg-transparent text-xs font-semibold">
                      {DIMENSI_PROFIL_LULUSAN.map((dim) => (<option key={dim} value={dim}>{dim}</option>))}
                    </select>
                    <button type="button" onClick={() => handleRemoveDimensi(d.id)} className="text-red-400 hover:text-red-600 font-bold cursor-pointer">&times;</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-warm-secondary">Timeline Kegiatan</label>
                <button type="button" onClick={handleAddTimeline} className="w-6 h-6 flex items-center justify-center bg-forest text-white font-bold text-xs rounded hover:bg-forest-dark cursor-pointer">+</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {newProyek.timeline.map((tl) => (
                  <div key={tl.id} className="flex items-start gap-2 p-3 bg-warm-card border border-warm-border rounded-xl">
                    <div className="space-y-1 flex-1">
                      <input type="text" placeholder="Minggu ke" value={tl.minggu} onChange={(e) => setNewProyek((prev) => ({ ...prev, timeline: prev.timeline.map((t) => t.id === tl.id ? { ...t, minggu: e.target.value } : t) }))} className="w-full px-2 py-1 bg-warm-card border border-warm-border rounded text-xs font-bold" />
                      <textarea rows={2} placeholder="Aktivitas..." value={tl.aktivitas} onChange={(e) => setNewProyek((prev) => ({ ...prev, timeline: prev.timeline.map((t) => t.id === tl.id ? { ...t, aktivitas: e.target.value } : t) }))} className="w-full px-2 py-1 bg-warm-card border border-warm-border rounded text-xs" />
                    </div>
                    <button type="button" onClick={() => handleRemoveTimeline(tl.id)} className="text-red-400 hover:text-red-600 font-bold cursor-pointer mt-1">&times;</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="font-semibold block text-warm-secondary">Asesmen Awal</label><textarea rows={2} value={newProyek.asesmen.awal} onChange={(e) => setNewProyek({ ...newProyek, asesmen: { ...newProyek.asesmen, awal: e.target.value } })} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" /></div>
              <div className="space-y-1"><label className="font-semibold block text-warm-secondary">Asesmen Proses</label><textarea rows={2} value={newProyek.asesmen.proses} onChange={(e) => setNewProyek({ ...newProyek, asesmen: { ...newProyek.asesmen, proses: e.target.value } })} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" /></div>
              <div className="space-y-1"><label className="font-semibold block text-warm-secondary">Asesmen Akhir</label><textarea rows={2} value={newProyek.asesmen.akhir} onChange={(e) => setNewProyek({ ...newProyek, asesmen: { ...newProyek.asesmen, akhir: e.target.value } })} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" /></div>
              <div className="space-y-1"><label className="font-semibold block text-warm-secondary">Rubrik Asesmen</label><textarea rows={2} value={newProyek.asesmen.rubrik} onChange={(e) => setNewProyek({ ...newProyek, asesmen: { ...newProyek.asesmen, rubrik: e.target.value } })} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" /></div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold block text-warm-secondary">Narasi Rapor</label>
              <textarea rows={2} placeholder="Narasi capaian proyek untuk rapor..." value={newProyek.asesmen.narasiRapor} onChange={(e) => setNewProyek({ ...newProyek, asesmen: { ...newProyek.asesmen, narasiRapor: e.target.value } })} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" />
            </div>
            <button type="submit" className="self-end px-5 py-2 bg-forest hover:bg-forest-dark text-white rounded-lg font-bold transition-colors focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer">Simpan Proyek Kokurikuler</button>
          </form>
        </div>
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-bg text-center text-xs text-warm-text font-medium">
          <div><p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Menyetujui,</p><p className="font-bold text-warm-text underline text-xs">Koordinator Kokurikuler</p><p className="text-[10px] text-warm-muted">NIP. 19800612 200801 1 003</p></div>
          <div><p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">{identitas.kota || "Bandung"}, Juni 2026</p><p className="font-bold text-warm-text underline text-xs">Fasilitator Kelas {identitas.kelas}</p><p className="text-[10px] text-warm-muted">NIP. {identitas.nipGuru || "-"}</p></div>
        </div>
      </section>

      <div className="print:page-break-after"></div>

      {/* --- SECTION PORTOFOLIO --- */}
      <section id="doc-portofolio" className="bg-warm-card p-8 md:p-12 rounded-3xl border border-warm-border print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto min-h-[1100px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="border-b-2 border-warm-text pb-4">
            <h2 className="text-2xl font-bold text-warm-text uppercase tracking-tight flex items-center gap-3">
              <Image className="h-6 w-6 text-forest print:hidden" aria-hidden="true" />
              GALERI DOKUMENTASI DAN PORTOFOLIO SISWA
            </h2>
            <p className="text-xs font-medium text-warm-secondary uppercase tracking-widest mt-1">
              REPLIKA ARTEFAK KOMPUTASIONAL & MONITORING KEMAJUAN HARIAN SISWA TERBAIK
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portofolio.map((port) => (
              <div key={port.id} className="border border-warm-border rounded-2xl p-5 bg-warm-card space-y-4 hover:border-forest transition-colors text-xs text-warm-text relative flex flex-col justify-between">
                <button onClick={() => handleRemovePort(port.id)} aria-label="Hapus Portofolio" className="absolute top-5 right-5 text-warm-muted hover:text-red-500 transition-colors print:hidden focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                <div className="space-y-2.5">
                  <div className="border-b border-warm-bg pb-2">
                    <span className="text-[9px] font-bold text-forest uppercase block tracking-wider font-mono">{port.tanggalKarya} • Artefak Komputasional</span>
                    <h3 className="font-extrabold text-sm text-warm-text mt-1">{port.namaKarya}</h3>
                    <p className="text-warm-muted italic mt-0.5">Pembuat: {port.namaSiswa}</p>
                  </div>
                  <div><span className="text-[10px] font-bold text-warm-muted block uppercase mb-1">Rincian Deskripsi Portofolio</span><p className="p-3 bg-warm-bg/30 rounded-xl leading-normal text-warm-secondary font-semibold">{port.deskripsiKarya}</p></div>
                  <div><span className="text-[10px] font-bold text-emerald-700 block uppercase mb-1">Refleksi Singkat Guru</span><p className="p-3 bg-emerald-50/15 border-l-2 border-emerald-500 rounded-r-xl text-warm-text font-semibold">{port.refleksiSingkat}</p></div>
                </div>
                <div className="pt-3 border-t border-warm-bg flex justify-between items-center">
                  <span className="text-[10px] text-warm-muted">Predikat Kompetensi</span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-150 font-extrabold px-3 py-1 rounded-full text-[10px]">★ {port.predikat}</span>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddPort} className="bg-warm-bg/50 p-6 rounded-3xl border border-warm-border flex flex-col gap-4 text-xs text-warm-text print:hidden mt-6">
            <h4 className="font-bold text-warm-text uppercase flex items-center gap-1.5 border-b border-warm-border pb-2"><Plus className="h-4 w-4 text-forest" aria-hidden="true" /> Catat Portofolio Siswa Baru Sesi Ini</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="font-semibold block text-warm-secondary">Nama Siswa Kreator</label><select value={newPort.namaSiswa} onChange={(e) => setNewPort({ ...newPort, namaSiswa: e.target.value })} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg">{siswaList.map((s) => (<option key={s.id} value={s.nama}>{s.nama}</option>))}</select></div>
              <div className="space-y-1"><label className="font-semibold block text-warm-secondary">Nama / Judul Artefak Karya</label><input type="text" required placeholder="e.g. Program Arduino Pendeteksi Gempa Bumi" value={newPort.namaKarya} onChange={(e) => setNewPort({ ...newPort, namaKarya: e.target.value })} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="font-semibold block text-warm-secondary">Deskripsi Teknis Karya</label><textarea rows={2} placeholder="Deskripsikan fitur, kerangka kerja logika, serta inovasi fungsional dari karya..." value={newPort.deskripsiKarya} onChange={(e) => setNewPort({ ...newPort, deskripsiKarya: e.target.value })} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" /></div>
              <div className="space-y-1"><label className="font-semibold block text-warm-secondary">Catatan Refleksi & Komentar Guru</label><textarea rows={2} placeholder="Tulis sumbangan inovatif anak terhadap kelas atau lingkungan..." value={newPort.refleksiSingkat} onChange={(e) => setNewPort({ ...newPort, refleksiSingkat: e.target.value })} className="w-full px-3 py-2 bg-warm-card border border-warm-border rounded-lg" /></div>
            </div>
            <button type="submit" className="self-end px-5 py-2 bg-forest hover:bg-forest-dark text-white rounded-lg font-bold transition-colors focus-visible:outline-2 focus-visible:outline-amber-accent cursor-pointer">Arsipkan Portofolio</button>
          </form>
        </div>
        <div className="grid grid-cols-2 gap-12 pt-8 mt-12 border-t border-warm-bg text-center text-xs text-warm-text">
          <div><p className="text-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">Mengetahui,</p><p className="font-bold text-warm-text underline text-xs">Wakil Kepala Sekolah Bid. Kesiswaan</p><p className="text-[10px] text-warm-muted">NIP. 19760718 200501 2 001</p></div>
          <div><p className="font-[10px] font-bold text-warm-muted uppercase tracking-widest mb-12">{identitas.kota || "Bandung"}, Juni 2026</p><p className="font-bold text-warm-text underline text-xs">Guru Wali Kelas</p><p className="text-[10px] text-warm-muted">NIP. {identitas.nipGuru || "-"}</p></div>
        </div>
      </section>
    </div>
  );
}
