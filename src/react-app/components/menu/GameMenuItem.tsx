import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface GameMenuItemProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
	label: string;
	featured?: boolean;
	compact?: boolean;
	icon?: ReactNode;
}

export function GameMenuItem({
	label,
	featured = false,
	compact = false,
	icon,
	className = "",
	type = "button",
	...props
}: GameMenuItemProps) {
	const classes = [
		"game-menu__item",
		"game-button",
		featured ? "game-button--light" : "game-button--wood",
		compact ? "game-menu__item--compact" : undefined,
		icon ? "game-menu__item--with-icon" : undefined,
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button type={type} className={classes} {...props}>
			<span className="game-button__shine" aria-hidden />
			<span className="game-button__frame game-menu__item-inner">
				{icon ? (
					<span className="game-menu__item-icon" aria-hidden>
						{icon}
					</span>
				) : null}
				<span className="game-menu__item-label">{label}</span>
			</span>
		</button>
	);
}
