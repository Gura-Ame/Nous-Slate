import { cn } from "@/lib/utils";

interface PageHeaderProps {
	title: string;
	description?: string;
	children?: React.ReactNode; // 用於放置右側按鈕 (如：新增、搜尋框)
	className?: string;
}

export function PageHeader({
	title,
	description,
	children,
	className,
}: PageHeaderProps) {
	return (
		<div
			className={cn(
				"flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-2 md:space-y-0",
				className,
			)}
		>
			<div className="space-y-1">
				<h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
					{title}
				</h2>
				{description && <p className="text-muted-foreground">{description}</p>}
			</div>

			{/* 右側操作區 (自動對齊) */}
			{children && (
				<div className="flex items-center gap-2 w-full md:w-auto">
					{children}
				</div>
			)}
		</div>
	);
}
