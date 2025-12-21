import { Eye, EyeOff, Loader2, Save, Wand2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CardType } from "@/types/schema";
import { ImageUploader } from "./ImageUploader";
import { SmartPasteDialog } from "./SmartPasteDialog";

export interface DeckEditorFormData {
	type: CardType;
	stem: string;
	zhuyinRaw: string;
	definition: string;
	audioUrl: string;
	answer: string;
	option1: string; // A
	option2: string; // B
	option3: string; // C
	option4: string; // D
	image: string;
	maskedIndices?: number[];
}

interface CardFormProps {
	form: UseFormReturn<DeckEditorFormData>;
	saving: boolean;
	moedictLoading: boolean;
	dictLoading: boolean;
	isEditing: boolean;
	onSubmit: (data: DeckEditorFormData) => void;
	onCancel: () => void;
	onAutoFillMoedict: () => void;
	onAutoFillDict: () => void;
}

export function CardForm({
	form,
	saving,
	moedictLoading,
	dictLoading,
	isEditing,
	onSubmit,
	onCancel,
	onAutoFillMoedict,
	onAutoFillDict,
}: CardFormProps) {
	const { register, handleSubmit, setValue, watch } = form;
	const currentType = watch("type");
	const stem = watch("stem");
	const imageUrl = watch("image");

	// --- 1. 聽寫/默寫：挖空邏輯 ---
	const maskedIndices = watch("maskedIndices") || [];
	const toggleMask = (index: number) => {
		let newIndices: number[];
		if (maskedIndices.includes(index)) {
			newIndices = maskedIndices.filter((i) => i !== index);
		} else {
			newIndices = [...maskedIndices, index].sort((a, b) => a - b);
		}
		setValue("maskedIndices", newIndices, { shouldDirty: true });
	};

	// --- 2. 選擇題：正確答案設定邏輯 ---
	const currentAnswer = watch("answer");
	const opt1 = watch("option1");
	const opt2 = watch("option2");
	const opt3 = watch("option3");
	const opt4 = watch("option4");

	const setCorrectOption = (optIndex: number) => {
		const fieldName = `option${optIndex}` as keyof DeckEditorFormData;
		const val = watch(fieldName);

		// ▼▼▼ 修正 1：嚴格檢查型別與空值，解決 TS 錯誤 ▼▼▼
		if (typeof val !== "string" || !val) {
			return toast.error("請先輸入選項內容");
		}

		setValue("answer", val, { shouldDirty: true });
		toast.success(`已設定 (${["A", "B", "C", "D"][optIndex - 1]}) 為正確答案`);
	};

	// 判斷哪個是正確答案 (用於 UI 顯示)
	const getCorrectIndex = () => {
		if (currentAnswer === opt1 && opt1) return 1;
		if (currentAnswer === opt2 && opt2) return 2;
		if (currentAnswer === opt3 && opt3) return 3;
		if (currentAnswer === opt4 && opt4) return 4;
		return 0; // 未選
	};
	const correctIndex = getCorrectIndex();

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm"
		>
			<Tabs
				defaultValue="term"
				value={currentType}
				onValueChange={(val) => setValue("type", val as CardType)}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-5 mb-6">
					<TabsTrigger value="term">國字注音</TabsTrigger>
					<TabsTrigger value="dictation">聽寫/默寫</TabsTrigger>
					<TabsTrigger value="choice">選擇題</TabsTrigger>
					<TabsTrigger value="fill_blank">填空題</TabsTrigger>
					<TabsTrigger value="flashcard">單字卡</TabsTrigger>
				</TabsList>

				{/* 1. 國字注音 Content */}
				<TabsContent value="term" className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>題目 (國字)</Label>
							<div className="flex gap-2">
								<Input placeholder="例如：銀行" {...register("stem")} />
								<Button
									type="button"
									onClick={onAutoFillMoedict}
									variant="outline"
									size="icon"
									disabled={moedictLoading}
								>
									{moedictLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Wand2 className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
						<div className="space-y-2">
							<Label>注音 (空白分隔)</Label>
							<Input placeholder="ㄧㄣˊ ㄏㄤˊ" {...register("zhuyinRaw")} />
						</div>
					</div>
				</TabsContent>

				{/* 2. 聽寫/默寫 Content */}
				<TabsContent value="dictation" className="space-y-4">
					<div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-md mb-4">
						💡 提示：點擊下方的方塊可切換 <b>顯示/挖空</b>
						。被挖空的字才需要輸入。
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>題目 (國字)</Label>
							<div className="flex gap-2">
								<Input placeholder="例如：銀行" {...register("stem")} />
								<Button
									type="button"
									onClick={onAutoFillMoedict}
									variant="outline"
									size="icon"
									disabled={moedictLoading}
								>
									{moedictLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Wand2 className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
						<div className="space-y-2">
							<Label>注音 (空白分隔)</Label>
							<Input placeholder="ㄧㄣˊ ㄏㄤˊ" {...register("zhuyinRaw")} />
						</div>
					</div>

					{/* 挖空選擇器 */}
					{stem && (
						<div className="space-y-2 pt-2">
							<Label>挖空設定 (點擊切換)</Label>
							<div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
								{stem.split("").map((char, index) => {
									const isMasked = maskedIndices.includes(index);
									return (
										<button
											// biome-ignore lint/suspicious/noArrayIndexKey: 靜態索引安全
											key={`${char}-${index}`}
											type="button"
											onClick={() => toggleMask(index)}
											className={cn(
												"w-12 h-12 flex flex-col items-center justify-center border rounded-md transition-all",
												isMasked
													? "bg-slate-800 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900"
													: "bg-white text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500",
											)}
										>
											<span className="text-lg font-serif leading-none mb-1">
												{char}
											</span>
											{isMasked ? (
												<EyeOff className="size-3" />
											) : (
												<Eye className="size-3" />
											)}
										</button>
									);
								})}
							</div>
							<div className="flex gap-2 justify-end">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="text-xs h-6"
									onClick={() =>
										setValue(
											"maskedIndices",
											stem.split("").map((_, i) => i),
											{ shouldDirty: true },
										)
									}
								>
									全挖空
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="text-xs h-6"
									onClick={() =>
										setValue("maskedIndices", [], { shouldDirty: true })
									}
								>
									全顯示
								</Button>
							</div>
						</div>
					)}
				</TabsContent>

				{/* 3. 選擇題 Content */}
				<TabsContent value="choice" className="space-y-4">
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label>題目 (支援 Markdown 表格)</Label>
							<SmartPasteDialog
								onParsed={(data) => {
									setValue("stem", data.stem, { shouldDirty: true });
									setValue("definition", data.definition, {
										shouldDirty: true,
									});
									setValue("option1", data.options[0], { shouldDirty: true });
									setValue("option2", data.options[1], { shouldDirty: true });
									setValue("option3", data.options[2], { shouldDirty: true });
									setValue("option4", data.options[3], { shouldDirty: true });

									// 設定答案
									if (data.correctIndex >= 0) {
										setTimeout(() => {
											const ansText = data.options[data.correctIndex];
											setValue("answer", ansText, { shouldDirty: true });
										}, 0);
									}
									toast.success("智慧貼上成功！");
								}}
							/>
						</div>
						{/* ▼▼▼ 修正 4：優化 Tailwind Class ▼▼▼ */}
						<Textarea
							placeholder="輸入題目..."
							className="font-mono text-sm min-h-20"
							{...register("stem")}
						/>
					</div>

					<div className="grid gap-3">
						<Label>選項與答案</Label>
						{/* 渲染 4 個選項輸入框 */}
						{[1, 2, 3, 4].map((idx) => (
							<div key={idx} className="flex gap-2 items-center">
								{/* ▼▼▼ 修正 2：改用 button 避免 Biome 報錯 ▼▼▼ */}
								<button
									type="button"
									className={cn(
										"w-8 h-8 flex items-center justify-center rounded-full border font-bold text-sm shrink-0 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
										correctIndex === idx
											? "bg-emerald-500 text-white border-emerald-600"
											: "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800",
									)}
									onClick={() => setCorrectOption(idx)}
									title="點擊設為正確答案"
								>
									{["A", "B", "C", "D"][idx - 1]}
								</button>
								{/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}

								<Input
									{...register(`option${idx}` as keyof DeckEditorFormData)}
									placeholder={`選項 ${["A", "B", "C", "D"][idx - 1]}`}
									className={cn(
										correctIndex === idx &&
											"border-emerald-500 ring-1 ring-emerald-500",
									)}
								/>
							</div>
						))}
					</div>
				</TabsContent>

				{/* 4. 填空題 */}
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

				{/* 5. 單字卡 */}
				<TabsContent value="flashcard" className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>英文單字</Label>
							<div className="flex gap-2">
								<Input placeholder="e.g. Epiphany" {...register("stem")} />
								<Button
									type="button"
									onClick={onAutoFillDict}
									variant="outline"
									size="icon"
									disabled={dictLoading}
								>
									{dictLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Wand2 className="h-4 w-4" />
									)}
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

			{/* 共用欄位：釋義與圖片 */}
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>釋義 / 解析</Label>
					<Textarea
						className="min-h-[120px] font-mono text-sm"
						placeholder="輸入詳細解釋或筆記..."
						{...register("definition")}
					/>
				</div>

				<div className="space-y-2">
					<Label>配圖 (選填)</Label>
					<ImageUploader
						value={imageUrl}
						onChange={(url) => setValue("image", url, { shouldDirty: true })}
						disabled={saving}
					/>
				</div>
			</div>

			<div className="flex justify-end pt-4 border-t gap-2">
				{isEditing && (
					<Button type="button" variant="ghost" onClick={onCancel}>
						取消編輯
					</Button>
				)}
				<Button type="submit" disabled={saving}>
					{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					<Save className="mr-2 h-4 w-4" />
					{isEditing ? "儲存修改" : "新增卡片"} (Ctrl+Enter)
				</Button>
			</div>
		</form>
	);
}
