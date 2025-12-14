// src/lib/srs-algo.ts

export interface SRSItem {
	interval: number; // 間隔天數 (第一次是 1)
	repetition: number; // 連續答對次數
	efactor: number; // 易度因子 (預設 2.5)
}

// 評分等級 (0-5)
// 0-2: 忘記/錯誤 (重來)
// 3: 困難 (Hard)
// 4: 普通 (Good)
// 5: 簡單 (Easy)
export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

export const initialSRS: SRSItem = {
	interval: 0,
	repetition: 0,
	efactor: 2.5,
};

/**
 * SuperMemo-2 (SM-2) Algorithm implementation
 */
export function calculateSRS(current: SRSItem, grade: Grade): SRSItem {
	let { interval, repetition, efactor } = current;

	if (grade >= 3) {
		// 答對邏輯
		if (repetition === 0) {
			interval = 1;
		} else if (repetition === 1) {
			interval = 6;
		} else {
			interval = Math.round(interval * efactor);
		}
		repetition += 1;
	} else {
		// 答錯邏輯 (Reset)
		repetition = 0;
		interval = 1;
	}

	// 更新易度因子 (E-Factor)
	// 公式: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
	efactor = efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

	// EF 不能小於 1.3
	if (efactor < 1.3) efactor = 1.3;

	return { interval, repetition, efactor };
}
