// src/lib/tts.ts

export function speak(text: string, lang?: string) {
	if (!window.speechSynthesis) {
		console.warn("Browser does not support speech synthesis");
		return;
	}

	// Stop current speech (avoids overlapping when clicked rapidly)
	window.speechSynthesis.cancel();

	const utterance = new SpeechSynthesisUtterance(text);

	// If no language specified, attempt auto-detection
	if (!lang) {
		// Simple heuristic: if contains Chinese characters, use zh-TW, else default to en-US
		const hasChinese = /[\u4e00-\u9fa5]/.test(text);
		lang = hasChinese ? "zh-TW" : "en-US";
	}

	utterance.lang = lang;
	utterance.rate = 0.8; // Set slightly slower for better clarity

	window.speechSynthesis.speak(utterance);
}
