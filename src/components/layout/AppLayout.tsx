import {
	BrainCircuit,
	Coins,
	LayoutDashboard,
	Library,
	LogOut,
	Menu,
	PenTool,
	Settings,
} from "lucide-react";
import { useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function AppLayout() {
	const { pathname } = useLocation();
	const { user, loading, logout } = useAuth();
	const [open, setOpen] = useState(false);

	if (loading) {
		return (
			<div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
				Loading...
			</div>
		);
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

	const NavContent = () => (
		// 側邊欄背景：淺色時全白，深色時深灰 (slate-950)
		<div className="flex flex-col h-full bg-white dark:bg-slate-950 text-foreground transition-colors duration-300">
			{/* Logo 區域 */}
			<div className="h-20 flex items-center px-6 shrink-0">
				<Link to="/" className="flex items-center gap-3 group">
					<div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-xl font-bold font-serif shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
						N
					</div>
					<span className="text-xl font-bold tracking-wide font-serif">
						Nous Slate
					</span>
				</Link>
			</div>

			{/* 選單區域 */}
			<nav className="flex-1 px-4 mt-2 space-y-2 overflow-y-auto">
				{navItems.map((item) => {
					const Icon = item.icon;
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.href}
							to={item.href}
							onClick={() => setOpen(false)}
							className={cn(
								// Hover 動畫：hover 時背景變色 + 文字右移 (translate-x-1)
								"flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm relative overflow-hidden",
								isActive
									? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-bold shadow-sm"
									: "text-muted-foreground hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-slate-200 hover:pl-5 hover:pr-3",
							)}
						>
							{/* 裝飾線條 (Active 時顯示) */}
							{isActive && (
								<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
							)}

							<Icon
								size={20}
								className={cn(
									"transition-colors duration-200",
									isActive
										? "text-primary"
										: "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300",
								)}
							/>
							{item.label}
						</Link>
					);
				})}
			</nav>

			{/* 底部使用者區域 */}
			<div className="p-4 mt-auto">
				{user ? (
					<div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 transition-colors border border-slate-100 dark:border-slate-800">
						<div className="relative shrink-0">
							{user.photoURL ? (
								<img
									src={user.photoURL}
									alt={user.displayName || "User"}
									className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
								/>
							) : (
								<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
									{user.displayName?.[0]}
								</div>
							)}
							<div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
						</div>

						<div className="flex-1 min-w-0">
							<p className="text-sm font-bold truncate text-slate-700 dark:text-slate-200">
								{user.displayName}
							</p>
							<button
								type="button"
								onClick={logout}
								className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors mt-0.5 font-medium"
							>
								<LogOut size={12} /> 登出
							</button>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);

	return (
		// 外層容器：淺色用 slate-50，深色用 black
		<div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-black text-foreground">
			{/* Mobile Header */}
			<header className="md:hidden h-16 bg-white dark:bg-slate-950 flex items-center px-4 justify-between shrink-0 z-50 shadow-sm/50">
				<div className="flex items-center gap-2 font-serif font-bold text-lg">
					<span className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-sm shadow-sm">
						N
					</span>
					Nous Slate
				</div>

				<Sheet open={open} onOpenChange={setOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon">
							<Menu className="h-5 w-5" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="p-0 w-72 border-none shadow-2xl">
						<SheetTitle className="sr-only">導覽選單</SheetTitle>
						<NavContent />
					</SheetContent>
				</Sheet>
			</header>

			{/* Desktop Sidebar */}
			<aside className="w-64 hidden md:flex flex-col shrink-0 h-full z-50 shadow-xl shadow-slate-200/50 dark:shadow-none">
				<NavContent />
			</aside>

			{/* Main Content */}
			<main className="flex-1 h-full overflow-y-auto dark:bg-slate-950 bg-slate-50/50 w-full relative">
				<Outlet />
			</main>
		</div>
	);
}
