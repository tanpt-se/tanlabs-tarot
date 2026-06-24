import type { UiLabels } from "./types";

export const en: UiLabels = {
	appName: "Tanlabs Tarot",
	cardBackAlt: "Card back",
	homeDescription:
		"Ask a question, draw cards, and receive guidance from the tarot. Every reading is saved so you can revisit it anytime.",
	homePlaceholder: "What would you like to ask?",
	homeStartReading: "Begin reading",
	homeHistoryTitle: "Journey",
	homeJournal: (count) =>
		count === 1 ? "Journal · 1 reading" : `Journal · ${count} readings`,
	homeJournalClose: "Close journal",
	homeViewReading: "View",
	chatPlaceholder: "Ask another question...",
	clearHistory: "Clear history",
	sendQuestion: "Send question",
	readingLabel: "Reading",
	statusPending: "Waiting to draw cards...",
	statusDrawing: "Drawing cards...",
	statusInterpreting: "Interpreting...",
	statusComplete: "Complete",
	cardsDrawn: (count) =>
		count === 1 ? "1 card drawn" : `${count} cards drawn`,
	noCardsYet: "No cards yet — coming in the draw step",
	musicOn: "Turn background music on",
	musicOff: "Turn background music off",
	musicLabel: "Background music",
	volumeLabel: "Volume",
	language: "Language",
	localeEn: "English",
	localeVi: "Tiếng Việt",
	openSettings: "Settings",
	closeSettings: "Close settings",
	loading: "Loading",
	settingsTitle: "Settings",
	settingsTabLanguage: "Language",
	settingsTabMode: "Mode",
	settingsTabSound: "Sound",
	settingsTabAbout: "About",
	settingsAboutDescription:
		"Tanlabs Tarot is a tarot reading experience with a game-like ritual flow — shuffle, draw, reveal, and reflect.",
	settingsAboutDisclaimer:
		"Tarot readings are for reflection and entertainment. They do not replace professional advice.",
	settingsVersion: "Version 0.1",
	selfViewMode: "I'm Tarot Reader",
	selfViewModeDesc:
		"Spread cards only — no narrator, questions, or card meanings.",
	selfViewModeOn: "Self-view on",
	selfViewModeOff: "Self-view off",
	selfViewDrawOne: "Draw a card",
	selfViewShuffleDeck: "Shuffle deck",
	selfViewSpreadEmpty: "Drawn cards appear here",
	selfViewCardsLeft: (count) =>
		count === 1 ? "1 card left" : `${count} cards left`,
	selfViewReset: "Reset",
	selfViewResetTitle: "Start a new spread?",
	selfViewResetMessage:
		"Your current cards will be saved to history. Start fresh with a new deck?",
	selfViewResetConfirm: "Yes, start over",
	selfViewResetCancel: "No, go back",
	selfViewExitTitle: "Leave self-view?",
	selfViewExitMessage:
		"Your current cards will be saved to history before you return to guided mode.",
	selfViewExitConfirm: "Yes, leave",
	selfViewExitCancel: "No, stay",
	selfViewHistoryTitle: "Past spreads",
	selfViewHistoryEntry: (count) =>
		count === 1 ? "1 card spread" : `${count}-card spread`,
	selfViewHistoryClose: "Close past spreads",
	selfViewBackToCurrent: "Back to current (Esc)",
	selfViewHistoryEmpty: "This spread had no cards",
	spreadBack: "Back",
	spreadYourQuestion: "Your question",
	spreadAskQuestion: "What do you seek?",
	spreadChooseType: "Choose your spread",
	spreadSingle: "1 card",
	spreadSingleDesc: "One card for a focused answer",
	spreadThree: "3 cards",
	spreadThreeDesc: "Past, present, and future",
	spreadSix: "6-card in-depth",
	spreadSixDesc: "A deeper reading across six positions",
	spreadShuffleNarration:
		"You shuffle the deck. The cards whisper in the candlelight...",
	spreadReady: "I am ready",
	spreadReveal: "Reveal",
	spreadConceal: "Face down",
	spreadRevealAll: "Reveal all",
	spreadSummary: "Summary",
	spreadReading: "Reading",
	spreadComplete: "Reading complete",
	spreadNewReading: "New reading",
	spreadGoHome: "Return home",
	spreadPositionPast: "Past",
	spreadPositionPresent: "Present",
	spreadPositionFuture: "Future",
	spreadPositionChallenge: "Challenge",
	spreadPositionAdvice: "Advice",
	spreadPositionOutcome: "Outcome",
	spreadPositionSingle: "Your card",
	spreadCardReversed: "Reversed",
	spreadCardUpright: "Upright",
	spreadDealingCards: (dealt, total) =>
		dealt === 0
			? `Dealing ${total} cards...`
			: `Dealing cards... ${dealt}/${total}`,
	narratorName: "The Veiled Reader",
	narratorAlt: "Mysterious hooded tarot reader",
	narratorSkip: "[ >> skip ]",
	narratorSkipLabel: "skip",
	narratorHomeGreeting:
		"Welcome, seeker. Whisper your question to the cards — I will guide you through the ritual.",
	narratorSpreadQuestion:
		"Speak your question softly. The cards are listening.\n\nExample: What does my love life look like ahead?",
	narratorSpreadSetup:
		"Choose how deeply you wish to look — one card, three cards, or six for an in-depth reading.",
	narratorSpreadShuffle:
		"Listen… the deck is waking. When you feel ready, the cards will be dealt.",
	narratorSpreadDrawing:
		"The deck is choosing for you. Watch the cards fall into place.",
	narratorSpreadReveal:
		"Tap each card to turn it over. When every card is open, ask for the summary.",
	narratorSpreadInterpret:
		"Every card is open. Press Summary when you are ready for the full reading.",
	narratorSpreadComplete:
		"The veil lifts for now. Carry what you have learned into the waking world.",
};
