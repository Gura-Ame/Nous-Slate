import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider";
import App from "./App.tsx";
import "./index.css";
import "./i18n"; // Import i18n config

const root: HTMLElement | null = document.getElementById("root");
if (root) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<ThemeProvider defaultTheme="system" storageKey="nous-theme">
				<App />
			</ThemeProvider>
		</React.StrictMode>,
	);
}
