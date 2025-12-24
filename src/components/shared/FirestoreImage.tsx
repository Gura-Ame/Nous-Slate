import { Image as ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { StorageService } from "@/services/storage-service";

interface FirestoreImageProps
	extends React.ImgHTMLAttributes<HTMLImageElement> {
	src?: string;
	fallbackText?: string;
}

export function FirestoreImage({
	src,
	className,
	alt,
	...props
}: FirestoreImageProps) {
	const [imageSrc, setImageSrc] = useState<string | null>(null); // 改為 null
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		// 1. 如果 src 為空、undefined 或空字串，直接設為 null 並返回
		if (!src) {
			setImageSrc(null);
			setLoading(false);
			return;
		}

		// 2. 如果是一般 URL 或舊 Base64，直接設定
		if (!src.startsWith("chunked:")) {
			setImageSrc(src);
			setLoading(false);
			return;
		}

		// 3. 分片圖片載入邏輯
		setLoading(true);
		setError(false);

		StorageService.loadImage(src)
			.then((data) => {
				setImageSrc(data);
			})
			.catch((err) => {
				console.error("Image load failed", err);
				setError(true);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [src]);

	// 錯誤狀態
	if (error) {
		return (
			<div
				className={cn(
					"flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 min-h-20",
					className,
				)}
			>
				<ImageIcon className="h-8 w-8" />
			</div>
		);
	}

	// 載入中狀態
	if (loading) {
		return (
			<div
				className={cn(
					"flex items-center justify-center bg-slate-50 dark:bg-slate-900 animate-pulse min-h-20",
					className,
				)}
			>
				<Loader2 className="h-6 w-6 animate-spin text-slate-400" />
			</div>
		);
	}

	if (!imageSrc) {
		return null;
	}

	return (
		<img
			src={imageSrc}
			alt={alt || "Image"}
			className={cn("transition-opacity duration-500 opacity-100", className)}
			{...props}
		/>
	);
}
