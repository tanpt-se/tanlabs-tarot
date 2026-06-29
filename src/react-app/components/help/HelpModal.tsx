import { useId } from "react";
import { CloseButton } from "../CloseButton";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useLocale } from "../../hooks/use-locale";
import { GameModalFrame } from "../modals/GameModalFrame";

interface HelpModalProps {
	onClose: () => void;
}

const SHORTCUTS = [
	{ key: "Esc", labelKey: "helpShortcutEsc" },
	{ key: "I", labelKey: "helpShortcutI" },
	{ key: "O", labelKey: "helpShortcutO" },
	{ key: "M", labelKey: "helpShortcutM" },
	{ key: "Space", labelKey: "helpShortcutSpace" },
	{ key: "H", labelKey: "helpShortcutH" },
	{ key: "C", labelKey: "helpShortcutC" },
	{ key: "1–0", labelKey: "helpShortcutCardZoom" },
	{ key: "R", labelKey: "helpShortcutR" },
] as const;

export function HelpModal({ onClose }: HelpModalProps) {
	const { labels } = useLocale();
	const titleId = useId();

	useEscapeKey(onClose);

	return (
		<GameModalFrame
			onClose={onClose}
			panelClassName="help-modal"
			panelProps={{ "aria-labelledby": titleId }}
		>
			<header className="help-modal__header">
				<h2 id={titleId} className="help-modal__title">
					{labels.helpTitle}
				</h2>
				<CloseButton onClick={onClose} aria-label={labels.closeHelp} />
			</header>

			<div className="help-modal__body">
				<ul className="help-modal__list">
					{SHORTCUTS.map(({ key, labelKey }) => (
						<li key={key} className="help-modal__item">
							<span className="help-modal__key game-button game-button--light">
								<span className="game-button__shine" aria-hidden />
								<span className="game-button__frame help-modal__key-frame">
									<span className="help-modal__key-label">{key}</span>
								</span>
							</span>
							<span className="help-modal__desc">
								{labels[labelKey]}
							</span>
						</li>
					))}
				</ul>
			</div>
		</GameModalFrame>
	);
}
