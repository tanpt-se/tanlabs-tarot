import { FormEvent, useState } from "react";
import { GameButton } from "../GameButton";

interface ChatInputProps {
	onSubmit: (message: string) => void;
	placeholder: string;
	sendLabel: string;
	autoFocus?: boolean;
}

export function ChatInput({
	onSubmit,
	placeholder,
	sendLabel,
	autoFocus = false,
}: ChatInputProps) {
	const [value, setValue] = useState("");

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const trimmed = value.trim();
		if (!trimmed) return;

		onSubmit(trimmed);
		setValue("");
	}

	return (
		<form className="chat-input" onSubmit={handleSubmit}>
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
			<GameButton
				type="submit"
				layout="icon"
				tone="primary"
				disabled={!value.trim()}
				aria-label={sendLabel}
			>
				<svg className="game-button__icon" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M3.4 20.6 21 12 3.4 3.4l1.8 7.2L16 12l-10.8 1.4-1.8 7.2Z" />
				</svg>
			</GameButton>
		</form>
	);
}
