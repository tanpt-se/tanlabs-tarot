import gsap from "gsap";
import { didSelfViewLayoutResize } from "../self-view/spread-layout";
import { GSAP_EASE_IN_OUT, GSAP_EASE_OUT } from "./constants";
import { prefersReducedMotion } from "./reduced-motion";

/** Draw sequence: resize (if grid band changes) → shift → reveal → settle. */
const LAYOUT_RESIZE_DURATION_S = 0.28;
const SHIFT_MOVE_DURATION_S = 0.5;
const NEW_CARD_REVEAL_DURATION_S = 0.35;

const POSITION_EPSILON_PX = 0.5;
const SCALE_EPSILON = 0.02;

type ViewportPoint = {
	x: number;
	y: number;
};

type ShiftPrep = {
	dx: number;
	dy: number;
	scale: number;
};

export type SelfViewPreparedSlotReservation = {
	shiftedCards: Map<number, ShiftPrep>;
	slotIndex: number;
	animatedElements: HTMLElement[];
	layoutResized: boolean;
};

export type SelfViewSlotReservationHandle = {
	timeline: gsap.core.Timeline;
	slotIndex: number;
};

export type SelfViewCardRevealHandle = {
	timeline: gsap.core.Animation;
	cardIndex: number;
};

const tweenDefaults = {
	transformOrigin: "50% 50%",
	force3D: false,
	autoRound: true,
} as const;

function getMotionTarget(cardRoot: HTMLDivElement): HTMLElement {
	return cardRoot;
}

function elementCenter(rect: DOMRect): ViewportPoint {
	return {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2,
	};
}

function markLayoutAnimating(element: HTMLElement, animating: boolean): void {
	const root = element.closest<HTMLElement>(".tarot-card");
	if (!root) return;

	if (animating) {
		root.setAttribute("data-self-view-layout-anim", "true");
	} else {
		root.removeAttribute("data-self-view-layout-anim");
	}
}

function resetMotionTarget(element: HTMLElement): void {
	gsap.killTweensOf(element);
	markLayoutAnimating(element, false);
	gsap.set(element, { x: 0, y: 0, scale: 1, opacity: 1 });
}

function releaseCardMotion(element: HTMLElement): void {
	resetMotionTarget(element);
}

function uniformScale(oldRect: DOMRect, current: DOMRect): number {
	return Math.min(oldRect.width / current.width, oldRect.height / current.height);
}

function needsPositionShift(dx: number, dy: number): boolean {
	return Math.abs(dx) >= POSITION_EPSILON_PX || Math.abs(dy) >= POSITION_EPSILON_PX;
}

function needsScaleShift(scale: number): boolean {
	return Math.abs(scale - 1) >= SCALE_EPSILON;
}

function computeShiftPrep(
	element: HTMLElement,
	oldRect: DOMRect,
): ShiftPrep | null {
	const current = element.getBoundingClientRect();
	if (current.width <= 0 || current.height <= 0) return null;

	const oldCenter = elementCenter(oldRect);
	const newCenter = elementCenter(current);
	const dx = oldCenter.x - newCenter.x;
	const dy = oldCenter.y - newCenter.y;
	const scale = uniformScale(oldRect, current);

	if (
		!needsPositionShift(dx, dy) &&
		!needsScaleShift(scale)
	) {
		return null;
	}

	return { dx, dy, scale };
}

export function captureSelfViewCardRects(
	cardRoots: Map<number, HTMLDivElement>,
): Map<number, DOMRect> {
	const map = new Map<number, DOMRect>();
	cardRoots.forEach((root, index) => {
		const target = getMotionTarget(root);
		map.set(index, DOMRect.fromRect(target.getBoundingClientRect()));
	});
	return map;
}

/** Target card width after layout reflow — used to lock size for the draw sequence. */
export function measureSelfViewSlotCardWidthPx(
	cardRoots: Map<number, HTMLDivElement>,
	slotIndex: number,
): number | null {
	const root = cardRoots.get(slotIndex);
	if (!root) return null;

	const target = getMotionTarget(root);
	const width = target.getBoundingClientRect().width;
	return width > 0 ? width : null;
}

export function releaseSelfViewLayoutMotion(
	elements: Iterable<HTMLElement>,
): void {
	for (const element of elements) {
		releaseCardMotion(element);
	}
}

