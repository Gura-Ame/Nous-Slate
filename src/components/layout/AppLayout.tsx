import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { BrainCircuit, Coins, LayoutDashboard, Library, LogOut, Menu, PenTool, Settings } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";

export function AppLayout() {
  const { pathname } = useLocation();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false); // 控制手機選單開關

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { href: "/", label: "儀表板", icon: LayoutDashboard },
    { href: "/library", label: "探索題庫", icon: Library },
    { href: "/editor", label: "創作後台", icon: PenTool },
    { href: "/settings", label: "設定", icon: Settings },
    { href: "/ad-center", label: "積分中心", icon: Coins },
    { href: "/review", label: "今日複習", icon: BrainCircuit },
  ];

  // 抽離出 NavContent，讓 Desktop Sidebar 和 Mobile Sheet 共用
  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-20 flex items-center px-6 border-b dark:border-slate-800">
        <h1 className="text-2xl font-bold font-serif text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center text-lg">N</span>
          Nous Slate
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)} // 手機版點擊後自動關閉選單
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                isActive
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t mt-auto">
        {user ? (
          <div className="flex items-center justify-between">
            <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {user.photoURL && (
                <img src={user.photoURL} alt={user.displayName || "User profile"} className="w-8 h-8 rounded-full" />
              )}
              <div className="text-sm">
                <p className="font-medium truncate max-w-25 text-slate-700 dark:text-slate-200">{user.displayName}</p>
              </div>
            </Link>
            <Button variant="ghost" size="icon" onClick={logout} title="登出">
              <LogOut size={18} />
            </Button>
          </div>
        ) : (
          <div className="text-center text-sm text-slate-400">未登入</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden">

      {/* 1. Mobile Header (只在手機顯示 md:hidden) */}
      <header className="md:hidden h-16 border-b bg-white dark:bg-slate-900 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-2 font-serif font-bold text-lg text-slate-800 dark:text-slate-100">
           <span className="w-6 h-6 bg-slate-900 text-white rounded flex items-center justify-center text-xs">N</span>
           Nous Slate
        </div>

        {/* 漢堡選單 */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-white dark:bg-slate-900 border-r dark:border-slate-800">
            {/* SheetTitle 是無障礙規範必須的，我們可以隱藏它或寫在這裡 */}
            <SheetTitle className="sr-only">導覽選單</SheetTitle>
            <NavContent />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 hidden md:flex flex-col shrink-0 h-full">
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50/50 dark:bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
}