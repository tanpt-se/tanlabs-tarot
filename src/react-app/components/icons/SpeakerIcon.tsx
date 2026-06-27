interface SpeakerIconProps {
	muted?: boolean;
}

export function SpeakerIcon({ muted = false }: SpeakerIconProps) {
	if (muted) {
		return (
			<svg
				className="game-button__icon"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					d="M5 9v6h3.5L13 18.5V5.5L8.5 9H5Z"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.75"
					strokeLinejoin="round"
				/>
				<path
					d="M16 9l5 6M21 9l-5 6"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.75"
					strokeLinecap="square"
				/>
			</svg>
		);
	}

	return (
		<svg
			className="game-button__icon"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				d="M5 9v6h3.5L13 18.5V5.5L8.5 9H5Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinejoin="round"
			/>
			<path
				d="M15.5 8.5a4.25 4.25 0 0 1 0 7M17.75 6.25a7.25 7.25 0 0 1 0 11.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
			/>
		</svg>
	);
}
