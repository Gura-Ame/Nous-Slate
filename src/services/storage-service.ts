import { doc, getDoc, writeBatch } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase";

// 設定每個碎片的大小 (預設 800KB，保留一些空間給 metadata)
const CHUNK_SIZE = 800 * 1024;

export const StorageService = {
	/**
	 * 上傳圖片 (分片模式)
	 * 將圖片轉為 Base64 後，切割成多個文件存入 Firestore
	 */
	uploadImage: async (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			if (!file.type.startsWith("image/")) {
				reject(new Error("只能上傳圖片檔案"));
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

					// 開始切片
					for (let i = 0; i < totalChunks; i++) {
						const start = i * CHUNK_SIZE;
						const end = Math.min(fullBase64.length, start + CHUNK_SIZE);
						const chunkData = fullBase64.slice(start, end);

						// 存入集合 'image_chunks'
						// 文件 ID 結構: {imageId}_{index}
						const chunkRef = doc(db, "image_chunks", `${imageId}_${i}`);
						batch.set(chunkRef, {
							imageId,
							index: i,
							data: chunkData,
							// 只在第一片存 metadata 方便管理 (可選)
							...(i === 0 ? { totalChunks, createdAt: new Date() } : {}),
						});
					}

					await batch.commit();

					// 回傳特殊格式的 URL，格式: "chunked:{id}:{count}"
					// 這樣我們在顯示時就知道要去抓碎片
					resolve(`chunked:${imageId}:${totalChunks}`);
				} catch (e) {
					reject(e);
				}
			};

			reader.onerror = () => reject(new Error("讀取檔案失敗"));
		});
	},

	/**
	 * 讀取圖片 (重組分片)
	 * 如果是一般 URL 或 Base64，直接回傳；如果是 chunked ID，則去下載並組裝
	 */
	loadImage: async (src: string): Promise<string> => {
		if (!src.startsWith("chunked:")) {
			return src; // 一般網址或舊的 Base64，直接回傳
		}

		const parts = src.split(":");
		const imageId = parts[1];
		const totalChunks = parseInt(parts[2], 10);

		// 平行下載所有碎片
		const promises = [];
		for (let i = 0; i < totalChunks; i++) {
			const chunkRef = doc(db, "image_chunks", `${imageId}_${i}`);
			promises.push(getDoc(chunkRef));
		}

		const snapshots = await Promise.all(promises);

		// 依序組裝字串
		let fullBase64 = "";
		for (const snap of snapshots) {
			if (snap.exists()) {
				fullBase64 += snap.data().data;
			}
		}

		return fullBase64;
	},
};
