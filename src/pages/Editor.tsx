// src/pages/Editor.tsx
import { CreateDeckDialog } from "@/components/editor/CreateDeckDialog";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { DeckService } from "@/services/deck-service";
import type { Deck } from "@/types/schema";
import { BookOpen, MoreVertical, Pen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Editor() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDecks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await DeckService.getUserDecks(user.uid);
      setDecks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, [user]);

  const handleDelete = async (deckId: string) => {
    if (!confirm("確定要刪除這個題庫嗎？裡面的卡片也會無法存取。")) return;
    try {
      await DeckService.deleteDeck(deckId);
      toast.success("刪除成功");
      fetchDecks(); // 重新整理
    } catch (error) {
      toast.error("刪除失敗");
    }
  };

  if (!user) {
    return <div className="p-8">請先登入以管理題庫。</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            創作後台
          </h2>
          <p className="text-muted-foreground">
            管理您的題庫與卡片。
          </p>
        </div>
        <CreateDeckDialog onDeckCreated={fetchDecks} />
      </div>

      {/* Grid List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))
        ) : decks.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 border-2 border-dashed rounded-xl">
            <p>還沒有任何題庫，點擊右上角建立第一個！</p>
          </div>
        ) : (
          decks.map((deck) => (
            <Card key={deck.id} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{deck.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {deck.description || "無描述"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => console.log("Edit Deck Meta")}>
                        <Pen className="mr-2 h-4 w-4" /> 編輯資訊
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(deck.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> 刪除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground flex justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{deck.stats.cardCount} 張卡片</span>
                </div>
                
                <Link to={`/editor/${deck.id}`}>
                    <Button variant="secondary" size="sm">
                        進入編輯
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