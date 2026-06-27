import { useEffect, type RefObject } from "react";
import { animateDeckShuffle, setDeckShuffleRest } from "../lib/animation/deck-shuffle";

type ShuffleVariant = "spread" | "self-view";

export function useDeckShuffleAnimation(
	containerRef: RefObject<HTMLElement | null>,
	shuffling: boolean,
	variant: ShuffleVariant = "spread",
	cardSelector = ":scope > *",
): void {
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const cards = Array.from(
			container.querySelectorAll<HTMLElement>(cardSelector),
		);
		if (cards.length === 0) return;

		setDeckShuffleRest(cards, variant);
	}, [cardSelector, containerRef, variant]);

	useEffect(() => {
		if (!shuffling || !containerRef.current) return;

		const cards = Array.from(
			containerRef.current.querySelectorAll<HTMLElement>(cardSelector),
		);
		if (cards.length === 0) return;

		return animateDeckShuffle(cards, variant);
	}, [cardSelector, containerRef, shuffling, variant]);
}
