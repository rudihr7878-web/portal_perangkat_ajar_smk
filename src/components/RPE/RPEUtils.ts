import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

export interface RPEDetailBulan {
  bulan: string;
  jumlahPekan: number;
}

export interface RPEKegiatan {
  id: string;
  nama: string;
  jumlahPekan: number;
}

export interface RPERecord {
  id: string;
  tahunAjaran: string;
  semester: "Ganjil" | "Genap";
  kelas: string;
  mataPelajaran: string;
  guruId: string;
  guruNama: string;
  jpPerMinggu: number;
  detailBulan: RPEDetailBulan[];
  kegiatanTidakEfektif: RPEKegiatan[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface RPEHistoryEntry {
  version: number;
  data: RPERecord;
  timestamp: string;
}

export const BULAN_DEFAULT = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni"
];

export const PEKAN_DEFAULT = [4, 4, 4, 5, 4, 4];

export const KEGIATAN_DEFAULT = [
  "LPP", "Pondok Ramadhan", "Libur Hari Raya",
  "Sumatif Akhir Semester", "UKK", "PSAJ", "SAS",
  "Class Meeting", "Libur Semester"
];

export const STORAGE_LIST_KEY = "sim_guru_rpe_list";
export const STORAGE_HISTORY_PREFIX = "sim_guru_rpe_history_";
export const STORAGE_TEMPLATE_GASAL = "sim_guru_rpe_template_gasal";
export const STORAGE_TEMPLATE_GENAP = "sim_guru_rpe_template_genap";

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function setItem(key: string, value: any) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function loadRPEList(): RPERecord[] {
  return getItem<RPERecord[]>(STORAGE_LIST_KEY, []);
}

export function saveRPEList(list: RPERecord[]) {
  setItem(STORAGE_LIST_KEY, list);
}

export function loadRPEHistory(rpeId: string): RPEHistoryEntry[] {
  return getItem<RPEHistoryEntry[]>(STORAGE_HISTORY_PREFIX + rpeId, []);
}

export function saveRPEHistory(rpeId: string, history: RPEHistoryEntry[]) {
  setItem(STORAGE_HISTORY_PREFIX + rpeId, history);
}

export function pushRPEHistory(rpe: RPERecord) {
  const history = loadRPEHistory(rpe.id);
  history.push({
    version: rpe.version,
    data: JSON.parse(JSON.stringify(rpe)),
    timestamp: rpe.updatedAt,
  });
  if (history.length > 50) history.splice(0, history.length - 50);
  saveRPEHistory(rpe.id, history);
}

export function loadTemplate(gasalOrGenap: "gasal" | "genap"): RPERecord | null {
  const key = gasalOrGenap === "gasal" ? STORAGE_TEMPLATE_GASAL : STORAGE_TEMPLATE_GENAP;
  return getItem<RPERecord | null>(key, null);
}

export function saveTemplate(t: RPERecord, gasalOrGenap: "gasal" | "genap") {
  const key = gasalOrGenap === "gasal" ? STORAGE_TEMPLATE_GASAL : STORAGE_TEMPLATE_GENAP;
  setItem(key, t);
}

export function calculateTotals(detailBulan: RPEDetailBulan[], kegiatan: RPEKegiatan[], jpPerMinggu: number) {
  const totalPekan = detailBulan.reduce((s, b) => s + (b.jumlahPekan || 0), 0);
  const totalTidakEfektif = kegiatan.reduce((s, k) => s + (k.jumlahPekan || 0), 0);
  const totalEfektif = Math.max(0, totalPekan - totalTidakEfektif);
  const jamEfektif = totalEfektif * (jpPerMinggu || 0);
  return { totalPekan, totalTidakEfektif, totalEfektif, jamEfektif };
}

export function createEmptyRPE(): RPERecord {
  return {
    id: "rpe_" + Date.now(),
    tahunAjaran: "",
    semester: "Ganjil",
    kelas: "",
    mataPelajaran: "",
    guruId: "",
    guruNama: "",
    jpPerMinggu: 0,
    detailBulan: BULAN_DEFAULT.map((b, i) => ({ bulan: b, jumlahPekan: PEKAN_DEFAULT[i] })),
    kegiatanTidakEfektif: KEGIATAN_DEFAULT.map(k => ({ id: "kgt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), nama: k, jumlahPekan: 1 })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useAutoSave(rpe: RPERecord | null, saveFn: (r: RPERecord) => void, delay = 1500) {
  const debounced = useDebounce(rpe, delay);
  const prevRef = useRef<string>("");
  useEffect(() => {
    if (!debounced) return;
    const str = JSON.stringify(debounced);
    if (str === prevRef.current) return;
    prevRef.current = str;
    saveFn(debounced);
  }, [debounced, saveFn]);
}

export function exportRPEToExcel(rpe: RPERecord, totals: ReturnType<typeof calculateTotals>) {
  const wsData: any[][] = [];
  wsData.push(["RENCANA PEKAN EFEKTIF"]);
  wsData.push(["Nama Sekolah", rpe.guruNama ? "" : "", "Tahun Pelajaran", rpe.tahunAjaran]);
  wsData.push(["Mata Pelajaran", rpe.mataPelajaran, "Kelas", rpe.kelas]);
  wsData.push(["Guru", rpe.guruNama, "Semester", rpe.semester]);
  wsData.push([]);
  wsData.push(["BANYAKNYA PEKAN"]);
  wsData.push(["No", "Bulan", "Jumlah Pekan"]);
  rpe.detailBulan.forEach((b, i) => wsData.push([i + 1, b.bulan, b.jumlahPekan]));
  wsData.push(["", "TOTAL", totals.totalPekan]);
  wsData.push([]);
  wsData.push(["PEKAN TIDAK EFEKTIF"]);
  wsData.push(["No", "Nama Kegiatan", "Jumlah Pekan"]);
  rpe.kegiatanTidakEfektif.forEach((k, i) => wsData.push([i + 1, k.nama, k.jumlahPekan]));
  wsData.push(["", "TOTAL", totals.totalTidakEfektif]);
  wsData.push([]);
  wsData.push(["PERHITUNGAN"]);
  wsData.push(["Total Pekan Semester", totals.totalPekan]);
  wsData.push(["Total Pekan Tidak Efektif", totals.totalTidakEfektif]);
  wsData.push(["Pekan Efektif", totals.totalEfektif]);
  wsData.push(["JP per Minggu", rpe.jpPerMinggu]);
  wsData.push(["Jam Efektif", totals.jamEfektif]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [{ wch: 6 }, { wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws, "RPE");
  XLSX.writeFile(wb, `RPE_${rpe.tahunAjaran.replace("/", "_")}_${rpe.semester}_${rpe.kelas.replace(/\s/g, "_")}.xlsx`);
}

export function exportRPEToPrint(rpe: RPERecord, totals: ReturnType<typeof calculateTotals>): string {
  const rowsPekan = rpe.detailBulan.map((b, i) =>
    `<tr><td style="border:1px solid #000;padding:4px;text-align:center">${i + 1}</td><td style="border:1px solid #000;padding:4px">${b.bulan}</td><td style="border:1px solid #000;padding:4px;text-align:center">${b.jumlahPekan}</td></tr>`
  ).join("");
  const rowsKegiatan = rpe.kegiatanTidakEfektif.map((k, i) =>
    `<tr><td style="border:1px solid #000;padding:4px;text-align:center">${i + 1}</td><td style="border:1px solid #000;padding:4px">${k.nama}</td><td style="border:1px solid #000;padding:4px;text-align:center">${k.jumlahPekan}</td></tr>`
  ).join("");

  return `
    <html><head><meta charset="utf-8"><title>RPE</title>
    <style>body{font-family:Times New Roman,serif;font-size:12pt;padding:2cm}
    table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #000;padding:6px;text-align:center}
    th{background:#f0f0f0}
    h1,h2,h3{text-align:center}
    .info{width:100%;border:none}
    .info td{border:none;text-align:left;padding:2px 6px}
    .total{font-weight:bold}
    .hasil{font-weight:bold;font-size:14pt}
    </style></head><body>
    <h1>RENCANA PEKAN EFEKTIF</h1>
    <table class="info">
    <tr><td style="width:20%"><b>Sekolah</b></td><td style="width:30%">${rpe.guruNama ? "—" : ""}</td><td style="width:20%"><b>Tahun Pelajaran</b></td><td style="width:30%">${rpe.tahunAjaran}</td></tr>
    <tr><td><b>Mata Pelajaran</b></td><td>${rpe.mataPelajaran}</td><td><b>Kelas</b></td><td>${rpe.kelas}</td></tr>
    <tr><td><b>Guru</b></td><td>${rpe.guruNama}</td><td><b>Semester</b></td><td>${rpe.semester}</td></tr>
    </table>
    <br/>
    <h3>A. BANYAKNYA PEKAN</h3>
    <table><thead><tr><th style="width:40px">No</th><th>Bulan</th><th style="width:120px">Jumlah Pekan</th></tr></thead><tbody>${rowsPekan}</tbody>
    <tfoot><tr class="total"><td colspan="2">TOTAL</td><td>${totals.totalPekan}</td></tr></tfoot></table>
    <br/>
    <h3>B. PEKAN TIDAK EFEKTIF</h3>
    <table><thead><tr><th style="width:40px">No</th><th>Nama Kegiatan</th><th style="width:120px">Jumlah Pekan</th></tr></thead><tbody>${rowsKegiatan}</tbody>
    <tfoot><tr class="total"><td colspan="2">TOTAL</td><td>${totals.totalTidakEfektif}</td></tr></tfoot></table>
    <br/>
    <h3>C. PERHITUNGAN PEKAN & JAM EFEKTIF</h3>
    <table>
    <tr><td style="text-align:left;padding:6px"><b>Total Pekan Semester</b></td><td style="width:120px">${totals.totalPekan} pekan</td></tr>
    <tr><td style="text-align:left;padding:6px"><b>Total Pekan Tidak Efektif</b></td><td>${totals.totalTidakEfektif} pekan</td></tr>
    <tr style="background:#f9f9f9"><td style="text-align:left;padding:6px"><b>Pekan Efektif</b></td><td class="hasil">${totals.totalEfektif} pekan</td></tr>
    <tr><td style="text-align:left;padding:6px"><b>JP per Minggu</b></td><td>${rpe.jpPerMinggu} JP</td></tr>
    <tr style="background:#f9f9f9"><td style="text-align:left;padding:6px"><b>Jam Efektif</b></td><td class="hasil">${totals.jamEfektif} JP</td></tr>
    </table>
    </body></html>
  `;
}

export function importRPEFromExcel(file: File): Promise<Partial<RPERecord>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        let tahunAjaran = "", kelas = "", mataPelajaran = "", guruNama = "", semester: "Ganjil" | "Genap" = "Ganjil";
        const detailBulan: RPEDetailBulan[] = [];
        const kegiatanTidakEfektif: RPEKegiatan[] = [];
        let parsingKegiatan = false;

        for (const row of json) {
          if (!row || row.length < 2) continue;
          const a = String(row[0] || "").trim().toLowerCase();
          const b = String(row[1] || "").trim();

          if (a.includes("tahun pelajaran")) tahunAjaran = b;
          else if (a.includes("kelas")) kelas = b;
          else if (a.includes("mata pelajaran")) mataPelajaran = b;
          else if (a.includes("guru") && !a.includes("nama")) guruNama = b;
          else if (a.includes("semester")) semester = (b.toLowerCase().includes("genap") ? "Genap" : "Ganjil");
          else if (a.includes("pekana") || (a === "no" && row[1] && String(row[1]).toLowerCase().includes("bulan"))) {
            parsingKegiatan = false;
          } else if (a.includes("banyaknya pekan") || a.includes("pekanan")) {
            parsingKegiatan = false;
          } else if (a.includes("tidak efektif")) {
            parsingKegiatan = true;
          } else if (a === "total" && !parsingKegiatan) {
            // skip totals
          } else if (a === "total" && parsingKegiatan) {
            // skip totals
          } else if (!parsingKegiatan && row.length >= 3 && !isNaN(Number(row[2]))) {
            const bulan = String(row[1] || "").trim();
            const jp = Number(row[2]);
            if (bulan && BULAN_DEFAULT.includes(bulan)) detailBulan.push({ bulan, jumlahPekan: jp });
          } else if (parsingKegiatan && row.length >= 3 && !isNaN(Number(row[2]))) {
            const nama = String(row[1] || "").trim();
            const jp = Number(row[2]);
            if (nama) kegiatanTidakEfektif.push({ id: "kgt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), nama, jumlahPekan: jp });
          }
        }

        resolve({ tahunAjaran, kelas, mataPelajaran, guruNama, semester, detailBulan: detailBulan.length > 0 ? detailBulan : undefined, kegiatanTidakEfektif: kegiatanTidakEfektif.length > 0 ? kegiatanTidakEfektif : undefined });
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
