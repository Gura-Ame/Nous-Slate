import { storage } from "@/lib/firebase";
import {
    getDownloadURL,
    ref,
    uploadBytes
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export const StorageService = {
  /**
   * 上傳圖片到 Firebase Storage
   * @param file 圖片檔案
   * @param pathPrefix 路徑前綴 (例如: "card-images")
   * @returns 下載連結 (URL)
   */
  uploadImage: async (file: File, pathPrefix: string = "card-images"): Promise<string> => {
    try {
      // 1. 驗證檔案類型
      if (!file.type.startsWith("image/")) {
        throw new Error("只能上傳圖片檔案");
      }

      // 2. 限制大小 (例如 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("圖片大小不能超過 5MB");
      }

      // 3. 產生唯一檔名 (避免覆蓋)
      // 結構: card-images/{uuid}_{filename}
      const extension = file.name.split('.').pop();
      const uniqueName = `${uuidv4()}.${extension}`;
      const storagePath = `${pathPrefix}/${uniqueName}`;
      const storageRef = ref(storage, storagePath);

      // 4. 上傳
      const snapshot = await uploadBytes(storageRef, file);

      // 5. 取得公開連結
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;

    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }
};