export function HelpIcon() {
	return (
		<svg
			className="game-button__icon"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<circle
				cx="12"
				cy="12"
				r="8.25"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
			/>
			<path
				d="M12 16.25v-3.75"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="square"
			/>
			<circle cx="12" cy="8.35" r="1.15" fill="var(--palette-crimson)" />
		</svg>
	);
}
