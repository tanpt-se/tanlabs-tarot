import {
	useCallback,
	useEffect,
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
	clearSelfViewLiveSpread,
	persistSelfViewLiveSpread,
} from "../lib/storage/self-view-live-spread-store";
import {
	SELF_VIEW_SHUFFLE_MS,
	createFreshDeckState,
	loadPersistedDeckState,
} from "../lib/self-view/deck-state";
import { SELF_VIEW_MAX_SPREAD_CARDS } from "../lib/self-view/spread-layout";
import { drawOneCard, reshuffleDeck } from "../lib/tarot/draw";
import { loadCardImage, preloadTopOfDeck } from "../lib/tarot/card-image";
import type { CardId } from "../lib/tarot/deck";
import type { DrawnCard } from "../lib/types/reading";
import type { SelfViewSession } from "../lib/types/self-view-session";
import { toggleSetIndex } from "../lib/utils/toggle-set-index";
import { SelfViewSessionContext } from "./self-view-session-context";

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

	const clearHistory = useCallback(() => {
		persist(() => []);
	}, [persist]);

	return { sessions, archiveSpread, clearHistory };
}

export function SelfViewSessionProvider({ children }: { children: ReactNode }) {
	const { sessions, archiveSpread, clearHistory } = useSelfViewHistoryState();
	const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
	const [initialSpread] = useState(() => loadPersistedDeckState());
	const [deck, setDeck] = useState<CardId[]>(() => initialSpread.deck);
	const [drawnCards, setDrawnCards] = useState<DrawnCard[]>(
		() => initialSpread.drawnCards,
	);
	const [flippedIndices, setFlippedIndices] = useState<Set<number>>(
		() => initialSpread.flippedIndices,
	);
	const [shuffling, setShuffling] = useState(false);
	const overlayCountRef = useRef(0);

	useEffect(() => {
		persistSelfViewLiveSpread(deck, drawnCards, flippedIndices);
	}, [deck, drawnCards, flippedIndices]);

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
		clearSelfViewLiveSpread();
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

	const archiveAndResetLiveSpread = useCallback(() => {
		archiveCurrentSpread();
		resetLiveSpread();
	}, [archiveCurrentSpread, resetLiveSpread]);

	const handleClearHistory = useCallback(() => {
		clearHistory();
		setViewingSessionId(null);
	}, [clearHistory]);

	const shuffleDeck = useCallback(() => {
		if (isViewingHistory || shuffling || deck.length === 0) {
			return;
		}

		setShuffling(true);
		window.setTimeout(() => {
			setDeck((current) => {
				const next = reshuffleDeck(current);
				preloadTopOfDeck(next);
				return next;
			});
			setShuffling(false);
		}, SELF_VIEW_SHUFFLE_MS);
	}, [deck.length, isViewingHistory, shuffling]);

	const drawOne = useCallback(() => {
		if (isViewingHistory || shuffling) return;
		if (drawnCards.length >= SELF_VIEW_MAX_SPREAD_CARDS) return;

		const result = drawOneCard(deck);
		if (!result) return;

		const nextIndex = drawnCards.length;
		const nextFlippedIndices = new Set(flippedIndices);
		nextFlippedIndices.add(nextIndex);

		setDeck(result.deck);
		setDrawnCards((current) => [...current, result.card]);
		setFlippedIndices(nextFlippedIndices);

		void loadCardImage(result.card.id as CardId);
		preloadTopOfDeck(result.deck);
	}, [deck, drawnCards.length, flippedIndices, isViewingHistory, shuffling]);

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
			archiveAndResetLiveSpread,
			clearHistory: handleClearHistory,
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
			archiveAndResetLiveSpread,
			handleClearHistory,
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
