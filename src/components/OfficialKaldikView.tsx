import React, { useState, useRef, useMemo } from "react";
import { AdminMasterConfig } from "../utils";
import { Download, Printer, ZoomIn, Maximize, RotateCcw, FileText, Table2 } from "lucide-react";
import * as XLSX from "xlsx";

interface Props {
  config: AdminMasterConfig;
}

interface DayCell {
  date: number;
  dayOfWeek: number;
  agendaItem?: any;
  holidayCode: string;
  effectiveNum: number;
}

interface MonthData {
  nama: string;
  namaSingkat: string;
  year: number;
  monthIndex: number;
  daysInMonth: number;
  startDay: number;
  cells: (DayCell | null)[];
  effectiveCount: number;
}

const HOLIDAY_META: Record<string, { label: string; color: string; bg: string; text: string }> = {
  LU:  { label: "Libur Umum",              color: "#EF4444", bg: "bg-red-500",  text: "text-white" },
  LHB: { label: "Libur Hari Besar",        color: "#FB923C", bg: "bg-orange-400", text: "text-white" },
  LS1: { label: "Libur Semester 1",        color: "#FCD34D", bg: "bg-yellow-300", text: "text-yellow-900" },
  LS2: { label: "Libur Semester 2",        color: "#A7F3D0", bg: "bg-green-200", text: "text-green-900" },
  KTS: { label: "Kegiatan Tengah Semester", color: "#60A5FA", bg: "bg-blue-400",  text: "text-white" },
  CB:  { label: "Cuti Bersama",            color: "#A78BFA", bg: "bg-purple-400", text: "text-white" },
  KPP: { label: "Keg. Penutup Pelajaran",  color: "#F472B6", bg: "bg-pink-400",  text: "text-white" },
  LHR: { label: "Libur Hari Raya",         color: "#F59E0B", bg: "bg-amber-400", text: "text-white" },
};

const BULAN_INDONESIA = [
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  "Januari", "Februari", "Maret", "April", "Mei", "Juni"
];
const BULAN_SINGKAT = [
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun"
];

function getHolidayCode(ag: any): string {
  const k = (ag.kegiatan || "").toLowerCase();
  const d = (ag.deskripsi || "").toLowerCase();
  const gabung = k + " " + d;

  if (gabung.includes("idul fitri") || gabung.includes("natal") || gabung.includes("hari raya") || gabung.includes("nyepi") || gabung.includes("waisak") || gabung.includes("tahun baru imlek") || gabung.includes("isra miraj") || gabung.includes("kenaikan isa")) return "LHR";

  if (gabung.includes("cuti bersama")) return "CB";

  if (gabung.includes("libur semester") || gabung.includes("libur akhir semester")) {
    const m = parseInt(ag.tanggal?.split("-")[1] || "0");
    if (m >= 6 && m <= 12) return "LS1";
    return "LS2";
  }

  if (gabung.includes("pembagian rapor") || gabung.includes("penerimaan rapor") || (gabung.includes("rapor") && (gabung.includes("penutup") || gabung.includes("akhir")))) return "KPP";

  if (gabung.includes("sas") || gabung.includes("sts") || gabung.includes("satuan pendidikan") || gabung.includes("tengah semester") || gabung.includes("sumatif akhir") || gabung.includes("sumatif tengah")) return "KTS";

  if (gabung.includes("tahun baru") || gabung.includes("kemerdekaan") || gabung.includes("hari nasional") || gabung.includes("proklamasi") || gabung.includes("pancasila") || gabung.includes("hari besar") || gabung.includes("libur nasional")) return "LU";

  if (ag.kategori === "libur") return "LU";
  if (ag.kategori === "asesmen") return "KTS";
  if (ag.kategori === "sekolah") return "KPP";

  return "LHB";
}

