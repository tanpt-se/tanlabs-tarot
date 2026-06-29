import { Fragment } from "react";
import type { UiLabels } from "../../i18n";
import {
	getClarifyingPrompt,
	type ClarifyingStepId,
} from "../../lib/guided/clarifying-flow";
import { GuidedPromptBubble } from "./GuidedPromptBubble";
import { GuidedUserBubble } from "./GuidedUserBubble";

interface GuidedClarifyFeedProps {
	stepIds: ClarifyingStepId[];
	answers: string[];
	labels: UiLabels;
	promptAction?: {
		label: string;
		onClick: () => void;
	};
}

export function GuidedClarifyFeed({
	stepIds,
	answers,
	labels,
	promptAction,
}: GuidedClarifyFeedProps) {
	const activeIndex = answers.length;

	return (
		<div className="guided-chat-feed">
			{stepIds.slice(0, activeIndex).map((stepId, index) => (
				<Fragment key={`${stepId}-${index}`}>
					<GuidedPromptBubble
						message={getClarifyingPrompt(stepId, labels)}
						animate={false}
					/>
					<GuidedUserBubble message={answers[index] ?? ""} />
				</Fragment>
			))}
			{activeIndex < stepIds.length ? (
				<GuidedPromptBubble
					key={stepIds[activeIndex]}
					message={getClarifyingPrompt(stepIds[activeIndex], labels)}
					action={promptAction}
				/>
			) : null}
		</div>
	);
}
