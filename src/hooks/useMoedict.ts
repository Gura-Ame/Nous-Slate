import { useState } from "react";
import { toast } from "sonner";

export interface MoedictHeteronym {
	bopomofo: string;
	definition: string;
}

export interface MoedictResult {
	title: string;
	heteronyms: MoedictHeteronym[];
}

interface MoedictRawResponse {
	title: string;
	heteronyms?: Array<{
		bopomofo?: string;
		definitions?: Array<{ def: string }>;
	}>;
}

export function useMoedict() {
	const [loading, setLoading] = useState(false);

	const search = async (word: string): Promise<MoedictResult | null> => {
		if (!word) return null;
		setLoading(true);
		try {
			const response = await fetch(
				`https://www.moedict.tw/uni/${encodeURIComponent(word)}`,
			);
			if (!response.ok) throw new Error("Not found");

			const data = (await response.json()) as MoedictRawResponse;

			// 解析所有異讀字 (Heteronyms)
			const heteronyms: MoedictHeteronym[] = (data.heteronyms || [])
				.map((h) => {
					const defs = h.definitions || [];
					let definition: string = "";

					if (defs.length === 0) definition = "無解釋資料";
					if (defs.length > 1) {
						definition = defs
							.slice(0, 3) // 限制最多顯示 3 個解釋，避免太長
							.map((d, index) => {
								// 移除 HTML 標籤
								const cleanDef = d.def.replace(/<[^>]*>?/gm, "");
								// 加上序號 (1. 2. 3.)
								return `${index + 1}. ${cleanDef}`;
							})
							.join("\n");
					} else if (defs.length === 1) {
						definition = defs[0].def.replace(/<[^>]*>?/gm, "");
					}

					return {
						bopomofo: h.bopomofo || "",
						definition: definition,
					};
				})
				.filter((h: MoedictHeteronym) => h.bopomofo);

			if (heteronyms.length === 0) return null;

			return {
				title: data.title,
				heteronyms,
			};
		} catch (error) {
			console.warn("Moedict search failed:", error);
			toast.error("萌典查無此詞");
			return null;
		} finally {
			setLoading(false);
		}
	};

	return { search, loading };
}
