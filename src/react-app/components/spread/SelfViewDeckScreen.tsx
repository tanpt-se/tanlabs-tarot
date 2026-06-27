import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { flushSync } from "react-dom";
import { useLocale } from "../../hooks/use-locale";
import { useSfx } from "../../hooks/use-sfx";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useReversedUprightHold } from "../../hooks/use-reversed-upright-hold";
import {
	isAppShortcutBlocked,
	shouldIgnoreAppShortcut,
} from "../../lib/keyboard/app-shortcut";
import { parseSelfViewCardSlotKey } from "../../lib/keyboard/self-view-card-slot";
import {
	captureSelfViewCardRects,
	killSelfViewCardInPlaceReveal,
	killSelfViewSlotReservation,
	playSelfViewCardInPlaceReveal,
	playSelfViewSlotReservation,
	prepareSelfViewSlotReservation,
	type SelfViewCardRevealHandle,
	type SelfViewPreparedSlotReservation,
	type SelfViewSlotReservationHandle,
} from "../../lib/animation/self-view-card-entrance";
import { preloadTopOfDeck } from "../../lib/tarot/card-image";
import {
	canSelfViewZoom,
	getSelfViewSpreadLayout,
	getSelfViewSpreadStyle,
	SELF_VIEW_MAX_SPREAD_CARDS,
} from "../../lib/self-view/spread-layout";
import { useSelfViewSession } from "../../hooks/use-self-view-session";
import { GameButton } from "../GameButton";
import { CloseButton } from "../CloseButton";
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

type FocusPhase = "zoomed" | "closing" | "handoff";

type FocusState = {
	index: number;
	origin: CardFocusRect;
	phase: FocusPhase;
};