/** Shift existing cards into the layout that reserves the next slot. */
export function prepareSelfViewSlotReservation(options: {
	cardRoots: Map<number, HTMLDivElement>;
	slotIndex: number;
	oldCardRects: Map<number, DOMRect>;
	previousCount: number;
	nextCount: number;
}): SelfViewPreparedSlotReservation | null {
	if (prefersReducedMotion()) {
		return null;
	}

	const { cardRoots, slotIndex, oldCardRects, previousCount, nextCount } =
		options;
	if (!cardRoots.has(slotIndex)) return null;

	const layoutResized = didSelfViewLayoutResize(previousCount, nextCount);
	const shiftedCards = new Map<number, ShiftPrep>();
	const animatedElements: HTMLElement[] = [];

	for (let index = 0; index < slotIndex; index += 1) {
		const root = cardRoots.get(index);
		const oldRect = oldCardRects.get(index);
		if (!root || !oldRect) continue;

		const element = getMotionTarget(root);
		const delta = computeShiftPrep(element, oldRect);
		if (!delta) {
			resetMotionTarget(element);
			continue;
		}

		const shouldAnimate =
			needsPositionShift(delta.dx, delta.dy) ||
			needsScaleShift(delta.scale);

		if (!shouldAnimate) {
			resetMotionTarget(element);
			continue;
		}

		shiftedCards.set(index, delta);
		animatedElements.push(element);
		gsap.killTweensOf(element);
		markLayoutAnimating(element, true);

		const startScale = needsScaleShift(delta.scale) ? delta.scale : 1;

		gsap.set(element, {
			...tweenDefaults,
			opacity: 1,
			x: delta.dx,
			y: delta.dy,
			scale: startScale,
		});
	}

	return { shiftedCards, slotIndex, animatedElements, layoutResized };
}

export function playSelfViewSlotReservation(
	options: {
		cardRoots: Map<number, HTMLDivElement>;
		onComplete?: () => void;
	},
	prepared: SelfViewPreparedSlotReservation,
): SelfViewSlotReservationHandle | null {
	if (prefersReducedMotion()) {
		options.onComplete?.();
		return null;
	}

	const { cardRoots, onComplete } = options;
	const { shiftedCards, slotIndex, layoutResized } = prepared;

	const finish = () => {
		requestAnimationFrame(() => {
			onComplete?.();
		});
	};

	if (shiftedCards.size === 0) {
		finish();
		return { timeline: gsap.timeline(), slotIndex };
	}

	const tl = gsap.timeline({ onComplete: finish });

	shiftedCards.forEach((delta, index) => {
		const root = cardRoots.get(index);
		if (!root) return;

		const element = getMotionTarget(root);
		const needsMove = needsPositionShift(delta.dx, delta.dy);
		const needsResize =
			layoutResized && needsScaleShift(delta.scale);
		const needsScaleSnap =
			!layoutResized && needsScaleShift(delta.scale);

		// Step 1 — shrink to new grid size (all cards together, position held).
		if (needsResize) {
			tl.to(
				element,
				{
					scale: 1,
					duration: LAYOUT_RESIZE_DURATION_S,
					ease: GSAP_EASE_OUT,
					overwrite: "auto",
					...tweenDefaults,
				},
				0,
			);
		}

		// Step 2 — move into slot (all cards together, scale locked at 1).
		if (needsMove || needsScaleSnap) {
			tl.to(
				element,
				{
					x: 0,
					y: 0,
					scale: 1,
					duration: SHIFT_MOVE_DURATION_S,
					ease: GSAP_EASE_IN_OUT,
					overwrite: "auto",
					...tweenDefaults,
				},
				needsResize ? LAYOUT_RESIZE_DURATION_S : 0,
			);
		}
	});

	return { timeline: tl, slotIndex };
}

export function killSelfViewSlotReservation(
	handle: SelfViewSlotReservationHandle | null,
	animatedElements: Iterable<HTMLElement>,
): void {
	if (!handle) return;
	handle.timeline.kill();
	for (const element of animatedElements) {
		resetMotionTarget(element);
	}
}

/** Step 3 — new card at full opacity (card back visible, no white flash). */
export function prepareSelfViewCardInPlaceReveal(
	cardRoot: HTMLDivElement,
): HTMLElement | null {
	if (prefersReducedMotion()) {
		return null;
	}

	const element = getMotionTarget(cardRoot);
	const currentRect = element.getBoundingClientRect();
	if (currentRect.width <= 0 || currentRect.height <= 0) {
		return null;
	}

	gsap.killTweensOf(element);
	markLayoutAnimating(element, true);
	gsap.set(element, {
		...tweenDefaults,
		x: 0,
		y: 0,
		scale: 1,
		opacity: 1,
	});

	return element;
}

/** Brief settle beat — no opacity fade (avoids white gap under card). */
export function playSelfViewCardInPlaceReveal(options: {
	cardRoot: HTMLDivElement;
	cardIndex: number;
	onComplete?: () => void;
}): SelfViewCardRevealHandle | null {
	if (prefersReducedMotion()) {
		options.onComplete?.();
		return null;
	}

	const { cardIndex, onComplete } = options;

	const tween = gsap.delayedCall(NEW_CARD_REVEAL_DURATION_S, () => {
		requestAnimationFrame(() => {
			onComplete?.();
		});
	});

	return { timeline: tween, cardIndex };
}

export function killSelfViewCardInPlaceReveal(
	handle: SelfViewCardRevealHandle | null,
	cardRoot: HTMLDivElement | null,
): void {
	if (!handle) return;
	handle.timeline.kill();
	if (cardRoot) {
		const element = getMotionTarget(cardRoot);
		resetMotionTarget(element);
	}
}
