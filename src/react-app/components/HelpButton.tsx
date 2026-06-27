import { useLocale } from "../hooks/use-locale";
import { GameButton } from "./GameButton";

interface HelpButtonProps {
	onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
	const { labels } = useLocale();

	return (
		<GameButton
			layout="icon"
			tone="light"
			className="game-button--help"
			onClick={onClick}
			aria-label={labels.openHelp}
			aria-haspopup="dialog"
		>
			<span className="help-button__mark" aria-hidden="true">
				i
			</span>
		</GameButton>
	);
}
