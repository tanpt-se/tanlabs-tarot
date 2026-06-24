import { GameButton } from "./GameButton";
import { CloseIcon } from "./icons/CloseIcon";

interface CloseButtonProps {
	onClick: () => void;
	"aria-label": string;
}

export function CloseButton({ onClick, "aria-label": ariaLabel }: CloseButtonProps) {
	return (
		<GameButton
			layout="icon"
			tone="secondary"
			onClick={onClick}
			aria-label={ariaLabel}
		>
			<CloseIcon />
		</GameButton>
	);
}
