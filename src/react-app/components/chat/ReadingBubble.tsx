import type { Reading } from "../../lib/types/reading";
import { useLocale } from "../../hooks/use-locale";
import { CardBack } from "../brand/CardBack";

interface ReadingBubbleProps {
	reading: Reading;
}

export function ReadingBubble({ reading }: ReadingBubbleProps) {
	const { labels, dateTimeLocale } = useLocale();

	const formattedTime = new Intl.DateTimeFormat(dateTimeLocale, {
		hour: "2-digit",
		minute: "2-digit",
		day: "2-digit",
		month: "2-digit",
	}).format(new Date(reading.createdAt));

	function statusLabel(status: Reading["status"]) {
		switch (status) {
			case "pending":
				return labels.statusPending;
			case "drawing":
				return labels.statusDrawing;
			case "interpreting":
				return labels.statusInterpreting;
			case "complete":
				return labels.statusComplete;
		}
	}

	return (
		<article className="reading-thread">
			<div className="message message--user">
				<p className="message__text">{reading.question}</p>
				<time className="message__time" dateTime={reading.createdAt}>
					{formattedTime}
				</time>
			</div>

			<div className="message message--reading">
				<CardBack size="avatar" alt={labels.cardBackAlt} />
				<div className="message__body">
					<p className="message__label">{labels.readingLabel}</p>
					<p className="message__status">{statusLabel(reading.status)}</p>
					{reading.cards.length > 0 ? (
						<p className="message__meta">
							{labels.cardsDrawn(reading.cards.length)}
						</p>
					) : (
						<p className="message__meta message__meta--muted">
							{labels.noCardsYet}
						</p>
					)}
					{reading.interpretation && (
						<p className="message__interpretation">{reading.interpretation}</p>
					)}
				</div>
			</div>
		</article>
	);
}
