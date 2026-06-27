import gsap from "gsap";
import { GSAP_EASE_IN_OUT, GSAP_EASE_OUT } from "./constants";
import { prefersReducedMotion } from "./reduced-motion";

const SHIFT_DURATION_S = 0.5;
const SHIFT_STAGGER_S = 0.03;
const NEW_CARD_IN_PLACE_DURATION_S = 0.38;
const ENTRANCE_START_SCALE = 0.9;

export type ViewportPoint = {
	x: number;
	y: number;
};

type ShiftPrep = {
	dx: number;
	dy: number;
	scaleX: number;
	scaleY: number;
};

export type SelfViewPreparedSlotReservation = {
	shiftedCards: Map<number, ShiftPrep>;
	slotIndex: number;
	animatedElements: HTMLElement[];
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
	force3D: true,
	autoRound: false,
} as const;

function elementCenter(rect: DOMRect): ViewportPoint {
	return {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2,
	};
}

function markLayoutAnimating(element: HTMLElement, animating: boolean): void {
	if (animating) {
		element.setAttribute("data-self-view-layout-anim", "true");
	} else {
		element.removeAttribute("data-self-view-layout-anim");
	}
}

function releaseCardMotion(element: HTMLElement): void {
	gsap.killTweensOf(element);
	markLayoutAnimating(element, false);
	gsap.set(element, { clearProps: "transform,opacity" });
}

function computeFlipDelta(
	element: HTMLElement,
	oldRect: DOMRect,
): ShiftPrep | null {
	const current = element.getBoundingClientRect();
	if (current.width <= 0 || current.height <= 0) return null;

	const oldCenter = elementCenter(oldRect);
	const newCenter = elementCenter(current);
	const dx = oldCenter.x - newCenter.x;
	const dy = oldCenter.y - newCenter.y;
	const scaleX = oldRect.width / current.width;
	const scaleY = oldRect.height / current.height;

	if (
		Math.abs(dx) < 0.5 &&
		Math.abs(dy) < 0.5 &&
		Math.abs(scaleX - 1) < 0.02 &&
		Math.abs(scaleY - 1) < 0.02
	) {
		return null;
	}

	return { dx, dy, scaleX, scaleY };
}

export function captureSelfViewCardRects(
	cardRoots: Map<number, HTMLDivElement>,
): Map<number, DOMRect> {
	const map = new Map<number, DOMRect>();
	cardRoots.forEach((element, index) => {
		map.set(index, DOMRect.fromRect(element.getBoundingClientRect()));
	});
	return map;
}

/** Phase 1 — shift existing cards into the layout that reserves the next slot. */
export function prepareSelfViewSlotReservation(options: {
	cardRoots: Map<number, HTMLDivElement>;
	slotIndex: number;
	oldCardRects: Map<number, DOMRect>;
}): SelfViewPreparedSlotReservation | null {
	if (prefersReducedMotion()) {
		return null;
	}

	const { cardRoots, slotIndex, oldCardRects } = options;
	if (!cardRoots.has(slotIndex)) return null;

	const shiftedCards = new Map<number, ShiftPrep>();
	const animatedElements: HTMLElement[] = [];

	for (let index = 0; index < slotIndex; index += 1) {
		const element = cardRoots.get(index);
		const oldRect = oldCardRects.get(index);
		if (!element || !oldRect) continue;

		const delta = computeFlipDelta(element, oldRect);
		if (!delta) {
			releaseCardMotion(element);
			continue;
		}

		shiftedCards.set(index, delta);
		animatedElements.push(element);
		gsap.killTweensOf(element);
		markLayoutAnimating(element, true);
		gsap.set(element, {
			...tweenDefaults,
			x: delta.dx,
			y: delta.dy,
			scaleX: delta.scaleX,
			scaleY: delta.scaleY,
		});
	}

	return { shiftedCards, slotIndex, animatedElements };
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
	const { shiftedCards, slotIndex, animatedElements } = prepared;

	const finish = () => {
		for (const element of animatedElements) {
			releaseCardMotion(element);
		}
		requestAnimationFrame(() => {
			onComplete?.();
		});
	};

	if (shiftedCards.size === 0) {
		finish();
		return { timeline: gsap.timeline(), slotIndex };
	}

	const tl = gsap.timeline({ onComplete: finish });
	let staggerIndex = 0;

	shiftedCards.forEach((_delta, index) => {
		const element = cardRoots.get(index);
		if (!element) return;

		tl.to(
			element,
			{
				x: 0,
				y: 0,
				scaleX: 1,
				scaleY: 1,
				duration: SHIFT_DURATION_S,
				ease: GSAP_EASE_IN_OUT,
				overwrite: "auto",
				...tweenDefaults,
			},
			staggerIndex * SHIFT_STAGGER_S,
		);
		staggerIndex += 1;
	});

	return { timeline: tl, slotIndex };
}

/** Phase 2 — reveal card in place at its reserved slot (no fly-in from elsewhere). */
export function playSelfViewCardInPlaceReveal(options: {
	cardRoot: HTMLElement;
	cardIndex: number;
	onComplete?: () => void;
}): SelfViewCardRevealHandle | null {
	if (prefersReducedMotion()) {
		options.onComplete?.();
		return null;
	}

	const { cardRoot, cardIndex, onComplete } = options;
	const rect = cardRoot.getBoundingClientRect();
	if (rect.width <= 0 || rect.height <= 0) {
		onComplete?.();
		return null;
	}

	gsap.killTweensOf(cardRoot);
	markLayoutAnimating(cardRoot, true);
	gsap.set(cardRoot, {
		...tweenDefaults,
		scaleX: ENTRANCE_START_SCALE,
		scaleY: ENTRANCE_START_SCALE,
		opacity: 0,
	});

	const tween = gsap.to(cardRoot, {
		scaleX: 1,
		scaleY: 1,
		opacity: 1,
		duration: NEW_CARD_IN_PLACE_DURATION_S,
		ease: GSAP_EASE_OUT,
		overwrite: "auto",
		...tweenDefaults,
		onComplete: () => {
			releaseCardMotion(cardRoot);
			requestAnimationFrame(() => {
				onComplete?.();
			});
		},
	});

	return { timeline: tween, cardIndex };
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

export function killSelfViewCardInPlaceReveal(
	handle: SelfViewCardRevealHandle | null,
	cardRoot: HTMLElement | null,
): void {
	if (!handle) return;
	handle.timeline.kill();
	if (cardRoot) {
		releaseCardMotion(cardRoot);
	}
}
