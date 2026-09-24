// Vercel serverless entry - backend sama-origin dengan frontend di Vercel.
import { app } from "../server";

export default app;

// Hobby plan: maks 60 detik per invocation (cukup untuk Gemini + broadcast WA).
export const config = {
  maxDuration: 60,
};