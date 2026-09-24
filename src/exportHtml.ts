import { BULAN_KOLOM_PRESET, BULAN_KOLOM_PRESET_GENAP } from "./utils";
import type { AdministrasiTahunState, IdentitasGuru } from "./types";

const S = {
  table: "border-collapse:collapse;width:100%;",
  th: "border:1px solid #000;padding:4pt;text-align:center;font-weight:bold;vertical-align:top;color:#232323;background:#f5f0e0;",
  td: "border:1px solid #000;padding:4pt;vertical-align:top;color:#232323;",
  h1: "text-align:center;font-size:16pt;font-weight:bold;color:#232323;",
  h2: "text-align:center;font-size:14pt;font-weight:bold;color:#232323;border-bottom:2px solid #d4af37;padding-bottom:6pt;margin-bottom:12pt;",
  label: "font-weight:bold;padding:4pt;vertical-align:top;border:1px solid #000;color:#232323;",
};

function esc(text: string | undefined | null): string {
  return (text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function section(title: string, content: string): string {
  return `<h2 style="${S.h2}">${esc(title)}</h2>${content}<div style="page-break-before:avoid;page-break-after:avoid;break-after:page;"></div>`;
}

function keyValTable(rows: { label: string; value: string | undefined | null }[]): string {
  return `<table style="${S.table}">${rows.map((r) => `<tr><td style="${S.label}">${esc(r.label)}</td><td style="${S.td}">${esc(r.value)}</td></tr>`).join("")}</table>`;
}

function dataTable(headers: string[], rows: (string | undefined | null)[][]): string {
  return `<table style="${S.table};table-layout:fixed;word-wrap:break-word;"><thead><tr>${headers.map((h) => `<th style="${S.th}">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td style="${S.td}">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function listBlock(items: (string | undefined | null)[] | undefined | null): string {
  if (!items || !items.length) return "<p>-</p>";
  return items.map((i) => `<p>${esc(i)}</p>`).join("");
}

function signatureBlock(leftHeading: string, leftTitle: string, leftName: string, leftNip: string, rightHeading: string, rightTitle: string, rightName: string, rightNip: string): string {
  return `<table style="border-collapse:collapse;width:100%;margin-top:24pt;">
    <tr>
      <td style="text-align:center;vertical-align:top;padding:12pt;color:#232323;">
        <p style="margin:0 0 4pt 0;"><b>${esc(leftHeading)}</b></p>
        <p style="margin:0 0 4pt 0;"><b>${esc(leftTitle)}</b></p>
        <p style="margin-top:72pt;margin-bottom:2pt;"><u>${esc(leftName)}</u></p>
        <p style="margin:0;">${esc(leftNip)}</p>
      </td>
      <td style="text-align:center;vertical-align:top;padding:12pt;color:#232323;">
        <p style="margin:0 0 4pt 0;"><b>${esc(rightHeading)}</b></p>
        <p style="margin:0 0 4pt 0;"><b>${esc(rightTitle)}</b></p>
        <p style="margin-top:72pt;margin-bottom:2pt;"><u>${esc(rightName)}</u></p>
        <p style="margin:0;">${esc(rightNip)}</p>
      </td>
    </tr>
  </table>`;
}

function sigKepsekGuru(i: IdentitasGuru, leftHeading = "Mengetahui,", rightHeading?: string, rightTitle = "Guru Mata Pelajaran"): string {
  const rh = rightHeading ?? `${i.kota || "Bandung"}, Juni 2026`;
  return signatureBlock(leftHeading, `Kepala ${i.namaSekolah}`, i.namaKepsek, `NIP. ${i.nipKepsek}`, rh, rightTitle, i.namaGuru, `NIP. ${i.nipGuru || "-"}`);
}

function sigKepsekWali(i: IdentitasGuru): string {
  return signatureBlock("Mengetahui,", `Kepala ${i.namaSekolah}`, i.namaKepsek, `NIP. ${i.nipKepsek}`, `${i.kota || "Bandung"}, Juni 2026`, `Wali Kelas ${i.waliKelasDi}`, i.namaGuru, `NIP. ${i.nipGuru || "-"}`);
}

const TAB_SECTION_MAP: Record<string, number[]> = {
  cover: [0, 1],
  kalender: [2, 3],
  kurikulum: [4, 5, 6],
  modul: [7],
  jurnal: [8],
  presensi: [9, 10],
  analisis: [11, 12, 13],
  walikelas: [14, 15, 16],
  refleksi: [17],
};

function buildAllSections(state: AdministrasiTahunState): string[] {
  const { identitas: i, kalender, prota, promes, atp, modul, jurnal, jadwal, siswaList, kehadiranMap, asesmenList, nilaiSiswaList, remedialLogs, bkLogs, strukturKelas, jadwalPiket, tataTertib, kontrakBelajar, proyekKokurikuler, portofolio, refleksiTahunan: ref } = state;

  const logoHtml = i.logoUrl ? `<p style="text-align:center;margin:0 0 8pt 0;"><img src="${esc(i.logoUrl)}" style="width:120px;height:120px;object-fit:contain;" /></p>` : "";
  const coverHtml = `<div style="border-top:4px solid #232323;border-bottom:4px solid #d4af37;padding:24pt 0;margin-bottom:24pt;">
  <div style="border-top:1px solid #232323;border-bottom:1px solid #d4af37;padding:20pt 0;">
${logoHtml}
    <h1 style="text-align:center;font-size:20pt;font-weight:bold;margin:0 0 8pt 0;color:#232323;">PORTOFOLIO ADMINISTRASI GURU</h1>
    <h2 style="text-align:center;font-size:14pt;font-weight:bold;margin:0 0 16pt 0;color:#232323;">TAHUN PELAJARAN ${esc(i.tahunAjaran)}</h2>
    <table style="border-collapse:collapse;width:60%;margin:0 auto 16pt auto;">
      <tr><td style="border:none;padding:4pt 8pt;font-weight:bold;color:#232323;">Nama Guru</td><td style="border:none;padding:4pt 8pt;">: ${esc(i.namaGuru)}</td></tr>
      <tr><td style="border:none;padding:4pt 8pt;font-weight:bold;color:#232323;">NIP</td><td style="border:none;padding:4pt 8pt;">: ${esc(i.nipGuru || "-")}</td></tr>
      <tr><td style="border:none;padding:4pt 8pt;font-weight:bold;color:#232323;">NUPTK</td><td style="border:none;padding:4pt 8pt;">: ${esc(i.nuptkGuru || "-")}</td></tr>
      <tr><td style="border:none;padding:4pt 8pt;font-weight:bold;color:#232323;">Mata Pelajaran</td><td style="border:none;padding:4pt 8pt;">: ${esc(i.mapel)}</td></tr>
      <tr><td style="border:none;padding:4pt 8pt;font-weight:bold;color:#232323;">Kelas / Fase</td><td style="border:none;padding:4pt 8pt;">: ${esc(i.kelas)} / ${esc(i.fase)}</td></tr>
      <tr><td style="border:none;padding:4pt 8pt;font-weight:bold;color:#232323;">Semester</td><td style="border:none;padding:4pt 8pt;">: ${esc(i.semester)}</td></tr>
    </table>
    <p style="text-align:right;font-weight:bold;font-size:12pt;margin:16pt 24pt 0 0;color:#232323;">SMA ${esc(i.namaSekolah)}</p>
  </div>
  </div>`;

  const identHtml = keyValTable([
    { label: "Nama Sekolah", value: i.namaSekolah },
    { label: "Nama Guru", value: i.namaGuru },
    { label: "NIP", value: i.nipGuru },
    { label: "NUPTK", value: i.nuptkGuru },
    { label: "Mata Pelajaran", value: i.mapel },
    { label: "Kelas", value: i.kelas },
    { label: "Fase", value: i.fase },
    { label: "Semester", value: i.semester },
    { label: "Tahun Ajaran", value: i.tahunAjaran },
    { label: "Nama Kepala Sekolah", value: i.namaKepsek },
    { label: "NIP Kepala Sekolah", value: i.nipKepsek },
    { label: "Jabatan Guru", value: i.jabatanGuru },
    { label: "Wali Kelas", value: i.waliKelasDi },
    { label: "Email", value: i.emailGuru },
    { label: "Telepon", value: i.teleponGuru },
  ]) + sigKepsekGuru(i);

  const kalenderHtml = keyValTable([
    { label: "Hari Efektif Ganjil", value: String(kalender.hariEfektifGanjil) },
    { label: "Minggu Efektif Ganjil", value: String(kalender.mingguEfektifGanjil) },
    { label: "Hari Efektif Genap", value: String(kalender.hariEfektifGenap) },
    { label: "Minggu Efektif Genap", value: String(kalender.mingguEfektifGenap) },
  ]) + (kalender.agenda.length ? dataTable(
    ["Tanggal", "Kegiatan", "Kategori"],
    kalender.agenda.map((a) => [a.tanggal, a.kegiatan, a.kategori])
  ) : "<p>Tidak ada agenda</p>");

  const jadwalHtml = jadwal.length ? dataTable(
    ["Hari", "Jam Ke", "Kelas", "Mata Pelajaran", "JP"],
    jadwal.map((j) => [j.hari, j.jamKe, j.kelas, j.mapel, String(j.alokasiWaktu)])
  ) : "<p>Tidak ada jadwal</p>";

  const protaHtml = keyValTable([{ label: "Target Tahunan", value: prota.targetTahunan }]) + dataTable(
    ["No", "Tujuan Pembelajaran", "Materi Pokok", "Alokasi Waktu (JP)", "Semester", "Target Capaian"],
    prota.items.map((p) => [String(p.no), p.tujuanPembelajaran, p.materiPokok, String(p.alokasiWaktu), p.semester, p.targetCapaian])
  );

  const buildPromesTable = (semester: "1" | "2", cols: string[]) => {
    const items = promes.items.filter((p) => p.semester === semester);
    if (!items.length) return `<p style="text-align:center;font-style:italic;">Tidak ada data PROMES Semester ${semester === "1" ? "Ganjil" : "Genap"}</p>`;
    const totalWeekCols = cols.length;
    const W_NO = 5;
    const W_MATERI = 30;
    const W_JP = 8;
    const W_ASESMEN = 12;
    const WEEK_TOTAL = 100 - (W_NO + W_MATERI + W_JP + W_ASESMEN);
    const W_WEEK = WEEK_TOTAL / totalWeekCols;
    const thBase = "border:1px solid #000;padding:3pt;font-weight:bold;vertical-align:top;background:#f2f2f2;";
    const tdBase = "border:1px solid #000;padding:3pt;vertical-align:top;";
    const monthGroups: { month: string; count: number }[] = [];
    for (const col of cols) {
      const m = col.split("-")[0];
      if (monthGroups.length && monthGroups[monthGroups.length - 1].month === m) monthGroups[monthGroups.length - 1].count++;
      else monthGroups.push({ month: m, count: 1 });
    }
    let h1 = `<tr>`;
    h1 += `<th style="${thBase}text-align:center;" rowspan="2" width="${W_NO}%">No</th>`;
    h1 += `<th style="${thBase}text-align:left;" rowspan="2" width="${W_MATERI}%">Materi Pokok</th>`;
    h1 += `<th style="${thBase}text-align:center;" rowspan="2" width="${W_JP}%">JP</th>`;
    for (const mg of monthGroups) h1 += `<th style="${thBase}text-align:center;" colspan="${mg.count}" width="${(mg.count * W_WEEK).toFixed(2)}%">${esc(mg.month)}</th>`;
    h1 += `<th style="${thBase}text-align:center;" rowspan="2" width="${W_ASESMEN}%">Jadwal Asesmen</th></tr>`;
    let h2 = `<tr>`;
    for (const col of cols) h2 += `<th style="${thBase}text-align:center;">${esc(col.split("-")[1])}</th>`;
    h2 += `</tr>`;
    const rows = items.map((p) => {
      const mingguRow = cols.map((b) => ({
        val: p.mingguEfektif[b] !== undefined ? String(p.mingguEfektif[b]) : "-",
        isLibur: p.libur?.[b] === true
      }));
      return `<tr><td style="${tdBase}text-align:center;">${p.no}</td><td style="${tdBase}">${esc(p.materiPokok)}</td><td style="${tdBase}text-align:center;">${p.alokasiWaktu}</td>${mingguRow.map((d) => { const bg = d.isLibur ? 'background:#ffcccc;' : ''; return `<td style="${tdBase}text-align:center;font-size:9pt;${bg}">${esc(d.val)}</td>`; }).join("")}<td style="${tdBase}text-align:center;">${esc(p.jadwalAsesmen)}</td></tr>`;
    }).join("");
    return `<p style="font-weight:bold;margin-top:12pt;">SEMESTER ${semester === "1" ? "GANJIL" : "GENAP"}</p><table style="border-collapse:collapse;width:100%;table-layout:fixed;word-wrap:break-word;"><thead>${h1}${h2}</thead><tbody>${rows}</tbody></table>`;
  };

  const promesHtml = promes.items.length ? `<div>${buildPromesTable("1", BULAN_KOLOM_PRESET)}${buildPromesTable("2", BULAN_KOLOM_PRESET_GENAP)}</div>` : "<p>Tidak ada data PROMES</p>";

  const atpHtml = atp.length ? dataTable(
    ["Kode", "Elemen", "Capaian Pembelajaran", "Tujuan Pembelajaran", "Materi Pokok", "Alokasi Waktu", "Glosarium"],
    atp.map((a) => [a.kode, a.elemen, a.capaianPembelajaran, a.tujuanPembelajaran, a.materiPokok, String(a.alokasiWaktu), a.glosarium])
  ) : "<p>Tidak ada data ATP</p>";

  let modulHtml: string;
  try {
    if (!modul || !modul.length) {
      modulHtml = "<p style='text-align:center;padding:24pt;font-style:italic;'>Tidak ada data modul ajar.</p>";
    } else {
      modulHtml = modul.map((m, idx) => {
        const kem = m.kegiatanPembelajaran || { pendahuluan: [], intiDeepLearning: {}, penutup: [] };
        const idl = kem.intiDeepLearning || {};
        const akses = m.aksesmen || {};
        const dife = m.diferensiasi || {};
        const pp = m.profilPancasila;
        const ppHtml = pp && pp.length ? `<p>Profil Pancasila: ${pp.join("; ")}</p>` : "";
        return `<div>
<h3>Modul ${idx+1}: ${esc(m.temaModul)}</h3>
${keyValTable([{label:"Tema",value:m.temaModul},{label:"Mapel",value:i.mapel},{label:"Kelas",value:i.kelas},{label:"Fase",value:i.fase},{label:"Pertemuan",value:m.temuKe},{label:"Alokasi Waktu",value:m.alokasiWaktu},{label:"Model",value:m.modelPembelajaran},{label:"Target",value:m.targetPesertaDidik},{label:"Sarana",value:m.saranaPrasarana}])}
${ppHtml}
<h3>Kompetensi & Tujuan</h3>
${keyValTable([{label:"Kompetensi Awal",value:m.kompetensiAwal},{label:"Tujuan",value:m.tujuanPembelajaran},{label:"Pemahaman Bermakna",value:m.pemahamanBermakna},{label:"Pertanyaan Pemantik",value:m.pertanyaanPemantik}])}
<h3>Kegiatan Pembelajaran</h3>
<table style="${S.table}"><tr><th style="${S.th}">Fase</th><th style="${S.th}">Aktivitas</th></tr>
<tr><td style="${S.td};font-weight:bold;">Pendahuluan</td><td style="${S.td}">${listBlock(kem.pendahuluan)}</td></tr>
<tr><td style="${S.td};font-weight:bold;">Mindful</td><td style="${S.td}">${listBlock(idl.mindfulEngagement)}</td></tr>
<tr><td style="${S.td};font-weight:bold;">Deep</td><td style="${S.td}">${listBlock(idl.deepProcessing)}</td></tr>
<tr><td style="${S.td};font-weight:bold;">Transfer</td><td style="${S.td}">${listBlock(idl.transferOfLearning)}</td></tr>
<tr><td style="${S.td};font-weight:bold;">Penutup</td><td style="${S.td}">${listBlock(kem.penutup)}</td></tr>
</table>
<h3>Asesmen</h3>
${keyValTable([{label:"Diagnostik",value:akses.diagnostik},{label:"Formatif",value:akses.formatif},{label:"Sumatif",value:akses.sumatif}])}
<h3>Diferensiasi</h3>
${keyValTable([{label:"Konten",value:dife.konten},{label:"Proses",value:dife.proses},{label:"Produk",value:dife.produk}])}
<h3>Refleksi</h3>
${keyValTable([{label:"Guru",value:m.refleksiGuru},{label:"Siswa",value:m.refleksiSiswa}])}
${sigKepsekGuru(i)}
</div>`;
      }).join("");
    }
  } catch (e) {
    console.error("Error building modulHtml:", e);
    modulHtml = "<p style='text-align:center;padding:24pt;font-style:italic;color:red;'>Error saat memproses modul ajar.</p>";
  }

  const jurnalHtml = jurnal.length ? dataTable(
    ["Hari / Tanggal", "Kelas", "Jam Ke", "Materi Pokok", "Indikator Ketercapaian", "Hadir", "Sakit", "Izin", "Alfa", "Kendala", "Tindak Lanjut"],
    jurnal.map((j) => [
      j.hariTanggal, j.kelas, j.jamKe, j.materiPokok, j.indikatorKetercapaian,
      String(j.kehadiranSiswa.hadir),
      j.kehadiranSiswa.sakit.join(", "),
      j.kehadiranSiswa.izin.join(", "),
      j.kehadiranSiswa.alfa.join(", "),
      j.kendala, j.tindakLanjut
    ])
  ) : "<p>Tidak ada data jurnal</p>";

  const presensiHtml = (() => {
    let html = dataTable(
      ["No Absen", "NIS", "NISN", "Nama", "L/P", "Nama Orang Tua", "Alamat", "Telepon"],
      siswaList.map((s) => [String(s.noAbsen), s.nis, s.nisn, s.nama, s.jenisKelamin, s.namaOrangTua, s.alamat, s.teleponOrangTua])
    );
    const bulanList = Object.keys(kehadiranMap);
    if (bulanList.length) {
      for (const bulan of bulanList) {
        const entries = kehadiranMap[bulan];
        html += `<h3 style="text-align:center;font-size:12pt;font-weight:bold;">Kehadiran Bulan ${esc(bulan)}</h3>`;
        const weekCount = entries.length ? entries[0].hadir.length : 0;
        const headers = ["Nama", ...Array.from({ length: weekCount }, (_, i) => `Minggu ${i + 1}`), "Sakit", "Izin", "Alfa"];
        const rows = entries.map((e) => {
          const siswa = siswaList.find((s) => s.id === e.siswaId);
          return [siswa?.nama ?? "-", ...e.hadir.map((h) => h ? "V" : "-"), String(e.sakit), String(e.izin), String(e.alfa)];
        });
        html += dataTable(headers, rows);
      }
    }
    return html;
  })();

  const asesmenHtml = asesmenList.length ? asesmenList.map((a) => {
    return `<h3 style="text-align:center;font-size:12pt;font-weight:bold;">${esc(a.jenis)}: ${esc(a.namaAsesmen)}</h3>` +
      keyValTable([
        { label: "Kisi-Kisi", value: a.kisiKisi },
        { label: "Contoh Soal HOTS", value: a.soalHotsSample },
      ]) + (a.rubrikPenilaian.length ? dataTable(
        ["Kriteria", "Sangat Baik (4)", "Baik (3)", "Cukup (2)", "Perlu Bimbingan (1)"],
        a.rubrikPenilaian.map((r) => [r.kriteria, r.skor4, r.skor3, r.skor2, r.skor1])
      ) : "");
  }).join("") : "<p>Tidak ada data asesmen</p>";

  const analisisHtml = nilaiSiswaList.length ? dataTable(
    ["Nama Siswa", "Formatif 1", "Formatif 2", "Sumatif Tengah", "Sumatif Akhir", "Nilai Rapor", "Tuntas", "Rekomendasi"],
    nilaiSiswaList.map((n) => [n.namaSiswa, String(n.nilaiFormatif1), String(n.nilaiFormatif2), String(n.nilaiSumatifTengah), String(n.nilaiSumatifAkhir), String(n.nilaiRapor), n.isTuntas ? "Ya" : "Tidak", n.rekomendasi])
  ) : "<p>Tidak ada data nilai</p>";

  const remedialHtml = remedialLogs.length ? dataTable(
    ["Nama Siswa", "Materi Pokok", "Nilai Awal", "Nilai Akhir", "Tanggal Kegiatan", "Bentuk Bimbingan", "Status"],
    remedialLogs.map((r) => [r.namaSiswa, r.materiPokok, String(r.nilaiAwal), String(r.nilaiAkhir), r.tanggalKegiatan, r.bentukBimbingan, r.status])
  ) : "<p>Tidak ada data remedial</p>";

  const bkHtml = bkLogs.length ? dataTable(
    ["Tanggal", "Nama Siswa", "Kelas", "Catatan Perilaku", "Tindakan BK", "Komunikasi Orang Tua", "Solusi Tindak Lanjut"],
    bkLogs.map((b) => [b.tanggal, b.namaSiswa, b.kelas, b.catatanPerilaku, b.tindakanBK, b.statusKomunikasiOrtu, b.solusiTindakLanjut])
  ) : "<p>Tidak ada data BK</p>";

  const walikelasHtml = keyValTable([
    { label: "Ketua Kelas", value: strukturKelas.ketua },
    { label: "Wakil Ketua", value: strukturKelas.wakil },
    { label: "Sekretaris", value: strukturKelas.sekretaris },
    { label: "Bendahara", value: strukturKelas.bendahara },
  ]) + (jadwalPiket.length ? (() => {
    const rows = jadwalPiket.map((p) => {
      const names = p.siswaIds.map((id) => siswaList.find((s) => s.id === id)?.nama ?? id).join(", ");
      return [p.hari, names];
    });
    return dataTable(["Hari", "Nama Siswa"], rows);
  })() : "") + (tataTertib.length ? `<h3 style="text-align:center;font-size:12pt;font-weight:bold;">Tata Tertib</h3>${listBlock(tataTertib)}` : "") +
  (kontrakBelajar.length ? `<h3 style="text-align:center;font-size:12pt;font-weight:bold;">Kontrak Belajar</h3>${listBlock(kontrakBelajar)}` : "");

  const kokurikulerHtml = proyekKokurikuler.length ? proyekKokurikuler.map((p) => {
    const dim = p.dimensi.map((d) => d.nama).join("; ");
    const tl = p.timeline.map((t) => `Minggu ${t.minggu}: ${t.aktivitas}`).join("; ");
    return `<h3 style="text-align:center;font-size:12pt;font-weight:bold;">${esc(p.judul)}</h3>` + keyValTable([
      { label: "Tema", value: p.tema },
      { label: "Tujuan", value: p.tujuan },
      { label: "Dimensi Profil Lulusan", value: dim },
      { label: "Timeline", value: tl },
      { label: "Asesmen Awal", value: p.asesmen.awal },
      { label: "Asesmen Proses", value: p.asesmen.proses },
      { label: "Asesmen Akhir", value: p.asesmen.akhir },
      { label: "Rubrik Asesmen", value: p.asesmen.rubrik },
      { label: "Narasi Rapor", value: p.asesmen.narasiRapor },
    ]);
  }).join("") : "<p>Tidak ada data proyek kokurikuler</p>";

  const portofolioHtml = portofolio.length ? dataTable(
    ["Nama Siswa", "Nama Karya", "Deskripsi Karya", "Tanggal Karya", "Predikat", "Refleksi"],
    portofolio.map((p) => [p.namaSiswa, p.namaKarya, p.deskripsiKarya, p.tanggalKarya, p.predikat, p.refleksiSingkat])
  ) : "<p>Tidak ada data portofolio</p>";

  const refleksiHtml = keyValTable([
    { label: "Kekuatan / Keberhasilan", value: ref.keberhasilan },
    { label: "Tantangan / Kelemahan", value: ref.tantangan },
    { label: "Kendala Utama", value: ref.kendalaUtama },
    { label: "Hasil Evaluasi", value: ref.hasilEvaluasi },
    { label: "Rencana Perbaikan", value: ref.rencanaPerbaikan },
  ]) +
  sigKepsekGuru(i, "Mengetahui,", `${i.kota || "Bandung"}, Juni 2026`, "Asesor / Supervisor Sekolah") +
  `<div style="page-break-after:always;"></div>` +
  `<h2 style="text-align:center;font-size:14pt;font-weight:bold;">PENUTUP</h2>` +
  `<p style="text-align:center;font-style:italic;margin:24pt 48pt;">"Ing Ngarsa Sung Tuladha, Ing Madya Mangun Karsa, Tut Wuri Handayani." - Ki Hajar Dewantara</p>` +
  sigKepsekGuru(i, "Mengesahkan,", `${i.kota || "Bandung"}, Juni 2026`, "Guru Mata Pelajaran");

  return [
    coverHtml,
    identHtml,
    kalenderHtml,
    jadwalHtml,
    protaHtml,
    promesHtml,
    atpHtml,
    modulHtml,
    jurnalHtml,
    presensiHtml,
    asesmenHtml,
    analisisHtml,
    remedialHtml,
    bkHtml,
    walikelasHtml,
    kokurikulerHtml,
    portofolioHtml,
    refleksiHtml,
  ];
}

const SECTION_TITLES = [
  "COVER",
  "IDENTITAS GURU",
  "KALENDER AKADEMIK",
  "JADWAL MENGAJAR",
  "PROGRAM TAHUNAN (PROTA)",
  "PROGRAM SEMESTER (PROMES)",
  "ALUR TUJUAN PEMBELAJARAN (ATP)",
  "MODUL AJAR",
  "JURNAL HARIAN GURU",
  "PRESENSI DAN KEHADIRAN SISWA",
  "RENCANA ASESMEN",
  "ANALISIS NILAI SISWA",
  "REMEDIAL",
  "BIMBINGAN KONSELING (BK)",
  "STRUKTUR KELAS, TATA TERTIB, KONTRAK BELAJAR",
  "PROYEK KOKURIKULER",
  "PORTOFOLIO SISWA",
  "REFLEKSI TAHUNAN",
];

function wrapHtml(sectionsHtml: string, isLandscape = false): string {
  const pageCss = isLandscape
    ? "@page { size: 330mm 210mm; margin: 1.27cm; }"
    : "@page { size: 210mm 330mm; margin: 1.27cm; }";
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Portofolio Administrasi Guru</title>
<style>
  ${pageCss}
  * { font-family: 'Times New Roman', Times, serif !important; }
  body { font-size: 12pt; line-height: 1.3; margin: 0; padding: 0; color: #232323; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 12pt; }
  td, th { border: 1px solid #000; padding: 4pt; vertical-align: top; font-size: 11pt; }
  th { text-align: center; font-weight: bold; background: #f5f0e0; }
  h1, h2, h3 { text-align: center; color: #232323; }
  .page-break { page-break-after: always; height: 0; }
  p { margin: 4pt 0; }
</style>
</head>
<body style="font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.3;margin:0;padding:0;">
${sectionsHtml}
</body>
</html>`;
}

export function generateExportHtml(state: AdministrasiTahunState): string {
  const allHtml = buildAllSections(state);
  const sectionsHtml = allHtml.map((html, i) => section(SECTION_TITLES[i], html)).join("\n");
  return wrapHtml(sectionsHtml, false);
}

export function generateExportHtmlForTab(state: AdministrasiTahunState, tabId: string): string | null {
  if (tabId === "dashboard") return null;
  const indices = TAB_SECTION_MAP[tabId];
  if (!indices) return null;
  const allHtml = buildAllSections(state);
  const sectionsHtml = indices.map((i) => section(SECTION_TITLES[i], allHtml[i])).join("\n");
  return wrapHtml(sectionsHtml, tabId === "kurikulum" || tabId === "jurnal");
}

export const TAB_FILENAMES: Record<string, string> = {
  cover: "01_cover_identitas",
  kalender: "02_kalender_jadwal",
  kurikulum: "03_prota_promes_atp",
  modul: "04_modul_ajar",
  jurnal: "05_jurnal_harian",
  presensi: "06_presensi_asesmen",
  analisis: "07_rapor_remedial_bk",
  walikelas: "08_walikelas_kokurikuler",
  refleksi: "09_refleksi",
};
