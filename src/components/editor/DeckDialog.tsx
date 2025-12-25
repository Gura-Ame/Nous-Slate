import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { DeckService } from "@/services/deck-service";
import type { Deck } from "@/types/schema";

const getFormSchema = (t: (key: string, fallback: string) => string) =>
	z.object({
		title: z
			.string()
			.min(
				1,
				t("deck_dialog.validation_title_required", "Title cannot be empty"),
			)
			.max(50),
		description: z.string().max(200).optional(),
		isPublic: z.boolean(),
	});

type FormData = z.infer<ReturnType<typeof getFormSchema>>;

interface DeckUpdatePayload extends FormData {
	tags: string[];
}

interface DeckDialogProps {
	deck?: Deck; // If deck provided, edit mode; otherwise, create mode
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function DeckDialog({
	deck,
	open,
	onOpenChange,
	onSuccess,
}: DeckDialogProps) {
	const { t } = useTranslation();
	const { user } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [tags, setTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState("");

	const isEditMode = !!deck;

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(getFormSchema(t)),
		defaultValues: {
			title: "",
			description: "",
			isPublic: false,
		},
	});

	// Reset form when opening or switching modes
	useEffect(() => {
		if (open) {
			if (deck) {
				reset({
					title: deck.title,
					description: deck.description || "",
					isPublic: deck.isPublic,
				});
				setTags(deck.tags || []);
			} else {
				reset({
					title: "",
					description: "",
					isPublic: false,
				});
				setTags([]);
			}
		}
	}, [open, deck, reset]);

	const handleAddTag = (e?: React.KeyboardEvent) => {
		if (e && e.key !== "Enter") return;
		e?.preventDefault();
		const newTag = tagInput.trim();
		if (newTag && !tags.includes(newTag)) {
			setTags([...tags, newTag]);
			setTagInput("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setTags(tags.filter((t) => t !== tagToRemove));
	};

	const onSubmit = async (data: FormData) => {
		if (!user) return;
		setIsSubmitting(true);
		try {
			if (isEditMode && deck) {
				// Edit mode
				const payload: DeckUpdatePayload = {
					...data,
					tags,
				};
				await DeckService.updateDeck(deck.id, payload);
				toast.success(t("deck_dialog.save_success", "Updated successfully"));
			} else {
				// Create mode
				await DeckService.createDeck(user.uid, data.title, data.description);
				// NB: createDeck currently might not support tags; consider updating deck-service
				toast.success("Created successfully");
			}
			onOpenChange(false);
			onSuccess();
		} catch (error) {
			console.error(error);
			toast.error(isEditMode ? "Update failed" : "Creation failed");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogHeader>
						<DialogTitle>
							{isEditMode
								? t("deck_dialog.edit_title", "Edit Deck Info")
								: t("deck_dialog.create_title", "Create New Deck")}
						</DialogTitle>
						<DialogDescription>
							{isEditMode
								? t(
										"deck_dialog.edit_desc",
										"Modify deck title, description and permissions.",
									)
								: t(
										"deck_dialog.create_desc",
										"Set up basic deck information.",
									)}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-6 py-4">
						<div className="grid gap-2">
							<Label htmlFor="title">
								{t("deck_dialog.title_label", "Title")}
							</Label>
							<Input
								id="title"
								{...register("title")}
								placeholder={t(
									"deck_dialog.title_placeholder",
									"e.g., Lesson 1",
								)}
							/>
							{errors.title && (
								<p className="text-xs text-red-500">{errors.title.message}</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">
								{t("deck_dialog.desc_label", "Description")}
							</Label>
							<Textarea
								id="description"
								{...register("description")}
								placeholder={t(
									"deck_dialog.desc_placeholder",
									"Brief description...",
								)}
								className="resize-none"
							/>
						</div>

						<div className="grid gap-2">
							<Label>{t("deck_dialog.tags_label", "Tags")}</Label>
							<div className="flex gap-2">
								<Input
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyDown={handleAddTag}
									placeholder={t(
										"deck_dialog.tags_placeholder",
										"Press Enter to add",
									)}
								/>
								<Button
									type="button"
									variant="secondary"
									onClick={() => handleAddTag()}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							<div className="flex flex-wrap gap-2 mt-2 min-h-6">
								{tags.length > 0
									? tags.map((tag) => (
											<Badge
												key={tag}
												variant="secondary"
												className="gap-1 font-normal h-6"
											>
												{tag}
												<X
													className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
													onClick={() => handleRemoveTag(tag)}
												/>
											</Badge>
										))
									: null}
							</div>
							<p className="text-[10px] text-muted-foreground mt-1 px-1">
								{tags.length === 0 &&
									t(
										"deck_dialog.tags_empty",
										"(No tags yet, add some for organization)",
									)}
							</p>
						</div>

						<div className="flex items-center justify-between border p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
							<div className="space-y-0.5">
								<Label>
									{t("deck_dialog.public_label", "Make deck public")}
								</Label>
								<p className="text-xs text-muted-foreground">
									{t(
										"deck_dialog.public_desc",
										"Allow others to see in Library.",
									)}
								</p>
							</div>
							<Switch
								checked={watch("isPublic")}
								onCheckedChange={(val) => setValue("isPublic", val)}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							{t("deck_dialog.cancel", "Cancel")}
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{isEditMode
								? t("deck_dialog.save", "Save Changes")
								: t("deck_dialog.create_btn", "Create Now")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
