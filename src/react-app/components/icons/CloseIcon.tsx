export function CloseIcon() {
	return (
		<svg
			className="game-button__icon"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				d="M7.5 7.5 L16.5 16.5 M16.5 7.5 L7.5 16.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="square"
			/>
			<path
				d="M12 5.5l0.4 1.2 1.25 0.4-1 0.75 0.4 1.25-1.05-0.7-1.05 0.7 0.4-1.25-1-0.75 1.25-0.4z"
				fill="var(--palette-crimson)"
			/>
		</svg>
	);
}
