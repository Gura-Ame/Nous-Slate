// src/components/editor/CreateDeckDialog.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
// ... imports
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { DeckService } from "@/services/deck-service";

// ... imports

// Define form validation rules
// NB: schema validation messages should also be localized, but useForm resolution happens outside component render mostly.
// However, we can use z.string({ required_error: ... }) but translating inside schema definition requires trickery.
// Easier to keep simple or move schema inside component (less performant but allows t).
// For now, let's keep schema outside and just translate UI strings, or move schema inside.
// Moving schema inside CreateDeckDialog to use t():

interface Props {
	onDeckCreated: () => void;
}

export function CreateDeckDialog({ onDeckCreated }: Props) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { user } = useAuth();

	const formSchema = z.object({
		title: z
			.string()
			.min(1, t("create_deck.validation_title_required", "Title is required"))
			.max(50, t("create_deck.validation_title_max", "'Title is too long'")),
		description: z
			.string()
			.max(200, t("create_deck.validation_desc_max", "Description is too long"))
			.optional(),
	});

	type FormData = z.infer<typeof formSchema>;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	const onSubmit = async (data: FormData) => {
		if (!user) return;

		setIsSubmitting(true);
		try {
			await DeckService.createDeck(user.uid, data.title, data.description);

			toast.success(t("create_deck.success", "Created Successfully"), {
				description: t("create_deck.success_desc", {
					title: data.title,
					defaultValue: `Deck ${data.title} has been created.`,
				}),
			});

			setOpen(false);
			reset();
			onDeckCreated();
		} catch (error) {
			console.error(error);
			toast.error(t("create_deck.error", "Creation Failed"), {
				description: t("create_deck.error_desc", "Please try again later."),
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />{" "}
					{t("create_deck.trigger_button", "Create New Deck")}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogHeader>
						<DialogTitle>
							{t("create_deck.title", "Create New Deck")}
						</DialogTitle>
						<DialogDescription>
							{t("create_deck.desc", "Create a new unit...")}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="title">
								{t("create_deck.label_title", "Title")}
							</Label>
							<Input
								id="title"
								placeholder={t(
									"create_deck.placeholder_title",
									"E.g.: Basic Bopomofo",
								)}
								{...register("title")}
							/>
							{errors.title && (
								<p className="text-xs text-red-500">{errors.title.message}</p>
							)}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">
								{t("create_deck.label_desc", "Description (Optional)")}
							</Label>
							<Textarea
								id="description"
								placeholder={t(
									"create_deck.placeholder_desc",
									"Briefly describe...",
								)}
								{...register("description")}
							/>
							{errors.description && (
								<p className="text-xs text-red-500">
									{errors.description.message}
								</p>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{t("create_deck.submit", "Create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
