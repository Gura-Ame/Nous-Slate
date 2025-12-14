// src/lib/tts.ts

export function speak(text: string, lang?: string) {
	if (!window.speechSynthesis) {
		console.warn("Browser does not support speech synthesis");
		return;
	}

	// 停止目前正在講的話 (避免連點時重疊)
	window.speechSynthesis.cancel();

	const utterance = new SpeechSynthesisUtterance(text);

	// 如果沒有指定語言，嘗試自動偵測
	if (!lang) {
		// 簡單判斷：如果包含中文字元，就用中文，否則預設英文
		const hasChinese = /[\u4e00-\u9fa5]/.test(text);
		lang = hasChinese ? "zh-TW" : "en-US";
	}

	utterance.lang = lang;
	utterance.rate = 0.8; // 稍微慢一點點，比較清楚

	window.speechSynthesis.speak(utterance);
}
