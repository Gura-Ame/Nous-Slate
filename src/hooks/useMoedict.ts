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

			// Parse all heteronyms
			const heteronyms: MoedictHeteronym[] = (data.heteronyms || [])
				.map((h) => {
					const defs = h.definitions || [];
					let definition: string = "";

					if (defs.length === 0) definition = "No explanation data available";
					if (defs.length > 1) {
						definition = defs
							.slice(0, 3) // Limit to 3 definitions to avoid excessive length
							.map((d, index) => {
								// Remove HTML tags
								const cleanDef = d.def.replace(/<[^>]*>?/gm, "");
								// Add sequence numbers (1. 2. 3.)
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
			toast.error("Term not found in Moedict");
			return null;
		} finally {
			setLoading(false);
		}
	};

	return { search, loading };
}
