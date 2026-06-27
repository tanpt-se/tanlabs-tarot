import type { NarratorChoiceOption } from "../../lib/types/narrator-choice";
import { GameButton } from "../GameButton";

interface NarratorChoiceListProps {
	options: NarratorChoiceOption[];
	disabled?: boolean;
}

export function NarratorChoiceList({
	options,
	disabled = false,
}: NarratorChoiceListProps) {
	return (
		<div className="narrator-choices" role="group">
			{options.map((option) => (
				<GameButton
					key={option.title}
					type="button"
					tone="light"
					layout="stack"
					fullWidth
					className="narrator-choice"
					sublabel={option.description}
					onClick={option.onSelect}
					disabled={disabled}
				>
					{option.title}
				</GameButton>
			))}
		</div>
	);
}
