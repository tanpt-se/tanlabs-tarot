import { useCallback, useEffect, useState } from "react";
import { useLocale } from "../../hooks/use-locale";
import { useSelfViewSession } from "../../hooks/use-self-view-session";
import {
	isAppShortcutBlocked,
	shouldIgnoreAppShortcut,
} from "../../lib/keyboard/app-shortcut";
import { GameButton } from "../GameButton";
import { CloseButton } from "../CloseButton";
import { ConfirmModal } from "../modals/ConfirmModal";
import { SelfViewHistoryButton } from "./SelfViewHistoryButton";
import { SelfViewRestartButton } from "./SelfViewRestartButton";

type SelfViewDrawBarProps = {
	drawDisabled: boolean;
	isLoading: boolean;
	onDraw: () => void;
	onWarmDraw: () => void;
};

export function SelfViewDrawBar({
	drawDisabled,
	isLoading,
	onDraw,
	onWarmDraw,
}: SelfViewDrawBarProps) {
	const { labels } = useLocale();
	const {
		sessions,
		drawnCards,
		isViewingHistory,
		hasOverlayOpen,
		archiveCurrentSpread,
		resetLiveSpread,
		backToCurrent,
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

		if (isAppShortcutBlocked(hasOverlayOpen)) return;

		setHistoryOpen(true);
	}, [hasOverlayOpen, historyOpen, sessions.length]);

	const handleRestartHotkey = useCallback(() => {
		if (isAppShortcutBlocked(hasOverlayOpen)) return;
		if (isViewingHistory || drawnCards.length === 0) return;

		setResetModalOpen(true);
	}, [drawnCards.length, hasOverlayOpen, isViewingHistory]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (shouldIgnoreAppShortcut(event)) return;

			const key = event.key.toLowerCase();

			if (key === "h") {
				event.preventDefault();
				handleHistoryHotkey();
				return;
			}

			if (key === "c") {
				event.preventDefault();
				handleRestartHotkey();
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [handleHistoryHotkey, handleRestartHotkey]);

	if (isViewingHistory) {
		return (
			<div className="self-view-draw-float">
				<CloseButton
					onClick={backToCurrent}
					aria-label={labels.selfViewBackToCurrent}
				/>
			</div>
		);
	}

	return (
		<>
			<div className="self-view-draw-float">
				{sessions.length > 0 ? (
					<SelfViewHistoryButton
						open={historyOpen}
						onOpenChange={setHistoryOpen}
					/>
				) : (
					<span className="self-view-draw-side-spacer" aria-hidden />
				)}
				<GameButton
					tone="light"
					layout="text"
					className="self-view-bottom-action"
					onClick={onDraw}
					onPointerEnter={onWarmDraw}
					onFocus={onWarmDraw}
					disabled={drawDisabled}
				>
					{isLoading ? labels.loading : labels.selfViewDrawOne}
				</GameButton>
				<SelfViewRestartButton
					onClick={() => setResetModalOpen(true)}
					disabled={drawnCards.length === 0}
				/>
			</div>

			{resetModalOpen ? (
				<ConfirmModal
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
