import gsap from "gsap";
import {
	CARD_DEAL_DURATION_S,
	CARD_DEAL_STAGGER_S,
	GSAP_EASE_SPRING,
} from "./constants";
import { prefersReducedMotion } from "./reduced-motion";

export function animateCardDeal(
	target: HTMLElement,
	dealIndex: number,
): gsap.core.Tween | gsap.core.Timeline {
	gsap.killTweensOf(target);

	if (prefersReducedMotion()) {
		return gsap.set(target, { opacity: 1, y: 0, scale: 1 });
	}

	return gsap.fromTo(
		target,
		{
			opacity: 0,
			y: 36,
			scale: 0.82,
			rotation: -4 + dealIndex * 2,
		},
		{
			opacity: 1,
			y: 0,
			scale: 1,
			rotation: 0,
			duration: CARD_DEAL_DURATION_S,
			delay: dealIndex * CARD_DEAL_STAGGER_S,
			ease: GSAP_EASE_SPRING,
		},
	);
}
