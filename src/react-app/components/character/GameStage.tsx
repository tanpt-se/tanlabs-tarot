import type { ReactNode } from "react";

interface GameStageProps {
	children: ReactNode;
	scrollable?: boolean;
	layout?: "centered" | "full";
}

export function GameStage({
	children,
	scrollable = false,
	layout = "centered",
}: GameStageProps) {
	return (
		<div className="game-stage">
			<div
				className="game-stage__content"
				data-scrollable={scrollable}
				data-layout={layout}
			>
				{children}
			</div>
		</div>
	);
}
