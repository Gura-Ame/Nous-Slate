import { Navigate, Outlet } from "react-router-dom";
import { PageLoading } from "@/components/shared/PageLoading";
import { useAuth } from "@/hooks/useAuth";

export function AuthGuard() {
	const { user, loading } = useAuth();

	// 1. 等待 Auth 初始化
	if (loading) {
		return <PageLoading message="驗證身分中..." />;
	}

	// 2. 未登入 -> 踢回登入頁
	if (!user) {
		return <Navigate to="/login" replace />;
	}

	// 3. 已登入 -> 渲染子路由 (Outlet)
	return <Outlet />;
}
