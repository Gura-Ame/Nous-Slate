import { doc, getDoc, writeBatch } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase";

// Set chunk size for each fragment (default 800KB, reserved space for metadata)
const CHUNK_SIZE = 800 * 1024;

export const StorageService = {
	/**
	 * Upload image (Chunked mode)
	 * Convert image to Base64, then split into multiple documents for Firestore
	 */
	uploadImage: async (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			if (!file.type.startsWith("image/")) {
				reject(new Error("Only image files are allowed"));
				return;
			}

			const reader = new FileReader();
			reader.readAsDataURL(file);

			reader.onload = async (event) => {
				try {
					const fullBase64 = event.target?.result as string;
					const imageId = uuidv4();
					const totalLength = fullBase64.length;
					const totalChunks = Math.ceil(totalLength / CHUNK_SIZE);

					const batch = writeBatch(db);

					// Start chunking
					for (let i = 0; i < totalChunks; i++) {
						const start = i * CHUNK_SIZE;
						const end = Math.min(fullBase64.length, start + CHUNK_SIZE);
						const chunkData = fullBase64.slice(start, end);

						// Store in 'image_chunks' collection
						// Doc ID structure: {imageId}_{index}
						const chunkRef = doc(db, "image_chunks", `${imageId}_${i}`);
						batch.set(chunkRef, {
							imageId,
							index: i,
							data: chunkData,
							// Store metadata only in the first chunk (optional)
							...(i === 0 ? { totalChunks, createdAt: new Date() } : {}),
						});
					}

					await batch.commit();

					// Return special format URL: "chunked:{id}:{count}"
					// This format tells the loader to fetch chunks.
					resolve(`chunked:${imageId}:${totalChunks}`);
				} catch (e) {
					reject(e);
				}
			};

			reader.onerror = () => reject(new Error("Failed to read file"));
		});
	},

	/**
	 * Read image (Reassemble chunks)
	 * If regular URL or Base64, return directly; if chunked ID, fetch and assemble.
	 */
	loadImage: async (src: string): Promise<string> => {
		if (!src.startsWith("chunked:")) {
			return src; // Regular URL or legacy Base64, return directly
		}

		const parts = src.split(":");
		const imageId = parts[1];
		const totalChunks = parseInt(parts[2], 10);

		// Download all chunks in parallel
		const promises = [];
		for (let i = 0; i < totalChunks; i++) {
			const chunkRef = doc(db, "image_chunks", `${imageId}_${i}`);
			promises.push(getDoc(chunkRef));
		}

		const snapshots = await Promise.all(promises);

		// Assemble string in order
		let fullBase64 = "";
		for (const snap of snapshots) {
			if (snap.exists()) {
				fullBase64 += snap.data().data;
			}
		}

		return fullBase64;
	},
};
