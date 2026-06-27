import {
	forwardRef,
	type ElementType,
	type HTMLAttributes,
	type ReactNode,
} from "react";

export interface GamePanelProps extends HTMLAttributes<HTMLElement> {
	children: ReactNode;
	as?: ElementType;
	shine?: boolean;
	surfaceClassName?: string;
}

export const GamePanel = forwardRef<HTMLElement, GamePanelProps>(
	function GamePanel(
		{
			children,
			as: Tag = "div",
			className = "",
			surfaceClassName = "",
			shine = true,
			...props
		},
		ref,
	) {
		const panelClasses = ["game-panel", className].filter(Boolean).join(" ");
		const surfaceClasses = ["game-panel__surface", surfaceClassName]
			.filter(Boolean)
			.join(" ");

		return (
			<Tag ref={ref} className={panelClasses} {...props}>
				{shine ? <span className="game-panel__shine" aria-hidden /> : null}
				<div className={surfaceClasses}>{children}</div>
			</Tag>
		);
	},
);
