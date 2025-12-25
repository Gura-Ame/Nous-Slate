import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

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
import { cn } from "@/lib/utils";
import type { Folder } from "@/types/schema";

const FOLDER_COLORS = [
	{ name: "Blue", value: "bg-blue-500" },
	{ name: "Red", value: "bg-red-500" },
	{ name: "Orange", value: "bg-orange-500" },
	{ name: "Amber", value: "bg-amber-500" },
	{ name: "Green", value: "bg-emerald-500" },
	{ name: "Teal", value: "bg-teal-500" },
	{ name: "Purple", value: "bg-purple-500" },
	{ name: "Pink", value: "bg-pink-500" },
	{ name: "Slate", value: "bg-slate-500" },
];

const getFormSchema = (t: (key: string, fallback: string) => string) =>
	z.object({
		name: z
			.string()
			.min(
				1,
				t("folder_dialog.validation_name_required", "Please enter folder name"),
			)
			.max(20),
		color: z.string(),
		isPublic: z.boolean(),
	});

type FormData = z.infer<ReturnType<typeof getFormSchema>>;

interface FolderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	folder?: Folder;
	onSubmit: (data: FormData) => Promise<void>;
}

export function FolderDialog({
	open,
	onOpenChange,
	folder,
	onSubmit,
}: FolderDialogProps) {
	const { t } = useTranslation();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(getFormSchema(t)),
		defaultValues: {
			name: "",
			color: "bg-blue-500",
			isPublic: false,
		},
	});

	const currentColor = watch("color");
	const isPublic = watch("isPublic");

	useEffect(() => {
		if (open) {
			if (folder) {
				reset({
					name: folder.name,
					color: folder.color || "bg-blue-500",
					isPublic: folder.isPublic || false,
				});
			} else {
				reset({
					name: "",
					color: "bg-blue-500",
					isPublic: false,
				});
			}
		}
	}, [open, folder, reset]);

	const onFormSubmit = async (data: FormData) => {
		setIsSubmitting(true);
		try {
			await onSubmit(data);
			onOpenChange(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit(onFormSubmit)}>
					<DialogHeader>
						<DialogTitle>
							{folder
								? t("folder_dialog.edit_title", "Edit Folder")
								: t("folder_dialog.create_title", "New Folder")}
						</DialogTitle>
						<DialogDescription>
							{t(
								"folder_dialog.desc",
								"Set up folder name, color and permissions.",
							)}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-6 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">
								{t("folder_dialog.name_label", "Name")}
							</Label>
							<Input
								id="name"
								{...register("name")}
								placeholder={t(
									"folder_dialog.name_placeholder",
									"e.g., Chinese Vol. 1",
								)}
							/>
							{errors.name && (
								<p className="text-xs text-red-500">{errors.name.message}</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label>{t("folder_dialog.color_label", "Color")}</Label>
							<div className="flex flex-wrap gap-3">
								{FOLDER_COLORS.map((c) => (
									<button
										key={c.value}
										type="button"
										onClick={() => setValue("color", c.value)}
										className={cn(
											"w-8 h-8 rounded-full transition-all flex items-center justify-center",
											c.value,
											currentColor === c.value
												? "ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-100 scale-110"
												: "hover:scale-105 opacity-80 hover:opacity-100",
										)}
										title={c.name}
									>
										{currentColor === c.value && (
											<Check className="w-4 h-4 text-white drop-shadow-md" />
										)}
									</button>
								))}
							</div>
						</div>

						<div className="flex items-center justify-between border p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
							<div className="space-y-0.5">
								<Label className="text-base">
									{t("folder_dialog.public_label", "Make folder public")}
								</Label>
								<p className="text-xs text-muted-foreground">
									{t(
										"folder_dialog.public_desc",
										"Allow others to see in Library.",
									)}
								</p>
							</div>
							<Switch
								checked={isPublic}
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
							{t("common.cancel", "Cancel")}
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{folder
								? t("folder_dialog.save", "Save Changes")
								: t("folder_dialog.create", "Create Now")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
