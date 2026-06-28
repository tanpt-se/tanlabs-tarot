import gsap from "gsap";
import {
	CARD_DEAL_FLIGHT_ARC_PX,
	CARD_DEAL_FLIGHT_DURATION_S,
	GSAP_EASE_OUT,
	GSAP_EASE_SPRING,
} from "./constants";
import { prefersReducedMotion } from "./reduced-motion";

export type CardDealFlightOptions = {
	ghost: HTMLElement;
	fromRect: DOMRect;
	toRect: DOMRect;
	onComplete?: () => void;
};

function centerOf(rect: DOMRect): { x: number; y: number } {
	return {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2,
	};
}

export function positionDealFlightGhost(
	ghost: HTMLElement,
	fromRect: DOMRect,
): void {
	gsap.set(ghost, {
		position: "fixed",
		left: fromRect.left,
		top: fromRect.top,
		width: fromRect.width,
		height: fromRect.height,
		margin: 0,
		padding: 0,
		x: 0,
		y: 0,
		rotation: -8,
		scale: 0.88,
		opacity: 1,
		transformOrigin: "50% 50%",
		zIndex: 1200,
		pointerEvents: "none",
	});
}

export function animateCardDealFlight(
	options: CardDealFlightOptions,
): gsap.core.Timeline {
	const { ghost, fromRect, toRect, onComplete } = options;

	gsap.killTweensOf(ghost);

	if (prefersReducedMotion()) {
		gsap.set(ghost, { opacity: 0 });
		onComplete?.();
		return gsap.timeline();
	}

	const from = centerOf(fromRect);
	const to = centerOf(toRect);
	const deltaX = to.x - from.x;
	const deltaY = to.y - from.y;

	positionDealFlightGhost(ghost, fromRect);

	const tl = gsap.timeline({ onComplete });

	tl.to(ghost, {
		x: deltaX * 0.5,
		y: deltaY * 0.5 - CARD_DEAL_FLIGHT_ARC_PX,
		rotation: -4,
		scale: 0.96,
		duration: CARD_DEAL_FLIGHT_DURATION_S * 0.45,
		ease: GSAP_EASE_OUT,
	})
		.to(ghost, {
			x: deltaX,
			y: deltaY,
			rotation: 0,
			scale: 1.02,
			duration: CARD_DEAL_FLIGHT_DURATION_S * 0.4,
			ease: GSAP_EASE_OUT,
		})
		.to(ghost, {
			scale: 1,
			duration: CARD_DEAL_FLIGHT_DURATION_S * 0.15,
			ease: GSAP_EASE_SPRING,
		})
		.to(
			ghost,
			{
				opacity: 0,
				duration: 0.08,
				ease: "power1.in",
			},
			`-=${CARD_DEAL_FLIGHT_DURATION_S * 0.1}`,
		);

	return tl;
}
