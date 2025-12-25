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
	// Create (Added color, isPublic)
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

	// Get user folders
	getUserFolders: async (userId: string) => {
		const q = query(
			collection(db, COLLECTION_NAME),
			where("ownerId", "==", userId),
			orderBy("createdAt", "asc"),
		);
		const snap = await getDocs(q);
		return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Folder);
	},

	// New: Get all public folders
	getPublicFolders: async () => {
		const q = query(
			collection(db, COLLECTION_NAME),
			where("isPublic", "==", true),
			orderBy("createdAt", "desc"),
		);
		const snap = await getDocs(q);
		return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Folder);
	},

	// Update folder
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
