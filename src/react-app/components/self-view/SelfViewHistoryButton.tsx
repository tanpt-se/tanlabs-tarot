import { History } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useLocale } from "../../hooks/use-locale";
import { useSelfViewSession } from "../../hooks/use-self-view-session";
import { CloseButton } from "../CloseButton";
import { GameButton } from "../GameButton";
import { GamePanel } from "../GamePanel";

interface SelfViewHistoryButtonProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SelfViewHistoryButton({
	open,
	onOpenChange,
}: SelfViewHistoryButtonProps) {
	const { labels, dateTimeLocale } = useLocale();
	const { sessions, viewingSessionId, setViewingSessionId, registerOverlay } =
		useSelfViewSession();
	const panelRef = useRef<HTMLElement>(null);
	const listId = useId();

	useEscapeKey(() => onOpenChange(false), open);
	useEffect(() => {
		if (!open) return;
		return registerOverlay();
	}, [open, registerOverlay]);

	useEffect(() => {
		if (!open) return;
		panelRef.current?.focus();
	}, [open]);

	if (sessions.length === 0) return null;

	const drawer =
		open &&
		createPortal(
			<div
				className="self-view-history-drawer"
				role="presentation"
				onClick={() => onOpenChange(false)}
			>
				<GamePanel
					ref={panelRef}
					as="aside"
					className="self-view-history-drawer__panel"
					role="dialog"
					aria-modal="true"
					aria-label={labels.selfViewHistoryTitle}
					tabIndex={-1}
					onClick={(event) => event.stopPropagation()}
				>
					<header className="self-view-history-drawer__header">
						<h2 className="self-view-history-drawer__title">
							{labels.selfViewHistoryTitle}
						</h2>
						<CloseButton
							onClick={() => onOpenChange(false)}
							aria-label={labels.selfViewHistoryClose}
						/>
					</header>

					<ul
						id={listId}
						className="self-view-history-drawer__list"
						aria-label={labels.selfViewHistoryTitle}
					>
						{sessions.map((entry) => (
							<li key={entry.id}>
								<button
									type="button"
									className="self-view-history-drawer__item"
									data-active={viewingSessionId === entry.id}
									onClick={() => {
										setViewingSessionId(entry.id);
										onOpenChange(false);
									}}
								>
									<span className="self-view-history-drawer__label">
										{labels.selfViewHistoryEntry(entry.cards.length)}
									</span>
									<time
										className="self-view-history-drawer__time"
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
				</GamePanel>
			</div>,
			document.body,
		);

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
			{drawer}
		</>
	);
}
