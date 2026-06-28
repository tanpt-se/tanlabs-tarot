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
	killSelfViewCardInPlaceReveal,
	killSelfViewSlotReservation,
	measureSelfViewSlotCardWidthPx,
	playSelfViewCardInPlaceReveal,
	playSelfViewSlotReservation,
	prepareSelfViewCardInPlaceReveal,
	prepareSelfViewSlotReservation,
	releaseSelfViewLayoutMotion,
	type SelfViewCardRevealHandle,
	type SelfViewPreparedSlotReservation,
	type SelfViewSlotReservationHandle,
} from "../lib/animation/self-view-card-entrance";

type UseSelfViewDrawLayoutOptions = {
	isViewingHistory: boolean;
	displayedCardsLength: number;
	drawnCardsLength: number;
	revealingIndex: number | null;
	pendingDrawImageReady: boolean;
	commitPendingDraw: () => void;
	playFlip: () => void;
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
	pendingDrawImageReady,
	commitPendingDraw,
	playFlip,
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
	const revealAnimRef = useRef<SelfViewCardRevealHandle | null>(null);
	const layoutAnimFrameRef = useRef<number | null>(null);
	const layoutAnimatingRef = useRef(false);
	const [slotReservationSettled, setSlotReservationSettled] = useState(false);
	const pendingRevealIndexRef = useRef<number | null>(null);
	const drawSfxPlayedRef = useRef<Set<number>>(new Set());
	const [layoutAnimating, setLayoutAnimating] = useState(false);
	const [spreadViewportH, setSpreadViewportH] = useState<number | null>(null);
	const [frozenSpreadViewportH, setFrozenSpreadViewportH] = useState<
		number | null
	>(null);
	const frozenSpreadViewportHRef = useRef<number | null>(null);
	const lockedCardWidthRef = useRef<string | null>(null);
	const [lockedCardWidth, setLockedCardWidth] = useState<string | null>(null);
	const drawSequenceActiveRef = useRef(false);
	const lastCommittedRevealRef = useRef<number | null>(null);

	const syncSpreadViewportHeight = useCallback(() => {
		const node = spreadWrapRef.current;
		if (!node) return;

		const height = node.clientHeight;
		if (height > 0) {
			setSpreadViewportH(height);
		}
	}, []);

	const beginLayoutAnimation = useCallback((slotIndex: number) => {
		drawSequenceActiveRef.current = true;

		const node = spreadWrapRef.current;
		const height = node?.clientHeight ?? 0;
		if (height > 0) {
			frozenSpreadViewportHRef.current = height;
			setFrozenSpreadViewportH(height);
		}

		flushSync(() => {
			setSlotReservationSettled(false);
			setSpreadViewportH(null);
			layoutAnimatingRef.current = true;
			setLayoutAnimating(true);
		});

		const widthPx = measureSelfViewSlotCardWidthPx(
			cardRootsRef.current,
			slotIndex,
		);
		const lockedWidth = widthPx ? `${widthPx}px` : null;
		lockedCardWidthRef.current = lockedWidth;

		if (lockedWidth) {
			flushSync(() => {
				setLockedCardWidth(lockedWidth);
			});
		}
	}, []);

	const finishLayoutAnimation = useCallback(() => {
		const node = spreadWrapRef.current;
		const height =
			node?.clientHeight ?? frozenSpreadViewportHRef.current ?? 0;

		drawSequenceActiveRef.current = false;
		frozenSpreadViewportHRef.current = null;
		setFrozenSpreadViewportH(null);
		lockedCardWidthRef.current = null;
		layoutAnimRef.current = null;
		preparedAnimRef.current = null;

		flushSync(() => {
			setLockedCardWidth(null);
			layoutAnimatingRef.current = false;
			setLayoutAnimating(false);
			if (height > 0) {
				setSpreadViewportH(height);
			} else {
				setSpreadViewportH(null);
			}
		});
	}, []);

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

	useEffect(() => {
		lastCommittedRevealRef.current = null;
	}, [revealingIndex]);

	useEffect(() => {
		if (isViewingHistory) {
			lastCommittedRevealRef.current = null;
			return;
		}

		if (!slotReservationSettled || !pendingDrawImageReady) {
			return;
		}

		if (revealingIndex === null) {
			return;
		}

		if (lastCommittedRevealRef.current === revealingIndex) {
			return;
		}

		lastCommittedRevealRef.current = revealingIndex;
		pendingRevealIndexRef.current = revealingIndex;
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
			drawSfxPlayedRef.current.clear();
			killActiveSlotAnimation();
			killActiveRevealAnimation();
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
			beginLayoutAnimation(nextCount - 1);

			const onSlotReserved = () => {
				cardRectsRef.current = captureSelfViewCardRects(
					cardRootsRef.current,
				);
				setSlotReservationSettled(true);
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
		};
	}, [
		beginLayoutAnimation,
		displayedCardsLength,
		drawnCardsLength,
		isViewingHistory,
		revealingIndex,
	]);

	useLayoutEffect(() => {
		const index = pendingRevealIndexRef.current;
		if (index === null || isViewingHistory) {
			return;
		}

		const cardRoots = cardRootsRef.current;

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

			const onRevealComplete = () => {
				const shifted =
					preparedAnimRef.current?.animatedElements ?? [];
				const revealRoot = cardRootsRef.current.get(index);

				flushSync(() => {
					releaseSelfViewLayoutMotion(shifted);
					if (revealRoot) {
						releaseSelfViewLayoutMotion([revealRoot]);
					}
					revealAnimRef.current = null;
					finishLayoutAnimation();
				});

				cardRectsRef.current = captureSelfViewCardRects(
					cardRootsRef.current,
				);
			};

			prepareSelfViewCardInPlaceReveal(cardRoot);
			revealAnimRef.current = playSelfViewCardInPlaceReveal({
				cardRoot,
				cardIndex: index,
				onComplete: onRevealComplete,
			});

			if (!revealAnimRef.current) {
				onRevealComplete();
			}
		};

		const cardRoot = cardRoots.get(index);
		if (cardRoot) {
			startReveal(cardRoot);
			return;
		}

		layoutAnimFrameRef.current = requestAnimationFrame(() => {
			layoutAnimFrameRef.current = null;
			const retryRoot = cardRoots.get(index);
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
			const revealIndex = revealAnimRef.current?.cardIndex ?? null;
			killSelfViewCardInPlaceReveal(
				revealAnimRef.current,
				revealIndex !== null ? cardRoots.get(revealIndex) ?? null : null,
			);
			revealAnimRef.current = null;
		};
	}, [drawnCardsLength, finishLayoutAnimation, isViewingHistory, playFlip]);

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
		spreadSurfaceStyle,
	};
}
