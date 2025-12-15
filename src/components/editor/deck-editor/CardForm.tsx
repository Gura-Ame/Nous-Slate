// src/components/editor/deck-editor/CardForm.tsx

import { Loader2, Save, Wand2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { CardType } from "@/types/schema";
import { ImageUploader } from "./ImageUploader";

// 定義與主頁面一致的 FormData
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

	const imageUrl = watch("image");

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
				<TabsList className="grid w-full grid-cols-4 mb-6">
					<TabsTrigger value="term">國字注音</TabsTrigger>
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

				{/* 4. 單字卡 */}
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

			{/* 在 Tabs 下方加入圖片上傳區 */}
			<div className="grid gap-4 sm:grid-cols-2">
				{/* 釋義欄位 (原本的) */}
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
