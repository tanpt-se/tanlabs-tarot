import { useEffect, useRef, useState } from "react";
import { CloseButton } from "../CloseButton";
import { GameButton } from "../GameButton";
import { LocaleSwitcher } from "../LocaleSwitcher";
import { useBackgroundMusic } from "../../hooks/use-background-music";
import { useLocale } from "../../hooks/use-locale";
import { BrandLogo } from "../brand/BrandLogo";

type SettingsTab = "language" | "sound" | "about";

interface SettingsModalProps {
	onClose: () => void;
	onClearHistory?: () => void;
}

const tabs: { id: SettingsTab; labelKey: keyof Pick<
	import("../../i18n/types").UiLabels,
	"settingsTabLanguage" | "settingsTabSound" | "settingsTabAbout"
> }[] = [
	{ id: "language", labelKey: "settingsTabLanguage" },
	{ id: "sound", labelKey: "settingsTabSound" },
	{ id: "about", labelKey: "settingsTabAbout" },
];

export function SettingsModal({ onClose, onClearHistory }: SettingsModalProps) {
	const { labels } = useLocale();
	const { enabled, volume, toggle, setVolume } = useBackgroundMusic();
	const [activeTab, setActiveTab] = useState<SettingsTab>("language");
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	useEffect(() => {
		dialogRef.current?.focus();
	}, []);

	return (
		<div className="settings-modal" role="presentation" onClick={onClose}>
			<div
				ref={dialogRef}
				className="settings-modal__panel"
				role="dialog"
				aria-modal="true"
				aria-label={labels.settingsTitle}
				tabIndex={-1}
				onClick={(event) => event.stopPropagation()}
			>
				<header className="settings-modal__header">
					<h2 className="settings-modal__title">{labels.settingsTitle}</h2>
					<CloseButton
						onClick={onClose}
						aria-label={labels.closeSettings}
					/>
				</header>

				<div className="settings-modal__body">
					<nav
						className="settings-modal__tabs"
						role="tablist"
						aria-label={labels.settingsTitle}
					>
						{tabs.map((tab) => (
							<button
								key={tab.id}
								type="button"
								role="tab"
								className="settings-modal__tab"
								aria-selected={activeTab === tab.id}
								data-active={activeTab === tab.id}
								onClick={() => setActiveTab(tab.id)}
							>
								{labels[tab.labelKey]}
							</button>
						))}
					</nav>

					<div className="settings-modal__content">
						{activeTab === "language" && (
							<div role="tabpanel" className="settings-panel">
								<p className="settings-panel__label">{labels.language}</p>
								<LocaleSwitcher />
							</div>
						)}

						{activeTab === "sound" && (
							<div role="tabpanel" className="settings-panel">
								<div className="settings-panel__row">
									<span className="settings-panel__label">
										{labels.musicLabel}
									</span>
									<GameButton
										tone={enabled ? "primary" : "secondary"}
										layout="text"
										onClick={toggle}
										aria-pressed={enabled}
									>
										{enabled ? labels.musicOff : labels.musicOn}
									</GameButton>
								</div>
								<div className="settings-panel__row">
									<label className="settings-panel__label" htmlFor="music-volume">
										{labels.volumeLabel}
									</label>
									<input
										id="music-volume"
										className="settings-volume"
										type="range"
										min="0"
										max="1"
										step="0.05"
										value={volume}
										onChange={(event) =>
											setVolume(Number.parseFloat(event.target.value))
										}
									/>
								</div>
							</div>
						)}

						{activeTab === "about" && (
							<div role="tabpanel" className="settings-panel settings-panel--about">
								<BrandLogo size="md" alt={labels.appName} />
								<p className="settings-panel__title">{labels.appName}</p>
								<p className="settings-panel__text">
									{labels.settingsAboutDescription}
								</p>
								<p className="settings-panel__text settings-panel__text--muted">
									{labels.settingsAboutDisclaimer}
								</p>
								<p className="settings-panel__version">
									{labels.settingsVersion}
								</p>
								{onClearHistory && (
									<GameButton
										tone="secondary"
										layout="text"
										className="game-button--danger"
										onClick={onClearHistory}
									>
										{labels.clearHistory}
									</GameButton>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
