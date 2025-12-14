import { lazy, Suspense } from "react"; // 1. 引入 lazy
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { PageLoading } from "@/components/shared/PageLoading"; // 引入 Loading
import { PWAReloadPrompt } from "@/components/shared/PWAReloadPrompt";
import { Toaster } from "@/components/ui/sonner";

// 2. 改用 lazy import
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
	return (
		<HashRouter>
			<Suspense fallback={<PageLoading message="載入頁面中..." />}>
				<Routes>
					{/* --- 1. 公開路由 (Public Routes) --- */}
					{/* 這些頁面不需要登入就能訪問 */}
					<Route path="/login" element={<Login />} />

					{/* --- 2. 受保護 + 有側邊欄 (Protected + Sidebar) --- */}
					{/* AppLayout 內部已經包含 Auth 檢查邏輯，所以這裡直接用 AppLayout */}
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

					{/* --- 3. 受保護 + 全螢幕 (Protected + Fullscreen) --- */}
					{/* 這裡使用 AuthGuard 來保護路由，但不顯示 Sidebar */}
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
