import { CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ExitDialog } from "@/components/quiz/session/ExitDialog";
import { QuizArea } from "@/components/quiz/session/QuizArea";
import { QuizFeedback } from "@/components/quiz/session/QuizFeedback";
import { QuizHeader } from "@/components/quiz/session/QuizHeader";
import { PageLoading } from "@/components/shared/PageLoading";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { useQuizController } from "@/hooks/useQuizController";

export default function QuizSession() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const containerRef = useRef<HTMLDivElement>(null);

	const {
		authLoading,
		isLoading,
		isProcessing,
		status,
		cards,
		currentIndex,
		currentCard,
		showExitDialog,
		setShowExitDialog,
		handleAnswer,
		handleNext,
		handleExitClick,
		confirmExit,
	} = useQuizController();

	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if ((status === "success" || status === "failure") && e.key === "Enter") {
				e.preventDefault();
				handleNext();
			}
			if (status === "finished" && e.key === "Enter") {
				e.preventDefault();
				navigate("/library");
			}
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [status, handleNext, navigate]);

	if (authLoading || isLoading)
		return (
			<PageLoading message={t("quiz.preparing", "Preparing session...")} />
		);

	if (status === "finished") {
		return (
			<div className="h-screen flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-950 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
				{/* Success Background Blobs */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />

				<CheckCircle className="w-24 h-24 text-emerald-500 mb-4 drop-shadow-lg" />
				<div className="text-4xl text-slate-800 dark:text-slate-100 font-bold">
					{t("quiz.finished", "Session Completed!")}
				</div>
				<p className="text-muted-foreground text-lg">
					{t("quiz.session_stats", { count: cards.length })}
				</p>
				<div className="flex gap-4">
					<GlassButton variant="outline" onClick={() => navigate("/review")}>
						{t("quiz.back_to_review", "Back to Review")}
					</GlassButton>
					<GlassButton onClick={() => navigate("/library")}>
						{t("quiz.explore_new", "Explore New Decks")}
					</GlassButton>
				</div>
				<p className="text-xs text-slate-400 mt-8 animate-pulse">
					{t("quiz.return_hint", "Press Enter to return")}
				</p>
			</div>
		);
	}

	if (!currentCard) {
		return (
			<div className="h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-slate-950">
				<div className="text-xl font-bold text-slate-700 dark:text-slate-300">
					{t("quiz.error_loading", "Unable to load cards")}
				</div>
				<GlassButton onClick={() => navigate(-1)} variant="outline">
					{t("common.back", "Back")}
				</GlassButton>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			// Use flex-col to stack Header and Main vertically
			className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 cursor-default outline-none overflow-hidden relative"
			// biome-ignore lint/a11y/noNoninteractiveTabindex: Must focus to capture global keyboard events (Enter for next question)
			tabIndex={0}
		>
			{/* Ambient Background */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
				<div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-400/5 dark:bg-blue-600/5 rounded-full blur-3xl animate-blob" />
				<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/5 dark:bg-purple-600/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
			</div>

			{/* Header fixed height, won't float over content */}
			<div className="shrink-0 z-50 relative">
				<QuizHeader
					currentIndex={currentIndex}
					total={cards.length}
					onExit={handleExitClick}
				/>
			</div>

			{/* 
               Main area:
               flex-1: Automatically fills remaining height
               overflow-y-auto: Only this area scrolls if content is too long
            */}
			<main className="flex-1 overflow-y-auto w-full relative z-10">
				<div className="min-h-full flex flex-col items-center justify-center p-4 md:p-8 pb-32">
					{/* Center: Question and Input area */}
					<QuizArea
						card={currentCard}
						status={status}
						onAnswer={handleAnswer}
					/>

					{/* Bottom: Feedback area (can be fixed or fluid, here it's fluid) */}
					<div className="w-full flex justify-center mt-8 min-h-16">
						<QuizFeedback
							status={status}
							card={currentCard}
							isProcessing={isProcessing}
							onNext={handleNext}
						/>
					</div>
				</div>
			</main>

			<ExitDialog
				open={showExitDialog}
				onOpenChange={setShowExitDialog}
				onConfirm={confirmExit}
			/>
		</div>
	);
}
