import { createShuffledDeck } from "../tarot/draw";
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

export type SelfViewDeckState = {
	deck: CardId[];
	drawnCards: DrawnCard[];
	flippedIndices: Set<number>;
};
