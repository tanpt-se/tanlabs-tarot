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
			layout="icon"
			tone="wood"
			className="game-button--back"
			onClick={onClick}
			aria-label={labels.spreadBack}
		>
			<BackIcon />
		</GameButton>
	);
}
