import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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

const formSchema = z.object({
	name: z.string().min(1, "請輸入資料夾名稱").max(20),
	color: z.string(),
	isPublic: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

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
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
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
						<DialogTitle>{folder ? "編輯資料夾" : "新增資料夾"}</DialogTitle>
						<DialogDescription>
							設定資料夾名稱、顏色與公開權限。
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-6 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">名稱</Label>
							<Input
								id="name"
								{...register("name")}
								placeholder="例如：國文第一冊"
							/>
							{errors.name && (
								<p className="text-xs text-red-500">{errors.name.message}</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label>代表顏色</Label>
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
								<Label className="text-base">設為公開資料夾</Label>
								<p className="text-xs text-muted-foreground">
									公開後，所有人都可以在「探索」中看到此分類。
									<br />
									<span className="text-amber-600 dark:text-amber-500 font-medium">
										(此設定將允許他人讀取內部的題庫)
									</span>
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
							取消
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{folder ? "儲存變更" : "立即建立"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
