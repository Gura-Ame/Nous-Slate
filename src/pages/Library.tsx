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
        toast.error("無法載入公開題庫，請稍後再試");
      } finally {
        setLoading(false);
      }
    };
    loadDecks();
  }, []);

  // 前端搜尋過濾
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
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            探索題庫
          </h2>
          <p className="text-muted-foreground">
            瀏覽社群分享的教材，加入您的學習計畫。
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋標題或標籤..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[220px] w-full rounded-xl" />
          ))
        ) : filteredDecks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
            <BookOpen className="h-10 w-10 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">找不到相關題庫</p>
            <p className="text-sm">試著搜尋其他關鍵字，或是自己建立一個！</p>
          </div>
        ) : (
          filteredDecks.map((deck) => (
            <Card key={deck.id} className="flex flex-col hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group">
              <CardHeader className="space-y-3 pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                    {deck.title}
                  </CardTitle>
                  
                  {deck.stats?.stars > 0 && (
                    <div className="flex items-center text-amber-500 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {deck.stats.stars}
                    </div>
                  )}
                </div>

                {/* 
                   Tag List 
                   顯示所有標籤，使用 flex-wrap 避免溢出
                */}
                <div className="flex flex-wrap gap-1.5 h-6 overflow-hidden">
                  {deck.tags && deck.tags.length > 0 ? (
                    deck.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                        #{tag}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground border-dashed">
                      未分類
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3 min-h-12">
                  {deck.description || "這個題庫沒有描述。"}
                </p>
              </CardContent>

              <CardFooter className="pt-4 border-t bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-sm">
                <OwnerInfo userId={deck.ownerId} />
                
                {/* 練習按鈕 */}
                <Link to={`/quiz/${deck.id}`}>
                    <Button size="sm" className="gap-2 shadow-sm">
                        <Play className="h-3 w-3 fill-current" />
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