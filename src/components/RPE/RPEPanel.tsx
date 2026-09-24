import React, { useState, useMemo, useCallback } from "react";
import { Plus, FileText, Clock, Copy, Save, History, BookTemplate, ChevronLeft, Eye, Pencil, Check, X, Calendar, BookOpen } from "lucide-react";
import RPEForm from "./RPEForm";
import {
  RPERecord, RPEHistoryEntry, loadRPEList, saveRPEList,
  loadRPEHistory, pushRPEHistory, loadTemplate, saveTemplate,
  createEmptyRPE, calculateTotals
} from "./RPEUtils";

interface Props {
  config: any;
  onUpdateConfig: (c: any) => void;
}

export default function RPEPanel({ config, onUpdateConfig }: Props) {
  const [activeTab, setActiveTab] = useState<"list" | "form" | "history" | "template">("list");
  const [selectedRPE, setSelectedRPE] = useState<RPERecord | null>(null);
  const [rpeList, setRpeList] = useState<RPERecord[]>(() => loadRPEList());
  const [historyEntries, setHistoryEntries] = useState<RPEHistoryEntry[]>([]);
  const [historyRpeId, setHistoryRpeId] = useState<string>("");
  const [templateType, setTemplateType] = useState<"gasal" | "genap">("gasal");
  const [templateData, setTemplateData] = useState<RPERecord | null>(null);

  const guruOptions = useMemo(() => {
    return (config?.gurus || []).map((g: any) => ({ id: g.id, nama: g.nama }));
  }, [config]);

  const refreshList = useCallback(() => {
    setRpeList(loadRPEList());
  }, []);

  const handleCreate = () => {
    const newRpe = createEmptyRPE();
    if (guruOptions.length > 0) {
      newRpe.guruId = guruOptions[0].id;
      newRpe.guruNama = guruOptions[0].nama;
    }
    setSelectedRPE(newRpe);
    setActiveTab("form");
  };

  const handleEdit = (rpe: RPERecord) => {
    setSelectedRPE(JSON.parse(JSON.stringify(rpe)));
    setActiveTab("form");
  };

  const handleSave = (rpe: RPERecord) => {
    pushRPEHistory(rpe);
    const list = loadRPEList();
    const idx = list.findIndex((r: RPERecord) => r.id === rpe.id);
    if (idx >= 0) list[idx] = rpe;
    else list.push(rpe);
    saveRPEList(list);
    setRpeList(list);
  };

  const handleDuplicate = (rpe: RPERecord) => {
    const dup: RPERecord = {
      ...JSON.parse(JSON.stringify(rpe)),
      id: "rpe_" + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    setSelectedRPE(dup);
    setActiveTab("form");
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus RPE ini?")) return;
    const list = loadRPEList().filter((r: RPERecord) => r.id !== id);
    saveRPEList(list);
    setRpeList(list);
  };

  const showHistory = (rpe: RPERecord) => {
    setHistoryRpeId(rpe.id);
    setHistoryEntries(loadRPEHistory(rpe.id));
    setActiveTab("history");
  };

  const restoreVersion = (entry: RPEHistoryEntry) => {
    handleEdit(entry.data);
  };

  const loadTemplateData = (type: "gasal" | "genap") => {
    setTemplateType(type);
    setTemplateData(loadTemplate(type));
  };

  const saveAsTemplate = () => {
    if (!selectedRPE) return;
    saveTemplate(selectedRPE, templateType);
    alert("Template tersimpan sebagai " + (templateType === "gasal" ? "Semester Gasal" : "Semester Genap"));
  };

  const applyTemplate = () => {
    const t = loadTemplate(templateType);
    if (!t) return alert("Belum ada template untuk semester ini.");
    const newRpe = {
      ...JSON.parse(JSON.stringify(t)),
      id: "rpe_" + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    setSelectedRPE(newRpe);
    setActiveTab("form");
  };

  return (
    <div className="space-y-4">
      {/* ─── TABS ─── */}
      <div className="flex items-center gap-2 border-b border-warm-border pb-3">
        <button onClick={() => { setActiveTab("list"); refreshList(); }} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeTab === "list" ? "bg-forest text-white shadow-sm" : "text-warm-secondary hover:text-warm-text hover:bg-warm-bg"}`}><FileText className="h-3.5 w-3.5" /> Daftar RPE</button>
        <button onClick={() => { setActiveTab("template"); loadTemplateData("gasal"); }} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeTab === "template" ? "bg-forest text-white shadow-sm" : "text-warm-secondary hover:text-warm-text hover:bg-warm-bg"}`}><BookTemplate className="h-3.5 w-3.5" /> Template</button>
        {selectedRPE && activeTab === "form" && (
          <button onClick={() => { setActiveTab("history"); setHistoryRpeId(selectedRPE.id); setHistoryEntries(loadRPEHistory(selectedRPE.id)); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl text-warm-secondary hover:text-warm-text hover:bg-warm-bg transition-all cursor-pointer"><Clock className="h-3.5 w-3.5" /> Riwayat</button>
        )}
        <div className="ml-auto">
          {activeTab === "list" && (
            <button onClick={handleCreate} className="flex items-center gap-1.5 px-4 py-2 bg-forest hover:bg-forest-dark text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"><Plus className="h-3.5 w-3.5" /> Buat RPE Baru</button>
          )}
        </div>
      </div>

      {/* ─── TAB: LIST ─── */}
      {activeTab === "list" && (
        <div>
          {rpeList.length === 0 ? (
            <div className="text-center py-12 bg-warm-card border border-warm-border rounded-2xl">
              <Calendar className="h-10 w-10 text-warm-secondary mx-auto mb-3" />
              <p className="text-sm font-bold text-warm-text mb-1">Belum ada Rencana Pekan Efektif</p>
              <p className="text-xs text-warm-secondary mb-4">Buat RPE baru untuk memulai perencanaan pembelajaran.</p>
              <button onClick={handleCreate} className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest hover:bg-forest-dark text-white font-bold text-xs rounded-xl transition-all cursor-pointer"><Plus className="h-3.5 w-3.5" /> Buat RPE Baru</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rpeList.map((rpe: RPERecord) => {
                const t = calculateTotals(rpe.detailBulan, rpe.kegiatanTidakEfektif, rpe.jpPerMinggu);
                return (
                  <div key={rpe.id} className="bg-warm-card border border-warm-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-warm-text text-sm">{rpe.mataPelajaran || "—"}</h4>
                        <p className="text-[10px] text-warm-secondary">{rpe.kelas} • {rpe.semester} • {rpe.tahunAjaran}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-warm-secondary mb-3">{rpe.guruNama}</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-blue-50 rounded-lg p-2 text-center"><span className="text-[9px] text-blue-600 font-bold block">Pekan</span><span className="text-sm font-bold text-blue-700">{t.totalPekan}</span></div>
                      <div className="bg-emerald-50 rounded-lg p-2 text-center"><span className="text-[9px] text-emerald-600 font-bold block">Efektif</span><span className="text-sm font-bold text-emerald-700">{t.totalEfektif}</span></div>
                      <div className="bg-amber-50 rounded-lg p-2 text-center"><span className="text-[9px] text-amber-600 font-bold block">Tdk Efektif</span><span className="text-sm font-bold text-amber-700">{t.totalTidakEfektif}</span></div>
                      <div className="bg-violet-50 rounded-lg p-2 text-center"><span className="text-[9px] text-violet-600 font-bold block">Jam Efektif</span><span className="text-sm font-bold text-violet-700">{t.jamEfektif}</span></div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleEdit(rpe)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-forest/10 text-forest text-[10px] font-bold rounded-lg hover:bg-forest/20 transition-all cursor-pointer"><Pencil className="h-3 w-3" /> Edit</button>
                      <button onClick={() => handleDuplicate(rpe)} className="flex items-center justify-center gap-1 px-2 py-1.5 bg-warm-bg text-warm-secondary text-[10px] font-bold rounded-lg hover:bg-warm-border transition-all cursor-pointer" title="Duplikat"><Copy className="h-3 w-3" /></button>
                      <button onClick={() => showHistory(rpe)} className="flex items-center justify-center gap-1 px-2 py-1.5 bg-warm-bg text-warm-secondary text-[10px] font-bold rounded-lg hover:bg-warm-border transition-all cursor-pointer" title="Riwayat"><History className="h-3 w-3" /></button>
                      <button onClick={() => handleDelete(rpe.id)} className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 text-red-500 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-all cursor-pointer" title="Hapus"><X className="h-3 w-3" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: FORM ─── */}
      {activeTab === "form" && selectedRPE && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setActiveTab("list")} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-warm-secondary hover:text-warm-text transition-all cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /> Kembali</button>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => { setTemplateType(templateType); saveAsTemplate(); }} className="flex items-center gap-1 px-3 py-1.5 bg-warm-card border border-warm-border text-warm-secondary hover:text-warm-text text-[10px] font-bold rounded-xl transition-all cursor-pointer"><BookTemplate className="h-3.5 w-3.5" /> Simpan Template</button>
            </div>
          </div>
          <RPEForm rpe={selectedRPE} onChange={setSelectedRPE} onSave={handleSave} guruOptions={guruOptions} />
        </div>
      )}

      {/* ─── TAB: HISTORY ─── */}
      {activeTab === "history" && (
        <div className="bg-warm-card border border-warm-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => { setActiveTab("list"); }} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-warm-secondary hover:text-warm-text transition-all cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /> Kembali</button>
            <h3 className="text-sm font-bold text-warm-text ml-2">Riwayat Revisi</h3>
          </div>
          {historyEntries.length === 0 ? (
            <p className="text-xs text-warm-secondary text-center py-8">Belum ada riwayat revisi.</p>
          ) : (
            <div className="space-y-2">
              {[...historyEntries].reverse().map((entry, idx) => {
                const t = calculateTotals(entry.data.detailBulan || [], entry.data.kegiatanTidakEfektif || [], entry.data.jpPerMinggu || 0);
                return (
                  <div key={entry.version} className="flex items-center justify-between p-3 bg-warm-bg rounded-xl border border-warm-border/50">
                    <div>
                      <span className="text-[10px] font-bold text-warm-text">Versi {entry.version}</span>
                      <span className="text-[10px] text-warm-secondary ml-2">{new Date(entry.timestamp).toLocaleString("id-ID")}</span>
                      <span className="text-[10px] text-warm-secondary ml-2">Efektif: {t.totalEfektif} pekan | Jam: {t.jamEfektif} JP</span>
                    </div>
                    <button onClick={() => restoreVersion(entry)} className="flex items-center gap-1 px-2 py-1 bg-forest/10 text-forest text-[10px] font-bold rounded-lg hover:bg-forest/20 transition-all cursor-pointer"><Save className="h-3 w-3" /> Restore</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: TEMPLATE ─── */}
      {activeTab === "template" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-warm-card border border-warm-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-forest" />
              <h3 className="font-bold text-warm-text text-sm">Template Semester Gasal</h3>
            </div>
            <p className="text-xs text-warm-secondary mb-4">Template untuk semester ganjil (Juli - Desember).</p>
            {loadTemplate("gasal") ? (
              <div className="text-xs text-emerald-600 font-bold mb-3">✓ Template tersedia</div>
            ) : (
              <div className="text-xs text-warm-secondary mb-3">Belum ada template.</div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setTemplateType("gasal"); applyTemplate(); }} className="flex-1 px-3 py-2 bg-forest text-white text-[10px] font-bold rounded-xl hover:brightness-110 transition-all cursor-pointer">Gunakan Template</button>
            </div>
          </div>
          <div className="bg-warm-card border border-warm-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-warm-text text-sm">Template Semester Genap</h3>
            </div>
            <p className="text-xs text-warm-secondary mb-4">Template untuk semester genap (Januari - Juni).</p>
            {loadTemplate("genap") ? (
              <div className="text-xs text-emerald-600 font-bold mb-3">✓ Template tersedia</div>
            ) : (
              <div className="text-xs text-warm-secondary mb-3">Belum ada template.</div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setTemplateType("genap"); applyTemplate(); }} className="flex-1 px-3 py-2 bg-amber-600 text-white text-[10px] font-bold rounded-xl hover:brightness-110 transition-all cursor-pointer">Gunakan Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
