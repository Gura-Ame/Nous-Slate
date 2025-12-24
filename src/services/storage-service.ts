import { env } from "@/lib/env";

export const StorageService = {
	/**
	 * 上傳圖片到 ImgBB 圖床
	 * @param file 圖片檔案
	 * @returns 圖片的公開 URL
	 */
	uploadImage: async (file: File): Promise<string> => {
		// 1. 基本驗證
		if (!file.type.startsWith("image/")) {
			throw new Error("只能上傳圖片檔案");
		}

		// ImgBB 免費版限制單檔 32MB，非常夠用
		if (file.size > 32 * 1024 * 1024) {
			throw new Error("圖片大小不能超過 32MB");
		}

		try {
			// 2. 準備 FormData
			const formData = new FormData();
			// ImgBB 的欄位名稱是 "image"
			formData.append("image", file);
			// 可以設定過期時間 (秒)，不設就是永久
			// formData.append("expiration", "600");

			// 3. 呼叫 ImgBB API (Key 帶在 URL 參數)
			const response = await fetch(
				`https://api.imgbb.com/1/upload?key=${env.VITE_IMGBB_API_KEY}`,
				{
					method: "POST",
					body: formData,
				},
			);

			const data = await response.json();

			if (!data.success) {
				// ImgBB 錯誤訊息通常在 data.error.message
				throw new Error(data.error?.message || "ImgBB 上傳失敗");
			}

			// 4. 回傳圖片連結 (data.data.url 是原圖，data.data.display_url 是顯示用圖)
			// 建議用 display_url 或 url
			return data.data.url;
		} catch (error) {
			console.error("Upload failed:", error);
			throw new Error("圖片上傳失敗，請檢查網路或 API Key");
		}
	},
};
