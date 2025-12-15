import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Folder } from "@/types/schema";

const COLLECTION_NAME = "folders";

export const FolderService = {
	// 建立 (新增 color, isPublic)
	createFolder: async (
		userId: string,
		name: string,
		color = "bg-blue-500",
		isPublic = false,
	) => {
		const docRef = await addDoc(collection(db, COLLECTION_NAME), {
			ownerId: userId,
			name,
			color,
			isPublic,
			createdAt: serverTimestamp(),
		});
		return { id: docRef.id, name };
	},

	// 取得使用者資料夾
	getUserFolders: async (userId: string) => {
		const q = query(
			collection(db, COLLECTION_NAME),
			where("ownerId", "==", userId),
			orderBy("createdAt", "asc"),
		);
		const snap = await getDocs(q);
		return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Folder);
	},

	// 新增：取得所有公開資料夾
	getPublicFolders: async () => {
		const q = query(
			collection(db, COLLECTION_NAME),
			where("isPublic", "==", true),
			orderBy("createdAt", "desc"),
		);
		const snap = await getDocs(q);
		return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Folder);
	},

	// 更新資料夾
	updateFolder: async (
		folderId: string,
		data: { name?: string; color?: string; isPublic?: boolean },
	) => {
		await updateDoc(doc(db, COLLECTION_NAME, folderId), data);
	},

	deleteFolder: async (folderId: string) => {
		await deleteDoc(doc(db, COLLECTION_NAME, folderId));
	},
};
