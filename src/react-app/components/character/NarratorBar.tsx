import { useEffect, useLayoutEffect } from "react";
import { NARRATOR_SPRITE } from "../../assets/characters";
import { useTypewriterText } from "../../hooks/use-typewriter-text";
import { useLocale } from "../../hooks/use-locale";

interface NarratorBarProps {
	message: string;
	onTypingChange?: (isTyping: boolean) => void;
	onSkipChange?: (skip: (() => void) | null) => void;
}

export function NarratorBar({
	message,
	onTypingChange,
	onSkipChange,
}: NarratorBarProps) {
	const { labels } = useLocale();
	const { displayed, isTyping, skip } = useTypewriterText(message);

	useEffect(() => {
		onTypingChange?.(isTyping);
	}, [isTyping, onTypingChange]);

	useLayoutEffect(() => {
		onSkipChange?.(isTyping ? skip : null);
	}, [isTyping, onSkipChange, skip]);

	return (
		<aside className="narrator-bar" aria-live="polite">
			<img
				className="narrator-bar__sprite"
				src={NARRATOR_SPRITE}
				alt={labels.narratorAlt}
			/>
			<div className="narrator-bar__frame">
				<div className="narrator-bar__inner">
					<p
						className={`narrator-bar__message${isTyping ? " narrator-bar__message--typing" : ""}`}
						aria-label={message}
					>
						{displayed}
					</p>
				</div>
			</div>
		</aside>
	);
}
