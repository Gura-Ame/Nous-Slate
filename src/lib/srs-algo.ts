// src/lib/srs-algo.ts

export interface SRSItem {
	interval: number; // Interval in days (first time is 1)
	repetition: number; // Consecutive correct count
	efactor: number; // Easiness factor (default 2.5)
}

// Grading scale (0-5)
// 0-2: Forgot/Incorrect (Reset)
// 3: Hard
// 4: Good
// 5: Easy
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
		// Correct answer logic
		if (repetition === 0) {
			interval = 1;
		} else if (repetition === 1) {
			interval = 6;
		} else {
			interval = Math.round(interval * efactor);
		}
		repetition += 1;
	} else {
		// Incorrect answer logic (Reset)
		repetition = 0;
		interval = 1;
	}

	// Update Easiness Factor (E-Factor)
	// Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
	efactor = efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

	// EF cannot be less than 1.3
	if (efactor < 1.3) efactor = 1.3;

	return { interval, repetition, efactor };
}
