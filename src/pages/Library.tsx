import { BookOpen, Play, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { OwnerInfo } from "@/components/shared/OwnerInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DeckService } from "@/services/deck-service";
import type { Deck } from "@/types/schema";

export default function Library() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadDecks = async () => {
      try {
        const data = await DeckService.getPublicDecks();
        setDecks(data);
        setFilteredDecks(data);
      } catch (error) {
        console.error(error);
        toast.error("無法載入公開題庫");
      } finally {
        setLoading(false);
      }
    };
    loadDecks();
  }, []);

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = decks.filter(deck => 
      deck.title.toLowerCase().includes(lowerTerm) ||
      deck.tags?.some(tag => tag.toLowerCase().includes(lowerTerm))
    );
    setFilteredDecks(filtered);
  }, [searchTerm, decks]);

  return (
    <div className="container mx-auto p-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            探索題庫
          </h2>
          <p className="text-muted-foreground mt-1">
            瀏覽社群分享的教材，加入您的學習計畫。
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋標題或標籤..."
            className="pl-9 bg-white dark:bg-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-xl" />
          ))
        ) : filteredDecks.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">找不到相關題庫</p>
            <p className="text-sm">試著搜尋其他關鍵字。</p>
          </div>
        ) : (
          filteredDecks.map((deck) => (
            <Card key={deck.id} className="flex flex-col h-full hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-col gap-y-4 pb-4">
                <div className="flex justify-between items-start gap-4">
                  {/* ▼▼▼ 1. 標題加大 (text-2xl) ▼▼▼ */}
                  <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {deck.title}
                  </CardTitle>
                  
                  {deck.stats?.stars > 0 && (
                    <div className="flex items-center text-amber-500 text-xs font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full shrink-0">
                      <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                      {deck.stats.stars}
                    </div>
                  )}
                </div>

                {/* ▼▼▼ 2. 標籤加大 (text-xs) 並調整間距 ▼▼▼ */}
                <div className="flex flex-wrap gap-2">
                  {deck.tags && deck.tags.length > 0 ? (
                    deck.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 font-normal bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200">
                        #{tag}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 font-normal text-muted-foreground border-dashed">
                      未分類
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1">
                {/* 調整行高與顏色 */}
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {deck.description || "這個題庫沒有描述。"}
                </p>
              </CardContent>

              <CardFooter className="pt-4 px-6 border-t bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
                <div className="flex items-center text-muted-foreground scale-90 origin-left">
                  <OwnerInfo userId={deck.ownerId} showAvatar={true} />
                </div>
                
                {/* ▼▼▼ 3. 按鈕加大並強調 ▼▼▼ */}
                <Link to={`/quiz/${deck.id}`}>
                    <Button size="default" className="gap-2 shadow-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-5">
                        <Play className="h-4 w-4 fill-current" />
                        開始練習
                    </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}