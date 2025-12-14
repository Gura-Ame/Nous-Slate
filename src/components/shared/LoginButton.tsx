// src/components/shared/LoginButton.tsx
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function LoginButton() {
	const { user, loginWithGoogle, logout, loading } = useAuth();

	if (loading) {
		return <Button disabled>Loading...</Button>;
	}

	if (user) {
		return (
			<div className="flex items-center gap-4">
				<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
					Hi, {user.displayName}
				</span>
				<Button variant="outline" onClick={logout}>
					登出
				</Button>
			</div>
		);
	}

	return <Button onClick={loginWithGoogle}>Google 登入</Button>;
}
