import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useSelfViewSession } from "../../hooks/useSelfViewSession";
import { GameButton } from "../GameButton";

interface SelfViewConfirmModalProps {
	title: string;
	message: string;
	confirmLabel: string;
	cancelLabel: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function SelfViewConfirmModal({
	title,
	message,
	confirmLabel,
	cancelLabel,
	onConfirm,
	onCancel,
}: SelfViewConfirmModalProps) {
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
			className="settings-modal confirm-modal"
			role="presentation"
			onClick={onCancel}
		>
			<div
				ref={dialogRef}
				className="confirm-modal__panel"
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				tabIndex={-1}
				onClick={(event) => event.stopPropagation()}
			>
				<h2 id={titleId} className="confirm-modal__title">
					{title}
				</h2>
				<p className="confirm-modal__text">{message}</p>
				<div className="confirm-modal__actions">
					<GameButton tone="primary" layout="text" onClick={onConfirm}>
						{confirmLabel}
					</GameButton>
					<GameButton tone="secondary" layout="text" onClick={onCancel}>
						{cancelLabel}
					</GameButton>
				</div>
			</div>
		</div>,
		document.body,
	);
}
