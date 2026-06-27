import type { ReactNode } from "react";
import { GamePanel } from "../GamePanel";

interface GameMenuProps {
	title?: string;
	subtitle?: string;
	children: ReactNode;
	variant?: "primary" | "secondary";
	className?: string;
	"aria-label"?: string;
}

export function GameMenu({
	title,
	subtitle,
	children,
	variant = "secondary",
	className = "",
	"aria-label": ariaLabel,
}: GameMenuProps) {
	const classes = [
		"game-menu",
		`game-menu--${variant}`,
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<nav className={classes} aria-label={ariaLabel}>
			<GamePanel className="game-menu__frame" surfaceClassName="game-menu__surface">
				{title ? (
					<header className="game-menu__header">
						<h2 className="game-menu__title">{title}</h2>
						{subtitle ? (
							<p className="game-menu__subtitle">{subtitle}</p>
						) : null}
					</header>
				) : null}

				<div className="game-menu__list">{children}</div>
			</GamePanel>
		</nav>
	);
}
