import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useLocale } from "../../hooks/use-locale";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useReversedUprightHold } from "../../hooks/use-reversed-upright-hold";
import {
	isAppShortcutBlocked,
	shouldIgnoreAppShortcut,
} from "../../lib/keyboard/app-shortcut";
import { parseSelfViewCardSlotKey } from "../../lib/keyboard/self-view-card-slot";
import {
	getSelfViewDrawOrigin,
	runSelfViewAddCardAnimation,
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
	const {
		deck,
		drawnCards,
		flippedIndices,
		revealingIndex,
		isViewingHistory,
		displayedCards,
		drawOne,
		completeCardReveal,
		completeRevealFlip,
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
	const layoutAnimRef =
		useRef<ReturnType<typeof runSelfViewAddCardAnimation>>(null);

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

	useLayoutEffect(() => {
		if (isViewingHistory) {
			layoutAnimRef.current?.kill();
			prevSpreadCountRef.current = displayedCards.length;
			return;
		}

		const previousCount = prevSpreadCountRef.current;
		const nextCount = displayedCards.length;

		if (nextCount > previousCount) {
			layoutAnimRef.current?.kill();
			layoutAnimRef.current = runSelfViewAddCardAnimation({
				cardRoots: cardRootsRef.current,
				newCardIndex: nextCount - 1,
				drawOrigin: getSelfViewDrawOrigin(),
			});
		}

		prevSpreadCountRef.current = nextCount;

		return () => {
			layoutAnimRef.current?.kill();
		};
	}, [displayedCards.length, isViewingHistory]);

	useEffect(() => {
		if (displayedCards.length === 0) {
			prevSpreadCountRef.current = 0;
		}
	}, [displayedCards.length]);

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
		() => getSelfViewSpreadLayout(displayedCards.length),
		[displayedCards.length],
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
	}, [displayedCards.length, isViewingHistory, spreadLayout.rows]);

	const spreadWrapStyle = useMemo(() => {
		if (spreadViewportH === null) {
			return spreadStyle;
		}

		return {
			...spreadStyle,
			"--self-view-spread-measured-h": `${spreadViewportH}px`,
		};
	}, [spreadStyle, spreadViewportH]);
	const spreadRows = useMemo(() => {
		let offset = 0;
		return spreadLayout.rowSizes.map((rowSize) => {
			const row = displayedCards.slice(offset, offset + rowSize);
			offset += rowSize;
			return row;
		});
	}, [displayedCards, spreadLayout.rowSizes]);

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
					revealLoading={revealingIndex === index}
					sparkleOnReveal={revealingIndex === index}
					onRevealReady={completeCardReveal}
					onRevealFlipComplete={completeRevealFlip}
					loadWhenVisible={isViewingHistory}
					flipped={isFaceUp}
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
			completeRevealFlip,
			flippedIndices,
			focusState?.index,
			focusState?.phase,
			handleCardPress,
			isViewingHistory,
			isZoomActive,
			registerCardRoot,
			revealingIndex,
			reversedUprightHeld,
		],
	);

	return (
		<>
			<div
				className="self-view-screen"
				data-has-spread={
					displayedCards.length > 0 || isViewingHistory ? "true" : undefined
				}
			>
				{displayedCards.length > 0 || isViewingHistory ? (
					<div
						ref={spreadWrapRef}
						className="self-view-spread-wrap"
						data-layout-rows={
							spreadLayout.rows > 0 ? spreadLayout.rows : undefined
						}
						style={spreadWrapStyle as CSSProperties}
					>
						<div
							className="self-view-spread"
							data-count={displayedCards.length || undefined}
							data-layout-rows={
								spreadLayout.rows > 0 ? spreadLayout.rows : undefined
							}
							data-viewing={isViewingHistory ? "true" : undefined}
							data-upright-held={
								reversedUprightHeld && !isZoomActive ? "true" : undefined
							}
							style={spreadStyle as CSSProperties}
						>
							{displayedCards.length === 0 ? (
								<p className="self-view-spread__empty">
									{labels.selfViewHistoryEmpty}
								</p>
							) : (
								spreadRows.map((rowCards, rowIndex) => {
									const rowStartIndex = spreadLayout.rowSizes
										.slice(0, rowIndex)
										.reduce((total, size) => total + size, 0);

									return (
										<div
											key={`row-${rowIndex}`}
											className="self-view-spread__row"
											data-row-size={rowCards.length}
										>
											{rowCards.map((card, columnIndex) =>
												renderSpreadCard(
													card,
													rowStartIndex + columnIndex,
												),
											)}
										</div>
									);
								})
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
