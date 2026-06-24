import type { ButtonHTMLAttributes, ReactNode } from "react";

export type GameButtonTone = "primary" | "secondary";
export type GameButtonLayout = "text" | "icon" | "nav";

export interface GameButtonProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
	children: ReactNode;
	tone?: GameButtonTone;
	layout?: GameButtonLayout;
	fullWidth?: boolean;
}

export function GameButton({
	children,
	tone = "primary",
	layout = "text",
	fullWidth = false,
	className = "",
	type = "button",
	...props
}: GameButtonProps) {
	const classes = [
		"game-button",
		`game-button--${tone}`,
		`game-button--${layout}`,
		fullWidth && "game-button--full",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button type={type} className={classes} {...props}>
			<span className="game-button__frame">{children}</span>
		</button>
	);
}
