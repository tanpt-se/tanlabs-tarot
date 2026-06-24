import type { CSSProperties } from "react";
import { useLocale } from "../../hooks/use-locale";
import type { Reading } from "../../lib/types/reading";

const JOURNEY_VISIBLE_ROWS = 3;

interface JourneyWheelProps {
	readings: Reading[];
	onSelect: (readingId: string) => void;
	disabled?: boolean;
}

export function JourneyWheel({ readings, onSelect, disabled = false }: JourneyWheelProps) {
	const { labels, dateTimeLocale } = useLocale();

	if (readings.length === 0) return null;

	return (
		<section
			className="journey-wheel"
			aria-label={labels.homeHistoryTitle}
			style={
				{
					"--journey-visible-rows": JOURNEY_VISIBLE_ROWS,
				} as CSSProperties
			}
		>
			<h2 className="journey-wheel__title">{labels.homeHistoryTitle}</h2>
			<div className="journey-wheel__frame">
				<div className="journey-wheel__fade journey-wheel__fade--top" aria-hidden />
				<div className="journey-wheel__highlight" aria-hidden />
				<div className="journey-wheel__viewport">
					<ul className="journey-wheel__list">
						<li className="journey-wheel__pad" aria-hidden />
						{readings.map((reading) => (
							<li key={reading.id} className="journey-wheel__snap">
								<button
									type="button"
									className="journey-wheel__item"
									disabled={disabled}
									onClick={() => onSelect(reading.id)}
								>
									<span className="journey-wheel__question">
										{reading.question}
									</span>
									<time
										className="journey-wheel__time"
										dateTime={reading.createdAt}
									>
										{new Intl.DateTimeFormat(dateTimeLocale, {
											day: "2-digit",
											month: "2-digit",
											year: "numeric",
										}).format(new Date(reading.createdAt))}
									</time>
								</button>
							</li>
						))}
						<li className="journey-wheel__pad" aria-hidden />
					</ul>
				</div>
				<div
					className="journey-wheel__fade journey-wheel__fade--bottom"
					aria-hidden
				/>
			</div>
		</section>
	);
}
