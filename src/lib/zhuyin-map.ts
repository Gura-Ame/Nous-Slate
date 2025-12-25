// src/lib/zhuyin-map.ts

export const INITIALS = [
	"ㄅ",
	"ㄆ",
	"ㄇ",
	"ㄈ",
	"ㄉ",
	"ㄊ",
	"ㄋ",
	"ㄌ",
	"ㄍ",
	"ㄎ",
	"ㄏ",
	"ㄐ",
	"ㄑ",
	"ㄒ",
	"ㄓ",
	"ㄔ",
	"ㄕ",
	"ㄖ",
	"ㄗ",
	"ㄘ",
	"ㄙ",
] as const;

export const MEDIALS = ["ㄧ", "ㄨ", "ㄩ"] as const;

export const FINALS = [
	"ㄚ",
	"ㄛ",
	"ㄜ",
	"ㄝ",
	"ㄞ",
	"ㄟ",
	"ㄠ",
	"ㄡ",
	"ㄢ",
	"ㄣ",
	"ㄤ",
	"ㄥ",
	"ㄦ",
] as const;

// Tone symbols officially recognized by the system
export const TONES = {
	1: " ", // First tone (Space bar)
	2: "ˊ", // Second tone (U+02CA)
	3: "ˇ", // Third tone (U+02C7)
	4: "ˋ", // Fourth tone (U+02CB)
	5: "˙", // Neutral tone (U+02D9)
} as const;

export const TONE_SYMBOLS = Object.values(TONES);

export const KEY_MAP: Record<string, string> = {
	// Initials
	"1": "ㄅ",
	q: "ㄆ",
	a: "ㄇ",
	z: "ㄈ",
	"2": "ㄉ",
	w: "ㄊ",
	s: "ㄋ",
	x: "ㄌ",
	e: "ㄍ",
	d: "ㄎ",
	c: "ㄏ",
	r: "ㄐ",
	f: "ㄑ",
	v: "ㄒ",
	"5": "ㄓ",
	t: "ㄔ",
	g: "ㄕ",
	b: "ㄖ",
	y: "ㄗ",
	h: "ㄘ",
	n: "ㄙ",

	// Medials & Finals
	u: "ㄧ",
	j: "ㄨ",
	m: "ㄩ",
	"8": "ㄚ",
	i: "ㄛ",
	k: "ㄜ",
	",": "ㄝ",
	"9": "ㄞ",
	o: "ㄟ",
	l: "ㄠ",
	".": "ㄡ",
	"0": "ㄢ",
	p: "ㄣ",
	";": "ㄤ",
	"/": "ㄥ",
	"-": "ㄦ",

	// Tone key mappings
	" ": TONES[1],
	"6": TONES[2],
	"3": TONES[3],
	"4": TONES[4],
	"7": TONES[5],
};

// Helper function: Determine if a character is a tone symbol
export const isToneSymbol = (char: string) =>
	(TONE_SYMBOLS as readonly string[]).includes(char);

// Helper function: Determine Bopomofo component type
export const getZhuyinType = (char: string) => {
	if ((INITIALS as readonly string[]).includes(char)) return "initial";
	if ((MEDIALS as readonly string[]).includes(char)) return "medial";
	if ((FINALS as readonly string[]).includes(char)) return "final";
	return "unknown";
};
