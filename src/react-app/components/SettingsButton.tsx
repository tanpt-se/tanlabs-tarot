import { Settings } from "lucide-react";
import { useLocale } from "../hooks/use-locale";
import { GameButton } from "./GameButton";

interface SettingsButtonProps {
	onClick: () => void;
	fullWidth?: boolean;
}

export function SettingsButton({ onClick, fullWidth = false }: SettingsButtonProps) {
	const { labels } = useLocale();

	return (
		<GameButton
			layout={fullWidth ? "text" : "icon"}
			tone="wood"
			fullWidth={fullWidth}
			className={fullWidth ? "" : "game-button--settings"}
			onClick={onClick}
			aria-label={labels.openSettings}
			aria-haspopup="dialog"
		>
			{fullWidth ? (
				labels.openSettings
			) : (
				<Settings
					className="game-button__icon"
					aria-hidden="true"
					strokeWidth={1.75}
					absoluteStrokeWidth
				/>
			)}
		</GameButton>
	);
}
