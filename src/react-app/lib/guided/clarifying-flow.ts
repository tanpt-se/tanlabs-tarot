import type { UiLabels } from "../../i18n";
import type { SpreadType } from "../types/reading";

export type ClarifyingStepId =
	| "daily-focus"
	| "three-area"
	| "three-question"
	| "three-context";

export function spreadUsesClarifyingFlow(
	type: SpreadType | null | undefined,
): boolean {
	return type === "single" || type === "three";
}

export function getClarifyingStepIds(type: SpreadType): ClarifyingStepId[] {
	switch (type) {
		case "single":
			return ["daily-focus"];
		case "three":
			return ["three-area", "three-question", "three-context"];
		default:
			return [];
	}
}

export function getClarifyingPrompt(
	stepId: ClarifyingStepId,
	labels: UiLabels,
): string {
	switch (stepId) {
		case "daily-focus":
			return labels.clarifyDailyFocus;
		case "three-area":
			return labels.clarifyThreeArea;
		case "three-question":
			return labels.clarifyThreeQuestion;
		case "three-context":
			return labels.clarifyThreeContext;
	}
}

export function getClarifyingPlaceholder(
	stepId: ClarifyingStepId,
	labels: UiLabels,
): string {
	switch (stepId) {
		case "daily-focus":
			return labels.clarifyDailyFocusPlaceholder;
		case "three-area":
			return labels.clarifyThreeAreaPlaceholder;
		case "three-question":
			return labels.clarifyThreeQuestionPlaceholder;
		case "three-context":
			return labels.clarifyThreeContextPlaceholder;
	}
}

export function buildClarifyingQuestion(answers: string[]): string {
	return answers.map((answer) => answer.trim()).filter(Boolean).join("\n\n");
}
