import { useCallback, useEffect, useState } from "react";
import { useLocale } from "../hooks/use-locale";
import { useSelfViewSession } from "../hooks/useSelfViewSession";
import {
	isSelfViewShortcutBlocked,
	shouldIgnoreSelfViewShortcut,
} from "../lib/keyboard/should-ignore-shortcut";
import { GameButton } from "./GameButton";
import { SelfViewConfirmModal } from "./spread/SelfViewConfirmModal";
import { SelfViewHistoryButton } from "./SelfViewHistoryButton";

export function SelfViewTopActions() {
	const { labels } = useLocale();
	const {
		sessions,
		drawnCards,
		isViewingHistory,
		hasOverlayOpen,
		archiveCurrentSpread,
		resetLiveSpread,
	} = useSelfViewSession();
	const [historyOpen, setHistoryOpen] = useState(false);
	const [resetModalOpen, setResetModalOpen] = useState(false);

	const handleResetConfirm = useCallback(() => {
		archiveCurrentSpread();
		resetLiveSpread();
		setResetModalOpen(false);
	}, [archiveCurrentSpread, resetLiveSpread]);

	const handleHistoryHotkey = useCallback(() => {
		if (sessions.length === 0) return;

		if (historyOpen) {
			setHistoryOpen(false);
			return;
		}

		if (isSelfViewShortcutBlocked(hasOverlayOpen)) return;

		setHistoryOpen(true);
	}, [hasOverlayOpen, historyOpen, sessions.length]);

	const handleClearHotkey = useCallback(() => {
		if (isSelfViewShortcutBlocked(hasOverlayOpen)) return;
		if (isViewingHistory || drawnCards.length === 0) return;

		setResetModalOpen(true);
	}, [drawnCards.length, hasOverlayOpen, isViewingHistory]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (shouldIgnoreSelfViewShortcut(event)) return;

			const key = event.key.toLowerCase();

			if (key === "h") {
				event.preventDefault();
				handleHistoryHotkey();
				return;
			}

			if (key === "c") {
				event.preventDefault();
				handleClearHotkey();
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [handleClearHotkey, handleHistoryHotkey]);

	return (
		<>
			<div className="app-chrome__center self-view-top-actions">
				{sessions.length > 0 ? (
					<SelfViewHistoryButton
						open={historyOpen}
						onOpenChange={setHistoryOpen}
					/>
				) : null}
				<GameButton
					layout="nav"
					tone="wood"
					className="self-view-clear-button"
					onClick={() => setResetModalOpen(true)}
					disabled={isViewingHistory || drawnCards.length === 0}
					aria-label={labels.selfViewClear}
				>
					<span className="game-button__label">{labels.selfViewClear}</span>
				</GameButton>
			</div>

			{resetModalOpen ? (
				<SelfViewConfirmModal
					title={labels.selfViewResetTitle}
					message={labels.selfViewResetMessage}
					confirmLabel={labels.selfViewResetConfirm}
					cancelLabel={labels.selfViewResetCancel}
					onConfirm={handleResetConfirm}
					onCancel={() => setResetModalOpen(false)}
				/>
			) : null}
		</>
	);
}
