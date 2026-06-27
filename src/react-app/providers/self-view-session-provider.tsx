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
	SELF_VIEW_SHUFFLE_MS,
	createFreshDeckState,
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
	const [revealingIndex, setRevealingIndex] = useState<number | null>(null);
	const [pendingDrawImageReady, setPendingDrawImageReady] = useState(false);
	const pendingDrawCardRef = useRef<DrawnCard | null>(null);
	const overlayCountRef = useRef(0);
	const revealingIndexRef = useRef<number | null>(null);

	useEffect(() => {
		revealingIndexRef.current = revealingIndex;
	}, [revealingIndex]);

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
		setRevealingIndex(null);
		setPendingDrawImageReady(false);
		pendingDrawCardRef.current = null;
		setViewingSessionId(null);
	}, []);

	const archiveCurrentSpread = useCallback(() => {
		if (drawnCards.length > 0) {
			archiveSpread(drawnCards);
		}
	}, [archiveSpread, drawnCards]);

	const shuffleDeck = useCallback(() => {
		if (isViewingHistory || shuffling || revealingIndex !== null || deck.length === 0) {
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
	}, [deck.length, isViewingHistory, revealingIndex, shuffling]);

	const clearRevealLock = useCallback((index: number) => {
		if (revealingIndexRef.current !== index) return;
		setRevealingIndex(null);
	}, []);

	const drawOne = useCallback(() => {
		if (isViewingHistory || revealingIndex !== null) return;
		if (drawnCards.length >= SELF_VIEW_MAX_SPREAD_CARDS) return;

		const result = drawOneCard(deck);
		if (!result) return;

		const nextIndex = drawnCards.length;
		setDeck(result.deck);
		pendingDrawCardRef.current = result.card;
		setPendingDrawImageReady(false);
		setRevealingIndex(nextIndex);

		void loadCardImage(result.card.id as CardId).then(() => {
			if (revealingIndexRef.current !== nextIndex) return;
			setPendingDrawImageReady(true);
		});
	}, [deck, drawnCards.length, isViewingHistory, revealingIndex]);

	const commitPendingDraw = useCallback(() => {
		const card = pendingDrawCardRef.current;
		const index = revealingIndexRef.current;
		if (!card || index === null) return;

		setDrawnCards((current) => [...current, card]);
		setFlippedIndices((current) => {
			const next = new Set(current);
			next.add(index);
			return next;
		});
		pendingDrawCardRef.current = null;
		setPendingDrawImageReady(false);
		clearRevealLock(index);
	}, [clearRevealLock]);

	const toggleCardFlip = useCallback(
		(index: number) => {
			if (isViewingHistory || revealingIndex === index) return;
			setFlippedIndices((current) => toggleSetIndex(current, index));
		},
		[isViewingHistory, revealingIndex],
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
			revealingIndex,
			pendingDrawImageReady,
			setViewingSessionId,
			shuffleDeck,
			drawOne,
			commitPendingDraw,
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
			revealingIndex,
			pendingDrawImageReady,
			shuffleDeck,
			drawOne,
			commitPendingDraw,
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
