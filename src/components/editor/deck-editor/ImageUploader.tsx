import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FirestoreImage } from "@/components/shared/FirestoreImage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StorageService } from "@/services/storage-service";

interface ImageUploaderProps {
	value?: string; // Current image URL
	onChange: (url: string) => void; // Callback with new URL
	disabled?: boolean;
}

export function ImageUploader({
	value,
	onChange,
	disabled,
}: ImageUploaderProps) {
	const { t } = useTranslation();
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Core upload handling
	const handleUpload = async (file: File) => {
		setIsUploading(true);
		try {
			const url = await StorageService.uploadImage(file);
			onChange(url);
			toast.success(t("image_uploader.success", "Image uploaded successfully"));
		} catch (error: unknown) {
			console.error(error);
			const msg =
				error instanceof Error
					? error.message
					: t("image_uploader.error", "Upload failed");
			toast.error(msg);
		} finally {
			setIsUploading(false);
		}
	};

	// 1. Handle file selection
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleUpload(file);
	};

	// 2. Handle clipboard paste
	const handlePaste = (e: React.ClipboardEvent) => {
		const items = e.clipboardData.items;
		for (let i = 0; i < items.length; i++) {
			if (items[i].type.indexOf("image") !== -1) {
				e.preventDefault(); // Prevent pasting text
				const file = items[i].getAsFile();
				if (file) handleUpload(file);
				return; // Only process the first image
			}
		}
	};

	// 3. Handle drag and drop
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};
	const handleDragLeave = () => setIsDragging(false);
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file?.type.startsWith("image/")) {
			handleUpload(file);
		}
	};

	// Remove image
	const handleRemove = () => {
		onChange("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	return (
		<div className="space-y-2">
			{/* Preview Area (if image exists) */}
			{value ? (
				<div className="relative w-full h-48 rounded-lg border overflow-hidden group bg-slate-100 dark:bg-slate-800">
					<FirestoreImage // Use this for chunked images
						src={value}
						alt="Uploaded content"
						className="w-full h-full object-contain"
					/>
					<Button
						type="button"
						variant="destructive"
						size="icon"
						className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={handleRemove}
						disabled={disabled}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			) : (
				<button
					type="button"
					className={cn(
						"relative w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors outline-none",
						isDragging
							? "border-primary bg-primary/5"
							: "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900",
						disabled && "opacity-50 cursor-not-allowed",
					)}
					onClick={() => !disabled && fileInputRef.current?.click()}
					onPaste={handlePaste}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					{isUploading ? (
						<div className="flex flex-col items-center gap-2 text-slate-500">
							<Loader2 className="h-8 w-8 animate-spin" />
							<span className="text-xs">
								{t("common.loading", "Loading...")}
							</span>
						</div>
					) : (
						<div className="flex flex-col items-center gap-2 text-slate-400">
							<Upload className="h-8 w-8" />
							<p className="text-xs font-medium px-4 text-center">
								{t(
									"image_uploader.hint",
									"Click to upload, drag and drop, or Ctrl+V to paste",
								)}
							</p>
						</div>
					)}

					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleFileChange}
						disabled={disabled}
					/>
				</button>
			)}
		</div>
	);
}
