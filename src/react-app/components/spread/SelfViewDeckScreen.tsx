import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useLocale } from "../../hooks/use-locale";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useReversedUprightHold } from "../../hooks/use-reversed-upright-hold";
import {
	isAppShortcutBlocked,
	shouldIgnoreAppShortcut,
} from "../../lib/keyboard/app-shortcut";
import { parseSelfViewCardSlotKey } from "../../lib/keyboard/self-view-card-slot";
import { preloadTopOfDeck } from "../../lib/tarot/card-image";
import {
	buildSpreadMoldRows,
	getSpreadMoldRowColCount,
} from "../../lib/self-view/spread-mold-rows";
import {
	canSelfViewZoom,
	clearSelfViewSpreadLayoutCache,
	getSelfViewSpreadLayout,
	getSelfViewSpreadStyle,
	resolveSpreadLayoutCardCount,
	SELF_VIEW_MAX_SPREAD_CARDS,
} from "../../lib/self-view/spread-layout";
import { useSelfViewSession } from "../../hooks/use-self-view-session";
import {
	SelfViewCardFocusOverlay,
	type SelfViewCardFocusOverlayHandle,
} from "./SelfViewCardFocusOverlay";
import { TarotCard } from "./TarotCard";

type FocusPhase = "zoomed" | "closing" | "handoff";

type FocusState = {
	index: number;
	phase: FocusPhase;
};

type SelfViewDeckScreenProps = {
	dealOriginRef: React.RefObject<HTMLButtonElement | null>;
};

export function SelfViewDeckScreen({ dealOriginRef }: SelfViewDeckScreenProps) {
	void dealOriginRef;

	const { labels } = useLocale();
	const {
		deck,
		drawnCards,
		flippedIndices,
		isViewingHistory,
		displayedCards,
		drawOne,
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

	const spreadSlotCount = drawnCards.length;

	const spreadLayout = useMemo(() => {
		return getSelfViewSpreadLayout(
			resolveSpreadLayoutCardCount(spreadSlotCount),
		);
	}, [layoutMetricsRevision, spreadSlotCount]);
	const spreadStyle = useMemo(
		() => getSelfViewSpreadStyle(spreadLayout),
		[spreadLayout],
	);

	const spreadWrapRef = useRef<HTMLDivElement>(null);

	const focusStateRef = useRef(focusState);

	useEffect(() => {
		focusStateRef.current = focusState;
	}, [focusState]);

	const closeFocus = useCallback(async () => {
		await focusOverlayRef.current?.close();
	}, []);

	const openCardFocus = useCallback(
		(index: number) => {
			if (!canSelfViewZoom(index, displayedCards.length)) return;

			const isFaceUp = isViewingHistory || flippedIndices.has(index);
			if (!isFaceUp) return;

			if (focusState?.index === index) {
				void closeFocus();
				return;
			}

			setFocusState({
				index,
				phase: "zoomed",
			});
		},
		[
			closeFocus,
			flippedIndices,
			focusState?.index,
			isViewingHistory,
		],
	);

	const handleCardPress = useCallback(
		(index: number) => {
			const isFaceUp = isViewingHistory || flippedIndices.has(index);
			if (isFaceUp) {
				openCardFocus(index);
				return;
			}

			if (!isViewingHistory) {
				toggleCardFlip(index);
			}
		},
		[flippedIndices, isViewingHistory, openCardFocus, toggleCardFlip],
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
		// eslint-disable-next-line react-hooks/set-state-in-effect
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

	type SpreadRowCell =
		| { kind: "card"; card: (typeof drawnCards)[number]; index: number }
		| { kind: "empty"; index: number };

	const spreadRows = useMemo(() => {
		const moldRows = buildSpreadMoldRows(drawnCards.length, spreadLayout);

		return moldRows.map((row, rowIndex) => ({
			cols: getSpreadMoldRowColCount(
				row,
				spreadLayout.rowSizes[rowIndex] ?? row.length,
			),
			items: row.map((cell): SpreadRowCell => {
				if (cell.kind === "empty") {
					return { kind: "empty", index: cell.index };
				}

				return {
					kind: "card",
					card: drawnCards[cell.index]!,
					index: cell.index,
				};
			}),
		}));
	}, [drawnCards, spreadLayout]);

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

			return (
				<TarotCard
					key={`self-view-card-${index}`}
					card={card}
					index={index}
					className={cardClassName || undefined}
					flipMode="css-3d"
					instantFlip
					loadWhenVisible={isViewingHistory}
					flipped={isFaceUp}
					preloadFront={isFaceUp}
					disableHoverPreview
					uprightPreview={
						reversedUprightHeld &&
						!isZoomActive &&
						isFaceUp &&
						card.reversed
					}
					onPress={handleCardPress}
				/>
			);
		},
		[
			flippedIndices,
			focusState,
			handleCardPress,
			isViewingHistory,
			isZoomActive,
			reversedUprightHeld,
		],
	);

	const renderSpreadSlot = useCallback(
		(item: SpreadRowCell) => {
			if (item.kind === "empty") {
				return (
					<div
						key={`self-view-slot-${item.index}`}
						className="self-view-spread__slot-spacer"
						aria-hidden
					/>
				);
			}

			return renderSpreadCard(item.card, item.index);
		},
		[renderSpreadCard],
	);

	const hasSpread = spreadSlotCount > 0 || isViewingHistory;

	return (
		<>
			<div
				className="self-view-screen"
				data-has-spread={hasSpread ? "true" : undefined}
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
						style={spreadStyle as CSSProperties}
					>
						<div
							className="self-view-spread"
							data-count={spreadSlotCount || undefined}
							data-layout-rows={
								spreadLayout.rows > 0 ? spreadLayout.rows : undefined
							}
							data-mold="true"
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
								spreadRows.map((row, rowIndex) => (
									<div
										key={`row-${rowIndex}`}
										className="self-view-spread__row"
										data-row-size={row.items.length}
										style={
											{
												"--self-view-row-cols": row.cols,
											} as CSSProperties
										}
									>
										{row.items.map((item) => renderSpreadSlot(item))}
									</div>
								))
							)}
						</div>
					</div>
				) : null}
			</div>

			{focusState ? (
				<SelfViewCardFocusOverlay
					ref={focusOverlayRef}
					card={displayedCards[focusState.index]!}
					index={focusState.index}
					flipped={
						isViewingHistory || flippedIndices.has(focusState.index)
					}
					onClosingStart={handleFocusClosingStart}
					onHandoff={handleFocusHandoff}
					onClosed={() => setFocusState(null)}
				/>
			) : null}
		</>
	);
}
