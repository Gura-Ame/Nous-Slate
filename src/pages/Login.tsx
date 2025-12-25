import { LogIn } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassPage } from "@/components/ui/glass/GlassPage";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
	const { t } = useTranslation();
	const { user, loginWithGoogle } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (user) {
			navigate("/dashboard");
		}
	}, [user, navigate]);

	return (
		<GlassPage className="flex items-center justify-center p-4">
			<GlassCard
				className="w-full max-w-md p-8 md:p-12 text-center space-y-8 backdrop-blur-3xl"
				variant="hover-glow"
			>
				<div className="space-y-4">
					<div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl mx-auto shadow-lg animate-blob" />
					<h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
						{t("login.title", "Welcome to Nous Slate")}
					</h1>
					<p className="text-slate-500 dark:text-slate-400 text-lg">
						{t("login.subtitle", "Your AI Learning Assistant")}
					</p>
				</div>

				<GlassButton
					size="lg"
					className="w-full gap-3 h-14 text-lg shadow-lg shadow-blue-500/20"
					onClick={loginWithGoogle}
				>
					<LogIn className="w-5 h-5" />
					{t("login.google_login", "Sign in with Google")}
				</GlassButton>
			</GlassCard>
		</GlassPage>
	);
}
