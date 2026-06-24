import { useLocale } from "../hooks/use-locale";
import { GameButton } from "./GameButton";
import { SettingsIcon } from "./icons/SettingsIcon";

interface SettingsButtonProps {
	onClick: () => void;
	fullWidth?: boolean;
}

export function SettingsButton({ onClick, fullWidth = false }: SettingsButtonProps) {
	const { labels } = useLocale();

	return (
		<GameButton
			layout="nav"
			tone="secondary"
			fullWidth={fullWidth}
			className={fullWidth ? "" : "game-button--settings"}
			onClick={onClick}
			aria-label={labels.openSettings}
			aria-haspopup="dialog"
		>
			<SettingsIcon />
			<span className="game-button__label">{labels.openSettings}</span>
		</GameButton>
	);
}
