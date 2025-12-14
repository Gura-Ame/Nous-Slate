import { Book, Coins, ExternalLink, Flame, LogOut, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageLoading } from "@/components/shared/PageLoading";
import { StatCard } from "@/components/shared/StatCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { PointsService } from "@/services/points-service";
import { type DashboardStats, StatsService } from "@/services/stats-service";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { UserProfile } from "@/types/schema";

export default function Profile() {
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
				// ▼▼▼ 無論成功失敗，最後關閉 loading ▼▼▼
				setLoading(false);
			}
		};

		fetchData();
	}, [user]);

	if (!user) return <div className="p-10 text-center">請先登入</div>;

	if (loading) {
		return <PageLoading message="正在讀取個人檔案..." />;
	}

	return (
		<div className="container mx-auto p-8 max-w-4xl space-y-8">
			{/* Header Profile Section */}
			<div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm relative overflow-hidden">
				{/* 背景裝飾 (可選) */}
				<div className="absolute top-0 right-0 p-4 opacity-10">
					<Trophy className="w-32 h-32 text-slate-500" />
				</div>

				<Avatar className="h-24 w-24 border-4 border-slate-100 dark:border-slate-800 shadow-md z-10">
					<AvatarImage src={user.photoURL || ""} />
					<AvatarFallback className="text-2xl bg-slate-200 dark:bg-slate-700">
						{user.displayName?.[0] || "U"}
					</AvatarFallback>
				</Avatar>

				<div className="text-center md:text-left space-y-2 flex-1 z-10">
					<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center md:justify-start gap-3">
						{user.displayName}
						{/* 如果是廣告主，顯示標籤 */}
						{userProfile?.isAdvertiser && (
							<span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-medium border border-purple-200 dark:border-purple-800">
								廣告主
							</span>
						)}
					</h1>
					<p className="text-slate-500">{user.email}</p>

					<div className="flex items-center justify-center md:justify-start gap-3 pt-2 flex-wrap">
						{/* ▼▼▼ 3. 修改這裡：顯示積分 ▼▼▼ */}
						<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
							<Coins className="w-4 h-4 mr-1.5" />
							{userProfile?.points?.toFixed(1) || 0} 積分
						</div>

						<Link
							to="/ad-center"
							className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
						>
							前往積分中心 <ExternalLink className="w-3 h-3 ml-1" />
						</Link>

						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
							ID: {user.uid.slice(0, 6)}
						</span>
					</div>
				</div>

				<Button
					variant="outline"
					onClick={logout}
					className="gap-2 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
				>
					<LogOut className="w-4 h-4" /> 登出
				</Button>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<StatCard
					title="總學習次數"
					value={stats?.totalReviews || 0}
					icon={Trophy}
					iconClassName="text-amber-500"
				/>

				<StatCard
					title="連續打卡"
					value={`${stats?.streak || 0} 天`}
					icon={Flame}
					iconClassName="text-orange-500"
				/>

				<StatCard
					title="擁有題庫"
					value={stats?.totalDecks || 0}
					icon={Book}
					iconClassName="text-blue-500"
				/>
			</div>

			{/* Settings Section (現在是真的了) */}
			<div className="space-y-4">
				<h3 className="text-lg font-bold">偏好設定</h3>
				<Card>
					<CardContent className="p-6 space-y-4">
						{/* 每日新卡上限 */}
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">每日新卡片上限</p>
								<p className="text-sm text-slate-500">
									每天由 SRS 系統推播的新單字數量
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={decreaseDailyLimit}
								>
									-
								</Button>
								<span className="w-8 text-center">{dailyNewLimit}</span>
								<Button
									variant="outline"
									size="sm"
									onClick={increaseDailyLimit}
								>
									+
								</Button>
							</div>
						</div>

						<div className="h-px bg-slate-100 dark:bg-slate-800" />

						{/* 自動播放發音 */}
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">自動播放發音</p>
								<p className="text-sm text-slate-500">進入卡片時自動朗讀</p>
							</div>
							<Button
								variant={autoPlayAudio ? "default" : "secondary"}
								size="sm"
								onClick={() => setAutoPlayAudio(!autoPlayAudio)}
							>
								{autoPlayAudio ? "已開啟" : "已關閉"}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
