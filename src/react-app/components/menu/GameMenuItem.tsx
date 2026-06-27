import type { ButtonHTMLAttributes } from "react";

export interface GameMenuItemProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
	label: string;
	featured?: boolean;
}

export function GameMenuItem({
	label,
	featured = false,
	className = "",
	type = "button",
	...props
}: GameMenuItemProps) {
	const classes = [
		"game-menu__item",
		"game-button",
		featured ? "game-button--light" : "game-button--wood",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button type={type} className={classes} {...props}>
			<span className="game-button__shine" aria-hidden />
			<span className="game-button__frame game-menu__item-inner">
				<span className="game-menu__item-label">{label}</span>
			</span>
		</button>
	);
}
