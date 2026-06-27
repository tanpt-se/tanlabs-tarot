import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { DrawnCard } from "../../lib/types/reading";
import {
	getCardImage,
	getCardImageUrl,
	isCardImageReady,
	loadCardImage,
} from "../../lib/tarot/card-image";
import type { CardId } from "../../lib/tarot/deck";
import { useLocale } from "../../hooks/use-locale";
import { animateCardDeal } from "../../lib/animation/card-deal";
import {
	animateCardFlip2D,
	setCardFlipInstant,
} from "../../lib/animation/card-flip";
import { CARD_FLIP_DURATION_MS } from "../../lib/animation/constants";
import { CardBack } from "../brand/CardBack";
import { CardArtMark } from "../brand/CardArtMark";
import { RevealSparkle } from "../vfx/RevealSparkle";

interface TarotCardProps {
	card: DrawnCard;
	flipped: boolean;
	index?: number;
	dealIndex?: number;
	revealLoading?: boolean;
	preloadFront?: boolean;
	loadWhenVisible?: boolean;
	sparkleOnReveal?: boolean;
	onRevealReady?: (index: number) => void;
	onRevealFlipComplete?: (index: number) => void;
	onPress?: (index: number) => void;
	onRootElement?: (element: HTMLDivElement | null) => void;
	className?: string;
	disableHoverPreview?: boolean;
	uprightPreview?: boolean;
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
	sparkleOnReveal = false,
	onRootElement,
	className = "",
	disableHoverPreview = false,
	uprightPreview = false,
}: TarotCardProps) {
	const { labels } = useLocale();
	const cardId = card.id as CardId;
	const rootRef = useRef<HTMLDivElement>(null);
	const dealRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const backFaceRef = useRef<HTMLDivElement>(null);
	const frontFaceRef = useRef<HTMLDivElement>(null);
	const revealReadySentRef = useRef(false);
	const revealFlipPendingRef = useRef(false);
	const pendingManualFlipRef = useRef(false);
	const flipInitializedRef = useRef(false);
	const prevFlippedRef = useRef(flipped);
	const dealPlayedRef = useRef(false);
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
	const [sparkleActive, setSparkleActive] = useState(false);
	const sparkleOnRevealRef = useRef(sparkleOnReveal);
	sparkleOnRevealRef.current = sparkleOnReveal;
	const previewUpright =
		uprightPreview || (hovering && flipped && card.reversed && !disableHoverPreview);
	const interactive = Boolean(onPress) && !revealLoading;
	const shouldLoadFront =
		(flipped || revealLoading || preloadFront) &&
		(!loadWhenVisible || isVisible);
	const imageSrc = shouldLoadFront ? getCardImageUrl(cardId) : undefined;
	const backLoading =
		revealLoading || (preloadFront && !flipped && !frontReady);

	useLayoutEffect(() => {
		const inner = innerRef.current;
		const back = backFaceRef.current;
		const front = frontFaceRef.current;
		if (!inner || !back || !front) return;

		if (!flipInitializedRef.current) {
			setCardFlipInstant(flipped, inner, back, front);
			prevFlippedRef.current = flipped;
			flipInitializedRef.current = true;
			return;
		}

		if (!flipAnimating) {
			setCardFlipInstant(prevFlippedRef.current, inner, back, front);
		}
	}, [flipAnimating, flipped, frontReady, imageSrc]);

	useEffect(() => {
		if (!flipInitializedRef.current) return;

		const inner = innerRef.current;
		const back = backFaceRef.current;
		const front = frontFaceRef.current;
		if (!inner || !back || !front) return;
		if (prevFlippedRef.current === flipped) return;

		prevFlippedRef.current = flipped;
		setFlipAnimating(true);

		const timeline = animateCardFlip2D(flipped, inner, back, front);
		void timeline.then(() => {
			setFlipAnimating(false);
			if (flipped && sparkleOnRevealRef.current) {
				setSparkleActive(true);
			}
			if (revealFlipPendingRef.current && flipped) {
				revealFlipPendingRef.current = false;
				onRevealFlipCompleteRef.current?.(index);
			}
		});
	}, [flipped, index]);

	useEffect(() => {
		if (dealIndex === undefined || !dealRef.current || dealPlayedRef.current) {
			return;
		}

		dealPlayedRef.current = true;
		animateCardDeal(dealRef.current, dealIndex);
	}, [dealIndex]);

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
		}, CARD_FLIP_DURATION_MS + 80);

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
		if (disableHoverPreview) return;
		if (!flipped || !card.reversed || !canHoverPreview()) return;
		if (previewElevateTimeoutRef.current) {
			clearTimeout(previewElevateTimeoutRef.current);
			previewElevateTimeoutRef.current = undefined;
		}
		setMountUprightPreview(true);
		setHovering(true);
		setPreviewElevated(true);
	}, [card.reversed, disableHoverPreview, flipped]);

	const handlePointerLeave = useCallback(() => {
		setHovering(false);
		if (disableHoverPreview) return;
		if (!flipped || !card.reversed || !canHoverPreview()) return;

		if (previewElevateTimeoutRef.current) {
			clearTimeout(previewElevateTimeoutRef.current);
		}
		previewElevateTimeoutRef.current = setTimeout(() => {
			setPreviewElevated(false);
			previewElevateTimeoutRef.current = undefined;
		}, 300);
	}, [card.reversed, disableHoverPreview, flipped]);

	useEffect(() => {
		if (uprightPreview) {
			setMountUprightPreview(true);
		}
	}, [uprightPreview]);

	useEffect(() => {
		return () => {
			if (previewElevateTimeoutRef.current) {
				clearTimeout(previewElevateTimeoutRef.current);
			}
		};
	}, []);

	const dealStyle = useMemo(
		() =>
			dealIndex === undefined
				? undefined
				: ({ "--deal-index": dealIndex } as React.CSSProperties),
		[dealIndex],
	);

	return (
		<div
			ref={(node) => {
				rootRef.current = node;
				onRootElement?.(node);
			}}
			className={["tarot-card", className].filter(Boolean).join(" ")}
			data-reveal-loading={revealLoading ? "true" : undefined}
			data-preview-elevated={previewElevated ? "true" : undefined}
			data-gsap-flip="true"
		>
			<div
				ref={dealRef}
				className="tarot-card__deal"
				style={dealStyle}
				data-deal={dealIndex !== undefined ? "true" : undefined}
			>
				<button
					type="button"
					className="tarot-card__flip"
					data-flipped={flipped ? "true" : undefined}
					data-reversed={card.reversed ? "true" : undefined}
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
						ref={innerRef}
						className={
							flipAnimating
								? "tarot-card__inner tarot-card__inner--animating"
								: "tarot-card__inner"
						}
					>
						<div
							ref={backFaceRef}
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
								ref={frontFaceRef}
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
						) : (
							<div
								ref={frontFaceRef}
								className="tarot-card__face tarot-card__face--front"
								aria-hidden
							/>
						)}
					</div>
				</button>
				<RevealSparkle
					active={sparkleActive}
					onComplete={() => setSparkleActive(false)}
				/>
			</div>
		</div>
	);
});
