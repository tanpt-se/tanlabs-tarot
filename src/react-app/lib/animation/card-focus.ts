import gsap from "gsap";
import { GSAP_EASE_IN_OUT, GSAP_EASE_OUT } from "./constants";
import { prefersReducedMotion } from "./reduced-motion";
import { getSelfViewSingleCardWidth } from "../self-view/spread-layout";

const CARD_FOCUS_IN_DURATION_S = 0.54;
const CARD_FOCUS_OUT_DURATION_S = 0.46;

export type CardFocusRect = Pick<
	DOMRectReadOnly,
	"left" | "top" | "width" | "height"
>;

export function freezeCardFocusRect(rect: DOMRectReadOnly): CardFocusRect {
	return {
		left: rect.left,
		top: rect.top,
		width: rect.width,
		height: rect.height,
	};
}

function getSelfViewFocusTargetWidth(): number {
	return getSelfViewSingleCardWidth();
}

function getCenterMotion(origin: CardFocusRect) {
	const startX = origin.left + origin.width / 2;
	const startY = origin.top + origin.height / 2;
	const endX = window.innerWidth / 2;
	const endY = window.innerHeight / 2;

	return { startX, startY, endX, endY };
}

export function applyCardFocusStartPose(
	target: HTMLElement,
	origin: CardFocusRect,
): void {
	const { startX, startY } = getCenterMotion(origin);

	gsap.set(target, {
		width: origin.width,
		x: startX,
		y: startY,
		xPercent: -50,
		yPercent: -50,
		scale: 1,
		rotation: 0,
		rotationY: 0,
		transformOrigin: "50% 50%",
		force3D: true,
		opacity: 1,
	});
}

function applyCardFocusEndPose(
	target: HTMLElement,
	origin: CardFocusRect,
): void {
	applyCardFocusStartPose(target, origin);
}

export function animateCardFocusIn(
	target: HTMLElement,
	origin: CardFocusRect,
): gsap.core.Tween | gsap.core.Timeline {
	gsap.killTweensOf(target);

	const targetWidth = getSelfViewFocusTargetWidth();
	const { endX, endY } = getCenterMotion(origin);

	applyCardFocusStartPose(target, origin);

	if (prefersReducedMotion()) {
		return gsap.set(target, {
			width: targetWidth,
			x: endX,
			y: endY,
			scale: 1,
			rotation: 0,
			rotationY: 0,
		});
	}

	return gsap.fromTo(
		target,
		{
			rotation: -6,
			rotationY: 14,
		},
		{
			width: targetWidth,
			x: endX,
			y: endY,
			scale: 1,
			rotation: 0,
			rotationY: 0,
			duration: CARD_FOCUS_IN_DURATION_S,
			ease: GSAP_EASE_OUT,
			overwrite: "auto",
		},
	);
}

export function animateCardFocusOut(
	target: HTMLElement,
	origin: CardFocusRect,
): Promise<void> {
	gsap.killTweensOf(target);

	const { startX, startY } = getCenterMotion(origin);

	if (prefersReducedMotion()) {
		applyCardFocusEndPose(target, origin);
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		gsap.to(target, {
			width: origin.width,
			x: startX,
			y: startY,
			xPercent: -50,
			yPercent: -50,
			scale: 1,
			rotation: 0,
			rotationY: 0,
			duration: CARD_FOCUS_OUT_DURATION_S,
			ease: GSAP_EASE_IN_OUT,
			overwrite: "auto",
			onComplete: () => {
				applyCardFocusEndPose(target, origin);
				resolve();
			},
		});
	});
}

export function hideCardFocusShell(target: HTMLElement): void {
	gsap.killTweensOf(target);
	gsap.set(target, { opacity: 0 });
	target.style.visibility = "hidden";
	target.style.pointerEvents = "none";
}

export function waitForPaint(): Promise<void> {
	return new Promise((resolve) => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => resolve());
		});
	});
}
