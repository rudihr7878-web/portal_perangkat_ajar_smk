## Goal
AI-generated reminder/broadcast WhatsApp messages per teacher (with progress + kekurangan) + cron job scheduler, plus existing admin features (kontras fix, akun admin, XLSX upload, monitoring panel, Fonnte WA integration).

## Constraints & Preferences
- Kontras: `text-warm-secondary` di label & th → `text-warm-text` (hitam)
- Monitoring Menu hanya untuk admin saja
- WA gateway menggunakan **Fonnte** (real API, bukan stub)
- Pesan WA Reminder harus **variatif per guru**: menyebut progress rata-rata + 2-3 kategori terendah (kekurangan), dibangkitkan oleh AI (Gemini), bukan template seragam
- Broadcast WA juga pakai AI + variasi per guru

## Progress
### Done
- **Fix kontras AdminPanel**: container + `<label>` + `<th>` ganti `text-warm-secondary` → `text-warm-text`
- **Akun Admin**: field `adminUsername`, `adminPassword`, `fonnteToken` di `AdminMasterConfig` interface + default + merge di `loadAdminMasterConfig()`; LoginScreen baca dari config (ganti hardcoded); sub-tab "Akun Admin" di AdminPanel dengan form ganti username, password, token Fonnte
- **Install `xlsx`**: `npm install xlsx` (SheetJS)
- **Upload Siswa XLSX**: tombol Download Template (.xlsx) + Upload Excel (.xlsx) di sub-tab "Database Siswa" AdminPanel; parsing → mapping → merge ke config (skip duplikat NIS)
- **MonitoringPanel.tsx**: file baru dengan 4 sub-tab (Progress Guru, Reminder WA, Broadcast WA, Laporan Kepala Sekolah); load portfolio semua guru via localStorage; progress bar per kategori; laporan cetak & export DOCX
- **App.tsx**: admin sidebar jadi navigasi 2 item (Database Management ↔ Menu Monitoring); render `AdminPanel` atau `MonitoringPanel` sesuai `activeAdminTab`
- **Fonnte endpoint**: `POST /api/send-wa` di server.ts — panggil `https://api.fonnte.com/send` dengan token + target + message
- **Gemini reminder endpoint**: `POST /api/gemini/generate-reminder` di server.ts — input `{topic, teachers[]}` → output array `{teacherIndex, message}` via responseSchema, variasi per guru berdasarkan progress + kekurangan
- **Frontend AI reminder & broadcast**: state & handler baru (`getKekurangan`, `generateAiReminders`, `handleSendUniqueWA`, `startEdit`/`saveEdit`/`cancelEdit`); topic input → generate AI → preview per teacher (editable inline) → kirim unique per guru via Fonnte
- **Cron Job Scheduler**: `node-cron` di server.ts — class `CronScheduler` (schedule/unschedule/execute via Gemini+Fonnte); 5 endpoint CRUD (`/api/cron/create`, `/api/cron/list`, `/api/cron/:id/toggle`, `/api/cron/:id/sync`, `DELETE /api/cron/:id`); persist ke `cron_jobs.json`; sub-tab "Cron Job" di MonitoringPanel (form create dengan day picker + time + teacher select; daftar job + toggle + delete + sync progress)
- **Build**: frontend (vite) + server (esbuild) sukses; `npm run lint` hijau
- **Sinkronisasi lintas perangkat (Supabase + Render)**: install `@supabase/supabase-js`; `db.ts` baru (dbGet/dbPut/dbList/isUsingSupabase, env `SUPABASE_URL`+`SUPABASE_SERVICE_ROLE_KEY`, fallback folder `data/`); `server.ts` CORS (env `CORS_ORIGIN`), endpoint `GET /api/health`, `GET /api/data/list?prefix=`, `GET/PUT /api/data/:key`, `POST /api/data/:key/delete`; loadCronJobs/saveCronJobs async (key `cron_jobs` di DB, fallback `cron_jobs.json`); `PORT` baca env `PORT` (default 3000); `src/api.ts` baru (API_BASE dari `VITE_API_BASE_URL`, apiFetch, cloudGet/cloudPut/cloudList, CLOUD_KEYS); mirror save ke cloud di `saveAdminMasterConfig`/`saveTeacherPortfolio` (utils), `setItem` RPE + `pullRPEFromCloud` (RPEPanel mount), MonitoringPanel baca portfolio via `cloudList`; semua `fetch("/api...` → `apiFetch("/api...`; App.tsx hydrasi adminConfig & portfolio dari cloud saat mount; fix 13 error tipe lama (server cron type, exportHtml fallback types, ModulAjarView score unknown, ProyekCard key props)
- **GitHub**: repo `rudihr7878-web/portal_perangkat_ajar_smk` branch `master`, commit `0065902`; push pakai format `https://x-access-token:<PAT>@github.com/...` (fine-grained PAT); remote config disimpan tanpa token

