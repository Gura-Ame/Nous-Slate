// src/pages/Editor.tsx
import { CreateDeckDialog } from "@/components/editor/CreateDeckDialog";
import { EditDeckDialog } from "@/components/editor/EditDeckDialog";
import { Badge } from "@/components/ui/badge";
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
import { BookOpen, Globe, Lock as LockIcon, MoreVertical, Pen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Editor() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditClick = (deck: Deck) => {
    setEditingDeck(deck);
    setIsEditOpen(true);
  };

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
                  <div className="space-y-3 w-full pr-2"> {/* 增加 space-y */}

                    {/* Title & Public Badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-xl font-bold">{deck.title}</CardTitle>
                      {deck.isPublic ? (
                        <Badge variant="secondary" className="text-[10px] h-5 bg-sky-100 text-sky-700 hover:bg-sky-100">
                          <Globe className="w-3 h-3 mr-1" /> 公開
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-600 hover:bg-slate-100">
                          <LockIcon className="w-3 h-3 mr-1" /> 私有
                        </Badge>
                      )}
                    </div>

                    {/* Tags Display - 修正高度問題 */}
                    {/* 加入 min-h-[1.5rem] 確保就算沒 tag 也有高度，避免排版跳動 */}
                    <div className="flex gap-1 flex-wrap min-h-6 items-center">
                      {deck.tags && deck.tags.length > 0 ? (
                        deck.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-50 dark:bg-slate-900 text-slate-500">
                            #{tag}
                          </span>
                        ))
                      ) : (
                        // 佔位符，保持高度一致
                        <span className="text-[10px] text-slate-300 italic px-1">
                          無標籤
                        </span>
                      )}
                    </div>

                    <CardDescription className="line-clamp-2 min-h-10"> {/* 增加 min-h 確保兩行高度 */}
                      {deck.description || "無描述"}
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* 修改這裡：點擊觸發 Dialog */}
                      <DropdownMenuItem onClick={() => handleEditClick(deck)}>
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

      <EditDeckDialog
        deck={editingDeck}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={fetchDecks} // 更新後重整列表
      />
    </div>
  );
}