export function SelfViewDeckScreen() {
	const { labels } = useLocale();
	const { playFlip } = useSfx();
	const {
		deck,
		drawnCards,
		flippedIndices,
		revealingIndex,
		isViewingHistory,
		displayedCards,
		drawOne,
		commitPendingDraw,
		pendingDrawImageReady,
		toggleCardFlip,
		backToCurrent,
		hasOverlayOpen,
	} = useSelfViewSession();
	const { held: reversedUprightHeld } = useReversedUprightHold();
	const [focusState, setFocusState] = useState<FocusState | null>(null);
	const cardRootsRef = useRef<Map<number, HTMLDivElement>>(new Map());
	const spreadWrapRef = useRef<HTMLDivElement>(null);
	const focusOverlayRef = useRef<SelfViewCardFocusOverlayHandle>(null);
	const prevSpreadCountRef = useRef(0);
	const cardRectsRef = useRef<Map<number, DOMRect>>(new Map());
	const layoutAnimRef = useRef<SelfViewSlotReservationHandle | null>(null);
	const preparedAnimRef = useRef<SelfViewPreparedSlotReservation | null>(null);
	const revealAnimRef = useRef<SelfViewCardRevealHandle | null>(null);
	const layoutAnimFrameRef = useRef<number | null>(null);
	const layoutAnimatingRef = useRef(false);
	const [slotReservationSettled, setSlotReservationSettled] = useState(false);
	const pendingRevealIndexRef = useRef<number | null>(null);
	const drawSfxPlayedRef = useRef<Set<number>>(new Set());
	const [layoutAnimating, setLayoutAnimating] = useState(false);

	const pendingSlotIndex = useMemo(() => {
		if (isViewingHistory || revealingIndex === null) return null;
		if (revealingIndex >= drawnCards.length) return revealingIndex;
		return null;
	}, [drawnCards.length, isViewingHistory, revealingIndex]);

	const spreadSlotCount =
		pendingSlotIndex !== null ? drawnCards.length + 1 : drawnCards.length;

	const focusStateRef = useRef(focusState);
	focusStateRef.current = focusState;

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
		setFocusState(null);
	}, [displayedCards.length, isViewingHistory]);

	useEffect(() => {
		if (revealingIndex !== null) {
			setSlotReservationSettled(false);
		}
	}, [revealingIndex]);

	useEffect(() => {
		if (isViewingHistory) {
			drawSfxPlayedRef.current.clear();
			setSlotReservationSettled(false);
			return;
		}

		if (!slotReservationSettled || !pendingDrawImageReady) {
			return;
		}

		if (revealingIndex === null) {
			return;
		}

		pendingRevealIndexRef.current = revealingIndex;
		setSlotReservationSettled(false);
		commitPendingDraw();
	}, [
		commitPendingDraw,
		isViewingHistory,
		pendingDrawImageReady,
		revealingIndex,
		slotReservationSettled,
	]);

	useLayoutEffect(() => {
		const killActiveSlotAnimation = () => {
			const animated =
				preparedAnimRef.current?.animatedElements ?? [];
			killSelfViewSlotReservation(layoutAnimRef.current, animated);
			layoutAnimRef.current = null;
			preparedAnimRef.current = null;
		};

		const killActiveRevealAnimation = () => {
			const index = revealAnimRef.current?.cardIndex ?? null;
			killSelfViewCardInPlaceReveal(
				revealAnimRef.current,
				index !== null ? cardRootsRef.current.get(index) ?? null : null,
			);
			revealAnimRef.current = null;
		};

		if (isViewingHistory) {
			killActiveSlotAnimation();
			killActiveRevealAnimation();
			prevSpreadCountRef.current = displayedCards.length;
			cardRectsRef.current = captureSelfViewCardRects(cardRootsRef.current);
			return;
		}

		const pendingSlot =
			revealingIndex !== null && revealingIndex >= drawnCards.length;
		const nextCount = pendingSlot
			? revealingIndex + 1
			: displayedCards.length;
		const previousCount = prevSpreadCountRef.current;

		if (nextCount === previousCount + 1 && pendingSlot) {
			killActiveSlotAnimation();

			flushSync(() => {
				layoutAnimatingRef.current = true;
				setLayoutAnimating(true);
			});

			const onSlotReserved = () => {
				layoutAnimatingRef.current = false;
				setLayoutAnimating(false);
				cardRectsRef.current = captureSelfViewCardRects(
					cardRootsRef.current,
				);
				const node = spreadWrapRef.current;
				if (node) {
					const height = node.clientHeight;
					if (height > 0) {
						setSpreadViewportH(height);
					}
				}
				setSlotReservationSettled(true);
			};

			const startReservation = (
				prepared: SelfViewPreparedSlotReservation,
			) => {
				preparedAnimRef.current = prepared;
				layoutAnimRef.current = playSelfViewSlotReservation(
					{
						cardRoots: cardRootsRef.current,
						onComplete: onSlotReserved,
					},
					prepared,
				);
			};

			const prepared = prepareSelfViewSlotReservation({
				cardRoots: cardRootsRef.current,
				slotIndex: nextCount - 1,
				oldCardRects: cardRectsRef.current,
			});

			if (prepared) {
				startReservation(prepared);
			} else if (!cardRootsRef.current.has(nextCount - 1)) {
				layoutAnimFrameRef.current = requestAnimationFrame(() => {
					layoutAnimFrameRef.current = null;
					const retryPrepared = prepareSelfViewSlotReservation({
						cardRoots: cardRootsRef.current,
						slotIndex: nextCount - 1,
						oldCardRects: cardRectsRef.current,
					});
					if (retryPrepared) {
						startReservation(retryPrepared);
					} else {
						onSlotReserved();
					}
				});
			} else {
				onSlotReserved();
			}
		} else if (nextCount !== previousCount) {
			cardRectsRef.current = captureSelfViewCardRects(cardRootsRef.current);
		} else {
			cardRectsRef.current = captureSelfViewCardRects(cardRootsRef.current);
		}

		prevSpreadCountRef.current = nextCount;

		return () => {
			if (layoutAnimFrameRef.current !== null) {
				cancelAnimationFrame(layoutAnimFrameRef.current);
				layoutAnimFrameRef.current = null;
			}
			killActiveSlotAnimation();
			layoutAnimatingRef.current = false;
			setLayoutAnimating(false);
		};
	}, [drawnCards.length, displayedCards.length, isViewingHistory, revealingIndex]);

	useLayoutEffect(() => {
		const index = pendingRevealIndexRef.current;
		if (index === null || isViewingHistory) {
			return;
		}

		const startReveal = (cardRoot: HTMLDivElement) => {
			pendingRevealIndexRef.current = null;
			if (!drawSfxPlayedRef.current.has(index)) {
				drawSfxPlayedRef.current.add(index);
				playFlip();
			}

			flushSync(() => {
				layoutAnimatingRef.current = true;
				setLayoutAnimating(true);
			});

			revealAnimRef.current = playSelfViewCardInPlaceReveal({
				cardRoot,
				cardIndex: index,
				onComplete: () => {
					layoutAnimatingRef.current = false;
					setLayoutAnimating(false);
					cardRectsRef.current = captureSelfViewCardRects(
						cardRootsRef.current,
					);
				},
			});
		};

		const cardRoot = cardRootsRef.current.get(index);
		if (cardRoot) {
			startReveal(cardRoot);
			return;
		}

		layoutAnimFrameRef.current = requestAnimationFrame(() => {
			layoutAnimFrameRef.current = null;
			const retryRoot = cardRootsRef.current.get(index);
			if (retryRoot) {
				startReveal(retryRoot);
			} else {
				pendingRevealIndexRef.current = null;
			}
		});

		return () => {
			if (layoutAnimFrameRef.current !== null) {
				cancelAnimationFrame(layoutAnimFrameRef.current);
				layoutAnimFrameRef.current = null;
			}
		};
	}, [drawnCards.length, isViewingHistory, playFlip]);

	useEffect(() => {
		if (spreadSlotCount === 0) {
			prevSpreadCountRef.current = 0;
			cardRectsRef.current = new Map();
		}
	}, [spreadSlotCount]);

	useEffect(() => {
		if (!isViewingHistory && deck.length > 0) {
			preloadTopOfDeck(deck);
		}
	}, [deck, isViewingHistory]);

	const warmNextDraw = useCallback(() => {
		preloadTopOfDeck(deck);
	}, [deck]);

	const registerCardRoot = useCallback(
		(index: number, element: HTMLDivElement | null) => {
			if (element) {
				cardRootsRef.current.set(index, element);
				return;
			}
			cardRootsRef.current.delete(index);
		},
		[],
	);

	const getCloseOrigin = useCallback(() => {
		if (!focusState) {
			return { left: 0, top: 0, width: 0, height: 0 };
		}

		const node = cardRootsRef.current.get(focusState.index);
		if (node) {
			return freezeCardFocusRect(node.getBoundingClientRect());
		}

		return focusState.origin;
	}, [focusState]);

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

	const actionsDisabled =
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
		if (isViewingHistory || focusState || actionsDisabled) return;

		warmNextDraw();
		drawOne();
	}, [
		actionsDisabled,
		drawOne,
		focusState,
		hasOverlayOpen,
		isViewingHistory,
		layoutAnimating,
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

	const spreadLayout = useMemo(
		() => getSelfViewSpreadLayout(spreadSlotCount),
		[spreadSlotCount],
	);
	const spreadStyle = useMemo(
		() => getSelfViewSpreadStyle(spreadLayout),
		[spreadLayout],
	);
	const [spreadViewportH, setSpreadViewportH] = useState<number | null>(null);

	useLayoutEffect(() => {
		const node = spreadWrapRef.current;
		if (!node) {
			setSpreadViewportH(null);
			return;
		}

		const syncViewportHeight = () => {
			if (layoutAnimatingRef.current) return;

			const height = node.clientHeight;
			if (height > 0) {
				setSpreadViewportH(height);
			}
		};

		syncViewportHeight();
		const observer = new ResizeObserver(() => {
			syncViewportHeight();
		});
		observer.observe(node);

		return () => {
			observer.disconnect();
		};
	}, [isViewingHistory, spreadLayout.rows, spreadSlotCount]);

	const spreadWrapStyle = useMemo(() => {
		if (spreadViewportH === null) {
			return spreadStyle;
		}

		return {
			...spreadStyle,
			"--self-view-spread-measured-h": `${spreadViewportH}px`,
		};
	}, [spreadStyle, spreadViewportH]);
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
		let offset = 0;
		return spreadLayout.rowSizes.map((rowSize) => {
			const row = spreadItems.slice(offset, offset + rowSize);
			offset += rowSize;
			return row;
		});
	}, [spreadItems, spreadLayout.rowSizes]);

	const isZoomActive =
		focusState !== null && focusState.phase !== "handoff";

	const renderSpreadCard = useCallback(
		(card: (typeof displayedCards)[number], index: number) => {
			const isFaceUp = isViewingHistory || flippedIndices.has(index);
			const isInFocus =
				focusState?.index === index && focusState.phase !== "handoff";

			return (
				<TarotCard
					key={`${card.id}-${index}`}
					card={card}
					index={index}
					className={isInFocus ? "tarot-card--in-focus" : undefined}
					loadWhenVisible={isViewingHistory}
					flipped={isFaceUp}
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
			flippedIndices,
			focusState?.index,
			focusState?.phase,
			handleCardPress,
			isViewingHistory,
			isZoomActive,
			registerCardRoot,
			reversedUprightHeld,
		],
	);

	const renderSpreadSlot = useCallback(
		(item: (typeof spreadItems)[number]) => {
			if (item.kind === "placeholder") {
				return (
					<SelfViewCardSlot
						key={`slot-${item.index}`}
						index={item.index}
						onRootElement={registerCardRoot}
					/>
				);
			}

			return renderSpreadCard(item.card, item.index);
		},
		[registerCardRoot, renderSpreadCard],
	);

	const hasSpread = spreadSlotCount > 0 || isViewingHistory;

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
						style={spreadWrapStyle as CSSProperties}
					>
						<div
							className="self-view-spread"
							data-count={spreadSlotCount || undefined}
							data-layout-rows={
								spreadLayout.rows > 0 ? spreadLayout.rows : undefined
							}
							data-viewing={isViewingHistory ? "true" : undefined}
							data-upright-held={
								reversedUprightHeld && !isZoomActive ? "true" : undefined
							}
							style={spreadStyle as CSSProperties}
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

			{isViewingHistory ? (
				<div className="self-view-draw-float">
					<CloseButton
						onClick={backToCurrent}
						aria-label={labels.selfViewBackToCurrent}
					/>
				</div>
			) : (
				<div className="self-view-draw-float">
					<GameButton
						tone="light"
						layout="text"
						className="self-view-bottom-action"
						onClick={drawOne}
						onPointerEnter={warmNextDraw}
						onFocus={warmNextDraw}
						disabled={actionsDisabled}
					>
						{revealingIndex !== null
							? labels.loading
							: labels.selfViewDrawOne}
					</GameButton>
				</div>
			)}
		</>
	);
}
