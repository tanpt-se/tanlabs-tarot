import gsap from "gsap";
import { GSAP_EASE_OUT } from "./constants";
import { prefersReducedMotion } from "./reduced-motion";

const NEW_CARD_ENTER_DURATION_S = 0.54;

export type ViewportPoint = {
	x: number;
	y: number;
};

export function getSelfViewDrawOrigin(): ViewportPoint | null {
	if (typeof document === "undefined") return null;

	const draw = document.querySelector(".self-view-draw-float");
	if (!draw) return null;

	const rect = draw.getBoundingClientRect();
	return {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2,
	};
}

function resetExistingCardTransforms(
	cardRoots: Map<number, HTMLDivElement>,
	upToIndex: number,
): void {
	for (let index = 0; index < upToIndex; index += 1) {
		const element = cardRoots.get(index);
		if (!element) continue;

		gsap.killTweensOf(element);
		gsap.set(element, { x: 0, y: 0, scale: 1, opacity: 1, clearProps: "transform" });
	}
}

/** New card flies in from the draw button — existing cards stay put (layout snaps instantly). */
export function animateSelfViewNewCardEntrance(
	element: HTMLElement,
	origin: ViewportPoint,
): gsap.core.Tween | null {
	if (prefersReducedMotion()) {
		gsap.set(element, { x: 0, y: 0, scale: 1, opacity: 1 });
		return null;
	}

	const last = element.getBoundingClientRect();
	if (last.width <= 0 || last.height <= 0) return null;

	const lastCenterX = last.left + last.width / 2;
	const lastCenterY = last.top + last.height / 2;

	gsap.killTweensOf(element);

	return gsap.fromTo(
		element,
		{
			x: origin.x - lastCenterX,
			y: origin.y - lastCenterY,
			scale: 0.58,
			opacity: 0,
			transformOrigin: "50% 50%",
			force3D: true,
		},
		{
			x: 0,
			y: 0,
			scale: 1,
			opacity: 1,
			duration: NEW_CARD_ENTER_DURATION_S,
			ease: GSAP_EASE_OUT,
			overwrite: "auto",
		},
	);
}

export function runSelfViewAddCardAnimation(options: {
	cardRoots: Map<number, HTMLDivElement>;
	newCardIndex: number;
	drawOrigin: ViewportPoint | null;
}): gsap.core.Tween | null {
	if (prefersReducedMotion()) {
		return null;
	}

	const { cardRoots, newCardIndex, drawOrigin } = options;

	resetExistingCardTransforms(cardRoots, newCardIndex);

	const newCard = cardRoots.get(newCardIndex);
	if (!newCard || !drawOrigin) {
		return null;
	}

	return animateSelfViewNewCardEntrance(newCard, drawOrigin);
}
