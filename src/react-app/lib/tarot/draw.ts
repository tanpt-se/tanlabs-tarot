import type { DrawnCard } from "../types/reading";
import { ALL_CARD_IDS, type CardId, isMajorCard } from "./deck";

const REVERSED_CHANCE = 0.3;

function shuffle<T>(items: T[]): T[] {
	const deck = [...items];
	for (let i = deck.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	return deck;
}

export function createShuffledDeck(): CardId[] {
	return shuffle([...ALL_CARD_IDS]);
}

export function reshuffleDeck(deck: CardId[]): CardId[] {
	return shuffle(deck);
}

export function drawOneCard(
	deck: CardId[],
): { card: DrawnCard; deck: CardId[] } | null {
	if (deck.length === 0) return null;

	const nextDeck = [...deck];
	const id = nextDeck.pop()!;

	return {
		card: {
			id,
			arcana: isMajorCard(id) ? "major" : "minor",
			reversed: Math.random() < REVERSED_CHANCE,
		},
		deck: nextDeck,
	};
}

export function drawCards(count: number): DrawnCard[] {
	const picked = shuffle([...ALL_CARD_IDS]).slice(0, count);
	return picked.map((id) => ({
		id,
		arcana: isMajorCard(id) ? "major" : "minor",
		reversed: Math.random() < REVERSED_CHANCE,
	}));
}
