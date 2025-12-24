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
		// 1. 如果 src 為空，不處理 (直接渲染 null)
		if (!src) {
			setLoading(false);
			setImageSrc(null);
			return;
		}

		// 2. 如果是一般 URL 或舊 Base64，直接設定
		if (!src.startsWith("chunked:")) {
			setImageSrc(src);
			setLoading(false);
			return;
		}

		// 3. 分片圖片載入邏輯
		let isMounted = true;
		setLoading(true);
		setError(false);

		StorageService.loadImage(src)
			.then((data) => {
				if (isMounted) setImageSrc(data);
			})
			.catch((err) => {
				if (isMounted) {
					console.error("Image load failed", err);
					setError(true);
				}
			})
			.finally(() => {
				if (isMounted) setLoading(false);
			});
			
		return () => { isMounted = false; };
	}, [src]);

	// Early return for empty src if not loading
	if (!src && !loading) return null;

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
