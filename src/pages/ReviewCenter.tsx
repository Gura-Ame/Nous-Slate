import { BrainCircuit, CheckCircle2, Play } from "lucide-react";
import { useEffect, useState } from "react";
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
        toast.error("讀取複習進度失敗");
      } finally {
        setLoading(false);
      }
    };
    fetchDue();
  }, [user]);

  const handleStartReview = () => {
    if (dueCards.length === 0) return;
    
    // 1. 將卡片載入 Store
    startQuiz(dueCards);
    
    // 2. 跳轉到練習頁面 (使用特殊路由 review)
    navigate("/quiz/review");
  };

  if (loading) return <PageLoading message="正在計算 SRS 排程..." />;

  return (
    <div className="container mx-auto p-8 max-w-3xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          今日複習
        </h2>
        <p className="text-muted-foreground mt-1">
          基於 SM-2 演算法，為您安排最佳的複習內容。
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
                <p className="text-muted-foreground">張卡片需要複習</p>
              </div>

              <Button size="lg" className="w-48 text-lg gap-2" onClick={handleStartReview}>
                <Play className="w-5 h-5 fill-current" />
                開始複習
              </Button>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-24 h-24 text-emerald-500 mb-2" />
              <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                太棒了！
              </h3>
              <p className="text-muted-foreground max-w-sm">
                您已經完成了今天所有的複習進度。
                <br />
                去「探索題庫」學習新知，或是休息一下吧！
              </p>
              <Button variant="outline" onClick={() => navigate("/library")}>
                探索新題庫
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}