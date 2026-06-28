import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useLocale } from "../../hooks/use-locale";
import { useSfx } from "../../hooks/use-sfx";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useReversedUprightHold } from "../../hooks/use-reversed-upright-hold";
import { useSelfViewDrawLayout } from "../../hooks/use-self-view-draw-layout";
import {
	isAppShortcutBlocked,
	shouldIgnoreAppShortcut,
} from "../../lib/keyboard/app-shortcut";
import { parseSelfViewCardSlotKey } from "../../lib/keyboard/self-view-card-slot";
import { preloadTopOfDeck } from "../../lib/tarot/card-image";
import {
	canSelfViewZoom,
	clearSelfViewSpreadLayoutCache,
	getSelfViewSpreadLayout,
	getSelfViewSpreadStyle,
	SELF_VIEW_MAX_SPREAD_CARDS,
} from "../../lib/self-view/spread-layout";
import { useSelfViewSession } from "../../hooks/use-self-view-session";
import { SelfViewDrawBar } from "../self-view/SelfViewDrawBar";
import {
	SelfViewCardFocusOverlay,
	type SelfViewCardFocusOverlayHandle,
} from "./SelfViewCardFocusOverlay";
import { TarotCard } from "./TarotCard";
import { SelfViewCardSlot } from "./SelfViewCardSlot";
import {
	freezeCardFocusRect,
	type CardFocusRect,
} from "../../lib/animation/card-focus";
import { CARD_FLIP_DURATION_MS } from "../../lib/animation/constants";

type FocusPhase = "zoomed" | "closing" | "handoff";

type FocusState = {
	index: number;
	origin: CardFocusRect;
	phase: FocusPhase;
};

