import { useLocale } from "../../hooks/use-locale";
import { useSelfView } from "../../hooks/use-self-view";
import { GameButton } from "../GameButton";

export function SelfViewModeButton() {
	const { labels } = useLocale();
	const { enabled, toggle } = useSelfView();

	if (enabled) return null;

	return (
		<GameButton
			layout="nav"
			tone="light"
			className="game-button--reader self-view-mode-button"
			onClick={toggle}
			aria-label={labels.selfViewModeDesc}
		>
			<span className="game-button__label">{labels.selfViewMode}</span>
		</GameButton>
	);
}
