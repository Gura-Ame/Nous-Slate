import { Loader2 } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function UserAuthForm({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	const { t } = useTranslation();
	const { loginWithGoogle } = useAuth();
	const [isLoading, setIsLoading] = React.useState<boolean>(false);

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		try {
			await loginWithGoogle();
			// post-login redirect handled by router
		} catch (error) {
			console.error(error);
			toast.error(t("login_failed", "Login failed"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("grid gap-6", className)} {...props}>
			<Button
				variant="outline"
				type="button"
				disabled={isLoading}
				onClick={handleGoogleLogin}
				className="w-full h-12 text-base gap-3" // Large button for better mobile tap target
			>
				{isLoading ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<svg role="img" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
						<title>Google Logo</title>
						<path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
					</svg>
				)}
				{t("google_login", "Sign in with Google")}
			</Button>
		</div>
	);
}
