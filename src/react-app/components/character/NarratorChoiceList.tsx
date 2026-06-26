import type { NarratorChoiceOption } from "../../lib/types/narrator-choice";

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
				<button
					key={option.title}
					type="button"
					className="narrator-choice"
					onClick={option.onSelect}
					disabled={disabled}
				>
					<span className="narrator-choice__title">{option.title}</span>
					{option.description ? (
						<span className="narrator-choice__desc">{option.description}</span>
					) : null}
				</button>
			))}
		</div>
	);
}
