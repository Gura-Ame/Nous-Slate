import { useAuth } from "@/hooks/useAuth";
import type { Grade } from "@/lib/srs-algo";
import { CardService } from "@/services/card-service";
import { DeckService } from "@/services/deck-service";
import { PointsService } from "@/services/points-service";
import { ReviewService } from "@/services/review-service";
import { useQuizStore } from "@/store/useQuizStore";
import type { Card } from "@/types/schema";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export function useQuizController() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const store = useQuizStore();
  const { startQuiz, submitAnswer, nextCard, resetQuiz, status, cards, currentIndex } = store;
  
  const currentCard = cards[currentIndex];
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // 1. 初始化資料
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
            toast.info("目前沒有需要複習的卡片");
            navigate("/review");
            return;
          }
        } else if (deckId) {
          // 檢查積分 (前端樂觀檢查)
          const profile = await PointsService.getUserProfile(user.uid);
          if ((profile?.points || 0) <= 0) {
             toast.error("積分不足，請前往領取獎勵");
             navigate("/ad-center");
             return;
          }

          // 載入卡片
          const [cardData] = await Promise.all([
            CardService.getCardsByDeck(deckId),
            // 更新興趣標籤 (Side Effect)
            DeckService.getUserDecks(user.uid).then(decks => {
              const currentDeck = decks.find(d => d.id === deckId);
              if (currentDeck?.tags.length) {
                PointsService.updateInterests(user.uid, currentDeck.tags);
              }
            }).catch(() => {})
          ]);
          data = cardData;
        }

        if (data.length > 0) {
          startQuiz(data);
        } else {
          toast.error("題庫無卡片");
          navigate(-1);
        }
      } catch (e) {
        console.error(e);
        toast.error("載入失敗");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    init();
    return () => { resetQuiz(); };
  }, [deckId, user, navigate, resetQuiz, startQuiz]);

  // 2. 處理下一題 (含扣分)
  const handleNext = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (user) {
      try {
        await PointsService.updatePoints(user.uid, -0.5, "quiz_cost", "練習扣點");
      } catch (e) {
        toast.error("積分不足！請前往積分中心");
        navigate("/ad-center");
        return;
      }
    }

    nextCard();
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 300);
  }, [isProcessing, user, navigate, nextCard]);

  // 3. 處理答案提交
  const handleAnswer = useCallback(async (isCorrect: boolean, grade: Grade = isCorrect ? 5 : 1) => {
    if (isProcessing) return;
    setIsProcessing(true);

    submitAnswer(isCorrect);

    if (user && deckId && currentCard) {
      ReviewService.submitReview(user.uid, deckId, currentCard.id, grade).catch(console.error);
      
      if (!isCorrect) {
        PointsService.updatePoints(user.uid, -0.2, "quiz_penalty", "答錯懲罰")
          .catch(() => toast.error("積分不足扣抵"));
      }
    }

    if (currentCard.type === 'flashcard') {
      setTimeout(() => {
        setIsProcessing(false);
        handleNext(); 
      }, 150);
    } else {
      setIsProcessing(false);
    }
  }, [isProcessing, user, deckId, currentCard, submitAnswer, handleNext]);

  // 4. 退出控制
  const handleExitClick = () => {
    if (['question', 'success', 'failure'].includes(status)) {
      setShowExitDialog(true);
    } else {
      navigate('/library');
    }
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    navigate('/library');
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
    confirmExit
  };
}