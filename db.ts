/**
 * Cloud persistence layer (Supabase / JSON fallback).
 * Semua data aplikasi disimpan sebagai JSON blob per key (tabel `kv`).
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

let _client: SupabaseClient | null | undefined;

function getClient(): SupabaseClient | null {
  if (_client !== undefined) return _client;
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  _client = url && key ? createClient(url, key) : null;
  return _client;
}

export function isUsingSupabase(): boolean {
  return !!getClient();
}

const FALLBACK_DIR = process.env.SUPABASE_FALLBACK_DIR || path.join(process.cwd(), "data");
const fallbackFile = (key: string) => path.join(FALLBACK_DIR, key.replace(/[^a-zA-Z0-9_.-]/g, "_") + ".json");

async function getFromSupabase<T>(key: string): Promise<T | null> {
  const c = getClient();
  if (!c) return null;
  const { data, error } = await c.from("kv").select("value").eq("key", key).maybeSingle();
  if (error) {
    console.error("dbGet supabase error:", error.message);
    return null;
  }
  return data ? (data.value as T) : null;
}

function getFromFallback<T>(key: string): T | null {
  try {
    if (fs.existsSync(fallbackFile(key))) {
      return JSON.parse(fs.readFileSync(fallbackFile(key), "utf-8"));
    }
  } catch (e) {
    console.error("dbGet fallback error:", e);
  }
  return null;
}

export async function dbGet<T>(key: string): Promise<T | null> {
  if (getClient()) return getFromSupabase<T>(key);
  return getFromFallback<T>(key);
}

export async function dbPut(key: string, value: unknown): Promise<void> {
  const c = getClient();
  if (c) {
    const json = JSON.parse(JSON.stringify(value));
    const { error } = await c.from("kv").upsert({
      key,
      value: json,
      updated_at: new Date().toISOString(),
    });
    if (!error) return;
    console.error("dbPut supabase error:", error.message);
    // fallthrough to fallback file so write is not silently lost
  }
  try {
    fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    fs.writeFileSync(fallbackFile(key), JSON.stringify(value, null, 2), "utf-8");
  } catch (e) {
    console.error("dbPut fallback error:", e);
  }
}

export async function dbList<T = unknown>(prefix: string): Promise<{ key: string; value: T }[]> {
  const c = getClient();
  if (c) {
    const { data, error } = await c.from("kv").select("key, value").like("key", prefix + "%");
    if (!error && data) {
      return data.map((r: any) => ({ key: r.key, value: r.value as T }));
    }
    if (error) console.error("dbList supabase error:", error.message);
    return [];
  }
  try {
    if (!fs.existsSync(FALLBACK_DIR)) return [];
    const out: { key: string; value: T }[] = [];
    for (const f of fs.readdirSync(FALLBACK_DIR)) {
      if (!f.endsWith(".json")) continue;
      const key = f.slice(0, -5);
      if (!key.startsWith(prefix)) continue;
      try {
        out.push({ key, value: JSON.parse(fs.readFileSync(path.join(FALLBACK_DIR, f), "utf-8")) });
      } catch {}
    }
    return out;
  } catch {
    return [];
  }
}