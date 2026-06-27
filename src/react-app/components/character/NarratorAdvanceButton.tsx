import { useLocale } from "../../hooks/use-locale";
import { GameButton } from "../GameButton";
import { AdvanceIcon } from "../icons/AdvanceIcon";

interface NarratorAdvanceButtonProps {
	onClick: () => void;
	label: string;
	disabled?: boolean;
	layout?: "icon" | "nav" | "stack";
	showIcon?: boolean;
	code?: string;
}

export function NarratorAdvanceButton({
	onClick,
	label,
	disabled = false,
	layout = "icon",
	showIcon = false,
	code,
}: NarratorAdvanceButtonProps) {
	const { labels } = useLocale();
	const showAdvanceIcon = layout === "icon" || showIcon;
	const useStack = layout === "stack";

	return (
		<GameButton
			layout={useStack ? "stack" : layout === "icon" ? "icon" : "nav"}
			tone="light"
			code={code}
			sublabel={useStack ? labels.buttonEnscribe : undefined}
			className="narrator-bar__advance"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
		>
			{showAdvanceIcon ? <AdvanceIcon /> : null}
			{layout === "nav" || useStack ? (
				<span className="game-button__label">{label}</span>
			) : null}
		</GameButton>
	);
}
