import { CloseButton } from "../CloseButton";
import { GameButton } from "../GameButton";
import { LocaleSwitcher } from "../LocaleSwitcher";
import { SpeakerIcon } from "../icons/SpeakerIcon";
import { useBackgroundMusic } from "../../hooks/use-background-music";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useLocale } from "../../hooks/use-locale";
import { useSfx } from "../../hooks/use-sfx";
import { GameModalFrame } from "../modals/GameModalFrame";

interface SettingsModalProps {
	onClose: () => void;
}

function formatPercent(value: number) {
	return `${Math.round(value * 100)}%`;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
	const { labels } = useLocale();
	const { enabled: musicEnabled, volume: musicVolume, toggle: toggleMusic, setVolume: setMusicVolume } =
		useBackgroundMusic();
	const {
		enabled: sfxEnabled,
		vfxEnabled,
		volume: sfxVolume,
		toggleEffects,
		setVolume: setSfxVolume,
	} = useSfx();
	const effectsEnabled = sfxEnabled && vfxEnabled;

	useEscapeKey(onClose);

	return (
		<GameModalFrame
			onClose={onClose}
			panelClassName="settings-modal"
			panelProps={{ "aria-label": labels.settingsTitle }}
		>
				<header className="settings-modal__header">
					<h2 className="settings-modal__title">{labels.settingsTitle}</h2>
					<CloseButton onClick={onClose} aria-label={labels.closeSettings} />
				</header>

				<div className="settings-modal__body">
					<div className="settings-row">
						<span className="settings-row__label">{labels.language}</span>
						<div className="settings-row__control">
							<LocaleSwitcher />
						</div>
					</div>

					<div className="settings-group">
						<div className="settings-row">
							<span className="settings-row__label">{labels.musicLabel}</span>
							<div className="settings-row__control">
								<GameButton
									layout="icon"
									tone="light"
									onClick={toggleMusic}
									aria-pressed={musicEnabled}
									aria-label={
										musicEnabled ? labels.musicOff : labels.musicOn
									}
								>
									<SpeakerIcon muted={!musicEnabled} />
								</GameButton>
							</div>
						</div>

						<div className="settings-row settings-row--volume">
							<label className="settings-row__label" htmlFor="music-volume">
								{labels.volumeLabel}
							</label>
							<div className="settings-row__control settings-row__control--volume">
								<input
									id="music-volume"
									className="settings-volume"
									type="range"
									min="0"
									max="1"
									step="0.05"
									value={musicVolume}
									onChange={(event) =>
										setMusicVolume(Number.parseFloat(event.target.value))
									}
								/>
								<span className="settings-row__percent" aria-hidden="true">
									{formatPercent(musicVolume)}
								</span>
							</div>
						</div>
					</div>

					<div className="settings-group">
						<div className="settings-row">
							<span className="settings-row__label">{labels.settingsEffectsLabel}</span>
							<div className="settings-row__control">
								<GameButton
									layout="icon"
									tone="light"
									onClick={toggleEffects}
									aria-pressed={effectsEnabled}
									aria-label={
										effectsEnabled
											? labels.settingsEffectsOff
											: labels.settingsEffectsOn
									}
								>
									<SpeakerIcon muted={!effectsEnabled} />
								</GameButton>
							</div>
						</div>

						<div className="settings-row settings-row--volume">
							<label className="settings-row__label" htmlFor="sfx-volume">
								{labels.volumeLabel}
							</label>
							<div className="settings-row__control settings-row__control--volume">
								<input
									id="sfx-volume"
									className="settings-volume"
									type="range"
									min="0"
									max="1"
									step="0.05"
									value={sfxVolume}
									onChange={(event) =>
										setSfxVolume(Number.parseFloat(event.target.value))
									}
								/>
								<span className="settings-row__percent" aria-hidden="true">
									{formatPercent(sfxVolume)}
								</span>
							</div>
						</div>
					</div>
				</div>
		</GameModalFrame>
	);
}
