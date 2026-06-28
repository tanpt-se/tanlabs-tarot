import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { flushSync } from "react-dom";
import {
	captureSelfViewCardRects,
	killSelfViewSlotReservation,
	measureSelfViewSlotCardWidthPx,
	playSelfViewSlotReservation,
	prepareSelfViewSlotReservation,
	releaseSelfViewLayoutMotion,
	type SelfViewPreparedSlotReservation,
	type SelfViewSlotReservationHandle,
} from "../lib/animation/self-view-card-entrance";
import {
	clearSelfViewSpreadLayoutCache,
	didSelfViewLayoutResize,
	getSelfViewSpreadLayout,
	getSelfViewSpreadMeasuredHeightPx,
	shouldUseSelfViewLayoutFlight,
} from "../lib/self-view/spread-layout";

type UseSelfViewDrawLayoutOptions = {
	isViewingHistory: boolean;
	displayedCardsLength: number;
	drawnCardsLength: number;
	revealingIndex: number | null;
	commitPendingDraw: () => void;
	playCardDeal: () => void;
	onRevealFlipComplete: (index: number) => void;
	spreadSlotCount: number;
	spreadStyle: Record<string, string | number>;
	spreadLayoutRows: number;
};

function buildSpreadSurfaceStyle(
	spreadStyle: Record<string, string | number>,
	options: {
		layoutAnimating: boolean;
		frozenHeight: number | null;
		spreadViewportH: number | null;
		lockedCardWidth: string | null;
	},
): Record<string, string | number> {
	const measuredH = options.layoutAnimating
		? options.frozenHeight
		: options.spreadViewportH;

	const style: Record<string, string | number> = { ...spreadStyle };

	if (measuredH !== null) {
		style["--self-view-spread-measured-h"] = `${measuredH}px`;
	}

	if (options.lockedCardWidth) {
		style["--self-view-card-width"] = options.lockedCardWidth;
		style["--spread-card-width"] = options.lockedCardWidth;
	}

	return style;
}

