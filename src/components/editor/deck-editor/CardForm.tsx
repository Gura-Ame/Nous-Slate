import { Eye, EyeOff, Loader2, Save, Wand2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation();
	const { register, handleSubmit, setValue, watch } = form;
	const currentType = watch("type");
	const stem = watch("stem");
	const imageUrl = watch("image");

	// --- 1. Dictation: Masking logic ---
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

	// --- 2. Multiple Choice: Correct answer logic ---
	const currentAnswer = watch("answer");
	const opt1 = watch("option1");
	const opt2 = watch("option2");
	const opt3 = watch("option3");
	const opt4 = watch("option4");

	const setCorrectOption = (optIndex: number) => {
		const fieldName = `option${optIndex}` as keyof DeckEditorFormData;
		const val = watch(fieldName);

		if (typeof val !== "string" || !val) {
			return toast.error(
				t("card_form.error_option_empty", "Please enter option content first"),
			);
		}

		setValue("answer", val, { shouldDirty: true });
		toast.success(
			t("card_form.success_correct_answer", {
				letter: ["A", "B", "C", "D"][optIndex - 1],
			}),
		);
	};

	// Determine correct answer for UI display
	const getCorrectIndex = () => {
		if (currentAnswer === opt1 && opt1) return 1;
		if (currentAnswer === opt2 && opt2) return 2;
		if (currentAnswer === opt3 && opt3) return 3;
		if (currentAnswer === opt4 && opt4) return 4;
		return 0; // None selected
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
					<TabsTrigger value="term">
						{t("card_form.type_term", "Bopomofo/Zhuyin")}
					</TabsTrigger>
					<TabsTrigger value="dictation">
						{t("card_form.type_dictation", "Dictation")}
					</TabsTrigger>
					<TabsTrigger value="choice">
						{t("card_form.type_choice", "Multiple Choice")}
					</TabsTrigger>
					<TabsTrigger value="fill_blank">
						{t("card_form.type_fillblank", "Fill in the Blank")}
					</TabsTrigger>
					<TabsTrigger value="flashcard">
						{t("card_form.type_flashcard", "Flashcard")}
					</TabsTrigger>
				</TabsList>

				{/* 1. Bopomofo Content */}
				<TabsContent value="term" className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>
								{t("card_form.stem_label", "Question (Characters)")}
							</Label>
							<div className="flex gap-2">
								<Input
									placeholder={t("card_form.stem_placeholder", "e.g., Bank")}
									{...register("stem")}
								/>
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
							<Label>
								{t("card_form.zhuyin_label", "Phonetic (Space separated)")}
							</Label>
							<Input placeholder="ㄧㄣˊ ㄏㄤˊ" {...register("zhuyinRaw")} />
						</div>
					</div>
				</TabsContent>

				{/* 2. Dictation Content */}
				<TabsContent value="dictation" className="space-y-4">
					<div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-md mb-4">
						{t(
							"card_form.dictation_hint",
							"💡 Tip: Click blocks below to toggle display/hide. Masked characters need to be entered.",
						)}
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>
								{t("card_form.stem_chars_label", "Question (Characters)")}
							</Label>
							<div className="flex gap-2">
								<Input
									placeholder={t(
										"card_form.stem_placeholder_dictation",
										"e.g., Bank",
									)}
									{...register("stem")}
								/>
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
							<Label>
								{t("card_form.zhuyin_label", "Phonetic (Space separated)")}
							</Label>
							<Input placeholder="ㄧㄣˊ ㄏㄤˊ" {...register("zhuyinRaw")} />
						</div>
					</div>

					{/* Mask Selector */}
					{stem && (
						<div className="space-y-2 pt-2">
							<Label>
								{t("card_form.mask_setting", "Mask Setting (Click to toggle)")}
							</Label>
							<div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
								{stem.split("").map((char, index) => {
									const isMasked = maskedIndices.includes(index);
									return (
										<button
											// biome-ignore lint/suspicious/noArrayIndexKey: Safe with static indices
											key={`${char}-${index}`}
											type="button"
											onClick={() => toggleMask(index)}
											className={cn(
												"w-12 h-12 flex flex-col items-center justify-center rounded-md transition-all",
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
									{t("card_form.mask_all", "Mask All")}
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
									{t("card_form.show_all", "Show All")}
								</Button>
							</div>
						</div>
					)}
				</TabsContent>

				{/* 3. Multiple Choice Content */}
				<TabsContent value="choice" className="space-y-4">
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label>
								{t(
									"card_form.stem_markdown",
									"Question (Supports Markdown Table)",
								)}
							</Label>
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

									// Set answer
									if (data.correctIndex >= 0) {
										setTimeout(() => {
											const ansText = data.options[data.correctIndex];
											setValue("answer", ansText, { shouldDirty: true });
										}, 0);
									}
									toast.success(
										t(
											"card_form.smart_paste_success",
											"Smart paste successful!",
										),
									);
								}}
							/>
						</div>

						<Textarea
							placeholder={t(
								"card_form.stem_placeholder_choice",
								"Enter question...",
							)}
							className="font-mono text-sm min-h-20"
							{...register("stem")}
						/>
					</div>

					<div className="grid gap-3">
						<Label>{t("card_form.options_label", "Options & Answer")}</Label>
						{/* Render 4 option inputs */}
						{[1, 2, 3, 4].map((idx) => (
							<div key={idx} className="flex gap-2 items-center">
								<button
									type="button"
									className={cn(
										"w-8 h-8 flex items-center justify-center rounded-full border font-bold text-sm shrink-0 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
										correctIndex === idx
											? "bg-emerald-500 text-white border-emerald-600"
											: "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800",
									)}
									onClick={() => setCorrectOption(idx)}
									title={t(
										"card_form.set_correct_tip",
										"Click to set as correct answer",
									)}
								>
									{["A", "B", "C", "D"][idx - 1]}
								</button>

								<Input
									{...register(`option${idx}` as keyof DeckEditorFormData)}
									placeholder={`${t("card_form.option", "Option")} ${["A", "B", "C", "D"][idx - 1]}`}
									className={cn(
										correctIndex === idx &&
											"border-emerald-500 ring-1 ring-emerald-500",
									)}
								/>
							</div>
						))}
					</div>
				</TabsContent>

				{/* 4. Fill in the Blank */}
				<TabsContent value="fill_blank" className="space-y-4">
					<div className="space-y-2">
						<Label>
							{t("card_form.stem_fillblank", "Question (Use ___ for blank)")}
						</Label>
						<Input placeholder="Example: Apple is ___." {...register("stem")} />
					</div>
					<div className="space-y-2">
						<Label className="text-emerald-600 font-bold">
							{t("card_form.answer_label", "Answer")}
						</Label>
						<Input placeholder="red" {...register("answer")} />
					</div>
				</TabsContent>

				{/* 5. Flashcard */}
				<TabsContent value="flashcard" className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>{t("card_form.word_label", "English Word")}</Label>
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
							<Label>{t("card_form.audio_label", "Audio URL")}</Label>
							<Input placeholder="https://..." {...register("audioUrl")} />
						</div>
					</div>
				</TabsContent>
			</Tabs>

			{/* Shared Fields: Definition and Image */}
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>
						{t("card_form.definition_label", "Definition / Analysis")}
					</Label>
					<Textarea
						className="min-h-[120px] font-mono text-sm"
						placeholder={t(
							"card_form.definition_placeholder",
							"Enter detailed explanation or notes...",
						)}
						{...register("definition")}
					/>
				</div>

				<div className="space-y-2">
					<Label>{t("card_form.image_label", "Image (Optional)")}</Label>
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
						{t("common.cancel_edit", "Cancel Edit")}
					</Button>
				)}
				<Button type="submit" disabled={saving}>
					{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					<Save className="mr-2 h-4 w-4" />
					{isEditing
						? t("card_form.save_edit", "Save Changes")
						: t("card_form.add_card", "Add Card")}{" "}
					(Ctrl+Enter)
				</Button>
			</div>
		</form>
	);
}
