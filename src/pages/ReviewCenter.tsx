import { BrainCircuit, CheckCircle2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PageLoading } from "@/components/shared/PageLoading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ReviewService } from "@/services/review-service";
import { useQuizStore } from "@/store/useQuizStore";
import type { Card as CardType } from "@/types/schema";

export default function ReviewCenter() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const navigate = useNavigate();
	const { startQuiz } = useQuizStore();

	const [dueCards, setDueCards] = useState<CardType[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!user) return;
		const fetchDue = async () => {
			try {
				const cards = await ReviewService.getDueCards(user.uid);
				setDueCards(cards);
			} catch (error) {
				console.error(error);
				toast.error(t("review_center.error", "Failed to load review progress"));
			} finally {
				setLoading(false);
			}
		};
		fetchDue();
	}, [user, t]);

	const handleStartReview = () => {
		if (dueCards.length === 0) return;

		// 1. Load cards into store
		startQuiz(dueCards);

		// 2. Navigate to quiz page (using review route)
		navigate("/quiz/review");
	};

	if (loading)
		return (
			<PageLoading
				message={t("review_center.loading", "Calculating SRS schedule...")}
			/>
		);

	return (
		<div className="container mx-auto p-8 max-w-3xl space-y-8">
			<div>
				<h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
					{t("review_center.title", "Today's Review")}
				</h2>
				<p className="text-muted-foreground mt-1">
					{t(
						"review_center.subtitle",
						"Optimized review schedule based on SM-2 algorithm.",
					)}
				</p>
			</div>

			<Card className="border-2 border-primary/20 bg-primary/5">
				<CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-6">
					{dueCards.length > 0 ? (
						<>
							<div className="relative">
								<div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
								<BrainCircuit className="w-24 h-24 text-primary relative z-10" />
							</div>

							<div className="space-y-2">
								<h3 className="text-4xl font-bold">{dueCards.length}</h3>
								<p className="text-muted-foreground">
									{t("review_center.cards_due", "cards need review")}
								</p>
							</div>

							<Button
								size="lg"
								className="w-48 text-lg gap-2"
								onClick={handleStartReview}
							>
								<Play className="w-5 h-5 fill-current" />
								{t("review_center.start_review", "Start Review")}
							</Button>
						</>
					) : (
						<>
							<CheckCircle2 className="w-24 h-24 text-emerald-500 mb-2" />
							<h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200">
								{t("review_center.all_done_title", "Awesome!")}
							</h3>
							<p className="text-muted-foreground max-w-sm">
								{t(
									"review_center.all_done_desc",
									"You've completed all review tasks for today.",
								)}
								<br />
								{t(
									"review_center.all_done_hint",
									"Explore new decks or take a break!",
								)}
							</p>
							<Button variant="outline" onClick={() => navigate("/library")}>
								{t("review_center.explore_decks", "Explore Decks")}
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
