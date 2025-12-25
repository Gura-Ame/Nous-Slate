import { type HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
	variant?: "default" | "hover-glow";
	interactive?: boolean;
	children?: React.ReactNode;
}

export function GlassCard({
	className,
	variant = "default",
	interactive = false,
	children,
	...props
}: GlassCardProps) {
	return (
		<motion.div
			whileHover={interactive ? { scale: 1.01, y: -2 } : undefined}
			className={cn(
				// Base Glass Styles
				"relative rounded-3xl border border-white/50 dark:border-white/10",
				"bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl",
				"shadow-sm transition-all duration-300 overflow-hidden",

				// Hover Glow Variant
				variant === "hover-glow" &&
					"hover:shadow-xl hover:shadow-primary/5 hover:border-white/80 dark:hover:border-white/20",

				// Interactive Cursor
				interactive && "cursor-pointer",

				className,
			)}
			{...props}
		>
			{/* Inner Reflection/Highlight (Optional subtle gradient) */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 pointer-events-none" />

			{/* Content */}
			<div className="relative z-10 h-full">{children}</div>
		</motion.div>
	);
}
