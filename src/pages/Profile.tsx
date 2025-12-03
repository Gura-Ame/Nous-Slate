import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Book, Flame, LogOut, Trophy } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return <div className="p-10 text-center">請先登入</div>;

  return (
    <div className="container mx-auto p-8 max-w-4xl space-y-8">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm">
        <Avatar className="h-24 w-24 border-4 border-slate-100 dark:border-slate-800">
          <AvatarImage src={user.photoURL || ""} />
          <AvatarFallback className="text-2xl bg-slate-200 dark:bg-slate-700">
            {user.displayName?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center md:text-left space-y-2 flex-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {user.displayName}
          </h1>
          <p className="text-slate-500">{user.email}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Free Plan
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
              使用者 ID: {user.uid.slice(0, 6)}...
            </span>
          </div>
        </div>

        <Button variant="outline" onClick={logout} className="gap-2">
          <LogOut className="w-4 h-4" /> 登出
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">總學習次數</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground mt-1">+12% vs 上週</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">連續打卡</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 天</div>
            <p className="text-xs text-muted-foreground mt-1">再 2 天達成週目標</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">擁有題庫</CardTitle>
            <Book className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">含 3 個公開題庫</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Section (Placeholder) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">偏好設定</h3>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">每日新卡片上限</p>
                <p className="text-sm text-slate-500">每天由 SRS 系統推播的新單字數量</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">-</Button>
                <span className="w-8 text-center">20</span>
                <Button variant="outline" size="sm">+</Button>
              </div>
            </div>
            
            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">自動播放發音</p>
                <p className="text-sm text-slate-500">進入卡片時自動朗讀</p>
              </div>
              {/* 這裡之後可以放 Switch */}
              <Button variant="secondary" size="sm">已關閉</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}