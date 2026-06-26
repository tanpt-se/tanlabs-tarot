import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DrawnCard } from "../../lib/types/reading";
import {
	getCardImage,
	getCardImageUrl,
	isCardImageReady,
	loadCardImage,
} from "../../lib/tarot/card-image";
import type { CardId } from "../../lib/tarot/deck";
import { useLocale } from "../../hooks/use-locale";
import { CardBack } from "../brand/CardBack";
import { CardArtMark } from "../brand/CardArtMark";

interface TarotCardProps {
	card: DrawnCard;
	flipped: boolean;
	index?: number;
	dealIndex?: number;
	/** Self-view draw: stay on card back until front art is ready, then auto-flip */
	revealLoading?: boolean;
	/** Guided spread: preload front while face-down; tap queues flip until art is ready */
	preloadFront?: boolean;
	/** Defer front image decode until card is near viewport (history spreads) */
	loadWhenVisible?: boolean;
	/** Self-view draw: called when front art is decoded and safe to flip */
	onRevealReady?: (index: number) => void;
	/** Self-view draw: called when auto-flip animation finishes */
	onRevealFlipComplete?: (index: number) => void;
	onPress?: (index: number) => void;
}

function canHoverPreview() {
	return window.matchMedia("(hover: hover)").matches;
}

