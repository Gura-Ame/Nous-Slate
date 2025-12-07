import { useAuth } from "@/hooks/useAuth";
import { type DashboardStats, StatsService } from "@/services/stats-service";
import { BookOpen, BrainCircuit, Flame, History, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Components
import { Overview } from "@/components/dashboard/Overview";
import { PageLoading } from "@/components/shared/PageLoading";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const data = await StatsService.getDashboardStats(user.uid);
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) {
    return <PageLoading message="正在分析學習數據..." />;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            儀表板
          </h2>
          <p className="text-muted-foreground">
            歡迎回來，{user?.displayName || "學習者"}。
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link to="/editor">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> 新增題組
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">總覽</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

          {/* Top Cards (4 Grid) */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="總複習次數"
              value={stats?.totalReviews || 0}
              icon={History}
            />

            <StatCard
              title="今日複習"
              value={stats?.todayCount || 0}
              icon={BrainCircuit}
              valueClassName="text-primary" // 特別強調這一個數字
            />

            <StatCard
              title="連續打卡"
              value={`${stats?.streak || 0} 天`}
              icon={Flame}
              iconClassName="text-orange-500" // 指定圖標顏色
            />

            <StatCard
              title="擁有題庫"
              value={stats?.totalDecks || 0}
              icon={BookOpen}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7 items-stretch">

            {/* Left: Bar Chart */}
            {/* ▼▼▼ 修改：col-span-1 lg:col-span-4 ▼▼▼ */}
            <Card className="col-span-1 lg:col-span-4 h-full border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>學習趨勢</CardTitle>
                <CardDescription>
                  過去 7 天的複習題數。
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview data={stats?.chartData || []} />
              </CardContent>
            </Card>

            {/* Right: Status */}
            {/* ▼▼▼ 修改：col-span-1 lg:col-span-3 ▼▼▼ */}
            <Card className="col-span-1 lg:col-span-3 h-full flex flex-col border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>狀態說明</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col w-full">
                <p className="text-base text-muted-foreground leading-relaxed w-full">
                  持續練習可以累積「連續打卡」天數。SM-2 演算法會根據您的答題狀況，自動安排最佳複習時間。
                </p>
                <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 w-full flex-1">
                  <h4 className="font-bold mb-3 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    系統提示
                  </h4>
                  <ul className="text-sm text-slate-500 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span> 手機可使用虛擬鍵盤輸入注音
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span> 支援選擇題數字鍵 (1-4) 快速作答
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span> PC 支援鍵盤操作與 Ctrl+Enter 存檔
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