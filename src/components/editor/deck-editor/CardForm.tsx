import { Eye, EyeOff, Loader2, Save, Wand2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CardType } from "@/types/schema";
import { ImageUploader } from "./ImageUploader";

// 1. 在介面中正式加入 maskedIndices
export interface DeckEditorFormData {
	type: CardType;
	stem: string;
	zhuyinRaw: string;
	definition: string;
	audioUrl: string;
	answer: string;
	option1: string;
	option2: string;
	option3: string;
	image: string;
	maskedIndices?: number[]; // 新增此欄位
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
	// 移除 defaultMaskedIndices，不再需要透過 props 傳遞
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

	// 2. 直接監聽表單中的 maskedIndices，移除 useState
	const maskedIndices = watch("maskedIndices") || [];

	// 3. 切換挖空狀態直接操作 form value
	const toggleMask = (index: number) => {
		let newIndices: number[];
		if (maskedIndices.includes(index)) {
			newIndices = maskedIndices.filter((i) => i !== index);
		} else {
			newIndices = [...maskedIndices, index].sort((a, b) => a - b);
		}
		// 這會觸發 watch 更新，自動重繪 UI，不會造成迴圈
		setValue("maskedIndices", newIndices, { shouldDirty: true });
	};

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

				{/* 1. 國字注音 */}
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

				{/* 2. 聽寫/默寫 */}
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
									onClick={() => setValue("maskedIndices", [])}
								>
									全顯示
								</Button>
							</div>
						</div>
					)}
				</TabsContent>

				{/* 3. 選擇題 */}
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
						<div className="space-y-2">
							<Label>選項 1</Label>
							<Input {...register("option1")} />
						</div>
						<div className="space-y-2">
							<Label>選項 2</Label>
							<Input {...register("option2")} />
						</div>
						<div className="space-y-2">
							<Label>選項 3</Label>
							<Input {...register("option3")} />
						</div>
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

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>釋義 / 筆記</Label>
					<Textarea
						className="min-h-[120px] font-mono text-sm"
						placeholder="輸入詳細解釋..."
						{...register("definition")}
					/>
				</div>

				<div className="space-y-2">
					<Label>配圖 (選填)</Label>
					<ImageUploader
						value={imageUrl}
						onChange={(url) => setValue("image", url)}
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
