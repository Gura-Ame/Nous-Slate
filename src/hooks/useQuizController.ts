import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { Grade } from "@/lib/srs-algo";
import { CardService } from "@/services/card-service";
import { DeckService } from "@/services/deck-service";
import { PointsService } from "@/services/points-service";
import { ReviewService } from "@/services/review-service";
import { useQuizStore } from "@/store/useQuizStore";
import type { Card } from "@/types/schema";

export function useQuizController() {
	const { t } = useTranslation();
	const { deckId } = useParams();
	const navigate = useNavigate();
	const { user, loading: authLoading } = useAuth();

	const store = useQuizStore();
	const {
		startQuiz,
		submitAnswer,
		nextCard,
		resetQuiz,
		status,
		cards,
		currentIndex,
	} = store;

	const currentCard = cards[currentIndex];
	const [isLoading, setIsLoading] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);
	const [showExitDialog, setShowExitDialog] = useState(false);

	// 1. Initialize data
	useEffect(() => {
		resetQuiz();
		setIsLoading(true);

		const init = async () => {
			try {
				if (!user) return;

				let data: Card[] = [];

				if (deckId === "review") {
					data = await ReviewService.getDueCards(user.uid);
					if (data.length === 0) {
						toast.info(
							t("quiz.controller.no_review_cards", "No cards due for review"),
						);
						navigate("/review");
						return;
					}
				} else if (deckId) {
					// Check points (Optimistic check)
					const profile = await PointsService.getUserProfile(user.uid);
					if ((profile?.points || 0) <= 0) {
						toast.error(
							t(
								"quiz.controller.insufficient_points_reward",
								"Insufficient points",
							),
						);
						navigate("/ad-center");
						return;
					}

					// Load cards
					const [cardData] = await Promise.all([
						CardService.getCardsByDeck(deckId),
						// Update interest tags (Side Effect)
						DeckService.getUserDecks(user.uid)
							.then((decks) => {
								const currentDeck = decks.find((d) => d.id === deckId);
								if (currentDeck?.tags.length) {
									PointsService.updateInterests(user.uid, currentDeck.tags);
								}
							})
							.catch(() => {}),
					]);
					data = cardData;
				}

				if (data.length > 0) {
					startQuiz(data);
				} else {
					toast.error(t("quiz.controller.deck_empty", "Deck is empty"));
					navigate(-1);
				}
			} catch (e) {
				console.error(e);
				toast.error(t("quiz.controller.load_failed", "Failed to load"));
				navigate(-1);
			} finally {
				setIsLoading(false);
			}
		};

		init();
		return () => {
			resetQuiz();
		};
	}, [deckId, user, navigate, resetQuiz, startQuiz, t]);

	// 2. Handle next card (including cost deduction)
	const handleNext = useCallback(async () => {
		if (isProcessing) return;
		setIsProcessing(true);

		if (user) {
			try {
				await PointsService.updatePoints(
					user.uid,
					-0.5,
					"quiz_cost",
					t("quiz.controller.quiz_cost_label", "Quiz Cost"),
				);
			} catch (error) {
				console.error(error);
				toast.error(
					t(
						"quiz.controller.insufficient_points",
						"Insufficient points! Please visit Points Center",
					),
				);
				navigate("/ad-center");
				return;
			}
		}

		nextCard();

		setTimeout(() => {
			setIsProcessing(false);
		}, 300);
	}, [isProcessing, user, navigate, nextCard, t]);

	// 3. Handle answer submission
	const handleAnswer = useCallback(
		async (isCorrect: boolean, grade: Grade = isCorrect ? 5 : 1) => {
			if (isProcessing) return;
			setIsProcessing(true);

			submitAnswer(isCorrect);

			if (user && deckId && currentCard) {
				ReviewService.submitReview(
					user.uid,
					deckId,
					currentCard.id,
					grade,
				).catch(console.error);

				if (!isCorrect) {
					PointsService.updatePoints(
						user.uid,
						-0.2,
						"quiz_penalty",
						t("quiz.controller.quiz_penalty_label", "Wrong Answer Penalty"),
					).catch(() =>
						toast.error(
							t(
								"quiz.controller.penalty_failed",
								"Insufficient points for penalty",
							),
						),
					);
				}
			}

			if (currentCard.type === "flashcard") {
				setTimeout(() => {
					setIsProcessing(false);
					handleNext();
				}, 150);
			} else {
				setIsProcessing(false);
			}
		},
		[isProcessing, user, deckId, currentCard, submitAnswer, handleNext, t],
	);

	// 4. Exit control
	const handleExitClick = () => {
		if (["question", "success", "failure"].includes(status)) {
			setShowExitDialog(true);
		} else {
			navigate("/library");
		}
	};

	const confirmExit = () => {
		setShowExitDialog(false);
		navigate("/library");
	};

	return {
		user,
		authLoading,
		currentCard,
		status,
		cards,
		currentIndex,
		isLoading,
		isProcessing,
		showExitDialog,
		setShowExitDialog,
		handleAnswer,
		handleNext,
		handleExitClick,
		confirmExit,
	};
}
