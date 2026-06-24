export function BackIcon() {
	return (
		<svg
			className="game-button__icon"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				d="M15.5 6.5 L9 12 L15.5 17.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="square"
				strokeLinejoin="miter"
			/>
			<path
				d="M9 12 H18.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="square"
			/>
			<path
				d="M6.5 10.5l0.45 1.35 1.4 0.45-1.1 0.85 0.45 1.4-1.15-0.8-1.15 0.8 0.45-1.4-1.1-0.85 1.4-0.45z"
				fill="var(--palette-crimson)"
			/>
		</svg>
	);
}
