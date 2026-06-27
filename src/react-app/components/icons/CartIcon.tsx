interface CartIconProps {
	className?: string;
}

export function CartIcon({ className }: CartIconProps) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				d="M4.5 5.5h1.35l1.45 7.25h9.4l1.55-5.5H7.1"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="square"
				strokeLinejoin="miter"
			/>
			<path
				d="M9.25 18.5a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2ZM15.75 18.5a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
			/>
			<path
				d="M8.5 4.5h10.5l-1.75 6.25"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="square"
				strokeLinejoin="miter"
			/>
		</svg>
	);
}
