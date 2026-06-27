import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CloseButton } from "./CloseButton";

interface GameToastProps {
	message: string;
	onDismiss: () => void;
	dismissLabel: string;
	durationMs?: number;
}

export function GameToast({
	message,
	onDismiss,
	dismissLabel,
	durationMs = 3000,
}: GameToastProps) {
	useEffect(() => {
		const timeout = window.setTimeout(onDismiss, durationMs);
		return () => window.clearTimeout(timeout);
	}, [durationMs, message, onDismiss]);

	return createPortal(
		<div className="game-toast" role="status" aria-live="polite">
			<p className="game-toast__message">{message}</p>
			<CloseButton onClick={onDismiss} aria-label={dismissLabel} />
		</div>,
		document.body,
	);
}
