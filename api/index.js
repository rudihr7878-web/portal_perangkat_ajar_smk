// server.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";
import crypto from "crypto";
import os from "os";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import HTMLtoDOCX from "html-to-docx";
import cron from "node-cron";
import multer from "multer";
import pdfParse from "pdf-parse";

// db.ts
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
var _client;
function getClient() {
  if (_client !== void 0) return _client;
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  _client = url && key ? createClient(url, key) : null;
  return _client;
}
function isUsingSupabase() {
  return !!getClient();
}
var FALLBACK_DIR = process.env.SUPABASE_FALLBACK_DIR || path.join(process.cwd(), "data");
var fallbackFile = (key) => path.join(FALLBACK_DIR, key.replace(/[^a-zA-Z0-9_.-]/g, "_") + ".json");
async function getFromSupabase(key) {
  const c = getClient();
  if (!c) return null;
  const { data, error } = await c.from("kv").select("value").eq("key", key).maybeSingle();
  if (error) {
    console.error("dbGet supabase error:", error.message);
    return null;
  }
  return data ? data.value : null;
}
function getFromFallback(key) {
  try {
    if (fs.existsSync(fallbackFile(key))) {
      return JSON.parse(fs.readFileSync(fallbackFile(key), "utf-8"));
    }
  } catch (e) {
    console.error("dbGet fallback error:", e);
  }
  return null;
}
async function dbGet(key) {
  if (getClient()) return getFromSupabase(key);
  return getFromFallback(key);
}
async function dbPut(key, value) {
  const c = getClient();
  if (c) {
    const json = JSON.parse(JSON.stringify(value));
    const { error } = await c.from("kv").upsert({
      key,
      value: json,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (!error) return;
    console.error("dbPut supabase error:", error.message);
  }
  try {
    fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    fs.writeFileSync(fallbackFile(key), JSON.stringify(value, null, 2), "utf-8");
  } catch (e) {
    console.error("dbPut fallback error:", e);
  }
}
async function dbList(prefix) {
  const c = getClient();
  if (c) {
    const { data, error } = await c.from("kv").select("key, value").like("key", prefix + "%");
    if (!error && data) {
      return data.map((r) => ({ key: r.key, value: r.value }));
    }
    if (error) console.error("dbList supabase error:", error.message);
    return [];
  }
  try {
    if (!fs.existsSync(FALLBACK_DIR)) return [];
    const out = [];
    for (const f of fs.readdirSync(FALLBACK_DIR)) {
      if (!f.endsWith(".json")) continue;
      const key = f.slice(0, -5);
      if (!key.startsWith(prefix)) continue;
      try {
        out.push({ key, value: JSON.parse(fs.readFileSync(path.join(FALLBACK_DIR, f), "utf-8")) });
      } catch {
      }
    }
    return out;
  } catch {
    return [];
  }
}

// server.ts
var PAGE_MARGINS_TWIP = {
  top: 1440,
  // 2.54cm
  right: 1440,
  // 2.54cm
  bottom: 1440,
  // 2.54cm
  left: 1800,
  // 3.18cm
  header: 850,
  // 1.5cm
  footer: 850,
  // 1.5cm
  gutter: 0
  // 0cm
};
dotenv.config();
var upload = multer({ dest: os.tmpdir(), limits: { fileSize: 10 * 1024 * 1024 } });
var CRON_JOBS_FILE = path2.join(process.cwd(), "cron_jobs.json");
var CRON_JOBS_KEY = "cron_jobs";
async function loadCronJobs() {
  try {
    const fromDb = await dbGet(CRON_JOBS_KEY);
    if (Array.isArray(fromDb)) return fromDb;
  } catch (e) {
    console.error("Error loading cron jobs from DB:", e);
  }
  try {
    if (fs2.existsSync(CRON_JOBS_FILE)) return JSON.parse(fs2.readFileSync(CRON_JOBS_FILE, "utf-8"));
  } catch (e) {
    console.error("Error loading cron jobs:", e);
  }
  return [];
}
async function saveCronJobs(jobs) {
  try {
    if (isUsingSupabase()) {
      await dbPut(CRON_JOBS_KEY, jobs);
      return;
    }
    fs2.writeFileSync(CRON_JOBS_FILE, JSON.stringify(jobs, null, 2));
  } catch (e) {
    console.error("Error saving cron jobs:", e);
  }
}
function isServerless() {
  return process.env.VERCEL === "1";
}
var MODULE_FILE = (() => {
  try {
    return fileURLToPath(import.meta.url);
  } catch {
    return __filename;
  }
})();
function isMainModule() {
  const arg = process.argv[1];
  if (!arg) return false;
  try {
    return path2.resolve(arg) === path2.resolve(MODULE_FILE);
  } catch {
    return !isServerless();
  }
}
var CRON_TZ = process.env.CRON_TIMEZONE || "Asia/Jakarta";
function tzParts(d, tz) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short"
  }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value || "";
  const week = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return {
    y: Number(get("year")),
    mo: Number(get("month")),
    d: Number(get("day")),
    h: get("hour") === "24" ? 0 : Number(get("hour")),
    mi: Number(get("minute")),
    dow: week.indexOf(get("weekday").toLowerCase())
  };
}
function isCronDue(job, now) {
  if (!job.enabled || !job.time) return false;
  const t = tzParts(now, CRON_TZ);
  if (!job.daysOfWeek.includes(t.dow)) return false;
  const nowMin = t.h * 60 + t.mi;
  const [hh, mm] = job.time.split(":").map(Number);
  if (nowMin !== hh * 60 + (mm || 0)) return false;
  if (job.lastRunAt) {
    const lr = tzParts(new Date(job.lastRunAt), CRON_TZ);
    if (lr.y === t.y && lr.mo === t.mo && lr.d === t.d && lr.h * 60 + lr.mi >= nowMin) return false;
  }
  return true;
}
async function executeCronJobRecord(job) {
  console.log(`Cron executing: ${job.name} (${job.id})`);
  try {
    const teachers = job.teacherData.map((t) => ({
      nama: t.nama,
      mapel: t.mapel,
      progressRata: t.progressRata,
      kekurangan: t.kekurangan
    }));
    if (!teachers.length) throw new Error("No teacher data in cron job");
    let reminders = [];
    try {
      const resp = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Buat pesan WhatsApp reminder untuk ${teachers.length} guru berikut.
Topik: "${job.topic}".

Data guru:
${teachers.map((t, i) => `Guru ${i + 1}: Nama=${t.nama}, Mapel=${t.mapel}, Progress=${t.progressRata}%, Kekurangan=${t.kekurangan}`).join("\n")}

Aturan:
1. Setiap guru mendapat pesan UNIK (variasi pembuka/penutup/struktur).
2. Sebut progress rata-rata dan 2-3 bagian terendah.
3. Bahasa formal hangat Indonesia.`,
        config: {
          systemInstruction: "Anda admin sekolah. Jawaban array JSON tanpa markdown.",
          responseMimeType: "application/json",
          responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { teacherIndex: { type: Type.INTEGER }, message: { type: Type.STRING } }, required: ["teacherIndex", "message"] } }
        }
      });
      reminders = JSON.parse(resp.text || "[]");
    } catch (e) {
      throw new Error(`Gemini error: ${e.message}`);
    }
    let sent = 0, failed = 0;
    for (const r of reminders) {
      const td = job.teacherData[r.teacherIndex];
      if (!td || !td.telepon) {
        failed++;
        continue;
      }
      try {
        const params = new URLSearchParams({ target: td.telepon, message: r.message });
        const resp = await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: { "Authorization": job.fonnteToken, "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString()
        });
        const data = await resp.json();
        if (data.status === true || data.status === "true") sent++;
        else failed++;
      } catch {
        failed++;
      }
    }
    job.lastRunAt = (/* @__PURE__ */ new Date()).toISOString();
    job.lastStatus = "success";
    job.lastMessage = `Terkirim: ${sent}, Gagal: ${failed}`;
    console.log(`Cron ${job.name}: ${job.lastMessage}`);
  } catch (e) {
    job.lastStatus = "error";
    job.lastMessage = e.message;
    console.error(`Cron ${job.name} failed:`, e.message);
  }
  const all = await loadCronJobs();
  const idx = all.findIndex((j) => j.id === job.id);
  if (idx >= 0) all[idx] = job;
  else all.push(job);
  await saveCronJobs(all);
  return job;
}
var CronScheduler = class {
  constructor() {
    this.tasks = /* @__PURE__ */ new Map();
    this.jobs = [];
  }
  init(jobs) {
    this.jobs = jobs;
    this.tasks.forEach((t) => t.stop());
    this.tasks.clear();
    jobs.forEach((j) => this.schedule(j));
    console.log(`CronScheduler: ${this.tasks.size} jobs scheduled`);
  }
  schedule(job) {
    if (!job.enabled) return;
    const [h, m] = job.time.split(":").map(Number);
    const expr = `${m} ${h} * * ${job.daysOfWeek.join(",")}`;
    try {
      const task = cron.schedule(expr, () => this.executeJob(job.id), { timezone: CRON_TZ });
      this.tasks.set(job.id, task);
    } catch (e) {
      console.error(`Failed to schedule cron ${job.id}:`, e);
    }
  }
  unschedule(jobId) {
    const t = this.tasks.get(jobId);
    if (t) {
      t.stop();
      this.tasks.delete(jobId);
    }
  }
  async executeJob(jobId) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return;
    await executeCronJobRecord(job);
    const idx = this.jobs.findIndex((j) => j.id === jobId);
    if (idx >= 0) this.jobs[idx] = job;
  }
};
var cronScheduler = new CronScheduler();
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
function buildApp() {
  const app2 = express();
  app2.use(express.json({ limit: "10mb" }));
  app2.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowed = process.env.CORS_ORIGIN || "";
    res.setHeader("Access-Control-Allow-Origin", allowed ? allowed : origin || "*");
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app2.post("/api/gemini/generate-modul", async (req, res) => {
    try {
      const { prompt, currentModul, mapel } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required" });
      }
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        return res.status(500).json({
          success: false,
          error: "GEMINI_API_KEY environment variable is not configured yet in Secrets tab."
        });
      }
      const systemInstruction = `Anda adalah pengembang kurikulum dan guru profesional Indonesia yang ahli dalam menyusun Modul Ajar Kurikulum Merdeka berbasis pendekatan Deep Learning (3 Pilar: Mindful Engagement, Deep Processing, Transfer of Learning).
Fokus pada materi pelajaran: ${mapel || "Informatika"}.
Jawaban Anda HARUS berupa objek JSON valid yang persis mengikuti struktur skema yang diminta. Jangan menyertakan penanda markdown seperti \`\`\`json.`;
      const promptText = `Hasilkan rancangan Modul Ajar lengkap dan realistis berdasarkan topik pembelajaran: "${prompt}".
Sesuaikan materi pokok agar sarat makna untuk murid Fase E, buat pertanyaan pemantik dan pemahaman bermakna yang mendalam.
Skenario Kegiatan Pembelajaran Utama HARUS bernuansa luring interaktif, mengedepankan Deep Learning (3 langkah pilar):
1. Mindful Engagement (Fokus Atensi & Curiosity) - isi dengan 3 aksi luring konkret (misal: demonstrasi kejutan, review game).
2. Deep Processing (Berpikir Kritis & Dialog Konseptual) - isi dengan 3 aktivitas luring konkret (misal: dialog sokratik kelompok, pemetaan skema logika, curah argumen).
3. Transfer of Learning (Penyelesaian Masalah Nyata & Peer Feedback) - isi dengan 3 aksi luring nyata (misal: simulasi lapangan, peer code review, stress test rancangan).

Gunakan bahasa formal akademik Indonesia yang elegan, alami, dan siap dipakai supervisi Kepala Sekolah.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              temaModul: { type: Type.STRING, description: "Judul/Tema pokok modul ajar" },
              alokasiWaktu: { type: Type.STRING, description: "e.g. 2 x 45 Menit (1 Sesi Pertemuan)" },
              targetPesertaDidik: { type: Type.STRING, description: "Siswa reguler Fase E (Kelas X)" },
              modelPembelajaran: { type: Type.STRING, description: "e.g. Tatap Muka Terpadu (Deep Learning)" },
              saranaPrasarana: { type: Type.STRING, description: "Kebutuhan peranti, proyektor, kertas flipchart" },
              temuKe: { type: Type.STRING, description: "Pertemuan ke-1" },
              kompetensiAwal: { type: Type.STRING, description: "Mata rantai kompetensi awal murid sebelum memulai kelas" },
              tujuanPembelajaran: { type: Type.STRING, description: "Deskripsi tujuan pembelajaran instruksional utama yang komprehensif" },
              pemahamanBermakna: { type: Type.STRING, description: "Pemahaman kontekstual jangka panjang yang akan didapat siswa" },
              pertanyaanPemantik: { type: Type.STRING, description: "Pertanyaan reflektif pemicu ketertarikan belajar siswa" },
              kegiatanPembelajaran: {
                type: Type.OBJECT,
                properties: {
                  pendahuluan: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 poin skenario pendahuluan (misal: salam, apersepsi, kaitan materi)"
                  },
                  intiDeepLearning: {
                    type: Type.OBJECT,
                    properties: {
                      mindfulEngagement: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "3 aksi konkret pemicu atensi luring"
                      },
                      deepProcessing: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "3 aktivitas kritis-reflektif konseptual luring"
                      },
                      transferOfLearning: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "3 langkah penerapan nyata & peer review luring"
                      }
                    },
                    required: ["mindfulEngagement", "deepProcessing", "transferOfLearning"]
                  },
                  penutup: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 poin penutup, metakognisi, penguatan materi harian"
                  }
                },
                required: ["pendahuluan", "intiDeepLearning", "penutup"]
              },
              diferensiasi: {
                type: Type.OBJECT,
                properties: {
                  konten: { type: Type.STRING, description: "Diferensiasi berdasarkan kesiapan belajar murid" },
                  proses: { type: Type.STRING, description: "Variansi proses bimbingan per kelompok belajar" },
                  produk: { type: Type.STRING, description: "Variasi media hasil unjuk kerja modular" }
                },
                required: ["konten", "proses", "produk"]
              }
            },
            required: [
              "temaModul",
              "alokasiWaktu",
              "targetPesertaDidik",
              "modelPembelajaran",
              "saranaPrasarana",
              "temuKe",
              "kompetensiAwal",
              "tujuanPembelajaran",
              "pemahamanBermakna",
              "pertanyaanPemantik",
              "kegiatanPembelajaran",
              "diferensiasi"
            ]
          }
        }
      });
      const responseText = response.text || "{}";
      const optimizedModul = JSON.parse(responseText);
      return res.json({ success: true, optimizedModul });
    } catch (error) {
      console.error("Gemini Generate Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.post("/api/gemini/generate-kokurikuler", async (req, res) => {
    try {
      const { tema, jenjang, jurusan, jumlahMinggu } = req.body;
      if (!tema) {
        return res.status(400).json({ success: false, error: "Tema proyek is required" });
      }
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        return res.status(500).json({
          success: false,
          error: "GEMINI_API_KEY environment variable is not configured yet."
        });
      }
      const jenjangText = jenjang || "SMA";
      const jurusanText = jurusan ? `Jurusan ${jurusan}` : "";
      const mingguText = jumlahMinggu || 8;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Hasilkan rancangan proyek kokurikuler untuk ${jenjangText} ${jurusanText} dengan tema "${tema}" selama ${mingguText} minggu.
Buat proyek yang bersifat lintas disiplin, kontekstual, dan mengembangkan 8 Dimensi Profil Lulusan (Keimanan dan Ketakwaan, Kewargaan, Penalaran Kritis, Kreativitas, Kolaborasi, Kemandirian, Kesehatan, Komunikasi).
Gunakan bahasa formal akademik Indonesia.`,
        config: {
          systemInstruction: "Anda adalah pengembang kurikulum profesional Indonesia. Jawaban HARUS berupa objek JSON valid tanpa markdown.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              judulProyek: { type: Type.STRING, description: "Judul proyek kokurikuler yang menarik dan kontekstual" },
              tujuan: { type: Type.STRING, description: "Tujuan proyek yang jelas dan terukur" },
              dimensi: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Daftar dimensi profil lulusan yang relevan (pilih dari 8 dimensi)"
              },
              timeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    minggu: { type: Type.STRING, description: "Nomor minggu" },
                    aktivitas: { type: Type.STRING, description: "Deskripsi aktivitas mingguan" }
                  },
                  required: ["minggu", "aktivitas"]
                },
                description: "Timeline kegiatan per minggu"
              },
              asesmenAwal: { type: Type.STRING, description: "Bentuk asesmen diagnostik/awal" },
              asesmenProses: { type: Type.STRING, description: "Bentuk asesmen formatif selama proses" },
              asesmenAkhir: { type: Type.STRING, description: "Bentuk asesmen sumatif akhir" },
              rubrikAsesmen: { type: Type.STRING, description: "Kriteria rubrik penilaian proyek" },
              narasiRapor: { type: Type.STRING, description: "Narasi deskriptif capaian proyek untuk rapor" }
            },
            required: ["judulProyek", "tujuan", "dimensi", "timeline", "asesmenAwal", "asesmenProses", "asesmenAkhir", "rubrikAsesmen", "narasiRapor"]
          }
        }
      });
      const responseText = response.text || "{}";
      const proyek = JSON.parse(responseText);
      return res.json({ success: true, proyek });
    } catch (error) {
      console.error("Gemini Kokurikuler Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.post("/api/gemini/generate-aktivitas", async (req, res) => {
    try {
      const { experience, temaModul, mapel } = req.body;
      if (!experience) return res.status(400).json({ success: false, error: "Jenis experience is required" });
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        return res.status(500).json({ success: false, error: "GEMINI_API_KEY not configured." });
      }
      const experienceLabels = {
        observasi: "Observasi \u2014 Mengamati fenomena nyata",
        diskusi: "Diskusi \u2014 Dialog kelompok terstruktur",
        praktik: "Praktik \u2014 Latihan langsung keterampilan",
        eksperimen: "Eksperimen \u2014 Uji coba dan pembuktian",
        presentasi: "Presentasi \u2014 Paparan hasil kerja",
        proyek: "Proyek \u2014 Tugas kompleks terpadu",
        simulasi: "Simulasi \u2014 Peran dan skenario tiruan"
      };
      const label = experienceLabels[experience] || experience;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Hasilkan 1-2 kalimat deskripsi aktivitas pembelajaran untuk jenis pengalaman "${label}" pada modul dengan tema "${temaModul || "Pembelajaran"}" mata pelajaran ${mapel || "Informatika"}.

Tulis dalam bahasa Indonesia formal, langsung siap pakai sebagai langkah kegiatan di kelas. Fokus pada deskripsi konkret apa yang dilakukan siswa.

Contoh:
- Observasi: "Siswa mengamati fenomena [topik] di lingkungan sekitar dan mencatat temuan awal pada lembar observasi."
- Diskusi: "Siswa berdiskusi dalam kelompok kecil untuk menganalisis [topik] menggunakan panduan pertanyaan terstruktur."
- Praktik: "Siswa mempraktikkan langsung [keterampilan] secara mandiri dengan bimbingan guru."

Keluarkan HANYA teks aktivitasnya saja, 1-2 kalimat, tanpa label atau markdown.`,
        config: {
          systemInstruction: "Anda adalah guru profesional Indonesia. Hasilkan teks aktivitas singkat 1-2 kalimat. Jawaban HANYA teks biasa, tanpa markdown atau label.",
          temperature: 0.8
        }
      });
      const text = (response.text || "").trim();
      return res.json({ success: true, text });
    } catch (error) {
      console.error("Gemini Aktivitas Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.post("/api/gemini/generate-rubrik", async (req, res) => {
    try {
      const { modul, mapel } = req.body;
      if (!modul) return res.status(400).json({ success: false, error: "Data modul is required" });
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        return res.status(500).json({ success: false, error: "GEMINI_API_KEY not configured." });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Buat rubrik asesmen untuk modul ajar berikut.

Mapel: ${mapel || "Informatika"}
Tema Modul: ${modul.temaModul || "-"}
Tujuan Pembelajaran: ${modul.tujuanPembelajaran || "-"}

Buat 3 bagian:
1. Asesmen Diagnostik \u2014 cara mengetahui kemampuan awal siswa
2. Asesmen Formatif \u2014 teknik penilaian selama proses pembelajaran
3. Asesmen Sumatif \u2014 teknik penilaian akhir capaian

Setiap bagian berupa paragraf 2-3 kalimat yang siap pakai. Gunakan bahasa formal Indonesia.`,
        config: {
          systemInstruction: "Anda adalah ahli asesmen pendidikan Indonesia. Jawaban HARUS berupa objek JSON valid tanpa markdown.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnostik: { type: Type.STRING, description: "Paragraf asesmen diagnostik" },
              formatif: { type: Type.STRING, description: "Paragraf asesmen formatif" },
              sumatif: { type: Type.STRING, description: "Paragraf asesmen sumatif" }
            },
            required: ["diagnostik", "formatif", "sumatif"]
          }
        }
      });
      const responseText = response.text || "{}";
      const rubrik = JSON.parse(responseText);
      return res.json({ success: true, rubrik });
    } catch (error) {
      console.error("Gemini Rubrik Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.post("/api/gemini/review-modul", async (req, res) => {
    try {
      const { modul, mapel } = req.body;
      if (!modul) return res.status(400).json({ success: false, error: "Data modul is required" });
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        return res.status(500).json({ success: false, error: "GEMINI_API_KEY not configured." });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Review modul ajar berikut dan beri skor serta saran perbaikan.

Mapel: ${mapel || "Informatika"}
Data Modul (JSON): ${JSON.stringify(modul, null, 2)}

Evaluasi dari 5 aspek:
1. Identitas & Tujuan (kelengkapan tema, waktu, TP)
2. Kompetensi Awal & Pemantik (kualitas pemahaman bermakna, pertanyaan pemantik)
3. Aktivitas Mindful (kualitas mindful engagement)
4. Aktivitas Meaningful (kualitas deep processing)
5. Aktivitas Joyful & Penutup (kualitas transfer of learning, penutup)

Beri skor 0-100 tiap aspek dan 2-3 saran perbaikan spesifik per aspek.`,
        config: {
          systemInstruction: "Anda adalah supervisor akademik yang mengevaluasi modul ajar. Jawaban HARUS berupa objek JSON valid tanpa markdown.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scores: {
                type: Type.OBJECT,
                properties: {
                  identitas: { type: Type.INTEGER, description: "Skor kelengkapan identitas dan tujuan 0-100" },
                  pemantik: { type: Type.INTEGER, description: "Skor kualitas kompetensi awal dan pemantik 0-100" },
                  mindful: { type: Type.INTEGER, description: "Skor kualitas mindful engagement 0-100" },
                  meaningful: { type: Type.INTEGER, description: "Skor kualitas deep processing 0-100" },
                  joyful: { type: Type.INTEGER, description: "Skor kualitas joyful dan penutup 0-100" }
                },
                required: ["identitas", "pemantik", "mindful", "meaningful", "joyful"]
              },
              total: { type: Type.INTEGER, description: "Skor total rata-rata 0-100" },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-5 saran perbaikan spesifik"
              }
            },
            required: ["scores", "total", "suggestions"]
          }
        }
      });
      const responseText = response.text || "{}";
      const review = JSON.parse(responseText);
      return res.json({ success: true, review });
    } catch (error) {
      console.error("Gemini Review Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.post("/api/gemini/koreksi-modul", async (req, res) => {
    try {
      const { moduls, promes, atp, mapel, semester } = req.body;
      if (!moduls || !Array.isArray(moduls)) {
        return res.status(400).json({ success: false, error: "Data modul ajar is required" });
      }
      if (!promes || !promes.items) {
        return res.status(400).json({ success: false, error: "Data PROMES is required" });
      }
      const sem = semester || "1";
      const filteredPromes = promes.items.filter((item) => item.semester === sem);
      const totalPromesJP = filteredPromes.reduce((sum, item) => sum + (item.alokasiWaktu || 0), 0);
      const totalModulJP = moduls.reduce((sum, m) => {
        const waktu = parseInt((m.alokasiWaktu || "").replace(/[^0-9]/g, ""), 10);
        return sum + (isNaN(waktu) ? 0 : waktu);
      }, 0);
      const modulReports = moduls.map((m, idx) => {
        const kp = m.kegiatanPembelajaran || {};
        const hasPendahuluan = kp.pendahuluan?.some((s) => s?.trim() !== "");
        const hasMindful = kp.intiDeepLearning?.mindfulEngagement?.some((s) => s?.trim() !== "");
        const hasDeep = kp.intiDeepLearning?.deepProcessing?.some((s) => s?.trim() !== "");
        const hasTransfer = kp.intiDeepLearning?.transferOfLearning?.some((s) => s?.trim() !== "");
        const hasPenutup = kp.penutup?.some((s) => s?.trim() !== "");
        const allFields = {
          temaModul: { value: m.temaModul, label: "Tema Modul" },
          temuKe: { value: m.temuKe, label: "Pertemuan Ke-" },
          alokasiWaktu: { value: m.alokasiWaktu, label: "Alokasi Waktu" },
          kompetensiAwal: { value: m.kompetensiAwal, label: "Kompetensi Awal" },
          tujuanPembelajaran: { value: m.tujuanPembelajaran, label: "Tujuan Pembelajaran" },
          pemahamanBermakna: { value: m.pemahamanBermakna, label: "Pemahaman Bermakna" },
          pertanyaanPemantik: { value: m.pertanyaanPemantik, label: "Pertanyaan Pemantik" },
          modelPembelajaran: { value: m.modelPembelajaran, label: "Model Pembelajaran" },
          saranaPrasarana: { value: m.saranaPrasarana, label: "Sarana Prasarana" },
          targetPesertaDidik: { value: m.targetPesertaDidik, label: "Target Peserta Didik" },
          pendahuluan: { value: hasPendahuluan, label: "Keg. Pendahuluan" },
          mindfulEngagement: { value: hasMindful, label: "Mindful Engagement" },
          deepProcessing: { value: hasDeep, label: "Deep Processing" },
          transferOfLearning: { value: hasTransfer, label: "Transfer of Learning" },
          penutup: { value: hasPenutup, label: "Keg. Penutup" },
          aksesmenDiagnostik: { value: m.aksesmen?.diagnostik, label: "Asesmen Diagnostik" },
          aksesmenFormatif: { value: m.aksesmen?.formatif, label: "Asesmen Formatif" },
          aksesmenSumatif: { value: m.aksesmen?.sumatif, label: "Asesmen Sumatif" },
          diferensiasiKonten: { value: m.diferensiasi?.konten, label: "Diferensiasi Konten" },
          diferensiasiProses: { value: m.diferensiasi?.proses, label: "Diferensiasi Proses" },
          diferensiasiProduk: { value: m.diferensiasi?.produk, label: "Diferensiasi Produk" },
          refleksiGuru: { value: m.refleksiGuru, label: "Refleksi Guru" },
          refleksiSiswa: { value: m.refleksiSiswa, label: "Refleksi Siswa" }
        };
        const fieldStatus = {};
        const missingFields = [];
        for (const [key, info] of Object.entries(allFields)) {
          const isEmpty = info.value === void 0 || info.value === null || info.value === "" || info.value === false;
          fieldStatus[key] = !isEmpty;
          if (isEmpty) missingFields.push(info.label);
        }
        const total = Object.keys(fieldStatus).length;
        const filled = Object.values(fieldStatus).filter(Boolean).length;
        const completeness = Math.round(filled / total * 100);
        return { index: idx, tema: m.temaModul || `Modul ${idx + 1}`, completeness, missingFields, fieldStatus };
      });
      const tpList = (atp || []).map((a) => ({
        kode: a.kode || "",
        tp: a.tujuanPembelajaran || ""
      }));
      const tpCoverage = {
        total: tpList.length,
        covered: 0,
        detail: tpList.map((t) => {
          const isCovered = moduls.some((m) => {
            const tpText = m.tujuanPembelajaran || "";
            if (!t.tp || !tpText) return false;
            const terms = t.tp.split(" ").filter((w) => w.length > 4);
            if (terms.length === 0) return true;
            const matchCount = terms.filter((term) => tpText.toLowerCase().includes(term.toLowerCase())).length;
            return matchCount >= Math.ceil(terms.length * 0.3);
          });
          return { kode: t.kode, tp: t.tp, covered: isCovered };
        })
      };
      tpCoverage.covered = tpCoverage.detail.filter((d) => d.covered).length;
      let summary = `Koreksi selesai. ${moduls.length} modul ajar diperiksa untuk semester ${sem === "2" ? "Genap" : "Ganjil"}.`;
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `Buat laporan koreksi modul ajar singkat dan profesional berdasarkan data berikut:

Mapel: ${mapel || "Informatika"}
Semester: ${sem === "2" ? "Genap" : "Ganjil"}
Jumlah modul: ${moduls.length}
Total JP Modul: ${totalModulJP}
Total JP PROMES: ${totalPromesJP}
Kecocokan JP: ${totalModulJP === totalPromesJP ? "Sesuai" : `Tidak sesuai (selisih ${Math.abs(totalModulJP - totalPromesJP)} JP)`}

Cakupan TP ATP: ${tpCoverage.covered}/${tpCoverage.total} terakomodir

Laporan modul:
${modulReports.map((r) => `Modul "${r.tema}": kelengkapan ${r.completeness}%, ${r.missingFields.length} field kosong (${r.missingFields.slice(0, 5).join(", ")})`).join("\n")}

Tulis 2-3 paragraf singkat dalam bahasa Indonesia formal sebagai kesimpulan koreksi. Sebutkan kekuatan utama, kelemahan, dan saran prioritas perbaikan.`,
            config: {
              systemInstruction: "Anda adalah supervisor akademik yang memberikan laporan koreksi modul ajar. Jawaban singkat, padat, profesional.",
              temperature: 0.7
            }
          });
          summary = response.text || summary;
        } catch (aiErr) {
          console.error("Gemini summary generation failed, using fallback:", aiErr);
        }
      }
      return res.json({
        success: true,
        result: { totalModulJP, totalPromesJP, jpMatch: totalModulJP === totalPromesJP, modulReports, tpCoverage, summary }
      });
    } catch (error) {
      console.error("Koreksi Modul Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.post("/api/gemini/generate-reminder", async (req, res) => {
    try {
      const { topic, teachers } = req.body;
      if (!topic) return res.status(400).json({ success: false, error: "Topik pesan is required" });
      if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
        return res.status(400).json({ success: false, error: "Daftar guru is required" });
      }
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        return res.status(500).json({
          success: false,
          error: "GEMINI_API_KEY environment variable is not configured yet."
        });
      }
      const teachersText = teachers.map(
        (t, i) => `Guru ${i + 1}: Nama=${t.nama}, Mapel=${t.mapel}, Progress=${t.progressRata}%, Kekurangan=${t.kekurangan}`
      ).join("\n");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Buat pesan WhatsApp reminder untuk setiap guru berikut. Topik: "${topic}".

Data guru:
${teachersText}

Aturan:
1. Setiap guru mendapat pesa UNIK \u2014 pembuka variatif (Yth. / Kepada Yth. / Assalamualaikum / Salam hormat), struktur kalimat berbeda, pilihan sinonim berbeda, penempatan nama bisa di awal/tengah/akhir.
2. Inti pesa HARUS: menyebut progress rata-rata guru saat ini, menyebut 2-3 bagian administrasi yang nilainya paling rendah, dan ajakan/himbauan untuk melengkapi sesuai topik.
3. Tutup dengan salam yang variatif (Terima kasih / Hormat kami / Wassalamualaikum / Atas perhatiannya diucapkan terima kasih).
4. Bahasa Indonesia formal namun hangat, tidak kaku.`,
        config: {
          systemInstruction: "Anda adalah admin sekolah yang bertugas mengirim pengingat ke para guru. Jawaban HARUS berupa array JSON valid tanpa markdown.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                teacherIndex: { type: Type.INTEGER, description: "Index guru sesuai urutan input (0-based)" },
                message: { type: Type.STRING, description: "Pesan WA unik untuk guru tersebut, maksimal 500 karakter" }
              },
              required: ["teacherIndex", "message"]
            }
          }
        }
      });
      const responseText = response.text || "[]";
      const reminders = JSON.parse(responseText);
      return res.json({ success: true, reminders });
    } catch (error) {
      console.error("Gemini Reminder Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.post("/api/gemini/generate-rpe-recommendation", async (req, res) => {
    try {
      const { totalPekan, totalTidakEfektif, jpPerMinggu, jamEfektif } = req.body;
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        return res.json({ recommendation: "AI tidak dikonfigurasi. Pastikan GEMINI_API_KEY terisi." });
      }
      const prompt = `Berikut data Rencana Pekan Efektif (RPE):
- Total Pekan Semester: ${totalPekan} pekan
- Total Pekan Tidak Efektif: ${totalTidakEfektif} pekan
- Pekan Efektif: ${Math.max(0, totalPekan - totalTidakEfektif)} pekan
- JP per Minggu: ${jpPerMinggu} JP
- Jam Efektif: ${jamEfektif} JP

Beri rekomendasi singkat (maks 2 kalimat) dalam bahasa Indonesia. Jika pekan tidak efektif terlalu besar (lebih dari 40% dari total pekan), beri peringatan dan saran penyesuaian. Jika wajar, beri semangat.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Anda asisten akademik sekolah yang membantu guru menganalisis RPE. Jawab singkat, padat, dalam bahasa Indonesia."
        }
      });
      return res.json({ recommendation: response.text || "Analisis selesai." });
    } catch (error) {
      console.error("RPE AI Error:", error);
      return res.json({ recommendation: "Gagal mendapatkan rekomendasi AI." });
    }
  });
  app2.post("/api/gemini/parse-pdf", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: "File PDF diperlukan" });
      if (req.file.mimetype && !req.file.mimetype.includes("pdf")) {
        try {
          fs2.unlinkSync(req.file.path);
        } catch {
        }
        return res.status(400).json({ success: false, error: "Format file harus PDF" });
      }
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        try {
          fs2.unlinkSync(req.file.path);
        } catch {
        }
        return res.status(500).json({ success: false, error: "GEMINI_API_KEY environment variable is not configured yet." });
      }
      const pdfBuffer = fs2.readFileSync(req.file.path);
      const pdfData = await pdfParse(pdfBuffer);
      const pdfText = pdfData.text;
      if (!pdfText || pdfText.trim().length < 20) {
        try {
          fs2.unlinkSync(req.file.path);
        } catch {
        }
        return res.status(400).json({ success: false, error: "Tidak dapat membaca teks dari PDF. Pastikan PDF bukan hasil scan/gambar." });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Berikut adalah teks dari kalender pendidikan tahunan pemerintah Indonesia. Ekstrak semua kegiatan dan hari libur akademik ke dalam format JSON terstruktur.

TEKS KALENDER:
${pdfText}

Aturan ekstraksi:
- Baca SELURUH teks dengan teliti, cari semua tanggal dan kegiatan
- Kategorikan kegiatan: "libur" untuk libur nasional/cuti bersama/libur sekolah, "akademik" untuk kegiatan pembelajaran/hari efektif, "asesmen" untuk ujian/penilaian/asesmen, "sekolah" untuk kegiatan seremonial/khusus sekolah
- Format tanggal: YYYY-MM-DD. Untuk rentang gunakan "tanggal" (mulai) dan "tanggalSelesai" (akhir)
- Judul kegiatan gunakan bahasa Indonesia yang baku
- Cantumkan deskripsi singkat jika ada keterangan tambahan
- Jangan membuat data palsu. Jika teks tidak mengandung informasi kegiatan yang jelas, skip.
- Pastikan BULAN dan TANGGAL sesuai konteks (misal Juli 2026, Agustus 2026, dst)`,
        config: {
          systemInstruction: "Anda asisten administrasi sekolah yang teliti. Ekstrak kalender akademik dari PDF ke JSON array. Jawab HANYA array JSON valid, tanpa markdown atau teks lain.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tanggal: { type: Type.STRING, description: "Tanggal mulai kegiatan (YYYY-MM-DD)" },
                tanggalSelesai: { type: Type.STRING, description: "Tanggal selesai jika multi-hari (YYYY-MM-DD), kosongkan jika satu hari" },
                kegiatan: { type: Type.STRING, description: "Nama kegiatan/kalender" },
                deskripsi: { type: Type.STRING, description: "Keterangan tambahan jika ada" },
                kategori: { type: Type.STRING, enum: ["libur", "akademik", "asesmen", "sekolah"], description: "Kategori kegiatan" }
              },
              required: ["tanggal", "kegiatan", "kategori"]
            }
          }
        }
      });
      const raw = JSON.parse(response.text || "[]");
      if (!Array.isArray(raw)) throw new Error("Response bukan array");
      const agenda = raw.map((item, i) => ({
        id: "pdf_" + Date.now() + "_" + i,
        tanggal: item.tanggal,
        ...item.tanggalSelesai ? { tanggalSelesai: item.tanggalSelesai } : {},
        kegiatan: item.kegiatan,
        ...item.deskripsi ? { deskripsi: item.deskripsi } : {},
        kategori: ["libur", "akademik", "asesmen", "sekolah"].includes(item.kategori) ? item.kategori : "sekolah"
      }));
      try {
        fs2.unlinkSync(req.file.path);
      } catch {
      }
      return res.json({ success: true, agenda });
    } catch (error) {
      if (req.file?.path) try {
        fs2.unlinkSync(req.file.path);
      } catch {
      }
      console.error("PDF Parse Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.post("/api/send-wa", async (req, res) => {
    try {
      const { token, targets, message } = req.body;
      if (!token) return res.status(400).json({ success: false, error: "Token Fonnte tidak disertakan." });
      if (!targets || !Array.isArray(targets) || targets.length === 0) {
        return res.status(400).json({ success: false, error: "Target penerima tidak valid." });
      }
      if (!message) return res.status(400).json({ success: false, error: "Pesan tidak boleh kosong." });
      const targetStr = targets.join(",");
      const params = new URLSearchParams({ target: targetStr, message });
      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });
      const data = await response.json();
      console.log("Fonnte response:", data);
      if (data.status === true || data.status === "true") {
        return res.json({ success: true, sent: targets.length, detail: data });
      } else {
        return res.json({ success: false, error: data.reason || data.detail || "Gagal mengirim via Fonnte." });
      }
    } catch (error) {
      console.error("Fonnte Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.get("/api/test-docx", async (_req, res) => {
    try {
      const testHtml = "<p>Hello World</p><p>Test DOCX generation</p>";
      const buf = await HTMLtoDOCX(testHtml, void 0, {
        font: "Calibri",
        fontSize: 22,
        title: "Test Document",
        margins: PAGE_MARGINS_TWIP
      });
      console.log("TEST DOCX: type:", typeof buf, "isBuffer:", Buffer.isBuffer(buf), "length:", buf?.length || buf?.byteLength);
      if (buf) {
        const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
        console.log("TEST DOCX: first bytes:", b.slice(0, 4).toString("hex"));
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", "attachment; filename=test.docx");
        res.send(b);
      } else {
        res.status(500).json({ error: "No buffer returned" });
      }
    } catch (e) {
      console.error("TEST DOCX Error:", e);
      res.status(500).json({ error: e.message, stack: e.stack });
    }
  });
  app2.post("/api/export-docx", async (req, res) => {
    try {
      const rawHtml = req.body?.html;
      if (!rawHtml) return res.status(400).json({ success: false, error: "HTML content is required" });
      console.log("DOCX: HTML received, length:", rawHtml.length, "first 200 chars:", rawHtml.slice(0, 200));
      console.log("DOCX: Calling HTMLtoDOCX library...");
      const orientation = req.body?.orientation === "landscape" ? "landscape" : "portrait";
      console.log("DOCX: orientation:", orientation);
      const pageSize = { width: 11906, height: 18709 };
      const docxBuffer = await HTMLtoDOCX(rawHtml, void 0, {
        orientation,
        pageSize,
        margins: PAGE_MARGINS_TWIP,
        title: "Portofolio Administrasi Guru",
        creator: "Sistem Informasi Administrasi Sekolah (SIAS)",
        font: "Times New Roman",
        fontSize: 22,
        table: { row: { cantSplit: true } }
      });
      console.log("DOCX: Library returned type:", typeof docxBuffer, "isBuffer:", Buffer.isBuffer(docxBuffer), "length:", docxBuffer?.length || docxBuffer?.byteLength);
      const buf = Buffer.isBuffer(docxBuffer) ? docxBuffer : Buffer.from(docxBuffer);
      console.log("DOCX: final length:", buf.length);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", "attachment; filename=portofolio_guru.docx");
      res.send(buf);
    } catch (error) {
      console.error("Export DOCX Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.get("/api/cron/list", async (_req, res) => {
    res.json({ success: true, jobs: await loadCronJobs() });
  });
  app2.post("/api/cron/create", async (req, res) => {
    try {
      const { name, topic, teacherIds, daysOfWeek, time, fonnteToken, teacherData } = req.body;
      if (!name || !topic || !time || !daysOfWeek?.length) {
        return res.status(400).json({ success: false, error: "Field required: name, topic, time, daysOfWeek" });
      }
      const record = {
        id: crypto.randomUUID(),
        name,
        topic,
        teacherIds: teacherIds || [],
        daysOfWeek,
        time,
        enabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastRunAt: null,
        lastStatus: null,
        lastMessage: null,
        fonnteToken: fonnteToken || "",
        teacherData: teacherData || []
      };
      const jobs = await loadCronJobs();
      jobs.push(record);
      await saveCronJobs(jobs);
      if (!isServerless()) cronScheduler.init(jobs);
      res.json({ success: true, job: record });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.post("/api/cron/:id/toggle", async (req, res) => {
    try {
      const jobs = await loadCronJobs();
      const idx = jobs.findIndex((j) => j.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: "Cron job not found" });
      jobs[idx].enabled = !jobs[idx].enabled;
      await saveCronJobs(jobs);
      if (!isServerless()) cronScheduler.init(jobs);
      res.json({ success: true, job: jobs[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.post("/api/cron/:id/sync", async (req, res) => {
    try {
      const { teacherData, fonnteToken } = req.body;
      const jobs = await loadCronJobs();
      const idx = jobs.findIndex((j) => j.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: "Cron job not found" });
      if (teacherData) jobs[idx].teacherData = teacherData;
      if (fonnteToken) jobs[idx].fonnteToken = fonnteToken;
      await saveCronJobs(jobs);
      res.json({ success: true, job: jobs[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.delete("/api/cron/:id", async (req, res) => {
    try {
      let jobs = await loadCronJobs();
      const idx = jobs.findIndex((j) => j.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: "Cron job not found" });
      jobs.splice(idx, 1);
      await saveCronJobs(jobs);
      if (!isServerless()) cronScheduler.init(jobs);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.post("/api/cron-tick", async (req, res) => {
    const tickToken = process.env.CRON_TICK_TOKEN;
    if (tickToken && req.headers.authorization !== `Bearer ${tickToken}`) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    try {
      const jobs = await loadCronJobs();
      const now = /* @__PURE__ */ new Date();
      let ran = [];
      for (const job of jobs) {
        if (isCronDue(job, now)) {
          await executeCronJobRecord(job);
          ran.push(job.id);
        }
      }
      res.json({ success: true, checked: jobs.length, ran, tz: CRON_TZ, now: now.toISOString() });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.get("/api/health", (_req, res) => {
    res.json({ success: true, time: (/* @__PURE__ */ new Date()).toISOString(), usingSupabase: isUsingSupabase() });
  });
  app2.get("/api/data/list", async (req, res) => {
    try {
      const prefix = String(req.query.prefix || "");
      const items = await dbList(prefix);
      res.json({ success: true, items });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.get("/api/data/:key", async (req, res) => {
    try {
      const value = await dbGet(req.params.key);
      if (value === null || value === void 0) {
        return res.status(404).json({ success: false, error: "not_found" });
      }
      res.json({ success: true, value });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.put("/api/data/:key", async (req, res) => {
    try {
      const value = req.body;
      if (value === void 0) {
        return res.status(400).json({ success: false, error: "Request body diperlukan" });
      }
      await dbPut(req.params.key, value);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app2.post("/api/data/:key/delete", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  return app2;
}
var app = buildApp();
async function startServer() {
  const PORT = Number(process.env.PORT) || 3e3;
  const server = buildApp();
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    server.use(vite.middlewares);
  } else if (fs2.existsSync(path2.join(process.cwd(), "dist"))) {
    const distPath = path2.join(process.cwd(), "dist");
    server.use(express.static(distPath));
    server.get("*", (_req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running with Express and Vite at http://localhost:${PORT}`);
  });
  const savedJobs = await loadCronJobs();
  cronScheduler.init(savedJobs);
}
if (isMainModule()) startServer();

// scripts/serverless-entry.ts
var config = { maxDuration: 60 };
var serverless_entry_default = app;
export {
  config,
  serverless_entry_default as default
};
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
