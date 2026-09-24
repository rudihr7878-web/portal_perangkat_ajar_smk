/**
 * Frontend cloud data layer.
 * Menggantikan localStorage sebagai sumber data ANTAR perangkat.
 * localStorage tetap dipakai sebagai cache agar UI tetap responsif.
 */

const API_BASE: string = ((import.meta as any).env?.VITE_API_BASE_URL as string) || "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/** convenience fetch yang otomatis menunjuk ke backend (Render / lokal). */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}

/** Ambil nilai JSON dari cloud. Mengembalikan null bila key tidak ada / error. */
export async function cloudGet<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(apiUrl("/api/data/" + encodeURIComponent(key)));
    if (!res.ok) return null;
    const data = await res.json();
    return data?.success ? (data.value as T) : null;
  } catch {
    return null;
  }
}

/** Simpan nilai JSON ke cloud. Fire-and-forget di UI. */
export async function cloudPut(key: string, value: unknown): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/data/" + encodeURIComponent(key)), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Ambil daftar key+value yang dimulai dengan prefix tertentu (mis. portfolio semua guru). */
export async function cloudList<T = unknown>(prefix: string): Promise<{ key: string; value: T }[]> {
  try {
    const res = await fetch(apiUrl("/api/data/list?prefix=" + encodeURIComponent(prefix)));
    if (!res.ok) return [];
    const data = await res.json();
    return data?.success ? (data.items as { key: string; value: T }[]) || [] : [];
  } catch {
    return [];
  }
}

export const CLOUD_KEYS = {
  adminMaster: "sim_guru_admin_master",
  portfolioPrefix: "sim_guru_portfolio_",
  rpeList: "sim_guru_rpe_list",
  rpeHistoryPrefix: "sim_guru_rpe_history_",
  rpeTemplateGasal: "sim_guru_rpe_template_gasal",
  rpeTemplateGenap: "sim_guru_rpe_template_genap",
} as const;