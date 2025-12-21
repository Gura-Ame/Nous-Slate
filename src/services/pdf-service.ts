import { renderToStaticMarkup } from "react-dom/server"; // 引入 React 轉 HTML 工具
import ReactMarkdown from "react-markdown"; // 引入 Markdown 組件
import { CardService } from "./card-service";
import type { Deck } from "@/types/schema";
import React from "react";
import remarkGfm from "remark-gfm";

// 輔助：洗牌陣列
function shuffle<T>(array: T[]): T[] {
	return [...array].sort(() => Math.random() - 0.5);
}

// 輔助：將數字轉為 A, B, C, D
function toLetter(index: number) {
	return String.fromCharCode(65 + index);
}

// 核心修改：使用 ReactMarkdown + renderToStaticMarkup 轉 HTML
function parseMarkdown(text: string) {
	if (!text) return "";
	// 將 React 組件渲染成靜態 HTML 字串
	return renderToStaticMarkup(
		React.createElement(
			"div",
			{ className: "markdown-content" },
			React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, text),
		),
	);
}

export const PdfService = {
	generatePrintView: async (decks: Deck[]) => {
		// 1. 準備資料
		const deckData = await Promise.all(
			decks.map(async (deck) => {
				const cards = await CardService.getCardsByDeck(deck.id);
				const processedCards = cards.map((card) => {
					if (card.type === "choice") {
						const answer = card.content.answer || "";
						const options = card.content.options || [];
						let allOptions: string[];
						if (options.includes(answer)) {
							allOptions = options; // 固定順序
						} else {
							allOptions = shuffle([answer, ...options]); // 舊版洗牌
						}
						return { ...card, _shuffledOptions: allOptions };
					}
					return card;
				});
				return { deck, cards: processedCards };
			}),
		);

		const printWindow = window.open("", "_blank");
		if (!printWindow) {
			alert("請允許彈出式視窗以進行列印");
			return;
		}

		// 2. 建構 HTML
		const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nous Slate - 題庫匯出</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&family=Noto+Serif+TC:wght@400;700&display=swap');
            body { font-family: 'Noto Sans TC', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            
            .page-break { page-break-after: always; }
            .no-break { break-inside: avoid; }
            
            h2 { font-size: 20px; background: #f0f0f0; padding: 8px 15px; border-left: 5px solid #333; margin-top: 30px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
            
            .question-item { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px dashed #eee; }
            .q-stem { font-size: 16px; font-weight: bold; margin-bottom: 12px; }
            
            /* Markdown 樣式修正 (因為 ReactMarkdown 會產出 p 標籤) */
            .q-stem p { margin: 0; display: inline; } 
            .q-stem strong { color: #000; }
            
            .q-type { font-size: 12px; color: #888; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px; margin-right: 8px; vertical-align: middle;}
            
            .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-left: 20px; }
            .option { font-size: 14px; }
            
            .zhuyin-box { display: inline-flex; border: 1px solid #000; margin-right: 6px; vertical-align: middle; }
            .zhuyin-char { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-family: 'Noto Serif TC', serif; font-size: 20px; border-right: 1px solid #000; }
            .zhuyin-bopo { width: 18px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: 10px; font-family: 'Noto Serif TC', serif; }
            .blank-char { color: transparent; }
            
            .answer-key { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .ans-item { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
            .ans-item:last-child { border-bottom: none; }
            .ans-label { font-weight: bold; color: #059669; font-size: 16px; }
            
            .ans-exp { color: #4b5563; font-size: 14px; margin-top: 8px; line-height: 1.8; }
            /* 解析內容的 Markdown 樣式修正 */
            .ans-exp p { margin: 4px 0; }
            .ans-exp ul, .ans-exp ol { margin: 4px 0; padding-left: 20px; }
            .ans-exp li { margin-bottom: 2px; }
            .ans-exp strong { color: #111; }
            .ans-exp code { background: #eee; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          
          <!-- 第一部分：試題卷 -->
          <div class="section-questions">
            ${deckData
							.map(
								({ deck, cards }) => `
                <div class="deck-block no-break">
                    <h2>${deck.title}</h2>
                    <div class="meta">${deck.description || ""}</div>
                    
                    ${cards
											.map((card, index) => {
												// @ts-ignore
												const opts = card._shuffledOptions || [];
												let contentHtml = "";

												if (card.type === "choice") {
													contentHtml = `
                                <div class="options-grid">
                                    ${opts
																			.map(
																				(opt: string, i: number) => `
                                        <div class="option">
                                            <strong>(${toLetter(i)})</strong> ${opt}
                                        </div>
                                    `,
																			)
																			.join("")}
                                </div>
                            `;
												} else if (
													card.type === "term" ||
													card.type === "dictation"
												) {
													const blocks = card.content.blocks || [];
													const blockHtml = blocks
														.map(
															(b) => `
                                <div class="zhuyin-box">
                                    <div class="zhuyin-char blank-char">?</div>
                                    <div class="zhuyin-bopo">
                                        <span>${
																					b.zhuyin.initial +
																					b.zhuyin.medial +
																					b.zhuyin.final
																				}</span>
                                        <span>${b.zhuyin.tone}</span>
                                    </div>
                                </div>
                             `,
														)
														.join("");
													contentHtml = `<div>${blockHtml} <span style="font-size:12px;color:#666;">(請填入國字)</span></div>`;
												} else if (card.type === "fill_blank") {
													contentHtml = `<div style="border-bottom: 1px solid #333; display:inline-block; width: 100px;"></div>`;
												}

												// 使用 Library 轉換 Markdown
												const stemHtml = parseMarkdown(card.content.stem);

												return `
                            <div class="question-item no-break">
                                <div class="q-stem">
                                    <span class="q-type">${index + 1}</span>
                                    <!-- 這裡插入轉換後的 HTML -->
                                    <span style="display:inline-block; vertical-align:top;">${stemHtml}</span>
                                </div>
                                ${contentHtml}
                            </div>
                        `;
											})
											.join("")}
                </div>
            `,
							)
							.join("")}
          </div>

          <div class="page-break"></div>

          <!-- 第二部分：解析卷 -->
          <div class="section-answers">
             <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="border: none; color: #059669; border-color: #059669;">解答與解析</h1>
            </div>

            ${deckData
							.map(
								({ deck, cards }) => `
                <div class="deck-block no-break">
                    <h2>${deck.title} - 解答</h2>
                    <div class="answer-key">
                    ${cards
											.map((card, index) => {
												let answerText = card.content.answer || "";

												if (card.type === "choice") {
													// @ts-ignore
													const opts = card._shuffledOptions || [];
													const ansIndex = opts.indexOf(
														card.content.answer || "",
													);
													answerText =
														ansIndex !== -1 ? toLetter(ansIndex) : "無答案";
												} else if (
													card.type === "term" ||
													card.type === "dictation"
												) {
													const blocks = card.content.blocks || [];
													answerText = blocks.map((b) => b.char).join("");
												}

												// 使用 Library 轉換解析 Markdown
												const meaningHtml = parseMarkdown(
													card.content.meaning || "",
												);

												return `
                            <div class="ans-item">
                                <span class="ans-label">${index + 1}. ${answerText}</span>
                                <div class="ans-exp">
                                    ${meaningHtml}
                                </div>
                            </div>
                        `;
											})
											.join("")}
                    </div>
                </div>
            `,
							)
							.join("")}
          </div>

          <script>
            window.onload = () => {
               setTimeout(() => window.print(), 500);
            }
          </script>
        </body>
      </html>
    `;

		printWindow.document.write(htmlContent);
		printWindow.document.close();
	},
};
