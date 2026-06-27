import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CloseButton } from "../CloseButton";
import { GamePanel } from "../GamePanel";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useLocale } from "../../hooks/use-locale";
import { useSelfViewSession } from "../../hooks/useSelfViewSession";

interface SelfViewHelpModalProps {
	onClose: () => void;
}

const SHORTCUTS = [
	{ key: "Esc", labelKey: "selfViewHelpShortcutEsc" },
	{ key: "I", labelKey: "selfViewHelpShortcutI" },
	{ key: "O", labelKey: "selfViewHelpShortcutO" },
	{ key: "M", labelKey: "selfViewHelpShortcutM" },
	{ key: "Space", labelKey: "selfViewHelpShortcutSpace" },
	{ key: "H", labelKey: "selfViewHelpShortcutH" },
	{ key: "C", labelKey: "selfViewHelpShortcutC" },
	{ key: "1–0", labelKey: "selfViewHelpShortcutCardZoom" },
	{ key: "R", labelKey: "selfViewHelpShortcutR" },
] as const;

export function SelfViewHelpModal({ onClose }: SelfViewHelpModalProps) {
	const { labels } = useLocale();
	const { registerOverlay } = useSelfViewSession();
	const dialogRef = useRef<HTMLDivElement>(null);

	useEscapeKey(onClose);
	useEffect(() => registerOverlay(), [registerOverlay]);

	useEffect(() => {
		dialogRef.current?.focus();
	}, []);

	return createPortal(
		<div className="game-modal-overlay" role="presentation" onClick={onClose}>
			<GamePanel
				ref={dialogRef}
				className="game-modal app-help-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="self-view-help-title"
				tabIndex={-1}
				onClick={(event) => event.stopPropagation()}
			>
				<header className="app-help-modal__header">
					<h2 id="self-view-help-title" className="app-help-modal__title">
						{labels.selfViewHelpTitle}
					</h2>
					<CloseButton onClick={onClose} aria-label={labels.closeHelp} />
				</header>

				<div className="app-help-modal__body">
					<p className="app-help-modal__intro">{labels.selfViewHelpIntro}</p>
					<ul className="app-help-modal__list">
						{SHORTCUTS.map(({ key, labelKey }) => (
							<li key={key} className="app-help-modal__item">
								<kbd className="app-help-modal__key">{key}</kbd>
								<span className="app-help-modal__desc">
									{labels[labelKey]}
								</span>
							</li>
						))}
					</ul>
				</div>
			</GamePanel>
		</div>,
		document.body,
	);
}
