import { useId } from "react";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { GameButton } from "../GameButton";
import { GameModalFrame } from "./GameModalFrame";

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
	const titleId = useId();

	useEscapeKey(onCancel);

	return (
		<GameModalFrame
			onClose={onCancel}
			panelClassName="confirm-modal__panel"
			panelSurfaceClassName="confirm-modal__surface"
			panelProps={{ "aria-labelledby": titleId }}
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
		</GameModalFrame>
	);
}
