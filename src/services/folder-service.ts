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
	// 1. 建立資料夾
	createFolder: async (userId: string, name: string) => {
		const docRef = await addDoc(collection(db, COLLECTION_NAME), {
			ownerId: userId,
			name,
			createdAt: serverTimestamp(),
		});
		return { id: docRef.id, name };
	},

	// 2. 取得使用者的資料夾列表
	getUserFolders: async (userId: string) => {
		const q = query(
			collection(db, COLLECTION_NAME),
			where("ownerId", "==", userId),
			orderBy("createdAt", "asc"),
		);
		const snap = await getDocs(q);
		return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Folder);
	},

	// 3. 刪除資料夾 (注意：這裡只刪除資料夾本身)
	// 您需要在前端邏輯處理：刪除資料夾後，裡面的 Decks 要變成「未分類」還是「一起刪除」
	deleteFolder: async (folderId: string) => {
		await deleteDoc(doc(db, COLLECTION_NAME, folderId));
	},

	// 4. 重新命名資料夾
	renameFolder: async (folderId: string, newName: string) => {
		await updateDoc(doc(db, COLLECTION_NAME, folderId), {
			name: newName,
		});
	},
};
