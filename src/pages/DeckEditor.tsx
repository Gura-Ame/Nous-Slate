import { ArrowLeft, Loader2, Save, Trash2, Volume2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

// Components
import { ImportJsonDialog } from "@/components/editor/ImportJsonDialog"; // 記得確認路徑
import { CharacterBlock } from "@/components/quiz/CharacterBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Logic & Services
import { useDictionary } from "@/hooks/useDictionary"; // 新增
import { useMoedict } from "@/hooks/useMoedict";
import { parseBopomofoString, parseOneBopomofo } from "@/lib/bopomofo-utils";
import { CardService } from "@/services/card-service";
import type { Card as CardType, CardType as SchemaCardType } from "@/types/schema";

interface FormData {
  type: SchemaCardType;
  stem: string;
  zhuyinRaw: string;
  definition: string;
  audioUrl: string; // 新增：音檔連結
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
  
  // Hooks
  const { search: searchMoedict, loading: moedictLoading } = useMoedict();
  const { search: searchDict, loading: dictLoading } = useDictionary(); // 字典 Hook

  // Form Setup
  const { register, handleSubmit, watch, setValue, reset } = useForm<FormData>({
    defaultValues: {
      type: "term",
      stem: "",
      zhuyinRaw: "",
      definition: "",
      audioUrl: "",
      answer: "",
      option1: "",
      option2: "",
      option3: "",
    }
  });

  // Watchers for Preview
  const watchStem = watch("stem");
  const watchZhuyin = watch("zhuyinRaw");
  const watchType = watch("type");
  const watchAudio = watch("audioUrl");

  // Load Cards
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

  // Handler: 國語萌典查詢
  const handleAutoFillMoedict = async () => {
    const stem = watchStem;
    if (!stem) return toast.error("請先輸入題目 (國字)");

    const result = await searchMoedict(stem);
    if (result) {
      setValue("zhuyinRaw", result.bopomofo);
      setValue("definition", result.definition.replace(/<[^>]*>?/gm, ''));
      toast.success("已填入萌典資料");
    } else {
      toast.error("萌典查無此詞");
    }
  };

  // Handler: 英語字典查詢
  const handleAutoFillDict = async () => {
    const stem = watchStem;
    if (!stem) return toast.error("請先輸入單字");

    const result = await searchDict(stem);
    if (result) {
      // 組合解釋：音標 + 定義 + 例句
      const combinedDef = ` [${result.phonetic}]\n${result.definition}`;
      setValue("definition", combinedDef);
      
      if (result.audio) {
        setValue("audioUrl", result.audio);
        toast.success("已填入解釋與發音");
      } else {
        toast.success("已填入解釋 (無發音檔)");
      }
    }
  };

  // Handler: 播放音檔預覽
  const playAudioPreview = () => {
    if (watchAudio) {
      new Audio(watchAudio).play();
    }
  };

  // Submit Logic
  const onSubmit = async (data: FormData) => {
    if (!deckId) return;
    setSaving(true);
    
    try {
      let content: any = {
        stem: data.stem,
        meaning: data.definition,
        audioUrl: data.audioUrl || undefined // 存入音檔
      };

      if (data.type === "term") {
        const bopomofoList = parseBopomofoString(data.zhuyinRaw);
        const chars = data.stem.split("");
        content.blocks = chars.map((char, index) => ({
          char,
          zhuyin: bopomofoList[index] || parseOneBopomofo("")
        }));
      } else if (data.type === "choice") {
        content.answer = data.answer;
        content.options = [data.option1, data.option2, data.option3].filter(Boolean);
      } else if (data.type === "fill_blank") {
        content.answer = data.answer;
      } else if (data.type === "flashcard") {
        // Flashcard 不需要額外處理，直接存 stem, meaning, audioUrl 即可
      }

      await CardService.createCard(deckId, data.type, content);

      toast.success("卡片新增成功");
      // 保留題型設定
      reset({ 
        type: data.type, 
        stem: "", zhuyinRaw: "", definition: "", audioUrl: "", 
        answer: "", option1: "", option2: "", option3: "" 
      });
      fetchCards();
      
    } catch (error) {
      toast.error("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  // Keyboard Shortcut
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
        
        <div className="flex items-center gap-2">
           {/* JSON Import Button */}
           {deckId && (
             <ImportJsonDialog 
               deckId={deckId} 
               onSuccess={fetchCards} 
             />
           )}
           <div className="text-sm text-slate-500 ml-2">
             {cards.length} 張卡片
           </div>
        </div>
      </header>

      {/* Main Layout */}
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
                    <div className="overflow-hidden">
                      <div className="font-bold text-lg truncate pr-2">
                        {card.content.stem}
                      </div>
                      <div className="text-xs text-muted-foreground truncate flex gap-2">
                        <span className="uppercase text-[10px] border px-1 rounded bg-white dark:bg-slate-900">
                          {card.type === 'term' ? '國' : 
                           card.type === 'choice' ? '選' : 
                           card.type === 'fill_blank' ? '填' : '英'}
                        </span>
                        <span className="truncate max-w-[140px]">{card.content.meaning || "無釋義"}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-red-500 shrink-0"
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
            
            {/* Flashcard Preview */}
            {watchType === 'flashcard' && (
              <div className="p-8 border-2 border-dashed rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex flex-col items-center justify-center min-h-40 gap-4 text-center">
                 <h2 className="text-4xl font-bold">{watchStem || "Vocabulary"}</h2>
                 {watchAudio && (
                   <Button variant="secondary" size="sm" onClick={playAudioPreview} className="gap-2">
                     <Volume2 className="h-4 w-4" /> 試聽發音
                   </Button>
                 )}
                 <p className="text-sm text-muted-foreground line-clamp-3 max-w-md whitespace-pre-wrap">
                   {watch("definition") || "Definitions will appear here..."}
                 </p>
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
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="term">國字注音</TabsTrigger>
                  <TabsTrigger value="choice">選擇題</TabsTrigger>
                  <TabsTrigger value="fill_blank">填空題</TabsTrigger>
                  {/* ▼▼▼ 新增這個 Tab ▼▼▼ */}
                  <TabsTrigger value="flashcard">單字卡</TabsTrigger>
                </TabsList>

                {/* 1. 國字注音 */}
                <TabsContent value="term" className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>題目 (國字)</Label>
                      <div className="flex gap-2">
                        <Input placeholder="例如：銀行" {...register("stem")} />
                        <Button type="button" onClick={handleAutoFillMoedict} variant="outline" size="icon" disabled={moedictLoading}>
                          {moedictLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>注音 (空白分隔)</Label>
                      <Input placeholder="ㄧㄣˊ ㄏㄤˊ" {...register("zhuyinRaw")} />
                    </div>
                  </div>
                </TabsContent>

                {/* 2. 選擇題 */}
                <TabsContent value="choice" className="space-y-4">
                   <div className="space-y-2">
                     <Label>題目問題</Label>
                     <Input placeholder="問題描述..." {...register("stem")} />
                   </div>
                   <div className="grid gap-4 sm:grid-cols-2">
                     <div className="space-y-2">
                       <Label className="text-emerald-600 font-bold">正確答案</Label>
                       <Input {...register("answer")} />
                     </div>
                     <div className="space-y-2"><Label>選項 1</Label><Input {...register("option1")} /></div>
                     <div className="space-y-2"><Label>選項 2</Label><Input {...register("option2")} /></div>
                     <div className="space-y-2"><Label>選項 3</Label><Input {...register("option3")} /></div>
                   </div>
                </TabsContent>

                {/* 3. 填空題 */}
                <TabsContent value="fill_blank" className="space-y-4">
                   <div className="space-y-2">
                     <Label>題目 (用 ___ 代表空格)</Label>
                     <Input placeholder="Example: Apple is ___." {...register("stem")} />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-emerald-600 font-bold">答案</Label>
                     <Input placeholder="red" {...register("answer")} />
                   </div>
                </TabsContent>

                {/* 4. 單字卡 (Flashcard) */}
                <TabsContent value="flashcard" className="space-y-4">
                   <div className="grid gap-4 sm:grid-cols-2">
                     <div className="space-y-2">
                       <Label>英文單字</Label>
                       <div className="flex gap-2">
                         <Input placeholder="e.g. Epiphany" {...register("stem")} />
                         <Button type="button" onClick={handleAutoFillDict} variant="outline" size="icon" disabled={dictLoading}>
                           {dictLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                         </Button>
                       </div>
                     </div>
                     <div className="space-y-2">
                        <Label>發音連結 (Audio URL)</Label>
                        <Input placeholder="https://..." {...register("audioUrl")} />
                     </div>
                   </div>
                </TabsContent>

              </Tabs>

              {/* 釋義欄位 (通用) */}
              <div className="space-y-2 mt-4">
                <Label>釋義 / 筆記 / 解析</Label>
                <Textarea 
                  className="min-h-[120px] font-mono text-sm" 
                  placeholder="輸入詳細解釋..." 
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