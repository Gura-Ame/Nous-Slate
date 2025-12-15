import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider";
import App from "./App.tsx";
import "./index.css";

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
