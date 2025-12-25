import { z } from "zod";

// Define your environment variable Schema (contract)
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

// Try to parse import.meta.env
const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
	console.error("❌ Invalid environment variables:", _env.error.format());
	throw new Error(
		"Environment variable validation failed. Please check .env or GitHub Secrets.",
	);
}

// Export verified env
export const env = _env.data;