function getMonthsData(tahunAjaran: string, agenda: any[]): { months: MonthData[]; totalEfektif: number } {
  const startYear = parseInt(tahunAjaran?.split("/")[0] || "2026");
  const months: MonthData[] = [];
  let totalEfektif = 0;

  for (let i = 0; i < 12; i++) {
    const m = (6 + i) % 12;
    const y = m < 6 ? startYear + 1 : startYear;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const startDay = new Date(y, m, 1).getDay();

    const cells: (DayCell | null)[] = [];
    let effectiveNum = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(y, m, d).getDay();
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      const ags = agenda.filter((a: any) => a.tanggal && (a.tanggal === dateStr || (a.tanggalSelesai && a.tanggal <= dateStr && a.tanggalSelesai >= dateStr)));
      const ag = ags[0];

      const isSunday = dayOfWeek === 0;
      const isFriday = dayOfWeek === 5;

      let holidayCode = "";
      if (ag) holidayCode = getHolidayCode(ag);

      const isEffective = !isSunday && !isFriday && !holidayCode;
      if (isEffective) effectiveNum++;

      cells.push({
        date: d,
        dayOfWeek,
        agendaItem: ag || undefined,
        holidayCode,
        effectiveNum: isEffective ? effectiveNum : 0,
      });
    }

    for (let pad = 0; pad < startDay; pad++) {
      cells.unshift(null);
    }

    months.push({
      nama: BULAN_INDONESIA[i],
      namaSingkat: BULAN_SINGKAT[i],
      year: y,
      monthIndex: m,
      daysInMonth,
      startDay,
      cells,
      effectiveCount: effectiveNum,
    });
    totalEfektif += effectiveNum;
  }

  return { months, totalEfektif };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${parseInt(d)} ${BULAN_INDONESIA[parseInt(m) - 1]} ${y}`;
}

export default function OfficialKaldikView({ config }: Props) {
  const guru = config.gurus?.[0];
  const tahunAjaran = guru?.tahunAjaran || "2026/2027";
  const namaSekolah = guru?.namaSekolah || "RA";
  const namaKepsek = guru?.namaKepsek || "";
  const logoUrl = guru?.logoUrl;

  const agenda = config.kalender?.agenda || [];

  const { months, totalEfektif } = useMemo(() => getMonthsData(tahunAjaran, agenda), [tahunAjaran, agenda]);

  const forcedSemester = guru?.semester === "Genap" ? "Genap" : "Ganjil & Genap";

  const [zoom, setZoom] = useState(1);
  const [landscape, setLandscape] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const wsData: any[][] = [];
    wsData.push(["BULAN", ...Array.from({ length: 31 }, (_, i) => String(i + 1))]);
    for (const mn of months) {
      const row: any[] = [mn.nama.toUpperCase()];
      for (let i = 1; i <= 31; i++) {
        const cell = mn.cells[i - 1];
        if (!cell || cell.date > mn.daysInMonth) {
          row.push("");
        } else if (cell.holidayCode) {
          row.push(cell.holidayCode);
        } else if (cell.effectiveNum > 0) {
          row.push(cell.effectiveNum);
        } else {
          row.push(cell.date);
        }
      }
      wsData.push(row);
    }
    wsData.push([]);
    const legendaHeader = ["KODE", "KETERANGAN", "WARNA"];
    wsData.push(legendaHeader);
    for (const [kode, meta] of Object.entries(HOLIDAY_META)) {
      wsData.push([kode, meta.label, meta.color]);
    }
    wsData.push([]);
    wsData.push(["REKAP HARI EFEKTIF"]);
    wsData.push(["Semester Ganjil", String(months.slice(0, 6).reduce((s, m) => s + m.effectiveCount, 0))]);
    wsData.push(["Semester Genap", String(months.slice(6).reduce((s, m) => s + m.effectiveCount, 0))]);
    wsData.push(["Total", String(totalEfektif)]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 12 }, ...Array.from({ length: 31 }, () => ({ wch: 5 }))];
    XLSX.utils.book_append_sheet(wb, ws, "Kalender Pendidikan");
    XLSX.writeFile(wb, `Kalender_Pendidikan_${tahunAjaran.replace("/", "_")}.xlsx`);
  };

  const nationalHolidays = agenda.filter((a: any) => {
    const code = getHolidayCode(a);
    return code === "LU" || code === "LHR" || code === "LHB";
  });

  const semGanjil = months.slice(0, 6).reduce((s, m) => s + m.effectiveCount, 0);
  const semGenap = months.slice(6).reduce((s, m) => s + m.effectiveCount, 0);

  return (
    <div className={`font-sans ${landscape ? "landscape-mode" : ""}`}>
      {/* ─── TOOLBAR ─── */}
      <div className="flex flex-wrap items-center gap-2 mb-5 print:hidden bg-warm-card border border-warm-border rounded-2xl p-3 shadow-sm">
        <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-forest hover:bg-forest-dark text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"><Table2 className="h-3.5 w-3.5" /> Export Excel</button>
        <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-card border border-warm-border text-warm-secondary hover:bg-warm-bg text-[10px] font-bold rounded-lg transition-colors cursor-pointer"><Printer className="h-3.5 w-3.5" /> Print</button>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-1.5 border border-warm-border rounded-lg hover:bg-warm-bg transition-colors cursor-pointer" title="Perkecil"><ZoomIn className="h-3.5 w-3.5 text-warm-muted" /></button>
          <span className="text-[10px] font-bold text-warm-secondary w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-1.5 border border-warm-border rounded-lg hover:bg-warm-bg transition-colors cursor-pointer" title="Perbesar"><ZoomIn className="h-3.5 w-3.5 text-warm-muted" /></button>
        </div>
        <button onClick={toggleFullscreen} className="flex items-center gap-1.5 px-3 py-1.5 border border-warm-border text-warm-secondary hover:bg-warm-bg text-[10px] font-bold rounded-lg transition-colors cursor-pointer"><Maximize className="h-3.5 w-3.5" /> Fullscreen</button>
        <button onClick={() => setLandscape(!landscape)} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${landscape ? "bg-forest text-white border-forest" : "border-warm-border text-warm-secondary hover:bg-warm-bg"}`}><RotateCcw className="h-3.5 w-3.5" /> {landscape ? "Portrait" : "Landscape"}</button>
      </div>

      {/* ─── KONTEN UTAMA ─── */}
      <div ref={containerRef} className="bg-white rounded-2xl border border-warm-border shadow-sm overflow-hidden" style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: zoom !== 1 ? `${100 / zoom}%` : undefined }}>
        {/* ─── HEADER ─── */}
        <div className="text-center py-6 px-8 border-b border-gray-200 print:border-b-2 print:border-black">
          <div className="flex items-center justify-center gap-4 mb-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-forest/10 flex items-center justify-center text-forest font-bold text-xl">RA</div>
            )}
            <div>
              <h1 className="text-xl font-bold uppercase text-gray-800">{namaSekolah}</h1>
              <h2 className="text-lg font-bold text-gray-700 mt-0.5">KALENDER PENDIDIKAN</h2>
              <p className="text-sm font-semibold text-gray-600">Tahun Pelajaran {tahunAjaran}</p>
              <p className="text-xs text-gray-500">Semester {forcedSemester === "Ganjil & Genap" ? "Ganjil dan Genap" : forcedSemester}</p>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-3 text-sm text-gray-700">
            <span><span className="font-bold">Jumlah Hari Efektif:</span> {totalEfektif} hari</span>
            <span><span className="font-bold">Hari Libur Mingguan:</span> Jumat</span>
          </div>
        </div>

        {/* ─── DESKTOP: TABEL 12 BULAN ─── */}
        <div ref={tableRef} className="overflow-x-auto kaldik-table print:overflow-visible">
          <table className="w-full text-[10px] border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className="sticky left-0 z-10 bg-gray-50 px-2 py-1.5 text-left font-bold text-gray-700 text-[9px] uppercase tracking-wider w-24 min-w-[90px]">Bulan</th>
                {Array.from({ length: 31 }, (_, i) => (
                  <th key={i} className="text-center font-bold text-gray-600 text-[9px] py-1.5 px-0.5 w-7 min-w-[22px]">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((mn) => (
                <tr key={mn.nama} className="border-b border-gray-200 hover:bg-gray-50/50">
                  <td className="sticky left-0 z-10 bg-white px-2 py-1 font-bold text-gray-700 text-[10px]">{mn.nama} <span className="text-gray-400 font-normal">{mn.year}</span></td>
                  {Array.from({ length: 31 }, (_, i) => {
                    const cell = mn.cells[i];
                    if (!cell || cell.date > mn.daysInMonth) return <td key={i} className="border border-gray-100" />;

                    const isSunday = cell.dayOfWeek === 0;
                    const isFriday = cell.dayOfWeek === 5;
                    const codeMeta = cell.holidayCode ? HOLIDAY_META[cell.holidayCode] : null;

                    let cellClass = "border border-gray-100 text-center px-0.5 py-0.5 text-[9px]";
                    let content: string | number = cell.date;

                    if (isSunday) cellClass += " text-red-600 bg-red-50 font-bold";
                    else if (isFriday) cellClass += " bg-gray-100 text-gray-400";

                    if (codeMeta) {
                      content = cell.holidayCode;
                      cellClass += ` ${codeMeta.bg} ${codeMeta.text} font-bold text-[8px]`;
                    } else if (cell.effectiveNum > 0) {
                      content = cell.effectiveNum;
                      if (!isSunday && !isFriday) cellClass += " font-bold text-gray-800";
                    } else if (!isSunday && !isFriday) {
                      cellClass += " text-gray-400";
                    }

                    return <td key={i} className={cellClass}>{content}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── MOBILE: CARD PER BULAN ─── */}
        <div className="hidden max-md:block kaldik-cards p-4 space-y-4">
          {months.map((mn) => (
            <div key={mn.nama} className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <h4 className="font-bold text-sm text-gray-700 mb-2">{mn.nama} {mn.year}</h4>
              <div className="grid grid-cols-7 gap-1 text-[9px]">
                {["Mg", "Sn", "Sl", "Rb", "Km", "Jm", "Sb"].map((h, idx) => (
                  <div key={idx} className={`text-center font-bold py-0.5 ${idx === 0 ? "text-red-500" : idx === 5 ? "text-gray-400" : "text-gray-600"}`}>{h}</div>
                ))}
                {Array.from({ length: mn.startDay }, (_, i) => <div key={`pad-${i}`} />)}
                {Array.from({ length: mn.daysInMonth }, (_, i) => {
                  const d = i + 1;
                  const dayOfWeek = new Date(mn.year, mn.monthIndex, d).getDay();
                  const cell = mn.cells.find(c => c && c.date === d);
                  const isSunday = dayOfWeek === 0;
                  const isFriday = dayOfWeek === 5;
                  const codeMeta = cell?.holidayCode ? HOLIDAY_META[cell.holidayCode] : null;

                  let cellClass = "text-center rounded py-0.5";
                  if (isSunday) cellClass += " text-red-600 font-bold";
                  else if (isFriday) cellClass += " text-gray-300";
                  if (codeMeta) cellClass += ` ${codeMeta.bg} ${codeMeta.text} font-bold`;

                  let content: string | number = d;
                  if (codeMeta) content = cell!.holidayCode;
                  else if (cell?.effectiveNum && cell.effectiveNum > 0) content = cell.effectiveNum;

                  return <div key={d} className={cellClass}>{content}</div>;
                })}
              </div>
              <p className="text-[9px] text-gray-500 mt-1.5">Hari Efektif: {mn.effectiveCount}</p>
            </div>
          ))}
        </div>

        {/* ─── FOOTER ─── */}
        <div className="border-t border-gray-300 p-6 space-y-5 text-xs text-gray-700">
          {/* Legend */}
          <div>
            <h5 className="font-bold text-sm text-gray-800 mb-2">LEGENDA</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1.5">
              {Object.entries(HOLIDAY_META).map(([kode, meta]) => (
                <div key={kode} className="flex items-center gap-2">
                  <span className={`inline-block w-6 h-4 rounded text-center text-[8px] font-bold leading-4 ${meta.bg} ${meta.text}`}>{kode}</span>
                  <span className="text-gray-600">{meta.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recap */}
          <div>
            <h5 className="font-bold text-sm text-gray-800 mb-2.5">REKAP HARI EFEKTIF</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <p className="text-[10px] text-blue-600 font-semibold uppercase">Semester Ganjil</p>
                <p className="text-2xl font-bold text-blue-700">{semGanjil} <span className="text-sm font-normal">hari</span></p>
                <p className="text-[9px] text-blue-500">Juli – Desember {parseInt(tahunAjaran.split("/")[0])}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-[10px] text-green-600 font-semibold uppercase">Semester Genap</p>
                <p className="text-2xl font-bold text-green-700">{semGenap} <span className="text-sm font-normal">hari</span></p>
                <p className="text-[9px] text-green-500">Januari – Juni {parseInt(tahunAjaran.split("/")[1])}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-[10px] text-amber-600 font-semibold uppercase">Total</p>
                <p className="text-2xl font-bold text-amber-700">{totalEfektif} <span className="text-sm font-normal">hari</span></p>
                <p className="text-[9px] text-amber-500">Tahun Pelajaran {tahunAjaran}</p>
              </div>
            </div>
          </div>

          {/* National Holidays */}
          {nationalHolidays.length > 0 && (
            <div>
              <h5 className="font-bold text-sm text-gray-800 mb-2">DAFTAR HARI LIBUR NASIONAL</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {nationalHolidays.map((a: any, i: number) => {
                  const code = getHolidayCode(a);
                  const meta = HOLIDAY_META[code];
                  return (
                    <div key={i} className="flex items-center gap-2 py-0.5">
                      <span className={`inline-block w-10 text-center text-[8px] font-bold rounded px-1 py-0.5 ${meta?.bg || "bg-gray-100"} ${meta?.text || "text-gray-700"}`}>{code}</span>
                      <span className="font-medium">{formatDate(a.tanggal)}{a.tanggalSelesai ? ` — ${formatDate(a.tanggalSelesai)}` : ""}</span>
                      <span className="text-gray-500">— {a.kegiatan}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center text-[9px] text-gray-400 pt-4 border-t border-gray-200">
            Kalender Pendidikan ini digenerate secara otomatis berdasarkan data agenda yang telah diinput.
          </div>
        </div>
      </div>

      {/* ─── PRINT STYLES ─── */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:overflow-visible { overflow: visible !important; }
          @page { size: ${landscape ? "landscape" : "portrait"}; margin: 1cm; }
        }
        @media (max-width: 767px) {
          .kaldik-table { display: none; }
          .kaldik-cards { display: block !important; }
        }
        @media (min-width: 768px) {
          .kaldik-table { display: block; }
          .kaldik-cards { display: none !important; }
        }
        .landscape-mode .kaldik-table table { font-size: 8px; }
        .landscape-mode .kaldik-table th,
        .landscape-mode .kaldik-table td { padding: 0.15rem; }
      `}</style>
    </div>
  );
}
