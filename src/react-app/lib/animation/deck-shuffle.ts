import gsap from "gsap";
import {
	SELF_VIEW_SHUFFLE_DURATION_S,
	SPREAD_SHUFFLE_DURATION_S,
} from "./constants";
import { prefersReducedMotion } from "./reduced-motion";

type ShuffleVariant = "spread" | "self-view";

interface ShuffleKeyframe {
	rotation: number;
	x: number;
	y: number;
}

const REST_POSES: Record<ShuffleVariant, ShuffleKeyframe[]> = {
	spread: [
		{ rotation: -10, x: 9.6, y: 0 },
		{ rotation: 2, x: 0, y: 0 },
		{ rotation: 12, x: -9.6, y: 0 },
	],
	"self-view": [
		{ rotation: -8, x: 7.2, y: 0 },
		{ rotation: 2, x: 0, y: 0 },
		{ rotation: 10, x: -7.2, y: 0 },
	],
};

const SPREAD_SEQUENCES: ShuffleKeyframe[][] = [
	[
		{ rotation: -10, x: 9.6, y: 0 },
		{ rotation: -22, x: -19.2, y: -3.2 },
		{ rotation: -4, x: -1.6, y: -8 },
		{ rotation: 6, x: 11.2, y: -2.4 },
		{ rotation: -2, x: 3.2, y: -0.8 },
		{ rotation: -10, x: 9.6, y: 0 },
	],
	[
		{ rotation: 2, x: 0, y: 0 },
		{ rotation: 10, x: 1.6, y: -9.6 },
		{ rotation: -8, x: -11.2, y: -4.8 },
		{ rotation: 5, x: 8, y: -5.6 },
		{ rotation: 0, x: 0, y: -0.8 },
		{ rotation: 2, x: 0, y: 0 },
	],
	[
		{ rotation: 12, x: -9.6, y: 0 },
		{ rotation: 20, x: 17.6, y: -2.4 },
		{ rotation: -3, x: 3.2, y: -7.2 },
		{ rotation: -14, x: -14.4, y: -3.2 },
		{ rotation: 5, x: -3.2, y: -0.8 },
		{ rotation: 12, x: -9.6, y: 0 },
	],
];

const SELF_VIEW_SEQUENCES: ShuffleKeyframe[][] = [
	[
		{ rotation: -8, x: 7.2, y: 0 },
		{ rotation: -24, x: -21.6, y: -2.4 },
		{ rotation: -6, x: -3.2, y: -8.8 },
		{ rotation: 8, x: 13.6, y: -3.2 },
		{ rotation: -2, x: 2.4, y: -1.28 },
		{ rotation: -8, x: 7.2, y: 0 },
	],
	[
		{ rotation: 2, x: 0, y: 0 },
		{ rotation: 10, x: 1.6, y: -9.92 },
		{ rotation: -8, x: -11.2, y: -4.8 },
		{ rotation: 5, x: 8, y: -5.6 },
		{ rotation: 0, x: 0, y: -0.8 },
		{ rotation: 2, x: 0, y: 0 },
	],
	[
		{ rotation: 10, x: -7.2, y: 0 },
		{ rotation: 18, x: 16, y: -2.4 },
		{ rotation: -4, x: 2.4, y: -7.2 },
		{ rotation: -12, x: -14.4, y: -3.2 },
		{ rotation: 4, x: -2.4, y: -0.8 },
		{ rotation: 10, x: -7.2, y: 0 },
	],
];

function applyPose(element: HTMLElement, pose: ShuffleKeyframe): void {
	gsap.set(element, {
		rotation: pose.rotation,
		x: pose.x,
		y: pose.y,
		transformOrigin: "50% 88%",
	});
}

export function setDeckShuffleRest(
	cards: HTMLElement[],
	variant: ShuffleVariant = "spread",
): void {
	const restPoses = REST_POSES[variant];
	cards.forEach((card, index) => {
		applyPose(card, restPoses[index] ?? restPoses[0]!);
	});
}

export function animateDeckShuffle(
	cards: HTMLElement[],
	variant: ShuffleVariant = "spread",
): () => void {
	if (cards.length === 0) return () => undefined;

	const duration =
		variant === "spread"
			? SPREAD_SHUFFLE_DURATION_S
			: SELF_VIEW_SHUFFLE_DURATION_S;
	const sequences =
		variant === "spread" ? SPREAD_SEQUENCES : SELF_VIEW_SEQUENCES;
	const restPoses = REST_POSES[variant];

	gsap.killTweensOf(cards);

	cards.forEach((card, index) => {
		applyPose(card, restPoses[index] ?? restPoses[0]!);
	});

	if (prefersReducedMotion()) {
		return () => undefined;
	}

	const tl = gsap.timeline();

	cards.forEach((card, index) => {
		const sequence = sequences[index] ?? sequences[0]!;
		const segment = duration / Math.max(sequence.length - 1, 1);
		const startDelay = index * 0.06;

		sequence.forEach((pose, step) => {
			if (step === 0) return;
			tl.to(
				card,
				{
					rotation: pose.rotation,
					x: pose.x,
					y: pose.y,
					duration: segment,
					ease: "power2.inOut",
				},
				startDelay + (step - 1) * segment,
			);
		});
	});

	return () => {
		tl.kill();
		cards.forEach((card, index) => {
			applyPose(card, restPoses[index] ?? restPoses[0]!);
		});
	};
}
