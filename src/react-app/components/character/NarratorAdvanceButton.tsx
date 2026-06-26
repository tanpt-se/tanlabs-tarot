import { GameButton } from "../GameButton";
import { AdvanceIcon } from "../icons/AdvanceIcon";

interface NarratorAdvanceButtonProps {
	onClick: () => void;
	label: string;
	disabled?: boolean;
	layout?: "icon" | "nav";
	showIcon?: boolean;
}

export function NarratorAdvanceButton({
	onClick,
	label,
	disabled = false,
	layout = "icon",
	showIcon = false,
}: NarratorAdvanceButtonProps) {
	const showAdvanceIcon = layout === "icon" || showIcon;

	return (
		<GameButton
			layout={layout === "icon" ? "icon" : "nav"}
			tone="primary"
			className="narrator-bar__advance"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
		>
			{showAdvanceIcon ? <AdvanceIcon /> : null}
			{layout === "nav" ? (
				<span className="game-button__label">{label}</span>
			) : null}
		</GameButton>
	);
}
