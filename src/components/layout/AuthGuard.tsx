import { useTranslation } from "react-i18next";
import { Navigate, Outlet } from "react-router-dom";
import { PageLoading } from "@/components/shared/PageLoading";
import { useAuth } from "@/hooks/useAuth";

export function AuthGuard() {
	const { t } = useTranslation();
	const { user, loading } = useAuth();

	// 1. Wait for Auth initialization
	if (loading) {
		return (
			<PageLoading
				message={t("common.verifying_auth", "Verifying identity...")}
			/>
		);
	}

	// 2. Not logged in -> Redirect to login page
	if (!user) {
		return <Navigate to="/login" replace />;
	}

	// 3. Logged in -> Render sub-routes (Outlet)
	return <Outlet />;
}