export function SelfViewDeckScreen() {
	const { labels } = useLocale();
	const { playFlip, playCardDeal } = useSfx();
	const {
		deck,
		drawnCards,
		flippedIndices,
		revealingIndex,
		isViewingHistory,
		displayedCards,
		drawOne,
		commitPendingDraw,
		revealCard,
		completeRevealFlip,
		toggleCardFlip,
		backToCurrent,
		hasOverlayOpen,
	} = useSelfViewSession();
	const { held: reversedUprightHeld } = useReversedUprightHold();
	const [focusState, setFocusState] = useState<FocusState | null>(null);
	const [layoutMetricsRevision, setLayoutMetricsRevision] = useState(0);
	const focusOverlayRef = useRef<SelfViewCardFocusOverlayHandle>(null);

	useEffect(() => {
		const refreshLayoutMetrics = () => {
			clearSelfViewSpreadLayoutCache();
			setLayoutMetricsRevision((revision) => revision + 1);
		};

		window.addEventListener("resize", refreshLayoutMetrics);

		const screen = document.querySelector(".self-view-screen");
		const observer =
			screen &&
			new ResizeObserver(() => {
				refreshLayoutMetrics();
			});

		if (screen && observer) {
			observer.observe(screen);
		}

		return () => {
			window.removeEventListener("resize", refreshLayoutMetrics);
			observer?.disconnect();
		};
	}, []);

	const handleRevealSequenceComplete = useCallback(
		(index: number) => {
			completeRevealFlip(index);
		},
		[completeRevealFlip],
	);

	const completeCardReveal = useCallback(
		(index: number) => {
			playFlip();
			revealCard(index);
		},
		[playFlip, revealCard],
	);

	const pendingSlotIndex = useMemo(() => {
		if (isViewingHistory || revealingIndex === null) return null;
		if (revealingIndex >= drawnCards.length) return revealingIndex;
		return null;
	}, [drawnCards.length, isViewingHistory, revealingIndex]);

	const spreadSlotCount =
		pendingSlotIndex !== null ? drawnCards.length + 1 : drawnCards.length;

	const spreadLayout = useMemo(
		() => getSelfViewSpreadLayout(spreadSlotCount),
		[layoutMetricsRevision, spreadSlotCount],
	);
	const spreadStyle = useMemo(
		() => getSelfViewSpreadStyle(spreadLayout),
		[spreadLayout],
	);

	const {
		cardRootsRef,
		spreadWrapRef,
		registerCardRoot,
		layoutAnimating,
		layoutFlight,
		spreadSurfaceStyle,
		handleRevealFlipComplete,
	} = useSelfViewDrawLayout({
		isViewingHistory,
		displayedCardsLength: displayedCards.length,
		drawnCardsLength: drawnCards.length,
		revealingIndex,
		commitPendingDraw,
		playCardDeal,
		onRevealFlipComplete: handleRevealSequenceComplete,
		spreadSlotCount,
		spreadStyle,
		spreadLayoutRows: spreadLayout.rows,
	});

	// Safety: if reveal chain stalls after commit, flip and unlock draw.
	useEffect(() => {
		if (isViewingHistory || revealingIndex === null) return;
		if (revealingIndex >= drawnCards.length) return;

		const revealTimeout = window.setTimeout(() => {
			if (!flippedIndices.has(revealingIndex)) {
				completeCardReveal(revealingIndex);
			}
		}, 400);

		const unlockTimeout = window.setTimeout(() => {
			handleRevealFlipComplete(revealingIndex);
		}, CARD_FLIP_DURATION_MS + 800);

		return () => {
			window.clearTimeout(revealTimeout);
			window.clearTimeout(unlockTimeout);
		};
	}, [
		completeCardReveal,
		drawnCards.length,
		flippedIndices,
		handleRevealFlipComplete,
		isViewingHistory,
		revealingIndex,
	]);

	const focusStateRef = useRef(focusState);

	useEffect(() => {
		focusStateRef.current = focusState;
	}, [focusState]);

	const closeFocus = useCallback(async () => {
		await focusOverlayRef.current?.close();
	}, []);

	const openCardFocus = useCallback(
		(index: number) => {
			if (revealingIndex === index) return;
			if (!canSelfViewZoom(displayedCards.length)) return;

			const isFaceUp = isViewingHistory || flippedIndices.has(index);
			if (!isFaceUp) return;

			if (focusState?.index === index) {
				void closeFocus();
				return;
			}

			const node = cardRootsRef.current.get(index);
			if (!node) return;

			setFocusState({
				index,
				origin: freezeCardFocusRect(node.getBoundingClientRect()),
				phase: "zoomed",
			});
		},
		[
			cardRootsRef,
			closeFocus,
			displayedCards.length,
			flippedIndices,
			focusState?.index,
			isViewingHistory,
			revealingIndex,
		],
	);

	const handleCardPress = useCallback(
		(index: number) => {
			if (revealingIndex === index) return;

			const isFaceUp = isViewingHistory || flippedIndices.has(index);
			if (isFaceUp) {
				openCardFocus(index);
				return;
			}

			if (!isViewingHistory) {
				toggleCardFlip(index);
			}
		},
		[flippedIndices, isViewingHistory, openCardFocus, revealingIndex, toggleCardFlip],
	);

	const handleEscape = useCallback(() => {
		if (document.querySelector(".game-modal-overlay")) return;
		if (document.querySelector(".self-view-history-drawer")) return;

		if (focusStateRef.current) {
			void closeFocus();
			return;
		}

		if (isViewingHistory) {
			backToCurrent();
		}
	}, [backToCurrent, closeFocus, isViewingHistory]);

	useEscapeKey(handleEscape, true);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- reset focus on spread context change
		setFocusState(null);
	}, [displayedCards.length, isViewingHistory]);

	useEffect(() => {
		if (!isViewingHistory && deck.length > 0) {
			preloadTopOfDeck(deck);
		}
	}, [deck, isViewingHistory]);

	const warmNextDraw = useCallback(() => {
		preloadTopOfDeck(deck);
	}, [deck]);

	const getCloseOrigin = useCallback(() => {
		if (!focusState) {
			return { left: 0, top: 0, width: 0, height: 0 };
		}

		const node = cardRootsRef.current.get(focusState.index);
		if (node) {
			return freezeCardFocusRect(node.getBoundingClientRect());
		}

		return focusState.origin;
	}, [cardRootsRef, focusState]);

	const handleFocusClosingStart = useCallback(() => {
		setFocusState((current) =>
			current ? { ...current, phase: "closing" } : current,
		);
	}, []);

	const handleFocusHandoff = useCallback(() => {
		setFocusState((current) =>
			current ? { ...current, phase: "handoff" } : current,
		);
	}, []);

	const drawDisabled =
		layoutAnimating ||
		revealingIndex !== null ||
		deck.length === 0 ||
		drawnCards.length >= SELF_VIEW_MAX_SPREAD_CARDS;

	const handleCardZoomHotkey = useCallback(
		(slotIndex: number) => {
			if (isAppShortcutBlocked(hasOverlayOpen)) return;
			if (slotIndex < 0 || slotIndex >= displayedCards.length) return;

			openCardFocus(slotIndex);
		},
		[displayedCards.length, hasOverlayOpen, openCardFocus],
	);

	const handleDrawHotkey = useCallback(() => {
		if (isAppShortcutBlocked(hasOverlayOpen)) return;
		if (isViewingHistory || focusState || drawDisabled) return;

		warmNextDraw();
		drawOne();
	}, [
		drawDisabled,
		drawOne,
		focusState,
		hasOverlayOpen,
		isViewingHistory,
		warmNextDraw,
	]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (shouldIgnoreAppShortcut(event)) return;

			if (event.key === " ") {
				event.preventDefault();
				handleDrawHotkey();
				return;
			}

			const slotIndex = parseSelfViewCardSlotKey(event.key);
			if (slotIndex === null) return;

			event.preventDefault();
			handleCardZoomHotkey(slotIndex);
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [handleCardZoomHotkey, handleDrawHotkey]);

	const spreadItems = useMemo((): Array<
		| { kind: "card"; card: (typeof drawnCards)[number]; index: number }
		| { kind: "placeholder"; index: number }
	> => {
		const items: Array<
			| { kind: "card"; card: (typeof drawnCards)[number]; index: number }
			| { kind: "placeholder"; index: number }
		> = drawnCards.map((card, index) => ({
			kind: "card",
			card,
			index,
		}));

		if (pendingSlotIndex !== null) {
			items.push({ kind: "placeholder", index: pendingSlotIndex });
		}

		return items;
	}, [drawnCards, pendingSlotIndex]);

	const spreadRows = useMemo(() => {
		const rows: (typeof spreadItems)[] = [];
		let offset = 0;

		for (const rowSize of spreadLayout.rowSizes) {
			rows.push(spreadItems.slice(offset, offset + rowSize));
			offset += rowSize;
		}

		return rows;
	}, [spreadItems, spreadLayout.rowSizes]);

	const isZoomActive =
		focusState !== null && focusState.phase !== "handoff";

	const renderSpreadCard = useCallback(
		(card: (typeof displayedCards)[number], index: number) => {
			const isFaceUp = isViewingHistory || flippedIndices.has(index);
			const isInFocus =
				focusState?.index === index &&
				(focusState.phase === "zoomed" || focusState.phase === "closing");
			const isFocusHandoff =
				focusState?.index === index && focusState.phase === "handoff";

			const cardClassName = [
				isInFocus ? "tarot-card--in-focus" : "",
				isFocusHandoff ? "tarot-card--focus-handoff" : "",
			]
				.filter(Boolean)
				.join(" ");

			const isRevealing =
				!isViewingHistory &&
				revealingIndex === index &&
				flippedIndices.has(index) === false;

			return (
				<TarotCard
					key={`self-view-card-${index}`}
					card={card}
					index={index}
					className={cardClassName || undefined}
					flipMode="css-3d"
					loadWhenVisible={isViewingHistory}
					flipped={isFaceUp}
					preloadFront={isFaceUp || isRevealing}
					revealLoading={isRevealing}
					sparkleOnReveal={isRevealing}
					onRevealReady={completeCardReveal}
					onRevealFlipComplete={handleRevealFlipComplete}
					disableHoverPreview
					uprightPreview={
						reversedUprightHeld &&
						!isZoomActive &&
						isFaceUp &&
						card.reversed
					}
					onRootElement={(element) => registerCardRoot(index, element)}
					onPress={handleCardPress}
				/>
			);
		},
		[
			completeCardReveal,
			flippedIndices,
			focusState,
			handleCardPress,
			handleRevealFlipComplete,
			isViewingHistory,
			isZoomActive,
			registerCardRoot,
			reversedUprightHeld,
			revealingIndex,
		],
	);

	const renderSpreadSlot = useCallback(
		(item: (typeof spreadItems)[number]) => {
			if (item.kind === "placeholder") {
				return (
					<SelfViewCardSlot
						key={`self-view-card-${item.index}`}
						index={item.index}
						onRootElement={registerCardRoot}
					/>
				);
			}

			return renderSpreadCard(item.card, item.index);
		},
		[registerCardRoot, renderSpreadCard],
	);

	const hasSpread =
		spreadSlotCount > 0 || isViewingHistory || revealingIndex !== null;

	return (
		<>
			<div
				className="self-view-screen"
				data-has-spread={hasSpread ? "true" : undefined}
				data-layout-animating={layoutAnimating ? "true" : undefined}
			>
				{!isViewingHistory && spreadSlotCount === 0 ? (
					<p className="self-view-empty-placeholder">
						{labels.selfViewCardPlaceholder}
					</p>
				) : null}

				{hasSpread ? (
					<div
						ref={spreadWrapRef}
						className="self-view-spread-wrap"
						data-layout-rows={
							spreadLayout.rows > 0 ? spreadLayout.rows : undefined
						}
						data-layout-animating={layoutAnimating ? "true" : undefined}
						style={spreadSurfaceStyle as CSSProperties}
					>
						<div
							className="self-view-spread"
							data-count={spreadSlotCount || undefined}
							data-layout-flight={layoutFlight ? "true" : undefined}
							data-layout-rows={
								spreadLayout.rows > 0 ? spreadLayout.rows : undefined
							}
							data-viewing={isViewingHistory ? "true" : undefined}
							data-upright-held={
								reversedUprightHeld && !isZoomActive ? "true" : undefined
							}
							style={spreadSurfaceStyle as CSSProperties}
						>
							{isViewingHistory && displayedCards.length === 0 ? (
								<p className="self-view-spread__empty">
									{labels.selfViewHistoryEmpty}
								</p>
							) : (
								spreadRows.map((rowItems, rowIndex) => (
									<div
										key={`row-${rowIndex}`}
										className="self-view-spread__row"
										data-row-size={rowItems.length}
									>
										{rowItems.map((item) => renderSpreadSlot(item))}
									</div>
								))
							)}
						</div>
					</div>
				) : null}
			</div>

			{focusState && canSelfViewZoom(displayedCards.length) ? (
				<SelfViewCardFocusOverlay
					ref={focusOverlayRef}
					card={displayedCards[focusState.index]!}
					index={focusState.index}
					flipped={
						isViewingHistory || flippedIndices.has(focusState.index)
					}
					origin={focusState.origin}
					getCloseOrigin={getCloseOrigin}
					onClosingStart={handleFocusClosingStart}
					onHandoff={handleFocusHandoff}
					onClosed={() => setFocusState(null)}
				/>
			) : null}

			<SelfViewDrawBar
				drawDisabled={drawDisabled}
				isLoading={revealingIndex !== null}
				onDraw={drawOne}
				onWarmDraw={warmNextDraw}
			/>
		</>
	);
}
