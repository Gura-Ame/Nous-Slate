import { Book, Coins, ExternalLink, Flame, LogOut, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageLoading } from "@/components/shared/PageLoading";
import { StatCard } from "@/components/shared/StatCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassPage } from "@/components/ui/glass/GlassPage";
import { useAuth } from "@/hooks/useAuth";
import { PointsService } from "@/services/points-service";
import { type DashboardStats, StatsService } from "@/services/stats-service";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { UserProfile } from "@/types/schema";

export default function Profile() {
	const { t } = useTranslation();
	const { user, logout } = useAuth();
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

	const {
		dailyNewLimit,
		increaseDailyLimit,
		decreaseDailyLimit,
		autoPlayAudio,
		setAutoPlayAudio,
	} = useSettingsStore();

	useEffect(() => {
		if (!user) return;

		const fetchData = async () => {
			try {
				const [statsData, profileData] = await Promise.all([
					StatsService.getDashboardStats(user.uid),
					PointsService.getUserProfile(user.uid),
				]);
				setStats(statsData);
				setUserProfile(profileData);
			} catch (error) {
				console.error("Profile data fetch error:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user]);

	if (!user)
		return (
			<div className="p-10 text-center">
				{t("common.login_required", "Please login first")}
			</div>
		);

	if (loading) {
		return <PageLoading message={t("profile.loading", "Loading profile...")} />;
	}

	return (
		<GlassPage className="flex justify-center">
			<div className="container p-8 max-w-4xl space-y-8">
				{/* Header Profile Section */}
				<GlassCard
					className="flex flex-col md:flex-row items-center gap-6 p-8 relative overflow-hidden"
					variant="hover-glow"
				>
					{/* Background Decoration (Optional) */}
					<div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
						<Trophy className="w-32 h-32 text-slate-500" />
					</div>

					<Avatar className="h-24 w-24 border-4 border-white/50 dark:border-white/10 shadow-xl z-10">
						<AvatarImage src={user.photoURL || ""} />
						<AvatarFallback className="text-2xl bg-white/50 backdrop-blur-md">
							{user.displayName?.[0] || "U"}
						</AvatarFallback>
					</Avatar>

					<div className="text-center md:text-left space-y-2 flex-1 z-10">
						<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center md:justify-start gap-3">
							{user.displayName}
							{/* Show badge if advertiser */}
							{userProfile?.isAdvertiser && (
								<span className="px-2 py-0.5 rounded-full text-xs bg-purple-100/80 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 font-medium border border-purple-200 dark:border-purple-800 backdrop-blur-sm">
									{t("profile.advertiser", "Advertiser")}
								</span>
							)}
						</h1>
						<p className="text-slate-500">{user.email}</p>

						<div className="flex items-center justify-center md:justify-start gap-3 pt-2 flex-wrap">
							<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100/80 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 backdrop-blur-sm">
								<Coins className="w-4 h-4 mr-1.5" />
								{userProfile?.points?.toFixed(1) || 0}{" "}
								{t("common.points_unit", "Points")}
							</div>

							<Link
								to="/ad-center"
								className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center font-medium transition-colors hover:text-blue-500"
							>
								{t("profile.go_to_points", "Points Center")}{" "}
								<ExternalLink className="w-3 h-3 ml-1" />
							</Link>

							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100/80 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 backdrop-blur-sm">
								ID: {user.uid.slice(0, 6)}
							</span>
						</div>
					</div>

					<GlassButton
						variant="ghost"
						onClick={logout}
						className="gap-2 z-10 border border-red-200/50 dark:border-red-900/20 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
					>
						<LogOut className="w-4 h-4" /> {t("profile.logout", "Log out")}
					</GlassButton>
				</GlassCard>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<StatCard
						title={t("profile.stats.total_reviews", "Total Reviews")}
						value={stats?.totalReviews || 0}
						icon={Trophy}
						iconClassName="text-amber-500"
					/>

					<StatCard
						title={t("profile.stats.streak", "Streak")}
						value={`${stats?.streak || 0} ${t("profile.stats.days", "days")}`}
						icon={Flame}
						iconClassName="text-orange-500"
					/>

					<StatCard
						title={t("profile.stats.total_decks", "Total Decks")}
						value={stats?.totalDecks || 0}
						icon={Book}
						iconClassName="text-blue-500"
					/>
				</div>

				{/* Settings Section */}
				<div className="space-y-4">
					<h3 className="text-xl font-bold ml-1 text-slate-800 dark:text-slate-100">
						{t("profile.preferences", "Preferences")}
					</h3>
					<GlassCard className="p-6">
						<div className="space-y-6">
							{/* Daily New Card Limit */}
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-slate-800 dark:text-slate-200">
										{t("profile.daily_limit", "Daily New Card Limit")}
									</p>
									<p className="text-sm text-slate-500">
										{t(
											"profile.daily_limit_desc",
											"Number of new cards introduced daily",
										)}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<GlassButton
										size="sm"
										variant="ghost"
										onClick={decreaseDailyLimit}
										className="h-8 w-8 p-0 rounded-full"
									>
										-
									</GlassButton>
									<span className="w-8 text-center font-mono font-bold text-lg">
										{dailyNewLimit}
									</span>
									<GlassButton
										size="sm"
										variant="ghost"
										onClick={increaseDailyLimit}
										className="h-8 w-8 p-0 rounded-full"
									>
										+
									</GlassButton>
								</div>
							</div>

							<div className="h-px bg-slate-100 dark:bg-slate-800" />

							{/* Auto-play Pronunciation */}
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-slate-800 dark:text-slate-200">
										{t("settings.auto_play", "Auto-play Audio")}
									</p>
									<p className="text-sm text-slate-500">
										{t(
											"settings.auto_play_desc",
											"Read aloud when entering a card",
										)}
									</p>
								</div>
								<GlassButton
									variant={autoPlayAudio ? "primary" : "ghost"}
									size="sm"
									className={autoPlayAudio ? "px-6" : "px-6 text-slate-500"}
									onClick={() => setAutoPlayAudio(!autoPlayAudio)}
								>
									{autoPlayAudio ? "ON" : "OFF"}
								</GlassButton>
							</div>
						</div>
					</GlassCard>
				</div>
			</div>
		</GlassPage>
	);
}
