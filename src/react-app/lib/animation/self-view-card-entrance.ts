import gsap from "gsap";
import {
	computeSelfViewSpreadSlotRects,
	didSelfViewLayoutResize,
	getSelfViewSpreadLayout,
	shouldUseSelfViewLayoutFlight,
	slotRectToViewport,
	type SelfViewSpreadSlotRect,
} from "../self-view/spread-layout";
import {
	GSAP_EASE_IN_OUT,
	GSAP_EASE_OUT,
	SELF_VIEW_DRAW_SEQUENCE,
} from "./constants";
import { prefersReducedMotion } from "./reduced-motion";

/** Draw sequence: resize (if grid band changes) → shift → reveal → settle. */
const LAYOUT_RESIZE_DURATION_S = SELF_VIEW_DRAW_SEQUENCE.layoutResize;
const SHIFT_MOVE_DURATION_S = SELF_VIEW_DRAW_SEQUENCE.layoutShift;
const NEW_CARD_REVEAL_DURATION_S = SELF_VIEW_DRAW_SEQUENCE.revealSettle;

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

export type SelfViewFlightShift = {
	fromLeft: number;
	fromTop: number;
	fromWidth: number;
	fromHeight: number;
	toLeft: number;
	toTop: number;
	toWidth: number;
	toHeight: number;
};

