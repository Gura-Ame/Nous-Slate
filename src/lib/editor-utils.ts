// src/lib/editor-utils.ts
// src/lib/editor-utils.ts
import type { CardContent } from "@/types/schema";

// 將 blocks 結構轉回注音字串 (e.g. "ㄧㄣˊ ㄏㄤˊ")
export const reconstructZhuyin = (blocks: CardContent["blocks"]) => {
	if (!blocks) return "";
	return blocks
		.map((b) => {
			const z = b.zhuyin;
			// 將空白鍵聲調轉回空字串
			const tone = z.tone === " " ? "" : z.tone;
			return z.initial + z.medial + z.final + tone;
		})
		.join(" ");
};
