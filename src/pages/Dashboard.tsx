import { Overview } from "@/components/dashboard/Overview";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
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
import { BookOpen, BrainCircuit, Flame, History, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            儀表板
          </h2>
          <p className="text-muted-foreground">
            歡迎回來，{user?.displayName || "學習者"}。這是您今天的學習概況。
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

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">總覽</TabsTrigger>
          <TabsTrigger value="analytics" disabled>分析 (Pro)</TabsTrigger>
          <TabsTrigger value="reports" disabled>報告 (Pro)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          
          {/* Top Cards (4 Grid) */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Card 1: 總複習數 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">總複習次數</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,284</div>
                <p className="text-xs text-muted-foreground">
                  較上月成長 +20.1%
                </p>
              </CardContent>
            </Card>

            {/* Card 2: 今日待複習 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今日待複習</CardTitle>
                <BrainCircuit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">45</div>
                <p className="text-xs text-muted-foreground">
                  預計需花費 15 分鐘
                </p>
              </CardContent>
            </Card>

            {/* Card 3: 連續打卡 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">連續打卡</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12 天</div>
                <p className="text-xs text-muted-foreground">
                  保持下去，不要中斷！
                </p>
              </CardContent>
            </Card>

            {/* Card 4: 總題庫數 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">已掌握卡片</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">573</div>
                <p className="text-xs text-muted-foreground">
                  本週新增 +42 張
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            
            {/* Left: Bar Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>學習趨勢</CardTitle>
                <CardDescription>
                  過去 7 天的每日複習題數統計。
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            
            {/* Right: Recent Activity */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>最近動態</CardTitle>
                <CardDescription>
                  您最近的學習與創作紀錄。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}