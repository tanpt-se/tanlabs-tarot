import gsap from "gsap";
import { CARD_FLIP_DURATION_S, GSAP_EASE_IN_OUT } from "./constants";
import { prefersReducedMotion } from "./reduced-motion";

const FLIP_PERSPECTIVE_PX = 900;

export function setCardFlip3DInstant(flipped: boolean, inner: HTMLElement): void {
	gsap.killTweensOf(inner);
	gsap.set(inner, {
		rotationY: flipped ? 180 : 0,
		transformPerspective: FLIP_PERSPECTIVE_PX,
	});
}

export function animateCardFlip3D(
	flipped: boolean,
	inner: HTMLElement,
): gsap.core.Timeline {
	gsap.killTweensOf(inner);

	if (prefersReducedMotion()) {
		setCardFlip3DInstant(flipped, inner);
		return gsap.timeline();
	}

	return gsap.timeline().to(inner, {
		rotationY: flipped ? 180 : 0,
		duration: CARD_FLIP_DURATION_S,
		ease: GSAP_EASE_IN_OUT,
		transformPerspective: FLIP_PERSPECTIVE_PX,
	});
}
