import { History } from "lucide-react";
import { useLocale } from "../hooks/use-locale";
import { GameButton } from "./GameButton";

interface HistoryButtonProps {
	onClick: () => void;
}

export function HistoryButton({ onClick }: HistoryButtonProps) {
	const { labels } = useLocale();

	return (
		<GameButton
			layout="nav"
			tone="light"
			className="game-button--history"
			onClick={onClick}
			aria-label={labels.selfViewHistoryTitle}
			aria-haspopup="dialog"
		>
			<History
				className="game-button__icon"
				aria-hidden="true"
				strokeWidth={1.75}
				absoluteStrokeWidth
			/>
			<span className="game-button__label">{labels.selfViewHistoryTitle}</span>
		</GameButton>
	);
}
