import type { Reading } from "../../lib/types/reading";
import { CardBack } from "../brand/CardBack";

interface ReadingBubbleProps {
	reading: Reading;
}

function formatTime(iso: string) {
	return new Intl.DateTimeFormat("vi-VN", {
		hour: "2-digit",
		minute: "2-digit",
		day: "2-digit",
		month: "2-digit",
	}).format(new Date(iso));
}

function statusLabel(status: Reading["status"]) {
	switch (status) {
		case "pending":
			return "Đang chờ trải bài...";
		case "drawing":
			return "Đang rút bài...";
		case "interpreting":
			return "Đang giải bài...";
		case "complete":
			return "Đã hoàn thành";
	}
}

export function ReadingBubble({ reading }: ReadingBubbleProps) {
	return (
		<article className="reading-thread">
			<div className="message message--user">
				<p className="message__text">{reading.question}</p>
				<time className="message__time" dateTime={reading.createdAt}>
					{formatTime(reading.createdAt)}
				</time>
			</div>

			<div className="message message--reading">
				<CardBack size="avatar" />
				<div className="message__body">
					<p className="message__label">Lần trải bài</p>
					<p className="message__status">{statusLabel(reading.status)}</p>
					{reading.cards.length > 0 ? (
						<p className="message__meta">
							{reading.cards.length} lá bài đã rút
						</p>
					) : (
						<p className="message__meta message__meta--muted">
							Chưa có lá bài — sẽ bổ sung ở bước trải bài
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
