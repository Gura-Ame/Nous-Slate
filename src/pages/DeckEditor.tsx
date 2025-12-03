import { ArrowLeft, Loader2, Save, Trash2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

// Components
import { CharacterBlock } from "@/components/quiz/CharacterBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

// Logic & Services
import { useMoedict } from "@/hooks/useMoedict";
import { parseBopomofoString, parseOneBopomofo } from "@/lib/bopomofo-utils";
import { CardService } from "@/services/card-service";
import type { Card as CardType } from "@/types/schema";

interface FormData {
  stem: string;
  zhuyinRaw: string; // 使用者輸入的原始注音字串 (e.g. "ㄧㄣˊ ㄏㄤˊ")
  definition: string;
}

export default function DeckEditor() {
  const { deckId } = useParams<{ deckId: string }>();
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Moedict Hook
  const { search: searchMoedict, loading: moedictLoading } = useMoedict();

  // Form Setup
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      stem: "",
      zhuyinRaw: "",
      definition: ""
    }
  });

  // 監聽輸入值以進行預覽
  const watchStem = watch("stem");
  const watchZhuyin = watch("zhuyinRaw");

  // 初始化：載入卡片列表
  const fetchCards = async () => {
    if (!deckId) return;
    try {
      const data = await CardService.getCardsByDeck(deckId);
      setCards(data);
    } catch (error) {
      toast.error("無法載入卡片列表");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [deckId]);

  // 自動填入功能 (Magic Button)
  const handleAutoFill = async () => {
    const stem = watchStem;
    if (!stem) return toast.error("請先輸入題目 (國字)");

    const result = await searchMoedict(stem);
    if (result) {
      setValue("zhuyinRaw", result.bopomofo);
      // 簡單清洗解釋 (移除 HTML 標籤)
      setValue("definition", result.definition.replace(/<[^>]*>?/gm, ''));
      toast.success("已自動填入注音與釋義");
    } else {
      toast.error("萌典查無此詞，請手動輸入");
    }
  };

  // 提交表單 (新增卡片)
  const onSubmit = async (data: FormData) => {
    if (!deckId) return;
    setSaving(true);
    
    try {
      // 1. 解析注音字串為結構化 Data
      // 如果是一整句 "ㄧㄣˊ ㄏㄤˊ"，我們依賴空白分割
      // 如果國字是 "銀行" (2字)，注音也應該有 2 組
      const bopomofoList = parseBopomofoString(data.zhuyinRaw);
      const chars = data.stem.split("");

      // 2. 組合 Blocks
      const blocks = chars.map((char, index) => ({
        char,
        // 如果注音數量不對 (例如萌典缺字)，就給空結構防爆
        zhuyin: bopomofoList[index] || parseOneBopomofo("")
      }));

      // 3. 寫入 DB
      await CardService.createCard(deckId, "term", {
        stem: data.stem,
        blocks: blocks,
        meaning: data.definition
      });

      toast.success("卡片新增成功");
      reset(); // 清空表單
      fetchCards(); // 重整列表
      
    } catch (error) {
      toast.error("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        // 觸發 React Hook Form 的提交
        handleSubmit(onSubmit)();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleSubmit, onSubmit]); // 依賴項

  // 刪除卡片
  const handleDelete = async (cardId: string) => {
    if(!confirm("確定刪除？")) return;
    await CardService.deleteCard(cardId);
    toast.success("已刪除");
    fetchCards();
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      
      {/* Top Bar */}
      <header className="h-14 border-b bg-white dark:bg-slate-900 flex items-center px-4 justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link to="/editor">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">編輯題庫</h1>
        </div>
        <div className="text-sm text-slate-500">
           {cards.length} 張卡片
        </div>
      </header>

      {/* Main Layout: Two Columns */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Card List */}
        <aside className="w-80 border-r bg-white dark:bg-slate-900 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {loading ? (
                 Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : cards.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">暫無卡片</div>
              ) : (
                cards.map(card => (
                  <div key={card.id} className="group flex items-center justify-between p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
                    <div>
                      <div className="font-bold text-lg">{card.content.stem}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {card.content.meaning || "無釋義"}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-red-500"
                      onClick={() => handleDelete(card.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Right: Editor Area */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          
          <div className="w-full max-w-2xl space-y-8">
            
            {/* Preview Section */}
            <div className="p-8 border-2 border-dashed rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex flex-wrap gap-4 justify-center min-h-40 items-center">
               {watchStem ? (
                 watchStem.split("").map((char, index) => {
                   // 簡單的預覽解析邏輯
                   const bopomofos = watchZhuyin.split(" ");
                   const zhuyinStr = bopomofos[index] || "";
                   return (
                     <CharacterBlock 
                       key={index} 
                       char={char} 
                       bopomofo={zhuyinStr} // CharacterBlock 支援純字串輸入，剛好用於預覽
                       status="default"
                     />
                   );
                 })
               ) : (
                 <span className="text-slate-400">輸入下方表單以預覽卡片...</span>
               )}
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm">
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>題目 (國字)</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="例如：銀行" 
                      {...register("stem", { required: true })}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={handleAutoFill}
                      disabled={moedictLoading}
                      title="自動查詢萌典"
                    >
                      {moedictLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>注音 (以空白分隔)</Label>
                  <Input 
                    placeholder="ㄧㄣˊ ㄏㄤˊ" 
                    {...register("zhuyinRaw", { required: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    若有多個字，請用空白鍵隔開。
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>釋義 / 筆記</Label>
                <Textarea 
                  className="min-h-[100px]" 
                  placeholder="輸入解釋..." 
                  {...register("definition")}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  儲存卡片
                </Button>
              </div>

            </form>

          </div>
        </main>

      </div>
    </div>
  );
}