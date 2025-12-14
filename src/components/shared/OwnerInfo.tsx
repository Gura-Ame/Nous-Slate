import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";

interface OwnerInfoProps {
	userId: string;
	showAvatar?: boolean;
}

interface UserProfile {
	displayName: string;
	photoURL?: string;
}

export function OwnerInfo({ userId, showAvatar = true }: OwnerInfoProps) {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// 簡單的快取機制：如果已經抓過就不抓 (可選)
		// 這裡直接實作 Fetch
		const fetchUser = async () => {
			try {
				const docRef = doc(db, "users", userId);
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					setProfile(docSnap.data() as UserProfile);
				}
			} catch (error) {
				console.error("Failed to fetch owner info", error);
			} finally {
				setLoading(false);
			}
		};

		if (userId) {
			fetchUser();
		}
	}, [userId]);

	if (loading) {
		return <Skeleton className="h-4 w-20" />;
	}

	if (!profile) {
		return <span className="text-muted-foreground">未知使用者</span>;
	}

	return (
		<div className="flex items-center gap-2">
			{showAvatar && (
				<Avatar className="h-5 w-5 border">
					<AvatarImage src={profile.photoURL} />
					<AvatarFallback className="text-[9px]">
						{profile.displayName[0]?.toUpperCase()}
					</AvatarFallback>
				</Avatar>
			)}
			<span
				className="text-muted-foreground truncate max-w-[100px]"
				title={profile.displayName}
			>
				{profile.displayName}
			</span>
		</div>
	);
}
