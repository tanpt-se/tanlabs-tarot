import { useEffect, type ReactNode } from "react";
import { NARRATOR_SPRITE } from "../../assets";
import { useTypewriterText } from "../../hooks/use-typewriter-text";
import { useLocale } from "../../hooks/use-locale";
import { GamePanel } from "../GamePanel";

interface NarratorBarProps {
	message: string;
	choices?: ReactNode;
	advance?: ReactNode;
	onTypingChange?: (isTyping: boolean) => void;
	onSkipChange?: (skip: (() => void) | null) => void;
}

export function NarratorBar({
	message,
	choices,
	advance,
	onTypingChange,
	onSkipChange,
}: NarratorBarProps) {
	const { labels } = useLocale();
	const { displayed, isTyping, skip } = useTypewriterText(message);

	useEffect(() => {
		onTypingChange?.(isTyping);
	}, [isTyping, onTypingChange]);

	useEffect(() => {
		onSkipChange?.(isTyping ? skip : null);
	}, [isTyping, onSkipChange, skip]);

	return (
		<aside
			className="narrator-bar"
			data-choices={choices ? "true" : undefined}
			data-advance={advance ? "true" : undefined}
			aria-live="polite"
		>
			<img
				className="narrator-bar__sprite"
				src={NARRATOR_SPRITE}
				alt={labels.narratorAlt}
			/>
			<GamePanel
				className="narrator-bar__frame"
				surfaceClassName="narrator-bar__inner"
			>
				<p
					className={`narrator-bar__message${isTyping ? " narrator-bar__message--typing" : ""}`}
					aria-label={message}
				>
					{displayed}
				</p>
				{choices}
				{advance ? (
					<div className="narrator-bar__footer">{advance}</div>
				) : null}
			</GamePanel>
		</aside>
	);
}
