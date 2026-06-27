import { createContext } from "react";
import type { CardId } from "../lib/tarot/deck";
import type { DrawnCard } from "../lib/types/reading";
import type { SelfViewSession } from "../lib/types/self-view-session";

export type SelfViewSessionContextValue = {
	sessions: SelfViewSession[];
	viewingSessionId: string | null;
	isViewingHistory: boolean;
	displayedCards: DrawnCard[];
	deck: CardId[];
	drawnCards: DrawnCard[];
	flippedIndices: Set<number>;
	shuffling: boolean;
	revealingIndex: number | null;
	setViewingSessionId: (id: string | null) => void;
	shuffleDeck: () => void;
	drawOne: () => void;
	completeCardReveal: (index: number) => void;
	completeRevealFlip: (index: number) => void;
	toggleCardFlip: (index: number) => void;
	backToCurrent: () => void;
	resetLiveSpread: () => void;
	archiveCurrentSpread: () => void;
	registerOverlay: () => () => void;
	hasOverlayOpen: () => boolean;
};

export const SelfViewSessionContext =
	createContext<SelfViewSessionContextValue | null>(null);
