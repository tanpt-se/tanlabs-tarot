import {
	createContext,
	useCallback,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import {
	createSelfViewSession,
	loadSelfViewHistory,
	saveSelfViewHistory,
} from "../lib/storage/self-view-history-store";
import {
	SELF_VIEW_SHUFFLE_MS,
	createFreshDeckState,
} from "../lib/self-view/deck-state";
import { drawOneCard, reshuffleDeck } from "../lib/tarot/draw";
import type { CardId } from "../lib/tarot/deck";
import type { DrawnCard } from "../lib/types/reading";
import type { SelfViewSession } from "../lib/types/self-view-session";
import { toggleSetIndex } from "../lib/utils/toggle-set-index";

type SelfViewSessionContextValue = {
	sessions: SelfViewSession[];
	viewingSessionId: string | null;
	isViewingHistory: boolean;
	displayedCards: DrawnCard[];
	deck: CardId[];
	drawnCards: DrawnCard[];
	flippedIndices: Set<number>;
	shuffling: boolean;
	setViewingSessionId: (id: string | null) => void;
	shuffleDeck: () => void;
	drawOne: () => void;
	toggleCardFlip: (index: number) => void;
	backToCurrent: () => void;
	resetLiveSpread: () => void;
	archiveCurrentSpread: () => void;
	registerOverlay: () => () => void;
	hasOverlayOpen: () => boolean;
};

const SelfViewSessionContext = createContext<SelfViewSessionContextValue | null>(
	null,
);

function useSelfViewHistoryState() {
	const [sessions, setSessions] = useState<SelfViewSession[]>(
		() => loadSelfViewHistory().sessions,
	);

	const persist = useCallback(
		(updater: (current: SelfViewSession[]) => SelfViewSession[]) => {
			setSessions((current) => {
				const next = updater(current);
				saveSelfViewHistory({ sessions: next });
				return next;
			});
		},
		[],
	);

	const archiveSpread = useCallback(
		(cards: DrawnCard[]) => {
			if (cards.length === 0) return null;

			const session = createSelfViewSession(cards);
			persist((current) => [session, ...current]);
			return session;
		},
		[persist],
	);

	return { sessions, archiveSpread };
}

export function SelfViewSessionProvider({ children }: { children: ReactNode }) {
	const { sessions, archiveSpread } = useSelfViewHistoryState();
	const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
	const [deck, setDeck] = useState<CardId[]>(() => createFreshDeckState().deck);
	const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
	const [flippedIndices, setFlippedIndices] = useState<Set<number>>(
		() => new Set(),
	);
	const [shuffling, setShuffling] = useState(false);
	const overlayCountRef = useRef(0);

	const viewingSession = useMemo(
		() => sessions.find((session) => session.id === viewingSessionId) ?? null,
		[sessions, viewingSessionId],
	);
	const isViewingHistory = viewingSession !== null;
	const displayedCards = isViewingHistory ? viewingSession.cards : drawnCards;

	const registerOverlay = useCallback(() => {
		overlayCountRef.current += 1;
		return () => {
			overlayCountRef.current = Math.max(0, overlayCountRef.current - 1);
		};
	}, []);

	const hasOverlayOpen = useCallback(
		() => overlayCountRef.current > 0,
		[],
	);

	const resetLiveSpread = useCallback(() => {
		const fresh = createFreshDeckState();
		setDeck(fresh.deck);
		setDrawnCards(fresh.drawnCards);
		setFlippedIndices(fresh.flippedIndices);
		setViewingSessionId(null);
	}, []);

	const archiveCurrentSpread = useCallback(() => {
		if (drawnCards.length > 0) {
			archiveSpread(drawnCards);
		}
	}, [archiveSpread, drawnCards]);

	const shuffleDeck = useCallback(() => {
		if (isViewingHistory || shuffling || deck.length === 0) return;

		setShuffling(true);
		window.setTimeout(() => {
			setDeck((current) => reshuffleDeck(current));
			setShuffling(false);
		}, SELF_VIEW_SHUFFLE_MS);
	}, [deck.length, isViewingHistory, shuffling]);

	const drawOne = useCallback(() => {
		if (isViewingHistory) return;

		const result = drawOneCard(deck);
		if (!result) return;

		setDeck(result.deck);
		const nextIndex = drawnCards.length;
		setDrawnCards((current) => [...current, result.card]);
		setFlippedIndices((current) => {
			const next = new Set(current);
			next.add(nextIndex);
			return next;
		});
	}, [deck, drawnCards.length, isViewingHistory]);

	const toggleCardFlip = useCallback(
		(index: number) => {
			if (isViewingHistory) return;
			setFlippedIndices((current) => toggleSetIndex(current, index));
		},
		[isViewingHistory],
	);

	const backToCurrent = useCallback(() => {
		setViewingSessionId(null);
	}, []);

	const value = useMemo(
		() => ({
			sessions,
			viewingSessionId,
			isViewingHistory,
			displayedCards,
			deck,
			drawnCards,
			flippedIndices,
			shuffling,
			setViewingSessionId,
			shuffleDeck,
			drawOne,
			toggleCardFlip,
			backToCurrent,
			resetLiveSpread,
			archiveCurrentSpread,
			registerOverlay,
			hasOverlayOpen,
		}),
		[
			sessions,
			viewingSessionId,
			isViewingHistory,
			displayedCards,
			deck,
			drawnCards,
			flippedIndices,
			shuffling,
			shuffleDeck,
			drawOne,
			toggleCardFlip,
			backToCurrent,
			resetLiveSpread,
			archiveCurrentSpread,
			registerOverlay,
			hasOverlayOpen,
		],
	);

	return (
		<SelfViewSessionContext.Provider value={value}>
			{children}
		</SelfViewSessionContext.Provider>
	);
}

export { SelfViewSessionContext };
