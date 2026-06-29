import { useTypewriterText } from "../../hooks/use-typewriter-text";
import { GameButton } from "../GameButton";

interface GuidedPromptBubbleAction {
	label: string;
	onClick: () => void;
}

interface GuidedPromptBubbleProps {
	message: string;
	animate?: boolean;
	action?: GuidedPromptBubbleAction;
}

export function GuidedPromptBubble({
	message,
	animate = true,
	action,
}: GuidedPromptBubbleProps) {
	const { displayed, isTyping } = useTypewriterText(message, {
		instant: !animate,
	});

	return (
		<div className="guided-prompt-bubble" aria-live="polite">
			<div className="guided-prompt-bubble__panel">
				<span className="guided-prompt-bubble__shine" aria-hidden />
				<div className="guided-prompt-bubble__text-stack">
					<p
						className="guided-prompt-bubble__text guided-prompt-bubble__text--measure"
						aria-hidden
					>
						{message}
					</p>
					<p
						className={`guided-prompt-bubble__text${isTyping ? " guided-prompt-bubble__text--typing" : ""}`}
						aria-label={message}
					>
						{displayed}
					</p>
				</div>
				{action && !isTyping ? (
					<GameButton
						type="button"
						tone="wood"
						layout="text"
						className="guided-prompt-bubble__action"
						onClick={action.onClick}
					>
						{action.label}
					</GameButton>
				) : null}
			</div>
		</div>
	);
}