### In Progress
- (none)

### Blocked
- Menunggu user membuat project Supabase → butuh `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` untuk mengaktifkan sinkronisasi cloud

## Key Decisions
- **WA gateway**: Fonnte (API token, pay-per-message, REST), bukan whatsapp-web.js
- **Pesan WA per guru**: dikirim 1 request per guru (loop) karena tiap guru pesannya unik; bukan batch 1-pesan-ke-banyak
- **Merge AdminMasterConfig**: `{ ...defaultAdminConfig, ...parsed }` agar localStorage lama compatible dengan field baru (`adminUsername`, `adminPassword`, `fonnteToken`)
- **loadAdminMasterConfig**: di-load di App.tsx yang akan di-pass ke login; logic di utils.ts agar login screen bisa langsung baca
- **Cron job data**: Teacher progress disnapshot saat create/sync, disimpan di `cron_jobs.json`, server generate AI + kirim WA otomatis sesuai jadwal

## Next Steps
- (none — all features complete)

## Critical Context
- localStorage keys: `sim_guru_admin_master` (config admin+guru+siswa), `sim_guru_portfolio_{teacherId}` (data per guru)
- Cloud keys (Supabase/fallback `data/`): `adminMaster` (config), `portfolio_{teacherId}` (kunci `sim_guru_portfolio_...`), `rpe_list`, `rpe_history_*`, `rpe_template_gasal`/`rpe_template_genap`; tabel `public.kv` (text key, jsonb value, timestamptz updated_at)
- Fonnte token disimpan di admin config, dikirim dari frontend ke `/api/send-wa`
- Gemini API key dari env `GEMINI_API_KEY` (server-side)
- Endpoint `/api/send-wa` hanya support 1 message ke 1 target (per guru) — untuk broadcast unik tiap guru, loop di frontend
- Cron job tersimpan di DB key `cron_jobs` (fallback `cron_jobs.json`), di-schedule ulang otomatis saat server restart
- `vite build` + `esbuild server.ts` sudah sukses; `npm run lint` (tsc --noEmit) hijau
- Deploy: Vercel statis (`dist/`) + env `VITE_API_BASE_URL=https://<render>.onrender.com`; Render jalankan `node dist/server.cjs` + env `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`GEMINI_API_KEY`/`CORS_ORIGIN`; ping `API_URL/api/health` tiap ~13 menit agar instance free tidak sleep

## Relevant Files
- `src/components/MonitoringPanel.tsx`: progress, AI reminder, AI broadcast, cron job, laporan
- `src/components/AdminPanel.tsx`: fix kontras, sub-tab Akun Admin, upload XLSX
- `src/utils.ts`: `AdminMasterConfig` + new fields + merge logic
- `src/components/LoginScreen.tsx`: baca kredensial dari config
- `src/App.tsx`: admin sidebar navigation Database ↔ Monitoring; hydrasi adminConfig & portfolio dari cloud
- `server.ts`: endpoints Fonnte, Gemini generate-reminder, cron job CRUD + scheduler (`CronScheduler`), CORS exact-origin, `/api/data/*`, `/api/health`, port dari `process.env.PORT`
- `db.ts`: layer Supabase (dbGet/dbPut/dbList/isUsingSupabase) + fallback file folder `data/`
- `src/api.ts`: frontend cloud layer (API_BASE dari `VITE_API_BASE_URL`, apiFetch, cloudGet/cloudPut/cloudList)
- `src/components/RPE/RPEUtils.ts` & `RPEPanel.tsx`: mirroor RPE ke cloud + pull saat mount
- `src/components/RPE/RPEForm.tsx`, `AdministrasiKelasKokurikuler.tsx`, `ModulAjarView.tsx`, `exportHtml.ts`: fix error tipe + call site `apiFetch`
