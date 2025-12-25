// src/components/shared/LoginButton.tsx

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function LoginButton() {
	const { t } = useTranslation();
	const { user, loginWithGoogle, logout, loading } = useAuth();

	if (loading) {
		return <Button disabled>{t("common.loading", "Loading...")}</Button>;
	}

	if (user) {
		return (
			<div className="flex items-center gap-4">
				<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
					{t("common.hi_user", { name: user.displayName })}
				</span>
				<Button variant="outline" onClick={logout}>
					{t("common.logout", "Log out")}
				</Button>
			</div>
		);
	}

	return (
		<Button onClick={loginWithGoogle}>
			{t("common.google_login_button", "Sign in with Google")}
		</Button>
	);
}
