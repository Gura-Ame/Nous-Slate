import { useAuth } from "@/hooks/useAuth";
import { type DashboardStats, StatsService } from "@/services/stats-service";
import { BookOpen, BrainCircuit, Flame, History, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Components
import { Overview } from "@/components/dashboard/Overview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    return <div className="p-8 space-y-4">
      <Skeleton className="h-12 w-1/3" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({length:4}).map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <Skeleton className="h-[400px]" />
    </div>;
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
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">總複習次數</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今日複習</CardTitle>
                <BrainCircuit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats?.todayCount || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">連續打卡</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.streak || 0} 天</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">擁有題庫</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalDecks || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>學習趨勢</CardTitle>
                <CardDescription>過去 7 天的複習題數。</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {/* 傳入真實數據 */}
                <Overview data={stats?.chartData || []} />
              </CardContent>
            </Card>
            
            {/* Recent Activity 這裡可以選擇性隱藏或也串接真實數據，為簡化先拿掉 dummy */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>狀態說明</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  持續練習可以累積「連續打卡」天數。SM-2 演算法會根據您的答題狀況，自動安排最佳複習時間。
                </p>
                {/* 這裡可以放一些靜態的 Motivational Quote 或是簡易的最新牌組連結 */}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}