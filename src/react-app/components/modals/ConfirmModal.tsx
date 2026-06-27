import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useSelfViewSession } from "../../hooks/use-self-view-session";
import { GameButton } from "../GameButton";
import { GamePanel } from "../GamePanel";

interface ConfirmModalProps {
	title: string;
	message: string;
	confirmLabel: string;
	cancelLabel: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmModal({
	title,
	message,
	confirmLabel,
	cancelLabel,
	onConfirm,
	onCancel,
}: ConfirmModalProps) {
	const { registerOverlay } = useSelfViewSession();
	const titleId = useId();
	const dialogRef = useRef<HTMLDivElement>(null);

	useEscapeKey(onCancel);
	useEffect(() => registerOverlay(), [registerOverlay]);

	useEffect(() => {
		dialogRef.current?.focus();
	}, []);

	return createPortal(
		<div
			className="game-modal-overlay confirm-modal"
			role="presentation"
			onClick={onCancel}
		>
			<GamePanel
				ref={dialogRef}
				className="game-modal confirm-modal__panel"
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				tabIndex={-1}
				surfaceClassName="confirm-modal__surface"
				onClick={(event) => event.stopPropagation()}
			>
				<h2 id={titleId} className="confirm-modal__title">
					{title}
				</h2>
				<p className="confirm-modal__text">{message}</p>
				<div className="confirm-modal__actions">
					<GameButton tone="light" layout="text" onClick={onConfirm}>
						{confirmLabel}
					</GameButton>
					<GameButton tone="wood" layout="text" onClick={onCancel}>
						{cancelLabel}
					</GameButton>
				</div>
			</GamePanel>
		</div>,
		document.body,
	);
}
