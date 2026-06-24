import type { UiLabels } from "../../i18n";
import type { SpreadType } from "../types/reading";

export function cardCountForSpread(type: SpreadType): number {
	switch (type) {
		case "single":
			return 1;
		case "three":
			return 3;
		case "six":
			return 6;
	}
}

export function inferSpreadTypeFromCardCount(count: number): SpreadType | null {
	if (count === 1) return "single";
	if (count === 3) return "three";
	if (count === 6) return "six";
	return null;
}

export function getSpreadPositionLabels(
	type: SpreadType,
	labels: UiLabels,
): string[] {
	switch (type) {
		case "single":
			return [labels.spreadPositionSingle];
		case "three":
			return [
				labels.spreadPositionPast,
				labels.spreadPositionPresent,
				labels.spreadPositionFuture,
			];
		case "six":
			return [
				labels.spreadPositionPresent,
				labels.spreadPositionChallenge,
				labels.spreadPositionPast,
				labels.spreadPositionFuture,
				labels.spreadPositionAdvice,
				labels.spreadPositionOutcome,
			];
	}
}
