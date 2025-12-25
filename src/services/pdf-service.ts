import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MarkdownDisplay } from "@/components/shared/MarkdownDisplay";
import type { Deck } from "@/types/schema";
import { CardService } from "./card-service";

// Helper: Shuffle array (Only for legacy data compatibility)
function shuffle<T>(array: T[]): T[] {
	return [...array].sort(() => Math.random() - 0.5);
}

// Helper: Convert number to A, B, C, D
function toLetter(index: number) {
	return String.fromCharCode(65 + index);
}

// Helper: Fetch all CSS of the current page
function getAppStyles() {
	const styles = Array.from(
		document.querySelectorAll('style, link[rel="stylesheet"]'),
	)
		.map((node) => node.outerHTML)
		.join("\n");
	return styles;
}

function parseMarkdown(text: string) {
	if (!text) return "";
	// Render using our shared component to ensure consistency (including highlighter)
	return renderToStaticMarkup(
		React.createElement(MarkdownDisplay, { content: text }),
	);
}

export const PdfService = {
	generatePrintView: async (decks: Deck[]) => {
		const deckData = await Promise.all(
			decks.map(async (deck) => {
				const cards = await CardService.getCardsByDeck(deck.id);
				const processedCards = cards.map((card) => {
					if (card.type === "choice") {
						const answer = card.content.answer || "";
						const options = card.content.options || [];

						let finalOptions: string[];

						// If choice array already includes answer, it's the new format (fixed order ABCD)
						// Use original array directly without shuffling
						if (options.includes(answer)) {
							finalOptions = options;
						} else {
							// Old format (options only contain distractors), need to merge and shuffle
							finalOptions = shuffle([answer, ...options]);
						}

						return { ...card, _shuffledOptions: finalOptions };
					}
					return card;
				});
				return { deck, cards: processedCards };
			}),
		);

		const printWindow = window.open("", "_blank");
		if (!printWindow) {
			alert("Please allow popups to proceed with printing");
			return;
		}

		const appStyles = getAppStyles();

		const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nous Slate - Deck Export</title>
          
          ${appStyles}

          <style>
            @media print {
                body { 
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact; 
                }
            }

            body { 
                font-family: 'Noto Sans TC', sans-serif; 
                padding: 40px; 
                color: #1a1a1a; 
                line-height: 1.6;
                background: white !important; 
            }
            
            .page-break { page-break-after: always; }
            .no-break { break-inside: avoid; }
            
            h2 { 
                font-size: 20px; 
                background: #f3f4f6; 
                padding: 8px 15px; 
                border-left: 5px solid #374151; 
                margin-top: 30px; 
                margin-bottom: 15px;
                font-weight: bold;
            }
            
            .meta { color: #6b7280; font-size: 14px; margin-bottom: 30px; }
            
            .question-item { 
                margin-bottom: 25px; 
                padding-bottom: 15px; 
                border-bottom: 1px dashed #e5e7eb; 
            }
            
            .q-stem { font-size: 16px; margin-bottom: 12px; }
            .q-stem p { margin: 0; display: inline; } 
            .q-stem strong { color: #000; }

            /* Force table borders */
            table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
            th, td { border: 1px solid #333; padding: 6px 12px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: bold; }
            
            .q-type { 
                font-size: 12px; 
                color: #6b7280; 
                border: 1px solid #d1d5db; 
                padding: 2px 6px; 
                border-radius: 4px; 
                margin-right: 8px; 
                vertical-align: middle;
            }
            
            .options-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 10px; 
                margin-left: 20px; 
            }
            .option { font-size: 14px; }
            
            .zhuyin-box { display: inline-flex; border: 1px solid #000; margin-right: 6px; vertical-align: middle; }
            .zhuyin-char { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-family: 'Noto Serif TC', serif; font-size: 20px; border-right: 1px solid #000; }
            .zhuyin-bopo { width: 18px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: 10px; font-family: 'Noto Serif TC', serif; }
            .blank-char { color: transparent; }
            
            .answer-key { 
                background: #f9fafb; 
                padding: 20px; 
                border-radius: 8px; 
                border: 1px solid #e5e7eb; 
            }
            .ans-item { border-bottom: 1px solid #eee; }
            .ans-item:last-child { border-bottom: none; }
            
            .ans-label { font-weight: bold; color: #059669; font-size: 16px; }
            
            .ans-exp { margin-top: 8px; font-size: 14px; color: #374151; }
          </style>
        </head>
        <body>
          
          <!-- Test Paper -->
          <div class="section-questions">
            ${deckData
							.map(
								({ deck, cards }) => `
                <div class="deck-block no-break">
                    <h2>${deck.title}</h2>
                    <div class="meta">${deck.description || ""}</div>
                    
                    ${cards
											.map((card, index) => {
												// @ts-expect-error: _shuffledOptions is added dynamically during print view generation
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
													contentHtml = `<div>${blockHtml} <span style="font-size:12px;color:#666;">(Please fill in characters)</span></div>`;
												} else if (card.type === "fill_blank") {
													contentHtml = `<div style="border-bottom: 1px solid #333; display:inline-block; width: 100px;"></div>`;
												}

												const stemHtml = parseMarkdown(card.content.stem);

												return `
                            <div class="question-item no-break">
                                <div class="q-stem">
                                    <span class="q-type">${index + 1}</span>
                                    <span style="display:inline-block; vertical-align:top; width: 90%;">${stemHtml}</span>
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

          <!-- Answer Key -->
          <div class="section-answers">
             <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="border: none; color: #059669; border-color: #059669; font-size: 24px; font-weight: bold; border-bottom: 2px solid #059669; padding-bottom: 10px;">Answer Key & Analysis</h1>
            </div>

            ${deckData
							.map(
								({ deck, cards }) => `
                <div class="deck-block no-break">
                    <h2>${deck.title} - Answers</h2>
                    <div class="answer-key">
                    ${cards
											.map((card, index) => {
												let answerText = card.content.answer || "";

												if (card.type === "choice") {
													// @ts-expect-error: _shuffledOptions is added dynamically during print view generation
													const opts = card._shuffledOptions || [];
													const ansIndex = opts.indexOf(
														card.content.answer || "",
													);
													answerText =
														ansIndex !== -1 ? toLetter(ansIndex) : "No Answer";
												} else if (
													card.type === "term" ||
													card.type === "dictation"
												) {
													const blocks = card.content.blocks || [];
													answerText = blocks.map((b) => b.char).join("");
												}

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
               setTimeout(() => window.print(), 800);
            }
          </script>
        </body>
      </html>
    `;

		printWindow.document.write(htmlContent);
		printWindow.document.close();
	},
};