export const TarotCard = memo(function TarotCard({
	card,
	flipped,
	index = 0,
	dealIndex,
	revealLoading = false,
	preloadFront = false,
	loadWhenVisible = false,
	onRevealReady,
	onRevealFlipComplete,
	onPress,
}: TarotCardProps) {
	const { labels } = useLocale();
	const cardId = card.id as CardId;
	const rootRef = useRef<HTMLDivElement>(null);
	const revealReadySentRef = useRef(false);
	const revealFlipPendingRef = useRef(false);
	const pendingManualFlipRef = useRef(false);
	const onRevealReadyRef = useRef(onRevealReady);
	const onRevealFlipCompleteRef = useRef(onRevealFlipComplete);
	onRevealReadyRef.current = onRevealReady;
	onRevealFlipCompleteRef.current = onRevealFlipComplete;
	const [isVisible, setIsVisible] = useState(!loadWhenVisible);
	const [frontReady, setFrontReady] = useState(() => Boolean(getCardImage(cardId)));
	const [hovering, setHovering] = useState(false);
	const [mountUprightPreview, setMountUprightPreview] = useState(false);
	const [previewElevated, setPreviewElevated] = useState(false);
	const previewElevateTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);
	const [flipAnimating, setFlipAnimating] = useState(false);
	const previewUpright = hovering && flipped && card.reversed;
	const interactive = Boolean(onPress) && !revealLoading;
	const shouldLoadFront =
		(flipped || revealLoading || preloadFront) &&
		(!loadWhenVisible || isVisible);
	const imageSrc = shouldLoadFront ? getCardImageUrl(cardId) : undefined;
	const backLoading =
		revealLoading || (preloadFront && !flipped && !frontReady);

	const dealStyle = useMemo(
		() =>
			dealIndex === undefined
				? undefined
				: ({ "--deal-index": dealIndex } as React.CSSProperties),
		[dealIndex],
	);

	useEffect(() => {
		if (!loadWhenVisible) {
			setIsVisible(true);
			return;
		}

		const node = rootRef.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "120px" },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [loadWhenVisible]);

	useEffect(() => {
		setFrontReady(Boolean(getCardImage(cardId)));
	}, [cardId]);

	useEffect(() => {
		if (isCardImageReady(cardId)) {
			setFrontReady(true);
			return;
		}

		if (!shouldLoadFront || frontReady) return;

		let cancelled = false;
		void loadCardImage(cardId).then(() => {
			if (!cancelled) {
				setFrontReady(true);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [cardId, frontReady, shouldLoadFront]);

	useEffect(() => {
		if (!revealLoading) {
			revealReadySentRef.current = false;
			return;
		}

		if (!frontReady || revealReadySentRef.current) {
			return;
		}

		revealReadySentRef.current = true;
		window.requestAnimationFrame(() => {
			window.requestAnimationFrame(() => {
				onRevealReadyRef.current?.(index);
			});
		});
	}, [frontReady, index, revealLoading]);

	const handleFrontLoad = useCallback(() => {
		setFrontReady(true);
	}, []);

	useEffect(() => {
		if (revealLoading) {
			revealFlipPendingRef.current = true;
		}
	}, [revealLoading]);

	useEffect(() => {
		if (!revealLoading || !flipped || !revealFlipPendingRef.current) {
			return;
		}

		const timeout = window.setTimeout(() => {
			if (!revealFlipPendingRef.current) return;
			revealFlipPendingRef.current = false;
			onRevealFlipCompleteRef.current?.(index);
		}, 600);

		return () => {
			window.clearTimeout(timeout);
		};
	}, [flipped, index, revealLoading]);

	useEffect(() => {
		if (!pendingManualFlipRef.current || !frontReady || !onPress || flipped) {
			return;
		}

		pendingManualFlipRef.current = false;
		onPress(index);
	}, [flipped, frontReady, index, onPress]);

	useEffect(() => {
		setFlipAnimating(true);
	}, [flipped]);

	const handleTransitionEnd = useCallback(
		(event: React.TransitionEvent<HTMLDivElement>) => {
			if (event.propertyName !== "transform") return;

			setFlipAnimating(false);

			if (revealFlipPendingRef.current && flipped) {
				revealFlipPendingRef.current = false;
				onRevealFlipCompleteRef.current?.(index);
			}
		},
		[flipped, index],
	);

	const handleClick = useCallback(() => {
		if (!onPress) return;

		if (flipped) {
			onPress(index);
			return;
		}

		if (revealLoading) return;

		if (frontReady) {
			onPress(index);
			return;
		}

		if (preloadFront) {
			pendingManualFlipRef.current = true;
		}
	}, [flipped, frontReady, index, onPress, preloadFront, revealLoading]);

	const handlePointerEnter = useCallback(() => {
		if (!flipped || !card.reversed || !canHoverPreview()) return;
		if (previewElevateTimeoutRef.current) {
			clearTimeout(previewElevateTimeoutRef.current);
			previewElevateTimeoutRef.current = undefined;
		}
		setMountUprightPreview(true);
		setHovering(true);
		setPreviewElevated(true);
	}, [card.reversed, flipped]);

	const handlePointerLeave = useCallback(() => {
		setHovering(false);
		if (!flipped || !card.reversed || !canHoverPreview()) return;

		if (previewElevateTimeoutRef.current) {
			clearTimeout(previewElevateTimeoutRef.current);
		}
		previewElevateTimeoutRef.current = setTimeout(() => {
			setPreviewElevated(false);
			previewElevateTimeoutRef.current = undefined;
		}, 300);
	}, [card.reversed, flipped]);

	useEffect(() => {
		return () => {
			if (previewElevateTimeoutRef.current) {
				clearTimeout(previewElevateTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div
			ref={rootRef}
			className="tarot-card"
			data-reveal-loading={revealLoading ? "true" : undefined}
			data-preview-elevated={previewElevated ? "true" : undefined}
		>
			<div className="tarot-card__deal" style={dealStyle}>
				<button
					type="button"
					className="tarot-card__flip"
					data-flipped={flipped}
					data-reversed={card.reversed}
					data-preview-upright={previewUpright ? "true" : undefined}
					data-locked={revealLoading ? "true" : undefined}
					onClick={interactive ? handleClick : undefined}
					onPointerEnter={handlePointerEnter}
					onPointerLeave={handlePointerLeave}
					disabled={!onPress}
					aria-disabled={revealLoading || undefined}
					aria-busy={revealLoading}
					aria-label={
						revealLoading
							? labels.loading
							: flipped
								? labels.spreadConceal
								: labels.spreadReveal
					}
					aria-pressed={flipped}
				>
					<div
						className={
							flipAnimating
								? "tarot-card__inner tarot-card__inner--animating"
								: "tarot-card__inner"
						}
						onTransitionEnd={handleTransitionEnd}
					>
						<div
							className="tarot-card__face tarot-card__face--back"
							data-loading={backLoading ? "true" : undefined}
						>
							<CardBack
								size="spread"
								alt={labels.cardBackAlt}
								reversed={card.reversed}
							/>
						</div>
						{imageSrc ? (
							<div
								className="tarot-card__face tarot-card__face--front"
								data-front-ready={frontReady ? "true" : undefined}
							>
								{card.reversed ? (
									<div className="tarot-card__art-stack">
										<div
											className="tarot-card__art-layer tarot-card__art-layer--reversed"
											aria-hidden={previewUpright}
										>
											<CardArtMark
												src={imageSrc}
												alt=""
												size="spread"
												reversed
												eager={revealLoading || preloadFront}
												onLoad={handleFrontLoad}
											/>
										</div>
										<div
											className="tarot-card__art-layer tarot-card__art-layer--upright"
											aria-hidden={!previewUpright}
										>
											{mountUprightPreview ? (
												<CardArtMark
													src={imageSrc}
													alt=""
													size="spread"
													eager={revealLoading || preloadFront}
													onLoad={handleFrontLoad}
												/>
											) : null}
										</div>
									</div>
								) : (
									<CardArtMark
										src={imageSrc}
										alt=""
										size="spread"
										eager={revealLoading || preloadFront}
										onLoad={handleFrontLoad}
									/>
								)}
							</div>
						) : null}
					</div>
				</button>
			</div>
		</div>
	);
});
