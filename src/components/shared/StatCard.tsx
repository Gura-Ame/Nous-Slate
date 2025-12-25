import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { cn } from "@/lib/utils";

interface StatCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	description?: React.ReactNode;
	className?: string;
	iconClassName?: string;
	valueClassName?: string;
}

export function StatCard({
	title,
	value,
	icon: Icon,
	description,
	className,
	iconClassName,
	valueClassName,
}: StatCardProps) {
	return (
		<GlassCard className={cn("p-6", className)} variant="hover-glow">
			<div className="flex flex-row items-center justify-between space-y-0 pb-2">
				<h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
					{title}
				</h3>
				<Icon className={cn("h-5 w-5 opacity-70", iconClassName)} />
			</div>
			<div>
				<div
					className={cn(
						"text-2xl font-bold text-slate-800 dark:text-slate-100",
						valueClassName,
					)}
				>
					{value}
				</div>
				{description && (
					<p className="text-xs text-slate-500 mt-1">{description}</p>
				)}
			</div>
		</GlassCard>
	);
}
