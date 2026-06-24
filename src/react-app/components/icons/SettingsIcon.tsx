export function SettingsIcon() {
	return (
		<svg
			className="game-button__icon"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<circle
				cx="12"
				cy="12"
				r="9.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<circle
				cx="12"
				cy="12"
				r="7.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="0.75"
				opacity="0.55"
			/>
			<path
				d="M14.5 7.5a5.5 5.5 0 1 0 0 11 6.5 6.5 0 1 1 0-11"
				fill="currentColor"
				opacity="0.92"
			/>
			<path
				d="M12 4.2l0.6 1.8 1.9 0.6-1.5 1.1 0.6 1.9-1.6-1.1-1.6 1.1 0.6-1.9-1.5-1.1 1.9-0.6z"
				fill="var(--palette-crimson)"
			/>
			<circle cx="12" cy="3" r="0.6" fill="currentColor" />
			<circle cx="12" cy="21" r="0.6" fill="currentColor" />
			<circle cx="3" cy="12" r="0.6" fill="currentColor" />
			<circle cx="21" cy="12" r="0.6" fill="currentColor" />
		</svg>
	);
}
