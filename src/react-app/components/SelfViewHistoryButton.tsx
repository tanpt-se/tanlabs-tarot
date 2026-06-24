import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { useLocale } from "../hooks/use-locale";
import { useSelfViewSession } from "../hooks/useSelfViewSession";
import { CloseButton } from "./CloseButton";
import { GameButton } from "./GameButton";

export function SelfViewHistoryButton() {
	const { labels, dateTimeLocale } = useLocale();
	const { sessions, viewingSessionId, setViewingSessionId, registerOverlay } =
		useSelfViewSession();
	const [open, setOpen] = useState(false);
	const panelRef = useRef<HTMLElement>(null);
	const listId = useId();

	useEscapeKey(() => setOpen(false), open);
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
				onClick={() => setOpen(false)}
			>
				<aside
					ref={panelRef}
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
							onClick={() => setOpen(false)}
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
										setOpen(false);
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
				</aside>
			</div>,
			document.body,
		);

	return (
		<>
			<GameButton
				layout="nav"
				tone="primary"
				className="game-button--reader game-button--history self-view-history-trigger"
				onClick={() => setOpen(true)}
				aria-expanded={open}
				aria-controls={listId}
				aria-haspopup="dialog"
			>
				<span className="game-button__label">{labels.selfViewHistoryTitle}</span>
			</GameButton>
			{drawer}
		</>
	);
}
