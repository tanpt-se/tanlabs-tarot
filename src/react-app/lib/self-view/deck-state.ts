import { createShuffledDeck } from "../tarot/draw";
import { loadCardImage, preloadTopOfDeck } from "../tarot/card-image";
import { loadSelfViewLiveSpread } from "../storage/self-view-live-spread-store";
import type { CardId } from "../tarot/deck";
import type { DrawnCard } from "../types/reading";

export const SELF_VIEW_SHUFFLE_MS = 780;

export function createFreshDeckState() {
	return {
		deck: createShuffledDeck(),
		drawnCards: [] as DrawnCard[],
		flippedIndices: new Set<number>(),
	};
}

export function loadPersistedDeckState() {
	const saved = loadSelfViewLiveSpread();
	if (!saved) return createFreshDeckState();

	preloadTopOfDeck(saved.deck);
	for (const card of saved.drawnCards) {
		void loadCardImage(card.id as CardId);
	}

	return {
		deck: saved.deck,
		drawnCards: saved.drawnCards,
		flippedIndices: new Set(saved.flippedIndices ?? []),
	};
}
