import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type GameButtonTone = "light" | "wood";

type GameButtonLayout = "text" | "icon" | "nav" | "stack";

export interface GameButtonProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
	children: ReactNode;
	tone?: GameButtonTone;
	layout?: GameButtonLayout;
	code?: string;
	sublabel?: string;
	fullWidth?: boolean;
	buttonRef?: Ref<HTMLButtonElement>;
}

export function GameButton({
	children,
	tone = "light",
	layout = "text",
	code,
	sublabel,
	fullWidth = false,
	className = "",
	type = "button",
	buttonRef,
	...props
}: GameButtonProps) {
	const stackLayout = layout === "stack" || Boolean(code || sublabel);
	const resolvedLayout = stackLayout ? "stack" : layout;

	const classes = [
		"game-button",
		`game-button--${tone}`,
		`game-button--${resolvedLayout}`,
		fullWidth && "game-button--full",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button ref={buttonRef} type={type} className={classes} {...props}>
			<span className="game-button__shine" aria-hidden />
			<span className="game-button__frame">
				{stackLayout ? (
					<>
						{code ? (
							<span className="game-button__code">{code}</span>
						) : null}
						<span className="game-button__label">{children}</span>
						{sublabel ? (
							<span className="game-button__sublabel">{sublabel}</span>
						) : null}
					</>
				) : resolvedLayout === "icon" || resolvedLayout === "nav" ? (
					children
				) : (
					<span className="game-button__label">{children}</span>
				)}
			</span>
		</button>
	);
}
