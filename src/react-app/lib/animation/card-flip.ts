import gsap from "gsap";
import {
	CARD_FLIP_DURATION_S,
	GSAP_EASE_IN_OUT,
	GSAP_EASE_OUT,
	GSAP_EASE_SPRING,
} from "./constants";
import { prefersReducedMotion } from "./reduced-motion";

export function setCardFlipInstant(
	flipped: boolean,
	inner: HTMLElement,
	back: HTMLElement,
	front: HTMLElement,
): void {
	gsap.killTweensOf([inner, back, front]);
	gsap.set(inner, { scale: 1, x: 0, rotation: 0 });
	gsap.set(back, {
		opacity: flipped ? 0 : 1,
		x: 0,
		rotation: 0,
		pointerEvents: flipped ? "none" : "auto",
	});
	gsap.set(front, {
		opacity: flipped ? 1 : 0,
		x: 0,
		rotation: 0,
		visibility: flipped ? "visible" : "hidden",
	});
}

export function animateCardFlip2D(
	flipped: boolean,
	inner: HTMLElement,
	back: HTMLElement,
	front: HTMLElement,
): gsap.core.Timeline {
	gsap.killTweensOf([inner, back, front]);

	if (prefersReducedMotion()) {
		setCardFlipInstant(flipped, inner, back, front);
		return gsap.timeline();
	}

	const tl = gsap.timeline();

	if (flipped) {
		tl.set(front, { visibility: "visible" })
			.to(inner, {
				scale: 1.07,
				duration: CARD_FLIP_DURATION_S * 0.28,
				ease: GSAP_EASE_OUT,
			})
			.to(
				back,
				{
					x: -28,
					rotation: -8,
					opacity: 0,
					duration: CARD_FLIP_DURATION_S * 0.38,
					ease: "power2.in",
				},
				"-=0.05",
			)
			.fromTo(
				front,
				{ x: 32, rotation: 6, opacity: 0, scale: 0.9 },
				{
					x: 0,
					rotation: 0,
					opacity: 1,
					scale: 1,
					duration: CARD_FLIP_DURATION_S * 0.48,
					ease: GSAP_EASE_SPRING,
				},
				"-=0.22",
			)
			.to(
				inner,
				{
					scale: 1,
					duration: CARD_FLIP_DURATION_S * 0.22,
					ease: GSAP_EASE_IN_OUT,
				},
				"-=0.12",
			);
	} else {
		tl.to(inner, {
			scale: 0.96,
			duration: CARD_FLIP_DURATION_S * 0.18,
			ease: GSAP_EASE_OUT,
		})
			.to(
				front,
				{
					x: 28,
					rotation: 8,
					opacity: 0,
					duration: CARD_FLIP_DURATION_S * 0.35,
					ease: "power2.in",
				},
				"-=0.02",
			)
			.fromTo(
				back,
				{ x: -24, rotation: -6, opacity: 0 },
				{
					x: 0,
					rotation: 0,
					opacity: 1,
					duration: CARD_FLIP_DURATION_S * 0.42,
					ease: GSAP_EASE_SPRING,
				},
				"-=0.18",
			)
			.to(
				inner,
				{
					scale: 1,
					duration: CARD_FLIP_DURATION_S * 0.2,
					ease: GSAP_EASE_IN_OUT,
				},
				"-=0.1",
			)
			.set(front, { visibility: "hidden", x: 0, rotation: 0 });
	}

	return tl;
}
