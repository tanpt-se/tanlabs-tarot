import { useLocale } from "../hooks/use-locale";
import { useBackgroundMusic } from "../hooks/use-background-music";

export function BackgroundMusicToggle() {
	const { labels } = useLocale();
	const { enabled, playing, toggle } = useBackgroundMusic();

	const ariaLabel = enabled ? labels.musicOff : labels.musicOn;

	return (
		<button
			type="button"
			className="music-toggle"
			onClick={toggle}
			aria-label={ariaLabel}
			aria-pressed={enabled}
			data-playing={playing}
			title={ariaLabel}
		>
			<svg className="music-toggle__icon" viewBox="0 0 24 24" aria-hidden="true">
				{enabled ? (
					<>
						<path d="M9 18V5l10-2v13" fill="none" stroke="currentColor" strokeWidth="2" />
						<path d="M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
					</>
				) : (
					<>
						<path d="M9 18V5l10-2v13" fill="none" stroke="currentColor" strokeWidth="2" />
						<path d="M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
						<path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" />
					</>
				)}
			</svg>
		</button>
	);
}
