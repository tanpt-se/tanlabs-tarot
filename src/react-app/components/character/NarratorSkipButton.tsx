import { useLocale } from "../../hooks/use-locale";
import { GameButton } from "../GameButton";
import { SkipIcon } from "../icons/SkipIcon";

interface NarratorSkipButtonProps {
	onClick: () => void;
}

export function NarratorSkipButton({ onClick }: NarratorSkipButtonProps) {
	const { labels } = useLocale();

	return (
		<GameButton
			layout="nav"
			tone="wood"
			className="game-button--skip narrator-skip"
			onClick={onClick}
			aria-label={labels.narratorSkip}
		>
			<SkipIcon />
			<span className="game-button__label">{labels.narratorSkipLabel}</span>
		</GameButton>
	);
}
