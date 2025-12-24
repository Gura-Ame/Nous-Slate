import { CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // 確保引入 useParams
import { ExitDialog } from "@/components/quiz/session/ExitDialog";
import { QuizArea } from "@/components/quiz/session/QuizArea";
import { QuizFeedback } from "@/components/quiz/session/QuizFeedback";
import { QuizHeader } from "@/components/quiz/session/QuizHeader";
import { PageLoading } from "@/components/shared/PageLoading";
import { Button } from "@/components/ui/button";
import { useQuizController } from "@/hooks/useQuizController";

export default function QuizSession() {
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

	if (authLoading || isLoading) return <PageLoading message="準備練習中..." />;

	if (status === "finished") {
		return (
			<div className="h-screen flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-950 animate-in fade-in zoom-in duration-500">
				<CheckCircle className="w-24 h-24 text-emerald-500 mb-4" />
				<div className="text-4xl text-slate-800 dark:text-slate-100">
					練習完成！
				</div>
				<p className="text-muted-foreground">本次練習：{cards.length} 題</p>
				<div className="flex gap-4">
					<Button variant="outline" onClick={() => navigate("/review")}>
						回到複習中心
					</Button>
					<Button onClick={() => navigate("/library")}>探索新題庫</Button>
				</div>
				<p className="text-xs text-slate-400 mt-8">按 Enter 返回</p>
			</div>
		);
	}

	if (!currentCard) {
		return (
			<div className="h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-slate-950">
				<div className="text-xl font-bold text-slate-700 dark:text-slate-300">
					⚠️ 無法載入題目
				</div>
				<Button onClick={() => navigate(-1)} variant="outline">
					返回
				</Button>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			// 這裡使用 flex-col 讓 Header 與 Main 上下排列
			className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 cursor-default outline-none overflow-hidden"
			// biome-ignore lint/a11y/noNoninteractiveTabindex: 必須聚焦以捕獲全域鍵盤事件 (Enter 換題)
			tabIndex={0}
		>
			{/* Header 高度固定，不會浮動在內容上方 */}
			<div className="shrink-0 z-50 relative">
				<QuizHeader
					currentIndex={currentIndex}
					total={cards.length}
					onExit={handleExitClick}
				/>
			</div>

			{/* 
               Main 區域：
               flex-1: 自動填滿剩餘高度
               overflow-y-auto: 內容過長時，只有這裡會捲動
            */}
			<main className="flex-1 overflow-y-auto w-full relative">
				<div className="min-h-full flex flex-col items-center justify-center p-4 md:p-8 pb-32">
					{/* 中間：題目與作答區 */}
					<QuizArea
						card={currentCard}
						status={status}
						onAnswer={handleAnswer}
					/>

					{/* 底部：結果回饋區 (使用固定定位或放在流式佈局中皆可，這裡放流式佈局下方) */}
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
