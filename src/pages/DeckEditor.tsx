// src/pages/DeckEditor.tsx
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
// Components
import {
	CardForm,
	type DeckEditorFormData,
} from "@/components/editor/deck-editor/CardForm";
import { CardListSidebar } from "@/components/editor/deck-editor/CardListSidebar";
import { CardPreview } from "@/components/editor/deck-editor/CardPreview";
import { EditorHeader } from "@/components/editor/deck-editor/EditorHeader";
import { PolyphoneSelectDialog } from "@/components/editor/deck-editor/PolyphoneSelectDialog";
// Services & Hooks
import { useDictionary } from "@/hooks/useDictionary";
import { type MoedictHeteronym, useMoedict } from "@/hooks/useMoedict";
import { parseBopomofoString, parseOneBopomofo } from "@/lib/bopomofo-utils";
import { reconstructZhuyin } from "@/lib/editor-utils";
import { CardService } from "@/services/card-service";
import type { CardContent, Card as CardType } from "@/types/schema";

export default function DeckEditor() {
	const { t } = useTranslation();
	const { deckId } = useParams<{ deckId: string }>();
	const [cards, setCards] = useState<CardType[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editingCardId, setEditingCardId] = useState<string | null>(null);
	const [polyphoneOpen, setPolyphoneOpen] = useState(false);
	const [polyphoneCandidates, setPolyphoneCandidates] = useState<
		MoedictHeteronym[]
	>([]);

	// API Hooks
	const { search: searchMoedict, loading: moedictLoading } = useMoedict();
	const { search: searchDict, loading: dictLoading } = useDictionary();

	// Form
	const form = useForm<DeckEditorFormData>({
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
			image: "",
		},
	});

	// Load Data
	const fetchCards = useCallback(async () => {
		if (!deckId) return;
		try {
			const data = await CardService.getCardsByDeck(deckId);
			setCards(data);
		} catch (error) {
			console.error(error);
			toast.error(t("deck_editor.error_load_cards", "Failed to load cards"));
		} finally {
			setLoading(false);
		}
	}, [deckId, t]);

	useEffect(() => {
		fetchCards();
	}, [fetchCards]);

	// Handlers
	const handleAutoFillMoedict = async () => {
		const stem = form.getValues("stem");
		if (!stem)
			return toast.error(
				t("deck_editor.error_no_stem", "Please enter the term"),
			);

		const result = await searchMoedict(stem);

		if (result) {
			if (result.heteronyms.length === 1) {
				// Case A: Only one pronunciation, fill in directly
				const first = result.heteronyms[0];
				form.setValue("zhuyinRaw", first.bopomofo);
				form.setValue("definition", first.definition);
				toast.success(
					t("deck_editor.moedict_filled", "Dictionary data filled"),
				);
			} else {
				// Case B: Multiple pronunciations, open selection dialog
				setPolyphoneCandidates(result.heteronyms);
				setPolyphoneOpen(true);
			}
		}
	};

	// New: Handle selection from dialog
	const handlePolyphoneSelect = (selected: MoedictHeteronym) => {
		form.setValue("zhuyinRaw", selected.bopomofo);
		form.setValue("definition", selected.definition);
		toast.success(
			t("deck_editor.pronunciation_selected", "Pronunciation selected"),
		);
	};

	const handleAutoFillDict = async () => {
		const stem = form.getValues("stem");
		if (!stem)
			return toast.error(t("common.enter_word", "Please enter a word"));
		const result = await searchDict(stem);
		if (result) {
			const def = `[${result.phonetic}]\n\n${result.definition}`;
			form.setValue("definition", def);
			if (result.audio) form.setValue("audioUrl", result.audio);
			toast.success(t("common.dict_filled", "Dictionary data filled"));
		}
	};

	const { reset } = form;

	const handleSubmit = useCallback(
		async (data: DeckEditorFormData) => {
			if (!deckId) return;
			setSaving(true);
			try {
				const content: CardContent = {
					stem: data.stem,
					meaning: data.definition,
					...(data.audioUrl ? { audioUrl: data.audioUrl } : {}),
					...(data.image ? { image: data.image } : {}),
					...(data.maskedIndices ? { maskedIndices: data.maskedIndices } : {}),
				};

				if (data.type === "term" || data.type === "dictation") {
					const bopomofoList = parseBopomofoString(data.zhuyinRaw);
					const chars = data.stem.split("");
					content.blocks = chars.map((char, index) => ({
						char,
						zhuyin: bopomofoList[index] || parseOneBopomofo(""),
					}));
				} else if (data.type === "choice") {
					content.answer = data.answer; // This should be the text of the correct option
					content.options = [
						data.option1,
						data.option2,
						data.option3,
						data.option4, // Added
					].filter(Boolean); // Filter out empty strings
				} else if (data.type === "fill_blank") {
					content.answer = data.answer;
				}

				if (editingCardId) {
					await CardService.updateCard(editingCardId, content);
					toast.success(t("deck_editor.save_success", "Updated successfully"));
					setEditingCardId(null);
				} else {
					await CardService.createCard(deckId, data.type, content);
					toast.success(
						t("deck_editor.create_success", "Created successfully"),
					);
				}

				reset({
					type: data.type,
					stem: "",
					zhuyinRaw: "",
					definition: "",
					audioUrl: "",
					answer: "",
					option1: "",
					option2: "",
					option3: "",
					option4: "",
				});
				fetchCards();
			} catch (error) {
				console.error(error);
				toast.error(t("deck_editor.save_error", "Save failed"));
			} finally {
				setSaving(false);
			}
		},
		[deckId, fetchCards, editingCardId, reset, t],
	);

	const handleDelete = async (cardId: string) => {
		if (
			!confirm(
				t("deck_editor.delete_confirm", "Are you sure you want to delete?"),
			)
		)
			return;
		await CardService.deleteCard(cardId);
		toast.success(t("deck_editor.delete_success", "Deleted"));
		fetchCards();
	};

	const handleSelectCard = (card: CardType) => {
		setEditingCardId(card.id);
		const content = card.content;
		const formData: Partial<DeckEditorFormData> = {
			type: card.type,
			stem: content.stem,
			definition: content.meaning || "",
			audioUrl: content.audioUrl || "",
			image: content.image || "",
			maskedIndices: content.maskedIndices || [],
		};

		if (card.type === "term" || card.type === "dictation") {
			formData.zhuyinRaw = reconstructZhuyin(content.blocks);
			// If legacy card doesn't have maskedIndices, default to empty
			if (!content.maskedIndices && card.type === "dictation") {
				// Decided not to default, let useEffect or user select
				formData.maskedIndices = [];
			}
		} else if (card.type === "choice") {
			formData.answer = content.answer;
			formData.option1 = content.options?.[0] || "";
			formData.option2 = content.options?.[1] || "";
			formData.option3 = content.options?.[2] || "";
			formData.option4 = content.options?.[3] || "";
		} else if (card.type === "fill_blank") {
			formData.answer = content.answer;
		}
		form.reset(formData as DeckEditorFormData);
	};

	const handleCancelEdit = () => {
		setEditingCardId(null);
		form.reset({
			type: "term",
			stem: "",
			zhuyinRaw: "",
			definition: "",
			audioUrl: "",
			answer: "",
			option1: "",
			option2: "",
			option3: "",
			image: "",
		});
	};

	// Keyboard shortcut
	useEffect(() => {
		const handleShortcut = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				form.handleSubmit(handleSubmit)();
			}
		};
		window.addEventListener("keydown", handleShortcut);
		return () => window.removeEventListener("keydown", handleShortcut);
	}, [form, handleSubmit]);

	return (
		<div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
			<EditorHeader
				deckId={deckId}
				cardCount={cards.length}
				onImportSuccess={fetchCards}
			/>

			<div className="flex-1 flex overflow-hidden">
				<CardListSidebar
					cards={cards}
					loading={loading}
					editingCardId={editingCardId}
					onSelect={handleSelectCard}
					onDelete={handleDelete}
				/>

				<main className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
					<div className="w-full max-w-2xl space-y-8">
						<CardPreview
							type={form.watch("type")}
							stem={form.watch("stem")}
							zhuyinRaw={form.watch("zhuyinRaw")}
							definition={form.watch("definition")}
							audioUrl={form.watch("audioUrl")}
							image={form.watch("image")}
							answer={form.watch("answer")}
							option1={form.watch("option1")}
							option2={form.watch("option2")}
							option3={form.watch("option3")}
						/>

						<CardForm
							form={form}
							saving={saving}
							isEditing={!!editingCardId}
							moedictLoading={moedictLoading}
							dictLoading={dictLoading}
							onSubmit={handleSubmit}
							onCancel={handleCancelEdit}
							onAutoFillMoedict={handleAutoFillMoedict}
							onAutoFillDict={handleAutoFillDict}
						/>
					</div>
				</main>

				<PolyphoneSelectDialog
					open={polyphoneOpen}
					onOpenChange={setPolyphoneOpen}
					word={form.getValues("stem")}
					candidates={polyphoneCandidates}
					onSelect={handlePolyphoneSelect}
				/>
			</div>
		</div>
	);
}
