import { useCallback, useId, useState } from "react";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useLocale } from "../../hooks/use-locale";
import type { Reading } from "../../lib/types/reading";
import { CloseButton } from "../CloseButton";
import { ConfirmModal } from "../modals/ConfirmModal";
import { GameButton } from "../GameButton";
import { GameModalFrame } from "../modals/GameModalFrame";

interface GuidedReadingHistoryModalProps {
	open: boolean;
	readings: Reading[];
	activeReadingId?: string;
	onOpenChange: (open: boolean) => void;
	onSelect: (readingId: string) => void;
	onClear: () => void;
}

export function GuidedReadingHistoryModal({
	open,
	readings,
	activeReadingId,
	onOpenChange,
	onSelect,
	onClear,
}: GuidedReadingHistoryModalProps) {
	const { labels, dateTimeLocale } = useLocale();
	const listId = useId();
	const titleId = useId();
	const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

	const closeHistory = useCallback(() => {
		onOpenChange(false);
	}, [onOpenChange]);

	useEscapeKey(closeHistory, open && !clearConfirmOpen);

	const handleClearConfirm = useCallback(() => {
		onClear();
		setClearConfirmOpen(false);
		closeHistory();
	}, [closeHistory, onClear]);

	if (!open || readings.length === 0) return null;

	return (
		<>
			<GameModalFrame
				onClose={closeHistory}
				panelClassName="self-view-history-modal"
				panelProps={{ "aria-labelledby": titleId }}
			>
				<header className="self-view-history-modal__header">
					<h2 id={titleId} className="self-view-history-modal__title">
						{labels.selfViewHistoryTitle}
					</h2>
					<CloseButton
						onClick={closeHistory}
						aria-label={labels.selfViewHistoryClose}
					/>
				</header>

				<div className="self-view-history-modal__body">
					<ul
						id={listId}
						className="self-view-history-modal__list"
						aria-label={labels.selfViewHistoryTitle}
					>
						{readings.map((reading) => {
							const question = reading.question.trim();
							const entryLabel =
								question ||
								labels.selfViewHistoryEntry(reading.cards.length);

							return (
								<li key={reading.id}>
									<button
										type="button"
										className="self-view-history-modal__item"
										data-active={activeReadingId === reading.id}
										onClick={() => {
											onSelect(reading.id);
											closeHistory();
										}}
									>
										<span className="self-view-history-modal__label">
											{entryLabel}
										</span>
										<time
											className="self-view-history-modal__time"
											dateTime={reading.createdAt}
										>
											{new Intl.DateTimeFormat(dateTimeLocale, {
												day: "2-digit",
												month: "2-digit",
												hour: "2-digit",
												minute: "2-digit",
											}).format(new Date(reading.createdAt))}
										</time>
									</button>
								</li>
							);
						})}
					</ul>
				</div>

				<footer className="self-view-history-modal__footer">
					<GameButton
						tone="wood"
						layout="text"
						className="self-view-history-modal__clear"
						onClick={() => setClearConfirmOpen(true)}
					>
						{labels.selfViewHistoryClear}
					</GameButton>
				</footer>
			</GameModalFrame>

			{clearConfirmOpen ? (
				<ConfirmModal
					title={labels.selfViewHistoryClearTitle}
					message={labels.selfViewHistoryClearMessage}
					confirmLabel={labels.selfViewHistoryClearConfirm}
					cancelLabel={labels.selfViewHistoryClearCancel}
					onConfirm={handleClearConfirm}
					onCancel={() => setClearConfirmOpen(false)}
				/>
			) : null}
		</>
	);
}
