import { type HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassPageProps extends Omit<HTMLMotionProps<"div">, "children"> {
	children: React.ReactNode;
}

export function GlassPage({ children, className, ...props }: GlassPageProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
			className={cn(
				"min-h-[100dvh] w-full relative overflow-x-hidden",
				className,
			)}
			{...props}
		>
			{/* Animated Background Blobs */}
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-3xl animate-blob" />
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-3xl animate-blob animation-delay-2000" />
				<div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-pink-400/10 dark:bg-pink-600/10 blur-3xl animate-blob animation-delay-4000" />
			</div>

			{children}
		</motion.div>
	);
}
