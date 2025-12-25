import { X } from "lucide-react";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { Progress } from "@/components/ui/progress";

interface QuizHeaderProps {
	currentIndex: number;
	total: number;
	onExit: () => void;
}

export function QuizHeader({ currentIndex, total, onExit }: QuizHeaderProps) {
	return (
		<header className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shrink-0">
			<GlassButton
				variant="ghost"
				size="icon"
				onClick={onExit}
				aria-label="Exit Quiz"
			>
				<X className="h-5 w-5" />
			</GlassButton>
			<div className="flex-1 max-w-md mx-4">
				<Progress
					value={((currentIndex + 1) / total) * 100}
					className="h-2 bg-slate-200 dark:bg-slate-800"
				/>
			</div>
			<div className="text-sm font-medium text-slate-500">
				{currentIndex + 1} / {total}
			</div>
		</header>
	);
}
