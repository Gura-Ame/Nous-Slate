import { lazy, Suspense } from "react"; // 1. Import lazy
import { useTranslation } from "react-i18next"; // Added missing import for useTranslation
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { PageLoading } from "@/components/shared/PageLoading"; // Import Loading
import { PWAReloadPrompt } from "@/components/shared/PWAReloadPrompt";
import { Toaster } from "@/components/ui/sonner";

// 2. Use lazy import
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const DeckEditor = lazy(() => import("@/pages/DeckEditor"));
const Editor = lazy(() => import("@/pages/Editor"));
const Library = lazy(() => import("@/pages/Library"));
const Login = lazy(() => import("@/pages/Login"));
const Profile = lazy(() => import("@/pages/Profile"));
const QuizSession = lazy(() => import("@/pages/QuizSession"));
const Settings = lazy(() => import("@/pages/Settings"));
const AdCenter = lazy(() => import("@/pages/AdCenter"));
const ReviewCenter = lazy(() => import("@/pages/ReviewCenter"));

export default function App() {
	const { t } = useTranslation();
	return (
		<HashRouter>
			<Suspense
				fallback={
					<PageLoading message={t("common.loading_page", "Loading page...")} />
				}
			>
				<Routes>
					{/* --- 1. Public Routes --- */}
					{/* These pages do not require login to access */}
					<Route path="/login" element={<Login />} />

					{/* --- 2. Protected + Sidebar --- */}
					{/* AppLayout already includes Auth check logic, so use it directly here */}
					<Route element={<AppLayout />}>
						<Route path="/" element={<Dashboard />} />
						<Route path="/library" element={<Library />} />
						<Route path="/editor" element={<Editor />} />
						<Route path="/editor/:deckId" element={<DeckEditor />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/settings" element={<Settings />} />
						<Route path="/ad-center" element={<AdCenter />} />
						<Route path="/review" element={<ReviewCenter />} />
					</Route>

					{/* --- 3. Protected + Fullscreen --- */}
					{/* Use AuthGuard to protect routes without showing Sidebar */}
					<Route element={<AuthGuard />}>
						<Route path="/quiz/:deckId" element={<QuizSession />} />
					</Route>

					{/* 404 */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Suspense>

			<Toaster richColors position="top-center" />

			<PWAReloadPrompt />
		</HashRouter>
	);
}
