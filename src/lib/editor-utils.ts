// src/lib/editor-utils.ts
// src/lib/editor-utils.ts
import type { CardContent } from "@/types/schema";

// Reconstructs Bopomofo string from blocks structure (e.g. "ㄧㄣˊ ㄏㄤˊ")
export const reconstructZhuyin = (blocks: CardContent["blocks"]) => {
	if (!blocks) return "";
	return blocks
		.map((b) => {
			const z = b.zhuyin;
			// Convert space tone symbol back to empty string
			const tone = z.tone === " " ? "" : z.tone;
			return z.initial + z.medial + z.final + tone;
		})
		.join(" ");
};