export type SelfViewPreparedSlotReservation = {
	shiftedCards: Map<number, ShiftPrep>;
	flightCards: Map<number, SelfViewFlightShift>;
	slotIndex: number;
	animatedElements: HTMLElement[];
	layoutResized: boolean;
	layoutFlight: boolean;
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

function getSpreadRoot(cardRoot: HTMLDivElement): HTMLElement | null {
	return cardRoot.closest<HTMLElement>(".self-view-spread");
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

function markLayoutFlight(element: HTMLElement, flying: boolean): void {
	if (flying) {
		element.setAttribute("data-self-view-flight", "true");
	} else {
		element.removeAttribute("data-self-view-flight");
	}
}

function resetMotionTarget(element: HTMLElement): void {
	gsap.killTweensOf(element);
	markLayoutAnimating(element, false);
	markLayoutFlight(element, false);
	gsap.set(element, { x: 0, y: 0, scale: 1, opacity: 1 });
}

function releaseFlightTarget(element: HTMLElement): void {
	gsap.killTweensOf(element);
	markLayoutAnimating(element, false);
	markLayoutFlight(element, false);
	gsap.set(element, {
		clearProps:
			"position,left,top,width,height,margin,transform,x,y,scale,rotation",
	});
}

function releaseCardMotion(element: HTMLElement): void {
	if (element.hasAttribute("data-self-view-flight")) {
		releaseFlightTarget(element);
		return;
	}
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

function computeShiftPrepFromRects(
	oldRect: DOMRect,
	newRect: DOMRect,
): ShiftPrep | null {
	const oldCenter = elementCenter(oldRect);
	const newCenter = elementCenter(newRect);
	const dx = oldCenter.x - newCenter.x;
	const dy = oldCenter.y - newCenter.y;
	const scale = uniformScale(oldRect, newRect);

	if (!needsPositionShift(dx, dy) && !needsScaleShift(scale)) {
		return null;
	}

	return { dx, dy, scale };
}

function computeShiftPrep(
	element: HTMLElement,
	oldRect: DOMRect,
): ShiftPrep | null {
	const current = element.getBoundingClientRect();
	if (current.width <= 0 || current.height <= 0) return null;
	return computeShiftPrepFromRects(oldRect, current);
}

function needsFlightShift(
	oldRect: DOMRect,
	targetSlot: SelfViewSpreadSlotRect,
	spreadBounds: DOMRect,
): boolean {
	const targetRect = slotRectToViewport(targetSlot, spreadBounds);
	return computeShiftPrepFromRects(oldRect, targetRect) !== null;
}

function pinCardForFlight(
	element: HTMLElement,
	shift: SelfViewFlightShift,
): void {
	gsap.killTweensOf(element);
	markLayoutAnimating(element, true);
	markLayoutFlight(element, true);

	gsap.set(element, {
		position: "absolute",
		left: shift.fromLeft,
		top: shift.fromTop,
		width: shift.fromWidth,
		height: shift.fromHeight,
		margin: 0,
		x: 0,
		y: 0,
		scale: 1,
		rotation: 0,
		opacity: 1,
		...tweenDefaults,
	});
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
	const slotRoot = cardRoots.get(slotIndex);
	if (!slotRoot) return null;

	const spread = getSpreadRoot(slotRoot);
	if (!spread) return null;

	const layoutResized = didSelfViewLayoutResize(previousCount, nextCount);
	const layoutFlight = shouldUseSelfViewLayoutFlight(
		previousCount,
		nextCount,
		slotIndex,
	);
	const shiftedCards = new Map<number, ShiftPrep>();
	const flightCards = new Map<number, SelfViewFlightShift>();
	const animatedElements: HTMLElement[] = [];

	if (layoutFlight) {
		const spreadBounds = spread.getBoundingClientRect();
		const measuredWidthPx = measureSelfViewSlotCardWidthPx(
			cardRoots,
			slotIndex,
		);
		const baseLayout = getSelfViewSpreadLayout(nextCount);
		const cardWidthPx = measuredWidthPx ?? baseLayout.cardWidthPx;
		const targetSlots = computeSelfViewSpreadSlotRects(nextCount, {
			layout: {
				...baseLayout,
				cardWidthPx,
				spreadWidthPx: spreadBounds.width,
			},
		});

		for (let index = 0; index < slotIndex; index += 1) {
			const root = cardRoots.get(index);
			const oldRect = oldCardRects.get(index);
			const targetSlot = targetSlots.get(index);
			if (!root || !oldRect || !targetSlot) continue;

			if (!needsFlightShift(oldRect, targetSlot, spreadBounds)) {
				resetMotionTarget(getMotionTarget(root));
				continue;
			}

			const element = getMotionTarget(root);
			const shift: SelfViewFlightShift = {
				fromLeft: oldRect.left - spreadBounds.left,
				fromTop: oldRect.top - spreadBounds.top,
				fromWidth: oldRect.width,
				fromHeight: oldRect.height,
				toLeft: targetSlot.left,
				toTop: targetSlot.top,
				toWidth: targetSlot.width,
				toHeight: targetSlot.height,
			};

			flightCards.set(index, shift);
			animatedElements.push(element);
			pinCardForFlight(element, shift);
		}
	} else {
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
	}

	return {
		shiftedCards,
		flightCards,
		slotIndex,
		animatedElements,
		layoutResized,
		layoutFlight,
	};
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
	const { shiftedCards, flightCards, slotIndex, layoutResized, layoutFlight } =
		prepared;

	const finish = () => {
		requestAnimationFrame(() => {
			onComplete?.();
		});
	};

	const hasMotion = layoutFlight
		? flightCards.size > 0
		: shiftedCards.size > 0;

	if (!hasMotion) {
		onComplete?.();
		return { timeline: gsap.timeline(), slotIndex };
	}

	const tl = gsap.timeline({ onComplete: finish });

	if (layoutFlight) {
		const duration =
			layoutResized
				? LAYOUT_RESIZE_DURATION_S + SHIFT_MOVE_DURATION_S
				: SHIFT_MOVE_DURATION_S;

		flightCards.forEach((shift, index) => {
			const root = cardRoots.get(index);
			if (!root) return;

			const element = getMotionTarget(root);
			tl.to(
				element,
				{
					left: shift.toLeft,
					top: shift.toTop,
					width: shift.toWidth,
					height: shift.toHeight,
					duration,
					ease: GSAP_EASE_IN_OUT,
					overwrite: "auto",
				},
				0,
			);
		});

		return { timeline: tl, slotIndex };
	}

	shiftedCards.forEach((delta, index) => {
		const root = cardRoots.get(index);
		if (!root) return;

		const element = getMotionTarget(root);
		const needsMove = needsPositionShift(delta.dx, delta.dy);
		const needsResize =
			layoutResized && needsScaleShift(delta.scale);
		const needsScaleSnap =
			!layoutResized && needsScaleShift(delta.scale);

		if (layoutResized && (needsResize || needsMove || needsScaleSnap)) {
			tl.to(
				element,
				{
					x: 0,
					y: 0,
					scale: 1,
					duration: LAYOUT_RESIZE_DURATION_S + SHIFT_MOVE_DURATION_S,
					ease: GSAP_EASE_IN_OUT,
					overwrite: "auto",
					...tweenDefaults,
				},
				0,
			);
			return;
		}

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
		releaseCardMotion(element);
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
