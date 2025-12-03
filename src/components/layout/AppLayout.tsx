import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Library, LogOut, PenTool, Settings } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

export function AppLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "儀表板", icon: LayoutDashboard },
    { href: "/library", label: "探索題庫", icon: Library },
    { href: "/editor", label: "創作後台", icon: PenTool },
    { href: "/settings", label: "設定", icon: Settings }, 
  ];

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex overflow-hidden">

      {/* Sidebar (Desktop) */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 hidden md:flex flex-col shrink-0 h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
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
              {/* 將這塊包成 Link */}
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {user.photoURL && (
                  <img src={user.photoURL} className="w-8 h-8 rounded-full" />
                )}
                <div className="text-sm">
                  <p className="font-medium truncate max-w-[100px]">{user.displayName}</p>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} title="登出">
                <LogOut size={18} />
              </Button>
            </div>
          ) : (
            <div className="text-center text-sm text-slate-400">
              未登入
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50/50 dark:bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
}