import { type HTMLMotionProps, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
	variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
	size?: "sm" | "md" | "lg" | "icon";
	isLoading?: boolean;
	children?: React.ReactNode;
}

export const GlassButton = React.forwardRef<
	HTMLButtonElement,
	GlassButtonProps
>(
	(
		{
			className,
			variant = "primary",
			size = "md",
			isLoading,
			children,
			disabled,
			...props
		},
		ref,
	) => {
		// Ref for the button to calculate mouse position
		const localRef = React.useRef<HTMLButtonElement>(null);
		// Combine refs
		React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

		const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
			if (!localRef.current) return;
			const rect = localRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			localRef.current.style.setProperty("--x", `${x}px`);
			localRef.current.style.setProperty("--y", `${y}px`);
		};

		const variants = {
			primary:
				"bg-primary/90 text-primary-foreground hover:bg-primary/80 shadow-[0_0_15px_rgba(var(--primary),0.3)] border-transparent",
			secondary:
				"bg-secondary/80 text-secondary-foreground hover:bg-secondary/60 backdrop-blur-md border-white/20 dark:border-white/10",
			ghost:
				"hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-transparent",
			danger:
				"bg-red-500/90 text-white hover:bg-red-600/90 shadow-[0_0_15px_rgba(239,68,68,0.3)] border-transparent",
			outline:
				"border-slate-200 dark:border-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200",
		};

		const sizes = {
			sm: "h-8 px-3 text-xs rounded-lg",
			md: "h-10 px-4 py-2 rounded-xl",
			lg: "h-12 px-8 text-lg rounded-2xl",
			icon: "h-10 w-10 p-0 rounded-xl flex items-center justify-center",
		};

		return (
			<motion.button
				ref={localRef}
				whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
				whileTap={{ scale: disabled || isLoading ? 1 : 0.96 }}
				disabled={disabled || isLoading}
				onMouseMove={handleMouseMove}
				className={cn(
					"relative inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border overflow-hidden group",
					variants[variant],
					sizes[size],
					className,
				)}
				{...props}
			>
				{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				{children}

				{/* Mouse Tracking Shine Effect */}
				{!disabled && !isLoading && (
					<div
						className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
						style={{
							background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.2) 0%, transparent 50%)`,
						}}
					/>
				)}

				{/* Shimmer Effect on Primary Buttons */}
				{variant === "primary" && !disabled && !isLoading && (
					<div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
				)}
			</motion.button>
		);
	},
);

GlassButton.displayName = "GlassButton";
