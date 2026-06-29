import { FormEvent, useState } from "react";
import { useLocale } from "../../hooks/use-locale";
import { GameButton } from "../GameButton";

interface ChatInputProps {
	onSubmit: (message: string) => void;
	placeholder: string;
	sendLabel: string;
	autoFocus?: boolean;
	variant?: "default" | "dialogue";
}

export function ChatInput({
	onSubmit,
	placeholder,
	sendLabel,
	autoFocus = false,
	variant = "default",
}: ChatInputProps) {
	const { labels } = useLocale();
	const [value, setValue] = useState("");

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const trimmed = value.trim();
		if (!trimmed) return;

		onSubmit(trimmed);
		setValue("");
	}

	return (
		<form
			className={
				variant === "dialogue"
					? "chat-input guided-narrator__dialogue"
					: "chat-input"
			}
			onSubmit={handleSubmit}
		>
			{variant === "dialogue" ? (
				<span className="guided-narrator__dialogue-shine" aria-hidden />
			) : null}
			<textarea
				className="chat-input__field"
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder={placeholder}
				rows={1}
				autoFocus={autoFocus}
				onKeyDown={(event) => {
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault();
						handleSubmit(event);
					}
				}}
			/>
			<div className="chat-input__actions">
				<GameButton
					type="button"
					layout="icon"
					tone="light"
					disabled
					aria-label={labels.voiceInput}
					title={labels.voiceInputComingSoon}
				>
					<svg className="game-button__icon" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V19H9v2h6v-2h-2v-1.08A7 7 0 0 0 19 11h-2Z" />
					</svg>
				</GameButton>
				<GameButton
					type="submit"
					layout="icon"
					tone="wood"
					disabled={!value.trim()}
					aria-label={sendLabel}
				>
					<svg className="game-button__icon" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M3.4 20.6 21 12 3.4 3.4l1.8 7.2L16 12l-10.8 1.4-1.8 7.2Z" />
					</svg>
				</GameButton>
			</div>
		</form>
	);
}
