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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // 新增 Tabs
import { Textarea } from "@/components/ui/textarea";

// Logic & Services
import { useMoedict } from "@/hooks/useMoedict";
import { parseBopomofoString, parseOneBopomofo } from "@/lib/bopomofo-utils";
import { CardService } from "@/services/card-service";
import type { Card as CardType, CardType as SchemaCardType } from "@/types/schema";

interface FormData {
  type: SchemaCardType; // 新增題型欄位
  stem: string;
  zhuyinRaw: string; 
  definition: string;
  // 新增選擇/填空題專用欄位
  answer: string; 
  option1: string;
  option2: string;
  option3: string;
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
      type: "term", // 預設為國字注音卡
      stem: "",
      zhuyinRaw: "",
      definition: "",
      answer: "",
      option1: "",
      option2: "",
      option3: "",
    }
  });

  // 監聽輸入值以進行預覽
  const watchStem = watch("stem");
  const watchZhuyin = watch("zhuyinRaw");
  const watchType = watch("type");

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
      let content: any = {
        stem: data.stem,
        meaning: data.definition
      };

      // 根據題型組裝資料
      if (data.type === "term") {
        // 1. 國字注音模式
        const bopomofoList = parseBopomofoString(data.zhuyinRaw);
        const chars = data.stem.split("");
        
        // 組合 Blocks
        content.blocks = chars.map((char, index) => ({
          char,
          // 如果注音數量不對，就給空結構防爆
          zhuyin: bopomofoList[index] || parseOneBopomofo("")
        }));
      } else if (data.type === "choice") {
        // 2. 選擇題模式
        content.answer = data.answer;
        content.options = [data.option1, data.option2, data.option3].filter(Boolean); // 過濾空選項
      } else if (data.type === "fill_blank") {
        // 3. 填空題模式
        content.answer = data.answer;
      }

      // 寫入 DB
      await CardService.createCard(deckId, data.type, content);

      toast.success("卡片新增成功");
      
      // 重置表單 (保留目前的題型，方便連續出題)
      reset({ 
        type: data.type,
        stem: "", zhuyinRaw: "", definition: "", 
        answer: "", option1: "", option2: "", option3: "" 
      });
      
      fetchCards(); // 重整列表
      
    } catch (error) {
      toast.error("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  // 監聽 Ctrl+Enter 快速儲存
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleSubmit, onSubmit]);

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
                      <div className="font-bold text-lg">
                        {/* 根據題型顯示不同標題 */}
                        {card.type === 'term' ? card.content.stem : 
                         card.type === 'fill_blank' ? '填空題' : '選擇題'}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {card.type === 'term' 
                          ? (card.content.meaning || "無釋義")
                          : card.content.stem}
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
            
            {/* Preview Section (Only for Term Cards) */}
            {watchType === 'term' && (
              <div className="p-8 border-2 border-dashed rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex flex-wrap gap-4 justify-center min-h-40 items-center">
                 {watchStem ? (
                   watchStem.split("").map((char, index) => {
                     const bopomofos = watchZhuyin.split(" ");
                     const zhuyinStr = bopomofos[index] || "";
                     return (
                       <CharacterBlock 
                         key={index} 
                         char={char} 
                         bopomofo={zhuyinStr} 
                         status="default"
                       />
                     );
                   })
                 ) : (
                   <span className="text-slate-400">輸入下方表單以預覽卡片...</span>
                 )}
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm">
              
              <Tabs 
                defaultValue="term" 
                value={watchType} 
                onValueChange={(val) => setValue("type", val as SchemaCardType)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="term">國字注音</TabsTrigger>
                  <TabsTrigger value="choice">選擇題</TabsTrigger>
                  <TabsTrigger value="fill_blank">填空題</TabsTrigger>
                </TabsList>

                {/* 1. 國字注音模式 */}
                <TabsContent value="term" className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>題目 (國字)</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="例如：銀行" 
                          {...register("stem")}
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
                      <Label>注音 (空白分隔)</Label>
                      <Input 
                        placeholder="ㄧㄣˊ ㄏㄤˊ" 
                        {...register("zhuyinRaw")}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* 2. 選擇題模式 */}
                <TabsContent value="choice" className="space-y-4">
                   <div className="space-y-2">
                     <Label>題目問題</Label>
                     <Input placeholder="例如：下列哪個成語形容聲音很大？" {...register("stem")} />
                   </div>
                   <div className="grid gap-4 sm:grid-cols-2">
                     <div className="space-y-2">
                       <Label className="text-emerald-600 font-bold">正確答案</Label>
                       <Input placeholder="一鳴驚人" {...register("answer")} />
                     </div>
                     <div className="space-y-2">
                       <Label>干擾選項 1</Label>
                       <Input placeholder="鴉雀無聲" {...register("option1")} />
                     </div>
                     <div className="space-y-2">
                       <Label>干擾選項 2</Label>
                       <Input placeholder="對牛彈琴" {...register("option2")} />
                     </div>
                     <div className="space-y-2">
                       <Label>干擾選項 3</Label>
                       <Input placeholder="一竅不通" {...register("option3")} />
                     </div>
                   </div>
                </TabsContent>

                {/* 3. 填空題模式 */}
                <TabsContent value="fill_blank" className="space-y-4">
                   <div className="space-y-2">
                     <Label>題目 (請用底線 ___ 代表空格)</Label>
                     <Input placeholder="例如：一___驚人" {...register("stem")} />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-emerald-600 font-bold">空格答案</Label>
                     <Input placeholder="鳴" {...register("answer")} />
                   </div>
                </TabsContent>

              </Tabs>

              {/* 釋義欄位 (通用) */}
              <div className="space-y-2">
                <Label>釋義 / 筆記</Label>
                <Textarea 
                  className="min-h-[100px]" 
                  placeholder="輸入解釋..." 
                  {...register("definition")}
                />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  儲存卡片 (Ctrl+Enter)
                </Button>
              </div>

            </form>

          </div>
        </main>

      </div>
    </div>
  );
}