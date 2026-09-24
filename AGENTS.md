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
- **Build**: frontend (vite) + server (esbuild) sukses

### In Progress
- (none)

### Blocked
- (none)

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
- Fonnte token disimpan di admin config, dikirim dari frontend ke `/api/send-wa`
- Gemini API key dari env `GEMINI_API_KEY` (server-side)
- Endpoint `/api/send-wa` hanya support 1 message ke 1 target (per guru) — untuk broadcast unik tiap guru, loop di frontend
- Cron job tersimpan di `cron_jobs.json` di root project, di-schedule ulang otomatis saat server restart
- `vite build` + `esbuild server.ts` sudah sukses

## Relevant Files
- `src/components/MonitoringPanel.tsx`: progress, AI reminder, AI broadcast, cron job, laporan
- `src/components/AdminPanel.tsx`: fix kontras, sub-tab Akun Admin, upload XLSX
- `src/utils.ts`: `AdminMasterConfig` + new fields + merge logic
- `src/components/LoginScreen.tsx`: baca kredensial dari config
- `src/App.tsx`: admin sidebar navigation Database ↔ Monitoring
- `server.ts`: endpoints Fonnte, Gemini generate-reminder, cron job CRUD + scheduler (`CronScheduler`)
