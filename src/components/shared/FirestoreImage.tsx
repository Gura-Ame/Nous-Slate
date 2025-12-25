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
	const [imageSrc, setImageSrc] = useState<string | null>(null); // Initialized to null
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const load = async () => {
			// 1. Empty src
			if (!src) {
				if (isMounted) {
					setImageSrc(null);
					setLoading(false);
					setError(false);
				}
				return;
			}

			// 2. Simple URL
			if (!src.startsWith("chunked:")) {
				if (isMounted) {
					setImageSrc(src);
					setLoading(false);
					setError(false);
				}
				return;
			}

			// 3. Chunked Image
			if (isMounted) {
				setLoading(true);
				setError(false);
			}

			try {
				const data = await StorageService.loadImage(src);
				if (isMounted) {
					setImageSrc(data);
				}
			} catch (err) {
				console.error("Image load failed", err);
				if (isMounted) {
					setError(true);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		load();

		return () => {
			isMounted = false;
		};
	}, [src]);

	// Error state
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

	// Loading state
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
