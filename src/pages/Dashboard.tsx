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
	const { user } = useAuth();
	const [stats, setStats] = useState<DashboardStats | null>(null);

	const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
	const [chartDate, setChartDate] = useState(new Date()); // 當前檢視的結束日期
	const [loading, setLoading] = useState(true);

	// 1. 載入總覽數據 (只跑一次)
	useEffect(() => {
		if (!user) return;
		StatsService.getDashboardStats(user.uid).then((data) => {
			setStats(data);
			setLoading(false);
		});
	}, [user]);

	// 2. 載入圖表數據 (當 user 或 chartDate 改變時跑)
	useEffect(() => {
		if (!user) return;
		StatsService.getWeeklyChartData(user.uid, chartDate).then(setChartData);
	}, [user, chartDate]);

	// 日期切換 Handler
	const handlePrevWeek = () => setChartDate((d) => subDays(d, 7));
	const handleNextWeek = () => {
		// 不允許超過今天
		if (isSameDay(chartDate, new Date())) return;
		setChartDate((d) => addDays(d, 7));
	};

	const isToday = isSameDay(chartDate, new Date());
	const dateRangeStr = `${format(subDays(chartDate, 6), "MM/dd")} - ${format(chartDate, "MM/dd")}`;

	if (loading) return <PageLoading message="正在分析學習數據..." />;

	return (
		<div className="flex-1 space-y-6 p-8 pt-6">
			<PageHeader
				title="儀表板"
				description={`歡迎回來，${user?.displayName || "學習者"}`}
			></PageHeader>

			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList>
					<TabsTrigger value="overview">總覽</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					{/* Top Cards (StatCard) ... 保持不變 */}
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{/* ... 使用之前的 StatCard ... */}
						<StatCard
							title="總複習次數"
							value={stats?.totalReviews || 0}
							icon={History}
						/>
						<StatCard
							title="今日複習"
							value={stats?.todayCount || 0}
							icon={BrainCircuit}
							valueClassName="text-primary"
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
							icon={BookOpen}
						/>
					</div>

					<div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7 items-stretch">
						{/* Left: Chart with Navigation */}
						<Card className="col-span-1 lg:col-span-4 h-full border-slate-200 dark:border-slate-800">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>學習成效</CardTitle>
										<CardDescription>複習數量與錯誤率趨勢。</CardDescription>
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
											disabled={isToday} // 今天之後不能點
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
								<CardTitle>狀態說明</CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col w-full">
								<p className="text-base text-muted-foreground leading-relaxed w-full">
									持續練習可以累積「連續打卡」天數。SM-2
									演算法會根據您的答題狀況，自動安排最佳複習時間。
								</p>
								<div className="mt-6 p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 w-full flex-1">
									<h4 className="font-bold mb-3 text-sm flex items-center gap-2">
										<span className="w-1.5 h-1.5 rounded-full bg-primary" />
										系統提示
									</h4>
									<ul className="text-sm text-slate-500 space-y-2">
										<li className="flex items-start gap-2">
											<span className="text-primary">•</span>{" "}
											手機可使用虛擬鍵盤輸入注音
										</li>
										<li className="flex items-start gap-2">
											<span className="text-primary">•</span> 支援選擇題數字鍵
											(1-4) 快速作答
										</li>
										<li className="flex items-start gap-2">
											<span className="text-primary">•</span> PC 支援鍵盤操作與
											Ctrl+Enter 存檔
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