export function useSelfViewDrawLayout({
	isViewingHistory,
	displayedCardsLength,
	drawnCardsLength,
	revealingIndex,
	commitPendingDraw,
	playCardDeal,
	onRevealFlipComplete,
	spreadSlotCount,
	spreadStyle,
	spreadLayoutRows,
}: UseSelfViewDrawLayoutOptions) {
	const cardRootsRef = useRef<Map<number, HTMLDivElement>>(new Map());
	const spreadWrapRef = useRef<HTMLDivElement>(null);
	const prevSpreadCountRef = useRef(0);
	const cardRectsRef = useRef<Map<number, DOMRect>>(new Map());
	const layoutAnimRef = useRef<SelfViewSlotReservationHandle | null>(null);
	const preparedAnimRef = useRef<SelfViewPreparedSlotReservation | null>(null);
	const layoutAnimFrameRef = useRef<number | null>(null);
	const layoutAnimatingRef = useRef(false);
	const [slotReservationSettled, setSlotReservationSettled] = useState(false);
	const commitPhaseStartedRef = useRef<number | null>(null);
	const dealSfxPlayedRef = useRef<Set<number>>(new Set());
	const [layoutAnimating, setLayoutAnimating] = useState(false);
	const [layoutFlight, setLayoutFlight] = useState(false);
	const [spreadViewportH, setSpreadViewportH] = useState<number | null>(null);
	const [frozenSpreadViewportH, setFrozenSpreadViewportH] = useState<
		number | null
	>(null);
	const frozenSpreadViewportHRef = useRef<number | null>(null);
	const lockedCardWidthRef = useRef<string | null>(null);
	const [lockedCardWidth, setLockedCardWidth] = useState<string | null>(null);
	const drawSequenceActiveRef = useRef(false);
	const revealingIndexRef = useRef(revealingIndex);
	revealingIndexRef.current = revealingIndex;
	const onRevealFlipCompleteRef = useRef(onRevealFlipComplete);
	onRevealFlipCompleteRef.current = onRevealFlipComplete;

	const syncSpreadViewportHeight = useCallback(() => {
		const node = spreadWrapRef.current;
		if (!node) return;

		const height = node.clientHeight;
		if (height > 0) {
			setSpreadViewportH(height);
		}
	}, []);

	const beginLayoutAnimation = useCallback(
		(slotIndex: number, previousCount: number, nextCount: number) => {
			drawSequenceActiveRef.current = true;
			const layoutResized = didSelfViewLayoutResize(previousCount, nextCount);
			const useLayoutFlight = shouldUseSelfViewLayoutFlight(
				previousCount,
				nextCount,
				slotIndex,
			);
			const nextLayout = getSelfViewSpreadLayout(nextCount);

			flushSync(() => {
				setSlotReservationSettled(false);
				setSpreadViewportH(null);
				layoutAnimatingRef.current = true;
				setLayoutAnimating(true);
				setLayoutFlight(useLayoutFlight);

				if (layoutResized) {
					const targetHeight = getSelfViewSpreadMeasuredHeightPx(nextCount);
					if (targetHeight > 0) {
						frozenSpreadViewportHRef.current = targetHeight;
						setFrozenSpreadViewportH(targetHeight);
					}
				} else {
					const targetHeight = nextLayout.spreadHeightPx;
					if (targetHeight > 0) {
						frozenSpreadViewportHRef.current = targetHeight;
						setFrozenSpreadViewportH(targetHeight);
					}
				}
			});

			let lockedWidth: string | null = null;
			const measuredWidthPx = measureSelfViewSlotCardWidthPx(
				cardRootsRef.current,
				slotIndex,
			);

			if (measuredWidthPx && measuredWidthPx > 0) {
				lockedWidth = `${measuredWidthPx}px`;
			} else if (nextLayout.cardWidthPx > 0) {
				lockedWidth = `${nextLayout.cardWidthPx}px`;
			}

			lockedCardWidthRef.current = lockedWidth;
			if (lockedWidth) {
				flushSync(() => {
					setLockedCardWidth(lockedWidth);
				});
			}
		},
		[],
	);

	const finishLayoutAnimation = useCallback(
		(nextCount?: number, layoutResized = false) => {
			const node = spreadWrapRef.current;
			let height =
				node?.clientHeight ?? frozenSpreadViewportHRef.current ?? 0;

			if (layoutResized && nextCount) {
				const targetHeight = getSelfViewSpreadMeasuredHeightPx(nextCount);
				if (targetHeight > 0) {
					height = targetHeight;
				}
			}

			drawSequenceActiveRef.current = false;
			frozenSpreadViewportHRef.current = null;
			setFrozenSpreadViewportH(null);
			lockedCardWidthRef.current = null;
			layoutAnimRef.current = null;

			flushSync(() => {
				setLockedCardWidth(null);
				layoutAnimatingRef.current = false;
				setLayoutAnimating(false);
				setLayoutFlight(false);
				if (height > 0) {
					setSpreadViewportH(height);
				} else {
					setSpreadViewportH(null);
				}
			});

			cardRectsRef.current = captureSelfViewCardRects(cardRootsRef.current);
		},
		[],
	);

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

	const handleRevealFlipComplete = useCallback(
		(index: number) => {
			const revealRoot = cardRootsRef.current.get(index);
			if (revealRoot) {
				releaseSelfViewLayoutMotion([revealRoot]);
			}
			preparedAnimRef.current = null;
			onRevealFlipCompleteRef.current(index);
		},
		[],
	);

	const settleLayoutShift = useCallback(() => {
		const shifted = preparedAnimRef.current?.animatedElements ?? [];
		const layoutResized = preparedAnimRef.current?.layoutResized ?? false;
		const index = revealingIndexRef.current;
		const nextCount = index === null ? 0 : index + 1;

		releaseSelfViewLayoutMotion(shifted);

		if (index !== null && !dealSfxPlayedRef.current.has(index)) {
			dealSfxPlayedRef.current.add(index);
			playCardDeal();
		}

		commitPendingDraw();
		if (index !== null) {
			commitPhaseStartedRef.current = index;
		}

		cardRectsRef.current = captureSelfViewCardRects(cardRootsRef.current);
		setSlotReservationSettled(true);

		const finalizeLayout = () => {
			finishLayoutAnimation(
				nextCount > 0 ? nextCount : undefined,
				layoutResized,
			);
		};

		if (layoutResized) {
			requestAnimationFrame(() => {
				requestAnimationFrame(finalizeLayout);
			});
		} else {
			requestAnimationFrame(finalizeLayout);
		}
	}, [commitPendingDraw, finishLayoutAnimation, playCardDeal]);

	useEffect(() => {
		commitPhaseStartedRef.current = null;
		dealSfxPlayedRef.current.clear();
	}, [revealingIndex]);

	// Safety: commit if layout settled but card never mounted.
	useEffect(() => {
		if (isViewingHistory || revealingIndex === null) return;
		if (!slotReservationSettled) return;
		if (revealingIndex < drawnCardsLength) return;

		const timeout = window.setTimeout(() => {
			if (revealingIndex < drawnCardsLength) return;
			commitPendingDraw();
		}, 400);

		return () => {
			window.clearTimeout(timeout);
		};
	}, [
		commitPendingDraw,
		drawnCardsLength,
		isViewingHistory,
		revealingIndex,
		slotReservationSettled,
	]);

	// Safety: settle slot if layout reservation never completes (strict mode / first draw).
	useEffect(() => {
		if (isViewingHistory || revealingIndex === null) return;
		if (slotReservationSettled) return;
		if (revealingIndex < drawnCardsLength) return;

		const timeout = window.setTimeout(() => {
			settleLayoutShift();
		}, 350);

		return () => {
			window.clearTimeout(timeout);
		};
	}, [
		drawnCardsLength,
		isViewingHistory,
		revealingIndex,
		settleLayoutShift,
		slotReservationSettled,
	]);

	useLayoutEffect(() => {
		if (isViewingHistory || revealingIndex === null) return;
		prevSpreadCountRef.current = drawnCardsLength;
	}, [drawnCardsLength, isViewingHistory, revealingIndex]);

	useLayoutEffect(() => {
		const killActiveSlotAnimation = () => {
			const animated =
				preparedAnimRef.current?.animatedElements ?? [];
			killSelfViewSlotReservation(layoutAnimRef.current, animated);
			layoutAnimRef.current = null;
			preparedAnimRef.current = null;
		};

		if (isViewingHistory) {
			dealSfxPlayedRef.current.clear();
			killActiveSlotAnimation();
			prevSpreadCountRef.current = displayedCardsLength;
			cardRectsRef.current = captureSelfViewCardRects(cardRootsRef.current);
			return;
		}

		const pendingSlot =
			revealingIndex !== null && revealingIndex >= drawnCardsLength;
		const nextCount = pendingSlot
			? revealingIndex + 1
			: displayedCardsLength;
		const previousCount = prevSpreadCountRef.current;

		if (nextCount === previousCount + 1 && pendingSlot) {
			killActiveSlotAnimation();
			// eslint-disable-next-line react-hooks/set-state-in-effect -- GSAP draw must start in layout effect
			beginLayoutAnimation(nextCount - 1, previousCount, nextCount);

			const onSlotReserved = () => {
				settleLayoutShift();
			};

			const startReservation = (
				prepared: SelfViewPreparedSlotReservation,
			) => {
				preparedAnimRef.current = prepared;
				layoutAnimRef.current = playSelfViewSlotReservation(
					{ cardRoots: cardRootsRef.current, onComplete: onSlotReserved },
					prepared,
				);
			};

			const prepared = prepareSelfViewSlotReservation({
				cardRoots: cardRootsRef.current,
				slotIndex: nextCount - 1,
				oldCardRects: cardRectsRef.current,
				previousCount,
				nextCount,
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
						previousCount,
						nextCount,
					});
					if (retryPrepared) {
						startReservation(retryPrepared);
					} else {
						onSlotReserved();
					}
				});
			} else {
				requestAnimationFrame(() => {
					onSlotReserved();
				});
			}
		} else if (nextCount !== previousCount) {
			cardRectsRef.current = captureSelfViewCardRects(cardRootsRef.current);
		} else {
			cardRectsRef.current = captureSelfViewCardRects(cardRootsRef.current);
		}

		// Keep committed count while a pending slot is open so strict-mode remounts
		// can still detect the 0 → 1 transition for the first draw.
		prevSpreadCountRef.current = pendingSlot
			? drawnCardsLength
			: displayedCardsLength;

		return () => {
			if (layoutAnimFrameRef.current !== null) {
				cancelAnimationFrame(layoutAnimFrameRef.current);
				layoutAnimFrameRef.current = null;
			}

			if (drawSequenceActiveRef.current) {
				if (layoutAnimRef.current) {
					layoutAnimRef.current.timeline.kill();
					layoutAnimRef.current = null;
				}
				return;
			}

			killActiveSlotAnimation();
			frozenSpreadViewportHRef.current = null;
			setFrozenSpreadViewportH(null);
			lockedCardWidthRef.current = null;
			layoutAnimatingRef.current = false;
			setLockedCardWidth(null);
			setLayoutAnimating(false);
			setLayoutFlight(false);
		};
	}, [
		beginLayoutAnimation,
		displayedCardsLength,
		drawnCardsLength,
		isViewingHistory,
		revealingIndex,
		settleLayoutShift,
	]);

	useEffect(() => {
		if (spreadSlotCount === 0) {
			prevSpreadCountRef.current = 0;
			cardRectsRef.current = new Map();
		}
	}, [spreadSlotCount]);

	useLayoutEffect(() => {
		const node = spreadWrapRef.current;
		if (!node) {
			return;
		}

		const syncViewportHeight = () => {
			if (layoutAnimatingRef.current) return;
			clearSelfViewSpreadLayoutCache();
			syncSpreadViewportHeight();
		};

		syncViewportHeight();
		const observer = new ResizeObserver(syncViewportHeight);
		observer.observe(node);

		return () => {
			observer.disconnect();
		};
	}, [
		isViewingHistory,
		spreadLayoutRows,
		spreadSlotCount,
		syncSpreadViewportHeight,
	]);

	const spreadSurfaceStyle = useMemo(
		() =>
			buildSpreadSurfaceStyle(spreadStyle, {
				layoutAnimating,
				frozenHeight: frozenSpreadViewportH,
				spreadViewportH,
				lockedCardWidth,
			}),
		[
			frozenSpreadViewportH,
			layoutAnimating,
			lockedCardWidth,
			spreadStyle,
			spreadViewportH,
		],
	);

	return {
		cardRootsRef,
		spreadWrapRef,
		registerCardRoot,
		layoutAnimating,
		layoutFlight,
		spreadSurfaceStyle,
		handleRevealFlipComplete,
	};
}
