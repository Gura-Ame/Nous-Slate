import { BookOpen, Play, Search, Star, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DeckService } from "@/services/deck-service";
import type { Deck } from "@/types/schema";
import { Link } from "react-router-dom";

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
        // 注意：這裡可能會遇到 Index Error，稍後說明
        console.error(error);
        toast.error("無法載入公開題庫，請稍後再試");
      } finally {
        setLoading(false);
      }
    };
    loadDecks();
  }, []);

  // 前端搜尋過濾 (因為 Firestore 免費版沒有全文檢索)
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
          <h2 className="text-3xl font-bold tracking-tight font-serif text-slate-900 dark:text-slate-100">
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
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
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
              <CardHeader className="space-y-1">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2 w-fit">
                    {deck.tags?.[0] || "一般"}
                  </Badge>
                  {deck.stats?.stars > 0 && (
                    <div className="flex items-center text-amber-500 text-xs font-medium">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {deck.stats.stars}
                    </div>
                  )}
                </div>
                <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors">
                  {deck.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {deck.description || "這個題庫沒有描述。"}
                </p>
              </CardContent>

              <CardFooter className="pt-4 border-t bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-sm">
                <div className="flex items-center text-muted-foreground">
                  <UserIcon className="h-3 w-3 mr-2" />
                  <span className="max-w-[100px] truncate">
                    {/* 這裡暫時顯示 Owner ID，理想情況要再 fetch User Profile */}
                    User...{deck.ownerId.slice(-4)}
                  </span>
                </div>
                
                <Link to={`/quiz/${deck.id}`}>
                    <Button size="sm" className="gap-2">
                        <Play className="h-3 w-3" />
                        練習
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