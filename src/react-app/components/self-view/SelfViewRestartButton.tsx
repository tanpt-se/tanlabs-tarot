import { RotateCcw } from "lucide-react";
import { useLocale } from "../../hooks/use-locale";
import { GameButton } from "../GameButton";

interface SelfViewRestartButtonProps {
	onClick: () => void;
	disabled?: boolean;
}

export function SelfViewRestartButton({
	onClick,
	disabled = false,
}: SelfViewRestartButtonProps) {
	const { labels } = useLocale();

	return (
		<GameButton
			layout="icon"
			tone="wood"
			className="self-view-draw-side-action"
			onClick={onClick}
			disabled={disabled}
			aria-label={labels.selfViewRestart}
		>
			<RotateCcw
				className="game-button__icon"
				aria-hidden="true"
				strokeWidth={1.75}
				absoluteStrokeWidth
			/>
		</GameButton>
	);
}
