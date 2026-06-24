import { useLocale } from "../hooks/use-locale";
import { BackIcon } from "./icons/BackIcon";
import { GameButton } from "./GameButton";

interface BackButtonProps {
	onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
	const { labels } = useLocale();

	return (
		<GameButton
			layout="nav"
			tone="secondary"
			className="game-button--back"
			onClick={onClick}
			aria-label={labels.spreadBack}
		>
			<BackIcon />
			<span className="game-button__label">{labels.spreadBack}</span>
		</GameButton>
	);
}
