import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { VitePWA } from "vite-plugin-pwa"; // Import plugin

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "prompt", // Prompt user to update when new version is available (instead of auto-overlay)
			includeAssets: ["favicon.ico", "apple-touch-icon.png"],
			manifest: {
				name: "Nous Slate",
				short_name: "NousSlate",
				description:
					"The Tablet for the Mind - Modern Mandarin Learning Platform",
				theme_color: "#0f172a", // Corresponds to Slate-900
				background_color: "#0f172a",
				display: "standalone", // Make App look like native app (no address bar)
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable", // Allow Android to crop rounded corners
					},
				],
			},
			// Offline caching configuration
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

				navigateFallbackDenylist: [/^\/__/],

				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "google-fonts-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern:
							/^https:\/\/api\.dictionaryapi\.dev\/api\/v2\/entries\/.*/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "dictionary-api-cache",
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24,
							},
							networkTimeoutSeconds: 5,
						},
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		chunkSizeWarningLimit: 1000,

		rollupOptions: {
			output: {
				// Manual chunking strategy
				manualChunks(id) {
					// 1. Separate Firebase (it's the largest vendor)
					if (
						id.includes("node_modules/firebase") ||
						id.includes("node_modules/@firebase")
					) {
						return "firebase";
					}
					// 2. Separate chart library
					if (id.includes("node_modules/recharts")) {
						return "recharts";
					}
					// 3. Separate React core
					if (
						id.includes("node_modules/react") ||
						id.includes("node_modules/react-dom") ||
						id.includes("node_modules/react-router")
					) {
						return "react-vendor";
					}
					// 4. Other UI packages (Radix, Lucide)
					if (
						id.includes("node_modules/@radix-ui") ||
						id.includes("node_modules/lucide-react")
					) {
						return "ui-vendor";
					}
				},
			},
		},
	},
});
