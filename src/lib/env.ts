import { z } from "zod";

// 定義你的環境變數 Schema (合約)
const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1, "API Key is required"),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  VITE_FIREBASE_APP_ID: z.string().min(1),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().min(1),
  VITE_RECAPTCHA_SITE_KEY: z.string().min(1),
});

// 嘗試解析 import.meta.env
const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
  console.error("❌ 無效的環境變數:", _env.error.format());
  throw new Error("環境變數驗證失敗，請檢查 .env 或 GitHub Secrets 是否缺漏。");
}

// 匯出驗證過的 env
export const env = _env.data;