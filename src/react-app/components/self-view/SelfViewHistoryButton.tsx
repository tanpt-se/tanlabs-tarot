import { History } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useLocale } from "../../hooks/use-locale";
import { useSelfViewSession } from "../../hooks/use-self-view-session";
import { CloseButton } from "../CloseButton";
import { ConfirmModal } from "../modals/ConfirmModal";
import { GameButton } from "../GameButton";
import { GameModalFrame } from "../modals/GameModalFrame";

interface SelfViewHistoryButtonProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SelfViewHistoryButton({
	open,
	onOpenChange,
}: SelfViewHistoryButtonProps) {
	const { labels, dateTimeLocale } = useLocale();
	const { sessions, viewingSessionId, setViewingSessionId, clearHistory } =
		useSelfViewSession();
	const listId = useId();
	const titleId = useId();
	const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

	const closeHistory = useCallback(() => {
		onOpenChange(false);
	}, [onOpenChange]);

	useEscapeKey(closeHistory, open && !clearConfirmOpen);

	const handleClearConfirm = useCallback(() => {
		clearHistory();
		setClearConfirmOpen(false);
		closeHistory();
	}, [clearHistory, closeHistory]);

	if (sessions.length === 0) return null;

	return (
		<>
			<GameButton
				layout="icon"
				tone="wood"
				className="self-view-draw-side-action self-view-history-trigger"
				onClick={() => onOpenChange(true)}
				aria-label={labels.selfViewHistoryTitle}
				aria-expanded={open}
				aria-controls={listId}
				aria-haspopup="dialog"
			>
				<History
					className="game-button__icon"
					aria-hidden="true"
					strokeWidth={1.75}
					absoluteStrokeWidth
				/>
			</GameButton>

			{open ? (
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
							{sessions.map((entry) => (
								<li key={entry.id}>
									<button
										type="button"
										className="self-view-history-modal__item"
										data-active={viewingSessionId === entry.id}
										onClick={() => {
											setViewingSessionId(entry.id);
											closeHistory();
										}}
									>
										<span className="self-view-history-modal__label">
											{labels.selfViewHistoryEntry(entry.cards.length)}
										</span>
										<time
											className="self-view-history-modal__time"
											dateTime={entry.createdAt}
										>
											{new Intl.DateTimeFormat(dateTimeLocale, {
												day: "2-digit",
												month: "2-digit",
												hour: "2-digit",
												minute: "2-digit",
											}).format(new Date(entry.createdAt))}
										</time>
									</button>
								</li>
							))}
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
			) : null}

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
