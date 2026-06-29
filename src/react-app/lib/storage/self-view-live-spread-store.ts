import { ALL_CARD_IDS, type CardId } from "../tarot/deck";
import type { DrawnCard } from "../types/reading";

const STORAGE_KEY = "tanlabs-tarot:self-view-live-spread";
const ALL_CARD_ID_SET = new Set<string>(ALL_CARD_IDS);
const FULL_DECK_SIZE = ALL_CARD_IDS.length;

export type SelfViewLiveSpreadSnapshot = {
	deck: CardId[];
	drawnCards: DrawnCard[];
	flippedIndices: number[];
};

function isDrawnCard(value: unknown): value is DrawnCard {
	if (!value || typeof value !== "object") return false;

	const card = value as DrawnCard;
	return (
		typeof card.id === "string" &&
		(card.arcana === "major" || card.arcana === "minor") &&
		typeof card.reversed === "boolean"
	);
}

function isValidSnapshot(snapshot: SelfViewLiveSpreadSnapshot): boolean {
	if (snapshot.drawnCards.length === 0) return false;
	if (!Array.isArray(snapshot.deck) || !Array.isArray(snapshot.flippedIndices)) {
		return false;
	}
	if (!snapshot.drawnCards.every(isDrawnCard)) return false;

	const cardIds = new Set<string>();
	for (const cardId of snapshot.deck) {
		if (typeof cardId !== "string" || !ALL_CARD_ID_SET.has(cardId)) {
			return false;
		}
		if (cardIds.has(cardId)) return false;
		cardIds.add(cardId);
	}

	for (const card of snapshot.drawnCards) {
		if (!ALL_CARD_ID_SET.has(card.id)) return false;
		if (cardIds.has(card.id)) return false;
		cardIds.add(card.id);
	}

	if (cardIds.size !== FULL_DECK_SIZE) return false;

	const maxIndex = snapshot.drawnCards.length - 1;
	return snapshot.flippedIndices.every(
		(index) => Number.isInteger(index) && index >= 0 && index <= maxIndex,
	);
}

export function loadSelfViewLiveSpread(): SelfViewLiveSpreadSnapshot | null {
	if (typeof sessionStorage === "undefined") return null;

	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const parsed = JSON.parse(raw) as SelfViewLiveSpreadSnapshot;
		if (!isValidSnapshot(parsed)) return null;

		return parsed;
	} catch {
		return null;
	}
}

export function saveSelfViewLiveSpread(snapshot: SelfViewLiveSpreadSnapshot): void {
	if (typeof sessionStorage === "undefined") return;
	if (snapshot.drawnCards.length === 0) return;

	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
	} catch {
		// Private mode / quota exceeded — skip silently.
	}
}

export function clearSelfViewLiveSpread(): void {
	if (typeof sessionStorage === "undefined") return;

	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		// Ignore storage errors.
	}
}

export function persistSelfViewLiveSpread(
	deck: CardId[],
	drawnCards: DrawnCard[],
	flippedIndices: Set<number>,
): void {
	if (drawnCards.length === 0) return;

	saveSelfViewLiveSpread({
		deck,
		drawnCards,
		flippedIndices: [...flippedIndices],
	});
}
