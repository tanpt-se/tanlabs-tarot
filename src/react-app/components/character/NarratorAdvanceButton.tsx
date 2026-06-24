import { GameButton } from "../GameButton";
import { AdvanceIcon } from "../icons/AdvanceIcon";

interface NarratorAdvanceButtonProps {
	onClick: () => void;
	label: string;
	disabled?: boolean;
	layout?: "icon" | "nav";
}

export function NarratorAdvanceButton({
	onClick,
	label,
	disabled = false,
	layout = "icon",
}: NarratorAdvanceButtonProps) {
	return (
		<GameButton
			layout={layout}
			tone="primary"
			className="narrator-advance"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
		>
			{layout === "nav" ? (
				<span className="game-button__label">{label}</span>
			) : (
				<AdvanceIcon />
			)}
		</GameButton>
	);
}
