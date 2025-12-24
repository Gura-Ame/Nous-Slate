import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { VitePWA } from "vite-plugin-pwa"; // 引入插件

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "prompt", // 當有新版本時，提示使用者更新 (而不是自動覆蓋)
			includeAssets: ["favicon.ico", "apple-touch-icon.png"],
			manifest: {
				name: "Nous Slate",
				short_name: "NousSlate",
				description: "The Tablet for the Mind - 現代化國語文學習平台",
				theme_color: "#0f172a", // 對應 Slate-900
				background_color: "#0f172a",
				display: "standalone", // 讓 App 看起來像原生應用 (沒有網址列)
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
						purpose: "any maskable", // 讓 Android 可以裁切圓角
					},
				],
			},
			// 離線快取設定
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
				// 手動分包策略
				manualChunks(id) {
					// 1. 把 Firebase 獨立打包 (它是最大的怪獸)
					if (
						id.includes("node_modules/firebase") ||
						id.includes("node_modules/@firebase")
					) {
						return "firebase";
					}
					// 2. 把圖表庫獨立打包
					if (id.includes("node_modules/recharts")) {
						return "recharts";
					}
					// 3. 把 React 核心獨立打包
					if (
						id.includes("node_modules/react") ||
						id.includes("node_modules/react-dom") ||
						id.includes("node_modules/react-router")
					) {
						return "react-vendor";
					}
					// 4. 其他 UI 套件 (Radix, Lucide)
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
