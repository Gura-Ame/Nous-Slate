import { addDays, format, isSameDay, subDays } from "date-fns";
import {
	BookOpen,
	BrainCircuit,
	ChevronLeft,
	ChevronRight,
	Flame,
	History,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// Components
import { Overview } from "@/components/dashboard/Overview";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoading } from "@/components/shared/PageLoading";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import {
	type ChartDataPoint,
	type DashboardStats,
	StatsService,
} from "@/services/stats-service";

export default function Dashboard() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const [stats, setStats] = useState<DashboardStats | null>(null);

	const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
	const [chartDate, setChartDate] = useState(new Date()); // Current viewing end date
	const [loading, setLoading] = useState(true);

	// 1. Load overview data (Runs only once)
	useEffect(() => {
		if (!user) return;
		StatsService.getDashboardStats(user.uid).then((data) => {
			setStats(data);
			setLoading(false);
		});
	}, [user]);

	// 2. Load chart data (Runs when user or chartDate changes)
	useEffect(() => {
		if (!user) return;
		StatsService.getWeeklyChartData(user.uid, chartDate).then(setChartData);
	}, [user, chartDate]);

	// Date switch Handlers
	const handlePrevWeek = () => setChartDate((d) => subDays(d, 7));
	const handleNextWeek = () => {
		// Do not allow exceeding today
		if (isSameDay(chartDate, new Date())) return;
		setChartDate((d) => addDays(d, 7));
	};

	const isToday = isSameDay(chartDate, new Date());
	const dateRangeStr = `${format(subDays(chartDate, 6), "MM/dd")} - ${format(chartDate, "MM/dd")}`;

	if (loading)
		return (
			<PageLoading
				message={t("common.analyzing_data", "Analyzing learning data...")}
			/>
		);

	return (
		<div className="flex-1 space-y-6 p-8 pt-6">
			<PageHeader
				title={t("dashboard.title", "Dashboard")}
				description={t("dashboard.welcome", {
					name: user?.displayName || t("dashboard.welcome_default", "Learner"),
				})}
			></PageHeader>

			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList>
					<TabsTrigger value="overview">
						{t("dashboard.overview_tab", "Overview")}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						<StatCard
							title={t("dashboard.total_reviews", "Total Reviews")}
							value={stats?.totalReviews || 0}
							icon={History}
						/>
						<StatCard
							title={t("dashboard.today_reviews", "Today's Reviews")}
							value={stats?.todayCount || 0}
							icon={BrainCircuit}
							valueClassName="text-primary"
						/>
						<StatCard
							title={t("dashboard.streak", "Streak")}
							value={`${stats?.streak || 0} ${t("dashboard.days", "days")}`}
							icon={Flame}
							iconClassName="text-orange-500"
						/>
						<StatCard
							title={t("dashboard.owned_decks", "Owned Decks")}
							value={stats?.totalDecks || 0}
							icon={BookOpen}
						/>
					</div>

					<div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7 items-stretch">
						{/* Left: Chart with Navigation */}
						<Card className="col-span-1 lg:col-span-4 h-full border-slate-200 dark:border-slate-800">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>
											{t("dashboard.performance_title", "Learning Performance")}
										</CardTitle>
										<CardDescription>
											{t(
												"dashboard.performance_desc",
												"Review count and error rate trends.",
											)}
										</CardDescription>
									</div>

									<div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-md p-1">
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6"
											onClick={handlePrevWeek}
										>
											<ChevronLeft className="h-4 w-4" />
										</Button>
										<span className="text-xs font-medium w-24 text-center tabular-nums">
											{dateRangeStr}
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6"
											onClick={handleNextWeek}
											disabled={isToday} // Cannot click beyond today
										>
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent className="pl-0">
								<Overview data={chartData} />
							</CardContent>
						</Card>

						{/* Right: Status */}
						<Card className="col-span-1 lg:col-span-3 h-full flex flex-col border-slate-200 dark:border-slate-800">
							<CardHeader>
								<CardTitle>{t("dashboard.status_title", "Status")}</CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col w-full">
								<p className="text-base text-muted-foreground leading-relaxed w-full">
									{t(
										"dashboard.status_desc",
										"Continuous practice builds your streak. SM-2 algorithm schedules the best time to review based on your performance.",
									)}
								</p>
								<div className="mt-6 p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 w-full flex-1">
									<h4 className="font-bold mb-3 text-sm flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-primary" />
										System Tips
									</h4>
									<ul className="text-sm text-slate-500 space-y-2">
										<li className="flex items-start gap-2">
											<span className="text-primary">•</span> Mobile users can
											input Bopomofo via virtual keyboard
										</li>
										<li className="flex items-start gap-2">
											<span className="text-primary">•</span> Supports using
											number keys (1-4) for quick answering in choice cards
										</li>
										<li className="flex items-start gap-2">
											<span className="text-primary">•</span> PC supports
											keyboard operations and Ctrl+Enter to save
										</li>
									</ul>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
