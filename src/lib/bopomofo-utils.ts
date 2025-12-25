// src/lib/bopomofo-utils.ts
import type { BopomofoData } from "@/types/schema";
import { FINALS, INITIALS, MEDIALS } from "./zhuyin-map";

// Helper functions to determine character types
const isInitial = (c: string) => (INITIALS as readonly string[]).includes(c);
const isMedial = (c: string) => (MEDIALS as readonly string[]).includes(c);
const isFinal = (c: string) => (FINALS as readonly string[]).includes(c);
const isTone = (c: string) => [" ", "ˊ", "ˇ", "ˋ", "˙"].includes(c);

/**
 * Parses a single character's Bopomofo string (e.g., "ㄏㄤˊ") into a structured object.
 */
export function parseOneBopomofo(str: string): BopomofoData {
	let remaining = str;
	let tone = ""; // Default to first tone

	// 1. Capture tone (Usually at the end, except neutral tone which might be at the start)
	const lastChar = remaining.slice(-1);
	if (isTone(lastChar)) {
		tone = lastChar;
		remaining = remaining.slice(0, -1);
	} else if (remaining.startsWith("˙")) {
		// Handle cases where neutral tone symbol is at the start (less common, but defensive)
		tone = "˙";
		remaining = remaining.slice(1);
	}

	// 2. Sequentially capture initial, medial, and final components
	let initial = "";
	let medial = "";
	let final = "";

	// Try matching initial (first character)
	if (remaining.length > 0 && isInitial(remaining[0])) {
		initial = remaining[0];
		remaining = remaining.slice(1);
	}

	// Try matching medial
	if (remaining.length > 0 && isMedial(remaining[0])) {
		medial = remaining[0];
		remaining = remaining.slice(1);
	}

	// Remaining part is the final
	if (remaining.length > 0 && isFinal(remaining[0])) {
		final = remaining[0];
	} else if (remaining.length > 0) {
		// If anything remains, it might be a misidentified medial or compound final; simple fallback here
		if (!medial && isMedial(remaining[0])) medial = remaining[0];
		else final = remaining;
	}

	return { initial, medial, final, tone };
}

/**
 * Parses a full phrase's Bopomofo string (e.g., "ㄧㄣˊ ㄏㄤˊ") into an array of objects.
 */
export function parseBopomofoString(fullString: string): BopomofoData[] {
	// Moedict typically uses spaces to separate characters
	return fullString.split(" ").map((s) => parseOneBopomofo(s.trim()));
}
