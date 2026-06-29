import { useEffect, type ReactNode } from "react";
import { useTypewriterText } from "../../hooks/use-typewriter-text";

interface NarratorBarProps {
	message: string;
	input?: ReactNode;
	choices?: ReactNode;
	advance?: ReactNode;
	onTypingChange?: (isTyping: boolean) => void;
}

export function NarratorBar({
	message,
	input,
	choices,
	advance,
	onTypingChange,
}: NarratorBarProps) {
	const { displayed, isTyping } = useTypewriterText(message);

	useEffect(() => {
		onTypingChange?.(isTyping);
	}, [isTyping, onTypingChange]);

	const messageClassName = `guided-narrator__message${isTyping ? " guided-narrator__message--typing" : ""}`;

	return (
		<aside
			className="guided-narrator__bar"
			data-choices={choices ? "true" : undefined}
			data-advance={advance ? "true" : undefined}
			data-input={input ? "true" : undefined}
			aria-live="polite"
		>
			{input ? (
				input
			) : (
				<div className="guided-narrator__dialogue">
					<span className="guided-narrator__dialogue-shine" aria-hidden />
					<p className={messageClassName} aria-label={message}>
						{displayed}
					</p>
					{choices}
					{advance ? (
						<div className="guided-narrator__footer">{advance}</div>
					) : null}
				</div>
			)}
		</aside>
	);
}
